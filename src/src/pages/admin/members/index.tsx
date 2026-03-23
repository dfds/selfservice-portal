import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { useAllCapabilitiesWithMembers } from "@/state/remote/queries/capabilities";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { UserSearchCombobox } from "@/components/UserSearchCombobox";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MemberSearchPage() {
  const [searchedUserId, setSearchedUserId] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const { data: allCapabilities = [], isFetched } = useAllCapabilitiesWithMembers();

  const matched: any[] = searchActive
    ? (allCapabilities as any[]).filter((cap: any) =>
        (cap.members ?? []).some(
          (m: any) =>
            (m.email ?? "").toLowerCase() === searchedUserId.toLowerCase(),
        ),
      )
    : [];

  function handleSelect(userId: string, label: string) {
    setSearchedUserId(userId);
    setSelectedLabel(label);
    setSearchActive(true);
  }

  function handleClear() {
    setSearchedUserId("");
    setSelectedLabel("");
    setSearchActive(false);
  }

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="Member Search"
        subtitle="Find all capabilities a user belongs to across the platform."
      />

      {/* Search */}
      <div className="mb-6">
        {searchActive ? (
          <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-[6px] bg-background">
            <Search size={14} strokeWidth={1.75} className="text-muted flex-shrink-0" />
            <span className="text-sm font-mono flex-1 truncate">{selectedLabel}</span>
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded text-muted hover:text-primary transition-colors cursor-pointer border-0 bg-transparent"
              aria-label="Clear search"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <UserSearchCombobox onSelect={handleSelect} />
        )}
      </div>

      {/* Results */}
      {searchActive && (
        <div className="animate-fade-up">
          {!isFetched ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-card rounded-[8px] p-4">
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs text-muted font-mono">
                  Searched {(allCapabilities as any[]).length} capabilities
                </p>
                {matched.length > 0 && (
                  <Badge variant="soft-success" className="text-xs">
                    {matched.length} {matched.length === 1 ? "capability" : "capabilities"}
                  </Badge>
                )}
              </div>
              {matched.length === 0 ? (
                <EmptyState>No capability memberships found for this user.</EmptyState>
              ) : (
                <div className="space-y-2">
                  {matched.map((cap: any) => (
                    <div
                      key={cap.id}
                      className="border border-card rounded-[8px] px-4 py-3 flex items-center gap-3"
                    >
                      <span className="flex-1 min-w-0 text-sm font-medium text-primary truncate">{cap.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!searchActive && (
        <div className="flex flex-col items-center py-12 text-center gap-2">
          <Search size={32} strokeWidth={1.5} className="text-muted" />
          <EmptyState>
            Search for a user to find their capability memberships.
          </EmptyState>
        </div>
      )}
    </div>
  );
}
