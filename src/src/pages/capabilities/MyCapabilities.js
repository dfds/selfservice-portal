import React, { useContext, useEffect, useMemo, useState } from "react";
import { Text } from "@dfds-ui/typography";
import { useNavigate } from "react-router-dom";
import { ChevronRight, StatusAlert } from "@dfds-ui/icons/system";
import { Spinner } from "@dfds-ui/react-components";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import CapabilityCostSummary from "components/BasicCapabilityCost";
import styles from "./capabilities.module.css";
import { MaterialReactTable } from "material-react-table";
import { InlineAwsCountSummary } from "pages/capabilities/AwsResourceCount";
import { useCapabilities } from "hooks/Capabilities";

export default function MyCapabilities() {
  const { myCapabilities, metricsWrapper, appStatus, truncateString } =
    useContext(AppContext);
  const { capabilities, isLoaded } = useCapabilities();

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isLoaded && capabilities && myCapabilities) {
      const filteredList = capabilities.filter((x) => {
        const myCap = myCapabilities.find((y) => y.id === x.id);
        if (myCap) {
          return true;
        } else {
          return false;
        }
      });
      setItems(filteredList);
    }
  }, [isLoaded, capabilities, myCapabilities]);

  const isLoading = !appStatus.hasLoadedMyCapabilities;
  const [fullTableData, setFullTableData] = useState([]);

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/capabilities/${id}`);

  useEffect(() => {
    if (items) {
      const tableData = items.map((item) => {
        const copy = { ...item };

        return copy;
      });
      setFullTableData(tableData);
    }
  }, [items]);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => {
          return {
            name: row.name,
            description: row.description,
            status: row.status,
          };
        },
        header: "Name",
        size: 350,
        enableColumnFilterModes: false,
        Cell: ({ cell }) => {
          return (
            <div>
              {cell.getValue().status === "Pending Deletion" ? (
                <Text styledAs="action" as={"div"}>
                  <StatusAlert className={styles.warningIcon} />
                </Text>
              ) : null}
              <Text styledAs="action" style={{ marginLeft: "20px" }} as={"div"}>
                {truncateString(cell.getValue().name, 70)}
              </Text>
              <Text
                styledAs="caption"
                style={{ marginLeft: "20px" }}
                as={"div"}
              >
                {truncateString(cell.getValue().description, 70)}
              </Text>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.jsonMetadata,
        header: "Cost Centre",
        size: 50,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) => {
          const jsonMetadata = JSON.parse(cell.getValue() ?? "{}");
          if (jsonMetadata["dfds.cost.centre"] === undefined) {
            return <div></div>;
          }
          return <div>{jsonMetadata["dfds.cost.centre"]}</div>;
        },
      },
      {
        accessorFn: (row) => row.id,
        header: "Aws Resources",
        size: 150,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) => {
          return (
            <div>
              <InlineAwsCountSummary
                data={metricsWrapper.getAwsResourcesTotalCountForCapability(
                  cell.getValue(),
                )}
              />
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.id,
        header: "Costs",
        size: 150,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "right",
        },
        Cell: ({ cell }) => {
          return (
            <div className={styles.costs}>
              <CapabilityCostSummary
                data={metricsWrapper.getCostsForCapability(
                  cell.getValue().toLocaleString(),
                  7,
                )}
              />
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.awsAccountId,
        header: "AwsAccountId",
        enableColumnFilterModes: false,
        disableFilters: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) => {
          return <div>{cell.getValue()}</div>;
        },
      },
      {
        accessorFn: (row) => row.id,
        header: "arrow",
        id: "details",
        size: 1,
        muiTableBodyCellProps: {
          align: "right",
        },
        Cell: () => {
          return <ChevronRight />;
        },
        Header: <div></div>, //force no column title
      },
    ],
    [],
  );

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
            <MaterialReactTable
              columns={columns}
              data={fullTableData}
              initialState={{
                pagination: { pageSize: 25 },
                showGlobalFilter: true,
                columnVisibility: { AwsAccountId: false },
              }}
              muiTableHeadCellProps={{
                sx: {
                  fontWeight: "700",
                  fontSize: "16px",
                  fontFamily: "DFDS",
                  color: "#002b45",
                },
              }}
              muiTableBodyCellProps={{
                sx: {
                  fontWeight: "400",
                  fontSize: "16px",
                  fontFamily: "DFDS",
                  color: "#4d4e4c",
                  padding: "5px",
                },
              }}
              muiTablePaperProps={{
                elevation: 0, //change the mui box shadow
                //customize paper styles
                sx: {
                  borderRadius: "0",
                },
              }}
              muiTopToolbarProps={{
                sx: {
                  background: "none",
                },
              }}
              enableGlobalFilterModes={true}
              positionGlobalFilter="left"
              muiSearchTextFieldProps={{
                placeholder: `Find a capability...`,
                sx: {
                  minWidth: "1120px",
                  fontWeight: "400",
                  fontSize: "16px",
                  padding: "5px",
                },
                size: "small",
                variant: "outlined",
              }}
              enablePagination={true}
              globalFilterFn="contains"
              enableFilterMatchHighlighting={true}
              enableDensityToggle={false}
              enableHiding={false}
              enableFilters={true}
              enableGlobalFilter={true}
              enableTopToolbar={true}
              enableBottomToolbar={true}
              enableColumnActions={false}
              muiBottomToolbarProps={{
                sx: {
                  background: "none",
                },
              }}
              muiTableBodyRowProps={({ row }) => {
                return {
                  onClick: () => {
                    clickHandler(row.original.id);
                  },
                  sx: {
                    cursor: "pointer",
                    background: row.original.status === "Deleted" ? "#d88" : "",
                    padding: 0,
                    margin: 0,
                    minHeight: 0,
                    "&:hover td": {
                      backgroundColor:
                        row.original.status === "Deleted"
                          ? "rgba(187, 221, 243, 0.1)"
                          : "rgba(187, 221, 243, 0.4)",
                    },
                  },
                };
              }}
            />
          </>
        )}
      </PageSection>
    </>
  );
}
