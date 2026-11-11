import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TabGroup } from "@/components/ui/TabGroup";
import { useTheme } from "@/context/ThemeContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { useComplianceHistory } from "@/state/remote/queries/capabilities";
import type { ComplianceDailySummary } from "@/state/remote/queries/compliance.types";
import { complianceColor } from "../utils";
import {
  type ComplianceDay,
  type ComplianceView,
  dayToDate,
  periodContains,
  periodEnd,
  periodLabel,
  periodStart,
  shiftDay,
} from "./period";
import {
  bucketHistory,
  overallPct,
  requirementIntroductions,
  requirementPct,
} from "./series";
import type { ComplianceDateState } from "./useComplianceDate";

// Below this many recorded days the heatmap and chart say too little.
const MIN_DAYS_FOR_TIMELINE = 7;

const WEEKS_PER_PAGE = 53;
const DAYS_PER_PAGE = WEEKS_PER_PAGE * 7;

// Categorical slots 1–5, in a fixed order per requirement; checked with the
// dataviz palette validator against both surfaces.
export const SERIES_LIGHT = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#6250d6",
  "#e34948",
];
export const SERIES_DARK = [
  "#3987e5",
  "#d95926",
  "#199e70",
  "#c98500",
  "#d55181",
  "#008300",
  "#9085e9",
  "#e66767",
];

const OVERALL_KEY = "overall";

/** Last day of the heatmap page `page` (0 = the page ending this week). */
function pageEnd(today: ComplianceDay, page: number): ComplianceDay {
  return shiftDay(periodEnd("week", today), -DAYS_PER_PAGE * page);
}

function pageStart(end: ComplianceDay): ComplianceDay {
  return shiftDay(end, 1 - DAYS_PER_PAGE);
}

