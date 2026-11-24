import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckSquare,
  PhoneCall,
  ShieldAlert,
  Square,
} from 'lucide-react';
import {
  localizeChecklistCategory,
  localizeCropName,
  localizeCropsList,
  localizeFloodStatus,
  localizeLocationText,
  localizePriorityLabel,
  localizeRiskLevel,
} from '../lib/domainTranslations';
import { TRANSLATIONS } from '../lib/translations';
import type {
  DemoScenarioDefinition,
  EmergencyChecklistItem,
  FarmAlert,
  FarmerProfile,
  KisanRakshakAssessment,
  Language,
  WeatherContext,
} from '../types/agriguard';
import { RiskBreakdownChart } from './SvgCharts';
import { ConfirmActionModal } from './ConfirmActionModal';

interface KisanRakshakViewProps {
  farmer: FarmerProfile;
  weather: WeatherContext;
  assessment: KisanRakshakAssessment;
  checklist: EmergencyChecklistItem[];
  scenarios: DemoScenarioDefinition[];
  language: Language;
  isFetchingLive: boolean;
  onLoadLiveWeather: () => Promise<void>;
  onSelectScenario: (id: Exclude<WeatherContext['scenarioId'], 'custom' | 'live'>) => void;
  onAssessCustom: (customWeather: WeatherContext) => Promise<string | null>;
  onToggleChecklistItem: (id: string) => void;
  onDispatchUrgentAlert: (alert: Omit<FarmAlert, 'id' | 'createdAt'>) => void;
}

const FLOOD_STATUS_OPTIONS: WeatherContext['localFloodStatus'][] = [
  'None Reported',
  'Watch / Rising Water',
  'Active Waterlogging',
  'Unknown',
];

