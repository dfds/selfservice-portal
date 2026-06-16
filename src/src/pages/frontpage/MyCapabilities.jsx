import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useMe } from "@/state/remote/queries/me";
import {
  useAddCapabilityFavourite,
  useRemoveCapabilityFavourite,
} from "@/state/remote/queries/capabilities";
import { useCapabilitiesCost } from "@/state/remote/queries/platformdataapi";
import { SkeletonCapabilityTableRow } from "@/components/ui/skeleton";
import { LightBulb } from "@/pages/capabilities/RequirementsStatus";
import { AlertCircle, Users, Star } from "lucide-react";
import { computeCostTrendPct } from "@/lib/costUtils";

const MAX_SHOWN = 5;
const LIST_REORDER_DURATION = 0.32;

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
    <span className="font-mono text-[0.6875rem] text-foreground">
      {displayedCost}
    </span>
  );
}

function TrendCell({ costs, previousCosts, costsComparisonIsFull }) {
  const trendPct = computeCostTrendPct(costs ?? [], previousCosts ?? []);

  if (trendPct == null) {
    return (
      <span
        className="font-mono text-[0.6875rem] text-muted"
        title="Not enough history to calculate a trend"
      >
        —
      </span>
    );
  }

  const isLower = trendPct < 0;
  return (
    <span
      className="font-mono text-[0.6875rem] font-semibold"
      style={{ color: isLower ? "#1a7f3c" : "#c0392b" }}
      title={
        costsComparisonIsFull
          ? "Average daily cost vs. the prior 30-day period"
          : `Approximate — only ${
              previousCosts.length + costs.length
            } days of history available`
      }
    >
      {isLower ? "↓" : "↑"} {!costsComparisonIsFull ? "~" : ""}
      {Math.abs(Math.round(trendPct))}%
    </span>
  );
}

function CapabilityRow({ cap, onFavouriteToggle }) {
  const isPendingDeletion =
    cap.outstandingActions?.isPendingDeletion === true ||
    cap.status === "Pending Deletion";
  const pendingMembers =
    cap.outstandingActions?.pendingMembershipApplicationCount ?? 0;
  const isFavourite = cap.isFavourite === true;

  return (
    <>
      {/* Capability name */}
      <td className="py-[0.5rem] pr-3 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          {isPendingDeletion && (
            <AlertCircle
              size={12}
              className="text-red-500 shrink-0"
              title="Pending deletion"
            />
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavouriteToggle?.(cap.id, !isFavourite);
            }}
            className={`p-0.5 rounded transition-colors shrink-0 ${
              isFavourite
                ? "text-amber-500 hover:text-amber-600"
                : "text-muted hover:text-amber-500"
            }`}
            title={
              isFavourite
                ? "Favourite capability. Click to remove it from your favourites. Favourites appear first in capability lists and on the front page."
                : "Mark as favourite. Favourites appear first in capability lists and on the front page."
            }
            aria-label={
              isFavourite
                ? `Remove ${cap.name} from favorites`
                : `Add ${cap.name} to favorites`
            }
          >
            <Star
              size={12}
              className={isFavourite ? "fill-current" : "fill-none"}
            />
          </button>
          <Link
            to={`/capabilities/${cap.id}`}
            className="text-[0.75rem] font-medium text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline truncate"
          >
            {cap.name}
          </Link>
          {pendingMembers > 0 && (
            <span
              className="inline-flex items-center gap-[3px] font-mono text-[0.5625rem] font-semibold tracking-[0.04em] px-1.5 py-[1px] rounded-[4px] bg-[rgba(237,136,0,0.1)] text-[#ed8800] shrink-0"
              title={`${pendingMembers} membership application${
                pendingMembers > 1 ? "s" : ""
              } awaiting approval`}
            >
              <Users size={9} />
              {pendingMembers}
            </span>
          )}
        </div>
      </td>

      {/* Compliance score */}
      <td className="py-[0.5rem] pr-3 text-right whitespace-nowrap">
        <span className="inline-flex items-center gap-[4px] font-mono text-[0.6875rem] text-muted">
          <LightBulb score={cap.requirementScore} size={9} />
          {cap.requirementScore?.toFixed(1)}%
        </span>
      </td>

      {/* Cost */}
      <td className="py-[0.5rem] pr-3 text-right whitespace-nowrap">
        <CostCell
          costs={cap.costs}
          previousCosts={cap.previousCosts}
          costsComparisonIsFull={cap.costsComparisonIsFull}
        />
      </td>

      {/* Trend */}
      <td className="py-[0.5rem] text-right whitespace-nowrap">
        <TrendCell
          costs={cap.costs}
          previousCosts={cap.previousCosts}
          costsComparisonIsFull={cap.costsComparisonIsFull}
        />
      </td>
    </>
  );
}

