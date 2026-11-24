import { useCallback, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useComplianceHistory } from "@/state/remote/queries/capabilities";
import {
  type AvailableDays,
  type ComplianceDay,
  type ComplianceView,
  availableDays,
  isComplianceDay,
  resolveSnapshotDate,
  utcToday,
} from "./period";
import {
  DEFAULT_RANGE,
  type HistoryRange,
  type ResolvedRange,
  resolveRange,
  sameRange,
} from "./range";

// ─── URL state codec ─────────────────────────────────────────────────────────
// The "page" scope is `?date=YYYY-MM-DD` and always reads by day. The "history"
// scope uses `historyDate` and `historyView=day|week|month`, so a page's
// history chart can show another period than its cards, and adds
// `historyFrom`/`historyTo` for the range it plots (see range.ts). Today, "day"
// and the default range are left out of the URL.

export type ComplianceDateScope = "page" | "history";

type ScopeParams = { date: string; view?: string };

const PARAMS: Record<ComplianceDateScope, ScopeParams> = {
  page: { date: "date" },
  history: { date: "historyDate", view: "historyView" },
};

const RANGE_PARAMS = { from: "historyFrom", to: "historyTo" };

const ALL_PARAMS = [
  ...Object.values(PARAMS).flatMap((k) =>
    k.view ? [k.date, k.view] : [k.date],
  ),
  RANGE_PARAMS.from,
  RANGE_PARAMS.to,
];

function readView(p: URLSearchParams, key?: string): ComplianceView {
  const v = key ? p.get(key) : null;
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
  keys: ScopeParams,
  patch: { view?: ComplianceView; date?: ComplianceDay },
  today: ComplianceDay,
): URLSearchParams {
  const next = new URLSearchParams(prev);
  if (patch.view !== undefined && keys.view) {
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
  for (const key of ALL_PARAMS) {
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
  setView: (view: ComplianceView) => void;
  setDate: (day: ComplianceDay) => void;
  goToToday: () => void;
  /** The plotted range; only the "history" scope has one. */
  range?: {
    value: HistoryRange;
    resolved: ResolvedRange;
    /** Also clears the selected day, which may fall outside the new range. */
    set: (range: HistoryRange) => void;
  };
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

  const range = useMemo(
    () =>
      resolveRange(
        {
          from: searchParams.get(RANGE_PARAMS.from) ?? DEFAULT_RANGE.from,
          to: searchParams.get(RANGE_PARAMS.to) ?? DEFAULT_RANGE.to,
        },
        today,
      ),
    [searchParams, today],
  );

  const setRange = useCallback(
    (value: HistoryRange) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(keys.date);
          if (sameRange(value, DEFAULT_RANGE)) {
            next.delete(RANGE_PARAMS.from);
            next.delete(RANGE_PARAMS.to);
          } else {
            next.set(RANGE_PARAMS.from, value.from.trim());
            next.set(RANGE_PARAMS.to, value.to.trim());
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, keys],
  );

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
    setView: (v) => updateUrl({ view: v }),
    setDate: (date) => updateUrl({ date }),
    goToToday: () => updateUrl({ date: today }),
    range:
      scope === "history"
        ? { value: range.range, resolved: range.resolved, set: setRange }
        : undefined,
  };
}
