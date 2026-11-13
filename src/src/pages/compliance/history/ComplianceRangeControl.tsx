import React, { useId, useState } from "react";
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { CalendarDays, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRybbit } from "@/RybbitContext";
import { cn } from "@/lib/utils";
import { ComplianceCalendar } from "./ComplianceCalendar";
import type { ComplianceView } from "./period";
import {
  type HistoryRange,
  QUICK_RANGES,
  type RangeErrors,
  formatSpan,
  isRelative,
  rangeLabel,
  readRecentRanges,
  rememberRange,
  resolveExpr,
  sameRange,
  validateRange,
} from "./range";
import type { ComplianceDateState } from "./useComplianceDate";

type RangeSource = "absolute" | "quick" | "recent";

// Below this viewport width the calendar opens inside the form column.
const SIDE_BY_SIDE_MIN_WIDTH = 900;

const LABEL =
  "font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted";

const VIEW_OPTIONS: { id: ComplianceView; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

/** The "by:" Day/Week/Month dropdown. */
function ViewSelect({ date }: { date: ComplianceDateState }) {
  const { trackEvent } = useRybbit();
  const viewSelectId = useId();
  return (
    <div className="inline-flex items-center gap-1.5">
      <label
        htmlFor={viewSelectId}
        className="font-mono text-[0.6875rem] text-secondary"
      >
        by:
      </label>
      <select
        id={viewSelectId}
        value={date.view}
        onChange={(e) => {
          const view = e.target.value as ComplianceView;
          date.setView(view);
          trackEvent("compliance:history:view-changed", {
            view,
            scope: date.scope,
          });
        }}
        className="h-[34px] rounded-[6px] border border-card bg-surface pl-2 pr-1 font-mono text-[0.75rem] font-semibold text-primary outline-none transition-colors hover:bg-surface-muted focus:border-[#0e7cc1] dark:focus:border-[#60a5fa]"
      >
        {VIEW_OPTIONS.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * The history section's control: "by:" view, the plotted From–To range, and a
 * popover to type a range, pick days from a calendar, or choose a quick or
 * recently used range.
 */
export function ComplianceRangeControl({
  date,
  liveUpdatedAt,
  liveFetching,
  className,
}: {
  date: ComplianceDateState;
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
    middleware: [
      offset(6),
      flip(),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableWidth, availableHeight, elements }) {
          elements.floating.style.maxWidth = `${availableWidth}px`;
          // Read by the panel, so a tall panel scrolls inside the viewport
          // rather than extending the page.
          elements.floating.style.setProperty(
            "--range-panel-max-h",
            `${Math.max(240, availableHeight)}px`,
          );
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ]);

  const range = date.range;
  if (!range) return null;
  const { resolved } = range;

  const apply = (value: HistoryRange, source: RangeSource) => {
    range.set(value);
    setOpen(false);
    trackEvent("compliance:history:range-applied", {
      source,
      relative: isRelative(value.from) && isRelative(value.to),
    });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <ViewSelect date={date} />

      <button
        ref={refs.setReference}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        title={formatSpan(resolved)}
        {...getReferenceProps()}
        className="inline-flex h-[34px] min-w-0 items-center gap-2 rounded-[6px] border border-card bg-surface px-3 font-mono text-[0.75rem] font-semibold text-primary transition-colors hover:bg-surface-muted"
      >
        <CalendarDays size={13} className="flex-shrink-0" />
        <span className="truncate">{rangeLabel(range.value, resolved)}</span>
      </button>

      {resolved.end === date.today && (
        // Same reserved width as the page control, so ticking doesn't shift it.
        <LastUpdated
          updatedAt={liveUpdatedAt}
          isFetching={liveFetching}
          className="min-w-[25ch]"
        />
      )}

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
              aria-label="Choose a time range"
              className="z-50"
            >
              {/* The animation's `transform` would replace floatingStyles' own. */}
              <div className="max-h-[var(--range-panel-max-h)] overflow-auto rounded-[8px] border border-card bg-surface shadow-overlay animate-menu-enter">
                <RangePanel date={date} onApply={apply} />
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}

// ─── Popover panel ───────────────────────────────────────────────────────────

function RangePanel({
  date,
  onApply,
}: {
  date: ComplianceDateState;
  onApply: (range: HistoryRange, source: RangeSource) => void;
}) {
  const current = date.range!.value;
  const [from, setFrom] = useState(current.from);
  const [to, setTo] = useState(current.to);
  const [errors, setErrors] = useState<RangeErrors>({});
  const [calendarFor, setCalendarFor] = useState<"from" | "to" | null>(null);
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState(readRecentRanges);

  const submit = () => {
    const value = { from: from.trim(), to: to.trim() };
    const checked = validateRange(value, date.today);
    if (checked.errors) {
      setErrors(checked.errors);
      return;
    }
    setRecent(rememberRange(value));
    onApply(value, "absolute");
  };

  const quick = QUICK_RANGES.filter((q) =>
    q.label.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const stacked = useIsMobile(SIDE_BY_SIDE_MIN_WIDTH);

  const calendarValue =
    calendarFor && resolveExpr(calendarFor === "from" ? from : to, date.today);

  const calendar = calendarFor && (
    <div className={cn(stacked && "-mx-2 rounded-[6px] border border-divider")}>
      <ComplianceCalendar
        view="day"
        selected={calendarValue || date.today}
        today={date.today}
        oldestDate={date.oldestDate}
        days={date.days ?? []}
        anyDay
        onSelect={(day) => {
          if (calendarFor === "from") setFrom(day);
          else setTo(day);
          setErrors({});
          setCalendarFor(null);
        }}
      />
    </div>
  );

  return (
    <div className="flex max-w-full flex-col sm:flex-row">
      <form
        className="flex min-w-0 flex-col gap-3 p-4 sm:w-[320px]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <span className={LABEL}>Absolute range</span>
        <BoundField
          label="From"
          value={from}
          error={errors.from}
          calendarOpen={calendarFor === "from"}
          onChange={(v) => {
            setFrom(v);
            setErrors((e) => ({ ...e, from: undefined }));
          }}
          onToggleCalendar={() =>
            setCalendarFor((c) => (c === "from" ? null : "from"))
          }
        />
        <BoundField
          label="To"
          value={to}
          error={errors.to}
          calendarOpen={calendarFor === "to"}
          onChange={(v) => {
            setTo(v);
            setErrors((e) => ({ ...e, to: undefined }));
          }}
          onToggleCalendar={() =>
            setCalendarFor((c) => (c === "to" ? null : "to"))
          }
        />
        {calendarFor && stacked && calendar}
        <div>
          <Button type="submit" variant="action" size="sm">
            Apply time range
          </Button>
        </div>

        {recent.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-divider pt-3">
            <span className={LABEL}>Recently used ranges</span>
            {recent.map((r) => (
              <button
                key={`${r.from}_${r.to}`}
                type="button"
                onClick={() => onApply(r, "recent")}
                className="rounded-[4px] px-1.5 py-1 text-left font-mono text-[0.75rem] text-primary transition-colors hover:bg-surface-muted hover:text-action"
              >
                {r.from} to {r.to}
              </button>
            ))}
          </div>
        )}

        <span className="text-[0.6875rem] text-muted">
          Days are UTC calendar days; From and To are both included. Type a date
          as YYYY-MM-DD or relative to today: now, now-30d, now-2w, now-6M,
          now-1y.
        </span>
      </form>

      {calendarFor && !stacked && (
        <div className="flex flex-col border-l border-divider p-2">
          <div className="flex items-center justify-between px-2 pt-2">
            <span className={LABEL}>
              {calendarFor === "from" ? "From" : "To"} day
            </span>
            <button
              type="button"
              onClick={() => setCalendarFor(null)}
              aria-label="Close calendar"
              className="rounded p-1 text-secondary hover:bg-surface-muted hover:text-action"
            >
              <X size={13} />
            </button>
          </div>
          {calendar}
        </div>
      )}

      <div className="flex flex-col gap-1 border-t border-divider p-4 sm:w-[200px] sm:border-l sm:border-t-0">
        <div className="relative mb-1">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quick ranges"
            aria-label="Search quick ranges"
            className="h-[32px] w-full rounded-[5px] border border-card bg-surface pl-8 pr-2 text-[0.75rem] text-primary outline-none placeholder:text-muted focus:border-[#0e7cc1] dark:focus:border-[#60a5fa]"
          />
        </div>
        {quick.map((q) => {
          const active = sameRange(q, current);
          return (
            <button
              key={q.label}
              type="button"
              aria-current={active || undefined}
              onClick={() => onApply(q, "quick")}
              className={cn(
                "rounded-[4px] border-l-2 px-2 py-1.5 text-left text-[0.75rem] transition-colors",
                active
                  ? "border-[var(--color-action)] bg-surface-muted font-semibold text-primary"
                  : "border-transparent text-secondary hover:bg-surface-muted hover:text-primary",
              )}
            >
              {q.label}
            </button>
          );
        })}
        {quick.length === 0 && (
          <span className="px-2 py-1.5 text-[0.75rem] italic text-muted">
            No matching ranges
          </span>
        )}
      </div>
    </div>
  );
}

function BoundField({
  label,
  value,
  error,
  calendarOpen,
  onChange,
  onToggleCalendar,
}: {
  label: string;
  value: string;
  error?: string;
  calendarOpen: boolean;
  onChange: (value: string) => void;
  onToggleCalendar: () => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[0.75rem] font-medium text-primary">
        {label}
      </label>
      <div className="flex">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-[34px] min-w-0 flex-1 rounded-l-[5px] border border-card bg-surface px-2.5 font-mono text-[0.75rem] text-primary outline-none focus:border-[#0e7cc1] dark:focus:border-[#60a5fa]",
            error && "border-[var(--color-error)]",
          )}
        />
        <button
          type="button"
          onClick={onToggleCalendar}
          aria-label={`Pick the ${label.toLowerCase()} day from a calendar`}
          aria-pressed={calendarOpen}
          className={cn(
            "inline-flex w-[34px] items-center justify-center rounded-r-[5px] border border-l-0 border-card text-secondary transition-colors hover:bg-surface-muted hover:text-action",
            calendarOpen && "bg-surface-muted text-action",
          )}
        >
          <CalendarDays size={14} />
        </button>
      </div>
      {error && (
        <span
          id={`${id}-error`}
          className="text-[0.6875rem] text-[var(--color-error)]"
        >
          {error}
        </span>
      )}
    </div>
  );
}
