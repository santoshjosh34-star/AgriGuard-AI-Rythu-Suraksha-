import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import type { Language } from '../types/agriguard';
import {
  clampSoftVolume,
  DEFAULT_SOFT_VOICE_VOLUME,
  pickBestVoiceForLanguage,
  prepareTextForTts,
} from '../lib/voiceDoubtUtils';
import { TRANSLATIONS } from '../lib/translations';

export const SPEECH_LOCALE: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
export interface SpeechRecognitionResultLike {
  isFinal?: boolean;
  0: SpeechRecognitionAlternativeLike;
}
export interface SpeechRecognitionEventLike {
  resultIndex?: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous?: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

// Active audio & TTS session tracking so Voice AI stops cleanly on mute/OFF/replace
let activeAudioEl: HTMLAudioElement | null = null;
let activeTtsAbort: AbortController | null = null;
let currentSpeechSessionId = 0;
const ttsAudioCache = new Map<string, string>();

export function stopAllSpeaking(): void {
  currentSpeechSessionId += 1;
  if (activeTtsAbort) {
    activeTtsAbort.abort();
    activeTtsAbort = null;
  }
  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
      activeAudioEl.currentTime = 0;
      activeAudioEl.src = '';
    } catch {
      // Ignore cleanup errors on already-disposed elements
    }
    activeAudioEl = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export interface SpeakTextCallbacks {
  volume?: number;
  onPreparing?: () => void;
  onStart?: (engine: 'gemini-tts' | 'browser-tts') => void;
  onEnd?: () => void;
  onError?: () => void;
}

function speakWithBrowserFallback(
  cleanText: string,
  language: Language,
  volume: number,
  sessionId: number,
  callbacks?: SpeakTextCallbacks
): boolean {
  if (sessionId !== currentSpeechSessionId) return false;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    callbacks?.onEnd?.();
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = SPEECH_LOCALE[language];
  // Gentle, unhurried pace and soft volume
  utterance.rate = 0.88;
  utterance.pitch = 1.02;
  utterance.volume = clampSoftVolume(volume);

  try {
    const voices = window.speechSynthesis.getVoices();
    const matched = pickBestVoiceForLanguage(voices, language);
    if (matched) {
      utterance.voice = matched;
    }
  } catch {
    // Default voice is used if getVoices throws
  }

  utterance.onend = () => {
    if (sessionId === currentSpeechSessionId) {
      callbacks?.onEnd?.();
    }
  };
  utterance.onerror = () => {
    if (sessionId === currentSpeechSessionId) {
      callbacks?.onError?.();
    }
  };

  callbacks?.onStart?.('browser-tts');
  window.speechSynthesis.speak(utterance);
  return true;
}

export function speakTextInLanguage(
  text: string,
  language: Language,
  callbacks?: SpeakTextCallbacks
): boolean {
  const cleanText = prepareTextForTts(text, 1000);
  if (!cleanText || typeof window === 'undefined') {
    callbacks?.onEnd?.();
    return false;
  }

  stopAllSpeaking();
  const sessionId = currentSpeechSessionId;
  const targetVolume = clampSoftVolume(callbacks?.volume ?? DEFAULT_SOFT_VOICE_VOLUME);
  const cacheKey = `${language}:${cleanText}`;

  const playWavDataUrl = async (dataUrl: string): Promise<boolean> => {
    if (sessionId !== currentSpeechSessionId) return false;
    try {
      const audio = new Audio(dataUrl);
      audio.volume = targetVolume;
      activeAudioEl = audio;

      audio.onended = () => {
        if (activeAudioEl === audio) activeAudioEl = null;
        if (sessionId === currentSpeechSessionId) {
          callbacks?.onEnd?.();
        }
      };
      audio.onerror = () => {
        if (activeAudioEl === audio) activeAudioEl = null;
        if (sessionId === currentSpeechSessionId) {
          speakWithBrowserFallback(cleanText, language, targetVolume, sessionId, callbacks);
        }
      };

      callbacks?.onStart?.('gemini-tts');
      await audio.play();
      return true;
    } catch {
      if (activeAudioEl) {
        activeAudioEl = null;
      }
      return false;
    }
  };

  const cachedDataUrl = ttsAudioCache.get(cacheKey);
  if (cachedDataUrl) {
    void playWavDataUrl(cachedDataUrl).then((started) => {
      if (!started && sessionId === currentSpeechSessionId) {
        speakWithBrowserFallback(cleanText, language, targetVolume, sessionId, callbacks);
      }
    });
    return true;
  }

  const controller = new AbortController();
  activeTtsAbort = controller;
  callbacks?.onPreparing?.();

  void (async () => {
    try {
      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, language }),
        signal: controller.signal,
      });

