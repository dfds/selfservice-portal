import React, { useContext } from "react"
import { H1 } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { Container, Column} from '@dfds-ui/react-components';
import { useParams } from 'react-router-dom';
import AppContext from "./../../app-context";
import Members from './members';
import Summary from './summary';
import Resources from './resources';
import Logs from './logs';
import CommunicationChannels from './communicationchannels';
import Topics from './topics';

export default function CapabilityDetailsPage() {
    const { rootId } = useParams();
    const { capabilities } = useContext(AppContext);

    const foundCapability = (capabilities || []).find(x => x.rootId === rootId);

    const members = [];

    for (let i = 0; i < 4; i++) {
        const id = Math.random()*1000;
        members.push(
            {
                name: "foo-" + i,
                pictureUrl: `https://placeimg.com/640/480/people?time=${id}`
            }            
        );
    }

    return <>
        <br/>
        <br/>

        <Container>
            <Column m={12} l={12} xl={12} xxl={12}>
                <Text as={H1} styledAs='heroHeadline'>{foundCapability.name}</Text>

                <Members members={members} />
                <Summary name={foundCapability.name} rootId={foundCapability.rootId} description={foundCapability.description} />
                <Resources />
                <Logs />
                <CommunicationChannels />
                <Topics />

            </Column>
        </Container>

        <br/>
    </>
}