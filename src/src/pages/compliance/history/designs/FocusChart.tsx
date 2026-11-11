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

const DASH = "5 3";

/**
 * Design 5: a short chart of the headline and every other series. A chip
 * hides or shows its series, and hovering one brings its line forward.
 * Recharts throws under display:none, so mobile gets the bar strip instead.
 * Status models plot only the headline.
 */
export function FocusChart({
  model,
  view,
  onSelect,
  tall,
}: HistoryDesignProps) {
  const { isDark } = useTheme();
  const isMobile = useIsMobile();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [focus, setFocus] = useState<string | null>(null);
  const { points, series, selectedIndex } = model;

  if (isMobile)
    return (
      <DailyBars model={model} view={view} onSelect={onSelect} tall={tall} />
    );
  if (points.length < 2) return <HistoryEmpty model={model} />;

  const headline = series[0];
  const others = model.kind === "rate" ? series.slice(1) : [];
  const ink = isDark ? "#94a3b8" : "#666666";
  const grid = isDark ? "#1e2d3d" : "#eeeeee";
  const rows = points.map((p) => ({ period: p.period, ...p.values }));
  // On the last point the marker lines up with the plot's right edge, where
  // it reads as the line dropping to the floor.
  const selectedPeriod =
    selectedIndex < points.length - 1
      ? points[selectedIndex]?.period
      : undefined;
  const unit = model.kind === "rate" ? "%" : "% met";
  const shownOthers = others.filter((s) => !hidden.has(s.key));
  const drawn = [headline, ...shownOthers];
  const faded = (key: string) => focus !== null && focus !== key;
  const [lo, hi] = fitDomain(
    model,
    points.flatMap((p) => drawn.map((s) => p.values[s.key])),
  );
  const steps = tall ? 4 : 2;
  // Rounding can repeat a value on a narrow range.
  const ticks = [
    ...new Set(
      Array.from({ length: steps + 1 }, (_, i) =>
        Math.round(lo + ((hi - lo) * i) / steps),
      ),
    ),
  ];

  const toggle = (key: string) =>
    setHidden((prev) => {
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
          {others.length > 0 ? `; click a ${model.breakdown} to hide it` : ""})
        </HistoryLabel>
        <div
          className="flex flex-wrap gap-1"
          onPointerLeave={() => setFocus(null)}
        >
          {others.map((s) => {
            const on = !hidden.has(s.key);
            return (
              <button
                key={s.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s.key)}
                onPointerEnter={() => setFocus(on ? s.key : null)}
                onFocus={() => setFocus(on ? s.key : null)}
                onBlur={() => setFocus(null)}
                title={s.name}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6875rem] transition-colors",
                  on
                    ? "border-card bg-surface-muted text-primary"
                    : "border-transparent text-muted hover:text-secondary",
                )}
              >
                <svg
                  aria-hidden
                  width="14"
                  height="2"
                  className={cn("overflow-visible", !on && "opacity-40")}
                >
                  <line
                    x1="0"
                    x2="14"
                    y1="1"
                    y2="1"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeDasharray={s.dashed ? "4 2" : undefined}
                  />
                </svg>
                {s.shortName}
              </button>
            );
          })}
        </div>
      </div>
      <div className={cn("w-full", tall ? "h-[300px]" : "h-[140px]")}>
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
            {/* No allowDataOverflow: it clips lines to the plot area, cutting
                half the stroke off a line at the domain's edge. The domain is
                fitted to the drawn values, so none fall outside it. */}
            <YAxis
              domain={[lo, hi]}
              ticks={ticks}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: ink }}
              stroke={grid}
              width={36}
            />
            {ticks.slice(1, -1).map((t) => (
              <ReferenceLine key={t} y={t} stroke={grid} />
            ))}
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
                strokeDasharray="3 3"
              />
            )}
            <Area
              dataKey={headline.key}
              name={headline.name}
              stroke={headline.color}
              strokeWidth={2}
              strokeOpacity={faded(headline.key) ? 0.35 : 1}
              fill={headline.color}
              fillOpacity={lo === 0 ? 0.1 : 0}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            {/* The focused line is drawn last, so it sits on top. */}
            {[...shownOthers]
              .sort((a, b) => Number(a.key === focus) - Number(b.key === focus))
              .map((s) => (
                <Line
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={focus === s.key ? 2.5 : 1.5}
                  strokeOpacity={faded(s.key) ? 0.2 : 1}
                  strokeDasharray={s.dashed ? DASH : undefined}
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