export default function MyCapabilities() {
  const { isFetched: meFetched, data: meData } = useMe();
  const { query: costsQuery, getCostComparisonForCapability } =
    useCapabilitiesCost();
  const addFavourite = useAddCapabilityFavourite();
  const removeFavourite = useRemoveCapabilityFavourite();
  const queryClient = useQueryClient();

  const handleFavouriteToggle = (capabilityId, shouldFavourite) => {
    if (shouldFavourite) {
      addFavourite.mutate(
        { id: capabilityId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["capabilities", "list"],
            });
            queryClient.invalidateQueries({ queryKey: ["me"] });
          },
        },
      );
    } else {
      removeFavourite.mutate(
        { id: capabilityId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["capabilities", "list"],
            });
            queryClient.invalidateQueries({ queryKey: ["me"] });
          },
        },
      );
    }
  };

  const mine = useMemo(() => {
    if (!meFetched || !meData?.capabilities) return [];
    return [...meData.capabilities]
      .sort((a, b) => {
        // Favorites first
        const aFavourite = a.isFavourite === true;
        const bFavourite = b.isFavourite === true;
        if (aFavourite !== bFavourite) {
          return bFavourite ? 1 : -1;
        }
        // Then by priority score
        return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
      })
      .slice(0, MAX_SHOWN)
      .map((cap) => {
        const { current, previous, hasFullComparison } =
          getCostComparisonForCapability(cap.id);
        return {
          ...cap,
          costs: current,
          previousCosts: previous,
          costsComparisonIsFull: hasFullComparison,
        };
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
      <p className="font-mono text-[0.6875rem] text-muted tracking-[0.03em]">
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
            <th className="pb-[0.375rem] pr-3 text-left font-mono text-[0.625rem] font-semibold text-muted tracking-[0.06em] uppercase">
              Capability
            </th>
            <th
              className="pb-[0.375rem] pr-3 text-right font-mono text-[0.625rem] font-semibold text-muted tracking-[0.06em] uppercase cursor-help"
              title="How well this capability satisfies platform requirements. Shown as stale if requirements haven't been reviewed in over 14 days."
            >
              Compliance
            </th>
            <th
              className="pb-[0.375rem] pr-3 text-right font-mono text-[0.625rem] font-semibold text-muted tracking-[0.06em] uppercase cursor-help"
              title="Total AWS cost over the last 30 days."
            >
              Cost (30d)
            </th>
            <th
              className="pb-[0.375rem] text-right font-mono text-[0.625rem] font-semibold text-muted tracking-[0.06em] uppercase cursor-help"
              title="Change in average daily cost compared to the prior 30-day period. ~ means the comparison is based on partial history."
            >
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false} mode="popLayout">
            {mine.map((cap, i) => (
              <motion.tr
                key={cap.id}
                layout
                className={`border-b border-[#eeeeee] dark:border-[#1e2d3d] last:border-0${
                  cap.outstandingActions?.isPendingDeletion === true ||
                  cap.status === "Pending Deletion"
                    ? " opacity-70"
                    : ""
                }`}
                transition={{
                  layout: {
                    duration: LIST_REORDER_DURATION,
                    ease: "easeInOut",
                  },
                }}
              >
                <CapabilityRow
                  cap={cap}
                  onFavouriteToggle={handleFavouriteToggle}
                />
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      <div className="pt-[0.625rem]">
        <Link
          to="/capabilities"
          className="font-mono text-[0.6875rem] text-[#0e7cc1] dark:text-[#60a5fa] no-underline hover:underline tracking-[0.03em]"
        >
          View all capabilities →
        </Link>
      </div>
    </div>
  );
}
