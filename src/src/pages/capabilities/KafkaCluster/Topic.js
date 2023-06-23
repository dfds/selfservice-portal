import React, { useEffect, useState, useCallback } from "react"
import { Text } from '@dfds-ui/typography';
import { Button, Card, CardContent, IconButton  } from '@dfds-ui/react-components';
import { Accordion, Spinner } from '@dfds-ui/react-components'
import { ChevronDown, ChevronUp, StatusAlert, Edit as EditIcon, Delete as DeleteIcon } from '@dfds-ui/icons/system';

import Message from "./MessageContract";
import styles from "./Topics.module.css";
import MessageContractDialog from "./MessageContractDialog";
import { useContext } from "react";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import Poles from "components/Poles";
import EditTopicDialog from "./EditTopicDialog";
import DeleteTopicDialog from "./DeleteTopicDialog";
import AppContext from "../../../AppContext"

function TopicHeader({name, description, partitions, retention, status, isOpen, onClicked}) {
    const handleClick = () => {
        if (onClicked) {
            onClicked();
        }
    };

    const notProvisioned = "Provisioned".toUpperCase() !== status?.toUpperCase();

    return <div className={`${styles.topicheader} ${isOpen ? styles.topicheaderselected : ""}`} onClick={notProvisioned ? null : handleClick}>
        <div style={{ flexGrow: "1" }}>
            <Text className={notProvisioned ? styles.notprovisioned : null} styledAs={isOpen ? "actionBold" : "action"} style={{display: "inline-block"}}>
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

        <div style={{ width: "20rem"}}>
            <Text styledAs="caption">Partitions: {partitions} - Retention: {retention}</Text>
        </div>
          
        <div style={{ width: '5rem', textAlign: "right"}}>
            {isOpen 
              ? <IconButton icon={ ChevronUp } disableTooltip disableOverlay style={{color: "white"}} />
              : <IconButton icon={ ChevronDown } disableTooltip disableOverlay />
            }
        </div>
    </div>
}

export default function Topic({topic, isSelected, onHeaderClicked}) {
    const { addMessageContractToTopic, updateKafkaTopic, deleteKafkaTopic } = useContext(SelectedCapabilityContext);
    const {selfServiceApiClient} = useContext(AppContext);
    const [contracts, setContracts] = useState([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(false);

    const [selectedMessageContractId, setSelectedMessageContractId] = useState(null);
    const [showMessageContractDialog, setShowMessageContractDialog] = useState(false);

    const [showEditTopicDialog, setShowEditTopicDialog] = useState(false);
    const [showDeleteTopicDialog, setShowDeleteTopicDialog] = useState(false);
    const [isEditInProgress, setIsEditInProgress] = useState(false);

    const { id, name, description, partitions, retention, status } = topic;
    const isPublic = name.startsWith("pub.");

    const canAddMessageContracts = (topic._links?.messageContracts?.allow || []).includes("POST");
    const allowedToUpdate = !!(topic._links?.updateDescription);
    const allowedToDelete = (topic._links?.self?.allow || []).includes("DELETE");

    useEffect(() => {
        let isMounted = true;

        if (!isSelected) {
            setContracts([]);
            return;
        }

        async function fetchData(topic) {
            const result = await selfServiceApiClient.getMessageContracts(topic);
            result.sort((a,b) => a.messageType.localeCompare(b.messageType));

            if (isMounted) {
              setContracts(result);
              setIsLoadingContracts(false);
            }
        }

        if (isPublic) {
            fetchData(topic);
        }

        return () => isMounted = false;
    }, [topic, isSelected]);

    useEffect(() => {
        setIsLoadingContracts(isSelected);
    }, [isSelected]);

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
        await addMessageContractToTopic(topic.kafkaClusterId, topic.id, formValues);
        setShowMessageContractDialog(false);
    };

    const handleUpdateTopic = useCallback(async (formValues) => {
      setIsEditInProgress(true);
      await updateKafkaTopic(topic.id, formValues);
      setShowEditTopicDialog(false);
      setIsEditInProgress(false); // probably not needed
    }, [topic]);

    const handleDeleteTopic = useCallback(async () => {
      setIsEditInProgress(true);
      await deleteKafkaTopic(topic.id);
      
      // console.log("hiding edit dialog...");
      // setShowEditTopicDialog(false);
      // setIsEditInProgress(false);
    }, [topic]);

    const header = <TopicHeader 
        name={name} 
        description={description}
        partitions={partitions} 
        retention={retention} 
        status={status}
        isOpen={isSelected} 
        onClicked={handleHeaderClicked} 
    />;

    return <Accordion header={header} isOpen={isSelected} onToggle={handleHeaderClicked}>

        <Card variant="fill" surface="secondary">
            <CardContent >
                <Poles
                  leftContent={<Text styledAs="actionBold">Description</Text>}
                  rightContent={<>
                    { allowedToUpdate && 
                        <IconButton title="Edit" icon={EditIcon} onClick={() => setShowEditTopicDialog(true)} />
                    }
                    {/* { allowedToDelete && 
                        <IconButton title="Delete" icon={DeleteIcon} onClick={() => setShowDeleteTopicDialog(true)} />
                    } */}

                    {showEditTopicDialog && 
                      <EditTopicDialog 
                        originalTopic={topic} 
                        inProgress={isEditInProgress}
                        allowedToUpdate={allowedToUpdate}
                        allowedToDelete={allowedToDelete}
                        onCloseClicked={() => setShowEditTopicDialog(false)} 
                        onUpdateClicked={handleUpdateTopic}
                        onDeleteClicked={handleDeleteTopic}
                      />
                    }

                    {showDeleteTopicDialog && 
                      <DeleteTopicDialog 
                        topicName={topic.name} 
                        inProgress={isEditInProgress}
                        allowedToDelete={allowedToDelete}
                        onDeleteClicked={handleDeleteTopic}
                        onCancelClicked={() => setShowDeleteTopicDialog(false)}
                      />
                    }
                  </>}
                />
                
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

                            {canAddMessageContracts && 
                                <Button size="small" variation="primary" onClick={handleAddMessageContractClicked}>Add</Button>
                            }
                        </div>

                        {
                            isLoadingContracts
                                ? <Spinner instant />
                                :
                                    <>
                                        {(contracts || []).length === 0 && 
                                            <div>No message contracts defined...yet!</div>
                                        }

                                        {(contracts || []).map(messageContract => <Message 
                                            key={messageContract.id} 
                                            {...messageContract} 
                                            isSelected={messageContract.id === selectedMessageContractId}
                                            onHeaderClicked={id => handleMessageHeaderClicked(id)}
                                        />)}
                                    </>
                        }
                        
                        <br />
                    </>
                }

            </CardContent>
        </Card>

    </Accordion>
}
