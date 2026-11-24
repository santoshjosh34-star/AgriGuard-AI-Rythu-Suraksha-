import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_SCENARIOS } from './demoScenarios';
import { assessKisanRakshakRisk } from './kisanRakshakEngine';
import {
  buildDoubtContextSnippet,
  clampSoftVolume,
  hasTargetLanguageScript,
  navSectionToDoubtTopic,
  pickBestVoiceForLanguage,
  prepareTextForTts,
  sanitizeHighlightedSelection,
} from './voiceDoubtUtils';
import type { FarmerProfile } from '../types/agriguard';

const SAMPLE_FARMER: FarmerProfile = {
  name: 'Ramesh Rao',
  state: 'Andhra Pradesh',
  district: 'East Godavari',
  location: 'Ramachandrapuram',
  crops: ['Paddy (MTU-1010)'],
  farmSizeAcres: 4.5,
  soilType: 'Alluvial',
  growthStage: 'Flowering / Panicle Initiation',
  preferredLanguage: 'en',
  drainageType: 'Low-Lying / Basin',
  nearCoastOrRiver: false,
};

test('pickBestVoiceForLanguage prefers exact IN locale and softer natural voices', () => {
  const voices = [
    { lang: 'en-US', name: 'US' },
    { lang: 'hi-IN', name: 'Hindi India' },
    { lang: 'en-IN', name: 'English India' },
    { lang: 'te-IN', name: 'Telugu Standard' },
    { lang: 'te-IN', name: 'Microsoft Shruti Natural - Telugu (India)' },
  ];
  assert.equal(
    pickBestVoiceForLanguage(voices, 'te')?.name,
    'Microsoft Shruti Natural - Telugu (India)'
  );
  assert.equal(pickBestVoiceForLanguage(voices, 'hi')?.name, 'Hindi India');
  assert.equal(pickBestVoiceForLanguage(voices, 'en')?.name, 'English India');
});

test('hasTargetLanguageScript validates Telugu and Hindi script coverage accurately', () => {
  assert.equal(
    hasTargetLanguageScript('మీ పొలంలో నీటి పారుదల కాలువలు శుభ్రం చేయండి.', 'te'),
    true
  );
  assert.equal(hasTargetLanguageScript('Clear drainage channels before rain.', 'te'), false);
  assert.equal(
    hasTargetLanguageScript('Heavy rainfall warning: clear drainage channels in తెలుగు.', 'te'),
    false
  );
  assert.equal(
    hasTargetLanguageScript('अपने खेत की जल निकासी नालियां साफ रखें।', 'hi'),
    true
  );
  assert.equal(hasTargetLanguageScript('Clear drainage channels before rain.', 'hi'), false);
  assert.equal(
    hasTargetLanguageScript('Heavy rainfall warning: clear channels in हिन्दी.', 'hi'),
    false
  );
  assert.equal(hasTargetLanguageScript('Clear drainage channels.', 'en'), true);
});

test('prepareTextForTts strips markdown symbols and clamps cleanly', () => {
  const cleaned = prepareTextForTts('**Step 1:** # Drain water cleanly.   Next step.');
  assert.equal(cleaned, 'Step 1: Drain water cleanly. Next step.');
  assert.equal(clampSoftVolume(0.78), 0.78);
  assert.equal(clampSoftVolume(0.05), 0.25);
  assert.equal(clampSoftVolume(1.5), 1);
});

test('sanitizeHighlightedSelection trims whitespace and ignores tiny clicks', () => {
  assert.equal(sanitizeHighlightedSelection('  ok '), '');
  assert.equal(
    sanitizeHighlightedSelection('  Clear   silt along   main   outflow channels  '),
    'Clear silt along main outflow channels'
  );
});

test('navSectionToDoubtTopic maps navigation sections to matching doubt topics', () => {
  assert.equal(navSectionToDoubtTopic('kisan-rakshak'), 'kisan-rakshak');
  assert.equal(navSectionToDoubtTopic('crop'), 'crop');
  assert.equal(navSectionToDoubtTopic('settings'), 'overview');
});

