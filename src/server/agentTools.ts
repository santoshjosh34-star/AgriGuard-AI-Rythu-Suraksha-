import { Type, type FunctionDeclaration } from '@google/genai';
import {
  localizeCropName,
  localizeDrainageSlopeProfile,
  localizeGrowthStage,
  localizeLocationText,
  localizePlainType,
  localizePriorityLabel,
  localizeRiskLevel,
  localizeRiverBasinStatus,
} from '../lib/domainTranslations.ts';
import { assessKisanRakshakRisk } from '../lib/kisanRakshakEngine.ts';
import { computeFarmingWindows } from '../lib/liveWeatherUtils.ts';
import { fetchLiveWeather } from './liveWeatherService.ts';
import type {
  AgentId,
  CropSymptomReport,
  FarmerProfile,
  Language,
  WeatherContext,
} from '../types/agriguard.ts';

export interface AgentToolExecutionContext {
  farmer: FarmerProfile;
  weather: WeatherContext;
  language: Language;
  symptomReport?: Partial<CropSymptomReport>;
}

export interface ExecutedToolResult {
  agentId: AgentId;
  agentName: string;
  taskAssigned: string;
  toolArgsSummary: string;
  resultSummary: string;
  payload: Record<string, unknown>;
}

export const AGRIGUARD_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'analyze_weather_intelligence',
    description:
      'Calls the Weather Intelligence Agent to analyse rainfall, wind, temperature, humidity, soil moisture, spraying/irrigation windows, and forecast uncertainty without fabricating live weather data.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        focus: {
          type: Type.STRING,
          description: 'Specific weather concern to inspect (e.g. heavy rain, spraying window, cyclone wind, waterlogging).',
        },
        fetchLiveForDistrict: {
          type: Type.BOOLEAN,
          description: 'Set true if the farmer asks for live real-time weather for their district instead of the active test scenario.',
        },
      },
      required: ['focus'],
    },
  },
  {
    name: 'analyze_crop_intelligence',
    description:
      'Calls the Crop Intelligence Agent to assess crop type, growth stage, soil type, and any farmer-reported symptoms cautiously, identifying missing crop details.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cropType: {
          type: Type.STRING,
          description: 'Primary crop being evaluated.',
        },
        symptoms: {
          type: Type.STRING,
          description: 'Any visible symptoms or field stress reported by the farmer, or "none reported".',
        },
      },
      required: ['cropType'],
    },
  },
  {
    name: 'assess_kisan_rakshak_risk',
    description:
      'Calls the Kisan Rakshak Disaster & Risk Agent to compute Low/Moderate/High/Critical risk, main risk factors, missing data, before/during/after protection plans, and verified emergency helplines.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        hazardFocus: {
          type: Type.STRING,
          description: 'Primary hazard to evaluate: heavy_rain, cyclone, waterlogging, or general.',
        },
      },
      required: ['hazardFocus'],
    },
  },
  {
    name: 'generate_farm_advisory',
    description:
      'Calls the Farm Advisory Agent to produce practical crop-specific steps and explicitly distinguish general agronomic guidance from advice requiring local KVK/expert confirmation.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        cropType: {
          type: Type.STRING,
          description: 'Crop name for advisory.',
        },
        growthStage: {
          type: Type.STRING,
          description: 'Current crop growth stage.',
        },
        riskLevel: {
          type: Type.STRING,
          description: 'Risk level from Kisan Rakshak or Weather Intelligence.',
        },
      },
      required: ['cropType', 'growthStage'],
    },
  },
  {
    name: 'prepare_action_alerts',
    description:
      'Calls the Action and Alert Agent to convert findings into prioritized farmer alerts with explicit reason, urgency, and human-confirmation requirements.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        urgency: {
          type: Type.STRING,
          description: 'Urgent, High, Moderate, or Low.',
        },
        alertTitle: {
          type: Type.STRING,
          description: 'Short clear title of the proposed farm alert.',
        },
        reason: {
          type: Type.STRING,
          description: 'Evidence-backed reason behind the alert.',
        },
        actionRequired: {
          type: Type.STRING,
          description: 'Practical action step for the farmer.',
        },
        requiresHumanConfirmation: {
          type: Type.BOOLEAN,
          description: 'True if the action is consequential (e.g. emergency harvest, bund cut, chemical spray).',
        },
      },
      required: ['urgency', 'alertTitle', 'reason', 'actionRequired'],
    },
  },
  {
    name: 'format_voice_language_brief',
    description:
      'Calls the Voice and Language Agent to retrieve target language guidelines (Telugu, Hindi, or English) and plain-language spoken delivery rules for the farmer.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        targetLanguage: {
          type: Type.STRING,
          description: 'Language code: en, hi, or te.',
        },
      },
      required: ['targetLanguage'],
    },
  },
];

