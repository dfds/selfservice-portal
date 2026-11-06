import {
  addDays,
  endOfISOWeek,
  endOfMonth,
  format,
  getISOWeek,
  isValid,
  parse,
  startOfISOWeek,
  startOfMonth,
} from "date-fns";

// A compliance day is a UTC calendar day, kept as "YYYY-MM-DD". Strings of
// that form sort chronologically, so they are compared as strings.
//
// date-fns works in local time. A day is parsed to local midnight and
// formatted back with `format`, which round-trips the calendar date in any
// time zone. Only `utcToday` reads the clock; calling `toISOString` on a
// parsed day would shift it by the local offset.

export type ComplianceDay = string;

export type ComplianceView = "day" | "week" | "month";

export const COMPLIANCE_VIEWS: ComplianceView[] = ["day", "week", "month"];

const DAY_FORMAT = "yyyy-MM-dd";

/** Local midnight of `day`, for date-fns and the MUI calendar. */
export function dayToDate(day: ComplianceDay): Date {
  return parse(day, DAY_FORMAT, new Date(2000, 0, 1));
}

/** The calendar date of a local `Date`, such as one the MUI calendar returns. */
export function dateToDay(date: Date): ComplianceDay {
  return format(date, DAY_FORMAT);
}

const toDate = dayToDate;
const toDay = dateToDay;

export function utcToday(now: Date = new Date()): ComplianceDay {
  return now.toISOString().slice(0, 10);
}

/** True for a real calendar date written as "YYYY-MM-DD". */
export function isComplianceDay(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = toDate(value);
  return isValid(date) && toDay(date) === value;
}

export function shiftDay(day: ComplianceDay, days: number): ComplianceDay {
  return toDay(addDays(toDate(day), days));
}

/** First day of the period containing `day`. Weeks are ISO: Monday to Sunday. */
export function periodStart(
  view: ComplianceView,
  day: ComplianceDay,
): ComplianceDay {
  if (view === "week") return toDay(startOfISOWeek(toDate(day)));
  if (view === "month") return toDay(startOfMonth(toDate(day)));
  return day;
}

/** Last day of the period containing `day`. */
export function periodEnd(
  view: ComplianceView,
  day: ComplianceDay,
): ComplianceDay {
  if (view === "week") return toDay(endOfISOWeek(toDate(day)));
  if (view === "month") return toDay(endOfMonth(toDate(day)));
  return day;
}

export function periodContains(
  view: ComplianceView,
  period: ComplianceDay,
  day: ComplianceDay,
): boolean {
  return periodStart(view, period) <= day && day <= periodEnd(view, period);
}

/** "Week 42 · 13–19 Oct 2026"; "Week 1 · 29 Dec 2025 – 4 Jan 2026". */
export function isoWeekLabel(day: ComplianceDay): string {
  const start = toDate(periodStart("week", day));
  const end = toDate(periodEnd("week", day));
  const week = `Week ${getISOWeek(start)}`;
  if (start.getFullYear() !== end.getFullYear()) {
    return `${week} · ${format(start, "d MMM yyyy")} – ${format(
      end,
      "d MMM yyyy",
    )}`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${week} · ${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;
  }
  return `${week} · ${format(start, "d")}–${format(end, "d MMM yyyy")}`;
}

/** "15 Oct 2026", "Week 42 · 13–19 Oct 2026" or "October 2026". */
export function periodLabel(view: ComplianceView, day: ComplianceDay): string {
  if (view === "week") return isoWeekLabel(day);
  if (view === "month") return format(toDate(day), "MMMM yyyy");
  return format(toDate(day), "d MMM yyyy");
}

/** Recorded days, sorted oldest first. */
export type AvailableDays = readonly ComplianceDay[];

/** The days with a stored snapshot, oldest first. */
export function availableDays(
  items: readonly { date: ComplianceDay }[] | undefined,
): AvailableDays {
  return (items ?? []).map((item) => item.date).sort();
}

// Index of the first element greater than `day`.
function upperBound(days: AvailableDays, day: ComplianceDay): number {
  let low = 0;
  let high = days.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (days[mid] <= day) low = mid + 1;
    else high = mid;
  }
  return high;
}

/** The latest recorded day on or before `day`, if any. */
export function lastAvailableOnOrBefore(
  days: AvailableDays,
  day: ComplianceDay,
): ComplianceDay | undefined {
  const i = upperBound(days, day);
  return i > 0 ? days[i - 1] : undefined;
}

/** The earliest recorded day after `day`, if any. */
export function firstAvailableAfter(
  days: AvailableDays,
  day: ComplianceDay,
): ComplianceDay | undefined {
  const i = upperBound(days, day);
  return i < days.length ? days[i] : undefined;
}

export function periodHasData(
  view: ComplianceView,
  period: ComplianceDay,
  days: AvailableDays,
): boolean {
  const last = lastAvailableOnOrBefore(days, periodEnd(view, period));
  return last !== undefined && last >= periodStart(view, period);
}

/**
 * The snapshot day to read for the period containing `selected`, or
 * `undefined` for live data when that period contains `today`.
 *
 * Week and month show their end-of-period state: the last recorded day in the
 * period. With no recorded day in it, or before `days` has loaded, this is the
 * period's last day, which the API answers with 404.
 */
export function resolveSnapshotDate(
  view: ComplianceView,
  selected: ComplianceDay,
  days: AvailableDays | undefined,
  today: ComplianceDay,
): ComplianceDay | undefined {
  if (periodContains(view, selected, today) || selected > today) {
    return undefined;
  }
  const end = periodEnd(view, selected);
  if (view === "day" || !days) return end;
  const last = lastAvailableOnOrBefore(days, end);
  return last !== undefined && last >= periodStart(view, selected) ? last : end;
}

/**
 * The day representing the previous period with data, or `undefined` when
 * there is none. For week and month this is the period's last recorded day.
 */
export function previousPeriodWithData(
  view: ComplianceView,
  selected: ComplianceDay,
  days: AvailableDays,
): ComplianceDay | undefined {
  // The latest recorded day before this period is also the latest in its own.
  return lastAvailableOnOrBefore(
    days,
    shiftDay(periodStart(view, selected), -1),
  );
}

/**
 * The day representing the next period with data, or `undefined` when the
 * selected period already contains `today`. The period containing `today` is
 * live, so it always counts as having data; it is returned as `today`.
 */
export function nextPeriodWithData(
  view: ComplianceView,
  selected: ComplianceDay,
  days: AvailableDays,
  today: ComplianceDay,
): ComplianceDay | undefined {
  if (periodContains(view, selected, today) || selected > today) {
    return undefined;
  }
  const day = firstAvailableAfter(days, periodEnd(view, selected));
  if (day === undefined || periodContains(view, day, today) || day > today) {
    return today;
  }
  return resolveSnapshotDate(view, day, days, today);
}
