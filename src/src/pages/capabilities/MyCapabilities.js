import React, { useContext, useEffect, useState } from "react";
import { Text } from "@dfds-ui/typography";
import { useNavigate } from "react-router-dom";
import { ChevronRight, StatusAlert } from "@dfds-ui/icons/system";
import {
  Spinner,
  Table,
  TableBody,
  TableDataCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@dfds-ui/react-components";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import CapabilityCostSummary from "components/BasicCapabilityCost";
import styles from "./capabilities.module.css"
import mystyles from "./myCapabilities.module.css";
import { InlineAwsCountSummary } from "pages/capabilities/AwsResourceCount";


export default function MyCapabilities() {
  const { myCapabilities, metricsWrapper, appStatus, truncateString } = useContext(AppContext);

  const items = myCapabilities || [];
  const isLoading = !appStatus.hasLoadedMyCapabilities;
  const isLoadingCosts = !appStatus.hasLoadedMyCapabilitiesCosts;
  const isLoadingAwsResourcesCounts = !appStatus.hasLoadedMyCapabilitiesResourcesCounts;
  const [showCostsSpinner, setShowCostsSpinner] = useState(isLoadingCosts);
  const [showAwsResourcesSpinner, setShowAwsResourcesSpinner] = useState(isLoadingAwsResourcesCounts);

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/capabilities/${id}`);

  useEffect(() => {
    let isMounted = true;

    // after 3 seconds, hide the spinner regardless if costs have been loaded or not
    const timeout = setTimeout(() => {
      if (isMounted) {
        setShowCostsSpinner(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    setShowCostsSpinner(isLoadingCosts);
  }, [isLoadingCosts]);

  useEffect(() => {
    let isMounted = true;

    // after 3 seconds, hide the spinner regardless if costs have been loaded or not
    const timeout = setTimeout(() => {
      if (isMounted) {
        setShowAwsResourcesSpinner(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    setShowAwsResourcesSpinner(isLoadingAwsResourcesCounts);
  }, [isLoadingAwsResourcesCounts]);

  const rowClass = (status) => status === "Deleted" ? styles.deletedRow : '';

  return (
    <>
      <PageSection
        headline={`My Capabilities ${isLoading ? "" : `(${items.length})`}`}
      >
        {isLoading && <Spinner />}

        {!isLoading && items.length === 0 && (
          <Text>
            Oh no! You have not joined a capability...yet! Knock yourself out
            with the ones below...
          </Text>
        )}

        {!isLoading && items.length > 0 && (
          <>
            <Table isInteractive width={"100%"}>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell align="center">Resources</TableHeaderCell>
                  <TableHeaderCell align="center">Costs</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((x) => (
                  <TableRow key={x.id} onClick={() => clickHandler(x.id)} className={rowClass(x.status)}>
                    <TableDataCell>
                      <Text
                        className={mystyles.warningIcon}
                        hidden={x.status == "Active"}
                      >
                        <StatusAlert />
                      </Text>
                      <Text styledAs="action" as={"div"}>
                        {truncateString(x.name)}
                      </Text>
                      <Text styledAs="caption" as={"div"}>
                        {truncateString(x.description)}
                      </Text>
                    </TableDataCell>
                    <TableDataCell align="center">
                      {showAwsResourcesSpinner ? (
                          <Spinner />
                      ) : (
                          <InlineAwsCountSummary data={
                            metricsWrapper.getAwsResourcesTotalCountForCapability(x.id)
                          }/>
                      )}
                    </TableDataCell>
                    <TableDataCell align="center" width="100px">
                      {showCostsSpinner ? (
                        <Spinner />
                      ) : isLoadingCosts ? (
                        <Text styledAs="caption" as={"div"}>
                          No data available
                        </Text>
                      ) : (
                        <>
                          <div className={mystyles.costs}>
                            <CapabilityCostSummary
                              data={metricsWrapper.getCostsForCapability(
                                x.id,
                                7,
                              )}
                            />
                            <ChevronRight />
                          </div>
                        </>
                      )}
                    </TableDataCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </PageSection>
    </>
  );
}
