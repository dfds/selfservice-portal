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

export function CapabilityCostSummary({ data }) {
  return (
    <div className={styles.costDataSummary}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="timestamp" hide />
          <YAxis type="number" domain={["dataMin", "dataMax"]} hide></YAxis>
          <Tooltip content={CostTooltip} />
          <CartesianGrid />
          <Line
            type="monotone"
            dataKey="pv"
            stroke="#014874"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LargeCapabilityCostSummary({ data }) {
  const d1 = Math.min(...data.map((x) => x.pv)) * 0.95;
  const d2 = Math.max(...data.map((x) => x.pv)) * 1.05;

  const domain = [d1, d2];
  return (
    <div className={styles.largeCostDataSummary}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis hide />
          <YAxis type="number" scale="linear" domain={domain} />
          <Tooltip content={CostTooltip} />
          <CartesianGrid strokeDasharray="1 1" />
          <Line
            type="monotone"
            dataKey="pv"
            stroke="#055874"
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
