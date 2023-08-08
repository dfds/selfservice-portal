import styles from "./Text.module.css";

export function TextBlock({ children }) {
  return <span className={styles.block}>{children}</span>;
}
