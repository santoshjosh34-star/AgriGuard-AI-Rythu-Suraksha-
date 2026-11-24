import {
  Bell,
  Bot,
  CloudRain,
  Compass,
  FileCheck2,
  LayoutDashboard,
  Menu,
  Mic,
  MicOff,
  RotateCcw,
  Settings,
  ShieldAlert,
  Sprout,
  Tractor,
  X,
} from 'lucide-react';
import type { Language, NavSection, RiskLevel } from '../types/agriguard';
import { localizeRiskLevel } from '../lib/domainTranslations';
import { TRANSLATIONS } from '../lib/translations';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onReloadHome: () => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  pendingAlertsCount: number;
  currentRiskLevel: RiskLevel;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{ id: NavSection; icon: typeof LayoutDashboard }> = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'my-farm', icon: Tractor },
  { id: 'ai-staff', icon: Bot },
  { id: 'kisan-rakshak', icon: ShieldAlert },
  { id: 'weather', icon: CloudRain },
  { id: 'crop', icon: Sprout },
  { id: 'recommendations', icon: FileCheck2 },
  { id: 'alerts', icon: Bell },
  { id: 'settings', icon: Settings },
];

const TOP_SIDE_NAV_ITEMS: Array<{ id: NavSection; icon: typeof LayoutDashboard }> = NAV_ITEMS.filter(
  (item) => item.id !== 'kisan-rakshak'
);

