import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMe } from "@/state/remote/queries/me";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { SkeletonCapabilityTableRow } from "@/components/ui/skeleton";
import { LightBulb } from "@/pages/capabilities/RequirementsStatus";
import { AlertCircle, Users } from "lucide-react";
import CapabilityCostSummary from "@/components/BasicCapabilityCost";

const MAX_SHOWN = 5;

function isStaleScore(cap) {
  return (
    !cap.modifiedAt ||
    cap.requirementScore == null ||
    new Date(cap.modifiedAt) < new Date(Date.now() - 14 * 86400000)
  );
}

function CapabilityItem({ cap, index }) {
  const isPendingDeletion =
    cap.outstandingActions?.isPendingDeletion === true ||
    cap.status === "Pending Deletion";
  const pendingMembers =
    cap.outstandingActions?.pendingMembershipApplicationCount ?? 0;
  const stale = isStaleScore(cap);

  return (
    <div
      className={`py-[0.625rem] border-b border-[#eeeeee] dark:border-[#1e2d3d] first:pt-0 last:border-0 last:pb-0 animate-fade-up${isPendingDeletion ? " opacity-70" : ""
        }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Name row */}
      <div className="flex items-start gap-1.5 mb-[4px]">
        {isPendingDeletion && (
          <AlertCircle size={13} className="text-red-500 shrink-0 mt-[2px]" />
        )}
        <Link
          to={`/capabilities/${cap.id}`}
          className="text-[13px] font-medium text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline leading-[1.35] flex-1 min-w-0 truncate"
        >
          {cap.name}
        </Link>
      </div>

      {/* Metrics row */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: requirement score */}
        <span className="inline-flex items-center gap-[4px] font-mono text-[10px] text-muted shrink-0">
          {stale ? (
            <>
              <LightBulb score={-1} size={9} />
              stale
            </>
          ) : (
            <>
              <LightBulb score={cap.requirementScore} size={9} />
              {cap.requirementScore?.toFixed(1)}%
            </>
          )}
        </span>

        {/* Right: badges + cost */}
        <div className="flex items-center gap-2 shrink-0">
          {isPendingDeletion && (
            <span className="inline-flex items-center gap-[3px] font-mono text-[9px] font-semibold tracking-[0.04em] px-1.5 py-[1px] rounded-[4px] bg-[rgba(220,38,38,0.1)] text-[#dc2626]">
              <AlertCircle size={9} />
              Pending deletion
            </span>
          )}

          {pendingMembers > 0 && (
            <span className="inline-flex items-center gap-[3px] font-mono text-[9px] font-semibold tracking-[0.04em] px-1.5 py-[1px] rounded-[4px] bg-[rgba(237,136,0,0.1)] text-[#ed8800]">
              <Users size={9} />
              {pendingMembers} pending
            </span>
          )}

          <CapabilityCostSummary data={cap.costs} previousData={cap.previousCosts} />
        </div>
      </div>
    </div>
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
        const { current, previous } = getCostComparisonForCapability(cap.id);
        return { ...cap, costs: current, previousCosts: previous };
      });
  }, [meFetched, meData, costsQuery.isFetched]);

  if (!meFetched) {
    return (
      <div>
        {[0, 1, 2, 3, 4].map((i) => (
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
      {mine.map((cap, i) => (
        <CapabilityItem key={cap.id} cap={cap} index={i} />
      ))}
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
