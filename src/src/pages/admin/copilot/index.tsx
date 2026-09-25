import React, { useContext, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Coins,
  GitPullRequest,
  LayoutDashboard,
  Server,
  Users,
  X,
} from "lucide-react";
import PreAppContext from "@/preAppContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import {
  useCopilotAdmin,
  useCopilotUserSearch,
  useGraphDisplayName,
  useGraphPhoto,
  type CopilotAdminSeat,
  type CopilotBudgetItem,
  type CopilotCollectorStatus,
  type CopilotCreditUsage,
  type CopilotEnvelope,
  type CopilotOrgDay,
  type CopilotRepoTotals,
  type CopilotScope,
  type CopilotSeatHistoryDay,
  type CopilotSummary,
  type CopilotTeamDay,
  type CopilotUserTotals,
} from "@/state/remote/queries/copilot";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { TabGroup } from "@/components/ui/TabGroup";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CopilotUserPicker } from "@/pages/copilot/CopilotUserPicker";
import {
  type ChartSeries,
  type Column,
  DailyChart,
  DataTable,
  Section,
  acceptanceRate,
  daysSince,
  featureLabel,
  fmtAgo,
  fmtCompact,
  fmtDay,
  fmtDec,
  fmtInt,
  fmtUsd,
  fmtUsdShort,
  metric,
  monthLabel,
  selectCls,
} from "@/pages/copilot/shared";
import { RangePicker, useRangeParam } from "@/pages/copilot/RangePicker";

function httpStatus(error: unknown): number | undefined {
  return (error as any)?.data?.status;
}

function unavailable<T>(q: {
  data?: CopilotEnvelope<T>;
  isFetched: boolean;
}): boolean {
  return q.isFetched && q.data?.meta?.copilotAvailable === false;
}

type AdminQuery<T> = {
  data?: CopilotEnvelope<T>;
  isFetched: boolean;
  isError: boolean;
  error: unknown;
};

function hasData<T>(q: AdminQuery<T>): boolean {
  return (
    (q.isFetched || q.data !== undefined) &&
    !q.isError &&
    !unavailable(q) &&
    q.data?.data != null
  );
}

function QueryState<T>({
  query,
  height = 160,
  children,
}: {
  query: AdminQuery<T>;
  height?: number;
  children: (data: T) => React.ReactNode;
}) {
  // Placeholder data from a previous key counts as loaded.
  if (!query.isFetched && query.data === undefined) {
    return <Skeleton className="w-full" style={{ height }} />;
  }
  if (query.isError) {
    const status = httpStatus(query.error);
    return (
      <InfoAlert variant="error">
        {status === 403
          ? "You lack the copilot/read-all permission."
          : `copilot-insights answered ${status ?? "with an error"}.`}
      </InfoAlert>
    );
  }
  if (unavailable(query) || query.data?.data == null) {
    return (
      <InfoAlert variant="warning">copilot-insights is unavailable.</InfoAlert>
    );
  }
  return <>{children(query.data.data)}</>;
}

function SummaryTiles({ summary }: { summary: CopilotSummary }) {
  const t = summary.totals ?? {};
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <StatCard label="Seats" value={fmtInt(summary.seats.total)} />
      <StatCard
        label="Active 28d"
        value={fmtInt(summary.seats.active28d)}
        tip="Seats with Copilot activity in the last 28 days."
      />
      <StatCard
        label="Never active"
        value={fmtInt(summary.seats.neverActive)}
      />
      <StatCard
        label="Cancelling"
        value={fmtInt(summary.seats.pendingCancellation)}
        tip="Seats with a pending cancellation date."
      />
      <StatCard
        label="Active users"
        value={fmtInt(summary.activeUsers)}
        tip="Distinct users with report rows in the range."
      />
      <StatCard
        label="Avg daily users"
        value={fmtDec(summary.avgDailyActiveUsers)}
      />
      <StatCard
        label="Acceptance"
        value={acceptanceRate(
          metric(t, "code_acceptance_activity_count"),
          metric(t, "code_generation_activity_count"),
        )}
      />
      <StatCard
        label="AI Credits"
        value={
          <span title={fmtDec(metric(t, "ai_credits_used"))}>
            {fmtCompact(metric(t, "ai_credits_used"))}
          </span>
        }
        tip="AI Credits from the usage report, not billing."
      />
    </div>
  );
}

const AI_CREDITS_SKU = "ai_credits";

function budgetMonth(to: string): { year: number; month: number } {
  return { year: +to.slice(0, 4), month: +to.slice(5, 7) };
}

function EnterpriseBudget({
  budgets,
  year,
  month,
}: {
  budgets: CopilotBudgetItem[];
  year: number;
  month: number;
}) {
  const credit = budgets.filter((b) => b.productSku === AI_CREDITS_SKU);
  const ent = credit.find((b) => b.scope === "enterprise");
  const perUser = credit.find((b) => b.scope === "multi_user_customer");
  const overrides = credit.filter((b) => b.scope === "user").length;
  const now = new Date();
  const current =
    year === now.getUTCFullYear() && month === now.getUTCMonth() + 1;
  const label = monthLabel(year, month);

  if (!ent && !perUser) {
    return (
      <p className="text-[0.8125rem] text-secondary">
        No AI Credit budgets are set.
      </p>
    );
  }
  const consumed = ent?.consumed ?? 0;
  const pct = ent && ent.amount > 0 ? (consumed / ent.amount) * 100 : 0;
  const color =
    pct >= 90
      ? "var(--color-error)"
      : pct >= 75
      ? "var(--color-warning)"
      : "var(--color-action)";
  return (
    <div className="flex flex-col gap-2">
      {ent && (
        <>
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <span className="text-[0.8125rem] text-primary">
              <span className="font-mono font-semibold">
                {fmtUsd(consumed)}
              </span>{" "}
              of the {fmtUsd(ent.amount)} enterprise budget used in {label}
              {current && " (to date)"}
            </span>
            <span className="font-mono text-[0.75rem] text-muted">
              {Math.round(pct)}%
            </span>
          </div>
          <ProgressBar
            value={pct}
            color={color}
            role="progressbar"
            aria-label="Enterprise AI Credit budget used"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </>
      )}
      <p className="text-[0.75rem] text-muted">
        {perUser && (
          <>
            Per-user budget {fmtUsd(perUser.amount)}
            {perUser.userStates != null &&
              `, ${fmtInt(perUser.userStates)} users with spend this month`}
            .{" "}
          </>
        )}
        {overrides > 0 &&
          `${fmtInt(overrides)} ${
            overrides === 1 ? "user has" : "users have"
          } their own budget. `}
        {ent?.consumedSource === "ai_credit_usage" &&
          `GitHub does not report spend for the enterprise budget, so the figure above is the net cost of the AI Credits used in ${label}. `}
        {!current &&
          "Budget amounts are today's; GitHub keeps no history of earlier amounts."}
      </p>
    </div>
  );
}

