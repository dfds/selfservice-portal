import AppContext from "AppContext";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCapabilityMetadata } from "hooks/Capabilities";

import { useDeleteTopic, useUpdateTopic } from "../../hooks/Topics";
import { useSelfServiceRequest } from "hooks/SelfServiceApi";
import {
  useCapability,
  useCapabilityMembersDetailed,
  useCapabilityMembersApplications,
  useCapabilityInvitees,
} from "@/state/remote/queries/capabilities";
import { useKafkaClustersAccessList } from "@/state/remote/queries/kafka";
import { useSsuRequestLink } from "@/state/remote/query";
import { useMe } from "@/state/remote/queries/me";
import {
  useCapabilityAzureResources,
  useCapabilityAzureResourceRequest,
} from "@/state/remote/queries/azure";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const { shouldAutoReloadTopics, selfServiceApiClient } =
    useContext(AppContext);

  const { data: meData } = useMe();
  const { updateTopic } = useUpdateTopic();
  const { deleteTopic } = useDeleteTopic();

  const [capabilityId, setCapabilityId] = useState(null);
  const [details, setDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [kafkaClusters, setKafkaClusters] = useState([]);
  const [selectedKafkaTopic, setSelectedKafkaTopic] = useState(null);
  const [membershipApplications, setMembershipApplications] = useState([]);
  const [awsAccount, setAwsAccount] = useState(null);
  const [awsAccountRequested, setAwsAccountRequested] = useState(false);
  const { isFetched, data: capability } = useCapability(capabilityId); // NEW
  const { isFetched: capabilityMembersFetched, data: membersList } =
    useCapabilityMembersDetailed(details); // NEW
  const [isPendingDeletion, setPendingDeletion] = useState(null);
  const [isDeleted, setIsDeleted] = useState(null);
  const [showCosts, setShowCosts] = useState(false);
  const { isFetched: isClustersListFetched, data: clustersList } =
    useKafkaClustersAccessList(details); // NEW
  const { data: awsAccountDetails, isFetched: isLoadedAccount } =
    useSsuRequestLink(details?._links?.awsAccount); // NEW
  const { data: awsAccountInformation, isFetched: isLoadedAccountInformation } =
    useSsuRequestLink(details?._links?.awsAccountInformation); // NEW
  const {
    isFetched: isLoadedMembersApplications,
    data: membersApplicationsList,
  } = useCapabilityMembersApplications(details); // NEW

  const [isInviteesCreated, setIsInviteesCreated] = useState(false);
  const { data: azureResources, isFetched: isLoadedAzure } =
    useCapabilityAzureResources(details); // NEW
  const capabilityAzureResourceRequest = useCapabilityAzureResourceRequest();
  const [azureResourcesList, setAzureResourcesList] = useState([]);

  const configurationLevelLink = details?._links?.configurationLevel?.href;
  const canAccessConfigurationLevel = (
    details?._links?.configurationLevel?.allow || []
  ).includes("GET");

  const [
    reloadConfigurationLevelInformation,
    setReloadConfigurationLevelInformation,
  ] = useState(true);
  const {
    responseData: configurationLevelInformation,
    sendRequest: getConfiguraitionLevelInformation,
  } = useSelfServiceRequest();

  const loadConfigurationLevelInformation = () => {
    if (configurationLevelLink) {
      getConfiguraitionLevelInformation({
        urlSegments: [configurationLevelLink],
      });
    }
  };

  useEffect(() => {
    if (reloadConfigurationLevelInformation) {
      loadConfigurationLevelInformation();
      setReloadConfigurationLevelInformation(false);
    }
  }, [reloadConfigurationLevelInformation]);

  useEffect(() => {
    if (
      !configurationLevelInformation &&
      configurationLevelLink &&
      canAccessConfigurationLevel
    ) {
      loadConfigurationLevelInformation();
    }
  }, [configurationLevelInformation, configurationLevelLink]);

  function sleep(duration) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), duration);
    });
  }

  const capabilityInvitees = useCapabilityInvitees();

  async function addNewInvitees(invitations) {
    setIsInviteesCreated(true);
    capabilityInvitees.mutate({
      capabilityDefinition: details,
      payload: {
        invitees: invitations,
      },
    });
    await sleep(3000);
    setIsInviteesCreated(false);
    queryClient.invalidateQueries({ queryKey: ["capabilities"] });
  }

  const {
    metadata,
    setCapabilityJsonMetadata,
    setRequiredCapabilityJsonMetadata,
    inProgressMetadata,
  } = useCapabilityMetadata(details);

  const kafkaClusterTopicList = () => {
    if (clustersList != null && clustersList.length !== 0) {
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
    if (clustersList != null) {
      kafkaClusterTopicList();
    }
  }, [isClustersListFetched]);

  useEffect(() => {
    if (isLoadedAccount) {
      setAwsAccount(awsAccountDetails);
    }
  }, [isLoadedAccount, awsAccountDetails]);

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
    queryClient.invalidateQueries({ queryKey: ["capabilities", "kafka"] });
  };

  const validateContract = async (kafkaTopicId, messageType, schema) => {
    const messageContractDescriptor = {
      messageType: messageType,
      schema: schema,
    };
    const response = await selfServiceApiClient.validateMessageSchema(
      kafkaTopicId,
      messageContractDescriptor,
    );
    if (response.status === 200) return { isContractValid: true };

    return { isContractValid: false, failureReason: response.detail };
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

  const deleteMembershipApplication = async (membershipApplicationId) => {
    const found = membershipApplications.find(
      (x) => x.id === membershipApplicationId,
    );
    if (!found) {
      throw Error(
        `Error! Membership application "${membershipApplicationId}" is unknown!`,
      );
    }

    await selfServiceApiClient.deleteMembershipApplicationApproval(found);
    queryClient.invalidateQueries({ queryKey: ["capabilities", "members"] });
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
    await sleep(2000);
    queryClient.invalidateQueries({ queryKey: ["capabilities", "members"] });
  };

  const submitMembershipApplication = useCallback(async () => {
    await selfServiceApiClient.submitMembershipApplication(details);
    queryClient.invalidateQueries({ queryKey: ["capabilities"] });
  }, [details]);

  const submitLeaveCapability = useCallback(async () => {
    await selfServiceApiClient.submitLeaveCapability(details);
    queryClient.invalidateQueries({ queryKey: ["capabilities"] });
  }, [details]);

  const requestAwsAccount = useCallback(async () => {
    await selfServiceApiClient.requestAwsAccount(details);
    queryClient.invalidateQueries({ queryKey: ["capabilities"] });
  }, [details]);

  const getAccessToCluster = async (cluster) => {
    return await selfServiceApiClient.getAccessToCluster(cluster);
  };

  const requestAccessToCluster = async (cluster) => {
    await selfServiceApiClient.requestAccessToCluster(cluster);
    queryClient.invalidateQueries({ queryKey: ["capabilities", "kafka"] });
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
    queryClient.invalidateQueries({ queryKey: ["capabilities"] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [details]);

  const submitCancelDeleteCapability = useCallback(async () => {
    await selfServiceApiClient.submitCancelDeleteCapability(details);
    queryClient.invalidateQueries({ queryKey: ["capabilities"] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [details]);

  const bypassMembershipApproval = async () => {
    try {
      await selfServiceApiClient.bypassMembershipApproval(details);
    } catch (error) {
      console.log(error);
    }
    queryClient.invalidateQueries({ queryKey: ["capabilities"] });
  };

  const updateDeletionStatus = (value) => {
    setPendingDeletion(value);
  };

  const addNewAzure = (environment) => {
    capabilityAzureResourceRequest.mutate(
      {
        capabilityDefinition: details,
        payload: {
          environment: environment,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["capabilities", "azure"],
          });
        },
      },
    );
  };

  //--------------------------------------------------------------------

  useEffect(() => {
    if (meData) {
      let capabilityJoined =
        meData.capabilities.find((x) => x.id === capabilityId) !== undefined;
      setShowCosts(capabilityJoined);
    }
  }, [details, meData]);

  useEffect(() => {
    if (isFetched && capability != null) {
      setDetails(capability);
      setPendingDeletion(capability.status === "Pending Deletion");
      setIsDeleted(capability.status === "Deleted");
    }
  }, [isFetched, capability]);

  useEffect(() => {
    if (capabilityMembersFetched) {
      setMembers(membersList);
    }
  }, [capabilityMembersFetched, membersList]);

  useEffect(() => {
    if (isLoadedAzure) {
      setAzureResourcesList(azureResources.items);
    }
  }, [isLoadedAzure, azureResources]);

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

  // useEffect(() => {
  //   console.log(capabilityId);
  // }, [capabilityId]);

  //--------------------------------------------------------------------

  const state = {
    isLoading: !isFetched,
    isFound: details != null,
    id: capabilityId,
    name: details?.name,
    createdAt: details?.createdAt,
    createdBy: details?.createdBy,
    description: details?.description,
    links: details?._links,
    members,
    membershipApplications,
    kafkaClusters,
    selectedKafkaTopic,
    awsAccount,
    awsAccountInformation,
    isLoadedAccountInformation,
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
    updateKafkaTopic,
    deleteKafkaTopic,
    submitDeleteCapability,
    submitCancelDeleteCapability,
    isPendingDeletion,
    isDeleted,
    updateDeletionStatus,
    showCosts,
    bypassMembershipApproval,
    addNewInvitees,
    isInviteesCreated,
    setCapabilityJsonMetadata,
    setRequiredCapabilityJsonMetadata,
    metadata,
    validateContract,
    configurationLevelInformation,
    inProgressMetadata,
    azureResourcesList,
    addNewAzure,
    deleteMembershipApplication,
    isLoadedAzure,
    setReloadConfigurationLevelInformation,
  };

  return (
    <SelectedCapabilityContext.Provider value={state}>
      {children}
    </SelectedCapabilityContext.Provider>
  );
}

export { SelectedCapabilityContext as default, SelectedCapabilityProvider };
