import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Cpu,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Trash2,
} from 'lucide-react';
import type {
  CropPhotoDiagnosis,
  CropSymptomReport,
  FarmerProfile,
  GeminiModelPreference,
  GrowthStage,
  Language,
} from '../types/agriguard';
import {
  localizeCropHealthStatus,
  localizeCropName,
  localizeCropSoilMoisture,
  localizeGrowthStage,
  localizeLocationText,
  localizeModelUsed,
  localizePriorityLabel,
  localizeProblemCategory,
  localizeRiskLevel,
} from '../lib/domainTranslations';
import { compressCropImageFile } from '../lib/imageResize';
import { TRANSLATIONS } from '../lib/translations';
import { SpokenOutputButton } from './VoiceControls';

interface CropIntelligenceViewProps {
  farmer: FarmerProfile;
  language: Language;
  isOrchestrating: boolean;
  isAnalyzingPhoto: boolean;
  photoError: string | null;
  photoDiagnosis: CropPhotoDiagnosis | null;
  previewDataUrl: string | null;
  onChangePreviewDataUrl: (url: string | null) => void;
  preferredModel: GeminiModelPreference;
  onChangePreferredModel: (model: GeminiModelPreference) => void;
  onAnalyzeCropPhoto: (payload: {
    imageDataUrl: string;
    farmerNotes: string;
    preferredModel: GeminiModelPreference;
  }) => Promise<CropPhotoDiagnosis | null>;
  onClearPhotoDiagnosis: () => void;
  onAnalyzeCrop: (
    report: CropSymptomReport,
    customPrompt: string,
    attachedDiagnosis?: CropPhotoDiagnosis
  ) => Promise<void>;
}

const GROWTH_STAGES: GrowthStage[] = [
  'Nursery / Sowing',
  'Vegetative',
  'Tillering / Branching',
  'Flowering / Panicle Initiation',
  'Grain Filling / Pod Development',
  'Maturity / Pre-Harvest',
];

const SOIL_MOISTURE_OPTIONS: CropSymptomReport['soilMoisture'][] = [
  'Dry',
  'Moist',
  'Saturated',
  'Submerged',
  'Unknown',
];

