import React, { Suspense, lazy } from "react";
import {
  useCatalogDependencies,
  type CatalogApplication,
} from "@/state/remote/queries/catalog";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { Spinner } from "@/components/ui/spinner";

const WorkloadGraph = lazy(() => import("./graph/WorkloadGraph"));

export function WorkloadGraphView({ app }: { app: CatalogApplication }) {
  const depsQuery = useCatalogDependencies();
  const dependencies = depsQuery.data?.data ?? [];
  const depsUnavailable =
    depsQuery.isError || depsQuery.data?.meta?.catalogAvailable === false;

  return (
    <div>
      {depsUnavailable && (
        <InfoAlert variant="warning" className="mb-3">
          Runtime dependencies couldn't be loaded — showing the workload's
          structure only.
        </InfoAlert>
      )}
      <Suspense
        fallback={
          <div className="h-[440px] rounded-[8px] border border-card bg-surface-muted flex items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <WorkloadGraph
          app={app}
          dependencies={depsUnavailable ? [] : dependencies}
        />
      </Suspense>
    </div>
  );
}
