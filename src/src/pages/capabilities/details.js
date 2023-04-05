import React, { useContext, useEffect } from "react"
import { useParams } from 'react-router-dom';
import AppContext from "AppContext";
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
    const { selectedCapability, changeSelectedCapability } = useContext(AppContext);

    useEffect(() => {
        window.scrollTo(0, 0);
        changeSelectedCapability(id);
    }, [id]);

    return <>
            <Page title={selectedCapability?.details?.name} isLoading={selectedCapability?.isLoading} isNotFound={selectedCapability?.details === null}>
                <Members members={selectedCapability?.members} />
                <Summary />
                <Resources />

                <MembershipApplications />
                
                {/* <Logs /> */}
                {/* <CommunicationChannels /> */}

                {(selectedCapability?.kafkaClusters || []).map(cluster => <KafkaCluster
                    key={cluster.id}
                    cluster={cluster}
                />)}

            </Page>

        <br/>
    </>
}