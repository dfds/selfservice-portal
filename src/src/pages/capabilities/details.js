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
    const [members, setMembers] = useState([]);

    const [topicsState, setTopicsState] = useState({
        clusters: [],
        selectedCluster: null,
        selectedTopic: null,
        showTopicDialog: false,
        inProgress: false,
    });

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
            setTopicsState(prev => {
                const copy = {...prev};
                copy.clusters = topicsGroupedByCluster;

                const selectedTopic = copy.selectedTopic;
                copy.selectedTopic = null;

                if (selectedTopic) {
                    const foundCluster = topicsGroupedByCluster.find(cluster => cluster.id === selectedTopic.kafkaTopicId);
                    if (foundCluster) {
                        const foundTopic = (foundCluster.topics || []).find(topic => topic.id === selectedTopic.id);
                        if (foundTopic) {
                            copy.selectedTopic = {...foundTopic, ...{messages: selectedTopic.messages}};
                        }
                    }
                }

                const selectedCluster = copy.selectedCluster;
                copy.selectedCluster = null;

                if (selectedCluster) {
                    const foundCluster = topicsGroupedByCluster.find(cluster => cluster.id === selectedCluster.id);
                    if (foundCluster) {
                        copy.selectedCluster = foundCluster;
                    }
                }

                return copy;
            });
        };

        fetchClustersAndTopics(capabilityDetails);
        
        setTopicsState({
            clusters: [],
            // selectedCluster: null,
            // selectedTopic: null,
            showTopicDialog: false,
            inProgress: false,
        });

        const cancellation = setInterval(() => {
            fetchClustersAndTopics(capabilityDetails);
        }, 5*1000);
        return () => clearInterval(cancellation);
    }, [capabilityDetails]);

    useEffect(() => {
        console.log("topic state changed to: ", topicsState);
    }, [topicsState]);

    const handleAddTopicToClusterClicked = (clusterId) => {
        const found = (topicsState.clusters || []).find(cluster => cluster.id == clusterId);
        if (found) {
            setTopicsState(prev => ({...prev, ...{
                selectedCluster: found,
                showTopicDialog: true,
            }}));
        }
    };

    const handleCloseTopicFormClicked = () => setTopicsState(prev => ({...prev, ...{
        selectedCluster: null,
        showTopicDialog: false,
        inProgress: false,
    }}));

    const handleAddTopic = async (topic) => {
        setTopicsState(prev => ({...prev, ...{
            inProgress: true,
        }}));

        const newTopic = await addTopicToCapability(capabilityDetails, topicsState.selectedCluster.id, topic);

        setTopicsState(prev => {
            const copy = {...prev};

            const cluster = (copy.clusters || []).find(cluster => cluster.id === topicsState.selectedCluster.id);
            if (cluster) {
                if (!cluster.topics) {
                    cluster.topics = [];
                }

                cluster.topics.push(newTopic);
            }

            copy.selectedCluster = null;
            copy.inProgress = false;
            copy.showTopicDialog = false;

            return copy;
        });
    };

    const handleTopicClicked = (cid, tid) => {
        setTopicsState(prev => {
            console.group("handleTopicClicked");

            const copy = {...prev};

            console.log("input: ", { cid, tid });
            console.log("selected topic: ", copy.selectedTopic);

            // deselect current
            if (copy.selectedTopic?.kafkaClusterId === cid && copy.selectedTopic?.id === tid) {
                console.log("deselecting current");
                copy.selectedTopic = null;
            } else {
                // find the topic and assign it to selectedTopic
                const foundCluster = (copy.clusters || []).find(cluster => cluster.id === cid);
                console.log("found cluster: ", foundCluster);

                const foundTopic = (foundCluster?.topics || []).find(topic => topic.id === tid);
                console.log("found topic: ", foundTopic);

                if (foundTopic) {
                    copy.selectedTopic = foundTopic;
                }
            }

            console.groupEnd();

            return copy;
        });
    };

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

                    {topicsState.selectedCluster && 
                        <NewTopicDialog 
                            capabilityId={capabilityDetails.id} 
                            clusterName={topicsState.selectedCluster.name} 
                            inProgress={topicsState.inProgress}
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
                        clusters={topicsState.clusters}
                        selectedTopic={topicsState.selectedTopic}
                        onAddTopicToClusterClicked={handleAddTopicToClusterClicked}
                        onTopicClicked={handleTopicClicked}
                    />

                </Column>
            </Container>
        }


        <br/>
    </>
}