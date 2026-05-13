import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMe } from "@/state/remote/queries/me";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { SkeletonCapabilityTableRow } from "@/components/ui/skeleton";
import { LightBulb } from "@/pages/capabilities/RequirementsStatus";
import { AlertCircle, Users } from "lucide-react";
import { computeCostTrendPct } from "@/lib/costUtils";

const MAX_SHOWN = 3;

function isStaleScore(cap) {
  return (
    !cap.modifiedAt ||
    cap.requirementScore == null ||
    new Date(cap.modifiedAt) < new Date(Date.now() - 14 * 86400000)
  );
}

function CostCell({ costs, previousCosts, costsComparisonIsFull }) {
  const hasData = costs && costs.length > 0;
  const total = hasData ? costs.reduce((acc, x) => acc + x.pv, 0) : null;
  const displayedCost =
    total == null ? "—" : total < 1 ? "<$1" : `$${Math.floor(total)}`;
  return (
    <span className="font-mono text-[11px] text-foreground">
      {displayedCost}
    </span>
  );
}

function TrendCell({ costs, previousCosts, costsComparisonIsFull }) {
  const trendPct = computeCostTrendPct(costs ?? [], previousCosts ?? []);

  if (trendPct == null) {
    return (
      <span
        className="font-mono text-[11px] text-muted"
        title="Not enough history to calculate a trend"
      >
        —
      </span>
    );
  }

  const isLower = trendPct < 0;
  return (
    <span
      className="font-mono text-[11px] font-semibold"
      style={{ color: isLower ? "#1a7f3c" : "#c0392b" }}
      title={
        costsComparisonIsFull
          ? "Average daily cost vs. the prior 30-day period"
          : `Approximate — only ${previousCosts.length + costs.length} days of history available`
      }
    >
      {isLower ? "↓" : "↑"} {!costsComparisonIsFull ? "~" : ""}{Math.abs(Math.round(trendPct))}%
    </span>
  );
}

function CapabilityRow({ cap, index }) {
  const isPendingDeletion =
    cap.outstandingActions?.isPendingDeletion === true ||
    cap.status === "Pending Deletion";
  const pendingMembers =
    cap.outstandingActions?.pendingMembershipApplicationCount ?? 0;
  const stale = isStaleScore(cap);

  return (
    <tr
      className={`border-b border-[#eeeeee] dark:border-[#1e2d3d] last:border-0 animate-fade-up${isPendingDeletion ? " opacity-70" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Capability name */}
      <td className="py-[0.5rem] pr-3 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {isPendingDeletion && (
            <AlertCircle size={12} className="text-red-500 shrink-0" title="Pending deletion" />
          )}
          <Link
            to={`/capabilities/${cap.id}`}
            className="text-[12px] font-medium text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline truncate"
          >
            {cap.name}
          </Link>
          {pendingMembers > 0 && (
            <span
              className="inline-flex items-center gap-[3px] font-mono text-[9px] font-semibold tracking-[0.04em] px-1.5 py-[1px] rounded-[4px] bg-[rgba(237,136,0,0.1)] text-[#ed8800] shrink-0"
              title={`${pendingMembers} membership application${pendingMembers > 1 ? "s" : ""} awaiting approval`}
            >
              <Users size={9} />
              {pendingMembers}
            </span>
          )}
        </div>
      </td>

      {/* Compliance score */}
      <td className="py-[0.5rem] pr-3 text-right whitespace-nowrap">
        <span className="inline-flex items-center gap-[4px] font-mono text-[11px] text-muted">
          {stale ? (
            <>
              <LightBulb score={-1} size={9} />
              <span title="Score not updated in the last 14 days">stale</span>
            </>
          ) : (
            <>
              <LightBulb score={cap.requirementScore} size={9} />
              {cap.requirementScore?.toFixed(1)}%
            </>
          )}
        </span>
      </td>

      {/* Cost */}
      <td className="py-[0.5rem] pr-3 text-right whitespace-nowrap">
        <CostCell costs={cap.costs} previousCosts={cap.previousCosts} costsComparisonIsFull={cap.costsComparisonIsFull} />
      </td>

      {/* Trend */}
      <td className="py-[0.5rem] text-right whitespace-nowrap">
        <TrendCell costs={cap.costs} previousCosts={cap.previousCosts} costsComparisonIsFull={cap.costsComparisonIsFull} />
      </td>
    </tr>
  );
}

export default function MyCapabilities() {
  const { isFetched: meFetched, data: meData } = useMe();
  const { query: costsQuery, getCostComparisonForCapability } = useCapabilitiesCost();

  const mine = useMemo(() => {
    if (!meFetched || !meData?.capabilities) return [];
    return [...meData.capabilities]
      .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
      .slice(0, MAX_SHOWN)
      .map((cap) => {
        const { current, previous, hasFullComparison } = getCostComparisonForCapability(cap.id);
        return { ...cap, costs: current, previousCosts: previous, costsComparisonIsFull: hasFullComparison };
      });
  }, [meFetched, meData, costsQuery.isFetched]);

  if (!meFetched) {
    return (
      <div>
        {[0, 1, 2].map((i) => (
          <SkeletonCapabilityTableRow key={i} />
        ))}
      </div>
    );
  }

  if (!mine.length) {
    return (
      <p className="font-mono text-[11px] text-muted tracking-[0.03em]">
        You are not a member of any capabilities yet.{" "}
        <Link to="/capabilities" className="text-action hover:underline">
          Browse all capabilities →
        </Link>
      </p>
    );
  }

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#eeeeee] dark:border-[#1e2d3d]">
            <th className="pb-[0.375rem] pr-3 text-left font-mono text-[10px] font-semibold text-muted tracking-[0.06em] uppercase">
              Capability
            </th>
            <th
              className="pb-[0.375rem] pr-3 text-right font-mono text-[10px] font-semibold text-muted tracking-[0.06em] uppercase cursor-help"
              title="How well this capability satisfies platform requirements. Shown as stale if requirements haven't been reviewed in over 14 days."
            >
              Compliance
            </th>
            <th
              className="pb-[0.375rem] pr-3 text-right font-mono text-[10px] font-semibold text-muted tracking-[0.06em] uppercase cursor-help"
              title="Total AWS cost over the last 30 days."
            >
              Cost (30d)
            </th>
            <th
              className="pb-[0.375rem] text-right font-mono text-[10px] font-semibold text-muted tracking-[0.06em] uppercase cursor-help"
              title="Change in average daily cost compared to the prior 30-day period. ~ means the comparison is based on partial history."
            >
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {mine.map((cap, i) => (
            <CapabilityRow key={cap.id} cap={cap} index={i} />
          ))}
        </tbody>
      </table>
      <div className="pt-[0.625rem]">
        <Link
          to="/capabilities"
          className="font-mono text-[11px] text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline tracking-[0.03em]"
        >
          View all capabilities →
        </Link>
      </div>
    </div>
  );
}
