import React from "react";
import { useCapabilities } from "@/state/remote/queries/capabilities";

export type ScopeAccessType = "Global" | "Capability";

export interface ScopeValue {
  type: ScopeAccessType;
  resource: string;
}

interface ScopePickerProps {
  value: ScopeValue;
  onChange: (next: ScopeValue) => void;
  className?: string;
}

export function ScopePicker({ value, onChange, className }: ScopePickerProps) {
  const { data } = useCapabilities();
  const caps: any[] = (data as any[]) ?? [];

  function setType(type: ScopeAccessType) {
    onChange({ type, resource: type === "Global" ? "" : value.resource });
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`.trim()}>
      <div
        role="radiogroup"
        aria-label="Scope"
        className="flex items-center gap-3 text-xs font-mono"
      >
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="scope-type"
            checked={value.type === "Global"}
            onChange={() => setType("Global")}
          />
          Global
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name="scope-type"
            checked={value.type === "Capability"}
            onChange={() => setType("Capability")}
          />
          Capability
        </label>
      </div>

      {value.type === "Capability" && (
        <select
          value={value.resource}
          onChange={(e) =>
            onChange({ type: "Capability", resource: e.target.value })
          }
          className="text-xs font-mono h-8 border border-input rounded-[4px] bg-background px-2 focus:outline-none focus:ring-1 focus:ring-action"
        >
          <option value="">Select a capability…</option>
          {caps.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name ?? c.id}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