function LoginLink({ login }: { login: string }) {
  return (
    <Link
      to={`/copilot?user=${encodeURIComponent(login)}`}
      className="text-action hover:underline"
    >
      {login}
    </Link>
  );
}

interface UserRow {
  login: string;
  email: string;
  seat?: CopilotAdminSeat;
  usage?: CopilotUserTotals;
}

/**
 * Joins seats to usage by login. Users with usage but no seat are left out
 * when seatedOnly is set, since the seats list is then filtered by inactivity.
 */
function joinUsers(
  seats: CopilotAdminSeat[],
  usage: CopilotUserTotals[],
  seatedOnly: boolean,
): UserRow[] {
  const by = new Map<string, UserRow>();
  for (const s of seats) {
    const key = s.login.toLowerCase();
    if (!by.has(key))
      by.set(key, { login: s.login, email: s.email ?? "", seat: s });
  }
  for (const u of usage) {
    const row = by.get(u.login.toLowerCase());
    if (row) {
      row.usage = u;
      row.email ||= u.email ?? "";
    } else if (!seatedOnly) {
      by.set(u.login.toLowerCase(), {
        login: u.login,
        email: u.email ?? "",
        usage: u,
      });
    }
  }
  return [...by.values()];
}

const usage = (r: UserRow, name: string) => metric(r.usage?.totals, name);

const userColumns: Column<UserRow>[] = [
  {
    id: "login",
    header: "Login",
    value: (r) => r.login,
    cell: (r) => <LoginLink login={r.login} />,
  },
  { id: "email", header: "Email", value: (r) => r.email },
  {
    id: "org",
    header: "Org",
    value: (r) => (r.seat ? r.seat.orgName ?? r.seat.scope : ""),
    cell: (r) =>
      r.seat ? (
        r.seat.orgName ?? r.seat.scope
      ) : (
        <span className="text-muted">No seat</span>
      ),
  },
  {
    id: "lastActivity",
    header: "Last activity",
    value: (r) => r.seat?.lastActivityAt ?? "",
    cell: (r) => (r.seat ? fmtAgo(r.seat.lastActivityAt) : ""),
  },
  {
    id: "inactive",
    header: "Days inactive",
    align: "right",
    value: (r) =>
      r.seat ? daysSince(r.seat.lastActivityAt ?? r.seat.createdAt) ?? "" : "",
  },
  {
    id: "editor",
    header: "Editor",
    value: (r) => r.seat?.lastActivityEditor?.split("/")[0] ?? "",
  },
  {
    id: "created",
    header: "Assigned",
    value: (r) => r.seat?.createdAt ?? "",
    cell: (r) => (r.seat ? fmtDay(r.seat.createdAt) : ""),
  },
  {
    id: "cancel",
    header: "Cancels",
    value: (r) => r.seat?.pendingCancellationDate ?? "",
    cell: (r) =>
      r.seat?.pendingCancellationDate ? (
        <Badge variant="soft-warning">
          {fmtDay(r.seat.pendingCancellationDate)}
        </Badge>
      ) : (
        ""
      ),
  },
  {
    id: "daysActive",
    header: "Days active",
    align: "right",
    value: (r) => r.usage?.daysActive ?? 0,
  },
  {
    id: "lastDay",
    header: "Last day",
    value: (r) => r.usage?.lastDay ?? "",
    cell: (r) => (r.usage ? fmtDay(r.usage.lastDay) : ""),
  },
  {
    id: "prompts",
    header: "Prompts",
    align: "right",
    value: (r) => usage(r, "user_initiated_interaction_count"),
    cell: (r) => fmtInt(usage(r, "user_initiated_interaction_count")),
  },
  {
    id: "generated",
    header: "Generated",
    align: "right",
    value: (r) => usage(r, "code_generation_activity_count"),
    cell: (r) => fmtInt(usage(r, "code_generation_activity_count")),
  },
  {
    id: "acceptance",
    header: "Acceptance",
    align: "right",
    value: (r) => {
      const g = usage(r, "code_generation_activity_count");
      return g > 0 ? usage(r, "code_acceptance_activity_count") / g : 0;
    },
    cell: (r) =>
      acceptanceRate(
        usage(r, "code_acceptance_activity_count"),
        usage(r, "code_generation_activity_count"),
      ),
  },
  {
    id: "credits",
    header: "AI Credits",
    align: "right",
    value: (r) => usage(r, "ai_credits_used"),
    cell: (r) => fmtDec(usage(r, "ai_credits_used")),
  },
];

const USER_COLUMN_TOGGLE = {
  storageKey: "ssu-copilot-admin-user-columns",
  hidden: ["org", "cancel", "editor", "created", "lastDay"],
};

const USERS_TIP =
  "Seats with each user's usage in the range. Users with usage but no seat show as No seat in the Org column, unless the inactivity filter is on.";

function creditColumns(
  key: "login" | "model",
  header: string,
): Column<CopilotCreditUsage["groups"][number]>[] {
  const money = (id: string, h: string) => ({
    id,
    header: h,
    align: "right" as const,
    value: (g: CopilotCreditUsage["groups"][number]) => metric(g.totals, id),
    cell: (g: CopilotCreditUsage["groups"][number]) =>
      fmtUsd(metric(g.totals, id)),
  });
  return [
    {
      id: key,
      header,
      value: (g) => g[key] || "unknown",
      cell:
        key === "login"
          ? (g) => (g.login ? <LoginLink login={g.login} /> : "unknown")
          : undefined,
    },
    ...(key === "login"
      ? [{ id: "email", header: "Email", value: (g: any) => g.email ?? "" }]
      : []),
    {
      id: "quantity",
      header: "Credits",
      align: "right",
      value: (g) => metric(g.totals, "quantity"),
      cell: (g) => fmtDec(metric(g.totals, "quantity")),
    },
    money("gross_amount", "Gross"),
    money("discount_amount", "Discount"),
    money("net_amount", "Net"),
  ];
}

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

