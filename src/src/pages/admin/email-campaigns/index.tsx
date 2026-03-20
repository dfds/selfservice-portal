import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { queryClient } from "@/state/remote/client";
import {
  useEmailCampaigns,
  useDeleteEmailCampaign,
  useSendEmailCampaign,
  useCancelEmailCampaign,
  useDuplicateEmailCampaign,
} from "@/state/remote/queries/emailCampaigns";
import { CampaignStatusBadge } from "./components/campaign-status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ListPageContent } from "@/components/ui/ListPageContent";
import { SkeletonCampaignRow } from "@/components/ui/skeleton";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { useMutationToast } from "@/hooks/useMutationToast";
import { TabGroup } from "@/components/ui/TabGroup";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/PaginationControls";
import {
  Plus,
  Trash2,
  Pencil,
  Send,
  Eye,
  Ban,
  Copy,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type StatusTab =
  | "all"
  | "Draft"
  | "Scheduled"
  | "Sent"
  | "Failed"
  | "Cancelled";

type SortField = "name" | "createdBy" | "createdAt" | "modifiedAt";

let _savedTab: StatusTab = "all";
const PAGE_SIZE = 15;

export default function EmailCampaignsPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>(_savedTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("modifiedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const { data, isFetched } = useEmailCampaigns(statusFilter);
  const deleteCampaign = useDeleteEmailCampaign();
  const navigate = useNavigate();
  const [sendTarget, setSendTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<any>(null);

  const allCampaigns = (data || []) as any[];
  const campaigns = statusFilter
    ? allCampaigns.filter((b: any) => b.status === statusFilter)
    : allCampaigns;

  const searchedCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase().trim();
    return campaigns.filter((c: any) => {
      if (c.name?.toLowerCase().includes(q)) return true;
      if (c.subject?.toLowerCase().includes(q)) return true;
      const bodyText =
        c.contentHtml?.replace(/<[^>]*>/g, "")?.toLowerCase() ?? "";
      if (bodyText.includes(q)) return true;
      if (c.createdBy?.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [campaigns, searchQuery]);

  const sortedCampaigns = useMemo(() => {
    const arr = [...searchedCampaigns];
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "name") {
      arr.sort((a, b) => dir * (a.name ?? "").localeCompare(b.name ?? ""));
    } else if (sortBy === "createdBy") {
      arr.sort(
        (a, b) => dir * (a.createdBy ?? "").localeCompare(b.createdBy ?? ""),
      );
    } else if (sortBy === "createdAt") {
      arr.sort(
        (a, b) =>
          dir *
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      );
    } else if (sortBy === "modifiedAt") {
      arr.sort(
        (a, b) =>
          dir *
          (new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime()),
      );
    }
    return arr;
  }, [searchedCampaigns, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedCampaigns.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sortedCampaigns.slice(pageStart, pageStart + PAGE_SIZE);

  const tabs: StatusTab[] = [
    "all",
    "Draft",
    "Scheduled",
    "Sent",
    "Failed",
    "Cancelled",
  ];

  const handleTabChange = (tab: StatusTab) => {
    _savedTab = tab;
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: SortField) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSortDirToggle = () => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
  };

  const deleteConfirm = useConfirmAction({
    mutation: deleteCampaign,
    buildPayload: (b: any) => ({ id: b.id }),
    invalidateKeys: [["emailCampaigns"]],
    successMessage: "Campaign deleted",
    errorMessage: "Could not delete campaign",
  });

  return (
    <div className="px-5 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.25rem] font-bold text-primary">
            Email Campaigns
          </h1>
          <p className="text-[13px] text-muted mt-1">
            Create and manage email campaigns to capability members.
          </p>
        </div>
        <Button
          variant="action"
          className="gap-1.5"
          onClick={() => navigate("/admin/email-campaigns/create")}
        >
          <Plus size={14} />
          New Campaign
        </Button>
      </div>

      <TabGroup
        variant="underline"
        tabs={tabs.map((t) => ({ id: t, label: t === "all" ? "All" : t }))}
        value={activeTab}
        onChange={handleTabChange}
        className="mb-4"
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortField)}
            className="px-2 py-2 text-sm border border-divider rounded-[5px] bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="modifiedAt">Last Modified</option>
            <option value="createdAt">Created</option>
            <option value="name">Title</option>
            <option value="createdBy">Created By</option>
          </select>
          <button
            onClick={handleSortDirToggle}
            className="shrink-0 flex items-center justify-center px-3 py-2 border border-divider rounded-[5px] bg-surface text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            aria-label={
              sortDir === "asc" ? "Sort descending" : "Sort ascending"
            }
          >
            {sortDir === "asc" ? (
              <ArrowUp size={14} />
            ) : (
              <ArrowDown size={14} />
            )}
          </button>
          {isFetched && (
            <span className="text-[11px] text-muted font-mono whitespace-nowrap ml-1">
              {sortedCampaigns.length} campaign
              {sortedCampaigns.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <ListPageContent
        isFetched={isFetched}
        items={pageItems}
        renderItem={(b: any, i: number) => (
          <CampaignRow
            key={b.id}
            campaign={b}
            index={i}
            onEdit={() => navigate(`/admin/email-campaigns/edit/${b.id}`)}
            onDelete={() => deleteConfirm.setTarget(b)}
            onSend={() => setSendTarget(b)}
            onCancel={() => setCancelTarget(b)}
            onView={() => navigate(`/admin/email-campaigns/${b.id}`)}
          />
        )}
        skeletonCount={4}
        renderSkeleton={(i) => <SkeletonCampaignRow key={i} />}
        emptyMessage={
          searchQuery.trim()
            ? "No campaigns match your search."
            : "No campaigns found. Create your first campaign to get started."
        }
      />

      {isFetched && sortedCampaigns.length > PAGE_SIZE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageStart={pageStart}
          pageSize={PAGE_SIZE}
          total={sortedCampaigns.length}
          onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        />
      )}

      <ConfirmDialog
        {...deleteConfirm.dialogProps}
        title="Delete campaign?"
        description={
          <p>
            Are you sure you want to delete{" "}
            <strong>{deleteConfirm.target?.name}</strong>? This cannot be
            undone.
          </p>
        }
        confirmLabel="Delete"
      />

      {sendTarget && (
        <SendConfirmDialog
          campaign={sendTarget}
          open={!!sendTarget}
          onOpenChange={() => setSendTarget(null)}
        />
      )}

      {cancelTarget && (
        <CancelConfirmDialog
          campaign={cancelTarget}
          open={!!cancelTarget}
          onOpenChange={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

function CampaignRow({
  campaign,
  index,
  onEdit,
  onDelete,
  onSend,
  onCancel,
  onView,
}: {
  campaign: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
  onCancel: () => void;
  onView: () => void;
}) {
  const duplicateCampaign = useDuplicateEmailCampaign(campaign.id);
  const navigate = useNavigate();

  const fireDuplicate = useMutationToast(duplicateCampaign, {
    invalidateKeys: [["emailCampaigns"]],
    successMessage: "Campaign duplicated",
    errorMessage: "Could not duplicate campaign",
    onSuccess: (data: any) => {
      if (data?.id) {
        navigate(`/admin/email-campaigns/edit/${data.id}`);
      }
    },
  });

  const scheduleInfo =
    campaign.scheduleType === "Scheduled" && campaign.scheduledAt
      ? `Scheduled: ${new Date(campaign.scheduledAt).toLocaleString()}`
      : campaign.scheduleType === "Recurring" && campaign.cronExpression
      ? `Cron: ${campaign.cronExpression}`
      : null;

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg border border-card bg-surface hover:shadow-card transition-shadow animate-card-enter"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex-1 min-w-0">
        <Link
          to={`/admin/email-campaigns/${campaign.id}`}
          className="text-[13px] font-medium text-primary hover:text-action no-underline truncate block"
        >
          {campaign.name}
        </Link>
        <span className="text-[11px] text-muted font-mono">
          {campaign.subject}
        </span>
        {scheduleInfo && (
          <span className="text-[10px] text-action font-mono block mt-0.5">
            {scheduleInfo}
          </span>
        )}
        <span className="text-[10px] text-muted block mt-0.5">
          {campaign.createdBy && (
            <>
              <span className="font-mono">
                {campaign.createdBy.split("@")[0]}
              </span>
              {" \u00B7 "}
            </>
          )}
          Created {new Date(campaign.createdAt).toLocaleDateString()}
          {campaign.modifiedAt !== campaign.createdAt && (
            <>
              {" \u00B7 "}
              Modified {new Date(campaign.modifiedAt).toLocaleDateString()}
            </>
          )}
        </span>
      </div>
      <CampaignStatusBadge status={campaign.status} />
      <div className="flex gap-1">
        {campaign.status === "Draft" && (
          <>
            <IconButton
              size="sm"
              colorScheme="action"
              onClick={onEdit}
              title="Edit"
            >
              <Pencil size={14} />
            </IconButton>
            <IconButton
              size="sm"
              colorScheme="action"
              onClick={onSend}
              title="Send Now"
            >
              <Send size={14} />
            </IconButton>
            <IconButton
              size="sm"
              colorScheme="action"
              onClick={() => fireDuplicate(undefined)}
              title="Duplicate"
              disabled={duplicateCampaign.isPending}
            >
              <Copy size={14} />
            </IconButton>
            <IconButton
              size="sm"
              colorScheme="destructive"
              onClick={onDelete}
              title="Delete"
            >
              <Trash2 size={14} />
            </IconButton>
          </>
        )}
        {campaign.status === "Scheduled" && (
          <>
            <IconButton
              size="sm"
              colorScheme="action"
              onClick={onView}
              title="View Details"
            >
              <Eye size={14} />
            </IconButton>
            <IconButton
              size="sm"
              colorScheme="action"
              onClick={() => fireDuplicate(undefined)}
              title="Duplicate"
              disabled={duplicateCampaign.isPending}
            >
              <Copy size={14} />
            </IconButton>
            <IconButton
              size="sm"
              colorScheme="destructive"
              onClick={onCancel}
              title="Cancel"
            >
              <Ban size={14} />
            </IconButton>
          </>
        )}
        {(campaign.status === "Sent" || campaign.status === "Failed") && (
          <>
            <IconButton
              size="sm"
              colorScheme="action"
              onClick={onView}
              title="View Details"
            >
              <Eye size={14} />
            </IconButton>
            <IconButton
              size="sm"
              colorScheme="action"
              onClick={() => fireDuplicate(undefined)}
              title="Duplicate as new draft"
              disabled={duplicateCampaign.isPending}
            >
              <Copy size={14} />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
}

function SendConfirmDialog({
  campaign,
  open,
  onOpenChange,
}: {
  campaign: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const sendCampaign = useSendEmailCampaign(campaign.id);

  const fireSend = useMutationToast(sendCampaign, {
    invalidateKeys: [["emailCampaigns"]],
    successMessage: (data: any) =>
      `Campaign sent to ${data?.totalRecipients || 0} recipients`,
    errorMessage: "Could not send campaign",
    onSuccess: () => onOpenChange(false),
    onError: () => onOpenChange(false),
  });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Send campaign now?"
      description={
        <p>
          This will send <strong>{campaign.name}</strong> to all matching
          recipients immediately. This action cannot be undone.
        </p>
      }
      confirmLabel="Send Now"
      confirmLoadingLabel="Sending…"
      isPending={sendCampaign.isPending}
      onConfirm={() => fireSend(undefined)}
    />
  );
}

function CancelConfirmDialog({
  campaign,
  open,
  onOpenChange,
}: {
  campaign: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const cancelCampaign = useCancelEmailCampaign(campaign.id);

  const fireCancel = useMutationToast(cancelCampaign, {
    invalidateKeys: [["emailCampaigns"]],
    successMessage: "Campaign cancelled",
    errorMessage: "Could not cancel campaign",
    onSuccess: () => onOpenChange(false),
    onError: () => onOpenChange(false),
  });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel scheduled campaign?"
      description={
        <p>
          This will cancel <strong>{campaign.name}</strong>.{" "}
          {campaign.scheduleType === "Recurring"
            ? "No further recurring executions will run."
            : "The campaign will not be sent."}
        </p>
      }
      confirmLabel="Cancel Campaign"
      confirmLoadingLabel="Cancelling…"
      cancelLabel="Keep"
      isPending={cancelCampaign.isPending}
      onConfirm={() => fireCancel(undefined)}
    />
  );
}
