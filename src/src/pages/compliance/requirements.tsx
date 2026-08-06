import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { Skeleton, SkeletonComplianceCard } from "@/components/ui/skeleton";
import { useRequirementsCompliance } from "@/state/remote/queries/capabilities";
import { ssuRequest } from "@/state/remote/query";
import PreAppContext from "@/preAppContext";
import { complianceColor, complianceTier, parseCostCentre, getCostCentreLabel } from "./utils";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RequirementSummary = {
  requirementId: string;
  categoryName: string;
  displayName: string;
  description: string;
  helpUrl: string | null;
  totalCapabilities: number;
  compliantCount: number;
  nonCompliantCount: number;
  unknownCount: number;
};

type SortMode = "name" | "pct-asc" | "pct-desc";

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: "name", label: "A–Z" },
  { key: "pct-asc", label: "Needs attention" },
  { key: "pct-desc", label: "Best first" },
];

const NA_TOOLTIP =
  "N/A means that either no compliance data is available for this value yet.";

// ─── DonutChart ───────────────────────────────────────────────────────────────

function DonutChart({
  pct,
  color,
  size = 48,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const r = size * 0.354;
  const circ = 2 * Math.PI * r;
  const filled = circ * (pct / 100);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-border-card)"
        strokeWidth={size * 0.115}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={size * 0.115}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// ─── RequirementCard ──────────────────────────────────────────────────────────

type CostCentreEntry = {
  label: string;
  isRogue: boolean;
  pct: number;
  tier: "green" | "orange" | "red";
};
type CostCentreInfo = { entries: CostCentreEntry[]; isFetched: boolean };

function RequirementCard({
  req,
  costCentreInfo,
  className,
  style,
}: {
  req: RequirementSummary;
  costCentreInfo?: CostCentreInfo;
  className?: string;
  style?: React.CSSProperties;
}) {
  const pct =
    req.totalCapabilities > 0
      ? Math.round((req.compliantCount / req.totalCapabilities) * 100)
      : 0;
  const color = complianceColor(pct);

  return (
    <Link
      to={`/compliance/requirements/${encodeURIComponent(req.requirementId)}`}
      className={cn(
        "block bg-surface border border-card rounded-[10px] overflow-hidden no-underline text-inherit",
        "transition-[box-shadow,border-color] duration-200",
        "hover:shadow-[0_4px_16px_rgba(0,0,0,.08)] hover:border-[#c5d3df] dark:hover:border-[#4a6278]",
        className,
      )}
      style={style}
    >
      {/* Card header */}
      <div className="w-full flex items-center gap-3 p-4 text-left">
        <DonutChart pct={pct} color={color} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[12.5px] font-bold text-[#002b45] dark:text-[#e2e8f0] truncate">
              {req.displayName}
            </span>
            {req.helpUrl && (
              <a
                href={req.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0 text-[#afafaf] hover:text-action transition-colors"
                aria-label={`${req.displayName} documentation`}
              >
                <ExternalLink size={11} strokeWidth={1.75} />
              </a>
            )}
          </div>
          {req.description && (
            <span className="text-[0.6875rem] text-[#afafaf] dark:text-[#64748b] block truncate">
              {req.description}
            </span>
          )}
          <span className="text-[0.6875rem] text-[#afafaf] dark:text-[#64748b]">
            {req.totalCapabilities}{" "}
            {req.totalCapabilities === 1 ? "capability" : "capabilities"}
          </span>
        </div>

        <div className="flex-shrink-0 text-right">
          <div
            className="text-[1.375rem] font-bold tracking-[-0.03em] leading-none"
            style={{ color }}
          >
            {pct}%
          </div>
          <div className="text-[0.625rem] text-[#afafaf] dark:text-[#64748b] mt-0.5 font-mono">
            {req.compliantCount}/{req.totalCapabilities}
          </div>
        </div>

        <ChevronRight size={14} className="flex-shrink-0 text-[#afafaf]" />
      </div>

      {/* Progress strip */}
      <div className="h-1 w-full bg-[#f0f2f4] dark:bg-[#0f172a]">
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background: color,
            transition: "width 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      {/* Cost centre compliance tags */}
      <div className="flex flex-wrap gap-1.5 px-4 py-3 min-h-[2.25rem] items-center">
        {!costCentreInfo?.isFetched ? (
          <>
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </>
        ) : costCentreInfo.entries.length === 0 ? (
          <span className="text-[0.625rem] text-[#afafaf] dark:text-[#64748b] italic">
            No data yet
          </span>
        ) : (
          costCentreInfo.entries.map((entry) => (
            <span
              key={entry.label}
              title={`${entry.pct}% compliant`}
              className={cn(
                "text-[0.625rem] font-medium px-2 py-0.5 rounded-full cursor-default",
                entry.tier === "green"
                  ? "bg-[#f0fdf4] text-[#16a34a] dark:bg-[#14532d]/40 dark:text-[#4ade80]"
                  : entry.tier === "orange"
                  ? "bg-[#fffbeb] text-[#d97706] dark:bg-[#451a03]/40 dark:text-[#fbbf24]"
                  : "bg-[#fff1f2] text-[#dc2626] dark:bg-[#7f1d1d]/40 dark:text-[#f87171]",
              )}
            >
              {entry.label}
            </span>
          ))
        )}
      </div>
    </Link>
  );
}

// ─── RequirementsCompliancePage ───────────────────────────────────────────────

export default function RequirementsCompliancePage() {
  const { isFetched, data } = useRequirementsCompliance() as {
    isFetched: boolean;
    data: { items: RequirementSummary[] } | undefined;
  };
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const [sort, setSort] = useState<SortMode>("pct-asc");

  const requirements: RequirementSummary[] = data?.items ?? [];

  const detailResults = useQueries({
    queries: requirements.map((req) => ({
      queryKey: ["compliance", "requirements", req.requirementId],
      queryFn: async () =>
        ssuRequest({
          method: "GET",
          urlSegments: ["compliance", "requirements", req.requirementId],
          payload: null,
          isCloudEngineerEnabled,
        }),
      enabled: isFetched,
      staleTime: 60_000,
    })),
  });

  const costCentreInfoMap = useMemo(() => {
    const map = new Map<string, CostCentreInfo>();
    requirements.forEach((req, i) => {
      const result = detailResults[i];
      const detailData = result?.data as
        | { capabilities: { jsonMetadata: string | null; status: string }[] }
        | undefined;
      const fetched = result?.isFetched ?? false;
      if (!fetched || !detailData?.capabilities) {
        map.set(req.requirementId, { entries: [], isFetched: false });
        return;
      }
      // Group all capabilities by cost centre, count compliant vs total.
      const byCC = new Map<string | null, { total: number; compliant: number }>();
      for (const cap of detailData.capabilities) {
        const cc = parseCostCentre(cap); // null = rogue
        const counts = byCC.get(cc) ?? { total: 0, compliant: 0 };
        counts.total++;
        if (cap.status === "Compliant") counts.compliant++;
        byCC.set(cc, counts);
      }
      const entries: CostCentreEntry[] = [];
      for (const [cc, counts] of byCC) {
        const pct =
          counts.total > 0
            ? Math.round((counts.compliant / counts.total) * 100)
            : 0;
        entries.push({
          label: cc ? getCostCentreLabel(cc) : "Rogue capabilities",
          isRogue: cc === null,
          pct,
          tier: complianceTier(pct),
        });
      }
      // Named cost centres sorted alphabetically, rogue last.
      entries.sort((a, b) => {
        if (a.isRogue && !b.isRogue) return 1;
        if (!a.isRogue && b.isRogue) return -1;
        return a.label.localeCompare(b.label);
      });
      map.set(req.requirementId, { entries, isFetched: true });
    });
    return map;
  }, [requirements, detailResults]);

  const sorted = useMemo(() => {
    return [...requirements].sort((a, b) => {
      if (sort === "name") return a.displayName.localeCompare(b.displayName);
      const aPct =
        a.totalCapabilities > 0 ? a.compliantCount / a.totalCapabilities : 0;
      const bPct =
        b.totalCapabilities > 0 ? b.compliantCount / b.totalCapabilities : 0;
      return sort === "pct-asc" ? aPct - bPct : bPct - aPct;
    });
  }, [requirements, sort]);

  const stats = useMemo(() => {
    if (requirements.length === 0) return null;
    // Each requirement is evaluated against the same capability set, so
    // summing totalCapabilities would double-count. Use the max to get the
    // unique capability count, then derive the weighted compliance rate from
    // the full sums (most accurate) and back-calculate compliant count for
    // a consistent display.
    const uniqueCaps = Math.max(...requirements.map((r) => r.totalCapabilities));
    const totalCapsSum = requirements.reduce(
      (s, r) => s + r.totalCapabilities,
      0,
    );
    const totalCompliantSum = requirements.reduce(
      (s, r) => s + r.compliantCount,
      0,
    );
    const pct =
      totalCapsSum > 0
        ? Math.round((totalCompliantSum / totalCapsSum) * 100)
        : 0;
    const totalCompliant = Math.round((pct / 100) * uniqueCaps);
    return { totalCaps: uniqueCaps, totalCompliant, pct };
  }, [requirements]);

  const gaugeColor = complianceColor(stats?.pct ?? 0);

  return (
    <div className="min-h-full">
      <div className="min-w-0 p-4 md:p-8 @container">
        {/* Header */}
        <div className="mb-6 animate-fade-up flex flex-col @[900px]:flex-row @[900px]:items-start @[900px]:justify-between gap-4 @[900px]:gap-8">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1.5">
              // Requirements
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em] leading-[1.2]">
                Requirement Compliance
              </h1>
              {isFetched && (
                <span className="relative top-[2px] text-[0.75rem] font-mono text-[#afafaf] bg-[#f2f2f2] dark:bg-[#1e293b] px-2.5 py-0.5 rounded-full">
                  {requirements.length}{" "}
                  {requirements.length === 1 ? "requirement" : "requirements"}
                </span>
              )}
            </div>
            <p className="text-description mt-2">
              Compliance breakdown by individual requirement across all
              capabilities. Read more about requirements{" "}
              <a
                href="https://wiki.dfds.cloud/en/playbooks/requirements"
                target="_blank"
                rel="noopener noreferrer"
                className="text-action hover:underline"
              >
                here
              </a>
            </p>
            <p className="text-description mt-2">
              Click on a requirement for a per-capability breakdown
            </p>
          </div>

          {/* Stats panel */}
          <div className="hidden md:block w-full @[900px]:w-auto flex-shrink-0 rounded-[8px] border border-card bg-surface pl-7 pr-4 pt-2.5 pb-4">
            <div className="-ml-3 font-mono text-[0.625rem] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-2">
              // Overall Compliance{" "}
              <span className="font-normal tracking-[0.1em] text-muted">
                (all capabilities)
              </span>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-muted whitespace-nowrap">
                    Total Count
                  </span>
                  <span className="text-[1.125rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono leading-none">
                    <span title={stats ? undefined : NA_TOOLTIP}>
                      {stats ? stats.totalCaps : "N/A"}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-muted whitespace-nowrap">
                    Compliant
                  </span>
                  <span
                    className="text-[1.125rem] font-bold font-mono leading-none"
                    style={{
                      color: stats
                        ? stats.totalCompliant > 0
                          ? "#16a34a"
                          : "#ef4444"
                        : undefined,
                    }}
                  >
                    <span title={stats ? undefined : NA_TOOLTIP}>
                      {stats ? stats.totalCompliant : "N/A"}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-muted whitespace-nowrap">
                    Compliant rate
                  </span>
                  <span
                    className="text-[1.125rem] font-bold font-mono leading-none"
                    style={{ color: stats ? gaugeColor : undefined }}
                  >
                    <span title={stats ? undefined : NA_TOOLTIP}>
                      {stats ? `${stats.pct}%` : "N/A"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sort pills */}
        <div className="flex items-center gap-1.5 mb-6 flex-wrap animate-fade-up animate-stagger-1">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                "h-[28px] px-3 border rounded-full text-[0.6875rem] font-medium transition-all",
                sort === key
                  ? "bg-[#0e7cc1] dark:bg-[#60a5fa] border-[#0e7cc1] dark:border-[#60a5fa] text-white font-semibold"
                  : "bg-white dark:bg-[#0f172a] border-[#d9dcde] dark:border-[#334155] text-[#4a6278] dark:text-[#94a3b8] hover:border-[#0e7cc1] dark:hover:border-[#60a5fa] hover:text-[#0e7cc1] dark:hover:text-[#60a5fa]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 animate-fade-up animate-stagger-2">
          {!isFetched ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonComplianceCard key={i} />
            ))
          ) : sorted.length === 0 ? (
            <div className="col-span-full">
              <EmptyState>No requirement data available yet.</EmptyState>
            </div>
          ) : (
            sorted.map((req, i) => (
              <RequirementCard
                key={req.requirementId}
                req={req}
                costCentreInfo={costCentreInfoMap.get(req.requirementId)}
                className="animate-card-enter"
                style={{ animationDelay: `${i * 25}ms` }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
