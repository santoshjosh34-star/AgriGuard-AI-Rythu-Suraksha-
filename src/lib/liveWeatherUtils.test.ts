import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INDIAN_LOCATION_PRESETS,
  canonicalizeLocationForGeocode,
  findLocationPresetMatch,
  localizeLocationText,
} from './domainTranslations.ts';
import { TRANSLATIONS } from './translations.ts';
import {
  buildOpenMeteoWeatherContext,
  computeFarmingWindows,
  computePlainsTelemetry,
  createPendingLiveWeatherContext,
  deriveLiveAlertsAndRecommendations,
  describeWmoCode,
} from './liveWeatherUtils.ts';
import type { FarmerProfile } from '../types/agriguard.ts';

test('describeWmoCode maps common meteorological codes accurately', () => {
  assert.equal(describeWmoCode(0), 'Clear Sky');
  assert.equal(describeWmoCode(63), 'Rain');
  assert.equal(describeWmoCode(95), 'Thunderstorm / Squall');
});

test('computeFarmingWindows marks Avoid during high gusts or heavy rain and Safe in calm dry weather', () => {
  const windy = computeFarmingWindows({
    rainfall24hMm: 18,
    rainfall72hMm: 45,
    windSpeedKmh: 22,
    windGustKmh: 34,
    soilMoisturePct: 44,
  });
  assert.equal(windy.sprayingWindow.status, 'Avoid');
  assert.equal(windy.irrigationGuidance.status, 'Drainage Priority');

  const calm = computeFarmingWindows({
    rainfall24hMm: 0,
    rainfall72hMm: 2,
    windSpeedKmh: 7,
    windGustKmh: 12,
    soilMoisturePct: 19,
  });
  assert.equal(calm.sprayingWindow.status, 'Safe');
  assert.equal(calm.irrigationGuidance.status, 'Irrigate');
});

test('buildOpenMeteoWeatherContext transforms live payload cleanly with isSyntheticDemo=false', () => {
  const times = Array.from({ length: 80 }, (_, idx) => `2026-11-22T${String(idx % 24).padStart(2, '0')}:00`);
  const ctx = buildOpenMeteoWeatherContext({
    lat: 16.96,
    lon: 82.24,
    resolvedName: 'Kakinada, Andhra Pradesh',
    fetchedAtIso: '2026-11-22T14:00:00Z',
    elevationSamples: [10, 6, 5, 6, 7],
    flood: {
      daily: {
        time: ['2026-11-22', '2026-11-23'],
        river_discharge: [18.5, 21.0],
        river_discharge_mean: [8.0, 8.0],
        river_discharge_max: [24.0, 26.0],
      },
    },
    raw: {
      elevation: 10,
      current: {
        time: times[0],
        temperature_2m: 26,
        relative_humidity_2m: 85,
        precipitation: 0,
        wind_speed_10m: 6,
        wind_gusts_10m: 14,
        weather_code: 1,
        surface_pressure: 1012.8,
      },
      hourly: {
        time: times,
        precipitation: Array(80).fill(0.5),
        precipitation_probability: Array(80).fill(65),
        wind_speed_10m: Array(80).fill(8),
        temperature_2m: Array(80).fill(27),
        relative_humidity_2m: Array(80).fill(80),
        soil_moisture_0_to_7cm: Array(80).fill(0.32),
        soil_moisture_7_to_28cm: Array(80).fill(0.39),
        soil_temperature_0cm: Array(80).fill(25.2),
      },
      daily: {
        et0_fao_evapotranspiration_sum: [4.3],
      },
    },
  });

  assert.equal(ctx.scenarioId, 'live');
  assert.equal(ctx.isSyntheticDemo, false);
  assert.equal(ctx.rainfall24hMm, 12);
  assert.equal(ctx.rainfall72hMm, 36);
  assert.equal(ctx.soilMoisturePct, 32);
  assert.equal(ctx.timeline.length, 5);
  assert.equal(ctx.timeline[0].kind, 'Confirmed Observation');
  assert.equal(ctx.sprayingWindow?.status, 'Avoid'); // 12mm/24h rain >= 10mm threshold
  assert.ok(ctx.plains);
  assert.equal(ctx.plains.elevationM, 10);
  assert.equal(ctx.plains.relief5kmM, 5);
  assert.equal(ctx.plains.plainType, 'Low-Lying Coastal / Delta Plain');
  assert.equal(ctx.plains.drainageSlopeProfile, 'Flat Basin / Slow Runoff');
  assert.equal(ctx.plains.rootZoneMoisturePct, 39);
  assert.equal(ctx.plains.evapotranspirationMmDay, 4.3);
  assert.equal(ctx.plains.surfacePressureHpa, 1013);
  assert.equal(ctx.plains.rainProbability24hPct, 65);
  assert.equal(ctx.plains.riverDischargeM3s, 18.5);
  assert.equal(ctx.plains.riverBasinStatus, 'High Flood Discharge');
  assert.equal(ctx.localFloodStatus, 'Active Waterlogging');
});

