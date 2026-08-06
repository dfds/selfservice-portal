import React, { useCallback, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Plus, X } from "lucide-react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_SortingState,
} from "material-react-table";
import {
  Skeleton,
  SkeletonComplianceCapabilityRow,
} from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRequirementComplianceDetails } from "@/state/remote/queries/capabilities";
import { statusIcon } from "@/lib/statusUtils";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMuiTableColors } from "@/context/ThemeContext";
import { complianceColor, parseMetadata } from "./utils";
import { ArcGauge } from "./components";
import { MetadataCombobox } from "@/components/ui/MetadataCombobox";
import {
  buildMetadataIndex,
  matchesMetadata,
  type MetadataFilter,
  type MetadataMode,
} from "@/lib/metadataFilters";

// ─── Types ────────────────────────────────────────────────────────────────────

type CapabilityItem = {
  name: string;
  status: string;
  detail: string | null;
};

type CapabilityForRequirement = {
  capabilityId: string;
  capabilityName: string;
  jsonMetadata: string | null;
  status: "Compliant" | "NonCompliant" | "Unknown";
  score: number | null;
  items: CapabilityItem[];
};

type RequirementDetailsData = {
  requirementId: string;
  categoryName: string;
  displayName: string;
  description: string;
  helpUrl: string | null;
  totalCapabilities: number;
  compliantCount: number;
  nonCompliantCount: number;
  unknownCount: number;
  capabilities: CapabilityForRequirement[];
};

type StatusFilter = "all" | "Compliant" | "NonCompliant" | "Unknown";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Compliant", label: "Compliant" },
  { key: "NonCompliant", label: "Non-compliant" },
  { key: "Unknown", label: "Unknown" },
];

const NA_TOOLTIP =
  "N/A means that either no compliance data is available for this value yet or that the data shows no items in this category.";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusLabel(s: string): string {
  if (s === "Compliant") return "Compliant";
  if (s === "NonCompliant") return "Non-compliant";
  return "Unknown";
}

function statusColor(s: string): string {
  if (s === "Compliant") return "#22c55e";
  if (s === "NonCompliant") return "#ef4444";
  return "#94a3b8";
}

function statusToken(s: string): string {
  if (s === "Compliant") return "compliant";
  if (s === "NonCompliant") return "noncompliant";
  return "unknown";
}

// ─── URL state ────────────────────────────────────────────────────────────────

function readStatusFilter(p: URLSearchParams): StatusFilter {
  const s = p.get("status");
  if (s === "Compliant" || s === "NonCompliant" || s === "Unknown") return s;
  return "all";
}

function readMetadataFilters(p: URLSearchParams): MetadataFilter[] {
  return p.getAll("tag").map((raw) => {
    const eq = raw.indexOf("=");
    if (eq === -1) return { key: raw, value: "" };
    return { key: raw.slice(0, eq), value: raw.slice(eq + 1) };
  });
}

function readMetadataMode(p: URLSearchParams): MetadataMode {
  return p.get("tagmode") === "or" ? "or" : "and";
}

function readSorting(p: URLSearchParams): MRT_SortingState {
  const s = p.get("sort");
  if (!s) return [];
  const colon = s.lastIndexOf(":");
  if (colon === -1) return [{ id: s, desc: false }];
  return [{ id: s.slice(0, colon), desc: s.slice(colon + 1) === "desc" }];
}

function writeUrl(
  prev: URLSearchParams,
  patch: {
    status?: StatusFilter;
    tags?: MetadataFilter[];
    tagMode?: MetadataMode;
    sorting?: MRT_SortingState;
  },
): URLSearchParams {
  const next = new URLSearchParams(prev);
  if (patch.status !== undefined) {
    if (patch.status === "all") next.delete("status");
    else next.set("status", patch.status);
  }
  if (patch.tags !== undefined) {
    next.delete("tag");
    for (const f of patch.tags) {
      next.append("tag", f.value ? `${f.key}=${f.value}` : f.key);
    }
  }
  if (patch.tagMode !== undefined) {
    if (patch.tagMode === "or") next.set("tagmode", "or");
    else next.delete("tagmode");
  }
  if (patch.sorting !== undefined) {
    if (patch.sorting.length === 0) next.delete("sort");
    else {
      const s = patch.sorting[0];
      next.set("sort", `${s.id}:${s.desc ? "desc" : "asc"}`);
    }
  }
  return next;
}

