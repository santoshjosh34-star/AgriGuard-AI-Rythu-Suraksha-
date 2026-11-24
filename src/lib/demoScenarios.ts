import type { DemoScenarioDefinition } from '../types/agriguard.ts';

export const DEMO_SCENARIOS: DemoScenarioDefinition[] = [
  {
    id: 'heavy-rainfall-paddy',
    title: 'Scenario 1: Heavy Rainfall Warning for a Paddy Farmer',
    shortLabel: 'Heavy Rainfall · Paddy',
    summary:
      'Synthetic test scenario: 145 mm/24h rainfall forecast over East Godavari alluvial delta during flowering stage paddy.',
    defaultQuery:
      'Heavy rain is forecast for my flowering paddy field tomorrow. Assess my Kisan Rakshak risk level, weather uncertainty, and give me a practical before/during/after protection plan.',
    recommendedFarmerPatch: {
      state: 'Andhra Pradesh',
      district: 'East Godavari',
      location: 'Ramachandrapuram Mandal',
      crops: ['Paddy (MTU-1010)'],
      farmSizeAcres: 4.5,
      soilType: 'Alluvial',
      growthStage: 'Flowering / Panicle Initiation',
      drainageType: 'Low-Lying / Basin',
      nearCoastOrRiver: false,
    },
    weather: {
      scenarioId: 'heavy-rainfall-paddy',
      scenarioTitle: 'Scenario 1: Heavy Rainfall Warning (Synthetic Test Data)',
      isSyntheticDemo: true,
      dataSource: 'AgriGuard Synthetic Test Scenario #1 (Simulated District Weather Feed)',
      lastUpdated: '2026-11-22 05:30 IST (Synthetic Timestamp)',
      observationNote:
        'Past 6h observation: 18 mm light rain recorded (simulated). Next 24–72h values are model forecasts, not guaranteed measurements.',
      forecastUncertainty:
        'Rainfall accumulation may vary by ±25–35 mm across mandals depending on localized convective cloud bands.',
      rainfall24hMm: 145,
      rainfall72hMm: 225,
      windSpeedKmh: 38,
      windGustKmh: 54,
      temperatureC: 26,
      humidityPct: 91,
      verifiedWarningLabel: 'Synthetic Orange Advisory: Heavy to Very Heavy Rain',
      verifiedWarningSource: 'Synthetic Demo IMD-Style Test Bulletin (Not Live)',
      localFloodStatus: 'Watch / Rising Water',
      timeline: [
        { label: '-6h (Obs)', rainfallMm: 18, windKmh: 16, tempC: 28, humidityPct: 84, kind: 'Confirmed Observation' },
        { label: '+12h', rainfallMm: 62, windKmh: 34, tempC: 26, humidityPct: 90, kind: 'Model Forecast' },
        { label: '+24h', rainfallMm: 83, windKmh: 38, tempC: 25, humidityPct: 93, kind: 'Model Forecast' },
        { label: '+48h', rainfallMm: 52, windKmh: 28, tempC: 26, humidityPct: 89, kind: 'Model Forecast' },
        { label: '+72h', rainfallMm: 28, windKmh: 18, tempC: 28, humidityPct: 82, kind: 'Model Forecast' },
      ],
    },
  },
  {
    id: 'cyclone-coastal',
    title: 'Scenario 2: Cyclone Approaching a Coastal Farming Region',
    shortLabel: 'Coastal Cyclone Threat',
    summary:
      'Synthetic test scenario: Severe cyclonic winds (92 km/h, gusts 115 km/h) and 210 mm rain approaching coastal Krishna/Konaseema farmland.',
    defaultQuery:
      'A cyclone is forecast to approach our coastal district in 36 hours. My paddy is nearing pre-harvest maturity. What is my Kisan Rakshak risk category and immediate safety and crop protection plan?',
    recommendedFarmerPatch: {
      state: 'Andhra Pradesh',
      district: 'Konaseema',
      location: 'Amalapuram Coastal Belt',
      crops: ['Paddy (BPT-5204)', 'Coconut'],
      farmSizeAcres: 6.0,
      soilType: 'Coastal Sandy',
      growthStage: 'Maturity / Pre-Harvest',
      drainageType: 'Natural Slope',
      nearCoastOrRiver: true,
    },
    weather: {
      scenarioId: 'cyclone-coastal',
      scenarioTitle: 'Scenario 2: Coastal Cyclone Approach (Synthetic Test Data)',
      isSyntheticDemo: true,
      dataSource: 'AgriGuard Synthetic Test Scenario #2 (Simulated Coastal Cyclone Track)',
      lastUpdated: '2026-11-22 05:30 IST (Synthetic Timestamp)',
      observationNote:
        'Current coastal observation: 24 km/h squally breeze, overcast sky (simulated). Landfall track cone carries directional uncertainty.',
      forecastUncertainty:
        'Cyclone landfall point may shift by 40–70 km; wind gusts and surge heights depend on exact landfall timing relative to high tide.',
      rainfall24hMm: 210,
      rainfall72hMm: 310,
      windSpeedKmh: 92,
      windGustKmh: 115,
      temperatureC: 25,
      humidityPct: 95,
      verifiedWarningLabel: 'Synthetic Red Cyclone Alert: Gale Winds & Storm Surge Risk',
      verifiedWarningSource: 'Synthetic Demo Cyclone Track Test (Not Live Official Warning)',
      localFloodStatus: 'Watch / Rising Water',
      timeline: [
        { label: '-6h (Obs)', rainfallMm: 12, windKmh: 24, tempC: 27, humidityPct: 85, kind: 'Confirmed Observation' },
        { label: '+12h', rainfallMm: 68, windKmh: 58, tempC: 26, humidityPct: 92, kind: 'Model Forecast' },
        { label: '+24h', rainfallMm: 142, windKmh: 92, tempC: 24, humidityPct: 96, kind: 'Model Forecast' },
        { label: '+48h', rainfallMm: 76, windKmh: 64, tempC: 25, humidityPct: 91, kind: 'Model Forecast' },
        { label: '+72h', rainfallMm: 24, windKmh: 26, tempC: 28, humidityPct: 83, kind: 'Model Forecast' },
      ],
    },
  },
  {
    id: 'waterlogging-flood',
    title: 'Scenario 3: Waterlogging and Flood Risk Affecting Agricultural Land',
    shortLabel: 'Waterlogging & Flood',
    summary:
      'Synthetic test scenario: Prolonged standing water in low-lying black cotton soil with canal overflow and 115 mm further rain forecast.',
    defaultQuery:
      'Water is already standing in our low-lying black cotton fields after canal backflow, and more rain is forecast. Check crop rot risk, Kisan Rakshak readiness, and urgent drainage tasks.',
    recommendedFarmerPatch: {
      state: 'Telangana',
      district: 'Khammam',
      location: 'Madhira Basin Area',
      crops: ['Cotton', 'Chilli'],
      farmSizeAcres: 3.5,
      soilType: 'Black Cotton (Vertisol)',
      growthStage: 'Vegetative',
      drainageType: 'Low-Lying / Basin',
      nearCoastOrRiver: true,
    },
    weather: {
      scenarioId: 'waterlogging-flood',
      scenarioTitle: 'Scenario 3: Waterlogging & Flood Risk (Synthetic Test Data)',
      isSyntheticDemo: true,
      dataSource: 'AgriGuard Synthetic Test Scenario #3 (Simulated Basin Hydrology Feed)',
      lastUpdated: '2026-11-22 05:30 IST (Synthetic Timestamp)',
      observationNote:
        'Confirmed field report (simulated): 48h cumulative rain 96 mm + active waterlogging along lower bunds.',
      forecastUncertainty:
        'Upstream barrage release timing is unconfirmed; submergence duration could extend 24–48h if backflow persists.',
      rainfall24hMm: 88,
      rainfall72hMm: 168,
      windSpeedKmh: 26,
      windGustKmh: 36,
      temperatureC: 27,
      humidityPct: 92,
      verifiedWarningLabel: 'Synthetic Flood Watch: Basin Waterlogging & Drainage Stress',
      verifiedWarningSource: 'Synthetic Demo Hydrology Scenario (Not Live)',
      localFloodStatus: 'Active Waterlogging',
      timeline: [
        { label: '-6h (Obs)', rainfallMm: 34, windKmh: 20, tempC: 27, humidityPct: 91, kind: 'Confirmed Observation' },
        { label: '+12h', rainfallMm: 46, windKmh: 26, tempC: 26, humidityPct: 93, kind: 'Model Forecast' },
        { label: '+24h', rainfallMm: 42, windKmh: 24, tempC: 26, humidityPct: 92, kind: 'Model Forecast' },
        { label: '+48h', rainfallMm: 48, windKmh: 20, tempC: 27, humidityPct: 90, kind: 'Model Forecast' },
        { label: '+72h', rainfallMm: 32, windKmh: 16, tempC: 28, humidityPct: 86, kind: 'Model Forecast' },
      ],
    },
  },
];

export function getScenarioById(id: string): DemoScenarioDefinition {
  return DEMO_SCENARIOS.find((s) => s.id === id) ?? DEMO_SCENARIOS[0];
}
