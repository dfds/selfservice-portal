import React, { useState } from "react";
import { format } from "date-fns";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/context/ThemeContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { dayToDate, periodLabel } from "../period";
import { DailyBars } from "./DailyBars";
import {
  HistoryCard,
  HistoryEmpty,
  HistoryLabel,
  type HistoryDesignProps,
  fitDomain,
} from "./shared";

// Above this many series the categorical slots run out, so the others are
// drawn as grey context lines and one chip highlights a single series.
const MAX_COLOURED_SERIES = 5;

/**
 * Design 5: a short chart of the headline. Other series are off by default
 * and added with the chips. Recharts throws under display:none, so mobile
 * gets the bar strip instead. Status models plot only the headline.
 */
export function FocusChart({ model, view, onSelect }: HistoryDesignProps) {
  const { isDark } = useTheme();
  const isMobile = useIsMobile();
  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const { points, series, selectedIndex } = model;

  if (isMobile)
    return <DailyBars model={model} view={view} onSelect={onSelect} />;
  if (points.length < 2) return <HistoryEmpty model={model} />;

  const headline = series[0];
  const others = model.kind === "rate" ? series.slice(1) : [];
  const highlightMode = others.length > MAX_COLOURED_SERIES;
  const ink = isDark ? "#94a3b8" : "#666666";
  const grid = isDark ? "#1e2d3d" : "#eeeeee";
  const context = isDark ? "#334155" : "#d9dcde";
  const rows = points.map((p) => ({ period: p.period, ...p.values }));
  const selectedPeriod = points[selectedIndex]?.period;
  const unit = model.kind === "rate" ? "%" : "% met";
  // Highlight mode draws every series, the grey ones included.
  const drawn = highlightMode
    ? [headline, ...others]
    : [headline, ...others.filter((s) => enabled.has(s.key))];
  const [lo, hi] = fitDomain(
    model,
    points.flatMap((p) => drawn.map((s) => p.values[s.key])),
  );
  const mid = Math.round((lo + hi) / 2);

  const toggle = (key: string) =>
    setEnabled((prev) => {
      if (highlightMode) return prev.has(key) ? new Set() : new Set([key]);
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <HistoryCard className="pb-2">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <HistoryLabel>
          ({model.subject} per {view}
          {others.length > 0
            ? highlightMode
              ? `; pick a ${model.breakdown} to highlight`
              : `; add a ${model.breakdown}`
            : ""}
          )
        </HistoryLabel>
        <div className="flex flex-wrap gap-1">
          {others.map((s) => {
            const on = enabled.has(s.key);
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s.key)}
                title={s.name}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6875rem] transition-colors",
                  on
                    ? "border-card bg-surface-muted text-primary"
                    : "border-transparent text-muted hover:text-secondary",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-[2px] w-3 rounded-full",
                    !on && "opacity-40",
                  )}
                  style={{ background: s.color }}
                />
                {s.shortName}
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rows}
            margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
            onClick={
              onSelect &&
              ((state) => {
                const p = points.find((x) => x.period === state?.activeLabel);
                if (p) onSelect(p.date);
              })
            }
            className={onSelect ? "cursor-pointer" : undefined}
          >
            <XAxis
              dataKey="period"
              tickFormatter={(d: string) =>
                format(dayToDate(d), view === "month" ? "MMM yy" : "d MMM")
              }
              tick={{ fontSize: 10, fill: ink }}
              stroke={grid}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[lo, hi]}
              ticks={[lo, mid, hi]}
              allowDataOverflow
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: ink }}
              stroke={grid}
              width={36}
            />
            <ReferenceLine y={mid} stroke={grid} />
            <Tooltip
              labelFormatter={(period) => periodLabel(view, period as string)}
              formatter={(value, name) => [
                value === null || value === undefined ? "—" : `${value}${unit}`,
                name,
              ]}
              itemSorter={(item) => -Number(item.value ?? 0)}
              contentStyle={{
                background: isDark ? "#1e293b" : "#ffffff",
                border: `1px solid ${isDark ? "#334155" : "#d9dcde"}`,
                borderRadius: 6,
                fontSize: 12,
              }}
              labelStyle={{
                color: isDark ? "#e2e8f0" : "#002b45",
                fontWeight: 600,
              }}
            />
            {selectedPeriod && (
              <ReferenceLine
                x={selectedPeriod}
                stroke={isDark ? "#e2e8f0" : "#002b45"}
                strokeOpacity={0.5}
              />
            )}
            {highlightMode &&
              others
                .filter((s) => !enabled.has(s.key))
                .map((s) => (
                  <Line
                    key={s.key}
                    dataKey={s.key}
                    name={s.name}
                    stroke={context}
                    strokeWidth={1}
                    dot={false}
                    activeDot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
            <Area
              dataKey={headline.key}
              name={headline.name}
              stroke={headline.color}
              strokeWidth={2}
              fill={headline.color}
              fillOpacity={lo === 0 ? 0.1 : 0}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            {others
              .filter((s) => enabled.has(s.key))
              .map((s) => (
                <Line
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={highlightMode ? 2 : 1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </HistoryCard>
  );
}
