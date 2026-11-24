import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  CloudRain,
  Droplets,
  Loader2,
  LocateFixed,
  MapPin,
  Mountain,
  RefreshCw,
  ShieldAlert,
  Sprout,
  Thermometer,
  Waves,
  Wind,
} from 'lucide-react';
import type {
  DemoScenarioDefinition,
  FarmAlert,
  FarmerProfile,
  KisanRakshakAssessment,
  Language,
  NavSection,
  OrchestratorRunResult,
  WeatherContext,
} from '../types/agriguard';
import {
  INDIAN_LOCATION_PRESETS,
  findLocationPresetMatch,
  localizeCropsList,
  localizeFarmerName,
  localizeFloodStatus,
  localizeGrowthStage,
  localizeIrrigationStatus,
  localizeLocationText,
  localizePlainType,
  localizePriorityLabel,
  localizeRiskLevel,
  localizeRiverBasinStatus,
  localizeSoilType,
  localizeSprayStatus,
  localizeWeatherCondition,
} from '../lib/domainTranslations';
import { computeFarmingWindows } from '../lib/liveWeatherUtils';
import { TRANSLATIONS } from '../lib/translations';
import { WeatherTimelineChart } from './SvgCharts';
import { ProfilePhotoControls } from './ProfilePhotoControls';
import { SpokenOutputButton, VoiceInputButton } from './VoiceControls';

interface OverviewViewProps {
  farmer: FarmerProfile;
  weather: WeatherContext;
  assessment: KisanRakshakAssessment;
  alerts: FarmAlert[];
  latestRun: OrchestratorRunResult | null;
  scenarios: DemoScenarioDefinition[];
  language: Language;
  isOrchestrating: boolean;
  orchestrateError: string | null;
  isFetchingLive: boolean;
  liveWeatherError: string | null;
  isAcquiringGps: boolean;
  gpsErrorMessage: string | null;
  onEnableLiveGps: () => void;
  onUpdatePhoto: (dataUrl: string | null) => void;
  onLoadLiveWeather: (forceRefresh?: boolean) => Promise<void>;
  onSelectLocation: (patch: {
    state: string;
    district: string;
    location: string;
    drainageType?: FarmerProfile['drainageType'];
    nearCoastOrRiver?: boolean;
    lat?: number;
    lon?: number;
  }) => Promise<void> | void;
  onSelectScenario: (scenarioId: Exclude<WeatherContext['scenarioId'], 'custom' | 'live'>) => void;
  onNavigate: (section: NavSection) => void;
  onRunOrchestrator: (query: string) => Promise<void>;
}

const HERO_IMG = '/src/assets/images/agriguard_farm_hero_1795354948798.jpg';
const FARMER_IMG = '/src/assets/images/farmer_avatar_default_1795354948454.jpg';

