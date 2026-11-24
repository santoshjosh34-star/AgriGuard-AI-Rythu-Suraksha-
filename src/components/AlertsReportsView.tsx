import { useState } from 'react';
import { CheckCircle2, Circle, Download, ShieldAlert } from 'lucide-react';
import type {
  FarmAlert,
  FarmerProfile,
  KisanRakshakAssessment,
  Language,
  WeatherContext,
} from '../types/agriguard';
import { localizePriorityLabel } from '../lib/domainTranslations';
import { TRANSLATIONS } from '../lib/translations';
import { ConfirmActionModal } from './ConfirmActionModal';

interface AlertsReportsViewProps {
  farmer: FarmerProfile;
  weather: WeatherContext;
  assessment: KisanRakshakAssessment;
  alerts: FarmAlert[];
  language: Language;
  onToggleAlertStatus: (id: string) => void;
  onConfirmAlert: (id: string) => void;
}

export function AlertsReportsView({
  farmer,
  weather,
  assessment,
  alerts,
  language,
  onToggleAlertStatus,
  onConfirmAlert,
}: AlertsReportsViewProps) {
  const dict = TRANSLATIONS[language];
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [pendingConfirmAlert, setPendingConfirmAlert] = useState<FarmAlert | null>(null);

  const filtered = alerts.filter((a) =>
    statusFilter === 'all' ? true : a.status === statusFilter
  );

  const pendingCount = alerts.filter((a) => a.status === 'pending').length;
  const completedCount = alerts.filter((a) => a.status === 'completed').length;

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      platform: 'AgriGuard AI',
      language,
      farmerProfile: farmer,
      weatherContext: {
        scenarioTitle: weather.scenarioTitle,
        isSyntheticDemo: weather.isSyntheticDemo,
        dataSource: weather.dataSource,
        lastUpdated: weather.lastUpdated,
        rainfall24hMm: weather.rainfall24hMm,
        windSpeedKmh: weather.windSpeedKmh,
        localFloodStatus: weather.localFloodStatus,
      },
      kisanRakshakAssessment: {
        riskLevel: assessment.riskLevel,
        riskScore: assessment.riskScore,
        confidencePercent: assessment.confidencePercent,
        missingData: assessment.missingData,
        recommendedProtectiveActions: assessment.recommendedProtectiveActions,
      },
      alerts,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agriguard-report-${farmer.district.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#14291D]">
              {dict.alertsView.heading}
            </h2>
            <p className="mt-1 text-sm text-[#355240]">{dict.alertsView.subheading}</p>
          </div>

          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-4 py-2 text-sm font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{dict.alertsView.downloadBtn}</span>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#C5D9C8] pt-4">
          <div className="flex items-center gap-4 font-mono text-xs text-[#355240]">
            <span>
              {pendingCount} {dict.common.pending}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {completedCount} {dict.common.completed}
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-[#B5CEBA] bg-[#D8E7DA] p-1">
            {(
              [
                { id: 'all', label: dict.common.all },
                { id: 'pending', label: dict.common.pending },
                { id: 'completed', label: dict.common.completed },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`min-h-[32px] rounded-xs px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
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
        <section className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-10 text-center text-sm text-[#355240]">
          {dict.alertsView.emptyFilter}
        </section>
      ) : (
        <ul className="space-y-3" data-testid="alerts-list">
          {filtered.map((alert) => {
            const priorityColor =
              alert.priority === 'Urgent'
                ? 'text-[#B91C1C]'
                : alert.priority === 'High'
                ? 'text-[#C2410C]'
                : alert.priority === 'Moderate'
                ? 'text-[#B45309]'
                : 'text-[#15803D]';

            return (
              <li
                key={alert.id}
                className="rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`font-mono font-semibold ${priorityColor}`}>
                        {localizePriorityLabel(alert.priority, language)}
                      </span>
                      <span aria-hidden="true" className="text-[#9EC4A8]">·</span>
                      <span className="text-[#355240]">
                        {alert.status === 'completed'
                          ? dict.alertsView.statusCompleted
                          : dict.alertsView.statusPending}
                      </span>
                      {alert.requiresHumanConfirmation && (
                        <>
                          <span aria-hidden="true" className="text-[#9EC4A8]">·</span>
                          <span className="text-[#5C4315]">
                            {alert.humanConfirmed
                              ? dict.alertsView.farmerConfirmed
                              : dict.alertsView.awaitingConfirm}
                          </span>
                        </>
                      )}
                    </div>

                    <h3
                      className={`mt-1 font-display text-base font-semibold ${
                        alert.status === 'completed'
                          ? 'line-through text-[#4E6C59]'
                          : 'text-[#14291D]'
                      }`}
                    >
                      {alert.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#355240]">
                      <strong className="font-semibold text-[#243F2F]">
                        {dict.alertsView.reasonPrefix}
                      </strong>{' '}
                      {alert.reason}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#14291D]">
                      <strong className="font-semibold">{dict.alertsView.actionPrefix}</strong>{' '}
                      {alert.actionRequired}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {alert.requiresHumanConfirmation && !alert.humanConfirmed && (
                      <button
                        type="button"
                        onClick={() => setPendingConfirmAlert(alert)}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[#D3C49E] bg-[#EFEAD6] px-3 py-1.5 text-xs font-medium text-[#5C4315] hover:bg-[#E5DEC3] whitespace-nowrap"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{dict.alertsView.confirmBtn}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onToggleAlertStatus(alert.id)}
                      className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                        alert.status === 'completed'
                          ? 'border-[#7CC792] bg-[#D8F0DD] text-[#143D2B]'
                          : 'border-[#9EC4A8] bg-[#DCEADD] text-[#14291D] hover:bg-[#CFE1D2]'
                      }`}
                    >
                      {alert.status === 'completed' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>
                        {alert.status === 'completed'
                          ? dict.alertsView.statusCompleted
                          : dict.alertsView.markDoneBtn}
                      </span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmActionModal
        open={Boolean(pendingConfirmAlert)}
        title={dict.alertsView.modalTitle}
        description={
          pendingConfirmAlert
            ? `${dict.alertsView.modalDescPrefix} "${pendingConfirmAlert.title}"? ${dict.alertsView.modalActionLabel} ${pendingConfirmAlert.actionRequired}`
            : ''
        }
        consequenceNote={dict.alertsView.modalConsequence}
        confirmLabel={dict.common.confirmAction}
        cancelLabel={dict.common.cancel}
        closeAriaLabel={dict.common.closeModalAria}
        onCancel={() => setPendingConfirmAlert(null)}
        onConfirm={() => {
          if (pendingConfirmAlert) {
            onConfirmAlert(pendingConfirmAlert.id);
          }
          setPendingConfirmAlert(null);
        }}
      />
    </div>
  );
}
