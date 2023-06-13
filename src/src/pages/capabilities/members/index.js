import React, { useContext } from "react"
import styles from "./members.module.css";
import { Text } from '@dfds-ui/typography';
import ProfilePicture from './profilepicture';
import SelectedCapabilityContext from "../SelectedCapabilityContext";

export default function Members() {
    const { members } = useContext(SelectedCapabilityContext);

    return <>
        <Text styledAs='sectionHeadline'>Members ({(members || []).length})</Text>
        <div className={styles.members}>
            {(members || []).map(member => <ProfilePicture 
                key={member.email} 
                name={member.name ?? member.email} 
                pictureUrl={member.pictureUrl} 
            />)}
        </div>
    </>
}