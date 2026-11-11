import React, { useMemo, useState } from "react";
import {
  useCopilotAdmin,
  type CopilotAdminSeat,
  type CopilotUserTotals,
} from "@/state/remote/queries/copilot";
import { Badge } from "@/components/ui/badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  type Column,
  DataTable,
  Section,
  acceptanceRate,
  daysSince,
  fmtAgo,
  fmtDay,
  fmtDec,
  fmtInt,
  metric,
  selectCls,
} from "@/pages/copilot/shared";
import {
  hasData,
  QueryState,
  LoginLink,
  type RangedProps,
  seatsParams,
} from "./common";

interface UserRow {
  login: string;
  email: string;
  seat?: CopilotAdminSeat;
  usage?: CopilotUserTotals;
}

/**
 * With seatedOnly, exclude usage-only users because seats are filtered by inactivity.
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

const INACTIVE_OPTIONS = [0, 14, 30, 60, 90];

export const UsersTab = React.memo(function UsersTab({
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

  // Keep the section header until the table can render its own toolbar.
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
                initialSort={{ id: "credits", desc: true }}
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
