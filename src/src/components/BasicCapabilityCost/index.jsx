import styles from "./style.module.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import React from "react";
import { useTheme } from "@/context/ThemeContext";

export function CapabilityCostSummary({ data, previousData, previousDataIsFull = true }) {
  const has_data = data.length > 0;

  const totalCost = has_data
    ? data.reduce((acc, x) => acc + x.pv, 0)
    : null;
  const avgCost = totalCost != null ? totalCost / data.length : null;

  const prevTotal =
    previousData && previousData.length > 0
      ? previousData.reduce((acc, x) => acc + x.pv, 0)
      : null;
  const prevAvg = prevTotal != null ? prevTotal / previousData.length : null;

  const trendPct =
    avgCost != null && prevAvg != null && prevAvg > 0
      ? ((avgCost - prevAvg) / prevAvg) * 100
      : null;

  const isLower = trendPct != null && trendPct < 0;
  const trendClass = isLower ? styles.trendGood : styles.trendBad;

  const displayedCost =
    totalCost == null ? "No data" : totalCost < 1 ? "<$1" : `$${Math.floor(totalCost)}`;

  return (
    <div className={styles.costInline}>
      <span className={styles.costDataSummaryCost}>{displayedCost}</span>
      {trendPct != null ? (
        <span
          className={`${styles.costTrend} ${trendClass}`}
          title={!previousDataIsFull ? "Approximate \u2014 less than 60 days of history available" : undefined}
        >
          {isLower ? "\u2193" : "\u2191"} {!previousDataIsFull ? "~" : ""}{Math.abs(Math.round(trendPct))}%
        </span>
      ) : (
        <span className={`${styles.costTrend} ${styles.trendUnknown}`} title="Not enough history to calculate trend">
          ?%
        </span>
      )}
    </div>
  );
}

export function LargeCapabilityCostSummary({ data }) {
  const { isDark } = useTheme();
  const lineColor = isDark ? "#38bdf8" : "#055874";

  const d1 = Math.min(...data.map((x) => x.pv)) * 0.95;
  const d2 = Math.max(...data.map((x) => x.pv)) * 1.05;

  const domain = [d1, d2];
  return (
    <div className={styles.largeCostDataSummary}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
          <XAxis
            dataKey="name"
            tickFormatter={(val) =>
              new Date(val).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            type="number"
            scale="linear"
            domain={domain}
            tickFormatter={(val) => `$${val}`}
            tick={{ fontSize: 11 }}
            width={55}
          />
          <Tooltip content={CostTooltip} />
          <CartesianGrid strokeDasharray="1 1" />
          <Line
            type="monotone"
            dataKey="pv"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const CostTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className="label">
          <span className={styles.tooltipName}>
            {new Date(Date.parse(payload[0].payload.name)).toLocaleDateString()}
            :
          </span>
          <span className={styles.tooltipValue}>{payload[0].value}$</span>
        </p>
      </div>
    );
  }

  return null;
};

export default CapabilityCostSummary;
