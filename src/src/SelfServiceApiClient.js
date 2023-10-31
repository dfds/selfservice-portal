import { useContext } from "react";
import { callApi, getSelfServiceAccessToken } from "./AuthService";

export class SelfServiceApiClient {
  constructor(errorHandler) {
    this.errorHandler = errorHandler;
    this.responseHandler = () => {};
  }

  async getMyPortalProfile() {
    const accessToken = await getSelfServiceAccessToken();

    const url = composeUrl("me");
    const response = await callApi(url, accessToken);
    this.responseHandler(response);
    const myProfile = await response.json();

    const defaultValues = {
      capabilities: [],
    };

    return { ...defaultValues, ...myProfile };
  }

  async getStats() {
    const accessToken = await getSelfServiceAccessToken();

    const url = composeUrl("stats");
    const response = await callApi(url, accessToken);
    this.responseHandler(response);
    const stats = await response.json();
    return stats || [];
  }

  async updateMyPersonalInformation(
    myProfileDefinition,
    personalInformationDescriptor,
  ) {
    const link = myProfileDefinition?._links?.personalInformation;
    if (!link) {
      throw Error(
        "Error! No personal information link found on my profile definition: " +
          JSON.stringify(myProfileDefinition, null, 2),
      );
    }

    if (!(link.allow || []).includes("PUT")) {
      throw Error(
        "Error! You are not allowed to update your personal information. Options was " +
          JSON.stringify(link.allow, null, 2),
      );
    }

    const accessToken = await getSelfServiceAccessToken();

    const url = link.href;
    const payload = {
      name: personalInformationDescriptor.name,
      email: personalInformationDescriptor.email,
    };

    const response = await callApi(url, accessToken, "PUT", payload);
    this.responseHandler(response);

    if (!response.ok) {
      console.log(
        `Warning: failed updating personal information using url ${url} - response was ${response.status} ${response.statusText}`,
      );
    }
  }

  async registerMyVisit(myProfileDefinition) {
    const link = myProfileDefinition?._links?.portalVisits;
    if (!link) {
      throw Error(
        "Error! No portal visits link found on my profile definition: " +
          JSON.stringify(myProfileDefinition, null, 2),
      );
    }

    if (!(link.allow || []).includes("POST")) {
      throw Error(
        "Error! You are not allowed to register your portal visit. Options was " +
          JSON.stringify(link.allow, null, 2),
      );
    }

    const accessToken = await getSelfServiceAccessToken();

    const url = link.href;
    const payload = {};

    const response = await callApi(url, accessToken, "POST", payload);

    if (!response.ok) {
      console.log(
        `Warning: failed registering portal visit using url ${url} - response was ${response.status} ${response.statusText}`,
      );
    }
  }

  async getKafkaClusterAccessList(capabilityDefinition) {
    const clusterAccessLink = capabilityDefinition?._links?.clusters;
    if (!clusterAccessLink) {
      console.log(
        "Warning! No kafka cluster access link found on capability definition:",
        capabilityDefinition,
      );
      return [];
    }

    const accessToken = await getSelfServiceAccessToken();

    const url = clusterAccessLink.href;
    const response = await callApi(url, accessToken);
    const { items } = await response.json();

    return items;
  }

  async getTopics(clusterAccessDefinition) {
    const topicsLink = clusterAccessDefinition?._links?.topics;
    if (!topicsLink) {
      console.log(
        "Warning! No topics link found on kafka cluster access definition:",
        clusterAccessDefinition,
      );
      return [];
    }

    const accessToken = await getSelfServiceAccessToken();

    const url = topicsLink.href;
    const response = await callApi(url, accessToken);
    const { items } = await response.json();

    return items;
  }

