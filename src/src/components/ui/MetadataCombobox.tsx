import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetadataCombobox({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, value]);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[140px]">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        className="w-full h-[28px] pl-2 pr-7 bg-surface border border-[#d9dcde] dark:border-[#334155] rounded-[5px] font-mono text-[0.75rem] text-[#002b45] dark:text-[#e2e8f0] outline-none focus:border-[#0e7cc1] dark:focus:border-[#60a5fa]"
      />
      <button
        type="button"
        onMouseDown={(e) => {
          // Prevent input blur so toggling stays predictable while focused.
          e.preventDefault();
        }}
        onClick={() => {
          setOpen((prev) => !prev);
          inputRef.current?.focus();
        }}
        aria-label={`Toggle ${ariaLabel} suggestions`}
        className="absolute right-0 top-0 h-[28px] w-7 flex items-center justify-center text-muted hover:text-action transition-colors"
      >
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-card rounded-[6px] bg-surface shadow-card z-50 overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-2.5 py-1 font-mono text-[0.75rem] hover:bg-surface-muted transition-colors border-0 bg-transparent",
                opt === value
                  ? "text-action"
                  : "text-[#002b45] dark:text-[#e2e8f0]",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