function localizeWeatherFocusArg(rawFocus: string, language: Language): string {
  if (language === 'en') return rawFocus;
  const clean = rawFocus.trim().toLowerCase();
  if (language === 'hi') {
    if (clean.includes('heavy') || clean.includes('rain')) return 'भारी बारिश पूर्वानुमान';
    if (clean.includes('cyclone') || clean.includes('wind')) return 'चक्रवात और तेज हवा';
    if (clean.includes('waterlog') || clean.includes('flood')) return 'जलभराव और बाढ़';
    if (clean.includes('spray')) return 'छिड़काव उपयुक्तता';
    if (clean.includes('general')) return 'सामान्य मौसम पूर्वानुमान';
    return /[a-z]/i.test(rawFocus) ? 'खेत मौसम जोखिम' : rawFocus;
  }
  if (clean.includes('heavy') || clean.includes('rain')) return 'భారీ వర్షం అంచనా';
  if (clean.includes('cyclone') || clean.includes('wind')) return 'తుఫాన్ మరియు బలమైన గాలులు';
  if (clean.includes('waterlog') || clean.includes('flood')) return 'నీటి నిల్వ మరియు వరద';
  if (clean.includes('spray')) return 'పిచికారీ అనుకూలత';
  if (clean.includes('general')) return 'సాధారణ వాతావరణ అంచనా';
  return /[a-z]/i.test(rawFocus) ? 'పొలం వాతావరణ ప్రమాదం' : rawFocus;
}

function localizeHazardFocusArg(rawHazard: string, language: Language): string {
  if (language === 'en') return rawHazard;
  const clean = rawHazard.trim().toLowerCase();
  if (language === 'hi') {
    if (clean.includes('rain')) return 'भारी वर्षा';
    if (clean.includes('cyclone')) return 'चक्रवात';
    if (clean.includes('waterlog') || clean.includes('flood')) return 'जलभराव व बाढ़';
    if (clean.includes('general')) return 'समग्र खेत जोखिम';
    return /[a-z]/i.test(rawHazard) ? 'मौसम आपदा जोखिम' : rawHazard;
  }
  if (clean.includes('rain')) return 'భారీ వర్షం';
  if (clean.includes('cyclone')) return 'తుఫాన్';
  if (clean.includes('waterlog') || clean.includes('flood')) return 'నీటి నిల్వ & వరద';
  if (clean.includes('general')) return 'సమగ్ర పొలం ప్రమాదం';
  return /[a-z]/i.test(rawHazard) ? 'వాతావరణ విపత్తు ప్రమాదం' : rawHazard;
}

function localizeRiskOrUrgencyArg(rawVal: string, language: Language): string {
  if (language === 'en') return rawVal;
  const normalized = rawVal.trim();
  if (normalized === 'Urgent' || normalized === 'High' || normalized === 'Moderate' || normalized === 'Low') {
    return localizePriorityLabel(normalized, language);
  }
  if (normalized === 'Critical') {
    return localizeRiskLevel('Critical', language);
  }
  return normalized;
}

