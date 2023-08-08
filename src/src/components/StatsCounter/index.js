import CountUp from "react-countup";
import styles from "./StatsCounter.module.css";

export default function StatsCounter({ title, count }) {
  return (
    <div className={styles.container}>
      <span className={styles.value}>
        <CountUp end={count} />
      </span>
      <span className={styles.title}>{title}</span>
    </div>
  );
}
