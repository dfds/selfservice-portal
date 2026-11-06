import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { dayToDate, periodLabel } from "../period";
import {
  Delta,
  HistoryEmpty,
  HistoryLabel,
  type HistoryDesignProps,
  TrendLine,
  deltaPts,
  firstValue,
  fitDomain,
  isFullDomain,
  formatValue,
  metDays,
} from "./shared";

/**
 * Design 2: a tile per series with the value for the selected period, its
 * change since the first recorded day and a sparkline. Hovering one tile
 * moves the readout on all of them.
 */
export function TrendTiles({ model, view, onSelect }: HistoryDesignProps) {
  const [hover, setHover] = useState<number | null>(null);
  const { points, series, selectedIndex } = model;

  if (points.length < 2) return <HistoryEmpty model={model} />;

  const point = points[hover ?? selectedIndex] ?? points[points.length - 1];
  // One range for every tile, so their heights compare.
  const domain = fitDomain(
    model,
    points.flatMap((p) => series.map((s) => p.values[s.key])),
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <HistoryLabel>
          (by {model.breakdown}, since{" "}
          {format(dayToDate(points[0].date), "d MMM yyyy")}
          {isFullDomain(domain)
            ? ""
            : `; lines span ${domain[0]}–${domain[1]}%`}
          )
        </HistoryLabel>
        <span className="font-mono text-[0.6875rem] text-secondary">
          {periodLabel(view, point.period)}
          {hover !== null && onSelect ? " · click to view" : ""}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
        {series.map((s, i) => {
          const values = points.map((p) => p.values[s.key]);
          const value = point.values[s.key];
          return (
            <div
              key={s.key}
              className={cn(
                "flex flex-col gap-1 rounded-[8px] border border-card bg-surface px-3 pb-2 pt-2.5",
                i === 0 && "border-[var(--color-brand)]/40",
              )}
            >
              <div className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: s.color }}
                />
                <span
                  className={cn(
                    "truncate text-[0.6875rem]",
                    i === 0 ? "font-semibold text-primary" : "text-secondary",
                  )}
                  title={s.name}
                >
                  {s.shortName}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[1rem] font-bold leading-none text-primary">
                  {formatValue(model, value, i === 0)}
                </span>
                {model.kind === "rate" ? (
                  <Delta value={deltaPts(firstValue(values), value)} />
                ) : (
                  <span className="font-mono text-[0.625rem] text-muted">
                    {metDays(values)}
                  </span>
                )}
              </div>
              <TrendLine
                values={values}
                color={s.color}
                area={i === 0}
                domain={domain}
                selectedIndex={selectedIndex}
                hoverIndex={hover}
                onHover={setHover}
                onSelect={onSelect && ((j) => onSelect(points[j].date))}
                label={s.name}
                className="mt-1 h-7"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
