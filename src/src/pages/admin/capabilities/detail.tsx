import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, Plus } from "lucide-react";
import { queryClient } from "@/state/remote/client";
import {
  useCapability,
  useCapabilityCompliance,
  useCapabilityMembers,
  useCapabilityAwsAccount,
  useCapabilityAzureResourcesById,
  useCapabilityKafkaAccess,
  useCancelCapabilityDeletion,
  useBypassJoinCapability,
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
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Skeleton } from "@/components/ui/skeleton";
import { statusIcon } from "@/lib/statusUtils";
import { cn } from "@/lib/utils";

type ResourceTab = "aws" | "azure" | "kafka";


function capabilityStatusVariant(status: string): "soft-success" | "soft-warning" | "destructive" | "outline" {
  if (status === "Active") return "soft-success";
  if (status === "Pending Deletion") return "soft-warning";
  if (status === "Deleted") return "destructive";
  return "outline";
}

// ── Sections ──────────────────────────────────────────────────────────────────

function ComplianceSection({ capabilityId }: { capabilityId: string }) {
  const { data, isFetched } = useCapabilityCompliance(capabilityId);
  const raw: any = data ?? {};
  const categories: any[] = raw.categories ?? raw.items ?? [];

  if (!isFetched) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-4 w-20 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return <p className="text-xs text-muted font-mono">No compliance data available.</p>;
  }

  return (
    <div className="space-y-1.5">
      {categories.map((cat: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          {statusIcon(cat.status ?? cat.complianceStatus ?? "")}
          <span className="text-sm text-secondary flex-1">
            {cat.categoryName ?? cat.displayName ?? cat.name ?? cat.category ?? `Category ${i + 1}`}
          </span>
          {cat.score != null && (
            <span className="text-[10px] text-muted font-mono">{cat.score}%</span>
          )}
          <Badge
            variant={
              (cat.status ?? "").toLowerCase() === "compliant" ? "soft-success" :
              (cat.status ?? "").toLowerCase() === "noncompliant" ? "destructive" :
              "soft-warning"
            }
            className="text-[10px]"
          >
            {cat.status ?? cat.complianceStatus ?? "Unknown"}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function MembersSection({ capabilityId }: { capabilityId: string }) {
  const toast = useToast();
  const { data, isFetched } = useCapabilityMembers(capabilityId);
  const members: any[] = (data as any[]) ?? [];
  const bypassJoin = useBypassJoinCapability();
  const [showBypass, setShowBypass] = useState(false);
  const [bypassUserId, setBypassUserId] = useState("");

  function handleBypassJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!bypassUserId.trim()) return;
    bypassJoin.mutate(
      { capabilityId, userId: bypassUserId.trim() },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["capabilities", "members", capabilityId] });
          toast.success("Member added");
          setBypassUserId("");
          setShowBypass(false);
        },
        onError: () => toast.error("Could not add member"),
      },
    );
  }

  if (!isFetched) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-56" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted font-mono">{members.length} {members.length === 1 ? "member" : "members"}</span>
        <button
          type="button"
          onClick={() => setShowBypass((v) => !v)}
          className="p-0.5 rounded text-muted hover:text-action transition-colors cursor-pointer border-0 bg-transparent"
          aria-label="Bypass add member"
        >
          <Plus size={12} strokeWidth={1.75} />
        </button>
      </div>
      {showBypass && (
        <form onSubmit={handleBypassJoin} className="flex gap-1.5">
          <input
            type="text"
            placeholder="User ID or email"
            value={bypassUserId}
            onChange={(e) => setBypassUserId(e.target.value)}
            className="flex-1 text-xs font-mono h-7 border border-input rounded-[4px] bg-background px-2 focus:outline-none focus:ring-1 focus:ring-action"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={!bypassUserId.trim() || bypassJoin.isPending}
            className="h-7 px-2 text-xs"
          >
            {bypassJoin.isPending ? "Adding…" : "Add"}
          </Button>
        </form>
      )}
      {members.length === 0 ? (
        <p className="text-xs text-muted font-mono">No members.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {members.map((m: any) => (
            <span key={m.id ?? m.userId} className="text-sm text-secondary font-mono text-xs">
              {m.email ?? m.userId ?? m.id}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AwsSection({ capabilityId }: { capabilityId: string }) {
  const { data, isFetched } = useCapabilityAwsAccount(capabilityId);
  const raw: any = data ?? {};

  if (!isFetched) return <Skeleton className="h-4 w-48" />;

  const accounts: any[] = raw.items ?? (Array.isArray(raw) ? raw : raw.id ? [raw] : []);

  if (accounts.length === 0) {
    return <p className="text-xs text-muted font-mono">No AWS account provisioned.</p>;
  }

  return (
    <div className="space-y-1.5">
      {accounts.map((acc: any, i: number) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-primary font-mono text-xs">{acc.accountId ?? acc.id}</span>
          {acc.status && (
            <Badge variant="outline" className="text-[10px]">{acc.status}</Badge>
          )}
          {acc.roleArn && (
            <span className="text-xs text-muted font-mono truncate max-w-xs">{acc.roleArn}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function AzureSection({ capabilityId }: { capabilityId: string }) {
  const { data, isFetched } = useCapabilityAzureResourcesById(capabilityId);
  const raw: any = data ?? {};
  const resources: any[] = raw.items ?? (Array.isArray(raw) ? raw : []);

  if (!isFetched) return <Skeleton className="h-4 w-48" />;

  if (resources.length === 0) {
    return <p className="text-xs text-muted font-mono">No Azure resources provisioned.</p>;
  }

  return (
    <div className="space-y-1.5">
      {resources.map((r: any, i: number) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-primary font-mono text-xs">
            {r.name ?? r.id ?? `Resource ${i + 1}`}
          </span>
          {r.environment && (
            <Badge variant="outline" className="text-[10px]">{r.environment}</Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function KafkaSection({ capabilityId }: { capabilityId: string }) {
  const { data, isFetched } = useCapabilityKafkaAccess(capabilityId);
  const raw: any = data ?? {};
  const access: any[] = raw.items ?? (Array.isArray(raw) ? raw : []);

  if (!isFetched) return <Skeleton className="h-4 w-48" />;

  if (access.length === 0) {
    return <p className="text-xs text-muted font-mono">No Kafka cluster access provisioned.</p>;
  }

  return (
    <div className="space-y-1.5">
      {access.map((a: any, i: number) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-secondary font-mono text-xs">
            {a.clusterName ?? a.kafkaClusterId ?? a.id ?? `Cluster ${i + 1}`}
          </span>
          {a.status && (
            <Badge variant="outline" className="text-[10px]">{a.status}</Badge>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CapabilityAdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { data: capability, isFetched } = useCapability(id ?? "");
  const cancelDeletion = useCancelCapabilityDeletion();
  const [resourceTab, setResourceTab] = useState<ResourceTab>("aws");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const cap: any = capability ?? {};
  const isPendingDeletion = cap.status === "Pending Deletion";

  function handleCancelDeletion() {
    cancelDeletion.mutate(
      { capabilityId: id! },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["capabilities", "list"] });
          queryClient.invalidateQueries({
            queryKey: ["capabilities", "details", id],
          });
          toast.success("Deletion cancelled");
          setShowCancelConfirm(false);
        },
        onError: () => {
          toast.error("Could not cancel deletion");
        },
      },
    );
  }

  const RESOURCE_TABS: { id: ResourceTab; label: string }[] = [
    { id: "aws", label: "AWS" },
    { id: "azure", label: "Azure" },
    { id: "kafka", label: "Kafka" },
  ];

  return (
    <div className="px-5 md:px-8 py-6">
      {/* Breadcrumb */}
      <div className="mb-4 text-xs font-mono text-muted">
        <Link to="/admin/compliance" className="hover:text-action no-underline">
          ← Compliance
        </Link>
      </div>

      {/* Header */}
      {!isFetched ? (
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      ) : (
        <div className="mb-6 animate-fade-up">
          <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-action mb-1.5">
            // Admin
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[1.75rem] font-bold text-primary">
              {cap.name}
            </h1>
            {cap.status && (
              <Badge
                variant={capabilityStatusVariant(cap.status)}
                className="text-xs"
              >
                {cap.status}
              </Badge>
            )}
            <Link
              to={`/capabilities/${id}`}
              className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-action no-underline font-mono"
            >
              Public view <ExternalLink size={11} />
            </Link>
          </div>
          {cap.description && (
            <p className="text-sm text-muted mt-1">{cap.description}</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Compliance */}
        <div className="border border-card rounded-[8px] p-4">
          <SectionLabel className="block mb-3">Compliance</SectionLabel>
          {id && <ComplianceSection capabilityId={id} />}
        </div>

        {/* Members */}
        <div className="border border-card rounded-[8px] p-4">
          <SectionLabel className="block mb-3">Members</SectionLabel>
          {id && <MembersSection capabilityId={id} />}
        </div>

        {/* Cloud Resources */}
        <div className="border border-card rounded-[8px] overflow-hidden">
          <div className="px-4 pt-4 pb-0">
            <SectionLabel className="block mb-3">Cloud Resources</SectionLabel>
            <div className="flex gap-1 p-1 bg-surface-muted rounded-[6px] w-fit">
              {RESOURCE_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setResourceTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer border-0",
                    resourceTab === t.id
                      ? "bg-white dark:bg-slate-700 text-primary shadow-card"
                      : "text-secondary hover:text-primary bg-transparent",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {id && resourceTab === "aws" && <AwsSection capabilityId={id} />}
            {id && resourceTab === "azure" && <AzureSection capabilityId={id} />}
            {id && resourceTab === "kafka" && <KafkaSection capabilityId={id} />}
          </div>
        </div>

        {/* Admin Actions */}
        <div className="border border-card rounded-[8px] p-4">
          <SectionLabel className="block mb-3">Admin Actions</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {isPendingDeletion && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Deletion
              </Button>
            )}
            <Link
              to="/admin/capabilities/metadata"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-input text-xs font-medium text-primary hover:bg-surface-muted transition-colors no-underline"
            >
              Set Required Metadata
              <ExternalLink size={11} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel deletion dialog */}
      <Dialog
        open={showCancelConfirm}
        onOpenChange={(open) => !open && setShowCancelConfirm(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel deletion?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-secondary">
            Cancel the deletion request for{" "}
            <span className="font-medium text-primary">{cap.name}</span>? This
            will restore the capability to Active status.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={cancelDeletion.isPending}
            >
              Keep Pending
            </Button>
            <Button
              variant="default"
              onClick={handleCancelDeletion}
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
