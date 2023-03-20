import React, { useContext, useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import { useParams } from 'react-router-dom';
import AppContext from "app-context";
import Members from './members';
import Summary from './summary';
import Resources from './resources';
import Logs from './logs';
import CommunicationChannels from './communicationchannels';
import { getCapabilityMembershipApplications, getCapabilityById } from "SelfServiceApiClient";
import KafkaCluster from "./KafkaCluster";
import Page from "components/Page";
import MembershipApplications from "./membershipapplications";

export default function CapabilityDetailsPage() {
    const { id } = useParams();
    const { selectedCapability, changeSelectedCapability } = useContext(AppContext);
    const [selectedKafkaClusterId, setSelectedKafkaClusterId] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        changeSelectedCapability(id);
    }, [id]);

    return <>
            <Page title={selectedCapability?.details?.name} isLoading={selectedCapability?.isLoading} isNotFound={selectedCapability?.details === null}>
                <Members members={selectedCapability?.members} />
                <Summary id={selectedCapability?.details?.id} name={selectedCapability?.details?.name} description={selectedCapability?.details?.description} />
                <Resources />
                {/*  membership applications  */}
                <MembershipApplications/>
                {/* <Logs /> */}
                {/* <CommunicationChannels /> */}

                {/* TODO: [jandr] change to a kafka cluster component instead */}
                {/* <Topics
                    clusters={topicsState.clusters}
                    selectedTopic={topicsState.selectedTopic}
                    onAddTopicToClusterClicked={handleAddTopicToClusterClicked}
                    onTopicClicked={handleTopicClicked}
                /> */}

                {(selectedCapability?.kafkaClusters || []).map(cluster => <KafkaCluster
                    key={cluster.id}
                    cluster={cluster}
                />)}

            </Page>

        <br/>
    </>
}