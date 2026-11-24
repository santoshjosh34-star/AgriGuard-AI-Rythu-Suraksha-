import type { AgentId, Language, NavSection } from '../types/agriguard.ts';

export interface UiDictionary {
  brandName: string;
  subBrandName: string;
  tagline: string;
  languageLabel: string;
  syntheticWarningPrefix: string;
  liveDataLabel: string;
  customContextLabel: string;
  nav: Record<NavSection, string>;
  common: {
    saveProfile: string;
    saved: string;
    runOrchestrator: string;
    runningAgents: string;
    pending: string;
    completed: string;
    confirmAction: string;
    cancel: string;
    listenSummary: string;
    stopVoice: string;
    speakQuery: string;
    stopListening: string;
    loadScenario: string;
    clearHistory: string;
    liveFarmWeatherBtn: string;
    syncLiveWeatherBtn: string;
    syncingLiveBtn: string;
    acresUnit: string;
    all: string;
    openMenuAria: string;
    closeMenuAria: string;
    closeModalAria: string;
    reloadHomeAria: string;
    topNavAria: string;
    voiceUnsupported: string;
    voiceMicDenied: string;
  };
  overview: {
    heading: string;
    subheading: string;
    askTeamTitle: string;
    askTeamSubheading: string;
    askPlaceholder: string;
    askLabelAria: string;
    queryMinError: string;
    readinessTitle: string;
    pendingTasksTitle: string;
    weatherSummaryTitle: string;
    editFarmProfile: string;
    liveFeedActive: string;
    syntheticFeedActive: string;
    customFeedActive: string;
    scorePrefix: string;
    confPrefix: string;
    rain24Title: string;
    rain72TotalPrefix: string;
    notSet: string;
    windSoilTitle: string;
    topsoilPrefix: string;
    floodPrefix: string;
    completedActionsSuffix: string;
    sprayingWindowTitle: string;
    irrigationWindowTitle: string;
    openFullAiStaff: string;
    latestBriefLabel: string;
    toolsExecutedSuffix: string;
    priorityQueueTitle: string;
    manageAll: string;
    allAlertsDone: string;
    confirmBeforeAction: string;
    standardStep: string;
    scanCropPhotoBtn: string;
    trackGpsBtn: string;
    gpsTrackingActiveBtn: string;
    gpsAcquiringBtn: string;
    gpsActiveBadge: string;
    editPhotoAria: string;
    tempCardTitle: string;
    humidityPrefix: string;
    selectLocationLabel: string;
    applyLocationBtn: string;
    customLocationToggle: string;
    updatingLocation: string;
    customDistrictPlaceholder: string;
    customStatePlaceholder: string;
    locationPresetPlaceholder: string;
  };
  myFarm: {
    subtitle: string;
    quickLocationLabel: string;
    customLocationOption: string;
    nameLabel: string;
    langLabel: string;
    stateLabel: string;
    districtLabel: string;
    locationLabel: string;
    cropsLabel: string;
    cropsPlaceholder: string;
    farmSizeLabel: string;
    soilTypeLabel: string;
    growthStageLabel: string;
    drainageLabel: string;
    nearCoastLabel: string;
    errName: string;
    errState: string;
    errDistrict: string;
    errLocation: string;
    errCrops: string;
    errSize: string;
    summaryState: string;
    summaryCrops: string;
    summaryArea: string;
    summaryStage: string;
    summarySoil: string;
    privacyTitle: string;
    privacyDesc: string;
    gpsSectionTitle: string;
    gpsSectionDesc: string;
    allowGpsBtn: string;
    refreshGpsBtn: string;
    stopGpsBtn: string;
    gpsAcquiringStatus: string;
    gpsActiveStatus: string;
    gpsAccuracyPrefix: string;
    gpsPermissionDenied: string;
    gpsUnsupported: string;
    gpsTimeoutErr: string;
    photoSectionTitle: string;
    uploadPhotoBtn: string;
    cameraPhotoBtn: string;
    removePhotoBtn: string;
    cameraModalTitle: string;
    cameraCaptureBtn: string;
    cameraFallbackBtn: string;
    cameraStarting: string;
    cameraDeniedErr: string;
  };
  aiStaff: {
    heading: string;
    subheadingPrefix: string;
    contextLabel: string;
    contextModeLabel: string;
    askPromptLabel: string;
    queryMinError: string;
    agentReady: string;
    agentCalled: string;
    orchestratingStatus: string;
    unifiedPlanLabel: string;
    syntheticContextSuffix: string;
    synthesisTitle: string;
    conflictCheckTitle: string;
    uncertaintyTitle: string;
    activityPanelTitle: string;
    activityPanelSub: string;
    noToolsRequired: string;
    taskPrefix: string;
    toolPrefix: string;
    resultPrefix: string;
    statusCompleted: string;
    statusError: string;
    historyTitle: string;
    historySub: string;
    historyEmpty: string;
    toolsCountSuffix: string;
    roster: Record<Exclude<AgentId, 'master'>, { name: string; role: string }>;
  };
  kisanRakshak: {
    syntheticBanner: string;
    customBanner: string;
    heading: string;
    subheading: string;
    weatherSourceLabel: string;
    scenarioPrefix: string;
    runAssessment: string;
    riskCategory: string;
    confidence: string;
    confSuffix: string;
    missingData: string;
    missingConfNote: string;
    beforeEvent: string;
    duringEvent: string;
    afterEvent: string;
    checklistTitle: string;
    checklistSubPrefix: string;
    checklistSubMid: string;
    contactsTitle: string;
    contactsSub: string;
    dispatchAlertBtn: string;
    customHeading: string;
    customSubPrefix: string;
    customSubSuffix: string;
    rain24Input: string;
    windInput: string;
    warningInput: string;
    warningPlaceholder: string;
    floodStatusInput: string;
    breakdownTitle: string;
    sourcePrefix: string;
    phasedPlanTitle: string;
    phasedPlanSub: string;
    priorityPrefix: string;
    modalTitle: string;
    modalDescTemplate: string;
    modalConsequence: string;
    dispatchedNotice: string;
    alertTitlePrefix: string;
  };
  weatherView: {
    agentHeader: string;
    sourcePrefix: string;
    lastUpdatedPrefix: string;
    fetchLiveBtn: string;
    fetchingLiveBtn: string;
    useGpsBtn: string;
    runWeatherAgentBtn: string;
    runningAgentBtn: string;
    gpsUnsupported: string;
    gpsDenied: string;
    rainCardTitle: string;
    windCardTitle: string;
    tempCardTitle: string;
    soilCardTitle: string;
    sprayingTitle: string;
    irrigationTitle: string;
    confirmedObsTitle: string;
    uncertaintyTitle: string;
    timelineHeading: string;
    colWindow: string;
    colKind: string;
    colRain: string;
    colWind: string;
    colTemp: string;
    colHumidity: string;
  };
  cropView: {
    agentBadge: string;
    heading: string;
    subheading: string;
    cropTypeLabel: string;
    cropTypePlaceholder: string;
    locationLabel: string;
    growthStageLabel: string;
    soilMoistureLabel: string;
    waterDaysLabel: string;
    symptomsLabel: string;
    symptomsPlaceholder: string;
    errRequired: string;
    errWaterDays: string;
    runningBtn: string;
    submitBtn: string;
    guideTitle: string;
    guideNurseryTitle: string;
    guideNurseryDesc: string;
    guideFloweringTitle: string;
    guideFloweringDesc: string;
    guideMaturityTitle: string;
    guideMaturityDesc: string;
    guideChemicalTitle: string;
    guideChemicalDesc: string;
    photoHeading: string;
    photoSubheading: string;
    uploadDropLabel: string;
    uploadHint: string;
    choosePhotoBtn: string;
    capturePhotoBtn: string;
    changePhotoBtn: string;
    removePhotoBtn: string;
    cropPhotoPreviewAlt: string;
    notesLabel: string;
    notesPlaceholder: string;
    modelSelectorLabel: string;
    modelAuto: string;
    modelFlash: string;
    modelFlashLite: string;
    analyzePhotoBtn: string;
    analyzingPhotoBtn: string;
    diagnosisReportTitle: string;
    identifiedCropLabel: string;
    confidenceLabel: string;
    estStageLabel: string;
    healthScoreLabel: string;
    healthSummaryLabel: string;
    problemsHeading: string;
    noProblemsFound: string;
    visualEvidencePrefix: string;
    safeStepsLabel: string;
    generalStepsTitle: string;
    kvkQuestionsTitle: string;
    limitationsTitle: string;
    modelUsedPrefix: string;
    sendToAiStaffBtn: string;
    sendingToAiStaffBtn: string;
  };
  recommendationsView: {
    heading: string;
    subheading: string;
    tabAll: string;
    tabGeneral: string;
    tabExpert: string;
    emptyTitle: string;
    emptySub: string;
    cropPrefix: string;
    reviewed: string;
    markReviewed: string;
    kvkNotice: string;
  };
  alertsView: {
    heading: string;
    subheading: string;
    downloadBtn: string;
    emptyFilter: string;
    statusCompleted: string;
    statusPending: string;
    farmerConfirmed: string;
    awaitingConfirm: string;
    reasonPrefix: string;
    actionPrefix: string;
    confirmBtn: string;
    markDoneBtn: string;
    modalTitle: string;
    modalConsequence: string;
    modalDescPrefix: string;
    modalActionLabel: string;
  };
  settingsView: {
    subheading: string;
    prefLangTitle: string;
    prefLangSub: string;
    commitmentsTitle: string;
    commit1Title: string;
    commit1Body: string;
    commit2Title: string;
    commit2Body: string;
    commit3Title: string;
    commit3Body: string;
    commit4Title: string;
    commit4Body: string;
    storageTitle: string;
    storageSub: string;
    resetBtn: string;
    resetModalTitle: string;
    resetModalDesc: string;
    resetModalNote: string;
    resetModalConfirm: string;
  };
  charts: {
    emptyTimeline: string;
    rainfallLegend: string;
    windLegend: string;
    hoverHint: string;
    timelineAria: string;
    ptsUnit: string;
  };
  voiceAssistant: {
    topBarToggleOn: string;
    topBarToggleOff: string;
    topBarToggleAria: string;
    panelTitle: string;
    panelSub: string;
    doubtSelectLabel: string;
    topicHighlighted: string;
    topicOverview: string;
    topicKisanRakshak: string;
    topicWeather: string;
    topicCrop: string;
    topicRecommendations: string;
    topicAlerts: string;
    highlightHint: string;
    clearHighlightBtn: string;
    readDoubtBtn: string;
    stopReadingBtn: string;
    micTalkBtn: string;
    micStopBtn: string;
    micListeningStatus: string;
    askInputPlaceholder: string;
    sendQuestionBtn: string;
    aiThinkingStatus: string;
    speakingReplyBadge: string;
    voiceToneBadge: string;
    preparingVoiceStatus: string;
    speakingDoubtStatus: string;
    speakingReplyStatus: string;
    softVolumeLabel: string;
    replyHeaderLabel: string;
    replayAnswerBtn: string;
    ttsUnsupported: string;
    settingsVoiceTitle: string;
    settingsVoiceSub: string;
    settingsVoiceOnLabel: string;
    settingsVoiceOffLabel: string;
  };
  plains: {
    plainsTitle: string;
    elevationLabel: string;
    reliefLabel: string;
    plainTypeLabel: string;
    drainageSlopeLabel: string;
    rootMoistureLabel: string;
    soilTempLabel: string;
    et0Label: string;
    pressureLabel: string;
    rainProbLabel: string;
    riverFlowLabel: string;
    unavailable: string;
    elevUnit: string;
    flowUnit: string;
    pressureUnit: string;
    et0Unit: string;
  };
}

