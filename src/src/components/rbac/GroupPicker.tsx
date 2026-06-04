import React from "react";
import { useRbacGroups } from "@/state/remote/queries/rbac";

interface GroupPickerProps {
  value: string;
  onChange: (groupId: string) => void;
  excludeIds?: string[];
  placeholder?: string;
  className?: string;
}

export function GroupPicker({
  value,
  onChange,
  excludeIds = [],
  placeholder = "Select a group…",
  className,
}: GroupPickerProps) {
  const { data, isFetched } = useRbacGroups();
  const groups: any[] = (data as any[]) ?? [];
  const exclude = new Set(excludeIds);
  const visible = groups.filter((g: any) => !exclude.has(g.id));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!isFetched}
      className={`flex-1 text-xs font-mono h-8 border border-input rounded-[4px] bg-background px-2 focus:outline-none focus:ring-1 focus:ring-action ${
        className ?? ""
      }`.trim()}
    >
      <option value="">{placeholder}</option>
      {visible.map((g: any) => (
        <option key={g.id} value={g.id}>
          {g.name ?? g.id}
        </option>
      ))}
    </select>
  );
}
