import * as React from "react";
import { cn } from "@/lib/utils";
import { SkeletonStatCardValue } from "@/components/ui/skeleton";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: React.ReactNode;
  label: string;
  loading?: boolean;
  hasData?: boolean;
}

export function StatCard({
  value,
  label,
  loading,
  hasData = true,
  className,
  ...props
}: StatCardProps) {
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
          {hasData ? value : "—"}
        </span>
      )}
      <span className="font-mono text-[9px] tracking-[0.08em] text-muted uppercase block">
        {label}
      </span>
    </div>
  );
}
