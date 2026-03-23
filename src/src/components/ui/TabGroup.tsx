import * as React from "react";
import { cn } from "@/lib/utils";

interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface TabGroupProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "pill" | "underline";
  className?: string;
}

export function TabGroup<T extends string>({
  tabs,
  value,
  onChange,
  variant = "pill",
  className,
}: TabGroupProps<T>) {
  if (variant === "underline") {
    return (
      <div className={cn("flex gap-1 border-b border-card", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-3 py-2 text-[12px] font-medium border-b-2 -mb-px cursor-pointer bg-transparent transition-colors",
              value === tab.id
                ? "border-action text-action"
                : "border-transparent text-muted hover:text-secondary",
            )}
          >
            {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-1 p-1 bg-surface-muted rounded-[6px] w-fit",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors cursor-pointer border-0",
            value === tab.id
              ? "bg-white dark:bg-slate-700 text-primary shadow-card"
              : "text-secondary hover:text-primary bg-transparent",
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
