import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_SortingState,
  type MRT_PaginationState,
  type MRT_VisibilityState,
  type MRT_ColumnSizingState,
} from "material-react-table";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Boxes,
  Database,
  FileText,
  GitBranch,
  Globe,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Search,
  Columns3,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useTheme, useMuiTableColors } from "@/context/ThemeContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetadataFilterBar } from "@/components/ui/MetadataFilterBar";
import {
  buildMetadataIndex,
  matchesMetadata,
  parseTagParam,
  formatTagParam,
  type MetadataFilter,
  type MetadataMode,
} from "@/lib/metadataFilters";
import type { CatalogApplication } from "@/state/remote/queries/catalog";
import {
  workloadStatus,
  workloadDetailHref,
  ingressHostsFor,
  hasApiDocs,
  apiDocsCountFor,
  trafficFor,
  formatReqRate,
  formatReqRateValue,
  formatErrorPct,
  errorChipClass,
  workloadReachability,
  reachabilityLabel,
  reachabilityTooltip,
  type WorkloadStatus,
  type WorkloadReachability,
} from "./catalogView";
import { WorkloadDetailPanel } from "./WorkloadDetailPanel";
import { ServicesMobileList } from "./ServicesMobileList";
import { ServiceMetadataGuideModal } from "./ServiceMetadataGuideModal";
import { AddFilterButton, ActiveFacetChips } from "./FilterBuilder";
import {
  FACET_KEYS,
  facetOptions,
  facetsAreEmpty,
  facetsFromParams,
  facetsToParams,
  matchesFacets,
  type ConnectsIndex,
  type FacetKey,
  type Facets,
  type Option,
} from "./filtering";

const PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];
const COLUMNS_STORAGE_KEY = "ssu-services-columns";
const COLUMN_SIZING_STORAGE_KEY = "ssu-services-column-sizing";
const PAGE_SIZE_STORAGE_KEY = "ssu-services-page-size";

export type QuickFilter = "all" | "unhealthy" | "ingress" | "docs";

const CHIPS: { id: QuickFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unhealthy", label: "Unhealthy" },
  { id: "docs", label: "With API docs" },
];

const accentColor: Record<WorkloadStatus, string> = {
  healthy: "transparent",
  degraded: "var(--color-warning)",
  down: "var(--color-error)",
};
const healthText: Record<WorkloadStatus, string> = {
  healthy: "text-primary",
  degraded: "text-warning",
  down: "text-error",
};
const barFill: Record<WorkloadStatus, string> = {
  healthy: "bg-success",
  degraded: "bg-warning",
  down: "bg-error",
};

const ingressReachText: Record<WorkloadReachability, string> = {
  reachable: "text-success",
  partial: "text-warning",
  unreachable: "text-error",
  unknown: "text-secondary",
  none: "text-muted",
};

const ACCESSORS: Record<
  string,
  (a: CatalogApplication) => string | number | undefined
> = {
  workload: (a) => (a.name || "").toLowerCase(),
  capability: (a) => (a.capabilityName || a.capabilityId || "").toLowerCase(),
  location: (a) => `${a.cluster}/${a.namespace}`.toLowerCase(),
  health: (a) => {
    const desired = a.replicas ?? 0;
    const ready = a.readyReplicas ?? 0;
    return desired > 0 ? ready / desired : -1;
  },
  ingress: (a) => ingressHostsFor(a.services || []).length,
  description: (a) => (a.metadata?.description || "").toLowerCase(),
  docs: (a) => apiDocsCountFor(a),
  source: (a) => (a.deploymentSource?.tool || "").toLowerCase(),
  errors: (a) => {
    const t = trafficFor(a);
    return t ? t.errorPct : -1;
  },
  traffic: (a) => {
    const t = trafficFor(a);
    return t ? t.reqRate : -1;
  },
};

