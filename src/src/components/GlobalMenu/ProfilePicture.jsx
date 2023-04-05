import React, { useContext } from "react";
import AppContext from "AppContext";
import styles from "./ProfilePicture.module.css";

export default function ProfilePicture({}) {
    const { user } = useContext(AppContext);
    const name = user ? user.name : "";
    const pictureUrl = user ? user.profilePictureUrl : "";

    return <div className={styles.container}>
        <div className={styles.background} title={name}>
            <img className={styles.picture} src={pictureUrl} alt={name}/>
        </div>
    </div>
}