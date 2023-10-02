import React, { useContext, useEffect, useState } from "react";
import AppContext from "../../../AppContext";
import { useParams } from "react-router-dom";
import PageSection from "../../../components/PageSection";
import { Text } from "@dfds-ui/typography";
import { LargeCapabilityCostSummary } from "../../../components/BasicCapabilityCost";
import { Spinner } from "@dfds-ui/react-components";
import styles from "./costs.module.css";

export default function Costs() {
  const { appStatus, metricsWrapper } = useContext(AppContext);

  const { id } = useParams();
  const [showCostsSpinner, setShowCostsSpinner] = useState(true);
  const isLoading = !appStatus.hasLoadedMyCapabilitiesCosts;
  const dayWindows = [7, 14, 30];

  useEffect(() => {
    // Simulate fetching data from an API
    setTimeout(() => {
      setShowCostsSpinner(false);
    }, 3000);
  }, []);

  useEffect(() => {
    setShowCostsSpinner(isLoading);
  }, [isLoading]);

  return (
    <PageSection headline="Costs">
      <div className={styles.container}>
        {dayWindows.map((days, index) => {
          const dataValue = metricsWrapper.getCostsForCapability(id, days);

          return (
            <div key={index} className={styles.column} align="center">
              <Text styledAs={"smallHeadline"}>{days} Days</Text>
              {showCostsSpinner ? (
                <Spinner instant />
              ) : isLoading ? (
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
                      <Text className={styles.finout_link}>
                        <ins>Finout link coming soon</ins>
                      </Text>
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
