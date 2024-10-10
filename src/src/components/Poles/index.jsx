import styles from "./Poles.module.css";

export default function Poles({ leftContent, rightContent }) {
  return (
    <div className={styles.container}>
      <div className={styles.leftcontent}>{leftContent}</div>
      <div className={styles.rightcontent}>{rightContent}</div>
    </div>
  );
}
