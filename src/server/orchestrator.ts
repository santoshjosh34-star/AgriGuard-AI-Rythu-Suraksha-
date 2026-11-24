import { ThinkingLevel, Type, type Content, type Part } from '@google/genai';
import {
  localizeCropName,
  localizeCropsList,
  localizeDrainageSlopeProfile,
  localizeFarmerName,
  localizeFloodStatus,
  localizeGrowthStage,
  localizeLocationText,
  localizePlainType,
  localizeRiverBasinStatus,
  localizeSoilType,
  localizeWeatherContext,
} from '../lib/domainTranslations.ts';
import { hasTargetLanguageScript } from '../lib/voiceDoubtUtils.ts';
import {
  AGRIGUARD_TOOL_DECLARATIONS,
  executeSpecialisedAgentTool,
} from './agentTools.ts';
import {
  callWithStickyModel,
  createGeminiClient,
  extractJsonFromText,
  type SupportedGeminiModel,
} from './geminiClient.ts';
import { fetchLiveWeather } from './liveWeatherService.ts';
import type {
  AdvisoryRecommendation,
  AgentExecutionStep,
  AgentId,
  CropPhotoDiagnosis,
  CropSymptomReport,
  FarmAlert,
  FarmerProfile,
  GeminiModelPreference,
  Language,
  OrchestratorRunResult,
  WeatherContext,
} from '../types/agriguard.ts';

export interface OrchestrateRequestBody {
  query: string;
  farmer: FarmerProfile;
  weather: WeatherContext;
  language: Language;
  symptomReport?: Partial<CropSymptomReport>;
  photoDiagnosis?: CropPhotoDiagnosis;
  preferredModel?: GeminiModelPreference;
}

const LANGUAGE_NAME: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi (Devanagari script)',
  te: 'Telugu (తెలుగు script)',
};

function buildSystemInstruction(language: Language, weather: WeatherContext): string {
  const pureScriptRule =
    language === 'hi'
      ? 'Write EVERY word—including acronyms and units—in pure Devanagari script (e.g., केवीके, आईएमडी, एसडीएमए, एनडीएमए, एआई, जीपीएस, मिमी, किमी/घंटा, मी., मी³/से, भारतीय मानक समय, धान एमटीयू-1010). NEVER output English words or Latin acronyms like KVK, IMD, SDMA, AI, GPS, mm, km/h, hPa, ET0, or IST.'
      : language === 'te'
      ? 'Write EVERY word—including acronyms and units—in pure Telugu script (e.g., కేవీకే, ఐఎండీ, ఎస్‌డీఎంఏ, ఎన్డీఎంఏ, ఏఐ, జీపీఎస్, మి.మీ, కి.మీ/గం, మీ., మీ³/సె, భారత కాలమానం, వరి ఎంటీయూ-1010). NEVER output English words or Latin acronyms like KVK, IMD, SDMA, AI, GPS, mm, km/h, hPa, ET0, or IST.'
      : '';

  return `You are the Master Orchestrator Agent of AgriGuard AI ("Every Farmer Deserves an AI Team"), coordinating six specialised agricultural agents for an Indian farmer.

CRITICAL RELIABILITY & SAFETY RULES:
1. You MUST call the relevant specialised agent tools before answering. Do NOT invent weather measurements, live IMD warnings, or fake sensor readings.
2. Always ground your reasoning, alerts, and farm steps in the LIVE weather, soil moisture, elevation, plains relief slope, and GloFAS river basin telemetry provided in context & tool outputs (${
    weather.isSyntheticDemo
      ? 'NOTE: CURRENT CONTEXT IS A SYNTHETIC TEST SCENARIO'
      : 'LIVE REAL-TIME FARM WEATHER & PLAINS TELEMETRY'
  }). Clearly distinguish confirmed observations from numerical forecasts.
3. Check for any conflicting information or gaps across the tools you invoke, and explicitly explain uncertainty and missing data.
4. Distinguish general agronomic guidance from advice requiring local KVK/expert confirmation. Never guarantee crop survival or financial outcomes.
5. For emergency contacts, ONLY cite verified Indian helplines returned by the tools (112, 1078, 1800-180-1551, 1070/1077).
6. STRICT LANGUAGE LOCK (HIGHEST PRIORITY): Every single human-readable text field in your response (finalAnswer, spokenSummary, conflictCheck, uncertaintyAndMissingInfo, recommendations titles/summaries/steps, and alerts titles/reasons/actionRequired) MUST be written ONLY in ${LANGUAGE_NAME[language]} using simple, warm, caring, practical farming language. ${pureScriptRule} Even if the farmer's question or highlighted text is written in English or another language, you MUST translate and reply 100% in ${LANGUAGE_NAME[language]} ONLY. Do NOT write English sentences when ${LANGUAGE_NAME[language]} is selected. Keep only schema enum strings (guidanceType, priority) in their exact English schema constants.
7. When passing string arguments (like focus, hazardFocus, alertTitle, reason, actionRequired, cropType) to tool calls, write those descriptive text arguments in ${LANGUAGE_NAME[language]}.
8. Always invoke at least: analyze_weather_intelligence, analyze_crop_intelligence, assess_kisan_rakshak_risk, and format_voice_language_brief when the farmer asks about weather/disaster/crop protection, and invoke generate_farm_advisory + prepare_action_alerts when actionable tasks or alerts are warranted.`;
}

