import React, { useEffect, useMemo, useState } from "react";
import { intlFormatDistance } from "date-fns";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock } from "lucide-react";
import { useTheme, useMuiTableColors } from "@/context/ThemeContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { CopilotFact } from "@/state/remote/queries/copilot";

// copilot-insights stores report days in UTC, so ranges are built in UTC too.
export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DAY_MS = 86_400_000;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** selfservice-api and copilot-insights reject longer ranges. */
export const MAX_RANGE_DAYS = 400;

/** GitHub serves usage reports for the last year only. */
const OLDEST_DAY_OFFSET = 365;

export function addDays(day: string, n: number): string {
  return isoDay(new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS));
}

export function today(): string {
  return isoDay(new Date());
}

export function oldestDay(): string {
  return addDays(today(), -OLDEST_DAY_OFFSET);
}

export type RangeSel =
  | { kind: "today" }
  | { kind: "hours"; hours: number }
  | { kind: "last"; days: number }
  | { kind: "month"; year: number; month: number }
  | { kind: "custom"; from: string; to: string };

export const LAST_DAYS = [7, 28, 90];
export const LAST_HOURS = [24];
const HOUR_MS = 3_600_000;
export function thisMonth(): RangeSel {
  const t = today();
  return { kind: "month", year: +t.slice(0, 4), month: +t.slice(5, 7) };
}

function sameRange(a: RangeSel, b: RangeSel): boolean {
  const ra = resolveRange(a);
  const rb = resolveRange(b);
  return a.kind === b.kind && ra.from === rb.from && ra.to === rb.to;
}

/**
 * The start of an hours range, on the hour, as an ISO timestamp; undefined
 * for day ranges.
 */
export function rangeSince(sel: RangeSel): string | undefined {
  if (sel.kind !== "hours") return undefined;
  const now = Date.now();
  return new Date(now - (now % HOUR_MS) - sel.hours * HOUR_MS).toISOString();
}

/**
 * Inclusive from/to; a month still running ends today. Data is kept per UTC
 * day, so an hours range covers every day it touches.
 */
export function resolveRange(sel: RangeSel): { from: string; to: string } {
  const t = today();
  switch (sel.kind) {
    case "today":
      return { from: t, to: t };
    case "hours":
      return { from: isoDay(new Date(rangeSince(sel)!)), to: t };
    case "last":
      return { from: addDays(t, 1 - sel.days), to: t };
    case "month": {
      const from = isoDay(new Date(Date.UTC(sel.year, sel.month - 1, 1)));
      const end = isoDay(new Date(Date.UTC(sel.year, sel.month, 0)));
      return { from, to: end < t ? end : t };
    }
    case "custom":
      return { from: sel.from, to: sel.to };
  }
}

export function rangeError(from: string, to: string): string | null {
  if (!DAY_RE.test(from) || !DAY_RE.test(to))
    return "Pick a start and end date.";
  if (from > to) return "The start date is after the end date.";
  const days = (Date.parse(to) - Date.parse(from)) / DAY_MS + 1;
  if (days > MAX_RANGE_DAYS) {
    return `A range can span at most ${MAX_RANGE_DAYS} days.`;
  }
  return null;
}

export function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export interface MonthDay {
  day: string;
  weekend: boolean;
}

export function monthDays(year: number, month: number): MonthDay[] {
  const n = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1, i + 1));
    const dow = d.getUTCDay();
    return { day: isoDay(d), weekend: dow === 0 || dow === 6 };
  });
}

export type Pace = "on" | "fast" | "over" | "exceeded";

export const PACE_LIMITS = { on: 105, fast: 120 };

export interface BudgetPace {
  pace: Pace;
  spentPct: number;
  timePct: number;
  /** Budget share divided by elapsed workday share; 100 is on pace. */
  pacePct: number;
  avgPerWorkday: number;
  /** Workdays the remaining budget lasts at avgPerWorkday; null with no spend. */
  runwayDays: number | null;
  workdaysLeft: number;
  resetsOn: string;
  daysToReset: number;
}

