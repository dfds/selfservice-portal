import React, { useContext, useEffect, useState } from "react"
import { H1 } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { Container, Column, DfdsLoader, Card } from '@dfds-ui/react-components';
import { useParams } from 'react-router-dom';
import AppContext from "./../../app-context";
import Members from './members';
import Summary from './summary';
import Resources from './resources';
import Logs from './logs';
import CommunicationChannels from './communicationchannels';
import Topics from './topics';
import NewTopicDialog from './topics/NewTopicDialog';
import styles  from "./details.module.css";

import { getAnotherUserProfilePictureUrl } from "./../../GraphApiClient";
import { getCapabilityById, getCapabilityMembers, getCapabilityTopicsGroupedByCluster, addTopicToCapability } from "./../../SelfServiceApiClient";


function NotFound() {
    return <>
        <Container>
            <Column m={12} l={12} xl={12} xxl={12}>
                <Card variant="fill" surface="main">
                    <div className={styles.notfound}>
                    <br />

                    <img src="https://media3.giphy.com/media/H54feNXf6i4eAQubud/giphy.gif" />
                    {/* <img src="https://i.imgflip.com/79b2aa.jpg" /> */}

                    <br />
                    <br />
                    <Text as={"div"} styledAs='heroHeadline'>404 - Capability not found!</Text>
                    </div>
                </Card>
            </Column>
        </Container>    
    </>
}

export default function CapabilityDetailsPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    const [capabilityDetails, setCapabilityDetails] = useState(null);
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [members, setMembers] = useState([]);
    const [kafkaClusters, setKafkaClusters] = useState([]);
    const [isAddingATopic, setIsAddingATopic] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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

    // get members and their profile picture
    useEffect(() => {
        if (!capabilityDetails) {
            return;
        }

        async function getMemberProfilePicture(memberEmail) {
            const url = await getAnotherUserProfilePictureUrl(memberEmail);
            setMembers(prev => {
                const copy = prev 
                    ? [...prev]
                    : [];

                const found = copy.find(x => x.email === memberEmail)
                if (found) {
                    found.pictureUrl = url;
                }

                return copy;
            });
        };

        async function fetchMembersFor(capability) {
            const members = await getCapabilityMembers(capability);
            setMembers(members);

            members.forEach(x => getMemberProfilePicture(x.email));
        }

        fetchMembersFor(capabilityDetails);
    }, [capabilityDetails]);

    // get topics (grouped by clusters)
    useEffect(() => {
        if (!capabilityDetails) {
            return;
        }

        async function fetchClustersAndTopics(capability) {
            const topicsGroupedByCluster = await getCapabilityTopicsGroupedByCluster(capability);
            setKafkaClusters(topicsGroupedByCluster);
        };

        fetchClustersAndTopics(capabilityDetails);
        setSelectedCluster(null);
        setIsAddingATopic(false);

        // const cancellation = setInterval(() => {
        //     fetchClustersAndTopics(capabilityDetails);
        // }, 5*1000);
        // return () => clearInterval(cancellation);
    }, [capabilityDetails]);

    const handleAddTopicToClusterClicked = (clusterId) => {
        const found = kafkaClusters.find(cluster => cluster.id == clusterId);
        if (found) {
            setSelectedCluster(found);
        }
    };

    const handleCloseTopicFormClicked = () => {
        setSelectedCluster(null);
        setIsAddingATopic(false);
    };

    const handleAddTopic = async (topic) => {
        setIsAddingATopic(true);

        const newTopic = await addTopicToCapability(capabilityDetails, selectedCluster.id, topic);

        setKafkaClusters(prev => {
            const clusters = [...prev];
            const cluster = clusters.find(x => x.id === selectedCluster.id);
    
            if (cluster) {
                if (!cluster.topics) {
                    cluster.topics = [];
                }

                cluster.topics.push(newTopic);
            }
    
            return clusters;
        });

        setSelectedCluster(null);
        setIsAddingATopic(false);
    };

    const handleTopicClicked = (cid, tid) => setKafkaClusters(prev => {
        const newState = [...prev];

        newState.forEach(cluster => {
            (cluster.topics || []).forEach(topic => {
                if (cluster.id === cid && topic.id === tid) {
                    topic.isSelected = !topic.isSelected;
                } else {
                    topic.isSelected = false;
                }
            });
        });

        return newState;
    });

    return <>
        <br/>
        <br/>

        {loading &&
            <DfdsLoader showMenu={true} label="Loading capability..." />
        }

        {!loading && !capabilityDetails &&
            <NotFound />
        }

        {!loading && capabilityDetails &&
            <Container>
                <Column m={12} l={12} xl={12} xxl={12}>

                {selectedCluster && 
                    <NewTopicDialog 
                        capabilityId={capabilityDetails.id} 
                        clusterName={selectedCluster.name} 
                        inProgress={isAddingATopic}
                        onAddClicked={handleAddTopic}
                        onCloseClicked={handleCloseTopicFormClicked} 
                    />
                }


                    <Text as={H1} styledAs='heroHeadline'>{capabilityDetails.name}</Text>

                    <Members members={members} />
                    <Summary id={capabilityDetails.id} name={capabilityDetails.name} description={capabilityDetails.description} />
                    <Resources />
                    {/* <Logs /> */}
                    {/* <CommunicationChannels /> */}
                    <Topics 
                        clusters={kafkaClusters} 
                        onAddTopicToClusterClicked={handleAddTopicToClusterClicked}
                        onTopicClicked={handleTopicClicked}
                    />

                </Column>
            </Container>
        }


        <br/>
    </>
}