export async function runMasterOrchestrator(
  input: OrchestrateRequestBody
): Promise<OrchestratorRunResult> {
  const ai = createGeminiClient();
  const initialModel: SupportedGeminiModel =
    input.preferredModel === 'gemini-3.1-flash-lite'
      ? 'gemini-3.1-flash-lite'
      : 'gemini-4-hydrogen';
  const modelState: { model: SupportedGeminiModel } = { model: initialModel };

  let effectiveWeather = input.weather;
  if (
    effectiveWeather.scenarioId === 'live' ||
    (!effectiveWeather.isSyntheticDemo &&
      effectiveWeather.scenarioId !== 'custom' &&
      !effectiveWeather.plains)
  ) {
    try {
      const live = await fetchLiveWeather({
        district: input.farmer.district,
        state: input.farmer.state,
        location: input.farmer.location,
        lat: input.farmer.gpsCoordinates?.lat ?? effectiveWeather.coordinates?.lat,
        lon: input.farmer.gpsCoordinates?.lon ?? effectiveWeather.coordinates?.lon,
      });
      effectiveWeather = live.weather;
    } catch {
      // Keep incoming context if live refresh fails transiently
    }
  }

  const localizedWeather = localizeWeatherContext(effectiveWeather, input.language);
  const localizedFarmer = {
    name: localizeFarmerName(input.farmer.name, input.language),
    state: localizeLocationText(input.farmer.state, input.language),
    district: localizeLocationText(input.farmer.district, input.language),
    location: localizeLocationText(input.farmer.location, input.language),
    crops: localizeCropsList(input.farmer.crops, input.language),
    farmSizeAcres: input.farmer.farmSizeAcres,
    soilType: localizeSoilType(input.farmer.soilType, input.language),
    growthStage: localizeGrowthStage(input.farmer.growthStage, input.language),
    drainageType: input.farmer.drainageType,
    nearCoastOrRiver: input.farmer.nearCoastOrRiver,
  };

  const localizedPlains = localizedWeather.plains
    ? {
        elevationM: localizedWeather.plains.elevationM,
        relief5kmM: localizedWeather.plains.relief5kmM,
        plainType: localizePlainType(localizedWeather.plains.plainType, input.language),
        drainageSlopeProfile: localizeDrainageSlopeProfile(
          localizedWeather.plains.drainageSlopeProfile,
          input.language
        ),
        topsoilMoisturePct: localizedWeather.plains.topsoilMoisturePct,
        rootZoneMoisturePct: localizedWeather.plains.rootZoneMoisturePct,
        soilTempC: localizedWeather.plains.soilTempC,
        evapotranspirationMmDay: localizedWeather.plains.evapotranspirationMmDay,
        surfacePressureHpa: localizedWeather.plains.surfacePressureHpa,
        rainProbability24hPct: localizedWeather.plains.rainProbability24hPct,
        riverDischargeM3s: localizedWeather.plains.riverDischargeM3s,
        riverDischargeMax4dM3s: localizedWeather.plains.riverDischargeMax4dM3s,
        riverBasinStatus: localizeRiverBasinStatus(
          localizedWeather.plains.riverBasinStatus,
          input.language
        ),
      }
    : null;

  const contextSummary = {
    farmerProfile: localizedFarmer,
    weatherContext: {
      scenarioId: localizedWeather.scenarioId,
      scenarioTitle: localizedWeather.scenarioTitle,
      isSyntheticDemo: localizedWeather.isSyntheticDemo,
      dataSource: localizedWeather.dataSource,
      lastUpdated: localizedWeather.lastUpdated,
      weatherConditionLabel: localizedWeather.weatherConditionLabel ?? null,
      temperatureC: localizedWeather.temperatureC,
      humidityPct: localizedWeather.humidityPct,
      soilMoisturePct: localizedWeather.soilMoisturePct ?? null,
      rainfall24hMm: localizedWeather.rainfall24hMm,
      rainfall72hMm: localizedWeather.rainfall72hMm,
      windSpeedKmh: localizedWeather.windSpeedKmh,
      windGustKmh: localizedWeather.windGustKmh,
      localFloodStatus: localizeFloodStatus(localizedWeather.localFloodStatus, input.language),
      verifiedWarningLabel: localizedWeather.verifiedWarningLabel,
      plainsTelemetry: localizedPlains,
    },
    symptomReport: input.symptomReport ?? null,
    cropPhotoVisionDiagnosis: input.photoDiagnosis
      ? {
          identifiedCrop: input.photoDiagnosis.identifiedCrop,
          identificationConfidencePct: input.photoDiagnosis.identificationConfidencePct,
          healthScore: input.photoDiagnosis.healthScore,
          healthStatus: input.photoDiagnosis.healthStatus,
          healthSummary: input.photoDiagnosis.healthSummary,
          detectedProblems: input.photoDiagnosis.detectedProblems,
          imageQualityLimitations: input.photoDiagnosis.imageQualityLimitations,
        }
      : null,
    preferredLanguage: input.language,
  };

  const contents: Content[] = [
    {
      role: 'user',
      parts: [
        {
          text: `Farmer request: "${input.query}"\n\nFarm, Weather & Plains Telemetry Context:\n${JSON.stringify(
            contextSummary,
            null,
            2
          )}\n\nStep 1: Call the relevant specialised agent tools in parallel now to gather verified tool outputs.`,
        },
      ],
    },
  ];

  const executionSteps: AgentExecutionStep[] = [];
  const selectedAgentsSet = new Set<AgentId>(['master']);
  const toolPayloads: Record<string, Record<string, unknown>> = {};

  let lastModelText = '';
  const maxToolRounds = 3;

  for (let round = 0; round < maxToolRounds; round++) {
    const response = await callWithStickyModel(ai, modelState, {
      contents,
      config: {
        systemInstruction: buildSystemInstruction(input.language, effectiveWeather),
        tools: [{ functionDeclarations: AGRIGUARD_TOOL_DECLARATIONS }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const functionCalls = response.functionCalls;
    const candidateContent = response.candidates?.[0]?.content;

    if (functionCalls && functionCalls.length > 0 && candidateContent) {
      contents.push(candidateContent);
      const responseParts: Part[] = [];

      for (let idx = 0; idx < functionCalls.length; idx++) {
        const call = functionCalls[idx];
        const t0 = Date.now();
        const args = (call.args ?? {}) as Record<string, unknown>;
        const toolName = call.name || 'unknown_tool';

        const executed = await executeSpecialisedAgentTool(toolName, args, {
          farmer: input.farmer,
          weather: effectiveWeather,
          language: input.language,
          symptomReport: input.symptomReport,
        });

        const durationMs = Math.max(1, Date.now() - t0);
        selectedAgentsSet.add(executed.agentId);
        toolPayloads[toolName] = executed.payload;

        executionSteps.push({
          id: `step-${round}-${idx}-${toolName}`,
          agentId: executed.agentId,
          agentName: executed.agentName,
          taskAssigned: executed.taskAssigned,
          toolUsed: toolName,
          toolArgsSummary: executed.toolArgsSummary,
          resultObtained: executed.resultSummary,
          status: executed.payload.error ? 'error' : 'completed',
          durationMs,
        });

        responseParts.push({
          functionResponse: {
            id: call.id,
            name: toolName,
            response: { result: executed.payload },
          },
        });
      }

      contents.push({
        role: 'user',
        parts: responseParts,
      });
    } else {
      lastModelText = response.text ?? '';
      break;
    }
  }

  // Final structured synthesis pass to ensure clean JSON schema without guessing
  const synthesisResponse = await callWithStickyModel(ai, modelState, {
    contents: [
      ...contents,
      {
        role: 'user',
        parts: [
          {
            text: `Synthesize all tool findings above into a single clear, warm, farmer-friendly structured JSON response written STRICTLY and ONLY in ${LANGUAGE_NAME[input.language]}. Notice: even if the farmer's query contained English words, write ALL finalAnswer, spokenSummary, conflictCheck, uncertaintyAndMissingInfo, recommendation, and alert prose strictly in ${LANGUAGE_NAME[input.language]}. Keep spokenSummary soft, calm, natural, and ready to read aloud in ${LANGUAGE_NAME[input.language]}. Remember: do not invent weather or warnings; highlight missing data and uncertainties; separate general guidance from KVK-expert confirmation.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: buildSystemInstruction(input.language, effectiveWeather),
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          finalAnswer: {
            type: Type.STRING,
            description: 'Clear, structured final action plan for the farmer in the target language.',
          },
          spokenSummary: {
            type: Type.STRING,
            description: 'Short 2-3 sentence plain-language summary suitable for text-to-speech playback in the target language.',
          },
          conflictCheck: {
            type: Type.STRING,
            description: 'Explicit check noting whether agent findings align or have conflicts/caveats.',
          },
          uncertaintyAndMissingInfo: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of forecast uncertainties and missing farm/field information.',
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                guidanceType: {
                  type: Type.STRING,
                  description: 'Must be either "General Agronomic Guidance" or "Requires KVK / Expert Confirmation"',
                },
                summary: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['title', 'guidanceType', 'summary', 'steps'],
            },
          },
          alerts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                priority: {
                  type: Type.STRING,
                  description: 'Urgent, High, Moderate, or Low',
                },
                reason: { type: Type.STRING },
                actionRequired: { type: Type.STRING },
                requiresHumanConfirmation: { type: Type.BOOLEAN },
              },
              required: ['title', 'priority', 'reason', 'actionRequired', 'requiresHumanConfirmation'],
            },
          },
        },
        required: [
          'finalAnswer',
          'spokenSummary',
          'conflictCheck',
          'uncertaintyAndMissingInfo',
          'recommendations',
          'alerts',
        ],
      },
    },
  });

  const localizedFallbackFinal =
    input.language === 'hi'
      ? 'मास्टर ऑर्केस्ट्रेटर ने सभी एजेंट उपकरणों की जांच पूरी कर ली है।'
      : input.language === 'te'
      ? 'మాస్టర్ ఆర్కెస్ట్రేటర్ అన్ని ఏజెంట్ సాధనాల పరిశీలన పూర్తి చేసింది.'
      : 'Master Orchestrator completed tool inspection.';
  const localizedFallbackConflict =
    input.language === 'hi'
      ? 'सभी एजेंट परिणामों की आपस में जांच की गई है।'
      : input.language === 'te'
      ? 'అన్ని ఏజెంట్ ఫలితాలను పరస్పరం సరిపోల్చి తనిఖీ చేయడం జరిగింది.'
      : 'All invoked agent outputs were cross-checked for consistency.';

  const parsed = extractJsonFromText(synthesisResponse.text ?? '') ?? {
    finalAnswer: lastModelText || localizedFallbackFinal,
    spokenSummary: (lastModelText || localizedFallbackFinal).slice(0, 220),
    conflictCheck: localizedFallbackConflict,
    uncertaintyAndMissingInfo: [],
    recommendations: [],
    alerts: [],
  };

  let finalAnswerText = String(parsed.finalAnswer || lastModelText || localizedFallbackFinal);
  let spokenSummaryText = String(parsed.spokenSummary || finalAnswerText.slice(0, 240));
  let conflictCheckText = String(parsed.conflictCheck || localizedFallbackConflict);
  let uncertaintyList = Array.isArray(parsed.uncertaintyAndMissingInfo)
    ? parsed.uncertaintyAndMissingInfo.map(String)
    : [];

  let rawRecs = Array.isArray(parsed.recommendations)
    ? (parsed.recommendations as Array<Record<string, unknown>>)
    : [];
  let rawAlerts = Array.isArray(parsed.alerts)
    ? (parsed.alerts as Array<Record<string, unknown>>)
    : [];

  const needsScriptEnforcement =
    input.language !== 'en' &&
    (!hasTargetLanguageScript(spokenSummaryText, input.language) ||
      !hasTargetLanguageScript(finalAnswerText, input.language) ||
      !hasTargetLanguageScript(conflictCheckText, input.language) ||
      rawRecs.some(
        (r) =>
          !hasTargetLanguageScript(String(r.title || ''), input.language) ||
          !hasTargetLanguageScript(String(r.summary || ''), input.language)
      ) ||
      rawAlerts.some(
        (a) =>
          !hasTargetLanguageScript(String(a.title || ''), input.language) ||
          !hasTargetLanguageScript(String(a.reason || ''), input.language) ||
          !hasTargetLanguageScript(String(a.actionRequired || ''), input.language)
      ));

  // Enforce strict target script (Telugu / Hindi) if any English prose or Latin acronyms leaked into output
  if (needsScriptEnforcement) {
    try {
      const enforceResponse = await callWithStickyModel(ai, modelState, {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Convert ALL human-readable prose and acronyms (including KVK, IMD, SDMA, NDMA, AI, GPS, mm, km/h, IST) in this JSON strictly into pure, natural, gentle ${LANGUAGE_NAME[input.language]} with ZERO English words (keep ONLY numbers, helpline digits, and the exact schema enum values for guidanceType and priority):\n${JSON.stringify(
                  {
                    finalAnswer: finalAnswerText,
                    spokenSummary: spokenSummaryText,
                    conflictCheck: conflictCheckText,
                    uncertaintyAndMissingInfo: uncertaintyList,
                    recommendations: rawRecs,
                    alerts: rawAlerts,
                  },
                  null,
                  2
                )}`,
              },
            ],
          },
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              finalAnswer: { type: Type.STRING },
              spokenSummary: { type: Type.STRING },
              conflictCheck: { type: Type.STRING },
              uncertaintyAndMissingInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    guidanceType: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['title', 'guidanceType', 'summary', 'steps'],
                },
              },
              alerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    actionRequired: { type: Type.STRING },
                    requiresHumanConfirmation: { type: Type.BOOLEAN },
                  },
                  required: ['title', 'priority', 'reason', 'actionRequired', 'requiresHumanConfirmation'],
                },
              },
            },
            required: [
              'finalAnswer',
              'spokenSummary',
              'conflictCheck',
              'uncertaintyAndMissingInfo',
              'recommendations',
              'alerts',
            ],
          },
        },
      });
      const translated = extractJsonFromText(enforceResponse.text ?? '');
      if (translated) {
        if (typeof translated.finalAnswer === 'string' && translated.finalAnswer.trim()) {
          finalAnswerText = translated.finalAnswer.trim();
        }
        if (typeof translated.spokenSummary === 'string' && translated.spokenSummary.trim()) {
          spokenSummaryText = translated.spokenSummary.trim();
        }
        if (typeof translated.conflictCheck === 'string' && translated.conflictCheck.trim()) {
          conflictCheckText = translated.conflictCheck.trim();
        }
        if (Array.isArray(translated.uncertaintyAndMissingInfo)) {
          uncertaintyList = translated.uncertaintyAndMissingInfo.map(String);
        }
        if (Array.isArray(translated.recommendations)) {
          rawRecs = translated.recommendations as Array<Record<string, unknown>>;
        }
        if (Array.isArray(translated.alerts)) {
          rawAlerts = translated.alerts as Array<Record<string, unknown>>;
        }
      }
    } catch {
      // Keep original parsed text if optional translation pass encounters transient failure
    }
  }

  const nowIso = new Date().toISOString();
  const runId = `run-${Date.now()}`;
  const primaryCrop = localizeCropName(
    input.farmer.crops[0] || (input.language === 'hi' ? 'फसल' : input.language === 'te' ? 'పంట' : 'Crop'),
    input.language
  );

  const generatedRecommendations: AdvisoryRecommendation[] = rawRecs.map((rec, i) => {
    const gType =
      rec.guidanceType === 'Requires KVK / Expert Confirmation'
        ? 'Requires KVK / Expert Confirmation'
        : 'General Agronomic Guidance';
    const defaultRecTitle =
      input.language === 'hi'
        ? 'कृषि सलाह कदम'
        : input.language === 'te'
        ? 'వ్యవసాయ సలహా సూచన'
        : 'Farm Advisory Step';
    return {
      id: `${runId}-rec-${i}`,
      title: String(rec.title || defaultRecTitle),
      crop: primaryCrop,
      guidanceType: gType,
      summary: String(rec.summary || ''),
      steps: Array.isArray(rec.steps) ? rec.steps.map(String) : [],
      sourceAgent: 'farm_advisory',
      createdAt: nowIso,
      acknowledged: false,
    };
  });

  const generatedAlerts: FarmAlert[] = rawAlerts.map((al, i) => {
    const pStr = String(al.priority || 'Moderate');
    const priority = (['Urgent', 'High', 'Moderate', 'Low'].includes(pStr)
      ? pStr
      : 'Moderate') as FarmAlert['priority'];
    const defaultAlertTitle =
      input.language === 'hi'
        ? 'खेत कार्रवाई अलर्ट'
        : input.language === 'te'
        ? 'పొలం చర్య హెచ్చరిక'
        : 'Field Action Alert';
    const defaultAlertReason =
      input.language === 'hi'
        ? 'मौसम और फसल विश्लेषण के आधार पर तैयार अलर्ट।'
        : input.language === 'te'
        ? 'వాతావరణం మరియు పంట విశ్లేషణ ఆధారంగా రూపొందించబడినది.'
        : 'Generated from multi-agent weather & crop review.';
    return {
      id: `${runId}-alert-${i}`,
      title: String(al.title || defaultAlertTitle),
      priority,
      reason: String(al.reason || defaultAlertReason),
      actionRequired: String(al.actionRequired || ''),
      requiresHumanConfirmation: Boolean(al.requiresHumanConfirmation ?? true),
      humanConfirmed: false,
      status: 'pending',
      sourceAgent: 'action_alert',
      createdAt: nowIso,
    };
  });

  return {
    runId,
    timestamp: nowIso,
    query: input.query,
    language: input.language,
    scenarioId: effectiveWeather.scenarioId,
    isSyntheticContext: effectiveWeather.isSyntheticDemo,
    selectedAgents: Array.from(selectedAgentsSet),
    executionSteps,
    finalAnswer: finalAnswerText,
    spokenSummary: spokenSummaryText,
    conflictCheck: conflictCheckText,
    uncertaintyAndMissingInfo: uncertaintyList,
    generatedRecommendations,
    generatedAlerts,
  };
}
