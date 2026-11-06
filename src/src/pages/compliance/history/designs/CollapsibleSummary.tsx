import React, { useState } from "react";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { dayToDate, periodLabel } from "../period";
import { RequirementMatrix } from "./RequirementMatrix";
import {
  Delta,
  HistoryCard,
  HistoryEmpty,
  HistoryLabel,
  type HistoryDesignProps,
  StableText,
  TrendLine,
  deltaPts,
  distinct,
  firstValue,
  fitDomain,
  formatValue,
  metDays,
} from "./shared";

/**
 * Design 1: one row with the headline value, its change over the recorded
 * history and a full-width sparkline. The breakdown matrix opens on demand.
 */
export function CollapsibleSummary({
  model,
  view,
  onSelect,
}: HistoryDesignProps) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const { points, series, selectedIndex } = model;

  if (points.length < 2) return <HistoryEmpty model={model} />;

  const headline = series[0];
  const values = points.map((p) => p.values[headline.key]);
  const point = points[hover ?? selectedIndex] ?? points[points.length - 1];
  const value = point.values[headline.key];
  const domain = fitDomain(model, values);
  const since = format(dayToDate(points[0].date), "d MMM");
  const describe = (p: (typeof points)[number]) =>
    `${model.kind === "rate" ? `${model.subject} · ` : ""}${
      p.detail
    } · ${periodLabel(view, p.period)}`;

  return (
    <div className="flex flex-col gap-3">
      <HistoryCard className="py-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <HistoryLabel>
            (since {format(dayToDate(points[0].date), "d MMM yyyy")})
          </HistoryLabel>
          <div className="flex items-baseline gap-2">
            <StableText
              reserve={distinct(values.map((v) => formatValue(model, v, true)))}
              className="font-mono text-[1.125rem] font-bold leading-none text-primary"
            >
              {formatValue(model, value, true)}
            </StableText>
            <StableText
              reserve={distinct(points.map(describe))}
              className="text-[0.75rem] text-secondary"
            >
              {describe(point)}
            </StableText>
          </div>
          {model.kind === "rate" ? (
            <StableText
              reserve={distinct(
                values.map((v) => deltaPts(firstValue(values), v)),
              ).map((d) => (
                <Delta value={d} suffix={`since ${since}`} />
              ))}
            >
              <Delta
                value={deltaPts(firstValue(values), value)}
                suffix={`since ${since}`}
              />
            </StableText>
          ) : (
            <span className="font-mono text-[0.6875rem] text-secondary">
              Compliant on {metDays(values)}
            </span>
          )}
          <div className="flex min-w-[160px] flex-1 items-stretch gap-1.5">
            <div
              aria-hidden
              className="flex flex-col justify-between text-right font-mono text-[0.625rem] leading-none text-muted"
            >
              <span>{domain[1]}%</span>
              <span>{domain[0]}%</span>
            </div>
            <TrendLine
              values={values}
              color={headline.color}
              area
              domain={domain}
              selectedIndex={selectedIndex}
              hoverIndex={hover}
              onHover={setHover}
              onSelect={onSelect && ((i) => onSelect(points[i].date))}
              label={headline.name}
              className="h-8 flex-1"
            />
          </div>
          {series.length > 1 && (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-[5px] px-2 py-1 text-[0.75rem] text-action hover:bg-surface-muted"
            >
              {open ? "Hide" : "Show"} by {model.breakdown}
              <ChevronDown
                size={14}
                className={cn("transition-transform", open && "rotate-180")}
              />
            </button>
          )}
        </div>
      </HistoryCard>
      {open && (
        <RequirementMatrix model={model} view={view} onSelect={onSelect} />
      )}
    </div>
  );
}
