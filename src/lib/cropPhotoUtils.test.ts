import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveHealthStatusFromScore,
  normalizeCropPhotoDiagnosis,
  parseImageDataUrl,
} from './cropPhotoUtils.ts';

test('parseImageDataUrl validates supported image data URLs and rejects invalid inputs', () => {
  const validPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const okRes = parseImageDataUrl(validPng, 'en');
  assert.equal(okRes.ok, true);
  if (okRes.ok) {
    assert.equal(okRes.value.mimeType, 'image/png');
    assert.ok(okRes.value.base64Data.length > 32);
  }

  const badMime = parseImageDataUrl(
    'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlIC9DYXRhbG9n',
    'hi'
  );
  assert.equal(badMime.ok, false);
  if (!badMime.ok) {
    assert.ok(/[\u0900-\u097F]/.test(badMime.error));
  }

  const empty = parseImageDataUrl('', 'te');
  assert.equal(empty.ok, false);
  if (!empty.ok) {
    assert.ok(/[\u0C00-\u0C7F]/.test(empty.error));
  }
});

test('deriveHealthStatusFromScore and normalizeCropPhotoDiagnosis clamp scores and map fields safely', () => {
  assert.equal(deriveHealthStatusFromScore(90), 'Healthy');
  assert.equal(deriveHealthStatusFromScore(68), 'Mild Stress');
  assert.equal(deriveHealthStatusFromScore(45), 'Moderate Issue');
  assert.equal(deriveHealthStatusFromScore(20), 'Severe / Critical');

  const normalized = normalizeCropPhotoDiagnosis(
    {
      identifiedCrop: 'Paddy (Oryza sativa)',
      identificationConfidencePct: 120,
      estimatedGrowthStage: 'Flowering / Panicle Initiation',
      healthScore: 42.6,
      healthStatus: 'InvalidStatusFallbackTest',
      healthSummary: 'Lower leaves show yellowing and brown sheath lesions.',
      detectedProblems: [
        {
          problemName: 'Possible Sheath Blight / Nitrogen Stress',
          category: 'Disease',
          severity: 'High',
          visualEvidence: 'Elliptical grey-brown lesions on lower leaf sheaths',
          immediateSafeSteps: ['Avoid excess standing water', 'Inspect adjacent bund plants'],
        },
      ],
      generalAgronomicSteps: ['Maintain shallow drainage'],
      requiresKvkConfirmation: true,
      kvkVerificationQuestions: ['Confirm fungal vs nutrient stress before spray'],
      imageQualityLimitations: ['Close-up of stem base not visible'],
      spokenSummary: 'Moderate issue detected on paddy lower sheath.',
    },
    { modelUsed: 'gemini-4-hydrogen', language: 'en', analyzedAt: '2026-11-22T12:00:00Z' }
  );

  assert.equal(normalized.identificationConfidencePct, 100);
  assert.equal(normalized.healthScore, 43);
  assert.equal(normalized.healthStatus, 'Moderate Issue');
  assert.equal(normalized.detectedProblems.length, 1);
  assert.equal(normalized.detectedProblems[0].category, 'Disease');
  assert.equal(normalized.modelUsed, 'gemini-4-hydrogen');
});
