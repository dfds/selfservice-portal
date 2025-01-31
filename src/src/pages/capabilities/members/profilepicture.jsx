import React from "react";
import styles from "./profilepicture.module.css";
import { Account } from "@/components/dfds-ui/icons/system";

export default function ProfilePicture({ name, pictureUrl }) {
  return (
    <div className={styles.container}>
      <div className={styles.background} title={name}>
        {pictureUrl !== "" && pictureUrl !== undefined ? (
          <img src={pictureUrl} alt="profile" />
        ) : (
          <Account className={styles.nopicture} />
        )}
      </div>
      <div className={styles.name}>{name}</div>
    </div>
  );
}
