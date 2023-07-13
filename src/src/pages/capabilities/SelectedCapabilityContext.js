import AppContext from 'AppContext';
import React, { createContext, useEffect, useCallback, useContext, useState } from 'react';
import { useCapabilityById , useCapabilityMembers, useCapabilityMembershipApplications} from 'hooks/Capabilities';

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

    const { shouldAutoReloadTopics, selfServiceApiClient} = useContext(AppContext);

    //const [isLoading, setIsLoading] = useState(false);
    const [capabilityId, setCapabilityId] = useState(null);
    const [details, setDetails] = useState(null);
    const [members, setMembers] = useState([]);
    const [kafkaClusters, setKafkaClusters] = useState([]);
    const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);
    const [membershipApplications, setMembershipApplications] = useState([]);
    const [leaveCapability, setLeaveCapability] = useState([]);
    const [awsAccount, setAwsAccount] = useState(null); //TODO: more than just a string
    const {capability, isLoaded} = useCapabilityById(capabilityId);
    const {membersList, isLoadedMembers} = useCapabilityMembers(details);
    const {isLoadedApplications, applicationList} = useCapabilityMembershipApplications(details);


    // load kafka clusters and topics
    const loadKafkaClustersAndTopics = useCallback(async () => {

        const clusters = await selfServiceApiClient.getKafkaClusterAccessList(details);
        for (const cluster of clusters) {

            const topics = await selfServiceApiClient.getTopics(cluster);
  
            topics.forEach((kafkaTopic) => {
              adjustRetention(kafkaTopic);
              kafkaTopic.messageContracts = (kafkaTopic.messageContracts || []).sort((a, b) =>
                a.messageType.localeCompare(b.messageType)
              );
            });
  
            cluster.topics = topics;
          }   
 
        setKafkaClusters(clusters);
    }, [details]);

    // load membership applications
    const loadMembershipApplications = useCallback(async () => {
        // const result = await selfServiceApiClient.getCapabilityMembershipApplications(details);
        // setMembershipApplications(result);

        // result.forEach(async application => {
        //     const profilePictureUrl = await getAnotherUserProfilePictureUrl(application.applicant);

        //     setMembershipApplications(prev => {
        //         const copy = prev
        //             ? [...prev]
        //             : [];

        //         const found = copy.find(x => x.id === application.id);
        //         if (found) {
        //             found.applicantProfilePictureUrl = profilePictureUrl;
        //         }

        //         return copy;
        //     });
        // });
    }, [details]);

    // load AWS account
    const loadAwsAccount = useCallback(async () => {
        const awsAcc = await selfServiceApiClient.getCapabilityAwsAccount(details);
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

    const addTopicToCluster = async (kafkaCluster, kafkaTopicDescriptor) => {
        const newTopic = await selfServiceApiClient.addTopicToCapability(kafkaCluster, kafkaTopicDescriptor);
        // NOTE: [jandr] handle errors from call above ^^

        adjustRetention(newTopic);

        setKafkaClusters(prev => {
            const copy = [...prev];
            const cluster = copy.find(cluster => cluster.id === kafkaCluster.id);
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

        const newMessageContract = await selfServiceApiClient.addMessageContractToTopic(foundTopic, messageContractDescriptor);

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

        await selfServiceApiClient.submitMembershipApplicationApproval(found);
        await loadMembershipApplications();
    };

    const submitMembershipApplication = useCallback(async () => {
        await selfServiceApiClient.submitMembershipApplication(details);
    }, [details]);

    const submitLeaveCapability = useCallback(async () => {
        await selfServiceApiClient.submitLeaveCapability(details);
    }, [details])

    const requestAwsAccount = useCallback(async () => {
      await selfServiceApiClient.requestAwsAccount(details);
  }, [details]);

    const getAccessToCluster = async (cluster) => {
      return await selfServiceApiClient.getAccessToCluster(cluster);
    };

    const requestAccessToCluster = async (cluster) => {
      await selfServiceApiClient.requestAccessToCluster(cluster);
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

      await selfServiceApiClient.updateTopic(found, topicDescriptor);

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

      await selfServiceApiClient.deleteTopic(found);

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
        if(isLoaded){
            setDetails(capability);            
        }
        
    }, [isLoaded, capability]);

    useEffect(() => {
        if(isLoadedMembers){
            setMembers(membersList);  
        }        
    }, [isLoadedMembers, membersList]);

    useEffect(() => {
      if(isLoadedApplications){
          setMembershipApplications(applicationList);  
      }        
    }, [isLoadedApplications, applicationList]);

    useEffect(() => {
        if (details) {
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
        isLoading: !isLoaded,
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
