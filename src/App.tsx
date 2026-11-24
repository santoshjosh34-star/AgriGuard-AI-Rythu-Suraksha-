import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEMO_SCENARIOS, getScenarioById } from './lib/demoScenarios';
import {
  localizeFarmerName,
  localizeLocationText,
  localizeScenarioDefinition,
  localizeSeedAlert,
  localizeSeedRecommendation,
  localizeWeatherContext,
} from './lib/domainTranslations';
import {
  createPendingLiveWeatherContext,
  deriveLiveAlertsAndRecommendations,
} from './lib/liveWeatherUtils';
import { assessKisanRakshakRisk, validateRiskInputs } from './lib/kisanRakshakEngine';
import { calculateDistanceKm, type ReverseGeocodeResult } from './lib/profileLocationUtils';
import { TRANSLATIONS } from './lib/translations';
import {
  buildDoubtContextSnippet,
  navSectionToDoubtTopic,
  sanitizeHighlightedSelection,
  type DoubtContextPayload,
  type DoubtTopicId,
} from './lib/voiceDoubtUtils';
import type {
  AdvisoryRecommendation,
  CropPhotoDiagnosis,
  CropSymptomReport,
  EmergencyChecklistItem,
  FarmAlert,
  FarmerProfile,
  GeminiModelPreference,
  Language,
  NavSection,
  OrchestratorRunResult,
  WeatherContext,
} from './types/agriguard';
import { Sidebar, TopBar } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { MyFarmView } from './components/MyFarmView';
import { AiStaffView } from './components/AiStaffView';
import { KisanRakshakView } from './components/KisanRakshakView';
import { WeatherIntelligenceView } from './components/WeatherIntelligenceView';
import { CropIntelligenceView } from './components/CropIntelligenceView';
import { RecommendationsView } from './components/RecommendationsView';
import { AlertsReportsView } from './components/AlertsReportsView';
import { SettingsView } from './components/SettingsView';
import { VoiceDoubtAssistantBar } from './components/VoiceDoubtAssistantBar';

const STORAGE_KEY = 'agriguard_workspace_v1';

const DEFAULT_FARMER: FarmerProfile = {
  name: 'Ramesh Rao',
  state: 'Andhra Pradesh',
  district: 'East Godavari',
  location: 'Ramachandrapuram Mandal',
  crops: ['Paddy (MTU-1010)'],
  farmSizeAcres: 4.5,
  soilType: 'Alluvial',
  growthStage: 'Flowering / Panicle Initiation',
  preferredLanguage: 'en',
  drainageType: 'Low-Lying / Basin',
  nearCoastOrRiver: false,
};

async function safeReadJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface PersistedWorkspace {
  farmer: FarmerProfile;
  weather: WeatherContext;
  language: Language;
  voiceAssistantEnabled: boolean;
  checklistCompletedIds: string[];
  alerts: FarmAlert[];
  recommendations: AdvisoryRecommendation[];
  history: OrchestratorRunResult[];
}

