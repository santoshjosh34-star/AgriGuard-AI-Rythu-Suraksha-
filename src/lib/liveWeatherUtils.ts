import {
  localizeCropName,
  localizeLocationText,
} from './domainTranslations.ts';
import type {
  AdvisoryRecommendation,
  DrainageSlopeProfile,
  FarmAlert,
  FarmerProfile,
  Language,
  PlainClassification,
  PlainsTelemetry,
  RiverBasinStatus,
  WeatherContext,
  WeatherForecastPoint,
} from '../types/agriguard.ts';

export function describeWmoCode(code: number | undefined | null): string {
  if (code === undefined || code === null || Number.isNaN(code)) return 'Unknown';
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Fog / Mist';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 66 && code <= 67) return 'Freezing Rain';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm / Squall';
  return 'Overcast / Variable';
}

export function computeFarmingWindows(
  input: {
    rainfall24hMm: number | null;
    rainfall72hMm: number | null;
    windSpeedKmh: number | null;
    windGustKmh: number | null;
    soilMoisturePct?: number | null;
  },
  language: 'en' | 'hi' | 'te' = 'en'
): {
  sprayingWindow: { status: 'Safe' | 'Caution' | 'Avoid'; reason: string };
  irrigationGuidance: { status: 'Irrigate' | 'Hold Irrigation' | 'Drainage Priority'; reason: string };
} {
  const rain24 = input.rainfall24hMm ?? 0;
  const rain72 = input.rainfall72hMm ?? rain24;
  const wind = input.windSpeedKmh ?? 0;
  const gust = input.windGustKmh ?? wind;
  const soil = input.soilMoisturePct;

  let sprayingWindow: { status: 'Safe' | 'Caution' | 'Avoid'; reason: string };
  if (rain24 >= 10 || gust >= 28 || wind >= 20) {
    sprayingWindow = {
      status: 'Avoid',
      reason:
        language === 'hi'
          ? `छिड़काव के लिए अनुपयुक्त: ${rain24} मिमी वर्षा अनुमान और ${gust} किमी/घंटा तक हवा के झोंके दवा बहाव व बर्बादी का जोखिम बढ़ाते हैं।`
          : language === 'te'
          ? `పిచికారీకి అనుకూలం కాదు: ${rain24} మి.మీ వర్ష సూచన మరియు ${gust} కి.మీ/గం గాలి ఉధృతి వల్ల మందు కొట్టుకుపోయే ప్రమాదం ఉంది.`
          : `Unsuitable for foliar spray: ${rain24} mm rain forecast and wind gusts up to ${gust} km/h risk chemical wash-off and drift.`,
    };
  } else if (rain24 >= 2 || gust >= 18 || wind >= 14) {
    sprayingWindow = {
      status: 'Caution',
      reason:
        language === 'hi'
          ? `केवल शांत सुबह के घंटों में छिड़काव करें; ${gust} किमी/घंटा हवा या ${rain24} मिमी हल्की बारिश असर कम कर सकती है।`
          : language === 'te'
          ? `ప్రశాంతమైన ఉదయం వేళల్లో మాత్రమే పిచికారీ చేయండి; ${gust} కి.మీ/గం గాలి లేదా ${rain24} మి.మీ తేలికపాటి వర్షం ప్రభావాన్ని తగ్గించవచ్చు.`
          : `Spray only in calm early-morning hours; wind gusts (${gust} km/h) or light rain (${rain24} mm) may reduce efficacy.`,
    };
  } else {
    sprayingWindow = {
      status: 'Safe',
      reason:
        language === 'hi'
          ? `शांत हवा (${wind} किमी/घंटा, झोंके ${gust} किमी/घंटा) और 24 घंटे सूखा पूर्वानुमान (${rain24} मिमी) सुरक्षित छिड़काव के अनुकूल हैं।`
          : language === 'te'
          ? `నెమ్మదైన గాలి (${wind} కి.మీ/గం, ఉధృతి ${gust} కి.మీ/గం) మరియు పొడి 24 గం. అంచనా (${rain24} మి.మీ) సురక్షిత పిచికారీకి అనుకూలం.`
          : `Calm winds (${wind} km/h, gusts ${gust} km/h) and dry 24h forecast (${rain24} mm) allow safe spraying.`,
    };
  }

  let irrigationGuidance: {
    status: 'Irrigate' | 'Hold Irrigation' | 'Drainage Priority';
    reason: string;
  };
  if (rain24 >= 35 || rain72 >= 60 || (soil !== null && soil !== undefined && soil >= 42)) {
    irrigationGuidance = {
      status: 'Drainage Priority',
      reason:
        language === 'hi'
          ? `अधिक नमी/बारिश आगे (${rain24} मिमी/24 घंटे${
              soil !== null && soil !== undefined ? `, ऊपरी मिट्टी ${soil}%` : ''
            })। मेड़ निकास नालियाँ खुली रखें और सिंचाई न करें।`
          : language === 'te'
          ? `అధిక తేమ/వర్షం ముందుంది (${rain24} మి.మీ/24 గం.${
              soil !== null && soil !== undefined ? `, పైమట్టి ${soil}%` : ''
            }). పొలం గట్ల నీటి పారుదల కాలువలు శుభ్రంగా ఉంచి నీరు పెట్టడం ఆపండి.`
          : `High moisture/rain ahead (${rain24} mm/24h${
              soil !== null && soil !== undefined ? `, topsoil ${soil}%` : ''
            }). Keep bund outlets clear and skip irrigation.`,
    };
  } else if (rain24 >= 8 || rain72 >= 20 || (soil !== null && soil !== undefined && soil >= 28)) {
    irrigationGuidance = {
      status: 'Hold Irrigation',
      reason:
        language === 'hi'
          ? `पर्याप्त नमी या आगामी बारिश (${rain72} मिमी/72 घंटे${
              soil !== null && soil !== undefined ? `, ऊपरी मिट्टी ${soil}%` : ''
            })। सिंचाई रोककर पानी और पंप ईंधन बचाएं।`
          : language === 'te'
          ? `తగినంత తేమ లేదా రాబోయే వర్షం ఉంది (${rain72} మి.మీ/72 గం.${
              soil !== null && soil !== undefined ? `, పైమట్టి ${soil}%` : ''
            }). నీరు పెట్టడం ఆపి నీరు, పంపు ఇంధనం ఆదా చేయండి.`
          : `Adequate moisture or incoming rain (${rain72} mm/72h${
              soil !== null && soil !== undefined ? `, topsoil ${soil}%` : ''
            }). Save water and pump fuel by pausing irrigation.`,
    };
  } else {
    irrigationGuidance = {
      status: 'Irrigate',
      reason:
        language === 'hi'
          ? `कम 72 घंटे वर्षा (${rain72} मिमी) और मध्यम/सूखी मिट्टी (${
              soil !== null && soil !== undefined ? `${soil}%` : 'हाथ से जांचें'
            })। फसल की जरूरत होने पर सुबह/शाम हल्की सिंचाई करें।`
          : language === 'te'
          ? `తక్కువ 72 గం. వర్షం (${rain72} మి.మీ) మరియు పొడి/మధ్యస్థ నేల (${
              soil !== null && soil !== undefined ? `${soil}%` : 'చేతితో చూడండి'
            }). పంటకు అవసరమైతే సాయంత్రం/ఉదయం తేలికపాటి నీరు పెట్టండి.`
          : `Low 72h rainfall (${rain72} mm) and moderate/dry soil (${
              soil !== null && soil !== undefined ? `${soil}%` : 'check manually'
            }). Schedule light irrigation in evening/morning if crop requires moisture.`,
    };
  }

  return { sprayingWindow, irrigationGuidance };
}

