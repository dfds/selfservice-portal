import React, { useContext, useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'
import { useParams } from 'react-router-dom';
import AppContext from "app-context";
import Members from './members';
import Summary from './summary';
import Resources from './resources';
import Logs from './logs';
import CommunicationChannels from './communicationchannels';
import { getCapabilityMembershipApplications, getCapabilityById } from "SelfServiceApiClient";
import KafkaCluster from "./KafkaCluster";
import PageSection from "components/PageSection";
import Page from "components/Page";

export default function CapabilityDetailsPage() {
    const { id } = useParams();
    const { selectedCapability, changeSelectedCapability } = useContext(AppContext);

    const [loading, setLoading] = useState(true);

    const [capabilityDetails, setCapabilityDetails] = useState(null);

    const [selectedKafkaClusterId, setSelectedKafkaClusterId] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        changeSelectedCapability(id);
    }, [id]);


    // get capability details
    useEffect(() => {
        async function fetchDetails(id) {
            setLoading(true);

            const details = await getCapabilityById(id);
            if (details) {
                setCapabilityDetails(details);
            }

            setLoading(false);
        }

        fetchDetails(id);
    }, [id]);

    //get membership applications
    const [membershipApplications, setMembershipApplications] = useState([]);

    useEffect(() => {
        if (!capabilityDetails) {
            return;
        }
        const fetchMemberhipApplications = async (capabilityDetails) => {
          console.log("passing: ", capabilityDetails);
          const result = await getCapabilityMembershipApplications(capabilityDetails);
          setMembershipApplications(result);
        };

        fetchMemberhipApplications(capabilityDetails);
    }, [capabilityDetails]);

    return <>
            <Page title={selectedCapability?.details?.name} isLoading={selectedCapability?.isLoading} isNotFound={selectedCapability?.details === null}>
                <Members members={selectedCapability?.members} />
                <Summary id={selectedCapability?.details?.id} name={selectedCapability?.details?.name} description={selectedCapability?.details?.description} />
                <Resources />
                {/*  membership applications  */}
                <Text styledAs='sectionHeadline'>Membership applications</Text>
                <PageSection>
                    <Table isHeaderSticky isInteractive width={"100%"}>
                        <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Applicant</TableHeaderCell>
                                    <TableHeaderCell>Application date</TableHeaderCell>
                                    <TableHeaderCell>Expires</TableHeaderCell>
                                    <TableHeaderCell>status</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {membershipApplications.map(x =>
                            <TableRow key={x.applicant}>
                                {/* <TableDataCell  onClick={() => clickHandler(x.capabilityId)}>{x.capabilityId}</TableDataCell> */}
                                <TableDataCell>{x.applicant}</TableDataCell>
                                <TableDataCell>{x.submittedAt}</TableDataCell> {/*TODO [pausegh]: human-readable datetime format*/}
                                <TableDataCell>{x.expiresOn}</TableDataCell> {/*TODO [pausegh]: human readable time delta*/}
                                <TableDataCell>{x.status}</TableDataCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </PageSection>
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