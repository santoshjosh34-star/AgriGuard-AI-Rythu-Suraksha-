import type {
  AdvisoryRecommendation,
  CropHealthStatus,
  CropProblemCategory,
  CropSymptomReport,
  DemoScenarioDefinition,
  DrainageSlopeProfile,
  EmergencyChecklistItem,
  FarmAlert,
  FarmerProfile,
  GrowthStage,
  Language,
  PlainClassification,
  RiskLevel,
  RiverBasinStatus,
  SoilType,
  VerifiedEmergencyContact,
  WeatherContext,
  WeatherForecastPoint,
} from '../types/agriguard.ts';

const RISK_LEVEL_LABELS: Record<Language, Record<RiskLevel, string>> = {
  en: { Low: 'Low', Moderate: 'Moderate', High: 'High', Critical: 'Critical' },
  hi: { Low: 'कम', Moderate: 'मध्यम', High: 'उच्च', Critical: 'गंभीर' },
  te: { Low: 'తక్కువ', Moderate: 'మధ్యస్థం', High: 'అధికం', Critical: 'తీవ్రం' },
};

export function localizeRiskLevel(level: RiskLevel, language: Language): string {
  return RISK_LEVEL_LABELS[language]?.[level] ?? level;
}

const SOIL_LABELS: Record<Language, Record<SoilType, string>> = {
  en: {
    Alluvial: 'Alluvial',
    'Black Cotton (Vertisol)': 'Black Cotton (Vertisol)',
    'Red Loamy': 'Red Loamy',
    'Coastal Sandy': 'Coastal Sandy',
    Clayey: 'Clayey',
    Unknown: 'Unknown',
  },
  hi: {
    Alluvial: 'जलोढ़ मिट्टी',
    'Black Cotton (Vertisol)': 'काली कपास मिट्टी',
    'Red Loamy': 'लाल दोमट मिट्टी',
    'Coastal Sandy': 'तटीय रेतीली मिट्टी',
    Clayey: 'चिकनी मिट्टी',
    Unknown: 'अज्ञात',
  },
  te: {
    Alluvial: 'ఒండ్రు నేల',
    'Black Cotton (Vertisol)': 'నల్ల రేగడి నేల',
    'Red Loamy': 'ఎర్ర చెలక నేల',
    'Coastal Sandy': 'తీర ప్రాంత ఇసుక నేల',
    Clayey: 'బంకమట్టి నేల',
    Unknown: 'తెలియదు',
  },
};

export function localizeSoilType(soil: SoilType, language: Language): string {
  return SOIL_LABELS[language]?.[soil] ?? soil;
}

const STAGE_LABELS: Record<Language, Record<GrowthStage, string>> = {
  en: {
    'Nursery / Sowing': 'Nursery / Sowing',
    Vegetative: 'Vegetative',
    'Tillering / Branching': 'Tillering / Branching',
    'Flowering / Panicle Initiation': 'Flowering / Panicle Initiation',
    'Grain Filling / Pod Development': 'Grain Filling / Pod Development',
    'Maturity / Pre-Harvest': 'Maturity / Pre-Harvest',
  },
  hi: {
    'Nursery / Sowing': 'नर्सरी / बुवाई',
    Vegetative: 'वानस्पतिक वृद्धि',
    'Tillering / Branching': 'कल्ले फूटना / शाखाएँ निकलना',
    'Flowering / Panicle Initiation': 'फूल आना / बाली निकलना',
    'Grain Filling / Pod Development': 'दाना भरना / फली बनना',
    'Maturity / Pre-Harvest': 'पकना / कटाई से पहले',
  },
  te: {
    'Nursery / Sowing': 'నారుమడి / విత్తే దశ',
    Vegetative: 'మొక్క పెరుగుదల దశ',
    'Tillering / Branching': 'పిలకలు వేసే దశ',
    'Flowering / Panicle Initiation': 'పూత / పొట్ట దశ',
    'Grain Filling / Pod Development': 'గింజ పాలు పోసుకునే దశ',
    'Maturity / Pre-Harvest': 'పంట కోతకు సిద్ధమైన దశ',
  },
};

export function localizeGrowthStage(stage: GrowthStage, language: Language): string {
  return STAGE_LABELS[language]?.[stage] ?? stage;
}

const DRAINAGE_LABELS: Record<Language, Record<FarmerProfile['drainageType'], string>> = {
  en: {
    'Natural Slope': 'Natural Slope',
    'Low-Lying / Basin': 'Low-Lying / Basin',
    'Raised Bunds': 'Raised Bunds',
    Unknown: 'Unknown',
  },
  hi: {
    'Natural Slope': 'प्राकृतिक ढलान',
    'Low-Lying / Basin': 'निचला / जलभराव वाला खेत',
    'Raised Bunds': 'ऊँची मेड़',
    Unknown: 'अज्ञात',
  },
  te: {
    'Natural Slope': 'సహజ వాలు నేల',
    'Low-Lying / Basin': 'లోతట్టు / నీరు నిలిచే నేల',
    'Raised Bunds': 'ఎత్తైన గట్లు',
    Unknown: 'తెలియదు',
  },
};

export function localizeDrainageType(
  drainage: FarmerProfile['drainageType'],
  language: Language
): string {
  return DRAINAGE_LABELS[language]?.[drainage] ?? drainage;
}

const FLOOD_STATUS_LABELS: Record<Language, Record<WeatherContext['localFloodStatus'], string>> = {
  en: {
    'None Reported': 'None Reported',
    'Watch / Rising Water': 'Watch / Rising Water',
    'Active Waterlogging': 'Active Waterlogging',
    Unknown: 'Unknown',
  },
  hi: {
    'None Reported': 'कोई बाढ़ सूचना नहीं',
    'Watch / Rising Water': 'निगरानी / बढ़ता जल स्तर',
    'Active Waterlogging': 'खेत में जलभराव सक्रिय',
    Unknown: 'अज्ञात',
  },
  te: {
    'None Reported': 'వరద సమాచారం లేదు',
    'Watch / Rising Water': 'నిఘా / పెరుగుతున్న నీటి మట్టం',
    'Active Waterlogging': 'పొలంలో నీరు నిల్వ ఉంది',
    Unknown: 'తెలియదు',
  },
};

export function localizeFloodStatus(
  status: WeatherContext['localFloodStatus'],
  language: Language
): string {
  return FLOOD_STATUS_LABELS[language]?.[status] ?? status;
}

const SOIL_MOISTURE_LABELS: Record<Language, Record<CropSymptomReport['soilMoisture'], string>> = {
  en: {
    Dry: 'Dry',
    Moist: 'Moist',
    Saturated: 'Saturated / Muddy',
    Submerged: 'Submerged / Standing Water',
    Unknown: 'Unknown',
  },
  hi: {
    Dry: 'सूखी मिट्टी',
    Moist: 'नम मिट्टी',
    Saturated: 'संतृप्त / कीचड़युक्त',
    Submerged: 'जलमग्न / खड़ा पानी',
    Unknown: 'अज्ञात',
  },
  te: {
    Dry: 'పొడి నేల',
    Moist: 'తేమ నేల',
    Saturated: 'బాగా తడిసిన / బురద నేల',
    Submerged: 'నీట మునిగిన / నిలిచిన నీరు',
    Unknown: 'తెలియదు',
  },
};

export function localizeCropSoilMoisture(
  status: CropSymptomReport['soilMoisture'],
  language: Language
): string {
  return SOIL_MOISTURE_LABELS[language]?.[status] ?? status;
}

const SPRAY_STATUS_LABELS: Record<Language, Record<'Safe' | 'Caution' | 'Avoid', string>> = {
  en: { Safe: 'Safe', Caution: 'Caution', Avoid: 'Avoid' },
  hi: { Safe: 'सुरक्षित', Caution: 'सावधानी', Avoid: 'टालें' },
  te: { Safe: 'సురక్షితం', Caution: 'జాగ్రత్త', Avoid: 'నివారించండి' },
};

export function localizeSprayStatus(
  status: 'Safe' | 'Caution' | 'Avoid',
  language: Language
): string {
  return SPRAY_STATUS_LABELS[language]?.[status] ?? status;
}

const IRRIGATION_STATUS_LABELS: Record<
  Language,
  Record<'Irrigate' | 'Hold Irrigation' | 'Drainage Priority', string>
> = {
  en: {
    Irrigate: 'Irrigate',
    'Hold Irrigation': 'Hold Irrigation',
    'Drainage Priority': 'Drainage Priority',
  },
  hi: {
    Irrigate: 'सिंचाई करें',
    'Hold Irrigation': 'सिंचाई रोकें',
    'Drainage Priority': 'जल निकासी प्राथमिकता',
  },
  te: {
    Irrigate: 'నీరు పెట్టండి',
    'Hold Irrigation': 'నీరు పెట్టడం ఆపండి',
    'Drainage Priority': 'నీటి పారుదల ప్రాధాన్యత',
  },
};

