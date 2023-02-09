import React, { useEffect, useState } from "react"
import { Text } from '@dfds-ui/typography';
import Topic from "./topic";
import styles from "./topics.module.css";
import { Button, ButtonStack, Card, CardContent, Banner, BannerHeadline, SideSheet, SideSheetContent, SideSheetFooter, TextField, SelectField, Tooltip, BannerParagraph } from '@dfds-ui/react-components';
import { Information } from '@dfds-ui/icons/system';

import { addTopicToCapability } from "./../../../SelfServiceApiClient";

function Cluster({id, name, topics, onTopicClicked, onAddClicked}) {
    const provisioned = topics.filter(topic => topic.status.toUpperCase() === "Provisioned".toUpperCase());
    const notProvisioned = topics.filter(topic => topic.status.toUpperCase() != "Provisioned".toUpperCase());

    const handleAddClicked = () => {
        if (onAddClicked) {
            onAddClicked(id)
        }
    }

    return <div>
        <div className={styles.clusterheader}>
            <Text styledAs='subHeadline'>{name}</Text>
            <Button size="small" onClick={handleAddClicked}>Add</Button>
        </div>

        {notProvisioned.length > 0 && 
            <Banner variant="mediumEmphasis">
                <BannerHeadline>Topics currently being provisioned:</BannerHeadline>
                <ul className={styles.notprovisioned}>
                    {notProvisioned.map(topic => <li key={topic.id}>
                        <Text styledAs="body">{topic.name}</Text>
                    </li>)}
                </ul>

            </Banner>
        }

        {provisioned.length == 0 && <div>No topics...yet!</div>}
        {provisioned.map(topic => <Topic 
            key={`${id}-${topic.id}`} 
            {...topic} 
            onHeaderClicked={topicId => onTopicClicked(id, topicId)}
        />)}
    </div>    
}

function NewTopicForm({capabilityId, clusterId, clusterName, onAddClicked, onCloseClicked}) {
    const emptyValues = {
        name: "",
        description: "",
        partitions: 3,
        retention: 7,
        availability: "private",
    };

    const [formData, setFormData] = useState(emptyValues);

    useEffect(() => {
        setFormData(emptyValues);
    }, [capabilityId, clusterId, clusterName]);

    const changeName = (e) => {
        e.preventDefault();
        let newName = e?.target?.value || "";
        newName = newName.replace(/\s+/g, "-");

        setFormData(prev => ({...prev, ...{ name: newName.toLowerCase()}}));
    }

    const changeDescription = e => {
        e.preventDefault();
        const newValue = e?.target?.value || emptyValues.description;
        setFormData(prev => ({...prev, ...{ description: newValue}}));
    };

    const changePartitions = e => {
        e.preventDefault();
        const newValue = e?.target?.value || emptyValues.partitions;
        setFormData(prev => ({...prev, ...{ partitions: parseInt(newValue)}}));
    };

    const changeRetention = e => {
        e.preventDefault();
        const newValue = e?.target?.value || emptyValues.retention;
        setFormData(prev => ({...prev, ...{ retention: parseInt(newValue)}}));
    };

    const changeAvailability = e => {
        e.preventDefault();
        const newValue = e?.target?.value || emptyValues.availability;
        setFormData(prev => ({...prev, ...{ availability: newValue}}));
    };

    const publicPrefix = formData.availability === "public"
        ? "pub."
        : "";

    const topicName = formData.name === ""
        ? "<name>"
        : formData.name;

    const fullTopicName = `${publicPrefix}${capabilityId}.${topicName}`;

    const isNameValid = formData.name != "" &&
        !formData.name.match(/^\s*$/g) &&
        !formData.name.match(/(-|_)$/g) &&
        !formData.name.match(/[^a-zA-Z0-9\-_]/g);

    let nameErrorMessage = "";
    if (formData.name.length > 0 && !isNameValid) {
        nameErrorMessage = 'Allowed characters are a-z, 0-9, "-", "_" and it must not end with "-" or "_".';
    }

    const canAdd = formData.name != "" && formData.description != "";

    const handleAddClicked = () => {
        if (onAddClicked) {
            onAddClicked({
                name: fullTopicName,
                description: formData.description,
                partitions: formData.partitions,
                retention: formData.retention
            });
        }
    };

    const handleCloseClicked = () => {
        if (onCloseClicked) {
            onCloseClicked();
        }
    };

    return <SideSheet header={`Add new topic to ${clusterName}...`} onRequestClose={handleCloseClicked} isOpen={true} width="30%" alignSideSheet="right" variant="elevated" backdrop>
        <SideSheetContent>
            <Text>
                Topics can be used to communicate that something significant has happened within <i>your</i> capability. Thats also one of the 
                reasons that the id of your capability (e.g. <span className={styles.capabilityid}>{capabilityId}</span> in your case) will be 
                embedded in the topic name.
            </Text>
            <Text>
                Below is the full name of your new topic and a topic build that you can use to define the attributes of your topic.
            </Text>
    
            <br />

            <Text as={"label"} styledAs="labelBold">Full topic name:</Text>
            <Text as={"div"} styledAs="bodyInterface">{fullTopicName}</Text>

            <br />
            <br />

            <div className={styles.tooltipsection}>
                <div className={styles.tooltip}>
                    <Tooltip content='It is recommended to use "-" (dashes) to separate words in a multi word topic name (e.g. foo-bar instead of foo_bar).'>
                        <Information />
                    </Tooltip>
                </div>
                <TextField 
                    label="Name" 
                    placeholder="Enter name of topic" 
                    required 
                    value={formData.name} 
                    onChange={changeName} 
                    errorMessage={nameErrorMessage}
                />
            </div>

            <TextField label="Description" placeholder="Enter a description" required value={formData.description} onChange={changeDescription}></TextField>

            <div className={styles.tooltipsection}>
                <div className={styles.tooltip}>
                    <Tooltip content="A topic is split into multiple partitions for scalability and parallel processing. Each partition is an ordered, immutable sequence of records that is continually appended to.">
                        <Information />
                    </Tooltip>
                </div>
                <SelectField name="partitions" label="Partitions" value={formData.partitions} required onChange={changePartitions}>
                    <option value={1}>1</option>
                    <option value={3}>3 (default)</option>
                    <option value={6}>6</option>
                </SelectField>
            </div>

            <div className={styles.tooltipsection}>
                <div className={styles.tooltip}>
                    <Tooltip content="The amount of time a topic retains its data before it is discarded or automatically deleted.">
                        <Information />
                    </Tooltip>
                </div>
                <SelectField name="retention" label="Retention" value={formData.retention} required onChange={changeRetention}>
                    <option value={7}>7 days</option>
                    <option value={31}>31 days</option>
                    <option value={365}>365 days</option>
                    <option value={-1}>Forever</option>
                </SelectField>
            </div>

            <div className={styles.tooltipsection}>
                <div className={styles.tooltip}>
                    <Tooltip content="Private topics are used to facilitate information flow within your capability and no other capabilities has access to those topics. Public topics is one that is intended to be shared with other capabilities which means that all capabilities has read access to public topics - and you will in addition have write access to your own public topics.">
                        <Information />
                    </Tooltip>
                </div>
                <SelectField name="availability" label="Availability" value={formData.availability} required onChange={changeAvailability}>
                    <option value={"private"}>Private</option>
                    <option value={"public"}>Public</option>
                </SelectField>

                {formData.availability === "public" && 
                    <Banner>
                        <BannerHeadline>Please note</BannerHeadline>
                        <BannerParagraph>
                            All public topics will be prefixed with <span className={styles.capabilityid}>pub.</span> to 
                            make it explicit. Have a look at the change to the example above.
                            <br />
                            <br />
                            Public topics comes with a responsibility. All other capabilities has read access to your public topics 
                            and can potentially depend on you to not introduce breaking changes to your messages. 
                            <br />
                            <br />
                            You also have a 
                            responsibility to communicate about any new messages that you want to introduce to the topic as it can 
                            potentially have consequences for consumers.
                            <br />
                            <br />
                            But remember, <i>sharing is caring.</i>
                        </BannerParagraph>
                    </Banner>
                }
            </div>

            <br />
            <Button size="small" type="button" disabled={!canAdd} onClick={handleAddClicked}>Add</Button>

        </SideSheetContent>
    </SideSheet>
}

