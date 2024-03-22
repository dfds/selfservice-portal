import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Page from "@/components/Page";
import { useCapabilities } from "@/hooks/Capabilities";
import AppContext from "@/AppContext";
import { Text } from "@dfds-ui/typography";
import {
  Card,
  CardTitle,
  CardContent,
  Spinner,
} from "@dfds-ui/react-components";
import { MaterialReactTable } from "material-react-table";
import PageSection from "@/components/PageSection";

function calculateCriticalityLevel(
  availability,
  criticality,
  classification,
  status,
) {
  if (status === "Deleted") {
    return 1;
  }

  if (
    availability === undefined &&
    criticality === undefined &&
    classification === undefined
  ) {
    return 5;
  }
  if (
    availability === undefined ||
    criticality === undefined ||
    classification === undefined
  ) {
    return 4;
  }
  if (
    availability === "High" ||
    criticality === "High" ||
    classification !== "Public"
  ) {
    return 3;
  }
  if (
    availability === "Medium" ||
    criticality === "Medium" ||
    classification !== "Public"
  ) {
    return 2;
  }
  return 1;
}

export default function CapabilitiesCriticalityPage() {
  const { capabilities, isLoaded } = useCapabilities();
  const { truncateString } = useContext(AppContext);

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/capabilities/${id}`);

  const enrichedCapabilities = capabilities.map((capability) => {
    const enrichedCapability = { ...capability };
    const jsonMetadata = JSON.parse(capability.jsonMetadata ?? "{}");
    enrichedCapability.availability =
      jsonMetadata["dfds.service.availability"] || "unknown";
    enrichedCapability.criticality =
      jsonMetadata["dfds.service.criticality"] || "unknown";
    enrichedCapability.classification =
      jsonMetadata["dfds.data.classification"] || "unknown";
    enrichedCapability.criticalityLevel = calculateCriticalityLevel(
      jsonMetadata["dfds.service.availability"],
      jsonMetadata["dfds.service.criticality"],
      jsonMetadata["dfds.data.classification"],
      enrichedCapability.status,
    );
    return enrichedCapability;
  });

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.name,
        header: "Name",
        size: 250,
        enableColumnFilterModes: true,
        disableFilters: false,
        enableGlobalFilter: true,
        enableFilterMatchHighlighting: true,

        Cell: ({ cell, renderedCellValue }) => {
          return (
            <div>
              {" "}
              <Text styledAs="action" as={"div"}>
                {truncateString(renderedCellValue, 40)}
              </Text>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.criticalityLevel,
        header: "Score",
        size: 25,
        enableColumnFilterModes: false,
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
        accessorFn: (row) => row.criticality,
        header: "Criticality",
        size: 25,
        enableColumnFilterModes: false,
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
        accessorFn: (row) => row.availability,
        header: "Availability",
        size: 25,
        enableColumnFilterModes: false,
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
        accessorFn: (row) => row.classification,
        header: "Classification",
        size: 25,
        enableColumnFilterModes: false,
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
        accessorFn: (row) => row.status,
        header: "Deleted",
        size: 25,
        enableColumnFilterModes: false,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ cell }) => {
          if (cell.getValue() === "Deleted") {
            return <div>Deleted</div>;
          }
          return <div></div>;
        },
      },
    ],
    [],
  );

  return (
    <>
      <Page title="Capability Criticality">
        <Card variant="fill" surface="main" size="xl" reverse={true}>
          <CardTitle largeTitle>Information</CardTitle>
          <CardContent>
            <p>
              Criticality is derived from the tags applied to the capability.
              The table below show the individual tags as well as an overall
              score. The overall score is a loose criticality approximation
              based on the following:
            </p>
            <ul>
              <li>5: None of the expected tags are set for the capability.</li>
              <li>
                4: At least one of the expected tags is not set for the
                capability.
              </li>
              <li>
                3: All expected tags set. At least one of the expected tags is
                set to High for the capability or classification is not Public
              </li>
              <li>
                2: All expected tags set. At least one of the expected tags is
                set to Medium for the capability or classification is not Public
              </li>
              <li>
                1: All expected tags are set to Low for the capability and
                classification is Public
              </li>
            </ul>
            <p>
              Note: Deleted capabilities are automatically granted a score of 1.
            </p>
          </CardContent>
        </Card>

        <PageSection headline="Criticality">
          {!isLoaded && <Spinner />}

          {isLoaded && (
            <MaterialReactTable
              columns={columns}
              data={enrichedCapabilities}
              initialState={{
                pagination: { pageSize: 50 },
                showGlobalFilter: true,
                showColumnFilters: true,
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
              muiTablePaperProps={{
                elevation: 0,
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
              enableDensityToggle={true}
              enableFullScreenToggle={true}
              enableHiding={true}
              enableFilters={true}
              enableGlobalFilter={false}
              enableTopToolbar={true}
              enableBottomToolbar={true}
              enableColumnActions={true}
            />
          )}
        </PageSection>
      </Page>
    </>
  );
}
