import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, Table2, Network } from "lucide-react";
import {
  useCatalogApplications,
  useCatalogDependencies,
} from "@/state/remote/queries/catalog";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { SkeletonServiceTableRow } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ServicesTableView } from "./ServicesTableView";
import { ServicesGraphView } from "./ServicesGraphView";
import { ServiceMetadataGuideModal } from "./ServiceMetadataGuideModal";
import { LastUpdated, catalogUpdatedAt } from "@/components/ui/LastUpdated";
import { connectsIndex, connectsOptions } from "./filtering";
import { workloadStatus, ingressHostsFor } from "./catalogView";
import { parseMetadata } from "../compliance/utils";
import { useRybbit } from "@/RybbitContext";

type ServicesView = "table" | "graph";

function ViewToggle({
  view,
  onChange,
}: {
  view: ServicesView;
  onChange: (v: ServicesView) => void;
}) {
  const seg = (active: boolean) =>
    cn(
      "h-[34px] px-3 inline-flex items-center gap-1.5 font-mono text-[11px] cursor-pointer transition-colors",
      active
        ? "bg-action/10 text-action"
        : "text-secondary hover:text-primary hover:bg-surface-muted",
    );
  return (
    <div className="inline-flex rounded-[6px] border border-card overflow-hidden">
      <button
        type="button"
        onClick={() => onChange("table")}
        className={seg(view === "table")}
      >
        <Table2 size={13} />
        Table
      </button>
      <button
        type="button"
        onClick={() => onChange("graph")}
        className={cn(seg(view === "graph"), "border-l border-card")}
      >
        <Network size={13} />
        Graph
      </button>
    </div>
  );
}

function EnrichServicesButton() {
  const [guideOpen, setGuideOpen] = useState(false);
  const { trackEvent } = useRybbit();
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex-none"
        onClick={() => {
          setGuideOpen(true);
          trackEvent("services:metadata-guide:open");
        }}
      >
        <BookOpen size={14} />
        Enrich your services
      </Button>
      <ServiceMetadataGuideModal open={guideOpen} onOpenChange={setGuideOpen} />
    </>
  );
}

export default function ServicesPage() {
  const appsQuery = useCatalogApplications();
  const apps = appsQuery.data?.data ?? [];
  const meta = appsQuery.data?.meta;
  const catalogUnavailable =
    appsQuery.isError || meta?.catalogAvailable === false;
  const isFetched = appsQuery.isFetched;
  const lastUpdatedAt = catalogUpdatedAt(meta, appsQuery.dataUpdatedAt);

  const [searchParams, setSearchParams] = useSearchParams();
  const view: ServicesView =
    searchParams.get("view") === "graph" ? "graph" : "table";
  const { trackEvent } = useRybbit();
  const setView = (next: ServicesView) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (next === "graph") p.set("view", "graph");
        else p.delete("view");
        return p;
      },
      { replace: true },
    );
    trackEvent("services:view:change", { view: next });
  };

  const capabilitiesQuery = useCapabilities();
  const metadataByCapability = useMemo(() => {
    const caps = (capabilitiesQuery.data ?? []) as {
      id: string;
      jsonMetadata?: string | null;
    }[];
    return new Map(caps.map((c) => [c.id, parseMetadata(c.jsonMetadata)]));
  }, [capabilitiesQuery.data]);

  const depsQuery = useCatalogDependencies();
  const deps = useMemo(() => depsQuery.data?.data ?? [], [depsQuery.data]);
  const connectsIdx = useMemo(() => connectsIndex(deps), [deps]);
  const connectsOpts = useMemo(() => connectsOptions(deps), [deps]);

  const summary = useMemo(() => {
    let healthy = 0;
    let degraded = 0;
    let down = 0;
    let ingress = 0;
    for (const app of apps) {
      const st = workloadStatus(app);
      if (st === "healthy") healthy += 1;
      else if (st === "degraded") degraded += 1;
      else down += 1;
      ingress += ingressHostsFor(app.services || []).length;
    }
    return { workloads: apps.length, healthy, degraded, down, ingress };
  }, [apps]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="animate-fade-up mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] mb-1.5">
            // Service catalogue
          </div>
          <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em] leading-[1.2] mb-2">
            Services
          </h1>
          <p className="text-[0.8125rem] text-secondary leading-[1.6] max-w-3xl mb-2">
            Application-centric view of Kubernetes workloads discovered across
            clusters and mapped to their owning capabilities. Click a workload
            to expand it, or open its full details page.
          </p>
          {!catalogUnavailable && (
            <LastUpdated
              updatedAt={lastUpdatedAt}
              isFetching={appsQuery.isFetching}
            />
          )}
        </div>
        <EnrichServicesButton />
      </div>

      {catalogUnavailable ? (
        <InfoAlert variant="warning" className="animate-fade-up">
          The service catalogue is currently unavailable
          {meta && meta.clustersFailed > 0
            ? ` (${meta.clustersFailed} of ${meta.clustersQueried} cluster${
                meta.clustersQueried === 1 ? "" : "s"
              } could not be reached)`
            : ""}
          . Services can't be shown right now — try again later.
        </InfoAlert>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-5 animate-fade-up animate-stagger-1">
            <StatCard
              value={summary.workloads}
              label="Workloads"
              loading={!isFetched}
            />
            <StatCard
              value={<span className="text-success">{summary.healthy}</span>}
              label="Healthy"
              loading={!isFetched}
            />
            <StatCard
              value={<span className="text-warning">{summary.degraded}</span>}
              label="Degraded"
              loading={!isFetched}
            />
            <StatCard
              value={<span className="text-error">{summary.down}</span>}
              label="Down"
              loading={!isFetched}
            />
            <StatCard
              value={summary.ingress}
              label="Ingress"
              loading={!isFetched}
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center mb-4">
            <ViewToggle view={view} onChange={setView} />
          </div>

          {/* Content */}
          <div className="animate-section-enter">
            {!isFetched ? (
              view === "graph" ? (
                <div className="h-[600px] rounded-[8px] border border-card bg-surface-muted animate-pulse" />
              ) : (
                <div className="rounded-[8px] border border-card bg-surface overflow-hidden">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonServiceTableRow key={i} />
                  ))}
                </div>
              )
            ) : apps.length === 0 ? (
              <EmptyState>
                No workloads were found in the service catalogue.
              </EmptyState>
            ) : view === "graph" ? (
              <ServicesGraphView apps={apps} />
            ) : (
              <ServicesTableView
                apps={apps}
                optionalTrafficColumns
                enableSearch
                enableChips
                enableMetadataFilters
                enableFacets
                metadataByCapability={metadataByCapability}
                connectsIndex={connectsIdx}
                connectsOptions={connectsOpts}
                depsLoading={!depsQuery.isFetched}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
