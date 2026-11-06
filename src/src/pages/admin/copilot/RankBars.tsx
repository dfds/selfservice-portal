import React from "react";
import { LoginLink } from "./common";
import { LoginHover } from "./LoginHover";

export const CREDIT_BAR = "linear-gradient(90deg, #3b82f6, #a855f7)";

export const SPEND_BAR = "linear-gradient(90deg, #4caf50, #eab308, #ef4444)";

export function spendColor(ratio: number): string {
  if (ratio > 0.85) return "var(--color-error)";
  if (ratio > 0.5) return "var(--color-warning)";
  return "var(--color-success)";
}

/** Size the gradient to the full track so short bars show only its start. */
export function RankBars({
  rows,
  format,
  gradient,
  valueColor,
  link,
}: {
  rows: { name: string; value: number }[];
  format: (n: number) => string;
  gradient: string;
  valueColor: (ratio: number) => string;
  link?: boolean;
}) {
  const max = Math.max(0, ...rows.map((r) => r.value));
  if (rows.length === 0 || max <= 0) {
    return (
      <p className="text-[0.8125rem] text-secondary">
        No AI Credits billed in this range.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
      {rows.map((r) => {
        const ratio = Math.max(r.value, 0) / max;
        return (
          <React.Fragment key={r.name}>
            <span className="truncate text-right text-[0.75rem] text-primary">
              {link && r.name ? (
                <LoginHover login={r.name}>
                  <LoginLink login={r.name} />
                </LoginHover>
              ) : (
                r.name || "unknown"
              )}
            </span>
            <div className="h-4 rounded-[3px] bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-[3px]"
                style={{
                  width: `${ratio * 100}%`,
                  backgroundImage: gradient,
                  backgroundSize:
                    ratio > 0 ? `${100 / ratio}% 100%` : undefined,
                }}
              />
            </div>
            <span
              className="min-w-[5.5rem] text-right font-mono text-[0.9375rem]"
              style={{ color: valueColor(ratio) }}
            >
              {format(r.value)}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