  async addTopicToCapability(clusterDefinition, topicDefinition) {
    const topicsLink = clusterDefinition?._links?.createTopic;
    if (!topicsLink) {
      console.log(
        "Warning! No topics link found on cluster definition:",
        clusterDefinition,
      );
      return null;
    }

    const accessToken = await getSelfServiceAccessToken();

    const url = topicsLink.href;
    const payload = {
      kafkaClusterId: clusterDefinition.id,
      name: topicDefinition.name,
      description: topicDefinition.description,
      partitions: topicDefinition.partitions,
      retention: topicDefinition.retention + "d",
    };

    const response = await callApi(url, accessToken, "POST", payload);
    this.responseHandler(response);

    if (!response.ok) {
      console.log(
        `Warning: failed adding topic to capability using url ${url} - response was ${response.status} ${response.statusText}`,
      );
      // NOTE: [jandr] handle problem details instead
      return;
    }

    return await response.json();
  }

  async getMessageContracts(topicDefinition) {
    const messageContractsLink = topicDefinition?._links?.messageContracts;

    const accessToken = await getSelfServiceAccessToken();

    const url = messageContractsLink.href;
    const response = await callApi(url, accessToken);
    this.responseHandler(response);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.items;
  }

  async getConsumers(topicDefinition) {
    const link = topicDefinition?._links?.consumers;

    if (!link) {
      return [];
    }

    // If we are _not_ allowed to get consumers, simply return nothing
    if (!(link.allow || []).includes("GET")) {
      return [];
    }

    const accessToken = await getSelfServiceAccessToken();

    const url = link.href;
    const response = await callApi(url, accessToken);
    this.responseHandler(response);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.items;
  }

  async addMessageContractToTopic(topicDefinition, messageContractDescriptor) {
    const messageContractsLink = topicDefinition?._links?.messageContracts;
    if (!messageContractsLink) {
      console.log(
        "Warning! No message contract link found on topic definition:",
        topicDefinition,
      );
      return null;
    }

    if (messageContractsLink.allow.indexOf("POST") === -1) {
      throw Error(
        "Error! You are not allowed to post new message contracts to this topic.",
      );
    }

    const accessToken = await getSelfServiceAccessToken();

    const url = messageContractsLink.href;
    const payload = {
      messageType: messageContractDescriptor.messageType,
      description: messageContractDescriptor.description,
      example: messageContractDescriptor.example,
      schema: messageContractDescriptor.schema,
    };

    const response = await callApi(url, accessToken, "POST", payload);
    this.responseHandler(response);

    if (!response.ok) {
      console.log(
        `Warning: failed adding message contract to topic on capability using url ${url} - response was ${response.status} ${response.statusText}`,
      );
      // NOTE: [jandr] handle problem details instead
      return;
    }

    return await response.json();
  }

  // async getCapabilityMembers(capabilityDefinition) {
  //     const membersLink = capabilityDefinition?._links?.members;
  //     if (!membersLink) {
  //         return [];
  //     }

  //     const accessToken = await getSelfServiceAccessToken();

  //     const url = membersLink.href;
  //     const response = await callApi(url, accessToken);
  //     this.responseHandler(response);

  //     if (!response.ok) {
  //         console.log(`Warning: failed getting all members from ${url} - response was ${response.status} ${response.statusText}`);
  //         return [];
  //     }

  //     const { items } = await response.json();

  //     return items || [];
  // }

  async fetchWithToken(url) {
    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(url, accessToken);
    this.responseHandler(response);

    if (!response.ok) {
      console.log("response was: ", response.status);
      return undefined;
    }
    return response;
  }

  async requestWithToken(url, method = "GET", payload = null) {
    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(url, accessToken, method, payload);
    this.responseHandler(response);

    if (!response.ok) {
      console.log("response was: ", response.status);
      return undefined;
    }
    return response;
  }

  async getMyCapabilitiesCosts() {
    const response = await this.fetchWithToken(
      composeUrl("metrics/my-capabilities-costs"),
    );
    if (!response) {
      return [];
    }
    let obj = await response.json();
    return obj.costs || [];
  }

  async getMyCapabilitiesResourceCounts() {
    const response = await this.fetchWithToken(
      composeUrl("metrics/my-capabilities-resources"),
    );
    if (!response) {
      return [];
    }

    let obj = await response.json();
    return obj.capabilityAwsResourceCounts || [];
  }

