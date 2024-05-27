import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";
import { getAnotherUserProfilePictureUrl } from "../GraphApiClient";

export function useCapabilities() {
  const { responseData: getAllResponse, sendRequest } = useSelfServiceRequest();
  const { responseData: addedCapability, sendRequest: addCapability } =
    useSelfServiceRequest();
  const [isLoaded, setIsLoaded] = useState(false);
  const [capabilities, setCapabilities] = useState([]);

  const sortByName = (list) => {
    list.sort((a, b) => a.name.localeCompare(b.name));
  };

  const createCapability = (
    name,
    description,
    invitations,
    jsonMetadataString,
  ) => {
    addCapability({
      urlSegments: ["capabilities"],
      method: "POST",
      payload: {
        name: name,
        description: description,
        invitees: invitations,
        jsonMetadata: jsonMetadataString,
      },
    });
  };

  useEffect(() => {
    if (addedCapability) {
      setCapabilities((prev) => {
        const list = [...prev, addCapability];
        sortByName(list);
        return list;
      });
    }
  }, [addedCapability]);

  useEffect(() => {
    sendRequest({
      urlSegments: ["capabilities"],
      method: "GET",
      payload: null,
    });
  }, []);

  useEffect(() => {
    const list = getAllResponse?.items || [];
    sortByName(list);

    setCapabilities(list);
    setIsLoaded(true);
  }, [getAllResponse]);

  return {
    isLoaded,
    capabilities,
    addCapability: createCapability,
  };
}

export function useCapabilityById(id) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [capability, setCapability] = useState(null);
  const [reloadRequired, setReloadRequired] = useState(true);
  const { responseData, sendRequest } = useSelfServiceRequest();

  useEffect(() => {
    if (id != null && reloadRequired) {
      sendRequest({
        urlSegments: ["capabilities", id],
      });
    }
  }, [id, reloadRequired]);

  useEffect(() => {
    if (responseData != null) {
      setCapability(responseData);
      setIsLoaded(true);
      setReloadRequired(false);
    }
  }, [responseData]);

  return {
    isLoaded,
    capability,
    setReloadRequired,
  };
}

export function useCapabilityMembers(capabilityDefinition) {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const [isLoadedMembers, setIsLoadedMembers] = useState(false);
  const [membersList, setMembersList] = useState([]);

  const membersLink = capabilityDefinition?._links?.members;

  useEffect(() => {
    if (membersLink) {
      sendRequest({
        urlSegments: [membersLink.href],
      });
    }
  }, [membersLink]);

  useEffect(() => {
    const updateMembers = async (members) => {
      if (members.length !== 0) {
        const updatedList = await Promise.all(
          members.map(async (member) => {
            const profilePictureUrl = await getAnotherUserProfilePictureUrl(
              member.email,
            );
            const updatedMember = { ...member, pictureUrl: profilePictureUrl };
            return updatedMember;
          }),
        );
        setMembersList(updatedList);
      }
    };

    if (responseData?.items.length !== 0) {
      setMembersList((prev) => {
        if (prev.length === 0) {
          return responseData?.items || [];
        } else {
          return prev;
        }
      });

      updateMembers(responseData?.items || []);
    }
  }, [responseData]);

  useEffect(() => {
    if (membersList.length !== 0) {
      setIsLoadedMembers(true);
    }
  }, [membersList]);

  return {
    isLoadedMembers,
    membersList,
  };
}

export function useKafkaClustersAccessList(capabilityDefinition) {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const [isLoadedClusters, setIsLoadedClusters] = useState(false);
  const [clustersList, setClustersList] = useState([]);

  const clustersLink = capabilityDefinition?._links?.clusters;

  useEffect(() => {
    if (clustersLink) {
      sendRequest({
        urlSegments: [clustersLink.href],
      });
    }
  }, [clustersLink]);

  useEffect(() => {
    if (responseData?.items.length >= 0) {
      setClustersList(responseData?.items || []);
    }
  }, [responseData]);

  useEffect(() => {
    if (clustersList.length >= 0) {
      setIsLoadedClusters(true);
    }
  }, [clustersList]);

  return {
    isLoadedClusters,
    clustersList,
  };
}

export function useCapabilityAwsAccount(capabilityDefinition) {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const [isLoadedAccount, setIsLoadedAccount] = useState(false);
  const [awsAccountInfo, setAwsAccountInfo] = useState(null);

  const link = capabilityDefinition?._links?.awsAccount;
  const shouldGet = (link?.allow || []).includes("GET");

  useEffect(() => {
    if (link && shouldGet) {
      sendRequest({
        urlSegments: [link.href],
      });
    }
  }, [link]);

  useEffect(() => {
    if (responseData !== null) {
      setAwsAccountInfo(responseData);
    }
  }, [responseData]);

  useEffect(() => {
    if (awsAccountInfo !== null) {
      setIsLoadedAccount(true);
    }
  }, [awsAccountInfo]);

  return {
    isLoadedAccount,
    awsAccountInfo,
  };
}