export function CropIntelligenceView({
  farmer,
  language,
  isOrchestrating,
  isAnalyzingPhoto,
  photoError,
  photoDiagnosis,
  previewDataUrl,
  onChangePreviewDataUrl,
  preferredModel,
  onChangePreferredModel,
  onAnalyzeCropPhoto,
  onClearPhotoDiagnosis,
  onAnalyzeCrop,
}: CropIntelligenceViewProps) {
  const dict = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const lastAutoSyncRef = useRef<string | null>(null);

  const [photoNotes, setPhotoNotes] = useState('');
  const [localPhotoError, setLocalPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [cropType, setCropType] = useState(() =>
    localizeCropName(farmer.crops[0] || '', language)
  );
  const [location, setLocation] = useState(() =>
    localizeLocationText(`${farmer.location}, ${farmer.district}`, language)
  );
  const [growthStage, setGrowthStage] = useState<GrowthStage>(farmer.growthStage);
  const [soilMoisture, setSoilMoisture] = useState<CropSymptomReport['soilMoisture']>('Moist');
  const [standingWaterDays, setStandingWaterDays] = useState(0);
  const [observedSymptoms, setObservedSymptoms] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCropType((prev) => localizeCropName(prev, language));
    setLocation((prev) => localizeLocationText(prev, language));
  }, [language]);

  useEffect(() => {
    if (!photoDiagnosis || !previewDataUrl || isAnalyzingPhoto) return;
    if (photoDiagnosis.language === language) {
      lastAutoSyncRef.current = null;
      return;
    }
    const syncKey = `${language}:${previewDataUrl.slice(0, 64)}:${photoDiagnosis.analyzedAt}`;
    if (lastAutoSyncRef.current === syncKey) return;
    lastAutoSyncRef.current = syncKey;

    void onAnalyzeCropPhoto({
      imageDataUrl: previewDataUrl,
      farmerNotes: photoNotes,
      preferredModel,
    }).then((result) => {
      if (!result) return;
      if (result.identifiedCrop && result.healthStatus !== 'Unclear Image') {
        setCropType(result.identifiedCrop);
      }
      if (result.detectedProblems.length > 0) {
        setObservedSymptoms(
          result.detectedProblems
            .map((p) => `${p.problemName}: ${p.visualEvidence}`)
            .join('; ')
        );
      } else if (result.healthSummary) {
        setObservedSymptoms(result.healthSummary);
      }
    });
  }, [
    language,
    photoDiagnosis,
    previewDataUrl,
    isAnalyzingPhoto,
    photoNotes,
    preferredModel,
    onAnalyzeCropPhoto,
  ]);

  const handleSelectedFile = async (file: File | undefined) => {
    if (!file) return;
    setLocalPhotoError(null);
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
      setLocalPhotoError(
        language === 'hi'
          ? 'केवल जेपीजी, पीएनजी या वेबपी फसल फोटो समर्थित हैं।'
          : language === 'te'
          ? 'కేవలం జేపీజీ, పీఎన్‌జీ లేదా వెబ్‌పీ పంట ఫోటోలు మాత్రమే అనుమతించబడతాయి.'
          : 'Only JPG, PNG, or WebP crop photos are supported.'
      );
      return;
    }
    try {
      const compressed = await compressCropImageFile(file);
      onChangePreviewDataUrl(compressed);
    } catch {
      setLocalPhotoError(
        language === 'hi'
          ? 'फोटो पढ़ने में असमर्थ। कृपया दूसरी छवि चुनें।'
          : language === 'te'
          ? 'ఫోటో చదవడం సాధ్యం కాలేదు. దయచేసి మరొక చిత్రాన్ని ఎంచుకోండి.'
          : 'Unable to read image file. Please try another photo.'
      );
    }
  };

  const handleRunPhotoDiagnosis = async () => {
    if (!previewDataUrl) {
      setLocalPhotoError(
        language === 'hi'
          ? 'कृपया विश्लेषण से पहले फसल की फोटो चुनें।'
          : language === 'te'
          ? 'దయచేసి విశ్లేషణకు ముందు పంట ఫోటోను ఎంచుకోండి.'
          : 'Please choose or capture a crop photo first.'
      );
      return;
    }
    setLocalPhotoError(null);
    const result = await onAnalyzeCropPhoto({
      imageDataUrl: previewDataUrl,
      farmerNotes: photoNotes,
      preferredModel,
    });
    if (result) {
      if (result.identifiedCrop && result.healthStatus !== 'Unclear Image') {
        setCropType(result.identifiedCrop);
      }
      if (result.detectedProblems.length > 0) {
        const summarySymptoms = result.detectedProblems
          .map((p) => `${p.problemName}: ${p.visualEvidence}`)
          .join('; ');
        setObservedSymptoms(summarySymptoms);
      } else if (result.healthSummary) {
        setObservedSymptoms(result.healthSummary);
      }
    }
  };

  const handleSendDiagnosisToAiStaff = async () => {
    if (!photoDiagnosis) return;
    const activeCrop =
      photoDiagnosis.identifiedCrop ||
      cropType.trim() ||
      localizeCropName(farmer.crops[0] || '', language) ||
      (language === 'hi' ? 'फसल' : language === 'te' ? 'పంట' : 'Crop');
    const symptomsText =
      photoDiagnosis.detectedProblems.length > 0
        ? photoDiagnosis.detectedProblems
            .map((p) => `${p.problemName} (${p.visualEvidence})`)
            .join('; ')
        : photoDiagnosis.healthSummary;

    const report: CropSymptomReport = {
      cropType: activeCrop,
      location:
        location.trim() ||
        localizeLocationText(`${farmer.location}, ${farmer.district}`, language),
      growthStage,
      observedSymptoms: symptomsText,
      standingWaterDays,
      soilMoisture,
    };

    const healthLabel = localizeCropHealthStatus(photoDiagnosis.healthStatus, language);
    const prompt =
      language === 'hi'
        ? `फसल फोटो विज़न रिपोर्ट (${photoDiagnosis.identifiedCrop}, स्वास्थ्य: ${photoDiagnosis.healthScore}/100 - ${healthLabel}) को मौसम और किसान रक्षक जोखिम के साथ मिलाकर पूर्ण खेत सुरक्षा व उपचार योजना बनाएं। पहचानी गई समस्याएं: ${symptomsText}`
        : language === 'te'
        ? `పంట ఫోటో విజన్ నివేదికను (${photoDiagnosis.identifiedCrop}, ఆరోగ్యం: ${photoDiagnosis.healthScore}/100 - ${healthLabel}) వాతావరణం మరియు కిసాన్ రక్షక్ ప్రమాదంతో కలిపి పూర్తి పొలం రక్షణ & పరిష్కార ప్రణాళిక ఇవ్వండి. సమస్యలు: ${symptomsText}`
        : `Combine this Gemini Vision crop photo diagnosis (${photoDiagnosis.identifiedCrop}, Health: ${photoDiagnosis.healthScore}/100 - ${healthLabel}) with weather and Kisan Rakshak risk to build a full farm action plan. Visual findings: ${symptomsText}`;

    await onAnalyzeCrop(report, prompt, photoDiagnosis);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropType.trim() || !location.trim()) {
      setError(dict.cropView.errRequired);
      return;
    }
    if (standingWaterDays < 0 || standingWaterDays > 60) {
      setError(dict.cropView.errWaterDays);
      return;
    }
    setError(null);

    const defaultNoSymptom =
      language === 'hi'
        ? 'कोई दृश्य रोग लक्षण नहीं बताए गए'
        : language === 'te'
        ? 'ప్రత్యక్ష వ్యాధి లక్షణాలు నమోదు కాలేదు'
        : 'No visible disease symptoms reported';

    const report: CropSymptomReport = {
      cropType: cropType.trim(),
      location: location.trim(),
      growthStage,
      observedSymptoms: observedSymptoms.trim() || defaultNoSymptom,
      standingWaterDays,
      soilMoisture,
    };

    const localizedStage = localizeGrowthStage(report.growthStage, language);
    const localizedMoisture = localizeCropSoilMoisture(report.soilMoisture, language);

    const prompt =
      language === 'hi'
        ? `${report.location} में ${localizedStage} अवस्था वाली ${report.cropType} फसल का निरीक्षण करें। मिट्टी की नमी: ${localizedMoisture}, खड़ा पानी: ${report.standingWaterDays} दिन। देखे गए लक्षण: "${report.observedSymptoms}"। फसल जोखिम, अधूरी जानकारी और सतर्क साक्ष्य-आधारित कदम बताएं।`
        : language === 'te'
        ? `${report.location} లోని ${localizedStage} దశలో ఉన్న ${report.cropType} పంట పరిస్థితిని పరిశీలించండి. నేల తేమ: ${localizedMoisture}, పొలంలో నిలిచిన నీరు: ${report.standingWaterDays} రోజులు. కనిపించిన లక్షణాలు: "${report.observedSymptoms}". పంట ప్రమాదాలు, లేని వివరాలు మరియు జాగ్రత్తతో కూడిన సూచనలు ఇవ్వండి.`
        : `Crop Intelligence inspection for ${report.cropType} at ${report.growthStage} stage in ${report.location}. Soil moisture: ${report.soilMoisture}, standing water days: ${report.standingWaterDays}. Reported symptoms: "${report.observedSymptoms}". Identify crop risks, missing details, and cautious evidence-based steps.`;

    await onAnalyzeCrop(report, prompt, photoDiagnosis ?? undefined);
  };

  const healthBadgeClass = (status: CropPhotoDiagnosis['healthStatus']) => {
    switch (status) {
      case 'Healthy':
        return 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]';
      case 'Mild Stress':
        return 'border-[#FDE68A] bg-[#FEFCE8] text-[#854D0E]';
      case 'Moderate Issue':
        return 'border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]';
      case 'Severe / Critical':
        return 'border-[#F5C2C7] bg-[#FEF2F2] text-[#991B1B]';
      default:
        return 'border-[#9EC4A8] bg-[#D8E7DA] text-[#355240]';
    }
  };

  const healthBarColor = (score: number) => {
    if (score >= 80) return 'bg-[#15803D]';
    if (score >= 60) return 'bg-[#CA8A04]';
    if (score >= 35) return 'bg-[#C2410C]';
    return 'bg-[#B91C1C]';
  };

  return (
    <div className="space-y-6">
      {/* Gemini Flash / Flash-Lite Multimodal Crop Photo Scanner */}
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#C5D9C8] pb-4 lg:flex-nowrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-[#355240]">
              <Sparkles className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
              <span>
                {dict.cropView.agentBadge} ·{' '}
                {language === 'hi'
                  ? 'जेमिनी विज़न'
                  : language === 'te'
                  ? 'జెమినీ విజన్'
                  : 'Gemini Vision'}
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#14291D]">
              {dict.cropView.photoHeading}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[#355240]">
              {dict.cropView.photoSubheading}
            </p>
          </div>

          <div className="w-full shrink-0 sm:w-auto sm:min-w-[270px]">
            <label
              htmlFor="gemini-model-select"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#14291D]"
            >
              <Cpu className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
              <span>{dict.cropView.modelSelectorLabel}</span>
            </label>
            <select
              id="gemini-model-select"
              value={preferredModel}
              onChange={(e) => onChangePreferredModel(e.target.value as GeminiModelPreference)}
              className="mt-1 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-xs font-medium text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
            >
              <option value="auto">{dict.cropView.modelAuto}</option>
              <option value="gemini-4-hydrogen">{dict.cropView.modelFlash}</option>
              <option value="gemini-3.1-flash-lite">{dict.cropView.modelFlashLite}</option>
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Upload & Preview Column */}
          <div className="space-y-4 lg:col-span-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              data-testid="crop-photo-file-input"
              onChange={(e) => {
                void handleSelectedFile(e.target.files?.[0]);
                e.target.value = '';
              }}
              className="sr-only"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={(e) => {
                void handleSelectedFile(e.target.files?.[0]);
                e.target.value = '';
              }}
              className="sr-only"
            />

            {!previewDataUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  void handleSelectedFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex min-h-[220px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-[#143D2B] bg-[#CFE1D2]/70'
                    : 'border-[#9EC4A8] bg-[#D8E7DA]'
                }`}
              >
                <ImagePlus className="h-9 w-9 text-[#143D2B]" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-[#14291D]">
                  {dict.cropView.uploadDropLabel}
                </p>
                <p className="mt-1 text-xs text-[#355240]">{dict.cropView.uploadHint}</p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-[#143D2B] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#0F2D20] whitespace-nowrap"
                  >
                    <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{dict.cropView.choosePhotoBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-3.5 py-2 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap"
                  >
                    <Camera className="h-3.5 w-3.5 text-[#143D2B]" aria-hidden="true" />
                    <span>{dict.cropView.capturePhotoBtn}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-[#9EC4A8] bg-[#D8E7DA]">
                <img
                  src={previewDataUrl}
                  alt={dict.cropView.cropPhotoPreviewAlt}
                  className="max-h-[260px] w-full object-cover"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#9EC4A8] bg-[#DCEADD] px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md border border-[#9EC4A8] bg-[#E9F2EA] px-2.5 py-1.5 text-xs font-medium text-[#14291D] hover:bg-[#CFE1D2]"
                    >
                      {dict.cropView.changePhotoBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChangePreviewDataUrl(null);
                        onClearPhotoDiagnosis();
                        setLocalPhotoError(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-[#F5C2C7] bg-[#FEF2F2] px-2.5 py-1.5 text-xs font-medium text-[#991B1B] hover:bg-[#FEE2E2]"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                      <span>{dict.cropView.removePhotoBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="photo-notes-input" className="block text-xs font-semibold text-[#14291D]">
                {dict.cropView.notesLabel}
              </label>
              <input
                id="photo-notes-input"
                type="text"
                value={photoNotes}
                onChange={(e) => setPhotoNotes(e.target.value)}
                placeholder={dict.cropView.notesPlaceholder}
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              />
            </div>

            {(localPhotoError || photoError) && (
              <div
                data-testid="crop-photo-error"
                className="rounded-md border border-[#F5C2C7] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]"
              >
                {localPhotoError || photoError}
              </div>
            )}

            <button
              type="button"
              disabled={isAnalyzingPhoto}
              onClick={() => void handleRunPhotoDiagnosis()}
              data-testid="analyze-crop-photo-btn"
              className="inline-flex w-full min-h-[42px] items-center justify-center gap-2 rounded-md bg-[#143D2B] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0F2D20] disabled:opacity-60"
            >
              {isAnalyzingPhoto ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              <span>
                {isAnalyzingPhoto
                  ? dict.cropView.analyzingPhotoBtn
                  : dict.cropView.analyzePhotoBtn}
              </span>
            </button>
          </div>

          {/* Gemini Vision Diagnosis Report Column */}
          <div className="lg:col-span-7">
            {isAnalyzingPhoto ? (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-lg border border-[#B5CEBA] bg-[#D8E7DA] p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#143D2B]" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-[#143D2B]">
                  {dict.cropView.analyzingPhotoBtn}
                </p>
              </div>
            ) : !photoDiagnosis ? (
              <div className="flex h-full min-h-[240px] flex-col justify-center rounded-lg border border-[#B5CEBA] bg-[#D8E7DA] p-6">
                <h3 className="font-display text-base font-semibold text-[#14291D]">
                  {dict.cropView.diagnosisReportTitle}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#355240]">
                  {dict.cropView.photoSubheading}
                </p>
                <ul className="mt-4 space-y-2 text-xs text-[#243F2F]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#143D2B] shrink-0" aria-hidden="true" />
                    <span>{dict.cropView.identifiedCropLabel} &amp; {dict.cropView.estStageLabel}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#143D2B] shrink-0" aria-hidden="true" />
                    <span>{dict.cropView.healthScoreLabel} (0–100)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#143D2B] shrink-0" aria-hidden="true" />
                    <span>{dict.cropView.problemsHeading} &amp; {dict.cropView.safeStepsLabel}</span>
                  </li>
                </ul>
              </div>
            ) : (
              <div
                data-testid="crop-photo-diagnosis-card"
                className="space-y-5 rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#C5D9C8] pb-4">
                  <div>
                    <div className="text-xs text-[#355240]">
                      {dict.cropView.modelUsedPrefix}{' '}
                      <span className="font-mono font-medium text-[#143D2B]">
                        {localizeModelUsed(photoDiagnosis.modelUsed, language)}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-[#14291D]">
                      {photoDiagnosis.identifiedCrop}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#355240]">
                      <span>
                        {dict.cropView.confidenceLabel}:{' '}
                        <strong className="font-mono text-[#14291D]">
                          {photoDiagnosis.identificationConfidencePct}%
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {dict.cropView.estStageLabel}:{' '}
                        <strong className="text-[#14291D]">
                          {photoDiagnosis.estimatedGrowthStage}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SpokenOutputButton
                      text={photoDiagnosis.spokenSummary || photoDiagnosis.healthSummary}
                      language={photoDiagnosis.language}
                      listenLabel={dict.common.listenSummary}
                      stopLabel={dict.common.stopVoice}
                    />
                    <span
                      className={`rounded-md border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${healthBadgeClass(
                        photoDiagnosis.healthStatus
                      )}`}
                    >
                      {localizeCropHealthStatus(photoDiagnosis.healthStatus, language)}
                    </span>
                  </div>
                </div>

                {/* Health Score Meter */}
                <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#14291D]">
                      {dict.cropView.healthScoreLabel}
                    </span>
                    <span className="font-mono text-sm font-bold text-[#14291D]">
                      {photoDiagnosis.healthScore}/100
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#CBE0CE]">
                    <div
                      className={`h-full transition-all ${healthBarColor(photoDiagnosis.healthScore)}`}
                      style={{ width: `${photoDiagnosis.healthScore}%` }}
                    />
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#243F2F]">
                    <strong className="font-semibold text-[#14291D]">
                      {dict.cropView.healthSummaryLabel}:
                    </strong>{' '}
                    {photoDiagnosis.healthSummary}
                  </p>
                </div>

                {/* Detected Problems */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[#355240]">
                    {dict.cropView.problemsHeading} ({photoDiagnosis.detectedProblems.length})
                  </h4>
                  {photoDiagnosis.detectedProblems.length === 0 ? (
                    <p className="mt-2 rounded-md border border-[#7CC792] bg-[#D8F0DD] p-3 text-xs text-[#143D2B]">
                      {dict.cropView.noProblemsFound}
                    </p>
                  ) : (
                    <ul className="mt-2.5 space-y-3">
                      {photoDiagnosis.detectedProblems.map((problem, idx) => (
                        <li
                          key={idx}
                          className="rounded-md border border-[#B5CEBA] bg-[#DFECE0] p-3.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-display text-sm font-semibold text-[#14291D]">
                              {problem.problemName}
                            </span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="rounded-xs bg-[#D8E7DA] px-2 py-0.5 font-medium text-[#243F2F]">
                                {localizeProblemCategory(problem.category, language)}
                              </span>
                              <span
                                className={`font-mono font-semibold ${
                                  problem.severity === 'Critical' || problem.severity === 'High'
                                    ? 'text-[#B91C1C]'
                                    : problem.severity === 'Moderate'
                                    ? 'text-[#B45309]'
                                    : 'text-[#15803D]'
                                }`}
                              >
                                {localizeRiskLevel(problem.severity, language)}
                              </span>
                            </div>
                          </div>
                          {problem.visualEvidence && (
                            <p className="mt-1.5 text-xs text-[#355240]">
                              <strong className="font-semibold text-[#243F2F]">
                                {dict.cropView.visualEvidencePrefix}
                              </strong>{' '}
                              {problem.visualEvidence}
                            </p>
                          )}
                          {problem.immediateSafeSteps.length > 0 && (
                            <div className="mt-2">
                              <div className="text-[11px] font-semibold text-[#143D2B]">
                                {dict.cropView.safeStepsLabel}
                              </div>
                              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-[#14291D]">
                                {problem.immediateSafeSteps.map((step, sIdx) => (
                                  <li key={sIdx}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* General Steps + KVK Verification */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {photoDiagnosis.generalAgronomicSteps.length > 0 && (
                    <div className="rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3.5">
                      <div className="text-xs font-semibold text-[#143D2B]">
                        {dict.cropView.generalStepsTitle}
                      </div>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#14291D]">
                        {photoDiagnosis.generalAgronomicSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {photoDiagnosis.kvkVerificationQuestions.length > 0 && (
                    <div className="rounded-md border border-[#D3C49E] bg-[#EFEAD6] p-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C4315]">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{dict.cropView.kvkQuestionsTitle}</span>
                      </div>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#5C4315]">
                        {photoDiagnosis.kvkVerificationQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {photoDiagnosis.imageQualityLimitations.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-3 text-xs text-[#355240]">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-[#B45309] shrink-0" aria-hidden="true" />
                    <div>
                      <span className="font-semibold text-[#14291D]">
                        {dict.cropView.limitationsTitle}:
                      </span>{' '}
                      {photoDiagnosis.imageQualityLimitations.join(' · ')}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="button"
                    data-testid="send-photo-diagnosis-to-ai-staff"
                    disabled={isOrchestrating}
                    onClick={() => void handleSendDiagnosisToAiStaff()}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#143D2B] bg-[#DCEADD] px-4 py-2 text-xs font-semibold text-[#143D2B] hover:bg-[#CFE1D2] disabled:opacity-60"
                  >
                    {isOrchestrating && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                    <span>
                      {isOrchestrating
                        ? dict.cropView.sendingToAiStaffBtn
                        : dict.cropView.sendToAiStaffBtn}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Manual Crop Condition Form & Vulnerability Guide */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 lg:col-span-7">
          <div className="border-b border-[#C5D9C8] pb-4">
            <div className="flex items-center gap-2 text-xs text-[#355240]">
              <Sprout className="h-4 w-4 text-[#143D2B]" aria-hidden="true" />
              <span>{dict.cropView.agentBadge}</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#14291D]">
              {dict.cropView.heading}
            </h2>
            <p className="mt-1 text-sm text-[#355240]">{dict.cropView.subheading}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ci-crop" className="block text-xs font-semibold text-[#14291D]">
                  {dict.cropView.cropTypeLabel}
                </label>
                <input
                  id="ci-crop"
                  type="text"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder={dict.cropView.cropTypePlaceholder}
                  className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="ci-location" className="block text-xs font-semibold text-[#14291D]">
                  {dict.cropView.locationLabel}
                </label>
                <input
                  id="ci-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="ci-stage" className="block text-xs font-semibold text-[#14291D]">
                  {dict.cropView.growthStageLabel}
                </label>
                <select
                  id="ci-stage"
                  value={growthStage}
                  onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
                  className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
                >
                  {GROWTH_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {localizeGrowthStage(s, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ci-moisture" className="block text-xs font-semibold text-[#14291D]">
                  {dict.cropView.soilMoistureLabel}
                </label>
                <select
                  id="ci-moisture"
                  value={soilMoisture}
                  onChange={(e) =>
                    setSoilMoisture(e.target.value as CropSymptomReport['soilMoisture'])
                  }
                  className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
                >
                  {SOIL_MOISTURE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {localizeCropSoilMoisture(m, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ci-water-days" className="block text-xs font-semibold text-[#14291D]">
                  {dict.cropView.waterDaysLabel}
                </label>
                <input
                  id="ci-water-days"
                  type="number"
                  min={0}
                  max={60}
                  value={standingWaterDays}
                  onChange={(e) => setStandingWaterDays(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3 py-2 font-mono text-sm text-[#14291D] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ci-symptoms" className="block text-xs font-semibold text-[#14291D]">
                {dict.cropView.symptomsLabel}
              </label>
              <textarea
                id="ci-symptoms"
                rows={3}
                value={observedSymptoms}
                onChange={(e) => setObservedSymptoms(e.target.value)}
                placeholder={dict.cropView.symptomsPlaceholder}
                className="mt-1.5 w-full rounded-md border border-[#9EC4A8] bg-[#D8E7DA] px-3.5 py-2.5 text-sm text-[#14291D] placeholder:text-[#486854] focus:border-[#143D2B] focus:bg-[#F1F8F2] focus:outline-none"
              />
            </div>

            {error && <p className="text-xs font-medium text-[#B91C1C]">{error}</p>}

            <button
              type="submit"
              disabled={isOrchestrating}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#143D2B] px-5 py-2 text-sm font-medium text-white hover:bg-[#0F2D20] disabled:opacity-60 whitespace-nowrap"
            >
              {isOrchestrating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              <span>{isOrchestrating ? dict.cropView.runningBtn : dict.cropView.submitBtn}</span>
            </button>
          </form>
        </section>

        <aside className="space-y-4 lg:col-span-5">
          <div className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
            <h3 className="font-display text-base font-semibold text-[#14291D]">
              {dict.cropView.guideTitle}
            </h3>
            <dl className="mt-4 divide-y divide-[#C5D9C8] text-xs leading-relaxed">
              <div className="py-2.5 first:pt-0">
                <dt className="font-semibold text-[#143D2B]">{dict.cropView.guideNurseryTitle}</dt>
                <dd className="mt-0.5 text-[#355240]">{dict.cropView.guideNurseryDesc}</dd>
              </div>
              <div className="py-2.5">
                <dt className="font-semibold text-[#143D2B]">{dict.cropView.guideFloweringTitle}</dt>
                <dd className="mt-0.5 text-[#355240]">{dict.cropView.guideFloweringDesc}</dd>
              </div>
              <div className="py-2.5">
                <dt className="font-semibold text-[#143D2B]">{dict.cropView.guideMaturityTitle}</dt>
                <dd className="mt-0.5 text-[#355240]">{dict.cropView.guideMaturityDesc}</dd>
              </div>
              <div className="py-2.5 last:pb-0">
                <dt className="font-semibold text-[#143D2B]">{dict.cropView.guideChemicalTitle}</dt>
                <dd className="mt-0.5 text-[#355240]">{dict.cropView.guideChemicalDesc}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
