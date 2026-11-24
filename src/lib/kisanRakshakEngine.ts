import {
  getLocalizedVerifiedContacts,
  localizeCropName,
  localizeDrainageSlopeProfile,
  localizeDrainageType,
  localizeFloodStatus,
  localizeGrowthStage,
  localizePlainType,
  localizeRiverBasinStatus,
  localizeSoilType,
  localizeWeatherContext,
} from './domainTranslations.ts';
import type {
  ActionPhasePlan,
  EmergencyChecklistItem,
  FarmerProfile,
  KisanRakshakAssessment,
  Language,
  RiskFactorItem,
  RiskLevel,
  VerifiedEmergencyContact,
  WeatherContext,
} from '../types/agriguard.ts';

export interface RiskValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const VERIFIED_INDIAN_EMERGENCY_CONTACTS: VerifiedEmergencyContact[] =
  getLocalizedVerifiedContacts('en');

export function validateRiskInputs(
  farmer: Partial<FarmerProfile>,
  weather: Partial<WeatherContext>,
  language: Language = 'en'
): RiskValidationResult {
  const errors: Record<string, string> = {};

  if (!farmer.state || farmer.state.trim().length < 2) {
    errors.state =
      language === 'hi'
        ? 'क्षेत्रीय जोखिम मूल्यांकन के लिए राज्य आवश्यक है।'
        : language === 'te'
        ? 'ప్రాంతీయ ప్రమాద అంచనాకు రాష్ట్రం పేరు తప్పనిసరి.'
        : 'State is required for regional hazard assessment.';
  }
  if (!farmer.district || farmer.district.trim().length < 2) {
    errors.district =
      language === 'hi'
        ? 'स्थानीय संवेदनशीलता जांचने के लिए जिला आवश्यक है।'
        : language === 'te'
        ? 'స్థానిక పరిస్థితిని అంచనా వేయడానికి జిల్లా పేరు తప్పనిసరి.'
        : 'District is required to evaluate local vulnerability.';
  }
  if (!farmer.crops || farmer.crops.length === 0 || !farmer.crops[0]?.trim()) {
    errors.crops =
      language === 'hi'
        ? 'कम से कम एक फसल का प्रकार आवश्यक है।'
        : language === 'te'
        ? 'కనీసం ఒక పంట రకం తప్పనిసరి.'
        : 'At least one crop type is required.';
  }
  if (
    weather.rainfall24hMm !== null &&
    weather.rainfall24hMm !== undefined &&
    (Number.isNaN(weather.rainfall24hMm) || weather.rainfall24hMm < 0 || weather.rainfall24hMm > 1200)
  ) {
    errors.rainfall24hMm =
      language === 'hi'
        ? '24 घंटे का वर्षा अनुमान 0 से 1200 मिमी के बीच होना चाहिए।'
        : language === 'te'
        ? '24 గంటల వర్షపాతం అంచనా 0 నుండి 1200 మి.మీ మధ్య ఉండాలి.'
        : '24h rainfall forecast must be between 0 and 1200 mm.';
  }
  if (
    weather.windSpeedKmh !== null &&
    weather.windSpeedKmh !== undefined &&
    (Number.isNaN(weather.windSpeedKmh) || weather.windSpeedKmh < 0 || weather.windSpeedKmh > 350)
  ) {
    errors.windSpeedKmh =
      language === 'hi'
        ? 'हवा की गति 0 से 350 किमी/घंटा के बीच होनी चाहिए।'
        : language === 'te'
        ? 'గాలి వేగం 0 నుండి 350 కి.మీ/గం మధ్య ఉండాలి.'
        : 'Wind speed must be between 0 and 350 km/h.';
  }
  if (
    weather.rainfall24hMm === null &&
    weather.rainfall72hMm === null &&
    weather.windSpeedKmh === null &&
    (!weather.verifiedWarningLabel || weather.verifiedWarningLabel.trim() === '')
  ) {
    errors.weather =
      language === 'hi'
        ? 'कम से कम एक वर्षा, हवा या सत्यापित चेतावनी मान दर्ज करें ताकि किसान रक्षक अनुमान न लगाए।'
        : language === 'te'
        ? 'కిసాన్ రక్షక్ ఊహించకుండా కనీసం ఒక వర్షం, గాలి లేదా ధృవీకరించిన హెచ్చరిక విలువను నమోదు చేయండి.'
        : 'Provide at least one rainfall, wind, or verified warning input so Kisan Rakshak does not guess conditions.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'Critical';
  if (score >= 52) return 'High';
  if (score >= 28) return 'Moderate';
  return 'Low';
}

export function assessKisanRakshakRisk(
  farmer: FarmerProfile,
  weather: WeatherContext,
  language: Language = 'en'
): KisanRakshakAssessment {
  const localizedWeather = localizeWeatherContext(weather, language);
  const missingData: string[] = [];
  const factors: RiskFactorItem[] = [];

  // 1. Rainfall Risk (max 32 points)
  let rainfallPoints = 0;
  let rainfallDetail =
    language === 'hi'
      ? 'वर्षा पूर्वानुमान उपलब्ध नहीं है।'
      : language === 'te'
      ? 'వర్షపాతం అంచనా నమోదు కాలేదు.'
      : 'Rainfall forecast not supplied.';

  if (weather.rainfall24hMm === null && weather.rainfall72hMm === null) {
    missingData.push(
      language === 'hi'
        ? '24 घंटे और 72 घंटे का वर्षा पूर्वानुमान (मिमी)'
        : language === 'te'
        ? '24 గంటలు మరియు 72 గంటల వర్షపాతం అంచనా (మి.మీ)'
        : '24-hour and 72-hour rainfall forecast (mm)'
    );
  } else {
    const r24 = weather.rainfall24hMm ?? 0;
    const r72 = weather.rainfall72hMm ?? r24;
    if (r24 >= 150 || r72 >= 240) {
      rainfallPoints = 32;
      rainfallDetail =
        language === 'hi'
          ? `अत्यधिक वर्षा पूर्वानुमान (${r24} मिमी/24घं, ${r72} मिमी/72घं) गंभीर जलभराव और कटाव का खतरा पैदा करता है।`
          : language === 'te'
          ? `అత్యధిక వర్ష సూచన (${r24} మి.మీ/24గం, ${r72} మి.మీ/72గం) తీవ్ర నీటి ప్రవాహం మరియు ముంపు ప్రమాదాన్ని కలిగిస్తుంది.`
          : `Extreme rainfall forecast (${r24} mm/24h, ${r72} mm/72h) creates severe runoff and submergence hazard.`;
    } else if (r24 >= 100 || r72 >= 160) {
      rainfallPoints = 25;
      rainfallDetail =
        language === 'hi'
          ? `बहुत भारी वर्षा पूर्वानुमान (${r24} मिमी/24घं, ${r72} मिमी/72घं) मेड़ों और खड़ी फसल के लिए खतरा है।`
          : language === 'te'
          ? `అతి భారీ వర్ష సూచన (${r24} మి.మీ/24గం, ${r72} మి.మీ/72గం) పొలం గట్లకు మరియు పంటకు ప్రమాదం.`
          : `Very heavy rainfall forecast (${r24} mm/24h, ${r72} mm/72h) threatens bunds and standing crops.`;
    } else if (r24 >= 64.5 || r72 >= 110) {
      rainfallPoints = 18;
      rainfallDetail =
        language === 'hi'
          ? `भारी वर्षा पूर्वानुमान (${r24} मिमी/24घं) खेत की सामान्य जल निकासी क्षमता से अधिक है।`
          : language === 'te'
          ? `భారీ వర్ష సూచన (${r24} మి.మీ/24గం) సాధారణ నేల నీటిని పీల్చుకునే సామర్థ్యాన్ని మించి ఉంది.`
          : `Heavy rainfall forecast (${r24} mm/24h) exceeds normal field infiltration capacity.`;
    } else if (r24 >= 25) {
      rainfallPoints = 9;
      rainfallDetail =
        language === 'hi'
          ? `मध्यम वर्षा (${r24} मिमी/24घं) पर नियमित जल निकासी निरीक्षण की आवश्यकता है।`
          : language === 'te'
          ? `మోస్తరు వర్షం (${r24} మి.మీ/24గం) వల్ల సాధారణ నీటి పారుదల తనిఖీ అవసరం.`
          : `Moderate rain (${r24} mm/24h) requires routine drainage inspection.`;
    } else {
      rainfallPoints = 3;
      rainfallDetail =
        language === 'hi'
          ? `हल्की वर्षा पूर्वानुमान (${r24} मिमी/24घं) से बाढ़ का सीधा खतरा न्यूनतम है।`
          : language === 'te'
          ? `తేలికపాటి వర్ష సూచన (${r24} మి.మీ/24గం) వల్ల వరద ముప్పు చాలా తక్కువ.`
          : `Light rainfall forecast (${r24} mm/24h) presents minimal direct flood stress.`;
    }
  }
  factors.push({
    factor:
      language === 'hi'
        ? 'वर्षा की तीव्रता और संचयन'
        : language === 'te'
        ? 'వర్షపాత తీవ్రత & నిల్వ'
        : 'Rainfall Intensity & Accumulation',
    impactScore: rainfallPoints,
    maxScore: 32,
    detail: rainfallDetail,
    severity:
      rainfallPoints >= 25
        ? 'Critical'
        : rainfallPoints >= 18
        ? 'High'
        : rainfallPoints >= 9
        ? 'Moderate'
        : 'Low',
  });

  // 2. Wind & Cyclone Gust Risk (max 26 points)
  let windPoints = 0;
  let windDetail =
    language === 'hi'
      ? 'हवा की गति का पूर्वानुमान उपलब्ध नहीं है।'
      : language === 'te'
      ? 'గాలి వేగం అంచనా నమోదు కాలేదు.'
      : 'Wind speed forecast not supplied.';
  const effectiveWind = Math.max(weather.windSpeedKmh ?? 0, (weather.windGustKmh ?? 0) * 0.85);
  if (weather.windSpeedKmh === null && weather.windGustKmh === null) {
    missingData.push(
      language === 'hi'
        ? 'निरंतर हवा की गति और झोंकों का पूर्वानुमान (किमी/घंटा)'
        : language === 'te'
        ? 'గాలి వేగం మరియు ఉధృతి అంచనా (కి.మీ/గం)'
        : 'Sustained wind speed and gust forecast (km/h)'
    );
  } else if (effectiveWind >= 85) {
    windPoints = 26;
    windDetail =
      language === 'hi'
        ? `चक्रवाती हवा की गति (${weather.windSpeedKmh ?? 0} किमी/घं, झोंके ${weather.windGustKmh ?? 0} किमी/घं) फसल गिरने और ढांचों को भारी नुकसान पहुंचा सकती है।`
        : language === 'te'
        ? `తుఫాన్ స్థాయి గాలులు (${weather.windSpeedKmh ?? 0} కి.మీ/గం, ఉధృతి ${weather.windGustKmh ?? 0} కి.మీ/గం) పంట వాలిపోవడానికి మరియు తీవ్ర నష్టానికి కారణమవుతాయి.`
        : `Cyclonic wind speeds (${weather.windSpeedKmh ?? 0} km/h, gusts ${weather.windGustKmh ?? 0} km/h) cause severe lodging, tree fall, and structural damage.`;
  } else if (effectiveWind >= 55) {
    windPoints = 19;
    windDetail =
      language === 'hi'
        ? `तेज आंधी झोंके (${weather.windSpeedKmh ?? 0}–${weather.windGustKmh ?? 0} किमी/घं) फूल वाली या ऊँची फसलों को गिरा सकते हैं।`
        : language === 'te'
        ? `బలమైన ఈదురుగాలులు (${weather.windSpeedKmh ?? 0}–${weather.windGustKmh ?? 0} కి.మీ/గం) పూత దశలో ఉన్న లేదా ఎత్తైన పంటలను పడేయవచ్చు.`
        : `Gale-force gusts (${weather.windSpeedKmh ?? 0}–${weather.windGustKmh ?? 0} km/h) can flatten flowering or tall crops.`;
  } else if (effectiveWind >= 35) {
    windPoints = 11;
    windDetail =
      language === 'hi'
        ? `तेज हवा (${weather.windSpeedKmh ?? 0} किमी/घं) फसल झुकने और छिड़काव बहाव का जोखिम बढ़ाती है।`
        : language === 'te'
        ? `బలమైన గాలులు (${weather.windSpeedKmh ?? 0} కి.మీ/గం) పంట వాలిపోవడం మరియు మందు చెదిరిపోయే ప్రమాదాన్ని పెంచుతాయి.`
        : `Strong winds (${weather.windSpeedKmh ?? 0} km/h) increase crop lodging and spray drift risk.`;
  } else {
    windPoints = 3;
    windDetail =
      language === 'hi'
        ? `हवा की गति (${weather.windSpeedKmh ?? 0} किमी/घं) सामान्य सीमा के भीतर है।`
        : language === 'te'
        ? `గాలి వేగం (${weather.windSpeedKmh ?? 0} కి.మీ/గం) సాధారణ పరిమితిలో ఉంది.`
        : `Wind speed (${weather.windSpeedKmh ?? 0} km/h) is within manageable limits.`;
  }
  factors.push({
    factor:
      language === 'hi'
        ? 'हवा और चक्रवाती झोंकों का प्रभाव'
        : language === 'te'
        ? 'గాలి & తుఫాను ఉధృతి ప్రభావం'
        : 'Wind & Cyclone Gust Exposure',
    impactScore: windPoints,
    maxScore: 26,
    detail: windDetail,
    severity:
      windPoints >= 24 ? 'Critical' : windPoints >= 16 ? 'High' : windPoints >= 10 ? 'Moderate' : 'Low',
  });

  // 3. Verified Warning & Local Flood Status (max 22 points)
  let floodWarningPoints = 0;
  const rawWarningText = weather.verifiedWarningLabel?.trim() || '';
  const displayWarningText = localizedWeather.verifiedWarningLabel?.trim() || rawWarningText;
  if (!rawWarningText) {
    missingData.push(
      language === 'hi'
        ? 'सत्यापित आईएमडी / एसडीएमए मौसम चेतावनी स्थिति'
        : language === 'te'
        ? 'ధృవీకరించబడిన ఐఎండీ / ఎస్‌డీఎంఏ వాతావరణ హెచ్చరిక స్థితి'
        : 'Verified IMD / SDMA weather warning status'
    );
  }
  if (weather.localFloodStatus === 'Unknown') {
    missingData.push(
      language === 'hi'
        ? 'स्थानीय मंडल / नहर बाढ़ की स्थिति'
        : language === 'te'
        ? 'స్థానిక మండలం / కాలువ వరద స్థితి'
        : 'Local mandal/canal flood status'
    );
  }

  if (
    weather.localFloodStatus === 'Active Waterlogging' ||
    weather.plains?.riverBasinStatus === 'High Flood Discharge' ||
    /red|cyclone|severe/i.test(rawWarningText)
  ) {
    floodWarningPoints = 22;
  } else if (
    weather.localFloodStatus === 'Watch / Rising Water' ||
    weather.plains?.riverBasinStatus === 'Elevated Runoff' ||
    /orange|flood|heavy/i.test(rawWarningText)
  ) {
    floodWarningPoints = 15;
  } else if (/yellow|watch/i.test(rawWarningText)) {
    floodWarningPoints = 9;
  } else {
    floodWarningPoints = 2;
  }

  const localizedFlood = localizeFloodStatus(weather.localFloodStatus, language);
  const riverFlowNote =
    weather.plains && weather.plains.riverDischargeM3s !== null
      ? language === 'hi'
        ? ` · ग्लोफ़ास नदी प्रवाह: ${weather.plains.riverDischargeM3s} मी³/से (${localizeRiverBasinStatus(
            weather.plains.riverBasinStatus,
            'hi'
          )})`
        : language === 'te'
        ? ` · గ్లోఫాస్ నది ప్రవాహం: ${weather.plains.riverDischargeM3s} మీ³/సె (${localizeRiverBasinStatus(
            weather.plains.riverBasinStatus,
            'te'
          )})`
        : ` · GloFAS river discharge: ${weather.plains.riverDischargeM3s} m³/s (${weather.plains.riverBasinStatus})`
      : '';
  const floodFactorDetail =
    language === 'hi'
      ? displayWarningText
        ? `${displayWarningText} · स्थानीय स्थिति: ${localizedFlood}${riverFlowNote}।`
        : `कोई सत्यापित आधिकारिक अलर्ट दर्ज नहीं · स्थानीय बाढ़ स्थिति: ${localizedFlood}${riverFlowNote}।`
      : language === 'te'
      ? displayWarningText
        ? `${displayWarningText} · స్థానిక స్థితి: ${localizedFlood}${riverFlowNote}.`
        : `అధికారిక హెచ్చరిక నమోదు కాలేదు · స్థానిక వరద స్థితి: ${localizedFlood}${riverFlowNote}.`
      : displayWarningText
      ? `${displayWarningText} (${weather.verifiedWarningSource || 'Unverified source noted'}) · Local status: ${localizedFlood}${riverFlowNote}.`
      : `No verified official alert entered · Local flood status: ${localizedFlood}${riverFlowNote}.`;

  factors.push({
    factor:
      language === 'hi'
        ? 'सत्यापित चेतावनी और स्थानीय बाढ़ स्थिति'
        : language === 'te'
        ? 'ధృవీకరించిన హెచ్చరికలు & స్థానిక వరద స్థితి'
        : 'Verified Warnings & Local Flood State',
    impactScore: floodWarningPoints,
    maxScore: 22,
    detail: floodFactorDetail,
    severity:
      floodWarningPoints >= 20
        ? 'Critical'
        : floodWarningPoints >= 14
        ? 'High'
        : floodWarningPoints >= 8
        ? 'Moderate'
        : 'Low',
  });

  // 4. Crop Stage & Farm Vulnerability (max 20 points)
  let vulnerabilityPoints = 4;
  const vulnNotes: string[] = [];
  const localizedStage = localizeGrowthStage(farmer.growthStage, language);
  const localizedSoil = localizeSoilType(farmer.soilType, language);

  if (
    farmer.growthStage === 'Flowering / Panicle Initiation' ||
    farmer.growthStage === 'Maturity / Pre-Harvest'
  ) {
    vulnerabilityPoints += 7;
    vulnNotes.push(
      language === 'hi'
        ? `${localizedStage} चरण हवा से गिरने, दाने झड़ने और जलमग्नता के प्रति अत्यधिक संवेदनशील है।`
        : language === 'te'
        ? `${localizedStage} పంట వాలిపోవడం, గింజ రాలడం మరియు నీట మునగడానికి చాలా సున్నితంగా ఉంటుంది.`
        : `${localizedStage} is highly sensitive to lodging, grain shattering, and water submergence.`
    );
  } else if (farmer.growthStage === 'Nursery / Sowing') {
    vulnerabilityPoints += 6;
    vulnNotes.push(
      language === 'hi'
        ? 'नर्सरी/बुवाई चरण के बीज और नन्हे पौधे तेज बहाव में बहने के जोखिम में रहते हैं।'
        : language === 'te'
        ? 'నారుమడి/విత్తే దశలో విత్తనాలు మరియు లేత మొక్కలు కొట్టుకుపోయే ప్రమాదం ఉంది.'
        : 'Nursery/sowing stage seeds and young seedlings are prone to washout.'
    );
  } else {
    vulnerabilityPoints += 3;
    vulnNotes.push(
      language === 'hi'
        ? `यदि जल निकासी बनी रहे तो ${localizedStage} चरण में मध्यम सहनशीलता रहती है।`
        : language === 'te'
        ? `నీటి పారుదల సరిగ్గా ఉంటే ${localizedStage} దశలో మధ్యస్థ తట్టుకునే శక్తి ఉంటుంది.`
        : `${localizedStage} has moderate resilience if drainage is maintained.`
    );
  }

  if (farmer.drainageType === 'Low-Lying / Basin') {
    vulnerabilityPoints += 5;
    vulnNotes.push(
      language === 'hi'
        ? 'निचली जमीन होने के कारण पानी की प्राकृतिक निकासी धीमी होती है।'
        : language === 'te'
        ? 'లోతట్టు భూమి కావడం వల్ల సహజంగా నీరు బయటకు పోవడం నెమ్మదిగా ఉంటుంది.'
        : 'Low-lying basin terrain slows natural water exit.'
    );
  } else if (weather.plains && weather.plains.drainageSlopeProfile === 'Flat Basin / Slow Runoff') {
    vulnerabilityPoints += 4;
  } else if (farmer.drainageType === 'Unknown' && (!weather.plains || weather.plains.elevationM === null)) {
    missingData.push(
      language === 'hi'
        ? 'खेत की जल निकासी ढलान / ऊँचाई विवरण'
        : language === 'te'
        ? 'పొలం నీటి పారుదల వాలు / ఎత్తు వివరాలు'
        : 'Field drainage slope / elevation profile'
    );
    vulnerabilityPoints += 2;
  }

  if (weather.plains && weather.plains.elevationM !== null) {
    const localPlain = localizePlainType(weather.plains.plainType, language);
    const localSlope = localizeDrainageSlopeProfile(weather.plains.drainageSlopeProfile, language);
    vulnNotes.push(
      language === 'hi'
        ? `लाइव मैदान स्तर: ${weather.plains.elevationM} मी. (${localPlain}, ${localSlope})।`
        : language === 'te'
        ? `లైవ్ మైదాన ఎత్తు: ${weather.plains.elevationM} మీ. (${localPlain}, ${localSlope}).`
        : `Live plain terrain: ${weather.plains.elevationM} m (${localPlain}, ${localSlope}).`
    );
  }

  if (
    weather.plains?.rootZoneMoisturePct !== null &&
    weather.plains?.rootZoneMoisturePct !== undefined &&
    weather.plains.rootZoneMoisturePct >= 45
  ) {
    vulnerabilityPoints += 2;
    vulnNotes.push(
      language === 'hi'
        ? `लाइव जड़ क्षेत्र मिट्टी नमी उच्च (${weather.plains.rootZoneMoisturePct}%) है।`
        : language === 'te'
        ? `లైవ్ వేరు లోతు నేల తేమ అధికంగా (${weather.plains.rootZoneMoisturePct}%) ఉంది.`
        : `Live root-zone soil moisture is high (${weather.plains.rootZoneMoisturePct}%).`
    );
  }

  if (farmer.soilType === 'Black Cotton (Vertisol)' || farmer.soilType === 'Clayey') {
    vulnerabilityPoints += 3;
    vulnNotes.push(
      language === 'hi'
        ? `${localizedSoil} भीगने के बाद पानी को धीरे-धीरे छोड़ती है।`
        : language === 'te'
        ? `${localizedSoil} తడిసిన తర్వాత నీటిని చాలా నెమ్మదిగా వదులుతుంది.`
        : `${localizedSoil} soil drains slowly once saturated.`
    );
  } else if (farmer.soilType === 'Unknown') {
    missingData.push(
      language === 'hi'
        ? 'मिट्टी का प्रकार (जल रिसाव व जलभराव अनुमान के लिए)'
        : language === 'te'
        ? 'నేల రకం (నీరు ఇంకే మరియు నిల్వ అంచనా కోసం)'
        : 'Soil type (for infiltration & waterlogging estimate)'
    );
    vulnerabilityPoints += 1;
  }

  if (farmer.nearCoastOrRiver) {
    vulnerabilityPoints += 3;
    vulnNotes.push(
      language === 'hi'
        ? 'तट या नदी चैनल के निकट होने से पानी बैकफ्लो का खतरा बढ़ता है।'
        : language === 'te'
        ? 'సముద్ర తీరం లేదా నదికి సమీపంలో ఉండటం వల్ల నీరు వెనక్కి వచ్చే ప్రమాదం పెరుగుతుంది.'
        : 'Proximity to coast or river channel raises surge/backflow risk.'
    );
  }

  vulnerabilityPoints = Math.min(20, vulnerabilityPoints);

  factors.push({
    factor:
      language === 'hi'
        ? 'फसल चरण एवं खेत संवेदनशीलता'
        : language === 'te'
        ? 'పంట దశ & పొలం సున్నితత్వం'
        : 'Crop Stage & Farm Terrain Vulnerability',
    impactScore: vulnerabilityPoints,
    maxScore: 20,
    detail: vulnNotes.join(' '),
    severity:
      vulnerabilityPoints >= 16
        ? 'Critical'
        : vulnerabilityPoints >= 12
        ? 'High'
        : vulnerabilityPoints >= 8
        ? 'Moderate'
        : 'Low',
  });

  const riskScore = Math.min(100, rainfallPoints + windPoints + floodWarningPoints + vulnerabilityPoints);
  const riskLevel = classifyRiskLevel(riskScore);

  const rawConfidence = 92 - missingData.length * 10 - (weather.isSyntheticDemo ? 4 : 0);
  const confidencePercent = Math.max(35, Math.min(92, rawConfidence));

  const rawPrimaryCrop = farmer.crops[0] ? localizeCropName(farmer.crops[0], language) : '';
  const primaryCrop =
    rawPrimaryCrop || (language === 'hi' ? 'खड़ी फसल' : language === 'te' ? 'పంట' : 'standing crop');

  const recommendedProtectiveActions = buildProtectiveActions(
    riskLevel,
    primaryCrop,
    farmer,
    weather,
    language
  );
  const phasePlans = buildPhasePlans(riskLevel, primaryCrop, farmer, language);
  const checklist = buildChecklist(riskLevel, farmer, language);

  const syntheticTag =
    language === 'hi'
      ? ' (सिंथेटिक डेमो परिदृश्य — लाइव आधिकारिक चेतावनी नहीं)'
      : language === 'te'
      ? ' (సింథటిక్ డెమో పరిస్థితి — అధికారిక హెచ్చరిక కాదు)'
      : ' (Synthetic Demo Scenario — Not a Live Official Warning)';

  const safetyDisclaimer =
    language === 'hi'
      ? 'एग्रीगार्ड एआई केवल निर्णय सहायता प्रदान करता है। यह आधिकारिक आईएमडी बुलेटिन, राज्य आपदा प्रबंधन प्राधिकरण के आदेश या स्थानीय केवीके विशेषज्ञ निरीक्षण का विकल्प नहीं है। बिजली चमकने, तेज आंधी या बढ़ते बाढ़ के पानी में खेत में काम न करें।'
      : language === 'te'
      ? 'అగ్రిగార్డ్ ఏఐ కేవలం నిర్ణయ సహాయాన్ని మాత్రమే అందిస్తుంది. ఇది అధికారిక ఐఎండీ బులెటిన్లు, రాష్ట్ర విపత్తు నిర్వహణ ఆదేశాలు లేదా స్థానిక కేవీకే శాస్త్రవేత్తల తనిఖీకి ప్రత్యామ్నాయం కాదు. పిడుగులు, పెనుగాలులు లేదా పెరుగుతున్న వరద నీటిలో పొలం పనులు చేయవద్దు.'
      : 'AgriGuard AI provides decision-support only. It does not replace official IMD bulletins, State Disaster Management Authority orders, or local KVK agronomist inspections. Never attempt field work during active lightning, gale winds, or rising floodwaters.';

  return {
    riskLevel,
    riskScore,
    confidencePercent,
    isSyntheticData: weather.isSyntheticDemo,
    dataSourceSummary: `${localizedWeather.dataSource}${weather.isSyntheticDemo ? syntheticTag : ''}`,
    lastAssessedAt: new Date().toISOString(),
    mainRiskFactors: factors,
    missingData,
    recommendedProtectiveActions,
    phasePlans,
    checklist,
    verifiedContacts: getLocalizedVerifiedContacts(language),
    safetyDisclaimer,
  };
}

function buildProtectiveActions(
  riskLevel: RiskLevel,
  crop: string,
  farmer: FarmerProfile,
  weather: WeatherContext,
  language: Language
): string[] {
  const actions: string[] = [];

  if (riskLevel === 'Critical' || riskLevel === 'High') {
    actions.push(
      language === 'hi'
        ? `तेज बारिश आने से पहले ${crop} (${farmer.farmSizeAcres} एकड़) की बाहरी जल निकासी नालियाँ और मेड़ के निकास तुरंत साफ़ करें।`
        : language === 'te'
        ? `భారీ వర్షం రాకముందే ${crop} (${farmer.farmSizeAcres} ఎకరాలు) పొలం చుట్టూ ఉన్న నీటి పారుదల కాలువలు, గట్ల తూములను వెంటనే శుభ్రం చేయండి.`
        : `Clear peripheral field drainage channels and bund outlets immediately for ${crop} (${farmer.farmSizeAcres} acres) before peak rainfall arrives.`
    );
    if (farmer.growthStage === 'Maturity / Pre-Harvest') {
      actions.push(
        language === 'hi'
          ? `स्थानीय खरीदारों / केवीके से जांच करें कि क्या पकी हुई ${crop} की सुरक्षित कटाई कर ऊँचे सूखे स्थान पर रखा जा सकता है।`
          : language === 'te'
          ? `తుఫాన్ రాకముందే పండిన ${crop} పంటను కోసి ఎత్తైన పొడి ప్రదేశంలో నిల్వ చేయవచ్చో లేదో స్థానిక కేవీకే లేదా మార్కెట్‌తో పరిశీలించండి.`
          : `Evaluate with local buyers/KVK whether mature ${crop} sections can be safely harvested and moved to elevated covered storage before storm onset.`
      );
    }
    if ((weather.windGustKmh ?? weather.windSpeedKmh ?? 0) >= 55) {
      actions.push(
        language === 'hi'
          ? 'पंप सेट, तिरपाल, कटे हुए बोरे और औज़ार ऊँचे सुरक्षित स्थान पर बांधें; खेत की गैर-जरूरी बिजली लाइन बंद करें।'
          : language === 'te'
          ? 'పంపు సెట్లు, టార్పాలిన్లు, కోసిన ధాన్యం బస్తాలు మరియు పనిముట్లను ఎత్తైన పొడి షెడ్‌లో భద్రపరచండి; అనవసర పొలం కరెంట్ లైన్లు ఆపండి.'
          : 'Secure pump sets, polythene tarpaulins, harvested bags, and farm tools in elevated dry shelter; disconnect non-essential field power lines.'
      );
    }
    actions.push(
      language === 'hi'
        ? 'दवा बहने और रसायन बर्बादी से बचने के लिए भारी बारिश और तेज हवा गुजरने तक सभी पत्तियों पर छिड़काव बंद रखें।'
        : language === 'te'
        ? 'మందు కొట్టుకుపోకుండా మరియు వృథా కాకుండా భారీ వర్షాలు, బలమైన గాలులు తగ్గే వరకు అన్ని రకాల పిచికారీలను నిలిపివేయండి.'
        : 'Pause all foliar fertilizer or pesticide spraying until heavy rain and high winds pass to prevent runoff loss and chemical waste.'
    );
  } else if (riskLevel === 'Moderate') {
    actions.push(
      language === 'hi'
        ? `${crop} के खेत की मेड़ों का निरीक्षण करें और निकास नालियों से गाद व खरपतवार हटाएँ।`
        : language === 'te'
        ? `${crop} పొలం గట్లను పరిశీలించి, నీటి పారుదల కాలువల్లోని పూడిక మరియు కలుపును తొలగించండి.`
        : `Inspect ${crop} field bunds and clear silt/weed blockages from drainage outlets.`
    );
    actions.push(
      language === 'hi'
        ? 'नई सिंचाई टालें और खाद डालने से पहले 24 घंटे का आईएमडी जिला बुलेटिन जांचें।'
        : language === 'te'
        ? 'కొత్తగా నీరు పెట్టడం ఆపి, ఎరువులు వేసే ముందు 24 గంటల ఐఎండీ జిల్లా బుల్లెటిన్‌ను చూడండి.'
        : 'Avoid fresh irrigation and check 24-hour IMD district bulletins before applying fertilizers.'
    );
  } else {
    actions.push(
      language === 'hi'
        ? `${crop} खेत की नियमित निगरानी जारी रखें और मिट्टी की नमी देखकर सिंचाई तय करें।`
        : language === 'te'
        ? `${crop} పొలం సాధారణ పర్యవేక్షణ కొనసాగించండి మరియు నేల తేమను బట్టి నీటి తడులు నిర్ణయించండి.`
        : `Maintain routine ${crop} field monitoring and verify irrigation scheduling against soil moisture.`
    );
  }

  actions.push(
    language === 'hi'
      ? 'किसी भी बड़े कदम (आपातकालीन मेड़ काटना, जल्दी कटाई या बाढ़ के बाद फफूंदनाशी) की पुष्टि अपने जिला केवीके या किसान कॉल सेंटर (1800-180-1551) से जरूर करें।'
      : language === 'te'
      ? 'ఏదైనా పెద్ద చర్యకు (గట్లు కోయడం, ముందస్తు కోత లేదా వరద తర్వాత మందు పిచికారీ) ముందు మీ జిల్లా కేవీకే లేదా కిసాన్ కాల్ సెంటర్ (1800-180-1551)తో నిర్ధారించుకోండి.'
      : 'Confirm any major agronomic intervention (emergency drainage cut, early harvest, or post-flood fungicide) with your district KVK or Kisan Call Centre (1800-180-1551).'
  );

  return actions;
}

function buildPhasePlans(
  riskLevel: RiskLevel,
  crop: string,
  farmer: FarmerProfile,
  language: Language
): ActionPhasePlan[] {
  const priority: ActionPhasePlan['priority'] =
    riskLevel === 'Critical' ? 'Immediate' : riskLevel === 'High' ? 'High' : 'Standard';

  if (language === 'hi') {
    return [
      {
        phase: 'Before Event',
        priority,
        steps: [
          `${farmer.farmSizeAcres} एकड़ ${crop} खेत के सबसे निचले किनारे की जल निकासी नालियों से गाद निकालें।`,
          'बीज, खाद की बोरियाँ, मोटर स्टार्टर और उपज को ऊँचे लकड़ी के पट्टों या सूखे कमरे में रखें।',
          'आपातकालीन नंबर (112, 1078, 1800-180-1551) ऑफ़लाइन सहेजें और पावर बैंक चार्ज रखें।',
          'यदि बाद में फसल नुकसान हो तो पीएमएफबीवाई बीमा दस्तावेज के लिए खड़ी फसल की तारीख वाली फोटो लें।',
        ],
      },
      {
        phase: 'During Event',
        priority: 'Immediate',
        steps: [
          'तेज हवा या बिजली चमकने के दौरान बाढ़ वाले नालों, बिजली के खंभों और पेड़ों से दूर घर के अंदर रहें।',
          'तूफान के चरम समय में गहरे या तेज बहते पानी में उतरकर मेड़ खोलने की कोशिश न करें।',
          'तटीय या नदी क्षेत्र में हों तो स्थानीय प्रशासन / एसडीएमए की आधिकारिक निकासी व आश्रय सूचना का पालन करें।',
        ],
      },
      {
        phase: 'After Event',
        priority: 'High',
        steps: [
          'पानी सुरक्षित रूप से कम होने पर धीरे-धीरे मेड़ खोलकर 24–48 घंटे में खड़ा पानी निकालें ताकि जड़ें न सड़ें।',
          `${crop} के तनों व पत्तियों में झुकने, कीचड़ जमने, शीथ ब्लाइट या बैक्टीरियल लीफ ब्लाइट के लक्षण जांचें।`,
          'पीएमएफबीवाई / कृषि विभाग सर्वेक्षण के लिए 72 घंटे के भीतर नुकसान दर्ज करें और खाद/दवा डालने से पहले केवीके से पूछें।',
        ],
      },
    ];
  }

  if (language === 'te') {
    return [
      {
        phase: 'Before Event',
        priority,
        steps: [
          `${farmer.farmSizeAcres} ఎకరాల ${crop} పొలంలో లోతట్టు వైపు ఉన్న నీటి పారుదల కాలువల పూడికను శుభ్రం చేయండి.`,
          'విత్తనాలు, ఎరువుల బస్తాలు, మోటార్ స్టార్టర్లు మరియు ధాన్యాన్ని ఎత్తైన చెక్క బల్లలపై లేదా పొడి గదిలో పెట్టండి.',
          'అత్యవసర ఫోన్ నంబర్లు (112, 1078, 1800-180-1551) ఆఫ్‌లైన్‌లో సేవ్ చేసుకుని, పవర్ బ్యాంకులు ఛార్జ్ చేయండి.',
          'తర్వాత నష్టం జరిగితే పీఎంఎఫ్‌బీవై పంట బీమా కోసం ప్రస్తుత పంట తేదీతో కూడిన ఫోటోలు తీసి ఉంచండి.',
        ],
      },
      {
        phase: 'During Event',
        priority: 'Immediate',
        steps: [
          'బలమైన గాలులు లేదా ఉరుములు ఉన్నప్పుడు వరద కాలువలు, కరెంట్ స్తంభాలు మరియు చెట్లకు దూరంగా ఇంటి లోపల సురక్షితంగా ఉండండి.',
          'తుఫాన్ తీవ్రంగా ఉన్నప్పుడు లోతైన లేదా వేగంగా పారే వరద నీటిలోకి వెళ్లి గట్లు తీసే ప్రయత్నం చేయవద్దు.',
          'తీరప్రాంత లేదా నదీ పరీవాహక ప్రాంతంలో ఉంటే స్థానిక అధికారుల / ఎస్‌డీఎంఏ సురక్షిత ఆశ్రయ సూచనలను పాటించండి.',
        ],
      },
      {
        phase: 'After Event',
        priority: 'High',
        steps: [
          'నీటి ఉధృతి తగ్గిన తర్వాత నెమ్మదిగా గట్లు తెరిచి 24–48 గంటల్లో నిలిచిన నీటిని బయటకు పంపి వేర్లు కుళ్ళకుండా కాపాడండి.',
          `${crop} కాండాలు, ఆకులను పడిపోవడం, మట్టి అంటుకోవడం, షీత్ బ్లైట్ లేదా ఆకు ఎండు తెగులు లక్షణాల కోసం పరిశీలించండి.`,
          'పంట నష్టం జరిగితే 72 గంటల్లోపు పీఎంఎఫ్‌బీవై / వ్యవసాయ శాఖకు తెలియజేసి, మందులు వేసే ముందు కేవీకే సలహా తీసుకోండి.',
        ],
      },
    ];
  }

  return [
    {
      phase: 'Before Event',
      priority,
      steps: [
        `De-silt drainage trenches along the lowest edge of the ${farmer.farmSizeAcres}-acre ${crop} plot.`,
        'Move seeds, fertilizers, motor starters, and harvested produce onto raised wooden pallets or dry indoor storage.',
        'Store emergency phone numbers (112, 1078, 1800-180-1551) offline and keep power banks charged.',
        'Take date-stamped photos of standing crops for crop insurance (PMFBY) documentation if damage later occurs.',
      ],
    },
    {
      phase: 'During Event',
      priority: 'Immediate',
      steps: [
        'Stay indoors away from flooded channels, downed electric poles, and trees during strong winds or lightning.',
        'Do not enter deep or fast-moving floodwater to clear bunds manually during storm peak.',
        'Follow verified local administration / SDMA evacuation or shelter announcements if in a coastal or riverine zone.',
      ],
    },
    {
      phase: 'After Event',
      priority: 'High',
      steps: [
        'Once water recedes safely, open bund outlets gradually to drain stagnant water within 24–48 hours to limit root suffocation.',
        `Inspect ${crop} stems and leaves for lodging, silt coating, sheath blight, or bacterial leaf blight symptoms.`,
        'Document any crop loss within 72 hours for PMFBY / state agriculture department assessment and consult KVK before applying corrective nutrients.',
      ],
    },
  ];
}

function buildChecklist(
  riskLevel: RiskLevel,
  farmer: FarmerProfile,
  language: Language
): EmergencyChecklistItem[] {
  const localizedDrainage = localizeDrainageType(farmer.drainageType, language);

  if (language === 'hi') {
    return [
      {
        id: 'chk-drainage',
        label: `${farmer.drainageType === 'Unknown' ? 'खेत' : localizedDrainage} क्षेत्र की जल निकासी नालियाँ साफ़ करें`,
        category: 'Field',
        completed: false,
      },
      {
        id: 'chk-inputs',
        label: 'खाद की बोरियाँ, बीज और बिजली पंप स्टार्टर बाढ़ स्तर से ऊपर रखें',
        category: 'Equipment',
        completed: false,
      },
      {
        id: 'chk-photos',
        label: 'फसल बीमा (पीएमएफबीवाई) रिकॉर्ड के लिए घटना से पहले खेत की फोटो लें',
        category: 'Records',
        completed: false,
      },
      {
        id: 'chk-contacts',
        label: 'मोबाइल में ईआरएसएस 112, एनडीएमए 1078 और किसान कॉल सेंटर 1800-180-1551 सहेजें',
        category: 'Safety',
        completed: false,
      },
      {
        id: 'chk-livestock',
        label:
          riskLevel === 'Critical' || riskLevel === 'High'
            ? 'तूफान आने से पहले पशुओं और चारे को ऊँचे सूखे आश्रय में ले जाएं'
            : 'पशु शेड की छत की मजबूती और चारा ढकने की जांच करें',
        category: 'Safety',
        completed: false,
      },
    ];
  }

  if (language === 'te') {
    return [
      {
        id: 'chk-drainage',
        label: `${farmer.drainageType === 'Unknown' ? 'పొలం' : localizedDrainage} భూమిలోని నీటి పారుదల కాలువలను శుభ్రం చేయండి`,
        category: 'Field',
        completed: false,
      },
      {
        id: 'chk-inputs',
        label: 'ఎరువుల బస్తాలు, విత్తనాలు మరియు కరెంట్ పంపు స్టార్టర్లను వరద మట్టానికి పైన ఉంచండి',
        category: 'Equipment',
        completed: false,
      },
      {
        id: 'chk-photos',
        label: 'పంట బీమా (పీఎంఎఫ్‌బీవై) రికార్డుల కోసం విపత్తుకు ముందు పొలం ఫోటోలు తీయండి',
        category: 'Records',
        completed: false,
      },
      {
        id: 'chk-contacts',
        label: 'ఫోన్‌లో ఈఆర్‌ఎస్‌ఎస్ 112, ఎన్‌డీఎంఏ 1078 మరియు కిసాన్ కాల్ సెంటర్ 1800-180-1551 సేవ్ చేయండి',
        category: 'Safety',
        completed: false,
      },
      {
        id: 'chk-livestock',
        label:
          riskLevel === 'Critical' || riskLevel === 'High'
            ? 'తుఫాన్ రాకముందే పశువులను, మేతను ఎత్తైన పొడి ప్రదేశానికి తరలించండి'
            : 'పశువుల పాక పైకప్పు మరియు మేత కవర్లను తనిఖీ చేయండి',
        category: 'Safety',
        completed: false,
      },
    ];
  }

  return [
    {
      id: 'chk-drainage',
      label: `Clear outlet channels for ${farmer.drainageType === 'Unknown' ? 'field' : farmer.drainageType} terrain`,
      category: 'Field',
      completed: false,
    },
    {
      id: 'chk-inputs',
      label: 'Elevate fertilizer bags, seeds, and electrical pump starters above flood line',
      category: 'Equipment',
      completed: false,
    },
    {
      id: 'chk-photos',
      label: 'Capture pre-event field photos for crop insurance (PMFBY) records',
      category: 'Records',
      completed: false,
    },
    {
      id: 'chk-contacts',
      label: 'Save ERSS 112, NDMA 1078, and Kisan Call Centre 1800-180-1551 on mobile',
      category: 'Safety',
      completed: false,
    },
    {
      id: 'chk-livestock',
      label:
        riskLevel === 'Critical' || riskLevel === 'High'
          ? 'Relocate livestock and fodder to high dry shelter before storm onset'
          : 'Verify shed roof fasteners and fodder cover',
      category: 'Safety',
      completed: false,
    },
  ];
}
