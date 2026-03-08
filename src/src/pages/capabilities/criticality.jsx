import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "components/Page";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import AppContext from "AppContext";
import { Text } from "@/components/ui/Text";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { MaterialReactTable } from "material-react-table";
import PageSection from "components/PageSection";
import PreAppContext from "../../preAppContext";
import { useTheme } from "@/context/ThemeContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function calculateCriticalityLevel(availability, criticality, classification) {
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
  const { isFetched, data } = useCapabilities();
  const { truncateString } = useContext(AppContext);
  const [enrichedCapabilities, setEnrichedCapabilities] = useState([]);
  const { isDark } = useTheme();
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: { mode: isDark ? "dark" : "light" },
        components: {
          MuiTableSortLabel: {
            styleOverrides: {
              icon: { opacity: 0.5 },
              root: {
                "&:hover .MuiTableSortLabel-icon": { opacity: 1 },
                "&.Mui-active .MuiTableSortLabel-icon": { opacity: 1 },
              },
            },
          },
        },
      }),
    [isDark],
  );

  const bg = isDark ? "#1e293b" : "#ffffff";
  const bgMuted = isDark ? "#0f172a" : "#f2f2f2";
  const textPrimary = isDark ? "#e2e8f0" : "#002b45";
  const textBody = isDark ? "#e2e8f0" : "#4d4e4c";
  const textMuted = isDark ? "#64748b" : "#afafaf";
  const borderColor = isDark ? "#334155" : "#eeeeee";
  const inputBorder = isDark ? "#334155" : undefined;
  const inputText = isDark ? "#e2e8f0" : undefined;

  const navigate = useNavigate();
  const clickHandler = (id) => navigate(`/capabilities/${id}`);

  useEffect(() => {
    if (isFetched) {
      const filtered = data.filter(
        (capability) => capability.status !== "Deleted",
      );
      const mapped = filtered.map((capability) => {
        const enrichedCapability = { ...capability };
        const jsonMetadata = JSON.parse(capability.jsonMetadata ?? "{}");
        enrichedCapability.availability =
          jsonMetadata["dfds.service.availability"] || "unknown";
        enrichedCapability.criticality =
          jsonMetadata["dfds.service.criticality"] || "unknown";
        enrichedCapability.classification =
          jsonMetadata["dfds.data.classification"] || "unknown";
        enrichedCapability.costCenter =
          jsonMetadata["dfds.cost.centre"] || "unknown";
        enrichedCapability.criticalityLevel = calculateCriticalityLevel(
          jsonMetadata["dfds.service.availability"],
          jsonMetadata["dfds.service.criticality"],
          jsonMetadata["dfds.data.classification"],
        );
        return enrichedCapability;
      });

      setEnrichedCapabilities(mapped);
    }
  }, [isFetched]);

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
              <Text styledAs="action" as={"div"}>
                {truncateString(renderedCellValue, 40)}
              </Text>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.costCenter,
        header: "Cost Center",
        size: 120,
        enableColumnFilterModes: true,
        enableGlobalFilter: true,
        enableFilterMatchHighlighting: true,
        Cell: ({ cell }) => {
          return <div>{cell.getValue()}</div>;
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
    ],
    [],
  );

  return (
    <>
      <Page title="Capability Criticality">
        <Card className="mb-6">
          <CardTitle className="text-xl font-bold p-6 pb-2">
            Information
          </CardTitle>
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
          </CardContent>
        </Card>

        <PageSection headline="Criticality">
          {!isFetched && <Spinner />}

          {isFetched && (
            <ThemeProvider theme={muiTheme}>
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
                    color: textPrimary,
                    backgroundColor: bg,
                    borderBottom: `1px solid ${borderColor}`,
                  },
                }}
                muiTableBodyCellProps={{
                  sx: {
                    fontWeight: "400",
                    fontSize: "16px",
                    fontFamily: "DFDS",
                    color: textBody,
                    backgroundColor: bg,
                    padding: "5px",
                    borderBottom: `1px solid ${borderColor}`,
                  },
                }}
                muiTableBodyRowProps={({ row }) => ({
                  onClick: () => clickHandler(row.original.id),
                  sx: {
                    cursor: "pointer",
                    padding: 0,
                    margin: 0,
                    minHeight: 0,
                    "&:hover td": {
                      backgroundColor: bgMuted,
                    },
                  },
                })}
                muiTablePaperProps={{
                  elevation: 0,
                  sx: {
                    borderRadius: "0",
                    backgroundColor: bg,
                  },
                }}
                muiTopToolbarProps={{
                  sx: {
                    background: bg,
                    color: textPrimary,
                    "& .MuiIconButton-root": { color: textMuted },
                    "& .MuiSvgIcon-root": { color: textMuted },
                  },
                }}
                muiBottomToolbarProps={{
                  sx: {
                    background: bg,
                    color: textPrimary,
                    borderTop: `1px solid ${borderColor}`,
                    "& .MuiIconButton-root": { color: textMuted },
                    "& .MuiTablePagination-root": { color: textPrimary },
                    "& .MuiTablePagination-selectLabel": { color: textMuted },
                    "& .MuiTablePagination-displayedRows": { color: textMuted },
                    "& .MuiSelect-icon": { color: textMuted },
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
                    "& .MuiOutlinedInput-root": {
                      color: inputText,
                      "& fieldset": { borderColor: inputBorder },
                      "&:hover fieldset": { borderColor: inputBorder },
                      "&.Mui-focused fieldset": {
                        borderColor: isDark ? "#60a5fa" : undefined,
                      },
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: textMuted,
                      opacity: 1,
                    },
                  },
                  size: "small",
                  variant: "outlined",
                }}
                muiFilterTextFieldProps={{
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      color: inputText,
                      "& fieldset": { borderColor: inputBorder },
                      "&:hover fieldset": { borderColor: inputBorder },
                      "&.Mui-focused fieldset": {
                        borderColor: isDark ? "#60a5fa" : undefined,
                      },
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: textMuted,
                      opacity: 1,
                    },
                    "& .MuiSvgIcon-root": { color: textMuted },
                  },
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
            </ThemeProvider>
          )}
        </PageSection>
      </Page>
    </>
  );
}