export function localizeIrrigationStatus(
  status: 'Irrigate' | 'Hold Irrigation' | 'Drainage Priority',
  language: Language
): string {
  return IRRIGATION_STATUS_LABELS[language]?.[status] ?? status;
}

const WMO_LABELS: Record<Language, Record<string, string>> = {
  en: {
    Unknown: 'Unknown',
    'Clear Sky': 'Clear Sky',
    'Partly Cloudy': 'Partly Cloudy',
    'Fog / Mist': 'Fog / Mist',
    Drizzle: 'Drizzle',
    Rain: 'Rain',
    'Freezing Rain': 'Freezing Rain',
    'Rain Showers': 'Rain Showers',
    'Thunderstorm / Squall': 'Thunderstorm / Squall',
    'Overcast / Variable': 'Overcast / Variable',
  },
  hi: {
    Unknown: 'अज्ञात',
    'Clear Sky': 'साफ़ आसमान',
    'Partly Cloudy': 'आंशिक बादल',
    'Fog / Mist': 'कोहरा / धुंध',
    Drizzle: 'हल्की बूंदाबांदी',
    Rain: 'बारिश',
    'Freezing Rain': 'बर्फीली बारिश',
    'Rain Showers': 'तेज़ बौछारें',
    'Thunderstorm / Squall': 'आंधी / गरज-चमक के साथ बारिश',
    'Overcast / Variable': 'घने बादल / परिवर्तनशील मौसम',
  },
  te: {
    Unknown: 'తెలియదు',
    'Clear Sky': 'నిర్మలమైన ఆకాశం',
    'Partly Cloudy': 'పాక్షిక మేఘావృతం',
    'Fog / Mist': 'పొగమంచు',
    Drizzle: 'చిరుజల్లులు',
    Rain: 'వర్షం',
    'Freezing Rain': 'మంచు వర్షం',
    'Rain Showers': 'వర్షపు జల్లులు',
    'Thunderstorm / Squall': 'ఉరుములు / ఈదురుగాలులతో వర్షం',
    'Overcast / Variable': 'మేఘావృతం / మారుతున్న వాతావరణం',
  },
};

export function localizeWeatherCondition(
  label: string | null | undefined,
  language: Language
): string {
  if (!label) return '';
  return WMO_LABELS[language]?.[label] ?? label;
}

const CHECKLIST_CATEGORY_LABELS: Record<
  Language,
  Record<EmergencyChecklistItem['category'], string>
> = {
  en: { Field: 'Field', Safety: 'Safety', Equipment: 'Equipment', Records: 'Records' },
  hi: { Field: 'खेत', Safety: 'सुरक्षा', Equipment: 'उपकरण', Records: 'दस्तावेज' },
  te: { Field: 'పొలం', Safety: 'భద్రత', Equipment: 'పరికరాలు', Records: 'రికార్డులు' },
};

export function localizeChecklistCategory(
  category: EmergencyChecklistItem['category'],
  language: Language
): string {
  return CHECKLIST_CATEGORY_LABELS[language]?.[category] ?? category;
}

export function localizeTimelineKind(
  kind: WeatherForecastPoint['kind'],
  language: Language
): string {
  if (language === 'hi') {
    return kind === 'Confirmed Observation' ? 'पुष्ट अवलोकन' : 'मॉडल पूर्वानुमान';
  }
  if (language === 'te') {
    return kind === 'Confirmed Observation' ? 'నిర్ధారిత పరిశీలన' : 'మోడల్ అంచనా';
  }
  return kind;
}

export function localizeTimelineLabel(label: string, language: Language): string {
  if (language === 'hi') {
    if (label === 'Now (Live)') return 'अभी (लाइव)';
    if (label === '-6h (Obs)') return '-6 घंटे (अवलोकन)';
    const plusHours = /^\+(\d+)h$/i.exec(label);
    if (plusHours) return `+${plusHours[1]} घंटे`;
  }
  if (language === 'te') {
    if (label === 'Now (Live)') return 'ఇప్పుడు (లైవ్)';
    if (label === '-6h (Obs)') return '-6గం (పరిశీలన)';
    const plusHours = /^\+(\d+)h$/i.exec(label);
    if (plusHours) return `+${plusHours[1]} గం.`;
  }
  return label;
}

export type LocalizedTriplet = { en: string; hi: string; te: string };

export interface IndianLocationPreset {
  id: string;
  state: LocalizedTriplet;
  district: LocalizedTriplet;
  location: LocalizedTriplet;
  drainageType: FarmerProfile['drainageType'];
  nearCoastOrRiver: boolean;
  lat?: number;
  lon?: number;
}

