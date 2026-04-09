import React, { useState } from "react";
import { ChevronDown, Save } from "lucide-react";
import { queryClient } from "@/state/remote/client";
import {
  useCapabilities,
  useCapabilityMetadataById,
  useSetCapabilityMetadata,
  useCapabilityCompliance,
} from "@/state/remote/queries/capabilities";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Metadata editor ───────────────────────────────────────────────────────────

function MetadataEditor({ capabilityId }: { capabilityId: string }) {
  const toast = useToast();
  const { data: metadataData, isFetched: metaFetched } =
    useCapabilityMetadataById(capabilityId);
  const { data: complianceData, isFetched: compFetched } =
    useCapabilityCompliance(capabilityId);
  const setMetadata = useSetCapabilityMetadata();

  const [jsonText, setJsonText] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState("");

  // Initialise editor text once metadata loads
  React.useEffect(() => {
    if (metaFetched && jsonText === null) {
      const initial =
        metadataData !== undefined && metadataData !== null
          ? JSON.stringify(metadataData, null, 2)
          : "{}";
      setJsonText(initial);
    }
  }, [metaFetched, metadataData]);

  const raw: any = complianceData ?? {};
  const categories: any[] = raw.categories ?? raw.items ?? [];

  function handleSave() {
    if (jsonText === null) return;
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setJsonError("Invalid JSON");
      return;
    }
    setJsonError("");
    setMetadata.mutate(
      { capabilityId, metadata: parsed },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["capabilities", "metadata-raw", capabilityId],
          });
          queryClient.invalidateQueries({
            queryKey: ["capabilities", "compliance", capabilityId],
          });
          toast.success("Metadata updated");
        },
        onError: () => {
          toast.error("Could not update metadata");
        },
      },
    );
  }

  if (!metaFetched) {
    return (
      <div className="pt-3 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-24 w-full rounded-[6px]" />
      </div>
    );
  }

  return (
    <div className="pt-3 space-y-3">
      {/* Compliance status */}
      {compFetched && categories.length > 0 && (
        <div className="space-y-1">
          <SectionLabel className="block mb-1">Compliance</SectionLabel>
          {categories.map((cat: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <Badge
                variant={
                  (cat.status ?? "").toLowerCase() === "compliant"
                    ? "soft-success"
                    : (cat.status ?? "").toLowerCase() === "noncompliant"
                    ? "destructive"
                    : "soft-warning"
                }
                className="text-[10px]"
              >
                {cat.status ?? "Unknown"}
              </Badge>
              <span className="text-secondary font-mono">
                {cat.categoryName ??
                  cat.displayName ??
                  cat.name ??
                  `Category ${i + 1}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* JSON editor */}
      <div>
        <SectionLabel className="block mb-1">Metadata JSON</SectionLabel>
        <textarea
          value={jsonText ?? ""}
          onChange={(e) => {
            setJsonText(e.target.value);
            setJsonError("");
          }}
          rows={8}
          className={cn(
            "w-full text-xs font-mono p-2 border rounded-[6px] bg-background text-primary resize-y focus:outline-none focus:ring-1 focus:ring-action",
            jsonError ? "border-destructive" : "border-input",
          )}
          spellCheck={false}
        />
        {jsonError && (
          <p className="text-xs text-destructive mt-1 font-mono">{jsonError}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={setMetadata.isPending || jsonText === null}
        >
          <Save size={13} strokeWidth={1.75} className="mr-1.5" />
          {setMetadata.isPending ? "Saving…" : "Save Metadata"}
        </Button>
      </div>
    </div>
  );
}

// ── Capability row ────────────────────────────────────────────────────────────

function CapabilityRow({ capability }: { capability: any }) {
  const [expanded, setExpanded] = useState(false);
  const [triggered, setTriggered] = useState(false);

  function handleClick() {
    if (!triggered) setTriggered(true);
    setExpanded((e) => !e);
  }

  const statusVariant =
    capability.status === "Active"
      ? "soft-success"
      : capability.status === "Pending Deletion"
      ? "soft-warning"
      : "outline";

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
        <Badge
          variant={statusVariant}
          className="text-[10px] shrink-0 hidden sm:inline-flex"
        >
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
        <div className="px-4 pb-4 border-t border-card bg-surface-muted/40">
          {triggered && <MetadataEditor capabilityId={capability.id} />}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BulkMetadataPage() {
  const { data: capsData, isFetched } = useCapabilities();
  const [search, setSearch] = useState("");

  const capabilities: any[] = (capsData as any[]) ?? [];
  const filtered = capabilities.filter(
    (c: any) => !search || c.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="Metadata Remediation"
        subtitle="View and update metadata for capabilities across the platform."
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
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-card rounded-[8px] p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-48 flex-1" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <EmptyState>
            {search
              ? "No capabilities match your search."
              : "No capabilities found."}
          </EmptyState>
        ) : (
          filtered.map((cap: any) => (
            <CapabilityRow key={cap.id} capability={cap} />
          ))
        )}
      </div>
    </div>
  );
}
