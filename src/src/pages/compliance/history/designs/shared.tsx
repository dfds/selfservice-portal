import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { complianceColor } from "../../utils";
import {
  type ComplianceDay,
  type ComplianceView,
  periodStart,
} from "../period";
import { bucketHistory } from "../series";

export const OVERALL_KEY = "overall";

export type HistorySeries = {
  key: string;
  name: string;
  /** Short form for narrow labels. */
  shortName: string;
  color: string;
  /** Set once the categorical hues run out and repeat, so a repeat stays distinguishable. */
  dashed?: boolean;
};

export type HistoryPoint = {
  /** First day of the period. */
  period: ComplianceDay;
  /** The recorded day the period's values come from. */
  date: ComplianceDay;
  /** 0–100, or null when the series had nothing to evaluate. */
  values: Record<string, number | null>;
  /** Counts behind the headline value, e.g. "181 of 324". */
  detail: string;
};

/**
 * What the history chart draws. `rate` values are percentages of capabilities;
 * `status` values are one capability's state: 100 met, 0 not met, null
 * unknown, and the headline is the share of evaluated requirements met.
 */
export type HistoryModel = {
  kind: "rate" | "status";
  /** Names the headline value, e.g. "fully compliant capabilities". */
  subject: string;
  /** What the other series are, e.g. "cost centre". */
  breakdown: string;
  /** The headline first. */
  series: HistorySeries[];
  points: HistoryPoint[];
  /** The selected period, or the last one before it; -1 when none is. */
  selectedIndex: number;
  isFetched: boolean;
};

export type HistoryDesignProps = {
  model: HistoryModel;
  view: ComplianceView;
  /** Opens a recorded day. Without it the chart is read-only. */
  onSelect?: (day: ComplianceDay) => void;
  /** Taller plots, for a page where the history has a section of its own. */
  tall?: boolean;
};

/** Buckets `items` by `view` and reads each series' value from the period's last item. */
export function buildPoints<T extends { date: ComplianceDay }>(
  items: readonly T[],
  view: ComplianceView,
  series: readonly HistorySeries[],
  value: (item: T, key: string) => number | null,
  detail: (item: T) => string,
): HistoryPoint[] {
  return bucketHistory(items, view).map((b) => {
    const values: Record<string, number | null> = {};
    for (const s of series) values[s.key] = value(b.item, s.key);
    return {
      period: b.period,
      date: b.item.date,
      values,
      detail: detail(b.item),
    };
  });
}

// Below this pitch a 1px gap would take most of the cell, so cells abut.
const GAPPED_PITCH = 5;

/**
 * The run of points that fits the measured element at `minPitch` px per
 * point: the latest ones, or those ending at the selection when it is older.
 * Until the first measurement every point is returned.
 */
export function useFittedPoints(
  points: readonly HistoryPoint[],
  selectedIndex: number,
  minPitch: number,
) {
  const [width, setWidth] = useState<number | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const ref = useCallback((el: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    setWidth(el.clientWidth);
    observer.current = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.current.observe(el);
  }, []);

  const fit =
    width === null
      ? points.length
      : Math.max(2, Math.min(points.length, Math.floor(width / minPitch)));
  const latestStart = points.length - fit;
  const start =
    selectedIndex >= 0 && selectedIndex < latestStart
      ? Math.max(0, selectedIndex - fit + 1)
      : latestStart;
  return {
    ref,
    points: points.slice(start, start + fit),
    selectedIndex: selectedIndex - start,
    gapped: width === null || width / fit >= GAPPED_PITCH,
  };
}

export function selectedIndexFor(
  points: readonly HistoryPoint[],
  view: ComplianceView,
  selected: ComplianceDay,
): number {
  const period = periodStart(view, selected);
  let index = -1;
  for (let i = 0; i < points.length; i++) {
    if (points[i].period <= period) index = i;
  }
  return index;
}

export function formatValue(
  model: HistoryModel,
  value: number | null | undefined,
  headline: boolean,
): string {
  if (model.kind === "rate") {
    return value === null || value === undefined ? "–" : `${value}%`;
  }
  if (value === null || value === undefined) return "Unknown";
  if (value >= 100) return headline ? "Compliant" : "Met";
  return headline ? "Non-compliant" : "Not met";
}

const UNKNOWN_COLOR = "#9e9e9e";

/** Rates use the page's red/amber/green tiers; statuses are green or red. */
export function valueColor(
  model: HistoryModel,
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) return UNKNOWN_COLOR;
  if (model.kind === "rate") return complianceColor(value);
  return value >= 100 ? "#22c55e" : "#ef4444";
}

export function ValueLegend({ model }: { model: HistoryModel }) {
  const entries =
    model.kind === "rate"
      ? [
          { label: "<50%", color: complianceColor(0) },
          { label: "50–79%", color: complianceColor(50) },
          { label: "≥80%", color: complianceColor(80) },
        ]
      : [
          { label: "Met", color: valueColor(model, 100) },
          { label: "Not met", color: valueColor(model, 0) },
          { label: "Unknown", color: UNKNOWN_COLOR },
        ];
  return (
    <span className="inline-flex flex-wrap items-center gap-2 font-mono text-[0.625rem] text-muted">
      {entries.map(({ label, color }) => (
        <span key={label} className="inline-flex items-center gap-1">
          <span
            aria-hidden
            className="h-[8px] w-[8px] rounded-[2px]"
            style={{ background: color }}
          />
          {label}
        </span>
      ))}
    </span>
  );
}

export function HistoryEmpty({ model }: { model: HistoryModel }) {
  return (
    <div className="rounded-[8px] border border-dashed border-card bg-surface px-4 py-3 text-[0.8125rem] text-secondary">
      {model.isFetched
        ? "History appears once two days are recorded."
        : "Loading history…"}
    </div>
  );
}

export function HistoryLabel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-[#0e7cc1] dark:text-[#60a5fa]">
      {"Trends "}
      <span className="font-normal tracking-[0.1em] text-muted">
        {children ?? "(UTC days)"}
      </span>
    </div>
  );
}

export function HistoryCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-card bg-surface px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type Domain = readonly [number, number];
export const FULL_DOMAIN: Domain = [0, 100];

/**
 * A y-range around the values, in steps of 5 and at least `minSpan` wide, so
 * a change of a few points is visible. The floor keeps day-to-day noise from
 * filling the height. Status models stay on 0–100, where 0 and 100 are the
 * only values.
 */
export function fitDomain(
  model: Pick<HistoryModel, "kind">,
  values: readonly (number | null)[],
  minSpan = 10,
): Domain {
  const known = values.filter((v): v is number => v !== null);
  if (model.kind !== "rate" || known.length === 0) return FULL_DOMAIN;
  const min = Math.min(...known);
  const max = Math.max(...known);
  const pad = Math.max(1, (max - min) * 0.1);
  let lo = Math.floor((min - pad) / 5) * 5;
  let hi = Math.ceil((max + pad) / 5) * 5;
  if (hi - lo < minSpan) {
    const mid = (min + max) / 2;
    lo = Math.floor((mid - minSpan / 2) / 5) * 5;
    hi = lo + Math.ceil(minSpan / 5) * 5;
  }
  if (lo < 0) [lo, hi] = [0, Math.max(hi - lo, minSpan)];
  if (hi > 100) [lo, hi] = [Math.min(lo, 100 - minSpan), 100];
  return [Math.max(0, lo), Math.min(100, hi)];
}

const HATCH =
  "repeating-linear-gradient(45deg, var(--color-border-card) 0 1.5px, transparent 1.5px 4px)";
export const NO_DATA_STYLE: React.CSSProperties = { background: HATCH };
