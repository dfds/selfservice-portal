import * as React from "react";
import { cn } from "@/lib/utils";
import { SkeletonStatCardValue } from "@/components/ui/skeleton";
import { HintTooltip } from "@/components/ui/tooltip";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: React.ReactNode;
  label: string;
  loading?: boolean;
  hasData?: boolean;
  /**
   * Explains what the number counts, on hover or focus of the caption.
   * Requires a <TooltipProvider> ancestor.
   */
  tip?: React.ReactNode;
}

export function StatCard({
  value,
  label,
  loading,
  hasData = true,
  tip,
  className,
  ...props
}: StatCardProps) {
  // The caption sits below the value, so the hint opens downwards - anchored
  // above it would cover the very number it is explaining.
  const caption = (
    <span
      className={cn(
        "font-mono text-[0.5625rem] tracking-[0.08em] text-muted uppercase block",
        tip && "cursor-help w-fit mx-auto",
      )}
      {...(tip ? { tabIndex: 0 } : {})}
    >
      {label}
    </span>
  );

  return (
    <div
      className={cn(
        "text-center p-3 bg-surface-muted rounded-[6px] border border-card",
        className,
      )}
      {...props}
    >
      {loading ? (
        <div className="flex justify-center mb-[5px]">
          <SkeletonStatCardValue className="h-5 w-[70%]" />
        </div>
      ) : (
        <span
          className={cn(
            "font-mono text-[1.25rem] font-bold block mb-[3px] animate-number-reveal",
            hasData ? "text-action" : "text-muted",
          )}
        >
          {hasData ? value : "-"}
        </span>
      )}
      {tip ? (
        <HintTooltip tip={tip} side="bottom">
          {caption}
        </HintTooltip>
      ) : (
        caption
      )}
    </div>
  );
}
