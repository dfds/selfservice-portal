import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  FACET_KEYS,
  FACET_LABELS,
  toggleFacetValue,
  emptyFacets,
  type FacetKey,
  type Facets,
  type Option,
} from "./filtering";

type FacetOptions = Record<FacetKey, Option[]>;

function facetDisabled(
  key: FacetKey,
  options: FacetOptions,
  depsLoading: boolean,
): boolean {
  if (options[key].length > 0) return false;
  return !(key === "connects" && depsLoading);
}

export function AddFilterButton({
  facets,
  options,
  onChange,
  depsLoading = false,
}: {
  facets: Facets;
  options: FacetOptions;
  onChange: (next: Facets) => void;
  depsLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<FacetKey | null>(null);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        // Escape backs out of the value pane first, then closes.
        setActive((a) => {
          if (a) return null;
          setOpen(false);
          return null;
        });
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Reset to the dimension pane whenever the popover closes.
  useEffect(() => {
    if (!open) {
      setActive(null);
      setQuery("");
    }
  }, [open]);

  const activeOptions = active ? options[active] : [];
  const visibleOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeOptions;
    return activeOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [activeOptions, query]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 h-[34px] px-3 text-[0.8125rem] rounded-[6px] border border-input bg-surface text-secondary hover:text-primary transition-colors cursor-pointer",
        )}
      >
        <Plus size={13} />
        <span>Add filter</span>
        <ChevronDown
          size={13}
          className={cn(
            "text-muted transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 min-w-[240px] max-w-[340px] rounded-[8px] border border-card bg-surface shadow-overlay animate-menu-enter">
          {active === null ? (
            <div className="max-h-[320px] overflow-y-auto p-1">
              {FACET_KEYS.map((key) => {
                const count = facets[key].length;
                const disabled = facetDisabled(key, options, depsLoading);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setActive(key);
                      setQuery("");
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] text-left text-[0.8125rem] transition-colors bg-transparent border-0",
                      disabled
                        ? "text-muted opacity-50 cursor-not-allowed"
                        : "text-secondary hover:bg-surface-muted hover:text-primary cursor-pointer",
                    )}
                  >
                    <span className="flex-1 truncate">{FACET_LABELS[key]}</span>
                    {count > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-action/15 text-action text-[0.625rem] font-mono font-semibold">
                        {count}
                      </span>
                    )}
                    <ChevronRight size={13} className="text-muted flex-none" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 p-1.5 border-b border-divider">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label="Back to filters"
                  className="inline-flex items-center justify-center w-6 h-6 rounded-[5px] text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer bg-transparent border-0"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-muted">
                  {FACET_LABELS[active]}
                </span>
              </div>

              {activeOptions.length > 6 && (
                <div className="p-2 border-b border-divider">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Filter ${FACET_LABELS[
                      active
                    ].toLowerCase()}…`}
                    className="w-full h-[30px] px-2 text-[0.75rem] font-mono bg-surface-muted border border-input rounded-[5px] text-primary outline-none focus:ring-2 focus:ring-action/40"
                  />
                </div>
              )}

              <div className="max-h-[280px] overflow-y-auto p-1">
                {activeOptions.length === 0 ? (
                  <div className="px-2 py-2 text-[0.75rem] text-muted italic">
                    {active === "connects" && depsLoading
                      ? "Loading connections…"
                      : "None observed"}
                  </div>
                ) : visibleOptions.length === 0 ? (
                  <div className="px-2 py-2 text-[0.75rem] text-muted italic">
                    No matches
                  </div>
                ) : (
                  visibleOptions.map((opt) => {
                    const isSel = facets[active].includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          onChange(toggleFacetValue(facets, active, opt.value))
                        }
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-left text-[0.8125rem] text-secondary hover:bg-surface-muted transition-colors cursor-pointer bg-transparent border-0"
                      >
                        <span
                          className={cn(
                            "flex items-center justify-center w-4 h-4 rounded-[4px] border flex-shrink-0",
                            isSel
                              ? "bg-action border-action text-white"
                              : "border-input",
                          )}
                        >
                          {isSel && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className="truncate font-mono text-[0.75rem]">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ActiveFacetChips({
  facets,
  options,
  onChange,
  className,
}: {
  facets: Facets;
  options: FacetOptions;
  onChange: (next: Facets) => void;
  className?: string;
}) {
  const entries = useMemo(() => {
    const out: { key: FacetKey; value: string; label: string }[] = [];
    for (const key of FACET_KEYS) {
      for (const value of facets[key]) {
        const opt = options[key].find((o) => o.value === value);
        out.push({ key, value, label: opt?.label ?? value });
      }
    }
    return out;
  }, [facets, options]);

  if (entries.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {entries.map(({ key, value, label }) => (
        <Badge
          key={`${key}:${value}`}
          variant="outline"
          className="inline-flex items-center gap-1 font-mono text-[0.6875rem] max-w-full"
        >
          <span className="text-muted">{FACET_LABELS[key]}</span>
          <span className="text-muted">=</span>
          <span className="text-action truncate max-w-[220px]">{label}</span>
          <button
            type="button"
            onClick={() => onChange(toggleFacetValue(facets, key, value))}
            aria-label={`Remove ${FACET_LABELS[key]} ${label} filter`}
            className="ml-0.5 text-muted hover:text-primary cursor-pointer bg-transparent border-0 p-0 inline-flex items-center"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </Badge>
      ))}
      <button
        type="button"
        onClick={() => onChange(emptyFacets())}
        className="text-[0.6875rem] font-mono uppercase tracking-wider text-muted hover:text-secondary py-0.5 px-1 cursor-pointer bg-transparent border-0"
      >
        Clear all
      </button>
    </div>
  );
}