export default function Topics({clusters, capabilityId, capability}) {
    const [state, setState] = useState([]);
    const [selectedCluster, setSelectedCluster] = useState(null);

    useEffect(() => {
        setState(clusters || []);
        setSelectedCluster(null);
    }, [clusters]);

    const selectTopic = (cid, tid) => setState(prev => {
        const newState = [...prev];
        const cluster = newState.find(x => x.id == cid);

        if (cluster) {
            cluster.topics.forEach(topic => {
                if (topic.id == tid) {
                    topic.isSelected = !topic.isSelected;
                } else {
                    topic.isSelected = false;
                }
            });
        }

        return newState;
    });

    const handleAddTopicToClusterClicked = (clusterId) => {
        const found = state.find(cluster => cluster.id == clusterId);
        if (found) {
            setSelectedCluster(found);
        }
    };

    const handleAddTopic = async (topic) => {
        console.log("would add topic: ", topic);
        console.log("to cluster: ", selectedCluster);

        const newTopic = await addTopicToCapability(capability, selectedCluster.id, topic);

        setSelectedCluster(null);
    };

    const handleCloseTopicFormClicked = () => {
        setSelectedCluster(null);
    };

    return <>
        {selectedCluster && 
            <NewTopicForm 
                capabilityId={capabilityId} 
                clusterName={selectedCluster.name} 
                onAddClicked={handleAddTopic}
                onCloseClicked={handleCloseTopicFormClicked} 
            />
        }

        <Text styledAs='sectionHeadline'>Topics</Text>
        <Card variant="fill" surface="main">
            <CardContent>
                {state.map(cluster => <Cluster
                    key={cluster.id}
                    {...cluster}
                    onTopicClicked={selectTopic}
                    onAddClicked={handleAddTopicToClusterClicked}
                />)}
            </CardContent>
        </Card>
    </>
}