function statusVariant(status?: string) {
  if (status === "ok") return "soft-success" as const;
  if (status === "running") return "pending" as const;
  return "destructive" as const;
}

function StatusFooter() {
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

// The tabs take strings only, so React.memo skips them when the page
// re-renders for a tab switch. Re-rendering the MRT tables and charts blocked
// the main thread for ~100ms per switch.
type RangedProps = { scope: string; from: string; to: string };

const SummaryTab = React.memo(function SummaryTab({
  scope,
  from,
  to,
}: RangedProps) {
  const ranged = { scope, from, to };
  const enabled = { enabled: !!scope };
  const summaryQ = useCopilotAdmin<CopilotSummary>("summary", ranged, enabled);
  const dailyQ = useCopilotAdmin<CopilotOrgDay[]>(
    "reports/organization/daily",
    ranged,
    enabled,
  );
  const seatHistoryQ = useCopilotAdmin<CopilotSeatHistoryDay[]>(
    "seats/history",
    ranged,
    enabled,
  );
  const budgetYm = budgetMonth(to);
  const budgetsQ = useCopilotAdmin<CopilotBudgetItem[]>("budgets", budgetYm);
  const engagement = summaryQ.data?.data?.featureEngagement;

  return (
    <>
      <Section
        title="AI Credit budget"
        tip="Budgets set in GitHub's enterprise billing settings, against spend in the month the range ends in."
      >
        <QueryState query={budgetsQ} height={48}>
          {(b) => <EnterpriseBudget budgets={b} {...budgetYm} />}
        </QueryState>
      </Section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section
          title="Active users"
          tip="Distinct users active that day, and in the 7 and 28 days up to it. The lines are left out until the stored user reports cover their whole window."
        >
          <QueryState query={dailyQ} height={240}>
            {(rows) => (
              <DailyChart
                data={rows}
                series={[
                  {
                    key: "daily_active_users",
                    label: "Daily",
                    kind: "bar",
                    color: "#0e7cc1",
                    darkColor: "#60a5fa",
                  },
                  {
                    key: "rolling_7d_active_users",
                    label: "Last 7 days",
                    kind: "line",
                    color: "#002b45",
                    darkColor: "#94a3b8",
                  },
                  {
                    key: "rolling_28d_active_users",
                    label: "Last 28 days",
                    kind: "line",
                    color: "#4caf50",
                  },
                ]}
              />
            )}
          </QueryState>
        </Section>
        <Section title="Seats">
          <QueryState query={seatHistoryQ} height={240}>
            {(rows) => (
              <DailyChart
                data={rows}
                series={[
                  {
                    key: "total",
                    label: "Total",
                    kind: "line",
                    color: "#002b45",
                    darkColor: "#94a3b8",
                  },
                  {
                    key: "active28d",
                    label: "Active 28d",
                    kind: "line",
                    color: "#4caf50",
                  },
                  {
                    key: "pendingCancellation",
                    label: "Cancelling",
                    kind: "bar",
                    color: "#ed8800",
                  },
                ]}
              />
            )}
          </QueryState>
        </Section>
      </div>

      <Section
        title="Code generated and accepted"
        tip="Generation and acceptance events per day across editors."
      >
        <QueryState query={dailyQ} height={240}>
          {(rows) => (
            <DailyChart
              data={rows}
              series={[
                {
                  key: "code_generation_activity_count",
                  label: "Generated",
                  kind: "bar",
                  color: "#0e7cc1",
                  darkColor: "#60a5fa",
                },
                {
                  key: "code_acceptance_activity_count",
                  label: "Accepted",
                  kind: "bar",
                  color: "#4caf50",
                },
                {
                  key: "user_initiated_interaction_count",
                  label: "Prompts",
                  kind: "line",
                  color: "#002b45",
                  darkColor: "#94a3b8",
                  right: true,
                },
              ]}
            />
          )}
        </QueryState>
      </Section>

      {engagement && (
        <Section
          title={`Feature engagement · 28 days to ${fmtDay(
            engagement.periodEnd,
          )}`}
          tip="Distinct users who used each feature, from GitHub's 28-day report."
        >
          <FactTableEngagement
            features={engagement.features}
            activeUsers={metric(engagement.metrics, "active_user_count")}
          />
        </Section>
      )}
    </>
  );
});

const INACTIVE_OPTIONS = [0, 14, 30, 60, 90];

function seatsParams(scope: string, inactiveDays = 0) {
  return { scope, limit: 5000, inactiveDays: inactiveDays || undefined };
}

const UsersTab = React.memo(function UsersTab({
  scope,
  from,
  to,
}: RangedProps) {
  const [inactiveDays, setInactiveDays] = useState(0);
  const seatsQ = useCopilotAdmin<CopilotAdminSeat[]>(
    "seats",
    seatsParams(scope, inactiveDays),
    { enabled: !!scope, keepPrevious: true },
  );
  const usersQ = useCopilotAdmin<CopilotUserTotals[]>(
    "reports/users/totals",
    { scope, from, to, limit: 5000 },
    { enabled: !!scope },
  );
  const userRows = useMemo(
    () =>
      joinUsers(
        seatsQ.data?.data ?? [],
        usersQ.data?.data ?? [],
        inactiveDays > 0,
      ),
    [seatsQ.data, usersQ.data, inactiveDays],
  );
  const inactiveSelect = (
    <label className="inline-flex items-center gap-2 text-[0.75rem] text-secondary">
      Inactive for
      <select
        className={selectCls}
        value={inactiveDays}
        onChange={(e) => setInactiveDays(Number(e.target.value))}
      >
        {INACTIVE_OPTIONS.map((d) => (
          <option key={d} value={d}>
            {d === 0 ? "any" : `${d}+ days`}
          </option>
        ))}
      </select>
    </label>
  );

  // The table draws the title and filter in its toolbar; the section header
  // stands in while it is loading or failed.
  return (
    <Section
      title={hasData(seatsQ) && hasData(usersQ) ? undefined : "Users"}
      tip={USERS_TIP}
      actions={inactiveSelect}
    >
      <QueryState query={seatsQ}>
        {() => (
          <QueryState query={usersQ}>
            {() => (
              <DataTable
                columns={userColumns}
                data={userRows}
                initialSort={{ id: "prompts", desc: true }}
                emptyMessage="No users match."
                columnToggle={USER_COLUMN_TOGGLE}
                toolbar={
                  <>
                    <SectionLabel as="h2" tip={USERS_TIP}>
                      Users
                    </SectionLabel>
                    {inactiveSelect}
                  </>
                }
              />
            )}
          </QueryState>
        )}
      </QueryState>
    </Section>
  );
});

const loginCreditCols = creditColumns("login", "Login");
const modelCreditCols = creditColumns("model", "Model");

const CreditsTab = React.memo(function CreditsTab({
  scope,
  from,
  to,
}: RangedProps) {
  const enabled = { enabled: !!scope };
  const creditsByLoginQ = useCopilotAdmin<CopilotCreditUsage>(
    "credits/usage",
    { scope, from, to, groupBy: "login", limit: 5000 },
    enabled,
  );
  const creditsByModelQ = useCopilotAdmin<CopilotCreditUsage>(
    "credits/usage",
    { scope, from, to, groupBy: "model", limit: 5000 },
    enabled,
  );
  const seatsQ = useCopilotAdmin<CopilotAdminSeat[]>(
    "seats",
    seatsParams(scope),
    enabled,
  );
  const usersQ = useCopilotAdmin<CopilotUserTotals[]>(
    "reports/users/totals",
    { scope, from, to, limit: 5000 },
    enabled,
  );
  // The credit report has no email, so it is looked up by login from the
  // seat and usage lists. Users in neither are left blank.
  const creditsByLogin = useMemo(() => {
    const emails = new Map<string, string>();
    for (const u of [
      ...(usersQ.data?.data ?? []),
      ...(seatsQ.data?.data ?? []),
    ]) {
      if (u.email) emails.set(u.login.toLowerCase(), u.email);
    }
    return (creditsByLoginQ.data?.data?.groups ?? []).map((g) => ({
      ...g,
      email: emails.get(String(g.login ?? "").toLowerCase()) ?? "",
    }));
  }, [creditsByLoginQ.data, usersQ.data, seatsQ.data]);
  const totals = creditsByLoginQ.data?.data?.totals;

  return (
    <Section
      title="AI Credits"
      tip="From GitHub's AI Credit billing report. Net is gross minus discount."
      actions={
        totals ? (
          <span className="font-mono text-[0.75rem] text-secondary">
            {fmtDec(metric(totals, "quantity"))} credits ·{" "}
            {fmtUsd(metric(totals, "gross_amount"))} gross ·{" "}
            {fmtUsd(metric(totals, "net_amount"))} net
          </span>
        ) : undefined
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
        <QueryState query={creditsByLoginQ}>
          {() => (
            <DataTable
              columns={loginCreditCols}
              data={creditsByLogin}
              initialSort={{ id: "gross_amount", desc: true }}
              emptyMessage="No AI Credits billed in this range."
              searchColumns={["login", "email"]}
            />
          )}
        </QueryState>
        <QueryState query={creditsByModelQ}>
          {(c) => (
            <DataTable
              columns={modelCreditCols}
              data={c.groups}
              initialSort={{ id: "gross_amount", desc: true }}
              emptyMessage="No AI Credits billed in this range."
              searchColumns={["model"]}
            />
          )}
        </QueryState>
      </div>
    </Section>
  );
});

const OtherTab = React.memo(function OtherTab({
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

type CreditGroup = CopilotCreditUsage["groups"][number];

const PALETTE = [
  { color: "#0e7cc1", darkColor: "#60a5fa" },
  { color: "#4caf50" },
  { color: "#ed8800" },
  { color: "#be1e2d", darkColor: "#f87171" },
  { color: "#7c3aed", darkColor: "#a78bfa" },
  { color: "#0d9488", darkColor: "#2dd4bf" },
  { color: "#db2777", darkColor: "#f472b6" },
  { color: "#002b45", darkColor: "#94a3b8" },
  { color: "#ca8a04", darkColor: "#facc15" },
  { color: "#65a30d", darkColor: "#a3e635" },
  { color: "#0891b2", darkColor: "#22d3ee" },
  { color: "#9333ea", darkColor: "#c084fc" },
  { color: "#c2410c", darkColor: "#fb923c" },
  { color: "#4f46e5", darkColor: "#818cf8" },
  { color: "#15803d", darkColor: "#4ade80" },
  { color: "#a16207", darkColor: "#fde047" },
];

function rangeDays(from: string, to: string): string[] {
  const today = new Date().toISOString().slice(0, 10);
  const last = to < today ? to : today;
  const out: string[] = [];
  for (
    let d = new Date(`${from}T00:00:00Z`);
    d.toISOString().slice(0, 10) <= last;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function rangeHours(from: string, to: string, since?: string): string[] {
  const end = Math.min(
    new Date(`${to}T23:00:00Z`).getTime(),
    Date.now() - (Date.now() % 3_600_000),
  );
  const start = Math.max(
    new Date(`${from}T00:00:00Z`).getTime(),
    since ? new Date(since).getTime() : 0,
  );
  const out: string[] = [];
  for (let t = start; t <= end; ) {
    out.push(new Date(t).toISOString().slice(0, 13) + ":00:00Z");
    t += 3_600_000;
  }
  return out;
}

/**
 * Turns per-x groups into chart rows with one series per login or model,
 * ranked by the metric over the range. Series keys are s0, s1, … because
 * Recharts reads a dotted dataKey, such as a model name, as a path.
 */
function pivot(
  xs: string[],
  xKey: "day" | "hour",
  groups: CreditGroup[],
  entity: "login" | "model",
  name: string,
  cumulative: boolean,
) {
  const sums = new Map<string, number>();
  for (const g of groups) {
    const k = String(g[entity] ?? "");
    sums.set(k, (sums.get(k) ?? 0) + metric(g.totals, name));
  }
  const names = [...sums.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const index = new Map(names.map((n, i) => [n, i]));
  const at = new Map(xs.map((x, i) => [x, i]));
  const values = xs.map(() => names.map(() => 0));
  for (const g of groups) {
    const i = at.get(String(g[xKey]));
    const s = index.get(String(g[entity] ?? ""));
    if (i !== undefined && s !== undefined)
      values[i][s] += metric(g.totals, name);
  }
  const running = names.map(() => 0);
  const data = xs.map((x, i) => {
    const row: Record<string, string | number> = { [xKey]: x };
    names.forEach((_, s) => {
      running[s] = cumulative ? running[s] + values[i][s] : values[i][s];
      row[`s${s}`] = running[s];
    });
    return row;
  });
  const series: ChartSeries[] = names.map((n, s) => ({
    key: `s${s}`,
    label: n || "unknown",
    kind: "line",
    ...PALETTE[s % PALETTE.length],
  }));
  return { data, series };
}

function LoginCard({ login }: { login: string }) {
  const search = useCopilotUserSearch(login);
  const match = search.data?.items.find(
    (u) => u.login.toLowerCase() === login.toLowerCase(),
  );
  const email = match?.primaryEmail ?? "";
  const graphName = useGraphDisplayName(email);
  const photo = useGraphPhoto(email);
  const name = graphName.data || match?.name;
  const loading = search.isFetching && !match;
  return (
    <div className="flex items-start gap-3">
      <UserAvatar
        name={name || login}
        pictureUrl={photo.data ?? undefined}
        size="lg"
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="truncate text-[0.8125rem] font-medium text-primary">
          {name || (loading ? "Looking up…" : `@${login}`)}
        </span>
        <span className="truncate font-mono text-[0.6875rem] text-secondary">
          @{login}
        </span>
        <span className="truncate text-[0.75rem] text-secondary">
          {email || (loading ? "" : "No DFDS email")}
        </span>
        <Link
          to={`/copilot?user=${encodeURIComponent(login)}`}
          className="mt-1 text-[0.75rem] text-action hover:underline"
        >
          Open Copilot usage
        </Link>
      </div>
    </div>
  );
}

function LoginHover({
  login,
  children,
}: {
  login: string;
  children: React.ReactNode;
}) {
  if (!login) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex min-w-0 max-w-full">{children}</span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="w-[280px] border border-card bg-surface p-3 text-primary shadow-overlay"
      >
        <LoginCard login={login} />
      </TooltipContent>
    </Tooltip>
  );
}

/** The key of the series labelled focus; GitHub logins are case-insensitive. */
function focusedKey(series: ChartSeries[], focus: string | null) {
  const f = focus?.toLowerCase();
  return series.find((s) => s.label.toLowerCase() === f)?.key;
}

function SeriesLegend({
  series,
  focus,
  onFocus,
  logins,
}: {
  series: ChartSeries[];
  focus: string | null;
  onFocus: (label: string | null) => void;
  logins?: boolean;
}) {
  const { isDark } = useTheme();
  const active = focusedKey(series, focus);
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1 text-[11px]">
      {series.map((s) => {
        const color = isDark ? s.darkColor ?? s.color : s.color;
        const on = s.key === active;
        const entry = (
          <button
            type="button"
            aria-pressed={on}
            onClick={() => onFocus(on ? null : s.label)}
            className={cn(
              "inline-flex max-w-[14rem] items-center gap-1 rounded-[3px] border-0 bg-transparent px-1 py-0.5 cursor-pointer hover:bg-surface-muted",
              active !== undefined && !on && "opacity-40",
              on && "font-semibold",
            )}
            style={{ color }}
          >
            <span
              className="h-0.5 w-3 shrink-0"
              style={{ background: color }}
            />
            <span className="truncate">{s.label}</span>
          </button>
        );
        return (
          <LoginHover
            key={s.key}
            login={logins && s.label !== "unknown" ? s.label : ""}
          >
            {entry}
          </LoginHover>
        );
      })}
    </div>
  );
}

function FocusChart({
  chart,
  focus,
  onFocus,
  logins,
  ...props
}: Omit<
  React.ComponentProps<typeof DailyChart>,
  "data" | "series" | "legend" | "highlight"
> & {
  chart: { data: Record<string, string | number>[]; series: ChartSeries[] };
  focus: string | null;
  onFocus: (label: string | null) => void;
  logins?: boolean;
}) {
  const highlight = focusedKey(chart.series, focus);
  return (
    <>
      <DailyChart
        data={chart.data}
        series={chart.series}
        legend={false}
        highlight={highlight}
        {...props}
      />
      {chart.data.length > 0 && (
        <SeriesLegend
          series={chart.series}
          focus={focus}
          onFocus={onFocus}
          logins={logins}
        />
      )}
    </>
  );
}

function fmtHour(h: string): string {
  return new Date(h).toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtHourLong(h: string): string {
  return new Date(h).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CREDIT_BAR = "linear-gradient(90deg, #3b82f6, #a855f7)";
const SPEND_BAR = "linear-gradient(90deg, #4caf50, #eab308, #ef4444)";

function spendColor(ratio: number): string {
  if (ratio > 0.85) return "var(--color-error)";
  if (ratio > 0.5) return "var(--color-warning)";
  return "var(--color-success)";
}

/** Size the gradient to the full track so short bars show only its start. */
function RankBars({
  rows,
  format,
  gradient,
  valueColor,
  link,
}: {
  rows: { name: string; value: number }[];
  format: (n: number) => string;
  gradient: string;
  valueColor: (ratio: number) => string;
  link?: boolean;
}) {
  const max = Math.max(0, ...rows.map((r) => r.value));
  if (rows.length === 0 || max <= 0) {
    return (
      <p className="text-[0.8125rem] text-secondary">
        No AI Credits billed in this range.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
      {rows.map((r) => {
        const ratio = Math.max(r.value, 0) / max;
        return (
          <React.Fragment key={r.name}>
            <span className="truncate text-right text-[0.75rem] text-primary">
              {link && r.name ? (
                <LoginHover login={r.name}>
                  <LoginLink login={r.name} />
                </LoginHover>
              ) : (
                r.name || "unknown"
              )}
            </span>
            <div className="h-4 rounded-[3px] bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-[3px]"
                style={{
                  width: `${ratio * 100}%`,
                  backgroundImage: gradient,
                  backgroundSize:
                    ratio > 0 ? `${100 / ratio}% 100%` : undefined,
                }}
              />
            </div>
            <span
              className="min-w-[5.5rem] text-right font-mono text-[0.9375rem]"
              style={{ color: valueColor(ratio) }}
            >
              {format(r.value)}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function topRows(groups: CreditGroup[], key: "login" | "model", name: string) {
  return [...groups]
    .sort((a, b) => metric(b.totals, name) - metric(a.totals, name))
    .slice(0, 10)
    .map((g) => ({
      name: String(g[key] ?? ""),
      value: metric(g.totals, name),
    }));
}

const HOURLY_TIP =
  "AI Credits that appeared in GitHub's billing report during each hour, taken from the growth between hourly collector runs. It shows when GitHub reported the usage, which can trail the usage itself. History starts with the copilot-insights release that records it.";

function NoHourlyData() {
  return (
    <p className="text-[0.8125rem] text-secondary">
      No hourly data in this range. copilot-insights records it from the second
      AI Credit run after the release that added it.
    </p>
  );
}

const LEGEND_TIP =
  "Click a legend entry to highlight its line; click it again to clear.";

/** copilot-insights' limit on `include`. */
const MAX_ADDED_USERS = 20;

function AddedUsers({
  logins,
  missing,
  onAdd,
  onRemove,
}: {
  logins: string[];
  missing: Set<string>;
  onAdd: (login: string) => void;
  onRemove: (login: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {logins.length < MAX_ADDED_USERS && (
        <CopilotUserPicker
          onSelect={onAdd}
          placeholder="Add a user to the user charts…"
          ariaLabel="Add a user to the user charts"
        />
      )}
      {logins.map((l) => (
        <Badge
          key={l}
          variant="outline"
          className={cn("gap-1 font-mono", missing.has(l) && "text-muted")}
          title={
            missing.has(l) ? "No AI Credits billed in this range." : undefined
          }
        >
          {l}
          <button
            type="button"
            aria-label={`Remove ${l}`}
            onClick={() => onRemove(l)}
            className="inline-flex border-0 bg-transparent p-0 cursor-pointer text-muted hover:text-primary"
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
    </div>
  );
}

const StatsTab = React.memo(function StatsTab({
  scope,
  from,
  to,
  since,
  hourly,
  active,
}: RangedProps & { since?: string; hourly: boolean; active: boolean }) {
  const enabled = { enabled: !!scope && active };
  // A day or two gives the over-time charts one or two points, so short
  // ranges plot the hourly increments instead.
  const over = hourly
    ? {
        path: "credits/hourly",
        total: "none",
        login: "login",
        model: "model",
      }
    : {
        path: "credits/usage",
        total: "day",
        login: "day,login",
        model: "day,model",
      };
  const ranged = { scope, from, to };
  const [added, setAdded] = useState<string[]>([]);
  const [focusLogin, setFocusLogin] = useState<string | null>(null);
  const [focusModel, setFocusModel] = useState<string | null>(null);
  const withAdded = {
    include: added.join(",") || undefined,
  };
  const keep = { ...enabled, keepPrevious: true };
  const byLoginQ = useCopilotAdmin<CopilotCreditUsage>(
    "credits/usage",
    { ...ranged, groupBy: "login", limit: 5000 },
    enabled,
  );
  const byModelQ = useCopilotAdmin<CopilotCreditUsage>(
    "credits/usage",
    { ...ranged, groupBy: "model", limit: 5000 },
    enabled,
  );
  const totalQ = useCopilotAdmin<CopilotCreditUsage>(
    over.path,
    { ...ranged, groupBy: over.total, limit: 5000 },
    enabled,
  );
  const userSpendQ = useCopilotAdmin<CopilotCreditUsage>(
    over.path,
    {
      ...ranged,
      ...withAdded,
      groupBy: over.login,
      top: 10,
      rankBy: "gross_amount",
      limit: 5000,
    },
    keep,
  );
  const userCreditsQ = useCopilotAdmin<CopilotCreditUsage>(
    over.path,
    { ...ranged, ...withAdded, groupBy: over.login, top: 10, limit: 5000 },
    keep,
  );
  const modelQ = useCopilotAdmin<CopilotCreditUsage>(
    over.path,
    { ...ranged, groupBy: over.model, top: 10, limit: 5000 },
    enabled,
  );
  const hourlyQ = useCopilotAdmin<CopilotCreditUsage>(
    "credits/hourly",
    { ...ranged, ...withAdded, groupBy: "login", top: 10, limit: 5000 },
    keep,
  );

  const days = useMemo(() => rangeDays(from, to), [from, to]);
  const hours = useMemo(() => rangeHours(from, to, since), [from, to, since]);
  const xs = hourly ? hours : days;
  const xKey = hourly ? "hour" : "day";
  const xAxis = hourly
    ? { xKey, formatX: fmtHour, formatXLabel: fmtHourLong }
    : {};
  const totalSpend = useMemo(() => {
    let sum = 0;
    const at = new Map(
      (totalQ.data?.data?.groups ?? []).map((g) => [
        String(g[xKey]),
        metric(g.totals, "gross_amount"),
      ]),
    );
    return xs.map((x) => ({ [xKey]: x, gross: (sum += at.get(x) ?? 0) }));
  }, [totalQ.data, xs, xKey]);
  const userSpend = useMemo(
    () =>
      pivot(
        xs,
        xKey,
        userSpendQ.data?.data?.groups ?? [],
        "login",
        "gross_amount",
        true,
      ),
    [userSpendQ.data, xs, xKey],
  );
  const userCredits = useMemo(
    () =>
      pivot(
        xs,
        xKey,
        userCreditsQ.data?.data?.groups ?? [],
        "login",
        "quantity",
        true,
      ),
    [userCreditsQ.data, xs, xKey],
  );
  const modelCredits = useMemo(
    () =>
      pivot(
        xs,
        xKey,
        modelQ.data?.data?.groups ?? [],
        "model",
        "quantity",
        true,
      ),
    [modelQ.data, xs, xKey],
  );
  const perHour = useMemo(
    () =>
      pivot(
        hours,
        "hour",
        hourlyQ.data?.data?.groups ?? [],
        "login",
        "quantity",
        false,
      ),
    [hourlyQ.data, hours],
  );

  const missing = useMemo(() => {
    const seen = new Set(
      (byLoginQ.data?.data?.groups ?? []).map((g) =>
        String(g.login).toLowerCase(),
      ),
    );
    return new Set(added.filter((l) => !seen.has(l.toLowerCase())));
  }, [byLoginQ.data, added]);
  const addUser = (login: string) => {
    if (!added.some((l) => l.toLowerCase() === login.toLowerCase()))
      setAdded([...added, login]);
    setFocusLogin(login);
  };
  const removeUser = (login: string) => {
    setAdded(added.filter((l) => l !== login));
    if (focusLogin?.toLowerCase() === login.toLowerCase()) setFocusLogin(null);
  };

  const credits = (n: number) => fmtInt(n);
  const userCharts = {
    focus: focusLogin,
    onFocus: setFocusLogin,
    logins: true,
  };
  const topLabel = added.length > 0 ? "top 10 and added users" : "top 10";
  const per = hourly
    ? "per hour that GitHub's billing report grew"
    : "per day of GitHub's billing report";
  const orEmpty = (c: CopilotCreditUsage, node: React.ReactNode) =>
    hourly && c.groups.length === 0 ? <NoHourlyData /> : node;
  return (
    <>
      <QueryState query={byLoginQ} height={62}>
        {(c) => (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="Gross"
              value={fmtUsd(metric(c.totals, "gross_amount"))}
            />
            <StatCard
              label="Discounts"
              value={fmtUsd(metric(c.totals, "discount_amount"))}
            />
            <StatCard
              label="Net"
              value={fmtUsd(metric(c.totals, "net_amount"))}
              tip="Gross minus discounts."
            />
          </div>
        )}
      </QueryState>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="Top 10 users by AI Credits">
          <QueryState query={byLoginQ} height={260}>
            {(c) => (
              <RankBars
                rows={topRows(c.groups, "login", "quantity")}
                format={credits}
                gradient={CREDIT_BAR}
                valueColor={() => "var(--color-action)"}
                link
              />
            )}
          </QueryState>
        </Section>
        <Section title="Top 10 users by gross spend">
          <QueryState query={byLoginQ} height={260}>
            {(c) => (
              <RankBars
                rows={topRows(c.groups, "login", "gross_amount")}
                format={fmtUsd}
                gradient={SPEND_BAR}
                valueColor={spendColor}
                link
              />
            )}
          </QueryState>
        </Section>
        <Section title="Top 10 models by AI Credits">
          <QueryState query={byModelQ} height={260}>
            {(c) => (
              <RankBars
                rows={topRows(c.groups, "model", "quantity")}
                format={credits}
                gradient={CREDIT_BAR}
                valueColor={() => "var(--color-action)"}
              />
            )}
          </QueryState>
        </Section>
        <Section title="Top 10 models by gross spend">
          <QueryState query={byModelQ} height={260}>
            {(c) => (
              <RankBars
                rows={topRows(c.groups, "model", "gross_amount")}
                format={fmtUsd}
                gradient={SPEND_BAR}
                valueColor={spendColor}
              />
            )}
          </QueryState>
        </Section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section
          title="Total spend over time"
          tip={`Gross spend summed from the start of the range, ${per}.`}
        >
          <QueryState query={totalQ} height={280}>
            {(c) =>
              orEmpty(
                c,
                <DailyChart
                  data={totalSpend}
                  series={[
                    {
                      key: "gross",
                      label: "Gross spend",
                      kind: "line",
                      color: "#4caf50",
                    },
                  ]}
                  height={280}
                  formatLeft={fmtUsdShort}
                  leftWidth={64}
                  {...xAxis}
                />,
              )
            }
          </QueryState>
        </Section>
        <Section
          title="Model usage over time"
          tip={`AI Credits summed from the start of the range, ${per}, for the 10 models with the most credits. ${LEGEND_TIP}`}
        >
          <QueryState query={modelQ} height={280}>
            {(c) =>
              orEmpty(
                c,
                <FocusChart
                  chart={modelCredits}
                  focus={focusModel}
                  onFocus={setFocusModel}
                  height={280}
                  formatLeft={fmtCompact}
                  leftWidth={56}
                  {...xAxis}
                />,
              )
            }
          </QueryState>
        </Section>
      </div>

      <AddedUsers
        logins={added}
        missing={missing}
        onAdd={addUser}
        onRemove={removeUser}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Section
          title={`User spend over time (${topLabel})`}
          tip={`Gross spend summed from the start of the range, ${per}, for the 10 users with the most spend and any users added above. ${LEGEND_TIP}`}
        >
          <QueryState query={userSpendQ} height={280}>
            {(c) =>
              orEmpty(
                c,
                <FocusChart
                  chart={userSpend}
                  {...userCharts}
                  height={280}
                  formatLeft={fmtUsdShort}
                  leftWidth={64}
                  {...xAxis}
                />,
              )
            }
          </QueryState>
        </Section>
        <Section
          title={`User AI Credit consumption over time (${topLabel})`}
          tip={`AI Credits summed from the start of the range, ${per}, for the 10 users with the most credits and any users added above. ${LEGEND_TIP}`}
        >
          <QueryState query={userCreditsQ} height={280}>
            {(c) =>
              orEmpty(
                c,
                <FocusChart
                  chart={userCredits}
                  {...userCharts}
                  height={280}
                  formatLeft={fmtCompact}
                  leftWidth={56}
                  {...xAxis}
                />,
              )
            }
          </QueryState>
        </Section>
        <Section
          title={`AI Credits per hour (${topLabel})`}
          tip={`${HOURLY_TIP} ${LEGEND_TIP}`}
          className="xl:col-span-2"
        >
          <QueryState query={hourlyQ} height={280}>
            {(h) =>
              h.groups.length === 0 ? (
                <NoHourlyData />
              ) : (
                <FocusChart
                  chart={perHour}
                  {...userCharts}
                  height={280}
                  xKey="hour"
                  formatX={fmtHour}
                  formatXLabel={fmtHourLong}
                  formatLeft={fmtCompact}
                  leftWidth={56}
                />
              )
            }
          </QueryState>
        </Section>
      </div>
    </>
  );
});

const TABS = [
  { id: "summary", label: "Summary", Icon: LayoutDashboard },
  { id: "users", label: "Users", Icon: Users },
  { id: "credits", label: "AI Credits", Icon: Coins },
  { id: "stats", label: "Stats", Icon: BarChart3 },
  { id: "other", label: "Other", Icon: GitPullRequest },
  { id: "system", label: "System", Icon: Server },
] as const;
type Tab = (typeof TABS)[number]["id"];

function useTabParam(): [Tab, (t: Tab) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab = TABS.find((t) => t.id === raw)?.id ?? "summary";
  const setTab = (t: Tab) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (t === "summary") next.delete("tab");
        else next.set("tab", t);
        return next;
      },
      { replace: true },
    );
  return [tab, setTab];
}

/**
 * Stays mounted when another tab is active, since mounting the MRT tables and
 * charts blocks the main thread for ~100ms. It is taken out of flow at full
 * width rather than `display: none`, which gives Recharts a 0x0 container and
 * a warning on every resize. The parent needs `relative`.
 */
function KeptTab({
  id,
  tab,
  children,
}: {
  id: Tab;
  tab: Tab;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        id === tab
          ? "flex flex-col gap-4"
          : "absolute inset-x-0 top-0 h-0 overflow-hidden invisible"
      }
    >
      {children}
    </div>
  );
}

export default function CopilotAdminPage() {
  const { isCloudEngineerEnabled } = useContext(PreAppContext) as any;
  const [tab, setTab] = useTabParam();
  const [statsSeen, setStatsSeen] = useState(tab === "stats");
  if (tab === "stats" && !statsSeen) setStatsSeen(true);
  const [scope, setScope] = useState("");
  const { sel, range, since, setSel } = useRangeParam();

  const scopesQ = useCopilotAdmin<CopilotScope[]>("scopes");
  const scopes = useMemo(
    () => (scopesQ.data?.data ?? []).filter((s) => s.copilotEnabled),
    [scopesQ.data],
  );
  const activeScope =
    scope ||
    (() => {
      const ent = scopes.find((s) => s.kind === "enterprise");
      const first = ent ?? scopes[0];
      return first ? `${first.kind}:${first.name}` : "";
    })();
  const hasScope = { enabled: !!activeScope };
  const ranged = { scope: activeScope, from: range.from, to: range.to };

  const summaryQ = useCopilotAdmin<CopilotSummary>("summary", ranged, hasScope);
  const controls = (
    <div className="flex items-center gap-3 flex-wrap mb-4">
      <label className="inline-flex items-center gap-2 text-[0.75rem] text-secondary">
        Scope
        <select
          className={selectCls}
          value={activeScope}
          onChange={(e) => setScope(e.target.value)}
          disabled={scopes.length === 0}
        >
          {scopes.map((s) => (
            <option key={`${s.kind}:${s.name}`} value={`${s.kind}:${s.name}`}>
              {s.kind === "enterprise" ? "Enterprise" : "Org"}: {s.name}
            </option>
          ))}
        </select>
      </label>
      <RangePicker value={sel} onChange={setSel} />
    </div>
  );

  let body: React.ReactNode;
  if (!isCloudEngineerEnabled) {
    body = (
      <InfoAlert variant="info">
        Turn on CE Mode to load Copilot admin data.
      </InfoAlert>
    );
  } else if (unavailable(scopesQ)) {
    body = (
      <InfoAlert variant="warning">
        copilot-insights is unavailable. selfservice-api could not reach it or
        was refused a token.
      </InfoAlert>
    );
  } else if (scopesQ.isError) {
    body = <QueryState query={scopesQ}>{() => null}</QueryState>;
  } else {
    body = (
      <>
        {controls}
        <div className="relative flex flex-col gap-4">
          <QueryState query={summaryQ} height={62}>
            {(s) => <SummaryTiles summary={s} />}
          </QueryState>

          <TabGroup
            tabs={TABS.map(({ id, label, Icon }) => ({
              id,
              label,
              icon: <Icon size={14} strokeWidth={1.75} />,
            }))}
            value={tab}
            onChange={setTab}
          />

          <KeptTab id="summary" tab={tab}>
            <SummaryTab {...ranged} />
          </KeptTab>
          <KeptTab id="users" tab={tab}>
            <UsersTab {...ranged} />
          </KeptTab>
          <KeptTab id="credits" tab={tab}>
            <CreditsTab {...ranged} />
          </KeptTab>
          <KeptTab id="stats" tab={tab}>
            <StatsTab
              {...ranged}
              since={since}
              hourly={sel.kind === "today" || sel.kind === "hours"}
              active={statsSeen}
            />
          </KeptTab>
          <KeptTab id="other" tab={tab}>
            <OtherTab {...ranged} />
          </KeptTab>

          {tab === "system" && <StatusFooter />}
        </div>
      </>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="px-5 md:px-8 py-6">
        <AdminPageHeader
          title="Copilot"
          subtitle="GitHub Copilot seats, usage and AI Credit cost from copilot-insights."
        />
        {body}
      </div>
    </TooltipProvider>
  );
}

function FactTableEngagement({
  features,
  activeUsers,
}: {
  features: { key1: string; metrics: Record<string, number> }[];
  activeUsers: number;
}) {
  const rows = [...features].sort(
    (a, b) =>
      metric(b.metrics, "engaged_user_count") -
      metric(a.metrics, "engaged_user_count"),
  );
  return (
    <table className="w-full text-[0.8125rem]">
      <thead>
        <tr className="border-b border-divider">
          <th className="text-left py-1.5 pr-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted">
            Feature
          </th>
          <th className="text-right py-1.5 pl-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted">
            Users
          </th>
          <th className="text-right py-1.5 pl-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted">
            Share of {fmtInt(activeUsers)} active
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((f) => {
          const n = metric(f.metrics, "engaged_user_count");
          return (
            <tr
              key={f.key1}
              className="border-b border-divider last:border-b-0"
            >
              <td className="py-1.5 pr-3 text-primary">
                {featureLabel(f.key1)}
              </td>
              <td className="py-1.5 pl-3 text-right font-mono text-secondary">
                {fmtInt(n)}
              </td>
              <td className="py-1.5 pl-3 text-right font-mono text-secondary">
                {activeUsers > 0
                  ? `${Math.round((n / activeUsers) * 100)}%`
                  : "-"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
