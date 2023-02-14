import React, { useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import Topic from "./topic";
import styles from "./topics.module.css";
import { Button, Card, CardContent, Banner, BannerHeadline, ButtonStack } from '@dfds-ui/react-components';

function TopicSection({name, topics, clusterId, selectedTopic, onTopicClicked}) {
    return <>
        <Text styledAs='action'>{name}</Text>
        {topics.length == 0 &&
            <div style={{ paddingLeft: "1rem", fontStyle: "italic" }}>
                No {name.toLocaleLowerCase()} topics...yet!
            </div>
        }

        {topics.map(topic => <Topic 
            key={`${clusterId}-${topic.id}`} 
            {...topic} 
            isSelected={clusterId === selectedTopic?.kafkaClusterId && topic.id === selectedTopic?.id}
            onHeaderClicked={topicId => onTopicClicked(clusterId, topicId)}
        />)}
    </>
}

function Cluster({clusterId, name, description, topics, selectedTopic, onTopicClicked, onAddClicked}) {
    const provisioned = topics.filter(topic => topic.status.toUpperCase() === "Provisioned".toUpperCase());
    const notProvisioned = topics.filter(topic => topic.status.toUpperCase() != "Provisioned".toUpperCase());

    const handleAddClicked = () => {
        if (onAddClicked) {
            onAddClicked(clusterId)
        }
    }

    const publicTopics = provisioned.filter(x => x.name.startsWith("pub."));
    const privateTopcis = provisioned.filter(x => !x.name.startsWith("pub."));

    return <div>
        {notProvisioned.length > 0 && 
            <>
                <Banner variant="mediumEmphasis">
                    <BannerHeadline>Topics currently being provisioned:</BannerHeadline>
                    <ul className={styles.notprovisioned}>
                        {notProvisioned.map(topic => <li key={topic.id}>
                            <Text styledAs="body">{topic.name}</Text>
                        </li>)}
                    </ul>
                </Banner>
            </>
        }

        <Text styledAs="label">Description</Text>
        {(description || "").split("\n").map(x => <Text>{x}</Text>)}

        <ButtonStack align="right">
            <Button size="small" onClick={handleAddClicked}>Add topic</Button>
            <Button size="small" variation="outlined" disabled>Get credentials</Button>
        </ButtonStack>
        
        <br />

        <TopicSection 
            name="Public" 
            topics={publicTopics} 
            clusterId={clusterId} 
            selectedTopic={selectedTopic} 
            onTopicClicked={onTopicClicked} 
        />

        <TopicSection 
            name="Private" 
            topics={privateTopcis} 
            clusterId={clusterId} 
            selectedTopic={selectedTopic} 
            onTopicClicked={onTopicClicked} 
        />

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
        {clusters.map(cluster => <div key={cluster.id}>

            <Text styledAs='sectionHeadline'>Topics (on {cluster.name.toLocaleLowerCase()} cluster)</Text>

            <Card variant="fill" surface="main">
                <CardContent>
                    <Cluster
                        key={cluster.id}
                        clusterId={cluster.id}
                        {...cluster}
                        selectedTopic={selectedTopic}
                        onTopicClicked={handleTopicClicked}
                        onAddClicked={handleAddTopicToClusterClicked} 
                    />
                </CardContent>
            </Card>
        </div>)}
    </>
}