import React, { useEffect, useId, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useCopilotUserSearch,
  type CopilotUserSummary,
} from "@/state/remote/queries/copilot";

interface CopilotUserPickerProps {
  onSelect: (login: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function CopilotUserPicker({
  onSelect,
  placeholder = "View another user…",
  ariaLabel = "View another user's Copilot usage",
}: CopilotUserPickerProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const q = useDebounce(inputValue.trim());
  const search = useCopilotUserSearch(q);
  const items: CopilotUserSummary[] =
    q.length >= 2 ? search.data?.items ?? [] : [];

  useEffect(() => setActive(0), [q]);

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

  function pick(u: CopilotUserSummary) {
    setInputValue("");
    setOpen(false);
    onSelect(u.login);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || items.length === 0) {
      if (e.key === "ArrowDown") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(items[Math.min(active, items.length - 1)]);
    }
  }

  let status: string | null = null;
  if (q.length < 2) {
    status = "Type a GitHub login, name or email.";
  } else if (search.isError || search.data?.meta.copilotAvailable === false) {
    status = "User search is unavailable right now.";
  } else if (items.length === 0 && !search.isFetching) {
    status = "No GitHub users match this search.";
  }

  const showList = open && (items.length > 0 || status !== null);
  const optionId = (i: number) => `${listId}-option-${i}`;

  return (
    <div ref={containerRef} className="relative w-full sm:w-[320px]">
      <div className="relative">
        <Search
          size={14}
          strokeWidth={1.75}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <Input
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && items.length > 0 ? optionId(active) : undefined
          }
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="text-sm font-mono pl-8 pr-8"
          autoComplete="off"
          spellCheck={false}
        />
        {search.isFetching && (
          <Loader2
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted animate-spin"
            aria-hidden="true"
          />
        )}
      </div>

      {showList && (
        <div
          id={listId}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 border border-card rounded-[8px] bg-surface shadow-overlay z-50 overflow-hidden max-h-80 overflow-y-auto animate-menu-enter"
        >
          {items.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted font-mono">{status}</p>
          ) : (
            items.map((u, i) => (
              <button
                key={u.login}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(u)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer border-0 ${
                  i === active ? "bg-surface-muted" : "bg-transparent"
                }`}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm text-primary font-medium truncate">
                    {u.name || `@${u.login}`}
                  </span>
                  <span className="text-xs text-muted font-mono truncate">
                    @{u.login}
                    {u.primaryEmail && ` · ${u.primaryEmail}`}
                  </span>
                </div>
                {u.seated && <Badge variant="soft-success">Seated</Badge>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
