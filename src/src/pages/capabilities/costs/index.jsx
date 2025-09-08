import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../../AppContext";
import { useParams } from "react-router-dom";
import PageSection from "../../../components/PageSection";
import { Text } from "@dfds-ui/typography";
import { LargeCapabilityCostSummary } from "../../../components/BasicCapabilityCost";
import { Spinner } from "@dfds-ui/react-components";
import styles from "./costs.module.css";
import { getFinoutLinkForCostCentre } from "./finoutCostCentreLink";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { TrackedButton } from "@/components/Tracking";

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
      <span>
        Use Finout to explore the costs for this capability or its entire cost
        centre, if a cost centre is set.
      </span>
      <p>
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
      </p>
      <p>
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://app.finout.io/app/total-cost?defaultHomePage=true&accountId=e071c3ed-1e3c-46f7-9830-71951712d791&date={"range":30,"relativeRange":"last30Days","type":"day","from":1754743409808,"to":1757335409808}&filters={"costCenter":"virtualTag","key":"52c02d7e-093a-42b7-bf06-eb13050a8687","path":"Virtual Tags🔥/capability","operator":"is","value":"${id}"}&groupBy={"costCenter":"global","path":"Global/Cost Center","type":"col","key":"cost_center_type"}&xAxisGroupBy={"type":"time","value":"day"}&drilldown=[]&metrics=cost`}
        >
          <TrackedButton
            trackName="FinOutButtonForCostCenter"
            size="small"
            variation="outlined"
          >
            This Capability
          </TrackedButton>
        </a>
      </p>

      <div className={styles.container}>
        {dayWindows.map((days, index) => {
          const dataValue = getCostsForCapability(id, days);

          return (
            <div key={index} className={styles.column} align="center">
              <Text styledAs={"smallHeadline"}>{days} Days</Text>
              {showCostsSpinner ? (
                <Spinner instant />
              ) : !query.isFetched ? (
                <Text styledAs="caption" as={"div"}>
                  No data available
                </Text>
              ) : (
                <>
                  {dataValue.length === 0 ? (
                    <Text>No data</Text>
                  ) : (
                    <>
                      <LargeCapabilityCostSummary
                        data={dataValue}
                        capabilityId={id}
                      />
                      <span>Last {days} days for this capability</span>
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <br />
    </PageSection>
  );
}
