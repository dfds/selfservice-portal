import React from "react"
import { Text } from '@dfds-ui/typography';
import { Button, ButtonStack } from '@dfds-ui/react-components';
import PageSection from "components/PageSection";
import NewTopicDialog from './NewTopicDialog';
import { useState } from "react";
import { useContext } from "react";
import AppContext from "AppContext";
import TopicList from "./TopicList";

export default function KafkaCluster({cluster}) {
    const { selectedCapability } = useContext(AppContext);
    const [showDialog, setShowDialog] = useState(false);
    const [isInProgress, setIsInProgress] = useState(false);

    const topics = cluster.topics || [];
    const publicTopics = topics.filter(x => x.name.startsWith("pub."));
    const privateTopcis = topics.filter(x => !x.name.startsWith("pub."));
    const clusterDescription = (cluster.description || "")
        .split("\n")
        .map((x, i) => <Text key={i}>{x}</Text>);

    const handleAddTopicToClusterClicked = () => setShowDialog(true);
    const handleCloseTopicFormClicked = () => setShowDialog(false);

    const handleAddTopic = async ({name, description, partitions, retention}) => {
        setIsInProgress(true);
        await selectedCapability?.addTopicToCluster(cluster.id, {name, description, partitions, retention});
        setIsInProgress(false);
        setShowDialog(false);
    };

    const handleTopicClicked = (clusterId, topicId) => {
        selectedCapability?.toggleSelectedKafkaTopic(clusterId, topicId);
    };

    const hasWriteAccess = (selectedCapability?.details?._links?.topics?.allow || []).includes("POST");

    return <PageSection headline={`Kafka Topics (${cluster.name.toLocaleLowerCase()})`}>
        <Text styledAs="label">Description</Text>
        {clusterDescription}

        {showDialog &&
            <NewTopicDialog
                capabilityId={selectedCapability?.details?.id}
                clusterName={cluster.name.toLocaleLowerCase()}
                inProgress={isInProgress}
                onAddClicked={handleAddTopic}
                onCloseClicked={handleCloseTopicFormClicked}
            />
        }

        {hasWriteAccess && 
            <ButtonStack align="left">
                <Button size="small" onClick={handleAddTopicToClusterClicked}>Add topic</Button>
                {/* <Button size="small" variation="outlined" disabled>Get credentials</Button> */}
            </ButtonStack>
        }

        <br />

        <TopicList 
            name="Public" 
            topics={publicTopics} 
            clusterId={cluster.id} 
            selectedTopic={selectedCapability?.selectedKafkaTopic} 
            onTopicClicked={handleTopicClicked} 
        />
        <br />

        {hasWriteAccess && 
            <>
                <TopicList 
                    name="Private" 
                    topics={privateTopcis} 
                    clusterId={cluster.id} 
                    selectedTopic={selectedCapability?.selectedKafkaTopic} 
                    onTopicClicked={handleTopicClicked} 
                />
                <br />
            </>
        }

    </PageSection>
}