export const INDIAN_LOCATION_PRESETS: IndianLocationPreset[] = [
  {
    id: 'east-godavari-ap',
    state: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్రప్రదేశ్' },
    district: { en: 'East Godavari', hi: 'पूर्वी गोदावरी', te: 'తూర్పు గోదావరి' },
    location: { en: 'Ramachandrapuram Mandal', hi: 'रामचंद्रपुरम मंडल', te: 'రామచంద్రపురం మండలం' },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: false,
    lat: 16.8358,
    lon: 82.0258,
  },
  {
    id: 'bapatla-district-ap',
    state: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్రప్రదేశ్' },
    district: { en: 'Bapatla', hi: 'बापटला', te: 'బాపట్ల' },
    location: { en: 'Bapatla District', hi: 'बापटला जिला', te: 'బాపట్ల జిల్లా' },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: true,
    lat: 15.9044,
    lon: 80.4675,
  },
  {
    id: 'repalle-bapatla-ap',
    state: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్రప్రదేశ్' },
    district: { en: 'Bapatla', hi: 'बापटला', te: 'బాపట్ల' },
    location: { en: 'Repalle', hi: 'रेपल्ले', te: 'రేపల్లె' },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: true,
    lat: 16.0197,
    lon: 80.8293,
  },
  {
    id: 'karumuru-pallekona-ap',
    state: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్రప్రదేశ్' },
    district: { en: 'Bapatla', hi: 'बापटला', te: 'బాపట్ల' },
    location: {
      en: 'Karumuru (Pallekona)',
      hi: 'करुमुरु (पल्लेकोना)',
      te: 'కరుమూరు (పల్లెకోన)',
    },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: true,
    lat: 16.0606,
    lon: 80.8155,
  },
  {
    id: 'chirakalavaripalem-nagaram-ap',
    state: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్రప్రదేశ్' },
    district: { en: 'Bapatla', hi: 'बापटला', te: 'బాపట్ల' },
    location: {
      en: 'Chirakalavaripalem (Nagaram)',
      hi: 'चिरकलावारिपालेम (नगरम)',
      te: 'చిరకాలవారిపాలెం (నగరం)',
    },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: true,
    lat: 16.0129,
    lon: 80.7848,
  },
  {
    id: 'konaseema-ap',
    state: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్రప్రదేశ్' },
    district: { en: 'Konaseema', hi: 'कोणसीमा', te: 'కోనసీమ' },
    location: { en: 'Amalapuram', hi: 'अमलापुरम', te: 'అమలాపురం' },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: true,
    lat: 16.5787,
    lon: 82.0061,
  },
  {
    id: 'guntur-ap',
    state: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్రప్రదేశ్' },
    district: { en: 'Guntur', hi: 'गुंटूर', te: 'గుంటూరు' },
    location: { en: 'Tenali', hi: 'तेनाली', te: 'తెనాలి' },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: true,
    lat: 16.2428,
    lon: 80.64,
  },
  {
    id: 'kurnool-ap',
    state: { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', te: 'ఆంధ్రప్రదేశ్' },
    district: { en: 'Kurnool', hi: 'कुरनूल', te: 'కర్నూలు' },
    location: { en: 'Adoni', hi: 'आदोनी', te: 'ఆదోని' },
    drainageType: 'Natural Slope',
    nearCoastOrRiver: false,
    lat: 15.6279,
    lon: 77.275,
  },
  {
    id: 'khammam-ts',
    state: { en: 'Telangana', hi: 'तेलंगाना', te: 'తెలంగాణ' },
    district: { en: 'Khammam', hi: 'खम्मम', te: 'ఖమ్మం' },
    location: { en: 'Madhira', hi: 'मधिरा', te: 'మధిర' },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: true,
  },
  {
    id: 'warangal-ts',
    state: { en: 'Telangana', hi: 'तेलंगाना', te: 'తెలంగాణ' },
    district: { en: 'Warangal', hi: 'वारंगल', te: 'వరంగల్' },
    location: { en: 'Parkal', hi: 'परकाल', te: 'పరకాల' },
    drainageType: 'Natural Slope',
    nearCoastOrRiver: false,
  },
  {
    id: 'nizamabad-ts',
    state: { en: 'Telangana', hi: 'तेलंगाना', te: 'తెలంగాణ' },
    district: { en: 'Nizamabad', hi: 'निजामाबाद', te: 'నిజామాబాద్' },
    location: { en: 'Bodhan', hi: 'बोधन', te: 'బోధన్' },
    drainageType: 'Natural Slope',
    nearCoastOrRiver: false,
  },
  {
    id: 'thanjavur-tn',
    state: { en: 'Tamil Nadu', hi: 'तमिलनाडु', te: 'తమిళనాడు' },
    district: { en: 'Thanjavur', hi: 'तंजावुर', te: 'తంజావూరు' },
    location: { en: 'Kumbakonam', hi: 'कुंभकोणम', te: 'కుంభకోణం' },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: true,
  },
  {
    id: 'raichur-ka',
    state: { en: 'Karnataka', hi: 'कर्नाटक', te: 'కర్ణాటక' },
    district: { en: 'Raichur', hi: 'रायचूर', te: 'రాయచూరు' },
    location: { en: 'Sindhanur', hi: 'सिंधनूर', te: 'సింధనూర్' },
    drainageType: 'Raised Bunds',
    nearCoastOrRiver: false,
  },
  {
    id: 'nashik-mh',
    state: { en: 'Maharashtra', hi: 'महाराष्ट्र', te: 'మహారాష్ట్ర' },
    district: { en: 'Nashik', hi: 'नाशिक', te: 'నాసిక్' },
    location: { en: 'Niphad', hi: 'निफाड़', te: 'నిఫాడ్' },
    drainageType: 'Natural Slope',
    nearCoastOrRiver: false,
  },
  {
    id: 'ludhiana-pb',
    state: { en: 'Punjab', hi: 'पंजाब', te: 'పంజాబ్' },
    district: { en: 'Ludhiana', hi: 'लुधियाना', te: 'లూధియానా' },
    location: { en: 'Jagraon', hi: 'जगराओं', te: 'జగ్రావ్' },
    drainageType: 'Natural Slope',
    nearCoastOrRiver: false,
  },
  {
    id: 'karnal-hr',
    state: { en: 'Haryana', hi: 'हरियाणा', te: 'హర్యానా' },
    district: { en: 'Karnal', hi: 'करनाल', te: 'కర్నాల్' },
    location: { en: 'Gharaunda', hi: 'घरौंडा', te: 'ఘరౌండా' },
    drainageType: 'Natural Slope',
    nearCoastOrRiver: false,
  },
  {
    id: 'puri-od',
    state: { en: 'Odisha', hi: 'ओडिशा', te: 'ఒడిశా' },
    district: { en: 'Puri', hi: 'पुरी', te: 'పూరీ' },
    location: { en: 'Pipili', hi: 'पिपिली', te: 'పిపిలి' },
    drainageType: 'Low-Lying / Basin',
    nearCoastOrRiver: true,
  },
  {
    id: 'indore-mp',
    state: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश', te: 'మధ్య ప్రదేశ్' },
    district: { en: 'Indore', hi: 'इंदौर', te: 'ఇండోర్' },
    location: { en: 'Mhow', hi: 'महू', te: 'మహూ' },
    drainageType: 'Natural Slope',
    nearCoastOrRiver: false,
  },
  {
    id: 'varanasi-up',
    state: { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश', te: 'ఉత్తర ప్రదేశ్' },
    district: { en: 'Varanasi', hi: 'वाराणसी', te: 'వారణాసి' },
    location: { en: 'Pindra', hi: 'पिंडरा', te: 'పిండ్రా' },
    drainageType: 'Raised Bunds',
    nearCoastOrRiver: true,
  },
  {
    id: 'jaipur-rj',
    state: { en: 'Rajasthan', hi: 'राजस्थान', te: 'రాజస్థాన్' },
    district: { en: 'Jaipur', hi: 'जयपुर', te: 'జైపూర్' },
    location: { en: 'Chomu', hi: 'चौमूं', te: 'చౌమూ' },
    drainageType: 'Natural Slope',
    nearCoastOrRiver: false,
  },
];

const KNOWN_FARMER_NAMES: LocalizedTriplet[] = [
  { en: 'Ramesh Rao', hi: 'रमेश राव', te: 'రమేష్ రావు' },
];

const KNOWN_LOCATIONS: LocalizedTriplet[] = [
  ...INDIAN_LOCATION_PRESETS.flatMap((p) => [p.state, p.district, p.location]),
  { en: 'Ramachandrapuram', hi: 'रामचंद्रपुरम', te: 'రామచంద్రపురం' },
  { en: 'Amalapuram Coastal Belt', hi: 'अमलापुरम तटीय क्षेत्र', te: 'అమలాపురం తీరప్రాంతం' },
  { en: 'Madhira Basin Area', hi: 'मधिरा बेसिन क्षेत्र', te: 'మధిర బేసిన్ ప్రాంతం' },
  { en: 'West Godavari', hi: 'पश्चिम गोदावरी', te: 'పశ్చిమ గోదావరి' },
  { en: 'Dr. B.R. Ambedkar Konaseema', hi: 'डॉ. बी.आर. अंबेडकर कोणसीमा', te: 'డా. బి.ఆర్. అంబేడ్కర్ కోనసీమ' },
  { en: 'Kakinada', hi: 'काकीनाडा', te: 'కాకినాడ' },
  { en: 'Krishna', hi: 'कृष्णा', te: 'కృష్ణా' },
  { en: 'Visakhapatnam', hi: 'विशाखापत्तनम', te: 'విశాఖపట్నం' },
  { en: 'Nellore', hi: 'नेल्लोर', te: 'నెల్లూరు' },
  { en: 'Prakasam', hi: 'प्रकाशम', te: 'ప్రకాశం' },
  { en: 'Anantapur', hi: 'अनंतपुर', te: 'అనంతపురం' },
  { en: 'Eluru', hi: 'एलुरु', te: 'ఏలూరు' },
  { en: 'Bapatla', hi: 'बापटला', te: 'బాపట్ల' },
  { en: 'Karumuru', hi: 'करुमुरु', te: 'కరుమూరు' },
  { en: 'Pallekona', hi: 'पल्लेकोना', te: 'పల్లెకోన' },
  { en: 'Chirakalavaripalem', hi: 'चिरकलावारिपालेम', te: 'చిరకాలవారిపాలెం' },
  { en: 'Nagaram', hi: 'नगरम', te: 'నగరం' },
  { en: 'Srikakulam', hi: 'श्रीकाकुलम', te: 'శ్రీకాకుళం' },
  { en: 'Vizianagaram', hi: 'विजयनगरम', te: 'విజయనగరం' },
  { en: 'Tirupati', hi: 'तिरुपति', te: 'తిరుపతి' },
  { en: 'Nalgonda', hi: 'नलगोंडा', te: 'నల్గొండ' },
  { en: 'Karimnagar', hi: 'करीमनगर', te: 'కరీంనగర్' },
  { en: 'Hyderabad', hi: 'हैदराबाद', te: 'హైదరాబాద్' },
  { en: 'Kerala', hi: 'केरल', te: 'కేరళ' },
  { en: 'West Bengal', hi: 'पश्चिम बंगाल', te: 'పశ్చిమ బెంగాల్' },
  { en: 'Bihar', hi: 'बिहार', te: 'బీహార్' },
  { en: 'Gujarat', hi: 'गुजरात', te: 'గుజరాత్' },
  { en: 'Assam', hi: 'असम', te: 'అస్సాం' },
  { en: 'Chhattisgarh', hi: 'छत्तीसगढ़', te: 'ఛత్తీస్‌గఢ్' },
  { en: 'Jharkhand', hi: 'झारखंड', te: 'జార్ఖండ్' },
  { en: 'India', hi: 'भारत', te: 'భారతదేశం' },
  { en: 'GPS Location', hi: 'जीपीएस लोकेशन', te: 'జీపీఎస్ స్థానం' },
  { en: 'GPS Farm Location', hi: 'जीपीएस खेत लोकेशन', te: 'జీపీఎస్ పొలం స్థానం' },
];

const KNOWN_CROPS: LocalizedTriplet[] = [
  { en: 'Paddy (MTU-1010)', hi: 'धान (एमटीयू-1010)', te: 'వరి (ఎంటీయూ-1010)' },
  { en: 'Paddy (BPT-5204)', hi: 'धान (बीपीटी-5204)', te: 'వరి (బీపీటీ-5204)' },
  { en: 'Paddy', hi: 'धान', te: 'వరి' },
  { en: 'Rice', hi: 'चावल / धान', te: 'వరి' },
  { en: 'Coconut', hi: 'नारियल', te: 'కొబ్బరి' },
  { en: 'Cotton', hi: 'कपास', te: 'పత్తి' },
  { en: 'Chilli', hi: 'मिर्च', te: 'మిరప' },
  { en: 'Black Gram', hi: 'उड़द', te: 'మినుము' },
  { en: 'Green Gram', hi: 'मूंग', te: 'పెసర' },
  { en: 'Maize', hi: 'मक्का', te: 'మొక్కజొన్న' },
  { en: 'Wheat', hi: 'गेहूँ', te: 'గోధుమ' },
  { en: 'Groundnut', hi: 'मूंगफली', te: 'వేరుశెనగ' },
  { en: 'Sugarcane', hi: 'गन्ना', te: 'చెరకు' },
  { en: 'Turmeric', hi: 'हल्दी', te: 'పసుపు' },
  { en: 'Tomato', hi: 'टमाटर', te: 'టమాటా' },
  { en: 'Banana', hi: 'केला', te: 'అరటి' },
  { en: 'Mango', hi: 'आम', te: 'మామిడి' },
  { en: 'Crop', hi: 'फसल', te: 'పంట' },
];

function foldAsciiForMatch(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function matchTriplet(value: string, list: readonly LocalizedTriplet[], language: Language): string | null {
  const clean = foldAsciiForMatch(value);
  if (!clean) return null;
  for (const item of list) {
    if (
      foldAsciiForMatch(item.en) === clean ||
      foldAsciiForMatch(item.hi) === clean ||
      foldAsciiForMatch(item.te) === clean
    ) {
      return item[language];
    }
  }
  return null;
}

export function localizeFarmerName(name: string, language: Language): string {
  return matchTriplet(name, KNOWN_FARMER_NAMES, language) ?? name;
}

export function localizeLocationText(locationText: string, language: Language): string {
  const trimmed = (locationText || '').trim();
  if (!trimmed) return trimmed;

  const direct = matchTriplet(trimmed, KNOWN_LOCATIONS, language);
  if (direct) return direct;

  if (trimmed.includes(',')) {
    return trimmed
      .split(',')
      .map((part) => localizeLocationText(part.trim(), language))
      .join(', ');
  }

  let result = trimmed;
  if (language === 'hi') {
    result = result
      .replace(/\bMandal\b/gi, 'मंडल')
      .replace(/\bDistrict\b/gi, 'जिला')
      .replace(/\bVillage\b/gi, 'गाँव')
      .replace(/\bCoastal Belt\b/gi, 'तटीय क्षेत्र')
      .replace(/\bBasin Area\b/gi, 'बेसिन क्षेत्र');
  } else if (language === 'te') {
    result = result
      .replace(/\bMandal\b/gi, 'మండలం')
      .replace(/\bDistrict\b/gi, 'జిల్లా')
      .replace(/\bVillage\b/gi, 'గ్రామం')
      .replace(/\bCoastal Belt\b/gi, 'తీరప్రాంతం')
      .replace(/\bBasin Area\b/gi, 'బేసిన్ ప్రాంతం');
  }
  return result;
}

export function canonicalizeLocationForGeocode(locationText: string): string {
  const trimmed = (locationText || '').trim();
  if (!trimmed) return '';

  const direct = matchTriplet(trimmed, KNOWN_LOCATIONS, 'en');
  if (direct) return direct;

  if (trimmed.includes(',')) {
    return trimmed
      .split(',')
      .map((part) => canonicalizeLocationForGeocode(part.trim()))
      .filter(Boolean)
      .join(', ');
  }

  return trimmed
    .replace(/\b(mandal|tehsil|taluka|taluk|block|village|district|dist\.?|belt|area)\b/gi, '')
    .replace(/(मंडल|मण्डल|तहसील|तालुका|ब्लाक|गाँव|गांव|जिला|तटीय क्षेत्र|बेसिन क्षेत्र)/g, '')
    .replace(/(మండలం|తహసీల్|తాలూకా|బ్లాక్|గ్రామం|జిల్లా|తీరప్రాంతం|బేసిన్ ప్రాంతం)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripParensForMatch(value: string): string {
  return foldAsciiForMatch(value.replace(/[()]/g, ' ').replace(/\s+/g, ' '));
}

export function findLocationPresetMatch(params: {
  state?: string;
  district?: string;
  location?: string;
}): IndianLocationPreset | undefined {
  const canonLoc = foldAsciiForMatch(canonicalizeLocationForGeocode(params.location || ''));
  const canonDist = foldAsciiForMatch(canonicalizeLocationForGeocode(params.district || ''));
  const canonLocNoParens = stripParensForMatch(canonicalizeLocationForGeocode(params.location || ''));

  const matchesTriplet = (triplet: LocalizedTriplet, target: string) =>
    Boolean(target) &&
    (foldAsciiForMatch(triplet.en) === target ||
      foldAsciiForMatch(triplet.hi) === target ||
      foldAsciiForMatch(triplet.te) === target);

  // 1. Exact match on both location & district
  if (canonLoc && canonDist) {
    const exactBoth = INDIAN_LOCATION_PRESETS.find(
      (p) => matchesTriplet(p.location, canonLoc) && matchesTriplet(p.district, canonDist)
    );
    if (exactBoth) return exactBoth;
  }

  // 2. Location match across presets (handles Repalle, Karumuru (Pallekona), Chirakalavaripalem (Nagaram), etc.)
  if (canonLoc) {
    const locMatch = INDIAN_LOCATION_PRESETS.find((p) => {
      if (matchesTriplet(p.location, canonLoc)) return true;
      const presetNoParens = stripParensForMatch(p.location.en);
      if (canonLocNoParens.length >= 4 && presetNoParens.includes(canonLocNoParens)) return true;
      const presetPrimary = stripParensForMatch(p.location.en.split('(')[0] || '');
      return presetPrimary.length >= 4 && canonLocNoParens === presetPrimary;
    });
    if (locMatch) return locMatch;
  }

  // 3. District fallback only when location is empty, matches district, or district has a unique preset
  if (canonDist) {
    const distMatches = INDIAN_LOCATION_PRESETS.filter((p) => matchesTriplet(p.district, canonDist));
    if (distMatches.length === 1) {
      return distMatches[0];
    }
    if (distMatches.length > 1 && (!canonLoc || canonLoc === canonDist)) {
      return distMatches[0];
    }
  }

  return undefined;
}

export function localizeCropName(crop: string, language: Language): string {
  const trimmed = (crop || '').trim();
  if (!trimmed) return trimmed;
  return matchTriplet(trimmed, KNOWN_CROPS, language) ?? trimmed;
}

export function localizeCropsList(crops: readonly string[], language: Language): string[] {
  return crops.map((c) => localizeCropName(c, language));
}

export function localizeAgentToolName(toolName: string, language: Language): string {
  if (language === 'en') return toolName;
  const mapHi: Record<string, string> = {
    analyze_weather_intelligence: 'मौसम विश्लेषण टूल',
    analyze_crop_intelligence: 'फसल निरीक्षण टूल',
    assess_kisan_rakshak_risk: 'किसान रक्षक जोखिम टूल',
    generate_farm_advisory: 'कृषि सलाह टूल',
    prepare_action_alerts: 'अलर्ट तैयारी टूल',
    format_voice_language_brief: 'भाषा और आवाज़ टूल',
  };
  const mapTe: Record<string, string> = {
    analyze_weather_intelligence: 'వాతావరణ విశ్లేషణ సాధనం',
    analyze_crop_intelligence: 'పంట పరిశీలన సాధనం',
    assess_kisan_rakshak_risk: 'కిసాన్ రక్షక్ ప్రమాద సాధనం',
    generate_farm_advisory: 'వ్యవసాయ సలహా సాధనం',
    prepare_action_alerts: 'హెచ్చరిక తయారీ సాధనం',
    format_voice_language_brief: 'భాష & వాయిస్ సాధనం',
  };
  return (language === 'hi' ? mapHi[toolName] : mapTe[toolName]) ?? toolName;
}

export function localizeLastUpdated(rawTimestamp: string, language: Language): string {
  const clean = (rawTimestamp || '').trim();
  if (language === 'en' || !clean) return clean;
  let formatted = clean.replace(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/, '$1 $2');
  if (language === 'hi') {
    formatted = formatted
      .replace(/\(Synthetic Timestamp\)/gi, '(सिंथेटिक समय)')
      .replace(/\bIST\b/g, 'भारतीय मानक समय');
    return formatted;
  }
  formatted = formatted
    .replace(/\(Synthetic Timestamp\)/gi, '(సింథటిక్ సమయం)')
    .replace(/\bIST\b/g, 'భారత కాలమానం');
  return formatted;
}

export function getLocalizedVerifiedContacts(language: Language): VerifiedEmergencyContact[] {
  if (language === 'hi') {
    return [
      {
        agency: 'राष्ट्रीय आपातकालीन प्रतिक्रिया प्रणाली (ईआरएसएस)',
        number: '112',
        scope: 'अखिल भारतीय · पुलिस, अग्निशमन और आपदा बचाव',
        notes: 'तत्काल जीवन सुरक्षा, बाढ़ बचाव या चक्रवात आपातकाल में 112 डायल करें।',
      },
      {
        agency: 'एनडीएमए आपदा प्रबंधन हेल्पलाइन',
        number: '1078',
        scope: 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण',
        notes: 'आधिकारिक आपदा सलाह, चक्रवात आश्रय और राज्य राहत समन्वय के लिए।',
      },
      {
        agency: 'किसान कॉल सेंटर (कृषि मंत्रालय)',
        number: '1800-180-1551',
        scope: 'अखिल भारतीय · टोल-फ्री (06:00–22:00 भारतीय मानक समय)',
        notes: 'कृषि विशेषज्ञों और कृषि विज्ञान केंद्र (केवीके) सलाहकारों से सीधे जुड़ें।',
      },
      {
        agency: 'राज्य / जिला आपातकालीन संचालन केंद्र',
        number: '1070 / 1077',
        scope: 'राज्य (1070) और जिला (1077) राहत नियंत्रण कक्ष',
        notes: 'स्थानीय जलाशय जल निकासी, मंडल जलभराव सूचना और राहत शिविरों की पुष्टि करें।',
      },
    ];
  }
  if (language === 'te') {
    return [
      {
        agency: 'జాతీయ అత్యవసర స్పందన వ్యవస్థ (ఈఆర్ఎస్ఎస్)',
        number: '112',
        scope: 'భారతదేశం అంతటా · పోలీస్, ఫైర్ & విపత్తు రక్షణ',
        notes: 'ప్రాణ రక్షణ, వరద సహాయం లేదా తుఫాన్ అత్యవసర సమయాల్లో 112కు కాల్ చేయండి.',
      },
      {
        agency: 'ఎన్డీఎంఏ విపత్తు నిర్వహణ హెల్ప్‌లైన్',
        number: '1078',
        scope: 'జాతీయ విపత్తు నిర్వహణ సంస్థ',
        notes: 'అధికారిక విపత్తు సూచనలు, తుఫాన్ ఆశ్రయాలు మరియు రాష్ట్ర సహాయ సమన్వయం కోసం.',
      },
      {
        agency: 'కిసాన్ కాల్ సెంటర్ (వ్యవసాయ మంత్రిత్వ శాఖ)',
        number: '1800-180-1551',
        scope: 'భారతదేశం అంతటా · టోల్-ఫ్రీ (06:00–22:00 భారత కాలమానం)',
        notes: 'వ్యవసాయ నిపుణులు మరియు కృషి విజ్ఞాన కేంద్రం (కేవీకే) శాస్త్రవేత్తలతో మాట్లాడండి.',
      },
      {
        agency: 'రాష్ట్ర / జిల్లా అత్యవసర నియంత్రణ కేంద్రం',
        number: '1070 / 1077',
        scope: 'రాష్ట్ర (1070) & జిల్లా (1077) విపత్తు కంట్రోల్ రూమ్‌లు',
        notes: 'స్థానిక రిజర్వాయర్ నీటి విడుదల, మండల ముంపు సమాచారం మరియు సహాయ శిబిరాలను తెలుసుకోండి.',
      },
    ];
  }
  return [
    {
      agency: 'National Emergency Response System (ERSS)',
      number: '112',
      scope: 'All India · Police, Fire & Disaster Rescue',
      notes: 'Dial 112 during immediate life-safety, flood rescue, or cyclone emergencies.',
    },
    {
      agency: 'NDMA Disaster Management Helpline',
      number: '1078',
      scope: 'National Disaster Management Authority',
      notes: 'For official disaster advisories, cyclone shelters, and state relief coordination.',
    },
    {
      agency: 'Kisan Call Centre (Ministry of Agriculture)',
      number: '1800-180-1551',
      scope: 'All India · Toll-Free (06:00–22:00 IST)',
      notes: 'Connects directly with agricultural graduates and Krishi Vigyan Kendra (KVK) experts.',
    },
    {
      agency: 'State / District Emergency Operations Centre',
      number: '1070 / 1077',
      scope: 'State (1070) & District (1077) Relief Control Rooms',
      notes: 'Verify local reservoir releases, mandal-level inundation notices, and relief camps.',
    },
  ];
}

export function localizeScenarioDefinition(
  sc: DemoScenarioDefinition,
  language: Language
): DemoScenarioDefinition {
  if (language === 'en') return sc;

  if (sc.id === 'heavy-rainfall-paddy') {
    if (language === 'hi') {
      return {
        ...sc,
        title: 'परिदृश्य 1: धान किसान के लिए भारी वर्षा चेतावनी',
        shortLabel: 'भारी वर्षा · धान',
        summary:
          'सिंथेटिक परीक्षण परिदृश्य: पूर्वी गोदावरी जलोढ़ डेल्टा में फूल आने वाली धान की फसल पर 145 मिमी/24 घंटे बारिश का अनुमान।',
        defaultQuery:
          'कल मेरी फूल आने वाली धान की फसल के लिए भारी बारिश का अनुमान है। मेरे किसान रक्षक जोखिम स्तर, मौसम अनिश्चितता और घटना से पहले/दौरान/बाद की व्यावहारिक सुरक्षा योजना बताएं।',
      };
    }
    return {
      ...sc,
      title: 'పరిస్థితి 1: వరి రైతుకు భారీ వర్షపు హెచ్చరిక',
      shortLabel: 'భారీ వర్షం · వరి',
      summary:
        'సింథటిక్ పరీక్ష పరిస్థితి: తూర్పు గోదావరి డెల్టాలో పూత దశలో ఉన్న వరి పంటకు 24 గంటల్లో 145 మి.మీ వర్ష సూచన.',
      defaultQuery:
        'రేపు నా పూత దశలో ఉన్న వరి పొలానికి భారీ వర్ష సూచన ఉంది. నా కిసాన్ రక్షక్ ప్రమాద స్థాయి, వాతావరణ అనిశ్చితి మరియు ముందు/సమయంలో/తర్వాత రక్షణ ప్రణాళికను చెప్పండి.',
    };
  }

  if (sc.id === 'cyclone-coastal') {
    if (language === 'hi') {
      return {
        ...sc,
        title: 'परिदृश्य 2: तटीय कृषि क्षेत्र की ओर बढ़ता चक्रवात',
        shortLabel: 'तटीय चक्रवात खतरा',
        summary:
          'सिंथेटिक परीक्षण परिदृश्य: तटीय कृष्णा/कोणसीमा क्षेत्र की ओर 92 किमी/घंटा हवा (झोंके 115 किमी/घंटा) और 210 मिमी बारिश के साथ चक्रवात।',
        defaultQuery:
          '36 घंटों में हमारे तटीय जिले की ओर चक्रवात आने का अनुमान है। मेरी धान की फसल कटाई के करीब है। मेरी किसान रक्षक जोखिम श्रेणी और तत्काल सुरक्षा योजना क्या है?',
      };
    }
    return {
      ...sc,
      title: 'పరిస్థితి 2: తీరప్రాంత వ్యవసాయంపై తుఫాను ముప్పు',
      shortLabel: 'తీరప్రాంత తుఫాన్ ముప్పు',
      summary:
        'సింథటిక్ పరీక్ష పరిస్థితి: కోనసీమ/కృష్ణా తీరప్రాంతం వైపు 92 కి.మీ/గం గాలులు (గాలి ఉధృతి 115 కి.మీ/గం) మరియు 210 మి.మీ వర్షంతో తుఫాన్.',
      defaultQuery:
        '36 గంటల్లో మా తీరప్రాంత జిల్లా వైపు తుఫాను వస్తోంది. నా వరి పంట కోతకు సిద్ధంగా ఉంది. నా కిసాన్ రక్షక్ ప్రమాద స్థాయి మరియు తక్షణ పంట రక్షణ ప్రణాళిక ఏమిటి?',
    };
  }

  // waterlogging-flood
  if (language === 'hi') {
    return {
      ...sc,
      title: 'परिदृश्य 3: कृषि भूमि पर जलभराव और बाढ़ का जोखिम',
      shortLabel: 'जलभराव और बाढ़',
      summary:
        'सिंथेटिक परीक्षण परिदृश्य: निचली काली कपास मिट्टी में नहर के ओवरफ्लो से जलभराव और आगे बारिश का पूर्वानुमान।',
      defaultQuery:
        'नहर के बैकफ्लो के बाद हमारे निचले काली कपास खेतों में पानी भरा है और आगे बारिश का अनुमान है। फसल सड़न जोखिम, किसान रक्षक तैयारी और तत्काल जल निकासी कदम जांचें।',
    };
  }
  return {
    ...sc,
    title: 'పరిస్థితి 3: వ్యవసాయ భూమిలో నీటి నిల్వ మరియు వరద ముప్పు',
    shortLabel: 'నీటి నిల్వ & వరద',
    summary:
      'సింథటిక్ పరీక్ష పరిస్థితి: లోతట్టు నల్లరేగడి భూమిలో కాలువ పొంగి నీరు నిలిచి ఉంది మరియు మరింత వర్ష సూచన ఉంది.',
    defaultQuery:
      'కాలువ నీరు వెనక్కి రావడంతో మా లోతట్టు నల్లరేగడి పొలాల్లో నీరు నిలిచి ఉంది, ఇంకా వర్షం సూచన ఉంది. పంట కుళ్ళు ప్రమాదం, కిసాన్ రక్షక్ సన్నద్ధత మరియు తక్షణ డ్రైనేజీ చర్యలు చెప్పండి.',
  };
}

export function localizeWeatherContext(weather: WeatherContext, language: Language): WeatherContext {
  if (language === 'en') return weather;

  const localizedTimestamp = localizeLastUpdated(weather.lastUpdated, language);

  if (weather.scenarioId === 'live') {
    const rawPlacePart =
      weather.coordinates?.resolvedName || weather.scenarioTitle.replace(/^Live Field Weather ·\s*/, '');
    const placePart = localizeLocationText(rawPlacePart, language);
    const cond = localizeWeatherCondition(weather.weatherConditionLabel, language);
    const title =
      language === 'hi' ? `लाइव खेत मौसम · ${placePart}` : `లైవ్ పొలం వాతావరణం · ${placePart}`;
    const dataSource =
      weather.coordinates
        ? language === 'hi'
          ? `ओपन-मेटियो लाइव मौसम, ऊँचाई व बाढ़ फ़ीड (${weather.coordinates.lat.toFixed(2)}°उ, ${weather.coordinates.lon.toFixed(2)}°पू)`
          : `ఓపెన్-మెటియో లైవ్ వాతావరణం, ఎత్తు & వరద ఫీడ్ (${weather.coordinates.lat.toFixed(2)}°ఉ, ${weather.coordinates.lon.toFixed(2)}°తూ)`
        : language === 'hi'
        ? 'ओपन-मेटियो लाइव मौसम, ऊँचाई व बाढ़ फ़ीड'
        : 'ఓపెన్-మెటియో లైవ్ వాతావరణం, ఎత్తు & వరద ఫీడ్';

    const plains = weather.plains;
    const elevSuffixHi =
      plains?.elevationM !== null && plains?.elevationM !== undefined
        ? `, ऊँचाई ${plains.elevationM} मी. (${localizePlainType(plains.plainType, 'hi')})`
        : '';
    const elevSuffixTe =
      plains?.elevationM !== null && plains?.elevationM !== undefined
        ? `, ఎత్తు ${plains.elevationM} మీ. (${localizePlainType(plains.plainType, 'te')})`
        : '';
    const riverSuffixHi =
      plains?.riverDischargeM3s !== null && plains?.riverDischargeM3s !== undefined
        ? `, नदी प्रवाह ${plains.riverDischargeM3s} मी³/से`
        : '';
    const riverSuffixTe =
      plains?.riverDischargeM3s !== null && plains?.riverDischargeM3s !== undefined
        ? `, నది ప్రవాహం ${plains.riverDischargeM3s} మీ³/సె`
        : '';

    const observationNote =
      language === 'hi'
        ? weather.temperatureC === null
          ? 'लाइव मौसम, मैदानी ऊँचाई, मिट्टी की नमी और नदी बेसिन डेटा प्राप्त किया जा रहा है...'
          : `लाइव स्टेशन/ग्रिड रीडिंग: ${cond || 'सामान्य'}, ${weather.temperatureC ?? '—'}°से., ${
              weather.humidityPct ?? '—'
            }% नमी, हवा ${weather.windSpeedKmh ?? '—'} किमी/घंटा (झोंके ${
              weather.windGustKmh ?? '—'
            } किमी/घंटा)${elevSuffixHi}${riverSuffixHi}।`
        : weather.temperatureC === null
        ? 'లైవ్ వాతావరణం, మైదాన ఎత్తు, నేల తేమ మరియు నదీ పరీవాహక డేటాను పొందుతోంది...'
        : `లైవ్ స్టేషన్/గ్రిడ్ రీడింగ్: ${cond || 'సాధారణం'}, ${weather.temperatureC ?? '—'}°సె., ${
            weather.humidityPct ?? '—'
          }% తేమ, గాలి ${weather.windSpeedKmh ?? '—'} కి.మీ/గం (ఉధృతి ${
            weather.windGustKmh ?? '—'
          } కి.మీ/గం)${elevSuffixTe}${riverSuffixTe}.`;

    const forecastUncertainty =
      language === 'hi'
        ? '72 घंटे के मौसम और ग्लोफ़ास नदी प्रवाह मान संख्यात्मक मॉडल अनुमान हैं; गाँव स्तर पर वर्षा व अपवाह बदल सकता है। आधिकारिक जिला आपदा अलर्ट के लिए हमेशा आईएमडी मौसम या राज्य एसडीएमए (1070/1077) की जांच करें।'
        : '72 గంటల వాతావరణం మరియు గ్లోఫాస్ నది ప్రవాహ విలువలు మోడల్ అంచనాలు; గ్రామ స్థాయిలో వర్షపాతం మారవచ్చు. అధికారిక జిల్లా విపత్తు హెచ్చరికల కోసం ఐఎండీ మౌసం లేదా రాష్ట్ర ఎస్‌డీఎంఏ (1070/1077) చూడండి.';

    return {
      ...weather,
      scenarioTitle: title,
      dataSource,
      lastUpdated: localizedTimestamp,
      observationNote,
      forecastUncertainty,
      weatherConditionLabel: cond,
    };
  }

  if (weather.scenarioId === 'custom') {
    return {
      ...weather,
      scenarioTitle:
        language === 'hi' ? 'किसान द्वारा दर्ज जोखिम इनपुट' : 'రైతు నమోదు చేసిన పొలం పరిస్థితి',
      dataSource:
        language === 'hi' ? 'किसान द्वारा दर्ज स्थानीय अवलोकन / पूर्वानुमान' : 'రైతు నమోదు చేసిన స్థానిక సమాచారం',
      lastUpdated: localizedTimestamp,
      observationNote:
        language === 'hi'
          ? 'यह मूल्यांकन किसान द्वारा दर्ज स्थानीय मानों पर आधारित है।'
          : 'ఈ అంచనా రైతు స్వయంగా నమోదు చేసిన స్థానిక వివరాలపై ఆధారపడి ఉంది.',
      forecastUncertainty:
        language === 'hi'
          ? 'आधिकारिक जिला स्तर की चेतावनी के लिए आईएमडी मौसम और राज्य एसडीएमए (1070/1077) बुलेटिन देखें।'
          : 'అధికారిక జిల్లా హెచ్చరికల కోసం ఐఎండీ మౌసం మరియు రాష్ట్ర ఎస్‌డీఎంఏ (1070/1077) బుల్లెటిన్‌ను తనిఖీ చేయండి.',
      verifiedWarningSource: weather.verifiedWarningLabel
        ? language === 'hi'
          ? 'किसान द्वारा सत्यापित आधिकारिक बुलेटिन'
          : 'రైతు ధృవీకరించిన అధికారిక బులెటిన్'
        : null,
    };
  }

  if (weather.scenarioId === 'heavy-rainfall-paddy') {
    return language === 'hi'
      ? {
          ...weather,
          scenarioTitle: 'परिदृश्य 1: भारी वर्षा चेतावनी (सिंथेटिक परीक्षण डेटा)',
          dataSource: 'एग्रीगार्ड सिंथेटिक परीक्षण परिदृश्य #1 (नकली जिला मौसम फ़ीड)',
          lastUpdated: '2026-11-22 05:30 भारतीय मानक समय (सिंथेटिक समय)',
          observationNote:
            'पिछले 6 घंटे का अवलोकन: 18 मिमी हल्की बारिश दर्ज (सिंथेटिक)। अगले 24–72 घंटे के मान मॉडल पूर्वानुमान हैं।',
          forecastUncertainty:
            'स्थानीय बादलों के अनुसार मंडलों में कुल वर्षा ±25–35 मिमी तक भिन्न हो सकती है।',
          verifiedWarningLabel: 'सिंथेटिक ऑरेंज एडवाइजरी: भारी से बहुत भारी बारिश',
        }
      : {
          ...weather,
          scenarioTitle: 'పరిస్థితి 1: భారీ వర్షపు హెచ్చరిక (సింథటిక్ పరీక్ష డేటా)',
          dataSource: 'అగ్రిగార్డ్ సింథటిక్ పరీక్ష పరిస్థితి #1 (నమూనా జిల్లా వాతావరణం)',
          lastUpdated: '2026-11-22 05:30 భారత కాలమానం (సింథటిక్ సమయం)',
          observationNote:
            'గత 6 గంటల పరిశీలన: 18 మి.మీ తేలికపాటి వర్షం నమోదైంది (నమూనా). రాబోయే 24–72 గంటల విలువలు మోడల్ అంచనాలు మాత్రమే.',
          forecastUncertainty:
            'స్థానిక మేఘాల కారణంగా మండలాల వారీగా వర్షపాతం ±25–35 మి.మీ మారవచ్చు.',
          verifiedWarningLabel: 'సింథటిక్ ఆరెంజ్ హెచ్చరిక: భారీ నుండి అతి భారీ వర్షం',
        };
  }

  if (weather.scenarioId === 'cyclone-coastal') {
    return language === 'hi'
      ? {
          ...weather,
          scenarioTitle: 'परिदृश्य 2: तटीय चक्रवात दृष्टिकोण (सिंथेटिक परीक्षण डेटा)',
          dataSource: 'एग्रीगार्ड सिंथेटिक परीक्षण परिदृश्य #2 (नकली तटीय चक्रवात ट्रैक)',
          lastUpdated: '2026-11-22 05:30 भारतीय मानक समय (सिंथेटिक समय)',
          observationNote:
            'वर्तमान तटीय अवलोकन: 24 किमी/घंटा तेज हवा और बादल (सिंथेटिक)। लैंडफॉल मार्ग में दिशात्मक अनिश्चितता रहती है।',
          forecastUncertainty:
            'चक्रवात का तट पार करने का स्थान 40–70 किमी बदल सकता है; हवा और ज्वार का असर समय पर निर्भर करेगा।',
          verifiedWarningLabel: 'सिंथेटिक रेड चक्रवात अलर्ट: तेज आंधी और तटीय उछाल जोखिम',
        }
      : {
          ...weather,
          scenarioTitle: 'పరిస్థితి 2: తీరప్రాంత తుఫాను ముప్పు (సింథటిక్ పరీక్ష డేటా)',
          dataSource: 'అగ్రిగార్డ్ సింథటిక్ పరీక్ష పరిస్థితి #2 (నమూనా తుఫాన్ ట్రాక్)',
          lastUpdated: '2026-11-22 05:30 భారత కాలమానం (సింథటిక్ సమయం)',
          observationNote:
            'ప్రస్తుత తీర పరిశీలన: గంటకు 24 కి.మీ ఈదురుగాలులు, మేఘావృతం (నమూనా). తుఫాన్ తీరం దాటే దిశలో మార్పులు ఉండవచ్చు.',
          forecastUncertainty:
            'తుఫాన్ తీరం దాటే ప్రాంతం 40–70 కి.మీ మారవచ్చు; ఆటుపోట్ల సమయాన్ని బట్టి గాలులు, అలల ప్రభావం ఉంటుంది.',
          verifiedWarningLabel: 'సింథటిక్ రెడ్ తుఫాన్ హెచ్చరిక: పెనుగాలులు & సముద్రపు పోటు ముప్పు',
        };
  }

  // waterlogging-flood
  return language === 'hi'
    ? {
        ...weather,
        scenarioTitle: 'परिदृश्य 3: जलभराव और बाढ़ जोखिम (सिंथेटिक परीक्षण डेटा)',
        dataSource: 'एग्रीगार्ड सिंथेटिक परीक्षण परिदृश्य #3 (नकली बेसिन जल विज्ञान)',
        lastUpdated: '2026-11-22 05:30 भारतीय मानक समय (सिंथेटिक समय)',
        observationNote:
          'पुष्ट खेत रिपोर्ट (सिंथेटिक): 48 घंटे में 96 मिमी बारिश + निचली मेड़ों के पास सक्रिय जलभराव।',
        forecastUncertainty:
          'ऊपरी बैराज से पानी छोड़ने का समय अपुष्ट है; पानी पीछे लौटने पर जलमग्नता 24–48 घंटे बढ़ सकती है।',
        verifiedWarningLabel: 'सिंथेटिक बाढ़ निगरानी: बेसिन जलभराव और जल निकासी तनाव',
      }
    : {
        ...weather,
        scenarioTitle: 'పరిస్థితి 3: నీటి నిల్వ & వరద ముప్పు (సింథటిక్ పరీక్ష డేటా)',
        dataSource: 'అగ్రిగార్డ్ సింథటిక్ పరీక్ష పరిస్థితి #3 (నమూనా బేసిన్ సమాచారం)',
        lastUpdated: '2026-11-22 05:30 భారత కాలమానం (సింథటిక్ సమయం)',
        observationNote:
          'క్షేత్ర పరిశీలన (నమూనా): 48 గంటల్లో 96 మి.మీ వర్షం + లోతట్టు గట్ల వద్ద నీరు నిలిచి ఉంది.',
        forecastUncertainty:
          'ఎగువ ప్రాజెక్టుల నీటి విడుదల సమయం ఇంకా నిర్ధారణ కాలేదు; బ్యాక్‌ఫ్లో కొనసాగితే 24–48 గంటలు నీరు నిలవవచ్చు.',
        verifiedWarningLabel: 'సింథటిక్ వరద నిఘా: బేసిన్ నీటి నిల్వ & డ్రైనేజీ ఒత్తిడి',
      };
}

export function localizeSeedAlert(alert: FarmAlert, language: Language): FarmAlert {
  if (language === 'en' || alert.id !== 'seed-alert-1') return alert;
  if (language === 'hi') {
    return {
      ...alert,
      title: 'निचले धान मेड़ जल निकासी मार्गों की जांच करें',
      reason:
        'सिंथेटिक परिदृश्य 1 में निचली जलोढ़ भूमि पर 145 मिमी/24 घंटे बारिश का अनुमान है।',
      actionRequired:
        'शाम को बारिश तेज होने से पहले मुख्य निकास नालियों से गाद और खरपतवार की रुकावट हटाएँ।',
    };
  }
  return {
    ...alert,
    title: 'లోతట్టు వరి పొలం గట్ల నీటి పారుదల కాలువలను తనిఖీ చేయండి',
    reason:
      'సింథటిక్ పరిస్థితి 1 ప్రకారం లోతట్టు ఒండ్రు నేలపై 24 గంటల్లో 145 మి.మీ వర్ష సూచన ఉంది.',
    actionRequired:
      'సాయంత్రం వర్షం పెరగకముందే ప్రధాన నీటి పారుదల మార్గాల్లోని పూడిక మరియు కలుపును తొలగించండి.',
  };
}

export function localizeSeedRecommendation(
  rec: AdvisoryRecommendation,
  language: Language
): AdvisoryRecommendation {
  if (language === 'en') return rec;
  const localizedCrop = localizeCropName(rec.crop, language);
  if (rec.id !== 'seed-rec-1') {
    return { ...rec, crop: localizedCrop };
  }
  if (language === 'hi') {
    return {
      ...rec,
      crop: localizedCrop,
      title: 'फूल आने वाली धान की फसल के लिए वर्षा-पूर्व जल निकासी और खाद सुरक्षा',
      summary:
        'भारी बारिश से पहले बाली डूबने से बचाएं और पत्तियों पर छिड़काव की बर्बादी रोकें।',
      steps: [
        'बाहरी जल निकासी नालियाँ साफ़ रखें ताकि खेत में खड़ा पानी 5–8 सेमी से अधिक न हो।',
        'भारी बारिश गुज़रने के 24 घंटे बाद तक यूरिया टॉप-ड्रेसिंग या कीटनाशक छिड़काव रोक दें।',
        'बीज की बोरियाँ और मोटर स्टार्टर ऊँचे सूखे स्थान पर रखें।',
      ],
    };
  }
  return {
    ...rec,
    crop: localizedCrop,
    title: 'పూత దశలో ఉన్న వరి పంటకు వర్షాపూర్వ నీటి పారుదల & ఎరువుల రక్షణ',
    summary:
      'భారీ వర్షానికి ముందు కంకులు నీట మునగకుండా కాపాడండి మరియు పిచికారీ మందులు వృథా కాకుండా ఆపండి.',
    steps: [
      'పొలం గట్ల బయట నీటి పారుదల కాలువలను శుభ్రంగా ఉంచండి, నిలిచే నీరు 5–8 సెం.మీ కంటే ఎక్కువ కాకుండా చూడండి.',
      'భారీ వర్షం తగ్గిన 24 గంటల వరకు యూరియా వేయడం లేదా పురుగుమందు పిచికారీ ఆపివేయండి.',
      'విత్తన బస్తాలు మరియు మోటార్ స్టార్టర్లను ఎత్తైన పొడి ప్రదేశానికి తరలించండి.',
    ],
  };
}

export function localizePriorityLabel(
  priority: FarmAlert['priority'] | 'Immediate' | 'High' | 'Standard',
  language: Language
): string {
  if (language === 'hi') {
    const map: Record<string, string> = {
      Urgent: 'अत्यावश्यक',
      Immediate: 'तत्काल',
      High: 'उच्च',
      Moderate: 'मध्यम',
      Standard: 'सामान्य',
      Low: 'कम',
    };
    return map[priority] ?? priority;
  }
  if (language === 'te') {
    const map: Record<string, string> = {
      Urgent: 'అత్యవసరం',
      Immediate: 'తక్షణం',
      High: 'అధికం',
      Moderate: 'మధ్యస్థం',
      Standard: 'సాధారణం',
      Low: 'తక్కువ',
    };
    return map[priority] ?? priority;
  }
  return priority;
}

export function localizeGuidanceType(
  guidanceType: AdvisoryRecommendation['guidanceType'],
  language: Language
): string {
  if (language === 'hi') {
    return guidanceType === 'Requires KVK / Expert Confirmation'
      ? 'केवीके / विशेषज्ञ पुष्टि आवश्यक'
      : 'सामान्य कृषि मार्गदर्शन';
  }
  if (language === 'te') {
    return guidanceType === 'Requires KVK / Expert Confirmation'
      ? 'కేవీకే / నిపుణుల నిర్ధారణ అవసరం'
      : 'సాధారణ వ్యవసాయ సూచన';
  }
  return guidanceType;
}

const CROP_HEALTH_LABELS: Record<Language, Record<CropHealthStatus, string>> = {
  en: {
    Healthy: 'Healthy',
    'Mild Stress': 'Mild Stress',
    'Moderate Issue': 'Moderate Issue',
    'Severe / Critical': 'Severe / Critical',
    'Unclear Image': 'Unclear Image',
  },
  hi: {
    Healthy: 'स्वस्थ फसल',
    'Mild Stress': 'हल्का तनाव',
    'Moderate Issue': 'मध्यम समस्या',
    'Severe / Critical': 'गंभीर समस्या',
    'Unclear Image': 'अस्पष्ट फोटो',
  },
  te: {
    Healthy: 'ఆరోగ్యంగా ఉంది',
    'Mild Stress': 'తేలికపాటి ఒత్తిడి',
    'Moderate Issue': 'మధ్యస్థ సమస్య',
    'Severe / Critical': 'తీవ్రమైన సమస్య',
    'Unclear Image': 'అస్పష్టమైన ఫోటో',
  },
};

export function localizeCropHealthStatus(
  status: CropHealthStatus,
  language: Language
): string {
  return CROP_HEALTH_LABELS[language]?.[status] ?? status;
}

const PROBLEM_CATEGORY_LABELS: Record<Language, Record<CropProblemCategory, string>> = {
  en: {
    Disease: 'Disease',
    Pest: 'Pest',
    'Nutrient Deficiency': 'Nutrient Deficiency',
    'Water / Weather Stress': 'Water / Weather Stress',
    'Weed / Physical Damage': 'Weed / Physical Damage',
    Unclear: 'Unclear',
  },
  hi: {
    Disease: 'रोग / फफूंद',
    Pest: 'कीट प्रकोप',
    'Nutrient Deficiency': 'पोषक तत्व की कमी',
    'Water / Weather Stress': 'जल / मौसम तनाव',
    'Weed / Physical Damage': 'खरपतवार / भौतिक क्षति',
    Unclear: 'अस्पष्ट',
  },
  te: {
    Disease: 'వ్యాధి / తెగులు',
    Pest: 'పురుగుల ఉధృతి',
    'Nutrient Deficiency': 'పోషక లోపం',
    'Water / Weather Stress': 'నీరు / వాతావరణ ఒత్తిడి',
    'Weed / Physical Damage': 'కలుపు / భౌతిక నష్టం',
    Unclear: 'అస్పష్టం',
  },
};

export function localizeProblemCategory(
  category: CropProblemCategory,
  language: Language
): string {
  return PROBLEM_CATEGORY_LABELS[language]?.[category] ?? category;
}

export function localizeModelUsed(
  model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite',
  language: Language
): string {
  if (model === 'gemini-3.1-flash-lite') {
    return language === 'hi'
      ? 'जेमिनी 3.1 फ्लैश-लाइट'
      : language === 'te'
      ? 'జెమినీ 3.1 ఫ్లాష్-లైట్'
      : 'Gemini 3.1 Flash-Lite';
  }
  return language === 'hi'
    ? 'जेमिनी 4 फ्लैश'
    : language === 'te'
    ? 'జెమినీ 4 ఫ్లాష్'
    : 'Gemini 4 Flash (gemini-4-hydrogen)';
}

const PLAIN_TYPE_LABELS: Record<Language, Record<PlainClassification, string>> = {
  en: {
    'Low-Lying Coastal / Delta Plain': 'Low-Lying Coastal / Delta Plain',
    'Alluvial / River Basin Plain': 'Alluvial / River Basin Plain',
    'Inland Agricultural Plain': 'Inland Agricultural Plain',
    'Sloping Plain / Foothill Valley': 'Sloping Plain / Foothill Valley',
    'Upland / Plateau Plain': 'Upland / Plateau Plain',
    Unknown: 'Unknown',
  },
  hi: {
    'Low-Lying Coastal / Delta Plain': 'निचला तटीय / डेल्टा मैदान',
    'Alluvial / River Basin Plain': 'जलोढ़ / नदी बेसिन मैदान',
    'Inland Agricultural Plain': 'अंतर्देशीय कृषि मैदान',
    'Sloping Plain / Foothill Valley': 'ढलानयुक्त मैदान / घाटी',
    'Upland / Plateau Plain': 'ऊँचा पठारी मैदान',
    Unknown: 'अज्ञात',
  },
  te: {
    'Low-Lying Coastal / Delta Plain': 'లోతట్టు తీర / డెల్టా మైదానం',
    'Alluvial / River Basin Plain': 'ఒండ్రు / నదీ పరీవాహక మైదానం',
    'Inland Agricultural Plain': 'లోతట్టు వ్యవసాయ మైదానం',
    'Sloping Plain / Foothill Valley': 'వాలు మైదానం / లోయ ప్రాంతం',
    'Upland / Plateau Plain': 'ఎత్తైన పీఠభూమి మైదానం',
    Unknown: 'తెలియదు',
  },
};

export function localizePlainType(plainType: PlainClassification, language: Language): string {
  return PLAIN_TYPE_LABELS[language]?.[plainType] ?? plainType;
}

const DRAINAGE_SLOPE_LABELS: Record<Language, Record<DrainageSlopeProfile, string>> = {
  en: {
    'Flat Basin / Slow Runoff': 'Flat Basin / Slow Runoff',
    'Gentle Plain Slope': 'Gentle Plain Slope',
    'Natural Drainage Slope': 'Natural Drainage Slope',
    Unknown: 'Unknown',
  },
  hi: {
    'Flat Basin / Slow Runoff': 'समतल बेसिन / धीमी निकासी',
    'Gentle Plain Slope': 'हल्की मैदानी ढलान',
    'Natural Drainage Slope': 'प्राकृतिक जल निकासी ढलान',
    Unknown: 'अज्ञात',
  },
  te: {
    'Flat Basin / Slow Runoff': 'సమతల బేసిన్ / నెమ్మదైన నీటి ప్రవాహం',
    'Gentle Plain Slope': 'తేలికపాటి మైదాన వాలు',
    'Natural Drainage Slope': 'సహజ నీటి పారుదల వాలు',
    Unknown: 'తెలియదు',
  },
};

export function localizeDrainageSlopeProfile(
  profile: DrainageSlopeProfile,
  language: Language
): string {
  return DRAINAGE_SLOPE_LABELS[language]?.[profile] ?? profile;
}

const RIVER_BASIN_LABELS: Record<Language, Record<RiverBasinStatus, string>> = {
  en: {
    'Normal Flow': 'Normal Flow',
    'Elevated Runoff': 'Elevated Runoff',
    'High Flood Discharge': 'High Flood Discharge',
    Unavailable: 'Unavailable',
  },
  hi: {
    'Normal Flow': 'सामान्य नदी प्रवाह',
    'Elevated Runoff': 'बढ़ता बेसिन अपवाह',
    'High Flood Discharge': 'उच्च बाढ़ जल निकासी',
    Unavailable: 'उपलब्ध नहीं',
  },
  te: {
    'Normal Flow': 'సాధారణ నది ప్రవాహం',
    'Elevated Runoff': 'పెరుగుతున్న బేసిన్ ప్రవాహం',
    'High Flood Discharge': 'అధిక వరద ప్రవాహం',
    Unavailable: 'అందుబాటులో లేదు',
  },
};

export function localizeRiverBasinStatus(
  status: RiverBasinStatus,
  language: Language
): string {
  return RIVER_BASIN_LABELS[language]?.[status] ?? status;
}

