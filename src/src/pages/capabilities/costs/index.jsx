import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageSection from "../../../components/PageSection";
import { getFinoutLinkForCostCentre } from "./finoutCostCentreLink";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { TrackedButton } from "@/components/Tracking";
import { LargeCapabilityCostSummary } from "@/components/BasicCapabilityCost";

export default function Costs({ anchorId, costCentre }) {
  const { getCostComparisonForCapability } = useCapabilitiesCost();
  const { id } = useParams();

  const { current, previous } = getCostComparisonForCapability(id);
  const totalCost = current.reduce((acc, x) => acc + x.pv, 0);
  const previousTotal = previous.reduce((acc, x) => acc + x.pv, 0);
  const hasData = current.length > 0;

  const trendPct =
    hasData && previous.length > 0 && previousTotal > 0
      ? ((totalCost - previousTotal) / previousTotal) * 100
      : null;
  const isLower = trendPct != null && trendPct < 0;

  return (
    <PageSection id={anchorId} headline="Costs">
      <div className="mb-4">
        <span className="font-mono text-[1.5rem] font-bold text-action">
          {hasData ? `$${Math.floor(totalCost)}` : "No data"}
        </span>
        <span className="font-mono text-[11px] text-muted ml-2">total last 30 days</span>
        {trendPct != null && (
          <div
            className="font-mono text-[12px] font-semibold mt-1"
            style={{ color: isLower ? "#1a7f3c" : "#c0392b" }}
          >
            {isLower ? "↓" : "↑"} {Math.abs(Math.round(trendPct))}% vs previous 30 days
          </div>
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
          href={`https://app.finout.io/app/total-cost?accountId=e071c3ed-1e3c-46f7-9830-71951712d791&date={"relativeRange":"last30Days","type":"day","range":30}&filters={"costCenter":"virtualTag","key":"52c02d7e-093a-42b7-bf06-eb13050a8687","path":"Virtual Tags🔥/capability","operator":"is","value":"${id}"}&groupBy={"costCenter":"virtualTag","key":"1ee86223-0cf1-4eb4-9ea9-fb4616f358e6","path":"Virtual Tags🔥/Services Level Breakdown"}&xAxisGroupBy={"type":"time","value":"day","path":null}&drilldown=[]&metrics=cost&groupByChartType=1&tableTransposed=1&showTableDates=1&costType=amortizedCost&calculationMethod=sum`}
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
