import styles from "./style.module.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function BasicCapabilityCost({data, capabilityId}) {
    return (
      <div className={styles.costData}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Tooltip wrapperStyle={{zIndex: 1000}} content={<CostTooltip />} />
            <Line type="natural" dataKey="pv" stroke="#014874" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
}

const CostTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className="label"><span className={styles.tooltipName}>{new Date(Date.parse(payload[0].payload.name)).toLocaleDateString()}:</span> <span className={styles.tooltipValue}>{payload[0].value.toFixed(2)}$</span></p>
      </div>
    );
  }

  return null;
};

export default BasicCapabilityCost;