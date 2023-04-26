import React, { useContext, useEffect } from "react"
import { useParams } from 'react-router-dom';
import SelectedCapabilityContext from "SelectedCapabilityContext";
import Members from './members';
import Summary from './summary';
import Resources from './resources';
import Logs from './logs';
import CommunicationChannels from './communicationchannels';
import KafkaCluster from "./KafkaCluster";
import Page from "components/Page";
import MembershipApplications from "./membershipapplications";

export default function CapabilityDetailsPage() {
    const { id } = useParams();
    const { isLoading, isFound, name, members, kafkaClusters, loadCapability, showResources } = useContext(SelectedCapabilityContext);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadCapability(id);
    }, [id]);

    return <>
            <Page title={name} isLoading={isLoading} isNotFound={!isFound}>
                <Members />
                <Summary />
                { showResources && (<Resources />)  }

                <MembershipApplications />
                
                {/* <Logs /> */}
                {/* <CommunicationChannels /> */}

                {(kafkaClusters || []).map(cluster => <KafkaCluster
                    key={cluster.id}
                    cluster={cluster}
                />)}

            </Page>

        <br/>
    </>
}