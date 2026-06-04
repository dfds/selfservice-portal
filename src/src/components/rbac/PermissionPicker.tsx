import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAllPermissions } from "@/state/remote/queries/rbac";

export interface PermissionSelection {
  namespace: string;
  permission: string;
}

interface PermissionPickerProps {
  value: PermissionSelection[];
  onChange: (next: PermissionSelection[]) => void;
  namespaceFilter?: string;
  placeholder?: string;
  className?: string;
}

interface Perm {
  namespace: string;
  name: string;
  description?: string;
  accessType?: string;
}

function sameKey(a: PermissionSelection, b: PermissionSelection) {
  return a.namespace === b.namespace && a.permission === b.permission;
}

export function PermissionPicker({
  value,
  onChange,
  namespaceFilter,
  placeholder = "Select permissions…",
  className,
}: PermissionPickerProps) {
  const { data } = useAllPermissions();
  const allPerms: Perm[] = (data as Perm[] | undefined) ?? [];

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const grouped = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const pool = namespaceFilter
      ? allPerms.filter((p) => p.namespace === namespaceFilter)
      : allPerms;
    const matches = needle
      ? pool.filter((p) => {
          const ns = (p.namespace ?? "").toLowerCase();
          const nm = (p.name ?? "").toLowerCase();
          const desc = (p.description ?? "").toLowerCase();
          return (
            ns.includes(needle) ||
            nm.includes(needle) ||
            desc.includes(needle) ||
            `${ns}/${nm}`.includes(needle)
          );
        })
      : pool;

    const map = new Map<string, Perm[]>();
    matches.forEach((p) => {
      const key = p.namespace ?? "";
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([ns, items]) =>
          [ns, items.slice().sort((a, b) => a.name.localeCompare(b.name))] as [
            string,
            Perm[],
          ],
      );
  }, [allPerms, filter, namespaceFilter]);

  const selectedMap = useMemo(() => {
    const m = new Map<string, true>();
    value.forEach((v) => m.set(`${v.namespace}/${v.permission}`, true));
    return m;
  }, [value]);

  function toggle(p: Perm) {
    const sel: PermissionSelection = {
      namespace: p.namespace,
      permission: p.name,
    };
    const exists = value.some((v) => sameKey(v, sel));
    if (exists) onChange(value.filter((v) => !sameKey(v, sel)));
    else onChange([...value, sel]);
  }

  function remove(sel: PermissionSelection) {
    onChange(value.filter((v) => !sameKey(v, sel)));
  }

  const triggerLabel =
    value.length === 0
      ? placeholder
      : value.length === 1
      ? `${value[0].namespace}/${value[0].permission}`
      : `${value.length} permissions selected`;

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`.trim()}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {value.map((sel) => (
            <span
              key={`${sel.namespace}/${sel.permission}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 border border-card rounded-[4px] bg-surface text-[0.625rem] font-mono"
            >
              <span className="text-muted">{sel.namespace}/</span>
              <span className="text-primary">{sel.permission}</span>
              <button
                type="button"
                onClick={() => remove(sel)}
                className="text-muted hover:text-destructive cursor-pointer border-0 bg-transparent p-0 leading-none"
                aria-label={`Remove ${sel.namespace}/${sel.permission}`}
              >
                <X size={11} strokeWidth={1.75} />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 h-9 px-3 text-xs font-mono border border-input rounded-[5px] bg-background hover:border-action transition-colors cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={
            value.length === 0
              ? "text-muted truncate"
              : "text-primary truncate"
          }
        >
          {triggerLabel}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          className={`text-muted shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-card rounded-[8px] bg-surface shadow-overlay z-50 overflow-hidden">
          <div className="relative border-b border-divider">
            <Search
              size={13}
              strokeWidth={1.75}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              aria-hidden="true"
            />
            <Input
              autoFocus
              value={filter}
              placeholder="Filter by namespace, name, or description…"
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs font-mono pl-8 border-0 rounded-none focus-visible:ring-0"
              autoComplete="off"
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {grouped.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted font-mono italic">
                No permissions match.
              </p>
            ) : (
              grouped.map(([ns, items]) => (
                <div key={ns} className="border-b border-divider last:border-b-0">
                  <div className="px-3 pt-2 pb-1 text-[0.625rem] uppercase font-mono text-muted bg-surface-muted">
                    {ns}
                  </div>
                  {items.map((p) => {
                    const key = `${p.namespace}/${p.name}`;
                    const checked = selectedMap.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggle(p)}
                        className="w-full flex items-start gap-2 px-3 py-1.5 text-left hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          tabIndex={-1}
                          className="mt-0.5 cursor-pointer"
                          aria-hidden="true"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-mono text-primary truncate">
                            {p.name}
                          </span>
                          {p.description && (
                            <span className="text-[0.625rem] text-muted font-mono truncate">
                              {p.description}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {value.length > 0 && (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-t border-divider bg-surface-muted text-[0.625rem] font-mono">
              <span className="text-muted">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-muted hover:text-destructive cursor-pointer border-0 bg-transparent"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
