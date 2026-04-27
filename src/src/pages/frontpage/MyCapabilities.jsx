import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { SkeletonCapabilityTableRow } from "@/components/ui/skeleton";
import { LightBulb } from "@/pages/capabilities/RequirementsStatus";
import { AlertCircle, Users } from "lucide-react";

const MAX_SHOWN = 6;

function avgCostText(costs) {
  if (!costs || costs.length === 0) return null;
  const avg = Math.floor(costs.reduce((s, x) => s + x.pv, 0) / costs.length);
  return avg < 1 ? "<$1/d" : `$${avg}/d`;
}

function isStaleScore(cap) {
  return (
    !cap.modifiedAt ||
    cap.requirementScore == null ||
    new Date(cap.modifiedAt) < new Date(Date.now() - 14 * 86400000)
  );
}

function sortByImportance(a, b) {
  // Pending deletion first
  const aDel = a.status === "Pending Deletion";
  const bDel = b.status === "Pending Deletion";
  if (aDel !== bDel) return aDel ? -1 : 1;

  // Then capabilities with outstanding actions
  const aOA =
    (a.outstandingActions?.pendingMembershipApplicationCount ?? 0) > 0;
  const bOA =
    (b.outstandingActions?.pendingMembershipApplicationCount ?? 0) > 0;
  if (aOA !== bOA) return aOA ? -1 : 1;

  // Lower requirementScore = more work needed
  const aReq = a.requirementScore ?? 1;
  const bReq = b.requirementScore ?? 1;
  return aReq - bReq;
}

function CapabilityItem({ cap, index = 0 }) {
  const isPendingDeletion = cap.status === "Pending Deletion";
  const oa = cap.outstandingActions;
  const pendingMembers = oa?.pendingMembershipApplicationCount ?? 0;
  const stale = isStaleScore(cap);
  const cost = avgCostText(cap.costs);
  const jsonMetadata = JSON.parse(cap.jsonMetadata ?? "{}");
  const costCentre = jsonMetadata["dfds.cost.centre"];

  return (
    <div
      className={`py-[0.625rem] border-b border-[#eeeeee] dark:border-[#1e2d3d] first:pt-0 last:border-0 last:pb-0 animate-fade-up${isPendingDeletion ? " opacity-70" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Name row */}
      <div className="flex items-start gap-1.5 mb-[3px]">
        {isPendingDeletion && (
          <AlertCircle size={13} className="text-red-500 shrink-0 mt-[2px]" />
        )}
        <Link
          to={`/capabilities/${cap.id}`}
          className="text-[13px] font-medium text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline leading-[1.35] flex-1 min-w-0"
        >
          {cap.name}
        </Link>
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-3 flex-wrap mt-[3px]">
        {/* Requirement score */}
        <span className="inline-flex items-center gap-[4px] font-mono text-[10px] text-muted">
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

        {/* Cost */}
        {cost && (
          <span className="font-mono text-[10px] text-muted">{cost}</span>
        )}

        {/* Cost centre */}
        {costCentre && (
          <span className="font-mono text-[10px] text-muted">{costCentre}</span>
        )}

        {/* Outstanding membership applications */}
        {pendingMembers > 0 && (
          <span className="inline-flex items-center gap-[3px] font-mono text-[9px] font-semibold tracking-[0.04em] px-1.5 py-[1px] rounded-[4px] bg-[rgba(237,136,0,0.1)] text-[#ed8800]">
            <Users size={9} />
            {pendingMembers} pending
          </span>
        )}

        {/* Pending deletion badge */}
        {isPendingDeletion && (
          <span className="inline-flex items-center gap-[3px] font-mono text-[9px] font-semibold tracking-[0.04em] px-1.5 py-[1px] rounded-[4px] bg-[rgba(220,38,38,0.1)] text-[#dc2626]">
            <AlertCircle size={9} />
            Pending deletion
          </span>
        )}
      </div>
    </div>
  );
}

export default function MyCapabilities() {
  const { isFetched: capsFetched, data: capabilitiesData } = useCapabilities();
  const { query: costsQuery, getCostsForCapability } = useCapabilitiesCost();
  const [mine, setMine] = useState([]);

  useEffect(() => {
    if (capsFetched && capabilitiesData) {
      const withCosts = capabilitiesData
        .filter((cap) => cap.userIsMember)
        .map((cap) => ({ ...cap, costs: getCostsForCapability(cap.id, 7) }))
        .sort(sortByImportance)
        .slice(0, MAX_SHOWN);
      setMine(withCosts);
    }
  }, [capsFetched, capabilitiesData, costsQuery.isFetched]);

  if (!capsFetched) {
    return (
      <div>
        {[0, 1, 2, 3].map((i) => (
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
