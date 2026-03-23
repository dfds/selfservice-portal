import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageSection from "../../../components/PageSection";
import { getFinoutLinkForCostCentre } from "./finoutCostCentreLink";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { TrackedButton } from "@/components/Tracking";
import { StatCard } from "@/components/ui/StatCard";

export default function Costs({ anchorId, costCentre }) {
  const { query, getCostsForCapability } = useCapabilitiesCost();
  const { id } = useParams();
  const [showCostsSpinner, setShowCostsSpinner] = useState(true);
  const dayWindows = [7, 14, 30];

  useEffect(() => {
    setShowCostsSpinner(!query.isFetched);
  }, [query.isFetched]);

  return (
    <PageSection id={anchorId} headline="Costs">
      <p className="text-[13px] text-[#666666] dark:text-slate-400 leading-[1.6] mb-4">
        Use Finout to explore the costs for this capability or its entire cost
        centre, if a cost centre is set.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {dayWindows.map((days, index) => {
          const dataValue = getCostsForCapability(id, days);
          const totalCost = dataValue.reduce((acc, x) => acc + x.pv, 0);
          const hasData = dataValue.length > 0;

          return (
            <StatCard
              key={index}
              loading={showCostsSpinner}
              value={`$${totalCost}`}
              hasData={hasData}
              label={`Last ${days} days`}
            />
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        <a
          target="_blank"
          rel="noreferrer"
          href={`${getFinoutLinkForCostCentre({ costCentre })}`}
        >
          <TrackedButton
            trackName="FinOutButtonForCostCenter"
            size="small"
            variation="primary"
            disabled={!costCentre}
          >
            Entire cost center {costCentre && `(${costCentre})`}
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
