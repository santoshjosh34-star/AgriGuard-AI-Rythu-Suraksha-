import {
  localizeCropHealthStatus,
  localizeCropsList,
  localizeGrowthStage,
  localizeLocationText,
  localizePlainType,
  localizePriorityLabel,
  localizeRiskLevel,
  localizeRiverBasinStatus,
  localizeSeedAlert,
  localizeSeedRecommendation,
  localizeSoilType,
  localizeWeatherContext,
} from './domainTranslations.ts';
import type {
  AdvisoryRecommendation,
  CropPhotoDiagnosis,
  FarmAlert,
  FarmerProfile,
  KisanRakshakAssessment,
  Language,
  NavSection,
  WeatherContext,
} from '../types/agriguard.ts';

export type DoubtTopicId =
  | 'highlighted'
  | 'overview'
  | 'kisan-rakshak'
  | 'weather'
  | 'crop'
  | 'recommendations'
  | 'alerts';

export interface DoubtContextPayload {
  topicId: DoubtTopicId;
  topicLabel: string;
  readableText: string;
  promptWithContext: (question: string) => string;
}

export interface SpeechVoiceLike {
  lang: string;
  name?: string;
  localService?: boolean;
}

export const DEFAULT_SOFT_VOICE_VOLUME = 0.78;

const SOFT_VOICE_HINTS = [
  'natural',
  'neural',
  'online',
  'google',
  'shruti',
  'vani',
  'swara',
  'lekha',
  'heera',
  'neerja',
  'kalpana',
  'aria',
  'jenny',
  'samantha',
];

function scoreVoiceSoftness(voice: SpeechVoiceLike, language: Language): number {
  const lang = voice.lang.toLowerCase();
  const name = (voice.name ?? '').toLowerCase();
  const targetPrefix = language === 'hi' ? 'hi' : language === 'te' ? 'te' : 'en';
  const exactLocale = language === 'hi' ? 'hi-in' : language === 'te' ? 'te-in' : 'en-in';

  let score = 0;
  if (lang === exactLocale) score += 100;
  else if (lang.startsWith(targetPrefix)) score += 60;
  else return -1;

  for (const hint of SOFT_VOICE_HINTS) {
    if (name.includes(hint)) {
      score += 20;
    }
  }
  return score;
}

export function pickBestVoiceForLanguage<T extends SpeechVoiceLike>(
  voices: readonly T[],
  language: Language
): T | undefined {
  let bestVoice: T | undefined;
  let bestScore = -1;

  for (const voice of voices) {
    const score = scoreVoiceSoftness(voice, language);
    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  }
  return bestVoice;
}

export function clampSoftVolume(volume: number): number {
  if (!Number.isFinite(volume)) return DEFAULT_SOFT_VOICE_VOLUME;
  return Math.min(1, Math.max(0.25, Number(volume.toFixed(2))));
}

