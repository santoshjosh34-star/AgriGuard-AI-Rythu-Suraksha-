import type {
  CropDetectedProblem,
  CropHealthStatus,
  CropPhotoDiagnosis,
  CropProblemCategory,
  Language,
  RiskLevel,
} from '../types/agriguard.ts';

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_BASE64_CHARS = 8 * 1024 * 1024; // ~6 MB decoded

export interface ParsedImagePayload {
  mimeType: (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
  base64Data: string;
}

export function parseImageDataUrl(
  input: string,
  language: Language = 'en'
): { ok: true; value: ParsedImagePayload } | { ok: false; error: string } {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return {
      ok: false,
      error:
        language === 'hi'
          ? 'कृपया विश्लेषण के लिए फसल की एक फोटो अपलोड करें।'
          : language === 'te'
          ? 'దయచేసి విశ్లేషణ కోసం పంట ఫోటోను అప్‌లోడ్ చేయండి.'
          : 'Please upload or capture a crop photo for analysis.',
    };
  }

  const match = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return {
      ok: false,
      error:
        language === 'hi'
          ? 'अमान्य छवि प्रारूप। कृपया जेपीजी, पीएनजी या वेबपी फोटो चुनें।'
          : language === 'te'
          ? 'చెల్లని చిత్రం ఫార్మాట్. దయచేసి జేపీజీ, పీఎన్‌జీ లేదా వెబ్‌పీ ఫోటోను ఎంచుకోండి.'
          : 'Invalid image format. Please choose a valid JPG, PNG, or WebP photo.',
    };
  }

  const rawMime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(rawMime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return {
      ok: false,
      error:
        language === 'hi'
          ? 'केवल जेपीजी, पीएनजी या वेबपी फसल फोटो समर्थित हैं।'
          : language === 'te'
          ? 'కేవలం జేపీజీ, పీఎన్‌జీ లేదా వెబ్‌పీ పంట ఫోటోలు మాత్రమే అనుమతించబడతాయి.'
          : 'Only JPG, PNG, or WebP crop photos are supported.',
    };
  }

  const base64Data = match[2];
  if (base64Data.length < 32) {
    return {
      ok: false,
      error:
        language === 'hi'
          ? 'चयनित छवि फ़ाइल खाली या क्षतिग्रस्त प्रतीत होती है।'
          : language === 'te'
          ? 'ఎంచుకున్న చిత్రం ఫైల్ ఖాళీగా లేదా పాడైనట్లు ఉంది.'
          : 'The selected image file appears empty or corrupted.',
    };
  }

  if (base64Data.length > MAX_IMAGE_BASE64_CHARS) {
    return {
      ok: false,
      error:
        language === 'hi'
          ? 'फोटो बहुत बड़ी है (अधिकतम 6 एमबी)। कृपया छोटी या कम रिज़ॉल्यूशन फोटो चुनें।'
          : language === 'te'
          ? 'ఫోటో పరిమాణం చాలా పెద్దది (గరిష్టంగా 6 ఎంబీ). దయచేసి చిన్న ఫోటోను ఎంచుకోండి.'
          : 'Photo is too large (max 6 MB). Please upload a smaller image.',
    };
  }

  return {
    ok: true,
    value: {
      mimeType: rawMime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
      base64Data,
    },
  };
}

const VALID_HEALTH_STATUSES: CropHealthStatus[] = [
  'Healthy',
  'Mild Stress',
  'Moderate Issue',
  'Severe / Critical',
  'Unclear Image',
];

const VALID_CATEGORIES: CropProblemCategory[] = [
  'Disease',
  'Pest',
  'Nutrient Deficiency',
  'Water / Weather Stress',
  'Weed / Physical Damage',
  'Unclear',
];

const VALID_SEVERITIES: RiskLevel[] = ['Low', 'Moderate', 'High', 'Critical'];