export const TRANSLATIONS: Record<Language, UiDictionary> = {
  en: {
    brandName: 'AgriGuard-AI',
    subBrandName: 'Rythu Suraksha',
    tagline: 'Every Farmer Deserves an AI Team.',
    languageLabel: 'Language',
    syntheticWarningPrefix: 'Synthetic Test Scenario',
    liveDataLabel: 'Live Meteorological Data',
    customContextLabel: 'Custom Field Context',
    nav: {
      overview: 'Overview',
      'my-farm': 'My Farm',
      'ai-staff': 'AI Staff',
      'kisan-rakshak': 'Kisan-Rakshak',
      weather: 'Weather Intelligence',
      crop: 'Crop Intelligence',
      recommendations: 'Recommendations',
      alerts: 'Alerts and Reports',
      settings: 'Settings',
    },
    common: {
      saveProfile: 'Save Farm Profile',
      saved: 'Saved',
      runOrchestrator: 'Consult AI Staff',
      runningAgents: 'Coordinating Agents...',
      pending: 'Pending',
      completed: 'Completed',
      confirmAction: 'Confirm & Proceed',
      cancel: 'Cancel',
      listenSummary: 'Listen',
      stopVoice: 'Stop Audio',
      speakQuery: 'Voice Input',
      stopListening: 'Listening...',
      loadScenario: 'Load Test Scenario',
      clearHistory: 'Clear History',
      liveFarmWeatherBtn: 'Live Farm Weather',
      syncLiveWeatherBtn: 'Sync Live Weather',
      syncingLiveBtn: 'Syncing Live...',
      acresUnit: 'acres',
      all: 'All',
      openMenuAria: 'Open navigation menu',
      closeMenuAria: 'Close navigation menu',
      closeModalAria: 'Close confirmation dialog',
      reloadHomeAria: 'Reload and open Rythu Suraksha start page',
      topNavAria: 'Top section navigation bar',
      voiceUnsupported: 'Browser voice input is not supported here; please type your question.',
      voiceMicDenied: 'Microphone capture unavailable or denied. You can type your request directly.',
    },
    overview: {
      heading: 'Farm Operations Command',
      subheading: 'Coordinated multi-agent protection, weather clarity, and crop readiness for your farm.',
      askTeamTitle: 'Ask Your Master Orchestrator',
      askTeamSubheading: 'Master Agent inspects your question, calls the relevant specialised agents, checks conflicts, and produces one unified plan.',
      askPlaceholder: 'Ask about rain impact, paddy protection, drainage, or leaf symptoms...',
      askLabelAria: 'Ask Master Orchestrator Agent',
      queryMinError: 'Please describe your question or field condition (at least 3 characters).',
      readinessTitle: 'Kisan Rakshak Risk Level',
      pendingTasksTitle: 'Actionable Alerts',
      weatherSummaryTitle: 'Weather & Hazard Window',
      editFarmProfile: 'Edit Farm Profile',
      liveFeedActive: 'Live Meteorological Feed Active',
      syntheticFeedActive: 'Synthetic Test Scenario Active',
      customFeedActive: 'Custom Field Scenario',
      scorePrefix: 'Score',
      confPrefix: 'Conf',
      rain24Title: '24h Rainfall Forecast',
      rain72TotalPrefix: '72h total:',
      notSet: 'Not Set',
      windSoilTitle: 'Wind & Soil Moisture',
      topsoilPrefix: 'Topsoil:',
      floodPrefix: 'Flood:',
      completedActionsSuffix: 'completed actions',
      sprayingWindowTitle: '24h Foliar Spraying Window',
      irrigationWindowTitle: 'Irrigation & Drainage Window',
      openFullAiStaff: 'Open Full AI Staff View',
      latestBriefLabel: 'Latest Coordinated Brief',
      toolsExecutedSuffix: 'agent tools executed',
      priorityQueueTitle: 'Priority Actions Queue',
      manageAll: 'Manage all',
      allAlertsDone: 'All current alerts are completed. Run AI Staff or Kisan Rakshak to evaluate new threats.',
      confirmBeforeAction: 'Confirm before action',
      standardStep: 'Standard step',
      scanCropPhotoBtn: 'Scan Crop Photo (AI)',
      trackGpsBtn: 'Use Live GPS',
      gpsTrackingActiveBtn: 'Live GPS On',
      gpsAcquiringBtn: 'Locating GPS...',
      gpsActiveBadge: 'Device GPS Live',
      editPhotoAria: 'Change profile photo',
      tempCardTitle: 'Temperature & Humidity',
      humidityPrefix: 'Humidity:',
      selectLocationLabel: 'Select Location',
      applyLocationBtn: 'Update Location',
      customLocationToggle: 'Custom City / District',
      updatingLocation: 'Updating live data for selected location...',
      customDistrictPlaceholder: 'District / City (e.g. Guntur)',
      customStatePlaceholder: 'State (e.g. Andhra Pradesh)',
      locationPresetPlaceholder: 'Select Farming District / Region...',
    },
    myFarm: {
      subtitle: 'Your farm details tailor every weather assessment, Kisan Rakshak risk score, and crop advisory. No sensitive IDs, Aadhaar, or bank details are collected.',
      quickLocationLabel: 'Quick District Selector (or edit manually below)',
      customLocationOption: 'Custom Location (Enter Below)',
      nameLabel: 'Farmer Name or Nickname',
      langLabel: 'Preferred Language',
      stateLabel: 'State',
      districtLabel: 'District',
      locationLabel: 'Village / Mandal',
      cropsLabel: 'Crop Types (comma-separated)',
      cropsPlaceholder: 'e.g. Paddy (MTU-1010), Black Gram',
      farmSizeLabel: 'Farm Size (Acres)',
      soilTypeLabel: 'Soil Type (if known)',
      growthStageLabel: 'Crop Growth Stage',
      drainageLabel: 'Field Drainage Terrain',
      nearCoastLabel: 'Farm lies within 15 km of coast, river delta, or major canal overflow zone',
      errName: 'Name or nickname is required.',
      errState: 'State is required.',
      errDistrict: 'District is required.',
      errLocation: 'Village / mandal location is required.',
      errCrops: 'Enter at least one crop (e.g. Paddy, Cotton).',
      errSize: 'Enter a realistic farm size between 0.1 and 2000 acres.',
      summaryState: 'State',
      summaryCrops: 'Active Crops',
      summaryArea: 'Farm Area',
      summaryStage: 'Growth Stage',
      summarySoil: 'Soil Profile',
      privacyTitle: 'Privacy & Field Safety',
      privacyDesc: 'Profile data is stored locally in your browser and sent only to the AgriGuard AI server during your active agent query. No Aadhaar, phone number, or financial account details are required.',
      gpsSectionTitle: 'Live Device GPS Location',
      gpsSectionDesc: 'Allow GPS permission to automatically detect your current village, district, state, and keep local live weather synced as you move.',
      allowGpsBtn: 'Allow GPS & Track Live',
      refreshGpsBtn: 'Update GPS Now',
      stopGpsBtn: 'Pause Live GPS',
      gpsAcquiringStatus: 'Requesting device GPS permission and acquiring coordinates...',
      gpsActiveStatus: 'Live device GPS tracking active',
      gpsAccuracyPrefix: 'Accuracy ±',
      gpsPermissionDenied: 'GPS location permission was denied or blocked. Allow location access in your browser settings or enter your district manually below.',
      gpsUnsupported: 'Device GPS geolocation is not supported in this browser.',
      gpsTimeoutErr: 'Unable to get a GPS lock right now. Please try again outdoors or check device location settings.',
      photoSectionTitle: 'Profile Photo',
      uploadPhotoBtn: 'Upload Photo',
      cameraPhotoBtn: 'Take Photo (Camera)',
      removePhotoBtn: 'Reset Photo',
      cameraModalTitle: 'Capture Profile Photo',
      cameraCaptureBtn: 'Capture Snapshot',
      cameraFallbackBtn: 'Choose from Device Instead',
      cameraStarting: 'Starting device camera...',
      cameraDeniedErr: 'Camera access was denied or no camera was detected. You can upload an existing photo from your device.',
    },
    aiStaff: {
      heading: 'Master Orchestrator & AI Staff',
      subheadingPrefix: 'One coordinating agent routes your request to specialised tools using live Gemini function calling, validates conflicts, and builds one unified plan for',
      contextLabel: 'Context:',
      contextModeLabel: 'Context Mode:',
      askPromptLabel: 'Ask your AgriGuard AI Staff',
      queryMinError: 'Please enter a farming question (at least 3 characters).',
      agentReady: 'Ready',
      agentCalled: 'Called',
      orchestratingStatus: 'Master Orchestrator is executing real Gemini tool calls across specialised agents...',
      unifiedPlanLabel: 'Unified Plan',
      syntheticContextSuffix: 'Synthetic Test Context',
      synthesisTitle: 'Master Agent Synthesis',
      conflictCheckTitle: 'Cross-Agent Conflict & Consistency Check',
      uncertaintyTitle: 'Uncertainty & Missing Information Disclosed',
      activityPanelTitle: 'Agent Activity Panel',
      activityPanelSub: 'Verified server-side tool invocations executed during this run.',
      noToolsRequired: 'No external tools were required for this query.',
      taskPrefix: 'Task:',
      toolPrefix: 'Tool:',
      resultPrefix: 'Result:',
      statusCompleted: 'completed',
      statusError: 'error',
      historyTitle: 'Agent Execution History',
      historySub: 'Inspect past multi-agent consultations and generated recommendations.',
      historyEmpty: 'No AI Staff consultations recorded yet. Select a scenario above or type a question to run the Master Orchestrator.',
      toolsCountSuffix: 'tools',
      roster: {
        weather: {
          name: 'Weather Intelligence Agent',
          role: 'Analyses rainfall, wind, and forecast uncertainty without inventing live data.',
        },
        crop: {
          name: 'Crop Intelligence Agent',
          role: 'Evaluates crop type, growth stage, soil, and field symptoms cautiously.',
        },
        kisan_rakshak: {
          name: 'Kisan Rakshak Agent',
          role: 'Scores cyclone, flood, and waterlogging risks into phased before/during/after plans.',
        },
        farm_advisory: {
          name: 'Farm Advisory Agent',
          role: 'Delivers practical crop steps separating general advice from KVK confirmation.',
        },
        voice_language: {
          name: 'Voice and Language Agent',
          role: 'Adapts guidance for Telugu, Hindi, and English with spoken playback.',
        },
        action_alert: {
          name: 'Action and Alert Agent',
          role: 'Prioritises urgent tasks, explains alert reasons, and tracks completion.',
        },
      },
    },
    kisanRakshak: {
      syntheticBanner: 'Synthetic Test Scenario Active — Not a Live Disaster Bulletin',
      customBanner: 'Live / Farmer-Supplied Field Assessment',
      heading: 'Kisan Rakshak Risk Engine',
      subheading: 'Transparent hazard scoring, missing-data disclosure, and phased disaster readiness plans.',
      weatherSourceLabel: 'Weather Source:',
      scenarioPrefix: 'Scenario',
      runAssessment: 'Run Risk Assessment',
      riskCategory: 'Risk Category',
      confidence: 'Assessment Confidence',
      confSuffix: 'conf.',
      missingData: 'Missing Information',
      missingConfNote: 'reduces confidence to',
      beforeEvent: 'Before Event',
      duringEvent: 'During Event',
      afterEvent: 'After Event',
      checklistTitle: 'Emergency Preparation Checklist',
      checklistSubPrefix: 'Track readiness items for',
      checklistSubMid: 'acres of',
      contactsTitle: 'Verified Official Helplines',
      contactsSub: 'Official Government of India & State disaster/agricultural helplines.',
      dispatchAlertBtn: 'Create Urgent Farm Alert',
      customHeading: 'Evaluate Custom Field Conditions',
      customSubPrefix: 'Enter real local forecast values or verified IMD warnings for',
      customSubSuffix: 'Missing fields lower confidence honestly rather than guessing.',
      rain24Input: '24h Rainfall (mm)',
      windInput: 'Wind Speed (km/h)',
      warningInput: 'Verified IMD / SDMA Warning (optional)',
      warningPlaceholder: 'e.g. IMD Orange Alert for heavy rainfall',
      floodStatusInput: 'Local Flood / Waterlogging Status',
      breakdownTitle: 'Transparent Risk Factor Breakdown',
      sourcePrefix: 'Source:',
      phasedPlanTitle: 'Phased Disaster & Crop Protection Plan',
      phasedPlanSub: 'Prioritised actions before, during, and after severe weather events.',
      priorityPrefix: 'Priority:',
      modalTitle: 'Confirm Urgent Farm Alert Creation',
      modalDescTemplate: 'Create a priority alert in Alerts and Reports for {crops} ({district}) based on the current Kisan Rakshak assessment?',
      modalConsequence: 'Consequential farm actions (such as cutting major bunds, early harvesting, or scheduling emergency equipment) must be verified with your local KVK or field conditions before execution.',
      dispatchedNotice: 'Confirmed and logged in Alerts and Reports.',
      alertTitlePrefix: 'Kisan Rakshak Readiness',
    },
    weatherView: {
      agentHeader: 'Weather Intelligence Agent',
      sourcePrefix: 'Source:',
      lastUpdatedPrefix: 'Last updated:',
      fetchLiveBtn: 'Fetch Live District Weather',
      fetchingLiveBtn: 'Fetching Live...',
      useGpsBtn: 'Use GPS',
      runWeatherAgentBtn: 'Run Weather Agent Analysis',
      runningAgentBtn: 'Running Agent...',
      gpsUnsupported: 'Geolocation is not supported in this browser.',
      gpsDenied: 'Location permission denied. Using your saved district in My Farm.',
      rainCardTitle: '24h / 72h Rainfall',
      windCardTitle: 'Wind / Peak Gust',
      tempCardTitle: 'Temperature / RH',
      soilCardTitle: 'Topsoil Moisture (0–7cm)',
      sprayingTitle: 'Foliar Spraying Window',
      irrigationTitle: 'Irrigation & Drainage Advice',
      confirmedObsTitle: 'Confirmed Observation',
      uncertaintyTitle: 'Forecast Uncertainty Disclosure',
      timelineHeading: '72-Hour Rainfall & Wind Timeline',
      colWindow: 'Window',
      colKind: 'Data Kind',
      colRain: 'Rainfall',
      colWind: 'Wind',
      colTemp: 'Temp',
      colHumidity: 'Humidity',
    },
    cropView: {
      agentBadge: 'Crop Intelligence Agent',
      heading: 'Crop Condition & Symptom Assessment',
      subheading: 'Provide crop type, location, growth stage, and any observed symptoms. AgriGuard gives cautious guidance and highlights what must be verified visually by a KVK officer.',
      cropTypeLabel: 'Crop Type',
      cropTypePlaceholder: 'e.g. Paddy (MTU-1010)',
      locationLabel: 'Location (Village / District)',
      growthStageLabel: 'Growth Stage',
      soilMoistureLabel: 'Soil Moisture Condition',
      waterDaysLabel: 'Standing Water Days',
      symptomsLabel: 'Observed Crop Symptoms or Field Conditions',
      symptomsPlaceholder: 'e.g. Yellowing lower leaves, leaning stems near bunds, brown lesions on leaf sheath, or water stagnating for 2 days...',
      errRequired: 'Crop type and location are required before Crop Intelligence can run.',
      errWaterDays: 'Standing water days must be between 0 and 60.',
      runningBtn: 'Running Crop Intelligence...',
      submitBtn: 'Evaluate Crop Risks',
      guideTitle: 'Stage-Specific Vulnerability Guide',
      guideNurseryTitle: 'Nursery / Sowing',
      guideNurseryDesc: 'Seeds and young seedlings risk washout and damping-off under intense rain; raised beds and gentle perimeter drains help.',
      guideFloweringTitle: 'Flowering / Panicle Initiation',
      guideFloweringDesc: 'High winds and heavy rain during pollination can cause sterile spikelets, flower drop, and stem lodging.',
      guideMaturityTitle: 'Maturity / Pre-Harvest',
      guideMaturityDesc: 'Standing water risks grain discoloration and sprouting on the panicle; prioritize drainage and dry storage readiness.',
      guideChemicalTitle: 'Chemical Caution',
      guideChemicalDesc: 'Never apply fungicides or pesticides right before forecast heavy rain, and verify disease diagnosis with KVK (1800-180-1551) first.',
      photoHeading: 'Crop Photo Identification & Health Scanner',
      photoSubheading: 'Upload or capture a clear photo of leaves, stems, or panicles. Gemini Flash / Flash-Lite identifies the crop, detects visible pests/diseases/stress, and scores overall crop health.',
      uploadDropLabel: 'Upload a crop leaf, stem, or field photo',
      uploadHint: 'Supports JPG, PNG, or WebP (auto-compressed cleanly before upload).',
      choosePhotoBtn: 'Choose Photo',
      capturePhotoBtn: 'Use Camera',
      changePhotoBtn: 'Replace Photo',
      removePhotoBtn: 'Remove',
      cropPhotoPreviewAlt: 'Uploaded crop photo for AI health inspection',
      notesLabel: 'Optional Field Note for AI Vision',
      notesPlaceholder: 'e.g. Spotted brown spots on lower leaves after 2 days of rain...',
      modelSelectorLabel: 'Gemini AI Engine',
      modelAuto: 'Gemini Flash + Flash-Lite Auto (Recommended)',
      modelFlash: 'Gemini 4 Flash (Best Vision Accuracy)',
      modelFlashLite: 'Gemini 3.1 Flash-Lite (Fastest)',
      analyzePhotoBtn: 'Identify Crop & Diagnose Health',
      analyzingPhotoBtn: 'Inspecting Crop Photo with Gemini...',
      diagnosisReportTitle: 'Gemini Vision Crop Health Report',
      identifiedCropLabel: 'Identified Crop',
      confidenceLabel: 'ID Confidence',
      estStageLabel: 'Estimated Stage',
      healthScoreLabel: 'Crop Health Score',
      healthSummaryLabel: 'Overall Health Assessment',
      problemsHeading: 'Detected Crop Problems',
      noProblemsFound: 'No obvious disease, pest, or severe stress lesions detected in this photo.',
      visualEvidencePrefix: 'Visual Evidence:',
      safeStepsLabel: 'Immediate Safe Steps:',
      generalStepsTitle: 'Safe Agronomic Field Actions',
      kvkQuestionsTitle: 'Verify with KVK / Agriculture Officer (1800-180-1551)',
      limitationsTitle: 'Photo Limitations & Uncertainty',
      modelUsedPrefix: 'Analyzed by:',
      sendToAiStaffBtn: 'Send Findings to AI Staff (Full Farm Plan)',
      sendingToAiStaffBtn: 'Sending to AI Staff...',
    },
    recommendationsView: {
      heading: 'Farm Advisory & Recommendations',
      subheading: 'Practical field steps separated clearly between General Agronomic Guidance and actions that require local KVK / agronomist confirmation.',
      tabAll: 'All Advice',
      tabGeneral: 'General Guidance',
      tabExpert: 'KVK Confirmation',
      emptyTitle: 'No Recommendations Matching This Filter',
      emptySub: 'Consult your AI Staff to generate tailored field guidance for your current crop and weather context.',
      cropPrefix: 'Crop:',
      reviewed: 'Reviewed',
      markReviewed: 'Mark Reviewed',
      kvkNotice: 'Verify dosage, timing, or major crop intervention with Kisan Call Centre (1800-180-1551) or local KVK before execution.',
    },
    alertsView: {
      heading: 'Action & Alert Queue + Farm Reports',
      subheading: 'Every alert displays the evidence-backed reason behind it. Consequential field tasks require explicit farmer confirmation before marking active.',
      downloadBtn: 'Download Farm Risk Report',
      emptyFilter: 'No alerts in this filter category.',
      statusCompleted: 'Completed',
      statusPending: 'Pending Action',
      farmerConfirmed: 'Farmer confirmed',
      awaitingConfirm: 'Awaiting farmer confirmation',
      reasonPrefix: 'Reason:',
      actionPrefix: 'Action:',
      confirmBtn: 'Confirm Action',
      markDoneBtn: 'Mark Done',
      modalTitle: 'Confirm Consequential Farm Action',
      modalConsequence: 'Always inspect physical field water levels, wind safety, and consult KVK (1800-180-1551) before altering bunds, applying inputs, or harvesting early.',
      modalDescPrefix: 'Are you ready to proceed with',
      modalActionLabel: 'Action:',
    },
    settingsView: {
      subheading: 'Configure language preferences, voice narration behaviour, and inspect AgriGuard AI reliability guardrails.',
      prefLangTitle: 'Preferred Interface & Voice Language',
      prefLangSub: 'Applies to navigation, Master Orchestrator replies, and browser text-to-speech playback.',
      commitmentsTitle: 'Reliability & Safety Commitments',
      commit1Title: 'No Fabricated Weather or Warnings:',
      commit1Body: 'AgriGuard AI never invents live meteorological readings or official disaster alerts. Demo scenarios are explicitly labelled as Synthetic Test Scenarios.',
      commit2Title: 'Observation vs Forecast Distinction:',
      commit2Body: 'Confirmed measurements are clearly separated from forecast models with explicit uncertainty intervals.',
      commit3Title: 'Verified Helplines Only:',
      commit3Body: 'Emergency contacts shown are verified Government of India / NDMA / Kisan Call Centre numbers (112, 1078, 1800-180-1551).',
      commit4Title: 'Human-in-the-Loop Confirmation:',
      commit4Body: 'Consequential interventions require explicit farmer confirmation and local KVK verification.',
      storageTitle: 'Workspace Storage',
      storageSub: 'Your farm profile, checklist progress, alerts, and agent history are saved locally in this browser.',
      resetBtn: 'Reset All Local Farm Data to Live Defaults',
      resetModalTitle: 'Reset Workspace Data?',
      resetModalDesc: 'This will clear your saved farmer profile edits, checklist completions, alerts, and AI Staff execution history, restoring live farm weather defaults.',
      resetModalNote: 'This action only resets browser-local storage and cannot be undone.',
      resetModalConfirm: 'Reset Workspace',
    },
    charts: {
      emptyTimeline: 'No forecast timeline points supplied for this custom configuration.',
      rainfallLegend: 'Rainfall (mm)',
      windLegend: 'Wind Speed (km/h)',
      hoverHint: 'Hover or tap a time window to inspect values',
      timelineAria: 'Rainfall and wind speed timeline chart',
      ptsUnit: 'pts',
    },
    voiceAssistant: {
      topBarToggleOn: 'Voice AI: ON',
      topBarToggleOff: 'Voice AI: OFF',
      topBarToggleAria: 'Toggle Active Voice AI Assistant On or Off',
      panelTitle: 'Active Voice & Doubt Assistant',
      panelSub: 'Select a section or highlight any text on screen, listen to it read aloud, and talk directly with AI using your mic.',
      doubtSelectLabel: 'Content you have a doubt on',
      topicHighlighted: 'Highlighted Text on Screen',
      topicOverview: 'Current Farm Summary',
      topicKisanRakshak: 'Kisan Rakshak Risk & Plan',
      topicWeather: 'Weather & Spraying Advice',
      topicCrop: 'Crop Health & Photo Diagnosis',
      topicRecommendations: 'Farm Recommendations',
      topicAlerts: 'Alerts & Action Queue',
      highlightHint: 'Tip: Drag/select any text on the page to ask AI directly about it.',
      clearHighlightBtn: 'Clear selection',
      readDoubtBtn: 'Read Content Aloud',
      stopReadingBtn: 'Stop Reading',
      micTalkBtn: 'Talk to AI (Mic)',
      micStopBtn: 'Stop Mic & Send',
      micListeningStatus: 'Mic active — speak your doubt now...',
      askInputPlaceholder: 'Speak with mic or type your doubt about the selected content...',
      sendQuestionBtn: 'Ask AI',
      aiThinkingStatus: 'AI Staff is preparing a clear English voice & text reply...',
      speakingReplyBadge: 'Speaking gently in English',
      voiceToneBadge: 'English Voice · Soft & Clear',
      preparingVoiceStatus: 'Preparing soft English voice...',
      speakingDoubtStatus: 'Reading your selected doubt content softly in English...',
      speakingReplyStatus: 'Speaking AI answer softly in English...',
      softVolumeLabel: 'Soft Voice Volume',
      replyHeaderLabel: 'AI Voice Answer (English)',
      replayAnswerBtn: 'Read Reply Aloud',
      ttsUnsupported: 'Spoken audio playback is not available in this browser.',
      settingsVoiceTitle: 'Active Voice Mic & Spoken Doubt Reader',
      settingsVoiceSub: 'Turn ON to keep the Voice & Doubt Assistant bar active with soft spoken responses, or turn OFF to use text-only controls.',
      settingsVoiceOnLabel: 'Voice AI ON',
      settingsVoiceOffLabel: 'Voice AI OFF',
    },
    plains: {
      plainsTitle: 'Live Plains, Terrain & Basin Conditions',
      elevationLabel: 'Elevation',
      reliefLabel: '5 km Slope Relief',
      plainTypeLabel: 'Plain Profile',
      drainageSlopeLabel: 'Runoff Slope',
      rootMoistureLabel: 'Root-Zone Moisture (7–28cm)',
      soilTempLabel: 'Soil Temp',
      et0Label: 'Crop Water Loss (ET₀)',
      pressureLabel: 'Surface Pressure',
      rainProbLabel: '24h Rain Probability',
      riverFlowLabel: 'GloFAS River Basin Flow',
      unavailable: 'Unavailable',
      elevUnit: 'm',
      flowUnit: 'm³/s',
      pressureUnit: 'hPa',
      et0Unit: 'mm/day',
    },
  },
  hi: {
    brandName: 'एग्रीगार्ड एआई',
    subBrandName: 'रैतु सुरक्षा',
    tagline: 'हर किसान को अपनी एआई टीम का हक है।',
    languageLabel: 'भाषा',
    syntheticWarningPrefix: 'सिंथेटिक परीक्षण परिदृश्य',
    liveDataLabel: 'लाइव मौसम डेटा',
    customContextLabel: 'कस्टम खेत स्थिति',
    nav: {
      overview: 'अवलोकन',
      'my-farm': 'मेरा खेत',
      'ai-staff': 'एआई स्टाफ',
      'kisan-rakshak': 'किसान-रक्षक',
      weather: 'मौसम बुद्धिमत्ता',
      crop: 'फसल बुद्धिमत्ता',
      recommendations: 'सिफारिशें',
      alerts: 'अलर्ट और रिपोर्ट',
      settings: 'सेटिंग्स',
    },
    common: {
      saveProfile: 'खेत प्रोफ़ाइल सहेजें',
      saved: 'सहेजा गया',
      runOrchestrator: 'एआई स्टाफ से पूछें',
      runningAgents: 'एजेंट समन्वय जारी...',
      pending: 'लंबित',
      completed: 'पूर्ण',
      confirmAction: 'पुष्टि करें और आगे बढ़ें',
      cancel: 'रद्द करें',
      listenSummary: 'सुनें',
      stopVoice: 'आवाज़ रोकें',
      speakQuery: 'आवाज़ से पूछें',
      stopListening: 'सुन रहे हैं...',
      loadScenario: 'परीक्षण परिदृश्य लोड करें',
      clearHistory: 'इतिहास साफ़ करें',
      liveFarmWeatherBtn: 'लाइव खेत मौसम',
      syncLiveWeatherBtn: 'लाइव मौसम अपडेट करें',
      syncingLiveBtn: 'लाइव लोड हो रहा है...',
      acresUnit: 'एकड़',
      all: 'सभी',
      openMenuAria: 'नेविगेशन मेनू खोलें',
      closeMenuAria: 'नेविगेशन मेनू बंद करें',
      closeModalAria: 'पुष्टि संवाद बंद करें',
      reloadHomeAria: 'रीलोड करें और रैतु सुरक्षा के प्रारंभिक पृष्ठ पर जाएँ',
      topNavAria: 'शीर्ष अनुभाग नेविगेशन पट्टी',
      voiceUnsupported: 'इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है; कृपया अपना प्रश्न टाइप करें।',
      voiceMicDenied: 'माइक्रोफ़ोन उपलब्ध नहीं है या अनुमति नहीं है। कृपया सीधे प्रश्न लिखें।',
    },
    overview: {
      heading: 'खेत संचालन केंद्र',
      subheading: 'आपके खेत के लिए समन्वित एआई सुरक्षा, मौसम स्पष्टता और फसल तैयारी।',
      askTeamTitle: 'मास्टर ऑर्केस्ट्रेटर से पूछें',
      askTeamSubheading: 'मास्टर एजेंट आपके प्रश्न को समझकर संबंधित विशेषज्ञ एजेंटों के टूल चलाता है, टकराव जांचता है और एक स्पष्ट कार्य योजना देता है।',
      askPlaceholder: 'बारिश का असर, धान की सुरक्षा, जल निकासी या फसल के लक्षणों के बारे में पूछें...',
      askLabelAria: 'मास्टर ऑर्केस्ट्रेटर एजेंट से पूछें',
      queryMinError: 'कृपया अपना प्रश्न या खेत की स्थिति लिखें (कम से कम 3 अक्षर)।',
      readinessTitle: 'किसान रक्षक जोखिम स्तर',
      pendingTasksTitle: 'कार्रवाई योग्य अलर्ट',
      weatherSummaryTitle: 'मौसम और जोखिम स्थिति',
      editFarmProfile: 'खेत प्रोफ़ाइल बदलें',
      liveFeedActive: 'लाइव मौसम फ़ीड सक्रिय',
      syntheticFeedActive: 'सिंथेटिक परीक्षण परिदृश्य सक्रिय',
      customFeedActive: 'कस्टम खेत परिदृश्य',
      scorePrefix: 'स्कोर',
      confPrefix: 'विश्वास',
      rain24Title: '24 घंटे वर्षा पूर्वानुमान',
      rain72TotalPrefix: '72 घंटे कुल:',
      notSet: 'सेट नहीं',
      windSoilTitle: 'हवा और मिट्टी की नमी',
      topsoilPrefix: 'ऊपरी मिट्टी नमी:',
      floodPrefix: 'बाढ़ स्थिति:',
      completedActionsSuffix: 'पूर्ण कार्य',
      sprayingWindowTitle: '24 घंटे पत्तियों पर छिड़काव विंडो',
      irrigationWindowTitle: 'सिंचाई और जल निकासी सलाह',
      openFullAiStaff: 'पूरा एआई स्टाफ देखें',
      latestBriefLabel: 'ताज़ा समन्वित सारांश',
      toolsExecutedSuffix: 'एजेंट टूल चलाए गए',
      priorityQueueTitle: 'प्राथमिकता कार्य सूची',
      manageAll: 'सभी देखें',
      allAlertsDone: 'सभी वर्तमान अलर्ट पूर्ण हो चुके हैं। नए जोखिम जांचने के लिए एआई स्टाफ या किसान रक्षक चलाएं।',
      confirmBeforeAction: 'कार्रवाई से पहले पुष्टि करें',
      standardStep: 'सामान्य कदम',
      scanCropPhotoBtn: 'फसल फोटो जांचें (एआई)',
      trackGpsBtn: 'लाइव जीपीएस चलाएँ',
      gpsTrackingActiveBtn: 'लाइव जीपीएस चालू',
      gpsAcquiringBtn: 'जीपीएस लोकेशन खोज रहे हैं...',
      gpsActiveBadge: 'लाइव डिवाइस जीपीएस',
      editPhotoAria: 'प्रोफ़ाइल फोटो बदलें',
      tempCardTitle: 'तापमान और नमी',
      humidityPrefix: 'नमी:',
      selectLocationLabel: 'स्थान चुनें',
      applyLocationBtn: 'स्थान बदलें',
      customLocationToggle: 'अन्य शहर / जिला लिखें',
      updatingLocation: 'चुने गए स्थान का लाइव डेटा अपडेट हो रहा है...',
      customDistrictPlaceholder: 'जिला / शहर (जैसे गुंटूर)',
      customStatePlaceholder: 'राज्य (जैसे आंध्र प्रदेश)',
      locationPresetPlaceholder: 'कृषि जिला / क्षेत्र चुनें...',
    },
    myFarm: {
      subtitle: 'आपके खेत की जानकारी के आधार पर हर मौसम मूल्यांकन, किसान रक्षक जोखिम स्कोर और फसल सलाह तैयार होती है। कोई आधार, फ़ोन या बैंक विवरण नहीं माँगा जाता।',
      quickLocationLabel: 'त्वरित जिला चयन (या नीचे स्वयं लिखें)',
      customLocationOption: 'अन्य स्थान (नीचे दर्ज करें)',
      nameLabel: 'किसान का नाम या उपनाम',
      langLabel: 'पसंदीदा भाषा',
      stateLabel: 'राज्य',
      districtLabel: 'जिला',
      locationLabel: 'गाँव / मंडल',
      cropsLabel: 'फसल के प्रकार (कॉमा से अलग करें)',
      cropsPlaceholder: 'उदा. धान (एमटीयू-1010), उड़द',
      farmSizeLabel: 'खेत का आकार (एकड़)',
      soilTypeLabel: 'मिट्टी का प्रकार (यदि ज्ञात हो)',
      growthStageLabel: 'फसल वृद्धि चरण',
      drainageLabel: 'खेत की जल निकासी ढलान',
      nearCoastLabel: 'खेत समुद्र तट, नदी डेल्टा या बड़ी नहर ओवरफ्लो क्षेत्र के 15 किमी के भीतर है',
      errName: 'नाम या उपनाम आवश्यक है।',
      errState: 'राज्य आवश्यक है।',
      errDistrict: 'जिला आवश्यक है।',
      errLocation: 'गाँव / मंडल का नाम आवश्यक है।',
      errCrops: 'कम से कम एक फसल दर्ज करें (जैसे धान, कपास)।',
      errSize: '0.1 से 2000 एकड़ के बीच सही खेत आकार दर्ज करें।',
      summaryState: 'राज्य',
      summaryCrops: 'सक्रिय फसलें',
      summaryArea: 'खेत क्षेत्रफल',
      summaryStage: 'विकास चरण',
      summarySoil: 'मिट्टी प्रकार',
      privacyTitle: 'गोपनीयता और खेत सुरक्षा',
      privacyDesc: 'आपका प्रोफ़ाइल डेटा केवल आपके ब्राउज़र में सहेजा जाता है और सक्रिय प्रश्न के समय ही एग्रीगार्ड एआई सर्वर को भेजा जाता है। आधार या बैंक विवरण आवश्यक नहीं हैं।',
      gpsSectionTitle: 'लाइव डिवाइस जीपीएस लोकेशन',
      gpsSectionDesc: 'जीपीएस अनुमति दें ताकि आपका वर्तमान गाँव, जिला, राज्य स्वतः पहचान हो सके और चलते समय लाइव मौसम जुड़ा रहे।',
      allowGpsBtn: 'जीपीएस अनुमति दें और लाइव ट्रैक करें',
      refreshGpsBtn: 'अभी जीपीएस अपडेट करें',
      stopGpsBtn: 'लाइव जीपीएस रोकें',
      gpsAcquiringStatus: 'डिवाइस से जीपीएस अनुमति और सटीक निर्देशांक प्राप्त किए जा रहे हैं...',
      gpsActiveStatus: 'लाइव डिवाइस जीपीएस ट्रैकिंग सक्रिय है',
      gpsAccuracyPrefix: 'सटीकता ±',
      gpsPermissionDenied: 'जीपीएस लोकेशन की अनुमति अस्वीकृत या अवरुद्ध है। ब्राउज़र सेटिंग्स में लोकेशन चालू करें या नीचे स्वयं जिला दर्ज करें।',
      gpsUnsupported: 'इस ब्राउज़र में डिवाइस जीपीएस समर्थित नहीं है।',
      gpsTimeoutErr: 'अभी जीपीएस सिग्नल नहीं मिल सका। कृपया खुले स्थान में पुनः प्रयास करें या लोकेशन सेटिंग जांचें।',
      photoSectionTitle: 'प्रोफ़ाइल फोटो',
      uploadPhotoBtn: 'फोटो अपलोड करें',
      cameraPhotoBtn: 'कैमरा से खींचें',
      removePhotoBtn: 'फ़ोटो हटाएँ',
      cameraModalTitle: 'प्रोफ़ाइल फोटो खींचें',
      cameraCaptureBtn: 'फ़ोटो कैप्चर करें',
      cameraFallbackBtn: 'डिवाइस से फोटो चुनें',
      cameraStarting: 'डिवाइस कैमरा शुरू हो रहा है...',
      cameraDeniedErr: 'कैमरा की अनुमति अस्वीकृत है या कैमरा उपलब्ध नहीं है। आप डिवाइस से मौजूद फोटो अपलोड कर सकते हैं।',
    },
    aiStaff: {
      heading: 'मास्टर ऑर्केस्ट्रेटर और एआई स्टाफ',
      subheadingPrefix: 'एक केंद्रीय एजेंट लाइव जेमिनी फ़ंक्शन कॉलिंग द्वारा आपके प्रश्न को विशेषज्ञ टूल्स तक भेजता है, विरोधाभास जांचता है और एक संयुक्त योजना बनाता है:',
      contextLabel: 'संदर्भ:',
      contextModeLabel: 'संदर्भ मोड:',
      askPromptLabel: 'अपने एग्रीगार्ड एआई स्टाफ से पूछें',
      queryMinError: 'कृपया कम से कम 3 अक्षरों का कृषि प्रश्न लिखें।',
      agentReady: 'तैयार',
      agentCalled: 'सक्रिय',
      orchestratingStatus: 'मास्टर ऑर्केस्ट्रेटर विशेषज्ञ एजेंटों के लिए वास्तविक जेमिनी टूल कॉल चला रहा है...',
      unifiedPlanLabel: 'संयुक्त योजना',
      syntheticContextSuffix: 'सिंथेटिक परीक्षण संदर्भ',
      synthesisTitle: 'मास्टर एजेंट अंतिम सारांश',
      conflictCheckTitle: 'एजेंट-स्तरीय विरोधाभास एवं संगति जांच',
      uncertaintyTitle: 'अनिश्चितता और अनुपलब्ध जानकारी का विवरण',
      activityPanelTitle: 'एजेंट गतिविधि पैनल',
      activityPanelSub: 'इस सत्र में सर्वर पर चलाए गए सत्यापित टूल कॉल।',
      noToolsRequired: 'इस प्रश्न के लिए किसी बाहरी टूल की आवश्यकता नहीं थी।',
      taskPrefix: 'कार्य:',
      toolPrefix: 'टूल:',
      resultPrefix: 'परिणाम:',
      statusCompleted: 'पूर्ण',
      statusError: 'त्रुटि',
      historyTitle: 'एजेंट निष्पादन इतिहास',
      historySub: 'पिछले बहु-एजेंट परामर्श और सुझाव देखें।',
      historyEmpty: 'अभी कोई एआई स्टाफ परामर्श दर्ज नहीं है। ऊपर कोई परिदृश्य चुनें या प्रश्न पूछकर मास्टर ऑर्केस्ट्रेटर चलाएं।',
      toolsCountSuffix: 'टूल्स',
      roster: {
        weather: {
          name: 'मौसम बुद्धिमत्ता एजेंट',
          role: 'नकली डेटा बनाए बिना वर्षा, हवा और पूर्वानुमान अनिश्चितता का विश्लेषण करता है।',
        },
        crop: {
          name: 'फसल बुद्धिमत्ता एजेंट',
          role: 'फसल प्रकार, विकास चरण, मिट्टी और खेत के लक्षणों का सावधानीपूर्वक मूल्यांकन करता है।',
        },
        kisan_rakshak: {
          name: 'किसान रक्षक एजेंट',
          role: 'चक्रवात, बाढ़ और जलभराव जोखिम को आंककर घटना से पहले/दौरान/बाद की योजना बनाता है।',
        },
        farm_advisory: {
          name: 'कृषि सलाहकार एजेंट',
          role: 'सामान्य सलाह और केवीके विशेषज्ञ पुष्टि को अलग रखते हुए व्यावहारिक कदम बताता है।',
        },
        voice_language: {
          name: 'आवाज़ और भाषा एजेंट',
          role: 'तेलुगु, हिंदी और अंग्रेज़ी में सरल भाषा और आवाज़ प्लेबैक तैयार करता है।',
        },
        action_alert: {
          name: 'कार्रवाई और अलर्ट एजेंट',
          role: 'जरूरी अलर्ट को प्राथमिकता देता है, कारण बताता है और कार्य प्रगति ट्रैक करता है।',
        },
      },
    },
    kisanRakshak: {
      syntheticBanner: 'सिंथेटिक परीक्षण परिदृश्य सक्रिय — यह वास्तविक सरकारी आपदा चेतावनी नहीं है',
      customBanner: 'लाइव / किसान द्वारा दर्ज खेत मूल्यांकन',
      heading: 'किसान रक्षक जोखिम इंजन',
      subheading: 'पारदर्शी जोखिम मूल्यांकन, अधूरे डेटा की जानकारी और चरणबद्ध सुरक्षा योजना।',
      weatherSourceLabel: 'मौसम स्रोत:',
      scenarioPrefix: 'परिदृश्य',
      runAssessment: 'जोखिम मूल्यांकन चलाएँ',
      riskCategory: 'जोखिम श्रेणी',
      confidence: 'मूल्यांकन विश्वास',
      confSuffix: 'विश्वास',
      missingData: 'अनुपलब्ध जानकारी',
      missingConfNote: 'से विश्वास स्तर घटकर हुआ:',
      beforeEvent: 'आपदा से पहले',
      duringEvent: 'आपदा के दौरान',
      afterEvent: 'आपदा के बाद',
      checklistTitle: 'आपातकालीन तैयारी सूची',
      checklistSubPrefix: 'तैयारी जांचें:',
      checklistSubMid: 'एकड़',
      contactsTitle: 'सत्यापित आधिकारिक हेल्पलाइन',
      contactsSub: 'भारत सरकार और राज्य की आधिकारिक आपदा एवं कृषि हेल्पलाइन।',
      dispatchAlertBtn: 'तत्काल खेत अलर्ट बनाएँ',
      customHeading: 'कस्टम खेत स्थितियों का मूल्यांकन करें',
      customSubPrefix: 'वास्तविक स्थानीय पूर्वानुमान या सत्यापित आईएमडी चेतावनी दर्ज करें:',
      customSubSuffix: 'अधूरी जानकारी पर अनुमान लगाने के बजाय विश्वास स्तर ईमानदारी से कम दिखाया जाता है।',
      rain24Input: '24 घंटे वर्षा (मिमी)',
      windInput: 'हवा की गति (किमी/घंटा)',
      warningInput: 'सत्यापित आईएमडी / एसडीएमए चेतावनी (वैकल्पिक)',
      warningPlaceholder: 'उदा. भारी बारिश के लिए आईएमडी ऑरेंज अलर्ट',
      floodStatusInput: 'स्थानीय बाढ़ / जलभराव स्थिति',
      breakdownTitle: 'पारदर्शी जोखिम कारक विवरण',
      sourcePrefix: 'स्रोत:',
      phasedPlanTitle: 'चरणबद्ध आपदा एवं फसल सुरक्षा योजना',
      phasedPlanSub: 'गंभीर मौसम से पहले, दौरान और बाद की प्राथमिकता कार्रवाई।',
      priorityPrefix: 'प्राथमिकता:',
      modalTitle: 'तत्काल खेत अलर्ट बनाने की पुष्टि करें',
      modalDescTemplate: 'मौजूदा किसान रक्षक मूल्यांकन के आधार पर {crops} ({district}) के लिए अलर्ट और रिपोर्ट में प्राथमिकता अलर्ट जोड़ें?',
      modalConsequence: 'बड़ी मेड़ काटने, समय से पहले कटाई या आपातकालीन उपकरण चलाने से पहले स्थानीय केवीके या खेत की वास्तविक स्थिति की पुष्टि अवश्य करें।',
      dispatchedNotice: 'पुष्टि हो गई और अलर्ट व रिपोर्ट में दर्ज किया गया।',
      alertTitlePrefix: 'किसान रक्षक तैयारी',
    },
    weatherView: {
      agentHeader: 'मौसम बुद्धिमत्ता एजेंट',
      sourcePrefix: 'स्रोत:',
      lastUpdatedPrefix: 'अंतिम अपडेट:',
      fetchLiveBtn: 'जिला लाइव मौसम लाएँ',
      fetchingLiveBtn: 'लाइव लोड हो रहा है...',
      useGpsBtn: 'जीपीएस उपयोग करें',
      runWeatherAgentBtn: 'मौसम एजेंट विश्लेषण चलाएँ',
      runningAgentBtn: 'एजेंट चल रहा है...',
      gpsUnsupported: 'इस ब्राउज़र में लोकेशन (जीपीएस) समर्थित नहीं है।',
      gpsDenied: 'लोकेशन अनुमति अस्वीकृत। "मेरा खेत" में सहेजे गए जिले का उपयोग हो रहा है।',
      rainCardTitle: '24 / 72 घंटे वर्षा',
      windCardTitle: 'हवा / अधिकतम झोंका',
      tempCardTitle: 'तापमान / नमी',
      soilCardTitle: 'ऊपरी मिट्टी नमी (0–7 सेमी)',
      sprayingTitle: 'पत्तियों पर छिड़काव विंडो',
      irrigationTitle: 'सिंचाई और जल निकासी सलाह',
      confirmedObsTitle: 'पुष्ट अवलोकन',
      uncertaintyTitle: 'पूर्वानुमान अनिश्चितता विवरण',
      timelineHeading: '72 घंटे वर्षा एवं हवा समय-सारणी',
      colWindow: 'समय अवधि',
      colKind: 'डेटा प्रकार',
      colRain: 'वर्षा',
      colWind: 'हवा',
      colTemp: 'तापमान',
      colHumidity: 'नमी',
    },
    cropView: {
      agentBadge: 'फसल बुद्धिमत्ता एजेंट',
      heading: 'फसल स्थिति एवं लक्षण मूल्यांकन',
      subheading: 'फसल प्रकार, स्थान, विकास चरण और देखे गए लक्षण दर्ज करें। एग्रीगार्ड सतर्क सलाह देता है और बताता है कि केवीके अधिकारी से क्या जांच करानी चाहिए।',
      cropTypeLabel: 'फसल का प्रकार',
      cropTypePlaceholder: 'उदा. धान (एमटीयू-1010)',
      locationLabel: 'स्थान (गाँव / जिला)',
      growthStageLabel: 'विकास चरण',
      soilMoistureLabel: 'मिट्टी की नमी स्थिति',
      waterDaysLabel: 'खड़ा पानी (दिन)',
      symptomsLabel: 'फसल के लक्षण या खेत की स्थिति',
      symptomsPlaceholder: 'उदा. निचली पत्तियाँ पीली पड़ना, मेड़ के पास पौधे झुकना, पत्ती पर भूरे धब्बे, या 2 दिन से पानी भरा होना...',
      errRequired: 'फसल बुद्धिमत्ता चलाने के लिए फसल प्रकार और स्थान आवश्यक हैं।',
      errWaterDays: 'खड़े पानी के दिन 0 से 60 के बीच होने चाहिए।',
      runningBtn: 'फसल बुद्धिमत्ता चल रही है...',
      submitBtn: 'फसल जोखिम जांचें',
      guideTitle: 'अवस्था-आधारित संवेदनशीलता गाइड',
      guideNurseryTitle: 'नर्सरी / बुवाई',
      guideNurseryDesc: 'तेज बारिश में बीज और नन्हे पौधे बहने या गलने का खतरा रहता है; उठी हुई क्यारियाँ और नालियाँ मददगार हैं।',
      guideFloweringTitle: 'फूल आना / बाली निकलना',
      guideFloweringDesc: 'परागण के समय तेज हवा और भारी बारिश से दाने खाली रह सकते हैं या फसल गिर सकती है।',
      guideMaturityTitle: 'पकना / कटाई से पहले',
      guideMaturityDesc: 'खड़े पानी से दाने बदरंग होने और बाली पर ही अंकुरण का खतरा रहता है; जल निकासी व सूखे भंडारण को प्राथमिकता दें।',
      guideChemicalTitle: 'रसायन सावधानी',
      guideChemicalDesc: 'भारी बारिश के अनुमान से ठीक पहले दवा का छिड़काव न करें और पहले केवीके (1800-180-1551) से रोग की पुष्टि करें।',
      photoHeading: 'फसल फोटो पहचान और स्वास्थ्य स्कैनर',
      photoSubheading: 'पत्तियों, तने या बाली की साफ़ फोटो अपलोड करें या खींचें। जेमिनी फ्लैश / फ्लैश-लाइट फसल की पहचान कर रोग, कीट, तनाव और कुल स्वास्थ्य स्कोर बताता है।',
      uploadDropLabel: 'फसल की पत्ती, तने या खेत की फोटो अपलोड करें',
      uploadHint: 'जेपीजी, पीएनजी या वेबपी समर्थित (अपलोड से पहले स्वतः आकार अनुकूलित)।',
      choosePhotoBtn: 'फोटो चुनें',
      capturePhotoBtn: 'कैमरा उपयोग करें',
      changePhotoBtn: 'फोटो बदलें',
      removePhotoBtn: 'हटाएँ',
      cropPhotoPreviewAlt: 'एआई स्वास्थ्य जांच के लिए अपलोड की गई फसल फोटो',
      notesLabel: 'एआई विज़न के लिए वैकल्पिक टिप्पणी',
      notesPlaceholder: 'उदा. 2 दिन की बारिश के बाद निचली पत्तियों पर भूरे धब्बे दिखे...',
      modelSelectorLabel: 'जेमिनी एआई इंजन',
      modelAuto: 'जेमिनी फ्लैश + फ्लैश-लाइट ऑटो (अनुशंसित)',
      modelFlash: 'जेमिनी 4 फ्लैश (सर्वोत्तम सटीकता)',
      modelFlashLite: 'जेमिनी 3.1 फ्लैश-लाइट (सबसे तेज़)',
      analyzePhotoBtn: 'फसल पहचानें और स्वास्थ्य जांचें',
      analyzingPhotoBtn: 'जेमिनी द्वारा फोटो की जांच जारी...',
      diagnosisReportTitle: 'जेमिनी विज़न फसल स्वास्थ्य रिपोर्ट',
      identifiedCropLabel: 'पहचानी गई फसल',
      confidenceLabel: 'पहचान विश्वास',
      estStageLabel: 'अनुमानित अवस्था',
      healthScoreLabel: 'फसल स्वास्थ्य स्कोर',
      healthSummaryLabel: 'समग्र स्वास्थ्य मूल्यांकन',
      problemsHeading: 'पहचानी गई फसल समस्याएं',
      noProblemsFound: 'इस फोटो में कोई स्पष्ट रोग, कीट या गंभीर तनाव लक्षण नहीं दिखे।',
      visualEvidencePrefix: 'फोटो में प्रमाण:',
      safeStepsLabel: 'तत्काल सुरक्षित कदम:',
      generalStepsTitle: 'सुरक्षित कृषि खेत कदम',
      kvkQuestionsTitle: 'केवीके / कृषि अधिकारी से पुष्टि करें (1800-180-1551)',
      limitationsTitle: 'फोटो की सीमाएं और अनिश्चितता',
      modelUsedPrefix: 'विश्लेषण मॉडल:',
      sendToAiStaffBtn: 'परिणाम एआई स्टाफ को भेजें (पूर्ण योजना)',
      sendingToAiStaffBtn: 'एआई स्टाफ को भेजा जा रहा है...',
    },
    recommendationsView: {
      heading: 'कृषि सलाह और सिफारिशें',
      subheading: 'सामान्य कृषि मार्गदर्शन और स्थानीय केवीके / कृषि वैज्ञानिक पुष्टि की आवश्यकता वाले कदम स्पष्ट रूप से अलग दिखाए गए हैं।',
      tabAll: 'सभी सलाह',
      tabGeneral: 'सामान्य मार्गदर्शन',
      tabExpert: 'केवीके पुष्टि आवश्यक',
      emptyTitle: 'इस फ़िल्टर में कोई सिफारिश नहीं',
      emptySub: 'अपनी फसल और मौसम के अनुसार सलाह पाने के लिए एआई स्टाफ से पूछें।',
      cropPrefix: 'फसल:',
      reviewed: 'समीक्षित',
      markReviewed: 'समीक्षित चिह्नित करें',
      kvkNotice: 'खुराक, समय या बड़ी कार्रवाई से पहले किसान कॉल सेंटर (1800-180-1551) या स्थानीय केवीके से पुष्टि अवश्य करें।',
    },
    alertsView: {
      heading: 'कार्रवाई एवं अलर्ट सूची + खेत रिपोर्ट',
      subheading: 'प्रत्येक अलर्ट के पीछे का कारण स्पष्ट दिखाया गया है। महत्वपूर्ण खेत कार्यों को सक्रिय करने से पहले किसान की पुष्टि आवश्यक है।',
      downloadBtn: 'खेत जोखिम रिपोर्ट डाउनलोड करें',
      emptyFilter: 'इस श्रेणी में कोई अलर्ट नहीं है।',
      statusCompleted: 'पूर्ण',
      statusPending: 'लंबित कार्रवाई',
      farmerConfirmed: 'किसान द्वारा पुष्ट',
      awaitingConfirm: 'किसान पुष्टि की प्रतीक्षा',
      reasonPrefix: 'कारण:',
      actionPrefix: 'कार्रवाई:',
      confirmBtn: 'पुष्टि करें',
      markDoneBtn: 'पूर्ण चिह्नित करें',
      modalTitle: 'महत्वपूर्ण कृषि कार्रवाई की पुष्टि करें',
      modalConsequence: 'मेड़ बदलने, दवा डालने या जल्दी कटाई से पहले खेत में पानी का स्तर जांचें और केवीके (1800-180-1551) से सलाह लें।',
      modalDescPrefix: 'क्या आप इस कार्रवाई के लिए आगे बढ़ने को तैयार हैं:',
      modalActionLabel: 'आवश्यक कदम:',
    },
    settingsView: {
      subheading: 'भाषा प्राथमिकताएं, आवाज़ सुविधा और एग्रीगार्ड एआई विश्वसनीयता नियम देखें।',
      prefLangTitle: 'पसंदीदा इंटरफ़ेस और आवाज़ भाषा',
      prefLangSub: 'यह नेविगेशन, सभी स्क्रीन, मास्टर ऑर्केस्ट्रेटर उत्तर और टेक्स्ट-टू-स्पीच आवाज़ पर लागू होता है।',
      commitmentsTitle: 'विश्वसनीयता और सुरक्षा प्रतिबद्धताएँ',
      commit1Title: 'कोई नकली मौसम या चेतावनी नहीं:',
      commit1Body: 'एग्रीगार्ड एआई कभी भी काल्पनिक लाइव मौसम आंकड़े या सरकारी आपदा चेतावनी नहीं बनाता। डेमो परिदृश्य स्पष्ट रूप से सिंथेटिक परीक्षण के रूप में चिह्नित हैं।',
      commit2Title: 'अवलोकन बनाम पूर्वानुमान अंतर:',
      commit2Body: 'पुष्ट मापों को अनिश्चितता के साथ पूर्वानुमान मॉडल से स्पष्ट रूप से अलग रखा जाता है।',
      commit3Title: 'केवल सत्यापित हेल्पलाइन:',
      commit3Body: 'दिखाए गए नंबर आधिकारिक भारत सरकार / एनडीएमए / किसान कॉल सेंटर हेल्पलाइन (112, 1078, 1800-180-1551) हैं।',
      commit4Title: 'मानव-पुष्टि सुरक्षा:',
      commit4Body: 'महत्वपूर्ण खेत कार्यों से पहले किसान की स्पष्ट पुष्टि और केवीके सलाह आवश्यक है।',
      storageTitle: 'वर्कस्पेस स्टोरेज',
      storageSub: 'आपकी खेत प्रोफ़ाइल, चेकलिस्ट प्रगति, अलर्ट और एजेंट इतिहास इसी ब्राउज़र में सहेजे जाते हैं।',
      resetBtn: 'सभी स्थानीय डेटा को लाइव डिफ़ॉल्ट पर रीसेट करें',
      resetModalTitle: 'वर्कस्पेस डेटा रीसेट करें?',
      resetModalDesc: 'इससे आपके सहेजे गए खेत विवरण, चेकलिस्ट, अलर्ट और एआई स्टाफ इतिहास मिट जाएंगे और लाइव खेत मौसम डिफ़ॉल्ट लौट आएगा।',
      resetModalNote: 'यह केवल ब्राउज़र के स्थानीय स्टोरेज को रीसेट करता है और वापस नहीं लिया जा सकता।',
      resetModalConfirm: 'वर्कस्पेस रीसेट करें',
    },
    charts: {
      emptyTimeline: 'इस कस्टम कॉन्फ़िगरेशन के लिए कोई समय-सारणी बिंदु उपलब्ध नहीं हैं।',
      rainfallLegend: 'वर्षा (मिमी)',
      windLegend: 'हवा की गति (किमी/घंटा)',
      hoverHint: 'मान देखने के लिए समय विंडो पर कर्सर ले जाएँ या टैप करें',
      timelineAria: 'वर्षा और हवा की गति समय चार्ट',
      ptsUnit: 'अंक',
    },
    voiceAssistant: {
      topBarToggleOn: 'वॉइस एआई: चालू',
      topBarToggleOff: 'वॉइस एआई: बंद',
      topBarToggleAria: 'सक्रिय वॉइस एआई सहायक को चालू या बंद करें',
      panelTitle: 'सक्रिय वॉइस और संदेह सहायक',
      panelSub: 'स्क्रीन का कोई भी हिस्सा चुनें या टेक्स्ट हाइलाइट करें, उसे सुनें और माइक से सीधे एआई से सवाल पूछें।',
      doubtSelectLabel: 'किस विषय / सामग्री पर संदेह है',
      topicHighlighted: 'स्क्रीन पर चुना गया पाठ',
      topicOverview: 'वर्तमान खेत सारांश',
      topicKisanRakshak: 'किसान रक्षक जोखिम एवं योजना',
      topicWeather: 'मौसम एवं छिड़काव सलाह',
      topicCrop: 'फसल स्वास्थ्य एवं फोटो निदान',
      topicRecommendations: 'कृषि सिफारिशें',
      topicAlerts: 'अलर्ट एवं कार्य सूची',
      highlightHint: 'सुझाव: पृष्ठ पर किसी भी हिस्से को चुनकर (हाइलाइट करके) सीधे उस पर प्रश्न पूछें।',
      clearHighlightBtn: 'चयन साफ़ करें',
      readDoubtBtn: 'चुनी सामग्री सुनें',
      stopReadingBtn: 'पढ़ना रोकें',
      micTalkBtn: 'एआई से बोलकर पूछें (माइक)',
      micStopBtn: 'माइक रोकें और भेजें',
      micListeningStatus: 'माइक सक्रिय है — अब अपना संदेह बोलें...',
      askInputPlaceholder: 'माइक से बोलें या चुनी सामग्री के बारे में अपना संदेह लिखें...',
      sendQuestionBtn: 'एआई से पूछें',
      aiThinkingStatus: 'एआई स्टाफ आपके संदेह का स्पष्ट हिन्दी वॉइस और टेक्स्ट उत्तर तैयार कर रहा है...',
      speakingReplyBadge: 'हिन्दी में सौम्य आवाज़ में बोल रहा है',
      voiceToneBadge: 'हिन्दी आवाज़ · सौम्य और स्पष्ट',
      preparingVoiceStatus: 'सौम्य हिन्दी आवाज़ तैयार हो रही है...',
      speakingDoubtStatus: 'चुनी गई सामग्री हिन्दी में सौम्य स्वर में पढ़ी जा रही है...',
      speakingReplyStatus: 'एआई उत्तर हिन्दी में सौम्य आवाज़ में सुनाया जा रहा है...',
      softVolumeLabel: 'आवाज़ की सौम्यता (वॉल्यूम)',
      replyHeaderLabel: 'एआई वॉइस उत्तर (हिन्दी)',
      replayAnswerBtn: 'उत्तर फिर सुनें',
      ttsUnsupported: 'इस ब्राउज़र में बोलकर सुनाने की सुविधा उपलब्ध नहीं है।',
      settingsVoiceTitle: 'सक्रिय वॉइस माइक और संदेह वाचन मोड',
      settingsVoiceSub: 'माइक से बातचीत और सौम्य बोलकर उत्तर सुनने के लिए चालू करें, या केवल टेक्स्ट के लिए बंद करें।',
      settingsVoiceOnLabel: 'वॉइस एआई चालू',
      settingsVoiceOffLabel: 'वॉइस एआई बंद',
    },
    plains: {
      plainsTitle: 'लाइव मैदान, भू-आकृति और नदी बेसिन स्थिति',
      elevationLabel: 'ऊँचाई',
      reliefLabel: '5 किमी ढलान अंतर',
      plainTypeLabel: 'मैदान प्रकार',
      drainageSlopeLabel: 'जल निकासी ढलान',
      rootMoistureLabel: 'जड़ क्षेत्र नमी (7–28 सेमी)',
      soilTempLabel: 'मिट्टी तापमान',
      et0Label: 'वाष्पीकरण (प्रतिदिन)',
      pressureLabel: 'सतही वायु दाब',
      rainProbLabel: '24 घंटे वर्षा संभावना',
      riverFlowLabel: 'ग्लोफ़ास नदी बेसिन प्रवाह',
      unavailable: 'उपलब्ध नहीं',
      elevUnit: 'मी.',
      flowUnit: 'मी³/से',
      pressureUnit: 'हे.पा.',
      et0Unit: 'मिमी/दिन',
    },
  },
  te: {
    brandName: 'అగ్రిగార్డ్ ఏఐ',
    subBrandName: 'రైతు సురక్ష',
    tagline: 'ప్రతి రైతుకూ ఒక ఏఐ బృందం ఉండాలి.',
    languageLabel: 'భాష',
    syntheticWarningPrefix: 'సింథటిక్ పరీక్ష పరిస్థితి',
    liveDataLabel: 'లైవ్ వాతావరణ సమాచారం',
    customContextLabel: 'కస్టమ్ పొలం వివరాలు',
    nav: {
      overview: 'సమీక్ష',
      'my-farm': 'నా పొలం',
      'ai-staff': 'ఏఐ సిబ్బంది',
      'kisan-rakshak': 'కిసాన్-రక్షక్',
      weather: 'వాతావరణ సమాచారం',
      crop: 'పంట సమాచారం',
      recommendations: 'సూచనలు',
      alerts: 'హెచ్చరికలు & నివేదికలు',
      settings: 'సెట్టింగ్స్',
    },
    common: {
      saveProfile: 'పొలం వివరాలు సేవ్ చేయండి',
      saved: 'సేవ్ అయింది',
      runOrchestrator: 'ఏఐ బృందాన్ని అడగండి',
      runningAgents: 'ఏజెంట్లు పనిచేస్తున్నాయి...',
      pending: 'పెండింగ్',
      completed: 'పూర్తయింది',
      confirmAction: 'నిర్ధారించి కొనసాగండి',
      cancel: 'రద్దు చేయండి',
      listenSummary: 'వినండి',
      stopVoice: 'ఆడియో ఆపండి',
      speakQuery: 'వాయిస్ ఇన్‌పుట్',
      stopListening: 'వింటున్నాము...',
      loadScenario: 'పరీక్ష పరిస్థితి లోడ్ చేయండి',
      clearHistory: 'చరిత్ర క్లియర్ చేయండి',
      liveFarmWeatherBtn: 'లైవ్ పొలం వాతావరణం',
      syncLiveWeatherBtn: 'లైవ్ వాతావరణం అప్‌డేట్',
      syncingLiveBtn: 'లైవ్ లోడ్ అవుతోంది...',
      acresUnit: 'ఎకరాలు',
      all: 'అన్నీ',
      openMenuAria: 'నావిగేషన్ మెనూ తెరవండి',
      closeMenuAria: 'నావిగేషన్ మెనూ మూసివేయండి',
      closeModalAria: 'నిర్ధారణ డైలాగ్ మూసివేయండి',
      reloadHomeAria: 'రీలోడ్ చేసి రైతు సురక్ష ప్రారంభ పేజీని తెరవండి',
      topNavAria: 'పైభాగ విభాగ నావిగేషన్ పట్టీ',
      voiceUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్ సపోర్ట్ లేదు; దయచేసి మీ ప్రశ్నను టైప్ చేయండి.',
      voiceMicDenied: 'మైక్రోఫోన్ అందుబాటులో లేదు లేదా అనుమతి లేదు. దయచేసి టైప్ చేయండి.',
    },
    overview: {
      heading: 'పొలం నిర్వహణ కేంద్రం',
      subheading: 'మీ పొలం కోసం సమన్వయ ఏఐ రక్షణ, వాతావరణ స్పష్టత మరియు పంట సన్నద్ధత.',
      askTeamTitle: 'మాస్టర్ ఆర్కెస్ట్రేటర్‌ను అడగండి',
      askTeamSubheading: 'మాస్టర్ ఏజెంట్ మీ ప్రశ్నను పరిశీలించి, సంబంధిత ప్రత్యేక ఏజెంట్లను పిలిచి, విభేదాలను సరిచూసి ఒకే కార్యాచరణ ప్రణాళికను ఇస్తుంది.',
      askPlaceholder: 'వర్షం ప్రభావం, వరి రక్షణ, నీటి పారుదల లేదా పంట లక్షణాల గురించి అడగండి...',
      askLabelAria: 'మాస్టర్ ఆర్కెస్ట్రేటర్ ఏజెంట్‌ను అడగండి',
      queryMinError: 'దయచేసి మీ ప్రశ్న లేదా పొలం పరిస్థితిని కనీసం 3 అక్షరాల్లో రాయండి.',
      readinessTitle: 'కిసాన్ రక్షక్ ప్రమాద స్థాయి',
      pendingTasksTitle: 'తక్షణ హెచ్చరికలు',
      weatherSummaryTitle: 'వాతావరణం & ముప్పు వివరాలు',
      editFarmProfile: 'పొలం వివరాలు మార్చండి',
      liveFeedActive: 'లైవ్ వాతావరణ ఫీడ్ సక్రియంగా ఉంది',
      syntheticFeedActive: 'సింథటిక్ పరీక్ష పరిస్థితి అమల్లో ఉంది',
      customFeedActive: 'కస్టమ్ పొలం పరిస్థితి',
      scorePrefix: 'స్కోర్',
      confPrefix: 'నమ్మకం',
      rain24Title: '24 గం. వర్ష సూచన',
      rain72TotalPrefix: '72 గం. మొత్తం:',
      notSet: 'నమోదు కాలేదు',
      windSoilTitle: 'గాలి & నేల తేమ',
      topsoilPrefix: 'పైమట్టి తేమ:',
      floodPrefix: 'వరద స్థితి:',
      completedActionsSuffix: 'పూర్తయిన చర్యలు',
      sprayingWindowTitle: '24 గం. ఆకుల పిచికారీ సమయం',
      irrigationWindowTitle: 'నీటి పారుదల & సాగు సూచన',
      openFullAiStaff: 'పూర్తి ఏఐ సిబ్బంది తెరవండి',
      latestBriefLabel: 'తాజా సమన్వయ సారాంశం',
      toolsExecutedSuffix: 'ఏజెంట్ సాధనాలు నడిచాయి',
      priorityQueueTitle: 'ప్రాధాన్యత చర్యల జాబితా',
      manageAll: 'అన్నీ చూడండి',
      allAlertsDone: 'ప్రస్తుత హెచ్చరికలన్నీ పూర్తయ్యాయి. కొత్త ముప్పులను తనిఖీ చేయడానికి ఏఐ సిబ్బంది లేదా కిసాన్ రక్షక్ నడపండి.',
      confirmBeforeAction: 'చర్యకు ముందు నిర్ధారించండి',
      standardStep: 'సాధారణ దశ',
      scanCropPhotoBtn: 'పంట ఫోటో పరీక్ష (ఏఐ)',
      trackGpsBtn: 'లైవ్ జీపీఎస్ వాడండి',
      gpsTrackingActiveBtn: 'లైవ్ జీపీఎస్ ఆన్‌లో ఉంది',
      gpsAcquiringBtn: 'జీపీఎస్ గుర్తిస్తోంది...',
      gpsActiveBadge: 'డివైస్ జీపీఎస్ లైవ్',
      editPhotoAria: 'ప్రొఫైల్ ఫోటో మార్చండి',
      tempCardTitle: 'ఉష్ణోగ్రత & తేమ',
      humidityPrefix: 'తేమ:',
      selectLocationLabel: 'ప్రాంతాన్ని ఎంచుకోండి',
      applyLocationBtn: 'ప్రాంతం మార్చండి',
      customLocationToggle: 'ఇతర నగరం / జిల్లా నమోదు',
      updatingLocation: 'ఎంచుకున్న ప్రాంతం లైవ్ డేటా అప్‌డేట్ అవుతోంది...',
      customDistrictPlaceholder: 'జిల్లా / నగరం (ఉదా. గుంటూరు)',
      customStatePlaceholder: 'రాష్ట్రం (ఉదా. ఆంధ్రప్రదేశ్)',
      locationPresetPlaceholder: 'వ్యవసాయ జిల్లా / ప్రాంతాన్ని ఎంచుకోండి...',
    },
    myFarm: {
      subtitle: 'మీ పొలం వివరాల ఆధారంగా ప్రతి వాతావరణ అంచనా, కిసాన్ రక్షక్ రిస్క్ స్కోర్ మరియు పంట సూచనలు రూపొందించబడతాయి. ఆధార్ లేదా బ్యాంకు వివరాలు అవసరం లేదు.',
      quickLocationLabel: 'త్వరిత జిల్లా ఎంపిక (లేదా క్రింద స్వయంగా నమోదు చేయండి)',
      customLocationOption: 'ఇతర ప్రాంతం (క్రింద నమోదు చేయండి)',
      nameLabel: 'రైతు పేరు లేదా మారుపేరు',
      langLabel: 'ప్రాధాన్యత భాష',
      stateLabel: 'రాష్ట్రం',
      districtLabel: 'జిల్లా',
      locationLabel: 'గ్రామం / మండలం',
      cropsLabel: 'పంటల రకాలు (కామాతో వేరు చేయండి)',
      cropsPlaceholder: 'ఉదా. వరి (ఎంటీయూ-1010), మినుము',
      farmSizeLabel: 'పొలం విస్తీర్ణం (ఎకరాలు)',
      soilTypeLabel: 'నేల రకం (తెలిస్తే)',
      growthStageLabel: 'పంట పెరుగుదల దశ',
      drainageLabel: 'పొలం నీటి పారుదల స్వభావం',
      nearCoastLabel: 'పొలం సముద్ర తీరం, నదీ డెల్టా లేదా పెద్ద కాలువ పొంగే ప్రాంతానికి 15 కి.మీ లోపు ఉంది',
      errName: 'పేరు లేదా మారుపేరు తప్పనిసరి.',
      errState: 'రాష్ట్రం తప్పనిసరి.',
      errDistrict: 'జిల్లా తప్పనిసరి.',
      errLocation: 'గ్రామం / మండలం పేరు తప్పనిసరి.',
      errCrops: 'కనీసం ఒక పంటను నమోదు చేయండి (ఉదా. వరి, పత్తి).',
      errSize: '0.1 నుండి 2000 ఎకరాల మధ్య సరైన విస్తీర్ణం నమోదు చేయండి.',
      summaryState: 'రాష్ట్రం',
      summaryCrops: 'సాగు పంటలు',
      summaryArea: 'పొలం విస్తీర్ణం',
      summaryStage: 'పెరుగుదల దశ',
      summarySoil: 'నేల రకం',
      privacyTitle: 'గోప్యత & పొలం భద్రత',
      privacyDesc: 'మీ ప్రొఫైల్ వివరాలు మీ బ్రౌజర్‌లోనే భద్రపరచబడతాయి మరియు మీరు ఏఐ బృందాన్ని అడిగినప్పుడు మాత్రమే సర్వర్‌కు పంపబడతాయి. ఆధార్ లేదా బ్యాంకు వివరాలు అడగము.',
      gpsSectionTitle: 'లైవ్ డివైస్ జీపీఎస్ లొకేషన్',
      gpsSectionDesc: 'జీపీఎస్ అనుమతి ఇస్తే మీ ప్రస్తుత గ్రామం, జిల్లా, రాష్ట్రం స్వయంచాలకంగా గుర్తించబడి లైవ్ వాతావరణంతో అనుసంధానం అవుతుంది.',
      allowGpsBtn: 'జీపీఎస్ అనుమతి ఇచ్చి లైవ్ ట్రాక్ చేయండి',
      refreshGpsBtn: 'ఇప్పుడే జీపీఎస్ అప్‌డేట్ చేయండి',
      stopGpsBtn: 'లైవ్ జీపీఎస్ ఆపండి',
      gpsAcquiringStatus: 'డివైస్ నుండి జీపీఎస్ అనుమతి మరియు స్థానం తీసుకుంటోంది...',
      gpsActiveStatus: 'లైవ్ డివైస్ జీపీఎస్ ట్రాకింగ్ సక్రియంగా ఉంది',
      gpsAccuracyPrefix: 'ఖచ్చితత్వం ±',
      gpsPermissionDenied: 'జీపీఎస్ లొకేషన్ అనుమతి తిరస్కరించబడింది. బ్రౌజర్ సెట్టింగ్స్‌లో లొకేషన్ అనుమతించండి లేదా క్రింద జిల్లాను స్వయంగా నమోదు చేయండి.',
      gpsUnsupported: 'ఈ బ్రౌజర్‌లో డివైస్ జీపీఎస్ సపోర్ట్ లేదు.',
      gpsTimeoutErr: 'ప్రస్తుతం జీపీఎస్ సిగ్నల్ అందలేదు. దయచేసి బయట మళ్లీ ప్రయత్నించండి లేదా లొకేషన్ సెట్టింగ్ తనిఖీ చేయండి.',
      photoSectionTitle: 'ప్రొఫైల్ ఫోటో',
      uploadPhotoBtn: 'ఫోటో అప్‌లోడ్',
      cameraPhotoBtn: 'కెమెరాతో తీయండి',
      removePhotoBtn: 'ఫోటో తొలగించండి',
      cameraModalTitle: 'ప్రొఫైల్ ఫోటో తీయండి',
      cameraCaptureBtn: 'ఫోటో తీయండి',
      cameraFallbackBtn: 'డివైస్ నుండి ఫోటో ఎంచుకోండి',
      cameraStarting: 'కెమెరా ప్రారంభమవుతోంది...',
      cameraDeniedErr: 'కెమెరా అనుమతి లేదు లేదా కెమెరా కనుగొనబడలేదు. మీరు డివైస్‌లో ఉన్న ఫోటోను అప్‌లోడ్ చేయవచ్చు.',
    },
    aiStaff: {
      heading: 'మాస్టర్ ఆర్కెస్ట్రేటర్ & ఏఐ సిబ్బంది',
      subheadingPrefix: 'ఒక ప్రధాన ఏజెంట్ లైవ్ జెమినీ ఫంక్షన్ కాలింగ్ ద్వారా మీ ప్రశ్నను ప్రత్యేక సాధనాలకు పంపి, విభేదాలను సరిచూసి ఒకే ప్రణాళికను సిద్ధం చేస్తుంది:',
      contextLabel: 'సందర్భం:',
      contextModeLabel: 'సందర్భ విధానం:',
      askPromptLabel: 'మీ అగ్రిగార్డ్ ఏఐ సిబ్బందిని అడగండి',
      queryMinError: 'దయచేసి కనీసం 3 అక్షరాల వ్యవసాయ ప్రశ్నను నమోదు చేయండి.',
      agentReady: 'సిద్ధం',
      agentCalled: 'పిలవబడింది',
      orchestratingStatus: 'మాస్టర్ ఆర్కెస్ట్రేటర్ ప్రత్యేక ఏజెంట్ల కోసం నిజమైన జెమినీ సాధనాలను నడుపుతోంది...',
      unifiedPlanLabel: 'సమన్వయ ప్రణాళిక',
      syntheticContextSuffix: 'సింథటిక్ పరీక్ష సందర్భం',
      synthesisTitle: 'మాస్టర్ ఏజెంట్ తుది సారాంశం',
      conflictCheckTitle: 'ఏజెంట్ల మధ్య విభేదాలు & సమన్వయ తనిఖీ',
      uncertaintyTitle: 'అనిశ్చితి & అందుబాటులో లేని సమాచారం',
      activityPanelTitle: 'ఏజెంట్ కార్యాచరణ ప్యానెల్',
      activityPanelSub: 'ఈ విచారణలో సర్వర్‌లో అమలైన ధృవీకరించబడిన సాధనాల ఫలితాలు.',
      noToolsRequired: 'ఈ ప్రశ్నకు బాహ్య సాధనాల అవసరం రాలేదు.',
      taskPrefix: 'పని:',
      toolPrefix: 'సాధనం:',
      resultPrefix: 'ఫలితం:',
      statusCompleted: 'పూర్తయింది',
      statusError: 'లోపం',
      historyTitle: 'ఏజెంట్ పని చరిత్ర',
      historySub: 'గత బహుళ-ఏజెంట్ సలహాలు మరియు సిఫార్సులను చూడండి.',
      historyEmpty: 'ఇంకా ఏఐ సిబ్బంది విచారణలు నమోదు కాలేదు. పైన ఒక పరిస్థితిని ఎంచుకోండి లేదా ప్రశ్న అడగండి.',
      toolsCountSuffix: 'సాధనాలు',
      roster: {
        weather: {
          name: 'వాతావరణ సమాచార ఏజెంట్',
          role: 'నకిలీ డేటా సృష్టించకుండా వర్షపాతం, గాలి మరియు అంచనా అనిశ్చితిని విశ్లేషిస్తుంది.',
        },
        crop: {
          name: 'పంట సమాచార ఏజెంట్',
          role: 'పంట రకం, పెరుగుదల దశ, నేల మరియు పొలం లక్షణాలను జాగ్రత్తగా పరిశీలిస్తుంది.',
        },
        kisan_rakshak: {
          name: 'కిసాన్ రక్షక్ ఏజెంట్',
          role: 'తుఫాన్, వరద, నీటి నిల్వ ప్రమాదాలను లెక్కించి ముందు/సమయంలో/తర్వాత ప్రణాళికలు ఇస్తుంది.',
        },
        farm_advisory: {
          name: 'వ్యవసాయ సలహా ఏజెంట్',
          role: 'సాధారణ సలహాలను మరియు కేవీకే నిపుణుల నిర్ధారణ అవసరమైన అంశాలను వేరుగా వివరిస్తుంది.',
        },
        voice_language: {
          name: 'వాయిస్ & భాష ఏజెంట్',
          role: 'తెలుగు, హిందీ, ఆంగ్లంలో సులభమైన మాటలు మరియు వినిపించే సారాంశాన్ని అందిస్తుంది.',
        },
        action_alert: {
          name: 'చర్య & హెచ్చరిక ఏజెంట్',
          role: 'ముఖ్య హెచ్చరికలకు ప్రాధాన్యత ఇస్తుంది, కారణాన్ని చూపిస్తుంది మరియు పూర్తి స్థితిని ట్రాక్ చేస్తుంది.',
        },
      },
    },
    kisanRakshak: {
      syntheticBanner: 'సింథటిక్ పరీక్ష పరిస్థితి అమల్లో ఉంది — ఇది అధికారిక విపత్తు హెచ్చరిక కాదు',
      customBanner: 'లైవ్ / రైతు నమోదు చేసిన పొలం అంచనా',
      heading: 'కిసాన్ రక్షక్ ప్రమాద అంచనా',
      subheading: 'పారదర్శక ప్రమాద గణన, లోపించిన సమాచారం మరియు దశలవారీ రక్షణ ప్రణాళిక.',
      weatherSourceLabel: 'వాతావరణ మూలం:',
      scenarioPrefix: 'పరిస్థితి',
      runAssessment: 'ప్రమాద అంచనా లెక్కించండి',
      riskCategory: 'ప్రమాద వర్గం',
      confidence: 'నమ్మక స్థాయి',
      confSuffix: 'నమ్మకం',
      missingData: 'అందుబాటులో లేని సమాచారం',
      missingConfNote: 'కారణంగా నమ్మక స్థాయి తగ్గింది:',
      beforeEvent: 'విపత్తుకు ముందు',
      duringEvent: 'విపత్తు సమయంలో',
      afterEvent: 'విపత్తు తర్వాత',
      checklistTitle: 'అత్యవసర సన్నద్ధత జాబితా',
      checklistSubPrefix: 'సన్నద్ధత అంశాలను ట్రాక్ చేయండి:',
      checklistSubMid: 'ఎకరాలు',
      contactsTitle: 'ధృవీకరించబడిన అత్యవసర హెల్ప్‌లైన్లు',
      contactsSub: 'భారత ప్రభుత్వం & రాష్ట్ర అధికారిక విపత్తు మరియు వ్యవసాయ హెల్ప్‌లైన్లు.',
      dispatchAlertBtn: 'తక్షణ పొలం హెచ్చరిక సృష్టించండి',
      customHeading: 'కస్టమ్ పొలం పరిస్థితులను అంచనా వేయండి',
      customSubPrefix: 'నిజమైన స్థానిక వాతావరణ అంచనాలు లేదా ఐఎండీ హెచ్చరికలను నమోదు చేయండి:',
      customSubSuffix: 'సమాచారం లేకపోతే ఊహించకుండా నమ్మక స్థాయిని నిజాయితీగా తగ్గించి చూపిస్తుంది.',
      rain24Input: '24 గం. వర్షపాతం (మి.మీ)',
      windInput: 'గాలి వేగం (కి.మీ/గం)',
      warningInput: 'ధృవీకరించిన ఐఎండీ / ఎస్‌డీఎంఏ హెచ్చరిక (ఐచ్ఛికం)',
      warningPlaceholder: 'ఉదా. భారీ వర్షాలకు ఐఎండీ ఆరెంజ్ అలర్ట్',
      floodStatusInput: 'స్థానిక వరద / నీటి నిల్వ స్థితి',
      breakdownTitle: 'పారదర్శక ప్రమాద కారకాల వివరణ',
      sourcePrefix: 'మూలం:',
      phasedPlanTitle: 'దశలవారీ విపత్తు & పంట రక్షణ ప్రణాళిక',
      phasedPlanSub: 'తీవ్ర వాతావరణానికి ముందు, సమయంలో మరియు తర్వాత చేపట్టాల్సిన ప్రాధాన్యత చర్యలు.',
      priorityPrefix: 'ప్రాధాన్యత:',
      modalTitle: 'తక్షణ పొలం హెచ్చరిక సృష్టిని నిర్ధారించండి',
      modalDescTemplate: 'ప్రస్తుత కిసాన్ రక్షక్ అంచనా ఆధారంగా {crops} ({district}) కోసం హెచ్చరికలు & నివేదికలలో ప్రాధాన్యత హెచ్చరికను సృష్టించాలా?',
      modalConsequence: 'పెద్ద గట్లు కత్తిరించడం, ముందస్తు కోత లేదా అత్యవసర యంత్రాల నిర్ణయాలకు ముందు మీ స్థానిక కేవీకే లేదా పొలం పరిస్థితిని తప్పక పరిశీలించండి.',
      dispatchedNotice: 'నిర్ధారించబడింది మరియు హెచ్చరికలు & నివేదికలలో నమోదైంది.',
      alertTitlePrefix: 'కిసాన్ రక్షక్ సన్నద్ధత',
    },
    weatherView: {
      agentHeader: 'వాతావరణ సమాచార ఏజెంట్',
      sourcePrefix: 'మూలం:',
      lastUpdatedPrefix: 'చివరి అప్‌డేట్:',
      fetchLiveBtn: 'జిల్లా లైవ్ వాతావరణం తెచ్చుకోండి',
      fetchingLiveBtn: 'లైవ్ లోడ్ అవుతోంది...',
      useGpsBtn: 'జీపీఎస్ వాడండి',
      runWeatherAgentBtn: 'వాతావరణ ఏజెంట్ విశ్లేషణ నడపండి',
      runningAgentBtn: 'ఏజెంట్ నడుస్తోంది...',
      gpsUnsupported: 'ఈ బ్రౌజర్‌లో లొకేషన్ (జీపీఎస్) సపోర్ట్ లేదు.',
      gpsDenied: 'లొకేషన్ అనుమతి తిరస్కరించబడింది. "నా పొలం" లోని జిల్లాను వాడుతున్నాము.',
      rainCardTitle: '24 / 72 గం. వర్షపాతం',
      windCardTitle: 'గాలి / గరిష్ట ఉధృతి',
      tempCardTitle: 'ఉష్ణోగ్రత / తేమ',
      soilCardTitle: 'పైమట్టి తేమ (0–7 సెం.మీ)',
      sprayingTitle: 'ఆకుల పిచికారీ సమయం',
      irrigationTitle: 'నీటి పారుదల & సాగు సలహా',
      confirmedObsTitle: 'నిర్ధారిత పరిశీలన',
      uncertaintyTitle: 'అంచనా అనిశ్చితి వివరణ',
      timelineHeading: '72 గంటల వర్షం & గాలి కాలపట్టిక',
      colWindow: 'సమయం',
      colKind: 'డేటా రకం',
      colRain: 'వర్షపాతం',
      colWind: 'గాలి',
      colTemp: 'ఉష్ణోగ్రత',
      colHumidity: 'తేమ',
    },
    cropView: {
      agentBadge: 'పంట సమాచార ఏజెంట్',
      heading: 'పంట పరిస్థితి & లక్షణాల అంచనా',
      subheading: 'పంట రకం, ప్రాంతం, పెరుగుదల దశ మరియు కనిపించిన లక్షణాలను నమోదు చేయండి. అగ్రిగార్డ్ జాగ్రత్తతో కూడిన సలహాలు ఇచ్చి, కేవీకే అధికారితో ఏమి నిర్ధారించుకోవాలో తెలుపుతుంది.',
      cropTypeLabel: 'పంట రకం',
      cropTypePlaceholder: 'ఉదా. వరి (ఎంటీయూ-1010)',
      locationLabel: 'ప్రాంతం (గ్రామం / జిల్లా)',
      growthStageLabel: 'పెరుగుదల దశ',
      soilMoistureLabel: 'నేల తేమ పరిస్థితి',
      waterDaysLabel: 'పొలంలో నీరు నిలిచిన రోజులు',
      symptomsLabel: 'గమనించిన పంట లక్షణాలు లేదా పొలం పరిస్థితి',
      symptomsPlaceholder: 'ఉదా. కింది ఆకులు పసుపు రంగులోకి మారడం, గట్ల దగ్గర మొక్కలు వాలిపోవడం, ఆకులపై గోధుమ రంగు మచ్చలు...',
      errRequired: 'పంట సమాచార విశ్లేషణకు పంట రకం మరియు ప్రాంతం తప్పనిసరి.',
      errWaterDays: 'నీరు నిలిచిన రోజులు 0 నుండి 60 మధ్య ఉండాలి.',
      runningBtn: 'పంట విశ్లేషణ జరుగుతోంది...',
      submitBtn: 'పంట ప్రమాదాలను అంచనా వేయండి',
      guideTitle: 'దశల వారీ పంట సున్నితత్వ మార్గదర్శి',
      guideNurseryTitle: 'నారుమడి / విత్తే దశ',
      guideNurseryDesc: 'భారీ వర్షాల్లో విత్తనాలు, లేత మొక్కలు కొట్టుకుపోయే లేదా కుళ్ళే ప్రమాదం ఉంది; ఎత్తైన మడులు, కాలువలు మేలు చేస్తాయి.',
      guideFloweringTitle: 'పూత / పొట్ట దశ',
      guideFloweringDesc: 'పూత సమయంలో బలమైన గాలులు, భారీ వర్షాలు వస్తే తాలు గింజలు ఏర్పడటం, మొక్కలు పడిపోవడం జరుగుతుంది.',
      guideMaturityTitle: 'పంట కోతకు సిద్ధమైన దశ',
      guideMaturityDesc: 'నీరు నిలిస్తే గింజ రంగు మారడం మరియు కంకిపైనే మొలకెత్తడం జరగవచ్చు; నీటిని బయటకు పంపడం, పొడి నిల్వపై దృష్టి పెట్టండి.',
      guideChemicalTitle: 'రసాయన జాగ్రత్త',
      guideChemicalDesc: 'భారీ వర్ష సూచనకు ముందు ఎప్పుడూ పిచికారీ చేయవద్దు; ముందుగా కేవీకే (1800-180-1551) వద్ద తెగులును నిర్ధారించుకోండి.',
      photoHeading: 'పంట ఫోటో గుర్తింపు & ఆరోగ్య స్కానర్',
      photoSubheading: 'ఆకులు, కాండం లేదా కంకి యొక్క స్పష్టమైన ఫోటోను అప్‌లోడ్ చేయండి లేదా తీయండి. జెమినీ ఫ్లాష్ / ఫ్లాష్-లైట్ పంటను గుర్తించి సమస్యలు మరియు ఆరోగ్య స్థితిని వివరిస్తుంది.',
      uploadDropLabel: 'పంట ఆకు, కాండం లేదా పొలం ఫోటోను అప్‌లోడ్ చేయండి',
      uploadHint: 'జేపీజీ, పీఎన్‌జీ లేదా వెబ్‌పీ ఫార్మాట్‌లు అనుమతించబడతాయి.',
      choosePhotoBtn: 'ఫోటో ఎంచుకోండి',
      capturePhotoBtn: 'కెమెరా వాడండి',
      changePhotoBtn: 'ఫోటో మార్చండి',
      removePhotoBtn: 'తొలగించండి',
      cropPhotoPreviewAlt: 'ఏఐ ఆరోగ్య పరీక్ష కోసం అప్‌లోడ్ చేసిన పంట ఫోటో',
      notesLabel: 'ఏఐ విశ్లేషణ కోసం ఐచ్ఛిక గమనిక',
      notesPlaceholder: 'ఉదా. 2 రోజుల వర్షం తర్వాత కింది ఆకులపై గోధుమ మచ్చలు కనిపించాయి...',
      modelSelectorLabel: 'జెమినీ ఏఐ ఇంజిన్',
      modelAuto: 'జెమినీ ఫ్లాష్ + ఫ్లాష్-లైట్ ఆటో (సిఫార్సు చేయబడింది)',
      modelFlash: 'జెమినీ 4 ఫ్లాష్ (అత్యధిక ఖచ్చితత్వం)',
      modelFlashLite: 'జెమినీ 3.1 ఫ్లాష్-లైట్ (అత్యంత వేగవంతం)',
      analyzePhotoBtn: 'పంటను గుర్తించి ఆరోగ్యాన్ని పరీక్షించండి',
      analyzingPhotoBtn: 'జెమినీతో పంట ఫోటోను పరిశీలిస్తున్నాము...',
      diagnosisReportTitle: 'జెమినీ విజన్ పంట ఆరోగ్య నివేదిక',
      identifiedCropLabel: 'గుర్తించిన పంట',
      confidenceLabel: 'గుర్తింపు నమ్మకం',
      estStageLabel: 'అంచనా దశ',
      healthScoreLabel: 'పంట ఆరోగ్య స్కోర్',
      healthSummaryLabel: 'మొత్తం ఆరోగ్య స్థితి',
      problemsHeading: 'గుర్తించిన పంట సమస్యలు',
      noProblemsFound: 'ఈ ఫోటోలో స్పష్టమైన వ్యాధి, పురుగు లేదా తీవ్రమైన ఒత్తిడి లక్షణాలు కనిపించలేదు.',
      visualEvidencePrefix: 'ఫోటో ఆధారం:',
      safeStepsLabel: 'తక్షణ సురక్షిత చర్యలు:',
      generalStepsTitle: 'సురక్షిత వ్యవసాయ చర్యలు',
      kvkQuestionsTitle: 'కేవీకే / వ్యవసాయ అధికారితో నిర్ధారించుకోండి (1800-180-1551)',
      limitationsTitle: 'ఫోటో పరిమితులు & అనిశ్చితి',
      modelUsedPrefix: 'విశ్లేషించిన మోడల్:',
      sendToAiStaffBtn: 'ఫలితాలను ఏఐ సిబ్బందికి పంపండి (పూర్తి ప్రణాళిక)',
      sendingToAiStaffBtn: 'ఏఐ సిబ్బందికి పంపుతున్నాము...',
    },
    recommendationsView: {
      heading: 'వ్యవసాయ సలహాలు & సిఫార్సులు',
      subheading: 'సాధారణ వ్యవసాయ సూచనలు మరియు స్థానిక కేవీకే / వ్యవసాయ నిపుణుల నిర్ధారణ అవసరమైన అంశాలు స్పష్టంగా వేరు చేయబడ్డాయి.',
      tabAll: 'అన్ని సలహాలు',
      tabGeneral: 'సాధారణ సూచనలు',
      tabExpert: 'కేవీకే నిర్ధారణ',
      emptyTitle: 'ఈ ఫిల్టర్‌కు సరిపోయే సూచనలు లేవు',
      emptySub: 'మీ ప్రస్తుత పంట మరియు వాతావరణానికి తగిన సలహాల కోసం ఏఐ సిబ్బందిని అడగండి.',
      cropPrefix: 'పంట:',
      reviewed: 'సమీక్షించబడింది',
      markReviewed: 'సమీక్షించినట్లు గుర్తించండి',
      kvkNotice: 'మోతాదు, సమయం లేదా పెద్ద పంట చర్యలకు ముందు కిసాన్ కాల్ సెంటర్ (1800-180-1551) లేదా స్థానిక కేవీకే తో నిర్ధారించుకోండి.',
    },
    alertsView: {
      heading: 'చర్య & హెచ్చరికల జాబితా + పొలం నివేదికలు',
      subheading: 'ప్రతి హెచ్చరిక వెనుక ఉన్న ఆధారిత కారణం స్పష్టంగా చూపబడుతుంది. ముఖ్యమైన పొలం పనులను అమలు చేసే ముందు రైతు నిర్ధారణ తప్పనిసరి.',
      downloadBtn: 'పొలం రిస్క్ నివేదిక డౌన్‌లోడ్',
      emptyFilter: 'ఈ విభాగంలో హెచ్చరికలు లేవు.',
      statusCompleted: 'పూర్తయింది',
      statusPending: 'పెండింగ్ చర్య',
      farmerConfirmed: 'రైతు నిర్ధారించారు',
      awaitingConfirm: 'రైతు నిర్ధారణ కోసం వేచి ఉంది',
      reasonPrefix: 'కారణం:',
      actionPrefix: 'చేయాల్సిన పని:',
      confirmBtn: 'చర్యను నిర్ధారించండి',
      markDoneBtn: 'పూర్తయినట్లు గుర్తించండి',
      modalTitle: 'ముఖ్యమైన పొలం చర్యను నిర్ధారించండి',
      modalConsequence: 'గట్లు మార్చడం, ఎరువులు వేయడం లేదా ముందస్తు కోతకు ముందు పొలంలో నీటి మట్టాన్ని స్వయంగా చూసి కేవీకే (1800-180-1551) సలహా తీసుకోండి.',
      modalDescPrefix: 'మీరు ఈ చర్యను కొనసాగించడానికి సిద్ధంగా ఉన్నారా:',
      modalActionLabel: 'చేయాల్సిన పని:',
    },
    settingsView: {
      subheading: 'భాష ప్రాధాన్యతలు, వాయిస్ వివరణ మరియు అగ్రిగార్డ్ ఏఐ విశ్వసనీయత నియమాలను నిర్వహించండి.',
      prefLangTitle: 'ప్రాధాన్య ఇంటర్‌ఫేస్ & వాయిస్ భాష',
      prefLangSub: 'ఇది నావిగేషన్, అన్ని స్క్రీన్లు, మాస్టర్ ఆర్కెస్ట్రేటర్ సమాధానాలు మరియు వాయిస్ రీడింగ్‌కు వర్తిస్తుంది.',
      commitmentsTitle: 'విశ్వసనీయత & భద్రతా నిబద్ధతలు',
      commit1Title: 'నకిలీ వాతావరణం లేదా హెచ్చరికలు ఉండవు:',
      commit1Body: 'అగ్రిగార్డ్ ఏఐ ఎప్పుడూ కల్పిత లైవ్ వాతావరణ రీడింగ్‌లు లేదా అధికారిక విపత్తు హెచ్చరికలను సృష్టించదు. డెమో పరిస్థితులు సింథటిక్ పరీక్షలుగా స్పష్టంగా చూపబడతాయి.',
      commit2Title: 'పరిశీలన మరియు అంచనా తేడా:',
      commit2Body: 'నిర్ధారిత కొలతలు మరియు వాతావరణ మోడల్ అంచనాలు అనిశ్చితి వివరాలతో వేరుగా చూపబడతాయి.',
      commit3Title: 'ధృవీకరించిన హెల్ప్‌లైన్లు మాత్రమే:',
      commit3Body: 'చూపిన నంబర్లు అధికారిక భారత ప్రభుత్వం / ఎన్‌డీఎంఏ / కిసాన్ కాల్ సెంటర్ నంబర్లు (112, 1078, 1800-180-1551).',
      commit4Title: 'రైతు నిర్ధారణ భద్రత:',
      commit4Body: 'కీలకమైన పొలం చర్యలకు రైతు స్పష్టమైన నిర్ధారణ మరియు కేవీకే సలహా తప్పనిసరి.',
      storageTitle: 'వర్క్‌స్పేస్ నిల్వ',
      storageSub: 'మీ పొలం ప్రొఫైల్, చెక్‌లిస్ట్ పురోగతి, హెచ్చరికలు మరియు ఏజెంట్ చరిత్ర ఈ బ్రౌజర్‌లోనే సేవ్ చేయబడతాయి.',
      resetBtn: 'స్థానిక పొలం డేటాను లైవ్ డిఫాల్ట్‌కు రీసెట్ చేయండి',
      resetModalTitle: 'వర్క్‌స్పేస్ డేటాను రీసెట్ చేయాలా?',
      resetModalDesc: 'ఇది మీ పొలం వివరాలు, చెక్‌లిస్ట్, హెచ్చరికలు మరియు ఏఐ సిబ్బంది చరిత్రను తొలగించి లైవ్ పొలం వాతావరణ డిఫాల్ట్‌లను పునరుద్ధరిస్తుంది.',
      resetModalNote: 'ఇది బ్రౌజర్ స్థానిక స్టోరేజ్‌ను మాత్రమే రీసెట్ చేస్తుంది, తిరిగి పొందలేరు.',
      resetModalConfirm: 'వర్క్‌స్పేస్ రీసెట్ చేయండి',
    },
    charts: {
      emptyTimeline: 'ఈ కస్టమ్ సెట్టింగ్‌కు కాలపట్టిక అంశాలు లేవు.',
      rainfallLegend: 'వర్షపాతం (మి.మీ)',
      windLegend: 'గాలి వేగం (కి.మీ/గం)',
      hoverHint: 'విలువలు చూడటానికి సమయంపై హోవర్ లేదా ట్యాప్ చేయండి',
      timelineAria: 'వర్షపాతం మరియు గాలి వేగం కాలపట్టిక చార్ట్',
      ptsUnit: 'పాయింట్లు',
    },
    voiceAssistant: {
      topBarToggleOn: 'వాయిస్ ఏఐ: ఆన్',
      topBarToggleOff: 'వాయిస్ ఏఐ: ఆఫ్',
      topBarToggleAria: 'యాక్టివ్ వాయిస్ ఏఐ సహాయకుడిని ఆన్ లేదా ఆఫ్ చేయండి',
      panelTitle: 'యాక్టివ్ వాయిస్ & సందేహాల సహాయకుడు',
      panelSub: 'స్క్రీన్‌పై ఏదైనా అంశాన్ని ఎంచుకోండి లేదా టెక్స్ట్‌ను హైలైట్ చేయండి, దాన్ని బిగ్గరగా వినండి మరియు మైక్ ద్వారా ఏఐ తో నేరుగా మాట్లాడండి.',
      doubtSelectLabel: 'మీకు సందేహం ఉన్న సమాచారం',
      topicHighlighted: 'స్క్రీన్‌పై ఎంచుకున్న భాగం',
      topicOverview: 'ప్రస్తుత పొలం సారాంశం',
      topicKisanRakshak: 'కిసాన్ రక్షక్ ప్రమాదం & ప్రణాళిక',
      topicWeather: 'వాతావరణం & పిచికారీ సలహా',
      topicCrop: 'పంట ఆరోగ్యం & ఫోటో నిర్ధారణ',
      topicRecommendations: 'వ్యవసాయ సిఫార్సులు',
      topicAlerts: 'హెచ్చరికలు & పనుల జాబితా',
      highlightHint: 'సూచన: పేజీలోని ఏదైనా పదాలు లేదా వాక్యాన్ని సెలెక్ట్ చేసి నేరుగా దానిపై ఏఐ ని అడగవచ్చు.',
      clearHighlightBtn: 'ఎంపికను క్లియర్ చేయండి',
      readDoubtBtn: 'సమాచారం చదివి వినిపించు',
      stopReadingBtn: 'చదవడం ఆపు',
      micTalkBtn: 'ఏఐ తో మాట్లాడండి (మైక్)',
      micStopBtn: 'మైక్ ఆపి పంపండి',
      micListeningStatus: 'మైక్ ఆన్‌లో ఉంది — మీ సందేహాన్ని ఇప్పుడే మాట్లాడండి...',
      askInputPlaceholder: 'మైక్‌తో మాట్లాడండి లేదా ఎంచుకున్న అంశంపై సందేహం టైప్ చేయండి...',
      sendQuestionBtn: 'ఏఐ ని అడగండి',
      aiThinkingStatus: 'ఏఐ సిబ్బంది మీ సందేహానికి స్పష్టమైన తెలుగు వాయిస్ & టెక్స్ట్ సమాధానం సిద్ధం చేస్తోంది...',
      speakingReplyBadge: 'మృదువైన తెలుగు స్వరంలో చదువుతోంది',
      voiceToneBadge: 'తెలుగు వాయిస్ · మృదువైన స్వరం',
      preparingVoiceStatus: 'మృదువైన తెలుగు వాయిస్ సిద్ధమవుతోంది...',
      speakingDoubtStatus: 'మీరు ఎంచుకున్న సమాచారం తెలుగులో మృదువుగా చదివి వినిపిస్తోంది...',
      speakingReplyStatus: 'ఏఐ సమాధానం తెలుగులో మృదువైన స్వరంలో వినిపిస్తోంది...',
      softVolumeLabel: 'మృదువైన వాయిస్ స్థాయి',
      replyHeaderLabel: 'ఏఐ వాయిస్ సమాధానం (తెలుగు)',
      replayAnswerBtn: 'సమాధానం మళ్లీ వినండి',
      ttsUnsupported: 'ఈ బ్రౌజర్‌లో వాయిస్ రీడింగ్ అందుబాటులో లేదు.',
      settingsVoiceTitle: 'యాక్టివ్ వాయిస్ మైక్ & సందేహాల పఠన విధానం',
      settingsVoiceSub: 'మైక్ ద్వారా ఏఐ తో మాట్లాడి మృదువైన తెలుగు వాయిస్ సమాధానం వినడానికి ఆన్ చేయండి, లేదా కేవలం టెక్స్ట్ కోసం ఆఫ్ చేయండి.',
      settingsVoiceOnLabel: 'వాయిస్ ఏఐ ఆన్',
      settingsVoiceOffLabel: 'వాయిస్ ఏఐ ఆఫ్',
    },
    plains: {
      plainsTitle: 'లైవ్ మైదానం, భూభాగం & నదీ పరీవాహక స్థితి',
      elevationLabel: 'ఎత్తు',
      reliefLabel: '5 కి.మీ వాలు వ్యత్యాసం',
      plainTypeLabel: 'మైదాన రకం',
      drainageSlopeLabel: 'నీటి పారుదల వాలు',
      rootMoistureLabel: 'వేరు లోతు తేమ (7–28 సెం.మీ)',
      soilTempLabel: 'నేల ఉష్ణోగ్రత',
      et0Label: 'ఆవిరి నష్టం (రోజుకు)',
      pressureLabel: 'ఉపరితల వాయు పీడనం',
      rainProbLabel: '24 గం. వర్ష సంభావ్యత',
      riverFlowLabel: 'గ్లోఫాస్ నదీ పరీవాహక ప్రవాహం',
      unavailable: 'అందుబాటులో లేదు',
      elevUnit: 'మీ.',
      flowUnit: 'మీ³/సె',
      pressureUnit: 'హె.పా.',
      et0Unit: 'మి.మీ/రోజు',
    },
  },
};
