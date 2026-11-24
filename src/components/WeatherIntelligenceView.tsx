import {
  CloudRain,
  Droplets,
  Info,
  MapPin,
  Mountain,
  RefreshCw,
  Thermometer,
  Waves,
  Wind,
} from 'lucide-react';
import type { FarmerProfile, Language, WeatherContext } from '../types/agriguard';
import {
  localizeCropsList,
  localizeDrainageSlopeProfile,
  localizeFloodStatus,
  localizeIrrigationStatus,
  localizeLocationText,
  localizePlainType,
  localizeRiverBasinStatus,
  localizeSprayStatus,
  localizeTimelineKind,
  localizeTimelineLabel,
} from '../lib/domainTranslations';
import { computeFarmingWindows } from '../lib/liveWeatherUtils';
import { TRANSLATIONS } from '../lib/translations';
import { WeatherTimelineChart } from './SvgCharts';

interface WeatherIntelligenceViewProps {
  farmer: FarmerProfile;
  weather: WeatherContext;
  language: Language;
  isOrchestrating: boolean;
  isFetchingLive: boolean;
  isAcquiringGps: boolean;
  liveWeatherError: string | null;
  gpsErrorMessage: string | null;
  onEnableLiveGps: () => void;
  onRefreshLive: (coords?: { lat: number; lon: number }) => Promise<void>;
  onAskWeatherAgent: (query: string) => Promise<void>;
}

