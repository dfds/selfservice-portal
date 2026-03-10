import React, { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { queryClient } from "@/state/remote/client";
import {
  useAllKafkaTopics,
  useKafkaClusters,
  useTopicMessageContracts,
  useDeleteKafkaTopic,
} from "@/state/remote/queries/kafka";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [expanded, setExpanded] = useState(false);
  const [triggered, setTriggered] = useState(false);

  function handleClick() {
    if (!triggered) setTriggered(true);
    setExpanded((e) => !e);
  }

  const isPublic = topic.name?.startsWith("pub.") ?? false;

  return (
    <div className="border border-card rounded-[8px] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={handleClick}
          className="flex-1 flex items-center gap-3 text-left bg-transparent border-0 cursor-pointer p-0 min-w-0"
        >
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
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className={cn(
              "text-muted transition-transform duration-200 flex-shrink-0",
              expanded && "rotate-180",
            )}
          />
        </button>
        <button
          type="button"
          onClick={() => onDelete(topic)}
          className="flex-shrink-0 p-1.5 rounded-[4px] text-muted hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border-0 bg-transparent"
          aria-label={`Delete topic ${topic.name}`}
        >
          <Trash2 size={14} strokeWidth={1.75} />
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-3 border-t border-card bg-surface-muted/40">
          {triggered && <TopicDetails topic={topic} />}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TopicExplorerPage() {
  const toast = useToast();
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

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteTopic.mutate(
      { topicDefinition: deleteTarget },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["kafka", "all-topics"] });
          toast.success("Topic deleted");
          setDeleteTarget(null);
        },
        onError: () => {
          toast.error("Could not delete topic");
        },
      },
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1.5">
          // Admin
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0]">
            Topic Explorer
          </h1>
          {topicsFetched && (
            <Badge variant="outline" className="text-xs font-mono">
              {filtered.length} / {allTopics.length}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted mt-1">
          All Kafka topics across all clusters, including private topics.
        </p>
      </div>

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
      <div className="space-y-2">
        {!topicsFetched ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-card rounded-[8px] p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-60 flex-1" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState>
            {allTopics.length === 0
              ? "No topics found."
              : "No topics match your filters."}
          </EmptyState>
        ) : (
          filtered.map((topic: any) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              onDelete={setDeleteTarget}
            />
          ))
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete topic?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-secondary">
            Permanently delete{" "}
            <span className="font-medium text-primary font-mono text-xs">
              {deleteTarget?.name}
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteTopic.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteTopic.isPending}
            >
              {deleteTopic.isPending ? "Deleting…" : "Delete Topic"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
