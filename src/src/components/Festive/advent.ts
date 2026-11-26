/**
 * Season dates are December ordinals: 1 = 1 Dec, 24 = 24 Dec, 0 = 30 Nov,
 * -1 = 29 Nov. Ordinals are calendar days in Europe/Copenhagen, so every
 * user sees the same day regardless of their browser's time zone.
 */
export const CHRISTMAS_EVE = 24;

const DAY_MS = 86_400_000;
const TIME_ZONE = "Europe/Copenhagen";

/** July–December belong to this year's season, January–June to last year's. */
export function seasonYear(now: Date = new Date()): number {
  const { year, month } = copenhagenDate(now);
  return month >= 7 ? year : year - 1;
}

function copenhagenDate(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function ordinalOf(year: number, month: number, day: number, season: number) {
  return (
    Math.round(
      (Date.UTC(year, month - 1, day) - Date.UTC(season, 11, 1)) / DAY_MS,
    ) + 1
  );
}

export function todayOrdinal(now: Date = new Date()): number {
  const { year, month, day } = copenhagenDate(now);
  return ordinalOf(year, month, day, seasonYear(now));
}

/**
 * Ordinals of the four Advent Sundays. The fourth is the last Sunday before
 * 25 December, so the first falls between 27 November and 3 December.
 */
export function adventSundays(season: number): number[] {
  const dec24Weekday = new Date(Date.UTC(season, 11, 24)).getUTCDay();
  const fourth = CHRISTMAS_EVE - dec24Weekday;
  return [fourth - 21, fourth - 14, fourth - 7, fourth];
}

export interface AdventState {
  ordinal: number;
  /** Calendar candle mark burning today, 1–24; 0 before 1 Dec. */
  calendarDay: number;
  /** True from 25 Dec, when the calendar candle has burnt down. */
  spent: boolean;
  /** Advent Sundays reached so far, 0–4. */
  sundaysLit: number;
  /** Snow build-up: 1/24 on 1 Dec, 1 from 24 Dec, 0 before December. */
  buildUp: number;
}

export function adventState(ordinal: number, season: number): AdventState {
  const sundays = adventSundays(season);
  return {
    ordinal,
    calendarDay: Math.min(Math.max(ordinal, 0), CHRISTMAS_EVE),
    spent: ordinal > CHRISTMAS_EVE,
    sundaysLit: sundays.filter((s) => s <= ordinal).length,
    buildUp: Math.min(Math.max(ordinal, 0), CHRISTMAS_EVE) / CHRISTMAS_EVE,
  };
}
