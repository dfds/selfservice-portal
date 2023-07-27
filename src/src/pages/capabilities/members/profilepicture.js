import React from "react";
import styles from "./profilepicture.module.css";

export default function ProfilePicture({name, pictureUrl}) {
    return <div className={styles.container}>
        <div className={styles.background} title={name}>
            <img src={pictureUrl} alt="profile"/>
        </div>
        <div className={styles.name}>{name}</div>
    </div>
}