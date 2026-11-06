import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCopilotAdmin,
  type CopilotCreditUsage,
} from "@/state/remote/queries/copilot";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/StatCard";
import { CopilotUserPicker } from "@/pages/copilot/CopilotUserPicker";
import {
  DailyChart,
  Section,
  fmtCompact,
  fmtDay,
  fmtInt,
  fmtUsd,
  fmtUsdShort,
  metric,
} from "@/pages/copilot/shared";
import { QueryState, type RangedProps } from "./common";
import {
  rangeDays,
  rangeHours,
  pivot,
  fmtHour,
  fmtHourLong,
  topRows,
} from "./statsData";
import { FocusChart } from "./FocusChart";
import { CREDIT_BAR, SPEND_BAR, spendColor, RankBars } from "./RankBars";

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

export const StatsTab = React.memo(function StatsTab({
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
  // credits/hourly narrows to `since`; credits/usage is per UTC day and
  // rejects it.
  const hourRanged = { ...ranged, since };
  const overRanged = hourly ? hourRanged : ranged;
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
    { ...overRanged, groupBy: over.total, limit: 5000 },
    enabled,
  );
  const userSpendQ = useCopilotAdmin<CopilotCreditUsage>(
    over.path,
    {
      ...overRanged,
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
    { ...overRanged, ...withAdded, groupBy: over.login, top: 10, limit: 5000 },
    keep,
  );
  const modelQ = useCopilotAdmin<CopilotCreditUsage>(
    over.path,
    { ...overRanged, groupBy: over.model, top: 10, limit: 5000 },
    enabled,
  );
  const hourlyQ = useCopilotAdmin<CopilotCreditUsage>(
    "credits/hourly",
    { ...hourRanged, ...withAdded, groupBy: "login", top: 10, limit: 5000 },
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
      {since && (
        <p className="text-description">
          Totals and top 10 lists come from GitHub's daily billing report, so
          they cover {fmtDay(from)}
          {from !== to && ` – ${fmtDay(to)}`} (UTC). The charts over time start
          at {fmtHourLong(since)}.
        </p>
      )}
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
