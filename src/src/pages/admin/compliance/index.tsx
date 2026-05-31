import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCapabilities,
  useCapabilityCompliance,
} from "@/state/remote/queries/capabilities";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { ExpandableRow } from "@/components/ui/ExpandableRow";
import { ListPageContent } from "@/components/ui/ListPageContent";
import {
  statusIcon,
  complianceStatusVariant,
  capabilityStatusVariant,
} from "@/lib/statusUtils";

// ── Compliance row ────────────────────────────────────────────────────────────

function CapabilityComplianceContent({
  capabilityId,
}: {
  capabilityId: string;
}) {
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
  const categories: any[] = raw.categories ?? raw.items ?? [];

  return (
    <div className="pt-3">
      {categories.length > 0 ? (
        <div className="space-y-1.5">
          {categories.map((cat: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              {statusIcon(cat.status ?? cat.complianceStatus ?? "")}
              <span className="text-xs text-secondary flex-1">
                {cat.categoryName ??
                  cat.displayName ??
                  cat.name ??
                  cat.category ??
                  `Category ${i + 1}`}
              </span>
              {cat.score != null && (
                <span className="text-[10px] text-muted font-mono">
                  {cat.score}%
                </span>
              )}
              <Badge
                variant={complianceStatusVariant(
                  cat.status ?? cat.complianceStatus ?? "",
                )}
                className="text-[10px]"
              >
                {cat.status ?? cat.complianceStatus ?? "Unknown"}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted font-mono">
          No compliance data available.
        </p>
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
  return (
    <ExpandableRow
      header={
        <>
          <span className="flex-1 min-w-0 text-sm font-medium text-primary truncate">
            {capability.name}
          </span>
          <Badge
            variant={capabilityStatusVariant(capability.status)}
            className="text-[10px] shrink-0 hidden sm:inline-flex"
          >
            {capability.status}
          </Badge>
        </>
      }
    >
      <CapabilityComplianceContent capabilityId={capability.id} />
    </ExpandableRow>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCompliancePage() {
  const { data: capabilities, isFetched } = useCapabilities();
  const [search, setSearch] = useState("");

  const caps: any[] = ((capabilities as any[]) ?? []).filter(
    (c: any) => !search || c.name?.toLowerCase().includes(search.toLowerCase()),
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
      <ListPageContent
        isFetched={isFetched}
        items={caps}
        renderItem={(cap: any) => (
          <CapabilityRow key={cap.id} capability={cap} />
        )}
        skeletonCount={6}
        renderSkeleton={(i) => (
          <div key={i} className="border border-card rounded-[8px] p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-48 flex-1" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </div>
        )}
        emptyMessage={
          search
            ? "No capabilities match your search."
            : "No capabilities found."
        }
      />
    </div>
  );
}
