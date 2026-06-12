import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { msGraphRequest } from "@/state/remote/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type GraphServicePrincipal = {
  id: string;
  appId: string;
  displayName: string;
};

interface ServicePrincipalSearchComboboxProps {
  onSelect: (sp: GraphServicePrincipal) => void;
  submitLabel?: string;
}

export function ServicePrincipalSearchCombobox({
  onSelect,
  submitLabel = "Search",
}: ServicePrincipalSearchComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  const { data: suggestions = [], isFetching } = useQuery<
    GraphServicePrincipal[]
  >({
    queryKey: ["graph-sp-search", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];
      const safe = debouncedQuery.replace(/'/g, "''");
      const filter = `startswith(displayName,'${safe}')`;
      const url = `https://graph.microsoft.com/v1.0/servicePrincipals?$filter=${encodeURIComponent(
        filter,
      )}&$select=id,appId,displayName&$top=20`;
      const resp = await msGraphRequest({ method: "GET", url, payload: null });
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.value ?? []) as GraphServicePrincipal[];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSelect(sp: GraphServicePrincipal) {
    setInputValue("");
    setDebouncedQuery("");
    setShowDropdown(false);
    onSelect(sp);
  }

  return (
    <div ref={containerRef} className="relative flex gap-2">
      <div className="relative flex-1">
        <Input
          placeholder="Search service principals by display name…"
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
          <div className="absolute top-full left-0 right-0 mt-1 border border-card rounded-[8px] bg-surface shadow-card z-50 overflow-hidden max-h-80 overflow-y-auto">
            {suggestions.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(sp)}
                className="w-full flex flex-col px-3 py-2 text-left hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent"
              >
                <span className="text-sm text-primary font-medium">
                  {sp.displayName}
                </span>
                <span className="text-xs text-muted font-mono">
                  oid: {sp.id}
                </span>
                {sp.appId && sp.appId !== sp.id && (
                  <span className="text-[0.6875rem] text-muted font-mono">
                    appId: {sp.appId}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        disabled
        title="Pick a service principal from the suggestions to add it."
      >
        <Search size={14} strokeWidth={1.75} className="mr-1.5" />
        {submitLabel}
      </Button>
    </div>
  );
}
