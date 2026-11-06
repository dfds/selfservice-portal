import React from "react";
import { complianceColor } from "../utils";
import { Sparkline } from "./Sparkline";
import { trendLabel } from "./useHistoryTrends";
import type { ComplianceDateState } from "./useComplianceDate";

/** A labelled sparkline for a detail page's header. Hidden below two values. */
export function TrendSummary({
  date,
  values,
}: {
  date: ComplianceDateState;
  values: readonly (number | null)[];
}) {
  const present = values.filter((v): v is number => v !== null);
  if (present.length < 2) return null;
  const first = present[0];
  const last = present[present.length - 1];
  const label = trendLabel(date, values.length);

  return (
    <div className="inline-flex items-center gap-3 rounded-[8px] border border-card bg-surface px-3 py-2">
      <div className="flex flex-col">
        <span className="font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-muted">
          {label}
        </span>
        <span className="font-mono text-[0.75rem] text-secondary">
          {first}% → <span className="font-semibold text-primary">{last}%</span>
        </span>
      </div>
      <Sparkline
        values={values}
        color={complianceColor(last)}
        label={label}
        width={140}
        height={32}
      />
    </div>
  );
}
