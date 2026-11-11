import React, { useState } from "react";
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { TabGroup } from "@/components/ui/TabGroup";
import { useRybbit } from "@/RybbitContext";
import { cn } from "@/lib/utils";
import { ComplianceCalendar } from "./ComplianceCalendar";
import { type ComplianceView, periodLabel } from "./period";
import type { ComplianceDateState } from "./useComplianceDate";

const VIEW_TABS: { id: ComplianceView; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

const LIVE_LABEL: Record<ComplianceView, string> = {
  day: "Today",
  week: "This week",
  month: "This month",
};

/**
 * Day/Week/Month toggle, previous/next period, and a calendar popover. Live
 * data shows when it was last fetched; a past period offers "Back to today".
 */
export function ComplianceDateControl({
  date,
  liveUpdatedAt,
  liveFetching,
  className,
}: {
  date: ComplianceDateState;
  /** `dataUpdatedAt` of the page's main live query. */
  liveUpdatedAt?: number;
  liveFetching?: boolean;
  className?: string;
}) {
  const { trackEvent } = useRybbit();
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ]);

  const label = date.isLive
    ? `${LIVE_LABEL[date.view]} · live`
    : periodLabel(date.view, date.selected);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <TabGroup
        tabs={VIEW_TABS}
        value={date.view}
        onChange={(view) => {
          date.setView(view);
          trackEvent("compliance:history:view-changed", {
            view,
            scope: date.scope,
          });
        }}
      />

      <div className="inline-flex h-[34px] items-stretch rounded-[6px] border border-card bg-surface">
        <button
          type="button"
          onClick={date.stepPrev}
          disabled={!date.canStepPrev}
          aria-label={`Previous ${date.view} with data`}
          className="inline-flex w-8 items-center justify-center rounded-l-[5px] text-secondary transition-colors hover:bg-surface-muted hover:text-action disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          ref={refs.setReference}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          {...getReferenceProps()}
          className={cn(
            "inline-flex min-w-0 items-center gap-2 border-x border-card px-3 font-mono text-[0.75rem] font-semibold transition-colors hover:bg-surface-muted",
            date.isLive ? "text-primary" : "text-action",
          )}
        >
          <CalendarDays size={13} className="flex-shrink-0" />
          <span className="truncate">{label}</span>
        </button>
        <button
          type="button"
          onClick={date.stepNext}
          disabled={!date.canStepNext}
          aria-label={`Next ${date.view} with data`}
          className="inline-flex w-8 items-center justify-center rounded-r-[5px] text-secondary transition-colors hover:bg-surface-muted hover:text-action disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {date.isLive ? (
        <LastUpdated updatedAt={liveUpdatedAt} isFetching={liveFetching} />
      ) : (
        <Button variant="outline" size="sm" onClick={date.goToToday}>
          Back to today
        </Button>
      )}

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              aria-label="Choose a date"
              className="z-50"
            >
              {/* floatingStyles positions with `transform`, which the
                  animation's own `transform` (fill-mode both) would replace,
                  leaving the popover at the viewport origin. */}
              <div className="rounded-[8px] border border-card bg-surface shadow-overlay animate-menu-enter">
                <ComplianceCalendar
                  view={date.view}
                  selected={date.selected}
                  today={date.today}
                  oldestDate={date.oldestDate}
                  days={date.days ?? []}
                  onSelect={(day) => {
                    date.setDate(day);
                    setOpen(false);
                    trackEvent("compliance:history:date-selected", {
                      view: date.view,
                      scope: date.scope,
                    });
                  }}
                />
                {date.days !== undefined && date.days.length === 0 && (
                  <p className="px-4 pb-3 text-[0.6875rem] text-muted">
                    No history recorded yet.
                  </p>
                )}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
