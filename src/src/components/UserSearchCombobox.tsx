import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import {
  useTenantUserSearch,
  type GraphUser,
} from "@/state/remote/queries/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type { GraphUser };

interface UserSearchComboboxProps {
  onSelect: (userId: string, label: string) => void;
  submitLabel?: string;
}

export function UserSearchCombobox({
  onSelect,
  submitLabel = "Search",
}: UserSearchComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  const { data: suggestions = [], isFetching } =
    useTenantUserSearch(debouncedQuery);

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
                <span className="text-sm text-primary font-medium">
                  {user.displayName}
                </span>
                <span className="text-xs text-muted font-mono">
                  {user.mail ?? user.userPrincipalName}
                </span>
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
        {submitLabel}
      </Button>
    </div>
  );
}