/**
 * Budget pace for the current month. Workdays are Monday to Friday, with no
 * holidays; today counts as elapsed. Used share up to 5% over the elapsed
 * workday share still counts as on pace.
 */
export function budgetPace(
  amount: number,
  consumed: number,
  days: MonthDay[],
  now: string,
): BudgetPace {
  const workdays = days.filter((d) => !d.weekend);
  const elapsed = workdays.filter((d) => d.day <= now).length;
  const workdaysLeft = workdays.length - elapsed;
  const avgPerWorkday = elapsed > 0 ? consumed / elapsed : 0;
  const runwayDays =
    avgPerWorkday > 0 ? Math.max(0, amount - consumed) / avgPerWorkday : null;
  // A month starting on a weekend has no elapsed workday on its first days;
  // counting one keeps pacePct finite.
  const timePct = (Math.max(elapsed, 1) / workdays.length) * 100;
  const spentPct = amount > 0 ? (consumed / amount) * 100 : 100;
  const pacePct = (spentPct / timePct) * 100;
  const pace: Pace =
    consumed >= amount
      ? "exceeded"
      : pacePct > PACE_LIMITS.fast
      ? "over"
      : pacePct > PACE_LIMITS.on
      ? "fast"
      : "on";
  const resetsOn = addDays(days[days.length - 1].day, 1);
  const daysToReset = Math.round(
    (Date.parse(resetsOn) - Date.parse(now)) / DAY_MS,
  );
  return {
    pace,
    spentPct,
    timePct,
    pacePct,
    avgPerWorkday,
    runwayDays,
    workdaysLeft,
    resetsOn,
    daysToReset,
  };
}

const RANGE_PARAMS = ["range", "month", "from", "to"];

/**
 * Reads `?range=today|24h|7|28|90`, `?month=YYYY-MM` or `?from=&to=`;
 * anything missing or invalid is the current month.
 */
export function rangeFromParams(p: URLSearchParams): RangeSel {
  const m = /^(\d{4})-(\d{2})$/.exec(p.get("month") ?? "");
  if (m) {
    const sel: RangeSel = { kind: "month", year: +m[1], month: +m[2] };
    const r = resolveRange(sel);
    if (+m[2] >= 1 && +m[2] <= 12 && !rangeError(r.from, r.to)) return sel;
  }
  const from = p.get("from") ?? "";
  const to = p.get("to") ?? "";
  if (from && to && !rangeError(from, to)) return { kind: "custom", from, to };
  const range = p.get("range") ?? "";
  if (range === "today") return { kind: "today" };
  const hours = /^(\d+)h$/.exec(range);
  if (hours && LAST_HOURS.includes(+hours[1]))
    return { kind: "hours", hours: +hours[1] };
  const days = Number(range);
  if (LAST_DAYS.includes(days)) return { kind: "last", days };
  return thisMonth();
}

/** Preserves unrelated URL params; the current month has no range param. */
export function withRangeParams(
  p: URLSearchParams,
  sel: RangeSel,
): URLSearchParams {
  const next = new URLSearchParams(p);
  RANGE_PARAMS.forEach((k) => next.delete(k));
  if (sameRange(sel, thisMonth())) return next;
  if (sel.kind === "today") {
    next.set("range", "today");
  } else if (sel.kind === "hours") {
    next.set("range", `${sel.hours}h`);
  } else if (sel.kind === "last") {
    next.set("range", String(sel.days));
  } else if (sel.kind === "month") {
    next.set("month", `${sel.year}-${String(sel.month).padStart(2, "0")}`);
  } else if (sel.kind === "custom") {
    next.set("from", sel.from);
    next.set("to", sel.to);
  }
  return next;
}

export const selectCls =
  "px-2.5 py-1.5 text-[0.8125rem] border border-divider rounded-[5px] bg-surface text-primary cursor-pointer";

const intFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const decFmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const usdFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function fmtInt(n: number | null | undefined): string {
  return intFmt.format(n ?? 0);
}

export function fmtDec(n: number | null | undefined): string {
  return decFmt.format(n ?? 0);
}

