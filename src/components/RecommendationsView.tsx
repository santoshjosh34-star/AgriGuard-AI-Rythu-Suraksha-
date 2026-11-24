import { useState } from 'react';
import { CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';
import type { AdvisoryRecommendation, Language } from '../types/agriguard';
import { localizeCropName, localizeGuidanceType } from '../lib/domainTranslations';
import { TRANSLATIONS } from '../lib/translations';
import { SpokenOutputButton } from './VoiceControls';

interface RecommendationsViewProps {
  recommendations: AdvisoryRecommendation[];
  language: Language;
  onToggleAcknowledge: (id: string) => void;
  onGoToAiStaff: () => void;
}

export function RecommendationsView({
  recommendations,
  language,
  onToggleAcknowledge,
  onGoToAiStaff,
}: RecommendationsViewProps) {
  const dict = TRANSLATIONS[language];
  const [filter, setFilter] = useState<'all' | 'general' | 'expert'>('all');

  const dateLocale = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';

  const filtered = recommendations.filter((rec) => {
    if (filter === 'general') return rec.guidanceType === 'General Agronomic Guidance';
    if (filter === 'expert') return rec.guidanceType === 'Requires KVK / Expert Confirmation';
    return true;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#14291D]">
              {dict.recommendationsView.heading}
            </h2>
            <p className="mt-1 text-sm text-[#355240]">{dict.recommendationsView.subheading}</p>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-1">
            {(
              [
                { id: 'all', label: dict.recommendationsView.tabAll },
                { id: 'general', label: dict.recommendationsView.tabGeneral },
                { id: 'expert', label: dict.recommendationsView.tabExpert },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`min-h-[34px] rounded-xs px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-[#143D2B] text-white'
                    : 'text-[#355240] hover:text-[#14291D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-10 text-center">
          <FileCheck2 className="mx-auto h-8 w-8 text-[#355240]" aria-hidden="true" />
          <h3 className="mt-3 font-display text-base font-semibold text-[#14291D]">
            {dict.recommendationsView.emptyTitle}
          </h3>
          <p className="mt-1 text-sm text-[#355240]">{dict.recommendationsView.emptySub}</p>
          <button
            type="button"
            onClick={onGoToAiStaff}
            className="mt-4 min-h-[40px] rounded-md bg-[#143D2B] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2D20]"
          >
            {dict.common.runOrchestrator}
          </button>
        </section>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec) => {
            const isExpert = rec.guidanceType === 'Requires KVK / Expert Confirmation';
            return (
              <article
                key={rec.id}
                className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#355240]">
                      <span
                        className={`font-semibold ${
                          isExpert ? 'text-[#B45309]' : 'text-[#143D2B]'
                        }`}
                      >
                        {localizeGuidanceType(rec.guidanceType, language)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {dict.recommendationsView.cropPrefix} {localizeCropName(rec.crop, language)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">
                        {new Date(rec.createdAt).toLocaleDateString(dateLocale)}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-[#14291D]">
                      {rec.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <SpokenOutputButton
                      text={`${rec.title}. ${rec.summary}. ${rec.steps.join('. ')}`}
                      language={language}
                      listenLabel={dict.common.listenSummary}
                      stopLabel={dict.common.stopVoice}
                    />
                    <button
                      type="button"
                      onClick={() => onToggleAcknowledge(rec.id)}
                      className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                        rec.acknowledged
                          ? 'border-[#7CC792] bg-[#D8F0DD] text-[#143D2B]'
                          : 'border-[#9EC4A8] bg-[#DCEADD] text-[#14291D] hover:bg-[#CFE1D2]'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {rec.acknowledged
                          ? dict.recommendationsView.reviewed
                          : dict.recommendationsView.markReviewed}
                      </span>
                    </button>
                  </div>
                </div>

                {rec.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-[#243F2F]">{rec.summary}</p>
                )}

                {rec.steps.length > 0 && (
                  <ol className="mt-4 space-y-2">
                    {rec.steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] px-3 py-2 text-sm text-[#14291D]"
                      >
                        <span className="font-mono text-xs font-semibold text-[#143D2B] pt-0.5">
                          0{idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}

                {isExpert && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-[#5C4315]">
                    <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{dict.recommendationsView.kvkNotice}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
