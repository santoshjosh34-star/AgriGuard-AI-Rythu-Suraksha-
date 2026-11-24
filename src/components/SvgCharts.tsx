import { useState } from 'react';
import {
  localizeRiskLevel,
  localizeTimelineKind,
  localizeTimelineLabel,
} from '../lib/domainTranslations';
import { TRANSLATIONS } from '../lib/translations';
import type { Language, RiskFactorItem, WeatherForecastPoint } from '../types/agriguard';

interface WeatherTimelineChartProps {
  timeline: WeatherForecastPoint[];
  language: Language;
}

export function WeatherTimelineChart({ timeline, language }: WeatherTimelineChartProps) {
  const dict = TRANSLATIONS[language];
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-[#355240]">
        {dict.charts.emptyTimeline}
      </div>
    );
  }

  const width = 620;
  const height = 220;
  const padLeft = 42;
  const padRight = 42;
  const padTop = 24;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxRain = Math.max(80, ...timeline.map((p) => p.rainfallMm));
  const maxWind = Math.max(60, ...timeline.map((p) => p.windKmh));
  const slotW = plotW / timeline.length;

  const windPoints = timeline
    .map((p, idx) => {
      const cx = padLeft + idx * slotW + slotW / 2;
      const cy = padTop + plotH - (p.windKmh / maxWind) * plotH;
      return `${cx},${cy}`;
    })
    .join(' ');

  const activePoint = hoveredIdx !== null ? timeline[hoveredIdx] : null;
  const rainUnit = language === 'hi' ? 'मिमी' : language === 'te' ? 'మి.మీ' : 'mm';
  const windUnit = language === 'hi' ? 'किमी/घं' : language === 'te' ? 'కి.మీ/గం' : 'km/h';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#355240]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#143D2B]" aria-hidden="true" />
            {dict.charts.rainfallLegend}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3.5 bg-[#B45309]" aria-hidden="true" />
            {dict.charts.windLegend}
          </span>
        </div>
        {activePoint ? (
          <span className="font-mono text-[#14291D]">
            {localizeTimelineLabel(activePoint.label, language)} ·{' '}
            {localizeTimelineKind(activePoint.kind, language)} · {activePoint.rainfallMm} {rainUnit} ·{' '}
            {activePoint.windKmh} {windUnit}
          </span>
        ) : (
          <span>{dict.charts.hoverHint}</span>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full min-w-[440px]"
          role="img"
          aria-label={dict.charts.timelineAria}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padTop + plotH * (1 - ratio);
            const rainTick = Math.round(maxRain * ratio);
            const windTick = Math.round(maxWind * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#C4D7C7"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[#355240] text-[10px] font-mono"
                >
                  {rainTick}
                </text>
                <text
                  x={width - padRight + 6}
                  y={y + 4}
                  textAnchor="start"
                  className="fill-[#92400E] text-[10px] font-mono"
                >
                  {windTick}
                </text>
              </g>
            );
          })}

          {timeline.map((pt, idx) => {
            const barW = Math.min(44, slotW * 0.48);
            const x = padLeft + idx * slotW + (slotW - barW) / 2;
            const barH = (pt.rainfallMm / maxRain) * plotH;
            const y = padTop + plotH - barH;
            const isObs = pt.kind === 'Confirmed Observation';
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={pt.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={padLeft + idx * slotW}
                  y={padTop}
                  width={slotW}
                  height={plotH}
                  fill={isHovered ? 'rgba(20, 61, 43, 0.04)' : 'transparent'}
                />
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(2, barH)}
                  rx="2"
                  fill={isObs ? '#2E6F4E' : '#143D2B'}
                  opacity={isObs ? 0.85 : 0.95}
                />
                <text
                  x={x + barW / 2}
                  y={Math.max(14, y - 5)}
                  textAnchor="middle"
                  className="fill-[#14291D] text-[10px] font-mono"
                >
                  {pt.rainfallMm}
                </text>
                <text
                  x={padLeft + idx * slotW + slotW / 2}
                  y={height - 14}
                  textAnchor="middle"
                  className="fill-[#14291D] text-[11px] font-medium"
                >
                  {localizeTimelineLabel(pt.label, language)}
                </text>
              </g>
            );
          })}

          <polyline
            fill="none"
            stroke="#B45309"
            strokeWidth="2.2"
            strokeLinejoin="round"
            points={windPoints}
          />

          {timeline.map((pt, idx) => {
            const cx = padLeft + idx * slotW + slotW / 2;
            const cy = padTop + plotH - (pt.windKmh / maxWind) * plotH;
            return (
              <circle
                key={`dot-${pt.label}`}
                cx={cx}
                cy={cy}
                r={hoveredIdx === idx ? 5 : 3.5}
                fill="#E9F2EA"
                stroke="#B45309"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

interface RiskBreakdownChartProps {
  factors: RiskFactorItem[];
  language: Language;
}

export function RiskBreakdownChart({ factors, language }: RiskBreakdownChartProps) {
  const dict = TRANSLATIONS[language];

  return (
    <div className="space-y-4">
      {factors.map((item) => {
        const pct = item.maxScore > 0 ? Math.round((item.impactScore / item.maxScore) * 100) : 0;
        const barColor =
          item.severity === 'Critical'
            ? 'bg-[#B91C1C]'
            : item.severity === 'High'
            ? 'bg-[#C2410C]'
            : item.severity === 'Moderate'
            ? 'bg-[#B45309]'
            : 'bg-[#15803D]';

        return (
          <div key={item.factor} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-[#14291D]">{item.factor}</span>
              <span className="font-mono text-xs text-[#355240] shrink-0">
                {localizeRiskLevel(item.severity, language)} · {item.impactScore} / {item.maxScore}{' '}
                {dict.charts.ptsUnit}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-xs bg-[#CBE0CE]">
              <div
                className={`h-full transition-all duration-200 ${barColor}`}
                style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
              />
            </div>
            <p className="text-xs leading-relaxed text-[#355240]">{item.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
