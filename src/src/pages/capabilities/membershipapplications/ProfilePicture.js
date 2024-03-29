import React from "react";
import styles from "./ProfilePicture.module.css";
import { Account } from "@dfds-ui/icons/system";

export default function ProfilePicture({ name, pictureUrl }) {
  return (
    <div className={styles.container}>
      <div className={styles.background} title={name}>
        {pictureUrl !== "" ? (
          <img className={styles.picture} src={pictureUrl} alt={name} />
        ) : (
          <Account className={styles.nopicture} />
        )}
      </div>
    </div>
  );
}
