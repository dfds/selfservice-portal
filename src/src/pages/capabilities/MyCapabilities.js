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

export default function MyCapabilities() {
  const { myCapabilities, capabilityCosts, appStatus } = useContext(AppContext);

  const items = myCapabilities || [];
  const isLoading = !appStatus.hasLoadedMyCapabilities;
  const isLoadingCosts = !appStatus.hasLoadedCosts;
  const [showCostsSpinner, setShowCostsSpinner] = useState(isLoadingCosts);

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/capabilities/${id}`);

  useEffect(() => {
    let isMounted = true;

    const interval = setInterval(() => {
      if (isMounted) {
        setShowCostsSpinner(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setShowCostsSpinner(isLoadingCosts);
  }, [isLoadingCosts]);

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
                  <TableHeaderCell align="center">Costs</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((x) => (
                  <TableRow key={x.id} onClick={() => clickHandler(x.id)}>
                    <TableDataCell>
                      <Text
                        className="warningIcon"
                        hidden={x.status == "Active"}
                      >
                        <StatusAlert />
                      </Text>
                      <Text styledAs="action" as={"div"}>
                        {x.name}
                      </Text>
                      <Text styledAs="caption" as={"div"}>
                        {x.description}
                      </Text>
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
                          <CapabilityCostSummary
                            data={capabilityCosts.getCostsForCapability(
                              x.id,
                              7,
                            )}
                          />
                          <ChevronRight />
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
