import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageSection from "../../../components/PageSection";
import { getFinoutLinkForCostCentre, getFinoutLinkForCapability } from "./finoutCostCentreLink";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { TrackedButton } from "@/components/Tracking";
import { LargeCapabilityCostSummary } from "@/components/BasicCapabilityCost";

export default function Costs({ anchorId, costCentre }) {
  const { getCostComparisonForCapability } = useCapabilitiesCost();
  const { id } = useParams();

  const { current, previous, hasFullComparison } = getCostComparisonForCapability(id);
  const totalCost = current.reduce((acc, x) => acc + x.pv, 0);
  const previousTotal = previous.reduce((acc, x) => acc + x.pv, 0);
  const hasData = current.length > 0;

  const avgCost = hasData ? totalCost / current.length : 0;
  const previousAvg = previous.length > 0 ? previousTotal / previous.length : 0;

  const trendPct =
    hasData && previous.length > 0 && previousAvg > 0
      ? ((avgCost - previousAvg) / previousAvg) * 100
      : null;
  const isLower = trendPct != null && trendPct < 0;

  return (
    <PageSection id={anchorId} headline="Costs">
      <div className="mb-4">
        <span className="font-mono text-[1.5rem] font-bold text-action">
          {hasData ? `$${Math.floor(totalCost)}` : "No data"}
        </span>
        <span className="font-mono text-[11px] text-muted ml-2">total last 30 days</span>
        {trendPct != null ? (
          <div className="mt-1">
            <div
              className="font-mono text-[12px] font-semibold"
              style={{ color: isLower ? "#1a7f3c" : "#c0392b" }}
            >
              {isLower ? "\u2193" : "\u2191"} {!hasFullComparison ? "~" : ""}{Math.abs(Math.round(trendPct))}% vs previous {previous.length} days
            </div>
            <div className="font-mono text-[10px] text-muted mt-0.5">
              {hasFullComparison
                ? "Based on average daily cost over the prior 30-day period."
                : `Based on average daily cost \u2014 only ${previous.length + current.length} days of history available.`}
            </div>
          </div>
        ) : (
          hasData && (
            <div className="font-mono text-[10px] text-muted mt-1">
              No prior period data available to calculate a trend.
            </div>
          )
        )}
      </div>

      {hasData && (
        <div className="mb-4">
          <LargeCapabilityCostSummary data={current} />
        </div>
      )}

      <p className="text-[13px] text-[#666666] dark:text-slate-400 leading-[1.6] mb-4">
        Use Finout to explore the costs for this capability
        {costCentre
          ? ` or its entire cost centre (${costCentre}).`
          : `. No cost centre is set on this capability.`}
      </p>

      <div className="flex gap-2 flex-wrap">
        <a
          target="_blank"
          rel="noreferrer"
          href={costCentre ? `${getFinoutLinkForCostCentre({ costCentre })}` : undefined}
        >
          <TrackedButton
            trackName="FinOutButtonForCostCenter"
            size="small"
            variation="primary"
            disabled={!costCentre}
          >
            {costCentre ? `Cost centre: ${costCentre}` : "Cost centre: not available"}
          </TrackedButton>
        </a>
        <a
          target="_blank"
          rel="noreferrer"
          href={getFinoutLinkForCapability({ capabilityId: id })}
        >
          <TrackedButton
            trackName="FinOutButtonForCostCenter"
            size="small"
            variation="outlined"
          >
            This Capability
          </TrackedButton>
        </a>
      </div>
    </PageSection>
  );
}
