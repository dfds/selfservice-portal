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
                      <a
                        target="_blank"
                        href={`https://app.finout.io/app/total-cost?accountId=e071c3ed-1e3c-46f7-9830-71951712d791&context=%7B%22id%22%3A%2288dc362c-5876-45d9-8c9e-950f1f481e78%22%2C%22metricName%22%3A%22MegaBill%22%2C%22type%22%3A%22cost%22%2C%22name%22%3A%22MegaBill%22%2C%22label%22%3A%22unlabeled%22%2C%22tags%22%3A%7B%7D%2C%22costViewId%22%3A%2232%22%2C%22unitAggregationCount%22%3A1%7D&gbyHiddenLegendIndexes=0_2&filters=%7B%22costCenter%22%3A%22virtualTag%22%2C%22key%22%3A%2252c02d7e-093a-42b7-bf06-eb13050a8687%22%2C%22path%22%3A%22Virtual+Tags%F0%9F%94%A5%2Fcapability%22%2C%22type%22%3A%22virtual_tag%22%2C%22operator%22%3A%22is%22%2C%22value%22%3A%22${id}%22%${days}D`}
                      >
                        Finout link
                      </a>
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
