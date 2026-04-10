import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Content rendered next to the title in a flex row (e.g. a status Badge) */
  titleSuffix?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  titleSuffix,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("mb-6 animate-fade-up", className)}>
      <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-action mb-1.5">
        // Admin
      </div>
      <div className={cn(titleSuffix && "flex items-center gap-3 flex-wrap")}>
        <h1 className="text-[1.75rem] font-bold text-primary">
          {title}
        </h1>
        {titleSuffix}
      </div>
      {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
    </div>
  );
}