export function deriveHealthStatusFromScore(score: number): CropHealthStatus {
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'Mild Stress';
  if (score >= 35) return 'Moderate Issue';
  return 'Severe / Critical';
}

export function normalizeCropPhotoDiagnosis(
  raw: Record<string, unknown>,
  meta: {
    modelUsed: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
    language: Language;
    analyzedAt?: string;
  }
): CropPhotoDiagnosis {
  const confidenceRaw = Number(raw.identificationConfidencePct);
  const identificationConfidencePct = Number.isFinite(confidenceRaw)
    ? Math.max(0, Math.min(100, Math.round(confidenceRaw)))
    : 50;

  const scoreRaw = Number(raw.healthScore);
  const healthScore = Number.isFinite(scoreRaw)
    ? Math.max(0, Math.min(100, Math.round(scoreRaw)))
    : 50;

  const rawStatus = String(raw.healthStatus || '');
  const healthStatus: CropHealthStatus = VALID_HEALTH_STATUSES.includes(
    rawStatus as CropHealthStatus
  )
    ? (rawStatus as CropHealthStatus)
    : deriveHealthStatusFromScore(healthScore);

  const defaultProblemName =
    meta.language === 'hi'
      ? 'देखा गया तनाव'
      : meta.language === 'te'
      ? 'గమనించిన ఒత్తిడి'
      : 'Observed stress';
  const defaultIdentifiedCrop =
    meta.language === 'hi'
      ? 'अज्ञात पौधा / अस्पष्ट फोटो'
      : meta.language === 'te'
      ? 'గుర్తించని మొక్క / అస్పష్టమైన ఫోటో'
      : 'Unidentified plant / unclear photo';
  const defaultStage =
    meta.language === 'hi' ? 'अज्ञात' : meta.language === 'te' ? 'తెలియదు' : 'Unknown';

  const rawProblems = Array.isArray(raw.detectedProblems) ? raw.detectedProblems : [];
  const detectedProblems: CropDetectedProblem[] = rawProblems
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((p) => {
      const catStr = String(p.category || 'Unclear');
      const sevStr = String(p.severity || 'Moderate');
      return {
        problemName: String(p.problemName || defaultProblemName),
        category: VALID_CATEGORIES.includes(catStr as CropProblemCategory)
          ? (catStr as CropProblemCategory)
          : 'Unclear',
        severity: VALID_SEVERITIES.includes(sevStr as RiskLevel)
          ? (sevStr as RiskLevel)
          : 'Moderate',
        visualEvidence: String(p.visualEvidence || ''),
        immediateSafeSteps: Array.isArray(p.immediateSafeSteps)
          ? p.immediateSafeSteps.map(String).filter(Boolean)
          : [],
      };
    });

  return {
    id: `photo-diag-${Date.now()}`,
    identifiedCrop: String(raw.identifiedCrop || defaultIdentifiedCrop),
    identificationConfidencePct,
    estimatedGrowthStage: String(raw.estimatedGrowthStage || defaultStage),
    healthScore,
    healthStatus,
    healthSummary: String(raw.healthSummary || ''),
    detectedProblems,
    generalAgronomicSteps: Array.isArray(raw.generalAgronomicSteps)
      ? raw.generalAgronomicSteps.map(String).filter(Boolean)
      : [],
    requiresKvkConfirmation: Boolean(raw.requiresKvkConfirmation ?? detectedProblems.length > 0),
    kvkVerificationQuestions: Array.isArray(raw.kvkVerificationQuestions)
      ? raw.kvkVerificationQuestions.map(String).filter(Boolean)
      : [],
    imageQualityLimitations: Array.isArray(raw.imageQualityLimitations)
      ? raw.imageQualityLimitations.map(String).filter(Boolean)
      : [],
    spokenSummary: String(raw.spokenSummary || raw.healthSummary || ''),
    modelUsed: meta.modelUsed,
    language: meta.language,
    analyzedAt: meta.analyzedAt || new Date().toISOString(),
  };
}
