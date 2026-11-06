import React from "react";
import {
  useCopilotAdmin,
  type CopilotCollectorStatus,
} from "@/state/remote/queries/copilot";
import { Badge } from "@/components/ui/badge";
import { Section, fmtAgo } from "@/pages/copilot/shared";
import { QueryState } from "./common";

function statusVariant(status?: string) {
  if (status === "ok") return "soft-success" as const;
  if (status === "running") return "pending" as const;
  return "destructive" as const;
}

export function StatusFooter() {
  const q = useCopilotAdmin<CopilotCollectorStatus[]>("status");
  return (
    <Section title="Collectors">
      <QueryState query={q} height={40}>
        {(rows) => (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[0.75rem]">
            {rows.map((r) => (
              <span
                key={r.collector}
                className="inline-flex items-center gap-2"
                title={r.lastRun?.error ?? undefined}
              >
                <span className="font-mono text-primary">{r.collector}</span>
                <Badge variant={statusVariant(r.lastRun?.status)}>
                  {r.lastRun?.status ?? "never"}
                </Badge>
                <span className="text-muted">ok {fmtAgo(r.lastOkAt)}</span>
              </span>
            ))}
          </div>
        )}
      </QueryState>
    </Section>
  );
}
