import React from "react"
import styles from "./summary.module.css";
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';

export default function Summary({name, rootId, description}) {
    return <>
        <Text styledAs='sectionHeadline'>Summary</Text>
        <Card variant="fill" surface="main">
            <CardContent>
                <div className={styles.container}>
                    <div className={styles.column}>
                        <Text styledAs={'smallHeadline'}>Name:</Text> {name}
                    </div>
                    <div className={styles.column}>
                        <Text styledAs={'smallHeadline'}>Root Id:</Text> {rootId}
                    </div>
                    <div className={styles.column}>
                        <Text styledAs={'smallHeadline'}>Description:</Text> {description}
                    </div>
                </div>
                <br />
            </CardContent>
        </Card>
    </>
}