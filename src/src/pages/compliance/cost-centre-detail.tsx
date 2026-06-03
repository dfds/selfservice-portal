import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ExternalLink,
  Plus,
  X,
} from "lucide-react";
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
import { useCostCentreComplianceDetails } from "@/state/remote/queries/capabilities";
import { statusIcon } from "@/lib/statusUtils";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useExpandable } from "@/hooks/useExpandable";
import { useTheme, useMuiTableColors } from "@/context/ThemeContext";
import { getCostCentreLabel, complianceColor, parseMetadata } from "./utils";
import { ArcGauge, CategoryBreakdownList } from "./components";

// ─── Types ───────────────────────────────────────────────────────────────────

type ComplianceCategoryItem = {
  name: string;
  status: string;
  detail?: string | null;
};

type ComplianceCategory = {
  categoryName: string;
  status: "Compliant" | "NonCompliant" | "Unknown";
  score?: number | null;
  helpUrl?: string | null;
  displayName?: string | null;
  description?: string | null;
  items: ComplianceCategoryItem[];
};

type CapabilityCompliance = {
  capabilityId: string;
  capabilityName: string;
  jsonMetadata: string | null;
  overallStatus: "Compliant" | "NonCompliant" | "Unknown";
  categories: ComplianceCategory[];
};

type CostCentreDetailsData = {
  costCentre: string;
  totalCapabilities: number;
  compliantCount: number;
  nonCompliantCount: number;
  unknownCount: number;
  categories: {
    categoryName: string;
    compliantCount: number;
    nonCompliantCount: number;
  }[];
  capabilities: CapabilityCompliance[];
};

type StatusFilter = "all" | "Compliant" | "NonCompliant" | "Unknown";

type MetadataFilter = { key: string; value: string };

type MetadataMode = "and" | "or";

// ─── Constants ───────────────────────────────────────────────────────────────

