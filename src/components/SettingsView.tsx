import { useState } from 'react';
import { Mic, MicOff, RotateCcw, ShieldCheck } from 'lucide-react';
import type { Language } from '../types/agriguard';
import { TRANSLATIONS } from '../lib/translations';
import { ConfirmActionModal } from './ConfirmActionModal';

interface SettingsViewProps {
  language: Language;
  voiceAssistantEnabled: boolean;
  onToggleVoiceAssistant: (enabled: boolean) => void;
  onChangeLanguage: (lang: Language) => void;
  onResetWorkspace: () => void;
}

export function SettingsView({
  language,
  voiceAssistantEnabled,
  onToggleVoiceAssistant,
  onChangeLanguage,
  onResetWorkspace,
}: SettingsViewProps) {
  const dict = TRANSLATIONS[language];
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const langOptions: Array<{ code: Language; label: string }> =
    language === 'hi'
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
          { code: 'en', label: 'English (India)' },
          { code: 'hi', label: 'Hindi' },
          { code: 'te', label: 'Telugu' },
        ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <h2 className="font-display text-xl font-semibold text-[#14291D]">
          {dict.nav.settings}
        </h2>
        <p className="mt-1 text-sm text-[#355240]">{dict.settingsView.subheading}</p>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#14291D]">
              {dict.settingsView.prefLangTitle}
            </h3>
            <p className="mt-1 text-xs text-[#355240]">{dict.settingsView.prefLangSub}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {langOptions.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onChangeLanguage(item.code)}
                  className={`min-h-[40px] rounded-md border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    language === item.code
                      ? 'border-[#143D2B] bg-[#143D2B] text-white'
                      : 'border-[#9EC4A8] bg-[#D8E7DA] text-[#14291D] hover:bg-[#CFE1D2]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#C5D9C8] pt-5">
            <h3 className="text-sm font-semibold text-[#14291D]">
              {dict.voiceAssistant.settingsVoiceTitle}
            </h3>
            <p className="mt-1 text-xs text-[#355240]">
              {dict.voiceAssistant.settingsVoiceSub}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="settings-voice-on-btn"
                onClick={() => onToggleVoiceAssistant(true)}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  voiceAssistantEnabled
                    ? 'border-[#143D2B] bg-[#143D2B] text-white'
                    : 'border-[#9EC4A8] bg-[#D8E7DA] text-[#14291D] hover:bg-[#CFE1D2]'
                }`}
              >
                <Mic className="h-4 w-4" aria-hidden="true" />
                <span>{dict.voiceAssistant.settingsVoiceOnLabel}</span>
              </button>
              <button
                type="button"
                data-testid="settings-voice-off-btn"
                onClick={() => onToggleVoiceAssistant(false)}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  !voiceAssistantEnabled
                    ? 'border-[#143D2B] bg-[#143D2B] text-white'
                    : 'border-[#9EC4A8] bg-[#D8E7DA] text-[#14291D] hover:bg-[#CFE1D2]'
                }`}
              >
                <MicOff className="h-4 w-4" aria-hidden="true" />
                <span>{dict.voiceAssistant.settingsVoiceOffLabel}</span>
              </button>
            </div>
          </div>

          <div className="border-t border-[#C5D9C8] pt-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#143D2B]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>{dict.settingsView.commitmentsTitle}</span>
            </div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-[#243F2F]">
              <li>
                <strong>{dict.settingsView.commit1Title}</strong> {dict.settingsView.commit1Body}
              </li>
              <li>
                <strong>{dict.settingsView.commit2Title}</strong> {dict.settingsView.commit2Body}
              </li>
              <li>
                <strong>{dict.settingsView.commit3Title}</strong> {dict.settingsView.commit3Body}
              </li>
              <li>
                <strong>{dict.settingsView.commit4Title}</strong> {dict.settingsView.commit4Body}
              </li>
            </ul>
          </div>

          <div className="border-t border-[#C5D9C8] pt-5">
            <h3 className="text-sm font-semibold text-[#14291D]">
              {dict.settingsView.storageTitle}
            </h3>
            <p className="mt-1 text-xs text-[#355240]">{dict.settingsView.storageSub}</p>
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="mt-3 inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#F5C2C7] bg-[#FEF2F2] px-4 py-2 text-xs font-medium text-[#991B1B] hover:bg-[#FEE2E2]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{dict.settingsView.resetBtn}</span>
            </button>
          </div>
        </div>
      </section>

      <ConfirmActionModal
        open={confirmResetOpen}
        title={dict.settingsView.resetModalTitle}
        description={dict.settingsView.resetModalDesc}
        consequenceNote={dict.settingsView.resetModalNote}
        confirmLabel={dict.settingsView.resetModalConfirm}
        cancelLabel={dict.common.cancel}
        closeAriaLabel={dict.common.closeModalAria}
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          onResetWorkspace();
          setConfirmResetOpen(false);
        }}
      />
    </div>
  );
}
