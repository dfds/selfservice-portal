import React, { useContext, useEffect, useState, useMemo } from "react";
import { Text } from "@dfds-ui/typography";
import { useNavigate } from "react-router-dom";
import { ChevronRight, StatusAlert } from "@dfds-ui/icons/system";
import { Spinner } from "@dfds-ui/react-components";
import AppContext from "AppContext";
import PageSection from "components/PageSection";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { Switch } from "@dfds-ui/forms";
import styles from "./capabilities.module.css";
import { MaterialReactTable } from "material-react-table";
import CapabilityCostSummary from "components/BasicCapabilityCost";
//import { InlineAwsCountSummary } from "pages/capabilities/AwsResourceCount";

function CapabilitiesTable({ columns, filteredCapabilities, clickHandler }) {
  const { globalFilter, setGlobalFilter } = useContext(AppContext);

  return (
    <MaterialReactTable
      columns={columns}
      data={filteredCapabilities}
      initialState={{
        pagination: { pageSize: 50 },
        showGlobalFilter: true,
        columnVisibility: { AwsAccountId: false },
      }}
      state={{
        globalFilter: globalFilter,
      }}
      onGlobalFilterChange={(value) => {
          setGlobalFilter(value);
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
      muiTopToolbarProps={{
        sx: {
          background: "none",
        },
      }}
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
  );
}

export default function CapabilitiesList() {
  const { truncateString, showOnlyMyCapabilities, setShowOnlyMyCapabilities } = useContext(AppContext);
  const { isFetched: isCapabilityFetched, data: capabilitiesData } =
    useCapabilities();

  const [isLoading, setIsLoading] = useState(true);

  const [capabilities, setCapabilities] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);
  const [filteredCapabilities, setFilteredCapabilities] = useState([]);

  useEffect(() => {
    if (isCapabilityFetched && capabilitiesData) {
      setCapabilities(capabilitiesData);

      const myCapabilities = capabilitiesData.filter((capability) => {
        return capability.userIsMember;
      });
      setMyCapabilities(myCapabilities);
    }
  }, [isCapabilityFetched, capabilitiesData]);

  useEffect(() => {
    if (capabilities) {
      if (showOnlyMyCapabilities && myCapabilities) {
        setFilteredCapabilities(myCapabilities);
      } else {
        setFilteredCapabilities(capabilities);
      }
    }
  }, [capabilities, myCapabilities, showOnlyMyCapabilities]);

  useEffect(() => {
    if (isCapabilityFetched) {
      setIsLoading(false);
    }
  }, [isCapabilityFetched]);

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/capabilities/${id}`);

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
        enableColumnFilterModes: true,
        disableFilters: false,
        enableGlobalFilter: true,
        enableFilterMatchHighlighting: true,

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
        accessorFn: (row) => {
          return {
            jsonMetadata: row.jsonMetadata,
            userIsMember: row.userIsMember || false,
          };
        },
        header: "Tags",
        size: 150,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) => {
          const jsonMetadata = JSON.parse(cell.getValue().jsonMetadata ?? "{}");
          const userIsMember = cell.getValue().userIsMember ?? false;
          if (!userIsMember) {
            return <div></div>;
          }
          if (
            jsonMetadata["dfds.owner"] === undefined ||
            jsonMetadata["dfds.owner"] === ""
          ) {
            return <div className={styles.missingTags}>Pending</div>;
          }
          if (
            jsonMetadata["dfds.cost.centre"] === undefined ||
            jsonMetadata["dfds.cost.centre"] === ""
          ) {
            return <div className={styles.missingTags}>Pending</div>;
          }
          if (
            jsonMetadata["dfds.planned_sunset"] !== undefined &&
            jsonMetadata["dfds.planned_sunset"] !== "" &&
            jsonMetadata["dfds.planned_sunset"] <= new Date()
          ) {
            return <div className={styles.missingTags}>Pending</div>;
          }
          return <div></div>;
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
      /*
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
                      )}Q
                    />
                  </div>
                );
              },
            },
            */

      {
        accessorFn: (row) => row.costs,
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
          let data = cell.getValue() != null ? cell.getValue() : [];
          return (
            <div className={styles.costs}>
              <CapabilityCostSummary data={data} />
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
        size: 1,
        enableColumnFilterModes: false,
        muiTableBodyCellProps: {
          align: "right",
        },
        Cell: ({ cell }) => {
          return <ChevronRight />;
        },
        Header: <div></div>, //enable empty header
      },
    ],
    [],
  );

  const toggleShowMyCapabilities = () => {
    setShowOnlyMyCapabilities(!showOnlyMyCapabilities);
  };

  return (
    <>
      <PageSection
        headline={`${showOnlyMyCapabilities ? "My" : "All"} Capabilities ${
          isLoading
            ? ""
            : `(${(filteredCapabilities || []).length} / ${
                (capabilities || []).length
              })`
        }`}
        headlineChildren={
          isLoading ? null : (
            <div className={styles.myCapabilitiesToggleBox}>
              <span className={styles.myCapabilitiesToggleTitle}>
                Show just mine:{" "}
              </span>
              <Switch
                checked={showOnlyMyCapabilities}
                onChange={toggleShowMyCapabilities}
              />
            </div>
          )
        }
      >
        {isLoading && <Spinner />}

        {!isLoading && (
          <CapabilitiesTable
            columns={columns}
            filteredCapabilities={filteredCapabilities}
            clickHandler={clickHandler}
          />
        )}
      </PageSection>
    </>
  );
}