  async getCapabilityMembershipApplications(capabilityDefinition) {
    const membershipApplicationsLink =
      capabilityDefinition?._links?.membershipApplications;
    if (!membershipApplicationsLink) {
      console.log(
        "Warning! No memberships applications link found on capability definition:",
        capabilityDefinition,
      );
      return [];
    }
    const accessToken = await getSelfServiceAccessToken();

    // check for allow get access!

    const url = membershipApplicationsLink.href;
    const response = await callApi(url, accessToken);
    this.responseHandler(response);

    if (!response.ok) {
      return [];
    }

    const { items } = await response.json();
    return items || [];
  }

  async submitMembershipApplicationApproval(membershipApplicationDefinition) {
    const approvalsLink =
      membershipApplicationDefinition?.approvals?._links?.self;
    if (!approvalsLink) {
      throw Error(
        "Error! No approval link found on memberships application " +
          membershipApplicationDefinition.id,
      );
    }

    if (!(approvalsLink.allow || []).includes("POST")) {
      throw Error(
        "Error! Not authorized to submit approval for membership application " +
          membershipApplicationDefinition.id,
      );
    }

    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(approvalsLink.href, accessToken, "POST", {});
    this.responseHandler(response);

    if (!response.ok) {
      console.log("response was: ", await response.text());
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
      );
    }
  }

  async submitMembershipApplication(capabilityDefinition) {
    const capabilityId = capabilityDefinition?.details?.id;

    const link = capabilityDefinition?._links?.membershipApplications;
    if (!link) {
      throw Error(
        "Error! No membership applications link found on capability " +
          capabilityId,
      );
    }

    if (!(link.allow || []).includes("POST")) {
      throw Error(
        "Error! Not authorized to submit membership application for capability " +
          capabilityId,
      );
    }

    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(link.href, accessToken, "POST", {
      capabilityId: capabilityId,
    });

    this.responseHandler(response);

    if (!response.ok) {
      console.log("response was: ", await response.text());
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
      );
    }
  }

  async submitLeaveCapability(capabilityDefinition) {
    const capabilityId = capabilityDefinition?.details?.id;

    const link = capabilityDefinition?._links?.leaveCapability;
    if (!link) {
      throw Error(
        "Error! No leave capability link found on capability " + capabilityId,
      );
    }
    if (!(link.allow || []).includes("POST")) {
      throw Error("Error! Not possible to leave capability " + capabilityId);
    }

    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(link.href, accessToken, "POST", {});
    this.responseHandler(response);

    if (!response.ok) {
      console.log("response was: ", await response.text());
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
      );
    }
  }

  async getKafkaClusters() {
    const accessToken = await getSelfServiceAccessToken();

    const url = composeUrl("kafkaclusters");
    const response = await callApi(url, accessToken);
    this.responseHandler(response);
    const { items } = await response.json();

    return items || [];
  }

  async getCapabilityAwsAccount(capabilityDefinition) {
    const awsAccountLink = capabilityDefinition?._links?.awsAccount;
    if (!awsAccountLink) {
      console.log(
        "Warning! No AWS account link found on capability definition:",
        capabilityDefinition,
      );
      return null;
    }

    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(awsAccountLink.href, accessToken);
    this.responseHandler(response);
    if (!response.ok) {
      return null;
    }

    const awsAccount = await response.json();
    return awsAccount || null;
  }

  async requestAwsAccount(capabilityDefinition) {
    const capabilityId = capabilityDefinition?.details?.id;

    const link = capabilityDefinition?._links?.awsAccount;
    if (!link) {
      throw Error(
        "Error! No AWS account link found on capability " + capabilityId,
      );
    }

    if (!(link.allow || []).includes("POST")) {
      throw Error(
        "Error! Not authorized to request AWS account for capability " +
          capabilityId,
      );
    }

    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(link.href, accessToken, "POST");
    this.responseHandler(response);

    if (!response.ok) {
      console.log("response was: ", await response.text());
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
      );
    }
  }

  async getAccessToCluster(cluster) {
    const link = cluster._links?.access;
    if (!link) {
      throw Error("Error! No request cluster access link found");
    }

    if (!(link.allow || []).includes("GET")) {
      throw Error(
        "Error! Not authorized to get access to cluster " + cluster.id,
      );
    }

    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(link.href, accessToken, "GET");

    if (!response.ok) {
      console.log("response was: ", await response.text());
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
      );
    }

    return response.json();
  }

  async requestAccessToCluster(cluster) {
    const link = cluster._links?.requestAccess;
    if (!link) {
      throw Error("Error! No request cluster access link found");
    }

    if (!(link.allow || []).includes("POST")) {
      throw Error(
        "Error! Not authorized to request access to cluster " + cluster.id,
      );
    }

    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(link.href, accessToken, "POST");

    if (!response.ok) {
      console.log("response was: ", await response.text());
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
      );
    }
  }

  async submitDeleteCapability(capabilityDefinition) {
    const capabilityId = capabilityDefinition?.details?.id;

    const link = capabilityDefinition?._links?.requestCapabilityDeletion;
    if (!link) {
      throw Error(
        "Error! No delete capability link found on capability " + capabilityId,
      );
    }
    if (!(link.allow || []).includes("POST")) {
      throw Error("Error! Not possible to delete capability " + capabilityId);
    }

    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(link.href, accessToken, "POST", {});
    this.responseHandler(response);

    if (!response.ok) {
      console.log("response was: ", await response.text());
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
      );
    }
  }

  async submitCancelDeleteCapability(capabilityDefinition) {
    const capabilityId = capabilityDefinition?.details?.id;

    const link = capabilityDefinition?._links?.cancelCapabilityDeletionRequest;
    if (!link) {
      throw Error(
        "Error! No cancel delete request for capability link found on capability " +
          capabilityId,
      );
    }
    if (!(link.allow || []).includes("POST")) {
      throw Error(
        "Error! Not possible to cancel delete request for capability " +
          capabilityId,
      );
    }

    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(link.href, accessToken, "POST", {});
    this.responseHandler(response);

    if (!response.ok) {
      console.log("response was: ", await response.text());
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
      );
    }
  }

  async CheckCanBypassMembershipApproval(capabilityDefinition) {
    const link = capabilityDefinition?._links?.joinCapability;
    if (!link) {
      throw Error(
        "Error! No join link found for capability " +
          capabilityDefinition.capabilityId,
      );
    }
    if (link.allow.includes("POST")) {
      return true;
    }
    return false;
  }

  async BypassMembershipApproval(capabilitydefinition) {
    const link = capabilitydefinition?._links?.joinCapability;
    if (!link) {
      throw Error(
        "Error! No join link found for capability " +
          capabilitydefinition.capabilityId,
      );
    }

    if (!link.allow.includes("POST")) {
      throw Error(
        "Error! Not possible for  client to directly join capability " +
          capabilitydefinition.capabilityId,
      );
    }

    const response = await this.requestWithToken(link.href, "POST");

    if (!response.ok) {
      throw Error(
        `got error`,
      );
    }
  }
}