// ─── SummaryCell ──────────────────────────────────────────────────────────────

function SummaryCell({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-muted whitespace-nowrap">
        {label}
      </span>
      <span
        className="text-[1.25rem] font-bold font-mono leading-none"
        style={{ color: value === null ? undefined : color }}
        title={value === null ? NA_TOOLTIP : undefined}
      >
        {value === null ? "N/A" : value}
      </span>
    </div>
  );
}

// ─── ExpandedItemsDetail ──────────────────────────────────────────────────────

function ExpandedItemsDetail({
  cap,
  metadata,
}: {
  cap: CapabilityForRequirement;
  metadata: Record<string, string>;
}) {
  const metadataEntries = Object.entries(metadata);
  return (
    <div className="border-t border-divider bg-surface-muted/40 px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <div className="text-[0.625rem] font-mono uppercase tracking-[0.12em] text-muted mb-2">
            Items
          </div>
          {cap.items.length === 0 ? (
            <p className="text-[0.6875rem] text-muted italic">No items.</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {cap.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[0.6875rem] font-mono text-secondary"
                >
                  {statusIcon(statusToken(item.status))}
                  <span className="truncate flex-1">{item.name}</span>
                  <span className="text-muted">
                    {item.detail ? ` · ${item.detail}` : ""}
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: statusColor(item.status) }}
                  >
                    {statusLabel(item.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {metadataEntries.length > 0 && (
          <div>
            <div className="text-[0.625rem] font-mono uppercase tracking-[0.12em] text-muted mb-2">
              Metadata
            </div>
            <div className="flex flex-col gap-0.5">
              {metadataEntries.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline gap-2 text-[0.6875rem] font-mono"
                >
                  <span className="text-muted truncate flex-shrink-0 max-w-[160px]">
                    {k}
                  </span>
                  <span className="text-secondary truncate">{v || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CapabilityTable ──────────────────────────────────────────────────────────

function CapabilityTable({
  capabilities,
  metadataByCap,
  sorting,
  setSorting,
}: {
  capabilities: CapabilityForRequirement[];
  metadataByCap: Map<string, Record<string, string>>;
  sorting: MRT_SortingState;
  setSorting: (
    updater: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState),
  ) => void;
}) {
  const { bg, bgMuted, textPrimary, textMuted, borderColor } =
    useMuiTableColors();
  const sortingRef = useRef<MRT_SortingState>(sorting);
  sortingRef.current = sorting;

  const columns = useMemo<MRT_ColumnDef<CapabilityForRequirement>[]>(
    () => [
      {
        id: "capability",
        header: "Capability",
        accessorFn: (row) => row.capabilityName,
        size: 380,
        Cell: ({ row }) => (
          <div className="min-w-0 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Link
                to={`/capabilities/${row.original.capabilityId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[0.8125rem] font-medium text-primary hover:text-action hover:underline truncate block"
              >
                {row.original.capabilityName}
              </Link>
              <div className="text-[10.5px] font-mono text-muted truncate">
                {row.original.capabilityId}
              </div>
            </div>
            <Link
              to={`/capabilities/${row.original.capabilityId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 p-1 rounded-[5px] text-muted hover:text-action hover:bg-surface-muted transition-colors"
              title="Open capability"
            >
              <ExternalLink size={12} strokeWidth={2} />
            </Link>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        size: 160,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const s = row.original.status;
          return (
            <div className="flex items-center justify-center gap-1.5">
              {statusIcon(statusToken(s))}
              <span
                className="text-[0.75rem] font-medium"
                style={{ color: statusColor(s) }}
              >
                {statusLabel(s)}
              </span>
            </div>
          );
        },
      },
      {
        id: "score",
        header: "Score",
        accessorFn: (row) => row.score,
        size: 100,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => {
          const score = row.original.score;
          if (score == null)
            return (
              <span className="text-muted text-[0.75rem]" title={NA_TOOLTIP}>
                N/A
              </span>
            );
          return (
            <span
              className="font-mono text-[0.8125rem] font-semibold"
              style={{ color: complianceColor(score) }}
            >
              {score}%
            </span>
          );
        },
      },
      {
        id: "items",
        header: "Items",
        accessorFn: (row) => row.items.length,
        size: 80,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => {
          const items = row.original.items;
          if (items.length === 0)
            return (
              <span className="font-mono text-[0.75rem] text-muted">—</span>
            );
          const allUnknown = items.every((it) => it.status === "Unknown");
          if (allUnknown)
            return (
              <span
                className="font-mono text-[0.75rem] text-muted"
                title={NA_TOOLTIP}
              >
                Unknown
              </span>
            );
          const compliant = items.filter(
            (it) => it.status === "Compliant",
          ).length;
          const total = items.length;
          const pct = Math.round((compliant / total) * 100);
          return (
            <span
              className="font-mono text-[0.75rem] font-semibold"
              style={{ color: complianceColor(pct) }}
            >
              {compliant}/{total}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={capabilities}
      enableExpanding
      enableExpandAll={false}
      renderDetailPanel={({ row }) => (
        <ExpandedItemsDetail
          cap={row.original}
          metadata={metadataByCap.get(row.original.capabilityId) ?? {}}
        />
      )}
      state={{ sorting }}
      onSortingChange={setSorting}
      initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
      enableGlobalFilter={false}
      enableColumnActions={false}
      enableDensityToggle={false}
      enableHiding={false}
      enableFilters={false}
      enableTopToolbar={false}
      enableBottomToolbar
      displayColumnDefOptions={{
        "mrt-row-expand": {
          size: 0,
          muiTableHeadCellProps: { sx: { display: "none" } },
          muiTableBodyCellProps: { sx: { display: "none" } },
        },
      }}
      muiTableHeadCellProps={{
        sx: {
          fontFamily: '"SFMono-Regular", "Fira Code", "Consolas", monospace',
          fontSize: "0.6875rem",
          fontWeight: "600",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: textMuted,
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: bg,
        },
      }}
      muiTableBodyCellProps={{
        sx: {
          fontSize: "0.8125rem",
          color: textPrimary,
          padding: "8px 12px",
          backgroundColor: bg,
          borderBottom: `1px solid ${borderColor}`,
        },
      }}
      muiTablePaperProps={{
        elevation: 0,
        sx: {
          borderRadius: "8px",
          border: `1px solid ${borderColor}`,
          backgroundColor: bg,
          overflow: "hidden",
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
      muiTableDetailPanelProps={{
        sx: {
          backgroundColor: bgMuted,
          borderBottom: `1px solid ${borderColor}`,
        },
      }}
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => {
          if (window.getSelection()?.toString()) return;
          row.toggleExpanded();
        },
        sx: { cursor: "pointer", "&:hover td": { backgroundColor: bgMuted } },
      })}
      renderEmptyRowsFallback={() => (
        <div className="text-center text-sm text-muted italic py-8">
          No capabilities match.
        </div>
      )}
    />
  );
}

// ─── MobileCapabilityList ─────────────────────────────────────────────────────

function MobileCapabilityList({
  capabilities,
  sorting,
  setSorting,
}: {
  capabilities: CapabilityForRequirement[];
  sorting: MRT_SortingState;
  setSorting: (
    updater: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState),
  ) => void;
}) {
  const SORT_COLS = [
    { id: "capability", label: "Name" },
    { id: "status", label: "Status" },
    { id: "score", label: "Score" },
  ];
  const active = sorting[0];

  function toggleSort(id: string) {
    setSorting((prev) => {
      if (prev[0]?.id === id) return [{ id, desc: !prev[0].desc }];
      return [{ id, desc: false }];
    });
  }

  const sorted = useMemo(() => {
    if (!active) return capabilities;
    return [...capabilities].sort((a, b) => {
      const sign = active.desc ? -1 : 1;
      if (active.id === "capability")
        return sign * a.capabilityName.localeCompare(b.capabilityName);
      if (active.id === "status")
        return sign * a.status.localeCompare(b.status);
      if (active.id === "score") {
        if (a.score == null && b.score == null) return 0;
        if (a.score == null) return 1;
        if (b.score == null) return -1;
        return sign * (a.score - b.score);
      }
      return 0;
    });
  }, [capabilities, active]);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {SORT_COLS.map(({ id, label }) => {
          const isActive = active?.id === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleSort(id)}
              className={cn(
                "inline-flex items-center gap-1 h-[26px] px-2.5 border rounded-full text-[0.625rem] font-medium transition-all",
                isActive
                  ? "bg-[#0e7cc1] dark:bg-[#60a5fa] border-[#0e7cc1] dark:border-[#60a5fa] text-white"
                  : "bg-white dark:bg-[#0f172a] border-[#d9dcde] dark:border-[#334155] text-[#4a6278] dark:text-[#94a3b8]",
              )}
            >
              {label}
              {isActive &&
                (active.desc ? (
                  <ArrowDown size={10} strokeWidth={2} />
                ) : (
                  <ArrowUp size={10} strokeWidth={2} />
                ))}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {sorted.map((cap) => (
          <Link
            key={cap.capabilityId}
            to={`/capabilities/${cap.capabilityId}`}
            className="block bg-surface border border-card rounded-[8px] p-3 no-underline text-inherit hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[0.8125rem] font-medium text-primary truncate">
                  {cap.capabilityName}
                </div>
                <div className="text-[10.5px] font-mono text-muted truncate">
                  {cap.capabilityId}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {statusIcon(statusToken(cap.status))}
                <span
                  className="text-[0.6875rem] font-medium"
                  style={{ color: statusColor(cap.status) }}
                >
                  {statusLabel(cap.status)}
                </span>
              </div>
            </div>
            {cap.score != null && (
              <div
                className="mt-1 text-[0.6875rem] font-mono font-semibold"
                style={{ color: complianceColor(cap.score) }}
              >
                {cap.score}%
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── RequirementComplianceDetailPage ─────────────────────────────────────────

export default function RequirementComplianceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isFetched } = useRequirementComplianceDetails(id ?? null) as {
    data: RequirementDetailsData | undefined;
    isFetched: boolean;
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = useMemo(
    () => readStatusFilter(searchParams),
    [searchParams],
  );
  const metadataFilters = useMemo(
    () => readMetadataFilters(searchParams),
    [searchParams],
  );
  const metadataMode = useMemo(
    () => readMetadataMode(searchParams),
    [searchParams],
  );
  const sorting = useMemo(() => readSorting(searchParams), [searchParams]);
  const isMobile = useIsMobile();

  const updateUrl = useCallback(
    (patch: Parameters<typeof writeUrl>[1]) => {
      setSearchParams((prev) => writeUrl(prev, patch), { replace: true });
    },
    [setSearchParams],
  );

  const setStatusFilter = useCallback(
    (status: StatusFilter) => updateUrl({ status }),
    [updateUrl],
  );
  const setMetadataMode = useCallback(
    (mode: MetadataMode) => updateUrl({ tagMode: mode }),
    [updateUrl],
  );
  const setSorting = useCallback(
    (
      updater: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState),
    ) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      updateUrl({ sorting: next });
    },
    [updateUrl, sorting],
  );

  const metadataByCap = useMemo(() => {
    const out = new Map<string, Record<string, string>>();
    (data?.capabilities ?? []).forEach((cap) => {
      out.set(cap.capabilityId, parseMetadata(cap.jsonMetadata));
    });
    return out;
  }, [data]);

  const metadataIndex = useMemo(
    () => buildMetadataIndex(Array.from(metadataByCap.values())),
    [metadataByCap],
  );

  const metadataFilteredCapabilities = useMemo<CapabilityForRequirement[]>(() => {
    const all = data?.capabilities ?? [];
    if (metadataFilters.every((f) => !f.key)) return all;
    return all.filter((cap) =>
      matchesMetadata(
        metadataByCap.get(cap.capabilityId) ?? {},
        metadataFilters,
        metadataMode,
      ),
    );
  }, [data, metadataFilters, metadataMode, metadataByCap]);

  const filteredCapabilities = useMemo<CapabilityForRequirement[]>(() => {
    if (statusFilter === "all") return metadataFilteredCapabilities;
    return metadataFilteredCapabilities.filter((c) => c.status === statusFilter);
  }, [metadataFilteredCapabilities, statusFilter]);

  const aggregates = useMemo(() => {
    const total = metadataFilteredCapabilities.length;
    const compliant = metadataFilteredCapabilities.filter(
      (c) => c.status === "Compliant",
    ).length;
    const nonCompliant = metadataFilteredCapabilities.filter(
      (c) => c.status === "NonCompliant",
    ).length;
    const unknown = metadataFilteredCapabilities.filter(
      (c) => c.status === "Unknown",
    ).length;
    const pct = total > 0 ? Math.round((compliant / total) * 100) : 0;
    return { total, compliant, nonCompliant, unknown, pct };
  }, [metadataFilteredCapabilities]);

  const addFilter = () =>
    updateUrl({ tags: [...metadataFilters, { key: "", value: "" }] });
  const updateFilter = (index: number, patch: Partial<MetadataFilter>) =>
    updateUrl({
      tags: metadataFilters.map((f, i) =>
        i === index ? { ...f, ...patch } : f,
      ),
    });
  const removeFilter = (index: number) =>
    updateUrl({ tags: metadataFilters.filter((_, i) => i !== index) });

  return (
    <div className="min-h-full">
      <div className="min-w-0 p-4 md:p-8 @container">
        {/* Header */}
        <div className="mb-6 animate-fade-up">
          <Link
            to="/compliance/requirements"
            className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-semibold tracking-[0.05em] text-action hover:underline mb-3"
          >
            <ArrowLeft size={12} strokeWidth={2} />
            Requirements
          </Link>
          <div className="font-mono text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1.5">
            // Requirement
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em] leading-[1.2]">
              {isFetched ? (
                data?.displayName ?? id
              ) : (
                <Skeleton className="h-8 w-[260px]" />
              )}
            </h1>
            {isFetched && data?.helpUrl && (
              <a
                href={data.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[0.75rem] text-action hover:underline"
              >
                <ExternalLink size={13} strokeWidth={1.75} />
                Docs
              </a>
            )}
            {isFetched && data && (
              <span className="text-[0.75rem] font-mono text-[#afafaf] bg-[#f2f2f2] dark:bg-[#1e293b] px-2.5 py-0.5 rounded-full">
                {data.totalCapabilities}{" "}
                {data.totalCapabilities === 1 ? "capability" : "capabilities"}
              </span>
            )}
          </div>
          {isFetched && data?.description && (
            <p className="text-description mt-2">{data.description}</p>
          )}
        </div>

        {/* Stats panel */}
        <div className="mb-6 rounded-[8px] border border-card bg-surface p-5 animate-fade-up animate-stagger-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-shrink-0">
              {isFetched ? (
                <ArcGauge
                  pct={aggregates.pct}
                  color={complianceColor(aggregates.pct)}
                />
              ) : (
                <Skeleton className="w-24 h-24 rounded-full" />
              )}
            </div>
            <div className="flex items-center justify-around sm:justify-start gap-5 w-full sm:w-auto">
              <SummaryCell
                label="Total"
                value={isFetched ? aggregates.total : null}
              />
              <SummaryCell
                label="Compliant"
                value={isFetched ? aggregates.compliant : null}
                color="#16a34a"
              />
              <SummaryCell
                label="Non-compliant"
                value={isFetched ? aggregates.nonCompliant : null}
                color="#dc2626"
              />
              {(isFetched ? aggregates.unknown > 0 : true) && (
                <SummaryCell
                  label="Unknown"
                  value={isFetched ? aggregates.unknown : null}
                  color="#94a3b8"
                />
              )}
            </div>
          </div>
          {metadataFilters.length > 0 && isFetched && (
            <div className="text-[10.5px] font-mono text-muted mt-4">
              Showing aggregates for the metadata-filtered set (
              {aggregates.total} of {data?.totalCapabilities}).
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div className="relative z-30 mb-4 flex flex-col gap-3 animate-fade-up animate-stagger-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "h-[28px] px-3 border rounded-full text-[0.6875rem] font-medium transition-all",
                  statusFilter === key
                    ? "bg-[#0e7cc1] dark:bg-[#60a5fa] border-[#0e7cc1] dark:border-[#60a5fa] text-white font-semibold"
                    : "bg-white dark:bg-[#0f172a] border-[#d9dcde] dark:border-[#334155] text-[#4a6278] dark:text-[#94a3b8] hover:border-[#0e7cc1] dark:hover:border-[#60a5fa] hover:text-[#0e7cc1] dark:hover:text-[#60a5fa]",
                )}
              >
                {label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              type="button"
              onClick={addFilter}
              className="inline-flex items-center gap-1.5 h-[28px] px-3 border rounded-full text-[0.6875rem] font-medium bg-white dark:bg-[#0f172a] border-[#d9dcde] dark:border-[#334155] text-[#4a6278] dark:text-[#94a3b8] hover:border-[#0e7cc1] dark:hover:border-[#60a5fa] hover:text-[#0e7cc1] dark:hover:text-[#60a5fa] transition-all"
            >
              <Plus size={12} strokeWidth={2} />
              Add metadata filter
            </button>
          </div>
          {metadataFilters.length > 0 && (
            <div className="flex flex-col gap-2">
              {metadataFilters.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[0.625rem] font-mono uppercase tracking-[0.12em] text-muted">
                    match
                  </span>
                  <div
                    role="radiogroup"
                    className="inline-flex border border-[#d9dcde] dark:border-[#334155] rounded-full overflow-hidden h-[24px]"
                  >
                    {(["and", "or"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        role="radio"
                        aria-checked={metadataMode === mode}
                        onClick={() => setMetadataMode(mode)}
                        className={cn(
                          "px-2.5 text-[0.625rem] font-mono font-semibold uppercase tracking-[0.1em] transition-colors",
                          metadataMode === mode
                            ? "bg-[#0e7cc1] dark:bg-[#60a5fa] text-white"
                            : "bg-white dark:bg-[#0f172a] text-[#4a6278] dark:text-[#94a3b8]",
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10.5px] font-mono text-muted">
                    {metadataMode === "and"
                      ? "all tags must match"
                      : "any tag may match"}
                  </span>
                </div>
              )}
              {metadataFilters.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-surface-muted/40 border border-card rounded-[6px] px-2.5 py-1.5"
                >
                  <span className="text-[0.625rem] font-mono uppercase tracking-[0.12em] text-muted w-[28px]">
                    {i === 0 ? "tag" : metadataMode === "or" ? "or" : "and"}
                  </span>
                  <MetadataCombobox
                    value={f.key}
                    onChange={(next) => updateFilter(i, { key: next })}
                    options={metadataIndex.keys}
                    placeholder="key (e.g. dfds.env)"
                    ariaLabel="Metadata key"
                  />
                  <span className="text-muted text-[0.75rem]">=</span>
                  <MetadataCombobox
                    value={f.value}
                    onChange={(next) => updateFilter(i, { value: next })}
                    options={f.key ? metadataIndex.values[f.key] ?? [] : []}
                    placeholder="value (blank = any)"
                    ariaLabel="Metadata value"
                  />
                  <button
                    type="button"
                    onClick={() => removeFilter(i)}
                    className="p-1.5 rounded-[5px] hover:bg-surface-muted text-muted hover:text-destructive transition-colors"
                    aria-label="Remove filter"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="animate-fade-up animate-stagger-3">
          {!isFetched ? (
            <div className="rounded-[8px] border border-card overflow-hidden bg-surface">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonComplianceCapabilityRow key={i} />
              ))}
            </div>
          ) : filteredCapabilities.length === 0 ? (
            <EmptyState>
              {data && data.totalCapabilities === 0
                ? "No capabilities have data for this requirement yet."
                : "No capabilities match the active filters."}
            </EmptyState>
          ) : isMobile ? (
            <MobileCapabilityList
              capabilities={filteredCapabilities}
              sorting={sorting}
              setSorting={setSorting}
            />
          ) : (
            <CapabilityTable
              capabilities={filteredCapabilities}
              metadataByCap={metadataByCap}
              sorting={sorting}
              setSorting={setSorting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
