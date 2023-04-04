import React, { useState, useEffect } from "react";
import { useCurrentUser } from "./AuthService";
import { getMyPortalProfile, getCapabilities, getCapabilityById, getCapabilityMembers, getCapabilityMembershipApplications, getCapabilityTopicsGroupedByCluster, addTopicToCapability, addMessageContractToTopic } from "./SelfServiceApiClient";
import { getAnotherUserProfilePictureUrl } from "./GraphApiClient";

const appContext = React.createContext(null);

function adjustRetention(kafkaTopic) {
  if (kafkaTopic.retention !== "forever") {
    const match = kafkaTopic.retention.match(/^(?<days>\d+)d$/);
    if (match) {
        const { days } = match.groups;
        kafkaTopic.retention = `${days} day${days === "1" ? "" : "s"}`;
    }
  }
}

function useCapability() {
  const [capabilityId, setCapabilityId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [kafkaClusters, setKafkaClusters] = useState([]);
  const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);
  const [membershipApplications, setMembershipApplications] = useState([]);


// load details
  useEffect(() => {
    setDetails(null);

    async function fetchDetails(capabilityId) {
      setIsLoading(true);

      const details = await getCapabilityById(capabilityId);

      setDetails(details);
      setIsLoading(false);
    }

    if (capabilityId) {
      fetchDetails(capabilityId);
    }
  }, [capabilityId]);

  // load members
  useEffect(() => {
    if (!details) {
      setMembers([]);
      return;
    }

    async function fetchMembers(details) {
      const members = await getCapabilityMembers(details);
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
    }

    fetchMembers(details);
  }, [details]);

  // load kafka clusters and topics
  useEffect(() => {

    async function fetchData(details) {
      const clusters = await getCapabilityTopicsGroupedByCluster(details);
      clusters.forEach(cluster => {
          (cluster.topics || []).forEach(kafkaTopic => {
            adjustRetention(kafkaTopic);
            kafkaTopic.messageContracts = (kafkaTopic.messageContracts || []).sort((a,b) => a.messageType.localeCompare(b.messageType));
          });
      });

      setKafkaClusters(clusters);
    }

    if (details) {
      fetchData(details);
    }

    const handle = setInterval(() => {
      if (details) {
        fetchData(details);
      }
    }, 5*1000);
    return () => clearInterval(handle);
  }, [details]);

  const loadCapability = (id) => setCapabilityId(id);
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
    const newTopic = await addTopicToCapability(details, kafkaClusterId, kafkaTopicDescriptor);
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

  const addMessageContractToTopicLocal = async (kafkaClusterId, kafkaTopicId, messageContractDescriptor) => {
    const foundCluster = kafkaClusters.find(cluster => cluster.id === kafkaClusterId);
    if (!foundCluster) {
      throw Error(`Error! Kafka cluster "${kafkaClusterId}" is unknown!`);
    }

    const foundTopic = (foundCluster.topics || []).find(topic => topic.id === kafkaTopicId);
    if (!foundTopic) {
      throw Error(`Error! Kafka topic "${kafkaTopicId}" is unknown!`);
    }

    const newMessageContract = await addMessageContractToTopic(foundTopic, messageContractDescriptor);

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
              foundTopic.messageContracts.sort((a,b) => a.messageType.localeCompare(b.messageType));
            }
        }
        return copy;
    });
  };

  // load membership applications
  useEffect(() => {
    if (!details) {
      return;
    }
    const fetchMemberhipApplications = async (details) => {
      const result = await getCapabilityMembershipApplications(details);
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

    };

    fetchMemberhipApplications(details);
  }, [details]);

  const capability = {
    isLoading,
    details,
    members,
    kafkaClusters,
    selectedKafkaTopic,
    membershipApplications,
    toggleSelectedKafkaTopic,
    addTopicToCluster,
    addMessageContractToTopic: addMessageContractToTopicLocal
  };

  return { capability, loadCapability };
}

function AppProvider({ children }) {
  const user = useCurrentUser();

  const [appStatus, setAppStatus] = useState({
    hasLoadedMyCapabilities: false,
    hasLoadedOtherCapabilities: false,
  });

  const [topics, setTopics] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);
  const [otherCapabilities, setOtherCapabilities] = useState([]);
  const [stats, setStats] = useState([]);

  async function loadMyProfile() {
    const { capabilities, stats } = await getMyPortalProfile();
    setMyCapabilities(capabilities);
    setStats(stats);
    setAppStatus(prev => ({...prev, ...{hasLoadedMyCapabilities: true}}));
  }

  async function loadOtherCapabilities() {
    const allCapabilities = await getCapabilities();
    const filteredList = (allCapabilities || []).filter(x => {
        const myCap = (myCapabilities || []).find(y => y.id === x.id);
        if (myCap) {
            return false;
        } else {
            return true;
        }
    });

    setOtherCapabilities(filteredList);
    setAppStatus(prev => ({...prev, ...{hasLoadedOtherCapabilities: true}}));
  }

  useEffect(() => {
    if (user && user.isAuthenticated) {
        loadMyProfile();
      }
  }, [user]);

  useEffect(() => {
    if (user && user.isAuthenticated) {
        loadOtherCapabilities();
      }
  }, [myCapabilities, user]);



// ---------------------------------------------------------

  const { capability, loadCapability } = useCapability();

// ---------------------------------------------------------

  const state = {
    user,
    myCapabilities,
    otherCapabilities,
    selectedCapability: capability,
    changeSelectedCapability: (capabilityId) => loadCapability(capabilityId),
    reloadOtherCapabilities: loadOtherCapabilities,
    isCapabilitiesInitialized: (appStatus.hasLoadedMyCapabilities && appStatus.hasLoadedOtherCapabilities),
    appStatus,
    topics,
    setTopics,
    stats,
  };

  return <appContext.Provider value={state}>{children}</appContext.Provider>;
}

export { appContext as default, AppProvider }