function composeUrl(...args) {
  let url = window.apiBaseUrl;
  (args || []).forEach((x) => {
    if (x[0] === "/") {
      url += x;
    } else {
      url += "/" + x;
    }
  });
  return url;
}

export async function getAccessToCluster(cluster) {
  const link = cluster._links?.access;
  if (!link) {
    throw Error("Error! No request cluster access link found");
  }

  if (!(link.allow || []).includes("GET")) {
    throw Error("Error! Not authorized to get access to cluster " + cluster.id);
  }

  const accessToken = await getSelfServiceAccessToken();
  const response = await callApi(link.href, accessToken, "GET");

  if (!response.ok) {
    console.log("response was: ", await response.text());
    throw Error(
      `Error! Response from server: (${response.status}) ${response.statusText}`,
    );
  }

  return response.json();
}

export async function requestAccessToCluster(cluster) {
  const link = cluster._links?.requestAccess;
  if (!link) {
    throw Error("Error! No request cluster access link found");
  }

  if (!(link.allow || []).includes("POST")) {
    throw Error(
      "Error! Not authorized to request access to cluster " + cluster.id,
    );
  }

  const accessToken = await getSelfServiceAccessToken();
  const response = await callApi(link.href, accessToken, "POST");

  if (!response.ok) {
    console.log("response was: ", await response.text());
    throw Error(
      `Error! Response from server: (${response.status}) ${response.statusText}`,
    );
  }
}
