import React from "react";
import { format } from "date-fns";
import { History } from "lucide-react";
import {
  useComplianceHistory,
  useComplianceSummary,
} from "@/state/remote/queries/capabilities";
import { calcCompliancePct } from "../utils";
import { dayToDate, periodLabel } from "./period";
import { overallPct } from "./series";
import type { ComplianceDateState } from "./useComplianceDate";

function formatDelta(points: number): string {
  if (points === 0) return "no change";
  return `${points > 0 ? "+" : "−"}${Math.abs(points)} pts`;
}

/**
 * Sticky strip below the top bar while a past period is shown, comparing that
 * period's fully-compliant rate with today's.
 */
export function HistoricalBanner({ date }: { date: ComplianceDateState }) {
  const { data: history } = useComplianceHistory();
  const { data: live } = useComplianceSummary();

  if (date.isLive) return null;

  const snapshot = history?.items.find((i) => i.date === date.snapshotDate);
  const label = periodLabel(date.view, date.selected);
  const thenPct = snapshot ? overallPct(snapshot) : undefined;
  const todayPct = live
    ? calcCompliancePct(live.fullyCompliantCapabilities, live.totalCapabilities)
    : undefined;

  // "23:58 UTC", or "23:58 UTC on 1 Nov" when a week or month resolves to a
  // day other than the one in its label.
  const captured = snapshot
    ? `${snapshot.capturedAt.slice(11, 16)} UTC${
        date.view === "day"
          ? ""
          : ` on ${format(dayToDate(snapshot.date), "d MMM")}`
      }`
    : undefined;

  return (
    <div
      role="status"
      className="sticky top-[var(--topbar-height)] z-[9] flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#b9dcf2] bg-[#eaf4fb] px-4 py-2 font-mono text-[0.75rem] text-primary md:px-8 dark:border-[#1d4b6e] dark:bg-[#0c2a40]"
    >
      <History size={13} className="flex-shrink-0 text-action" aria-hidden />
      <span className="font-semibold">Viewing {label}</span>
      {history === undefined ? null : snapshot ? (
        <>
          <span className="text-secondary">(captured {captured})</span>
          <span aria-hidden className="text-muted">
            ·
          </span>
          <span>
            {thenPct}% fully compliant
            {todayPct !== undefined && thenPct !== undefined && (
              <span className="text-secondary">
                , today {todayPct}% ({formatDelta(todayPct - thenPct)})
              </span>
            )}
          </span>
        </>
      ) : (
        <span className="text-secondary">
          · No snapshot was recorded for this {date.view}.
        </span>
      )}
      <button
        type="button"
        onClick={date.goToToday}
        className="ml-auto font-semibold text-action hover:underline"
      >
        Back to today
      </button>
    </div>
  );
}
