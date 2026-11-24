import {
  canonicalizeLocationForGeocode,
  findLocationPresetMatch,
} from '../lib/domainTranslations.ts';
import {
  buildOpenMeteoWeatherContext,
  type OpenMeteoElevationPayload,
  type OpenMeteoFloodPayload,
  type OpenMeteoForecastPayload,
} from '../lib/liveWeatherUtils.ts';
import {
  parseBigDataCloudReversePayload,
  parseNominatimReversePayload,
  type BigDataCloudReversePayload,
  type NominatimReversePayload,
  type ReverseGeocodeResult,
} from '../lib/profileLocationUtils.ts';
import type { WeatherContext } from '../types/agriguard.ts';

interface GeoEntry {
  lat: number;
  lon: number;
  resolvedName: string;
}

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const geoCache = new Map<string, CacheEntry<GeoEntry>>();
const reverseGeoCache = new Map<string, CacheEntry<ReverseGeocodeResult>>();
const weatherCache = new Map<string, CacheEntry<WeatherContext>>();

const GEO_TTL_MS = 60 * 60 * 1000; // 1 hour
const WEATHER_TTL_MS = 10 * 60 * 1000; // 10 minutes

// District headquarters mapping for Indian districts whose administrative name differs from city GeoNames entry
const DISTRICT_HQ_ALIAS: Record<string, string> = {
  'east godavari': 'Kakinada',
  'west godavari': 'Eluru',
  'dr. b.r. ambedkar konaseema': 'Amalapuram',
  konaseema: 'Amalapuram',
  krishna: 'Machilipatnam',
  prakasam: 'Ongole',
  'ysr kadapa': 'Kadapa',
  kadapa: 'Kadapa',
  'spsr nellore': 'Nellore',
  'ranga reddy': 'Hyderabad',
  rangareddy: 'Hyderabad',
  medchal: 'Hyderabad',
  'bhadradri kothagudem': 'Kothagudem',
  'jayashankar bhupalpally': 'Bhupalpally',
  'east champaran': 'Motihari',
  'west champaran': 'Bettiah',
  'south 24 parganas': 'Diamond Harbour',
  'north 24 parganas': 'Barasat',
  bapatla: 'Bapatla',
};

function cleanPlaceQuery(raw: string): string {
  const canonical = canonicalizeLocationForGeocode(raw);
  return canonical
    .replace(/[()]/g, ' ')
    .replace(/\b(mandal|tehsil|taluka|taluk|block|village|district|dist\.?|belt|area)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function queryOpenMeteoGeo(name: string, stateHint: string): Promise<GeoEntry | null> {
  if (!name || name.length < 2) return null;
  const canonicalState = cleanPlaceQuery(stateHint);
  const cacheKey = `${name.toLowerCase()}::${canonicalState.toLowerCase()}`;
  const cached = geoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name
  )}&count=8&language=en&format=json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      country_code?: string;
      admin1?: string;
    }>;
  };

  const indianResults = (data.results ?? []).filter((r) => r.country_code === 'IN');
  if (indianResults.length === 0) return null;

  const stateLower = canonicalState.trim().toLowerCase();
  const stateMatch =
    (stateLower
      ? indianResults.find((r) => (r.admin1 ?? '').toLowerCase().includes(stateLower))
      : undefined) ?? indianResults[0];

  const entry: GeoEntry = {
    lat: stateMatch.latitude,
    lon: stateMatch.longitude,
    resolvedName: [stateMatch.name, stateMatch.admin1].filter(Boolean).join(', '),
  };
  geoCache.set(cacheKey, { value: entry, expiresAt: Date.now() + GEO_TTL_MS });
  return entry;
}

