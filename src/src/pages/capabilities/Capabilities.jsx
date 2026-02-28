import React, { useContext, useEffect, useState, useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Text } from "@/components/ui/Text";
import { Link } from "react-router-dom";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import AppContext from "AppContext";
import PreAppContext from "@/preAppContext";
import PageSection from "components/PageSection";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { Switch } from "@/components/ui/switch";
import styles from "./capabilities.module.css";
import { MaterialReactTable } from "material-react-table";
import CapabilityCostSummary from "components/BasicCapabilityCost";
import { LightBulb, QuestionMarkBulb } from "./RequirementsStatus";
//import { InlineAwsCountSummary } from "pages/capabilities/AwsResourceCount";

function RowLink({ to }) {
  return (
    <Link
      to={to}
      tabIndex={-1}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, zIndex: 1 }}
    />
  );
}

function withRowLinks(columns, getHref) {
  return columns.map((col) => ({
    ...col,
    Cell: (props) => (
      <>
        <RowLink to={getHref(props.row)} />
        {col.Cell ? col.Cell(props) : null}
      </>
    ),
  }));
}

function CapabilitiesTable({ columns, filteredCapabilities }) {
  const { globalFilter, setGlobalFilter } = useContext(AppContext);
  const { isDark } = useTheme();

  const bg = isDark ? "#1e293b" : "#ffffff";
  const bgMuted = isDark ? "#0f172a" : "#f2f2f2";
  const bgDeleted = isDark ? "#3b1a1a" : "#dd8888";
  const bgDeletedHover = isDark ? "#4a2020" : "rgba(187, 221, 243, 0.1)";
  const textPrimary = isDark ? "#e2e8f0" : "#002b45";
  const textMuted = isDark ? "#64748b" : "#afafaf";
  const borderColor = isDark ? "#334155" : "#eeeeee";
  const inputBorder = isDark ? "#334155" : undefined;
  const inputText = isDark ? "#e2e8f0" : undefined;

  return (
    <MaterialReactTable
      columns={columns}
      data={filteredCapabilities}
      initialState={{
        pagination: { pageSize: 50 },
        showGlobalFilter: true,
        columnVisibility: { AwsAccountId: false, hiddenName: false },
      }}
      state={{
        globalFilter: globalFilter,
      }}
      onGlobalFilterChange={(value) => {
        setGlobalFilter(value);
      }}
      muiTableHeadCellProps={{
        sx: {
          fontFamily: '"SFMono-Regular", "Fira Code", "Consolas", monospace',
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: textMuted,
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: bg,
        },
      }}
      muiTableBodyCellProps={({ row }) => ({
        sx: {
          position: "relative",
          fontWeight: "400",
          fontSize: "14px",
          color: textPrimary,
          padding: "5px",
          backgroundColor: row.original.status === "Deleted" ? bgDeleted : bg,
          borderBottom: `1px solid ${borderColor}`,
        },
      })}
      muiTablePaperProps={{
        elevation: 0,
        sx: {
          borderRadius: "0",
          backgroundColor: bg,
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
            "&.Mui-focused fieldset": { borderColor: isDark ? "#60a5fa" : undefined },
          },
          "& .MuiInputBase-input::placeholder": {
            color: textMuted,
            opacity: 1,
          },
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
      muiTableBodyRowProps={({ row }) => ({
        sx: {
          cursor: "pointer",
          "&:hover td": {
            backgroundColor:
              row.original.status === "Deleted" ? bgDeletedHover : bgMuted,
          },
        },
      })}
    />
  );
}

export default function CapabilitiesList() {
  const {
    truncateString,
    showDeletedCapabilities,
    showOnlyMyCapabilities,
    toggleShowDeletedCapabilities,
    toggleShowOnlyMyCapabilities,
  } = useContext(AppContext);
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const { isFetched: isCapabilityFetched, data: capabilitiesData } =
    useCapabilities();
  const { query: costsQuery, getCostsForCapability } = useCapabilitiesCost();

  const [isLoading, setIsLoading] = useState(true);

  const [capabilities, setCapabilities] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);
  const [filteredCapabilities, setFilteredCapabilities] = useState([]);

  useEffect(() => {
    if (isCapabilityFetched && capabilitiesData) {
      const capsWithCosts = capabilitiesData.map((cap) => ({
        ...cap,
        costs: getCostsForCapability(cap.id, 7),
      }));
      setCapabilities(capsWithCosts);

      const myCapabilities = capsWithCosts.filter((capability) => {
        return capability.userIsMember;
      });
      setMyCapabilities(myCapabilities);
    }
  }, [isCapabilityFetched, capabilitiesData, costsQuery.isFetched]);

  useEffect(() => {
    if (capabilities) {
      if (showOnlyMyCapabilities && myCapabilities) {
        if (showDeletedCapabilities) {
          setFilteredCapabilities(myCapabilities);
        } else {
          setFilteredCapabilities(
            myCapabilities.filter((capability) => {
              return capability.status !== "Deleted";
            }),
          );
        }
      } else {
        if (showDeletedCapabilities) {
          setFilteredCapabilities(capabilities);
        } else {
          setFilteredCapabilities(
            capabilities.filter((capability) => {
              return capability.status !== "Deleted";
            }),
          );
        }
      }
    }
  }, [
    capabilities,
    myCapabilities,
    showOnlyMyCapabilities,
    showDeletedCapabilities,
  ]);

  useEffect(() => {
    if (isCapabilityFetched) {
      setIsLoading(false);
    }
  }, [isCapabilityFetched]);

  const columns = useMemo(
    () =>
      withRowLinks(
        [
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
                      <AlertCircle className={styles.warningIcon} />
                    </Text>
                  ) : null}
                  <Text
                    styledAs="action"
                    style={{ marginLeft: "20px" }}
                    as={"div"}
                  >
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
                requirementsScore: row.requirementScore,
                totalScore: row.totalScore,
                modifiedAt: row.modifiedAt,
                id: row.id,
              };
            },
            header: "Compliance",
            size: 150,
            enableColumnFilterModes: false,
            muiTableHeadCellProps: {
              align: "center",
            },
            muiTableBodyCellProps: {
              align: "center",
            },
            Cell: ({ cell }) => {
              const cellValue = cell.getValue();
              let requirementsScore = cellValue.requirementsScore;
              const modifiedAt = cellValue.modifiedAt;
              const capabilityId = cellValue.id;

              // Check if data is stale (older than 2 weeks or score is missing)
              const isStale = (() => {
                if (!modifiedAt) return true;
                if (
                  requirementsScore === null ||
                  requirementsScore === undefined
                )
                  return true;
                const twoWeeksAgo = new Date();
                twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                const modifiedDate = new Date(modifiedAt);
                return modifiedDate < twoWeeksAgo;
              })();

              if (isStale) {
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <LightBulb score={-1} size={20} />
                    <span
                      style={{
                        fontFamily: "monospace",
                        width: "70px",
                        textAlign: "center",
                        fontSize: "10px",
                      }}
                    >
                      click to
                      <br />
                      reload
                    </span>
                  </div>
                );
              }

              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <LightBulb score={requirementsScore} size={20} />
                  <span
                    style={{
                      fontFamily: "monospace",
                      width: "70px",
                      textAlign: "right",
                    }}
                  >{`${requirementsScore.toFixed(1)}%`}</span>
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
            Cell: () => <ChevronRight />,
            Header: <div></div>, //enable empty header
          },
          {
            accessorFn: (row) => row.name,
            header: "hiddenName",
            size: 0,
            enableColumnFilterModes: false,
            muiTableBodyCellProps: {
              align: "right",
            },
            Cell: ({ cell }) => {
              return <div></div>;
            },
            Header: <div></div>, //enable empty header
          },
        ],
        (row) => `/capabilities/${row.original.id}`,
      ),
    [],
  );

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
            <>
              <div className={styles.myCapabilitiesToggleBox}>
                <span className={styles.myCapabilitiesToggleTitle}>
                  Show just mine:{" "}
                </span>
                <Switch
                  checked={showOnlyMyCapabilities}
                  onCheckedChange={toggleShowOnlyMyCapabilities}
                />
              </div>
              {isCloudEngineerEnabled && (
                <div className={styles.myCapabilitiesToggleBox}>
                  <span className={styles.myCapabilitiesToggleTitle}>
                    Show deleted capabilities:{" "}
                  </span>
                  <Switch
                    checked={showDeletedCapabilities}
                    onCheckedChange={toggleShowDeletedCapabilities}
                  />
                </div>
              )}
            </>
          )
        }
      >
        {isLoading && <Spinner />}

        {!isLoading && (
          <CapabilitiesTable
            columns={columns}
            filteredCapabilities={filteredCapabilities}
          />
        )}
      </PageSection>
    </>
  );
}
