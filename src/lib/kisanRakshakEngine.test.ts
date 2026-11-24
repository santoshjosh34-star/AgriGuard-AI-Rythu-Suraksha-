import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assessKisanRakshakRisk,
  classifyRiskLevel,
  validateRiskInputs,
} from './kisanRakshakEngine.ts';
import { DEMO_SCENARIOS } from './demoScenarios.ts';
import type { FarmerProfile, WeatherContext } from '../types/agriguard.ts';

const baseFarmer: FarmerProfile = {
  name: 'Ramesh Rao',
  state: 'Andhra Pradesh',
  district: 'East Godavari',
  location: 'Ramachandrapuram',
  crops: ['Paddy'],
  farmSizeAcres: 4,
  soilType: 'Alluvial',
  growthStage: 'Flowering / Panicle Initiation',
  preferredLanguage: 'te',
  drainageType: 'Low-Lying / Basin',
  nearCoastOrRiver: false,
};

test('classifyRiskLevel maps score thresholds accurately', () => {
  assert.equal(classifyRiskLevel(15), 'Low');
  assert.equal(classifyRiskLevel(28), 'Moderate');
  assert.equal(classifyRiskLevel(52), 'High');
  assert.equal(classifyRiskLevel(75), 'Critical');
});

test('validateRiskInputs rejects empty required farmer fields and missing weather signals', () => {
  const res = validateRiskInputs(
    { state: '', district: 'G', crops: [] },
    { rainfall24hMm: null, rainfall72hMm: null, windSpeedKmh: null, verifiedWarningLabel: null }
  );
  assert.equal(res.valid, false);
  assert.ok(res.errors.state);
  assert.ok(res.errors.district);
  assert.ok(res.errors.crops);
  assert.ok(res.errors.weather);
});

test('validateRiskInputs rejects out-of-range rainfall and wind speeds', () => {
  const res = validateRiskInputs(baseFarmer, {
    rainfall24hMm: 1500,
    windSpeedKmh: -10,
  });
  assert.equal(res.valid, false);
  assert.ok(res.errors.rainfall24hMm);
  assert.ok(res.errors.windSpeedKmh);
});

test('Scenario 2 coastal cyclone produces Critical risk with phased plans and verified contacts', () => {
  const cyclone = DEMO_SCENARIOS.find((s) => s.id === 'cyclone-coastal');
  assert.ok(cyclone);
  const cycloneFarmer: FarmerProfile = {
    ...baseFarmer,
    ...cyclone.recommendedFarmerPatch,
  };
  const assessment = assessKisanRakshakRisk(cycloneFarmer, cyclone.weather);
  assert.equal(assessment.riskLevel, 'Critical');
  assert.equal(assessment.isSyntheticData, true);
  assert.equal(assessment.phasePlans.length, 3);
  assert.ok(assessment.verifiedContacts.some((c) => c.number === '112'));
  assert.ok(assessment.verifiedContacts.some((c) => c.number === '1800-180-1551'));
});

test('missing soil, drainage, and weather data reduces confidence and lists missingData explicitly', () => {
  const sparseFarmer: FarmerProfile = {
    ...baseFarmer,
    soilType: 'Unknown',
    drainageType: 'Unknown',
  };
  const sparseWeather: WeatherContext = {
    scenarioId: 'custom',
    scenarioTitle: 'Custom User Input',
    isSyntheticDemo: false,
    dataSource: 'Farmer Field Input',
    lastUpdated: '2026-11-22T05:30:00Z',
    observationNote: 'Manual entry',
    forecastUncertainty: 'No official forecast attached',
    rainfall24hMm: 30,
    rainfall72hMm: null,
    windSpeedKmh: null,
    windGustKmh: null,
    temperatureC: 29,
    humidityPct: 80,
    verifiedWarningLabel: null,
    verifiedWarningSource: null,
    localFloodStatus: 'Unknown',
    timeline: [],
  };
  const assessment = assessKisanRakshakRisk(sparseFarmer, sparseWeather);
  assert.ok(assessment.missingData.length >= 4);
  assert.ok(assessment.confidencePercent < 70);
});

