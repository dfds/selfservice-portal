import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  color?: string;
}

export function ProgressBar({
  value,
  color,
  className,
  ...props
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "h-2 bg-[#f2f2f2] dark:bg-slate-800 rounded border border-[#d9dcde] dark:border-[#334155] overflow-hidden",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded animate-progress-fill"
        style={
          {
            "--progress-value": clamped / 100,
            transformOrigin: "left",
            backgroundColor: color,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
