import React from "react";
import { Separator } from "@/components/ui/separator";
import { useComplianceHistory } from "@/state/remote/queries/capabilities";
import { ComplianceDateControl } from "./ComplianceDateControl";
import { HistoryDesignPreview } from "./designs/HistoryDesignPreview";
import type { HistoryModel } from "./designs/shared";
import type { ComplianceDateState } from "./useComplianceDate";

/**
 * The history block at the foot of an overview page. `date` is the "history"
 * scope, so stepping through it leaves the cards above on their own period.
 */
export function HistorySection({
  date,
  model,
  current,
  className,
}: {
  date: ComplianceDateState;
  model: HistoryModel;
  current?: React.ReactNode;
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
        {"// History"}
      </h2>
      <ComplianceDateControl
        date={date}
        liveUpdatedAt={dataUpdatedAt}
        liveFetching={isFetching}
        className="mb-3"
      />
      <HistoryDesignPreview
        model={model}
        view={date.view}
        onSelect={date.setDate}
        current={current}
        tall
      />
    </section>
  );
}
