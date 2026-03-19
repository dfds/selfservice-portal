import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  useCapabilities,
  useCapabilityCompliance,
} from "@/state/remote/queries/capabilities";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { statusIcon, complianceStatusVariant } from "@/lib/statusUtils";
import { cn } from "@/lib/utils";

// ── Compliance row ────────────────────────────────────────────────────────────

function CapabilityComplianceContent({ capabilityId }: { capabilityId: string }) {
  const { data, isFetched } = useCapabilityCompliance(capabilityId);
  const navigate = useNavigate();

  if (!isFetched) {
    return (
      <div className="pt-3 space-y-1.5">
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

  const raw: any = data ?? {};
  // Try common shapes: { categories: [{name, status}] } or { items: [] } or flat object
  const categories: any[] = raw.categories ?? raw.items ?? [];

  return (
    <div className="pt-3">
      {categories.length > 0 ? (
        <div className="space-y-1.5">
          {categories.map((cat: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              {statusIcon(cat.status ?? cat.complianceStatus ?? "")}
              <span className="text-xs text-secondary flex-1">
                {cat.categoryName ?? cat.displayName ?? cat.name ?? cat.category ?? `Category ${i + 1}`}
              </span>
              {cat.score != null && (
                <span className="text-[10px] text-muted font-mono">{cat.score}%</span>
              )}
              <Badge
                variant={complianceStatusVariant(cat.status ?? cat.complianceStatus ?? "")}
                className="text-[10px]"
              >
                {cat.status ?? cat.complianceStatus ?? "Unknown"}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted font-mono">No compliance data available.</p>
      )}
      <button
        type="button"
        onClick={() => navigate(`/admin/capabilities/${capabilityId}`)}
        className="mt-3 text-xs text-action hover:underline font-mono cursor-pointer border-0 bg-transparent p-0"
      >
        View Admin Detail →
      </button>
    </div>
  );
}

function CapabilityRow({ capability }: { capability: any }) {
  const [expanded, setExpanded] = useState(false);
  const [triggered, setTriggered] = useState(false);

  function handleClick() {
    if (!triggered) setTriggered(true);
    setExpanded((e) => !e);
  }

  const statusBadgeVariant =
    capability.status === "Active" ? "soft-success" :
    capability.status === "Pending Deletion" ? "soft-warning" :
    "outline";

  return (
    <div className="border border-card rounded-[8px] overflow-hidden">
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-muted transition-colors bg-transparent border-0 cursor-pointer"
      >
        <span className="flex-1 min-w-0 text-sm font-medium text-primary truncate">
          {capability.name}
        </span>
        <Badge variant={statusBadgeVariant} className="text-[10px] shrink-0 hidden sm:inline-flex">
          {capability.status}
        </Badge>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          className={cn(
            "text-muted transition-transform duration-200 flex-shrink-0",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-card bg-surface-muted/40">
          {triggered && (
            <CapabilityComplianceContent capabilityId={capability.id} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCompliancePage() {
  const { data: capabilities, isFetched } = useCapabilities();
  const [search, setSearch] = useState("");

  const caps: any[] = ((capabilities as any[]) ?? []).filter(
    (c: any) =>
      !search || c.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="Compliance"
        subtitle="Per-capability compliance breakdown. Expand to drill into categories."
      />

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Filter capabilities…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm max-w-sm"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {!isFetched ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-card rounded-[8px] p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-48 flex-1" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </div>
          ))
        ) : caps.length === 0 ? (
          <EmptyState>
            {search ? "No capabilities match your search." : "No capabilities found."}
          </EmptyState>
        ) : (
          caps.map((cap: any) => (
            <CapabilityRow key={cap.id} capability={cap} />
          ))
        )}
      </div>
    </div>
  );
}