export function KisanRakshakView({
  farmer,
  weather,
  assessment,
  checklist,
  scenarios,
  language,
  isFetchingLive,
  onLoadLiveWeather,
  onSelectScenario,
  onAssessCustom,
  onToggleChecklistItem,
  onDispatchUrgentAlert,
}: KisanRakshakViewProps) {
  const dict = TRANSLATIONS[language];
  const [activePhase, setActivePhase] = useState<'Before Event' | 'During Event' | 'After Event'>('Before Event');
  const [customRain24, setCustomRain24] = useState<string>(
    weather.rainfall24hMm !== null ? String(weather.rainfall24hMm) : ''
  );
  const [customWind, setCustomWind] = useState<string>(
    weather.windSpeedKmh !== null ? String(weather.windSpeedKmh) : ''
  );
  const [customWarning, setCustomWarning] = useState<string>(weather.verifiedWarningLabel ?? '');
  const [customFlood, setCustomFlood] = useState<WeatherContext['localFloodStatus']>(
    weather.localFloodStatus
  );
  const [customError, setCustomError] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [alertDispatchedMsg, setAlertDispatchedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (weather.scenarioId === 'live') {
      setCustomRain24(weather.rainfall24hMm !== null ? String(weather.rainfall24hMm) : '');
      setCustomWind(weather.windSpeedKmh !== null ? String(weather.windSpeedKmh) : '');
      setCustomWarning(weather.verifiedWarningLabel ?? '');
      setCustomFlood(weather.localFloodStatus);
    }
  }, [
    weather.scenarioId,
    weather.scenarioTitle,
    weather.rainfall24hMm,
    weather.windSpeedKmh,
    weather.verifiedWarningLabel,
    weather.localFloodStatus,
  ]);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    const parsedRain = customRain24.trim() === '' ? null : Number(customRain24);
    const parsedWind = customWind.trim() === '' ? null : Number(customWind);

    const customWeather: WeatherContext = {
      ...weather,
      scenarioId: 'custom',
      scenarioTitle: 'Custom Farmer-Supplied Hazard Inputs',
      isSyntheticDemo: false,
      dataSource: 'Farmer-Entered Local Observation / Forecast',
      lastUpdated: new Date().toLocaleString(),
      rainfall24hMm: parsedRain,
      rainfall72hMm: parsedRain !== null ? Math.round(parsedRain * 1.4) : null,
      windSpeedKmh: parsedWind,
      windGustKmh: parsedWind !== null ? Math.round(parsedWind * 1.25) : null,
      verifiedWarningLabel: customWarning.trim() || null,
      verifiedWarningSource: customWarning.trim() ? 'Farmer-verified official bulletin' : null,
      localFloodStatus: customFlood,
    };

    const err = await onAssessCustom(customWeather);
    if (err) {
      setCustomError(err);
    }
  };

  const riskBadgeStyle =
    assessment.riskLevel === 'Critical'
      ? 'border-[#F5C2C7] bg-[#FEF2F2] text-[#991B1B]'
      : assessment.riskLevel === 'High'
      ? 'border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]'
      : assessment.riskLevel === 'Moderate'
      ? 'border-[#FDE68A] bg-[#FEFCE8] text-[#854D0E]'
      : 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]';

  const currentPhasePlan =
    assessment.phasePlans.find((p) => p.phase === activePhase) ?? assessment.phasePlans[0];

  const phaseTabLabel = (phase: 'Before Event' | 'During Event' | 'After Event') =>
    phase === 'Before Event'
      ? dict.kisanRakshak.beforeEvent
      : phase === 'During Event'
      ? dict.kisanRakshak.duringEvent
      : dict.kisanRakshak.afterEvent;

  const displayCrops = localizeCropsList(farmer.crops, language);
  const displayDistrict = localizeLocationText(farmer.district, language);
  const modalDesc = dict.kisanRakshak.modalDescTemplate
    .replace('{crops}', displayCrops.join(', '))
    .replace('{district}', displayDistrict);

  return (
    <div className="space-y-6">
      {/* Header & Synthetic Scenario Switcher */}
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#355240]">
              <ShieldAlert className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
              <span>
                {assessment.isSyntheticData
                  ? dict.kisanRakshak.syntheticBanner
                  : dict.kisanRakshak.customBanner}
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#14291D]">
              {dict.kisanRakshak.heading}
            </h2>
            <p className="mt-1 text-sm text-[#355240]">{dict.kisanRakshak.subheading}</p>
          </div>

          <div className={`rounded-md border px-4 py-2.5 text-right ${riskBadgeStyle}`}>
            <div className="text-xs font-medium">{dict.kisanRakshak.riskCategory}</div>
            <div className="font-display text-2xl font-bold" data-testid="kisan-rakshak-level">
              {localizeRiskLevel(assessment.riskLevel, language)}
            </div>
            <div className="font-mono text-xs">
              {assessment.riskScore}/100 · {assessment.confidencePercent}% {dict.kisanRakshak.confSuffix}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#C5D9C8] pt-4">
          <span className="text-xs font-medium text-[#355240]">
            {dict.kisanRakshak.weatherSourceLabel}
          </span>
          <button
            type="button"
            disabled={isFetchingLive}
            onClick={() => void onLoadLiveWeather()}
            className={`min-h-[38px] rounded-md border px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              weather.scenarioId === 'live'
                ? 'border-[#143D2B] bg-[#143D2B] text-white'
                : 'border-[#9EC4A8] bg-[#D8E7DA] text-[#14291D] hover:bg-[#CFE1D2]'
            }`}
          >
            {isFetchingLive ? dict.common.syncingLiveBtn : dict.common.liveFarmWeatherBtn}
          </button>
          {scenarios.map((sc, idx) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => {
                onSelectScenario(sc.id);
                setCustomRain24(
                  sc.weather.rainfall24hMm !== null ? String(sc.weather.rainfall24hMm) : ''
                );
                setCustomWind(
                  sc.weather.windSpeedKmh !== null ? String(sc.weather.windSpeedKmh) : ''
                );
                setCustomWarning(sc.weather.verifiedWarningLabel ?? '');
                setCustomFlood(sc.weather.localFloodStatus);
                setCustomError(null);
              }}
              className={`min-h-[38px] rounded-md border px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                weather.scenarioId === sc.id
                  ? 'border-[#143D2B] bg-[#143D2B] text-white'
                  : 'border-[#9EC4A8] bg-[#D8E7DA] text-[#14291D] hover:bg-[#CFE1D2]'
              }`}
            >
              {`${dict.kisanRakshak.scenarioPrefix} ${idx + 1}: ${sc.shortLabel}`}
            </button>
          ))}
        </div>
      </section>

      {/* Custom Hazard Inputs (Verified & Validated) + Breakdown Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-5">
          <h3 className="font-display text-base font-semibold text-[#14291D]">
            {dict.kisanRakshak.customHeading}
          </h3>
          <p className="mt-1 text-xs text-[#355240]">
            {dict.kisanRakshak.customSubPrefix} {displayDistrict}. {dict.kisanRakshak.customSubSuffix}
          </p>

          <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3.5" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="kr-rain" className="block text-xs font-semibold text-[#14291D]">
                  {dict.kisanRakshak.rain24Input}
                </label>
                <input
                  id="kr-rain"
                  type="number"
                  value={customRain24}
                  onChange={(e) => setCustomRain24(e.target.value)}
                  placeholder="95"
                  className="mt-1 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 font-mono text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="kr-wind" className="block text-xs font-semibold text-[#14291D]">
                  {dict.kisanRakshak.windInput}
                </label>
                <input
                  id="kr-wind"
                  type="number"
                  value={customWind}
                  onChange={(e) => setCustomWind(e.target.value)}
                  placeholder="45"
                  className="mt-1 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 font-mono text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="kr-warning" className="block text-xs font-semibold text-[#14291D]">
                {dict.kisanRakshak.warningInput}
              </label>
              <input
                id="kr-warning"
                type="text"
                value={customWarning}
                onChange={(e) => setCustomWarning(e.target.value)}
                placeholder={dict.kisanRakshak.warningPlaceholder}
                className="mt-1 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="kr-flood" className="block text-xs font-semibold text-[#14291D]">
                {dict.kisanRakshak.floodStatusInput}
              </label>
              <select
                id="kr-flood"
                value={customFlood}
                onChange={(e) =>
                  setCustomFlood(e.target.value as WeatherContext['localFloodStatus'])
                }
                className="mt-1 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              >
                {FLOOD_STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {localizeFloodStatus(st, language)}
                  </option>
                ))}
              </select>
            </div>

            {customError && (
              <div className="rounded-md border border-[#F5C2C7] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
                {customError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                className="min-h-[40px] rounded-md bg-[#143D2B] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2D20] whitespace-nowrap"
              >
                {dict.kisanRakshak.runAssessment}
              </button>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="min-h-[40px] rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-4 py-2 text-sm font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap"
              >
                {dict.kisanRakshak.dispatchAlertBtn}
              </button>
            </div>
            {alertDispatchedMsg && (
              <p className="text-xs font-medium text-[#15803D]">{alertDispatchedMsg}</p>
            )}
          </form>
        </section>

        <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#C5D9C8] pb-3">
            <h3 className="font-display text-base font-semibold text-[#14291D]">
              {dict.kisanRakshak.breakdownTitle}
            </h3>
            <span className="font-mono text-xs text-[#355240]">
              {dict.kisanRakshak.sourcePrefix} {assessment.dataSourceSummary}
            </span>
          </div>

          <div className="mt-4">
            <RiskBreakdownChart factors={assessment.mainRiskFactors} language={language} />
          </div>

          {assessment.missingData.length > 0 && (
            <div className="mt-5 rounded-md border border-[#D3C49E] bg-[#EFEAD6] p-4">
              <div className="text-xs font-semibold text-[#5C4315]">
                {dict.kisanRakshak.missingData} ({dict.kisanRakshak.missingConfNote}{' '}
                {assessment.confidencePercent}%)
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-[#5C4315]">
                {assessment.missingData.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Before / During / After Phased Action Plans */}
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C5D9C8] pb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#14291D]">
              {dict.kisanRakshak.phasedPlanTitle}
            </h3>
            <p className="text-xs text-[#355240]">{dict.kisanRakshak.phasedPlanSub}</p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-[#9EC4A8] bg-[#D8E7DA] p-1">
            {(['Before Event', 'During Event', 'After Event'] as const).map((phase) => (
              <button
                key={phase}
                type="button"
                onClick={() => setActivePhase(phase)}
                className={`min-h-[34px] rounded-xs px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  activePhase === phase
                    ? 'bg-[#143D2B] text-white'
                    : 'text-[#355240] hover:text-[#14291D]'
                }`}
              >
                {phaseTabLabel(phase)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[#355240]">
            <span className="font-semibold text-[#143D2B]">
              {phaseTabLabel(currentPhasePlan.phase)}
            </span>
            <span className="font-mono">
              {dict.kisanRakshak.priorityPrefix}{' '}
              {localizePriorityLabel(currentPhasePlan.priority, language)}
            </span>
          </div>
          <ol className="mt-3 space-y-2.5">
            {currentPhasePlan.steps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3 text-sm text-[#14291D]"
              >
                <span className="font-mono text-xs font-semibold text-[#143D2B] pt-0.5">
                  0{index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Emergency Preparation Checklist + Verified Contacts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-6">
          <h3 className="font-display text-base font-semibold text-[#14291D]">
            {dict.kisanRakshak.checklistTitle}
          </h3>
          <p className="mt-1 text-xs text-[#355240]">
            {dict.kisanRakshak.checklistSubPrefix} {farmer.farmSizeAcres}{' '}
            {dict.kisanRakshak.checklistSubMid} {displayCrops.join(', ')}.
          </p>

          <ul className="mt-4 divide-y divide-[#C5D9C8]">
            {checklist.map((item) => (
              <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => onToggleChecklistItem(item.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  {item.completed ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 text-[#15803D] shrink-0" aria-hidden="true" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 text-[#355240] shrink-0" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm ${
                        item.completed ? 'line-through text-[#4E6C59]' : 'text-[#14291D]'
                      }`}
                    >
                      {item.label}
                    </span>
                    <div className="text-xs text-[#355240]">
                      {localizeChecklistCategory(item.category, language)}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-6">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-[#14291D]">
              {dict.kisanRakshak.contactsTitle}
            </h3>
          </div>
          <p className="mt-1 text-xs text-[#355240]">{dict.kisanRakshak.contactsSub}</p>

          <ul className="mt-4 divide-y divide-[#C5D9C8]">
            {assessment.verifiedContacts.map((contact) => (
              <li key={contact.number} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-[#14291D]">{contact.agency}</span>
                  <span className="font-mono text-sm font-semibold text-[#143D2B] shrink-0">
                    {contact.number}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-[#355240]">{contact.scope}</div>
                <p className="mt-1 text-xs text-[#243F2F]">{contact.notes}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-start gap-2 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3 text-xs text-[#355240]">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-[#B45309] shrink-0" aria-hidden="true" />
            <span>{assessment.safetyDisclaimer}</span>
          </div>
        </section>
      </div>

      <ConfirmActionModal
        open={confirmModalOpen}
        title={dict.kisanRakshak.modalTitle}
        description={modalDesc}
        consequenceNote={dict.kisanRakshak.modalConsequence}
        confirmLabel={dict.common.confirmAction}
        cancelLabel={dict.common.cancel}
        closeAriaLabel={dict.common.closeModalAria}
        onCancel={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          onDispatchUrgentAlert({
            title: `${dict.kisanRakshak.alertTitlePrefix} (${localizeRiskLevel(
              assessment.riskLevel,
              language
            )}): ${localizeCropName(farmer.crops[0] || '', language)}`,
            priority: assessment.riskLevel === 'Critical' ? 'Urgent' : 'High',
            reason: assessment.mainRiskFactors[0]?.detail || '',
            actionRequired: assessment.recommendedProtectiveActions[0] || '',
            requiresHumanConfirmation: true,
            humanConfirmed: true,
            status: 'pending',
            sourceAgent: 'kisan_rakshak',
          });
          setConfirmModalOpen(false);
          setAlertDispatchedMsg(dict.kisanRakshak.dispatchedNotice);
          setTimeout(() => setAlertDispatchedMsg(null), 4000);
        }}
      />
    </div>
  );
}