export async function executeSpecialisedAgentTool(
  name: string,
  args: Record<string, unknown>,
  ctx: AgentToolExecutionContext
): Promise<ExecutedToolResult> {
  const { farmer, weather, language, symptomReport } = ctx;

  switch (name) {
    case 'analyze_weather_intelligence': {
      const focus = localizeWeatherFocusArg(String(args.focus || 'general forecast'), language);
      const wantsLive = Boolean(args.fetchLiveForDistrict) || weather.scenarioId === 'live';
      let activeWeather = weather;

      if (wantsLive && (weather.isSyntheticDemo || weather.scenarioId === 'live' || !weather.plains)) {
        try {
          const live = await fetchLiveWeather({
            district: farmer.district,
            state: farmer.state,
            location: farmer.location,
            lat: farmer.gpsCoordinates?.lat,
            lon: farmer.gpsCoordinates?.lon,
          });
          activeWeather = live.weather;
        } catch {
          // Keep existing context if live fetch fails; never invent readings
        }
      }

      const windows = computeFarmingWindows(
        {
          rainfall24hMm: activeWeather.rainfall24hMm,
          rainfall72hMm: activeWeather.rainfall72hMm,
          windSpeedKmh: activeWeather.windSpeedKmh,
          windGustKmh: activeWeather.windGustKmh,
          soilMoisturePct: activeWeather.soilMoisturePct,
        },
        language
      );

      const missingWeather: string[] = [];
      if (activeWeather.rainfall24hMm === null) {
        missingWeather.push(
          language === 'hi'
            ? '24 घंटे की वर्षा का पूर्वानुमान'
            : language === 'te'
            ? '24 గంటల వర్షపాతం అంచనా'
            : '24h rainfall forecast'
        );
      }
      if (activeWeather.windSpeedKmh === null) {
        missingWeather.push(
          language === 'hi'
            ? 'हवा की निरंतर गति'
            : language === 'te'
            ? 'గాలి వేగం వివరాలు'
            : 'Sustained wind speed'
        );
      }
      if (!activeWeather.verifiedWarningLabel) {
        missingWeather.push(
          language === 'hi'
            ? 'आधिकारिक आईएमडी/एसडीएमए जिला बुलेटिन (आईएमडी मौसम पर जांचें)'
            : language === 'te'
            ? 'అధికారిక ఐఎండీ/ఎస్‌డీఎంఏ జిల్లా బులెటిన్ (ఐఎండీ మౌసంలో పరిశీలించండి)'
            : 'Official IMD/SDMA district bulletin (verify on IMD Mausam)'
        );
      }

      const plainsInfo = activeWeather.plains
        ? {
            elevationM: activeWeather.plains.elevationM,
            relief5kmM: activeWeather.plains.relief5kmM,
            plainType: localizePlainType(activeWeather.plains.plainType, language),
            drainageSlopeProfile: localizeDrainageSlopeProfile(
              activeWeather.plains.drainageSlopeProfile,
              language
            ),
            topsoilMoisturePct: activeWeather.plains.topsoilMoisturePct,
            rootZoneMoisturePct: activeWeather.plains.rootZoneMoisturePct,
            soilTempC: activeWeather.plains.soilTempC,
            evapotranspirationMmDay: activeWeather.plains.evapotranspirationMmDay,
            surfacePressureHpa: activeWeather.plains.surfacePressureHpa,
            rainProbability24hPct: activeWeather.plains.rainProbability24hPct,
            riverDischargeM3s: activeWeather.plains.riverDischargeM3s,
            riverDischargeMax4dM3s: activeWeather.plains.riverDischargeMax4dM3s,
            riverBasinStatus: localizeRiverBasinStatus(
              activeWeather.plains.riverBasinStatus,
              language
            ),
          }
        : null;

      const payload = {
        isSyntheticDemo: activeWeather.isSyntheticDemo,
        dataSource: activeWeather.dataSource,
        lastUpdated: activeWeather.lastUpdated,
        confirmedObservation: activeWeather.observationNote,
        forecastValues: {
          rainfall24hMm: activeWeather.rainfall24hMm,
          rainfall72hMm: activeWeather.rainfall72hMm,
          windSpeedKmh: activeWeather.windSpeedKmh,
          windGustKmh: activeWeather.windGustKmh,
          temperatureC: activeWeather.temperatureC,
          humidityPct: activeWeather.humidityPct,
          soilMoisturePct: activeWeather.soilMoisturePct ?? null,
        },
        plainsAndBasinTelemetry: plainsInfo,
        sprayingWindow: windows.sprayingWindow,
        irrigationGuidance: windows.irrigationGuidance,
        verifiedWarningLabel: activeWeather.verifiedWarningLabel,
        localFloodStatus: activeWeather.localFloodStatus,
        forecastUncertainty: activeWeather.forecastUncertainty,
        missingWeatherFields: missingWeather,
      };

      const agentName =
        language === 'hi'
          ? 'मौसम बुद्धिमत्ता एजेंट'
          : language === 'te'
          ? 'వాతావరణ సమాచార ఏజెంట్'
          : 'Weather Intelligence Agent';
      const taskAssigned =
        language === 'hi'
          ? `${focus} और खेत समय-सारणी का विश्लेषण`
          : language === 'te'
          ? `${focus} & పొలం పరిస్థితుల విశ్లేషణ`
          : `Analyse ${focus} & farming windows`;
      const sourceTag =
        language === 'hi'
          ? activeWeather.isSyntheticDemo
            ? '[सिंथेटिक डेमो]'
            : '[लाइव मौसम]'
          : language === 'te'
          ? activeWeather.isSyntheticDemo
            ? '[సింథటిక్ డెమో]'
            : '[లైవ్ వాతావరణం]'
          : activeWeather.isSyntheticDemo
          ? '[Synthetic Demo]'
          : '[Live Weather]';
      const resultSummary =
        language === 'hi'
          ? `${sourceTag} 24घं वर्षा: ${activeWeather.rainfall24hMm ?? 'अज्ञात'} मिमी, हवा: ${activeWeather.windSpeedKmh ?? 'अज्ञात'} किमी/घं।`
          : language === 'te'
          ? `${sourceTag} 24గం వర్షం: ${activeWeather.rainfall24hMm ?? 'తెలియదు'} మి.మీ, గాలి: ${activeWeather.windSpeedKmh ?? 'తెలియదు'} కి.మీ/గం.`
          : `${sourceTag} 24h rain: ${activeWeather.rainfall24hMm ?? 'Unknown'} mm, Wind: ${activeWeather.windSpeedKmh ?? 'Unknown'} km/h, Spray: ${windows.sprayingWindow.status}, Irrigation: ${windows.irrigationGuidance.status}.`;
      const toolArgsSummary =
        language === 'hi'
          ? `विषय="${focus}"${wantsLive ? ', लाइव=हाँ' : ''}`
          : language === 'te'
          ? `అంశం="${focus}"${wantsLive ? ', లైవ్=అవును' : ''}`
          : `focus="${focus}"${wantsLive ? ', live=true' : ''}`;

      return {
        agentId: 'weather',
        agentName,
        taskAssigned,
        toolArgsSummary,
        resultSummary,
        payload,
      };
    }

    case 'analyze_crop_intelligence': {
      const rawCrop = String(args.cropType || farmer.crops[0] || 'Crop');
      const cropType = localizeCropName(rawCrop, language);
      const localizedStage = localizeGrowthStage(farmer.growthStage, language);
      const rawSymptoms = String(args.symptoms || symptomReport?.observedSymptoms || 'None reported');
      const hasSymptoms =
        rawSymptoms.trim().toLowerCase() !== 'none reported' && rawSymptoms.trim().length > 0;
      const symptoms = hasSymptoms
        ? rawSymptoms
        : language === 'hi'
        ? 'कोई लक्षण नहीं बताए गए'
        : language === 'te'
        ? 'లక్షణాలు ఏవీ నివేదించబడలేదు'
        : 'None reported';
      const missingCropInfo: string[] = [];
      if (farmer.soilType === 'Unknown') {
        missingCropInfo.push(
          language === 'hi' ? 'मिट्टी का प्रकार' : language === 'te' ? 'నేల రకం' : 'Soil type'
        );
      }
      if (farmer.drainageType === 'Unknown') {
        missingCropInfo.push(
          language === 'hi'
            ? 'खेत की जल निकासी ढलान'
            : language === 'te'
            ? 'పొలం నీటి పారుదల వాలు'
            : 'Field drainage slope'
        );
      }
      if (!symptomReport?.observedSymptoms && !hasSymptoms) {
        missingCropInfo.push(
          language === 'hi'
            ? 'पत्ती/तने/जड़ के दृश्य लक्षण'
            : language === 'te'
            ? 'ఆకులు/కాండం/వేర్ల లక్షణాలు'
            : 'Specific leaf/stem/root visual symptoms'
        );
      }

      const stageSensitivity =
        farmer.growthStage === 'Flowering / Panicle Initiation' ||
        farmer.growthStage === 'Maturity / Pre-Harvest'
          ? language === 'hi'
            ? 'फसल झुकने, बाली क्षति और 24–48 घंटे से अधिक जलभराव के प्रति उच्च संवेदनशीलता।'
            : language === 'te'
            ? 'పంట వాలిపోవడం, కంకి నష్టం మరియు 24–48 గంటలకు పైగా నీరు నిలవడానికి అధిక సున్నితత్వం.'
            : 'High sensitivity to lodging, panicle damage, and prolonged submergence (>24–48h).'
          : farmer.growthStage === 'Nursery / Sowing'
          ? language === 'hi'
            ? 'भीगी क्यारियों में बीज बहने या सड़न का उच्च जोखिम।'
            : language === 'te'
            ? 'తడి మడులలో విత్తనాలు కొట్టుకుపోవడం లేదా కుళ్ళిపోయే అధిక ప్రమాదం.'
            : 'High risk of seed washout or damping-off in saturated beds.'
          : language === 'hi'
          ? '24–48 घंटे में सतही पानी निकलने पर मध्यम सहनशीलता।'
          : language === 'te'
          ? '24–48 గంటల్లో ఉపరితల నీరు పోతే మధ్యస్థ తట్టుకునే శక్తి.'
          : 'Moderate tolerance if surface water is drained within 24–48 hours.';

      const payload = {
        cropType,
        location: localizeLocationText(`${farmer.location}, ${farmer.district}, ${farmer.state}`, language),
        growthStage: localizedStage,
        soilType: farmer.soilType,
        reportedSymptoms: symptoms,
        stageSensitivity,
        cautiousAssessment: hasSymptoms
          ? language === 'hi'
            ? 'कोई भी फफूंदनाशी या जीवाणुनाशी छिड़कने से पहले खेत के लक्षणों की जांच विशेषज्ञ से अवश्य कराएं।'
            : language === 'te'
            ? 'ఏదైనా ఫంగిసైడ్ లేదా బ్యాక్టీరిసైడ్ చల్లే ముందు పొలం లక్షణాలను వ్యవసాయ అధికారితో తప్పనిసరిగా నిర్ధారించుకోండి.'
            : 'Field symptoms must be visually confirmed before applying any targeted fungicide or bactericide.'
          : language === 'hi'
          ? 'कोई रोग लक्षण नहीं बताए गए हैं; जलभराव और तेज हवा से सुरक्षा पर ध्यान दें।'
          : language === 'te'
          ? 'రోగ లక్షణాలు ఏవీ నివేదించబడలేదు; నీటి నిల్వ మరియు గాలి నష్ట నివారణపై దృష్టి పెట్టండి.'
          : 'No disease symptoms reported; focus on abiotic waterlogging and wind-lodging resilience.',
        missingCropInfo,
      };

      const agentName =
        language === 'hi'
          ? 'फसल बुद्धिमत्ता एजेंट'
          : language === 'te'
          ? 'పంట సమాచార ఏజెంట్'
          : 'Crop Intelligence Agent';
      const taskAssigned =
        language === 'hi'
          ? `${cropType} फसल की स्थिति का मूल्यांकन`
          : language === 'te'
          ? `${cropType} పంట పరిస్థితి పరిశీలన`
          : `Evaluate ${cropType} at ${localizedStage} stage`;
      const toolArgsSummary =
        language === 'hi'
          ? `फसल="${cropType}", अवस्था="${localizedStage}"`
          : language === 'te'
          ? `పంట="${cropType}", దశ="${localizedStage}"`
          : `crop="${cropType}", stage="${localizedStage}"`;

      return {
        agentId: 'crop',
        agentName,
        taskAssigned,
        toolArgsSummary,
        resultSummary: `${cropType} — ${stageSensitivity}`,
        payload,
      };
    }

    case 'assess_kisan_rakshak_risk': {
      const hazardFocus = localizeHazardFocusArg(String(args.hazardFocus || 'general'), language);
      const assessment = assessKisanRakshakRisk(farmer, weather, language);
      const localizedDistrict = localizeLocationText(farmer.district, language);
      const agentName =
        language === 'hi'
          ? 'किसान रक्षक एजेंट'
          : language === 'te'
          ? 'కిసాన్ రక్షక్ ఏజెంట్'
          : 'Kisan Rakshak Agent';
      const taskAssigned =
        language === 'hi'
          ? `जोखिम और आपदा तैयारी मूल्यांकन (${hazardFocus})`
          : language === 'te'
          ? `ప్రమాదం & విపత్తు సన్నద్ధత అంచనా (${hazardFocus})`
          : `Compute hazard risk & phased readiness (${hazardFocus})`;
      const resultSummary =
        language === 'hi'
          ? `जोखिम: ${localizeRiskLevel(assessment.riskLevel, language)} (${assessment.riskScore}/100), विश्वास: ${assessment.confidencePercent}%, अनुपलब्ध डेटा: ${assessment.missingData.length}।`
          : language === 'te'
          ? `ప్రమాద స్థాయి: ${localizeRiskLevel(assessment.riskLevel, language)} (${assessment.riskScore}/100), నమ్మకం: ${assessment.confidencePercent}%, లోపించిన వివరాలు: ${assessment.missingData.length}.`
          : `Risk: ${assessment.riskLevel} (${assessment.riskScore}/100, confidence ${assessment.confidencePercent}%). Missing inputs: ${assessment.missingData.length}.`;
      const toolArgsSummary =
        language === 'hi'
          ? `आपदा="${hazardFocus}", जिला="${localizedDistrict}"`
          : language === 'te'
          ? `విపత్తు="${hazardFocus}", జిల్లా="${localizedDistrict}"`
          : `hazard="${hazardFocus}", district="${localizedDistrict}"`;

      return {
        agentId: 'kisan_rakshak',
        agentName,
        taskAssigned,
        toolArgsSummary,
        resultSummary,
        payload: {
          ...assessment,
          verifiedEmergencyContacts: assessment.verifiedContacts,
        },
      };
    }

    case 'generate_farm_advisory': {
      const cropType = localizeCropName(String(args.cropType || farmer.crops[0] || 'Crop'), language);
      const growthStage = localizeGrowthStage(
        (String(args.growthStage || farmer.growthStage) as FarmerProfile['growthStage']) ||
          farmer.growthStage,
        language
      );
      const riskLevel = localizeRiskOrUrgencyArg(String(args.riskLevel || 'Moderate'), language);

      const generalGuidance =
        language === 'hi'
          ? [
              `${cropType} (${farmer.farmSizeAcres} एकड़) के लिए खेत की मेड़ की निकास नालियां साफ रखें।`,
              'बारिश या 20 किमी/घंटा से तेज हवा में पत्तियों पर छिड़काव रोक दें।',
              'बीज, यूरिया/डीएपी की बोरियां और पंप मोटर सूखे ऊंचे स्थान पर रखें।',
            ]
          : language === 'te'
          ? [
              `${cropType} (${farmer.farmSizeAcres} ఎకరాలు) పొలం గట్ల నీటి పారుదల కాలువలను శుభ్రంగా ఉంచండి.`,
              'వర్షం లేదా గంటకు 20 కి.మీ. కంటే ఎక్కువ గాలి ఉన్నప్పుడు ఆకులపై పిచికారీ ఆపండి.',
              'విత్తనాలు, యూరియా/డీఏపీ బస్తాలు మరియు పంపు మోటార్లను పొడిగా ఉన్న ఎత్తైన ప్రదేశంలో పెట్టండి.',
            ]
          : [
              `Clear field bund outlets and silt traps for ${cropType} (${farmer.farmSizeAcres} acres).`,
              'Suspend foliar spraying during rain or winds above 20 km/h.',
              'Store seeds, urea/DAP bags, and pump motors off the floor on dry pallets.',
            ];

      const expertConfirmationItems =
        language === 'hi'
          ? [
              `${growthStage} अवस्था में मुख्य मेड़ काटने या समय से पहले कटाई से पहले नजदीकी केवीके या किसान कॉल सेंटर (1800-180-1551) से सलाह लें।`,
              'बाढ़ या जलभराव के बाद कृषि अधिकारी से जांच कराए बिना रासायनिक दवा न डालें।',
            ]
          : language === 'te'
          ? [
              `${growthStage} దశలో ప్రధాన గట్లు కోసే ముందు లేదా ముందస్తు కోత చేసే ముందు స్థానిక కేవీకే లేదా కిసాన్ కాల్ సెంటర్ (1800-180-1551) ను సంప్రదించండి.`,
              'వరద లేదా నీరు నిలిచిన తర్వాత వ్యవసాయ అధికారి నిర్ధారణ లేకుండా రసాయన మందులు వాడవద్దు.',
            ]
          : [
              `Before cutting main bunds or harvesting early at ${growthStage} stage, consult your local KVK or Kisan Call Centre (1800-180-1551).`,
              'Do not apply post-flood fungicides/bactericides without verifying symptoms with an agriculture officer.',
            ];

      const agentName =
        language === 'hi'
          ? 'कृषि सलाहकार एजेंट'
          : language === 'te'
          ? 'వ్యవసాయ సలహా ఏజెంట్'
          : 'Farm Advisory Agent';
      const taskAssigned =
        language === 'hi'
          ? `${cropType} के लिए सरल कृषि सलाह तैयार करना`
          : language === 'te'
          ? `${cropType} కోసం సులభమైన వ్యవసాయ సలహా తయారీ`
          : `Prepare plain-language advisory for ${cropType}`;
      const resultSummary =
        language === 'hi'
          ? `${generalGuidance.length} सामान्य खेत कदम और ${expertConfirmationItems.length} केवीके-पुष्टि सलाह तैयार की गई।`
          : language === 'te'
          ? `${generalGuidance.length} సాధారణ పొలం సూచనలు మరియు ${expertConfirmationItems.length} కేవీకే-నిర్ధారణ సలహాలు సిద్ధం.`
          : `Generated ${generalGuidance.length} general field steps and ${expertConfirmationItems.length} KVK-confirmation advisories.`;
      const toolArgsSummary =
        language === 'hi'
          ? `फसल="${cropType}", जोखिम="${riskLevel}"`
          : language === 'te'
          ? `పంట="${cropType}", ప్రమాదం="${riskLevel}"`
          : `crop="${cropType}", risk="${riskLevel}"`;

      return {
        agentId: 'farm_advisory',
        agentName,
        taskAssigned,
        toolArgsSummary,
        resultSummary,
        payload: {
          cropType,
          growthStage,
          riskLevel,
          generalAgronomicGuidance: generalGuidance,
          requiresExpertConfirmation: expertConfirmationItems,
        },
      };
    }

    case 'prepare_action_alerts': {
      const rawUrgency = String(args.urgency || 'High');
      const urgency = localizeRiskOrUrgencyArg(rawUrgency, language);
      const alertTitle = String(
        args.alertTitle ||
          (language === 'hi'
            ? 'खेत जल निकासी और मौसम तैयारी जांच'
            : language === 'te'
            ? 'పొలం నీటి పారుదల & వాతావరణ సన్నద్ధత తనిఖీ'
            : 'Field Drainage & Weather Readiness Check')
      );
      const reason = String(
        args.reason ||
          (language === 'hi'
            ? 'मौसम और फसल संवेदनशीलता विश्लेषण के आधार पर।'
            : language === 'te'
            ? 'వాతావరణం మరియు పంట సున్నితత్వ విశ్లేషణ ఆధారంగా.'
            : 'Triggered by weather and crop vulnerability analysis.')
      );
      const actionRequired = String(
        args.actionRequired ||
          (language === 'hi'
            ? 'जल निकासी नालियां जांचें और कृषि सामग्री सुरक्षित रखें।'
            : language === 'te'
            ? 'నీటి పారుదల కాలువలను తనిఖీ చేసి వ్యవసాయ సామగ్రిని భద్రపరచండి.'
            : 'Inspect drainage channels and secure inputs.')
      );
      const requiresHumanConfirmation = Boolean(args.requiresHumanConfirmation ?? true);

      const agentName =
        language === 'hi'
          ? 'कार्रवाई और अलर्ट एजेंट'
          : language === 'te'
          ? 'చర్య & హెచ్చరిక ఏజెంట్'
          : 'Action and Alert Agent';
      const taskAssigned =
        language === 'hi'
          ? 'खेत अलर्ट प्राथमिकता तय करना'
          : language === 'te'
          ? 'పొలం హెచ్చరిక ప్రాధాన్యత నిర్ణయించడం'
          : `Prioritise ${urgency} farm alert`;
      const resultSummary =
        language === 'hi'
          ? `अलर्ट तैयार: "${alertTitle}"`
          : language === 'te'
          ? `హెచ్చరిక సిద్ధం: "${alertTitle}"`
          : `Prepared ${urgency} alert: "${alertTitle}" (human confirmation: ${requiresHumanConfirmation ? 'required' : 'standard'}).`;
      const toolArgsSummary =
        language === 'hi'
          ? `तात्कालिकता="${urgency}", पुष्टि=${requiresHumanConfirmation ? 'आवश्यक' : 'नहीं'}`
          : language === 'te'
          ? `అత్యవసరత="${urgency}", నిర్ధారణ=${requiresHumanConfirmation ? 'అవసరం' : 'సాధారణం'}`
          : `urgency="${urgency}", confirm=${requiresHumanConfirmation}`;

      return {
        agentId: 'action_alert',
        agentName,
        taskAssigned,
        toolArgsSummary,
        resultSummary,
        payload: {
          urgency,
          alertTitle,
          reason,
          actionRequired,
          requiresHumanConfirmation,
        },
      };
    }

    case 'format_voice_language_brief': {
      const target = String(args.targetLanguage || language);
      const langNames: Record<string, string> =
        language === 'hi'
          ? { en: 'अंग्रेज़ी', hi: 'हिन्दी', te: 'तेलुगु' }
          : language === 'te'
          ? { en: 'ఆంగ్లం', hi: 'హిందీ', te: 'తెలుగు' }
          : { en: 'English', hi: 'Hindi', te: 'Telugu' };
      const targetLabel = langNames[target] || target;
      const agentName =
        language === 'hi'
          ? 'आवाज़ और भाषा एजेंट'
          : language === 'te'
          ? 'వాయిస్ & భాష ఏజెంట్'
          : 'Voice and Language Agent';
      const taskAssigned =
        language === 'hi'
          ? `${targetLabel} भाषा में आवाज़ सारांश तैयार करना`
          : language === 'te'
          ? `${targetLabel} భాషలో వాయిస్ సారాంశం సిద్ధం చేయడం`
          : `Adapt output & spoken brief for ${targetLabel}`;
      const resultSummary =
        language === 'hi'
          ? `${targetLabel} में सरल किसान भाषा और वॉइस सारांश सेट किया गया।`
          : language === 'te'
          ? `${targetLabel} లో సులభమైన రైతు భాష మరియు వాయిస్ సారాంశం సిద్ధమైంది.`
          : `Configured plain-language spoken summary and farmer terminology in ${targetLabel}.`;
      const toolArgsSummary =
        language === 'hi'
          ? `भाषा="${targetLabel}"`
          : language === 'te'
          ? `భాష="${targetLabel}"`
          : `lang="${target}"`;

      return {
        agentId: 'voice_language',
        agentName,
        taskAssigned,
        toolArgsSummary,
        resultSummary,
        payload: {
          targetLanguage: target,
          languageLabel: targetLabel,
          speechGuidelines:
            language === 'hi'
              ? 'सौम्य, छोटे और सरल हिन्दी वाक्यों में बोलें। तकनीकी शब्द कम रखें, संख्याएं स्पष्ट बताएं और सबसे जरूरी सुरक्षा कदम पहले रखें।'
              : language === 'te'
              ? 'మృదువైన, చిన్న మరియు సులభమైన తెలుగు వాక్యాలలో చెప్పండి. కష్టమైన పదాలు వాడకండి, సంఖ్యలు స్పష్టంగా చెప్పండి మరియు ముఖ్యమైన రక్షణ చర్యను ముందుగా చెప్పండి.'
              : 'Speak warmly and softly in short, simple sentences, avoid jargon, state numbers clearly, and put the most urgent protective step first.',
        },
      };
    }

    default:
      return {
        agentId: 'master',
        agentName:
          language === 'hi'
            ? 'मास्टर ऑर्केस्ट्रेटर'
            : language === 'te'
            ? 'మాస్టర్ ఆర్కెస్ట్రేటర్'
            : 'Master Orchestrator',
        taskAssigned: `${name}`,
        toolArgsSummary: JSON.stringify(args),
        resultSummary:
          language === 'hi'
            ? 'यह टूल उपलब्ध नहीं है।'
            : language === 'te'
            ? 'ఈ సాధనం అందుబాటులో లేదు.'
            : `Tool "${name}" is not registered.`,
        payload: { error: `Unknown tool: ${name}` },
      };
  }
}
