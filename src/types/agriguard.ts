export type Language = 'en' | 'hi' | 'te';

export type NavSection =
  | 'overview'
  | 'my-farm'
  | 'ai-staff'
  | 'kisan-rakshak'
  | 'weather'
  | 'crop'
  | 'recommendations'
  | 'alerts'
  | 'settings';

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type AgentId =
  | 'master'
  | 'weather'
  | 'crop'
  | 'kisan_rakshak'
  | 'farm_advisory'
  | 'voice_language'
  | 'action_alert';

export type ScenarioId =
  | 'live'
  | 'heavy-rainfall-paddy'
  | 'cyclone-coastal'
  | 'waterlogging-flood'
  | 'custom';

export type SoilType =
  | 'Alluvial'
  | 'Black Cotton (Vertisol)'
  | 'Red Loamy'
  | 'Coastal Sandy'
  | 'Clayey'
  | 'Unknown';

export type GrowthStage =
  | 'Nursery / Sowing'
  | 'Vegetative'
  | 'Tillering / Branching'
  | 'Flowering / Panicle Initiation'
  | 'Grain Filling / Pod Development'
  | 'Maturity / Pre-Harvest';

export interface GpsCoordinates {
  lat: number;
  lon: number;
  accuracyM?: number;
  updatedAt: string;
  resolvedLabel?: string;
}

export interface FarmerProfile {
  name: string;
  state: string;
  district: string;
  location: string;
  crops: string[];
  farmSizeAcres: number;
  soilType: SoilType;
  growthStage: GrowthStage;
  preferredLanguage: Language;
  drainageType: 'Natural Slope' | 'Low-Lying / Basin' | 'Raised Bunds' | 'Unknown';
  nearCoastOrRiver: boolean;
  profilePhotoDataUrl?: string | null;
  gpsCoordinates?: GpsCoordinates | null;
  liveLocationEnabled?: boolean;
}

export interface WeatherForecastPoint {
  label: string;
  rainfallMm: number;
  windKmh: number;
  tempC: number;
  humidityPct: number;
  kind: 'Confirmed Observation' | 'Model Forecast';
}

export type PlainClassification =
  | 'Low-Lying Coastal / Delta Plain'
  | 'Alluvial / River Basin Plain'
  | 'Inland Agricultural Plain'
  | 'Sloping Plain / Foothill Valley'
  | 'Upland / Plateau Plain'
  | 'Unknown';

export type DrainageSlopeProfile =
  | 'Flat Basin / Slow Runoff'
  | 'Gentle Plain Slope'
  | 'Natural Drainage Slope'
  | 'Unknown';

export type RiverBasinStatus =
  | 'Normal Flow'
  | 'Elevated Runoff'
  | 'High Flood Discharge'
  | 'Unavailable';

export interface PlainsTelemetry {
  elevationM: number | null;
  surroundingMinElevationM: number | null;
  surroundingMaxElevationM: number | null;
  relief5kmM: number | null;
  plainType: PlainClassification;
  drainageSlopeProfile: DrainageSlopeProfile;
  topsoilMoisturePct: number | null;
  rootZoneMoisturePct: number | null;
  soilTempC: number | null;
  evapotranspirationMmDay: number | null;
  surfacePressureHpa: number | null;
  rainProbability24hPct: number | null;
  riverDischargeM3s: number | null;
  riverDischargeMax4dM3s: number | null;
  riverBasinStatus: RiverBasinStatus;
}

export interface WeatherContext {
  scenarioId: ScenarioId;
  scenarioTitle: string;
  isSyntheticDemo: boolean;
  dataSource: string;
  lastUpdated: string;
  observationNote: string;
  forecastUncertainty: string;
  rainfall24hMm: number | null;
  rainfall72hMm: number | null;
  windSpeedKmh: number | null;
  windGustKmh: number | null;
  temperatureC: number | null;
  humidityPct: number | null;
  soilMoisturePct?: number | null;
  weatherConditionLabel?: string | null;
  coordinates?: {
    lat: number;
    lon: number;
    resolvedName: string;
    elevationM?: number;
  };
  plains?: PlainsTelemetry;
  sprayingWindow?: {
    status: 'Safe' | 'Caution' | 'Avoid';
    reason: string;
  };
  irrigationGuidance?: {
    status: 'Irrigate' | 'Hold Irrigation' | 'Drainage Priority';
    reason: string;
  };
  verifiedWarningLabel: string | null;
  verifiedWarningSource: string | null;
  localFloodStatus: 'None Reported' | 'Watch / Rising Water' | 'Active Waterlogging' | 'Unknown';
  timeline: WeatherForecastPoint[];
}

