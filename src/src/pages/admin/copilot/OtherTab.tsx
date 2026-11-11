import React, { useMemo } from "react";
import {
  useCopilotAdmin,
  type CopilotRepoTotals,
  type CopilotTeamDay,
} from "@/state/remote/queries/copilot";
import {
  type Column,
  DataTable,
  Section,
  fmtDec,
  fmtInt,
  metric,
} from "@/pages/copilot/shared";
import { QueryState, type RangedProps } from "./common";

const repoColumns: Column<CopilotRepoTotals>[] = [
  { id: "repo", header: "Repository", value: (r) => `${r.owner}/${r.name}` },
  {
    id: "created",
    header: "PRs created",
    align: "right",
    value: (r) => metric(r.totals, "pr_total_created"),
  },
  {
    id: "merged",
    header: "Merged",
    align: "right",
    value: (r) => metric(r.totals, "pr_total_merged"),
  },
  {
    id: "byCopilot",
    header: "By Copilot",
    align: "right",
    value: (r) => metric(r.totals, "pr_total_created_by_copilot"),
  },
  {
    id: "reviewedByCopilot",
    header: "Copilot reviewed",
    align: "right",
    value: (r) => metric(r.totals, "pr_total_reviewed_by_copilot"),
  },
  {
    id: "suggestions",
    header: "Copilot suggestions",
    align: "right",
    value: (r) => metric(r.totals, "pr_total_copilot_suggestions"),
  },
  {
    id: "applied",
    header: "Applied",
    align: "right",
    value: (r) => metric(r.totals, "pr_total_copilot_applied_suggestions"),
  },
];

interface TeamRow {
  slug: string;
  members: number;
  avgActive: number;
  prompts: number;
  generated: number;
  credits: number;
}

function rollUpTeams(days: CopilotTeamDay[]): TeamRow[] {
  const by = new Map<string, { rows: CopilotTeamDay[] }>();
  for (const d of days) {
    const e = by.get(d.slug) ?? { rows: [] };
    e.rows.push(d);
    by.set(d.slug, e);
  }
  return [...by.entries()].map(([slug, { rows }]) => {
    const latest = rows.reduce((a, b) => (a.day > b.day ? a : b));
    return {
      slug,
      members: latest.members,
      avgActive: rows.reduce((s, r) => s + r.activeUsers, 0) / rows.length,
      prompts: rows.reduce(
        (s, r) => s + metric(r.totals, "user_initiated_interaction_count"),
        0,
      ),
      generated: rows.reduce(
        (s, r) => s + metric(r.totals, "code_generation_activity_count"),
        0,
      ),
      credits: rows.reduce(
        (s, r) => s + metric(r.totals, "ai_credits_used"),
        0,
      ),
    };
  });
}

const teamColumns: Column<TeamRow>[] = [
  { id: "slug", header: "Team", value: (t) => t.slug },
  { id: "members", header: "Members", align: "right", value: (t) => t.members },
  {
    id: "avgActive",
    header: "Avg active",
    align: "right",
    value: (t) => t.avgActive,
    cell: (t) => fmtDec(t.avgActive),
  },
  {
    id: "prompts",
    header: "Prompts",
    align: "right",
    value: (t) => t.prompts,
    cell: (t) => fmtInt(t.prompts),
  },
  {
    id: "generated",
    header: "Generated",
    align: "right",
    value: (t) => t.generated,
    cell: (t) => fmtInt(t.generated),
  },
  {
    id: "credits",
    header: "AI Credits",
    align: "right",
    value: (t) => t.credits,
    cell: (t) => fmtDec(t.credits),
  },
];

export const OtherTab = React.memo(function OtherTab({
  scope,
  from,
  to,
}: RangedProps) {
  const isOrg = scope.startsWith("org:");
  const reposQ = useCopilotAdmin<CopilotRepoTotals[]>(
    "reports/repos/totals",
    { scope, from, to, limit: 5000 },
    { enabled: !!scope },
  );
  const teamsQ = useCopilotAdmin<CopilotTeamDay[]>(
    "teams/daily",
    { scope, from, to },
    { enabled: isOrg },
  );
  const teamRows = useMemo(
    () => rollUpTeams(teamsQ.data?.data ?? []),
    [teamsQ.data],
  );

  return (
    <>
      <Section
        title="Pull requests by repository"
        tip="Repositories with pull request activity in GitHub's usage report."
      >
        <QueryState query={reposQ}>
          {(rows) => (
            <DataTable
              columns={repoColumns}
              data={rows}
              initialSort={{ id: "created", desc: true }}
              emptyMessage="No pull request activity in this range."
              searchColumns={["repo"]}
            />
          )}
        </QueryState>
      </Section>

      <Section
        title="Teams"
        tip="GitHub omits teams with fewer than 5 seated users."
      >
        {isOrg ? (
          <QueryState query={teamsQ}>
            {() => (
              <DataTable
                columns={teamColumns}
                data={teamRows}
                initialSort={{ id: "prompts", desc: true }}
                emptyMessage="No team reports in this range."
              />
            )}
          </QueryState>
        ) : (
          <p className="text-[0.8125rem] text-secondary">
            Team reports exist per organization. Pick an org scope.
          </p>
        )}
      </Section>
    </>
  );
});
