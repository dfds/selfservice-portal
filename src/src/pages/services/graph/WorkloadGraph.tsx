import React, { useMemo } from "react";
import type {
  CatalogApplication,
  CatalogDependency,
} from "@/state/remote/queries/catalog";
import { GraphCanvas } from "./ServiceGraph";
import { buildWorkloadGraph } from "./graphModel";

export default function WorkloadGraph({
  app,
  dependencies,
}: {
  app: CatalogApplication;
  dependencies: CatalogDependency[];
}) {
  const graph = useMemo(
    () => buildWorkloadGraph(app, dependencies),
    [app, dependencies],
  );
  return (
    <GraphCanvas
      graph={graph}
      heightClass="h-[440px]"
      emptyMessage="No runtime connections observed to or from this workload yet."
    />
  );
}
