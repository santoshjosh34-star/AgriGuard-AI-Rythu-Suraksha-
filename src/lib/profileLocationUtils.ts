import type { Language } from '../types/agriguard.ts';

export interface ReverseGeocodeResult {
  state: string;
  district: string;
  location: string;
  resolvedLabel: string;
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function formatGpsCoordinates(
  lat: number,
  lon: number,
  language: Language = 'en'
): string {
  const latDir =
    language === 'hi'
      ? lat >= 0
        ? 'उ'
        : 'द'
      : language === 'te'
      ? lat >= 0
        ? 'ఉ'
        : 'ద'
      : lat >= 0
      ? 'N'
      : 'S';
  const lonDir =
    language === 'hi'
      ? lon >= 0
        ? 'पू'
        : 'प'
      : language === 'te'
      ? lon >= 0
        ? 'తూ'
        : 'ప'
      : lon >= 0
      ? 'E'
      : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

export function validateProfileImageDataUrl(
  dataUrl: string,
  language: Language = 'en'
): { valid: true } | { valid: false; error: string } {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(
    dataUrl.trim()
  );
  if (!match) {
    return {
      valid: false,
      error:
        language === 'hi'
          ? 'अमान्य प्रोफ़ाइल फोटो प्रारूप। केवल जेपीजी, पीएनजी या वेबपी समर्थित हैं।'
          : language === 'te'
          ? 'చెల్లని ప్రొఫైల్ ఫోటో ఫార్మాట్. కేవలం జేపీజీ, పీఎన్‌జీ లేదా వెబ్‌పీ మాత్రమే అనుమతించబడతాయి.'
          : 'Invalid profile photo format. Only JPG, PNG, or WebP images are supported.',
    };
  }

  // Keep compressed profile avatar <= ~1.8 MB base64 so browser localStorage never overflows
  if (match[2].length > 2_400_000) {
    return {
      valid: false,
      error:
        language === 'hi'
          ? 'प्रोफ़ाइल फोटो बहुत बड़ी है। कृपया छोटी फोटो चुनें।'
          : language === 'te'
          ? 'ప్రొఫైల్ ఫోటో పరిమాణం చాలా పెద్దదిగా ఉంది. దయచేసి చిన్న ఫోటోను ఎంచుకోండి.'
          : 'Profile photo is too large to save locally. Please choose a smaller image.',
    };
  }

  return { valid: true };
}

function cleanDistrictName(raw: string): string {
  return raw.replace(/\s+district$/i, '').trim();
}

export interface NominatimReversePayload {
  display_name?: string;
  address?: {
    village?: string;
    hamlet?: string;
    suburb?: string;
    town?: string;
    city_district?: string;
    city?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
  };
}

export interface BigDataCloudReversePayload {
  locality?: string;
  city?: string;
  principalSubdivision?: string;
  countryName?: string;
  localityInfo?: {
    administrative?: Array<{
      name?: string;
      description?: string;
      order?: number;
      adminLevel?: number;
    }>;
  };
}

export function parseNominatimReversePayload(
  payload: NominatimReversePayload
): ReverseGeocodeResult | null {
  const addr = payload?.address;
  if (!addr) return null;

  const state = (addr.state || '').trim();
  const rawDistrict =
    addr.state_district || addr.county || addr.city_district || addr.city || '';
  const district = cleanDistrictName(rawDistrict);
  const location = (
    addr.village ||
    addr.hamlet ||
    addr.suburb ||
    addr.town ||
    addr.city ||
    district
  ).trim();

  if (!state && !district && !location) return null;

  const finalState = state || 'India';
  const finalDistrict = district || location || 'GPS Location';
  const finalLocation = location || finalDistrict;

  return {
    state: finalState,
    district: finalDistrict,
    location: finalLocation,
    resolvedLabel: Array.from(new Set([finalLocation, finalDistrict, finalState]))
      .filter(Boolean)
      .join(', '),
  };
}

export function parseBigDataCloudReversePayload(
  payload: BigDataCloudReversePayload
): ReverseGeocodeResult | null {
  if (!payload || (!payload.locality && !payload.city && !payload.principalSubdivision)) {
    return null;
  }

  const adminDistrict = (payload.localityInfo?.administrative ?? []).find(
    (entry) =>
      entry.adminLevel === 5 ||
      (entry.description ?? '').toLowerCase().includes('district')
  )?.name;

  const state = (payload.principalSubdivision || 'India').trim();
  const district = cleanDistrictName(adminDistrict || payload.city || payload.locality || 'GPS Location');
  const location = (payload.locality || payload.city || district).trim();

  return {
    state,
    district,
    location,
    resolvedLabel: Array.from(new Set([location, district, state]))
      .filter(Boolean)
      .join(', '),
  };
}
