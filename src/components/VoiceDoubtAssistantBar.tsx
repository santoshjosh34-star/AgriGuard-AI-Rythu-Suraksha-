import { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  Mic,
  MicOff,
  Power,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { Language, OrchestratorRunResult } from '../types/agriguard';
import {
  clampSoftVolume,
  DEFAULT_SOFT_VOICE_VOLUME,
  type DoubtContextPayload,
  type DoubtTopicId,
} from '../lib/voiceDoubtUtils';
import { TRANSLATIONS } from '../lib/translations';
import {
  getSpeechRecognitionCtor,
  SPEECH_LOCALE,
  speakTextInLanguage,
  stopAllSpeaking,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionLike,
} from './VoiceControls';

interface VoiceDoubtAssistantBarProps {
  enabled: boolean;
  language: Language;
  doubtTopic: DoubtTopicId;
  onChangeDoubtTopic: (topic: DoubtTopicId) => void;
  highlightedText: string;
  onClearHighlight: () => void;
  doubtContext: DoubtContextPayload;
  isOrchestrating: boolean;
  orchestrateError: string | null;
  latestRun: OrchestratorRunResult | null;
  onAskWithDoubt: (question: string, context: DoubtContextPayload) => Promise<boolean>;
  onTurnOff: () => void;
}

export function VoiceDoubtAssistantBar({
  enabled,
  language,
  doubtTopic,
  onChangeDoubtTopic,
  highlightedText,
  onClearHighlight,
  doubtContext,
  isOrchestrating,
  orchestrateError,
  latestRun,
  onAskWithDoubt,
  onTurnOff,
}: VoiceDoubtAssistantBarProps) {
  const dict = TRANSLATIONS[language];
  const v = dict.voiceAssistant;

  const [listening, setListening] = useState(false);
  const [micTranscript, setMicTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [speakingSource, setSpeakingSource] = useState<'none' | 'doubt' | 'reply'>('none');
  const [preparingSource, setPreparingSource] = useState<'none' | 'doubt' | 'reply'>('none');
  const [softVolume, setSoftVolume] = useState<number>(DEFAULT_SOFT_VOICE_VOLUME);
  const [awaitingVoiceReply, setAwaitingVoiceReply] = useState(false);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const liveTranscriptRef = useRef('');
  const submittedForSessionRef = useRef(false);
  const spokenRunIdRef = useRef<string | null>(latestRun?.runId ?? null);
  const softVolumeRef = useRef(softVolume);
  softVolumeRef.current = softVolume;

  // Clean up mic and audio immediately when toggled OFF or unmounted
  useEffect(() => {
    if (!enabled) {
      recRef.current?.stop();
      setListening(false);
      stopAllSpeaking();
      setPreparingSource('none');
      setSpeakingSource('none');
      setAwaitingVoiceReply(false);
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      recRef.current?.stop();
      stopAllSpeaking();
    };
  }, []);

  // Automatically read the AI's reply aloud softly whenever a voice-bar query finishes
  useEffect(() => {
    if (!enabled || !awaitingVoiceReply || isOrchestrating || !latestRun) return;
    if (spokenRunIdRef.current === latestRun.runId) return;

    spokenRunIdRef.current = latestRun.runId;
    setAwaitingVoiceReply(false);

    const textToSpeak = latestRun.spokenSummary || latestRun.finalAnswer;
    speakTextInLanguage(textToSpeak, latestRun.language, {
      volume: softVolumeRef.current,
      onPreparing: () => {
        setPreparingSource('reply');
        setSpeakingSource('none');
      },
      onStart: () => {
        setPreparingSource('none');
        setSpeakingSource('reply');
      },
      onEnd: () => {
        setPreparingSource('none');
        setSpeakingSource('none');
      },
      onError: () => {
        setPreparingSource('none');
        setSpeakingSource('none');
      },
    });
  }, [enabled, awaitingVoiceReply, isOrchestrating, latestRun]);

  if (!enabled) {
    return null;
  }

  const isAnyAudioActive = speakingSource !== 'none' || preparingSource !== 'none';

  const handleStopAudio = () => {
    stopAllSpeaking();
    setPreparingSource('none');
    setSpeakingSource('none');
  };

  const submitQuestion = async (rawQuestion: string) => {
    const clean = rawQuestion.trim();
    if (clean.length < 3 || isOrchestrating) return;
    if (listening || recRef.current) {
      submittedForSessionRef.current = true;
      recRef.current?.stop();
      setListening(false);
    }
    setMicError(null);
    setAwaitingVoiceReply(true);
    const ok = await onAskWithDoubt(clean, doubtContext);
    if (!ok) {
      setAwaitingVoiceReply(false);
    }
  };

  const handleToggleReadDoubt = () => {
    setMicError(null);
    if (speakingSource === 'doubt' || preparingSource === 'doubt') {
      handleStopAudio();
      return;
    }

    speakTextInLanguage(doubtContext.readableText, language, {
      volume: softVolume,
      onPreparing: () => {
        setPreparingSource('doubt');
        setSpeakingSource('none');
      },
      onStart: () => {
        setPreparingSource('none');
        setSpeakingSource('doubt');
      },
      onEnd: () => {
        setPreparingSource('none');
        setSpeakingSource('none');
      },
      onError: () => {
        setPreparingSource('none');
        setSpeakingSource('none');
      },
    });
  };

  const handleToggleReplyAudio = () => {
    if (!latestRun) return;
    if (speakingSource === 'reply' || preparingSource === 'reply') {
      handleStopAudio();
      return;
    }

    const textToSpeak = latestRun.spokenSummary || latestRun.finalAnswer;
    speakTextInLanguage(textToSpeak, latestRun.language, {
      volume: softVolume,
      onPreparing: () => {
        setPreparingSource('reply');
        setSpeakingSource('none');
      },
      onStart: () => {
        setPreparingSource('none');
        setSpeakingSource('reply');
      },
      onEnd: () => {
        setPreparingSource('none');
        setSpeakingSource('none');
      },
      onError: () => {
        setPreparingSource('none');
        setSpeakingSource('none');
      },
    });
  };

  const handleToggleActiveMic = () => {
    setMicError(null);

    if (listening) {
      recRef.current?.stop();
      setListening(false);
      const text = liveTranscriptRef.current.trim() || micTranscript.trim();
      if (text.length >= 3 && !submittedForSessionRef.current) {
        submittedForSessionRef.current = true;
        void submitQuestion(text);
      }
      return;
    }

    const SpeechRec = getSpeechRecognitionCtor();
    if (!SpeechRec) {
      setMicError(dict.common.voiceUnsupported);
      return;
    }

    // Stop active TTS so mic does not capture AgriGuard's own audio output
    handleStopAudio();

    const recognition = new SpeechRec();
    recognition.lang = SPEECH_LOCALE[language];
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    liveTranscriptRef.current = '';
    submittedForSessionRef.current = false;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let combined = '';
      let hasFinal = false;
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        combined += res[0]?.transcript ?? '';
        if (res.isFinal) {
          hasFinal = true;
        }
      }
      const clean = combined.trim();
      if (clean) {
        liveTranscriptRef.current = clean;
        setMicTranscript(clean);
      }
      if (hasFinal && clean.length >= 3 && !submittedForSessionRef.current) {
        submittedForSessionRef.current = true;
        recognition.stop();
        setListening(false);
        void submitQuestion(clean);
      }
    };

    recognition.onerror = () => {
      setMicError(dict.common.voiceMicDenied);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      const pending = liveTranscriptRef.current.trim();
      if (pending.length >= 3 && !submittedForSessionRef.current) {
        submittedForSessionRef.current = true;
        void submitQuestion(pending);
      }
    };

    recRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
      setMicError(dict.common.voiceMicDenied);
    }
  };

  const handleManualAsk = (e: React.FormEvent) => {
    e.preventDefault();
    void submitQuestion(micTranscript);
  };

  return (
    <section
      data-testid="voice-doubt-assistant-bar"
      aria-label={v.panelTitle}
      className="border-b border-[#2D5E43] bg-[#183827] px-4 py-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-3.5 rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-4 sm:p-5">
        {/* Top Row: Clearly Visible Voice Title, Active Language & Soft-Tone Badge, Volume & OFF Switch */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                listening
                  ? 'bg-[#FEF2F2] text-[#B91C1C]'
                  : isAnyAudioActive
                  ? 'bg-[#C9E7D0] text-[#143D2B]'
                  : 'bg-[#D3E3D5] text-[#143D2B]'
              }`}
            >
              {isAnyAudioActive ? (
                <Volume2 className="h-4.5 w-4.5 animate-pulse" aria-hidden="true" />
              ) : (
                <Mic className={`h-4.5 w-4.5 ${listening ? 'animate-pulse' : ''}`} aria-hidden="true" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base font-semibold text-[#14291D]">
                  {v.panelTitle}
                </h2>
                <span
                  data-testid="voice-language-badge"
                  className="inline-flex items-center rounded-xs border border-[#88C999] bg-[#D8F0DD] px-2.5 py-0.5 text-xs font-semibold text-[#143D2B]"
                >
                  {v.voiceToneBadge}
                </span>
                {listening && (
                  <span className="rounded-xs bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-semibold text-[#B91C1C]">
                    {v.micListeningStatus}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[#355240]">{v.panelSub}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] px-2.5 py-1.5 text-xs text-[#14291D]">
              <Volume2 className="h-3.5 w-3.5 text-[#143D2B] shrink-0" aria-hidden="true" />
              <span className="font-medium whitespace-nowrap">{v.softVolumeLabel}</span>
              <input
                type="range"
                min="0.25"
                max="1"
                step="0.05"
                data-testid="voice-soft-volume-slider"
                aria-label={v.softVolumeLabel}
                value={softVolume}
                onChange={(e) => setSoftVolume(clampSoftVolume(Number(e.target.value)))}
                className="w-16 accent-[#143D2B] cursor-pointer"
              />
              <span className="font-mono text-[11px] font-semibold text-[#143D2B] w-8 text-right">
                {Math.round(softVolume * 100)}%
              </span>
            </label>

            <button
              type="button"
              data-testid="voice-panel-turn-off-btn"
              onClick={onTurnOff}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] px-3 py-1.5 text-xs font-semibold text-[#2A4735] hover:bg-[#C8DCCB] hover:text-[#14291D] whitespace-nowrap"
            >
              <Power className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{v.topBarToggleOff}</span>
            </button>
          </div>
        </div>

        {/* Clearly Visible Live Speaking / Audio Preparation Indicator */}
        {isAnyAudioActive && (
          <div
            data-testid="voice-speaking-indicator"
            role="status"
            aria-live="polite"
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#86EFAC] bg-[#ECFDF5] px-4 py-2.5"
          >
            <div className="flex items-center gap-3">
              {preparingSource !== 'none' ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#143D2B] shrink-0" aria-hidden="true" />
              ) : (
                <div className="flex items-end gap-0.5 h-4 shrink-0" aria-hidden="true">
                  <span className="w-1 h-2.5 rounded-full bg-[#15803D] animate-pulse" />
                  <span className="w-1 h-4 rounded-full bg-[#143D2B] animate-pulse" />
                  <span className="w-1 h-3 rounded-full bg-[#15803D] animate-pulse" />
                  <span className="w-1 h-2 rounded-full bg-[#143D2B] animate-pulse" />
                </div>
              )}
              <span className="text-sm font-semibold text-[#143D2B]">
                {preparingSource !== 'none'
                  ? v.preparingVoiceStatus
                  : speakingSource === 'doubt'
                  ? v.speakingDoubtStatus
                  : v.speakingReplyStatus}
              </span>
            </div>
            <button
              type="button"
              data-testid="voice-stop-speaking-banner-btn"
              onClick={handleStopAudio}
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-md border border-[#86EFAC] bg-[#E9F2EA] px-3 py-1 text-xs font-semibold text-[#143D2B] hover:bg-[#D8F0DD] whitespace-nowrap"
            >
              <VolumeX className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
              <span>{v.stopReadingBtn}</span>
            </button>
          </div>
        )}

        {/* Doubt Content Selector + Selected Passage Preview */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <label
              htmlFor="voice-doubt-topic"
              className="block text-xs font-semibold text-[#14291D]"
            >
              {v.doubtSelectLabel}
            </label>
            <select
              id="voice-doubt-topic"
              data-testid="voice-doubt-topic-select"
              value={doubtTopic}
              onChange={(e) => onChangeDoubtTopic(e.target.value as DoubtTopicId)}
              className="mt-1 w-full rounded-md border border-[#B5CEBA] bg-[#D8E7DA] px-3 py-2 text-xs sm:text-sm font-medium text-[#14291D] focus:border-[#143D2B] focus:bg-[#EEF6EF] focus:outline-none"
            >
              {highlightedText && (
                <option value="highlighted">{v.topicHighlighted}</option>
              )}
              <option value="overview">{v.topicOverview}</option>
              <option value="kisan-rakshak">{v.topicKisanRakshak}</option>
              <option value="weather">{v.topicWeather}</option>
              <option value="crop">{v.topicCrop}</option>
              <option value="recommendations">{v.topicRecommendations}</option>
              <option value="alerts">{v.topicAlerts}</option>
            </select>
            {!highlightedText && (
              <p className="mt-1 text-[11px] text-[#355240]">{v.highlightHint}</p>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3 lg:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#143D2B]">
                  {doubtContext.topicLabel}
                </div>
                <p
                  data-testid="voice-selected-doubt-text"
                  className="mt-1 text-xs sm:text-sm leading-relaxed text-[#14291D] line-clamp-3"
                >
                  {doubtContext.readableText}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {highlightedText && (
                  <button
                    type="button"
                    data-testid="voice-clear-highlight-btn"
                    onClick={onClearHighlight}
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-md border border-[#A7C4AD] bg-[#E9F2EA] px-2.5 py-1 text-xs font-medium text-[#355240] hover:text-[#14291D]"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                    <span>{v.clearHighlightBtn}</span>
                  </button>
                )}
                <button
                  type="button"
                  data-testid="voice-read-doubt-btn"
                  onClick={handleToggleReadDoubt}
                  className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    speakingSource === 'doubt' || preparingSource === 'doubt'
                      ? 'border-[#FDE68A] bg-[#FEFCE8] text-[#854D0E]'
                      : 'border-[#A7C4AD] bg-[#E9F2EA] text-[#143D2B] hover:bg-[#CFE1D2]'
                  }`}
                >
                  {preparingSource === 'doubt' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : speakingSource === 'doubt' ? (
                    <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>
                    {preparingSource === 'doubt'
                      ? v.preparingVoiceStatus
                      : speakingSource === 'doubt'
                      ? v.stopReadingBtn
                      : v.readDoubtBtn}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Mic Talk-to-AI Bar */}
        <form onSubmit={handleManualAsk} className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="voice-active-mic-btn"
            disabled={isOrchestrating}
            onClick={handleToggleActiveMic}
            className={`inline-flex min-h-[42px] items-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-60 ${
              listening
                ? 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
                : 'bg-[#143D2B] text-white hover:bg-[#0F2D20]'
            }`}
          >
            {listening ? (
              <MicOff className="h-4 w-4 animate-pulse" aria-hidden="true" />
            ) : (
              <Mic className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{listening ? v.micStopBtn : v.micTalkBtn}</span>
          </button>

          <input
            type="text"
            data-testid="voice-doubt-question-input"
            value={micTranscript}
            onChange={(e) => setMicTranscript(e.target.value)}
            placeholder={v.askInputPlaceholder}
            aria-label={v.askInputPlaceholder}
            className="min-w-[200px] flex-1 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] px-3.5 py-2.5 text-xs sm:text-sm text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#EEF6EF] focus:outline-none"
          />

          <button
            type="submit"
            data-testid="voice-ask-submit-btn"
            disabled={isOrchestrating || micTranscript.trim().length < 3}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-md border border-[#143D2B] bg-[#DCEADD] px-4 py-2 text-xs sm:text-sm font-semibold text-[#143D2B] hover:bg-[#CFE1D2] disabled:opacity-50 whitespace-nowrap"
          >
            {isOrchestrating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{v.sendQuestionBtn}</span>
          </button>
        </form>

        {isOrchestrating && (
          <div className="flex items-center gap-2.5 rounded-md border border-[#9EC4A8] bg-[#D8F0DD] px-4 py-2.5 text-sm font-medium text-[#143D2B]">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{v.aiThinkingStatus}</span>
          </div>
        )}

        {(micError || orchestrateError) && (
          <div
            data-testid="voice-assistant-error-banner"
            className="rounded-md border border-[#F5C2C7] bg-[#FEF2F2] px-3.5 py-2.5 text-xs sm:text-sm text-[#991B1B]"
          >
            {micError || orchestrateError}
          </div>
        )}

        {/* Clearly Visible Spoken & Written AI Voice Response Card */}
        {!isOrchestrating && latestRun && (
          <div
            data-testid="voice-assistant-reply-card"
            className="space-y-2.5 rounded-lg border-2 border-[#7CC792] bg-[#DDF2E2] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B3DFBF] pb-2.5">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-[#143D2B] shrink-0" aria-hidden="true" />
                <span className="font-display text-sm font-semibold text-[#143D2B]">
                  {v.replyHeaderLabel}
                </span>
                {speakingSource === 'reply' && (
                  <span className="rounded-xs bg-[#C9E7D0] px-2 py-0.5 text-xs font-semibold text-[#143D2B]">
                    {v.speakingReplyBadge}
                  </span>
                )}
              </div>

              <button
                type="button"
                data-testid="voice-replay-reply-btn"
                onClick={handleToggleReplyAudio}
                className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-md border px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  speakingSource === 'reply' || preparingSource === 'reply'
                    ? 'border-[#FDE68A] bg-[#FEFCE8] text-[#854D0E]'
                    : 'border-[#143D2B] bg-[#E9F2EA] text-[#143D2B] hover:bg-[#CFE1D2]'
                }`}
              >
                {preparingSource === 'reply' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : speakingSource === 'reply' ? (
                  <VolumeX className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                )}
                <span>
                  {preparingSource === 'reply'
                    ? v.preparingVoiceStatus
                    : speakingSource === 'reply'
                    ? v.stopReadingBtn
                    : v.replayAnswerBtn}
                </span>
              </button>
            </div>

            <p className="text-sm sm:text-[15px] font-medium leading-relaxed text-[#0F2D20]">
              {latestRun.spokenSummary || latestRun.finalAnswer}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
