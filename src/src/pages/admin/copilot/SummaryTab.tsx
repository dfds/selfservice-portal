import React from "react";
import {
  useCopilotAdmin,
  type CopilotBudgetItem,
  type CopilotOrgDay,
  type CopilotSeatHistoryDay,
  type CopilotSummary,
} from "@/state/remote/queries/copilot";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  DailyChart,
  Section,
  featureLabel,
  fmtDay,
  fmtInt,
  fmtUsd,
  metric,
  monthLabel,
} from "@/pages/copilot/shared";
import { QueryState, type RangedProps } from "./common";

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

export const SummaryTab = React.memo(function SummaryTab({
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
