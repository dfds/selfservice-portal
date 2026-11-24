import { addMonths, addWeeks, addYears, format } from "date-fns";
import {
  type ComplianceDay,
  dateToDay,
  dayToDate,
  isComplianceDay,
  shiftDay,
} from "./period";

// A range bound is either an absolute day ("2026-07-01") or an offset from
// today in Grafana's syntax: "now", "now-30d", "now-2w", "now-6M", "now-1y".
// Relative bounds stay relative in the URL, so a shared link keeps sliding.
// Only whole days exist here; "M" is months, and "m" is accepted for it too.

export type RangeExpr = string;

export type HistoryRange = { from: RangeExpr; to: RangeExpr };

export const DEFAULT_RANGE: HistoryRange = { from: "now-6M", to: "now" };

const RELATIVE = /^now(?:-(\d{1,4})([dwmMy]))?$/;

/** The day `expr` names, or `undefined` when it doesn't parse. */
export function resolveExpr(
  expr: RangeExpr,
  today: ComplianceDay,
): ComplianceDay | undefined {
  const value = expr.trim();
  if (isComplianceDay(value)) return value;
  const m = RELATIVE.exec(value);
  if (!m) return undefined;
  if (!m[1]) return today;
  const n = Number(m[1]);
  const base = dayToDate(today);
  switch (m[2]) {
    case "d":
      return shiftDay(today, -n);
    case "w":
      return dateToDay(addWeeks(base, -n));
    case "y":
      return dateToDay(addYears(base, -n));
    default:
      return dateToDay(addMonths(base, -n));
  }
}

export function isRelative(expr: RangeExpr): boolean {
  return RELATIVE.test(expr.trim());
}

export type ResolvedRange = {
  /** Inclusive, both UTC days; `end` is never after today. */
  start: ComplianceDay;
  end: ComplianceDay;
};

export type RangeErrors = { from?: string; to?: string };

/** Checks a range typed into the picker. */
export function validateRange(
  range: HistoryRange,
  today: ComplianceDay,
):
  | { resolved: ResolvedRange; errors?: undefined }
  | { errors: RangeErrors; resolved?: undefined } {
  const start = resolveExpr(range.from, today);
  const end = resolveExpr(range.to, today);
  const errors: RangeErrors = {};
  const hint = "Use YYYY-MM-DD, now, or now-30d / 2w / 6M / 1y";
  if (start === undefined) errors.from = hint;
  if (end === undefined) errors.to = hint;
  if (start !== undefined && start > today) {
    errors.from = "Can't be after today";
  } else if (start !== undefined && end !== undefined && start > end) {
    errors.from = "Must be on or before To";
  }
  if (errors.from || errors.to || start === undefined || end === undefined) {
    return { errors };
  }
  return { resolved: { start, end: end > today ? today : end } };
}

/** A range from the URL; an invalid one falls back to the default. */
export function resolveRange(
  range: HistoryRange,
  today: ComplianceDay,
): { range: HistoryRange; resolved: ResolvedRange } {
  const checked = validateRange(range, today);
  if (checked.resolved) return { range, resolved: checked.resolved };
  const fallback = validateRange(DEFAULT_RANGE, today);
  return { range: DEFAULT_RANGE, resolved: fallback.resolved! };
}

export const QUICK_RANGES: (HistoryRange & { label: string })[] = [
  { label: "Last 7 days", from: "now-7d", to: "now" },
  { label: "Last 14 days", from: "now-14d", to: "now" },
  { label: "Last 30 days", from: "now-30d", to: "now" },
  { label: "Last 90 days", from: "now-90d", to: "now" },
  { label: "Last 6 months", from: "now-6M", to: "now" },
  { label: "Last 1 year", from: "now-1y", to: "now" },
  { label: "Last 2 years", from: "now-2y", to: "now" },
  { label: "Last 3 years", from: "now-3y", to: "now" },
];

export function sameRange(a: HistoryRange, b: HistoryRange): boolean {
  return a.from.trim() === b.from.trim() && a.to.trim() === b.to.trim();
}

/** "13 May – 12 Nov 2026"; "29 Dec 2025 – 4 Jan 2026"; "12 Nov 2026". */
export function formatSpan({ start, end }: ResolvedRange): string {
  const s = dayToDate(start);
  const e = dayToDate(end);
  if (start === end) return format(s, "d MMM yyyy");
  if (start.slice(0, 4) !== end.slice(0, 4)) {
    return `${format(s, "d MMM yyyy")} – ${format(e, "d MMM yyyy")}`;
  }
  return `${format(s, "d MMM")} – ${format(e, "d MMM yyyy")}`;
}

/** The quick range's name, or the span's dates. */
export function rangeLabel(
  range: HistoryRange,
  resolved: ResolvedRange,
): string {
  const quick = QUICK_RANGES.find((q) => sameRange(q, range));
  return quick ? quick.label : formatSpan(resolved);
}

// ─── Recently used absolute ranges ───────────────────────────────────────────

const RECENT_KEY = "ssu-compliance-recent-ranges";
const RECENT_MAX = 4;

export function readRecentRanges(): HistoryRange[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (r): r is HistoryRange =>
          typeof r?.from === "string" &&
          typeof r?.to === "string" &&
          isComplianceDay(r.from) &&
          isComplianceDay(r.to),
      )
      .slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

/** Remembers `range` when both bounds are absolute days, newest first. */
export function rememberRange(range: HistoryRange): HistoryRange[] {
  const current = readRecentRanges();
  if (!isComplianceDay(range.from) || !isComplianceDay(range.to)) {
    return current;
  }
  const next = [range, ...current.filter((r) => !sameRange(r, range))].slice(
    0,
    RECENT_MAX,
  );
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}
