import React, { createContext, useEffect, useCallback, useContext, useState } from 'react';

import { getAnotherUserProfilePictureUrl } from "./GraphApiClient";
import * as ApiClient from "./SelfServiceApiClient";

const SelectedCapabilityContext = createContext();

function adjustRetention(kafkaTopic) {
    if (kafkaTopic.retention !== "forever") {
      const match = kafkaTopic.retention.match(/^(?<days>\d+)d$/);
      if (match) {
          const { days } = match.groups;
          kafkaTopic.retention = `${days} day${days === "1" ? "" : "s"}`;
      }
    }
}

function SelectedCapabilityProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const [capabilityId, setCapabilityId] = useState(null);
    const [details, setDetails] = useState(null);
    const [members, setMembers] = useState([]);
    const [kafkaClusters, setKafkaClusters] = useState([]);
    const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);
    const [membershipApplications, setMembershipApplications] = useState([]);

    // load details
    const loadDetails = useCallback(async (isReload = false) => {
        if (!isReload) {
            setIsLoading(true);
        }

        const details = await ApiClient.getCapabilityById(capabilityId);
        setDetails(details);

        if (!isReload) {
            setIsLoading(false);
        }
    }, [capabilityId]);

    // load members
    const loadMembers = useCallback(async () => {
        const members = await ApiClient.getCapabilityMembers(details);
        setMembers(members);
  
        members.forEach(async member => {
          const profilePictureUrl = await getAnotherUserProfilePictureUrl(member.email);
          setMembers(prev => {
            const copy = prev
                ? [...prev]
                : [];
  
            const found = copy.find(x => x.email === member.email)
            if (found) {
                found.pictureUrl = profilePictureUrl;
            }
  
            return copy;
          });
        });
    }, [details]);

    // load kafka clusters and topics
    const loadKafkaClustersAndTopics = useCallback(async () => {
        const clusters = await ApiClient.getCapabilityTopicsGroupedByCluster(details);
        clusters.forEach(cluster => {
            (cluster.topics || []).forEach(kafkaTopic => {
                adjustRetention(kafkaTopic);
                kafkaTopic.messageContracts = (kafkaTopic.messageContracts || []).sort((a, b) => a.messageType.localeCompare(b.messageType));
            });
        });

        setKafkaClusters(clusters);
    }, [details]);

    // load membership applications
    const loadMembershipApplications = useCallback(async () => {
        const result = await ApiClient.getCapabilityMembershipApplications(details);
        setMembershipApplications(result);

        result.forEach(async application => {
            const profilePictureUrl = await getAnotherUserProfilePictureUrl(application.applicant);

            setMembershipApplications(prev => {
                const copy = prev
                    ? [...prev]
                    : [];

                const found = copy.find(x => x.id === application.id);
                if (found) {
                    found.applicantProfilePictureUrl = profilePictureUrl;
                }

                return copy;
            });
        });
    }, [details]);

    //--------------------------------------------------------------------

    const toggleSelectedKafkaTopic = (kafkaClusterId, kafkaTopicId) => {
        setSelectedKafkaTopic(prev => {
            let newSelection = null;

            // deselect current
            if (prev?.kafkaClusterId === kafkaClusterId && prev?.id === kafkaTopicId) {
                newSelection = null;
            } else {
                // find the topic and assign it to selectedTopic
                const foundCluster = (kafkaClusters || []).find(cluster => cluster.id === kafkaClusterId);
                const foundTopic = (foundCluster?.topics || []).find(topic => topic.id === kafkaTopicId);

                if (foundTopic) {
                    newSelection = foundTopic;
                }
            }

            return newSelection;
        });
    };

    const addTopicToCluster = async (kafkaClusterId, kafkaTopicDescriptor) => {
        const newTopic = await ApiClient.addTopicToCapability(details, kafkaClusterId, kafkaTopicDescriptor);
        // NOTE: [jandr] handle errors from call above ^^

        adjustRetention(newTopic);

        setKafkaClusters(prev => {
            const copy = [...prev];
            const cluster = copy.find(cluster => cluster.id === kafkaClusterId);
            if (cluster) {
                if (!cluster.topics) {
                    cluster.topics = [];
                }

                const foundTopic = cluster.topics.find(x => x.id === newTopic.id);
                if (!foundTopic) {
                    cluster.topics.push(newTopic);
                }
            }
            return copy;
        });
    };

    const addMessageContractToTopic = async (kafkaClusterId, kafkaTopicId, messageContractDescriptor) => {
        const foundCluster = kafkaClusters.find(cluster => cluster.id === kafkaClusterId);
        if (!foundCluster) {
            throw Error(`Error! Kafka cluster "${kafkaClusterId}" is unknown!`);
        }

        const foundTopic = (foundCluster.topics || []).find(topic => topic.id === kafkaTopicId);
        if (!foundTopic) {
            throw Error(`Error! Kafka topic "${kafkaTopicId}" is unknown!`);
        }

        const newMessageContract = await ApiClient.addMessageContractToTopic(foundTopic, messageContractDescriptor);

        setKafkaClusters(prev => {
            const copy = [...prev];
            const cluster = copy.find(cluster => cluster.id === kafkaClusterId);
            if (cluster) {
                if (!cluster.topics) {
                    cluster.topics = [];
                }

                const foundTopic = cluster.topics.find(x => x.id === kafkaTopicId);
                if (foundTopic) {
                    if (!foundTopic.messageContracts) {
                        foundTopic.messageContracts = [];
                    }

                    foundTopic.messageContracts.push(newMessageContract);
                    foundTopic.messageContracts.sort((a, b) => a.messageType.localeCompare(b.messageType));
                }
            }
            return copy;
        });
    };

    const approveMembershipApplication = async (membershipApplicationId) => {
        const found = membershipApplications.find(x => x.id === membershipApplicationId);
        if (!found) {
            throw Error(`Error! Membership application "${membershipApplicationId}" is unknown!`);
        }

        await ApiClient.submitMembershipApplicationApproval(found);
        await loadMembershipApplications();
    };

    const submitMembershipApplication = useCallback(async () => {
        await ApiClient.submitMembershipApplication(details);
        // await loadMembershipApplications();
        await loadDetails(true);
    }, [details]);

    //--------------------------------------------------------------------

    useEffect(() => {
        if (capabilityId) {
            loadDetails();
        } else {
            setDetails(null);
        }
    }, [capabilityId]);

    useEffect(() => {
        if (details) {
            loadMembers();
            loadMembershipApplications();
            loadKafkaClustersAndTopics();
        } else {
            setMembers([]);
            setMembershipApplications([]);
            setKafkaClusters([]);
        }
    }, [details]);

    // setup reload of kafka clusters and topics
    useEffect(() => {
        const handle = setInterval(() => {
            if (details) {
                loadKafkaClustersAndTopics();
            }
        }, 5 * 1000);
        
        return () => clearInterval(handle);
    }, [details]);

    //--------------------------------------------------------------------

    const state = {
        isLoading,
        isFound: details != null,
        id: capabilityId,
        name: details?.name,
        description: details?.description,
        links: details?._links,
        members,
        membershipApplications,
        kafkaClusters,
        selectedKafkaTopic,
        loadCapability: (id) => setCapabilityId(id),
        toggleSelectedKafkaTopic,
        addTopicToCluster,
        addMessageContractToTopic,
        approveMembershipApplication,
        submitMembershipApplication,
    };

    return <SelectedCapabilityContext.Provider value={state}>{children}</SelectedCapabilityContext.Provider>;
}

export { SelectedCapabilityContext as default, SelectedCapabilityProvider }