// Display order + short labels for the matrix columns.
const CATEGORY_COLUMNS: { key: string; short: string }[] = [
  { key: "Tags", short: "Tags" },
  { key: "External Secrets", short: "Ext. Secrets" },
  { key: "IRSA Mutual Trust", short: "IRSA" },
  { key: "Workload Liveness and Readiness Probes", short: "Probes" },
  { key: "ECR pull policy", short: "ECR" },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Compliant", label: "Compliant" },
  { key: "NonCompliant", label: "Non-compliant" },
  { key: "Unknown", label: "Unknown" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// Maps API enum strings to the lower-case strings statusIcon() expects.
function statusToken(s: string): string {
  if (s === "Compliant") return "compliant";
  if (s === "NonCompliant") return "noncompliant";
  return "unknown";
}

function findCategory(
  cap: CapabilityCompliance,
  name: string,
): ComplianceCategory | undefined {
  return cap.categories.find((c) => c.categoryName === name);
}

// Compliant-resource count vs total-resource count for a category. Shape varies:
//   Tags             → items are required tags with status "present" | "missing"
//   External Secrets → items: secrets (total), external_secrets (compliant)
//   IRSA / Probes / ECR → items: compliant_* and non_compliant_*
// Returns null when the category is Unknown or has no items at all.
function categoryRatio(
  cat: ComplianceCategory | undefined,
): { compliant: number; total: number } | null {
  if (!cat || cat.status === "Unknown") return null;
  const items = cat.items;
  if (items.length === 0) return null;

  if (cat.categoryName === "Tags") {
    const total = items.length;
    const compliant = items.filter((i) => i.status === "present").length;
    return { compliant, total };
  }

  const compliantItem = items.find((i) => i.name.startsWith("compliant_"));
  const nonCompliantItem = items.find((i) =>
    i.name.startsWith("non_compliant_"),
  );
  const compliant = Number(compliantItem?.status ?? "0");
  const nonCompliant = Number(nonCompliantItem?.status ?? "0");
  return { compliant, total: compliant + nonCompliant };
}

function ratioColor(r: { compliant: number; total: number }): string {
  if (r.total === 0) return "#94a3b8";
  if (r.compliant === r.total) return "#16a34a";
  if (r.compliant === 0) return "#dc2626";
  return "#ed8800";
}

function overallPctFromCategories(cap: CapabilityCompliance): number {
  const evaluated = cap.categories.filter((c) => c.status !== "Unknown");
  if (evaluated.length === 0) return 0;
  const compliant = evaluated.filter((c) => c.status === "Compliant").length;
  return Math.round((compliant / evaluated.length) * 100);
}

// Sort key for one capability under a given column id. Mirrors the desktop
// matrix's accessorFn so the two views stay aligned. Returns null when the
// row has no data for the column — sort treats nulls as bottom regardless
// of direction.
function sortKeyFor(
  cap: CapabilityCompliance,
  columnId: string,
): number | string | null {
  if (columnId === "capability") return cap.capabilityName.toLowerCase();
  if (columnId === "overall") {
    return cap.overallStatus === "Unknown"
      ? null
      : overallPctFromCategories(cap);
  }
  const ratio = categoryRatio(findCategory(cap, columnId));
  if (!ratio || ratio.total === 0) return null;
  return ratio.compliant / ratio.total;
}

// Sort the mobile capability list. Nulls always pinned to the bottom (asc or
// desc) so "—" rows don't crowd the top when the user flips direction.
function sortCapabilities(
  capabilities: CapabilityCompliance[],
  sorting: MRT_SortingState,
): CapabilityCompliance[] {
  if (sorting.length === 0) return capabilities;
  const { id, desc } = sorting[0];
  const sign = desc ? -1 : 1;
  return [...capabilities].sort((a, b) => {
    const av = sortKeyFor(a, id);
    const bv = sortKeyFor(b, id);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string") {
      return sign * av.localeCompare(bv);
    }
    return sign * ((av as number) - (bv as number));
  });
}

// ─── Metadata combobox ───────────────────────────────────────────────────────
// Free-text input + click-to-open suggestion dropdown. Native <datalist> only
// surfaces options while the user is typing; this gives a discoverable list on
// focus/chevron click and still accepts arbitrary typed input.

function MetadataCombobox({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, value]);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[140px]">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        className="w-full h-[28px] pl-2 pr-7 bg-surface border border-[#d9dcde] dark:border-[#334155] rounded-[5px] font-mono text-[0.75rem] text-[#002b45] dark:text-[#e2e8f0] outline-none focus:border-[#0e7cc1] dark:focus:border-[#60a5fa]"
      />
      <button
        type="button"
        onMouseDown={(e) => {
          // Prevent input blur so toggling stays predictable while focused.
          e.preventDefault();
        }}
        onClick={() => {
          setOpen((prev) => !prev);
          inputRef.current?.focus();
        }}
        aria-label={`Toggle ${ariaLabel} suggestions`}
        className="absolute right-0 top-0 h-[28px] w-7 flex items-center justify-center text-muted hover:text-action transition-colors"
      >
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-card rounded-[6px] bg-surface shadow-card z-50 overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-1 font-mono text-[0.75rem] hover:bg-surface-muted transition-colors border-0 bg-transparent",
                opt === value
                  ? "text-action"
                  : "text-[#002b45] dark:text-[#e2e8f0]",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── URL state codec ─────────────────────────────────────────────────────────

function readStatusFilter(p: URLSearchParams): StatusFilter {
  const s = p.get("status");
  if (s === "Compliant" || s === "NonCompliant" || s === "Unknown") return s;
  return "all";
}

// Each `tag` param is "key=value" (URI-encoded by URLSearchParams). Split on the
// first `=` so a value containing `=` survives the round trip. A bare `tag=key`
// is treated as "match this key, any value".
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
      // Preserve empty rows the user is mid-typing — they're filtered out at
      // query time but the row needs to remain visible.
      next.append("tag", f.value ? `${f.key}=${f.value}` : f.key);
    }
  }
  if (patch.tagMode !== undefined) {
    // "and" is the default — omit it from the URL.
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CostCentreComplianceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const costCentreId = id ?? null;
  const { data, isFetched } = useCostCentreComplianceDetails(costCentreId) as {
    data: CostCentreDetailsData | undefined;
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

  // Single setter used by every filter/sort interaction — keeps the URL the
  // source of truth and avoids stacking history entries on each keystroke.
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

  // MRT can call onSortingChange with either a value or an updater function.
  // Resolve against the URL-derived current value before writing.
  const setSorting = useCallback(
    (
      updater: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState),
    ) => {
      const next =
        typeof updater === "function"
          ? (updater as (old: MRT_SortingState) => MRT_SortingState)(sorting)
          : updater;
      updateUrl({ sorting: next });
    },
    [updateUrl, sorting],
  );

  // Cache parsed metadata for each capability — re-used by the filter + expanded views.
  const metadataByCap = useMemo(() => {
    const out = new Map<string, Record<string, string>>();
    (data?.capabilities ?? []).forEach((cap) => {
      out.set(cap.capabilityId, parseMetadata(cap.jsonMetadata));
    });
    return out;
  }, [data]);

  // Aggregate every metadata key + per-key value set seen across the cost centre's
  // capabilities. Drives both the key combobox and the per-key value suggestions.
  const metadataIndex = useMemo(() => {
    const valuesByKey = new Map<string, Set<string>>();
    metadataByCap.forEach((meta) => {
      for (const [k, v] of Object.entries(meta)) {
        let set = valuesByKey.get(k);
        if (!set) {
          set = new Set();
          valuesByKey.set(k, set);
        }
        set.add(v);
      }
    });
    const keys = Array.from(valuesByKey.keys()).sort();
    const values: Record<string, string[]> = {};
    for (const k of keys) values[k] = Array.from(valuesByKey.get(k)!).sort();
    return { keys, values };
  }, [metadataByCap]);

  // Metadata-filtered set: drives the stats panel above.
  // AND: every non-empty filter must match. OR: at least one must match.
  // Empty rows (no key) are skipped in either mode — they're mid-edit, not active.
  const metadataFilteredCapabilities = useMemo<CapabilityCompliance[]>(() => {
    const all = data?.capabilities ?? [];
    const active = metadataFilters.filter((f) => f.key);
    if (active.length === 0) return all;
    return all.filter((cap) => {
      const meta = metadataByCap.get(cap.capabilityId) ?? {};
      const matches = (f: MetadataFilter) => {
        const v = meta[f.key];
        if (v === undefined) return false;
        if (f.value && v !== f.value) return false;
        return true;
      };
      return metadataMode === "or"
        ? active.some(matches)
        : active.every(matches);
    });
  }, [data, metadataFilters, metadataMode, metadataByCap]);

  // Table set: metadata + status. Status filter is table-only.
  const filteredCapabilities = useMemo<CapabilityCompliance[]>(() => {
    if (statusFilter === "all") return metadataFilteredCapabilities;
    return metadataFilteredCapabilities.filter(
      (c) => c.overallStatus === statusFilter,
    );
  }, [metadataFilteredCapabilities, statusFilter]);

  // Aggregates ignore the status filter on purpose — only the matrix narrows.
  const aggregates = useMemo(() => {
    const total = metadataFilteredCapabilities.length;
    const compliant = metadataFilteredCapabilities.filter(
      (c) => c.overallStatus === "Compliant",
    ).length;
    const nonCompliant = metadataFilteredCapabilities.filter(
      (c) => c.overallStatus === "NonCompliant",
    ).length;
    const unknown = metadataFilteredCapabilities.filter(
      (c) => c.overallStatus === "Unknown",
    ).length;
    const pct = total > 0 ? Math.round((compliant / total) * 100) : 0;
    const categories = CATEGORY_COLUMNS.map(({ key }) => {
      let c = 0;
      let nc = 0;
      metadataFilteredCapabilities.forEach((cap) => {
        const cat = findCategory(cap, key);
        if (!cat) return;
        if (cat.status === "Compliant") c++;
        else if (cat.status === "NonCompliant") nc++;
      });
      return { categoryName: key, compliantCount: c, nonCompliantCount: nc };
    });
    return { total, compliant, nonCompliant, unknown, pct, categories };
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

  const costCentreLabel = costCentreId ? getCostCentreLabel(costCentreId) : "";

  return (
    <div className="min-h-full">
      <div className="min-w-0 p-4 md:p-8 @container">
        {/* Header */}
        <div className="mb-6 animate-fade-up">
          <Link
            to="/compliance"
            className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] font-semibold tracking-[0.05em] text-action hover:underline mb-3"
          >
            <ArrowLeft size={12} strokeWidth={2} />
            Compliance
          </Link>
          <div className="font-mono text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1.5">
            // Cost Centre
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em] leading-[1.2]">
              {isFetched ? (
                costCentreLabel
              ) : (
                <Skeleton className="h-8 w-[260px]" />
              )}
            </h1>
            {costCentreId && (
              <span className="font-mono text-[0.6875rem] text-[#afafaf] bg-[#f2f2f2] dark:bg-[#1e293b] px-2.5 py-0.5 rounded-full">
                {costCentreId}
              </span>
            )}
            {isFetched && data && (
              <span className="text-[0.75rem] font-mono text-[#afafaf] bg-[#f2f2f2] dark:bg-[#1e293b] px-2.5 py-0.5 rounded-full">
                {data.totalCapabilities}{" "}
                {data.totalCapabilities === 1 ? "capability" : "capabilities"}
              </span>
            )}
          </div>
        </div>

        {/* Stats panel */}
        <div className="mb-6 rounded-[8px] border border-card bg-surface p-5 animate-fade-up animate-stagger-1">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-6">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6 w-full sm:w-auto">
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
              <div className="flex items-center justify-around sm:justify-start gap-5 sm:gap-5 w-full sm:w-auto sm:flex-shrink-0">
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
            <div className="w-full sm:flex-1 sm:min-w-[280px]">
              {isFetched ? (
                <CategoryBreakdownList categories={aggregates.categories} />
              ) : (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
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
        {/* relative + z-30 lifts this whole block (and any open combobox
            dropdown inside it) above the matrix below, whose entrance animation
            establishes a sibling stacking context. */}
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
                    aria-label="Combine metadata filters with AND or OR"
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
                            : "bg-white dark:bg-[#0f172a] text-[#4a6278] dark:text-[#94a3b8] hover:text-[#0e7cc1] dark:hover:text-[#60a5fa]",
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

        {/* Matrix / mobile card list */}
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
                ? "No capabilities are tagged with this cost centre."
                : "No capabilities match the active filters."}
            </EmptyState>
          ) : isMobile ? (
            <MobileCapabilityList
              capabilities={filteredCapabilities}
              metadataByCap={metadataByCap}
              sorting={sorting}
              setSorting={setSorting}
            />
          ) : (
            <CapabilityMatrix
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

// ─── Summary cell ────────────────────────────────────────────────────────────

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
      >
        {value === null ? "—" : value}
      </span>
    </div>
  );
}

// ─── Desktop matrix (MaterialReactTable) ─────────────────────────────────────

function CapabilityMatrix({
  capabilities,
  metadataByCap,
  sorting,
  setSorting,
}: {
  capabilities: CapabilityCompliance[];
  metadataByCap: Map<string, Record<string, string>>;
  sorting: MRT_SortingState;
  setSorting: (
    updater: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState),
  ) => void;
}) {
  const { isDark } = useTheme();
  const {
    bg,
    bgMuted,
    textPrimary,
    textMuted,
    borderColor,
    inputBorder,
    inputText,
  } = useMuiTableColors();

  // Mirror sorting into a ref so sortingFns can pin "no data" rows to the
  // bottom in both directions (TanStack v8 otherwise flips the comparator's
  // return for desc).
  const sortingRef = useRef<MRT_SortingState>(sorting);
  sortingRef.current = sorting;

  // Build a "pin to bottom" comparator for category ratio columns and
  // the overall pct column. Returns null if the row has no ratio.
  const pinNullsLast = (
    columnId: string,
    aVal: number | null,
    bVal: number | null,
  ): number => {
    if (aVal == null && bVal == null) return 0;
    if (aVal != null && bVal != null) return aVal - bVal;
    const isDesc =
      sortingRef.current.find((s) => s.id === columnId)?.desc ?? false;
    const sign = aVal == null ? 1 : -1;
    return isDesc ? -sign : sign;
  };

  const columns = useMemo<MRT_ColumnDef<CapabilityCompliance>[]>(() => {
    const cols: MRT_ColumnDef<CapabilityCompliance>[] = [
      {
        id: "capability",
        header: "Capability",
        accessorFn: (row) => row.capabilityName,
        size: 320,
        Cell: ({ row }) => (
          <div className="min-w-0 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Link
                to={`/capabilities/${row.original.capabilityId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[0.8125rem] font-medium text-primary hover:text-action hover:underline truncate block"
                aria-label={`Open ${row.original.capabilityName}`}
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
              aria-label={`Open ${row.original.capabilityName}`}
              title="Open capability"
            >
              <ExternalLink size={12} strokeWidth={2} />
            </Link>
          </div>
        ),
      },
      ...CATEGORY_COLUMNS.map<MRT_ColumnDef<CapabilityCompliance>>((c) => ({
        id: c.key,
        header: c.short,
        size: 110,
        accessorFn: (row) => {
          const r = categoryRatio(findCategory(row, c.key));
          if (!r || r.total === 0) return null;
          return r.compliant / r.total;
        },
        sortingFn: (rowA, rowB, columnId) =>
          pinNullsLast(
            columnId,
            rowA.getValue<number | null>(columnId),
            rowB.getValue<number | null>(columnId),
          ),
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const ratio = categoryRatio(findCategory(row.original, c.key));
          return ratio ? (
            <span
              className="font-mono text-[0.75rem] tabular-nums font-semibold"
              style={{ color: ratioColor(ratio) }}
            >
              {ratio.compliant} / {ratio.total}
            </span>
          ) : (
            <span className="text-muted text-[0.75rem]">—</span>
          );
        },
      })),
      {
        id: "overall",
        header: "Overall",
        size: 100,
        accessorFn: (row) =>
          row.overallStatus === "Unknown"
            ? null
            : overallPctFromCategories(row),
        sortingFn: (rowA, rowB, columnId) =>
          pinNullsLast(
            columnId,
            rowA.getValue<number | null>(columnId),
            rowB.getValue<number | null>(columnId),
          ),
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => {
          const cap = row.original;
          const pct = overallPctFromCategories(cap);
          const color =
            cap.overallStatus === "Unknown" ? "#94a3b8" : complianceColor(pct);
          return (
            <span
              className="font-mono text-[0.8125rem] font-semibold"
              style={{ color }}
            >
              {cap.overallStatus === "Unknown" ? "—" : `${pct}%`}
            </span>
          );
        },
      },
    ];
    return cols;
  }, []);

  return (
    <MaterialReactTable
      columns={columns}
      data={capabilities}
      enableExpanding={true}
      enableExpandAll={false}
      renderDetailPanel={({ row }) => (
        <ExpandedDetail
          cap={row.original}
          metadata={metadataByCap.get(row.original.capabilityId) ?? {}}
        />
      )}
      state={{ sorting }}
      onSortingChange={setSorting}
      initialState={{ pagination: { pageSize: 25 } }}
      enableGlobalFilter={false}
      enableColumnActions={false}
      enableDensityToggle={false}
      enableHiding={false}
      enableFilters={false}
      enableTopToolbar={false}
      enableBottomToolbar={true}
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

function ExpandedDetail({
  cap,
  metadata,
}: {
  cap: CapabilityCompliance;
  metadata: Record<string, string>;
}) {
  const metadataEntries = Object.entries(metadata);
  return (
    <div className="border-t border-divider bg-surface-muted/40 px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <div className="text-[0.625rem] font-mono uppercase tracking-[0.12em] text-muted mb-2">
            Categories
          </div>
          <div className="flex flex-col gap-2.5">
            {cap.categories.map((cat) => (
              <div
                key={cat.categoryName}
                onClick={(e) => e.stopPropagation()}
                className="rounded-[6px] border border-card bg-surface px-3 py-2 cursor-auto"
              >
                <div className="flex items-center gap-2">
                  {statusIcon(statusToken(cat.status))}
                  <span className="text-[0.75rem] font-medium text-primary flex-1 truncate">
                    {cat.displayName ?? cat.categoryName}
                  </span>
                  <span
                    className="text-[10.5px] font-mono"
                    style={{ color: statusColor(cat.status) }}
                  >
                    {statusLabel(cat.status)}
                  </span>
                  {cat.helpUrl && (
                    <a
                      href={cat.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10.5px] text-action hover:underline"
                    >
                      docs
                    </a>
                  )}
                </div>
                {cat.items.length > 0 && (
                  <div className="mt-2 flex flex-col gap-0.5">
                    {cat.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 text-[0.6875rem] font-mono text-secondary"
                      >
                        <span className="truncate flex-1">{item.name}</span>
                        <span className="text-muted">
                          {item.status}
                          {item.detail ? ` · ${item.detail}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[0.625rem] font-mono uppercase tracking-[0.12em] text-muted mb-2">
            Metadata tags
          </div>
          {metadataEntries.length === 0 ? (
            <span className="text-[0.6875rem] italic text-muted">
              No metadata.
            </span>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col gap-1 rounded-[6px] border border-card bg-surface px-3 py-2 cursor-auto"
            >
              {metadataEntries.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center gap-2 text-[0.6875rem] font-mono"
                >
                  <span className="text-muted truncate max-w-[40%]">{k}</span>
                  <span className="text-muted">=</span>
                  <span className="text-primary truncate flex-1">
                    {v || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile card list ────────────────────────────────────────────────────────

function MobileCapabilityList({
  capabilities,
  metadataByCap,
  sorting,
  setSorting,
}: {
  capabilities: CapabilityCompliance[];
  metadataByCap: Map<string, Record<string, string>>;
  sorting: MRT_SortingState;
  setSorting: (
    updater: MRT_SortingState | ((old: MRT_SortingState) => MRT_SortingState),
  ) => void;
}) {
  const sortId = sorting[0]?.id ?? "capability";
  const sortDesc = sorting[0]?.desc ?? false;
  const sorted = useMemo(
    () => sortCapabilities(capabilities, sorting),
    [capabilities, sorting],
  );

  const sortOptions: { id: string; label: string }[] = [
    { id: "capability", label: "Capability" },
    ...CATEGORY_COLUMNS.map((c) => ({ id: c.key, label: c.short })),
    { id: "overall", label: "Overall" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <label
          htmlFor="mobile-compliance-sort"
          className="text-[0.625rem] font-mono uppercase tracking-[0.12em] text-muted"
        >
          Sort by
        </label>
        <select
          id="mobile-compliance-sort"
          value={sortId}
          onChange={(e) => setSorting([{ id: e.target.value, desc: sortDesc }])}
          className="flex-1 h-[28px] pl-2 pr-7 bg-white dark:bg-[#0f172a] border border-[#d9dcde] dark:border-[#334155] rounded-[5px] font-mono text-[0.6875rem] text-[#002b45] dark:text-[#e2e8f0] outline-none focus:border-[#0e7cc1] dark:focus:border-[#60a5fa]"
        >
          {sortOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSorting([{ id: sortId, desc: !sortDesc }])}
          aria-label={sortDesc ? "Sort ascending" : "Sort descending"}
          title={sortDesc ? "Descending" : "Ascending"}
          className="h-[28px] w-[28px] inline-flex items-center justify-center border border-[#d9dcde] dark:border-[#334155] rounded-[5px] bg-white dark:bg-[#0f172a] text-[#4a6278] dark:text-[#94a3b8] hover:border-[#0e7cc1] dark:hover:border-[#60a5fa] hover:text-[#0e7cc1] dark:hover:text-[#60a5fa] transition-colors"
        >
          {sortDesc ? (
            <ArrowDown size={12} strokeWidth={2} />
          ) : (
            <ArrowUp size={12} strokeWidth={2} />
          )}
        </button>
      </div>
      {sorted.map((cap) => (
        <MobileCapabilityCard
          key={cap.capabilityId}
          cap={cap}
          metadata={metadataByCap.get(cap.capabilityId) ?? {}}
        />
      ))}
    </div>
  );
}

function MobileCapabilityCard({
  cap,
  metadata,
}: {
  cap: CapabilityCompliance;
  metadata: Record<string, string>;
}) {
  const { expanded, triggered, toggle } = useExpandable();
  const pct = overallPctFromCategories(cap);
  const overallColor =
    cap.overallStatus === "Unknown" ? "#94a3b8" : complianceColor(pct);
  const panelId = `compliance-card-${cap.capabilityId}`;

  return (
    <div className="rounded-[8px] border border-card bg-surface overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full text-left bg-transparent border-0 p-3 cursor-pointer"
      >
        <div className="flex items-start gap-2 mb-2">
          <Link
            to={`/capabilities/${cap.capabilityId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 group"
            aria-label={`Open ${cap.capabilityName}`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[0.8125rem] font-medium text-primary group-hover:text-action group-hover:underline truncate">
                {cap.capabilityName}
              </span>
              <ExternalLink
                size={11}
                strokeWidth={2}
                className="flex-shrink-0 text-muted group-hover:text-action"
              />
            </div>
            <div className="text-[10.5px] font-mono text-muted truncate">
              {cap.capabilityId}
            </div>
          </Link>
          <div
            className="text-[1rem] font-bold font-mono flex-shrink-0"
            style={{ color: overallColor }}
          >
            {cap.overallStatus === "Unknown" ? "—" : `${pct}%`}
          </div>
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={cn(
              "flex-shrink-0 text-muted transition-transform duration-200 mt-1",
              expanded && "rotate-180",
            )}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {CATEGORY_COLUMNS.map((c) => {
            const cat = findCategory(cap, c.key);
            const ratio = categoryRatio(cat);
            return (
              <div key={c.key} className="flex flex-col items-center gap-1">
                {ratio ? (
                  <span
                    className="font-mono text-[0.6875rem] tabular-nums font-semibold"
                    style={{ color: ratioColor(ratio) }}
                  >
                    {ratio.compliant} / {ratio.total}
                  </span>
                ) : (
                  <span className="text-muted text-[0.75rem]">—</span>
                )}
                <span className="text-[0.5625rem] font-mono uppercase tracking-[0.08em] text-muted">
                  {c.short}
                </span>
              </div>
            );
          })}
        </div>
      </button>
      {expanded && triggered && (
        <div id={panelId}>
          <ExpandedDetail cap={cap} metadata={metadata} />
        </div>
      )}
    </div>
  );
}