function matchesFilters(
  app: CatalogApplication,
  q: string,
  quick: QuickFilter,
): boolean {
  if (q) {
    const hay = `${app.name} ${app.namespace} ${
      app.capabilityName || ""
    }`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (quick === "unhealthy" && workloadStatus(app) === "healthy") return false;
  if (quick === "ingress" && ingressHostsFor(app.services || []).length === 0)
    return false;
  if (quick === "docs" && !hasApiDocs(app)) return false;
  return true;
}

function readSorting(p: URLSearchParams, key: string): MRT_SortingState {
  const s = p.get(key);
  if (!s) return [];
  const colon = s.lastIndexOf(":");
  if (colon === -1) return [{ id: s, desc: false }];
  return [{ id: s.slice(0, colon), desc: s.slice(colon + 1) === "desc" }];
}

function readColumnVisibility(
  key: string,
  defaultHidden: string[] = [],
): MRT_VisibilityState {
  const seed: MRT_VisibilityState = {};
  for (const id of defaultHidden) seed[id] = false;
  try {
    const raw = localStorage.getItem(key);
    return raw
      ? { ...seed, ...(JSON.parse(raw) as MRT_VisibilityState) }
      : seed;
  } catch {
    return seed;
  }
}

function readColumnSizing(key: string): MRT_ColumnSizingState {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as MRT_ColumnSizingState) : {};
  } catch {
    return {};
  }
}

function readStoredPageSize(key: string): number {
  try {
    const raw = parseInt(localStorage.getItem(key) ?? "", 10);
    return PAGE_SIZE_OPTIONS.includes(raw) ? raw : PAGE_SIZE;
  } catch {
    return PAGE_SIZE;
  }
}

