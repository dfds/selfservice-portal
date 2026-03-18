import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { queryClient } from "@/state/remote/client";
import {
  useEmailCampaign,
  useEmailCampaignExecutions,
  useEmailCampaignRecipients,
  useCancelEmailCampaign,
  useRetryFailedRecipients,
  useDuplicateEmailCampaign,
} from "@/state/remote/queries/emailCampaigns";
import { CampaignStatusBadge } from "./components/campaign-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton, SkeletonCampaignDetail } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Ban,
  Pencil,
  Clock,
  Repeat,
  Calendar,
  RefreshCw,
  Copy,
} from "lucide-react";
import { useState } from "react";

type RecipientTab = "all" | "Pending" | "Sent" | "Failed";

export default function EmailCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: campaign, isFetched } = useEmailCampaign(id || "");
  const { data: executions, isFetched: execFetched } =
    useEmailCampaignExecutions(id || "");
  const { data: recipients, isFetched: recipientsFetched } =
    useEmailCampaignRecipients(id || "");
  const cancelCampaign = useCancelEmailCampaign(id || "");
  const retryFailed = useRetryFailedRecipients(id || "");
  const duplicateCampaign = useDuplicateEmailCampaign(id || "");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [recipientTab, setRecipientTab] = useState<RecipientTab>("all");
  const [bodyExpanded, setBodyExpanded] = useState(
    campaign?.status === "Sent" || campaign?.status === "Failed",
  );

  const handleCancel = () => {
    cancelCampaign.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
        toast.success("Campaign cancelled");
        setCancelOpen(false);
      },
      onError: () => toast.error("Could not cancel campaign"),
    });
  };

  const handleRetry = () => {
    retryFailed.mutate(undefined, {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries({
          queryKey: ["emailCampaigns", "recipients", id],
        });
        toast.success(`Retrying ${data?.retriedCount || 0} failed recipients`);
      },
      onError: () => toast.error("Could not retry failed recipients"),
    });
  };

  const handleDuplicate = () => {
    duplicateCampaign.mutate(undefined, {
      onSuccess: (data: any) => {
        queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
        toast.success("Campaign duplicated as new draft");
        if (data?.id) {
          navigate(`/admin/email-campaigns/edit/${data.id}`);
        }
      },
      onError: () => toast.error("Could not duplicate campaign"),
    });
  };

  if (!isFetched) {
    return (
      <div className="px-5 md:px-8 py-6 max-w-4xl">
        <SkeletonCampaignDetail />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="px-5 md:px-8 py-6 max-w-4xl">
        <EmptyState>Campaign not found.</EmptyState>
      </div>
    );
  }

  const isScheduled = campaign.status === "Scheduled";
  const isRecurring = campaign.scheduleType === "Recurring";
  const hasSent =
    campaign.status === "Sent" || campaign.status === "Failed";
  const executionList = (executions || []) as any[];
  const recipientList = (recipients || []) as any[];

  const filteredRecipients =
    recipientTab === "all"
      ? recipientList
      : recipientList.filter((r: any) => r.status === recipientTab);

  const recipientStats = {
    total: recipientList.length,
    sent: recipientList.filter((r: any) => r.status === "Sent").length,
    failed: recipientList.filter((r: any) => r.status === "Failed").length,
    pending: recipientList.filter((r: any) => r.status === "Pending").length,
  };

  const recipientTabs: RecipientTab[] = ["all", "Pending", "Sent", "Failed"];

  return (
    <div className="px-5 md:px-8 py-6 max-w-4xl">
      <button
        type="button"
        onClick={() => navigate("/admin/email-campaigns")}
        className="flex items-center gap-1.5 text-[12px] text-muted hover:text-secondary mb-4 cursor-pointer bg-transparent border-0 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to campaigns
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[1.25rem] font-bold text-primary flex items-center gap-2">
            {campaign.name}
            <CampaignStatusBadge status={campaign.status} />
          </h1>
          <p className="text-[13px] text-muted mt-1 font-mono">
            {campaign.subject}
          </p>
        </div>
        <div className="flex gap-2">
          {campaign.status === "Draft" && (
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() =>
                navigate(`/admin/email-campaigns/edit/${campaign.id}`)
              }
            >
              <Pencil size={14} />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={handleDuplicate}
            disabled={duplicateCampaign.isPending}
          >
            <Copy size={14} />
            {duplicateCampaign.isPending ? "Duplicating..." : "Duplicate"}
          </Button>
          {isScheduled && (
            <Button
              variant="destructive"
              className="gap-1.5"
              onClick={() => setCancelOpen(true)}
            >
              <Ban size={14} />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <InfoCard label="Status" value={campaign.status} />
        <InfoCard label="Schedule Type" value={campaign.scheduleType} />
        <InfoCard
          label="Created"
          value={new Date(campaign.createdAt).toLocaleDateString()}
        />
        <InfoCard label="Created By" value={campaign.createdBy} />
      </div>

      {campaign.scheduleType === "Scheduled" && campaign.scheduledAt && (
        <Card className="mb-4">
          <CardContent className="py-3 px-4 flex items-center gap-2">
            <Calendar size={14} className="text-action" />
            <span className="text-[13px] text-secondary">
              Scheduled for{" "}
              <strong>
                {new Date(campaign.scheduledAt).toLocaleString()} UTC
              </strong>
            </span>
          </CardContent>
        </Card>
      )}

      {campaign.scheduleType === "Recurring" && campaign.cronExpression && (
        <Card className="mb-4">
          <CardContent className="py-3 px-4 flex items-center gap-2">
            <Repeat size={14} className="text-action" />
            <span className="text-[13px] text-secondary">
              Recurring:{" "}
              <code className="text-[12px] bg-surface-subtle px-1.5 py-0.5 rounded font-mono">
                {campaign.cronExpression}
              </code>
            </span>
          </CardContent>
        </Card>
      )}

      {campaign.sentAt && (
        <Card className="mb-4">
          <CardContent className="py-3 px-4 flex items-center gap-2">
            <Clock size={14} className="text-green-500" />
            <span className="text-[13px] text-secondary">
              Sent at{" "}
              <strong>{new Date(campaign.sentAt).toLocaleString()}</strong>
            </span>
          </CardContent>
        </Card>
      )}

      {campaign.contentHtml && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <SectionLabel className="block">Email Body</SectionLabel>
            <button
              type="button"
              onClick={() => setBodyExpanded((v) => !v)}
              className="text-[12px] text-muted hover:text-secondary cursor-pointer bg-transparent border-0"
            >
              {bodyExpanded ? "Hide" : "Show"}
            </button>
          </div>
          {bodyExpanded && (
            <div className="border border-card rounded-lg overflow-hidden">
              <iframe
                srcDoc={campaign.contentHtml}
                sandbox="allow-same-origin"
                className="w-full min-h-[400px] bg-white"
                title="Email body"
              />
            </div>
          )}
        </div>
      )}

      {hasSent && recipientsFetched && recipientList.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="py-3 px-4 text-center">
              <span className="text-[10px] font-mono uppercase text-muted block mb-1">
                Sent
              </span>
              <span className="text-[18px] font-bold text-green-600">
                {recipientStats.sent}
              </span>
              <span className="text-[11px] text-muted">
                {" "}
                / {recipientStats.total}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-4 text-center">
              <span className="text-[10px] font-mono uppercase text-muted block mb-1">
                Failed
              </span>
              <span className="text-[18px] font-bold text-red-500">
                {recipientStats.failed}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-4 text-center">
              <span className="text-[10px] font-mono uppercase text-muted block mb-1">
                Pending
              </span>
              <span className="text-[18px] font-bold text-amber-500">
                {recipientStats.pending}
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {hasSent && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel className="block">Recipient Log</SectionLabel>
            {recipientStats.failed > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-[12px]"
                onClick={handleRetry}
                disabled={retryFailed.isPending}
              >
                <RefreshCw
                  size={12}
                  className={retryFailed.isPending ? "animate-spin" : ""}
                />
                {retryFailed.isPending
                  ? "Retrying..."
                  : `Retry ${recipientStats.failed} Failed`}
              </Button>
            )}
          </div>

          <div className="flex gap-1 mb-3 border-b border-card">
            {recipientTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setRecipientTab(tab)}
                className={`px-3 py-2 text-[12px] font-medium border-b-2 -mb-px cursor-pointer bg-transparent transition-colors ${
                  recipientTab === tab
                    ? "border-action text-action"
                    : "border-transparent text-muted hover:text-secondary"
                }`}
              >
                {tab === "all"
                  ? `All (${recipientStats.total})`
                  : `${tab} (${
                      tab === "Sent"
                        ? recipientStats.sent
                        : tab === "Failed"
                          ? recipientStats.failed
                          : recipientStats.pending
                    })`}
              </button>
            ))}
          </div>

          {!recipientsFetched ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg border border-card"
                >
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : filteredRecipients.length === 0 ? (
            <EmptyState>No recipients found.</EmptyState>
          ) : (
            <div className="space-y-1">
              {filteredRecipients.map((r: any, i: number) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-card bg-surface animate-card-enter"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] text-primary block truncate">
                      {r.email}
                    </span>
                    <span className="text-[10px] text-muted font-mono">
                      {r.capabilityName}
                    </span>
                  </div>
                  <Badge
                    variant={
                      r.status === "Sent"
                        ? "success"
                        : r.status === "Failed"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {r.status}
                  </Badge>
                  {r.sentAt && (
                    <span className="text-[10px] text-muted whitespace-nowrap">
                      {new Date(r.sentAt).toLocaleString()}
                    </span>
                  )}
                  {r.errorMessage && (
                    <span
                      className="text-[10px] text-red-500 truncate max-w-[200px]"
                      title={r.errorMessage}
                    >
                      {r.errorMessage}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isRecurring && (
        <div className="mt-6">
          <SectionLabel className="mb-3 block">Execution History</SectionLabel>
          {!execFetched ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-lg border border-card"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              ))}
            </div>
          ) : executionList.length === 0 ? (
            <EmptyState>No executions yet.</EmptyState>
          ) : (
            <div className="space-y-2">
              {executionList.map((exec: any, i: number) => (
                <div
                  key={exec.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-card bg-surface animate-card-enter"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="text-[12px] text-secondary">
                    {new Date(exec.executedAt).toLocaleString()}
                  </span>
                  <Badge
                    variant={
                      exec.status === "Completed"
                        ? "success"
                        : exec.status === "PartialFailure"
                          ? "warning"
                          : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {exec.status}
                  </Badge>
                  <span className="text-[11px] text-muted font-mono ml-auto">
                    {exec.successCount}/{exec.totalRecipients} sent
                    {exec.failureCount > 0 && (
                      <span className="text-red-500 ml-1">
                        ({exec.failureCount} failed)
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel scheduled campaign?</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-secondary">
            This will cancel <strong>{campaign.name}</strong>.{" "}
            {isRecurring
              ? "No further recurring executions will run."
              : "The campaign will not be sent."}
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelCampaign.isPending}
              className="gap-1.5"
            >
              <Ban size={14} />
              {cancelCampaign.isPending ? "Cancelling..." : "Cancel Campaign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-3 px-4">
        <span className="text-[10px] font-mono uppercase text-muted block mb-1">
          {label}
        </span>
        <span className="text-[13px] text-primary font-medium">{value}</span>
      </CardContent>
    </Card>
  );
}
