import React, { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Skeleton, SkeletonComplianceCard } from "@/components/ui/skeleton";
import {
  useCapabilities,
  useCostCentreCompliance,
} from "@/state/remote/queries/capabilities";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

function parseCostCentre(cap: any): string | null {
  if (!cap.jsonMetadata) return null;
  try {
    const meta = JSON.parse(cap.jsonMetadata);
    return meta["dfds.cost.centre"] || null;
  } catch {
    return null;
  }
}

function complianceColor(pct: number): string {
  if (pct >= 80) return "#4caf50";
  if (pct >= 50) return "#ed8800";
  return "#be1e2d";
}

function CostCentreCard({
  name,
  capCount,
  className,
  style,
}: {
  name: string;
  capCount: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { data, isFetched } = useCostCentreCompliance(name);
  const [expanded, setExpanded] = useState(false);

  const total = data?.totalCapabilities ?? 0;
  const compliant = data?.compliantCount ?? 0;
  const pct = total > 0 ? (compliant / total) * 100 : 0;
  const barColor = isFetched ? complianceColor(pct) : "#4caf50";
  const categories: any[] = data?.categories ?? [];

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden",
        className,
      )}
      style={style}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-[1.125rem] py-[0.875rem] hover:bg-[#f8fafc] dark:hover:bg-[#334155]/40 transition-colors text-left cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <span className="font-mono text-[13px] font-semibold text-[#002b45] dark:text-[#e2e8f0] block truncate">
            {name}
          </span>
          <span className="font-mono text-[11px] text-[#afafaf]">
            {capCount} {capCount === 1 ? "capability" : "capabilities"}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isFetched ? (
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-[11px] text-[#afafaf]">
                {compliant}/{total} compliant
              </span>
              <ProgressBar value={pct} color={barColor} className="w-[120px]" />
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-2 w-[120px] rounded-full" />
            </div>
          )}
          <ChevronRight
            size={14}
            className={cn(
              "text-[#afafaf] transition-transform duration-200 ease-out-expo",
              expanded ? "rotate-90" : "",
            )}
          />
        </div>
      </button>

      {expanded && isFetched && categories.length > 0 && (
        <div className="border-t border-[#eeeeee] dark:border-[#1e2d3d] bg-[#f8fafc] dark:bg-[#0f172a] px-[1.125rem] py-3">
          <div className="border border-[#d9dcde] dark:border-[#334155] rounded-[6px] overflow-hidden">
            {categories.map((cat, i) => {
              const catTotal = cat.compliantCount + cat.nonCompliantCount;
              const catPct =
                catTotal > 0 ? (cat.compliantCount / catTotal) * 100 : 0;
              const catColor = complianceColor(catPct);
              return (
                <div
                  key={cat.categoryName}
                  className={cn(
                    "flex items-center gap-4 px-4 py-2.5 text-[12px]",
                    i < categories.length - 1
                      ? "border-b border-[#eeeeee] dark:border-[#1e2d3d]"
                      : "",
                  )}
                >
                  <span className="text-[#002b45] dark:text-[#e2e8f0] flex-1 min-w-0 truncate font-mono">
                    {cat.categoryName}
                  </span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <ProgressBar
                      value={catPct}
                      color={catColor}
                      className="w-[80px]"
                    />
                    <span className="font-mono text-[11px] text-[#4caf50] w-[52px] text-right">
                      {cat.compliantCount} ✓
                    </span>
                    {cat.nonCompliantCount > 0 && (
                      <span className="font-mono text-[11px] text-[#be1e2d] w-[52px] text-right">
                        {cat.nonCompliantCount} ✗
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompliancePage() {
  const { isFetched, data: capabilities } = useCapabilities();
  const [search, setSearch] = useState("");

  const { costCentres, taggedCount, untaggedCount } = useMemo(() => {
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
    return {
      costCentres: list,
      taggedCount: list.reduce((s, cc) => s + cc.count, 0),
      untaggedCount: untagged,
    };
  }, [capabilities]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return costCentres;
    return costCentres.filter((cc) => cc.name.toLowerCase().includes(q));
  }, [costCentres, search]);

  return (
    <div className="p-8">
      <div className="mb-6 animate-fade-up">
        <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] mb-1.5">
          // Cost Centres
        </div>
        <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em] leading-[1.2]">
          Compliance
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-up animate-stagger-1">
        <StatCard
          value={costCentres.length}
          label="Cost Centres"
          loading={!isFetched}
          hasData={isFetched && costCentres.length > 0}
        />
        <StatCard
          value={taggedCount}
          label="Tagged Capabilities"
          loading={!isFetched}
          hasData={isFetched && taggedCount > 0}
        />
        <StatCard
          value={untaggedCount}
          label="Untagged"
          loading={!isFetched}
          hasData={true}
        />
      </div>

      <div className="mb-4 animate-fade-up animate-stagger-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a cost centre..."
          className="w-full h-[38px] px-4 bg-white dark:bg-[#0f172a] border border-[#d9dcde] dark:border-[#334155] rounded-[6px] font-mono text-[16px] md:text-[12px] text-[#002b45] dark:text-[#e2e8f0] outline-none focus:border-[#0e7cc1] dark:focus:border-[#60a5fa] placeholder:text-[#afafaf] dark:placeholder:text-[#64748b]"
        />
      </div>

      <div className="flex flex-col gap-2 animate-fade-up animate-stagger-3">
        {!isFetched ? (
          Array.from({ length: 5 }).map((_, i) => (
            <SkeletonComplianceCard key={i} />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState>
            {costCentres.length === 0
              ? "No cost centres found. Capabilities may not have the dfds.cost.centre tag set."
              : "No cost centres match your search."}
          </EmptyState>
        ) : (
          filtered.map(({ name, count }, i) => (
            <CostCentreCard
              key={name}
              name={name}
              capCount={count}
              className="animate-card-enter"
              style={{ animationDelay: `${i * 30}ms` }}
            />
          ))
        )}
      </div>
    </div>
  );
}
