import React from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/IconButton";
import { EmptyState } from "@/components/ui/EmptyState";

export interface GrantRow {
  id: string;
  kind: "Permission" | "Role";
  label: string;
  namespace?: string;
  scopeType?: string;
  resource?: string;
  resourceName?: string;
  canRevoke?: boolean;
}

interface GrantsTableProps {
  rows: GrantRow[];
  isFetched: boolean;
  onRevoke?: (row: GrantRow) => void;
  emptyMessage?: string;
}

export function GrantsTable({
  rows,
  isFetched,
  onRevoke,
  emptyMessage = "No grants.",
}: GrantsTableProps) {
  if (!isFetched) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-8 rounded-[4px] bg-surface-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <div className="flex flex-col divide-y divide-divider rounded-[8px] border border-card overflow-hidden">
      {rows.map((row) => {
        const scope = row.scopeType
          ? row.resource
            ? `${row.scopeType}: ${row.resourceName ?? row.resource}`
            : row.scopeType
          : "Global";
        return (
          <div
            key={`${row.kind}-${row.id}`}
            className="flex items-center gap-3 px-3 py-2 bg-surface"
          >
            <Badge variant="outline" className="text-[0.625rem] font-mono">
              {row.kind}
            </Badge>
            {row.namespace && (
              <span className="text-[0.625rem] text-muted font-mono">
                {row.namespace}
              </span>
            )}
            <span className="text-xs font-mono text-primary flex-1 truncate">
              {row.label}
            </span>
            <span className="text-[0.625rem] text-muted font-mono truncate">
              {scope}
            </span>
            {onRevoke && row.canRevoke !== false && (
              <IconButton
                size="sm"
                colorScheme="destructive"
                onClick={() => onRevoke(row)}
                aria-label={`Revoke ${row.kind} ${row.label}`}
              >
                <Trash2 size={13} strokeWidth={1.75} />
              </IconButton>
            )}
          </div>
        );
      })}
    </div>
  );
}
