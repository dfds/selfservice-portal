import React, { useContext, useEffect } from "react"
import { useParams } from 'react-router-dom';
import SelectedCapabilityContext from "./SelectedCapabilityContext";
import Members from './members';
import Summary from './summary';
import Resources from './resources';
import KafkaCluster from "./KafkaCluster";
import Page from "components/Page";
import MembershipApplications from "./membershipapplications";
import { SelectedCapabilityProvider } from "./SelectedCapabilityContext";
import DeletionWarning from "./deletionWarning";
import CapabilityManagement from "./capabilityManagement";


export default function CapabilityDetailsPage() {
    return <>
            <SelectedCapabilityProvider>
                <CapabilityDetailsPageContent/>
            </SelectedCapabilityProvider>
    </>
}



function CapabilityDetailsPageContent() {
    const { id } = useParams();
    const { isLoading, isFound, name, kafkaClusters, loadCapability, showResources, isPendingDeletion, updateDeletionStatus } = useContext(SelectedCapabilityContext);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadCapability(id);
    }, [id]);

    return <>
            <DeletionWarning deletionState={isPendingDeletion} updateDeletionState={updateDeletionStatus} />
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
                    capabilityId={id}
                />)}

                <CapabilityManagement deletionState={isPendingDeletion} updateDeletionState={updateDeletionStatus} />

            </Page>

        <br/>
    </>
}
