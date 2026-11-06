import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CollapsibleSummary } from "./CollapsibleSummary";
import { DailyBars } from "./DailyBars";
import { FocusChart } from "./FocusChart";
import { RequirementMatrix } from "./RequirementMatrix";
import type { HistoryDesignProps } from "./shared";
import { TrendTiles } from "./TrendTiles";

// Temporary: lets reviewers compare history layouts on the dev environment.
// Remove with the designs that aren't kept.

const DESIGNS = [
  { id: "summary", label: "1 · Summary row", Component: CollapsibleSummary },
  { id: "tiles", label: "2 · Trend tiles", Component: TrendTiles },
  { id: "bars", label: "3 · Bar strip", Component: DailyBars },
  { id: "matrix", label: "4 · Matrix", Component: RequirementMatrix },
  { id: "chart", label: "5 · Short chart", Component: FocusChart },
] as const;

type DesignId = (typeof DESIGNS)[number]["id"] | "current";

// One choice for every page, so a design can be compared across them.
const STORAGE_KEY = "ssu-compliance-history-design";

function readStored(): DesignId {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "current" || DESIGNS.some((d) => d.id === v)
    ? (v as DesignId)
    : "summary";
}

export function HistoryDesignPreview({
  current,
  ...props
}: HistoryDesignProps & {
  /** The page's existing history, offered as "Current". */
  current?: React.ReactNode;
}) {
  const [stored, setStored] = useState<DesignId>(readStored);
  const design = stored === "current" && !current ? "summary" : stored;
  const options = [
    ...(current ? [{ id: "current" as const, label: "Current" }] : []),
    ...DESIGNS,
  ];

  const choose = (id: DesignId) => {
    setStored(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const Component = DESIGNS.find((d) => d.id === design)?.Component;

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="History design preview"
        className="mb-2 flex flex-wrap items-center gap-1 rounded-[6px] border border-dashed border-[var(--color-warning)] px-2 py-1"
      >
        <span className="mr-1 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--color-warning)]">
          Design preview
        </span>
        {options.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={design === d.id}
            onClick={() => choose(d.id)}
            className={cn(
              "rounded-[4px] px-2 py-0.5 text-[0.6875rem] transition-colors",
              design === d.id
                ? "bg-surface-muted font-semibold text-primary"
                : "text-secondary hover:text-primary",
            )}
          >
            {d.label}
          </button>
        ))}
      </div>
      {Component ? <Component {...props} /> : current}
    </div>
  );
}
