import React from "react";
import { Separator } from "@/components/ui/separator";
import { useComplianceHistory } from "@/state/remote/queries/capabilities";
import { ComplianceRangeControl } from "./ComplianceRangeControl";
import { FocusChart } from "./designs/FocusChart";
import type { HistoryModel } from "./designs/shared";
import type { ComplianceDateState } from "./useComplianceDate";

/**
 * The history block at the foot of a compliance page. `date` is the "history"
 * scope: its range and selected day leave the cards above on their own period.
 */
export function HistorySection({
  date,
  model,
  className,
}: {
  date: ComplianceDateState;
  model: HistoryModel;
  className?: string;
}) {
  const { dataUpdatedAt, isFetching } = useComplianceHistory();

  return (
    <section aria-labelledby="compliance-history" className={className}>
      <Separator className="mb-6 bg-[var(--color-border-card)]" />
      <h2
        id="compliance-history"
        className="mb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-[#0e7cc1] dark:text-[#60a5fa]"
      >
        Trends
      </h2>
      <ComplianceRangeControl
        date={date}
        liveUpdatedAt={dataUpdatedAt}
        liveFetching={isFetching}
        className="mb-3"
      />
      <FocusChart model={model} view={date.view} onSelect={date.setDate} tall />
    </section>
  );
}
