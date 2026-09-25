import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LAST_DAYS,
  LAST_HOURS,
  type RangeSel,
  fmtDay,
  monthLabel,
  oldestDay,
  rangeError,
  rangeFromParams,
  rangeSince,
  resolveRange,
  selectCls,
  today,
  withRangeParams,
} from "./shared";

export function useRangeParam() {
  const [params, setParams] = useSearchParams();
  const key = params.toString();
  const sel = useMemo(() => rangeFromParams(new URLSearchParams(key)), [key]);
  const range = useMemo(() => resolveRange(sel), [sel]);
  const since = useMemo(() => rangeSince(sel), [sel]);
  const setSel = (next: RangeSel) =>
    setParams((p) => withRangeParams(p, next), { replace: true });
  return { sel, range, since, setSel };
}

const RECENT_MONTHS = 12;

function recentMonths(): { year: number; month: number }[] {
  const now = new Date();
  return Array.from({ length: RECENT_MONTHS }, (_, i) => {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  });
}

function optionValue(sel: RangeSel): string {
  switch (sel.kind) {
    case "today":
      return "today";
    case "hours":
      return `hours:${sel.hours}`;
    case "last":
      return `last:${sel.days}`;
    case "month":
      return `month:${sel.year}-${sel.month}`;
    case "custom":
      return "custom";
  }
}

const dateCls =
  "px-2 py-1 text-[0.8125rem] font-mono border border-divider rounded-[5px] bg-surface text-primary";

export function RangePicker({
  value,
  onChange,
}: {
  value: RangeSel;
  onChange: (sel: RangeSel) => void;
}) {
  const resolved = resolveRange(value);
  const [custom, setCustom] = useState(value.kind === "custom");
  const [draft, setDraft] = useState(resolved);

  const customFrom = value.kind === "custom" ? value.from : "";
  const customTo = value.kind === "custom" ? value.to : "";
  useEffect(() => {
    if (customFrom) {
      setCustom(true);
      setDraft({ from: customFrom, to: customTo });
    }
  }, [customFrom, customTo]);

  const months = useMemo(() => {
    const list = recentMonths();
    if (
      value.kind === "month" &&
      !list.some((m) => m.year === value.year && m.month === value.month)
    ) {
      list.push({ year: value.year, month: value.month });
    }
    return list;
  }, [value]);

  const thisMonth = months[0];

  function onSelect(v: string) {
    if (v === "custom") {
      setCustom(true);
      setDraft(resolved);
      return;
    }
    setCustom(false);
    const [kind, arg] = v.split(":");
    if (kind === "today") {
      onChange({ kind: "today" });
    } else if (kind === "hours") {
      onChange({ kind: "hours", hours: Number(arg) });
    } else if (kind === "last") {
      onChange({ kind: "last", days: Number(arg) });
    } else {
      const [year, month] = arg.split("-").map(Number);
      onChange({ kind: "month", year, month });
    }
  }

  function updateDraft(next: { from: string; to: string }) {
    setDraft(next);
    if (!rangeError(next.from, next.to)) {
      onChange({ kind: "custom", ...next });
    }
  }

  const error = custom ? rangeError(draft.from, draft.to) : null;
  const min = oldestDay();
  const max = today();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        className={selectCls}
        value={custom ? "custom" : optionValue(value)}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="Date range"
      >
        {LAST_HOURS.map((h) => (
          <option key={h} value={`hours:${h}`}>
            Last {h} hours
          </option>
        ))}
        <option value="today">Today</option>
        {LAST_DAYS.map((d) => (
          <option key={d} value={`last:${d}`}>
            Last {d} days
          </option>
        ))}
        <optgroup label="Month">
          {months.map((m) => (
            <option
              key={`${m.year}-${m.month}`}
              value={`month:${m.year}-${m.month}`}
            >
              {monthLabel(m.year, m.month)}
              {m === thisMonth && " (to date)"}
            </option>
          ))}
        </optgroup>
        <option value="custom">Custom range…</option>
      </select>
      {custom ? (
        <>
          <input
            type="date"
            className={dateCls}
            aria-label="Start date"
            value={draft.from}
            min={min}
            max={max}
            onChange={(e) => updateDraft({ ...draft, from: e.target.value })}
          />
          <span className="text-muted text-[0.75rem]">to</span>
          <input
            type="date"
            className={dateCls}
            aria-label="End date"
            value={draft.to}
            min={min}
            max={max}
            onChange={(e) => updateDraft({ ...draft, to: e.target.value })}
          />
          {error && (
            <span
              role="alert"
              className="text-[0.75rem] text-[var(--color-error)]"
            >
              {error}
            </span>
          )}
        </>
      ) : (
        <span
          className="font-mono text-[0.6875rem] text-muted"
          title={
            value.kind === "hours"
              ? "Daily figures cover each UTC day the range touches; hourly figures cover the range itself."
              : undefined
          }
        >
          {resolved.from === resolved.to
            ? fmtDay(resolved.from)
            : `${fmtDay(resolved.from)} – ${fmtDay(resolved.to)}`}
        </span>
      )}
    </div>
  );
}
