import React from "react"
import styles from "./members.module.css";
import { Text } from '@dfds-ui/typography';
import ProfilePicture from './profilepicture';

export default function Members({members}) {
    console.log("members: ", members);
    
    return <>
        <Text styledAs='sectionHeadline'>Members</Text>

        <div className={styles.members}>
            {(members || []).map(member => <ProfilePicture key={member.email} name={member.email} pictureUrl={member.pictureUrl} />)}
        </div>
    </>
}