export function Sidebar({
  activeSection,
  onSelectSection,
  onReloadHome,
  language,
  onChangeLanguage,
  pendingAlertsCount,
  currentRiskLevel,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const dict = TRANSLATIONS[language];

  const handleNavClick = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between border-r border-[#2C5A40] bg-[#0F2A1D] text-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-[#2C5A40] px-5 py-5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onCloseMobile();
                onReloadHome();
              }}
              aria-label={dict.common.reloadHomeAria}
              className="flex items-center gap-2.5 text-left hover:opacity-90 cursor-pointer"
            >
              <Compass className="h-5 w-5 text-[#B9DEC5] shrink-0" aria-hidden="true" />
              <div>
                <span
                  data-testid="sidebar-brand-name"
                  className="block font-display text-lg font-semibold tracking-tight whitespace-nowrap text-white"
                >
                  {dict.brandName}
                </span>
                <span className="block text-[11px] font-medium text-[#9ED3B0]">
                  {dict.subBrandName}
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label={dict.common.closeMenuAria}
              className="rounded-md p-1 text-white/80 hover:bg-white/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-snug text-[#B9DEC5]">{dict.tagline}</p>
        </div>

        <nav className="space-y-1 px-3 py-4" aria-label="Primary dashboard navigation">
          {NAV_ITEMS.map(({ id, icon: Icon }) => {
            const isActive = activeSection === id;
            const showAlertCount = id === 'alerts' && pendingAlertsCount > 0;
            const showRiskLabel = id === 'kisan-rakshak';

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                className={`flex w-full min-h-[42px] items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#DCEADD] text-[#113121] font-semibold'
                    : 'text-[#DCEFE1] hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{dict.nav[id]}</span>
                </span>
                {showAlertCount && (
                  <span
                    className={`font-mono text-xs shrink-0 ${
                      isActive ? 'text-[#143D2B]' : 'text-[#FDE68A]'
                    }`}
                  >
                    {pendingAlertsCount}
                  </span>
                )}
                {showRiskLabel && (
                  <span
                    className={`font-mono text-[11px] shrink-0 ${
                      isActive
                        ? 'text-[#143D2B]'
                        : currentRiskLevel === 'Critical' || currentRiskLevel === 'High'
                        ? 'text-[#FCA5A5]'
                        : 'text-[#C5E0CE]'
                    }`}
                  >
                    {localizeRiskLevel(currentRiskLevel, language)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#2C5A40] px-4 py-4">
        <span id="sidebar-lang-label" className="block text-xs text-[#B9DEC5]">
          {dict.languageLabel}
        </span>
        <div
          role="group"
          aria-labelledby="sidebar-lang-label"
          className="mt-2 grid grid-cols-3 gap-1 rounded-md bg-[#091D13] p-1"
        >
          {(
            (language === 'hi'
              ? [
                  { code: 'en', label: 'अंग्रेज़ी' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'te', label: 'तेलुगु' },
                ]
              : language === 'te'
              ? [
                  { code: 'en', label: 'ఆంగ్లం' },
                  { code: 'hi', label: 'హిందీ' },
                  { code: 'te', label: 'తెలుగు' },
                ]
              : [
                  { code: 'en', label: 'EN' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'te', label: 'తెలుగు' },
                ]) satisfies Array<{ code: Language; label: string }>
          ).map((item) => (
            <button
              key={item.code}
              type="button"
              data-testid={`sidebar-lang-${item.code}`}
              onClick={() => onChangeLanguage(item.code)}
              className={`min-h-[34px] rounded-xs px-1.5 py-1 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                language === item.code
                  ? 'bg-[#DCEADD] text-[#113121] font-semibold'
                  : 'text-[#B9DEC5] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64">
        {navContent}
      </aside>

      {mobileOpen && (
        <div data-testid="mobile-menu-drawer" className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#0F2D20]/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw]">{navContent}</div>
        </div>
      )}
    </>
  );
}

interface TopBarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onReloadHome: () => void;
  sectionTitle: string;
  farmerLocationLabel: string;
  contextBadgeLabel: string;
  currentRiskLevel: RiskLevel;
  pendingAlertsCount: number;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  voiceAssistantEnabled: boolean;
  onToggleVoiceAssistant: () => void;
  onOpenMobileMenu: () => void;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
}

export function TopBar({
  activeSection,
  onSelectSection,
  onReloadHome,
  sectionTitle,
  farmerLocationLabel,
  contextBadgeLabel,
  currentRiskLevel,
  pendingAlertsCount,
  language,
  onChangeLanguage,
  voiceAssistantEnabled,
  onToggleVoiceAssistant,
  onOpenMobileMenu,
  onPrimaryAction,
  primaryActionLabel,
}: TopBarProps) {
  const dict = TRANSLATIONS[language];
  const isKisanActive = activeSection === 'kisan-rakshak';

  const kisanRiskBadgeClass =
    currentRiskLevel === 'Critical' || currentRiskLevel === 'High'
      ? 'bg-[#DC2626] text-white'
      : currentRiskLevel === 'Moderate'
      ? 'bg-[#D97706] text-white'
      : 'bg-[#15803D] text-white';

  return (
    <header className="sticky top-0 z-20 border-b border-[#2D5E43] bg-[#143323]">
      {/* Row 1: Menu Button + "Rythu Suraksha" Reload Home Brand + Controls */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            data-testid="mobile-menu-button"
            onClick={onOpenMobileMenu}
            aria-label={dict.common.openMenuAria}
            className="inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-md border border-[#2D5E43] bg-[#0F2A1D] text-[#E6F2E8] hover:bg-[#1E4732] lg:hidden cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            data-testid="topbar-brand-reload"
            onClick={onReloadHome}
            title={dict.common.reloadHomeAria}
            aria-label={dict.common.reloadHomeAria}
            className="group inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-md border border-[#3B7C57] bg-[#1B4A31] px-2.5 py-1.5 text-left text-[#F3FAF4] transition-colors hover:border-[#6CC48E] hover:bg-[#235D3E] cursor-pointer"
          >
            <Sprout className="h-4 w-4 text-[#86EFAC] shrink-0" aria-hidden="true" />
            <span className="font-display text-sm font-bold tracking-tight whitespace-nowrap sm:text-base">
              {dict.subBrandName}
            </span>
            <RotateCcw
              className="h-3.5 w-3.5 text-[#A7E3BA] opacity-75 transition-transform group-hover:-rotate-45 group-hover:opacity-100 shrink-0"
              aria-hidden="true"
            />
          </button>

          <div className="hidden sm:block min-w-0 border-l border-[#2D5E43] pl-3">
            <h1 className="font-display truncate text-sm font-semibold text-[#F2F8F3] sm:text-base">
              {sectionTitle}
            </h1>
            <div className="hidden lg:flex min-w-0 items-center gap-2 text-xs text-[#B9D8C2]">
              <span className="truncate">{farmerLocationLabel}</span>
              <span aria-hidden="true" className="shrink-0">·</span>
              <span className="whitespace-nowrap shrink-0">{contextBadgeLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            data-testid="topbar-voice-toggle"
            aria-pressed={voiceAssistantEnabled}
            aria-label={dict.voiceAssistant.topBarToggleAria}
            onClick={onToggleVoiceAssistant}
            className={`inline-flex min-h-[38px] items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 sm:gap-1.5 sm:px-3 cursor-pointer ${
              voiceAssistantEnabled
                ? 'border-[#4ADE80]/50 bg-[#1B4932] text-[#DCFCE7] hover:bg-[#235B3E]'
                : 'border-[#2D5E43] bg-[#0F2A1D] text-[#B9D8C2] hover:bg-[#1A402D]'
            }`}
          >
            {voiceAssistantEnabled ? (
              <Mic className="h-3.5 w-3.5 text-[#86EFAC]" aria-hidden="true" />
            ) : (
              <MicOff className="h-3.5 w-3.5 text-[#9BC2A8]" aria-hidden="true" />
            )}
            <span>
              {voiceAssistantEnabled
                ? dict.voiceAssistant.topBarToggleOn
                : dict.voiceAssistant.topBarToggleOff}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1 rounded-md border border-[#2D5E43] bg-[#0F2A1D] p-0.5">
            {(
              (language === 'hi'
                ? [
                    { code: 'en', label: 'अंग्रेज़ी' },
                    { code: 'hi', label: 'हिन्दी' },
                    { code: 'te', label: 'तेलुगु' },
                  ]
                : language === 'te'
                ? [
                    { code: 'en', label: 'ఆంగ్లం' },
                    { code: 'hi', label: 'హిందీ' },
                    { code: 'te', label: 'తెలుగు' },
                  ]
                : [
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिन्दी' },
                    { code: 'te', label: 'తెలుగు' },
                  ]) satisfies Array<{ code: Language; label: string }>
            ).map((item) => (
              <button
                key={item.code}
                type="button"
                data-testid={`topbar-lang-${item.code}`}
                onClick={() => onChangeLanguage(item.code)}
                className={`min-h-[32px] rounded-xs px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === item.code
                    ? 'bg-[#DCEADD] text-[#113121] font-semibold'
                    : 'text-[#B9D8C2] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onPrimaryAction}
            className="hidden sm:inline-flex min-h-[38px] items-center rounded-md border border-[#3B8B5E] bg-[#256B45] px-2.5 py-2 text-xs font-medium text-white hover:bg-[#2E7D52] whitespace-nowrap shrink-0 sm:min-h-[40px] sm:px-3.5 sm:text-sm cursor-pointer"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>

      {/* Row 2: Top-of-Page "Kisan-Rakshak" Button + One-by-One Page Navigation Strip */}
      <nav
        aria-label={dict.common.topNavAria}
        data-testid="top-section-nav"
        className="w-full max-w-full overflow-x-auto border-t border-[#234D36] bg-[#102B1D] px-3 py-2 sm:px-6 lg:px-6"
      >
        <div className="flex items-center gap-1.5 md:flex-wrap">
          <button
            type="button"
            data-testid="top-nav-kisan-rakshak"
            aria-current={isKisanActive ? 'page' : undefined}
            onClick={() => onSelectSection('kisan-rakshak')}
            className={`inline-flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              isKisanActive
                ? 'border-[#FDE68A] bg-[#FDE68A] text-[#14291D]'
                : 'border-[#F59E0B]/60 bg-[#2A3B1E] text-[#FEF3C7] hover:bg-[#3A4F2A]'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{dict.nav['kisan-rakshak']}</span>
            <span
              className={`rounded-xs px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none ${kisanRiskBadgeClass}`}
            >
              {localizeRiskLevel(currentRiskLevel, language)}
            </span>
          </button>

          <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-[#2D5E43]" />

          {TOP_SIDE_NAV_ITEMS.map(({ id, icon: Icon }) => {
            const isActive = activeSection === id;
            const showAlertCount = id === 'alerts' && pendingAlertsCount > 0;
            return (
              <button
                key={id}
                type="button"
                data-testid={`top-nav-${id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelectSection(id)}
                className={`inline-flex min-h-[32px] shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#DCEADD] bg-[#DCEADD] text-[#113121] font-semibold'
                    : 'border-[#27543B] bg-[#143323] text-[#D2EAD9] hover:border-[#3D7A58] hover:bg-[#1B442F] hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{dict.nav[id]}</span>
                {showAlertCount && (
                  <span
                    className={`rounded-xs px-1 font-mono text-[10px] font-bold ${
                      isActive ? 'bg-[#143D2B] text-white' : 'bg-[#25553A] text-[#FDE68A]'
                    }`}
                  >
                    {pendingAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
