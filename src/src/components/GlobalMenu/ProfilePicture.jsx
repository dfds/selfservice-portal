import React, { useContext } from "react";
import AppContext from "../../app-context";
import styles from "./ProfilePicture.module.css";

export default function ProfilePicture({}) {
    const { user } = useContext(AppContext);

    return <div className={styles.container}>
        <div className={styles.background} title={user.name}>
            <img className={styles.picture} src={user.profilePictureUrl} alt={user.name}/>
        </div>
    </div>
}