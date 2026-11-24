import React from "react";
import { cn } from "@/lib/utils";

/**
 * A percentage trend (0–100), oldest first. Nulls break the line. Renders
 * nothing with fewer than two values.
 */
export function Sparkline({
  values,
  color,
  label,
  width = 72,
  height = 20,
  className,
}: {
  values: readonly (number | null)[];
  color: string;
  /** Names the series for screen readers, e.g. "Last 30 days". */
  label: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const present = values.filter((v): v is number => v !== null);
  if (present.length < 2) return null;

  // Inset by the end-dot radius so it isn't clipped.
  const pad = 2.5;
  const x = (i: number) =>
    pad +
    (values.length === 1 ? 0 : (i / (values.length - 1)) * (width - pad * 2));
  const y = (v: number) => pad + (1 - v / 100) * (height - pad * 2);

  const segments: string[] = [];
  let current: string[] = [];
  values.forEach((v, i) => {
    if (v === null) {
      if (current.length) segments.push(current.join(" "));
      current = [];
    } else {
      current.push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    }
  });
  if (current.length) segments.push(current.join(" "));

  const lastIndex =
    values.length - 1 - [...values].reverse().findIndex((v) => v !== null);
  const first = present[0];
  const last = present[present.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${label}: ${first}% to ${last}%`}
      className={cn("flex-shrink-0 overflow-visible", className)}
    >
      <title>{`${label}: ${first}% → ${last}%`}</title>
      {segments.map((points) => (
        <polyline
          key={points}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <circle
        cx={x(lastIndex)}
        cy={y(last)}
        r={2}
        fill={color}
        stroke="var(--color-surface)"
        strokeWidth={1}
      />
    </svg>
  );
}
