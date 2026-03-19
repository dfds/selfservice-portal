import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  useCapabilities,
  useCancelCapabilityDeletion,
} from "@/state/remote/queries/capabilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ListPageContent } from "@/components/ui/ListPageContent";
import { useMutationToast } from "@/hooks/useMutationToast";

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

  const fireCancelDeletion = useMutationToast(cancelDeletion, {
    invalidateKeys: [["capabilities", "list"]],
    successMessage: "Deletion cancelled",
    errorMessage: "Could not cancel deletion",
    onSuccess: () => setConfirmTarget(null),
  });

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="Deletion Queue"
        subtitle="Capabilities pending deletion — 7-day grace period before permanent removal."
        titleSuffix={
          isFetched && pendingDeletion.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {pendingDeletion.length}
            </Badge>
          )
        }
      />

      {/* List */}
      <ListPageContent
        isFetched={isFetched}
        items={pendingDeletion}
        renderItem={(c: any) => (
          <CapabilityRow
            key={c.id}
            capability={c}
            onCancel={setConfirmTarget}
          />
        )}
        skeletonCount={3}
        renderSkeleton={(i) => (
          <div key={i} className="border border-card rounded-[8px] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-28 rounded-[6px]" />
            </div>
          </div>
        )}
        emptyMessage="No capabilities are pending deletion."
        emptyIcon={
          <CheckCircle2
            size={32}
            strokeWidth={1.5}
            className="text-muted"
          />
        }
      />

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Cancel deletion?"
        description={
          <p>
            Cancel the deletion request for{" "}
            <span className="font-medium text-primary">
              {confirmTarget?.name}
            </span>
            ? This will restore the capability to Active status.
          </p>
        }
        confirmLabel="Cancel Deletion"
        confirmLoadingLabel="Cancelling…"
        cancelLabel="Keep Pending"
        confirmVariant="default"
        isPending={cancelDeletion.isPending}
        onConfirm={() => confirmTarget && fireCancelDeletion({ capabilityId: confirmTarget.id })}
      />
    </div>
  );
}
