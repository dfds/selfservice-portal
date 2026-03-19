import React, { useState } from "react";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { queryClient } from "@/state/remote/client";
import {
  useEcrRepositories,
  useEcrOutOfSyncInfo,
  useSyncEcr,
} from "@/state/remote/queries/ecr";
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
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EcrSyncDashboardPage() {
  const toast = useToast();
  const { data: repos, isFetched: reposFetched } = useEcrRepositories();
  const { data: outOfSyncData, isFetched: syncFetched } = useEcrOutOfSyncInfo();
  const syncEcr = useSyncEcr();

  const [search, setSearch] = useState("");
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [syncMode, setSyncMode] = useState<"dry-run" | "update">("dry-run");

  const allRepos: any[] = Array.isArray(repos)
    ? repos
    : (repos as any)?.items ?? [];

  const outOfSync: any = outOfSyncData ?? {};
  const notInAws: string[] = outOfSync.repositoriesNotInAws ?? [];
  const notInDb: string[] = outOfSync.repositoriesNotInDb ?? [];
  const totalOutOfSync = notInAws.length + notInDb.length;

  const filteredRepos = allRepos.filter(
    (r: any) =>
      !search || (r.name ?? r.id ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function handleSync() {
    syncEcr.mutate(
      { updateOnMismatch: syncMode === "update" },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["ecr"] });
          toast.success(
            syncMode === "update" ? "ECR sync complete" : "Dry run complete — no changes made",
          );
          setShowSyncConfirm(false);
        },
        onError: () => {
          toast.error("ECR sync failed");
          setShowSyncConfirm(false);
        },
      },
    );
  }

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="ECR Sync"
        subtitle="ECR repositories sync status between AWS and the platform database."
        titleSuffix={
          syncFetched && (
            totalOutOfSync > 0 ? (
              <Badge variant="destructive" className="text-xs">
                {totalOutOfSync} out of sync
              </Badge>
            ) : (
              <Badge variant="soft-success" className="text-xs">
                All in sync
              </Badge>
            )
          )
        }
      />

      {/* Sync status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="border border-card rounded-[8px] p-4">
          <p className="text-xs text-muted font-mono mb-1">In AWS, not in DB</p>
          {!syncFetched ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <div className="flex items-center gap-2">
              {notInDb.length > 0 ? (
                <AlertCircle size={16} className="text-warning" />
              ) : (
                <CheckCircle2 size={16} className="text-success" />
              )}
              <span className="text-xl font-bold text-primary">
                {notInDb.length}
              </span>
            </div>
          )}
          {notInDb.length > 0 && (
            <div className="mt-2 space-y-0.5 max-h-24 overflow-y-auto">
              {notInDb.map((name, i) => (
                <p key={i} className="text-[10px] text-muted font-mono truncate">
                  {name}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="border border-card rounded-[8px] p-4">
          <p className="text-xs text-muted font-mono mb-1">In DB, not in AWS</p>
          {!syncFetched ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <div className="flex items-center gap-2">
              {notInAws.length > 0 ? (
                <AlertCircle size={16} className="text-warning" />
              ) : (
                <CheckCircle2 size={16} className="text-success" />
              )}
              <span className="text-xl font-bold text-primary">
                {notInAws.length}
              </span>
            </div>
          )}
          {notInAws.length > 0 && (
            <div className="mt-2 space-y-0.5 max-h-24 overflow-y-auto">
              {notInAws.map((name, i) => (
                <p key={i} className="text-[10px] text-muted font-mono truncate">
                  {name}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSyncMode("dry-run"); setShowSyncConfirm(true); }}
        >
          <RefreshCw size={13} strokeWidth={1.75} className="mr-1.5" />
          Dry Run Sync
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => { setSyncMode("update"); setShowSyncConfirm(true); }}
        >
          <RefreshCw size={13} strokeWidth={1.75} className="mr-1.5" />
          Sync & Update
        </Button>
      </div>

      {/* Repo list */}
      <div className="mb-3">
        <Input
          placeholder="Search repositories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm max-w-sm font-mono"
        />
      </div>

      <div className="space-y-2">
        {!reposFetched ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-card rounded-[8px] p-4">
              <Skeleton className="h-4 w-56" />
            </div>
          ))
        ) : filteredRepos.length === 0 ? (
          <EmptyState>
            {allRepos.length === 0
              ? "No ECR repositories found."
              : "No repositories match your search."}
          </EmptyState>
        ) : (
          filteredRepos.map((repo: any, i: number) => {
            const repoName = repo.name ?? repo.id ?? `Repo ${i + 1}`;
            const isOutOfSync =
              notInAws.includes(repoName) || notInDb.includes(repoName);
            return (
              <div
                key={repo.id ?? i}
                className="border border-card rounded-[8px] px-4 py-3 flex items-center gap-3"
              >
                <span className="flex-1 text-sm font-mono text-primary truncate">
                  {repoName}
                </span>
                {isOutOfSync && (
                  <Badge variant="soft-warning" className="text-[10px] shrink-0">
                    Out of sync
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sync confirm dialog */}
      <Dialog
        open={showSyncConfirm}
        onOpenChange={(open) => !open && setShowSyncConfirm(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {syncMode === "update" ? "Sync & Update ECR?" : "Dry Run Sync?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-secondary">
            {syncMode === "update"
              ? "This will synchronize the platform database with AWS ECR state. Mismatched repositories will be updated."
              : "This will check sync status without making any changes."}
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setShowSyncConfirm(false)}
              disabled={syncEcr.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={syncMode === "update" ? "default" : "outline"}
              onClick={handleSync}
              disabled={syncEcr.isPending}
            >
              {syncEcr.isPending
                ? "Running…"
                : syncMode === "update"
                  ? "Sync & Update"
                  : "Run Dry Sync"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
