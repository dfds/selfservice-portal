import React from "react";
import { useStats } from "@/state/remote/queries/stats";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import {
  useCapabilitiesCost,
  useCapabilitiesAwsResources,
} from "@/state/remote/queries/platformdataapi";
import { Skeleton } from "@/components/ui/skeleton";

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatBox({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number | undefined;
  loading: boolean;
}) {
  return (
    <div className="border border-card rounded-[8px] p-4 flex flex-col gap-1">
      <p className="text-[10px] font-mono text-muted uppercase tracking-wide">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <p className="text-2xl font-bold text-primary">{value ?? "—"}</p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlatformMetricsDashboardPage() {
  const { data: statsData, isFetched: statsFetched } = useStats();
  const { data: capsData, isFetched: capsFetched } = useCapabilities();
  const { query: costQuery } = useCapabilitiesCost();
  const { query: resourceQuery } = useCapabilitiesAwsResources();

  const stats: any = statsData ?? {};
  const capabilities: any[] = (capsData as any[]) ?? [];

  const costMap: Map<any, any> = costQuery.data instanceof Map ? costQuery.data : new Map();
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
    <div className="px-5 md:px-8 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1.5">
          // Admin
        </div>
        <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0]">
          Platform Metrics
        </h1>
        <p className="text-sm text-muted mt-1">
          Platform-wide capability, cost, and resource overview.
        </p>
      </div>

      {/* Capabilities stats */}
      <div className="mb-6">
        <p className="text-[11px] font-mono font-semibold tracking-[0.1em] uppercase text-muted mb-3">
          Capabilities
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox
            label="Total"
            value={capsFetched ? capabilities.length : undefined}
            loading={!capsFetched}
          />
          <StatBox
            label="Active"
            value={capsFetched ? activeCapabilities : undefined}
            loading={!capsFetched}
          />
          <StatBox
            label="Pending Deletion"
            value={capsFetched ? pendingDeletion : undefined}
            loading={!capsFetched}
          />
          <StatBox
            label="With Cost Data"
            value={costQuery.isFetched ? capabilitiesWithCost : undefined}
            loading={!costQuery.isFetched}
          />
        </div>
      </div>

      {/* Cloud resources */}
      <div className="mb-6">
        <p className="text-[11px] font-mono font-semibold tracking-[0.1em] uppercase text-muted mb-3">
          Cloud Resources
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBox
            label="Total AWS Resources"
            value={resourceQuery.isFetched ? totalResources : undefined}
            loading={!resourceQuery.isFetched}
          />
          <StatBox
            label="Approx. Monthly Cost (USD)"
            value={costQuery.isFetched ? `$${totalCost.toFixed(0)}` : undefined}
            loading={!costQuery.isFetched}
          />
        </div>
      </div>

      {/* Portal stats */}
      {statsFetched && typeof stats === "object" && stats !== null && (
        <div className="mb-6">
          <p className="text-[11px] font-mono font-semibold tracking-[0.1em] uppercase text-muted mb-3">
            Portal Stats
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(stats)
              .filter(([k, v]) => k !== "_links" && k !== "items" && typeof v !== "object")
              .slice(0, 6)
              .map(([key, value]) => (
                <StatBox
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
