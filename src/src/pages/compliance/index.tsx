import React, { useContext, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Search, ChevronRight } from "lucide-react";
import { Skeleton, SkeletonComplianceCard } from "@/components/ui/skeleton";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { ssuRequest } from "@/state/remote/query";
import PreAppContext from "@/preAppContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortMode = "name" | "pct-asc" | "pct-desc" | "caps";

type ComplianceData = {
  totalCapabilities: number;
  compliantCount: number;
  categories: {
    categoryName: string;
    compliantCount: number;
    nonCompliantCount: number;
  }[];
};

type ComplianceEntry = {
  data: ComplianceData | undefined;
  isFetched: boolean;
  pct: number;
  tier: "green" | "orange" | "red" | null;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: "name", label: "A–Z" },
  { key: "pct-asc", label: "Needs attention" },
  { key: "pct-desc", label: "Best first" },
  { key: "caps", label: "Largest first" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseCostCentre(cap: any): string | null {
  if (!cap.jsonMetadata) return null;
  try {
    const meta = JSON.parse(cap.jsonMetadata);
    return meta["dfds.cost.centre"] || null;
  } catch {
    return null;
  }
}

function complianceTier(pct: number): "green" | "orange" | "red" {
  return pct >= 80 ? "green" : pct >= 50 ? "orange" : "red";
}

function complianceColor(pct: number): string {
  return pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
}

// ─── DonutChart ──────────────────────────────────────────────────────────────

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

// ─── ArcGauge ────────────────────────────────────────────────────────────────

function ArcGauge({ pct, color }: { pct: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = circ * (pct / 100);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke="var(--color-border-card)"
            strokeWidth="9"
          />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            transform="rotate(-90 48 48)"
            style={{
              transition:
                "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1), stroke 0.4s",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[22px] font-bold tracking-[-0.03em] text-[#002b45] dark:text-[#e2e8f0]">
            {pct}%
          </span>
        </div>
      </div>
      <span className="text-[11px] text-[#afafaf] dark:text-[#64748b]">
        compliant
      </span>
    </div>
  );
}

// ─── FilterCheckbox ──────────────────────────────────────────────────────────

function FilterCheckbox({
  label,
  dotColor,
  count,
  checked,
  onToggle,
}: {
  label: string;
  dotColor: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] cursor-pointer select-none hover:bg-surface-muted transition-colors"
    >
      <div
        className={cn(
          "w-3.5 h-3.5 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-all",
          checked
            ? "bg-[#0e7cc1] dark:bg-[#60a5fa] border-[#0e7cc1] dark:border-[#60a5fa]"
            : "border-[#d9dcde] dark:border-[#334155]",
        )}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <polyline
              points="1,3.5 3,5 7,1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: dotColor }}
      />
      <span className="text-[12px] text-[#4a6278] dark:text-[#94a3b8] flex-1">
        {label}
      </span>
      <span className="text-[10.5px] font-mono text-[#afafaf] bg-[#f2f2f2] dark:bg-[#1e293b] px-1.5 py-0.5 rounded-full flex-shrink-0">
        {count}
      </span>
    </div>
  );
}

// ─── CostCentreCard ──────────────────────────────────────────────────────────

function CostCentreCard({
  name,
  capCount,
  data,
  isFetched,
  expanded,
  onToggle,
  className,
  style,
}: {
  name: string;
  capCount: number;
  data: ComplianceData | undefined;
  isFetched: boolean;
  expanded: boolean;
  onToggle: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const total = data?.totalCapabilities ?? capCount;
  const compliant = data?.compliantCount ?? 0;
  const pct = total > 0 ? Math.round((compliant / total) * 100) : 0;
  const color = isFetched ? complianceColor(pct) : "var(--color-border-card)";
  const categories = data?.categories ?? [];

  return (
    <div
      className={cn(
        "bg-surface border border-card rounded-[10px] overflow-hidden",
        "transition-[box-shadow,border-color] duration-200",
        "hover:shadow-[0_4px_16px_rgba(0,0,0,.08)] hover:border-[#c5d3df] dark:hover:border-[#4a6278]",
        expanded &&
          "border-[#0e7cc1] dark:border-[#60a5fa] shadow-[0_0_0_3px_rgba(14,124,193,.08)]",
        className,
      )}
      style={style}
    >
      {/* Card header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
      >
        {isFetched ? (
          <DonutChart pct={pct} color={color} />
        ) : (
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <span className="font-mono text-[12.5px] font-bold text-[#002b45] dark:text-[#e2e8f0] block truncate">
            {name}
          </span>
          <span className="text-[11px] text-[#afafaf] dark:text-[#64748b]">
            {capCount} {capCount === 1 ? "capability" : "capabilities"}
          </span>
        </div>

        <div className="flex-shrink-0 text-right">
          {isFetched ? (
            <>
              <div
                className="text-[22px] font-bold tracking-[-0.03em] leading-none"
                style={{ color }}
              >
                {pct}%
              </div>
              <div className="text-[10px] text-[#afafaf] dark:text-[#64748b] mt-0.5 font-mono">
                {compliant}/{total}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-5 w-[44px]" />
              <Skeleton className="h-2.5 w-[52px]" />
            </div>
          )}
        </div>

        <ChevronRight
          size={14}
          className={cn(
            "flex-shrink-0 text-[#afafaf] transition-transform duration-200",
            expanded && "rotate-90",
          )}
        />
      </button>

      {/* Progress strip */}
      <div className="h-1 w-full bg-[#f0f2f4] dark:bg-[#0f172a]">
        {isFetched && (
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              background: color,
              transition: "width 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 px-4 py-3">
        {isFetched ? (
          categories.length > 0 ? (
            categories.map((cat) => {
              const catTotal = cat.compliantCount + cat.nonCompliantCount;
              const catPct =
                catTotal > 0
                  ? Math.round((cat.compliantCount / catTotal) * 100)
                  : 0;
              return (
                <span
                  key={cat.categoryName}
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                    catPct >= 80
                      ? "bg-[#f0fdf4] text-[#16a34a] dark:bg-[#14532d]/40 dark:text-[#4ade80]"
                      : catPct >= 50
                      ? "bg-[#fffbeb] text-[#d97706] dark:bg-[#78350f]/40 dark:text-[#fbbf24]"
                      : "bg-[#fff1f2] text-[#dc2626] dark:bg-[#7f1d1d]/40 dark:text-[#f87171]",
                  )}
                >
                  {cat.categoryName}
                </span>
              );
            })
          ) : (
            <span className="text-[10px] text-[#afafaf] dark:text-[#64748b] italic">
              No categories
            </span>
          )
        ) : (
          <>
            <Skeleton className="h-5 w-[64px] rounded-full" />
            <Skeleton className="h-5 w-[56px] rounded-full" />
            <Skeleton className="h-5 w-[72px] rounded-full" />
          </>
        )}
      </div>

      {/* Expanded: category breakdown */}
      {expanded && isFetched && categories.length > 0 && (
        <div className="border-t border-divider bg-[#fafbfc] dark:bg-[#0f172a] px-4 py-2">
          {categories.map((cat, i) => {
            const catTotal = cat.compliantCount + cat.nonCompliantCount;
            const catPct =
              catTotal > 0
                ? Math.round((cat.compliantCount / catTotal) * 100)
                : 0;
            const catColor = complianceColor(catPct);
            return (
              <div
                key={cat.categoryName}
                className={cn(
                  "flex items-center gap-3 py-2.5",
                  i < categories.length - 1 && "border-b border-divider",
                )}
              >
                <span className="text-[12px] text-[#4a6278] dark:text-[#94a3b8] flex-1 min-w-0 truncate">
                  {cat.categoryName}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ProgressBar
                    value={catPct}
                    color={catColor}
                    className="w-[80px]"
                  />
                  <span
                    className="font-mono text-[10.5px] w-[28px] text-right font-semibold"
                    style={{ color: catColor }}
                  >
                    {catPct}%
                  </span>
                  <span className="font-mono text-[10.5px] text-[#afafaf] w-[40px] text-right">
                    {cat.compliantCount}/{catTotal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CompliancePage ───────────────────────────────────────────────────────────

export default function CompliancePage() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const { isFetched, data: capabilities } = useCapabilities();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("pct-desc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    () => new Set(["green", "orange", "red"]),
  );
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { costCentres, untaggedCount } = useMemo(() => {
    const caps: any[] = capabilities ?? [];
    const map = new Map<string, number>();
    let untagged = 0;
    for (const cap of caps) {
      const cc = parseCostCentre(cap);
      if (!cc) {
        untagged++;
        continue;
      }
      map.set(cc, (map.get(cc) ?? 0) + 1);
    }
    const list = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { costCentres: list, untaggedCount: untagged };
  }, [capabilities]);

  const complianceResults = useQueries({
    queries: costCentres.map((cc) => ({
      queryKey: ["compliance", "cost-centres", cc.name],
      queryFn: async () =>
        ssuRequest({
          method: "GET",
          urlSegments: ["compliance", "cost-centres", cc.name],
          payload: null,
          isCloudEngineerEnabled,
        }),
      enabled: isFetched,
      staleTime: 60_000,
    })),
  });

  const complianceMap = useMemo(() => {
    const map = new Map<string, ComplianceEntry>();
    costCentres.forEach((cc, i) => {
      const result = complianceResults[i];
      const data = result?.data as ComplianceData | undefined;
      const fetched = result?.isFetched ?? false;
      const pct =
        data && data.totalCapabilities > 0
          ? Math.round((data.compliantCount / data.totalCapabilities) * 100)
          : 0;
      map.set(cc.name, {
        data,
        isFetched: fetched,
        pct,
        tier: fetched ? complianceTier(pct) : null,
      });
    });
    return map;
  }, [costCentres, complianceResults]);

  const sidePanelStats = useMemo(() => {
    let totalCaps = 0;
    let totalCompliant = 0;
    let nGreen = 0;
    let nOrange = 0;
    let nRed = 0;
    for (const entry of complianceMap.values()) {
      if (!entry.isFetched || !entry.data) continue;
      totalCaps += entry.data.totalCapabilities;
      totalCompliant += entry.data.compliantCount;
      if (entry.tier === "green") nGreen++;
      else if (entry.tier === "orange") nOrange++;
      else if (entry.tier === "red") nRed++;
    }
    const fetchedCount = nGreen + nOrange + nRed;
    const overallPct =
      totalCaps > 0 ? Math.round((totalCompliant / totalCaps) * 100) : 0;
    return {
      totalCaps,
      totalCompliant,
      overallPct,
      nGreen,
      nOrange,
      nRed,
      fetchedCount,
    };
  }, [complianceMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = costCentres.filter((cc) => {
      if (q && !cc.name.toLowerCase().includes(q)) return false;
      const entry = complianceMap.get(cc.name);
      if (!entry?.isFetched || entry.tier === null) return true;
      return activeFilters.has(entry.tier);
    });

    list = [...list].sort((a, b) => {
      if (sort === "caps") return b.count - a.count;
      if (sort === "pct-asc" || sort === "pct-desc") {
        const aEntry = complianceMap.get(a.name);
        const bEntry = complianceMap.get(b.name);
        if (!aEntry?.isFetched && !bEntry?.isFetched)
          return a.name.localeCompare(b.name);
        if (!aEntry?.isFetched) return 1;
        if (!bEntry?.isFetched) return -1;
        return sort === "pct-asc"
          ? aEntry.pct - bEntry.pct
          : bEntry.pct - aEntry.pct;
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [costCentres, complianceMap, search, activeFilters, sort]);

  function toggleFilter(t: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(t)) {
        if (next.size === 1) return prev;
        next.delete(t);
      } else {
        next.add(t);
      }
      return next;
    });
  }

  function toggleCard(name: string) {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const n = costCentres.length;
  const {
    overallPct,
    nGreen,
    nOrange,
    nRed,
    fetchedCount,
    totalCaps,
    totalCompliant,
  } = sidePanelStats;
  const gaugeColor = complianceColor(overallPct);

  return (
    <div className="flex min-h-full">
      {/* ─── Side Panel ──────────────────────────────────────────────── */}
      <aside className="hidden md:block sticky top-[52px] h-[calc(100dvh-52px)] w-[240px] flex-shrink-0 overflow-y-auto bg-surface border-r border-card">
        <div className="p-5">
          {/* Overall Health */}
          <div className="mb-5">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#afafaf] dark:text-[#64748b] mb-3">
              Overall Health
            </div>
            {fetchedCount === 0 ? (
              <div className="flex flex-col items-center gap-2 mb-4">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="h-3 w-[60px]" />
              </div>
            ) : (
              <div className="mb-4">
                <ArcGauge pct={overallPct} color={gaugeColor} />
              </div>
            )}

            {/* Distribution bar */}
            <div
              className="h-2 rounded-full overflow-hidden flex mb-2"
              style={{ background: "var(--color-border-card)" }}
            >
              {n > 0 && (
                <>
                  <div
                    className="h-full"
                    style={{
                      width: `${(nGreen / n) * 100}%`,
                      background: "#22c55e",
                      transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                  <div
                    className="h-full"
                    style={{
                      width: `${(nOrange / n) * 100}%`,
                      background: "#f59e0b",
                      transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                  <div
                    className="h-full"
                    style={{
                      width: `${(nRed / n) * 100}%`,
                      background: "#ef4444",
                      transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                </>
              )}
            </div>

            {/* Distribution legend */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-[10.5px] text-[#4a6278] dark:text-[#94a3b8]">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#22c55e" }}
                />
                <span>{nGreen} good</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] text-[#4a6278] dark:text-[#94a3b8]">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#f59e0b" }}
                />
                <span>{nOrange} warn</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] text-[#4a6278] dark:text-[#94a3b8]">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#ef4444" }}
                />
                <span>{nRed} crit</span>
              </div>
            </div>
          </div>

          <div className="border-t border-card mb-5" />

          {/* Summary */}
          <div className="mb-5">
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#afafaf] dark:text-[#64748b] mb-3">
              Summary
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-[#4a6278] dark:text-[#94a3b8]">
                  Cost Centres
                </span>
                <span className="text-[13px] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono">
                  {isFetched ? n : "—"}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-[#4a6278] dark:text-[#94a3b8]">
                  Total Capabilities
                </span>
                <span className="text-[13px] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono">
                  {fetchedCount > 0 ? totalCaps : "—"}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-[#4a6278] dark:text-[#94a3b8]">
                  Compliant
                </span>
                <span
                  className="text-[13px] font-bold font-mono"
                  style={{ color: fetchedCount > 0 ? "#16a34a" : undefined }}
                >
                  {fetchedCount > 0 ? totalCompliant : "—"}
                </span>
              </div>
              {untaggedCount > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-[#4a6278] dark:text-[#94a3b8]">
                    Untagged
                  </span>
                  <span className="text-[13px] font-bold text-[#afafaf] font-mono">
                    {untaggedCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-card mb-5" />

          {/* Filter by Status */}
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#afafaf] dark:text-[#64748b] mb-2">
              Filter by Status
            </div>
            <div className="flex flex-col gap-0.5">
              <FilterCheckbox
                label="Compliant ≥80%"
                dotColor="#22c55e"
                count={nGreen}
                checked={activeFilters.has("green")}
                onToggle={() => toggleFilter("green")}
              />
              <FilterCheckbox
                label="Warning 50–79%"
                dotColor="#f59e0b"
                count={nOrange}
                checked={activeFilters.has("orange")}
                onToggle={() => toggleFilter("orange")}
              />
              <FilterCheckbox
                label="Critical <50%"
                dotColor="#ef4444"
                count={nRed}
                checked={activeFilters.has("red")}
                onToggle={() => toggleFilter("red")}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 animate-fade-up">
          <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1.5">
            // Cost Centres
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em] leading-[1.2]">
              Compliance
            </h1>
            {isFetched && (
              <span className="text-[12px] font-mono text-[#afafaf] bg-[#f2f2f2] dark:bg-[#1e293b] px-2.5 py-0.5 rounded-full">
                {filtered.length} {filtered.length === 1 ? "centre" : "centres"}
              </span>
            )}
          </div>
        </div>

        {/* Mobile-only: compact stats + filter chips */}
        <div className="md:hidden mb-4 animate-fade-up animate-stagger-1">
          {fetchedCount > 0 && (
            <div className="flex items-center gap-3 mb-3 text-[11px] font-mono text-[#4a6278] dark:text-[#94a3b8]">
              <span
                className="text-[20px] font-bold tracking-tight leading-none"
                style={{ color: gaugeColor }}
              >
                {overallPct}%
              </span>
              <span>overall</span>
            </div>
          )}
          <div className="flex gap-1.5 flex-wrap">
            {(
              [
                { key: "green", label: "≥80%", color: "#22c55e", count: nGreen },
                { key: "orange", label: "50–79%", color: "#f59e0b", count: nOrange },
                { key: "red", label: "<50%", color: "#ef4444", count: nRed },
              ] as const
            ).map(({ key, label, color, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFilter(key)}
                className={cn(
                  "flex items-center gap-1.5 h-[28px] px-3 border rounded-full text-[11px] font-medium transition-all",
                  !activeFilters.has(key) &&
                    "bg-white dark:bg-[#0f172a] border-[#d9dcde] dark:border-[#334155] text-[#afafaf] dark:text-[#64748b]",
                )}
                style={
                  activeFilters.has(key)
                    ? {
                        color,
                        borderColor: color,
                        background: `${color}18`,
                      }
                    : {}
                }
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: activeFilters.has(key) ? color : "#afafaf" }}
                />
                {label}
                <span className="font-mono">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3 animate-fade-up animate-stagger-2">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#afafaf] pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cost centres..."
            className="w-full h-[36px] pl-8 pr-4 bg-white dark:bg-[#0f172a] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] font-mono text-[16px] md:text-[12.5px] text-[#002b45] dark:text-[#e2e8f0] outline-none focus:border-[#0e7cc1] dark:focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(14,124,193,.1)] placeholder:text-[#afafaf] dark:placeholder:text-[#64748b] transition-[border-color,box-shadow]"
          />
        </div>

        {/* Sort pills + expand/collapse all */}
        <div className="flex items-center gap-1.5 mb-6 flex-wrap animate-fade-up animate-stagger-3">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                "h-[28px] px-3 border rounded-full text-[11px] font-medium transition-all",
                sort === key
                  ? "bg-[#0e7cc1] dark:bg-[#60a5fa] border-[#0e7cc1] dark:border-[#60a5fa] text-white font-semibold"
                  : "bg-white dark:bg-[#0f172a] border-[#d9dcde] dark:border-[#334155] text-[#4a6278] dark:text-[#94a3b8] hover:border-[#0e7cc1] dark:hover:border-[#60a5fa] hover:text-[#0e7cc1] dark:hover:text-[#60a5fa]",
              )}
            >
              {label}
            </button>
          ))}
          <div className="flex-1" />
          {isFetched && filtered.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const allExpanded = filtered.every(({ name }) => expandedCards.has(name));
                if (allExpanded) {
                  setExpandedCards(new Set());
                } else {
                  setExpandedCards(new Set(filtered.map(({ name }) => name)));
                }
              }}
              className="h-[28px] px-3 border rounded-full text-[11px] font-medium transition-all bg-white dark:bg-[#0f172a] border-[#d9dcde] dark:border-[#334155] text-[#4a6278] dark:text-[#94a3b8] hover:border-[#0e7cc1] dark:hover:border-[#60a5fa] hover:text-[#0e7cc1] dark:hover:text-[#60a5fa]"
            >
              {filtered.every(({ name }) => expandedCards.has(name))
                ? "Collapse all"
                : "Expand all"}
            </button>
          )}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 animate-fade-up animate-stagger-4">
          {!isFetched ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonComplianceCard key={i} />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full">
              <EmptyState>
                {costCentres.length === 0
                  ? "No cost centres found. Capabilities may not have the dfds.cost.centre tag set."
                  : "No cost centres match your filters."}
              </EmptyState>
            </div>
          ) : (
            filtered.map(({ name, count }, i) => {
              const entry = complianceMap.get(name);
              return (
                <CostCentreCard
                  key={name}
                  name={name}
                  capCount={count}
                  data={entry?.data}
                  isFetched={entry?.isFetched ?? false}
                  expanded={expandedCards.has(name)}
                  onToggle={() => toggleCard(name)}
                  className="animate-card-enter"
                  style={{ animationDelay: `${i * 25}ms` }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
