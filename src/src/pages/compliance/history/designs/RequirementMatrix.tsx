import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { dayToDate, periodLabel } from "../period";
import {
  HistoryCard,
  HistoryEmpty,
  HistoryLabel,
  type HistoryDesignProps,
  NO_DATA_STYLE,
  StableText,
  ValueLegend,
  distinct,
  formatValue,
  useFittedPoints,
  valueColor,
} from "./shared";

// Narrow cards drop the oldest periods rather than draw sub-pixel cells.
const MIN_PITCH = 3;

/**
 * Design 4: a row per series and a column per period, each cell coloured by
 * its value. A column is one button, so clicking anywhere in it opens that
 * period. The value column shows the hovered or selected period.
 */
export function RequirementMatrix({
  model,
  view,
  onSelect,
  tall,
}: HistoryDesignProps) {
  const [hover, setHover] = useState<number | null>(null);
  const { series } = model;
  const { ref, points, selectedIndex, gapped } = useFittedPoints(
    model.points,
    model.selectedIndex,
    MIN_PITCH,
  );

  if (points.length < 2) return <HistoryEmpty model={model} />;

  const row = tall ? "h-[20px]" : "h-[13px]";

  const shown = points[hover ?? selectedIndex] ?? points[points.length - 1];

  return (
    <HistoryCard>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <HistoryLabel>
          (by {model.breakdown} and {view})
        </HistoryLabel>
        <span className="font-mono text-[0.6875rem] text-secondary">
          {periodLabel(view, shown.period)}
        </span>
      </div>
      {/* Cells cap at 14px, so the cell column caps at the same total width. */}
      <div
        className="grid items-stretch gap-x-3"
        style={{
          gridTemplateColumns: `minmax(90px, max-content) minmax(0, ${
            model.points.length * 15
          }px) auto`,
        }}
      >
        <div className="flex flex-col gap-[2px]">
          {series.map((s, i) => (
            <span
              key={s.key}
              title={s.name}
              className={cn(
                "flex max-w-[180px] items-center truncate text-[0.6875rem] leading-none",
                row,
                i === 0 ? "font-semibold text-primary" : "text-secondary",
              )}
            >
              {s.shortName}
            </span>
          ))}
        </div>
        <div
          ref={ref}
          className={cn("flex min-w-0", gapped && "gap-px")}
          onPointerLeave={() => setHover(null)}
        >
          {points.map((p, i) => {
            const selected = i === selectedIndex;
            const text = series
              .map(
                (s, j) =>
                  `${s.shortName} ${formatValue(
                    model,
                    p.values[s.key],
                    j === 0,
                  )}`,
              )
              .join(", ");
            return (
              <button
                key={p.period}
                type="button"
                aria-label={`${periodLabel(view, p.period)}: ${text}`}
                aria-pressed={selected}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={onSelect && (() => onSelect(p.date))}
                className={cn(
                  "flex min-w-0 max-w-[14px] flex-1 flex-col gap-[2px] rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-action)]",
                  !onSelect && "cursor-default",
                  selected &&
                    "outline outline-[1.5px] outline-offset-1 outline-[var(--color-brand)]",
                  hover !== null && hover !== i && "opacity-70",
                )}
              >
                {series.map((s) => {
                  const v = p.values[s.key];
                  return (
                    <span
                      key={s.key}
                      className={cn("w-full rounded-[1px]", row)}
                      style={
                        v === null && model.kind === "rate"
                          ? NO_DATA_STYLE
                          : { background: valueColor(model, v) }
                      }
                    />
                  );
                })}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-[2px] text-right">
          {series.map((s, i) => (
            <span
              key={s.key}
              className={cn(
                "flex items-center justify-end whitespace-nowrap font-mono text-[0.6875rem] leading-none",
                row,
                i === 0 ? "font-semibold text-primary" : "text-secondary",
              )}
            >
              {/* The cell column shares this grid, so a width change here
                  would resize the cells under the pointer. */}
              <StableText
                reserve={distinct(
                  points.map((p) =>
                    formatValue(model, p.values[s.key], i === 0),
                  ),
                )}
                className="justify-items-end"
              >
                {formatValue(model, shown.values[s.key], i === 0)}
              </StableText>
            </span>
          ))}
        </div>
        <div />
        <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[0.625rem] text-muted">
          <span>{format(dayToDate(points[0].date), "d MMM")}</span>
          <span>
            {format(dayToDate(points[points.length - 1].date), "d MMM")}
          </span>
        </div>
        <div />
      </div>
      <div className="mt-2 flex justify-center">
        <ValueLegend model={model} />
      </div>
    </HistoryCard>
  );
}