test('buildDoubtContextSnippet embeds highlighted doubt text in selected language prompt', () => {
  const weather = DEMO_SCENARIOS[0].weather;
  const assessment = assessKisanRakshakRisk(SAMPLE_FARMER, weather, 'te');
  const snippet = buildDoubtContextSnippet({
    topicId: 'highlighted',
    highlightedText: 'Avoid urea spray before heavy rain.',
    farmer: SAMPLE_FARMER,
    weather,
    assessment,
    recommendations: [],
    alerts: [],
    language: 'te',
  });

  assert.equal(snippet.topicId, 'highlighted');
  assert.equal(snippet.readableText, 'Avoid urea spray before heavy rain.');
  const prompt = snippet.promptWithContext('నేను ఎప్పుడు పిచికారీ చేయాలి?');
  assert.ok(prompt.includes('Avoid urea spray before heavy rain.'));
  assert.ok(prompt.includes('నేను ఎప్పుడు పిచికారీ చేయాలి?'));
});

test('buildDoubtContextSnippet emits zero English words or enums in Telugu and Hindi overview/crop snippets', () => {
  const weather = DEMO_SCENARIOS[0].weather;
  for (const lang of ['te', 'hi'] as const) {
    const assessment = assessKisanRakshakRisk(SAMPLE_FARMER, weather, lang);
    for (const topicId of ['overview', 'kisan-rakshak', 'weather', 'crop'] as const) {
      const snippet = buildDoubtContextSnippet({
        topicId,
        farmer: SAMPLE_FARMER,
        weather,
        assessment,
        recommendations: [],
        alerts: [],
        language: lang,
      });
      assert.equal(
        /[A-Za-z]/.test(snippet.readableText),
        false,
        `Expected zero ASCII letters in ${lang} ${topicId} readableText, got: ${snippet.readableText}`
      );
      assert.equal(
        /[A-Za-z]/.test(snippet.topicLabel),
        false,
        `Expected zero ASCII letters in ${lang} ${topicId} topicLabel, got: ${snippet.topicLabel}`
      );
    }
  }
});

test('buildDoubtContextSnippet formats live plains elevation and basin status purely in te and hi', () => {
  const liveWeather = {
    ...DEMO_SCENARIOS[0].weather,
    scenarioId: 'live' as const,
    scenarioTitle: 'Live Field Weather · East Godavari',
    isSyntheticDemo: false,
    plains: {
      elevationM: 10,
      surroundingMinElevationM: 6,
      surroundingMaxElevationM: 12,
      relief5kmM: 6,
      plainType: 'Low-Lying Coastal / Delta Plain' as const,
      drainageSlopeProfile: 'Flat Basin / Slow Runoff' as const,
      topsoilMoisturePct: 35,
      rootZoneMoisturePct: 40,
      soilTempC: 26,
      evapotranspirationMmDay: 4.1,
      surfacePressureHpa: 1012,
      rainProbability24hPct: 40,
      riverDischargeM3s: 6.7,
      riverDischargeMax4dM3s: 7.4,
      riverBasinStatus: 'Normal Flow' as const,
    },
  };

  for (const lang of ['te', 'hi'] as const) {
    const assessment = assessKisanRakshakRisk(SAMPLE_FARMER, liveWeather, lang);
    for (const topicId of ['overview', 'weather'] as const) {
      const snippet = buildDoubtContextSnippet({
        topicId,
        farmer: SAMPLE_FARMER,
        weather: liveWeather,
        assessment,
        recommendations: [],
        alerts: [],
        language: lang,
      });
      assert.equal(
        /[A-Za-z]/.test(snippet.readableText),
        false,
        `Unexpected ASCII in live ${lang} ${topicId} doubt snippet: ${snippet.readableText}`
      );
    }
  }
});
