import React from "react"
import { Text } from '@dfds-ui/typography';
import { Button, ButtonStack } from '@dfds-ui/react-components';
import PageSection from "components/PageSection";
import styles from "./summary.module.css";

export default function Summary({name, id, description}) {
    return <PageSection headline="Summary">
        <div className={styles.container}>
            <div className={styles.column}>
                <Text styledAs={'smallHeadline'}>Name</Text> {name}
            </div>
            <div className={styles.column}>
                <Text styledAs={'smallHeadline'}>Description</Text> {description}
            </div>
            <div className={styles.column}>
                {/* <Text styledAs={'smallHeadline'}>?</Text> 
                <ButtonStack align="right">
                    <Button>Join</Button>
                    <Button variation="outlined" >Leave</Button>
                </ButtonStack> */}
            </div>
        </div>
        <br />
    </PageSection>
}