test('computeFarmingWindows localizes advisory reasons in Hindi and Telugu while keeping canonical status keys', () => {
  const hiWindows = computeFarmingWindows(
    {
      rainfall24hMm: 18,
      rainfall72hMm: 45,
      windSpeedKmh: 22,
      windGustKmh: 34,
      soilMoisturePct: 44,
    },
    'hi'
  );
  assert.equal(hiWindows.sprayingWindow.status, 'Avoid');
  assert.ok(/[\u0900-\u097F]/.test(hiWindows.sprayingWindow.reason));
  assert.ok(/[\u0900-\u097F]/.test(hiWindows.irrigationGuidance.reason));

  const teWindows = computeFarmingWindows(
    {
      rainfall24hMm: 0,
      rainfall72hMm: 2,
      windSpeedKmh: 7,
      windGustKmh: 12,
      soilMoisturePct: 19,
    },
    'te'
  );
  assert.equal(teWindows.sprayingWindow.status, 'Safe');
  assert.equal(teWindows.irrigationGuidance.status, 'Irrigate');
  assert.ok(/[\u0C00-\u0C7F]/.test(teWindows.sprayingWindow.reason));
  assert.ok(/[\u0C00-\u0C7F]/.test(teWindows.irrigationGuidance.reason));
});

test('localizeLocationText normalizes Unicode diacritics from geocoding feeds into pure Hindi and Telugu', () => {
  const te = localizeLocationText('Rāmachandrapuram, Andhra Pradesh', 'te');
  const hi = localizeLocationText('Rāmachandrapuram, Andhra Pradesh', 'hi');
  assert.equal(te, 'రామచంద్రపురం, ఆంధ్రప్రదేశ్');
  assert.equal(hi, 'रामचंद्रपुरम, आंध्र प्रदेश');
  assert.equal(/[A-Za-z]/.test(te), false);
  assert.equal(/[A-Za-z]/.test(hi), false);
});

test('createPendingLiveWeatherContext and deriveLiveAlertsAndRecommendations stay strictly live and pure-script localized', () => {
  const farmer: FarmerProfile = {
    name: 'Ramesh Rao',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    location: 'Ramachandrapuram Mandal',
    crops: ['Paddy (MTU-1010)'],
    farmSizeAcres: 4.5,
    soilType: 'Alluvial',
    growthStage: 'Flowering / Panicle Initiation',
    preferredLanguage: 'en',
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: false,
  };

  const pending = createPendingLiveWeatherContext(farmer);
  assert.equal(pending.scenarioId, 'live');
  assert.equal(pending.isSyntheticDemo, false);

  const plains = computePlainsTelemetry({
    raw: {
      current: { time: '2026-11-22T06:00', surface_pressure: 1009 },
      hourly: {
        soil_moisture_0_to_7cm: [0.36],
        soil_moisture_7_to_28cm: [0.42],
        soil_temperature_0cm: [24],
        precipitation_probability: [80],
      },
      daily: { et0_fao_evapotranspiration_sum: [3.8] },
    },
    elevationSamples: [12, 10, 9, 11, 13],
    flood: {
      daily: {
        time: ['2026-11-22'],
        river_discharge: [12.8],
        river_discharge_mean: [10.0],
        river_discharge_max: [13.5],
      },
    },
    startIdx: 0,
  });
  assert.equal(plains.riverBasinStatus, 'Elevated Runoff');

  const liveWeather = {
    ...pending,
    rainfall24hMm: 62,
    rainfall72hMm: 105,
    windSpeedKmh: 28,
    windGustKmh: 48,
    soilMoisturePct: 36,
    plains,
  };

  for (const lang of ['hi', 'te'] as const) {
    const derived = deriveLiveAlertsAndRecommendations(farmer, liveWeather, lang);
    assert.ok(derived.alerts.length >= 1);
    assert.ok(derived.recommendations.length >= 1);
    for (const txt of [
      ...derived.alerts.flatMap((a) => [a.title, a.reason, a.actionRequired]),
      ...derived.recommendations.flatMap((r) => [r.title, r.crop, r.summary, ...r.steps]),
    ]) {
      assert.equal(/[A-Za-z]/.test(txt), false, `Unexpected ASCII in live ${lang} item: ${txt}`);
    }
  }
});

test('canonicalizeLocationForGeocode maps localized Hindi/Telugu location names to English and presets stay pure-script', () => {
  assert.equal(canonicalizeLocationForGeocode('पूर्वी गोदावरी'), 'East Godavari');
  assert.equal(canonicalizeLocationForGeocode('తూర్పు గోదావరి'), 'East Godavari');
  assert.equal(canonicalizeLocationForGeocode('ఖమ్మం'), 'Khammam');
  assert.equal(canonicalizeLocationForGeocode('लुधियाना'), 'Ludhiana');
  assert.equal(canonicalizeLocationForGeocode('रामचंद्रपुरम मंडल'), 'Ramachandrapuram Mandal');
  assert.equal(canonicalizeLocationForGeocode('माधोपुर गाँव'), 'माधोपुर');

  assert.ok(INDIAN_LOCATION_PRESETS.length >= 12);
  for (const preset of INDIAN_LOCATION_PRESETS) {
    for (const lang of ['hi', 'te'] as const) {
      assert.equal(
        /[A-Za-z]/.test(`${preset.state[lang]} ${preset.district[lang]} ${preset.location[lang]}`),
        false,
        `Unexpected ASCII in ${lang} preset ${preset.id}`
      );
    }
  }

  for (const lang of ['hi', 'te'] as const) {
    for (const val of [
      ...Object.values(TRANSLATIONS[lang].overview),
      ...Object.values(TRANSLATIONS[lang].myFarm),
    ]) {
      assert.equal(/[A-Za-z]/.test(val), false, `Unexpected ASCII in ${lang} UI copy: ${val}`);
    }
  }
});

