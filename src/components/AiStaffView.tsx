import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BellRing,
  Bot,
  CheckCircle2,
  CloudRain,
  Compass,
  Languages,
  Loader2,
  ShieldAlert,
  Sprout,
  Trash2,
} from 'lucide-react';
import type {
  AgentId,
  DemoScenarioDefinition,
  FarmerProfile,
  Language,
  OrchestratorRunResult,
  WeatherContext,
} from '../types/agriguard';
import {
  localizeAgentToolName,
  localizeCropsList,
  localizeLocationText,
} from '../lib/domainTranslations';
import { TRANSLATIONS } from '../lib/translations';
import { SpokenOutputButton, VoiceInputButton } from './VoiceControls';

interface AiStaffViewProps {
  farmer: FarmerProfile;
  weather: WeatherContext;
  scenarios: DemoScenarioDefinition[];
  language: Language;
  isOrchestrating: boolean;
  orchestrateError: string | null;
  isFetchingLive: boolean;
  history: OrchestratorRunResult[];
  selectedRunId: string | null;
  onSelectRun: (runId: string) => void;
  onLoadLiveWeather: () => Promise<void>;
  onSelectScenario: (id: Exclude<WeatherContext['scenarioId'], 'custom' | 'live'>) => void;
  onRunOrchestrator: (query: string) => Promise<void>;
  onClearHistory: () => void;
}

const AGENT_ICONS: Array<{ id: Exclude<AgentId, 'master'>; icon: typeof Bot }> = [
  { id: 'weather', icon: CloudRain },
  { id: 'crop', icon: Sprout },
  { id: 'kisan_rakshak', icon: ShieldAlert },
  { id: 'farm_advisory', icon: Compass },
  { id: 'voice_language', icon: Languages },
  { id: 'action_alert', icon: BellRing },
];

