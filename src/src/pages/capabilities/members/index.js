import React from "react"
import styles from "./members.module.css";
import { Text } from '@dfds-ui/typography';
import ProfilePicture from './profilepicture';

export default function Members({members}) {
    return <>
        <Text styledAs='sectionHeadline'>Members</Text>

        <div className={styles.members}>
            {members.map(x => <ProfilePicture key={x.name} name={x.name} pictureUrl={x.pictureUrl} />)}
        </div>
    </>
}