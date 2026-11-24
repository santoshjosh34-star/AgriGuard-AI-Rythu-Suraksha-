import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceKm,
  formatGpsCoordinates,
  parseBigDataCloudReversePayload,
  parseNominatimReversePayload,
  validateProfileImageDataUrl,
} from './profileLocationUtils';

test('calculateDistanceKm computes near-zero for identical coords and ~111km per degree lat', () => {
  assert.equal(calculateDistanceKm(17.6868, 83.2185, 17.6868, 83.2185), 0);
  const dist = calculateDistanceKm(17.0, 83.0, 18.0, 83.0);
  assert.ok(dist > 110 && dist < 112);
});

test('formatGpsCoordinates formats N/S and E/W hemispheres clearly', () => {
  assert.equal(formatGpsCoordinates(17.6868, 83.2185), '17.6868° N, 83.2185° E');
  assert.equal(formatGpsCoordinates(-12.5, -77.1), '12.5000° S, 77.1000° W');
});

test('validateProfileImageDataUrl accepts clean jpeg/png/webp and rejects invalid formats', () => {
  assert.deepEqual(
    validateProfileImageDataUrl('data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'en'),
    { valid: true }
  );
  const badEn = validateProfileImageDataUrl('data:image/svg+xml;base64,PHN2Zz4=', 'en');
  assert.equal(badEn.valid, false);
  if (!badEn.valid) {
    assert.ok(badEn.error.includes('JPG'));
  }

  const badHi = validateProfileImageDataUrl('data:image/svg+xml;base64,PHN2Zz4=', 'hi');
  assert.equal(badHi.valid, false);
  if (!badHi.valid) {
    assert.ok(badHi.error.includes('जेपीजी'));
    assert.equal(/[A-Za-z]/.test(badHi.error), false);
  }

  const badTe = validateProfileImageDataUrl('data:image/svg+xml;base64,PHN2Zz4=', 'te');
  assert.equal(badTe.valid, false);
  if (!badTe.valid) {
    assert.ok(badTe.error.includes('జేపీజీ'));
    assert.equal(/[A-Za-z]/.test(badTe.error), false);
  }
});

test('parseNominatimReversePayload extracts village, district, and state cleanly', () => {
  const parsed = parseNominatimReversePayload({
    address: {
      village: 'Anaparthi',
      state_district: 'East Godavari District',
      state: 'Andhra Pradesh',
      country: 'India',
    },
  });
  assert.deepEqual(parsed, {
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    location: 'Anaparthi',
    resolvedLabel: 'Anaparthi, East Godavari, Andhra Pradesh',
  });
});

test('parseBigDataCloudReversePayload extracts locality, district, and state cleanly', () => {
  const parsed = parseBigDataCloudReversePayload({
    locality: 'Ramachandrapuram',
    city: 'Kakinada',
    principalSubdivision: 'Andhra Pradesh',
    localityInfo: {
      administrative: [{ name: 'Konaseema District', adminLevel: 5 }],
    },
  });
  assert.deepEqual(parsed, {
    state: 'Andhra Pradesh',
    district: 'Konaseema',
    location: 'Ramachandrapuram',
    resolvedLabel: 'Ramachandrapuram, Konaseema, Andhra Pradesh',
  });
});