export interface RiskFactorItem {
  factor: string;
  impactScore: number;
  maxScore: number;
  detail: string;
  severity: RiskLevel;
}

export interface ActionPhasePlan {
  phase: 'Before Event' | 'During Event' | 'After Event';
  priority: 'Immediate' | 'High' | 'Standard';
  steps: string[];
}

export interface EmergencyChecklistItem {
  id: string;
  label: string;
  category: 'Field' | 'Safety' | 'Equipment' | 'Records';
  completed: boolean;
}

export interface VerifiedEmergencyContact {
  agency: string;
  number: string;
  scope: string;
  notes: string;
}

export interface KisanRakshakAssessment {
  riskLevel: RiskLevel;
  riskScore: number;
  confidencePercent: number;
  isSyntheticData: boolean;
  dataSourceSummary: string;
  lastAssessedAt: string;
  mainRiskFactors: RiskFactorItem[];
  missingData: string[];
  recommendedProtectiveActions: string[];
  phasePlans: ActionPhasePlan[];
  checklist: EmergencyChecklistItem[];
  verifiedContacts: VerifiedEmergencyContact[];
  safetyDisclaimer: string;
}

export interface AgentExecutionStep {
  id: string;
  agentId: AgentId;
  agentName: string;
  taskAssigned: string;
  toolUsed: string;
  toolArgsSummary: string;
  resultObtained: string;
  status: 'completed' | 'error' | 'skipped';
  durationMs: number;
}

export interface AdvisoryRecommendation {
  id: string;
  title: string;
  crop: string;
  guidanceType: 'General Agronomic Guidance' | 'Requires KVK / Expert Confirmation';
  summary: string;
  steps: string[];
  sourceAgent: AgentId;
  createdAt: string;
  acknowledged: boolean;
}

export interface FarmAlert {
  id: string;
  title: string;
  priority: 'Urgent' | 'High' | 'Moderate' | 'Low';
  reason: string;
  actionRequired: string;
  requiresHumanConfirmation: boolean;
  humanConfirmed: boolean;
  status: 'pending' | 'completed';
  sourceAgent: AgentId;
  createdAt: string;
}

export interface OrchestratorRunResult {
  runId: string;
  timestamp: string;
  query: string;
  language: Language;
  scenarioId: ScenarioId;
  isSyntheticContext: boolean;
  selectedAgents: AgentId[];
  executionSteps: AgentExecutionStep[];
  finalAnswer: string;
  spokenSummary: string;
  conflictCheck: string;
  uncertaintyAndMissingInfo: string[];
  generatedRecommendations: AdvisoryRecommendation[];
  generatedAlerts: FarmAlert[];
}

export interface CropSymptomReport {
  cropType: string;
  location: string;
  growthStage: GrowthStage;
  observedSymptoms: string;
  standingWaterDays: number;
  soilMoisture: 'Dry' | 'Moist' | 'Saturated' | 'Submerged' | 'Unknown';
}

export interface DemoScenarioDefinition {
  id: Exclude<ScenarioId, 'custom' | 'live'>;
  title: string;
  shortLabel: string;
  summary: string;
  defaultQuery: string;
  recommendedFarmerPatch: Partial<FarmerProfile>;
  weather: WeatherContext;
}

export type GeminiModelPreference = 'auto' | 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';

export type CropHealthStatus =
  | 'Healthy'
  | 'Mild Stress'
  | 'Moderate Issue'
  | 'Severe / Critical'
  | 'Unclear Image';

export type CropProblemCategory =
  | 'Disease'
  | 'Pest'
  | 'Nutrient Deficiency'
  | 'Water / Weather Stress'
  | 'Weed / Physical Damage'
  | 'Unclear';

export interface CropDetectedProblem {
  problemName: string;
  category: CropProblemCategory;
  severity: RiskLevel;
  visualEvidence: string;
  immediateSafeSteps: string[];
}

export interface CropPhotoDiagnosis {
  id: string;
  identifiedCrop: string;
  identificationConfidencePct: number;
  estimatedGrowthStage: string;
  healthScore: number;
  healthStatus: CropHealthStatus;
  healthSummary: string;
  detectedProblems: CropDetectedProblem[];
  generalAgronomicSteps: string[];
  requiresKvkConfirmation: boolean;
  kvkVerificationQuestions: string[];
  imageQualityLimitations: string[];
  spokenSummary: string;
  modelUsed: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
  language: Language;
  analyzedAt: string;
}

