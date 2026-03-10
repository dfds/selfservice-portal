import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { queryClient } from "@/state/remote/client";
import {
  useCapabilities,
  useCancelCapabilityDeletion,
} from "@/state/remote/queries/capabilities";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelative(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

type GracePeriodStatus = {
  label: string;
  variant: "soft-warning" | "destructive";
};

function getGracePeriod(deletionRequestedAt: string): GracePeriodStatus {
  const deadline =
    new Date(deletionRequestedAt).getTime() + GRACE_PERIOD_MS;
  const msLeft = deadline - Date.now();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return { label: "Overdue", variant: "destructive" };
  }
  if (daysLeft <= 2) {
    return { label: `${daysLeft}d left`, variant: "destructive" };
  }
  return { label: `${daysLeft}d left`, variant: "soft-warning" };
}

function CapabilityRow({
  capability,
  onCancel,
}: {
  capability: any;
  onCancel: (c: any) => void;
}) {
  const grace = capability.deletionRequestedAt
    ? getGracePeriod(capability.deletionRequestedAt)
    : null;

  return (
    <div className="border border-card rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-card-enter">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-sm text-primary truncate">
            {capability.name}
          </span>
          {grace && (
            <Badge variant={grace.variant} className="text-[10px] shrink-0">
              {grace.label}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted font-mono">
          {capability.deletionRequestedAt && (
            <span>
              Requested {formatRelative(capability.deletionRequestedAt)} ·{" "}
              {formatDate(capability.deletionRequestedAt)}
            </span>
          )}
          {capability.deletionRequestedBy && (
            <span>by {capability.deletionRequestedBy}</span>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onCancel(capability)}
        className="shrink-0"
      >
        Cancel Deletion
      </Button>
    </div>
  );
}

export default function DeletionQueuePage() {
  const toast = useToast();
  const { data: capabilities, isFetched } = useCapabilities();
  const cancelDeletion = useCancelCapabilityDeletion();
  const [confirmTarget, setConfirmTarget] = useState<any>(null);

  const pendingDeletion = ((capabilities as any[]) ?? [])
    .filter((c: any) => c.status === "Pending Deletion")
    .sort((a: any, b: any) => {
      if (!a.deletionRequestedAt) return 1;
      if (!b.deletionRequestedAt) return -1;
      return (
        new Date(a.deletionRequestedAt).getTime() -
        new Date(b.deletionRequestedAt).getTime()
      );
    });

  function handleConfirmCancel() {
    if (!confirmTarget) return;
    cancelDeletion.mutate(
      { capabilityId: confirmTarget.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["capabilities", "list"],
          });
          toast.success("Deletion cancelled");
          setConfirmTarget(null);
        },
        onError: () => {
          toast.error("Could not cancel deletion");
        },
      },
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1.5">
          // Admin
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0]">
            Deletion Queue
          </h1>
          {isFetched && pendingDeletion.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {pendingDeletion.length}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted mt-1">
          Capabilities pending deletion — 7-day grace period before permanent
          removal.
        </p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {!isFetched ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-card rounded-[8px] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-28 rounded-[6px]" />
              </div>
            </div>
          ))
        ) : pendingDeletion.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center gap-3">
            <CheckCircle2
              size={32}
              strokeWidth={1.5}
              className="text-muted"
            />
            <EmptyState>No capabilities are pending deletion.</EmptyState>
          </div>
        ) : (
          pendingDeletion.map((c: any) => (
            <CapabilityRow
              key={c.id}
              capability={c}
              onCancel={setConfirmTarget}
            />
          ))
        )}
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel deletion?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-secondary">
            Cancel the deletion request for{" "}
            <span className="font-medium text-primary">
              {confirmTarget?.name}
            </span>
            ? This will restore the capability to Active status.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmTarget(null)}
              disabled={cancelDeletion.isPending}
            >
              Keep Pending
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmCancel}
              disabled={cancelDeletion.isPending}
            >
              {cancelDeletion.isPending ? "Cancelling…" : "Cancel Deletion"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