test('deriveLiveAlertsAndRecommendations captures temperature and produces location-specific heat/soil alerts', () => {
  const kurnoolFarmer: FarmerProfile = {
    name: 'Ramesh Rao',
    state: 'Andhra Pradesh',
    district: 'Kurnool',
    location: 'Adoni',
    crops: ['Cotton'],
    farmSizeAcres: 5,
    soilType: 'Black Cotton (Vertisol)',
    growthStage: 'Flowering / Panicle Initiation',
    preferredLanguage: 'en',
    drainageType: 'Natural Slope',
    nearCoastOrRiver: false,
  };

  const hotDryWeather = {
    ...createPendingLiveWeatherContext(kurnoolFarmer),
    temperatureC: 37,
    humidityPct: 28,
    rainfall24hMm: 0,
    rainfall72hMm: 0,
    windSpeedKmh: 12,
    windGustKmh: 20,
    soilMoisturePct: 14,
    localFloodStatus: 'None Reported' as const,
  };

  const enDerived = deriveLiveAlertsAndRecommendations(kurnoolFarmer, hotDryWeather, 'en');
  assert.equal(enDerived.alerts.length, 2);
  assert.ok(enDerived.alerts[0].reason.includes('37°C'));
  assert.ok(enDerived.alerts[0].reason.includes('Kurnool'));
  assert.ok(enDerived.alerts[1].title.includes('37°C'));

  for (const lang of ['hi', 'te'] as const) {
    const locDerived = deriveLiveAlertsAndRecommendations(kurnoolFarmer, hotDryWeather, lang);
    assert.equal(locDerived.alerts.length, 2);
    for (const a of locDerived.alerts) {
      assert.equal(/[A-Za-z]/.test(`${a.title} ${a.reason} ${a.actionRequired}`), false);
    }
  }
});

test('Bapatla district, Repalle, Karumuru (Pallekona), and Chirakalavaripalem (Nagaram) resolve without collision', () => {
  const expectedIds = [
    'bapatla-district-ap',
    'repalle-bapatla-ap',
    'karumuru-pallekona-ap',
    'chirakalavaripalem-nagaram-ap',
  ];

  for (const id of expectedIds) {
    const preset = INDIAN_LOCATION_PRESETS.find((p) => p.id === id);
    assert.ok(preset, `Expected preset ${id} to exist`);
    assert.equal(typeof preset.lat, 'number');
    assert.equal(typeof preset.lon, 'number');

    const matchedEn = findLocationPresetMatch({
      state: preset.state.en,
      district: preset.district.en,
      location: preset.location.en,
    });
    assert.equal(matchedEn?.id, id);

    const matchedTe = findLocationPresetMatch({
      state: preset.state.te,
      district: preset.district.te,
      location: preset.location.te,
    });
    assert.equal(matchedTe?.id, id);
  }

  // Short form matching without breaking between Bapatla villages
  assert.equal(
    findLocationPresetMatch({ district: 'Bapatla', location: 'Karumuru' })?.id,
    'karumuru-pallekona-ap'
  );
  assert.equal(
    findLocationPresetMatch({ district: 'Bapatla', location: 'Chirakalavaripalem' })?.id,
    'chirakalavaripalem-nagaram-ap'
  );
  assert.equal(
    localizeLocationText('Chirakalavaripalem (Nagaram), Bapatla, Andhra Pradesh', 'te'),
    'చిరకాలవారిపాలెం (నగరం), బాపట్ల, ఆంధ్రప్రదేశ్'
  );
  assert.equal(
    localizeLocationText('Karumuru (Pallekona), Bapatla, Andhra Pradesh', 'hi'),
    'करुमुरु (पल्लेकोना), बापटला, आंध्र प्रदेश'
  );

  // Branding & Kisan-Rakshak dictionary checks
  assert.equal(TRANSLATIONS.en.brandName, 'AgriGuard-AI');
  assert.equal(TRANSLATIONS.en.subBrandName, 'Rythu Suraksha');
  assert.equal(TRANSLATIONS.en.nav['kisan-rakshak'], 'Kisan-Rakshak');
  assert.equal(/[A-Za-z]/.test(TRANSLATIONS.hi.subBrandName), false);
  assert.equal(/[A-Za-z]/.test(TRANSLATIONS.te.subBrandName), false);
});


