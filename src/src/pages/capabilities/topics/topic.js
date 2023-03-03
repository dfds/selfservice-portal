import React, { useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Button, Card, CardContent, CardTitle, IconButton  } from '@dfds-ui/react-components';
import { Accordion, AccordionSmall } from '@dfds-ui/react-components'
import { TextField as TextareaField } from '@dfds-ui/react-components/forms';
import { ChevronDown, ChevronUp } from '@dfds-ui/icons/system';

import Message from "./message";
import styles from "./topics.module.css";
import { Divider } from "@dfds-ui/react-components/divider";

function TopicHeader({name, description, partitions, retention, isOpen, onClicked}) {
    const handleClick = () => {
        if (onClicked) {
            onClicked();
        }
    };

    return <div className={`${styles.topicheader} ${isOpen ? styles.topicheaderselected : ""}`} onClick={handleClick}>
        <div>
            <Text styledAs={isOpen ? "actionBold" : "action"}>{name}</Text>
            {/* <Text styledAs="bodyInterfaceSmall">{description} &nbsp; </Text> */}
        </div>
        <div>
            <Text styledAs="caption">Partitions: {partitions} - Retention: {retention}</Text>
            {/* <Text styledAs="caption">Partitions: {partitions} - Retention: {retention}</Text> */}
        </div>
        <IconButton icon={isOpen ? ChevronUp : ChevronDown } disableOverlay />
    </div>
}

export default function Topic({id, name, description, partitions, retention, status, isSelected, messageContracts, onHeaderClicked, onMessageHeaderClicked}) {
    const clickHandler = () => {
        if (onHeaderClicked) {
             onHeaderClicked(id);
        }
    };

    const messageHeaderClickHandler = (messageId) => {
        if (onMessageHeaderClicked) {
            onMessageHeaderClicked(id, messageId);
        }
    };

    const header = <TopicHeader 
        name={name} 
        description={description}
        partitions={partitions} 
        retention={retention} 
        isOpen={isSelected} 
        onClicked={clickHandler} 
    />;

    return <Accordion header={header} isOpen={isSelected} onToggle={clickHandler}>

        <Divider />

        <Card variant="fill" surface="secondary">
            <CardContent >
                <Text styledAs="actionBold">Description</Text>
                <Text>{description}</Text>

                <br />

                <div className={styles.messagecontractsheader}>
                    <Text styledAs="actionBold">Message Contracts ({(messageContracts || []).length})</Text>
                    <Button size="small" variation="primary">Add</Button>
                </div>
                {(messageContracts || []).length == 0 && 
                    <div>No message contracts defined...yet!</div>
                }
                {(messageContracts || []).map(x => <Message 
                    key={x.id} 
                    {...x} 
                    onHeaderClicked={id => messageHeaderClickHandler(id)}
                />)}
            </CardContent>
        </Card>

    </Accordion>
}