import React, { useEffect, useState, useContext} from "react";
import styles from "./searchview.module.css";
import { Badge } from '@dfds-ui/react-components';
import HighlightedText from "components/HighlightedText"
import { Accordion, Spinner } from '@dfds-ui/react-components'
import { Button, Card, CardContent, IconButton  } from '@dfds-ui/react-components';
import { Text } from '@dfds-ui/typography';
import { ChevronDown, ChevronUp, StatusAlert } from '@dfds-ui/icons/system';
import { Link } from "react-router-dom";
import { getMessageContracts } from "SelfServiceApiClient";
import Message from "../capabilities/KafkaCluster/MessageContract";
import TopicsContext from "pages/topics/TopicsContext";
import AppContext from "../../AppContext"



function TopicHeader({data, isOpen, onClicked}) {
    const handleClick = () => {
        if (onClicked) {
            onClicked();
        }
    };

    return  <div className={`${styles.topicheader} ${isOpen ? styles.topicheaderselected : ""}`} onClick={handleClick}>
    <div className={styles.row}>
        <h3 style= {{ fontSize: "1.3em", marginRight: "1rem"}}>{<HighlightedText text={data.name} highlight={data.highlight ? data.highlight : ""} selectedKafkaTopic={isOpen} />}</h3>
        <Badge className={styles.badgecluster} style={{ backgroundColor: data.clusterColor }}>{data.kafkaClusterName}</Badge>
    </div>
    {/* <p>{<HighlightedText text={data.description} highlight={data.highlight ? data.highlight : ""} />}</p>
    <div >
        <div style= {{color: "#1874bc"}}>{data.capabilityId}</div>
    </div> */}

    <div style={{ width: '20%', textAlign: "right"}}>
        <IconButton icon={isOpen ? ChevronUp : ChevronDown } disableTooltip disableOverlay />
    </div>

    </div>
}

function TopicInfo({data, isOpen}) {

    return  <>
        <div>
            <p>{<HighlightedText text={data.description} highlight={data.highlight ? data.highlight : ""}/>}</p>
            <div >
                <div style= {{color: "#1874bc"}}>{data.capabilityId}</div>
            </div>
        </div>
    </>
}

export function SearchView({data, onTopicClicked}) {

    const [isSelected, setIsSelected] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(false);
    const [selectedMessageContractId, setSelectedMessageContractId] = useState(null);
    const { selectedKafkaTopic } = useContext(TopicsContext);
    const {selfServiceApiClient} = useContext(AppContext);

    const handleHeaderClicked = () => {
        if (onTopicClicked) {
            onTopicClicked(data.id);
        }
    };

    const handleMessageHeaderClicked = (messageId) => {
        setSelectedMessageContractId(prev => {
            if (messageId === prev) {
                return null; // deselect already selected (toggling)
            }

            return messageId;
        });
    };

    const linkStyle = {
        color: "#1874bc",
        textDecoration: "none",
    }

    useEffect(() => {
        if (selectedKafkaTopic !== data.id) {
            setContracts([]);
            return;
        }

        async function fetchData(data) {
            setIsLoadingContracts(true);
            const result = await selfServiceApiClient.getMessageContracts(data);
            result.sort((a,b) => a.messageType.localeCompare(b.messageType));
            setContracts(result);
            setIsLoadingContracts(false);
        }

        fetchData(data);
        

       
    }, [selectedKafkaTopic]);


    return(
        <>
        <Accordion className={styles.card} header={<TopicHeader 
            data={data} 
            isOpen={selectedKafkaTopic == data.id} 
            onClicked={handleHeaderClicked} 
        />} isOpen={selectedKafkaTopic == data.id} onToggle={handleHeaderClicked}>
            <Card className={styles.card} variant="fill" surface="secondary">
                <CardContent >
                    <Text styledAs="actionBold">Description</Text>
                    <p>{<HighlightedText text={data.description} highlight={data.highlight ? data.highlight : ""} />}</p>
                    {
                        <>
                        <br />

                        {
                            isLoadingContracts
                                ? <Spinner instant />
                                :
                                    <>
                                        {(contracts || []).length === 0 && 
                                            <div>No message contracts defined...yet!</div>
                                        }

                                        {(contracts || []).length != 0 && 
                                            <Text styledAs="actionBold">Message Contracts ({(contracts || []).length})</Text>
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

                    <div >
                        <div><Text styledAs="actionBold">Capability </Text><Link style={linkStyle} to={`/capabilities/${data.capabilityId}`}>{data.capabilityId}</Link></div>
                    </div>
                </CardContent>
            </Card>
        </Accordion>

        {
            selectedKafkaTopic == data.id
            ? null
            :  <div className={styles.infocontainer}>
                    <p>{<HighlightedText text={data.description} highlight={data.highlight ? data.highlight : ""} />}</p>
                    <div >
                        <div>Capability: <Link style={linkStyle} to={`/capabilities/${data.capabilityId}`}>{data.capabilityId}</Link></div>
                    </div>
                </div>
        }

        
        </>
        
    )
}