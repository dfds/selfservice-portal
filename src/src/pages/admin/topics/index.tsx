import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  useAllKafkaTopics,
  useKafkaClusters,
  useTopicMessageContracts,
  useDeleteKafkaTopic,
} from "@/state/remote/queries/kafka";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { ListPageContent } from "@/components/ui/ListPageContent";
import { useMutationToast } from "@/hooks/useMutationToast";
import { cn } from "@/lib/utils";

// ── Topic expanded content ────────────────────────────────────────────────────

function TopicDetails({ topic }: { topic: any }) {
  const { data: contracts, isFetched } = useTopicMessageContracts(topic.id);
  const contractList: any[] = (contracts as any[]) ?? [];

  return (
    <div className="pt-2 space-y-2 text-xs text-secondary font-mono">
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        {topic.partitions != null && (
          <span>Partitions: <span className="text-primary">{topic.partitions}</span></span>
        )}
        {topic.retention != null && (
          <span>Retention: <span className="text-primary">{topic.retention}</span></span>
        )}
        {topic.retentionInMs != null && (
          <span>Retention: <span className="text-primary">{Math.round(topic.retentionInMs / (1000 * 60 * 60 * 24))}d</span></span>
        )}
      </div>
      {!isFetched ? (
        <Skeleton className="h-4 w-40" />
      ) : (
        <span>
          Message contracts:{" "}
          <span className="text-primary">{contractList.length}</span>
        </span>
      )}
    </div>
  );
}

// ── Topic row ─────────────────────────────────────────────────────────────────

function TopicRow({
  topic,
  onDelete,
}: {
  topic: any;
  onDelete: (t: any) => void;
}) {
  const isPublic = topic.name?.startsWith("pub.") ?? false;

  return (
    <ExpandableRow
      header={
        <>
          <span className="flex-1 text-sm font-medium text-primary font-mono truncate">
            {topic.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {topic.kafkaClusterName && (
              <Badge variant="secondary" className="text-[10px] font-mono hidden sm:inline-flex">
                {topic.kafkaClusterName}
              </Badge>
            )}
            <Badge
              variant={isPublic ? "soft-success" : "outline"}
              className="text-[10px] hidden sm:inline-flex"
            >
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </>
      }
      actions={
        <button
          type="button"
          onClick={() => onDelete(topic)}
          className="flex-shrink-0 p-1.5 rounded-[4px] text-muted hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border-0 bg-transparent"
          aria-label={`Delete topic ${topic.name}`}
        >
          <Trash2 size={14} strokeWidth={1.75} />
        </button>
      }
    >
      <TopicDetails topic={topic} />
    </ExpandableRow>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TopicExplorerPage() {
  const { data: topics, isFetched: topicsFetched } = useAllKafkaTopics();
  const { data: clusters } = useKafkaClusters();
  const deleteTopic = useDeleteKafkaTopic();

  const [search, setSearch] = useState("");
  const [clusterFilter, setClusterFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const allTopics: any[] = (topics as any[]) ?? [];
  const allClusters: any[] = (clusters as any[]) ?? [];

  const filtered = allTopics.filter((t: any) => {
    if (search && !t.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (clusterFilter !== "all" && t.kafkaClusterId !== clusterFilter) return false;
    const isPublic = t.name?.startsWith("pub.") ?? false;
    if (visibilityFilter === "public" && !isPublic) return false;
    if (visibilityFilter === "private" && isPublic) return false;
    return true;
  });

  const fireDelete = useMutationToast(deleteTopic, {
    invalidateKeys: [["kafka", "all-topics"]],
    successMessage: "Topic deleted",
    errorMessage: "Could not delete topic",
    onSuccess: () => setDeleteTarget(null),
  });

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="Topic Explorer"
        subtitle="All Kafka topics across all clusters, including private topics."
        titleSuffix={
          topicsFetched && (
            <Badge variant="outline" className="text-xs font-mono">
              {filtered.length} / {allTopics.length}
            </Badge>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search topics…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm max-w-xs font-mono"
        />
        {allClusters.length > 0 && (
          <select
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
            className="text-sm border border-input rounded-[6px] px-2 py-1.5 bg-background text-secondary cursor-pointer"
          >
            <option value="all">All clusters</option>
            {allClusters.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name ?? c.id}
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-1 p-1 bg-surface-muted rounded-[6px]">
          {(["all", "public", "private"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisibilityFilter(v)}
              className={cn(
                "px-3 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer border-0",
                visibilityFilter === v
                  ? "bg-white dark:bg-slate-700 text-primary shadow-card"
                  : "text-secondary hover:text-primary bg-transparent",
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <ListPageContent
        isFetched={topicsFetched}
        items={filtered}
        renderItem={(topic: any) => (
          <TopicRow
            key={topic.id}
            topic={topic}
            onDelete={setDeleteTarget}
          />
        )}
        skeletonCount={5}
        renderSkeleton={(i) => (
          <div key={i} className="border border-card rounded-[8px] p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-60 flex-1" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </div>
        )}
        emptyMessage={
          allTopics.length === 0
            ? "No topics found."
            : "No topics match your filters."
        }
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete topic?"
        description={
          <p>
            Permanently delete{" "}
            <span className="font-medium text-primary font-mono text-xs">
              {deleteTarget?.name}
            </span>
            ? This cannot be undone.
          </p>
        }
        confirmLabel="Delete Topic"
        confirmLoadingLabel="Deleting…"
        isPending={deleteTopic.isPending}
        onConfirm={() => deleteTarget && fireDelete({ topicDefinition: deleteTarget })}
      />
    </div>
  );
}