export function ServicesTableView({
  apps,
  hideCapabilityColumn = false,
  showErrorsColumn = false,
  optionalTrafficColumns = false,
  enableSearch = false,
  enableChips = false,
  enableMetadataFilters = false,
  enableFacets = false,
  metadataByCapability,
  connectsIndex,
  connectsOptions,
  depsLoading = false,
  urlPrefix = "",
}: {
  apps: CatalogApplication[];
  hideCapabilityColumn?: boolean;
  showErrorsColumn?: boolean;
  optionalTrafficColumns?: boolean;
  enableSearch?: boolean;
  enableChips?: boolean;
  enableMetadataFilters?: boolean;
  enableFacets?: boolean;
  metadataByCapability?: Map<string, Record<string, string>>;
  connectsIndex?: ConnectsIndex;
  connectsOptions?: Option[];
  depsLoading?: boolean;
  urlPrefix?: string;
}) {
  const { isDark } = useTheme();
  const isMobile = useIsMobile();
  const colors = useMuiTableColors();
  const [searchParams, setSearchParams] = useSearchParams();

  const qKey = `${urlPrefix}q`;
  const statusKey = `${urlPrefix}status`;
  const sortKey = `${urlPrefix}sort`;
  const pageKey = `${urlPrefix}page`;
  const sizeKey = `${urlPrefix}size`;
  const tagKey = `${urlPrefix}tag`;
  const tagModeKey = `${urlPrefix}tagmode`;
  const facetKey = `${urlPrefix}f`;
  const storageSuffix = urlPrefix ? ":" + urlPrefix : "";
  const pageSizeStorageKey = `${PAGE_SIZE_STORAGE_KEY}${storageSuffix}`;
  const columnsStorageKey = `${COLUMNS_STORAGE_KEY}${storageSuffix}`;
  const columnSizingStorageKey = `${COLUMN_SIZING_STORAGE_KEY}${storageSuffix}`;

  const includeErrors = showErrorsColumn || optionalTrafficColumns;
  const includeReqRate = optionalTrafficColumns;
  const defaultHiddenColumns = useMemo(
    () => [
      "location",
      "source",
      ...(optionalTrafficColumns ? ["errors", "traffic"] : []),
    ],
    [optionalTrafficColumns],
  );

  const urlSearch = searchParams.get(qKey) ?? "";
  const quick = (searchParams.get(statusKey) as QuickFilter) || "all";
  const tagFilters = useMemo<MetadataFilter[]>(
    () => searchParams.getAll(tagKey).map(parseTagParam),
    [searchParams, tagKey],
  );
  const tagMode: MetadataMode =
    searchParams.get(tagModeKey) === "or" ? "or" : "and";
  const facets = useMemo<Facets>(
    () => facetsFromParams(searchParams.getAll(facetKey)),
    [searchParams, facetKey],
  );
  const sorting = useMemo(
    () => readSorting(searchParams, sortKey),
    [searchParams, sortKey],
  );

  const [storedPageSize, setStoredPageSize] = useState(() =>
    readStoredPageSize(pageSizeStorageKey),
  );
  const page = Math.max(1, parseInt(searchParams.get(pageKey) ?? "1", 10) || 1);
  const pageSize = (() => {
    const raw = parseInt(searchParams.get(sizeKey) ?? "", 10);
    return PAGE_SIZE_OPTIONS.includes(raw) ? raw : storedPageSize;
  })();

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    () => readColumnVisibility(columnsStorageKey, defaultHiddenColumns),
  );
  const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>(() =>
    readColumnSizing(columnSizingStorageKey),
  );
  const hasCustomSizing = Object.keys(columnSizing).length > 0;

  const [guideOpen, setGuideOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const lastPushedSearch = useRef(urlSearch);

  const patchUrl = useCallback(
    (mutate: (p: URLSearchParams) => void, resetPage = false) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          if (resetPage) next.delete(pageKey);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, pageKey],
  );

  // update searchQuery when URL query changes externally (back/forward navigation).
  useEffect(() => {
    if (urlSearch !== lastPushedSearch.current) {
      lastPushedSearch.current = urlSearch;
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  // Called by <SearchBox> once typing settles/stops.
  const commitSearch = useCallback(
    (value: string) => {
      lastPushedSearch.current = value;
      setSearchQuery(value);
      patchUrl((p) => {
        if (value) p.set(qKey, value);
        else p.delete(qKey);
      }, true);
    },
    [patchUrl, qKey],
  );

  const setQuick = useCallback(
    (value: QuickFilter) =>
      patchUrl((p) => {
        if (value && value !== "all") p.set(statusKey, value);
        else p.delete(statusKey);
      }, true),
    [patchUrl, statusKey],
  );

  const setTagFilters = useCallback(
    (filters: MetadataFilter[]) =>
      patchUrl((p) => {
        p.delete(tagKey);
        for (const f of filters) p.append(tagKey, formatTagParam(f));
      }, true),
    [patchUrl, tagKey],
  );

  const setTagMode = useCallback(
    (mode: MetadataMode) =>
      patchUrl((p) => {
        if (mode === "or") p.set(tagModeKey, "or");
        else p.delete(tagModeKey);
      }, true),
    [patchUrl, tagModeKey],
  );

  const setFacets = useCallback(
    (next: Facets) =>
      patchUrl((p) => {
        p.delete(facetKey);
        for (const raw of facetsToParams(next)) p.append(facetKey, raw);
      }, true),
    [patchUrl, facetKey],
  );

  const setSorting = useCallback(
    (next: MRT_SortingState) =>
      patchUrl((p) => {
        if (next.length === 0) p.delete(sortKey);
        else p.set(sortKey, `${next[0].id}:${next[0].desc ? "desc" : "asc"}`);
      }),
    [patchUrl, sortKey],
  );

  const setPage = useCallback(
    (nextPage: number) =>
      patchUrl((p) => {
        if (nextPage <= 1) p.delete(pageKey);
        else p.set(pageKey, String(nextPage));
      }),
    [patchUrl, pageKey],
  );

  const setPageSize = useCallback(
    (nextSize: number) => {
      localStorage.setItem(pageSizeStorageKey, String(nextSize));
      setStoredPageSize(nextSize);
      patchUrl((p) => p.delete(sizeKey), true);
    },
    [patchUrl, sizeKey, pageSizeStorageKey],
  );

  const onColumnVisibilityChange = useCallback(
    (
      updater:
        | MRT_VisibilityState
        | ((old: MRT_VisibilityState) => MRT_VisibilityState),
    ) => {
      setColumnVisibility((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem(columnsStorageKey, JSON.stringify(next));
        return next;
      });
    },
    [columnsStorageKey],
  );

  const onColumnSizingChange = useCallback(
    (
      updater:
        | MRT_ColumnSizingState
        | ((old: MRT_ColumnSizingState) => MRT_ColumnSizingState),
    ) => {
      setColumnSizing((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        try {
          localStorage.setItem(columnSizingStorageKey, JSON.stringify(next));
        } catch {
          /* ignore storage failures */
        }
        return next;
      });
    },
    [columnSizingStorageKey],
  );

  const resetColumnSizing = useCallback(() => {
    localStorage.removeItem(columnSizingStorageKey);
    setColumnSizing({});
  }, [columnSizingStorageKey]);

  const metadataIndex = useMemo(() => {
    if (!metadataByCapability) return { keys: [], values: {} };
    const seen = new Set<string>();
    const metas: Record<string, string>[] = [];
    for (const app of apps) {
      if (!app.capabilityId || seen.has(app.capabilityId)) continue;
      seen.add(app.capabilityId);
      const m = metadataByCapability.get(app.capabilityId);
      if (m) metas.push(m);
    }
    return buildMetadataIndex(metas);
  }, [apps, metadataByCapability]);

  const optionsByFacet = useMemo(() => {
    const out = {} as Record<FacetKey, Option[]>;
    const conn = connectsOptions ?? [];
    for (const key of FACET_KEYS) out[key] = facetOptions(key, apps, conn);
    return out;
  }, [apps, connectsOptions]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const hasTags = !!metadataByCapability && tagFilters.some((f) => f.key);
    const hasFacets = enableFacets && !facetsAreEmpty(facets);
    if (!q && quick === "all" && !hasTags && !hasFacets) return apps;
    const conn: ConnectsIndex = connectsIndex ?? new Map();
    return apps.filter((app) => {
      if (!matchesFilters(app, q, quick)) return false;
      if (
        hasTags &&
        !matchesMetadata(
          metadataByCapability!.get(app.capabilityId) ?? {},
          tagFilters,
          tagMode,
        )
      )
        return false;
      if (hasFacets && !matchesFacets(app, facets, conn)) return false;
      return true;
    });
  }, [
    apps,
    searchQuery,
    quick,
    tagFilters,
    tagMode,
    metadataByCapability,
    enableFacets,
    facets,
    connectsIndex,
  ]);

  const columns = useMemo<MRT_ColumnDef<CatalogApplication>[]>(() => {
    const defs: MRT_ColumnDef<CatalogApplication>[] = [
      {
        id: "workload",
        header: "Workload",
        Header: (
          <ColHeader
            label="Workload"
            tip="A detected Kubernetes resource (Deployment, StatefulSet, or Service) running in a capability's namespace."
          />
        ),
        accessorFn: ACCESSORS.workload,
        enableHiding: false,
        size: 230,
        Cell: ({ row }) => {
          const app = row.original;
          const KindIcon = app.kind === "StatefulSet" ? Database : Boxes;
          return (
            <span className="flex items-center gap-2 min-w-0">
              <ChevronRight
                size={13}
                className="mrt-expand-chevron text-muted flex-none transition-transform"
              />
              <KindIcon
                size={13}
                className="text-muted flex-none"
                aria-label={app.kind}
              />
              <span className="font-semibold text-primary text-[0.8125rem] truncate">
                {app.name}
              </span>
            </span>
          );
        },
      },
    ];

    if (!hideCapabilityColumn) {
      defs.push({
        id: "capability",
        header: "Capability",
        Header: (
          <ColHeader
            label="Capability"
            tip="The capability that owns this workload."
          />
        ),
        accessorFn: ACCESSORS.capability,
        size: 150,
        Cell: ({ row }) => {
          const app = row.original;
          const href = app.capabilityId
            ? `/capabilities/${encodeURIComponent(app.capabilityId)}`
            : undefined;
          return href ? (
            <Link
              to={href}
              className="text-action hover:underline truncate block"
            >
              {app.capabilityName || app.capabilityId}
            </Link>
          ) : (
            <span className="text-action truncate block">
              {app.capabilityName || app.capabilityId || "—"}
            </span>
          );
        },
      });
    }

    defs.push(
      {
        id: "location",
        header: "Location",
        Header: (
          <ColHeader
            label="Location"
            tip="The cluster and namespace where the workload runs."
          />
        ),
        accessorFn: ACCESSORS.location,
        size: 178,
        Cell: ({ row }) => {
          const app = row.original;
          return (
            <span className="font-mono text-[12px] text-secondary truncate block">
              <span className="text-primary font-semibold">{app.cluster}</span>/
              {app.namespace}
            </span>
          );
        },
      },
      {
        id: "health",
        header: "Health",
        Header: (
          <ColHeader
            label="Health"
            tip="Replica readiness: how many of the desired pod replicas are currently ready. Orange if some are not ready, red if none are."
          />
        ),
        accessorFn: ACCESSORS.health,
        size: 100,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const app = row.original;
          const st = workloadStatus(app);
          const ready = app.readyReplicas ?? 0;
          const desired = app.replicas ?? 0;
          const pct = desired > 0 ? Math.round((100 * ready) / desired) : 0;
          return (
            <span className="inline-flex items-center justify-center gap-1.5">
              <span
                className={cn("font-mono text-[12px]", healthText[st])}
                title="Ready / desired replicas"
              >
                {ready}/{desired}
              </span>
              <span className="w-[42px] h-[5px] rounded-[3px] bg-divider overflow-hidden flex-none">
                <span
                  className={cn("block h-full", barFill[st])}
                  style={{ width: `${pct}%` }}
                />
              </span>
            </span>
          );
        },
      },
      {
        id: "description",
        header: "Description",
        Header: (
          <ColHeader
            label="Description"
            tip="Author-provided summary of the workload, set via the dfds.cloud/description annotation."
          />
        ),
        accessorFn: ACCESSORS.description,
        size: 260,
        Cell: ({ row }) => {
          const desc = row.original.metadata?.description?.trim();
          if (!desc) {
            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGuideOpen(true);
                }}
                className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-action transition-colors"
                title="No description set — click to learn how to add one"
              >
                <Plus size={11} className="flex-none" />
                Add a description
              </button>
            );
          }
          return (
            <span
              className="text-[0.8125rem] text-secondary truncate block"
              title={desc}
            >
              {desc}
            </span>
          );
        },
      },
      {
        id: "traffic",
        header: "Req/s",
        Header: (
          <ColHeader
            label="Req/s"
            tip="Inbound HTTP request rate (Beyla-observed)."
          />
        ),
        accessorFn: ACCESSORS.traffic,
        size: 84,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const traffic = trafficFor(row.original);
          if (!traffic) {
            return (
              <span
                className="font-mono text-[12px] text-muted"
                title="No inbound HTTP traffic observed"
              >
                —
              </span>
            );
          }
          return (
            <span
              className="font-mono text-[12px] text-secondary"
              title={`${formatReqRate(traffic.reqRate)} inbound HTTP (Beyla)`}
            >
              {formatReqRateValue(traffic.reqRate)}
            </span>
          );
        },
      },
      {
        id: "errors",
        header: "Errors",
        Header: (
          <ColHeader
            label="Errors"
            tip="Share of inbound requests returning 5xx errors (Beyla-observed)."
          />
        ),
        accessorFn: ACCESSORS.errors,
        size: 84,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const traffic = trafficFor(row.original);
          if (!traffic) {
            return (
              <span
                className="font-mono text-[12px] text-muted"
                title="No inbound HTTP traffic observed"
              >
                —
              </span>
            );
          }
          const colour =
            traffic.errorPct <= 0
              ? "text-muted"
              : errorChipClass(traffic.health) || "text-secondary";
          return (
            <span
              className={cn("font-mono text-[12px]", colour)}
              title={`5xx share of ${formatReqRate(traffic.reqRate)} inbound`}
            >
              {formatErrorPct(traffic.errorPct)}
            </span>
          );
        },
      },
      {
        id: "ingress",
        header: "Ingress",
        Header: (
          <ColHeader
            label="Ingress"
            tip="External hostnames the workload is exposed on. Colour reflects probe reachability: green = all reachable, orange = partial, red = unreachable, grey = unknown."
          />
        ),
        accessorFn: ACCESSORS.ingress,
        size: 76,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const app = row.original;
          const hosts = ingressHostsFor(app.services || []);
          const reach = workloadReachability(app);
          const hostSummary = hosts.length
            ? `Exposed on ${hosts.length} host${
                hosts.length === 1 ? "" : "s"
              }: ${hosts.join(", ")}`
            : "No external ingress";
          const label = reachabilityLabel(reach);
          const detail = reachabilityTooltip(app);
          const title = label
            ? `${hostSummary}\n${label}${detail ? `\n${detail}` : ""}`
            : hostSummary;
          return (
            <span
              className={cn(
                "inline-flex items-center justify-center gap-1 font-mono text-[12px]",
                ingressReachText[reach],
              )}
              title={title}
              aria-label={
                label ? `${hosts.length} ingress, ${label}` : undefined
              }
            >
              <Globe size={12} />
              {hosts.length}
            </span>
          );
        },
      },
      {
        id: "docs",
        header: "API Docs",
        Header: (
          <ColHeader
            label="API Docs"
            tip="Number of API documentation specs (e.g. OpenAPI) discovered for the workload."
          />
        ),
        accessorFn: ACCESSORS.docs,
        size: 76,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const count = apiDocsCountFor(row.original);
          return (
            <span
              className={cn(
                "inline-flex items-center justify-center gap-1 font-mono text-[12px]",
                count ? "text-secondary" : "text-muted",
              )}
              title={
                count
                  ? `${count} API doc${count === 1 ? "" : "s"} discovered`
                  : "No API docs discovered"
              }
            >
              <FileText size={12} />
              {count}
            </span>
          );
        },
      },
      {
        id: "source",
        header: "Source",
        Header: (
          <ColHeader
            label="Source"
            tip="The GitOps tool and revision that deployed this workload."
          />
        ),
        accessorFn: ACCESSORS.source,
        size: 150,
        Cell: ({ row }) => {
          const src = row.original.deploymentSource;
          return (
            <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-secondary min-w-0">
              <GitBranch size={11} className="flex-none" />
              {src?.tool && (
                <span className="text-primary font-semibold">{src.tool}</span>
              )}
              {src?.revision && (
                <span className="truncate">{src.revision.slice(0, 7)}</span>
              )}
            </span>
          );
        },
      },
      {
        id: "open",
        header: "",
        enableSorting: false,
        enableHiding: false,
        enableColumnActions: false,
        enableResizing: false,
        size: 76,
        muiTableHeadCellProps: { align: "right" },
        muiTableBodyCellProps: { align: "right" },
        Cell: ({ row }) => (
          <Link
            to={workloadDetailHref(row.original)}
            className="inline-flex items-center gap-1 font-mono text-[11px] text-muted border border-card rounded-[5px] px-2 py-1 hover:text-action hover:border-action transition-colors"
          >
            Open
            <ArrowUpRight size={12} />
          </Link>
        ),
      },
    );

    return defs.filter((d) => {
      if (d.id === "errors") return includeErrors;
      if (d.id === "traffic") return includeReqRate;
      return true;
    });
  }, [hideCapabilityColumn, includeErrors, includeReqRate]);

  const hideableColumns = useMemo(
    () =>
      columns
        .filter(
          (c) =>
            c.enableHiding !== false && typeof c.header === "string" && c.id,
        )
        .map((c) => ({ id: c.id as string, label: c.header as string })),
    [columns],
  );

  const toggleColumn = useCallback(
    (id: string) =>
      onColumnVisibilityChange((prev) => ({
        ...prev,
        [id]: prev[id] === false ? true : false,
      })),
    [onColumnVisibilityChange],
  );

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

  const maxPageIndex = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  const pagination = useMemo<MRT_PaginationState>(
    () => ({
      pageIndex: Math.min(page - 1, maxPageIndex),
      pageSize,
    }),
    [page, maxPageIndex, pageSize],
  );

  const filterBar =
    enableMetadataFilters && metadataByCapability ? (
      <MetadataFilterBar
        filters={tagFilters}
        mode={tagMode}
        index={metadataIndex}
        onChange={setTagFilters}
        onModeChange={setTagMode}
        className="relative z-30 mt-1 mb-3"
      />
    ) : null;

  const facetControls = enableFacets ? (
    <AddFilterButton
      facets={facets}
      options={optionsByFacet}
      onChange={setFacets}
      depsLoading={depsLoading}
    />
  ) : null;
  const facetChips = enableFacets ? (
    <ActiveFacetChips
      facets={facets}
      options={optionsByFacet}
      onChange={setFacets}
      className="relative z-20 -mt-1 mb-3"
    />
  ) : null;

  if (isMobile) {
    const sorted = [...filtered];
    if (sorting.length) {
      const { id, desc } = sorting[0];
      const accessor = ACCESSORS[id];
      if (accessor) {
        sorted.sort((a, b) => {
          const av = accessor(a);
          const bv = accessor(b);
          if (av === undefined || bv === undefined) {
            if (av === bv) return 0;
            return av === undefined ? 1 : -1;
          }
          let cmp = 0;
          if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
          else cmp = String(av).localeCompare(String(bv));
          return desc ? -cmp : cmp;
        });
      }
    }
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const pageItems = sorted.slice(pageStart, pageStart + pageSize);

    return (
      <div>
        {(enableSearch || enableChips || enableFacets) && (
          <Toolbar
            enableSearch={enableSearch}
            enableChips={enableChips}
            searchValue={searchQuery}
            onSearchChange={commitSearch}
            quick={quick}
            setQuick={setQuick}
            filteredCount={filtered.length}
            totalCount={apps.length}
            afterChips={facetControls}
          />
        )}
        {facetChips}
        {filterBar}
        {sorted.length === 0 ? (
          <EmptyState>No workloads match your filters.</EmptyState>
        ) : (
          <>
            <ServicesMobileList
              apps={pageItems}
              hideCapabilityColumn={hideCapabilityColumn}
              showErrors={showErrorsColumn}
              onAddDescription={() => setGuideOpen(true)}
            />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageStart={pageStart}
              pageSize={pageSize}
              total={sorted.length}
              onPrev={() => setPage(Math.max(1, currentPage - 1))}
              onNext={() => setPage(Math.min(totalPages, currentPage + 1))}
            />
          </>
        )}
        <ServiceMetadataGuideModal
          open={guideOpen}
          onOpenChange={setGuideOpen}
        />
      </div>
    );
  }

  const virtualize = enableSearch;

  const columnControls = (
    <ColumnControls
      columns={hideableColumns}
      visibility={columnVisibility}
      onToggle={toggleColumn}
      hasCustomSizing={hasCustomSizing}
      onResetSizing={resetColumnSizing}
    />
  );

  return (
    <div>
      <Toolbar
        enableSearch={enableSearch}
        enableChips={enableChips}
        searchValue={searchQuery}
        onSearchChange={commitSearch}
        quick={quick}
        setQuick={setQuick}
        filteredCount={filtered.length}
        totalCount={apps.length}
        afterChips={facetControls}
        rightAddon={columnControls}
      />
      {facetChips}
      {filterBar}
      <TooltipProvider delayDuration={150}>
        <ThemeProvider theme={muiTheme}>
          <MaterialReactTable
            columns={columns}
            data={filtered}
            layoutMode="grid"
            memoMode="cells"
            state={{ sorting, pagination, columnVisibility, columnSizing }}
            enableColumnResizing
            columnResizeMode="onEnd"
            onColumnSizingChange={onColumnSizingChange}
            enableRowVirtualization={virtualize}
            enableStickyHeader={virtualize}
            rowVirtualizerOptions={{ overscan: 6 }}
            onSortingChange={(updater) =>
              setSorting(
                typeof updater === "function" ? updater(sorting) : updater,
              )
            }
            onPaginationChange={(updater) => {
              const next =
                typeof updater === "function" ? updater(pagination) : updater;
              if (next.pageSize !== pagination.pageSize)
                setPageSize(next.pageSize);
              else setPage(next.pageIndex + 1);
            }}
            muiPaginationProps={{
              rowsPerPageOptions: PAGE_SIZE_OPTIONS,
              showFirstButton: false,
              showLastButton: false,
            }}
            onColumnVisibilityChange={onColumnVisibilityChange}
            renderDetailPanel={({ row }) => (
              <WorkloadDetailPanel
                app={row.original}
                onAddDescription={() => setGuideOpen(true)}
              />
            )}
            enableExpandAll={false}
            displayColumnDefOptions={{
              "mrt-row-expand": {
                size: 0,
                enableHiding: false,
                muiTableHeadCellProps: { sx: { display: "none" } },
                muiTableBodyCellProps: { sx: { display: "none" } },
              },
            }}
            muiTableBodyRowProps={({ row, isDetailPanel }) => {
              const accent = accentColor[workloadStatus(row.original)];
              return {
                onClick: isDetailPanel
                  ? undefined
                  : (e: React.MouseEvent) => {
                      if ((e.target as HTMLElement).closest("a")) return;
                      row.toggleExpanded();
                    },
                sx: {
                  cursor: isDetailPanel ? "default" : "pointer",
                  "& > td:nth-of-type(2)": {
                    borderLeft: `3px solid ${accent}`,
                  },
                  ...(isDetailPanel
                    ? {}
                    : { "&:hover td": { backgroundColor: colors.bgMuted } }),
                  "& .mrt-expand-chevron": {
                    transform: row.getIsExpanded() ? "rotate(90deg)" : "none",
                  },
                },
              };
            }}
            muiDetailPanelProps={({ row }) => ({
              sx: {
                borderLeft: `3px solid ${
                  accentColor[workloadStatus(row.original)]
                }`,
                backgroundColor: colors.bg,
              },
            })}
            muiTableHeadCellProps={{
              sx: {
                fontFamily: "var(--mono)",
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: colors.textMuted,
                backgroundColor: colors.bgMuted,
                padding: "6px 12px",
                borderBottom: `1px solid ${colors.borderColor}`,
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                color: colors.textPrimary,
                backgroundColor: colors.bg,
                padding: "6px 12px",
                borderBottom: `1px solid ${colors.borderColor}`,
              },
            }}
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                borderRadius: "8px",
                border: `1px solid var(--color-border-card)`,
                overflow: "hidden",
                backgroundColor: colors.bg,
              },
            }}
            muiTableContainerProps={{
              sx: virtualize
                ? {
                    maxHeight: "calc(100vh - 240px)",
                    minHeight: "320px",
                  }
                : undefined,
            }}
            muiBottomToolbarProps={{
              sx: {
                background: colors.bg,
                color: colors.textPrimary,
                borderTop: `1px solid ${colors.borderColor}`,
                "& .MuiIconButton-root": { color: colors.textMuted },
                "& .MuiTablePagination-root": { color: colors.textPrimary },
                "& .MuiTablePagination-selectLabel": {
                  color: colors.textMuted,
                },
                "& .MuiTablePagination-displayedRows": {
                  color: colors.textMuted,
                },
                "& .MuiSelect-icon": { color: colors.textMuted },
              },
            }}
            enableGlobalFilter={false}
            enableColumnFilters={false}
            enableFilters={false}
            enableColumnActions={false}
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={true}
            enableSorting={true}
            enablePagination={true}
            enableTopToolbar={false}
            enableBottomToolbar={true}
            positionToolbarAlertBanner="none"
            autoResetPageIndex={false}
            autoResetExpanded={false}
          />
        </ThemeProvider>
      </TooltipProvider>
      <ServiceMetadataGuideModal open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}

