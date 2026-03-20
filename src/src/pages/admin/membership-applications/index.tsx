import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  useMembershipApplications,
  useSubmitMembershipApplicationApproval,
  useDeleteMembershipApplicationApproval,
} from "@/state/remote/queries/membershipApplications";
import { useToast } from "@/context/ToastContext";
import { queryClient } from "@/state/remote/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ListPageContent } from "@/components/ui/ListPageContent";
import { formatDate, formatRelative, getDeadlineStatus } from "@/lib/dateUtils";

const EXPIRY_MS = 15 * 24 * 60 * 60 * 1000;

function ApplicationCard({
  app,
  onApprove,
  onReject,
  isPending,
}: {
  app: any;
  onApprove: (app: any) => void;
  onReject: (app: any) => void;
  isPending: boolean;
}) {
  const expiry = app.createdAt ? getDeadlineStatus(app.createdAt, EXPIRY_MS, 3, "Expired") : null;

  return (
    <div className="border border-card rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-card-enter">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-sm text-primary">
            {app.applicant ?? app.id}
          </span>
          {expiry && (
            <Badge variant={expiry.variant} className="text-[10px] shrink-0">
              {expiry.label}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted font-mono">
          <span>Capability: {app.capabilityId}</span>
          {app.createdAt && (
            <span>
              {formatRelative(app.createdAt)} · {formatDate(app.createdAt)}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onApprove(app)}
          disabled={isPending}
          className="text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-950"
        >
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReject(app)}
          disabled={isPending}
          className="text-destructive border-destructive/30 hover:bg-destructive/5"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}

export default function MembershipApplicationsAdminPage() {
  const toast = useToast();
  const approveMutation = useSubmitMembershipApplicationApproval();
  const rejectMutation = useDeleteMembershipApplicationApproval();
  const { data: applications, isFetched } = useMembershipApplications();

  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const apps: any[] = ((applications as any[]) ?? [])
    .filter((a: any) => a.status !== "Approved")
    .sort((a: any, b: any) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  function markProcessing(id: string) {
    setProcessingIds((prev) => new Set(prev).add(id));
  }

  function unmarkProcessing(id: string) {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleApprove(app: any) {
    markProcessing(app.id);
    approveMutation.mutate(
      { membershipApplicationDefinition: app },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["membershipapplications/eligible-for-approval"],
          });
          toast.success("Application approved");
          unmarkProcessing(app.id);
        },
        onError: () => {
          toast.error("Could not approve application");
          unmarkProcessing(app.id);
        },
      },
    );
  }

  function handleConfirmReject() {
    if (!rejectTarget) return;
    markProcessing(rejectTarget.id);
    rejectMutation.mutate(
      { membershipApplicationDefinition: rejectTarget },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["membershipapplications/eligible-for-approval"],
          });
          toast.success("Application rejected");
          unmarkProcessing(rejectTarget.id);
          setRejectTarget(null);
        },
        onError: () => {
          toast.error("Could not reject application");
          unmarkProcessing(rejectTarget.id);
          setRejectTarget(null);
        },
      },
    );
  }

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="Membership Queue"
        subtitle="Pending membership applications across all capabilities."
        titleSuffix={
          isFetched && apps.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {apps.length}
            </Badge>
          )
        }
      />

      {/* List */}
      <ListPageContent
        isFetched={isFetched}
        items={apps}
        renderItem={(app: any) => (
          <ApplicationCard
            key={app.id}
            app={app}
            onApprove={handleApprove}
            onReject={setRejectTarget}
            isPending={processingIds.has(app.id)}
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
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-[6px]" />
                <Skeleton className="h-8 w-16 rounded-[6px]" />
              </div>
            </div>
          </div>
        )}
        emptyMessage="No pending membership applications."
        emptyIcon={
          <CheckCircle2 size={32} strokeWidth={1.5} className="text-muted" />
        }
      />

      {/* Reject confirmation dialog */}
      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject application?"
        description={
          <p>
            Reject the membership application from{" "}
            <span className="font-medium text-primary">
              {rejectTarget?.applicant}
            </span>{" "}
            for capability{" "}
            <span className="font-medium text-primary font-mono text-xs">
              {rejectTarget?.capabilityId}
            </span>
            ?
          </p>
        }
        confirmLabel="Reject"
        confirmLoadingLabel="Rejecting…"
        cancelLabel="Keep Pending"
        isPending={rejectMutation.isPending}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
