import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LabelSelector, Option } from "./filtering";

interface MultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  searchable = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selectedSet = new Set(selected);
  const visible =
    searchable && query.trim()
      ? options.filter((o) =>
          o.label.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : options;

  function toggle(value: string) {
    const next = new Set(selectedSet);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange([...next]);
  }

  const disabled = options.length === 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 h-[34px] px-3 text-[0.8125rem] rounded-[6px] border border-input bg-surface text-secondary transition-colors",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:text-primary cursor-pointer",
          selected.length > 0 && "border-action/60 text-primary",
        )}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-action/15 text-action text-[0.625rem] font-mono font-semibold">
            {selected.length}
          </span>
        )}
        <ChevronDown
          size={13}
          className={cn(
            "text-muted transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 min-w-[220px] max-w-[320px] rounded-[8px] border border-card bg-surface shadow-overlay animate-menu-enter">
          {searchable && (
            <div className="p-2 border-b border-divider">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Filter ${label.toLowerCase()}…`}
                className="w-full h-[30px] px-2 text-[0.75rem] font-mono bg-surface-muted border border-input rounded-[5px] text-primary outline-none focus:ring-2 focus:ring-action/40"
              />
            </div>
          )}
          <div className="max-h-[260px] overflow-y-auto p-1">
            {visible.length === 0 ? (
              <div className="px-2 py-2 text-[0.75rem] text-muted italic">
                No matches
              </div>
            ) : (
              visible.map((opt) => {
                const isSel = selectedSet.has(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
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
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
          {selected.length > 0 && (
            <div className="p-1.5 border-t border-divider">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-[0.6875rem] font-mono uppercase tracking-wider text-muted hover:text-secondary py-1 cursor-pointer bg-transparent border-0"
              >
                Clear ({selected.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface LabelSelectorBuilderProps {
  selectors: LabelSelector[];
  onChange: (next: LabelSelector[]) => void;
  labelKeys: string[];
  valuesForKey: (key: string) => string[];
}

export function LabelSelectorBuilder({
  selectors,
  onChange,
  labelKeys,
  valuesForKey,
}: LabelSelectorBuilderProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  function add() {
    const k = key.trim();
    if (!k) return;
    const v = value.trim();
    // Replace an existing selector on the same key rather than duplicating.
    const next = selectors.filter((s) => s.key !== k);
    next.push({ key: k, value: v });
    onChange(next);
    setKey("");
    setValue("");
  }

  function remove(target: LabelSelector) {
    onChange(selectors.filter((s) => s !== target));
  }

  const keyListId = "svc-label-keys";
  const valueListId = "svc-label-values";
  const disabled = labelKeys.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          list={keyListId}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          disabled={disabled}
          placeholder={disabled ? "No namespace labels" : "label key"}
          className="h-[34px] w-[170px] px-2.5 text-[0.75rem] font-mono bg-surface border border-input rounded-[6px] text-primary outline-none focus:ring-2 focus:ring-action/40 disabled:opacity-50"
        />
        <datalist id={keyListId}>
          {labelKeys.map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>
        <span className="text-muted font-mono text-[0.8125rem]">=</span>
        <input
          list={valueListId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          disabled={disabled}
          placeholder="value (any)"
          className="h-[34px] w-[170px] px-2.5 text-[0.75rem] font-mono bg-surface border border-input rounded-[6px] text-primary outline-none focus:ring-2 focus:ring-action/40 disabled:opacity-50"
        />
        <datalist id={valueListId}>
          {(key ? valuesForKey(key) : []).map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={add}
          disabled={disabled || !key.trim()}
          className="inline-flex items-center gap-1 h-[34px] px-3 text-[0.75rem] font-medium rounded-[6px] border border-input bg-surface text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <Plus size={13} />
          Add
        </button>
      </div>

      {selectors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectors.map((sel, i) => (
            <Badge
              key={`${sel.key}/${i}`}
              variant="outline"
              className="inline-flex items-center gap-1 font-mono text-[0.6875rem]"
            >
              <span className="text-primary">{sel.key}</span>
              {sel.value ? (
                <>
                  <span className="text-muted">=</span>
                  <span className="text-action">{sel.value}</span>
                </>
              ) : (
                <span className="text-muted">(any)</span>
              )}
              <button
                type="button"
                onClick={() => remove(sel)}
                aria-label={`Remove ${sel.key} selector`}
                className="ml-0.5 text-muted hover:text-primary cursor-pointer bg-transparent border-0 p-0 inline-flex items-center"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
