import React, { useState, useRef, useEffect } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { msGraphRequest } from "@/state/remote/query";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { ssuRequest } from "@/state/remote/query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

type GraphUser = {
  id: string;
  displayName: string;
  mail: string | null;
  userPrincipalName: string;
};

// ── User search combobox ───────────────────────────────────────────────────────

function UserSearchCombobox({
  onSelect,
}: {
  onSelect: (userId: string, label: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  const { data: suggestions = [], isFetching } = useQuery<GraphUser[]>({
    queryKey: ["graph-user-search-members", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];
      const safe = debouncedQuery.replace(/'/g, "''");
      const filter = `startswith(mail,'${safe}') or startswith(displayName,'${safe}')`;
      const url = `https://graph.microsoft.com/v1.0/users?$filter=${encodeURIComponent(filter)}&$select=id,displayName,mail,userPrincipalName&$top=8`;
      const resp = await msGraphRequest({ method: "GET", url, payload: null });
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.value ?? []) as GraphUser[];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSelect(user: GraphUser) {
    const userId = user.mail ?? user.userPrincipalName;
    const label = `${user.displayName} (${userId})`;
    setInputValue("");
    setDebouncedQuery("");
    setShowDropdown(false);
    onSelect(userId, label);
  }

  function handleSubmitManual(e: React.FormEvent) {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;
    setInputValue("");
    setDebouncedQuery("");
    setShowDropdown(false);
    onSelect(val, val);
  }

  return (
    <div ref={containerRef} className="relative flex gap-2">
      <div className="relative flex-1">
        <Input
          placeholder="Search by name or email…"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
          className="text-sm font-mono pr-8"
          autoComplete="off"
        />
        {isFetching && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <div className="h-3 w-3 rounded-full border-2 border-muted border-t-action animate-spin" />
          </div>
        )}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 border border-card rounded-[8px] bg-background shadow-card z-50 overflow-hidden">
            {suggestions.map((user) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(user)}
                className="w-full flex flex-col px-3 py-2 text-left hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent"
              >
                <span className="text-sm text-primary font-medium">{user.displayName}</span>
                <span className="text-xs text-muted font-mono">{user.mail ?? user.userPrincipalName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={!inputValue.trim()}
        onClick={handleSubmitManual}
      >
        <Search size={14} strokeWidth={1.75} className="mr-1.5" />
        Search
      </Button>
    </div>
  );
}

// ── Member search results ──────────────────────────────────────────────────────

function MemberSearchResults({
  userId,
  capabilities,
}: {
  userId: string;
  capabilities: any[];
}) {
  const memberQueries = useQueries({
    queries: capabilities.map((cap) => ({
      queryKey: ["capabilities", "members", cap.id],
      queryFn: async () =>
        ssuRequest({
          method: "GET",
          urlSegments: ["capabilities", cap.id, "members"],
          payload: null,
          isCloudEngineerEnabled: true,
        }),
      select: (data: any) => data?.items ?? (Array.isArray(data) ? data : []),
    })),
  });

  const allFetched = memberQueries.every((q) => q.isFetched);
  const totalFetched = memberQueries.filter((q) => q.isFetched).length;

  const matched: Array<{ cap: any; member: any }> = [];
  memberQueries.forEach((q, i) => {
    if (!q.data) return;
    const members: any[] = q.data as any[];
    const found = members.find(
      (m: any) =>
        (m.email ?? m.userId ?? m.id ?? "").toLowerCase() === userId.toLowerCase(),
    );
    if (found) {
      matched.push({ cap: capabilities[i], member: found });
    }
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs text-muted font-mono">
          {allFetched
            ? `Searched ${capabilities.length} capabilities`
            : `Searching… ${totalFetched}/${capabilities.length}`}
        </p>
        {!allFetched && (
          <div className="h-3 w-3 rounded-full border-2 border-muted border-t-action animate-spin" />
        )}
        {allFetched && matched.length > 0 && (
          <Badge variant="soft-success" className="text-xs">
            {matched.length} {matched.length === 1 ? "capability" : "capabilities"}
          </Badge>
        )}
      </div>

      {allFetched && matched.length === 0 && (
        <EmptyState>No capability memberships found for this user.</EmptyState>
      )}

      <div className="space-y-2">
        {matched.map(({ cap }) => (
          <div
            key={cap.id}
            className="border border-card rounded-[8px] px-4 py-3 flex items-center gap-3"
          >
            <span className="flex-1 text-sm font-medium text-primary">{cap.name}</span>
            {cap.status && (
              <Badge
                variant={
                  cap.status === "Active"
                    ? "soft-success"
                    : cap.status === "Pending Deletion"
                      ? "soft-warning"
                      : "outline"
                }
                className="text-[10px] shrink-0"
              >
                {cap.status}
              </Badge>
            )}
          </div>
        ))}
        {!allFetched &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-card rounded-[8px] p-4">
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MemberSearchPage() {
  const [searchedUserId, setSearchedUserId] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const { data: capabilitiesData } = useCapabilities();
  const capabilities: any[] = (capabilitiesData as any[]) ?? [];

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
    <div className="px-5 md:px-8 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1.5">
          // Admin
        </div>
        <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0]">
          Member Search
        </h1>
        <p className="text-sm text-muted mt-1">
          Find all capabilities a user belongs to across the platform.
        </p>
      </div>

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
      {searchActive && capabilities.length > 0 && (
        <div className="animate-fade-up">
          <MemberSearchResults userId={searchedUserId} capabilities={capabilities} />
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
