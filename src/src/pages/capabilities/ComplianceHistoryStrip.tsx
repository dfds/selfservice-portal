import React, { useMemo } from "react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useCapabilityComplianceHistory } from "@/state/remote/queries/capabilities";
import type {
  CapabilityComplianceHistoryEntry,
  ComplianceStatus,
} from "@/state/remote/queries/compliance.types";
import {
  type ComplianceDay,
  dayToDate,
  shiftDay,
  utcToday,
} from "@/pages/compliance/history/period";

const DAYS = 90;

const STATUS_STYLE: Record<ComplianceStatus, { label: string; bar: string }> = {
  Compliant: { label: "Compliant", bar: "bg-[var(--color-success)]" },
  NonCompliant: { label: "Non-compliant", bar: "bg-[var(--color-error)]" },
  Unknown: { label: "Unknown", bar: "bg-[#9e9e9e]" },
};

const NO_DATA_BAR = "bg-[#e4e6e8] dark:bg-[#273449]";

type StripDay = {
  day: ComplianceDay;
  entry: CapabilityComplianceHistoryEntry | undefined;
};

function DayTooltip({
  day,
  entry,
  displayNames,
}: StripDay & { displayNames: Map<string, string> }) {
  const failing =
    entry?.categories.filter((c) => c.status === "NonCompliant") ?? [];
  return (
    <div className="flex flex-col gap-0.5 font-sans text-[0.6875rem] leading-snug">
      <span className="font-semibold">
        {format(dayToDate(day), "EEE d MMM yyyy")}
      </span>
      {entry ? (
        <>
          <span>
            {STATUS_STYLE[entry.overallStatus].label} ·{" "}
            {entry.compliantCategories} / {entry.totalCategories} met
          </span>
          {failing.length > 0 && (
            <ul className="mt-0.5 list-disc pl-4">
              {failing.map((c) => (
                <li key={c.categoryName}>
                  {displayNames.get(c.categoryName) ?? c.categoryName}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <span>No snapshot recorded</span>
      )}
    </div>
  );
}

/**
 * One bar per UTC day for the last 90 days, coloured by the capability's
 * overall status. Hidden until at least two days have been recorded.
 */
export function ComplianceHistoryStrip({
  capabilityId,
  categories,
}: {
  capabilityId: string | null;
  /** The live categories, used to show display names in the tooltips. */
  categories: { categoryName: string; displayName?: string | null }[];
}) {
  const { data } = useCapabilityComplianceHistory(capabilityId, DAYS);
  const items = data?.items;

  const days = useMemo<StripDay[]>(() => {
    const byDay = new Map((items ?? []).map((i) => [i.date, i]));
    const today = utcToday();
    return Array.from({ length: DAYS }, (_, i) => {
      const day = shiftDay(today, i - (DAYS - 1));
      return { day, entry: byDay.get(day) };
    });
  }, [items]);

  const displayNames = useMemo(
    () =>
      new Map(
        categories
          .filter((c) => c.displayName)
          .map((c) => [c.categoryName, c.displayName as string]),
      ),
    [categories],
  );

  const recorded = days.filter((d) => d.entry);
  if (recorded.length < 2) return null;
  const compliant = recorded.filter(
    (d) => d.entry!.overallStatus === "Compliant",
  ).length;
  const summary = `Compliant on ${compliant} of ${recorded.length} recorded days`;

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <SectionLabel>Last {DAYS} days</SectionLabel>
        <span className="font-mono text-[0.6875rem] text-secondary">
          {summary}
        </span>
      </div>
      <TooltipProvider delayDuration={0} disableHoverableContent>
        {/* Bars are hover-only; the summary above carries the same information for keyboard and screen-reader users. */}
        <div role="img" aria-label={summary} className="flex h-6 gap-[2px]">
          {days.map((d) => (
            <Tooltip key={d.day}>
              <TooltipTrigger asChild>
                <span
                  aria-hidden
                  className="group flex min-w-0 flex-1 cursor-default items-stretch"
                >
                  <span
                    className={`w-full rounded-[2px] transition-opacity group-hover:opacity-70 ${
                      d.entry
                        ? STATUS_STYLE[d.entry.overallStatus].bar
                        : NO_DATA_BAR
                    }`}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[260px]">
                <DayTooltip {...d} displayNames={displayNames} />
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
      <div className="mt-1 flex justify-between font-mono text-[0.625rem] text-muted">
        <span>{format(dayToDate(days[0].day), "d MMM")}</span>
        <span>Today</span>
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.6875rem] text-secondary">
        {(Object.keys(STATUS_STYLE) as ComplianceStatus[]).map((s) => (
          <li key={s} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className={`h-2.5 w-2.5 rounded-[2px] ${STATUS_STYLE[s].bar}`}
            />
            {STATUS_STYLE[s].label}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className={`h-2.5 w-2.5 rounded-[2px] ${NO_DATA_BAR}`}
          />
          No data
        </li>
      </ul>
    </div>
  );
}
