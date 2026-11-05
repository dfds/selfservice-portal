import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { type ChartSeries, DailyChart } from "@/pages/copilot/shared";
import { LoginHover } from "./LoginHover";

/** GitHub logins are case-insensitive. */
function focusedKey(series: ChartSeries[], focus: string | null) {
  const f = focus?.toLowerCase();
  return series.find((s) => s.label.toLowerCase() === f)?.key;
}

function SeriesLegend({
  series,
  focus,
  onFocus,
  logins,
}: {
  series: ChartSeries[];
  focus: string | null;
  onFocus: (label: string | null) => void;
  logins?: boolean;
}) {
  const { isDark } = useTheme();
  const active = focusedKey(series, focus);
  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-2 gap-y-1 text-[11px]">
      {series.map((s) => {
        const color = isDark ? s.darkColor ?? s.color : s.color;
        const on = s.key === active;
        const entry = (
          <button
            type="button"
            aria-pressed={on}
            onClick={() => onFocus(on ? null : s.label)}
            className={cn(
              "inline-flex max-w-[14rem] items-center gap-1 rounded-[3px] border-0 bg-transparent px-1 py-0.5 cursor-pointer hover:bg-surface-muted",
              active !== undefined && !on && "opacity-40",
              on && "font-semibold",
            )}
            style={{ color }}
          >
            <span
              className="h-0.5 w-3 shrink-0"
              style={{ background: color }}
            />
            <span className="truncate">{s.label}</span>
          </button>
        );
        return (
          <LoginHover
            key={s.key}
            login={logins && s.label !== "unknown" ? s.label : ""}
          >
            {entry}
          </LoginHover>
        );
      })}
    </div>
  );
}

export function FocusChart({
  chart,
  focus,
  onFocus,
  logins,
  ...props
}: Omit<
  React.ComponentProps<typeof DailyChart>,
  "data" | "series" | "legend" | "highlight"
> & {
  chart: { data: Record<string, string | number>[]; series: ChartSeries[] };
  focus: string | null;
  onFocus: (label: string | null) => void;
  logins?: boolean;
}) {
  const highlight = focusedKey(chart.series, focus);
  return (
    <>
      <DailyChart
        data={chart.data}
        series={chart.series}
        legend={false}
        highlight={highlight}
        {...props}
      />
      {chart.data.length > 0 && (
        <SeriesLegend
          series={chart.series}
          focus={focus}
          onFocus={onFocus}
          logins={logins}
        />
      )}
    </>
  );
}