export function OverviewView({
  farmer,
  weather,
  assessment,
  alerts,
  latestRun,
  scenarios,
  language,
  isOrchestrating,
  orchestrateError,
  isFetchingLive,
  liveWeatherError,
  isAcquiringGps,
  gpsErrorMessage,
  onEnableLiveGps,
  onUpdatePhoto,
  onLoadLiveWeather,
  onSelectLocation,
  onSelectScenario,
  onNavigate,
  onRunOrchestrator,
}: OverviewViewProps) {
  const dict = TRANSLATIONS[language];
  const [quickQuery, setQuickQuery] = useState('');
  const [heroFailed, setHeroFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [showPhotoControls, setShowPhotoControls] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [customDistrictInput, setCustomDistrictInput] = useState('');
  const [customStateInput, setCustomStateInput] = useState('');

  useEffect(() => {
    setAvatarFailed(false);
  }, [farmer.profilePhotoDataUrl]);

  const pendingAlerts = alerts.filter((a) => a.status === 'pending');

  const windows = computeFarmingWindows(
    {
      rainfall24hMm: weather.rainfall24hMm,
      rainfall72hMm: weather.rainfall72hMm,
      windSpeedKmh: weather.windSpeedKmh,
      windGustKmh: weather.windGustKmh,
      soilMoisturePct: weather.soilMoisturePct,
    },
    language
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim().length < 3) {
      setFormError(dict.overview.queryMinError);
      return;
    }
    setFormError(null);
    await onRunOrchestrator(quickQuery.trim());
  };

  const riskTextColor =
    assessment.riskLevel === 'Critical'
      ? 'text-[#B91C1C]'
      : assessment.riskLevel === 'High'
      ? 'text-[#C2410C]'
      : assessment.riskLevel === 'Moderate'
      ? 'text-[#B45309]'
      : 'text-[#15803D]';

  const rainUnit = language === 'hi' ? 'मिमी' : language === 'te' ? 'మి.మీ' : 'mm';
  const windUnit = language === 'hi' ? 'किमी/घं' : language === 'te' ? 'కి.మీ/గం' : 'km/h';
  const tempUnit = language === 'hi' ? '°से.' : language === 'te' ? '°సె.' : '°C';

  const displayFarmerName = localizeFarmerName(farmer.name, language);
  const displayLocation = localizeLocationText(farmer.location, language);
  const displayDistrict = localizeLocationText(farmer.district, language);
  const displayState = localizeLocationText(farmer.state, language);
  const displayPlaceSummary =
    displayLocation && !displayLocation.toLowerCase().includes(displayDistrict.toLowerCase())
      ? `${displayLocation}, ${displayDistrict}, ${displayState}`
      : `${displayLocation || displayDistrict}, ${displayState}`;
  const displayCrops = localizeCropsList(farmer.crops, language);
  const farmerInitials = Array.from(displayFarmerName.trim()).slice(0, 2).join('').toUpperCase();

  const activePresetId =
    findLocationPresetMatch({
      state: farmer.state,
      district: farmer.district,
      location: farmer.location,
    })?.id ?? '';

  const handlePresetChange = (presetId: string) => {
    const chosen = INDIAN_LOCATION_PRESETS.find((p) => p.id === presetId);
    if (!chosen) return;
    setShowCustomLocation(false);
    void onSelectLocation({
      state: chosen.state.en,
      district: chosen.district.en,
      location: chosen.location.en,
      drainageType: chosen.drainageType,
      nearCoastOrRiver: chosen.nearCoastOrRiver,
      lat: chosen.lat,
      lon: chosen.lon,
    });
  };

  const handleApplyCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const districtVal = customDistrictInput.trim();
    const stateVal = customStateInput.trim() || 'India';
    if (districtVal.length < 2) return;
    void onSelectLocation({
      state: stateVal,
      district: districtVal,
      location: districtVal,
    });
    setShowCustomLocation(false);
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

  return (
    <div className="space-y-6">
      {/* Farm Context Editorial Banner */}
      <section className="overflow-hidden rounded-lg border border-[#9EC4A8] bg-[#E9F2EA]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col justify-between p-6 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#355240]">
                <span>{displayPlaceSummary}</span>
                {farmer.liveLocationEnabled && farmer.gpsCoordinates && (
                  <span className="rounded-xs bg-[#C9E7D0] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#143D2B]">
                    {dict.overview.gpsActiveBadge}
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <span>{displayCrops.join(', ')}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">
                  {farmer.farmSizeAcres} {dict.common.acresUnit}
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#14291D] text-balance sm:text-3xl">
                {dict.overview.heading}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#243F2F]">
                {dict.overview.subheading}
              </p>
            </div>

            <div className="mt-5 space-y-3 border-t border-[#C5D9C8] pt-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {!avatarFailed ? (
                      <img
                        data-testid="overview-avatar-img"
                        src={farmer.profilePhotoDataUrl || FARMER_IMG}
                        alt={displayFarmerName}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarFailed(true)}
                        className="h-11 w-11 rounded-full border border-[#9EC4A8] object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#9EC4A8] bg-[#D0E2D3] font-display text-sm font-semibold text-[#143D2B]">
                        {farmerInitials}
                      </div>
                    )}
                    <button
                      type="button"
                      data-testid="overview-edit-photo-btn"
                      aria-label={dict.overview.editPhotoAria}
                      aria-expanded={showPhotoControls}
                      onClick={() => setShowPhotoControls((prev) => !prev)}
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#9EC4A8] bg-[#E9F2EA] text-[#143D2B] shadow-xs hover:bg-[#D8E7DA]"
                    >
                      <Camera className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#14291D]">{displayFarmerName}</div>
                    <div className="text-xs text-[#355240]">
                      {localizeGrowthStage(farmer.growthStage, language)} ·{' '}
                      {localizeSoilType(farmer.soilType, language)}
                    </div>
                  </div>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="overview-gps-btn"
                    disabled={isAcquiringGps || isFetchingLive}
                    onClick={onEnableLiveGps}
                    className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 whitespace-nowrap ${
                      farmer.liveLocationEnabled && farmer.gpsCoordinates
                        ? 'border-[#7CC792] bg-[#D8F0DD] text-[#143D2B] hover:bg-[#C9E7D0]'
                        : 'border-[#9EC4A8] bg-[#DCEADD] text-[#14291D] hover:bg-[#CFE1D2]'
                    }`}
                  >
                    <LocateFixed
                      className={`h-3.5 w-3.5 ${isAcquiringGps ? 'animate-pulse' : ''}`}
                      aria-hidden="true"
                    />
                    <span>
                      {isAcquiringGps
                        ? dict.overview.gpsAcquiringBtn
                        : farmer.liveLocationEnabled && farmer.gpsCoordinates
                        ? dict.overview.gpsTrackingActiveBtn
                        : dict.overview.trackGpsBtn}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('crop')}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-[#143D2B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0F2D20] whitespace-nowrap"
                  >
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{dict.overview.scanCropPhotoBtn}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isFetchingLive}
                    onClick={() => void onLoadLiveWeather(true)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-1.5 text-xs font-medium text-[#143D2B] hover:bg-[#CFE1D2] disabled:opacity-60 whitespace-nowrap"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetchingLive ? 'animate-spin' : ''}`} aria-hidden="true" />
                    <span>
                      {isFetchingLive ? dict.common.syncingLiveBtn : dict.common.syncLiveWeatherBtn}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('my-farm')}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-3 py-1.5 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap"
                  >
                    <span>{dict.overview.editFarmProfile}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {showPhotoControls && (
                <div className="rounded-md border border-[#9EC4A8] bg-[#D8E7DA] p-3">
                  <div className="mb-2 text-xs font-semibold text-[#14291D]">
                    {dict.myFarm.photoSectionTitle}
                  </div>
                  <ProfilePhotoControls
                    compact
                    currentPhotoUrl={farmer.profilePhotoDataUrl}
                    language={language}
                    onUpdatePhoto={(url) => {
                      onUpdatePhoto(url);
                      setShowPhotoControls(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="relative min-h-[190px] bg-[#143D2B] lg:col-span-5">
            {!heroFailed ? (
              <img
                src={HERO_IMG}
                alt={dict.overview.heading}
                referrerPolicy="no-referrer"
                onError={() => setHeroFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-[#C5E0CE]">
                {dict.brandName}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F2D20]/90 via-[#0F2D20]/45 to-transparent p-4 text-white">
              <div className="text-xs font-medium text-[#D9EAE0]">
                {weather.scenarioId === 'live'
                  ? dict.overview.liveFeedActive
                  : weather.isSyntheticDemo
                  ? dict.overview.syntheticFeedActive
                  : dict.overview.customFeedActive}
              </div>
              <div className="mt-0.5 text-sm font-medium">{weather.scenarioTitle}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Farm Location Selector Strip */}
      <section
        data-testid="overview-location-bar"
        className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 w-full flex-wrap items-center gap-2.5 sm:w-auto">
            <label
              htmlFor="overview-location-select"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#143D2B]"
            >
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{dict.overview.selectLocationLabel}:</span>
            </label>
            <select
              id="overview-location-select"
              data-testid="overview-location-select"
              value={activePresetId}
              disabled={isFetchingLive}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="min-h-[38px] w-full max-w-full min-w-0 rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-1.5 text-xs font-medium text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none disabled:opacity-60 sm:w-auto"
            >
              <option value="">{dict.overview.locationPresetPlaceholder}</option>
              {INDIAN_LOCATION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.district[language]}, {preset.state[language]} ({preset.location[language]})
                </option>
              ))}
            </select>

            <button
              type="button"
              data-testid="overview-custom-location-toggle"
              onClick={() => {
                setCustomDistrictInput('');
                setCustomStateInput('');
                setShowCustomLocation((prev) => !prev);
              }}
              className="inline-flex min-h-[38px] items-center rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-3 py-1.5 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap"
            >
              {dict.overview.customLocationToggle}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#355240]">
            {isFetchingLive ? (
              <span
                data-testid="overview-location-updating"
                className="inline-flex items-center gap-1.5 font-medium text-[#143D2B]"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>{dict.overview.updatingLocation}</span>
              </span>
            ) : (
              <span data-testid="overview-active-location" className="font-mono font-medium text-[#14291D]">
                {displayDistrict}, {displayState}
                {weather.coordinates
                  ? ` (${weather.coordinates.lat.toFixed(2)}°${
                      language === 'hi' ? 'उ' : language === 'te' ? 'ఉ' : 'N'
                    }, ${weather.coordinates.lon.toFixed(2)}°${
                      language === 'hi' ? 'पू' : language === 'te' ? 'తూ' : 'E'
                    })`
                  : ''}
              </span>
            )}
          </div>
        </div>

        {showCustomLocation && (
          <form
            onSubmit={handleApplyCustomLocation}
            className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#C5D9C8] pt-3"
          >
            <input
              type="text"
              data-testid="overview-custom-district-input"
              value={customDistrictInput}
              onChange={(e) => setCustomDistrictInput(e.target.value)}
              placeholder={dict.overview.customDistrictPlaceholder}
              className="min-h-[38px] flex-1 min-w-[180px] rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-1.5 text-xs text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
            />
            <input
              type="text"
              data-testid="overview-custom-state-input"
              value={customStateInput}
              onChange={(e) => setCustomStateInput(e.target.value)}
              placeholder={dict.overview.customStatePlaceholder}
              className="min-h-[38px] flex-1 min-w-[160px] rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-1.5 text-xs text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
            />
            <button
              type="submit"
              data-testid="overview-apply-custom-location-btn"
              disabled={isFetchingLive || customDistrictInput.trim().length < 2}
              className="min-h-[38px] rounded-md bg-[#143D2B] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#0F2D20] disabled:opacity-60 whitespace-nowrap"
            >
              {dict.overview.applyLocationBtn}
            </button>
          </form>
        )}
      </section>

      {(liveWeatherError || gpsErrorMessage) && (
        <div className="rounded-md border border-[#F5C2C7] bg-[#FEF2F2] px-4 py-3 text-xs text-[#991B1B]">
          {gpsErrorMessage || liveWeatherError}
        </div>
      )}

      {/* 5-Column Operational KPI Strip (Risk Level, Temperature, 24h Rain, Wind & Soil, Actionable Alerts) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <button
          type="button"
          data-testid="kpi-risk-level"
          onClick={() => onNavigate('kisan-rakshak')}
          className="flex flex-col justify-between rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5 text-left transition-colors hover:border-[#143D2B] hover:bg-[#E1EDE2]"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#355240]">
            <span>{dict.overview.readinessTitle}</span>
            <ShieldAlert className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
          </div>
          <div className={`mt-3 font-display text-2xl font-semibold ${riskTextColor}`}>
            {localizeRiskLevel(assessment.riskLevel, language)}
          </div>
          <div className="mt-1 font-mono text-xs text-[#355240]">
            {dict.overview.scorePrefix} {assessment.riskScore}/100 · {dict.overview.confPrefix}{' '}
            {assessment.confidencePercent}%
          </div>
        </button>

        <button
          type="button"
          data-testid="kpi-temperature"
          onClick={() => onNavigate('weather')}
          className="flex flex-col justify-between rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5 text-left transition-colors hover:border-[#143D2B] hover:bg-[#E1EDE2]"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#355240]">
            <span>{dict.overview.tempCardTitle}</span>
            <Thermometer className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
          </div>
          <div className="mt-3 font-mono text-2xl font-semibold text-[#14291D]">
            {weather.temperatureC !== null && weather.temperatureC !== undefined
              ? `${weather.temperatureC}${tempUnit}`
              : dict.overview.notSet}
          </div>
          <div className="mt-1 truncate text-xs text-[#355240]">
            {dict.overview.humidityPrefix}{' '}
            <span className="font-mono">
              {weather.humidityPct !== null && weather.humidityPct !== undefined
                ? `${weather.humidityPct}%`
                : '—'}
            </span>
            {weather.weatherConditionLabel
              ? ` · ${localizeWeatherCondition(weather.weatherConditionLabel, language)}`
              : ''}
          </div>
        </button>

        <button
          type="button"
          data-testid="kpi-rainfall"
          onClick={() => onNavigate('weather')}
          className="flex flex-col justify-between rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5 text-left transition-colors hover:border-[#143D2B] hover:bg-[#E1EDE2]"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#355240]">
            <span>{dict.overview.rain24Title}</span>
            <CloudRain className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
          </div>
          <div className="mt-3 font-mono text-2xl font-semibold text-[#14291D]">
            {weather.rainfall24hMm !== null ? `${weather.rainfall24hMm} ${rainUnit}` : dict.overview.notSet}
          </div>
          <div className="mt-1 text-xs text-[#355240]">
            {dict.overview.rain72TotalPrefix}{' '}
            <span className="font-mono">
              {weather.rainfall72hMm ?? '—'} {rainUnit}
            </span>
          </div>
        </button>

        <button
          type="button"
          data-testid="kpi-wind-soil"
          onClick={() => onNavigate('weather')}
          className="flex flex-col justify-between rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5 text-left transition-colors hover:border-[#143D2B] hover:bg-[#E1EDE2]"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#355240]">
            <span>{dict.overview.windSoilTitle}</span>
            <Wind className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
          </div>
          <div className="mt-3 font-mono text-2xl font-semibold text-[#14291D]">
            {weather.windSpeedKmh !== null ? `${weather.windSpeedKmh} ${windUnit}` : dict.overview.notSet}
          </div>
          <div className="mt-1 truncate text-xs text-[#355240]">
            {weather.soilMoisturePct !== null && weather.soilMoisturePct !== undefined
              ? `${dict.overview.topsoilPrefix} ${weather.soilMoisturePct}%`
              : `${dict.overview.floodPrefix} ${localizeFloodStatus(weather.localFloodStatus, language)}`}
          </div>
        </button>

        <button
          type="button"
          data-testid="kpi-alerts"
          onClick={() => onNavigate('alerts')}
          className="flex flex-col justify-between rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5 text-left transition-colors hover:border-[#143D2B] hover:bg-[#E1EDE2]"
        >
          <div className="flex items-center justify-between text-xs font-medium text-[#355240]">
            <span>{dict.overview.pendingTasksTitle}</span>
            <Sprout className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
          </div>
          <div className="mt-3 font-mono text-2xl font-semibold text-[#14291D]">
            {pendingAlerts.length} {dict.common.pending}
          </div>
          <div className="mt-1 text-xs text-[#355240]">
            {alerts.filter((a) => a.status === 'completed').length}{' '}
            {dict.overview.completedActionsSuffix}
          </div>
        </button>
      </section>

      {/* Practical Live Field Operations Windows (Spraying & Irrigation) */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#355240]">
              {dict.overview.sprayingWindowTitle}
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                windows.sprayingWindow.status === 'Safe'
                  ? 'text-[#15803D]'
                  : windows.sprayingWindow.status === 'Caution'
                  ? 'text-[#B45309]'
                  : 'text-[#B91C1C]'
              }`}
            >
              {localizeSprayStatus(windows.sprayingWindow.status, language)}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#243F2F]">
            {windows.sprayingWindow.reason}
          </p>
        </div>

        <div className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#355240]">
              <Droplets className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
              {dict.overview.irrigationWindowTitle}
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                windows.irrigationGuidance.status === 'Drainage Priority'
                  ? 'text-[#C2410C]'
                  : windows.irrigationGuidance.status === 'Hold Irrigation'
                  ? 'text-[#143D2B]'
                  : 'text-[#B45309]'
              }`}
            >
              {localizeIrrigationStatus(windows.irrigationGuidance.status, language)}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#243F2F]">
            {windows.irrigationGuidance.reason}
          </p>
        </div>
      </section>

      {/* Live Plains, Terrain & River Basin Telemetry */}
      {weather.plains && (
        <section
          data-testid="overview-plains-panel"
          className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C5D9C8] pb-3">
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
              <h3 className="font-display text-sm font-semibold text-[#14291D]">
                {dict.plains.plainsTitle}
              </h3>
            </div>
            <span className="text-xs font-medium text-[#143D2B]">
              {localizePlainType(weather.plains.plainType, language)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3">
              <div className="text-[11px] font-medium text-[#355240]">
                {dict.plains.elevationLabel}
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                {weather.plains.elevationM !== null
                  ? `${weather.plains.elevationM} ${dict.plains.elevUnit}`
                  : dict.plains.unavailable}
              </div>
              <div className="mt-0.5 text-[11px] text-[#355240]">
                {dict.plains.reliefLabel}:{' '}
                <span className="font-mono">
                  {weather.plains.relief5kmM !== null
                    ? `${weather.plains.relief5kmM} ${dict.plains.elevUnit}`
                    : '—'}
                </span>
              </div>
            </div>

            <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3">
              <div className="text-[11px] font-medium text-[#355240]">
                {dict.plains.rootMoistureLabel}
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                {weather.plains.rootZoneMoisturePct !== null
                  ? `${weather.plains.rootZoneMoisturePct}%`
                  : dict.plains.unavailable}
              </div>
              <div className="mt-0.5 text-[11px] text-[#355240]">
                {dict.plains.soilTempLabel}:{' '}
                <span className="font-mono">
                  {weather.plains.soilTempC !== null
                    ? `${weather.plains.soilTempC}${language === 'hi' ? '°से.' : language === 'te' ? '°సె.' : '°C'}`
                    : '—'}
                </span>
              </div>
            </div>

            <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3">
              <div className="text-[11px] font-medium text-[#355240]">
                {dict.plains.et0Label}
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                {weather.plains.evapotranspirationMmDay !== null
                  ? `${weather.plains.evapotranspirationMmDay} ${dict.plains.et0Unit}`
                  : dict.plains.unavailable}
              </div>
              <div className="mt-0.5 text-[11px] text-[#355240]">
                {dict.overview.topsoilPrefix}{' '}
                <span className="font-mono">
                  {weather.plains.topsoilMoisturePct !== null
                    ? `${weather.plains.topsoilMoisturePct}%`
                    : '—'}
                </span>
              </div>
            </div>

            <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3">
              <div className="text-[11px] font-medium text-[#355240]">
                {dict.plains.pressureLabel}
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                {weather.plains.surfacePressureHpa !== null
                  ? `${weather.plains.surfacePressureHpa} ${dict.plains.pressureUnit}`
                  : dict.plains.unavailable}
              </div>
              <div className="mt-0.5 text-[11px] text-[#355240]">
                {dict.plains.rainProbLabel}:{' '}
                <span className="font-mono">
                  {weather.plains.rainProbability24hPct !== null
                    ? `${weather.plains.rainProbability24hPct}%`
                    : '—'}
                </span>
              </div>
            </div>

            <div className="col-span-2 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3">
              <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-[#355240]">
                <span className="inline-flex items-center gap-1">
                  <Waves className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
                  {dict.plains.riverFlowLabel}
                </span>
                <span
                  className={`font-semibold ${
                    weather.plains.riverBasinStatus === 'High Flood Discharge'
                      ? 'text-[#B91C1C]'
                      : weather.plains.riverBasinStatus === 'Elevated Runoff'
                      ? 'text-[#B45309]'
                      : 'text-[#143D2B]'
                  }`}
                >
                  {localizeRiverBasinStatus(weather.plains.riverBasinStatus, language)}
                </span>
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                {weather.plains.riverDischargeM3s !== null
                  ? `${weather.plains.riverDischargeM3s} ${dict.plains.flowUnit}`
                  : dict.plains.unavailable}
                {weather.plains.riverDischargeMax4dM3s !== null && (
                  <span className="ml-2 text-xs font-normal text-[#355240]">
                    ({weather.plains.riverDischargeMax4dM3s} {dict.plains.flowUnit})
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Master Orchestrator & Scenario Bar */}
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#14291D]">
              {dict.overview.askTeamTitle}
            </h3>
            <p className="mt-1 text-xs text-[#355240]">{dict.overview.askTeamSubheading}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void onLoadLiveWeather(false);
                setQuickQuery(liveQuickPrompt);
              }}
              className={`min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                weather.scenarioId === 'live'
                  ? 'border-[#143D2B] bg-[#143D2B] text-white'
                  : 'border-[#9EC4A8] bg-[#D8E7DA] text-[#14291D] hover:bg-[#CFE1D2]'
              }`}
            >
              {dict.common.liveFarmWeatherBtn}
            </button>
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  onSelectScenario(sc.id);
                  setQuickQuery(sc.defaultQuery);
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
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label htmlFor="overview-agent-query" className="sr-only">
            {dict.overview.askLabelAria}
          </label>
          <textarea
            id="overview-agent-query"
            rows={2}
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder={dict.overview.askPlaceholder}
            className="w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3.5 py-2.5 text-sm text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
          />

          {formError && <p className="text-xs font-medium text-[#B91C1C]">{formError}</p>}
          {orchestrateError && (
            <div
              data-testid="orchestrate-error"
              className="rounded-md border border-[#F5C2C7] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]"
            >
              {orchestrateError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <VoiceInputButton
              language={language}
              label={dict.common.speakQuery}
              listeningLabel={dict.common.stopListening}
              onTranscript={(text) => setQuickQuery((prev) => (prev ? `${prev} ${text}` : text))}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('ai-staff')}
                className="min-h-[40px] rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-4 py-2 text-sm font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap"
              >
                {dict.overview.openFullAiStaff}
              </button>
              <button
                type="submit"
                disabled={isOrchestrating}
                className="min-h-[40px] rounded-md bg-[#143D2B] px-5 py-2 text-sm font-medium text-white hover:bg-[#0F2D20] disabled:opacity-60 whitespace-nowrap"
              >
                {isOrchestrating ? dict.common.runningAgents : dict.common.runOrchestrator}
              </button>
            </div>
          </div>
        </form>

        {latestRun && (
          <div className="mt-5 border-t border-[#C5D9C8] pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-medium text-[#355240]">
                {dict.overview.latestBriefLabel} · {latestRun.executionSteps.length}{' '}
                {dict.overview.toolsExecutedSuffix} ·{' '}
                <span className="font-mono">
                  {new Date(latestRun.timestamp).toLocaleTimeString(
                    language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN'
                  )}
                </span>
              </div>
              <SpokenOutputButton
                text={latestRun.spokenSummary || latestRun.finalAnswer}
                language={language}
                listenLabel={dict.common.listenSummary}
                stopLabel={dict.common.stopVoice}
              />
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#14291D]">
              {latestRun.finalAnswer}
            </p>
          </div>
        )}
      </section>

      {/* Two-Column Operational Split: Weather Chart + Pending Alerts */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-7">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-[#14291D]">
              {dict.overview.weatherSummaryTitle}
            </h3>
            <span className="font-mono text-xs text-[#355240]">{weather.lastUpdated}</span>
          </div>
          <p className="mt-1 text-xs text-[#355240]">{weather.dataSource}</p>
          <div className="mt-4">
            <WeatherTimelineChart timeline={weather.timeline} language={language} />
          </div>
        </div>

        <div className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-[#14291D]">
              {dict.overview.priorityQueueTitle}
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('alerts')}
              className="text-xs font-medium text-[#143D2B] hover:underline"
            >
              {dict.overview.manageAll}
            </button>
          </div>

          {pendingAlerts.length === 0 ? (
            <div className="mt-6 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-5 text-center text-sm text-[#355240]">
              <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-[#15803D]" aria-hidden="true" />
              {dict.overview.allAlertsDone}
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#C5D9C8]">
              {pendingAlerts.slice(0, 4).map((alert) => (
                <li key={alert.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`font-mono font-semibold ${
                        alert.priority === 'Urgent'
                          ? 'text-[#B91C1C]'
                          : alert.priority === 'High'
                          ? 'text-[#C2410C]'
                          : 'text-[#B45309]'
                      }`}
                    >
                      {localizePriorityLabel(alert.priority, language)}
                    </span>
                    <span className="text-[#355240]">
                      {alert.requiresHumanConfirmation
                        ? dict.overview.confirmBeforeAction
                        : dict.overview.standardStep}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#14291D]">{alert.title}</div>
                  <p className="mt-0.5 text-xs text-[#355240]">{alert.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
