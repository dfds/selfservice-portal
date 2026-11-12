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
  ValueLegend,
  formatValue,
  useFittedPoints,
  valueColor,
} from "./shared";

// Narrow cards drop the oldest periods rather than draw sub-pixel bars.
const MIN_PITCH = 3;

/**
 * The history chart on mobile: one bar per period for one series, the
 * headline unless another is picked. A rate sets the bar's height and tier
 * colour; a status fills the bar in its status colour. A readout names the
 * hovered or selected period.
 */
export function DailyBars({ model, view, onSelect, tall }: HistoryDesignProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const { series } = model;
  const { ref, points, selectedIndex, gapped } = useFittedPoints(
    model.points,
    model.selectedIndex,
    MIN_PITCH,
  );

  if (points.length < 2) return <HistoryEmpty model={model} />;

  const current = series.find((s) => s.key === picked) ?? series[0];
  const key = current.key;
  const isHeadline = current === series[0];
  const shown = points[hover ?? selectedIndex] ?? points[points.length - 1];

  return (
    <HistoryCard>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <HistoryLabel>
            ({model.subject} per {view})
          </HistoryLabel>
          {series.length > 1 && (
            <select
              aria-label={`Show a ${model.breakdown}`}
              value={key}
              onChange={(e) => setPicked(e.target.value)}
              className="rounded-[5px] border border-card bg-surface px-1.5 py-0.5 text-[0.6875rem] text-primary"
            >
              {series.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <span className="font-mono text-[0.6875rem] text-secondary">
          {periodLabel(view, shown.period)} ·{" "}
          <span className="font-semibold text-primary">
            {formatValue(model, shown.values[key], isHeadline)}
          </span>
          {isHeadline && ` (${shown.detail})`}
        </span>
      </div>
      {/* Bars cap at 14px, so the axis shares their width rather than the card's. */}
      <div style={{ maxWidth: model.points.length * 15 }}>
        <div
          ref={ref}
          className={cn(
            "flex items-end",
            gapped && "gap-px",
            model.kind === "rate"
              ? tall
                ? "h-40"
                : "h-12"
              : tall
              ? "h-10"
              : "h-6",
          )}
          onPointerLeave={() => setHover(null)}
        >
          {points.map((p, i) => {
            const value = p.values[key];
            const selected = i === selectedIndex;
            return (
              <button
                key={p.period}
                type="button"
                aria-label={`${periodLabel(view, p.period)}: ${
                  current.name
                } ${formatValue(model, value, isHeadline)}`}
                aria-pressed={selected}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={onSelect && (() => onSelect(p.date))}
                className={cn(
                  "flex h-full min-w-0 max-w-[14px] flex-1 items-end focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-action)]",
                  !onSelect && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "w-full rounded-t-[2px] transition-opacity",
                    model.kind === "status" && "rounded-b-[2px]",
                    hover !== null && hover !== i && "opacity-60",
                    selected &&
                      "outline outline-[1.5px] outline-offset-1 outline-[var(--color-brand)]",
                  )}
                  style={{
                    height:
                      model.kind === "rate" && value !== null
                        ? `${Math.max(4, value)}%`
                        : "100%",
                    background: valueColor(model, value),
                    ...(value === null && model.kind === "rate"
                      ? NO_DATA_STYLE
                      : {}),
                  }}
                />
              </button>
            );
          })}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[0.625rem] text-muted">
          <span>{format(dayToDate(points[0].date), "d MMM yyyy")}</span>
          {model.kind === "status" && <ValueLegend model={model} />}
          <span>
            {format(dayToDate(points[points.length - 1].date), "d MMM yyyy")}
          </span>
        </div>
      </div>
    </HistoryCard>
  );
}
