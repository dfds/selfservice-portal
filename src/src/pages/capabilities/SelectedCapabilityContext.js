import AppContext from 'AppContext';
import React, { createContext, useEffect, useCallback, useContext, useState } from 'react';

import { getAnotherUserProfilePictureUrl } from "../../GraphApiClient";
import * as ApiClient from "../../SelfServiceApiClient";

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

    const { shouldAutoReloadTopics } = useContext(AppContext);

    const [isLoading, setIsLoading] = useState(false);
    const [capabilityId, setCapabilityId] = useState(null);
    const [details, setDetails] = useState(null);
    const [members, setMembers] = useState([]);
    const [kafkaClusters, setKafkaClusters] = useState([]);
    const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);
    const [membershipApplications, setMembershipApplications] = useState([]);
    const [leaveCapability, setLeaveCapability] = useState([]);
    const [awsAccount, setAwsAccount] = useState(null); //TODO: more than just a string

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
        const clusters = await ApiClient.getKafkaClusterAccessList(details);

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

    // load AWS account
    const loadAwsAccount = useCallback(async () => {
        const awsAcc = await ApiClient.getCapabilityAwsAccount(details);
        setAwsAccount(awsAcc);
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

    const submitLeaveCapability = useCallback(async () => {
        await ApiClient.submitLeaveCapability(details);
        await loadDetails(true);
    }, [details])

    const requestAwsAccount = useCallback(async () => {
      await ApiClient.requestAwsAccount(details);
      // await loadMembershipApplications();
      await loadDetails(true);
  }, [details]);

    const getAccessToCluster = async (cluster) => {
      console.log('getting access to cluster', cluster);

      return await ApiClient.getAccessToCluster(cluster);
    };

    const requestAccessToCluster = async (cluster) => {
      console.log('requesting access to cluster', cluster);

      await ApiClient.requestAccessToCluster(cluster);
      await loadDetails(true);
    };

    const updateKafkaTopic = async (topicId, topicDescriptor) => {
      let found = null;
      for (let cluster of kafkaClusters) {
        found = cluster.topics.find(t => t.id === topicId);
        if (found) {
          break;
        }
      }

      if (!found) {
        throw Error(`A kafka topic with id "${topicId}" could not be found.`);
      }

      await ApiClient.updateTopic(found, topicDescriptor);

      setKafkaClusters(prev => {
        const copy = [...prev];

        let found = null;
        for (let cluster of copy) {
          found = cluster.topics.find(t => t.id === topicId);
          if (found) {
            found.description = topicDescriptor.description;
            break;
          }
        }
        return copy;
      });
    };

    const deleteKafkaTopic = async (topicId) => {
      let found = null;
      for (let cluster of kafkaClusters) {
        found = cluster.topics.find(t => t.id === topicId);
        if (found) {
          break;
        }
      }

      if (!found) {
        throw Error(`A kafka topic with id "${topicId}" could not be found.`);
      }

      await ApiClient.deleteTopic(found);

      setKafkaClusters(prev => {
        const copy = [...prev];

        let found = null;
        for (let cluster of copy) {
          found = cluster.topics.find(t => t.id === topicId);
          if (found) {
            const before = [...cluster.topics];
            cluster.topics = cluster.topics.filter(topic => topic.id !== topicId);
            break;
          }
        }

        return copy;
      });
    };

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
            loadAwsAccount();
        } else {
            setMembers([]);
            setMembershipApplications([]);
            setKafkaClusters([]);
        }
    }, [details]);

    // setup reload of kafka clusters and topics
    useEffect(() => {
        const handle = setInterval(() => {
            if (details && shouldAutoReloadTopics) {
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
        leaveCapability,
        kafkaClusters,
        selectedKafkaTopic,
        awsAccount,
        loadCapability: (id) => setCapabilityId(id),
        toggleSelectedKafkaTopic,
        addTopicToCluster,
        addMessageContractToTopic,
        approveMembershipApplication,
        submitMembershipApplication,
        submitLeaveCapability,
        requestAwsAccount,
        getAccessToCluster,
        requestAccessToCluster,
        showResources: (details?._links?.awsAccount?.allow || []).includes("GET"),
        updateKafkaTopic,
        deleteKafkaTopic,
    };

    return <SelectedCapabilityContext.Provider value={state}>{children}</SelectedCapabilityContext.Provider>;
}

export { SelectedCapabilityContext as default, SelectedCapabilityProvider }
