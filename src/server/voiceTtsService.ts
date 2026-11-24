import { GoogleGenAI } from '@google/genai';
import { prepareTextForTts } from '../lib/voiceDoubtUtils.ts';
import type { Language } from '../types/agriguard.ts';
import { createGeminiClient, withRequestTimeout } from './geminiClient.ts';

export interface SynthesizeVoiceRequest {
  text: string;
  language: Language;
}

export interface SynthesizeVoiceResult {
  audioBase64: string;
  mimeType: string;
  language: Language;
  model: string;
}

const SOFT_VOICE_STYLE: Record<Language, string> = {
  te: 'Warm, soft, calm, gentle, unhurried agricultural advisor speaking clearly in natural Telugu (తెలుగు). Keep the tone caring and soothing, never harsh or rushed.',
  hi: 'Warm, soft, calm, gentle, unhurried agricultural advisor speaking clearly in natural Hindi (हिन्दी). Keep the tone caring and soothing, never harsh or rushed.',
  en: 'Warm, soft, calm, gentle, unhurried Indian agricultural advisor speaking clearly in natural English. Keep the tone caring and soothing, never harsh or rushed.',
};

const LANG_LABEL: Record<Language, string> = {
  te: 'Telugu (తెలుగు)',
  hi: 'Hindi (हिन्दी)',
  en: 'Indian English',
};

function createTtsClient(apiVersion?: 'v1beta' | 'v1alpha'): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add a valid Gemini API key in the Settings > Secrets panel.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractAudioPart(response: Awaited<ReturnType<GoogleGenAI['models']['generateContent']>>) {
  for (const candidate of response.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.inlineData?.data) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'audio/wav',
        };
      }
    }
  }
  return null;
}

export async function synthesizeSoftVoiceWithGemini(
  input: SynthesizeVoiceRequest
): Promise<SynthesizeVoiceResult> {
  const cleanText = prepareTextForTts(input.text, 1000);
  if (cleanText.length < 2) {
    throw new Error('VALIDATION_ERROR: Text to speak cannot be empty.');
  }

  const defaultAi = createGeminiClient();
  const alphaAi = createTtsClient('v1alpha');

  const attempts: Array<() => Promise<{ data: string; mimeType: string; model: string } | null>> = [
    // 1. Documented gemini-3.8-flash-lite-tts with speechMetadata + speechConfig on v1alpha
    async () => {
      const res = await withRequestTimeout(
        alphaAi.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanText,
                  speechMetadata: { style: SOFT_VOICE_STYLE[input.language] },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
          },
        }),
        14000
      );
      const audio = extractAudioPart(res);
      return audio ? { ...audio, model: 'gemini-3.8-flash-lite-tts' } : null;
    },
    // 2. gemini-3.8-flash-lite-tts on default client without speechMetadata
    async () => {
      const res = await withRequestTimeout(
        defaultAi.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Read gently in a warm, soft, unhurried ${LANG_LABEL[input.language]} voice: ${cleanText}`,
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
          },
        }),
        14000
      );
      const audio = extractAudioPart(res);
      return audio ? { ...audio, model: 'gemini-3.8-flash-lite-tts' } : null;
    },
    // 3. Fallback TTS model on v1beta with speechConfig
    async () => {
      const res = await withRequestTimeout(
        defaultAi.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Speak gently and softly in natural ${LANG_LABEL[input.language]}: ${cleanText}`,
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
          },
        }),
        14000
      );
      const audio = extractAudioPart(res);
      return audio ? { ...audio, model: 'gemini-2.5-flash-preview-tts' } : null;
    },
  ];

  let lastError: unknown;
  for (const runAttempt of attempts) {
    try {
      const result = await runAttempt();
      if (result) {
        return {
          audioBase64: result.data,
          mimeType: result.mimeType,
          language: input.language,
          model: result.model,
        };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini TTS did not return audio data.');
}
