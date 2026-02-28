import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: React.ReactNode;
  label: string;
  loading?: boolean;
  hasData?: boolean;
}

export function StatCard({ value, label, loading, hasData = true, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        "text-center p-3 bg-[#f2f2f2] dark:bg-[#0f172a] rounded-[6px] border border-[#d9dcde] dark:border-[#334155]",
        className,
      )}
      {...props}
    >
      {loading ? (
        <div className="flex justify-center py-1">
          <Spinner size="sm" />
        </div>
      ) : (
        <span
          className={cn(
            "font-mono text-[1.25rem] font-bold block mb-[3px]",
            hasData ? "text-[#0e7cc1] dark:text-[#60a5fa]" : "text-[#afafaf] dark:text-slate-500",
          )}
        >
          {hasData ? value : "—"}
        </span>
      )}
      <span className="font-mono text-[9px] tracking-[0.08em] text-[#afafaf] dark:text-slate-500 uppercase block">
        {label}
      </span>
    </div>
  );
}