const SearchBox = React.memo(function SearchBox({
  value,
  onDebouncedChange,
  debounceMs = 200,
}: {
  value: string;
  onDebouncedChange: (v: string) => void;
  debounceMs?: number;
}) {
  const [local, setLocal] = useState(value);
  const lastExternal = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (value !== lastExternal.current) {
      lastExternal.current = value;
      setLocal(value);
    }
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastExternal.current = v;
      onDebouncedChange(v);
    }, debounceMs);
  };

  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
      <input
        type="text"
        value={local}
        onChange={onChange}
        placeholder="Filter by name, namespace, capability…"
        className="h-[34px] w-[300px] md:w-[420px] max-w-full pl-8 pr-3 text-[0.8125rem] font-mono bg-surface border border-input rounded-[6px] text-primary outline-none focus:ring-2 focus:ring-action/40 placeholder:text-muted"
      />
    </div>
  );
});

function Toolbar({
  enableSearch,
  enableChips,
  searchValue,
  onSearchChange,
  quick,
  setQuick,
  filteredCount,
  totalCount,
  afterChips,
  rightAddon,
}: {
  enableSearch: boolean;
  enableChips: boolean;
  searchValue: string;
  onSearchChange: (v: string) => void;
  quick: QuickFilter;
  setQuick: (v: QuickFilter) => void;
  filteredCount: number;
  totalCount: number;
  afterChips?: React.ReactNode;
  rightAddon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {enableSearch && (
        <SearchBox value={searchValue} onDebouncedChange={onSearchChange} />
      )}
      {enableChips &&
        CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setQuick(chip.id)}
            className={cn(
              "h-[34px] px-3 font-mono text-[11px] rounded-[6px] border cursor-pointer transition-colors",
              quick === chip.id
                ? "border-action text-action"
                : "border-card text-secondary hover:text-primary",
            )}
          >
            {chip.label}
          </button>
        ))}
      {afterChips}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-muted font-mono">
          {filteredCount}
          {filteredCount !== totalCount ? ` / ${totalCount}` : ""} workloads
        </span>
        {rightAddon}
      </div>
    </div>
  );
}

