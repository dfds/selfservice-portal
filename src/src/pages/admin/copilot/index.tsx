import React, { useContext, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Coins,
  GitPullRequest,
  LayoutDashboard,
  Server,
  Users,
} from "lucide-react";
import PreAppContext from "@/preAppContext";
import {
  useCopilotAdmin,
  type CopilotScope,
  type CopilotSummary,
} from "@/state/remote/queries/copilot";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { StatCard } from "@/components/ui/StatCard";
import { TabGroup } from "@/components/ui/TabGroup";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  acceptanceRate,
  fmtCompact,
  fmtDec,
  fmtInt,
  metric,
  selectCls,
} from "@/pages/copilot/shared";
import { RangePicker, useRangeParam } from "@/pages/copilot/RangePicker";
import { unavailable, QueryState } from "./common";
import { SummaryTab } from "./SummaryTab";
import { UsersTab } from "./UsersTab";
import { CreditsTab } from "./CreditsTab";
import { OtherTab } from "./OtherTab";
import { StatusFooter } from "./StatusFooter";
import { StatsTab } from "./StatsTab";

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
 * Keep inactive tabs mounted to avoid ~100ms of table and chart setup per switch.
 * Preserve full width because `display: none` gives Recharts a 0x0 container.
 * Requires a positioned parent.
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