function pageFor(today: ComplianceDay, day: ComplianceDay): number {
  const end = dayToDate(periodEnd("week", today)).getTime();
  const days = Math.round((end - dayToDate(day).getTime()) / 86_400_000);
  return Math.max(0, Math.floor(days / DAYS_PER_PAGE));
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

const HATCH =
  "repeating-linear-gradient(45deg, var(--color-border-card) 0 1.5px, transparent 1.5px 4px)";

function Heatmap({
  date,
  byDay,
  start,
  end,
}: {
  date: ComplianceDateState;
  byDay: Map<ComplianceDay, ComplianceDailySummary>;
  start: ComplianceDay;
  end: ComplianceDay;
}) {
  const columns = useMemo(() => {
    const weeks: ComplianceDay[][] = [];
    for (let d = start; d <= end; d = shiftDay(d, 7)) {
      weeks.push(Array.from({ length: 7 }, (_, i) => shiftDay(d, i)));
    }
    return weeks;
  }, [start, end]);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-grid grid-cols-[auto_1fr] gap-x-1.5">
        <div />
        <div className="flex gap-[2px] pb-1 font-mono text-[0.5625rem] text-muted">
          {columns.map((week) => {
            const first = week.find((d) => d.endsWith("-01"));
            return (
              <span
                key={week[0]}
                className="w-[11px] overflow-visible whitespace-nowrap"
              >
                {first ? format(dayToDate(first), "MMM") : ""}
              </span>
            );
          })}
        </div>
        <div className="grid grid-rows-7 gap-[2px] font-mono text-[0.5625rem] leading-[11px] text-muted">
          {["Mon", "", "Wed", "", "Fri", "", ""].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="flex gap-[2px]">
          {columns.map((week) => (
            <div key={week[0]} className="grid grid-rows-7 gap-[2px]">
              {week.map((day) => {
                const selected = periodContains(date.view, date.selected, day);
                const outline = selected
                  ? "outline outline-[1.5px] outline-offset-[0.5px] outline-[var(--color-brand)]"
                  : "";
                if (day > date.today) {
                  return <span key={day} className="h-[11px] w-[11px]" />;
                }
                const item = byDay.get(day);
                const isToday = day === date.today;
                if (!item && !isToday) {
                  return (
                    <span
                      key={day}
                      title={`${periodLabel("day", day)}: no data`}
                      className={cn("h-[11px] w-[11px] rounded-[2px]", outline)}
                      style={{ background: HATCH }}
                    />
                  );
                }
                const pct = item ? overallPct(item) : undefined;
                const text = isToday
                  ? `Today (live)${
                      pct !== undefined ? `, ${pct}% at last capture` : ""
                    }`
                  : `${periodLabel("day", day)}: ${pct}% fully compliant`;
                return (
                  <button
                    key={day}
                    type="button"
                    aria-label={text}
                    title={text}
                    aria-pressed={selected}
                    onClick={() => date.setDate(day)}
                    className={cn(
                      "h-[11px] w-[11px] rounded-[2px] transition-transform hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-action)]",
                      isToday && !item && "border border-[var(--color-action)]",
                      outline,
                    )}
                    style={
                      pct !== undefined
                        ? { background: complianceColor(pct) }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[0.625rem] text-muted">
        <span>Fully compliant capabilities:</span>
        {[
          { label: "<50%", color: complianceColor(0) },
          { label: "50–79%", color: complianceColor(50) },
          { label: "≥80%", color: complianceColor(80) },
        ].map(({ label, color }) => (
          <span key={label} className="inline-flex items-center gap-1">
            <span
              className="h-[9px] w-[9px] rounded-[2px]"
              style={{ background: color }}
            />
            {label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <span
            className="h-[9px] w-[9px] rounded-[2px]"
            style={{ background: HATCH }}
          />
          No data
        </span>
      </div>
    </div>
  );
}

// ─── Trend chart ─────────────────────────────────────────────────────────────

type Series = { key: string; name: string; color: string; width: number };

type ChartRow = Record<string, number | null | string> & {
  period: ComplianceDay;
  date: ComplianceDay;
};

function tickFormat(view: ComplianceView) {
  return (period: ComplianceDay) =>
    format(dayToDate(period), view === "month" ? "MMM yy" : "d MMM");
}

function TrendChart({
  date,
  rows,
  series,
  introductions,
}: {
  date: ComplianceDateState;
  rows: ChartRow[];
  series: Series[];
  introductions: { period: ComplianceDay; name: string; color: string }[];
}) {
  const { isDark } = useTheme();
  const ink = isDark ? "#94a3b8" : "#666666";
  const grid = isDark ? "#1e2d3d" : "#eeeeee";
  const selectedPeriod = periodStart(date.view, date.selected);
  const hasSelected = rows.some((r) => r.period === selectedPeriod);

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={rows}
          margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
          onClick={(state) => {
            const row = rows.find((r) => r.period === state?.activeLabel);
            if (row) date.setDate(row.date);
          }}
          className="cursor-pointer"
        >
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="period"
            tickFormatter={tickFormat(date.view)}
            tick={{ fontSize: 11, fill: ink }}
            stroke={grid}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: ink }}
            stroke={grid}
            width={44}
          />
          <Tooltip
            labelFormatter={(period) =>
              periodLabel(date.view, period as string)
            }
            formatter={(value, name) => [
              value === null || value === undefined ? "—" : `${value}%`,
              name,
            ]}
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
          <Legend
            iconType="plainline"
            wrapperStyle={{ fontSize: 11, color: ink }}
          />
          {introductions.map((intro) => (
            <ReferenceLine
              key={intro.name}
              x={intro.period}
              stroke={intro.color}
              strokeDasharray="3 3"
              label={{
                value: `${intro.name} added`,
                position: "insideTopLeft",
                fontSize: 10,
                fill: ink,
              }}
            />
          ))}
          {hasSelected && (
            <ReferenceLine
              x={selectedPeriod}
              stroke={isDark ? "#e2e8f0" : "#002b45"}
              strokeWidth={1.5}
            />
          )}
          {series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={s.width}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendTable({
  view,
  rows,
  series,
}: {
  view: ComplianceView;
  rows: ChartRow[];
  series: Series[];
}) {
  return (
    <div className="max-h-[260px] overflow-auto rounded-[6px] border border-divider">
      <table className="w-full border-collapse text-[0.75rem]">
        <thead className="sticky top-0 bg-surface">
          <tr className="text-left font-mono text-[0.625rem] uppercase tracking-[0.08em] text-muted">
            <th className="px-3 py-2 font-semibold">Period</th>
            {series.map((s) => (
              <th key={s.key} className="px-3 py-2 text-right font-semibold">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...rows].reverse().map((row) => (
            <tr key={row.period} className="border-t border-divider">
              <td className="whitespace-nowrap px-3 py-1.5 text-primary">
                {periodLabel(view, row.period)}
              </td>
              {series.map((s) => (
                <td
                  key={s.key}
                  className="px-3 py-1.5 text-right font-mono text-secondary"
                >
                  {row[s.key] === null || row[s.key] === undefined
                    ? "—"
                    : `${row[s.key]}%`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

/**
 * The overview's history: a year heatmap of fully-compliant capabilities per
 * day, and a trend of the overall and per-requirement rates bucketed by view.
 */
export function ComplianceTimeline({ date }: { date: ComplianceDateState }) {
  const { data: history, isFetched } = useComplianceHistory();
  const { isDark } = useTheme();
  const isMobile = useIsMobile();
  const [display, setDisplay] = useState<"chart" | "table">("chart");

  const [page, setPage] = useState(() => pageFor(date.today, date.selected));
  useEffect(() => {
    setPage(pageFor(date.today, date.selected));
  }, [date.today, date.selected]);

  const items = useMemo(() => history?.items ?? [], [history]);
  const byDay = useMemo(
    () => new Map(items.map((item) => [item.date, item])),
    [items],
  );

  const end = pageEnd(date.today, page);
  const start = pageStart(end);
  const oldest = date.oldestDate;
  const canPageBack = oldest !== undefined && oldest < start;

  const { rows, series, introductions } = useMemo(() => {
    const palette = isDark ? SERIES_DARK : SERIES_LIGHT;
    const latest = items[items.length - 1];
    const requirements = (latest?.requirements ?? []).map((r, i) => ({
      key: r.requirementId,
      name: r.displayName ?? r.categoryName,
      color: palette[i % palette.length],
      width: 1.5,
    }));
    const series: Series[] = [
      {
        key: OVERALL_KEY,
        name: "Fully compliant",
        color: isDark ? "#e2e8f0" : "#002b45",
        width: 2.5,
      },
      ...requirements,
    ];
    const inWindow = items.filter((i) => i.date >= start && i.date <= end);
    const rows: ChartRow[] = bucketHistory(inWindow, date.view).map((b) => {
      const row: ChartRow = {
        period: b.period,
        date: b.item.date,
        [OVERALL_KEY]: overallPct(b.item),
      };
      for (const r of requirements) row[r.key] = requirementPct(b.item, r.key);
      return row;
    });
    const introductions = [...requirementIntroductions(items)]
      .filter(([, day]) => day >= start && day <= end)
      .map(([id, day]) => {
        const s = requirements.find((r) => r.key === id);
        return {
          period: periodStart(date.view, day),
          name: s?.name ?? id,
          color: s?.color ?? palette[0],
        };
      });
    return { rows, series, introductions };
  }, [items, isDark, start, end, date.view]);

  if (!isFetched && !history) {
    return <Skeleton className="h-[180px] w-full rounded-[8px]" />;
  }

  if (items.length < MIN_DAYS_FOR_TIMELINE) {
    return (
      <div className="rounded-[8px] border border-dashed border-card bg-surface px-4 py-6 text-center text-[0.8125rem] text-secondary">
        {oldest
          ? `History is being collected since ${format(
              dayToDate(oldest),
              "d MMM yyyy",
            )}.`
          : "History is being collected. The first snapshot is recorded within the hour."}{" "}
        The timeline appears once {MIN_DAYS_FOR_TIMELINE} days are recorded.
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-card bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-[#0e7cc1] dark:text-[#60a5fa]">
          {"// History "}
          <span className="font-normal tracking-[0.1em] text-muted">
            (UTC days)
          </span>
        </div>
        <div className="inline-flex items-center gap-1 font-mono text-[0.6875rem] text-secondary">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!canPageBack}
            aria-label="Previous year"
            className="rounded p-1 hover:bg-surface-muted hover:text-action disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="min-w-[130px] text-center">
            {format(dayToDate(start), "MMM yyyy")} –{" "}
            {format(dayToDate(end > date.today ? date.today : end), "MMM yyyy")}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Next year"
            className="rounded p-1 hover:bg-surface-muted hover:text-action disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <Heatmap date={date} byDay={byDay} start={start} end={end} />

      {/* Recharts throws under display:none, so the chart is unmounted on mobile. */}
      {!isMobile && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[0.75rem] text-secondary">
              Compliance rate per {date.view}, end of period
            </span>
            <TabGroup<"chart" | "table">
              tabs={[
                { id: "chart" as const, label: "Chart" },
                { id: "table" as const, label: "Table" },
              ]}
              value={display}
              onChange={setDisplay}
            />
          </div>
          {display === "chart" ? (
            <TrendChart
              date={date}
              rows={rows}
              series={series}
              introductions={introductions}
            />
          ) : (
            <TrendTable view={date.view} rows={rows} series={series} />
          )}
        </div>
      )}
    </div>
  );
}
