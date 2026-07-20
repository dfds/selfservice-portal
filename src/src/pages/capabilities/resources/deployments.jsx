import React from "react";
import { useParams } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { SkeletonServiceTableRow } from "@/components/ui/skeleton";
import { useCapabilityDeployments } from "@/state/remote/queries/catalog";
import { ServicesTableView } from "../../services/ServicesTableView";
import { LastUpdated, catalogUpdatedAt } from "@/components/ui/LastUpdated";

export default function Deployments({ anchorId }) {
  const { id } = useParams();
  const { data, isFetched, isError, isFetching, dataUpdatedAt } =
    useCapabilityDeployments(id);

  const meta = data?.meta;
  const apps = data?.data ?? [];
  const catalogUnavailable = isError || meta?.catalogAvailable === false;
  const lastUpdatedAt = catalogUpdatedAt(meta, dataUpdatedAt);

  return (
    <PageSection id={anchorId} headline="Services">
      <p className="text-[0.8125rem] text-[#666666] dark:text-slate-400 leading-[1.6] mb-2">
        Kubernetes workloads running for this capability, discovered across
        clusters. This view is read-only and refreshed periodically from the
        platform catalog.
      </p>
      {isFetched && !catalogUnavailable && (
        <LastUpdated
          updatedAt={lastUpdatedAt}
          isFetching={isFetching}
          className="mb-4"
        />
      )}

      {!isFetched ? (
        <div className="rounded-[8px] border border-card bg-surface overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonServiceTableRow key={i} />
          ))}
        </div>
      ) : catalogUnavailable ? (
        <InfoAlert variant="warning">
          The platform catalog is currently unavailable
          {meta && meta.clustersFailed > 0
            ? ` (${meta.clustersFailed} of ${meta.clustersQueried} cluster${
                meta.clustersQueried === 1 ? "" : "s"
              } could not be reached)`
            : ""}
          . Deployment information can't be shown right now — try again later.
        </InfoAlert>
      ) : apps.length === 0 ? (
        <EmptyState>
          No workloads were found for this capability in the platform catalog.
        </EmptyState>
      ) : (
        <ServicesTableView
          apps={apps}
          hideCapabilityColumn
          showErrorsColumn
          urlPrefix="dep"
        />
      )}
    </PageSection>
  );
}
