import React, { useMemo } from "react";
import {
  useCopilotAdmin,
  type CopilotAdminSeat,
  type CopilotCreditUsage,
  type CopilotUserTotals,
} from "@/state/remote/queries/copilot";
import {
  type Column,
  DataTable,
  Section,
  fmtDec,
  fmtUsd,
  metric,
} from "@/pages/copilot/shared";
import { QueryState, LoginLink, type RangedProps, seatsParams } from "./common";

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

const loginCreditCols = creditColumns("login", "Login");

const modelCreditCols = creditColumns("model", "Model");

export const CreditsTab = React.memo(function CreditsTab({
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
