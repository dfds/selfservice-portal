import React from "react";
import { useStats } from "@/state/remote/queries/stats";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import {
  useCapabilitiesCost,
  useCapabilitiesAwsResources,
} from "@/state/remote/queries/platformdataapi";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlatformMetricsDashboardPage() {
  const { data: statsData, isFetched: statsFetched } = useStats();
  const { data: capsData, isFetched: capsFetched } = useCapabilities();
  const { query: costQuery } = useCapabilitiesCost();
  const { query: resourceQuery } = useCapabilitiesAwsResources();

  const stats: any = statsData ?? {};
  const capabilities: any[] = (capsData as any[]) ?? [];

  const costMap: Map<any, any> =
    costQuery.data instanceof Map ? costQuery.data : new Map();
  const resourceMap: Map<any, any> =
    resourceQuery.data instanceof Map ? resourceQuery.data : new Map();

  // Aggregate cost (last data point per capability)
  let totalCost = 0;
  let capabilitiesWithCost = 0;
  for (const costs of costMap.values()) {
    const arr: any[] = Array.isArray(costs) ? costs : [];
    if (arr.length > 0) {
      const last = arr[arr.length - 1];
      totalCost += Number(last?.pv ?? 0);
      capabilitiesWithCost++;
    }
  }

  // Aggregate AWS resources
  let totalResources = 0;
  for (const counts of resourceMap.values()) {
    const arr: any[] = Array.isArray(counts) ? counts : [];
    for (const r of arr) {
      totalResources += Number(r?.resourceCount ?? 0);
    }
  }

  const activeCapabilities = capabilities.filter(
    (c: any) => c.status === "Active",
  ).length;
  const pendingDeletion = capabilities.filter(
    (c: any) => c.status === "Pending Deletion",
  ).length;

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="Platform Metrics"
        subtitle="Capability stats (platform-wide) and cost/resource data (your capabilities)."
      />

      {/* Capabilities stats */}
      <div className="mb-6">
        <SectionLabel as="p" className="mb-3">
          Capabilities
        </SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total"
            value={capsFetched ? capabilities.length : undefined}
            loading={!capsFetched}
          />
          <StatCard
            label="Active"
            value={capsFetched ? activeCapabilities : undefined}
            loading={!capsFetched}
          />
          <StatCard
            label="Pending Deletion"
            value={capsFetched ? pendingDeletion : undefined}
            loading={!capsFetched}
          />
          <StatCard
            label="With Cost Data"
            value={costQuery.isFetched ? capabilitiesWithCost : undefined}
            loading={!costQuery.isFetched}
          />
        </div>
      </div>

      {/* Cloud resources */}
      <div className="mb-6">
        <SectionLabel as="p" className="mb-3">
          Cloud Resources (Your Capabilities)
        </SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Total AWS Resources"
            value={resourceQuery.isFetched ? totalResources : undefined}
            loading={!resourceQuery.isFetched}
          />
          <StatCard
            label="Approx. Monthly Cost (USD)"
            value={costQuery.isFetched ? `$${totalCost.toFixed(0)}` : undefined}
            loading={!costQuery.isFetched}
          />
        </div>
      </div>

      {/* Portal stats */}
      {statsFetched && typeof stats === "object" && stats !== null && (
        <div className="mb-6">
          <SectionLabel as="p" className="mb-3">
            Portal Stats
          </SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(stats)
              .filter(
                ([k, v]) =>
                  k !== "_links" && k !== "items" && typeof v !== "object",
              )
              .slice(0, 6)
              .map(([key, value]) => (
                <StatCard
                  key={key}
                  label={key.replace(/([A-Z])/g, " $1").trim()}
                  value={String(value)}
                  loading={false}
                />
              ))}
          </div>
        </div>
      )}

      {!statsFetched && !capsFetched && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-card rounded-[8px] p-4">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-7 w-12" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
