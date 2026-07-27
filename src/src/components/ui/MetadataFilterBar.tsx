import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetadataCombobox } from "@/components/ui/MetadataCombobox";
import type {
  MetadataFilter,
  MetadataIndex,
  MetadataMode,
} from "@/lib/metadataFilters";

export function MetadataFilterBar({
  filters,
  mode,
  index,
  onChange,
  onModeChange,
  addLabel = "Add tag filter",
  className,
}: {
  filters: MetadataFilter[];
  mode: MetadataMode;
  index: MetadataIndex;
  onChange: (filters: MetadataFilter[]) => void;
  onModeChange: (mode: MetadataMode) => void;
  addLabel?: string;
  className?: string;
}) {
  const addFilter = () => onChange([...filters, { key: "", value: "" }]);

  const updateFilter = (i: number, patch: Partial<MetadataFilter>) =>
    onChange(filters.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const removeFilter = (i: number) =>
    onChange(filters.filter((_, idx) => idx !== i));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={addFilter}
          className="inline-flex items-center gap-1.5 h-[28px] px-3 border rounded-full text-[0.6875rem] font-medium bg-white dark:bg-[#0f172a] border-[#d9dcde] dark:border-[#334155] text-[#4a6278] dark:text-[#94a3b8] hover:border-[#0e7cc1] dark:hover:border-[#60a5fa] hover:text-[#0e7cc1] dark:hover:text-[#60a5fa] transition-all"
        >
          <Plus size={12} strokeWidth={2} />
          {addLabel}
        </button>
        {filters.length > 1 && (
          <div className="flex items-center gap-2 ml-1">
            <span className="text-[0.625rem] font-mono uppercase tracking-[0.12em] text-muted">
              match
            </span>
            <div
              role="radiogroup"
              aria-label="Combine metadata filters with AND or OR"
              className="inline-flex border border-[#d9dcde] dark:border-[#334155] rounded-full overflow-hidden h-[24px]"
            >
              {(["and", "or"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => onModeChange(m)}
                  className={cn(
                    "px-2.5 text-[0.625rem] font-mono font-semibold uppercase tracking-[0.1em] transition-colors",
                    mode === m
                      ? "bg-[#0e7cc1] dark:bg-[#60a5fa] text-white"
                      : "bg-white dark:bg-[#0f172a] text-[#4a6278] dark:text-[#94a3b8] hover:text-[#0e7cc1] dark:hover:text-[#60a5fa]",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <span className="text-[10.5px] font-mono text-muted">
              {mode === "and" ? "all tags must match" : "any tag may match"}
            </span>
          </div>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-col gap-2">
          {filters.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-surface-muted/40 border border-card rounded-[6px] px-2.5 py-1.5"
            >
              <span className="text-[0.625rem] font-mono uppercase tracking-[0.12em] text-muted w-[28px]">
                {i === 0 ? "tag" : mode === "or" ? "or" : "and"}
              </span>
              <MetadataCombobox
                value={f.key}
                onChange={(next) => updateFilter(i, { key: next })}
                options={index.keys}
                placeholder="key (e.g. dfds.env)"
                ariaLabel="Metadata key"
              />
              <span className="text-muted text-[0.75rem]">=</span>
              <MetadataCombobox
                value={f.value}
                onChange={(next) => updateFilter(i, { value: next })}
                options={f.key ? index.values[f.key] ?? [] : []}
                placeholder="value (blank = any)"
                ariaLabel="Metadata value"
              />
              <button
                type="button"
                onClick={() => removeFilter(i)}
                className="p-1.5 rounded-[5px] hover:bg-surface-muted text-muted hover:text-destructive transition-colors"
                aria-label="Remove filter"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
