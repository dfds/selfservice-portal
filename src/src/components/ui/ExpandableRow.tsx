import React from "react";
import { ChevronDown } from "lucide-react";
import { useExpandable } from "@/hooks/useExpandable";
import { cn } from "@/lib/utils";

interface ExpandableRowProps {
  header: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

export function ExpandableRow({
  header,
  children,
  actions,
  className,
  defaultExpanded = false,
}: ExpandableRowProps) {
  const { expanded, triggered, toggle } = useExpandable(defaultExpanded);

  return (
    <div
      className={cn(
        "border border-card rounded-[8px] overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={toggle}
          className="flex-1 flex items-center gap-3 text-left bg-transparent border-0 cursor-pointer p-0 min-w-0"
        >
          {header}
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className={cn(
              "text-muted transition-transform duration-200 flex-shrink-0",
              expanded && "rotate-180",
            )}
          />
        </button>
        {actions}
      </div>
      {expanded && (
        <div className="px-4 pb-3 border-t border-card bg-surface-muted/40">
          {triggered && children}
        </div>
      )}
    </div>
  );
}