function loadInitialWorkspace(): PersistedWorkspace {
  const pendingWeather = createPendingLiveWeatherContext(DEFAULT_FARMER);
  const initialLiveDerived = deriveLiveAlertsAndRecommendations(DEFAULT_FARMER, pendingWeather, 'en');
  const fallback: PersistedWorkspace = {
    farmer: DEFAULT_FARMER,
    weather: pendingWeather,
    language: 'en',
    voiceAssistantEnabled: true,
    checklistCompletedIds: [],
    alerts: initialLiveDerived.alerts,
    recommendations: initialLiveDerived.recommendations,
    history: [],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedWorkspace>;
    const savedWeather = parsed.weather ?? fallback.weather;
    const cleanedAlerts = Array.isArray(parsed.alerts)
      ? savedWeather.scenarioId === 'live'
        ? parsed.alerts.filter((a) => !a.id.startsWith('seed-'))
        : parsed.alerts
      : fallback.alerts;
    const cleanedRecs = Array.isArray(parsed.recommendations)
      ? savedWeather.scenarioId === 'live'
        ? parsed.recommendations.filter((r) => !r.id.startsWith('seed-'))
        : parsed.recommendations
      : fallback.recommendations;

    return {
      farmer: parsed.farmer ?? fallback.farmer,
      weather: savedWeather,
      language: parsed.language ?? fallback.language,
      voiceAssistantEnabled: parsed.voiceAssistantEnabled ?? true,
      checklistCompletedIds: Array.isArray(parsed.checklistCompletedIds)
        ? parsed.checklistCompletedIds
        : [],
      alerts: cleanedAlerts.length > 0 ? cleanedAlerts : fallback.alerts,
      recommendations: cleanedRecs.length > 0 ? cleanedRecs : fallback.recommendations,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return fallback;
  }
}

export default function App() {
  const initial = useMemo(() => loadInitialWorkspace(), []);

  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [farmer, setFarmer] = useState<FarmerProfile>(initial.farmer);
  const [weather, setWeather] = useState<WeatherContext>(initial.weather);
  const [language, setLanguage] = useState<Language>(initial.language);
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState<boolean>(
    initial.voiceAssistantEnabled
  );
  const [doubtTopic, setDoubtTopic] = useState<DoubtTopicId>('overview');
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [checklistCompletedIds, setChecklistCompletedIds] = useState<string[]>(
    initial.checklistCompletedIds
  );
  const [alerts, setAlerts] = useState<FarmAlert[]>(initial.alerts);
  const [recommendations, setRecommendations] = useState<AdvisoryRecommendation[]>(
    initial.recommendations
  );
  const [history, setHistory] = useState<OrchestratorRunResult[]>(initial.history);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(
    initial.history[0]?.runId ?? null
  );

  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrateError, setOrchestrateError] = useState<string | null>(null);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [liveWeatherError, setLiveWeatherError] = useState<string | null>(null);
  const [isAcquiringGps, setIsAcquiringGps] = useState(false);
  const [gpsErrorCode, setGpsErrorCode] = useState<'unsupported' | 'denied' | 'timeout' | null>(null);
  const [preferredModel, setPreferredModel] = useState<GeminiModelPreference>('auto');
  const [cropPhotoPreviewUrl, setCropPhotoPreviewUrl] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoDiagnosis, setPhotoDiagnosis] = useState<CropPhotoDiagnosis | null>(null);
  const lastGpsFixRef = useRef<{ lat: number; lon: number } | null>(
    initial.farmer.gpsCoordinates
      ? { lat: initial.farmer.gpsCoordinates.lat, lon: initial.farmer.gpsCoordinates.lon }
      : null
  );

  const fetchAndApplyLiveWeather = useCallback(
    async (
      targetFarmer: FarmerProfile,
      options?: { forceRefresh?: boolean; lat?: number; lon?: number; resetAlertStatus?: boolean }
    ) => {
      setIsFetchingLive(true);
      setLiveWeatherError(null);
      try {
        const qs = new URLSearchParams({
          district: targetFarmer.district,
          state: targetFarmer.state,
          location: targetFarmer.location,
        });
        if (options?.forceRefresh) qs.set('refresh', '1');
        if (options?.lat !== undefined && options?.lon !== undefined) {
          qs.set('lat', String(options.lat));
          qs.set('lon', String(options.lon));
        }

        const res = await fetch(`/api/weather/live?${qs.toString()}`);
        const data = await safeReadJson<{ weather?: WeatherContext; error?: string }>(res);
        if (!res.ok || !data?.weather) {
          setLiveWeatherError(
            data?.error ||
              (language === 'hi'
                ? 'लाइव मौसम डेटा प्राप्त करने में असमर्थ।'
                : language === 'te'
                ? 'లైవ్ వాతావరణ డేటా పొందడం సాధ్యం కాలేదు.'
                : 'Unable to fetch live meteorological data.')
          );
          return;
        }
        setWeather(data.weather);
        const freshLive = deriveLiveAlertsAndRecommendations(targetFarmer, data.weather, 'en');
        setAlerts((prev) => [
          ...freshLive.alerts.map((a) => {
            if (options?.resetAlertStatus) return a;
            const existing = prev.find((p) => p.id === a.id);
            return existing
              ? { ...a, status: existing.status, humanConfirmed: existing.humanConfirmed }
              : a;
          }),
          ...prev.filter((p) => !p.id.startsWith('seed-') && !p.id.startsWith('live-')),
        ]);
        setRecommendations((prev) => [
          ...freshLive.recommendations.map((r) => {
            if (options?.resetAlertStatus) return r;
            const existing = prev.find((p) => p.id === r.id);
            return existing ? { ...r, acknowledged: existing.acknowledged } : r;
          }),
          ...prev.filter((r) => !r.id.startsWith('seed-') && !r.id.startsWith('live-')),
        ]);
      } catch {
        setLiveWeatherError(
          language === 'hi'
            ? 'लाइव मौसम पूर्वानुमान लाते समय नेटवर्क त्रुटि हुई।'
            : language === 'te'
            ? 'లైవ్ వాతావరణ అంచనా తెచ్చేటప్పుడు నెట్‌వర్క్ లోపం.'
            : 'Network error while fetching live weather forecast.'
        );
      } finally {
        setIsFetchingLive(false);
      }
    },
    [language]
  );

  const farmerRef = useRef(farmer);
  farmerRef.current = farmer;

  const applyGpsPosition = useCallback(
    async (
      lat: number,
      lon: number,
      accuracyM?: number,
      forceWeatherRefresh = true
    ) => {
      lastGpsFixRef.current = { lat, lon };
      let resolved: ReverseGeocodeResult | null = null;
      try {
        const revRes = await fetch(
          `/api/location/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(
            String(lon)
          )}`
        );
        if (revRes.ok) {
          const revData = await safeReadJson<{ location?: ReverseGeocodeResult }>(revRes);
          resolved = revData?.location ?? null;
        }
      } catch {
        // Proceed with raw coordinates if reverse lookup fails transiently
      }

      const gpsPatch = {
        state: resolved?.state || farmerRef.current.state,
        district: resolved?.district || farmerRef.current.district,
        location: resolved?.location || farmerRef.current.location,
        liveLocationEnabled: true,
        gpsCoordinates: {
          lat,
          lon,
          accuracyM,
          updatedAt: new Date().toISOString(),
          resolvedLabel: resolved?.resolvedLabel,
        },
      };

      setFarmer((prev) => ({
        ...prev,
        state: resolved?.state || prev.state,
        district: resolved?.district || prev.district,
        location: resolved?.location || prev.location,
        liveLocationEnabled: true,
        gpsCoordinates: gpsPatch.gpsCoordinates,
      }));

      await fetchAndApplyLiveWeather(
        { ...farmerRef.current, ...gpsPatch },
        {
          forceRefresh: forceWeatherRefresh,
          lat,
          lon,
          resetAlertStatus: true,
        }
      );
    },
    [fetchAndApplyLiveWeather]
  );

  const handleSelectLocation = useCallback(
    async (patch: {
      state: string;
      district: string;
      location: string;
      drainageType?: FarmerProfile['drainageType'];
      nearCoastOrRiver?: boolean;
      lat?: number;
      lon?: number;
    }) => {
      setGpsErrorCode(null);
      setLiveWeatherError(null);
      lastGpsFixRef.current = null;

      const nextFarmer: FarmerProfile = {
        ...farmerRef.current,
        state: patch.state,
        district: patch.district,
        location: patch.location,
        drainageType: patch.drainageType ?? farmerRef.current.drainageType,
        nearCoastOrRiver:
          patch.nearCoastOrRiver !== undefined
            ? patch.nearCoastOrRiver
            : farmerRef.current.nearCoastOrRiver,
        liveLocationEnabled: false,
        gpsCoordinates: undefined,
      };

      setFarmer(nextFarmer);
      const pending = createPendingLiveWeatherContext(nextFarmer);
      setWeather(pending);
      const pendingDerived = deriveLiveAlertsAndRecommendations(nextFarmer, pending, 'en');
      setAlerts((prev) => [
        ...pendingDerived.alerts,
        ...prev.filter((p) => !p.id.startsWith('seed-') && !p.id.startsWith('live-')),
      ]);

      await fetchAndApplyLiveWeather(nextFarmer, {
        forceRefresh: true,
        resetAlertStatus: true,
        lat: patch.lat,
        lon: patch.lon,
      });
    },
    [fetchAndApplyLiveWeather]
  );

  const handleEnableLiveGps = useCallback(() => {
    setGpsErrorCode(null);
    if (!navigator.geolocation) {
      setGpsErrorCode('unsupported');
      return;
    }

    setIsAcquiringGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsAcquiringGps(false);
        setGpsErrorCode(null);
        void applyGpsPosition(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.accuracy,
          true
        );
      },
      (err) => {
        setIsAcquiringGps(false);
        if (err.code === 1) {
          setGpsErrorCode('denied');
          setFarmer((prev) => ({ ...prev, liveLocationEnabled: false }));
        } else {
          setGpsErrorCode('timeout');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [applyGpsPosition]);

  const handleStopLiveGps = useCallback(() => {
    setGpsErrorCode(null);
    setFarmer((prev) => ({ ...prev, liveLocationEnabled: false }));
  }, []);

  const handleUpdateProfilePhoto = useCallback((dataUrl: string | null) => {
    setFarmer((prev) => ({
      ...prev,
      profilePhotoDataUrl: dataUrl,
    }));
  }, []);

  const hadSavedWorkspace = useMemo(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // ignore in non-browser contexts
    }
  }, []);

  useEffect(() => {
    if (!hadSavedWorkspace) {
      if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        void navigator.permissions
          .query({ name: 'geolocation' as PermissionName })
          .then((status) => {
            if (status.state === 'granted') {
              handleEnableLiveGps();
            } else {
              void fetchAndApplyLiveWeather(farmer);
            }
          })
          .catch(() => {
            void fetchAndApplyLiveWeather(farmer);
          });
      } else {
        void fetchAndApplyLiveWeather(farmer);
      }
    } else if (weather.scenarioId === 'live') {
      void fetchAndApplyLiveWeather(farmer, {
        forceRefresh: !weather.plains,
        lat: farmer.liveLocationEnabled ? farmer.gpsCoordinates?.lat : undefined,
        lon: farmer.liveLocationEnabled ? farmer.gpsCoordinates?.lon : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hadSavedWorkspace]);

  // Live background position tracking when user has granted GPS tracking
  useEffect(() => {
    if (!farmer.liveLocationEnabled || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const prev = lastGpsFixRef.current;
        const movedKm = prev ? calculateDistanceKm(prev.lat, prev.lon, lat, lon) : Infinity;

        if (movedKm >= 0.5) {
          void applyGpsPosition(lat, lon, pos.coords.accuracy, false);
        }
      },
      (err) => {
        if (err.code === 1) {
          setGpsErrorCode('denied');
          setFarmer((prev) => ({ ...prev, liveLocationEnabled: false }));
        }
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [farmer.liveLocationEnabled, applyGpsPosition]);

  useEffect(() => {
    try {
      const payload: PersistedWorkspace = {
        farmer,
        weather,
        language,
        voiceAssistantEnabled,
        checklistCompletedIds,
        alerts,
        recommendations,
        history,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [
    farmer,
    weather,
    language,
    voiceAssistantEnabled,
    checklistCompletedIds,
    alerts,
    recommendations,
    history,
  ]);

  // Capture user-highlighted text across dashboard content as the active doubt passage
  useEffect(() => {
    if (!voiceAssistantEnabled) return;

    const handleSelectionCapture = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.closest('[data-testid="voice-doubt-assistant-bar"]'))
      ) {
        return;
      }

      const rawSelection = window.getSelection()?.toString() || '';
      const sanitized = sanitizeHighlightedSelection(rawSelection);
      if (sanitized) {
        setHighlightedText(sanitized);
        setDoubtTopic('highlighted');
      }
    };

    document.addEventListener('mouseup', handleSelectionCapture);
    document.addEventListener('keyup', handleSelectionCapture);
    return () => {
      document.removeEventListener('mouseup', handleSelectionCapture);
      document.removeEventListener('keyup', handleSelectionCapture);
    };
  }, [voiceAssistantEnabled]);

  const localizedWeather = useMemo(
    () => localizeWeatherContext(weather, language),
    [weather, language]
  );

  const localizedScenarios = useMemo(
    () => DEMO_SCENARIOS.map((sc) => localizeScenarioDefinition(sc, language)),
    [language]
  );

  const liveDerivedInLang = useMemo(
    () =>
      weather.scenarioId === 'live'
        ? deriveLiveAlertsAndRecommendations(farmer, weather, language)
        : null,
    [farmer, weather, language]
  );

  const localizedAlerts = useMemo(
    () =>
      alerts.map((a) => {
        if (liveDerivedInLang && a.id.startsWith('live-')) {
          const match = liveDerivedInLang.alerts.find((d) => d.id === a.id);
          if (match) {
            return {
              ...match,
              status: a.status,
              humanConfirmed: a.humanConfirmed,
              createdAt: a.createdAt,
            };
          }
        }
        return localizeSeedAlert(a, language);
      }),
    [alerts, language, liveDerivedInLang]
  );

  const localizedRecommendations = useMemo(
    () =>
      recommendations.map((r) => {
        if (liveDerivedInLang && r.id.startsWith('live-')) {
          const match = liveDerivedInLang.recommendations.find((d) => d.id === r.id);
          if (match) {
            return {
              ...match,
              acknowledged: r.acknowledged,
              createdAt: r.createdAt,
            };
          }
        }
        return localizeSeedRecommendation(r, language);
      }),
    [recommendations, language, liveDerivedInLang]
  );

  const assessment = useMemo(
    () => assessKisanRakshakRisk(farmer, weather, language),
    [farmer, weather, language]
  );

  const checklist: EmergencyChecklistItem[] = useMemo(
    () =>
      assessment.checklist.map((item) => ({
        ...item,
        completed: checklistCompletedIds.includes(item.id),
      })),
    [assessment.checklist, checklistCompletedIds]
  );

  const dict = TRANSLATIONS[language];

  const doubtContext = useMemo(
    () =>
      buildDoubtContextSnippet({
        topicId: doubtTopic,
        highlightedText,
        farmer,
        weather: localizedWeather,
        assessment,
        photoDiagnosis,
        recommendations: localizedRecommendations,
        alerts: localizedAlerts,
        language,
      }),
    [
      doubtTopic,
      highlightedText,
      farmer,
      localizedWeather,
      assessment,
      photoDiagnosis,
      localizedRecommendations,
      localizedAlerts,
      language,
    ]
  );

  const handleSelectSection = useCallback((section: NavSection) => {
    setActiveSection(section);
    setDoubtTopic((prev) => (prev === 'highlighted' ? prev : navSectionToDoubtTopic(section)));
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // ignore
    }
  }, []);

  const handleReloadHome = useCallback(() => {
    setMobileMenuOpen(false);
    setActiveSection('overview');
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      window.scrollTo(0, 0);
    } catch {
      // ignore
    }
    window.location.reload();
  }, []);

  const gpsErrorMessage = useMemo(() => {
    if (!gpsErrorCode) return null;
    if (gpsErrorCode === 'unsupported') return dict.myFarm.gpsUnsupported;
    if (gpsErrorCode === 'denied') return dict.myFarm.gpsPermissionDenied;
    return dict.myFarm.gpsTimeoutErr;
  }, [gpsErrorCode, dict.myFarm]);

  const farmerForApi = useMemo(() => {
    const { profilePhotoDataUrl: _omitPhoto, ...rest } = farmer;
    return rest;
  }, [farmer]);

  const handleChangeLanguage = (lang: Language) => {
    setLanguage(lang);
    setFarmer((prev) => ({ ...prev, preferredLanguage: lang }));
  };

  const handleSelectScenario = (scenarioId: Exclude<WeatherContext['scenarioId'], 'custom' | 'live'>) => {
    const scenario = getScenarioById(scenarioId);
    setLiveWeatherError(null);
    setWeather(scenario.weather);
    setFarmer((prev) => ({
      ...prev,
      ...scenario.recommendedFarmerPatch,
    }));
  };

  const handleAssessCustom = async (customWeather: WeatherContext): Promise<string | null> => {
    const localValidation = validateRiskInputs(farmer, customWeather, language);
    if (!localValidation.valid) {
      return (
        Object.values(localValidation.errors)[0] ??
        (language === 'hi'
          ? 'अमान्य जोखिम मूल्यांकन इनपुट।'
          : language === 'te'
          ? 'చెల్లని ప్రమాద అంచనా వివరాలు.'
          : 'Invalid risk assessment inputs.')
      );
    }

    try {
      const res = await fetch('/api/kisan-rakshak/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmer, weather: customWeather }),
      });
      const data = await safeReadJson<{
        error?: string;
        validationErrors?: Record<string, string>;
      }>(res);
      if (!res.ok) {
        const firstFieldErr = data?.validationErrors
          ? Object.values(data.validationErrors)[0]
          : undefined;
        return (
          firstFieldErr ||
          data?.error ||
          (language === 'hi'
            ? 'किसान रक्षक मूल्यांकन करने में विफल।'
            : language === 'te'
            ? 'కిసాన్ రక్షక్ అంచనా లెక్కించడం విఫలమైంది.'
            : 'Failed to compute Kisan Rakshak assessment.')
        );
      }
      setWeather(customWeather);
      return null;
    } catch {
      return language === 'hi'
        ? 'किसान रक्षक सर्वर से संपर्क करने में नेटवर्क त्रुटि।'
        : language === 'te'
        ? 'కిసాన్ రక్షక్ సర్వర్‌తో కనెక్ట్ కావడంలో నెట్‌వర్క్ లోపం.'
        : 'Network error communicating with Kisan Rakshak server.';
    }
  };

  const handleRunOrchestrator = async (
    query: string,
    symptomReport?: CropSymptomReport,
    attachedDiagnosis?: CropPhotoDiagnosis
  ): Promise<boolean> => {
    setIsOrchestrating(true);
    setOrchestrateError(null);

    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          farmer: farmerForApi,
          weather,
          language,
          symptomReport,
          photoDiagnosis: attachedDiagnosis,
          preferredModel,
        }),
      });

      const data = await safeReadJson<
        OrchestratorRunResult & {
          error?: string;
          hint?: string;
        }
      >(res);

      if (!res.ok || !data) {
        if (language === 'hi') {
          setOrchestrateError(
            res.status === 503
              ? 'जेमिनी एआई सेवा अभी अस्थायी रूप से व्यस्त है। कृपया कुछ सेकंड प्रतीक्षा करें और पुनः प्रयास करें। एग्रीगार्ड एआई कभी नकली उत्तर नहीं बनाता।'
              : data?.error || 'एआई स्टाफ समन्वय विफल हुआ। कृपया पुनः प्रयास करें।'
          );
        } else if (language === 'te') {
          setOrchestrateError(
            res.status === 503
              ? 'జెమినీ ఏఐ సేవ ప్రస్తుతం తాత్కాలికంగా రద్దీగా ఉంది. దయచేసి కొన్ని సెకన్లు వేచి ఉండి మళ్లీ ప్రయత్నించండి. అగ్రిగార్డ్ ఏఐ ఎప్పుడూ నకిలీ సమాధానాలు తయారు చేయదు.'
              : data?.error || 'ఏఐ సిబ్బంది విశ్లేషణ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.'
          );
        } else {
          setOrchestrateError(
            data?.hint
              ? `${data.error} ${data.hint}`
              : data?.error || 'AI Staff orchestration failed.'
          );
        }
        return false;
      }

      setHistory((prev) => [data, ...prev].slice(0, 20));
      setSelectedRunId(data.runId);

      if (data.generatedRecommendations?.length > 0) {
        setRecommendations((prev) => [...data.generatedRecommendations, ...prev]);
      }
      if (data.generatedAlerts?.length > 0) {
        setAlerts((prev) => [...data.generatedAlerts, ...prev]);
      }
      return true;
    } catch {
      setOrchestrateError(
        language === 'hi'
          ? 'एग्रीगार्ड एआई ऑर्केस्ट्रेटर सर्वर तक पहुँच नहीं हो सकी। कृपया सर्वर स्थिति जांचें।'
          : language === 'te'
          ? 'అగ్రిగార్డ్ ఏఐ ఆర్కెస్ట్రేటర్ సర్వర్‌ను చేరుకోలేకపోయాము. దయచేసి సర్వర్‌ను తనిఖీ చేయండి.'
          : 'Unable to reach AgriGuard AI orchestrator service. Please verify the server is running.'
      );
      return false;
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleAskWithDoubt = (
    spokenQuestion: string,
    context: DoubtContextPayload
  ): Promise<boolean> => {
    return handleRunOrchestrator(context.promptWithContext(spokenQuestion));
  };

  const handleAnalyzeCropPhoto = async (payload: {
    imageDataUrl: string;
    farmerNotes: string;
    preferredModel: GeminiModelPreference;
  }): Promise<CropPhotoDiagnosis | null> => {
    setIsAnalyzingPhoto(true);
    setPhotoError(null);
    try {
      const res = await fetch('/api/crop/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: payload.imageDataUrl,
          farmerNotes: payload.farmerNotes,
          preferredModel: payload.preferredModel,
          language,
          farmer: farmerForApi,
        }),
      });
      const data = await safeReadJson<{
        diagnosis?: CropPhotoDiagnosis;
        error?: string;
        hint?: string;
      }>(res);
      if (!res.ok || !data?.diagnosis) {
        if (language === 'hi') {
          setPhotoError(
            res.status === 503
              ? 'जेमिनी विज़न सेवा अभी व्यस्त है या एपीआई कुंजी कॉन्फ़िगर नहीं है। एग्रीगार्ड एआई कभी नकली फसल निदान नहीं बनाता।'
              : data?.error || 'फसल फोटो का विश्लेषण नहीं हो सका। कृपया पुनः प्रयास करें।'
          );
        } else if (language === 'te') {
          setPhotoError(
            res.status === 503
              ? 'జెమినీ విజన్ సేవ ప్రస్తుతం రద్దీగా ఉంది లేదా ఏపీఐ కీ సెటప్ కాలేదు. అగ్రిగార్డ్ ఏఐ ఎప్పుడూ నకిలీ పంట నిర్ధారణలు ఇవ్వదు.'
              : data?.error || 'పంట ఫోటోను విశ్లేషించడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.'
          );
        } else {
          setPhotoError(
            data?.hint
              ? `${data.error} ${data.hint}`
              : data?.error || 'Crop photo analysis failed.'
          );
        }
        return null;
      }
      setPhotoDiagnosis(data.diagnosis);
      return data.diagnosis;
    } catch {
      setPhotoError(
        language === 'hi'
          ? 'फसल फोटो जांच सर्वर से संपर्क नहीं हो सका।'
          : language === 'te'
          ? 'పంట ఫోటో విశ్లేషణ సర్వర్‌తో కనెక్ట్ కాలేకపోయాము.'
          : 'Unable to reach crop vision server. Please try again.'
      );
      return null;
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklistCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDispatchAlert = (alertInput: Omit<FarmAlert, 'id' | 'createdAt'>) => {
    const newAlert: FarmAlert = {
      ...alertInput,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleToggleAlertStatus = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'pending' ? 'completed' : 'pending' }
          : a
      )
    );
  };

  const handleConfirmAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, humanConfirmed: true } : a))
    );
  };

  const handleResetWorkspace = () => {
    localStorage.removeItem(STORAGE_KEY);
    const pendingWeather = createPendingLiveWeatherContext(DEFAULT_FARMER);
    const initialLiveDerived = deriveLiveAlertsAndRecommendations(
      DEFAULT_FARMER,
      pendingWeather,
      'en'
    );
    setFarmer(DEFAULT_FARMER);
    setWeather(pendingWeather);
    setLanguage('en');
    setVoiceAssistantEnabled(true);
    setDoubtTopic('overview');
    setHighlightedText('');
    setChecklistCompletedIds([]);
    setAlerts(initialLiveDerived.alerts);
    setRecommendations(initialLiveDerived.recommendations);
    setHistory([]);
    setSelectedRunId(null);
    setOrchestrateError(null);
    setCropPhotoPreviewUrl(null);
    setPhotoDiagnosis(null);
    setPhotoError(null);
    setGpsErrorCode(null);
    lastGpsFixRef.current = null;
    void fetchAndApplyLiveWeather(DEFAULT_FARMER, { forceRefresh: true });
  };

  const pendingAlertsCount = localizedAlerts.filter((a) => a.status === 'pending').length;

  const localizedFarmerPlace = useMemo(() => {
    const loc = localizeLocationText(farmer.location, language);
    const dist = localizeLocationText(farmer.district, language);
    const st = localizeLocationText(farmer.state, language);
    const place =
      loc && !loc.toLowerCase().includes(dist.toLowerCase()) ? `${loc}, ${dist}` : loc || dist;
    return `${localizeFarmerName(farmer.name, language)} · ${place}, ${st}`;
  }, [farmer.name, farmer.location, farmer.district, farmer.state, language]);

  return (
    <div className="min-h-screen bg-[#1B3D2B] text-[#14291D]">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onReloadHome={handleReloadHome}
        language={language}
        onChangeLanguage={handleChangeLanguage}
        pendingAlertsCount={pendingAlertsCount}
        currentRiskLevel={assessment.riskLevel}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="lg:pl-64">
        <TopBar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          onReloadHome={handleReloadHome}
          sectionTitle={dict.nav[activeSection]}
          farmerLocationLabel={localizedFarmerPlace}
          contextBadgeLabel={
            weather.scenarioId === 'live'
              ? dict.liveDataLabel
              : weather.isSyntheticDemo
              ? dict.syntheticWarningPrefix
              : dict.customContextLabel
          }
          currentRiskLevel={assessment.riskLevel}
          pendingAlertsCount={pendingAlertsCount}
          language={language}
          onChangeLanguage={handleChangeLanguage}
          voiceAssistantEnabled={voiceAssistantEnabled}
          onToggleVoiceAssistant={() => setVoiceAssistantEnabled((v) => !v)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onPrimaryAction={() => handleSelectSection('ai-staff')}
          primaryActionLabel={dict.common.runOrchestrator}
        />

        <VoiceDoubtAssistantBar
          enabled={voiceAssistantEnabled}
          language={language}
          doubtTopic={doubtTopic}
          onChangeDoubtTopic={(nextTopic) => setDoubtTopic(nextTopic)}
          highlightedText={highlightedText}
          onClearHighlight={() => {
            setHighlightedText('');
            setDoubtTopic(navSectionToDoubtTopic(activeSection));
            window.getSelection()?.removeAllRanges();
          }}
          doubtContext={doubtContext}
          isOrchestrating={isOrchestrating}
          orchestrateError={orchestrateError}
          latestRun={history[0] ?? null}
          onAskWithDoubt={handleAskWithDoubt}
          onTurnOff={() => setVoiceAssistantEnabled(false)}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {activeSection === 'overview' && (
            <OverviewView
              farmer={farmer}
              weather={localizedWeather}
              assessment={assessment}
              alerts={localizedAlerts}
              latestRun={history[0] ?? null}
              scenarios={localizedScenarios}
              language={language}
              isOrchestrating={isOrchestrating}
              orchestrateError={orchestrateError}
              isFetchingLive={isFetchingLive}
              liveWeatherError={liveWeatherError}
              isAcquiringGps={isAcquiringGps}
              gpsErrorMessage={gpsErrorMessage}
              onEnableLiveGps={handleEnableLiveGps}
              onUpdatePhoto={handleUpdateProfilePhoto}
              onLoadLiveWeather={(force) =>
                fetchAndApplyLiveWeather(farmer, {
                  forceRefresh: force,
                  lat: farmer.liveLocationEnabled ? farmer.gpsCoordinates?.lat : undefined,
                  lon: farmer.liveLocationEnabled ? farmer.gpsCoordinates?.lon : undefined,
                })
              }
              onSelectLocation={handleSelectLocation}
              onSelectScenario={handleSelectScenario}
              onNavigate={handleSelectSection}
              onRunOrchestrator={async (q) => {
                await handleRunOrchestrator(q);
              }}
            />
          )}

          {activeSection === 'my-farm' && (
            <MyFarmView
              farmer={farmer}
              language={language}
              isAcquiringGps={isAcquiringGps}
              gpsErrorMessage={gpsErrorMessage}
              onEnableLiveGps={handleEnableLiveGps}
              onStopLiveGps={handleStopLiveGps}
              onUpdatePhoto={handleUpdateProfilePhoto}
              onSaveProfile={(updated) => {
                const locationChanged =
                  localizeLocationText(updated.state, 'en').toLowerCase() !==
                    localizeLocationText(farmer.state, 'en').toLowerCase() ||
                  localizeLocationText(updated.district, 'en').toLowerCase() !==
                    localizeLocationText(farmer.district, 'en').toLowerCase() ||
                  localizeLocationText(updated.location, 'en').toLowerCase() !==
                    localizeLocationText(farmer.location, 'en').toLowerCase();

                const cleanedUpdated: FarmerProfile = locationChanged
                  ? {
                      ...updated,
                      liveLocationEnabled: false,
                      gpsCoordinates: undefined,
                    }
                  : updated;

                if (locationChanged) {
                  lastGpsFixRef.current = null;
                  setGpsErrorCode(null);
                  const pending = createPendingLiveWeatherContext(cleanedUpdated);
                  setWeather(pending);
                }

                setFarmer(cleanedUpdated);
                setLanguage(cleanedUpdated.preferredLanguage);

                if (locationChanged || weather.scenarioId === 'live') {
                  void fetchAndApplyLiveWeather(cleanedUpdated, {
                    forceRefresh: true,
                    resetAlertStatus: locationChanged,
                    lat: cleanedUpdated.liveLocationEnabled
                      ? cleanedUpdated.gpsCoordinates?.lat
                      : undefined,
                    lon: cleanedUpdated.liveLocationEnabled
                      ? cleanedUpdated.gpsCoordinates?.lon
                      : undefined,
                  });
                }
              }}
            />
          )}

          {activeSection === 'ai-staff' && (
            <AiStaffView
              farmer={farmer}
              weather={localizedWeather}
              scenarios={localizedScenarios}
              language={language}
              isOrchestrating={isOrchestrating}
              orchestrateError={orchestrateError}
              isFetchingLive={isFetchingLive}
              history={history}
              selectedRunId={selectedRunId}
              onSelectRun={setSelectedRunId}
              onLoadLiveWeather={() => fetchAndApplyLiveWeather(farmer, { forceRefresh: true })}
              onSelectScenario={handleSelectScenario}
              onRunOrchestrator={async (q) => {
                await handleRunOrchestrator(q);
              }}
              onClearHistory={() => {
                setHistory([]);
                setSelectedRunId(null);
              }}
            />
          )}

          {activeSection === 'kisan-rakshak' && (
            <KisanRakshakView
              farmer={farmer}
              weather={localizedWeather}
              assessment={assessment}
              checklist={checklist}
              scenarios={localizedScenarios}
              language={language}
              isFetchingLive={isFetchingLive}
              onLoadLiveWeather={() => fetchAndApplyLiveWeather(farmer, { forceRefresh: true })}
              onSelectScenario={handleSelectScenario}
              onAssessCustom={handleAssessCustom}
              onToggleChecklistItem={handleToggleChecklistItem}
              onDispatchUrgentAlert={handleDispatchAlert}
            />
          )}

          {activeSection === 'weather' && (
            <WeatherIntelligenceView
              farmer={farmer}
              weather={localizedWeather}
              language={language}
              isOrchestrating={isOrchestrating}
              isFetchingLive={isFetchingLive}
              isAcquiringGps={isAcquiringGps}
              liveWeatherError={liveWeatherError}
              gpsErrorMessage={gpsErrorMessage}
              onEnableLiveGps={handleEnableLiveGps}
              onRefreshLive={(coords) =>
                fetchAndApplyLiveWeather(farmer, {
                  forceRefresh: true,
                  lat: coords?.lat,
                  lon: coords?.lon,
                })
              }
              onAskWeatherAgent={async (q) => {
                await handleRunOrchestrator(q);
                handleSelectSection('ai-staff');
              }}
            />
          )}

          {activeSection === 'crop' && (
            <CropIntelligenceView
              farmer={farmer}
              language={language}
              isOrchestrating={isOrchestrating}
              isAnalyzingPhoto={isAnalyzingPhoto}
              photoError={photoError}
              photoDiagnosis={photoDiagnosis}
              previewDataUrl={cropPhotoPreviewUrl}
              onChangePreviewDataUrl={setCropPhotoPreviewUrl}
              preferredModel={preferredModel}
              onChangePreferredModel={setPreferredModel}
              onAnalyzeCropPhoto={handleAnalyzeCropPhoto}
              onClearPhotoDiagnosis={() => {
                setPhotoDiagnosis(null);
                setPhotoError(null);
              }}
              onAnalyzeCrop={async (report, prompt, attachedDiagnosis) => {
                await handleRunOrchestrator(prompt, report, attachedDiagnosis);
                handleSelectSection('ai-staff');
              }}
            />
          )}

          {activeSection === 'recommendations' && (
            <RecommendationsView
              recommendations={localizedRecommendations}
              language={language}
              onToggleAcknowledge={(id) =>
                setRecommendations((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, acknowledged: !r.acknowledged } : r))
                )
              }
              onGoToAiStaff={() => handleSelectSection('ai-staff')}
            />
          )}

          {activeSection === 'alerts' && (
            <AlertsReportsView
              farmer={farmer}
              weather={localizedWeather}
              assessment={assessment}
              alerts={localizedAlerts}
              language={language}
              onToggleAlertStatus={handleToggleAlertStatus}
              onConfirmAlert={handleConfirmAlert}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsView
              language={language}
              voiceAssistantEnabled={voiceAssistantEnabled}
              onToggleVoiceAssistant={setVoiceAssistantEnabled}
              onChangeLanguage={handleChangeLanguage}
              onResetWorkspace={handleResetWorkspace}
            />
          )}
        </main>
      </div>
    </div>
  );
}