export function WeatherIntelligenceView({
  farmer,
  weather,
  language,
  isOrchestrating,
  isFetchingLive,
  isAcquiringGps,
  liveWeatherError,
  gpsErrorMessage,
  onEnableLiveGps,
  onRefreshLive,
  onAskWeatherAgent,
}: WeatherIntelligenceViewProps) {
  const dict = TRANSLATIONS[language];

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

  const rainUnit = language === 'hi' ? 'मिमी' : language === 'te' ? 'మి.మీ' : 'mm';
  const windUnit = language === 'hi' ? 'किमी/घं' : language === 'te' ? 'కి.మీ/గం' : 'km/h';
  const tempUnit = language === 'hi' ? '°से.' : language === 'te' ? '°సె.' : '°C';
  const displayDistrict = localizeLocationText(farmer.district, language);
  const displayState = localizeLocationText(farmer.state, language);
  const displayCrops = localizeCropsList(farmer.crops, language);

  const weatherAgentPrompt =
    language === 'hi'
      ? `${displayDistrict}, ${displayState} में ${displayCrops.join(
          ', '
        )} के लिए वर्तमान मौसम जोखिम, छिड़काव उपयुक्तता, सिंचाई समय और पूर्वानुमान अनिश्चितता का विश्लेषण करें। पुष्ट अवलोकनों और पूर्वानुमानों को स्पष्ट अलग रखें।`
      : language === 'te'
      ? `${displayDistrict}, ${displayState} లోని ${displayCrops.join(
          ', '
        )} పంటకు ప్రస్తుత వాతావరణ ముప్పులు, పిచికారీ అనుకూలత, నీటి పారుదల సమయం మరియు అంచనా అనిశ్చితిని విశ్లేషించండి. నిర్ధారిత పరిశీలనలను, మోడల్ అంచనాలను వేరుగా చూపండి.`
      : `Analyse current weather risks, spraying suitability, irrigation timing, and forecast uncertainty for ${displayCrops.join(
          ', '
        )} in ${displayDistrict}, ${displayState}. Distinguish confirmed observations from forecasts.`;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#C5D9C8] pb-4">
          <div>
            <div className="text-xs text-[#355240]">
              {dict.weatherView.agentHeader} · {displayDistrict}, {displayState}
              {weather.weatherConditionLabel ? ` · ${weather.weatherConditionLabel}` : ''}
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#14291D]">
              {weather.scenarioTitle}
            </h2>
            <p className="mt-1 text-xs text-[#355240]">
              {dict.weatherView.sourcePrefix} {weather.dataSource} ·{' '}
              {dict.weatherView.lastUpdatedPrefix}{' '}
              <span className="font-mono">{weather.lastUpdated}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isFetchingLive}
              onClick={() => void onRefreshLive()}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3.5 py-2 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2] disabled:opacity-60 whitespace-nowrap"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isFetchingLive ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>
                {isFetchingLive ? dict.weatherView.fetchingLiveBtn : dict.weatherView.fetchLiveBtn}
              </span>
            </button>

            <button
              type="button"
              disabled={isFetchingLive || isAcquiringGps}
              onClick={onEnableLiveGps}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-3.5 py-2 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2] disabled:opacity-60 whitespace-nowrap"
            >
              <MapPin className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
              <span>
                {isAcquiringGps
                  ? dict.overview.gpsAcquiringBtn
                  : dict.weatherView.useGpsBtn}
              </span>
            </button>

            <button
              type="button"
              disabled={isOrchestrating}
              onClick={() => onAskWeatherAgent(weatherAgentPrompt)}
              className="min-h-[40px] rounded-md bg-[#143D2B] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2D20] disabled:opacity-60 whitespace-nowrap"
            >
              {isOrchestrating
                ? dict.weatherView.runningAgentBtn
                : dict.weatherView.runWeatherAgentBtn}
            </button>
          </div>
        </div>

        {(liveWeatherError || gpsErrorMessage) && (
          <div className="mt-4 rounded-md border border-[#F5C2C7] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
            {gpsErrorMessage || liveWeatherError}
          </div>
        )}

        {/* Key Weather Telemetry */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-4">
            <div className="flex items-center gap-1.5 text-xs text-[#355240]">
              <CloudRain className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
              <span>{dict.weatherView.rainCardTitle}</span>
            </div>
            <div className="mt-2 font-mono text-lg font-semibold text-[#14291D]">
              {weather.rainfall24hMm ?? '—'} / {weather.rainfall72hMm ?? '—'} {rainUnit}
            </div>
          </div>

          <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-4">
            <div className="flex items-center gap-1.5 text-xs text-[#355240]">
              <Wind className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
              <span>{dict.weatherView.windCardTitle}</span>
            </div>
            <div className="mt-2 font-mono text-lg font-semibold text-[#14291D]">
              {weather.windSpeedKmh ?? '—'} / {weather.windGustKmh ?? '—'} {windUnit}
            </div>
          </div>

          <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-4">
            <div className="flex items-center gap-1.5 text-xs text-[#355240]">
              <Thermometer className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
              <span>{dict.weatherView.tempCardTitle}</span>
            </div>
            <div className="mt-2 font-mono text-lg font-semibold text-[#14291D]">
              {weather.temperatureC ?? '—'}
              {tempUnit} · {weather.humidityPct ?? '—'}%
            </div>
          </div>

          <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-4">
            <div className="flex items-center gap-1.5 text-xs text-[#355240]">
              <Droplets className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
              <span>{dict.weatherView.soilCardTitle}</span>
            </div>
            <div className="mt-2 font-mono text-lg font-semibold text-[#14291D]">
              {weather.soilMoisturePct !== null && weather.soilMoisturePct !== undefined
                ? `${weather.soilMoisturePct}%`
                : localizeFloodStatus(weather.localFloodStatus, language)}
            </div>
          </div>
        </div>

        {/* Spraying & Irrigation Actionable Windows */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-md border border-[#B5CEBA] bg-[#DFECE0] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#143D2B]">
                {dict.weatherView.sprayingTitle}
              </span>
              <span className="font-mono font-semibold text-[#14291D]">
                {localizeSprayStatus(windows.sprayingWindow.status, language)}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#243F2F]">
              {windows.sprayingWindow.reason}
            </p>
          </div>

          <div className="rounded-md border border-[#B5CEBA] bg-[#DFECE0] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#143D2B]">
                {dict.weatherView.irrigationTitle}
              </span>
              <span className="font-mono font-semibold text-[#14291D]">
                {localizeIrrigationStatus(windows.irrigationGuidance.status, language)}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#243F2F]">
              {windows.irrigationGuidance.reason}
            </p>
          </div>
        </div>

        {/* Forecast vs Observation & Uncertainty */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-md border border-[#B5CEBA] bg-[#DFECE0] p-4">
            <div className="text-xs font-semibold text-[#143D2B]">
              {dict.weatherView.confirmedObsTitle}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#243F2F]">
              {weather.observationNote}
            </p>
          </div>
          <div className="rounded-md border border-[#D3C49E] bg-[#EFEAD6] p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C4315]">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.weatherView.uncertaintyTitle}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5C4315]">
              {weather.forecastUncertainty}
            </p>
          </div>
        </div>

        {/* Live Plains, Terrain, Soil & River Basin Hydrology */}
        {weather.plains && (
          <div
            data-testid="weather-plains-section"
            className="mt-5 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B5CEBA] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#143D2B]">
                <Mountain className="h-4 w-4" aria-hidden="true" />
                <span>{dict.plains.plainsTitle}</span>
              </div>
              <span className="text-xs font-medium text-[#14291D]">
                {localizePlainType(weather.plains.plainType, language)} ·{' '}
                {localizeDrainageSlopeProfile(weather.plains.drainageSlopeProfile, language)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-md border border-[#B5CEBA] bg-[#E9F2EA] p-3">
                <div className="text-[11px] text-[#355240]">{dict.plains.elevationLabel}</div>
                <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                  {weather.plains.elevationM !== null
                    ? `${weather.plains.elevationM} ${dict.plains.elevUnit}`
                    : dict.plains.unavailable}
                </div>
              </div>

              <div className="rounded-md border border-[#B5CEBA] bg-[#E9F2EA] p-3">
                <div className="text-[11px] text-[#355240]">{dict.plains.reliefLabel}</div>
                <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                  {weather.plains.relief5kmM !== null
                    ? `${weather.plains.relief5kmM} ${dict.plains.elevUnit}`
                    : dict.plains.unavailable}
                </div>
              </div>

              <div className="rounded-md border border-[#B5CEBA] bg-[#E9F2EA] p-3">
                <div className="text-[11px] text-[#355240]">{dict.plains.rootMoistureLabel}</div>
                <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                  {weather.plains.rootZoneMoisturePct !== null
                    ? `${weather.plains.rootZoneMoisturePct}%`
                    : dict.plains.unavailable}
                </div>
              </div>

              <div className="rounded-md border border-[#B5CEBA] bg-[#E9F2EA] p-3">
                <div className="text-[11px] text-[#355240]">{dict.plains.et0Label}</div>
                <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                  {weather.plains.evapotranspirationMmDay !== null
                    ? `${weather.plains.evapotranspirationMmDay} ${dict.plains.et0Unit}`
                    : dict.plains.unavailable}
                </div>
              </div>

              <div className="rounded-md border border-[#B5CEBA] bg-[#E9F2EA] p-3">
                <div className="text-[11px] text-[#355240]">{dict.plains.pressureLabel}</div>
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

              <div className="rounded-md border border-[#B5CEBA] bg-[#E9F2EA] p-3">
                <div className="flex items-center gap-1 text-[11px] text-[#355240]">
                  <Waves className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
                  <span>{dict.plains.riverFlowLabel}</span>
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-[#14291D]">
                  {weather.plains.riverDischargeM3s !== null
                    ? `${weather.plains.riverDischargeM3s} ${dict.plains.flowUnit}`
                    : dict.plains.unavailable}
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-[#143D2B]">
                  {localizeRiverBasinStatus(weather.plains.riverBasinStatus, language)}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <h3 className="font-display text-base font-semibold text-[#14291D]">
          {dict.weatherView.timelineHeading}
        </h3>
        <div className="mt-4">
          <WeatherTimelineChart timeline={weather.timeline} language={language} />
        </div>

        {weather.timeline.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#9EC4A8] text-[#355240]">
                  <th className="py-2 pr-4 font-semibold">{dict.weatherView.colWindow}</th>
                  <th className="py-2 pr-4 font-semibold">{dict.weatherView.colKind}</th>
                  <th className="py-2 pr-4 text-right font-semibold">{dict.weatherView.colRain}</th>
                  <th className="py-2 pr-4 text-right font-semibold">{dict.weatherView.colWind}</th>
                  <th className="py-2 pr-4 text-right font-semibold">{dict.weatherView.colTemp}</th>
                  <th className="py-2 text-right font-semibold">{dict.weatherView.colHumidity}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5D9C8]">
                {weather.timeline.map((row) => (
                  <tr key={row.label} className="hover:bg-[#D8E7DA]">
                    <td className="py-2.5 pr-4 font-medium text-[#14291D]">
                      {localizeTimelineLabel(row.label, language)}
                    </td>
                    <td className="py-2.5 pr-4 text-[#355240]">
                      {localizeTimelineKind(row.kind, language)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-[#14291D]">
                      {row.rainfallMm} {rainUnit}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-[#14291D]">
                      {row.windKmh} {windUnit}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-[#14291D]">
                      {row.tempC}
                      {tempUnit}
                    </td>
                    <td className="py-2.5 text-right font-mono text-[#14291D]">
                      {row.humidityPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
