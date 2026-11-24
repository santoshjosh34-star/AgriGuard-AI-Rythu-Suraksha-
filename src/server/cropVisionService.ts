import { ThinkingLevel, Type } from '@google/genai';
import { normalizeCropPhotoDiagnosis, parseImageDataUrl } from '../lib/cropPhotoUtils.ts';
import {
  localizeCropsList,
  localizeLocationText,
  localizeSoilType,
} from '../lib/domainTranslations.ts';
import { hasTargetLanguageScript } from '../lib/voiceDoubtUtils.ts';
import type {
  CropPhotoDiagnosis,
  FarmerProfile,
  GeminiModelPreference,
  Language,
} from '../types/agriguard.ts';
import {
  callWithStickyModel,
  createGeminiClient,
  extractJsonFromText,
  type SupportedGeminiModel,
} from './geminiClient.ts';

export interface AnalyzeCropPhotoRequest {
  imageDataUrl: string;
  language: Language;
  farmer?: Partial<FarmerProfile>;
  farmerNotes?: string;
  preferredModel?: GeminiModelPreference;
}

const LANGUAGE_NAME: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi (Devanagari script)',
  te: 'Telugu (తెలుగు script)',
};

export async function analyzeCropPhotoWithGemini(
  input: AnalyzeCropPhotoRequest
): Promise<CropPhotoDiagnosis> {
  const parsedImg = parseImageDataUrl(input.imageDataUrl, input.language);
  if (!parsedImg.ok) {
    throw new Error(`VALIDATION_ERROR: ${parsedImg.error}`);
  }

  const ai = createGeminiClient();
  const initialModel: SupportedGeminiModel =
    input.preferredModel === 'gemini-3.1-flash-lite'
      ? 'gemini-3.1-flash-lite'
      : 'gemini-4-hydrogen';
  const modelState: { model: SupportedGeminiModel } = { model: initialModel };

  const pureScriptRule =
    input.language === 'hi'
      ? 'Write EVERY word—including acronyms and units—in pure Devanagari script (e.g., केवीके, आईएमडी, एआई, मिमी). NEVER output English words or Latin acronyms like KVK, IMD, or mm.'
      : input.language === 'te'
      ? 'Write EVERY word—including acronyms and units—in pure Telugu script (e.g., కేవీకే, ఐఎండీ, ఏఐ, మి.మీ). NEVER output English words or Latin acronyms like KVK, IMD, or mm.'
      : '';

  const systemInstruction = `You are the Crop Intelligence Vision Specialist inside AgriGuard AI, inspecting a real crop photograph uploaded by an Indian farmer.

CRITICAL SAFETY, HONESTY & ACCURACY RULES:
1. Identify the crop shown in the photo honestly (species/common name). If the photo is NOT a crop/plant or is too blurry/dark to identify, set healthStatus to "Unclear Image", set low confidence, and explain what photo is needed instead of guessing.
2. Assess overall crop health objectively on a 0-100 healthScore scale (80-100 Healthy, 60-79 Mild Stress, 35-59 Moderate Issue, 0-34 Severe / Critical) based strictly on visible leaf color, vigor, lesions, wilting, pest feeding, or water stress.
3. List each visible problem separately with specific visualEvidence seen in the photo. Never fabricate laboratory confirmation—distinguish visual signs ("appears consistent with...") from confirmed diagnoses.
4. For safety: NEVER recommend specific restricted chemical pesticide dosages without advising KVK / Agriculture Officer verification (Kisan Call Centre 1800-180-1551). Separate safe immediate physical/cultural steps from questions to verify with KVK.
5. STRICT LANGUAGE LOCK: Every human-readable string (identifiedCrop, estimatedGrowthStage, healthSummary, problemName, visualEvidence, immediateSafeSteps, generalAgronomicSteps, kvkVerificationQuestions, imageQualityLimitations, spokenSummary) MUST be written ONLY in ${LANGUAGE_NAME[input.language]}. ${pureScriptRule} Keep schema enum fields (healthStatus, category, severity) in their exact English schema enum strings.`;

  const farmHint = input.farmer
    ? `Farmer location context: ${localizeLocationText(
        input.farmer.district || 'Unknown',
        input.language
      )}, ${localizeLocationText(
        input.farmer.state || 'India',
        input.language
      )}. Expected crop in profile: ${
        input.farmer.crops?.length
          ? localizeCropsList(input.farmer.crops, input.language).join(', ')
          : 'Not specified'
      }. Soil: ${
        input.farmer.soilType
          ? localizeSoilType(input.farmer.soilType, input.language)
          : 'Unknown'
      }.`
    : 'No farm profile hint supplied.';

  const promptText = `Inspect this crop photograph carefully.
${farmHint}
${input.farmerNotes?.trim() ? `Farmer's visual note: "${input.farmerNotes.trim()}"` : ''}

Tasks:
1. Identify the crop and estimate its growth stage.
2. Score overall crop health (0-100) and summarize vigor/condition.
3. Identify any visible diseases, pests, nutrient deficiencies, water/weather stress, or physical damage with visual evidence.
4. Provide safe general agronomic actions, KVK verification questions, and any image quality limitations.
Output ONLY in ${LANGUAGE_NAME[input.language]} inside the JSON schema.`;

  const response = await callWithStickyModel(
    ai,
    modelState,
    {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: parsedImg.value.mimeType,
              data: parsedImg.value.base64Data,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identifiedCrop: { type: Type.STRING },
            identificationConfidencePct: { type: Type.NUMBER },
            estimatedGrowthStage: { type: Type.STRING },
            healthScore: { type: Type.NUMBER },
            healthStatus: {
              type: Type.STRING,
              description:
                'Must be one of: "Healthy", "Mild Stress", "Moderate Issue", "Severe / Critical", "Unclear Image"',
            },
            healthSummary: { type: Type.STRING },
            detectedProblems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  problemName: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description:
                      'Must be one of: "Disease", "Pest", "Nutrient Deficiency", "Water / Weather Stress", "Weed / Physical Damage", "Unclear"',
                  },
                  severity: {
                    type: Type.STRING,
                    description: 'Must be one of: "Low", "Moderate", "High", "Critical"',
                  },
                  visualEvidence: { type: Type.STRING },
                  immediateSafeSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'problemName',
                  'category',
                  'severity',
                  'visualEvidence',
                  'immediateSafeSteps',
                ],
              },
            },
            generalAgronomicSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            requiresKvkConfirmation: { type: Type.BOOLEAN },
            kvkVerificationQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            imageQualityLimitations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            spokenSummary: { type: Type.STRING },
          },
          required: [
            'identifiedCrop',
            'identificationConfidencePct',
            'estimatedGrowthStage',
            'healthScore',
            'healthStatus',
            'healthSummary',
            'detectedProblems',
            'generalAgronomicSteps',
            'requiresKvkConfirmation',
            'kvkVerificationQuestions',
            'imageQualityLimitations',
            'spokenSummary',
          ],
        },
      },
    },
    25000
  );

  const parsed = extractJsonFromText(response.text ?? '');
  if (!parsed) {
    throw new Error('Unable to parse structured crop diagnosis from Gemini Vision response.');
  }

  let diagnosis = normalizeCropPhotoDiagnosis(parsed, {
    modelUsed: modelState.model,
    language: input.language,
  });

  if (
    input.language !== 'en' &&
    (!hasTargetLanguageScript(diagnosis.healthSummary, input.language) ||
      !hasTargetLanguageScript(diagnosis.spokenSummary, input.language) ||
      !hasTargetLanguageScript(diagnosis.identifiedCrop, input.language))
  ) {
    try {
      const rewriteRes = await callWithStickyModel(
        ai,
        modelState,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Convert ALL human-readable fields and acronyms in this crop photo diagnosis JSON strictly into pure, gentle ${LANGUAGE_NAME[input.language]} with ZERO English words (keep ONLY numbers, helpline digits, and the exact enum values for healthStatus, category, and severity):\n${JSON.stringify(
                    {
                      identifiedCrop: diagnosis.identifiedCrop,
                      estimatedGrowthStage: diagnosis.estimatedGrowthStage,
                      healthSummary: diagnosis.healthSummary,
                      detectedProblems: diagnosis.detectedProblems,
                      generalAgronomicSteps: diagnosis.generalAgronomicSteps,
                      kvkVerificationQuestions: diagnosis.kvkVerificationQuestions,
                      imageQualityLimitations: diagnosis.imageQualityLimitations,
                      spokenSummary: diagnosis.spokenSummary,
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
          },
        },
        20000
      );
      const rewritten = extractJsonFromText(rewriteRes.text ?? '');
      if (rewritten) {
        diagnosis = normalizeCropPhotoDiagnosis(
          {
            ...parsed,
            ...rewritten,
          },
          {
            modelUsed: modelState.model,
            language: input.language,
          }
        );
      }
    } catch {
      // Keep initial normalized diagnosis if optional translation pass fails
    }
  }

  return diagnosis;
}
