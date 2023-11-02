import AppContext from "AppContext";
import React, {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  useCapabilities,
  useCapabilityById,
  useCapabilityMembers,
  useKafkaClustersAccessList,
  useCapabilityAwsAccount,
  useCapabilityMembersApplications,
} from "hooks/Capabilities";

import { getAnotherUserProfilePictureUrl } from "../../GraphApiClient";
import { useDeleteTopic, useUpdateTopic } from "../../hooks/Topics";
import { SelfServiceApiClient } from "SelfServiceApiClient";

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

// TODO: Cleanup, very messy
function SelectedCapabilityProvider({ children }) {
  const {
    shouldAutoReloadTopics,
    setShouldAutoReloadTopics,
    selfServiceApiClient,
    myCapabilities,
  } = useContext(AppContext);

  const { deleteTopic } = useDeleteTopic();
  const { updateTopic } = useUpdateTopic();

  //const [isLoading, setIsLoading] = useState(false);
  const [capabilityId, setCapabilityId] = useState(null);
  const [details, setDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [kafkaClusters, setKafkaClusters] = useState([]);
  const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);
  const [membershipApplications, setMembershipApplications] = useState([]);
  //const [leaveCapability, setLeaveCapability] = useState([]);
  const [awsAccount, setAwsAccount] = useState(null); //TODO: more than just a string
  const [awsAccountRequested, setAwsAccountRequested] = useState(false);
  const { capability, isLoaded, setReloadRequired } =
    useCapabilityById(capabilityId);
  const { membersList, isLoadedMembers } = useCapabilityMembers(details);
  const [isPendingDeletion, setPendingDeletion] = useState(null);
  const [isDeleted, setIsDeleted] = useState(null);
  const [showCosts, setShowCosts] = useState(false);
  const { clustersList, isLoadedClusters } =
    useKafkaClustersAccessList(details);
  const { awsAccountInfo, isLoadedAccount } = useCapabilityAwsAccount(details);
  const { isLoadedMembersApplications, membersApplicationsList } =
    useCapabilityMembersApplications(details);
  const [canBypassMembershipApplication, setcanBypassMembershipApplication] =
    useState(false);
  const kafkaClusterTopicList = () => {
    if (clustersList.length !== 0) {
      const promises = [];
      for (const cluster of clustersList) {
        let promise = selfServiceApiClient.getTopics(cluster).then((topics) => {
          topics.forEach((kafkaTopic) => {
            adjustRetention(kafkaTopic);
            kafkaTopic.messageContracts = (
              kafkaTopic.messageContracts || []
            ).sort((a, b) => a.messageType.localeCompare(b.messageType));
          });

          cluster.topics = topics;
          return cluster;
        });
        promises.push(promise);
      }

      Promise.all(promises).then((clusters) => {
        setKafkaClusters(clusters);
      });
    }
  };

  useEffect(() => {
    kafkaClusterTopicList();
  }, [clustersList]);

  // load bypass rights:
  const getBypassMembershipApplication = useCallback(async () => {
    const result =
      await selfServiceApiClient.CheckCanBypassMembershipApproval(details);
    setcanBypassMembershipApplication(result);
  }, [details]);

  // load membership applications
  const loadMembershipApplications = useCallback(async () => {
    const result =
      await selfServiceApiClient.getCapabilityMembershipApplications(details);
    setMembershipApplications(result);

    result.forEach(async (application) => {
      const profilePictureUrl = await getAnotherUserProfilePictureUrl(
        application.applicant,
      );

      setMembershipApplications((prev) => {
        const copy = prev ? [...prev] : [];

        const found = copy.find((x) => x.id === application.id);
        if (found) {
          found.applicantProfilePictureUrl = profilePictureUrl;
        }

        return copy;
      });
    });
  }, [details]);

  useEffect(() => {
    if (isLoadedAccount) {
      setAwsAccount(awsAccountInfo);
    }
  }, [isLoadedAccount, awsAccountInfo]);

  //--------------------------------------------------------------------

  const toggleSelectedKafkaTopic = (kafkaClusterId, kafkaTopicId) => {
    setSelectedKafkaTopic((prev) => {
      let newSelection = null;

      // deselect current
      if (
        prev?.kafkaClusterId === kafkaClusterId &&
        prev?.id === kafkaTopicId
      ) {
        newSelection = null;
      } else {
        // find the topic and assign it to selectedTopic
        const foundCluster = (kafkaClusters || []).find(
          (cluster) => cluster.id === kafkaClusterId,
        );
        const foundTopic = (foundCluster?.topics || []).find(
          (topic) => topic.id === kafkaTopicId,
        );

        if (foundTopic) {
          newSelection = foundTopic;
        }
      }

      return newSelection;
    });
  };

  const addTopicToCluster = async (kafkaCluster, kafkaTopicDescriptor) => {
    const newTopic = await selfServiceApiClient.addTopicToCapability(
      kafkaCluster,
      kafkaTopicDescriptor,
    );
    // NOTE: [jandr] handle errors from call above ^^

    adjustRetention(newTopic);

    setKafkaClusters((prev) => {
      const copy = [...prev];
      const cluster = copy.find((cluster) => cluster.id === kafkaCluster.id);
      if (cluster) {
        if (!cluster.topics) {
          cluster.topics = [];
        }

        const foundTopic = cluster.topics.find((x) => x.id === newTopic.id);
        if (!foundTopic) {
          cluster.topics.push(newTopic);
        }
      }
      return copy;
    });
  };

  const addMessageContractToTopic = async (
    kafkaClusterId,
    kafkaTopicId,
    messageContractDescriptor,
  ) => {
    const foundCluster = kafkaClusters.find(
      (cluster) => cluster.id === kafkaClusterId,
    );
    if (!foundCluster) {
      throw Error(`Error! Kafka cluster "${kafkaClusterId}" is unknown!`);
    }

    const foundTopic = (foundCluster.topics || []).find(
      (topic) => topic.id === kafkaTopicId,
    );
    if (!foundTopic) {
      throw Error(`Error! Kafka topic "${kafkaTopicId}" is unknown!`);
    }

    const newMessageContract =
      await selfServiceApiClient.addMessageContractToTopic(
        foundTopic,
        messageContractDescriptor,
      );

    setKafkaClusters((prev) => {
      const copy = [...prev];
      const cluster = copy.find((cluster) => cluster.id === kafkaClusterId);
      if (cluster) {
        if (!cluster.topics) {
          cluster.topics = [];
        }

        const foundTopic = cluster.topics.find((x) => x.id === kafkaTopicId);
        if (foundTopic) {
          if (!foundTopic.messageContracts) {
            foundTopic.messageContracts = [];
          }

          foundTopic.messageContracts.push(newMessageContract);
          foundTopic.messageContracts.sort((a, b) =>
            a.messageType.localeCompare(b.messageType),
          );
        }
      }
      return copy;
    });
  };

  const approveMembershipApplication = async (membershipApplicationId) => {
    const found = membershipApplications.find(
      (x) => x.id === membershipApplicationId,
    );
    if (!found) {
      throw Error(
        `Error! Membership application "${membershipApplicationId}" is unknown!`,
      );
    }

    await selfServiceApiClient.submitMembershipApplicationApproval(found);
    await loadMembershipApplications();
  };

  const submitMembershipApplication = useCallback(async () => {
    await selfServiceApiClient.submitMembershipApplication(details);
  }, [details]);

  const submitLeaveCapability = useCallback(async () => {
    await selfServiceApiClient.submitLeaveCapability(details);
    setReloadRequired(true);
  }, [details]);

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
      found = cluster.topics.find((t) => t.id === topicId);
      if (found) {
        break;
      }
    }

    if (!found) {
      throw Error(`A kafka topic with id "${topicId}" could not be found.`);
    }

    updateTopic(found, topicDescriptor);

    setKafkaClusters((prev) => {
      const copy = [...prev];

      let found = null;
      for (let cluster of copy) {
        found = cluster.topics.find((t) => t.id === topicId);
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
      found = cluster.topics.find((t) => t.id === topicId);
      if (found) {
        break;
      }
    }

    if (!found) {
      throw Error(`A kafka topic with id "${topicId}" could not be found.`);
    }

    deleteTopic(found);

    setKafkaClusters((prev) => {
      const copy = [...prev];

      let found = null;
      for (let cluster of copy) {
        found = cluster.topics.find((t) => t.id === topicId);
        if (found) {
          cluster.topics = cluster.topics.filter(
            (topic) => topic.id !== topicId,
          );
          break;
        }
      }

      return copy;
    });
  };

  const submitDeleteCapability = useCallback(async () => {
    await selfServiceApiClient.submitDeleteCapability(details);
  }, [details]);

  const submitCancelDeleteCapability = useCallback(async () => {
    await selfServiceApiClient.submitCancelDeleteCapability(details);
  }, [details]);

  const ByPassMembershipApproval = async () => {
    await selfServiceApiClient.ByPassMembershipApproval(details);
    setReloadRequired(true);
  };

  const updateDeletionStatus = (value) => {
    setPendingDeletion(value);
  };

  //--------------------------------------------------------------------

  useEffect(() => {
    if (myCapabilities) {
      let capabilityJoined =
        myCapabilities.find((x) => x.id === capabilityId) !== undefined;
      setShowCosts(capabilityJoined);
    }
  }, [details, myCapabilities]);

  useEffect(() => {
    if (isLoaded) {
      setDetails(capability);
      setPendingDeletion(capability.status === "Pending Deletion");
      setIsDeleted(capability.status === "Deleted");
    }
  }, [isLoaded, capability]);

  useEffect(() => {
    if (isLoadedMembers) {
      setMembers(membersList);
    }
  }, [isLoadedMembers, membersList]);

  useEffect(() => {
    if (details) {
      loadMembershipApplications();
      getBypassMembershipApplication();
    } else {
      setMembers([]);
      setMembershipApplications([]);
      setKafkaClusters([]);
    }
  }, [isLoadedMembersApplications, membersApplicationsList]);

  useEffect(() => {
    if (isLoadedMembersApplications) {
      setMembershipApplications(membersApplicationsList);
    }
  }, [isLoadedMembersApplications, membersApplicationsList]);

  // setup reload of kafka clusters and topics
  useEffect(() => {
    const handle = setInterval(() => {
      if (details && shouldAutoReloadTopics) {
        kafkaClusterTopicList();
      }
    }, 5 * 1000);

    return () => clearInterval(handle);
  }, [details, shouldAutoReloadTopics]);

  useEffect(() => {
    if (awsAccountRequested) {
      setAwsAccount({
        ...awsAccount,
        status: "Requested",
      });
    }
  }, [awsAccountRequested]);

  useEffect(() => {}, []);

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
    kafkaClusters,
    selectedKafkaTopic,
    awsAccount,
    setAwsAccountRequested,
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
    submitDeleteCapability,
    submitCancelDeleteCapability,
    isPendingDeletion,
    isDeleted,
    updateDeletionStatus,
    showCosts,
    canBypassMembershipApplication,
    ByPassMembershipApproval,
  };

  return (
    <SelectedCapabilityContext.Provider value={state}>
      {children}
    </SelectedCapabilityContext.Provider>
  );
}

export { SelectedCapabilityContext as default, SelectedCapabilityProvider };
