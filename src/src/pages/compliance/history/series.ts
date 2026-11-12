import type {
  ComplianceCostCentreKind,
  ComplianceDailySummary,
} from "@/state/remote/queries/compliance.types";
import { calcCompliancePct } from "../utils";
import { type ComplianceDay, type ComplianceView, periodStart } from "./period";

/** One period's end-of-period item: the last recorded day in it. */
export type HistoryBucket<T = ComplianceDailySummary> = {
  /** First day of the period. */
  period: ComplianceDay;
  item: T;
};

/** `items` must be oldest first, as the API returns them. */
export function bucketHistory<T extends { date: ComplianceDay }>(
  items: readonly T[],
  view: ComplianceView,
): HistoryBucket<T>[] {
  const buckets: HistoryBucket<T>[] = [];
  for (const item of items) {
    const period = periodStart(view, item.date);
    const last = buckets[buckets.length - 1];
    if (last?.period === period) last.item = item;
    else buckets.push({ period, item });
  }
  return buckets;
}

export function overallPct(item: ComplianceDailySummary): number {
  return calcCompliancePct(
    item.fullyCompliantCapabilities,
    item.totalCapabilities,
  );
}

/** Null when the requirement was not evaluated for any capability that day. */
export function requirementPct(
  item: ComplianceDailySummary,
  requirementId: string,
): number | null {
  const totals = item.requirements.find(
    (r) => r.requirementId === requirementId,
  );
  if (!totals || totals.totalCapabilities === 0) return null;
  return calcCompliancePct(totals.compliantCount, totals.totalCapabilities);
}

/**
 * Null when the group had no capabilities that day. Cost centres match
 * case-insensitively, as the API groups them.
 */
export function costCentrePct(
  item: ComplianceDailySummary,
  kind: ComplianceCostCentreKind,
  costCentre?: string,
): number | null {
  const wanted = costCentre?.toLowerCase();
  const totals = item.costCentres.find(
    (c) =>
      c.kind === kind &&
      (kind !== "costCentre" || c.costCentre?.toLowerCase() === wanted),
  );
  if (!totals || totals.totalCapabilities === 0) return null;
  return calcCompliancePct(totals.compliantCount, totals.totalCapabilities);
}

/** The values of the last `count` buckets up to and including `endPeriod`. */
export function trendUpTo(
  buckets: readonly HistoryBucket[],
  endPeriod: ComplianceDay,
  count: number,
  value: (item: ComplianceDailySummary) => number | null,
): (number | null)[] {
  let end = buckets.length;
  while (end > 0 && buckets[end - 1].period > endPeriod) end--;
  return buckets.slice(Math.max(0, end - count), end).map((b) => value(b.item));
}
