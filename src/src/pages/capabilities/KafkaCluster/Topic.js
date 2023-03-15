import React, { useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import { Button, Card, CardContent, IconButton  } from '@dfds-ui/react-components';
import { Accordion } from '@dfds-ui/react-components'
import { ChevronDown, ChevronUp, StatusAlert } from '@dfds-ui/icons/system';

import Message from "./MessageContract";
import styles from "./Topics.module.css";
import MessageContractDialog from "./MessageContractDialog";
import { useContext } from "react";
import AppContext from "app-context";

function TopicHeader({name, description, partitions, retention, status, isOpen, onClicked}) {
    const handleClick = () => {
        if (onClicked) {
            onClicked();
        }
    };

    const notProvisioned = "Provisioned".toUpperCase() !== status?.toUpperCase();

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

export default function Topic({topic, isSelected, onHeaderClicked}) {
    const { selectedCapability } = useContext(AppContext);
    
    // const [contracts, setContracts] = useState([]);
    const [selectedMessageContractId, setSelectedMessageContractId] = useState(null);
    const [showMessageContractDialog, setShowMessageContractDialog] = useState(false);

    const { id, name, description, partitions, retention, status, messageContracts } = topic;
    const contracts = messageContracts;

    // useEffect(() => {
    //     setContracts(messageContracts || [])
    //     setSelectedMessageContractId(null);
    //     setShowMessageContractDialog(false);
    // }, [id, isSelected, messageContracts]);

    const handleHeaderClicked = () => {
        if (onHeaderClicked) {
             onHeaderClicked(id);
        }
    };

    const handleAddMessageContractClicked = () => {
        setShowMessageContractDialog(prev => !prev);
    };

    const handleMessageHeaderClicked = (messageId) => {
        setSelectedMessageContractId(prev => {
            if (messageId === prev) {
                return null; // deselect already selected (toggling)
            }

            return messageId;
        });
    };

    const handleAddMessageContract = async (formValues) => {
        await selectedCapability?.addMessageContractToTopic(topic.kafkaClusterId, topic.id, formValues);
        setShowMessageContractDialog(false);
    };

    const header = <TopicHeader 
        name={name} 
        description={description}
        partitions={partitions} 
        retention={retention} 
        status={status}
        isOpen={isSelected} 
        onClicked={handleHeaderClicked} 
    />;

    const isPublic = name.startsWith("pub.");

    return <Accordion header={header} isOpen={isSelected} onToggle={handleHeaderClicked}>

        <Card variant="fill" surface="secondary">
            <CardContent >
                <Text styledAs="actionBold">Description</Text>
                <Text>{description}</Text>


                {isPublic && 
                    <>
                        <br />

                        <div className={styles.messagecontractsheader}>
                            {showMessageContractDialog && 
                                <MessageContractDialog 
                                    topicName={name} 
                                    onCloseClicked={() => setShowMessageContractDialog(false)}
                                    onAddClicked={(formValues) => handleAddMessageContract(formValues)}
                                /> 
                            }
                            <Text styledAs="actionBold">Message Contracts ({(contracts || []).length})</Text>
                            <Button size="small" variation="primary" onClick={handleAddMessageContractClicked}>Add</Button>
                        </div>


                        {(contracts || []).length === 0 && 
                            <div>No message contracts defined...yet!</div>
                        }

                        {(contracts || []).map(messageContract => <Message 
                            key={messageContract.id} 
                            {...messageContract} 
                            isSelected={messageContract.id === selectedMessageContractId}
                            onHeaderClicked={id => handleMessageHeaderClicked(id)}
                        />)}
                        
                        <br />
                    </>
                }

            </CardContent>
        </Card>

    </Accordion>
}