export function AiStaffView({
  farmer,
  weather,
  scenarios,
  language,
  isOrchestrating,
  orchestrateError,
  isFetchingLive,
  history,
  selectedRunId,
  onSelectRun,
  onLoadLiveWeather,
  onSelectScenario,
  onRunOrchestrator,
  onClearHistory,
}: AiStaffViewProps) {
  const dict = TRANSLATIONS[language];
  const [query, setQuery] = useState(scenarios[0]?.defaultQuery ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const displayDistrict = localizeLocationText(farmer.district, language);
  const displayState = localizeLocationText(farmer.state, language);
  const displayCrops = localizeCropsList(farmer.crops, language);
  const msUnit = language === 'hi' ? 'मि.से.' : language === 'te' ? 'మి.సె.' : 'ms';

  const formatLangLabel = (target: Language) => {
    if (language === 'hi') {
      return target === 'hi' ? 'हिन्दी' : target === 'te' ? 'तेलुगु' : 'अंग्रेज़ी';
    }
    if (language === 'te') {
      return target === 'te' ? 'తెలుగు' : target === 'hi' ? 'హిందీ' : 'ఆంగ్లం';
    }
    return target.toUpperCase();
  };

  const liveQuickPrompt =
    language === 'hi'
      ? `${displayDistrict}, ${displayState} में मेरी ${displayCrops.join(
          ', '
        )} फसल के लिए लाइव मौसम, छिड़काव उपयुक्तता, सिंचाई सलाह और किसान रक्षक जोखिम जांचें।`
      : language === 'te'
      ? `${displayDistrict}, ${displayState} లోని నా ${displayCrops.join(
          ', '
        )} పంటకు లైవ్ వాతావరణం, పిచికారీ అనుకూలత, నీటి పారుదల సలహా మరియు కిసాన్ రక్షక్ ప్రమాద స్థాయిని పరిశీలించండి.`
      : `Check live weather, spraying suitability, irrigation advice, and Kisan Rakshak risk for my ${displayCrops.join(
          ', '
        )} crop in ${displayDistrict}, ${displayState}.`;

  // Update default prefilled prompt smoothly when language changes if user hasn't typed custom text
  useEffect(() => {
    const activeScenario = scenarios.find((s) => s.id === weather.scenarioId);
    if (weather.scenarioId === 'live') {
      setQuery(liveQuickPrompt);
    } else if (activeScenario) {
      setQuery(activeScenario.defaultQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const activeRun =
    history.find((h) => h.runId === selectedRunId) ?? history[0] ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 3) {
      setValidationError(dict.aiStaff.queryMinError);
      return;
    }
    setValidationError(null);
    await onRunOrchestrator(query.trim());
  };

  return (
    <div className="space-y-6">
      {/* Master Orchestrator Prompt & Scenario Launcher */}
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#14291D]">
              {dict.aiStaff.heading}
            </h2>
            <p className="mt-1 text-sm text-[#355240]">
              {dict.aiStaff.subheadingPrefix}{' '}
              <span className="font-medium text-[#14291D]">
                {displayCrops.join(', ')} ({displayDistrict}, {displayState})
              </span>
              .
            </p>
          </div>
          <div className="text-xs text-[#355240]">
            {dict.aiStaff.contextLabel}{' '}
            <span className="font-medium text-[#14291D]">{weather.scenarioTitle}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#355240]">
            {dict.aiStaff.contextModeLabel}
          </span>
          <button
            type="button"
            disabled={isFetchingLive}
            onClick={() => {
              void onLoadLiveWeather();
              setQuery(liveQuickPrompt);
            }}
            className={`min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              weather.scenarioId === 'live'
                ? 'border-[#143D2B] bg-[#143D2B] text-white'
                : 'border-[#9EC4A8] bg-[#D8E7DA] text-[#14291D] hover:bg-[#CFE1D2]'
            }`}
          >
            {isFetchingLive ? dict.common.syncingLiveBtn : dict.common.liveFarmWeatherBtn}
          </button>
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                onSelectScenario(sc.id);
                setQuery(sc.defaultQuery);
              }}
              className={`min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                weather.scenarioId === sc.id
                  ? 'border-[#143D2B] bg-[#143D2B] text-white'
                  : 'border-[#9EC4A8] bg-[#D8E7DA] text-[#14291D] hover:bg-[#CFE1D2]'
              }`}
            >
              {sc.shortLabel}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label htmlFor="master-orchestrator-input" className="block text-xs font-semibold text-[#14291D]">
            {dict.aiStaff.askPromptLabel} ({formatLangLabel(language)})
          </label>
          <textarea
            id="master-orchestrator-input"
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.overview.askPlaceholder}
            className="w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3.5 py-2.5 text-sm text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
          />
          {validationError && (
            <p className="text-xs font-medium text-[#B91C1C]">{validationError}</p>
          )}
          {orchestrateError && (
            <div
              data-testid="orchestrate-error"
              className="flex items-start gap-2 rounded-md border border-[#F5C2C7] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{orchestrateError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <VoiceInputButton
              language={language}
              label={dict.common.speakQuery}
              listeningLabel={dict.common.stopListening}
              onTranscript={(text) => setQuery((prev) => (prev ? `${prev} ${text}` : text))}
            />
            <button
              type="submit"
              disabled={isOrchestrating}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#143D2B] px-5 py-2 text-sm font-medium text-white hover:bg-[#0F2D20] disabled:opacity-60 whitespace-nowrap"
            >
              {isOrchestrating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              <span>{isOrchestrating ? dict.common.runningAgents : dict.common.runOrchestrator}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Six Specialised Agents Directory */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {AGENT_ICONS.map(({ id, icon: Icon }) => {
          const meta = dict.aiStaff.roster[id];
          const wasInvoked = activeRun?.selectedAgents.includes(id) ?? false;
          return (
            <div
              key={id}
              className={`rounded-lg border p-4 transition-colors ${
                wasInvoked
                  ? 'border-[#143D2B] bg-[#D8F0DD]'
                  : 'border-[#9EC4A8] bg-[#E9F2EA]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#143D2B] shrink-0" aria-hidden="true" />
                  <h3 className="font-display text-sm font-semibold text-[#14291D]">
                    {meta.name}
                  </h3>
                </div>
                <span className="font-mono text-[11px] text-[#355240]">
                  {wasInvoked ? dict.aiStaff.agentCalled : dict.aiStaff.agentReady}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#355240]">{meta.role}</p>
            </div>
          );
        })}
      </section>

      {/* Agent Collaboration Activity Panel + Unified Output */}
      {isOrchestrating && (
        <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
          <div className="flex items-center gap-3 text-sm font-medium text-[#143D2B]">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>{dict.aiStaff.orchestratingStatus}</span>
          </div>
        </section>
      )}

      {!isOrchestrating && activeRun && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Unified Final Plan */}
          <section className="space-y-5 rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C5D9C8] pb-4">
              <div>
                <div className="text-xs text-[#355240]">
                  {dict.aiStaff.unifiedPlanLabel} ·{' '}
                  <span className="font-mono">
                    {new Date(activeRun.timestamp).toLocaleString(
                      language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN'
                    )}
                  </span>
                  {activeRun.isSyntheticContext && ` · ${dict.aiStaff.syntheticContextSuffix}`}
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold text-[#14291D]">
                  {dict.aiStaff.synthesisTitle}
                </h3>
              </div>
              <SpokenOutputButton
                text={activeRun.spokenSummary || activeRun.finalAnswer}
                language={activeRun.language}
                listenLabel={dict.common.listenSummary}
                stopLabel={dict.common.stopVoice}
              />
            </div>

            <div className="whitespace-pre-line text-sm leading-relaxed text-[#14291D]">
              {activeRun.finalAnswer}
            </div>

            <div className="border-t border-[#C5D9C8] pt-4">
              <h4 className="text-xs font-semibold text-[#143D2B]">
                {dict.aiStaff.conflictCheckTitle}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[#243F2F]">
                {activeRun.conflictCheck}
              </p>
            </div>

            {activeRun.uncertaintyAndMissingInfo.length > 0 && (
              <div className="rounded-md border border-[#D3C49E] bg-[#EFEAD6] p-4">
                <h4 className="text-xs font-semibold text-[#5C4315]">
                  {dict.aiStaff.uncertaintyTitle}
                </h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#5C4315]">
                  {activeRun.uncertaintyAndMissingInfo.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Real Tool-Call Activity Panel */}
          <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-5">
            <div className="border-b border-[#C5D9C8] pb-4">
              <h3 className="font-display text-lg font-semibold text-[#14291D]">
                {dict.aiStaff.activityPanelTitle}
              </h3>
              <p className="mt-1 text-xs text-[#355240]">{dict.aiStaff.activityPanelSub}</p>
            </div>

            {activeRun.executionSteps.length === 0 ? (
              <p className="mt-4 text-xs text-[#355240]">{dict.aiStaff.noToolsRequired}</p>
            ) : (
              <ol className="mt-4 divide-y divide-[#C5D9C8]" data-testid="agent-activity-list">
                {activeRun.executionSteps.map((step) => (
                  <li key={step.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#143D2B]">
                        {step.agentName}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#15803D]">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        {step.status === 'error'
                          ? dict.aiStaff.statusError
                          : dict.aiStaff.statusCompleted}{' '}
                        · {step.durationMs} {msUnit}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-medium text-[#14291D]">
                      {dict.aiStaff.taskPrefix} {step.taskAssigned}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-[#355240]">
                      {dict.aiStaff.toolPrefix} {localizeAgentToolName(step.toolUsed, language)} (
                      {step.toolArgsSummary})
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#243F2F]">
                      {dict.aiStaff.resultPrefix} {step.resultObtained}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}

      {/* Agent Execution History */}
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-[#14291D]">
              {dict.aiStaff.historyTitle}
            </h3>
            <p className="text-xs text-[#355240]">{dict.aiStaff.historySub}</p>
          </div>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-3 py-1.5 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2]"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.common.clearHistory}</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="mt-4 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-5 text-center text-sm text-[#355240]">
            {dict.aiStaff.historyEmpty}
          </div>
        ) : (
          <div className="mt-4 divide-y divide-[#C5D9C8]">
            {history.map((run) => {
              const isSelected = activeRun?.runId === run.runId;
              return (
                <button
                  key={run.runId}
                  type="button"
                  onClick={() => onSelectRun(run.runId)}
                  className={`flex w-full flex-col gap-1 py-3 px-3 text-left transition-colors rounded-md ${
                    isSelected ? 'bg-[#D8E7DA]' : 'hover:bg-[#D8E7DA]/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#355240]">
                    <span className="font-mono">
                      {new Date(run.timestamp).toLocaleString(
                        language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN'
                      )}
                    </span>
                    <span>
                      {run.executionSteps.length} {dict.aiStaff.toolsCountSuffix} ·{' '}
                      {formatLangLabel(run.language)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-[#14291D] line-clamp-1">
                    {run.query}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
