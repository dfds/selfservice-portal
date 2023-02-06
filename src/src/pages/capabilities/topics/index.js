import React, { useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Card, CardContent  } from '@dfds-ui/react-components';
import Topic from "./topic";
import styles from "./topics.module.css";

import { Banner, BannerHeadline } from '@dfds-ui/react-components'

function Cluster({id, name, topics, onTopicClicked}) {

    const provisioned = topics.filter(topic => topic.status.toUpperCase() === "Provisioned".toUpperCase());
    const notProvisioned = topics.filter(topic => topic.status.toUpperCase() != "Provisioned".toUpperCase());

    return <div>
        <Text styledAs='subHeadline'>{name}</Text>

        {notProvisioned.length > 0 && 
            <Banner variant="mediumEmphasis">
                <BannerHeadline>Topics currently being provisioned:</BannerHeadline>
                <ul className={styles.notprovisioned}>
                    {notProvisioned.map(topic => <li key={topic.id}>
                        <Text styledAs="body">{topic.name}</Text>
                    </li>)}
                </ul>

            </Banner>
        }

        {provisioned.length == 0 && <div>No topics...yet!</div>}
        {provisioned.map(topic => <Topic 
            key={`${id}-${topic.id}`} 
            {...topic} 
            onHeaderClicked={topicId => onTopicClicked(id, topicId)}
        />)}
    </div>    
}

export default function Topics({clusters}) {
    const [state, setState] = useState([]);

    useEffect(() => {
        setState(clusters || []);
    }, [clusters]);

    const selectTopic = (cid, tid) => setState(prev => {
        const newState = [...prev];
        const cluster = newState.find(x => x.id == cid);

        if (cluster) {
            cluster.topics.forEach(topic => {
                if (topic.id == tid) {
                    topic.isSelected = !topic.isSelected;
                } else {
                    topic.isSelected = false;
                }
            });
        }

        return newState;
    });

    return <>
        <Text styledAs='sectionHeadline'>Topics</Text>
        <Card variant="fill" surface="main">
            <CardContent>
                {state.map(cluster => <Cluster 
                    key={cluster.id} 
                    {...cluster} 
                    onTopicClicked={selectTopic} 
                />)}
            </CardContent>
        </Card>
    </>
}