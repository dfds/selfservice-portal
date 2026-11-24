import { useCallback, useMemo } from "react";
import { useComplianceHistory } from "@/state/remote/queries/capabilities";
import type { ComplianceDailySummary } from "@/state/remote/queries/compliance.types";
import { periodStart } from "./period";
import { bucketHistory, trendUpTo } from "./series";
import type { ComplianceDateState } from "./useComplianceDate";

/** Periods shown in card sparklines and detail-page trends. */
export const TREND_PERIODS = 30;

/**
 * Returns `trend(value)`: the last `TREND_PERIODS` end-of-period values up to
 * the selected period, bucketed by the current view.
 */
export function useHistoryTrends(date: ComplianceDateState) {
  const { data: history } = useComplianceHistory();
  const buckets = useMemo(
    () => bucketHistory(history?.items ?? [], date.view),
    [history, date.view],
  );
  const endPeriod = periodStart(date.view, date.selected);
  return useCallback(
    (value: (item: ComplianceDailySummary) => number | null) =>
      trendUpTo(buckets, endPeriod, TREND_PERIODS, value),
    [buckets, endPeriod],
  );
}

export function trendLabel(date: ComplianceDateState, count: number): string {
  return `Last ${count} ${date.view}${count === 1 ? "" : "s"}`;
}