async function queryNominatimForwardGeo(queryParts: string[]): Promise<GeoEntry | null> {
  const q = queryParts.map((s) => s.trim()).filter(Boolean).join(', ');
  if (q.length < 2) return null;
  const cacheKey = `nom::${q.toLowerCase()}`;
  const cached = geoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q
    )}&countrycodes=in&format=jsonv2&limit=5&addressdetails=1&accept-language=en`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AgriGuardAI/1.0 (agricultural-assistant)' },
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;
    const hits = (await res.json()) as Array<{
      lat?: string;
      lon?: string;
      name?: string;
      display_name?: string;
      address?: { state?: string; state_district?: string; county?: string; town?: string; city?: string };
    }>;
    const first = hits?.[0];
    if (!first?.lat || !first?.lon) return null;
    const lat = Number(first.lat);
    const lon = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    const placeName =
      first.address?.city ||
      first.address?.town ||
      first.address?.state_district ||
      first.name ||
      queryParts[0] ||
      'India';
    const stateName = first.address?.state || queryParts[queryParts.length - 1] || '';
    const entry: GeoEntry = {
      lat,
      lon,
      resolvedName: Array.from(new Set([placeName, stateName].filter(Boolean))).join(', '),
    };
    geoCache.set(cacheKey, { value: entry, expiresAt: Date.now() + GEO_TTL_MS });
    return entry;
  } catch {
    return null;
  }
}

async function geocodeIndianLocation(params: {
  district: string;
  state: string;
  location?: string;
}): Promise<GeoEntry> {
  const matchedPreset = findLocationPresetMatch(params);
  if (
    matchedPreset &&
    typeof matchedPreset.lat === 'number' &&
    typeof matchedPreset.lon === 'number'
  ) {
    const parts = Array.from(
      new Set([matchedPreset.location.en, matchedPreset.district.en, matchedPreset.state.en])
    );
    return {
      lat: matchedPreset.lat,
      lon: matchedPreset.lon,
      resolvedName: parts.join(', '),
    };
  }

  const canonicalState = cleanPlaceQuery(params.state || '');
  const locClean = cleanPlaceQuery(params.location || '');
  const distClean = cleanPlaceQuery(params.district || '');
  const distAlias = DISTRICT_HQ_ALIAS[distClean.toLowerCase()] || '';

  const candidateNames = Array.from(
    new Set([locClean, distClean, distAlias].filter((s) => s.length >= 2))
  );

  // Query all clean candidates in parallel for sub-second resolution
  const results = await Promise.all(
    candidateNames.map((name) => queryOpenMeteoGeo(name, canonicalState || params.state))
  );

  const firstMatch = results.find((r): r is GeoEntry => r !== null);
  if (firstMatch) return firstMatch;

  // Fallback to Nominatim forward geocoding (supports small villages/mandals and multilingual queries)
  const nomFallback =
    (await queryNominatimForwardGeo([
      locClean || canonicalizeLocationForGeocode(params.location || ''),
      distClean || canonicalizeLocationForGeocode(params.district || ''),
      canonicalState || canonicalizeLocationForGeocode(params.state || ''),
    ])) ??
    (await queryNominatimForwardGeo([
      params.district || params.location || '',
      params.state || '',
    ]));
  if (nomFallback) return nomFallback;

  throw new Error(
    `Could not resolve coordinates for "${params.district}, ${params.state}". Please verify the district spelling in My Farm, or use GPS coordinates.`
  );
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<ReverseGeocodeResult> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = reverseGeoCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  // Primary: OpenStreetMap Nominatim (free, structured state/district/village)
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      String(lat)
    )}&lon=${encodeURIComponent(String(lon))}&zoom=14&addressdetails=1&accept-language=en`;
    const nomRes = await fetch(nomUrl, {
      headers: { 'User-Agent': 'AgriGuardAI/1.0 (agricultural-assistant)' },
      signal: AbortSignal.timeout(4500),
    });
    if (nomRes.ok) {
      const payload = (await nomRes.json()) as NominatimReversePayload;
      const parsed = parseNominatimReversePayload(payload);
      if (parsed) {
        reverseGeoCache.set(key, { value: parsed, expiresAt: Date.now() + GEO_TTL_MS });
        return parsed;
      }
    }
  } catch {
    // Fall through cleanly to secondary reverse geocoder
  }

  // Secondary fallback: BigDataCloud free client-safe reverse geocode
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
      String(lat)
    )}&longitude=${encodeURIComponent(String(lon))}&localityLanguage=en`;
    const bdcRes = await fetch(bdcUrl, { signal: AbortSignal.timeout(4500) });
    if (bdcRes.ok) {
      const payload = (await bdcRes.json()) as BigDataCloudReversePayload;
      const parsed = parseBigDataCloudReversePayload(payload);
      if (parsed) {
        reverseGeoCache.set(key, { value: parsed, expiresAt: Date.now() + GEO_TTL_MS });
        return parsed;
      }
    }
  } catch {
    // Fall through cleanly to coordinate fallback label
  }

  const fallback: ReverseGeocodeResult = {
    state: 'India',
    district: 'GPS Farm Location',
    location: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    resolvedLabel: `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
  };
  return fallback;
}