export function prepareTextForTts(raw: string, maxChars = 1100): string {
  const cleaned = raw
    .replace(/[*_`#>]/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxChars) return cleaned;

  const sliced = cleaned.slice(0, maxChars);
  const lastSentenceBreak = Math.max(
    sliced.lastIndexOf('. '),
    sliced.lastIndexOf('। '),
    sliced.lastIndexOf('! '),
    sliced.lastIndexOf('? ')
  );
  if (lastSentenceBreak >= Math.floor(maxChars * 0.5)) {
    return sliced.slice(0, lastSentenceBreak + 1).trim();
  }
  return `${sliced.trim()}...`;
}

export function hasTargetLanguageScript(text: string, language: Language): boolean {
  const clean = text.trim();
  if (!clean) return false;
  if (language === 'en') return true;

  if (language === 'te') {
    const teluguChars = clean.match(/[\u0C00-\u0C7F]/g)?.length ?? 0;
    const latinChars = clean.match(/[A-Za-z]/g)?.length ?? 0;
    return teluguChars >= 6 && teluguChars >= latinChars * 2;
  }

  const devanagariChars = clean.match(/[\u0900-\u097F]/g)?.length ?? 0;
  const latinChars = clean.match(/[A-Za-z]/g)?.length ?? 0;
  return devanagariChars >= 6 && devanagariChars >= latinChars * 2;
}

export function navSectionToDoubtTopic(section: NavSection): Exclude<DoubtTopicId, 'highlighted'> {
  switch (section) {
    case 'kisan-rakshak':
      return 'kisan-rakshak';
    case 'weather':
      return 'weather';
    case 'crop':
      return 'crop';
    case 'recommendations':
      return 'recommendations';
    case 'alerts':
      return 'alerts';
    default:
      return 'overview';
  }
}

export function sanitizeHighlightedSelection(raw: string): string {
  const normalized = raw.replace(/\s+/g, ' ').trim();
  if (normalized.length < 4) return '';
  return normalized.slice(0, 700);
}

export function buildDoubtContextSnippet(params: {
  topicId: DoubtTopicId;
  highlightedText?: string;
  farmer: FarmerProfile;
  weather: WeatherContext;
  assessment: KisanRakshakAssessment;
  photoDiagnosis?: CropPhotoDiagnosis | null;
  recommendations: AdvisoryRecommendation[];
  alerts: FarmAlert[];
  language: Language;
}): DoubtContextPayload {
  const {
    topicId,
    highlightedText = '',
    farmer,
    weather,
    assessment,
    photoDiagnosis,
    recommendations,
    alerts,
    language,
  } = params;

  const cleanHighlight = sanitizeHighlightedSelection(highlightedText);
  const activeTopic: DoubtTopicId =
    topicId === 'highlighted' && !cleanHighlight ? 'overview' : topicId;

  const localDistrict = localizeLocationText(farmer.district, language);
  const localState = localizeLocationText(farmer.state, language);
  const localCrops = localizeCropsList(farmer.crops, language).join(', ');
  const localRisk = localizeRiskLevel(assessment.riskLevel, language);
  const localStage = localizeGrowthStage(farmer.growthStage, language);
  const localSoil = localizeSoilType(farmer.soilType, language);
  const localWeather = localizeWeatherContext(weather, language);

  let topicLabel = '';
  let readableText = '';

  if (activeTopic === 'highlighted' && cleanHighlight) {
    topicLabel =
      language === 'hi'
        ? 'चयनित पाठ (आपका संदेह)'
        : language === 'te'
        ? 'ఎంచుకున్న భాగం (మీ సందేహం)'
        : 'Highlighted Selection';
    readableText = cleanHighlight;
  } else if (activeTopic === 'kisan-rakshak') {
    const firstActions = assessment.recommendedProtectiveActions.slice(0, 3).join(' ');
    topicLabel =
      language === 'hi'
        ? 'किसान रक्षक जोखिम और सुरक्षा योजना'
        : language === 'te'
        ? 'కిసాన్ రక్షక్ ప్రమాదం & రక్షణ ప్రణాళిక'
        : 'Kisan Rakshak Risk & Plan';
    readableText =
      language === 'hi'
        ? `${localDistrict} में ${localCrops} के लिए किसान रक्षक जोखिम स्तर ${localRisk} (स्कोर ${assessment.riskScore}/100, विश्वास ${assessment.confidencePercent}%) है। मुख्य कदम: ${firstActions}`
        : language === 'te'
        ? `${localDistrict} లో ${localCrops} పంటకు కిసాన్ రక్షక్ ప్రమాద స్థాయి ${localRisk} (స్కోర్ ${assessment.riskScore}/100, నమ్మకం ${assessment.confidencePercent}%). ప్రధాన చర్యలు: ${firstActions}`
        : `Kisan Rakshak risk for ${localCrops} in ${localDistrict} is ${localRisk} (score ${assessment.riskScore} out of 100, confidence ${assessment.confidencePercent}%). Priority protective actions: ${firstActions}`;
  } else if (activeTopic === 'weather') {
    topicLabel =
      language === 'hi'
        ? 'मौसम और छिड़काव/सिंचाई सलाह'
        : language === 'te'
        ? 'వాతావరణం & పిచికారీ/నీటి సలహా'
        : 'Weather & Spraying Advice';
    const plains = localWeather.plains;
    const plainsSummary = plains
      ? language === 'hi'
        ? `मैदान स्तर: ${plains.elevationM !== null ? `${plains.elevationM} मी.` : 'अज्ञात'} (${localizePlainType(
            plains.plainType,
            'hi'
          )}), नदी प्रवाह: ${
            plains.riverDischargeM3s !== null ? `${plains.riverDischargeM3s} मी³/से` : 'अज्ञात'
          } (${localizeRiverBasinStatus(plains.riverBasinStatus, 'hi')})।`
        : language === 'te'
        ? `మైదాన ఎత్తు: ${plains.elevationM !== null ? `${plains.elevationM} మీ.` : 'తెలియదు'} (${localizePlainType(
            plains.plainType,
            'te'
          )}), నది ప్రవాహం: ${
            plains.riverDischargeM3s !== null ? `${plains.riverDischargeM3s} మీ³/సె` : 'తెలియదు'
          } (${localizeRiverBasinStatus(plains.riverBasinStatus, 'te')}).`
        : `Plains profile: ${plains.elevationM !== null ? `${plains.elevationM} m` : 'unknown'} (${
            plains.plainType
          }), river flow: ${
            plains.riverDischargeM3s !== null ? `${plains.riverDischargeM3s} m³/s` : 'unknown'
          } (${plains.riverBasinStatus}).`
      : '';
    readableText =
      language === 'hi'
        ? `${localWeather.scenarioTitle}: 24 घंटे बारिश ${localWeather.rainfall24hMm ?? 'अज्ञात'} मिमी, हवा ${localWeather.windSpeedKmh ?? 'अज्ञात'} किमी/घंटा। ${plainsSummary} ${localWeather.observationNote} ${localWeather.forecastUncertainty}`
        : language === 'te'
        ? `${localWeather.scenarioTitle}: 24 గంటల వర్షం ${localWeather.rainfall24hMm ?? 'తెలియదు'} మి.మీ, గాలి ${localWeather.windSpeedKmh ?? 'తెలియదు'} కి.మీ/గం. ${plainsSummary} ${localWeather.observationNote} ${localWeather.forecastUncertainty}`
        : `${localWeather.scenarioTitle}: 24-hour rainfall ${localWeather.rainfall24hMm ?? 'unknown'} mm, wind ${localWeather.windSpeedKmh ?? 'unknown'} km/h. ${plainsSummary} ${localWeather.observationNote} ${localWeather.forecastUncertainty}`;
  } else if (activeTopic === 'crop') {
    topicLabel =
      language === 'hi'
        ? 'फसल स्थिति और फोटो निदान'
        : language === 'te'
        ? 'పంట స్థితి & ఫోటో నిర్ధారణ'
        : 'Crop Health & Photo Diagnosis';
    if (photoDiagnosis) {
      const localHealthStatus = localizeCropHealthStatus(photoDiagnosis.healthStatus, language);
      readableText =
        language === 'hi'
          ? `पहचानी गई फसल: ${photoDiagnosis.identifiedCrop}, स्वास्थ्य स्कोर ${photoDiagnosis.healthScore}/100 (${localHealthStatus})। ${photoDiagnosis.healthSummary}`
          : language === 'te'
          ? `గుర్తించిన పంట: ${photoDiagnosis.identifiedCrop}, ఆరోగ్య స్కోర్ ${photoDiagnosis.healthScore}/100 (${localHealthStatus}). ${photoDiagnosis.healthSummary}`
          : `Identified crop: ${photoDiagnosis.identifiedCrop}, health score ${photoDiagnosis.healthScore}/100 (${localHealthStatus}). ${photoDiagnosis.healthSummary}`;
    } else {
      readableText =
        language === 'hi'
          ? `${localCrops} (${localStage}, ${localSoil}), खेत आकार ${farmer.farmSizeAcres} एकड़।`
          : language === 'te'
          ? `${localCrops} (${localStage}, ${localSoil}), విస్తీర్ణం ${farmer.farmSizeAcres} ఎకరాలు.`
          : `${localCrops} at ${localStage} stage on ${localSoil} soil (${farmer.farmSizeAcres} acres).`;
    }
  } else if (activeTopic === 'recommendations') {
    topicLabel =
      language === 'hi'
        ? 'कृषि सलाह और सिफारिशें'
        : language === 'te'
        ? 'వ్యవసాయ సలహాలు & సూచనలు'
        : 'Farm Recommendations';
    const rawTopRec = recommendations[0];
    const topRec = rawTopRec ? localizeSeedRecommendation(rawTopRec, language) : undefined;
    readableText = topRec
      ? `${topRec.title}: ${topRec.summary} ${topRec.steps.slice(0, 2).join(' ')}`
      : language === 'hi'
      ? 'अभी कोई सक्रिय सिफारिश दर्ज नहीं है।'
      : language === 'te'
      ? 'ప్రస్తుతం సిఫార్సులు నమోదు కాలేదు.'
      : 'No active recommendations logged yet.';
  } else if (activeTopic === 'alerts') {
    topicLabel =
      language === 'hi'
        ? 'कार्रवाई और अलर्ट सूची'
        : language === 'te'
        ? 'చర్యలు & హెచ్చరికల జాబితా'
        : 'Action & Alert Queue';
    const pending = alerts.filter((a) => a.status === 'pending');
    const rawTopAlert = pending[0] ?? alerts[0];
    const topAlert = rawTopAlert ? localizeSeedAlert(rawTopAlert, language) : undefined;
    readableText = topAlert
      ? `${topAlert.title} (${localizePriorityLabel(topAlert.priority, language)}): ${topAlert.reason} ${topAlert.actionRequired}`
      : language === 'hi'
      ? 'कोई लंबित अलर्ट नहीं है।'
      : language === 'te'
      ? 'పెండింగ్ హెచ్చరికలు లేవు.'
      : 'No pending alerts.';
  } else {
    topicLabel =
      language === 'hi'
        ? 'खेत संचालन सारांश'
        : language === 'te'
        ? 'పొలం నిర్వహణ సారాంశం'
        : 'Current Farm Summary';
    const rawTopAlert = alerts.find((a) => a.status === 'pending');
    const topAlert = rawTopAlert ? localizeSeedAlert(rawTopAlert, language) : undefined;
    const plains = localWeather.plains;
    const plainsSnippet =
      plains && plains.elevationM !== null
        ? language === 'hi'
          ? ` मैदान ऊँचाई ${plains.elevationM} मी. (${localizePlainType(plains.plainType, 'hi')})।`
          : language === 'te'
          ? ` మైదాన ఎత్తు ${plains.elevationM} మీ. (${localizePlainType(plains.plainType, 'te')}).`
          : ` Terrain elevation ${plains.elevationM} m (${plains.plainType}).`
        : '';
    readableText =
      language === 'hi'
        ? `${localDistrict}, ${localState} में ${localCrops} के लिए जोखिम स्तर ${localRisk} (${assessment.riskScore}/100) है। 24 घंटे वर्षा ${localWeather.rainfall24hMm ?? 'अज्ञात'} मिमी।${plainsSnippet} ${topAlert ? `मुख्य कार्य: ${topAlert.title}` : ''}`
        : language === 'te'
        ? `${localDistrict}, ${localState} లో ${localCrops} పంటకు ప్రమాద స్థాయి ${localRisk} (${assessment.riskScore}/100). 24 గం. వర్షం ${localWeather.rainfall24hMm ?? 'తెలియదు'} మి.మీ.${plainsSnippet} ${topAlert ? `ముఖ్య పని: ${topAlert.title}` : ''}`
        : `For ${localCrops} in ${localDistrict}, ${localState}: Kisan Rakshak risk is ${localRisk} (${assessment.riskScore}/100), 24h forecast rain ${localWeather.rainfall24hMm ?? 'unknown'} mm.${plainsSnippet} ${topAlert ? `Top priority action: ${topAlert.title}.` : ''}`;
  }

  return {
    topicId: activeTopic,
    topicLabel,
    readableText,
    promptWithContext: (question: string) => {
      const cleanQ = question.trim();
      if (language === 'hi') {
        return `किसान का चयनित विषय/संदेह सामग्री ("${topicLabel}"): "${readableText}"\nकिसान का बोलकर पूछा गया प्रश्न: "${cleanQ}"\nकृपया इसी चयनित सामग्री के संदर्भ में सरल और स्पष्ट उत्तर दें।`;
      }
      if (language === 'te') {
        return `రైతు ఎంచుకున్న అంశం/సందేహ సమాచారం ("${topicLabel}"): "${readableText}"\nరైతు అడిగిన ప్రశ్న: "${cleanQ}"\nదయచేసి ఈ ఎంచుకున్న సమాచారానికి సంబంధించి సులభంగా మరియు స్పష్టంగా సమాధానం ఇవ్వండి.`;
      }
      return `Farmer selected content they have a doubt on ("${topicLabel}"): "${readableText}"\nFarmer's spoken question: "${cleanQ}"\nRespond clearly and directly addressing this selected content.`;
    },
  };
}