function ColHeader({ label, tip }: { label: string; tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{label}</span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[260px] normal-case tracking-normal font-sans text-[0.6875rem] leading-snug"
      >
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}

function ColumnControls({
  columns,
  visibility,
  onToggle,
  hasCustomSizing,
  onResetSizing,
}: {
  columns: { id: string; label: string }[];
  visibility: MRT_VisibilityState;
  onToggle: (id: string) => void;
  hasCustomSizing: boolean;
  onResetSizing: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const chip =
    "h-[34px] px-3 inline-flex items-center gap-1.5 font-mono text-[11px] rounded-[6px] border border-card text-secondary hover:text-primary transition-colors cursor-pointer";

  return (
    <div className="flex items-center gap-2">
      {hasCustomSizing && (
        <button
          type="button"
          onClick={onResetSizing}
          title="Reset column widths to default"
          className={chip}
        >
          Reset widths
        </button>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          aria-label="Show or hide columns"
          className={chip}
        >
          <Columns3 size={13} />
          Columns
          <ChevronDown
            size={12}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 min-w-[176px] border border-card rounded-[6px] bg-surface shadow-card z-50 overflow-hidden py-1">
            {columns.map((c) => {
              const visible = visibility[c.id] !== false;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onToggle(c.id)}
                  className="w-full text-left px-2.5 py-1.5 flex items-center gap-2 font-mono text-[0.75rem] text-primary hover:bg-surface-muted transition-colors"
                >
                  <Check
                    size={13}
                    className={cn(
                      "flex-none text-action",
                      !visible && "opacity-0",
                    )}
                  />
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