export function useCapabilityMembersApplications(capabilityDefinition) {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const [isLoadedMembersApplications, setIsLoadedMembersApplications] =
    useState(false);
  const [membersApplicationsList, setMembersApplicationsList] = useState([]);

  const link = capabilityDefinition?._links?.membershipApplications;

  useEffect(() => {
    if (link) {
      sendRequest({
        urlSegments: [link.href],
      });
    }
  }, [link]);

  useEffect(() => {
    const updateMembers = async (members) => {
      if (members.length !== 0) {
        const updatedList = await Promise.all(
          members.map(async (member) => {
            const profilePictureUrl = await getAnotherUserProfilePictureUrl(
              member.applicant,
            );
            const updatedMember = {
              ...member,
              applicantProfilePictureUrl: profilePictureUrl,
            };
            return updatedMember;
          }),
        );
        setMembersApplicationsList(updatedList);
      }
    };

    if (responseData?.items.length !== 0) {
      setMembersApplicationsList((prev) => {
        if (prev.length === 0) {
          return responseData?.items || [];
        } else {
          return prev;
        }
      });

      updateMembers(responseData?.items || []);
    }
  }, [responseData]);

  useEffect(() => {
    if (membersApplicationsList.length !== 0) {
      setIsLoadedMembersApplications(true);
    }
  }, [membersApplicationsList]);

  return {
    isLoadedMembersApplications,
    membersApplicationsList,
  };
}

export function useCapabilityMetadata(capabilityDefinition) {
  const { responseData, sendRequest: sendGetJsonMetadataRequest } =
    useSelfServiceRequest();
  const { sendRequest: sendSetJsonMetadataRequest } = useSelfServiceRequest();
  const {
    inProgress: inProgressMetadata,
    sendRequest: sendSetRequiredCapabilityJsonMetadata,
  } = useSelfServiceRequest();
  const [isLoadedMetadata, setIsLoadedMetadata] = useState(false);
  const [metadata, setMetadata] = useState(null);

  const link = capabilityDefinition?._links;

  useEffect(() => {
    if (link?.metadata && (link.metadata.allow || []).includes("GET")) {
      void sendGetJsonMetadataRequest({
        urlSegments: [link.metadata.href],
        method: "GET",
      });
    }
  }, [link]);

  useEffect(() => {
    if (responseData !== null) {
      setMetadata(responseData);
    }
  }, [responseData]);

  useEffect(() => {
    if (metadata !== null) {
      setIsLoadedMetadata(true);
    }
  }, [metadata]);

  const setCapabilityJsonMetadata = async (jsonMetadata) => {
    if (!(link?.metadata && (link.metadata.allow || []).includes("POST"))) {
      throw new Error("User is not allowed to set metadata");
    }
    await sendSetJsonMetadataRequest({
      urlSegments: [link.metadata.href],
      method: "POST",
      payload: {
        jsonMetadata: JSON.parse(jsonMetadata),
      },
    });
  };

  const setRequiredCapabilityJsonMetadata = async (jsonMetadata) => {
    if (
      !(
        link?.setRequiredMetadata &&
        (link.setRequiredMetadata.allow || []).includes("POST")
      )
    ) {
      throw new Error("User is not allowed to set required metadata");
    }
    await sendSetRequiredCapabilityJsonMetadata({
      urlSegments: [link?.setRequiredMetadata.href],
      method: "POST",
      payload: {
        jsonMetadata: JSON.parse(jsonMetadata),
      },
    });
  };

  return {
    isLoadedMetadata,
    metadata,
    setCapabilityJsonMetadata,
    setRequiredCapabilityJsonMetadata,
    inProgressMetadata,
  };
}

export function useCapabilityInvitees(capabilityDefinition) {
  const { inProgress, sendRequest: addInvitees } = useSelfServiceRequest();

  const createInvitees = ([invitations]) => {
    addInvitees({
      urlSegments: ["capabilities", capabilityDefinition.id, "invitations"],
      method: "POST",
      payload: {
        invitees: invitations,
      },
    });
  };

  return {
    addInvitees: createInvitees,
    inProgress,
  };
}

export function useCapabilityAzureResources(capabilityDefinition) {
  const { responseData, sendRequest: sendGetAzureResources } =
    useSelfServiceRequest();
  const [isLoadedAzure, setIsLoadedAzure] = useState(false);
  const [azureResources, setAzureResources] = useState(null);

  const link = capabilityDefinition?._links?.azureResources;
  const shouldGet = (link?.allow || []).includes("GET");
  const { responseData: createdAzure, inProgress, sendRequest: requestAzureResources } =
  useSelfServiceRequest();

  const requestAzure = (environment) => {
    requestAzureResources({
      urlSegments: ["capabilities", capabilityDefinition.id, "azureresources"],
      method: "POST",
      payload: {
        environment: environment,
      },
    });
  };


  useEffect(() => {
    if (link && shouldGet) {
      sendGetAzureResources({
        urlSegments: [link.href],
      });
    }
  }, [link, createdAzure]);

  useEffect(() => {
    if (responseData !== null) {
      setAzureResources(responseData);
    }
  }, [responseData]);

  useEffect(() => {
    if (azureResources !== null ) {
      if (azureResources.items.length != 0){
        setIsLoadedAzure(true); 
      }         
    }
  }, [azureResources]);

  return {
    isLoadedAzure,
    azureResources,
    requestAzure,
  };
}