export async function fetchLiveWeather(params: {
  district: string;
  state: string;
  location?: string;
  lat?: number;
  lon?: number;
  forceRefresh?: boolean;
}): Promise<{ weather: WeatherContext; cacheHit: boolean }> {
  let geo: GeoEntry;

  if (
    params.lat !== undefined &&
    params.lon !== undefined &&
    Number.isFinite(params.lat) &&
    Number.isFinite(params.lon)
  ) {
    const uniqueParts = Array.from(
      new Set(
        [params.location, params.district, params.state]
          .map((s) => (s || '').trim())
          .filter(Boolean)
      )
    );
    let resolvedLabel = uniqueParts.join(', ');
    if (!params.district || params.district === 'Farm Location') {
      const rev = await reverseGeocodeCoordinates(params.lat, params.lon);
      resolvedLabel = rev.resolvedLabel;
    }
    geo = {
      lat: params.lat,
      lon: params.lon,
      resolvedName: resolvedLabel || 'GPS Farm Location',
    };
  } else {
    geo = await geocodeIndianLocation({
      district: params.district,
      state: params.state,
      location: params.location,
    });
  }

  const wxKey = `${geo.lat.toFixed(2)},${geo.lon.toFixed(2)}`;
  const cachedWx = weatherCache.get(wxKey);
  if (!params.forceRefresh && cachedWx && cachedWx.expiresAt > Date.now()) {
    return {
      weather: {
        ...cachedWx.value,
        scenarioTitle: `Live Field Weather · ${geo.resolvedName}`,
        coordinates: cachedWx.value.coordinates
          ? { ...cachedWx.value.coordinates, resolvedName: geo.resolvedName }
          : undefined,
      },
      cacheHit: true,
    };
  }

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m,weather_code,surface_pressure&hourly=precipitation,precipitation_probability,wind_speed_10m,temperature_2m,relative_humidity_2m,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_temperature_0cm,et0_fao_evapotranspiration&daily=precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,et0_fao_evapotranspiration_sum&timezone=Asia%2FKolkata&forecast_days=4`;

  // Sample center + N/S/E/W ~5km offset points for live plain/basin elevation relief
  const deltaDeg = 0.045;
  const latStr = [geo.lat, geo.lat + deltaDeg, geo.lat - deltaDeg, geo.lat, geo.lat]
    .map((v) => v.toFixed(4))
    .join(',');
  const lonStr = [geo.lon, geo.lon, geo.lon, geo.lon + deltaDeg, geo.lon - deltaDeg]
    .map((v) => v.toFixed(4))
    .join(',');
  const elevationUrl = `https://api.open-meteo.com/v1/elevation?latitude=${latStr}&longitude=${lonStr}`;
  const floodUrl = `https://flood-api.open-meteo.com/v1/flood?latitude=${geo.lat.toFixed(
    4
  )}&longitude=${geo.lon.toFixed(
    4
  )}&daily=river_discharge,river_discharge_mean,river_discharge_max&forecast_days=4&past_days=2`;

  const [wxSettled, elevSettled, floodSettled] = await Promise.allSettled([
    fetch(forecastUrl, { signal: AbortSignal.timeout(6000) }),
    fetch(elevationUrl, { signal: AbortSignal.timeout(4500) }),
    fetch(floodUrl, { signal: AbortSignal.timeout(4500) }),
  ]);

  if (wxSettled.status !== 'fulfilled' || !wxSettled.value.ok) {
    const code = wxSettled.status === 'fulfilled' ? `HTTP ${wxSettled.value.status}` : 'network timeout';
    throw new Error(`Live weather provider returned ${code}.`);
  }

  const raw = (await wxSettled.value.json()) as OpenMeteoForecastPayload;

  let elevationSamples: number[] | null = null;
  if (elevSettled.status === 'fulfilled' && elevSettled.value.ok) {
    try {
      const elevData = (await elevSettled.value.json()) as OpenMeteoElevationPayload;
      if (Array.isArray(elevData.elevation)) {
        elevationSamples = elevData.elevation;
      }
    } catch {
      // Optional elevation grid
    }
  }

  let flood: OpenMeteoFloodPayload | null = null;
  if (floodSettled.status === 'fulfilled' && floodSettled.value.ok) {
    try {
      flood = (await floodSettled.value.json()) as OpenMeteoFloodPayload;
    } catch {
      // Optional flood discharge feed
    }
  }

  const weather = buildOpenMeteoWeatherContext({
    lat: geo.lat,
    lon: geo.lon,
    resolvedName: geo.resolvedName,
    raw,
    elevationSamples,
    flood,
    fetchedAtIso: new Date().toISOString(),
  });

  weatherCache.set(wxKey, { value: weather, expiresAt: Date.now() + WEATHER_TTL_MS });
  return { weather, cacheHit: false };
}
