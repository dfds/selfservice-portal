import React, { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCopilotMe,
  useCopilotMeCredits,
  useCopilotUser,
  useCopilotUserCredits,
  useCopilotUserSearch,
  useGraphDisplayName,
  useGraphPhoto,
  type CopilotBudget,
  type CopilotCredits,
  type CopilotMe,
  type CopilotSeat,
  type CopilotUnmappedReason,
} from "@/state/remote/queries/copilot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/IconButton";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { HintTooltip, TooltipProvider } from "@/components/ui/tooltip";
import {
  DailyChart,
  FactTable,
  PACE_LIMITS,
  type BudgetPace,
  Freshness,
  Section,
  acceptanceRate,
  budgetPace,
  featureLabel,
  fmtAgo,
  fmtCompact,
  fmtDay,
  fmtDec,
  fmtInt,
  fmtUsd,
  monthDays,
  monthLabel,
  rollUpFacts,
  today,
  type MonthDay,
  type Pace,
} from "./shared";
import { cn } from "@/lib/utils";
import { CopilotUserPicker } from "./CopilotUserPicker";
import { RangePicker, useRangeParam } from "./RangePicker";

const UNMAPPED_TEXT: Record<CopilotUnmappedReason, React.ReactNode> = {
  not_mapped: (
    <>
      Follow all the steps described in this{" "}
      <a
        href="https://wiki.dfds.cloud/en/playbooks/Copilot/getting-started"
        target="_blank"
        rel="noopener noreferrer"
        className="text-action hover:underline"
      >
        wiki article
      </a>{" "}
      in order to get started.
    </>
  ),
  no_dfds_email: (
    <>
      Your sign-in token carries no DFDS email address, so there is nothing to
      match against a GitHub account.
    </>
  ),
  service_principal: (
    <>Copilot usage is only available for people, not service principals.</>
  ),
  user_not_found: (
    <>No GitHub account in the DFDS organizations has this login.</>
  ),
};

interface HeaderProps {
  me?: CopilotMe;
  /** The login from `?user=`, when the caller may view other users. */
  viewing: string;
  canViewOthers: boolean;
  onSelectUser: (login: string) => void;
  onClearUser: () => void;
}

