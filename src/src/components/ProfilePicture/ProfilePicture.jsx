import React from "react";
import styles from "./ProfilePicture.module.css";
import { User } from "lucide-react";

export default function ProfilePicture({ name, pictureUrl }) {
  const hasPicture =
    pictureUrl !== undefined && pictureUrl != null && pictureUrl !== "";
  return (
    <div className={styles.container}>
      <div className={styles.background} title={name}>
        {hasPicture ? (
          <img className={styles.picture} src={pictureUrl} alt={name} />
        ) : (
          <User className={styles.nopicture} />
        )}
      </div>
    </div>
  );
}
