import React, { useContext, useEffect, useState, useMemo } from "react";
import { useTheme, useMuiTableColors } from "@/context/ThemeContext";
import { Text } from "@/components/ui/Text";
import { Link } from "react-router-dom";
import { ChevronRight, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { SkeletonCapabilityTableRow } from "@/components/ui/skeleton";
import AppContext from "@/AppContext";
import PreAppContext from "@/preAppContext";
import PageSection from "@/components/PageSection";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { Switch } from "@/components/ui/switch";
import styles from "./capabilities.module.css";
import { MaterialReactTable } from "material-react-table";
import CapabilityCostSummary from "@/components/BasicCapabilityCost";
import { LightBulb, QuestionMarkBulb } from "./RequirementsStatus";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PaginationControls } from "@/components/ui/PaginationControls";
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

function CapabilityCard({ capability, truncateString, index = 0 }) {
  const isDeleted = capability.status === "Deleted";
  const isPendingDeletion = capability.status === "Pending Deletion";
  const jsonMetadata = JSON.parse(capability.jsonMetadata ?? "{}");
  const costCentre = jsonMetadata["dfds.cost.centre"];
  const costs = capability.costs ?? [];

  const isStale =
    !capability.modifiedAt ||
    capability.requirementScore == null ||
    new Date(capability.modifiedAt) < new Date(Date.now() - 14 * 86400000);

  const avgCost =
    costs.length > 0
      ? Math.floor(costs.reduce((acc, x) => acc + x.pv, 0) / costs.length)
      : null;
  const costText =
    avgCost == null ? "No data" : avgCost < 1 ? "<$1/d" : `$${avgCost}/d`;

  const delay = index * 22;

  return (
    <Link
      to={`/capabilities/${capability.id}`}
      className="block group animate-card-enter"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card
        className={cn(
          "mb-2 transition-all duration-200 group-hover:bg-surface-muted group-hover:-translate-y-0.5 group-hover:shadow-md",
          isDeleted && "opacity-60 bg-red-950/20",
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2 mb-1">
            {isPendingDeletion && (
              <AlertCircle size={12} className="text-red-500 shrink-0 mt-0.5" />
            )}
            <span className="text-primary font-semibold text-sm flex-1 min-w-0 break-words">
              {truncateString(capability.name, 80)}
            </span>
            <ChevronRight
              size={16}
              className="text-muted shrink-0 mt-0.5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </div>
          <p className="text-secondary text-xs mb-2 leading-relaxed">
            {truncateString(capability.description, 100)}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs font-mono text-muted">
              {isStale ? (
                <>
                  <LightBulb score={-1} size={10} /> stale
                </>
              ) : (
                <>
                  <LightBulb score={capability.requirementScore} size={10} />{" "}
                  {capability.requirementScore?.toFixed(1)}%
                </>
              )}
            </span>
            {costCentre && (
              <span className="text-xs font-mono text-muted">{costCentre}</span>
            )}
            <span className="text-xs font-mono text-muted ml-auto">
              {costText}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const CARD_PAGE_SIZE = 20;

function CapabilityCardList({ filteredCapabilities, truncateString }) {
  const { globalFilter, setGlobalFilter } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const visibleCapabilities = globalFilter
    ? filteredCapabilities.filter((cap) => {
      const q = globalFilter.toLowerCase();
      return (
        cap.name?.toLowerCase().includes(q) ||
        cap.description?.toLowerCase().includes(q) ||
        cap.awsAccountId?.toLowerCase().includes(q)
      );
    })
    : filteredCapabilities;

  const sortedCapabilities = useMemo(() => {
    const arr = [...visibleCapabilities];
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "name") {
      arr.sort((a, b) => dir * a.name.localeCompare(b.name));
    } else if (sortBy === "costCentre") {
      arr.sort((a, b) => {
        const ac = JSON.parse(a.jsonMetadata ?? "{}")["dfds.cost.centre"] ?? "";
        const bc = JSON.parse(b.jsonMetadata ?? "{}")["dfds.cost.centre"] ?? "";
        return dir * (ac.localeCompare(bc) || a.name.localeCompare(b.name));
      });
    } else if (sortBy === "cost") {
      arr.sort((a, b) => {
        const ac =
          a.costs?.length > 0
            ? Math.floor(a.costs.reduce((s, x) => s + x.pv, 0) / a.costs.length)
            : null;
        const bc =
          b.costs?.length > 0
            ? Math.floor(b.costs.reduce((s, x) => s + x.pv, 0) / b.costs.length)
            : null;
        if (ac == null && bc == null) return 0;
        if (ac == null) return 1;
        if (bc == null) return -1;
        return dir * (bc - ac);
      });
    } else if (sortBy === "score") {
      arr.sort((a, b) => {
        const as_ = a.requirementScore ?? null;
        const bs_ = b.requirementScore ?? null;
        if (as_ == null && bs_ == null) return 0;
        if (as_ == null) return 1;
        if (bs_ == null) return -1;
        return dir * (bs_ - as_);
      });
    }
    return arr;
  }, [visibleCapabilities, sortBy, sortDir]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedCapabilities.length / CARD_PAGE_SIZE),
  );
  const pageStart = (currentPage - 1) * CARD_PAGE_SIZE;
  const pageItems = sortedCapabilities.slice(
    pageStart,
    pageStart + CARD_PAGE_SIZE,
  );

  const handleFilterChange = (value) => {
    setGlobalFilter(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCapabilities]);

  return (
    <div>
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Find a capability..."
          value={globalFilter ?? ""}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="w-full px-3 py-2 text-base md:text-sm border border-divider rounded-[5px] bg-surface text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-2 py-2 text-base md:text-sm border border-divider rounded-[5px] bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="costCentre">Cost Centre</option>
            <option value="cost">Cost</option>
            <option value="score">Score</option>
          </select>
          <button
            onClick={() => {
              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
              setCurrentPage(1);
            }}
            className="shrink-0 flex items-center justify-center px-3 py-2 border border-divider rounded-[5px] bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label={
              sortDir === "asc" ? "Sort descending" : "Sort ascending"
            }
          >
            {sortDir === "asc" ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )}
          </button>
        </div>
      </div>
      {pageItems.map((cap, index) => (
        <CapabilityCard
          key={cap.id}
          capability={cap}
          truncateString={truncateString}
          index={index}
        />
      ))}
      {sortedCapabilities.length === 0 && (
        <p className="text-center text-sm text-muted italic py-8">
          No capabilities match that search. Try a different incantation.
        </p>
      )}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageStart={pageStart}
        pageSize={CARD_PAGE_SIZE}
        total={sortedCapabilities.length}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}

function CapabilitiesTable({ columns, filteredCapabilities }) {
  const { globalFilter, setGlobalFilter } = useContext(AppContext);
  const { isDark } = useTheme();

  const { bg, bgMuted, textPrimary, textMuted, borderColor, inputBorder, inputText } = useMuiTableColors();
  const bgDeleted = isDark ? "#3b1a1a" : "#dd8888";
  const bgDeletedHover = isDark ? "#4a2020" : "rgba(187, 221, 243, 0.1)";

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
      renderEmptyRowsFallback={() => (
        <div className="text-center text-sm text-muted italic py-8">
          Nothing here matches your search. Even the cloud is confused.
        </div>
      )}
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
  const { query: costsQuery, getCostComparisonForCapability } = useCapabilitiesCost();

  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);

  const [capabilities, setCapabilities] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);
  const [filteredCapabilities, setFilteredCapabilities] = useState([]);

  useEffect(() => {
    if (isCapabilityFetched && capabilitiesData) {
      const capsWithCosts = capabilitiesData.map((cap) => {
        const { current, previous } = getCostComparisonForCapability(cap.id);
        return { ...cap, costs: current, previousCosts: previous };
      });
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
                      <AlertCircle size={14} className={styles.warningIcon} />
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
            sortingFn: (rowA, rowB) => {
              const aScore = rowA.original.requirementScore ?? -1;
              const bScore = rowB.original.requirementScore ?? -1;
              return aScore - bScore;
            },
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
            sortingFn: (rowA, rowB) => {
              const ac =
                JSON.parse(rowA.original.jsonMetadata ?? "{}")[
                "dfds.cost.centre"
                ] ?? "";
              const bc =
                JSON.parse(rowB.original.jsonMetadata ?? "{}")[
                "dfds.cost.centre"
                ] ?? "";
              return (
                ac.localeCompare(bc) ||
                rowA.original.name.localeCompare(rowB.original.name)
              );
            },
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
            header: "Cost (last 30 days)",
            size: 150,
            enableColumnFilterModes: false,
            sortingFn: (rowA, rowB) => {
              const aCosts = rowA.original.costs ?? [];
              const bCosts = rowB.original.costs ?? [];
              const aAvg =
                aCosts.length > 0
                  ? aCosts.reduce((s, x) => s + x.pv, 0) / aCosts.length
                  : null;
              const bAvg =
                bCosts.length > 0
                  ? bCosts.reduce((s, x) => s + x.pv, 0) / bCosts.length
                  : null;
              if (aAvg == null && bAvg == null) return 0;
              if (aAvg == null) return 1;
              if (bAvg == null) return -1;
              return aAvg - bAvg;
            },
            muiTableHeadCellProps: {
              align: "center",
            },
            muiTableBodyCellProps: {
              align: "right",
            },
            Cell: ({ cell, row }) => {
              let data = cell.getValue() != null ? cell.getValue() : [];
              let previousData = row.original.previousCosts ?? [];
              return (
                <div className={styles.costs}>
                  <CapabilityCostSummary data={data} previousData={previousData} />
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
        headline={`${showOnlyMyCapabilities ? "My" : "All"} Capabilities ${isLoading
          ? ""
          : `(${(filteredCapabilities || []).length} / ${(capabilities || []).length
          })`
          }`}
        headlineChildren={
          isLoading ? null : (
            <div className={styles.myCapabilitiesToggleContainer}>
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
            </div>
          )
        }
      >
        {isLoading && (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCapabilityTableRow key={i} />
            ))}
          </div>
        )}

        {!isLoading &&
          (isMobile ? (
            <CapabilityCardList
              filteredCapabilities={filteredCapabilities}
              truncateString={truncateString}
            />
          ) : (
            <div className="animate-fade-up">
              <CapabilitiesTable
                columns={columns}
                filteredCapabilities={filteredCapabilities}
              />
            </div>
          ))}
      </PageSection>
    </>
  );
}
