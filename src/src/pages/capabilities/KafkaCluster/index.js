import React from "react"
import { Text } from '@dfds-ui/typography';
import Topic from "./Topic";
import { Button, Card, CardContent, ButtonStack } from '@dfds-ui/react-components';
import { Divider } from "@dfds-ui/react-components/divider";
import PageSection from "components/PageSection";

function TopicSection({name, topics, clusterId, selectedTopic, onTopicClicked}) {
    return <>
        <Text styledAs='action'>{name}</Text>
        <Divider />
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

export default function KafkaCluster({cluster, selectedTopic, onAddTopicToClusterClicked, onTopicClicked}) {
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

    const topics = cluster.topics || [];
    const publicTopics = topics.filter(x => x.name.startsWith("pub."));
    const privateTopcis = topics.filter(x => !x.name.startsWith("pub."));

    return <PageSection headline={`Kafka Topics (${cluster.name.toLocaleLowerCase()})`}>
        <Text styledAs="label">Description</Text>
        {(cluster.description || "").split("\n").map((x, i) => <Text key={i}>{x}</Text>)}

        <ButtonStack align="left">
            <Button size="small" onClick={handleAddTopicToClusterClicked}>Add topic</Button>
            <Button size="small" variation="outlined" disabled>Get credentials</Button>
        </ButtonStack>
        
        <br />

        <TopicSection 
            name="Public" 
            topics={publicTopics} 
            clusterId={cluster.id} 
            selectedTopic={selectedTopic} 
            onTopicClicked={onTopicClicked} 
        />

        <br />

        <TopicSection 
            name="Private" 
            topics={privateTopcis} 
            clusterId={cluster.id} 
            selectedTopic={selectedTopic} 
            onTopicClicked={onTopicClicked} 
        />
    </PageSection>
}