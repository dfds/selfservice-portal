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

function fillWithFakeMembers(members) {
    for (let i = 0; i < 4; i++) {
        const id = Math.random()*1000;
        members.push(
            {
                name: "foo-" + i,
                pictureUrl: `https://placeimg.com/640/480/people?time=${id}`
            }            
        );
    }
}

export default function CapabilityDetailsPage() {
    const { rootId } = useParams();
    const { myCapabilities, otherCapabilities, isCapabilitiesInitialized } = useContext(AppContext);
    const [capabilityDetails, setCapabilityDetails] = useState(null);

    const members = [];
    fillWithFakeMembers(members);

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

        setCapabilityDetails(foundCapability);
    }, [myCapabilities, otherCapabilities, isCapabilitiesInitialized]);

    return <>
        <br/>
        <br/>

        {!isCapabilitiesInitialized && 
            <DfdsLoader showMenu={true} label="Loading capability..." />
        }

        {isCapabilitiesInitialized && !capabilityDetails &&
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

        {isCapabilitiesInitialized && capabilityDetails &&
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