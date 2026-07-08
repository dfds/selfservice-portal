import React, { Suspense, lazy, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  useCatalogDependencies,
  type CatalogApplication,
} from "@/state/remote/queries/catalog";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { Spinner } from "@/components/ui/spinner";

const ServiceGraph = lazy(() => import("./graph/ServiceGraph"));

function matchesQuery(app: CatalogApplication, q: string): boolean {
  const hay = `${app.name} ${app.namespace} ${app.cluster} ${
    app.capabilityName || ""
  } ${app.capabilityId || ""}`.toLowerCase();
  return hay.includes(q);
}

export function ServicesGraphView({ apps }: { apps: CatalogApplication[] }) {
  const depsQuery = useCatalogDependencies();
  const dependencies = depsQuery.data?.data ?? [];
  const depsUnavailable =
    depsQuery.isError || depsQuery.data?.meta?.catalogAvailable === false;

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((app) => matchesQuery(app, q));
  }, [apps, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Scope the graph by name, namespace, capability…"
            className="h-[34px] w-[300px] md:w-[420px] max-w-full pl-8 pr-3 text-[0.8125rem] font-mono bg-surface border border-input rounded-[6px] text-primary outline-none focus:ring-2 focus:ring-action/40 placeholder:text-muted"
          />
        </div>
        <div className="ml-auto text-xs text-muted font-mono">
          {filtered.length}
          {filtered.length !== apps.length ? ` / ${apps.length}` : ""} workloads
        </div>
      </div>

      {depsUnavailable && (
        <InfoAlert variant="warning" className="mb-3">
          Runtime dependencies couldn't be loaded — showing the structural graph
          only.
        </InfoAlert>
      )}

      <Suspense fallback={<GraphFallback />}>
        <ServiceGraph
          apps={filtered}
          dependencies={depsUnavailable ? [] : dependencies}
        />
      </Suspense>
    </div>
  );
}

function GraphFallback() {
  return (
    <div className="h-[600px] rounded-[8px] border border-card bg-surface-muted flex items-center justify-center">
      <Spinner />
    </div>
  );
}
