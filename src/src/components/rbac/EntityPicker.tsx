import React, { useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useSearchMembers,
  useTenantUserSearch,
  type MemberSummary,
  type MemberTypeFilter,
} from "@/state/remote/queries/rbac";
import { EntityTypeBadge } from "./EntityTypeBadge";

interface EntityPickerProps {
  typeFilter?: MemberTypeFilter;
  onSelect: (member: MemberSummary) => void;
  placeholder?: string;
  autoFocus?: boolean;
  // When set, also search the Azure AD tenant and surface users not yet in selfservice, tagged
  // `registered:false` (shown with an "Unregistered" chip). Intended for the Users tab.
  includeTenant?: boolean;
}

export function EntityPicker({
  typeFilter = "All",
  onSelect,
  placeholder = "Search by name or email…",
  autoFocus,
  includeTenant = false,
}: EntityPickerProps) {
  const [inputValue, setInputValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(inputValue.trim()), 250);
    return () => clearTimeout(t);
  }, [inputValue]);

  const query = useSearchMembers({
    type: typeFilter,
    search: debounced || undefined,
    limit: 10,
    offset: 0,
  });

  const tenantQuery = useTenantUserSearch(includeTenant ? debounced : "");

  const localItems: MemberSummary[] = query.data?.items ?? [];

  // Merge tenant matches that are not already local members (dedupe on lowercased id/email).
  const localKeys = new Set<string>();
  for (const m of localItems) {
    localKeys.add(m.id.toLowerCase());
    if (m.email) localKeys.add(m.email.toLowerCase());
  }
  const tenantItems: MemberSummary[] = includeTenant
    ? (tenantQuery.data ?? [])
        .map((u): MemberSummary => {
          const identifier = (u.mail ?? u.userPrincipalName) || "";
          return {
            id: identifier.toLowerCase(),
            email: identifier,
            displayName: u.displayName,
            type: "User",
            registered: false,
          };
        })
        .filter(
          (u) =>
            u.id &&
            !localKeys.has(u.id) &&
            !localKeys.has(u.email.toLowerCase()),
        )
    : [];

  const items: MemberSummary[] = [...localItems, ...tenantItems];
  const isFetching = query.isFetching || tenantQuery.isFetching;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handlePick(m: MemberSummary) {
    setInputValue("");
    setDebounced("");
    setOpen(false);
    onSelect(m);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={14}
          strokeWidth={1.75}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <Input
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="text-sm font-mono pl-8 pr-8"
          autoComplete="off"
        />
        {isFetching && (
          <Loader2
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted animate-spin"
            aria-hidden="true"
          />
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-card rounded-[8px] bg-surface shadow-overlay z-50 overflow-hidden max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted font-mono">
              {debounced
                ? "No members match this search."
                : "Type to search for members."}
            </p>
          ) : (
            items.map((m) => (
              <button
                key={m.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePick(m)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent"
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm text-primary font-medium truncate">
                    {m.displayName || m.email}
                  </span>
                  <span className="text-xs text-muted font-mono truncate">
                    {m.email}
                  </span>
                </div>
                {m.registered === false ? (
                  <Badge variant="unregistered">Unregistered</Badge>
                ) : (
                  <EntityTypeBadge kind={m.type} />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
