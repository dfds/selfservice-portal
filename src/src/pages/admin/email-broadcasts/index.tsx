import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { queryClient } from "@/state/remote/client";
import {
  useEmailBroadcasts,
  useDeleteEmailBroadcast,
  useSendEmailBroadcast,
  useCancelEmailBroadcast,
  useDuplicateEmailBroadcast,
} from "@/state/remote/queries/emailBroadcasts";
import { BroadcastStatusBadge } from "./components/broadcast-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBroadcastRow } from "@/components/ui/skeleton";
import { Plus, Trash2, Pencil, Send, Eye, Ban, Copy } from "lucide-react";

type StatusTab = "all" | "Draft" | "Scheduled" | "Sent" | "Failed" | "Cancelled";

export default function EmailBroadcastsPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const { data, isFetched } = useEmailBroadcasts(statusFilter);
  const deleteBroadcast = useDeleteEmailBroadcast();
  const toast = useToast();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [sendTarget, setSendTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);

  const allBroadcasts = (data || []) as any[];
  const broadcasts = statusFilter
    ? allBroadcasts.filter((b: any) => b.status === statusFilter)
    : allBroadcasts;

  const tabs: StatusTab[] = [
    "all",
    "Draft",
    "Scheduled",
    "Sent",
    "Failed",
    "Cancelled",
  ];

  const handleDelete = (broadcast: any) => {
    deleteBroadcast.mutate(
      { id: broadcast.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["emailBroadcasts"] });
          toast.success("Broadcast deleted");
          setDeleteTarget(null);
        },
        onError: () => toast.error("Could not delete broadcast"),
      },
    );
  };

  return (
    <div className="px-5 md:px-8 py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.25rem] font-bold text-primary">
            Email Broadcasts
          </h1>
          <p className="text-[13px] text-muted mt-1">
            Create and manage email campaigns to capability members.
          </p>
        </div>
        <Button
          variant="action"
          className="gap-1.5"
          onClick={() => navigate("/admin/email-broadcasts/create")}
        >
          <Plus size={14} />
          New Broadcast
        </Button>
      </div>

      <div className="flex gap-1 mb-4 border-b border-card">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-[12px] font-medium border-b-2 -mb-px cursor-pointer bg-transparent transition-colors ${
              activeTab === tab
                ? "border-action text-action"
                : "border-transparent text-muted hover:text-secondary"
            }`}
          >
            {tab === "all" ? "All" : tab}
          </button>
        ))}
      </div>

      {!isFetched ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBroadcastRow key={i} />
          ))}
        </div>
      ) : broadcasts.length === 0 ? (
        <EmptyState>
          No broadcasts found. Create your first broadcast to get started.
        </EmptyState>
      ) : (
        <div className="space-y-2">
          {broadcasts.map((b: any, i: number) => (
            <BroadcastRow
              key={b.id}
              broadcast={b}
              index={i}
              onEdit={() =>
                navigate(`/admin/email-broadcasts/edit/${b.id}`)
              }
              onDelete={() => setDeleteTarget(b)}
              onSend={() => setSendTarget(b)}
              onCancel={() => setCancelTarget(b)}
              onView={() => navigate(`/admin/email-broadcasts/${b.id}`)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete broadcast?</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-secondary">
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {sendTarget && (
        <SendConfirmDialog
          broadcast={sendTarget}
          open={!!sendTarget}
          onOpenChange={() => setSendTarget(null)}
        />
      )}

      {cancelTarget && (
        <CancelConfirmDialog
          broadcast={cancelTarget}
          open={!!cancelTarget}
          onOpenChange={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

function BroadcastRow({
  broadcast,
  index,
  onEdit,
  onDelete,
  onSend,
  onCancel,
  onView,
}: {
  broadcast: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
  onCancel: () => void;
  onView: () => void;
}) {
  const duplicateBroadcast = useDuplicateEmailBroadcast(broadcast.id);
  const toast = useToast();
  const navigate = useNavigate();

  const handleDuplicate = () => {
    duplicateBroadcast.mutate(undefined, {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries({ queryKey: ["emailBroadcasts"] });
        toast.success("Broadcast duplicated");
        if (data?.id) {
          navigate(`/admin/email-broadcasts/edit/${data.id}`);
        }
      },
      onError: () => toast.error("Could not duplicate broadcast"),
    });
  };

  const scheduleInfo =
    broadcast.scheduleType === "Scheduled" && broadcast.scheduledAt
      ? `Scheduled: ${new Date(broadcast.scheduledAt).toLocaleString()}`
      : broadcast.scheduleType === "Recurring" && broadcast.cronExpression
        ? `Cron: ${broadcast.cronExpression}`
        : null;

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg border border-card bg-surface hover:shadow-card transition-shadow animate-card-enter"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex-1 min-w-0">
        <Link
          to={`/admin/email-broadcasts/${broadcast.id}`}
          className="text-[13px] font-medium text-primary hover:text-action no-underline truncate block"
        >
          {broadcast.name}
        </Link>
        <span className="text-[11px] text-muted font-mono">
          {broadcast.subject}
        </span>
        {scheduleInfo && (
          <span className="text-[10px] text-action font-mono block mt-0.5">
            {scheduleInfo}
          </span>
        )}
      </div>
      <BroadcastStatusBadge status={broadcast.status} />
      <span className="text-[11px] text-muted whitespace-nowrap">
        {new Date(broadcast.modifiedAt).toLocaleDateString()}
      </span>
      <div className="flex gap-1">
        {broadcast.status === "Draft" && (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 text-muted hover:text-action cursor-pointer bg-transparent border-0 transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={onSend}
              className="p-1.5 text-muted hover:text-action cursor-pointer bg-transparent border-0 transition-colors"
              title="Send Now"
            >
              <Send size={14} />
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1.5 text-muted hover:text-action cursor-pointer bg-transparent border-0 transition-colors"
              title="Duplicate"
              disabled={duplicateBroadcast.isPending}
            >
              <Copy size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-muted hover:text-red-500 cursor-pointer bg-transparent border-0 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
        {broadcast.status === "Scheduled" && (
          <>
            <button
              type="button"
              onClick={onView}
              className="p-1.5 text-muted hover:text-action cursor-pointer bg-transparent border-0 transition-colors"
              title="View Details"
            >
              <Eye size={14} />
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1.5 text-muted hover:text-action cursor-pointer bg-transparent border-0 transition-colors"
              title="Duplicate"
              disabled={duplicateBroadcast.isPending}
            >
              <Copy size={14} />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-muted hover:text-red-500 cursor-pointer bg-transparent border-0 transition-colors"
              title="Cancel"
            >
              <Ban size={14} />
            </button>
          </>
        )}
        {(broadcast.status === "Sent" || broadcast.status === "Failed") && (
          <>
            <button
              type="button"
              onClick={onView}
              className="p-1.5 text-muted hover:text-action cursor-pointer bg-transparent border-0 transition-colors"
              title="View Details"
            >
              <Eye size={14} />
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1.5 text-muted hover:text-action cursor-pointer bg-transparent border-0 transition-colors"
              title="Duplicate as new draft"
              disabled={duplicateBroadcast.isPending}
            >
              <Copy size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SendConfirmDialog({
  broadcast,
  open,
  onOpenChange,
}: {
  broadcast: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const sendBroadcast = useSendEmailBroadcast(broadcast.id);
  const toast = useToast();

  const handleSend = () => {
    sendBroadcast.mutate(undefined, {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries({ queryKey: ["emailBroadcasts"] });
        toast.success(
          `Broadcast sent to ${data?.totalRecipients || 0} recipients`,
        );
        onOpenChange(false);
      },
      onError: () => {
        toast.error("Could not send broadcast");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send broadcast now?</DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-secondary">
          This will send <strong>{broadcast.name}</strong> to all matching
          recipients immediately. This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSend}
            disabled={sendBroadcast.isPending}
            className="gap-1.5"
          >
            <Send size={14} />
            {sendBroadcast.isPending ? "Sending..." : "Send Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CancelConfirmDialog({
  broadcast,
  open,
  onOpenChange,
}: {
  broadcast: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const cancelBroadcast = useCancelEmailBroadcast(broadcast.id);
  const toast = useToast();

  const handleCancel = () => {
    cancelBroadcast.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["emailBroadcasts"] });
        toast.success("Broadcast cancelled");
        onOpenChange(false);
      },
      onError: () => {
        toast.error("Could not cancel broadcast");
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel scheduled broadcast?</DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-secondary">
          This will cancel <strong>{broadcast.name}</strong>.{" "}
          {broadcast.scheduleType === "Recurring"
            ? "No further recurring executions will run."
            : "The broadcast will not be sent."}
        </p>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelBroadcast.isPending}
            className="gap-1.5"
          >
            <Ban size={14} />
            {cancelBroadcast.isPending ? "Cancelling..." : "Cancel Broadcast"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
