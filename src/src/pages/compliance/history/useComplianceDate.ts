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
// are left out of the URL.

const DATE_PARAM = "date";
const VIEW_PARAM = "view";

function readView(p: URLSearchParams): ComplianceView {
  const v = p.get(VIEW_PARAM);
  return v === "week" || v === "month" ? v : "day";
}

/** A malformed, future or current date reads as today. */
function readDate(p: URLSearchParams, today: ComplianceDay): ComplianceDay {
  const d = p.get(DATE_PARAM);
  return isComplianceDay(d) && d < today ? d : today;
}

function writeUrl(
  prev: URLSearchParams,
  patch: { view?: ComplianceView; date?: ComplianceDay },
  today: ComplianceDay,
): URLSearchParams {
  const next = new URLSearchParams(prev);
  if (patch.view !== undefined) {
    if (patch.view === "day") next.delete(VIEW_PARAM);
    else next.set(VIEW_PARAM, patch.view);
  }
  if (patch.date !== undefined) {
    if (patch.date >= today) next.delete(DATE_PARAM);
    else next.set(DATE_PARAM, patch.date);
  }
  return next;
}

/** `to` with the current page's `date` and `view` parameters added. */
export function withComplianceParams(
  to: string,
  search: URLSearchParams | string,
): string {
  const source =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const [path, query = ""] = to.split("?");
  const target = new URLSearchParams(query);
  for (const key of [DATE_PARAM, VIEW_PARAM]) {
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

export function useComplianceDate(): ComplianceDateState {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: history } = useComplianceHistory();
  const today = utcToday();

  const view = readView(searchParams);
  const selected = readDate(searchParams, today);

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
      setSearchParams((prev) => writeUrl(prev, patch, today), {
        replace: true,
      });
    },
    [setSearchParams, today],
  );

  return {
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
