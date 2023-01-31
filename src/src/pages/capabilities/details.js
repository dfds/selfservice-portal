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
import styles  from "./details.module.css";

import { getAnotherUserProfilePictureUrl } from "./../../GraphApiClient";
import { getCapabilityById } from "./../../SelfServiceApiClient";

export default function CapabilityDetailsPage() {
    const { myCapabilities, otherCapabilities, isCapabilitiesInitialized } = useContext(AppContext);

    const [loading, setLoading] = useState(true);

    const { rootId } = useParams();
    const [capabilityDetails, setCapabilityDetails] = useState(null);
    const [members, setMembers] = useState([]);


    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!isCapabilitiesInitialized) {
            return;
        }

        let foundCapability = (myCapabilities || []).find(x => x.rootId === rootId);
        if (!foundCapability) {
            foundCapability = (otherCapabilities || []).find(x => x.rootId === rootId);
        }

        async function fetchDetails(id) {
            setLoading(true);

            const details = await getCapabilityById(id);
            if (details) {
                setCapabilityDetails(details);
            }

            setLoading(false);
        }

        fetchDetails(foundCapability.id);
    }, [myCapabilities, otherCapabilities, isCapabilitiesInitialized]);

    useEffect(() => {
        if (!capabilityDetails) {
            return;
        }

        async function getMemberProfilePicture(memberEmail) {
            console.log(`getting picture for ${memberEmail}...`);
            const url = await getAnotherUserProfilePictureUrl(memberEmail);
            console.log(`got picture for ${memberEmail}...at...${url}`);
            setMembers(prev => {
                const copy = prev 
                    ? [...prev]
                    : [];

                const found = copy.find(x => x.email === memberEmail)
                console.log("found copy: ", found);
                if (found) {
                    found.pictureUrl = url;
                }

                return copy;
            });
        };

        const capMembers = (capabilityDetails.members || []);
        setMembers(capMembers);

        capMembers.forEach(member => getMemberProfilePicture(member.email));
    }, [capabilityDetails]);

    return <>
        <br/>
        <br/>

        {!isCapabilitiesInitialized && loading &&
            <DfdsLoader showMenu={true} label="Loading capability..." />
        }

        {isCapabilitiesInitialized && !loading && !capabilityDetails &&
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
        }

        {isCapabilitiesInitialized && !loading && capabilityDetails &&
            <Container>
                <Column m={12} l={12} xl={12} xxl={12}>
                    <Text as={H1} styledAs='heroHeadline'>{capabilityDetails.name}</Text>

                    <Members members={members} />
                    <Summary name={capabilityDetails.name} rootId={capabilityDetails.rootId} description={capabilityDetails.description} />
                    <Resources />
                    <Logs />
                    <CommunicationChannels />
                    <Topics />

                </Column>
            </Container>
        }


        <br/>
    </>
}