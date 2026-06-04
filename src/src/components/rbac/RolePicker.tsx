import React from "react";
import { useGetRoles } from "@/state/remote/queries/rbac";

interface RolePickerProps {
  value: string;
  onChange: (roleId: string) => void;
  placeholder?: string;
  className?: string;
}

export function RolePicker({
  value,
  onChange,
  placeholder = "Select a role…",
  className,
}: RolePickerProps) {
  const { data, isFetched } = useGetRoles("");
  const roles: any[] = (data as any[]) ?? [];

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
      {roles.map((r: any) => (
        <option key={r.id} value={r.id}>
          {r.name ?? r.id}
        </option>
      ))}
    </select>
  );
}
