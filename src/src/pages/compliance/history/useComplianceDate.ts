import { useCallback, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useComplianceHistory } from "@/state/remote/queries/capabilities";
import {
  type AvailableDays,
  type ComplianceDay,
  type ComplianceView,
  availableDays,
  isComplianceDay,
  nextPeriodWithData,
  previousPeriodWithData,
  resolveSnapshotDate,
  utcToday,
} from "./period";

// ─── URL state codec ─────────────────────────────────────────────────────────
// `?date=YYYY-MM-DD&view=day|week|month`. Today and "day" are the defaults and
// are left out of the URL. The "history" scope uses `historyDate` and
// `historyView`, so a page's history chart can show another period than its
// cards.

const DATE_PARAM = "date";
const VIEW_PARAM = "view";

export type ComplianceDateScope = "page" | "history";

const PARAMS: Record<ComplianceDateScope, { date: string; view: string }> = {
  page: { date: DATE_PARAM, view: VIEW_PARAM },
  history: { date: "historyDate", view: "historyView" },
};

function readView(p: URLSearchParams, key: string): ComplianceView {
  const v = p.get(key);
  return v === "week" || v === "month" ? v : "day";
}

/** A malformed, future or current date reads as today. */
function readDate(
  p: URLSearchParams,
  key: string,
  today: ComplianceDay,
): ComplianceDay {
  const d = p.get(key);
  return isComplianceDay(d) && d < today ? d : today;
}

function writeUrl(
  prev: URLSearchParams,
  keys: { date: string; view: string },
  patch: { view?: ComplianceView; date?: ComplianceDay },
  today: ComplianceDay,
): URLSearchParams {
  const next = new URLSearchParams(prev);
  if (patch.view !== undefined) {
    if (patch.view === "day") next.delete(keys.view);
    else next.set(keys.view, patch.view);
  }
  if (patch.date !== undefined) {
    if (patch.date >= today) next.delete(keys.date);
    else next.set(keys.date, patch.date);
  }
  return next;
}

/** `to` with the current page's date and view parameters, both scopes, added. */
export function withComplianceParams(
  to: string,
  search: URLSearchParams | string,
): string {
  const source =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const [path, query = ""] = to.split("?");
  const target = new URLSearchParams(query);
  for (const key of Object.values(PARAMS).flatMap((k) => [k.date, k.view])) {
    const value = source.get(key);
    if (value) target.set(key, value);
  }
  const qs = target.toString();
  return qs ? `${path}?${qs}` : path;
}

/** `withComplianceParams` bound to the current location. */
export function useComplianceLink(): (to: string) => string {
  const { search } = useLocation();
  return useCallback(
    (to: string) => withComplianceParams(to, search),
    [search],
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export type ComplianceDateState = {
  scope: ComplianceDateScope;
  view: ComplianceView;
  /** The day in the URL, or today. */
  selected: ComplianceDay;
  /** Today's UTC date. */
  today: ComplianceDay;
  /** The day to pass to the compliance hooks; `undefined` reads live data. */
  snapshotDate: ComplianceDay | undefined;
  isLive: boolean;
  /** Recorded days, oldest first; `undefined` until the history has loaded. */
  days: AvailableDays | undefined;
  oldestDate: ComplianceDay | undefined;
  canStepPrev: boolean;
  canStepNext: boolean;
  setView: (view: ComplianceView) => void;
  setDate: (day: ComplianceDay) => void;
  stepPrev: () => void;
  stepNext: () => void;
  goToToday: () => void;
};

export function useComplianceDate(
  scope: ComplianceDateScope = "page",
): ComplianceDateState {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: history } = useComplianceHistory();
  const today = utcToday();

  const keys = PARAMS[scope];
  const view = readView(searchParams, keys.view);
  const selected = readDate(searchParams, keys.date, today);

  const days = useMemo(
    () => (history ? availableDays(history.items) : undefined),
    [history],
  );
  const snapshotDate = resolveSnapshotDate(view, selected, days, today);
  const previous = days
    ? previousPeriodWithData(view, selected, days)
    : undefined;
  const next = nextPeriodWithData(view, selected, days ?? [], today);

  const updateUrl = useCallback(
    (patch: { view?: ComplianceView; date?: ComplianceDay }) => {
      setSearchParams((prev) => writeUrl(prev, keys, patch, today), {
        replace: true,
      });
    },
    [setSearchParams, keys, today],
  );

  return {
    scope,
    view,
    selected,
    today,
    snapshotDate,
    isLive: snapshotDate === undefined,
    days,
    oldestDate: history?.oldestDate ?? undefined,
    canStepPrev: previous !== undefined,
    canStepNext: next !== undefined,
    setView: (v) => updateUrl({ view: v }),
    setDate: (date) => updateUrl({ date }),
    stepPrev: () => {
      if (previous !== undefined) updateUrl({ date: previous });
    },
    stepNext: () => {
      if (next !== undefined) updateUrl({ date: next });
    },
    goToToday: () => updateUrl({ date: today }),
  };
}
