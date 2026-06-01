import React from "react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { complianceColor } from "./utils";

export function ArcGauge({ pct, color }: { pct: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const filled = circ * (pct / 100);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted whitespace-nowrap">
        Compliant capabilities
      </span>
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke="var(--color-border-card)"
            strokeWidth="9"
          />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            transform="rotate(-90 48 48)"
            style={{
              transition:
                "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1), stroke 0.4s",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[22px] font-bold tracking-[-0.03em] text-[#002b45] dark:text-[#e2e8f0]">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

export type CategoryBreakdown = {
  categoryName: string;
  compliantCount: number;
  nonCompliantCount: number;
};

/**
 * Per-category compliance progress-bar rows. Used in both the cost-centre
 * card expanded view and the cost-centre detail page stats panel.
 */
export function CategoryBreakdownList({
  categories,
  className,
}: {
  categories: CategoryBreakdown[];
  className?: string;
}) {
  if (!categories.length) return null;
  return (
    <div className={className}>
      {categories.map((cat, i) => {
        const total = cat.compliantCount + cat.nonCompliantCount;
        const pct =
          total > 0 ? Math.round((cat.compliantCount / total) * 100) : 0;
        const color = complianceColor(pct);
        return (
          <div
            key={cat.categoryName}
            className={cn(
              "flex items-center gap-3 py-2.5",
              i < categories.length - 1 && "border-b border-divider",
            )}
          >
            <span className="text-[12px] text-[#4a6278] dark:text-[#94a3b8] flex-1 min-w-0 truncate">
              {cat.categoryName}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ProgressBar value={pct} color={color} className="w-[80px]" />
              <span
                className="font-mono text-[10.5px] w-[28px] text-right font-semibold"
                style={{ color }}
              >
                {pct}%
              </span>
              <span className="font-mono text-[10.5px] text-[#afafaf] w-[40px] text-right">
                {cat.compliantCount}/{total}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