export interface OpenMeteoForecastPayload {
  elevation?: number;
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    wind_gusts_10m?: number;
    weather_code?: number;
    surface_pressure?: number;
  };
  hourly?: {
    time?: string[];
    precipitation?: number[];
    precipitation_probability?: number[];
    wind_speed_10m?: number[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    soil_moisture_0_to_7cm?: number[];
    soil_moisture_7_to_28cm?: number[];
    soil_temperature_0cm?: number[];
    et0_fao_evapotranspiration?: number[];
  };
  daily?: {
    time?: string[];
    precipitation_sum?: number[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
    et0_fao_evapotranspiration_sum?: number[];
  };
}

export interface OpenMeteoElevationPayload {
  elevation?: number[];
}

export interface OpenMeteoFloodPayload {
  daily?: {
    time?: string[];
    river_discharge?: Array<number | null>;
    river_discharge_mean?: Array<number | null>;
    river_discharge_max?: Array<number | null>;
  };
}

export function computePlainsTelemetry(params: {
  raw: OpenMeteoForecastPayload;
  elevationSamples?: number[] | null;
  flood?: OpenMeteoFloodPayload | null;
  startIdx: number;
}): PlainsTelemetry {
  const { raw, elevationSamples, flood, startIdx } = params;
  const hourly = raw.hourly ?? {};
  const daily = raw.daily ?? {};
  const current = raw.current ?? {};

  const validSamples = (elevationSamples ?? []).filter((v) => typeof v === 'number' && Number.isFinite(v));
  const centerElev =
    validSamples.length > 0
      ? Math.round(validSamples[0])
      : typeof raw.elevation === 'number' && Number.isFinite(raw.elevation)
      ? Math.round(raw.elevation)
      : null;
  const minElev = validSamples.length > 0 ? Math.round(Math.min(...validSamples)) : centerElev;
  const maxElev = validSamples.length > 0 ? Math.round(Math.max(...validSamples)) : centerElev;
  const relief5kmM =
    minElev !== null && maxElev !== null && validSamples.length >= 2
      ? Math.max(0, maxElev - minElev)
      : null;

  let plainType: PlainClassification = 'Unknown';
  if (centerElev !== null) {
    if (centerElev <= 15 && (relief5kmM === null || relief5kmM <= 12)) {
      plainType = 'Low-Lying Coastal / Delta Plain';
    } else if (centerElev <= 80 && (relief5kmM === null || relief5kmM <= 20)) {
      plainType = 'Alluvial / River Basin Plain';
    } else if (centerElev <= 250 && (relief5kmM === null || relief5kmM <= 35)) {
      plainType = 'Inland Agricultural Plain';
    } else if (centerElev <= 320) {
      plainType = 'Sloping Plain / Foothill Valley';
    } else {
      plainType = 'Upland / Plateau Plain';
    }
  }

  let drainageSlopeProfile: DrainageSlopeProfile = 'Unknown';
  if (relief5kmM !== null) {
    if (relief5kmM <= 6) drainageSlopeProfile = 'Flat Basin / Slow Runoff';
    else if (relief5kmM <= 18) drainageSlopeProfile = 'Gentle Plain Slope';
    else drainageSlopeProfile = 'Natural Drainage Slope';
  }

  const rawTopsoil = hourly.soil_moisture_0_to_7cm?.[startIdx];
  const topsoilMoisturePct =
    rawTopsoil !== undefined && Number.isFinite(rawTopsoil) ? Math.round(rawTopsoil * 100) : null;

  const rawRoot = hourly.soil_moisture_7_to_28cm?.[startIdx];
  const rootZoneMoisturePct =
    rawRoot !== undefined && Number.isFinite(rawRoot) ? Math.round(rawRoot * 100) : null;

  const rawSoilTemp = hourly.soil_temperature_0cm?.[startIdx];
  const soilTempC =
    rawSoilTemp !== undefined && Number.isFinite(rawSoilTemp) ? Math.round(rawSoilTemp) : null;

  const dailyEt0 = daily.et0_fao_evapotranspiration_sum?.[0];
  let evapotranspirationMmDay: number | null = null;
  if (typeof dailyEt0 === 'number' && Number.isFinite(dailyEt0)) {
    evapotranspirationMmDay = Number(dailyEt0.toFixed(1));
  } else if (Array.isArray(hourly.et0_fao_evapotranspiration)) {
    const etSlice = hourly.et0_fao_evapotranspiration
      .slice(startIdx, startIdx + 24)
      .filter((v) => Number.isFinite(v));
    if (etSlice.length > 0) {
      evapotranspirationMmDay = Number(etSlice.reduce((a, b) => a + b, 0).toFixed(1));
    }
  }

  const surfacePressureHpa =
    typeof current.surface_pressure === 'number' && Number.isFinite(current.surface_pressure)
      ? Math.round(current.surface_pressure)
      : null;

  const probSlice = (hourly.precipitation_probability ?? [])
    .slice(startIdx, startIdx + 24)
    .filter((v) => typeof v === 'number' && Number.isFinite(v));
  const rainProbability24hPct = probSlice.length > 0 ? Math.round(Math.max(...probSlice)) : null;

  // River discharge from GloFAS Flood API (if index ~2 matches today when past_days=2, else first non-null)
  const floodTimes = flood?.daily?.time ?? [];
  const discharges = flood?.daily?.river_discharge ?? [];
  const dischargeMeans = flood?.daily?.river_discharge_mean ?? [];
  const dischargeMaxes = flood?.daily?.river_discharge_max ?? [];

  const todayPrefix = (current.time ?? '').slice(0, 10);
  let floodTodayIdx = todayPrefix ? floodTimes.findIndex((t) => t === todayPrefix) : -1;
  if (floodTodayIdx < 0) floodTodayIdx = discharges.length >= 3 ? 2 : 0;

  const todayDischargeRaw = discharges[floodTodayIdx];
  const riverDischargeM3s =
    typeof todayDischargeRaw === 'number' && Number.isFinite(todayDischargeRaw)
      ? Number(todayDischargeRaw.toFixed(2))
      : null;

  const futureMaxNums = dischargeMaxes
    .slice(floodTodayIdx)
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const riverDischargeMax4dM3s =
    futureMaxNums.length > 0 ? Number(Math.max(...futureMaxNums).toFixed(2)) : null;

  const meanRaw = dischargeMeans[floodTodayIdx];
  const baselineMean =
    typeof meanRaw === 'number' && Number.isFinite(meanRaw) && meanRaw > 0.1 ? meanRaw : null;

  let riverBasinStatus: RiverBasinStatus = 'Unavailable';
  if (riverDischargeM3s !== null || riverDischargeMax4dM3s !== null) {
    const peak = riverDischargeMax4dM3s ?? riverDischargeM3s ?? 0;
    if (baselineMean !== null && peak >= baselineMean * 1.6 && peak >= 15) {
      riverBasinStatus = 'High Flood Discharge';
    } else if (baselineMean !== null && peak >= baselineMean * 1.25 && peak >= 5) {
      riverBasinStatus = 'Elevated Runoff';
    } else {
      riverBasinStatus = 'Normal Flow';
    }
  }

  return {
    elevationM: centerElev,
    surroundingMinElevationM: minElev,
    surroundingMaxElevationM: maxElev,
    relief5kmM,
    plainType,
    drainageSlopeProfile,
    topsoilMoisturePct,
    rootZoneMoisturePct,
    soilTempC,
    evapotranspirationMmDay,
    surfacePressureHpa,
    rainProbability24hPct,
    riverDischargeM3s,
    riverDischargeMax4dM3s,
    riverBasinStatus,
  };
}

export function buildOpenMeteoWeatherContext(params: {
  lat: number;
  lon: number;
  resolvedName: string;
  raw: OpenMeteoForecastPayload;
  elevationSamples?: number[] | null;
  flood?: OpenMeteoFloodPayload | null;
  fetchedAtIso: string;
}): WeatherContext {
  const { lat, lon, resolvedName, raw, elevationSamples, flood, fetchedAtIso } = params;
  const current = raw.current ?? {};
  const hourly = raw.hourly ?? {};
  const daily = raw.daily ?? {};

  const times = hourly.time ?? [];
  const precips = hourly.precipitation ?? [];
  const winds = hourly.wind_speed_10m ?? [];
  const temps = hourly.temperature_2m ?? [];
  const hums = hourly.relative_humidity_2m ?? [];
  const soils = hourly.soil_moisture_0_to_7cm ?? [];

  // Find current hour index (closest match to current.time prefix YYYY-MM-DDTHH)
  const currentHourPrefix = (current.time ?? '').slice(0, 13);
  let startIdx = times.findIndex((t) => t.startsWith(currentHourPrefix));
  if (startIdx < 0) startIdx = 0;

  const sumSlice = (arr: number[], from: number, count: number) =>
    Number(
      arr
        .slice(from, from + count)
        .reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0)
        .toFixed(1)
    );

  const maxSlice = (arr: number[], from: number, count: number) => {
    const slice = arr.slice(from, from + count).filter((v) => Number.isFinite(v));
    return slice.length > 0 ? Math.round(Math.max(...slice)) : 0;
  };

  const avgSlice = (arr: number[], from: number, count: number) => {
    const slice = arr.slice(from, from + count).filter((v) => Number.isFinite(v));
    if (slice.length === 0) return 0;
    return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
  };

  const rainfall24hMm =
    precips.length > startIdx
      ? sumSlice(precips, startIdx, 24)
      : Number((daily.precipitation_sum?.[0] ?? 0).toFixed(1));
  const rainfall72hMm =
    precips.length > startIdx
      ? sumSlice(precips, startIdx, 72)
      : Number(
          (daily.precipitation_sum ?? [])
            .slice(0, 3)
            .reduce((a, b) => a + b, 0)
            .toFixed(1)
        );

  const windSpeedKmh = Math.round(current.wind_speed_10m ?? maxSlice(winds, startIdx, 24));
  const windGustKmh = Math.round(
    current.wind_gusts_10m ?? daily.wind_gusts_10m_max?.[0] ?? windSpeedKmh * 1.4
  );
  const temperatureC =
    current.temperature_2m !== undefined ? Math.round(current.temperature_2m) : avgSlice(temps, startIdx, 6);
  const humidityPct =
    current.relative_humidity_2m !== undefined
      ? Math.round(current.relative_humidity_2m)
      : avgSlice(hums, startIdx, 6);

  const rawSoil = soils[startIdx];
  const soilMoisturePct =
    rawSoil !== undefined && Number.isFinite(rawSoil) ? Math.round(rawSoil * 100) : null;

  const plains = computePlainsTelemetry({
    raw,
    elevationSamples,
    flood,
    startIdx,
  });

  const conditionLabel = describeWmoCode(current.weather_code);
  const { sprayingWindow, irrigationGuidance } = computeFarmingWindows({
    rainfall24hMm,
    rainfall72hMm,
    windSpeedKmh,
    windGustKmh,
    soilMoisturePct,
  });

  const timeline: WeatherForecastPoint[] = [
    {
      label: 'Now (Live)',
      rainfallMm: Number((current.precipitation ?? 0).toFixed(1)),
      windKmh: Math.round(current.wind_speed_10m ?? 0),
      tempC: Math.round(current.temperature_2m ?? 0),
      humidityPct: Math.round(current.relative_humidity_2m ?? 0),
      kind: 'Confirmed Observation',
    },
    {
      label: '+12h',
      rainfallMm: sumSlice(precips, startIdx + 1, 12),
      windKmh: maxSlice(winds, startIdx + 1, 12),
      tempC: avgSlice(temps, startIdx + 1, 12),
      humidityPct: avgSlice(hums, startIdx + 1, 12),
      kind: 'Model Forecast',
    },
    {
      label: '+24h',
      rainfallMm: sumSlice(precips, startIdx + 13, 12),
      windKmh: maxSlice(winds, startIdx + 13, 12),
      tempC: avgSlice(temps, startIdx + 13, 12),
      humidityPct: avgSlice(hums, startIdx + 13, 12),
      kind: 'Model Forecast',
    },
    {
      label: '+48h',
      rainfallMm: sumSlice(precips, startIdx + 25, 24),
      windKmh: maxSlice(winds, startIdx + 25, 24),
      tempC: avgSlice(temps, startIdx + 25, 24),
      humidityPct: avgSlice(hums, startIdx + 25, 24),
      kind: 'Model Forecast',
    },
    {
      label: '+72h',
      rainfallMm: sumSlice(precips, startIdx + 49, 24),
      windKmh: maxSlice(winds, startIdx + 49, 24),
      tempC: avgSlice(temps, startIdx + 49, 24),
      humidityPct: avgSlice(hums, startIdx + 49, 24),
      kind: 'Model Forecast',
    },
  ];

  const localFloodStatus: WeatherContext['localFloodStatus'] =
    plains.riverBasinStatus === 'High Flood Discharge' ||
    (rainfall24hMm >= 100 && plains.drainageSlopeProfile === 'Flat Basin / Slow Runoff')
      ? 'Active Waterlogging'
      : rainfall24hMm >= 100 ||
        plains.riverBasinStatus === 'Elevated Runoff' ||
        (soilMoisturePct !== null && soilMoisturePct >= 48 && rainfall24hMm >= 35) ||
        (plains.rootZoneMoisturePct !== null && plains.rootZoneMoisturePct >= 52 && rainfall24hMm >= 25)
      ? 'Watch / Rising Water'
      : 'None Reported';

  return {
    scenarioId: 'live',
    scenarioTitle: `Live Field Weather · ${resolvedName}`,
    isSyntheticDemo: false,
    dataSource: `Open-Meteo Live Weather, Elevation & GloFAS Flood Feed (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
    lastUpdated: `${current.time || fetchedAtIso} IST`,
    observationNote: `Live station/grid reading: ${conditionLabel}, ${temperatureC}°C, ${humidityPct}% RH, ${
      current.precipitation ?? 0
    } mm/hr current rain, wind ${windSpeedKmh} km/h (gusts ${windGustKmh} km/h)${
      plains.elevationM !== null ? `, elevation ${plains.elevationM} m (${plains.plainType})` : ''
    }${
      plains.riverDischargeM3s !== null ? `, basin flow ${plains.riverDischargeM3s} m³/s` : ''
    }.`,
    forecastUncertainty:
      '72-hour weather and GloFAS river discharge values are numerical hydrological/meteorological projections; village-level rainfall and field runoff can vary. Always verify official district disaster alerts via IMD Mausam or State SDMA (1070/1077).',
    rainfall24hMm,
    rainfall72hMm,
    windSpeedKmh,
    windGustKmh,
    temperatureC,
    humidityPct,
    soilMoisturePct,
    weatherConditionLabel: conditionLabel,
    coordinates: {
      lat,
      lon,
      resolvedName,
      elevationM: plains.elevationM ?? raw.elevation,
    },
    plains,
    sprayingWindow,
    irrigationGuidance,
    verifiedWarningLabel: null,
    verifiedWarningSource: null,
    localFloodStatus,
    timeline,
  };
}

export function createPendingLiveWeatherContext(farmer: FarmerProfile): WeatherContext {
  const place = [farmer.district, farmer.state].filter(Boolean).join(', ') || 'India';
  return {
    scenarioId: 'live',
    scenarioTitle: `Live Field Weather · ${place}`,
    isSyntheticDemo: false,
    dataSource: 'Connecting to Open-Meteo Live Weather, Elevation & Flood Feeds',
    lastUpdated: new Date().toISOString().slice(0, 16) + ' IST',
    observationNote: 'Fetching live meteorological, plains elevation, soil moisture, and river basin telemetry...',
    forecastUncertainty:
      'Awaiting live numerical weather & plains telemetry response.',
    rainfall24hMm: null,
    rainfall72hMm: null,
    windSpeedKmh: null,
    windGustKmh: null,
    temperatureC: null,
    humidityPct: null,
    soilMoisturePct: null,
    weatherConditionLabel: 'Unknown',
    verifiedWarningLabel: null,
    verifiedWarningSource: null,
    localFloodStatus: 'Unknown',
    timeline: [],
  };
}

export function deriveLiveAlertsAndRecommendations(
  farmer: FarmerProfile,
  weather: WeatherContext,
  language: Language = 'en'
): { alerts: FarmAlert[]; recommendations: AdvisoryRecommendation[] } {
  const cropRaw = farmer.crops[0] || 'Crop';
  const crop = localizeCropName(cropRaw, language);
  const district = localizeLocationText(farmer.district, language);
  const rain24 = weather.rainfall24hMm ?? 0;
  const rain72 = weather.rainfall72hMm ?? 0;
  const wind = weather.windSpeedKmh ?? 0;
  const gust = weather.windGustKmh ?? wind;
  const temp = weather.temperatureC ?? null;
  const humidity = weather.humidityPct ?? null;
  const plains = weather.plains;
  const soil = plains?.topsoilMoisturePct ?? weather.soilMoisturePct ?? null;
  const rootSoil = plains?.rootZoneMoisturePct ?? null;
  const elev = plains?.elevationM ?? null;
  const relief = plains?.relief5kmM ?? null;
  const et0 = plains?.evapotranspirationMmDay ?? null;
  const riverFlow = plains?.riverDischargeM3s ?? null;
  const riverStatus = plains?.riverBasinStatus ?? 'Unavailable';
  const nowIso = new Date().toISOString();

  const windows = computeFarmingWindows(
    {
      rainfall24hMm: weather.rainfall24hMm,
      rainfall72hMm: weather.rainfall72hMm,
      windSpeedKmh: weather.windSpeedKmh,
      windGustKmh: weather.windGustKmh,
      soilMoisturePct: soil,
    },
    language
  );

  const alerts: FarmAlert[] = [];

  if (
    rain24 >= 50 ||
    rain72 >= 90 ||
    gust >= 45 ||
    riverStatus === 'High Flood Discharge' ||
    weather.localFloodStatus === 'Active Waterlogging'
  ) {
    alerts.push({
      id: 'live-alert-hazard',
      title:
        language === 'hi'
          ? `${district} लाइव मौसम व मैदान जलभराव चेतावनी`
          : language === 'te'
          ? `${district} లైవ్ వాతావరణ & మైదాన నీటి నిల్వ హెచ్చరిక`
          : `Live Weather & Plains Runoff Alert for ${district}`,
      priority: rain24 >= 100 || gust >= 65 || riverStatus === 'High Flood Discharge' ? 'Urgent' : 'High',
      reason:
        language === 'hi'
          ? `लाइव पूर्वानुमान (${district}): ${
              temp !== null ? `तापमान ${temp}°से., ` : ''
            }24घं वर्षा ${rain24} मिमी (${rain72} मिमी/72घं), हवा के झोंके ${gust} किमी/घं${
              elev !== null ? `, ऊँचाई ${elev} मी.` : ''
            }${riverFlow !== null ? `, नदी प्रवाह ${riverFlow} मी³/से` : ''}।`
          : language === 'te'
          ? `లైవ్ అంచనా (${district}): ${
              temp !== null ? `ఉష్ణోగ్రత ${temp}°సె., ` : ''
            }24గం వర్షం ${rain24} మి.మీ (${rain72} మి.మీ/72గం), గాలి ఉధృతి ${gust} కి.మీ/గం${
              elev !== null ? `, ఎత్తు ${elev} మీ.` : ''
            }${riverFlow !== null ? `, నది ప్రవాహం ${riverFlow} మీ³/సె` : ''}.`
          : `Live forecast (${district}): ${
              temp !== null ? `temp ${temp}°C, ` : ''
            }${rain24} mm/24h rain (${rain72} mm/72h), gusts ${gust} km/h${
              elev !== null ? `, terrain elevation ${elev} m` : ''
            }${riverFlow !== null ? `, basin river flow ${riverFlow} m³/s` : ''}.`,
      actionRequired:
        language === 'hi'
          ? `${crop} खेत की निकास नालियाँ तुरंत साफ़ करें, पंप व बीज ऊँचे स्थान पर रखें और छिड़काव रोकें।`
          : language === 'te'
          ? `${crop} పొలం నీటి పారుదల కాలువలు వెంటనే శుభ్రం చేసి, పంపులు & విత్తనాలు ఎత్తైన ప్రదేశంలో ఉంచండి.`
          : `Clear ${crop} outflow channels immediately, elevate farm inputs/pumps, and pause all foliar spraying.`,
      requiresHumanConfirmation: true,
      humanConfirmed: false,
      status: 'pending',
      sourceAgent: 'action_alert',
      createdAt: nowIso,
    });
  } else {
    alerts.push({
      id: 'live-alert-routine',
      title:
        language === 'hi'
          ? `${district} लाइव मौसम, तापमान व मैदान निगरानी`
          : language === 'te'
          ? `${district} లైవ్ వాతావరణం, ఉష్ణోగ్రత & మైదాన సూచన`
          : `Live Weather, Temp & Plains Check (${district})`,
      priority: windows.sprayingWindow.status === 'Avoid' ? 'High' : 'Moderate',
      reason:
        language === 'hi'
          ? `${district} लाइव रीडिंग: ${
              temp !== null ? `तापमान ${temp}°से.${humidity !== null ? ` (${humidity}% नमी)` : ''}, ` : ''
            }24घं वर्षा ${rain24} मिमी, हवा ${wind} किमी/घं${
              soil !== null ? `, ऊपरी मिट्टी नमी ${soil}%` : ''
            }${elev !== null ? `, मैदान ऊँचाई ${elev} मी.` : ''}।`
          : language === 'te'
          ? `${district} లైవ్ విలువలు: ${
              temp !== null ? `ఉష్ణోగ్రత ${temp}°సె.${humidity !== null ? ` (${humidity}% తేమ)` : ''}, ` : ''
            }24గం వర్షం ${rain24} మి.మీ, గాలి ${wind} కి.మీ/గం${
              soil !== null ? `, పైమట్టి తేమ ${soil}%` : ''
            }${elev !== null ? `, మైదాన ఎత్తు ${elev} మీ.` : ''}.`
          : `Live (${district}): ${
              temp !== null ? `temp ${temp}°C${humidity !== null ? ` (${humidity}% RH)` : ''}, ` : ''
            }24h rain ${rain24} mm, wind ${wind} km/h${
              soil !== null ? `, topsoil moisture ${soil}%` : ''
            }${elev !== null ? `, elevation ${elev} m` : ''}.`,
      actionRequired: windows.irrigationGuidance.reason,
      requiresHumanConfirmation: false,
      humanConfirmed: true,
      status: 'pending',
      sourceAgent: 'action_alert',
      createdAt: nowIso,
    });
  }

  if (temp !== null && (temp >= 34 || temp <= 12 || (soil !== null && soil <= 20 && rain24 < 5))) {
    const isHeat = temp >= 34;
    const isCold = temp <= 12;
    alerts.push({
      id: 'live-alert-climate-soil',
      title: isHeat
        ? language === 'hi'
          ? `${district} उच्च तापमान और नमी तनाव सलाह (${temp}°से.)`
          : language === 'te'
          ? `${district} అధిక ఉష్ణోగ్రత & తేమ ఒత్తిడి సూచన (${temp}°సె.)`
          : `Heat & Evapotranspiration Watch in ${district} (${temp}°C)`
        : isCold
        ? language === 'hi'
          ? `${district} कम तापमान पाला / ठंड निगरानी (${temp}°से.)`
          : language === 'te'
          ? `${district} తక్కువ ఉష్ణోగ్రత / చలి నిఘా (${temp}°సె.)`
          : `Low Temperature Watch in ${district} (${temp}°C)`
        : language === 'hi'
        ? `${district} कम मिट्टी नमी सिंचाई जांच (${soil}%)`
        : language === 'te'
        ? `${district} తక్కువ నేల తేమ నీటి తడి తనిఖీ (${soil}%)`
        : `Low Topsoil Moisture Check in ${district} (${soil}%)`,
      priority: isHeat && soil !== null && soil <= 20 ? 'High' : 'Moderate',
      reason:
        language === 'hi'
          ? `${district} में लाइव तापमान ${temp}°से.${soil !== null ? `, ऊपरी मिट्टी नमी ${soil}%` : ''}${
              et0 !== null ? `, वाष्पीकरण ${et0} मिमी/दिन` : ''
            } और 24घं वर्षा ${rain24} मिमी है।`
          : language === 'te'
          ? `${district} లో లైవ్ ఉష్ణోగ్రత ${temp}°సె.${soil !== null ? `, పైమట్టి తేమ ${soil}%` : ''}${
              et0 !== null ? `, ఆవిరి నష్టం ${et0} మి.మీ/రోజు` : ''
            } మరియు 24గం వర్షం ${rain24} మి.మీ ఉంది.`
          : `Live readings in ${district} show ${temp}°C temperature${
              soil !== null ? `, ${soil}% topsoil moisture` : ''
            }${et0 !== null ? `, ET₀ ${et0} mm/day` : ''}, and ${rain24} mm/24h rain.`,
      actionRequired:
        language === 'hi'
          ? `${crop} में नमी बनाए रखने के लिए सुबह/शाम हल्की सिंचाई व मल्चिंग जांचें; दोपहर में छिड़काव न करें।`
          : language === 'te'
          ? `${crop} లో తేమ నిలబెట్టడానికి ఉదయం లేదా సాయంత్రం తేలికపాటి నీరు పెట్టండి; మధ్యాహ్నపు ఎండలో పిచికారీ చేయవద్దు.`
          : `Inspect ${crop} root-zone moisture; apply light morning/evening irrigation and avoid midday foliar sprays.`,
      requiresHumanConfirmation: false,
      humanConfirmed: true,
      status: 'pending',
      sourceAgent: 'action_alert',
      createdAt: nowIso,
    });
  }

  const recommendations: AdvisoryRecommendation[] = [
    {
      id: 'live-rec-ops',
      title:
        language === 'hi'
          ? `${crop} के लिए लाइव मौसम व मैदानी क्षेत्र संचालन योजना`
          : language === 'te'
          ? `${crop} పంటకు లైవ్ వాతావరణ & మైదాన ప్రాంత కార్యాచరణ`
          : `Live Weather & Plains Action Plan for ${crop}`,
      crop,
      guidanceType: 'General Agronomic Guidance',
      summary: `${windows.sprayingWindow.reason} ${windows.irrigationGuidance.reason}`,
      steps:
        language === 'hi'
          ? [
              elev !== null
                ? `खेत का स्तर समुद्र तल से ${elev} मी.${relief !== null ? ` (5 किमी ढलान अंतर ${relief} मी.)` : ''} है — निचले किनारों की मेड़ें जाँचें।`
                : 'खेत की मेड़ों और निकास नालियों की स्थिति जांचें।',
              soil !== null || rootSoil !== null
                ? `लाइव मिट्टी नमी: ऊपरी ${soil ?? '—'}%, जड़ क्षेत्र ${rootSoil ?? '—'}%${
                    et0 !== null ? `, वाष्पीकरण ${et0} मिमी/दिन` : ''
                  } — इसी के अनुसार सिंचाई तय करें।`
                : 'सिंचाई से पहले जड़ क्षेत्र की मिट्टी की नमी हाथ से जांचें।',
              `छिड़काव सलाह: ${windows.sprayingWindow.reason}`,
            ]
          : language === 'te'
          ? [
              elev !== null
                ? `పొలం ఎత్తు సముద్ర మట్టం నుండి ${elev} మీ.${relief !== null ? ` (5 కి.మీ వాలు వ్యత్యాసం ${relief} మీ.)` : ''} — లోతట్టు గట్ల వద్ద నీటి ప్రవాహాన్ని తనిఖీ చేయండి.`
                : 'పొలం గట్లు మరియు నీటి పారుదల కాలువలను తనిఖీ చేయండి.',
              soil !== null || rootSoil !== null
                ? `లైవ్ నేల తేమ: పైమట్టి ${soil ?? '—'}%, వేరు లోతు ${rootSoil ?? '—'}%${
                    et0 !== null ? `, ఆవిరి నష్టం ${et0} మి.మీ/రోజు` : ''
                  } — దీనికి అనుగుణంగా తడి ఇవ్వండి.`
                : 'నీరు పెట్టే ముందు వేరు లోతు నేల తేమను పరిశీలించండి.',
              `పిచికారీ ప్రణాళిక: ${windows.sprayingWindow.reason}`,
            ]
          : [
              elev !== null
                ? `Measured field elevation is ${elev} m${relief !== null ? ` (5 km terrain relief ${relief} m)` : ''} — match bund outlet checks to local plain runoff slope.`
                : 'Inspect field bunds and outflow channels based on local terrain slope.',
              soil !== null || rootSoil !== null
                ? `Live soil moisture profile: topsoil ${soil ?? '—'}%, root-zone ${rootSoil ?? '—'}%${
                    et0 !== null ? `, crop ET₀ ${et0} mm/day` : ''
                  } — schedule irrigation strictly against measured moisture deficit.`
                : 'Check root-zone moisture manually before scheduling irrigation.',
              `Spraying window: ${windows.sprayingWindow.reason}`,
            ],
      sourceAgent: 'farm_advisory',
      createdAt: nowIso,
      acknowledged: false,
    },
  ];

  return { alerts, recommendations };
}