function Header({
  me,
  viewing,
  canViewOthers,
  onSelectUser,
  onClearUser,
}: HeaderProps) {
  const title = viewing
    ? `Copilot usage for ${me?.name || `@${me?.login ?? viewing}`}`
    : "Copilot usage";
  return (
    <div className="mb-6 animate-fade-up flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <div className="font-mono text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-action mb-1.5">
          {"// Copilot"}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-mono text-[1.75rem] font-bold leading-[1.2] tracking-[-0.02em] text-primary">
            {title}
          </h1>
          {me?.login && (
            <span className="relative top-[2px] rounded-full bg-surface-muted px-2.5 py-0.5 font-mono text-[0.75rem] text-muted">
              @{me.login}
            </span>
          )}
        </div>
      </div>
      {canViewOthers && (
        <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
          <CopilotUserPicker onSelect={onSelectUser} />
          {viewing && (
            <Button variant="outline" size="sm" onClick={onClearUser}>
              <ArrowLeft size={13} aria-hidden="true" />
              Back to my usage
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** undefined while the email is loading, null when there is none. */
interface Profile {
  name?: string | null;
  photo?: string;
  email: string | null | undefined;
}

const seatGridCls =
  "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[0.8125rem]";

function ProfileRows({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar
        name={profile.name ?? undefined}
        pictureUrl={profile.photo}
        className="w-11 h-11 text-[0.8125rem]"
      />
      <div className={seatGridCls}>
        <span className="text-muted">Name</span>
        <span className="text-primary">{profile.name || "Unknown"}</span>
        <span className="text-muted">Email</span>
        <span className="text-primary">
          {profile.email === undefined ? (
            <Skeleton className="h-4 w-[200px]" />
          ) : (
            profile.email || "Unknown"
          )}
        </span>
      </div>
    </div>
  );
}

function SeatCard({
  me,
  viewing,
  profile,
}: {
  me: CopilotMe;
  viewing: boolean;
  profile?: Profile;
}) {
  if (!me.seated) {
    return (
      <Section title="Seat">
        <div className="flex flex-col gap-3">
          {profile && <ProfileRows profile={profile} />}
          <p className="text-[0.8125rem] text-secondary">
            {viewing ? `@${me.login} has` : "You have"} no Copilot seat in the
            DFDS organizations.
          </p>
        </div>
      </Section>
    );
  }
  return (
    <Section title="Seat">
      <div className="flex flex-col gap-3">
        {profile && <ProfileRows profile={profile} />}
        {me.seats.map((s: CopilotSeat) => (
          <div key={`${s.scope}/${s.orgName ?? ""}`} className={seatGridCls}>
            <span className="text-muted">Assigned by</span>
            <span className="text-primary flex items-center gap-2 flex-wrap">
              {s.orgName ?? s.scope}
              {s.planType && <Badge variant="secondary">{s.planType}</Badge>}
              {s.pendingCancellationDate && (
                <Badge variant="soft-warning">
                  Ends {fmtDay(s.pendingCancellationDate)}
                </Badge>
              )}
            </span>
            <span className="text-muted">Assigned</span>
            <span className="text-primary">{fmtDay(s.createdAt)}</span>
            <span className="text-muted">Last activity</span>
            <span className="text-primary">
              {fmtAgo(s.lastActivityAt)}
              {s.lastActivityEditor && (
                <span className="text-muted font-mono text-[0.75rem] ml-2">
                  {s.lastActivityEditor.split("/")[0]}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function RangeStats({ me }: { me: CopilotMe }) {
  const t = useMemo(() => {
    let prompts = 0;
    let generated = 0;
    let accepted = 0;
    let locAdded = 0;
    let credits = 0;
    let active = 0;
    for (const d of me.daily) {
      prompts += d.interactions ?? 0;
      generated += d.codeGenerations ?? 0;
      accepted += d.codeAcceptances ?? 0;
      locAdded += d.locAdded ?? 0;
      credits += d.aiCreditsUsed ?? 0;
      active++;
    }
    return { prompts, generated, accepted, locAdded, credits, active };
  }, [me.daily]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="Days active"
        value={fmtInt(t.active)}
        tip="Days with at least one Copilot event in the selected range."
      />
      <StatCard
        label="Prompts"
        value={fmtInt(t.prompts)}
        tip="Chat and agent messages sent to Copilot."
      />
      <StatCard
        label="Code generated"
        value={fmtInt(t.generated)}
        tip="Completions and code blocks Copilot produced."
      />
      <StatCard
        label="Acceptance"
        value={acceptanceRate(t.accepted, t.generated)}
        tip="Accepted suggestions as a share of generated ones."
      />
      <StatCard
        label="Lines added"
        value={<span title={fmtInt(t.locAdded)}>{fmtCompact(t.locAdded)}</span>}
      />
      <StatCard
        label="AI Credits"
        value={<span title={fmtDec(t.credits)}>{fmtCompact(t.credits)}</span>}
        tip="AI Credits reported in GitHub's usage report for these days."
      />
    </div>
  );
}

function Latest28d({ me }: { me: CopilotMe }) {
  const p = me.latest28d;
  if (!p) {
    return (
      <Section title="Last 28 days">
        <p className="text-[0.8125rem] text-secondary">
          No Copilot activity in the 28 days up to {fmtDay(me.meta.to)}.
        </p>
      </Section>
    );
  }
  const ides = rollUpFacts(p.breakdowns.ide);
  const features = rollUpFacts(p.breakdowns.feature);
  const languages = rollUpFacts(p.breakdowns.language_model, "key1");
  const models = rollUpFacts(p.breakdowns.model_feature, "key1");

  return (
    <Section title={`Last 28 days · ${fmtDay(p.from)} – ${fmtDay(p.to)}`}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-[0.75rem] font-semibold text-secondary mb-1">
            Editors
          </p>
          <FactTable facts={ides} keyHeader="Editor" />
        </div>
        <div>
          <p className="text-[0.75rem] font-semibold text-secondary mb-1">
            Features
          </p>
          <FactTable
            facts={features}
            keyHeader="Feature"
            labelFor={featureLabel}
          />
        </div>
        <div>
          <p className="text-[0.75rem] font-semibold text-secondary mb-1">
            Languages
          </p>
          <FactTable facts={languages.slice(0, 10)} keyHeader="Language" />
        </div>
        <div>
          <p className="text-[0.75rem] font-semibold text-secondary mb-1">
            Models
          </p>
          <FactTable facts={models.slice(0, 10)} keyHeader="Model" />
        </div>
      </div>
    </Section>
  );
}

const PACE_BADGE: Record<Pace, { label: string; className: string }> = {
  on: {
    label: "Stable",
    className: "bg-[rgba(14,124,193,0.1)] text-action",
  },
  fast: {
    label: "Spending fast",
    className: "bg-[rgba(237,136,0,0.1)] text-[var(--color-warning)]",
  },
  over: {
    label: "Likely to exceed budget",
    className: "bg-[rgba(190,30,45,0.1)] text-[var(--color-error)]",
  },
  exceeded: {
    label: "Budget exceeded",
    className: "bg-[rgba(190,30,45,0.1)] text-[var(--color-error)]",
  },
};

const MAX_RUNWAY_DAYS = 30;

function paceTip(p: BudgetPace): React.ReactNode {
  const pct = (n: number) => `${Math.round(n)}%`;
  const verdict =
    p.pace === "on"
      ? `Up to ${PACE_LIMITS.on}% is on pace: the budget lasts until the reset.`
      : p.pace === "fast"
      ? `${PACE_LIMITS.on}% to ${PACE_LIMITS.fast}% is spending fast: the budget may run out a few days before the reset.`
      : p.pace === "exceeded"
      ? "The budget is spent."
      : `Above ${PACE_LIMITS.fast}% is over pace: the budget will likely run out well before the reset.`;
  return (
    <>
      Spending at <strong>{pct(p.pacePct)}</strong> of budget pace.{" "}
      {pct(p.spentPct)} of the budget is spent and {pct(p.timePct)} of this
      month's workdays have passed. {verdict}
    </>
  );
}

function PaceStat({ label, children }: { label: string; children: string }) {
  return (
    <span className="text-[0.8125rem] text-primary">
      <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted mr-1.5">
        {label}
      </span>
      <span className="font-mono font-semibold">{children}</span>
    </span>
  );
}

function DayStrip({
  label,
  days,
  now,
  cell,
}: {
  label: string;
  days: MonthDay[];
  now: string;
  cell: (d: MonthDay) => { className: string; title: string };
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </span>
      {/* Cells take their outline from an inset ring, not a border: with
          flex-1 a border sets a minimum width, and the two strips border
          different days, so their columns would drift apart. */}
      <div className="flex flex-1 gap-[3px]">
        {days.map((d, i) => {
          const c = cell(d);
          const monday =
            i > 0 && new Date(`${d.day}T00:00:00Z`).getUTCDay() === 1;
          return (
            <div
              key={d.day}
              title={c.title}
              className={cn(
                "h-2.5 flex-1 rounded-[2px]",
                monday && "ml-1.5",
                d.day === now &&
                  "outline outline-1 outline-offset-1 outline-[var(--color-text-primary)]",
                c.className,
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

function BudgetBar({
  budget,
  viewing,
  byDay,
}: {
  budget?: CopilotBudget | null;
  viewing: boolean;
  byDay?: CopilotCredits["byDay"];
}) {
  if (!budget) {
    return (
      <p className="text-[0.8125rem] text-secondary mb-4">
        No AI Credit budget covers {viewing ? "this user" : "you"} this month.
      </p>
    );
  }
  const pct = budget.amount > 0 ? (budget.consumed / budget.amount) * 100 : 0;
  const color =
    pct >= 90
      ? "var(--color-error)"
      : pct >= 75
      ? "var(--color-warning)"
      : "var(--color-action)";
  const now = today();
  const days = monthDays(+now.slice(0, 4), +now.slice(5, 7));
  const pace = budgetPace(budget.amount, budget.consumed, days, now);
  const used = new Map((byDay ?? []).map((d) => [d.day.slice(0, 10), d]));
  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1.5">
        <span className="text-[0.8125rem] text-primary">
          <span className="font-mono font-semibold">
            {fmtUsd(budget.consumed)}
          </span>{" "}
          of the {fmtUsd(budget.amount)} monthly budget used
        </span>
        <span className="font-mono text-[0.75rem] text-muted">
          {Math.round(pct)}%
        </span>
      </div>
      <ProgressBar
        value={pct}
        color={color}
        role="progressbar"
        aria-label="Monthly AI Credit budget used"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <p className="text-[0.75rem] text-muted mt-1.5">
        Updated hourly. Resets in {pace.daysToReset}{" "}
        {pace.daysToReset === 1 ? "day" : "days"} on {fmtDay(pace.resetsOn)}.
        {budget.preventFurtherUsage &&
          " When the budget is spent you lose access to GitHub Copilot until the reset."}
      </p>
      {byDay && (
        <>
          <div className="flex items-center gap-x-5 gap-y-2 flex-wrap mt-3">
            <HintTooltip tip={paceTip(pace)} side="bottom">
              <span tabIndex={0} className="cursor-help rounded-full">
                <Badge
                  className={cn(
                    "font-mono tracking-[0.06em]",
                    PACE_BADGE[pace.pace].className,
                  )}
                >
                  {PACE_BADGE[pace.pace].label}
                </Badge>
              </span>
            </HintTooltip>
            <PaceStat label="Avg/workday">
              {fmtUsd(pace.avgPerWorkday)}
            </PaceStat>
            <PaceStat label="Runway">
              {`${
                pace.runwayDays === null || pace.runwayDays > MAX_RUNWAY_DAYS
                  ? `${MAX_RUNWAY_DAYS}+`
                  : pace.runwayDays.toFixed(1)
              } workdays of budget / ${pace.workdaysLeft} workdays left`}
            </PaceStat>
          </div>
          <div className="grid gap-1.5 mt-3">
            <DayStrip
              label="Time"
              days={days}
              now={now}
              cell={(d) => ({
                title: `${fmtDay(d.day)}${d.weekend ? ", weekend" : ""}`,
                className:
                  d.day > now
                    ? "ring-1 ring-inset ring-[var(--color-border-card)]"
                    : d.weekend
                    ? "bg-[var(--color-border-card)]"
                    : "bg-[var(--color-text-muted)]",
              })}
            />
            <DayStrip
              label="Usage"
              days={days}
              now={now}
              cell={(d) => {
                const u = used.get(d.day);
                return u && u.quantity > 0
                  ? {
                      title: `${fmtDay(d.day)}: ${fmtDec(
                        u.quantity,
                      )} credits, ${fmtUsd(u.grossAmount)}`,
                      className: "bg-[var(--color-action)]",
                    }
                  : {
                      title: `${fmtDay(d.day)}: no AI Credits`,
                      className:
                        d.day > now
                          ? "ring-1 ring-inset ring-[var(--color-border-card)]"
                          : "bg-surface-muted ring-1 ring-inset ring-[var(--color-border-divider)]",
                    };
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

const MODEL_ROW_HEIGHT = 30;
const MODEL_HEAD_HEIGHT = 28;
const MODEL_FOOT_HEIGHT = 32;
/**
 * The header's bottom rule is its last pixel row and the footer's top rule its
 * first, so a 1px chart line centred half a pixel inward covers each exactly.
 */
const MODEL_FRAME = {
  top: MODEL_HEAD_HEIGHT - 0.5,
  bottom: MODEL_FOOT_HEIGHT - 0.5,
};
const MODEL_COLS =
  "grid grid-cols-[minmax(0,1fr)_6.5rem_6.5rem] gap-x-3 items-center shrink-0";
const MODEL_HEAD =
  "font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-muted";

function ModelTable({ credits }: { credits: CopilotCredits }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = credits.byModel;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => MODEL_ROW_HEIGHT,
    overscan: 8,
  });

  return (
    // Header and total sit inside the scroller as sticky rows so a
    // non-overlay scrollbar narrows all three grids equally. min-h keeps the
    // chart beside it readable; mt-auto then holds the total at the bottom.
    <div
      ref={scrollRef}
      className="flex flex-col text-[0.8125rem] min-w-0 overflow-y-auto min-h-[200px] max-h-[16rem]"
    >
      <div
        className={cn(
          MODEL_COLS,
          "sticky top-0 z-10 bg-surface border-b border-divider",
        )}
        style={{ height: MODEL_HEAD_HEIGHT }}
      >
        <span className={MODEL_HEAD}>Model</span>
        <span className={cn(MODEL_HEAD, "text-right")}>Credits</span>
        <span className={cn(MODEL_HEAD, "text-right")}>USD</span>
      </div>
      <div
        className="relative w-full shrink-0"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((vi) => {
          const m = rows[vi.index];
          return (
            <div
              key={m.model}
              className={cn(
                MODEL_COLS,
                "absolute top-0 left-0 w-full items-center border-b border-divider",
              )}
              style={{
                height: MODEL_ROW_HEIGHT,
                transform: `translateY(${vi.start}px)`,
              }}
            >
              <span className="text-primary truncate" title={m.model}>
                {m.model || "unknown"}
              </span>
              <span className="text-right font-mono text-secondary">
                {fmtDec(m.quantity)}
              </span>
              <span className="text-right font-mono text-secondary">
                {fmtUsd(m.grossAmount)}
              </span>
            </div>
          );
        })}
      </div>
      <div
        className={cn(
          MODEL_COLS,
          "sticky bottom-0 z-10 mt-auto bg-surface border-t border-card",
        )}
        style={{ height: MODEL_FOOT_HEIGHT }}
      >
        <span className="font-semibold text-primary">Total</span>
        <span className="text-right font-mono font-semibold text-primary">
          {fmtDec(credits.totals.quantity)}
        </span>
        <span className="text-right font-mono font-semibold text-primary">
          {fmtUsd(credits.totals.grossAmount)}
        </span>
      </div>
    </div>
  );
}

function MonthCredits({
  login,
  budget,
}: {
  login: string;
  budget?: CopilotBudget | null;
}) {
  const now = new Date();
  const [ym, setYm] = useState({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  });
  const own = useCopilotMeCredits({ ...ym, enabled: login === "" });
  const other = useCopilotUserCredits({ ...ym, login });
  const { data, isFetched, isError } = login ? other : own;
  const isCurrent =
    ym.year === now.getUTCFullYear() && ym.month === now.getUTCMonth() + 1;

  function shift(delta: number) {
    const d = new Date(Date.UTC(ym.year, ym.month - 1 + delta, 1));
    setYm({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  }

  const label = monthLabel(ym.year, ym.month);
  const credits = data?.credits;

  return (
    <Section
      title="AI Credits by month"
      tip="From GitHub's AI Credit billing report, at list price. The credits included with each seat are shared across DFDS and used up early in the month, so they are not deducted per person."
      actions={
        <div className="flex items-center gap-1">
          <IconButton
            size="sm"
            onClick={() => shift(-1)}
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </IconButton>
          <span className="font-mono text-[0.75rem] text-primary min-w-[8.5rem] text-center">
            {label}
            {isCurrent && " (to date)"}
          </span>
          <IconButton
            size="sm"
            onClick={() => shift(1)}
            disabled={isCurrent}
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </IconButton>
        </div>
      }
    >
      {isCurrent && (
        <BudgetBar
          budget={budget}
          viewing={login !== ""}
          byDay={isFetched && !isError ? credits?.byDay ?? [] : undefined}
        />
      )}
      {!isFetched ? (
        <Skeleton className="h-[180px] w-full" />
      ) : isError || !data?.meta.copilotAvailable ? (
        <InfoAlert variant="warning">
          AI Credit data is unavailable right now.
        </InfoAlert>
      ) : !credits || credits.byModel.length === 0 ? (
        <p className="text-[0.8125rem] text-secondary">
          No AI Credits used in {label}.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ModelTable credits={credits} />
          {/* The chart is absolute so its measured pixel height cannot grow
              the grid row; the row takes the table's height. */}
          <div className="relative min-h-[200px]">
            <div className="absolute inset-0">
              <DailyChart
                data={credits.byDay}
                height="100%"
                frame={MODEL_FRAME}
                formatLeft={fmtDec}
                formatRight={fmtUsd}
                series={[
                  {
                    key: "quantity",
                    label: "Credits",
                    kind: "bar",
                    color: "#0e7cc1",
                    darkColor: "#60a5fa",
                  },
                  {
                    key: "grossAmount",
                    label: "USD",
                    kind: "line",
                    color: "#ed8800",
                    right: true,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-[110px] w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[62px]" />
        ))}
      </div>
      <Skeleton className="h-[280px] w-full" />
    </div>
  );
}

export default function CopilotPage() {
  const { sel, range, setSel } = useRangeParam();
  const [searchParams, setSearchParams] = useSearchParams();

  // `?user=` is honoured only once /copilot/me confirms copilot/read-all.
  const own = useCopilotMe(range);
  const canViewOthers = !!own.data?._links?.users;
  const viewing = canViewOthers ? searchParams.get("user")?.trim() ?? "" : "";
  const other = useCopilotUser({ ...range, login: viewing });
  const { data: me, isFetched, isError } = viewing ? other : own;
  // /copilot/users/{login} carries no email; the search result does.
  const search = useCopilotUserSearch(viewing);
  const match = search.data?.items.find(
    (u) => u.login.toLowerCase() === viewing.toLowerCase(),
  );
  const upn = match?.primaryEmail ?? "";
  const graphName = useGraphDisplayName(upn);
  const photo = useGraphPhoto(upn);
  const profile: Profile | undefined = viewing
    ? {
        name: graphName.data || me?.name || match?.name,
        photo: photo.data ?? undefined,
        email: match
          ? match.primaryEmail ?? null
          : search.isFetching
          ? undefined
          : null,
      }
    : undefined;

  const setUser = (login: string) =>
    setSearchParams((p) => {
      const next = new URLSearchParams(p);
      if (login) next.set("user", login);
      else next.delete("user");
      return next;
    });

  const chartData = useMemo(
    () =>
      (me?.daily ?? []).map((d) => ({
        day: d.day,
        interactions: d.interactions ?? 0,
        codeGenerations: d.codeGenerations ?? 0,
        codeAcceptances: d.codeAcceptances ?? 0,
      })),
    [me?.daily],
  );

  let body: React.ReactNode;
  if (!isFetched) {
    body = <LoadingState />;
  } else if (isError || !me) {
    body = (
      <InfoAlert variant="error">
        Could not load {viewing ? "this user's" : "your"} Copilot usage. Try
        again in a minute.
      </InfoAlert>
    );
  } else if (!me.meta.copilotAvailable) {
    body = (
      <InfoAlert variant="warning">
        Copilot usage data is unavailable right now. The Copilot Insights
        service did not answer; try again later.
      </InfoAlert>
    );
  } else if (!me.mapped) {
    body = (
      <InfoAlert variant="info">
        <p className="font-semibold mb-1">
          {viewing
            ? `No GitHub account with the login @${viewing}`
            : "No linked GitHub account"}
        </p>
        <p>{UNMAPPED_TEXT[me.unmappedReason ?? "not_mapped"]}</p>
      </InfoAlert>
    );
  } else {
    body = (
      <div className="flex flex-col gap-4">
        <SeatCard me={me} viewing={!!viewing} profile={profile} />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <RangePicker value={sel} onChange={setSel} />
          <Freshness generatedAt={me.meta.freshness?.reports} label="Usage" />
        </div>
        <RangeStats me={me} />
        <MonthCredits key={viewing} login={viewing} budget={me.budget} />
        <Section title="Daily activity">
          <DailyChart
            data={chartData}
            series={[
              {
                key: "interactions",
                label: "Prompts",
                kind: "bar",
                color: "#002b45",
                darkColor: "#94a3b8",
              },
              {
                key: "codeGenerations",
                label: "Code generated",
                kind: "bar",
                color: "#0e7cc1",
                darkColor: "#60a5fa",
              },
              {
                key: "codeAcceptances",
                label: "Accepted",
                kind: "line",
                color: "#4caf50",
              },
            ]}
          />
        </Section>
        <Latest28d me={me} />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="px-5 md:px-8 py-6">
        <Header
          me={me?.mapped ? me : undefined}
          viewing={viewing}
          canViewOthers={canViewOthers}
          onSelectUser={setUser}
          onClearUser={() => setUser("")}
        />
        {body}
      </div>
    </TooltipProvider>
  );
}
