import { Button, ButtonStack, H1, Hero } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { Container, Column, Card, CardTitle, CardContent, CardMedia, CardActions, LinkButton  } from '@dfds-ui/react-components';
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';

import { ChevronRight } from '@dfds-ui/icons/system';

import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableDataCell } from '@dfds-ui/react-components'

import React, { useContext } from "react"
import AppContext from "./../../app-context";

import styles from "./details.module.css";
import Members from './members';
import Summary from './summary';
import Resources from './resources';
import Logs from './logs';
import CommunicationChannels from './communicationchannels';
import Topics from './topics';

export default function CapabilityDetailsPage() {
    const { capabilityRootId } = useParams();
    const { capabilities } = useContext(AppContext);

    const foundCapability = (capabilities || []).find(x => x.capabilityRootId == capabilityRootId);

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

                {/* <hr className={styles.divider} /> */}

                <Summary name={foundCapability.name} rootId={foundCapability.capabilityRootId} description={foundCapability.description} />
                <Resources />
                <Logs />
                <CommunicationChannels />
                <Topics />

            </Column>
        </Container>

        <br/>
    </>
}