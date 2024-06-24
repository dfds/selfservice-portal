import { callApi, getSelfServiceAccessToken } from "./AuthService";

export class SelfServiceApiClient {
  constructor(handleError, falseUserPermissions) {
    this.falseUserPermissions = falseUserPermissions;
  }

  logResponseErrorNotOk = (requestType, url, response) => {
    console.log(
      `Warning: failed ${requestType} using url ${url}, response was: ${response.status} ${response.statusText}`,
    );
  };
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

    const url = link.href;
    const payload = {
      name: personalInformationDescriptor.name,
      email: personalInformationDescriptor.email,
    };

    const response = await this.requestWithToken(url, "PUT", payload);

    if (!response.ok) {
      this.logResponseErrorNotOk("updating personal information", response);
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
    const response = await this.requestWithToken(link.href, "POST");

    if (!response.ok) {
      this.logResponseErrorNotOk(
        "registering portal visit",
        link.href,
        response,
      );
    }
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
    const response = await callApi(
      url,
      accessToken,
      "GET",
      null,
      this.falseUserPermissions,
    );
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
      retention: topicDefinition.retention,
    };

    const response = await callApi(
      url,
      accessToken,
      "POST",
      payload,
      this.falseUserPermissions,
    );

    if (!response.ok) {
      this.logResponseErrorNotOk("adding topic to capability", url, response);
      return;
    }

    return await response.json();
  }

  async getMessageContracts(topicDefinition) {
    const messageContractsLink = topicDefinition?._links?.messageContracts;

    const accessToken = await getSelfServiceAccessToken();

    const url = messageContractsLink.href;
    const response = await callApi(
      url,
      accessToken,
      "GET",
      null,
      this.falseUserPermissions,
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.items;
  }

  async validateMessageSchema(topicId, messageContract) {
    return await this.requestWithToken(
      composeUrl(`kafkatopics/${topicId}/messagecontracts-validate`),
      "POST",
      messageContract,
    );
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
    const response = await callApi(
      url,
      accessToken,
      "GET",
      null,
      this.falseUserPermissions,
    );

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

    const response = await callApi(
      url,
      accessToken,
      "POST",
      payload,
      this.falseUserPermissions,
    );

    if (!response.ok) {
      this.logResponseErrorNotOk(
        "adding message contract to topic on capability",
        url,
        response,
      );
      // NOTE: [jandr] handle problem details instead
      return;
    }

    return await response.json();
  }
  async retryAddMessageContractToTopic(messageContractDescriptor) {
    const link = messageContractDescriptor?._links?.retry;
    if (!link || link.allow.indexOf("POST") === -1) {
      throw new Error("User is not allowed to retry creating message contract");
    }

    const response = await this.requestWithToken(link.href, "POST");

    if (!response.ok) {
      throw new Error(
        `Failed retrying adding message contract to topic using url ${link.href} - response was ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async fetchWithToken(url) {
    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(
      url,
      accessToken,
      "GET",
      null,
      this.falseUserPermissions,
    );

    if (!response.ok) {
      console.log(`for url ${url} response was: ${response.status}`);
      return undefined;
    }
    return response;
  }

  async requestWithToken(url, method = "GET", payload = null) {
    const accessToken = await getSelfServiceAccessToken();
    const response = await callApi(
      url,
      accessToken,
      method,
      payload,
      this.falseUserPermissions,
    );

    if (!response.ok) {
      console.log(`for url ${url} response was: ${response.status}`);
      const errorDetails = await response.json();
      if (errorDetails.detail) {
        return errorDetails;
      } else {
        return undefined;
      }
    }
    return response;
  }

  async getMyCapabilitiesCosts() {
    const response = await this.requestWithToken(
      composeUrl("metrics/my-capabilities-costs"),
    );
    if (response.detail) {
      return [];
    }
    let obj = await response.json();
    return obj.costs || [];
  }

  async getMyCapabilitiesResourceCounts() {
    const response = await this.requestWithToken(
      composeUrl("metrics/my-capabilities-resources"),
    );
    if (response.detail) {
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
    const response = await callApi(
      url,
      accessToken,
      "GET",
      null,
      this.falseUserPermissions,
    );

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
    const response = await callApi(
      approvalsLink.href,
      accessToken,
      "POST",
      {},
      this.falseUserPermissions,
    );

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
    const response = await callApi(
      link.href,
      accessToken,
      "POST",
      {
        capabilityId: capabilityId,
      },
      this.falseUserPermissions,
    );

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
    const response = await callApi(
      link.href,
      accessToken,
      "POST",
      {},
      this.falseUserPermissions,
    );

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
    const response = await callApi(
      url,
      accessToken,
      "GET",
      null,
      this.falseUserPermissions,
    );
    const { items } = await response.json();

    return items || [];
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
    const response = await callApi(
      link.href,
      accessToken,
      "POST",
      null,
      this.falseUserPermissions,
    );

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
    const response = await callApi(
      link.href,
      accessToken,
      "GET",
      null,
      this.falseUserPermissions,
    );

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
    const response = await callApi(
      link.href,
      accessToken,
      "POST",
      null,
      this.falseUserPermissions,
    );

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
    const response = await callApi(
      link.href,
      accessToken,
      "POST",
      {},
      this.falseUserPermissions,
    );

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
    const response = await callApi(
      link.href,
      accessToken,
      "POST",
      {},
      this.falseUserPermissions,
    );

    if (!response.ok) {
      console.log("response was: ", await response.text());
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
      );
    }
  }

  async getCapabilityJsonMetadataSchema() {
    const response = await this.fetchWithToken(
      composeUrl("json-schema/capability"),
    );
    if (!response) {
      return [];
    }

    let obj = await response.json();
    return obj.schema.toString() || "";
  }

  checkCanbypassMembershipApproval(capabilityDefinition) {
    const link = capabilityDefinition?._links?.joinCapability;
    if (!link) {
      throw Error(
        "Error! No join link found for capability " +
          capabilityDefinition.capabilityId,
      );
    }
    if (!link.allow.includes("POST")) {
      throw Error(
        "Error! user not allowed to join capability " +
          capabilityDefinition.capabilityId +
          " directly",
      );
    }
    return link;
  }

  async bypassMembershipApproval(capabilityDefinition) {
    const link = this.checkCanbypassMembershipApproval(capabilityDefinition);
    const response = await this.requestWithToken(link.href, "POST");
    if (!response.ok) {
      console.log(
        `response was: ", ${await response.text()} for url ${link.href}`,
      );
      throw Error(
        `Error! Response from server: (${response.status}) ${response.statusText}`,
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
