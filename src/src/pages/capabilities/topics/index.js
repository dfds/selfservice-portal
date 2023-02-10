import React, { useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import Topic from "./topic";
import styles from "./topics.module.css";
import { Button, Card, CardContent, Banner, BannerHeadline } from '@dfds-ui/react-components';

function Cluster({clusterId, name, topics, selectedTopic, onTopicClicked, onAddClicked}) {
    const provisioned = topics.filter(topic => topic.status.toUpperCase() === "Provisioned".toUpperCase());
    const notProvisioned = topics.filter(topic => topic.status.toUpperCase() != "Provisioned".toUpperCase());

    const handleAddClicked = () => {
        if (onAddClicked) {
            onAddClicked(clusterId)
        }
    }

    return <div>
        <div className={styles.clusterheader}>
            <Text styledAs='subHeadline'>{name}</Text>
            <Button size="small" onClick={handleAddClicked}>Add</Button>
        </div>

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
            key={`${clusterId}-${topic.id}`} 
            {...topic} 
            isSelected={clusterId === selectedTopic?.kafkaClusterId && topic.id === selectedTopic?.id}
            onHeaderClicked={topicId => onTopicClicked(clusterId, topicId)}
        />)}
    </div>    
}

export default function Topics({clusters, selectedTopic, onAddTopicToClusterClicked, onTopicClicked}) {
    const handleTopicClicked = (clusterId, topicId) => {
        if (onTopicClicked) {
            onTopicClicked(clusterId, topicId);
        }
    };

    const handleAddTopicToClusterClicked = (clusterId) => {
        if (onAddTopicToClusterClicked) {
            onAddTopicToClusterClicked(clusterId);
        }
    };

    return <>
        <Text styledAs='sectionHeadline'>Topics</Text>
        <Card variant="fill" surface="main">
            <CardContent>
                {clusters.map(cluster => <Cluster
                    key={cluster.id}
                    clusterId={cluster.id}
                    {...cluster}
                    selectedTopic={selectedTopic}
                    onTopicClicked={handleTopicClicked}
                    onAddClicked={handleAddTopicToClusterClicked}
                />)}
            </CardContent>
        </Card>
    </>
}