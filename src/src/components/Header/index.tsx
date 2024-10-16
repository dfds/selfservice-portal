import React from "react";
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div>DFDS</div>
        </div>
        <div className={styles.nav}>hi</div>
        <div className={styles.profile}>hi</div>
      </div>
    </>
  );
}
