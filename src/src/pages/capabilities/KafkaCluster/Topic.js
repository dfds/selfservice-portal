import React, { useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Button, Card, CardContent, IconButton  } from '@dfds-ui/react-components';
import { Accordion } from '@dfds-ui/react-components'
import { ChevronDown, ChevronUp, StatusAlert } from '@dfds-ui/icons/system';

import Message from "./MessageContract";
import styles from "./Topics.module.css";
import { Divider } from "@dfds-ui/react-components/divider";

function TopicHeader({name, description, partitions, retention, status, isOpen, onClicked}) {
    const handleClick = () => {
        if (onClicked) {
            onClicked();
        }
    };

    const notProvisioned = "Provisioned".toUpperCase() != status?.toUpperCase();

    return <div className={`${styles.topicheader} ${isOpen ? styles.topicheaderselected : ""}`} onClick={notProvisioned ? null : handleClick}>
        <div style={{ flexGrow: "1" }}>
            <Text className={notProvisioned ? styles.notprovisioned : null} styledAs={isOpen ? "actionBold" : "action"}>
                {notProvisioned &&
                    <>
                        <StatusAlert /> 
                        <span>&nbsp;</span>
                    </>
                }
                
                {name}

                {notProvisioned &&
                    <span>&nbsp;({status?.toLowerCase()})</span>
                }
            </Text>
        </div>
        <div style={{ width: '20%'}}>
            <Text styledAs="caption">Partitions: {partitions} - Retention: {retention}</Text>
        </div>
        <div style={{ width: '20%', textAlign: "right"}}>
            <IconButton icon={isOpen ? ChevronUp : ChevronDown } disableTooltip disableOverlay />
        </div>
    </div>
}

export default function Topic({id, name, description, partitions, retention, status, isSelected, messageContracts, onHeaderClicked}) {
    const [contracts, setContracts] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        setContracts(messageContracts || [])
        setSelectedId(null);
    }, [id, isSelected]);

    const clickHandler = () => {
        if (onHeaderClicked) {
             onHeaderClicked(id);
        }
    };

    const messageHeaderClickHandler = (messageId) => {
        setSelectedId(prev => {
            if (messageId === prev) {
                return null;
            }

            return messageId;
        });
    };

    const header = <TopicHeader 
        name={name} 
        description={description}
        partitions={partitions} 
        retention={retention} 
        status={status}
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
                    <Text styledAs="actionBold">Message Contracts ({(contracts || []).length})</Text>
                    <Button size="small" variation="primary">Add</Button>
                </div>
                {(contracts || []).length == 0 && 
                    <div>No message contracts defined...yet!</div>
                }
                {(contracts || []).map(x => <Message 
                    key={x.id} 
                    {...x} 
                    isSelected={x.id === selectedId}
                    onHeaderClicked={id => messageHeaderClickHandler(id)}
                />)}

                <br />
            </CardContent>
        </Card>

    </Accordion>
}