      if (sessionId !== currentSpeechSessionId) return;
      if (activeTtsAbort === controller) activeTtsAbort = null;

      if (!res.ok) {
        speakWithBrowserFallback(cleanText, language, targetVolume, sessionId, callbacks);
        return;
      }

      const data = (await res.json()) as { audioBase64?: string; mimeType?: string };
      if (!data.audioBase64 || sessionId !== currentSpeechSessionId) {
        speakWithBrowserFallback(cleanText, language, targetVolume, sessionId, callbacks);
        return;
      }

      const dataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
      if (ttsAudioCache.size >= 16) {
        const oldestKey = ttsAudioCache.keys().next().value;
        if (oldestKey) ttsAudioCache.delete(oldestKey);
      }
      ttsAudioCache.set(cacheKey, dataUrl);

      const played = await playWavDataUrl(dataUrl);
      if (!played && sessionId === currentSpeechSessionId) {
        speakWithBrowserFallback(cleanText, language, targetVolume, sessionId, callbacks);
      }
    } catch (err) {
      if (activeTtsAbort === controller) activeTtsAbort = null;
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (sessionId === currentSpeechSessionId) {
        speakWithBrowserFallback(cleanText, language, targetVolume, sessionId, callbacks);
      }
    }
  })();

  return true;
}

interface VoiceInputButtonProps {
  language: Language;
  label: string;
  listeningLabel: string;
  onTranscript: (text: string) => void;
}

export function VoiceInputButton({
  language,
  label,
  listeningLabel,
  onTranscript,
}: VoiceInputButtonProps) {
  const dict = TRANSLATIONS[language];
  const [listening, setListening] = useState(false);
  const [unsupportedNote, setUnsupportedNote] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      recRef.current?.stop();
    };
  }, []);

  const handleToggle = () => {
    setUnsupportedNote(null);
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRec = getSpeechRecognitionCtor();
    if (!SpeechRec) {
      setUnsupportedNote(dict.common.voiceUnsupported);
      return;
    }

    stopAllSpeaking();
    const recognition = new SpeechRec();
    recognition.lang = SPEECH_LOCALE[language];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onTranscript(transcript);
      }
    };
    recognition.onerror = () => {
      setUnsupportedNote(dict.common.voiceMicDenied);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };

    recRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setUnsupportedNote(dict.common.voiceMicDenied);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex min-h-[40px] items-center gap-2 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
          listening
            ? 'border-[#B91C1C] bg-[#FEF2F2] text-[#991B1B]'
            : 'border-[#9EC4A8] bg-[#DCEADD] text-[#14291D] hover:bg-[#CFE1D2]'
        }`}
      >
        {listening ? (
          <MicOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Mic className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{listening ? listeningLabel : label}</span>
      </button>
      {unsupportedNote && (
        <span className="text-xs text-[#5C4315]">{unsupportedNote}</span>
      )}
    </div>
  );
}

interface SpokenOutputButtonProps {
  text: string;
  language: Language;
  listenLabel: string;
  stopLabel: string;
  disabled?: boolean;
}

export function SpokenOutputButton({
  text,
  language,
  listenLabel,
  stopLabel,
  disabled,
}: SpokenOutputButtonProps) {
  const dict = TRANSLATIONS[language];
  const [status, setStatus] = useState<'idle' | 'preparing' | 'speaking'>('idle');

  useEffect(() => {
    return () => {
      stopAllSpeaking();
    };
  }, []);

  const handleToggleSpeak = () => {
    if (status !== 'idle') {
      stopAllSpeaking();
      setStatus('idle');
      return;
    }

    speakTextInLanguage(text, language, {
      volume: DEFAULT_SOFT_VOICE_VOLUME,
      onPreparing: () => setStatus('preparing'),
      onStart: () => setStatus('speaking'),
      onEnd: () => setStatus('idle'),
      onError: () => setStatus('idle'),
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      disabled={disabled || !text.trim()}
      className={`inline-flex min-h-[38px] items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 ${
        status === 'speaking'
          ? 'border-[#7CC792] bg-[#D8F0DD] text-[#143D2B]'
          : status === 'preparing'
          ? 'border-[#FDE68A] bg-[#FEFCE8] text-[#854D0E]'
          : 'border-[#9EC4A8] bg-[#DCEADD] text-[#14291D] hover:bg-[#CFE1D2]'
      }`}
    >
      {status === 'preparing' ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#854D0E]" aria-hidden="true" />
      ) : status === 'speaking' ? (
        <VolumeX className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
      ) : (
        <Volume2 className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
      )}
      <span>
        {status === 'preparing'
          ? dict.voiceAssistant.preparingVoiceStatus
          : status === 'speaking'
          ? stopLabel
          : listenLabel}
      </span>
    </button>
  );
}