const compactFmt = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 2,
});

/** 750K, 8.75M and so on from 100,000 up, which is where a stat tile overflows. */
export function fmtCompact(n: number | null | undefined): string {
  const v = n ?? 0;
  return Math.abs(v) < 100_000
    ? Math.round(v).toString()
    : compactFmt.format(v);
}

export function fmtUsd(n: number | null | undefined): string {
  return usdFmt.format(n ?? 0);
}

const usdShortFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function fmtUsdShort(n: number | null | undefined): string {
  return usdShortFmt.format(n ?? 0);
}

export function fmtDay(day: string | null | undefined): string {
  if (!day) return "-";
  return new Date(`${day.slice(0, 10)}T00:00:00Z`).toLocaleDateString(
    undefined,
    { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  );
}

export function fmtShortDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function fmtAgo(ts: string | null | undefined): string {
  if (!ts) return "never";
  return intlFormatDistance(new Date(ts), new Date());
}

export function daysSince(ts: string | null | undefined): number | null {
  if (!ts) return null;
  return Math.floor((Date.now() - new Date(ts).getTime()) / 86_400_000);
}

export function metric(
  m: Record<string, number | boolean> | undefined | null,
  key: string,
): number {
  const v = m?.[key];
  return typeof v === "number" ? v : 0;
}

export function acceptanceRate(accepted: number, generated: number): string {
  if (generated <= 0) return "-";
  return `${Math.round((accepted / generated) * 100)}%`;
}

export function Section({
  title,
  tip,
  actions,
  children,
  className,
}: {
  /** Omit when the content renders its own header. */
  title?: string;
  tip?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        {title && (
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <SectionLabel as="h2" tip={tip}>
              {title}
            </SectionLabel>
            {actions}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export function Freshness({
  generatedAt,
  label = "Data",
}: {
  generatedAt?: string | null;
  label?: string;
}) {
  if (!generatedAt) return null;
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-[11px] text-muted"
      title={new Date(generatedAt).toLocaleString()}
    >
      <Clock size={11} aria-hidden="true" />
      {label} collected {fmtAgo(generatedAt)}
    </span>
  );
}

export interface ChartSeries {
  key: string;
  label: string;
  kind: "bar" | "line";
  color: string;
  darkColor?: string;
  right?: boolean;
}

/**
 * Pixel heights of a neighbouring table's header and footer rows. The plot's
 * top gridline then falls on the header's bottom rule and the x-axis line on
 * the footer's top rule, with the legend in the header band.
 */
export interface ChartFrame {
  top: number;
  bottom: number;
}

export function DailyChart({
  data,
  series,
  height = 240,
  frame,
  formatLeft = fmtInt,
  formatRight = fmtInt,
  xKey = "day",
  formatX = fmtShortDay,
  formatXLabel = fmtDay,
  leftWidth = 48,
  legend = true,
  highlight,
}: {
  data: Record<string, any>[];
  series: ChartSeries[];
  /** Pixels, or a CSS length such as "100%" to fill a sized parent. */
  height?: number | string;
  frame?: ChartFrame;
  formatLeft?: (n: number) => string;
  formatRight?: (n: number) => string;
  xKey?: string;
  formatX?: (x: string) => string;
  formatXLabel?: (x: string) => string;
  leftWidth?: number;
  legend?: boolean;
  /**
   * A series key to draw on top at full strength. The others are dimmed and
   * left out of the tooltip.
   */
  highlight?: string;
}) {
  const { isDark } = useTheme();
  const axis = isDark ? "#64748b" : "#afafaf";
  const grid = isDark ? "#1e2d3d" : "#eeeeee";
  const hasRight = series.some((s) => s.right);

  if (data.length === 0) {
    return <EmptyState>No activity in this range.</EmptyState>;
  }

  return (
    <div className="relative" style={{ width: "100%", height }}>
      {frame && (
        // Recharts adds a top legend's measured height to the plot offset,
        // which would move the top gridline off the header rule.
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-center gap-3 text-[11px]"
          style={{ height: frame.top }}
        >
          {series.map((s) => {
            const color = isDark ? s.darkColor ?? s.color : s.color;
            return (
              <span
                key={s.key}
                className="inline-flex items-center gap-1"
                style={{ color }}
              >
                <span
                  className={s.kind === "bar" ? "size-2.5" : "h-0.5 w-3"}
                  style={{ background: color }}
                />
                {s.label}
              </span>
            );
          })}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: frame?.top ?? 4, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="2 2" stroke={grid} vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={formatX}
            tick={{ fontSize: 11, fill: axis }}
            stroke={axis}
            interval="preserveStartEnd"
            minTickGap={24}
            {...(frame && { height: frame.bottom })}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={formatLeft}
            tick={{ fontSize: 11, fill: axis }}
            stroke={axis}
            width={leftWidth}
            allowDecimals={false}
          />
          {hasRight && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatRight}
              tick={{ fontSize: 11, fill: axis }}
              stroke={axis}
              width={56}
            />
          )}
          <Tooltip
            labelFormatter={(d) => formatXLabel(String(d))}
            formatter={(value: number, _name, item) => {
              const s = series.find((x) => x.key === item.dataKey);
              return [
                s?.right ? formatRight(value) : formatLeft(value),
                s?.label ?? String(item.dataKey),
              ];
            }}
            contentStyle={{
              background: isDark ? "#1e293b" : "#ffffff",
              border: `1px solid ${isDark ? "#334155" : "#d9dcde"}`,
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          {!frame && legend && (
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(key) =>
                series.find((s) => s.key === key)?.label ?? key
              }
            />
          )}
          {/* SVG paints in document order, so the highlight goes last. */}
          {[
            ...series.filter((s) => s.key !== highlight),
            ...series.filter((s) => s.key === highlight),
          ].map((s) => {
            const color = isDark ? s.darkColor ?? s.color : s.color;
            const yAxisId = s.right ? "right" : "left";
            const dimmed = highlight !== undefined && s.key !== highlight;
            return s.kind === "bar" ? (
              <Bar
                key={s.key}
                dataKey={s.key}
                yAxisId={yAxisId}
                fill={color}
                radius={[2, 2, 0, 0]}
                maxBarSize={18}
              />
            ) : (
              <Line
                key={s.key}
                dataKey={s.key}
                yAxisId={yAxisId}
                stroke={color}
                strokeWidth={s.key === highlight ? 3 : 2}
                strokeOpacity={dimmed ? 0.15 : 1}
                tooltipType={dimmed ? "none" : undefined}
                activeDot={dimmed ? false : undefined}
                dot={false}
                type="monotone"
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface Column<T> {
  id: string;
  header: string;
  value: (row: T) => string | number | null | undefined;
  cell?: (row: T) => React.ReactNode;
  align?: "left" | "right";
  size?: number;
}

/**
 * Column toggle for DataTable. The choice is kept in localStorage under
 * storageKey; hidden lists the columns hidden before the user picks.
 */
export interface ColumnToggle {
  storageKey: string;
  hidden?: string[];
}

/**
 * Styles MRT's menus (the column toggle) like the app's own menus and Switch.
 * Rules are nested under the paper so they outrank the sx MRT sets on the
 * list and items.
 */
function menuStyle(isDark: boolean) {
  return {
    marginTop: 4,
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border-card)",
    borderRadius: 8,
    boxShadow: "var(--shadow-overlay)",
    backgroundImage: "none",
    "& .MuiMenu-list": {
      padding: 4,
      backgroundColor: "var(--color-surface)",
    },
    "& .MuiMenu-list > .MuiBox-root": {
      padding: "2px 4px 4px",
      gap: 4,
    },
    "& .MuiButton-root": {
      minWidth: 0,
      padding: "4px 6px",
      fontFamily: "var(--mono)",
      fontSize: "10px",
      fontWeight: 600,
      letterSpacing: "0.08em",
      color: "var(--color-action)",
      borderRadius: 5,
      "&:hover": { backgroundColor: "var(--color-surface-muted)" },
    },
    "& .MuiDivider-root": {
      margin: "0 0 4px",
      borderColor: "var(--color-border-divider)",
    },
    "& .MuiMenuItem-root": {
      minHeight: 0,
      padding: "5px 8px",
      borderRadius: 5,
      "&:hover": { backgroundColor: "var(--color-surface-muted)" },
    },
    "& .MuiFormControlLabel-root": { margin: 0, gap: 10 },
    "& .MuiFormControlLabel-label": {
      fontFamily: "inherit",
      fontSize: "0.8125rem",
      color: "var(--color-text-primary)",
    },
    "& .MuiSwitch-root": { width: 36, height: 20, padding: 0 },
    "& .MuiSwitch-switchBase": {
      padding: 2,
      color: "#fff",
      "&.Mui-checked": { color: "#fff", transform: "translateX(16px)" },
      "&.Mui-checked + .MuiSwitch-track": {
        backgroundColor: isDark ? "#60a5fa" : "#002b45",
        opacity: 1,
      },
    },
    "& .MuiSwitch-thumb": {
      width: 16,
      height: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
    },
    "& .MuiSwitch-track": {
      borderRadius: 10,
      backgroundColor: isDark ? "#334155" : "#cccccc",
      opacity: 1,
    },
  };
}

function loadVisibility(toggle?: ColumnToggle): Record<string, boolean> {
  if (!toggle) return {};
  try {
    const saved = localStorage.getItem(toggle.storageKey);
    if (saved) return JSON.parse(saved);
  } catch {
    // Unreadable or blocked storage falls back to the defaults.
  }
  return Object.fromEntries((toggle.hidden ?? []).map((id) => [id, false]));
}

/**
 * Material React Table on desktop, a paged card list on mobile, where MRT's
 * fixed column widths overflow.
 */
export function DataTable<T>({
  columns,
  data,
  pageSize = 25,
  initialSort,
  emptyMessage = "No rows.",
  columnToggle,
  toolbar,
  searchColumns,
}: {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  initialSort?: { id: string; desc: boolean };
  emptyMessage?: string;
  columnToggle?: ColumnToggle;
  toolbar?: React.ReactNode;
  /**
   * Columns the search box matches. Setting it always shows the search box;
   * without it the box shows only on paged tables and matches every column.
   */
  searchColumns?: string[];
}) {
  const isMobile = useIsMobile();
  const { isDark } = useTheme();
  const colors = useMuiTableColors();
  const [page, setPage] = useState(1);
  const [visibility, setVisibility] = useState(() =>
    loadVisibility(columnToggle),
  );
  const storageKey = columnToggle?.storageKey;
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(visibility));
    } catch {
      // Keep the choice for this page view when storage is unavailable.
    }
  }, [storageKey, visibility]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: { mode: isDark ? "dark" : "light" },
        components: {
          MuiMenu: { styleOverrides: { paper: menuStyle(isDark) } },
        },
      }),
    [isDark],
  );

  // Callers pass searchColumns inline; a string keeps the memo stable.
  const searchKey = searchColumns?.join(",");
  const mrtColumns = useMemo<MRT_ColumnDef<any>[]>(
    () =>
      columns.map((c) => ({
        id: c.id,
        header: c.header,
        accessorFn: (row: T) => c.value(row) ?? "",
        // An explicit undefined overrides defaultColumn.size.
        ...(c.size !== undefined && { size: c.size }),
        enableGlobalFilter: searchKey
          ? searchKey.split(",").includes(c.id)
          : true,
        ...(c.cell && { Cell: ({ row }: any) => c.cell!(row.original) }),
        ...(c.align === "right" && {
          muiTableHeadCellProps: { align: "right" as const },
          muiTableBodyCellProps: { align: "right" as const },
        }),
      })),
    [columns, searchKey],
  );

  const toolbarRow = toolbar && (
    <div className="flex items-center gap-3 flex-wrap mb-3">{toolbar}</div>
  );

  if (data.length === 0) {
    return (
      <>
        {toolbarRow}
        <EmptyState>{emptyMessage}</EmptyState>
      </>
    );
  }

  if (isMobile) {
    const shown = columns.filter((c) => visibility[c.id] !== false);
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / 10));
    const currentPage = Math.min(page, totalPages);
    const pageStart = (currentPage - 1) * 10;
    return (
      <div>
        {toolbarRow}
        <div className="flex flex-col gap-2">
          {data.slice(pageStart, pageStart + 10).map((row, i) => (
            <Card key={i}>
              <CardContent className="p-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.8125rem]">
                {shown.map((c) => (
                  <React.Fragment key={c.id}>
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-muted self-center">
                      {c.header}
                    </span>
                    <span className="text-primary text-right min-w-0 break-words">
                      {c.cell ? c.cell(row) : c.value(row) ?? "-"}
                    </span>
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageStart={pageStart}
          pageSize={10}
          total={total}
          onPrev={() => setPage(Math.max(1, currentPage - 1))}
          onNext={() => setPage(Math.min(totalPages, currentPage + 1))}
        />
      </div>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <MaterialReactTable
        columns={mrtColumns}
        data={data as any[]}
        // MRT replaces the whole pagination object, so pageIndex must be set
        // or the paginated row model slices on NaN.
        initialState={{
          pagination: { pageIndex: 0, pageSize },
          sorting: initialSort ? [initialSort] : [],
          showGlobalFilter: true,
        }}
        // MRT's default column size is 180px, which makes five-column tables
        // wider than a half-width section. Sizes are minimums under the
        // automatic table layout, so columns still widen to fill the table.
        defaultColumn={{ size: 80, minSize: 40 }}
        state={{ columnVisibility: visibility }}
        onColumnVisibilityChange={setVisibility}
        enableGlobalFilter={true}
        globalFilterFn="contains"
        enableColumnActions={false}
        enableColumnFilters={false}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={!!columnToggle}
        enableTopToolbar={
          !!toolbar ||
          !!columnToggle ||
          !!searchColumns ||
          data.length > pageSize
        }
        enableBottomToolbar={data.length > pageSize}
        renderTopToolbarCustomActions={
          toolbar
            ? () => (
                <div className="flex items-center gap-3 flex-wrap">
                  {toolbar}
                </div>
              )
            : undefined
        }
        // Sized like selectCls: 31px tall, 13px text, divider border. The
        // styles go on InputProps because MRT's top toolbar replaces the
        // field's own sx with { zIndex: 2 }.
        muiSearchTextFieldProps={{
          InputProps: {
            sx: {
              height: 31,
              padding: "0 4px 0 8px",
              fontSize: "0.8125rem",
              borderRadius: "5px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-primary)",
              "& .MuiInputBase-input": { padding: 0 },
              "& .MuiSvgIcon-root": { fontSize: 16 },
              "& .MuiInputAdornment-root": { marginLeft: "4px" },
              "& .MuiIconButton-root": { padding: "3px" },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--color-border-divider)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--color-border-card)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--color-action)",
                borderWidth: 1,
              },
            },
          },
        }}
        muiTableHeadCellProps={{
          sx: {
            // MRT sizes the sort label without the icon's 4px margins, so the
            // icon overlaps the header text.
            "& .MuiTableSortLabel-icon": { margin: 0 },
            "& .Mui-TableHeadCell-Content-Labels": { gap: "4px" },
            fontFamily: "var(--mono)",
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: colors.textMuted,
            backgroundColor: colors.bgMuted,
            padding: "6px 12px",
            borderBottom: `1px solid ${colors.borderColor}`,
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            fontSize: "0.8125rem",
            color: colors.textPrimary,
            backgroundColor: colors.bg,
            padding: "6px 12px",
            borderBottom: `1px solid ${colors.borderColor}`,
            // The auto layout squeezes text columns before numeric ones, so
            // names would wrap; a table too wide scrolls instead.
            whiteSpace: "nowrap",
          },
        }}
        muiTablePaperProps={{
          elevation: 0,
          sx: { borderRadius: 0, backgroundColor: colors.bg },
        }}
        muiTopToolbarProps={{
          sx: {
            background: colors.bg,
            minHeight: 0,
            // MRT positions this box absolutely inside a 3.5rem min-height
            // toolbar; relative lets the toolbar take the box's own height.
            "& > .MuiBox-root:not(.Mui-ToolbarDropZone)": {
              position: "relative",
              padding: "0 0 12px",
              alignItems: "center",
            },
            "& .MuiIconButton-root": { color: colors.textMuted },
            "& .MuiSvgIcon-root": { color: colors.textMuted },
          },
        }}
        muiBottomToolbarProps={{
          sx: {
            background: colors.bg,
            color: colors.textPrimary,
            borderTop: `1px solid ${colors.borderColor}`,
            "& .MuiIconButton-root": { color: colors.textMuted },
            "& .MuiTablePagination-root": { color: colors.textPrimary },
          },
        }}
      />
    </ThemeProvider>
  );
}

export function rollUpFacts(
  facts: CopilotFact[] | undefined,
  by: "key1" | "key2" = "key1",
): CopilotFact[] {
  const out = new Map<string, Record<string, number>>();
  for (const f of facts ?? []) {
    const key = (by === "key1" ? f.key1 : f.key2) || "unknown";
    const acc = out.get(key) ?? {};
    for (const [m, v] of Object.entries(f.metrics ?? {})) {
      acc[m] = (acc[m] ?? 0) + v;
    }
    out.set(key, acc);
  }
  return [...out.entries()]
    .map(([key1, metrics]) => ({ key1, metrics }))
    .sort(
      (a, b) =>
        metric(b.metrics, "user_initiated_interaction_count") +
        metric(b.metrics, "code_generation_activity_count") -
        (metric(a.metrics, "user_initiated_interaction_count") +
          metric(a.metrics, "code_generation_activity_count")),
    );
}

export function FactTable({
  facts,
  keyHeader,
  labelFor = (k) => k,
}: {
  facts: CopilotFact[];
  keyHeader: string;
  labelFor?: (key: string) => string;
}) {
  if (facts.length === 0) {
    return <EmptyState>No data.</EmptyState>;
  }
  const cols: { key: string; label: string }[] = [
    { key: "user_initiated_interaction_count", label: "Prompts" },
    { key: "code_generation_activity_count", label: "Generated" },
    { key: "code_acceptance_activity_count", label: "Accepted" },
    { key: "loc_added_sum", label: "Lines added" },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[0.8125rem]">
        <thead>
          <tr className="border-b border-divider">
            <th className="text-left py-1.5 pr-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted">
              {keyHeader}
            </th>
            {cols.map((c) => (
              <th
                key={c.key}
                className="text-right py-1.5 pl-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted whitespace-nowrap"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {facts.map((f) => (
            <tr
              key={`${f.key1}/${f.key2 ?? ""}`}
              className="border-b border-divider last:border-b-0"
            >
              <td className="py-1.5 pr-3 text-primary">{labelFor(f.key1)}</td>
              {cols.map((c) => (
                <td
                  key={c.key}
                  className="py-1.5 pl-3 text-right font-mono text-secondary"
                >
                  {fmtInt(metric(f.metrics, c.key))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const FEATURE_LABELS: Record<string, string> = {
  agent_edit: "Agent edits",
  chat_inline: "Inline chat",
  chat_panel_agent_mode: "Chat: agent mode",
  chat_panel_ask_mode: "Chat: ask mode",
  chat_panel_edit_mode: "Chat: edit mode",
  chat_panel_custom_mode: "Chat: custom mode",
  chat_panel_plan_mode: "Chat: plan mode",
  chat_panel_unknown_mode: "Chat: other",
  cloud_agent: "Cloud agent",
  code_completion: "Code completion",
  code_review_active: "Code review (requested)",
  code_review_passive: "Code review (automatic)",
  copilot_app: "Copilot app",
  copilot_cli: "Copilot CLI",
  github_app: "GitHub app",
  vscode_agent: "VS Code agent",
};

export function featureLabel(key: string): string {
  return FEATURE_LABELS[key] ?? key.replace(/_/g, " ");
}
