import { GoogleGenAI } from '@google/genai';

export type SupportedGeminiModel = 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';

export function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add a valid Gemini API key in the Settings > Secrets panel.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function withRequestTimeout<T>(promise: Promise<T>, timeoutMs = 20000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('503 UNAVAILABLE: Upstream Gemini model timed out under load.')),
          timeoutMs
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function buildConfigForModel(
  model: SupportedGeminiModel,
  config: NonNullable<Parameters<GoogleGenAI['models']['generateContent']>[0]['config']>
) {
  if (model === 'gemini-3.1-flash-lite') {
    const cloned = { ...config };
    if ('thinkingConfig' in cloned) {
      delete cloned.thinkingConfig;
    }
    return cloned;
  }
  return config;
}

export async function callWithStickyModel(
  ai: GoogleGenAI,
  state: { model: SupportedGeminiModel },
  baseParams: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>,
  timeoutMs = 20000
) {
  const baseConfig = baseParams.config ?? {};

  if (state.model === 'gemini-4-hydrogen') {
    try {
      return await withRequestTimeout(
        ai.models.generateContent({
          ...baseParams,
          model: 'gemini-4-hydrogen',
          config: buildConfigForModel('gemini-4-hydrogen', baseConfig),
        }),
        timeoutMs
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = /503|UNAVAILABLE|high demand|429|RESOURCE_EXHAUSTED|timed out/i.test(
        msg
      );
      if (!isTransient) {
        throw err;
      }
      state.model = 'gemini-3.1-flash-lite';
    }
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await withRequestTimeout(
        ai.models.generateContent({
          ...baseParams,
          model: 'gemini-3.1-flash-lite',
          config: buildConfigForModel('gemini-3.1-flash-lite', baseConfig),
        }),
        timeoutMs
      );
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = /503|UNAVAILABLE|high demand|429|RESOURCE_EXHAUSTED|timed out/i.test(
        msg
      );
      if (!isTransient || attempt === 1) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  throw lastError;
}

export function extractJsonFromText(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;
  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}