test('assessKisanRakshakRisk localizes risk factors, checklist, contacts, and safety disclaimer into Hindi and Telugu', () => {
  const cyclone = DEMO_SCENARIOS.find((s) => s.id === 'cyclone-coastal');
  assert.ok(cyclone);
  const cycloneFarmer: FarmerProfile = {
    ...baseFarmer,
    ...cyclone.recommendedFarmerPatch,
  };

  const hiAssessment = assessKisanRakshakRisk(cycloneFarmer, cyclone.weather, 'hi');
  assert.equal(hiAssessment.riskLevel, 'Critical');
  assert.ok(hiAssessment.mainRiskFactors.some((f) => /[\u0900-\u097F]/.test(f.factor)));
  assert.ok(hiAssessment.checklist.every((item) => /[\u0900-\u097F]/.test(item.label)));
  assert.ok(/[\u0900-\u097F]/.test(hiAssessment.safetyDisclaimer));
  for (const txt of [
    hiAssessment.dataSourceSummary,
    hiAssessment.safetyDisclaimer,
    ...hiAssessment.mainRiskFactors.flatMap((f) => [f.factor, f.detail]),
    ...hiAssessment.recommendedProtectiveActions,
    ...hiAssessment.phasePlans.flatMap((p) => p.steps),
    ...hiAssessment.checklist.map((c) => c.label),
    ...hiAssessment.verifiedContacts.flatMap((c) => [c.agency, c.scope, c.notes]),
  ]) {
    assert.equal(/[A-Za-z]/.test(txt), false, `Unexpected ASCII letters in Hindi output: ${txt}`);
  }

  const teAssessment = assessKisanRakshakRisk(cycloneFarmer, cyclone.weather, 'te');
  assert.equal(teAssessment.riskLevel, 'Critical');
  assert.ok(teAssessment.mainRiskFactors.some((f) => /[\u0C00-\u0C7F]/.test(f.factor)));
  assert.ok(teAssessment.checklist.every((item) => /[\u0C00-\u0C7F]/.test(item.label)));
  assert.ok(/[\u0C00-\u0C7F]/.test(teAssessment.safetyDisclaimer));
  for (const txt of [
    teAssessment.dataSourceSummary,
    teAssessment.safetyDisclaimer,
    ...teAssessment.mainRiskFactors.flatMap((f) => [f.factor, f.detail]),
    ...teAssessment.recommendedProtectiveActions,
    ...teAssessment.phasePlans.flatMap((p) => p.steps),
    ...teAssessment.checklist.map((c) => c.label),
    ...teAssessment.verifiedContacts.flatMap((c) => [c.agency, c.scope, c.notes]),
  ]) {
    assert.equal(/[A-Za-z]/.test(txt), false, `Unexpected ASCII letters in Telugu output: ${txt}`);
  }

  const hiValidation = validateRiskInputs({ state: '', district: '', crops: [] }, { rainfall24hMm: 1500 }, 'hi');
  assert.equal(hiValidation.valid, false);
  assert.ok(/[\u0900-\u097F]/.test(hiValidation.errors.rainfall24hMm));
});

test('assessKisanRakshakRisk incorporates live plains relief and GloFAS flood discharge in en, hi, and te cleanly', () => {
  const liveWithPlains: WeatherContext = {
    scenarioId: 'live',
    scenarioTitle: 'Live Field Weather · East Godavari',
    isSyntheticDemo: false,
    dataSource: 'Open-Meteo Live Weather, Elevation & GloFAS Flood Feed',
    lastUpdated: '2026-11-23T06:00 IST',
    observationNote: 'Live station reading',
    forecastUncertainty: '72h model projection',
    rainfall24hMm: 64,
    rainfall72hMm: 110,
    windSpeedKmh: 28,
    windGustKmh: 44,
    temperatureC: 27,
    humidityPct: 86,
    soilMoisturePct: 48,
    verifiedWarningLabel: null,
    verifiedWarningSource: null,
    localFloodStatus: 'Active Waterlogging',
    plains: {
      elevationM: 8,
      surroundingMinElevationM: 5,
      surroundingMaxElevationM: 10,
      relief5kmM: 5,
      plainType: 'Low-Lying Coastal / Delta Plain',
      drainageSlopeProfile: 'Flat Basin / Slow Runoff',
      topsoilMoisturePct: 48,
      rootZoneMoisturePct: 52,
      soilTempC: 25,
      evapotranspirationMmDay: 3.6,
      surfacePressureHpa: 1007,
      rainProbability24hPct: 88,
      riverDischargeM3s: 24.5,
      riverDischargeMax4dM3s: 30.2,
      riverBasinStatus: 'High Flood Discharge',
    },
    timeline: [],
  };

  const enAssessment = assessKisanRakshakRisk(baseFarmer, liveWithPlains, 'en');
  assert.ok(enAssessment.riskScore >= 48);
  assert.ok(enAssessment.mainRiskFactors.some((f) => f.detail.includes('24.5 m³/s')));

  for (const lang of ['hi', 'te'] as const) {
    const localAssessment = assessKisanRakshakRisk(baseFarmer, liveWithPlains, lang);
    for (const txt of [
      localAssessment.dataSourceSummary,
      localAssessment.safetyDisclaimer,
      ...localAssessment.mainRiskFactors.flatMap((f) => [f.factor, f.detail]),
      ...localAssessment.recommendedProtectiveActions,
      ...localAssessment.missingData,
    ]) {
      assert.equal(
        /[A-Za-z]/.test(txt),
        false,
        `Unexpected ASCII letters in ${lang} plains assessment: ${txt}`
      );
    }
  }
});

