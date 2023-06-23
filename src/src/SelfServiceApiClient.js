import { useContext } from "react";
import { callApi, getSelfServiceAccessToken } from "./AuthService";

export class SelfServiceApiClient {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
    }

    async getCapabilities(){
        const accessToken = await getSelfServiceAccessToken();

        const url = composeUrl("capabilities"); 
        const response = await callApi(url, accessToken);
        this.responseHandler(response);
        
    
        const { items } = await response.json();
    
        return items || [];
    }

    responseHandler(response, defaultValue){
        this.errorHandler(response);
    }

    async getCapabilityById(id) {
        const accessToken = await getSelfServiceAccessToken();
    
        const url = composeUrl("capabilities", id);
        const response = await callApi(url, accessToken);
        this.responseHandler(response);
    
        if (response.ok) {
            return await response.json();
        } else {
            return null;
        }
    }
    
    async getAllTopics() {
        const accessToken = await getSelfServiceAccessToken();
    
        const url =  composeUrl("kafkatopics"); 
        const response = await callApi(url, accessToken);
        this.responseHandler(response);
    
        const { items, _embedded } = await response.json();
        return (items || []).map(topic => {
            const copy = {...topic};
            const found = (_embedded?.kafkaClusters?.items || []).find(cluster => cluster.id == topic.kafkaClusterId);
            copy.kafkaClusterName = found?.name || "";
            return copy;
        });
    }
    
    async getMyPortalProfile() {
        const accessToken = await getSelfServiceAccessToken();
    
        const url = composeUrl("me");
        const response = await callApi(url, accessToken);
        this.responseHandler(response);
        const myProfile = await response.json();
    
        const defaultValues = {
            capabilities: [],
            stats: [],
        };
    
        return {...defaultValues, ...myProfile};
    }
    
    async updateMyPersonalInfirmation(myProfileDefinition, personalInformationDescriptor) {
        const link = myProfileDefinition?._links?.personalInformation;
        if (!link) {
            throw Error("Error! No personal information link found on my profile definition: " + JSON.stringify(myProfileDefinition, null, 2));
        }
    
        if (!(link.allow || []).includes("PUT")) {
            throw Error("Error! You are not allowed to update your personal information. Options was " + JSON.stringify(link.allow, null, 2));
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
            console.log(`Warning: failed updating personal information using url ${url} - response was ${response.status} ${response.statusText}`);
        }
    }
    
    async registerMyVisit(myProfileDefinition) {
        const link = myProfileDefinition?._links?.portalVisits;
        if (!link) {
            throw Error("Error! No portal visits link found on my profile definition: " + JSON.stringify(myProfileDefinition, null, 2));
        }
    
        if (!(link.allow || []).includes("POST")) {
            throw Error("Error! You are not allowed to register your portal visit. Options was " + JSON.stringify(link.allow, null, 2));
        }
    
        const accessToken = await getSelfServiceAccessToken();
    
        const url = link.href;
        const payload = { };
    
        const response = await callApi(url, accessToken, "POST", payload);
    
        if (!response.ok) {
            console.log(`Warning: failed registering portal visit using url ${url} - response was ${response.status} ${response.statusText}`);
        }
    }
    
    async getCapabilityTopicsGroupedByCluster(capabilityDefinition) {
        const topicsLink = capabilityDefinition?._links?.topics;
        if (!topicsLink) {
            console.log("Warning! No topics link found on capability definition:", capabilityDefinition);
            return [];
        }
    
        const accessToken = await getSelfServiceAccessToken();
    
        const url = topicsLink.href;
        const response = await callApi(url, accessToken);
        this.responseHandler(response);
        const { items } = await response.json();
    
        return items;
    }
    
    async createCapability(capabilityDefinition){
        const url = composeUrl("capabilities");
        const accessToken = await getSelfServiceAccessToken();
    
        const payload = {
            name: capabilityDefinition.name,
            description: capabilityDefinition.description,
        };
    
        console.log("sending: ", payload);
        const response = await callApi(url, accessToken, "POST", payload);
        this.responseHandler(response);
    
        if (response.ok) {
          const newCap = await response.json();
          console.log("new cap: ", newCap);
          
          return newCap;
        }
    
        if (response.status === 409) {
            console.log(`Warning: failed adding capability using url ${url} for name ${capabilityDefinition.name} - response was ${response.status} ${response.statusText}`);
            throw new Error(`Capability already exists with that name: ${capabilityDefinition.name}`);
        }
    
        if (response.status === 400) {
            throw new Error("Invalid capability definition: " + JSON.stringify(capabilityDefinition, null, 2));
        }
    }
    
    async addTopicToCapability(capabilityDefinition, clusterId, topicDefinition) {
        const topicsLink = capabilityDefinition?._links?.topics;
        if (!topicsLink) {
            console.log("Warning! No topics link found on capability definition:", capabilityDefinition);
            return null;
        }
    
        const accessToken = await getSelfServiceAccessToken();
    
        const url = topicsLink.href;
        const payload = {
            kafkaClusterId: clusterId,
            name: topicDefinition.name,
            description: topicDefinition.description,
            partitions: topicDefinition.partitions,
            retention: topicDefinition.retention + "d",
        };
    
        const response = await callApi(url, accessToken, "POST", payload);
        this.responseHandler(response);
    
        if (!response.ok) {
            console.log(`Warning: failed adding topic to capability using url ${url} - response was ${response.status} ${response.statusText}`);
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
    
    async addMessageContractToTopic(topicDefinition, messageContractDescriptor) {
        const messageContractsLink = topicDefinition?._links?.messageContracts;
        if (!messageContractsLink) {
            console.log("Warning! No message contract link found on topic definition:", topicDefinition);
            return null;
        }
    
        if (messageContractsLink.allow.indexOf("POST") === -1) {
            throw Error("Error! You are not allowed to post new message contracts to this topic.");
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
            console.log(`Warning: failed adding message contract to topic on capability using url ${url} - response was ${response.status} ${response.statusText}`);
            // NOTE: [jandr] handle problem details instead
            return;
        }
    
        return await response.json();
    }
    
    async updateTopic(topicDefinition, topicDescriptor) {
      const link = topicDefinition?._links?.updateDescription;
      if (!link) {
          throw Error("Error! No update topic description link found on topic definition: " + JSON.stringify(topicDefinition, null, 2));
      }
    
      const accessToken = await getSelfServiceAccessToken();
    
      const url = link.href;
      const method = link.method;
      const payload = {
        ...topicDescriptor
      };
    
      const response = await callApi(url, accessToken, method, payload);
      this.responseHandler(response);
    
      if (!response.ok) {
          console.log(`Warning: failed updating topic using request [${method}] ${url} - response was ${response.status} ${response.statusText}`);
          throw Error("Faild updating topic!");
      }
    }
    
    async deleteTopic(topicDefinition) {
      const link = topicDefinition?._links?.self;
      if (!link) {
          throw Error("Error! No topic self link found on topic definition: " + JSON.stringify(topicDefinition, null, 2));
      }
    
      if (!(link.allow || []).includes("DELETE")) {
        throw Error("Error! You are not allowed to delete the topic. Options was " + JSON.stringify(link.allow, null, 2));
      }
    
      const accessToken = await getSelfServiceAccessToken();
    
      const url = link.href;
      const method = "DELETE";
    
      const response = await callApi(url, accessToken, method);
      this.responseHandler(response);
    
      if (!response.ok) {
          console.log(`Warning: failed deleting topic using request [${method}] ${url} - response was ${response.status} ${response.statusText}`);
          throw Error("Faild updating topic!");
      }
    }
    
    async getCapabilityMembers(capabilityDefinition) {
        const membersLink = capabilityDefinition?._links?.members;
        if (!membersLink) {
            return [];
        }
    
        const accessToken = await getSelfServiceAccessToken();
    
    
        const url = membersLink.href;
        const response = await callApi(url, accessToken);
        this.responseHandler(response);
    
        if (!response.ok) {
            console.log(`Warning: failed getting all members from ${url} - response was ${response.status} ${response.statusText}`);
            return [];
        }
    
        const { items } = await response.json();
    
        return items || [];
    }
    
    async getCapabilityMembershipApplications(capabilityDefinition){
        const membershipApplicationsLink = capabilityDefinition?._links?.membershipApplications;
        if (!membershipApplicationsLink) {
            console.log("Warning! No memberships applications link found on capability definition:", capabilityDefinition);
            return [];
        }
        const accessToken = await getSelfServiceAccessToken();
    
        // check for allow get access!
    
        const url = membershipApplicationsLink.href;
        const response = await callApi(url, accessToken);
        this.responseHandler(response);
    
        if (!response.ok) {
            console.log("response was: ", response.status);
            return [];
        }
    
        const { items }  = await response.json();
        return items || [];
    }
    
    async submitMembershipApplicationApproval(membershipApplicationDefinition) {
        const approvalsLink = membershipApplicationDefinition?.approvals?._links?.self;
        if (!approvalsLink) {
            throw Error("Error! No approval link found on memberships application " + membershipApplicationDefinition.id);
        }
    
        if (!(approvalsLink.allow || []).includes("POST")) {
            throw Error("Error! Not authorized to submit approval for membership application " + membershipApplicationDefinition.id);
        }
    
        const accessToken = await getSelfServiceAccessToken();
        const response = await callApi(approvalsLink.href, accessToken, "POST", {});
        this.responseHandler(response);
    
        if (!response.ok) {
            console.log("response was: ", await response.text());
            throw Error(`Error! Response from server: (${response.status}) ${response.statusText}`);
        }
    }
    
    async submitMembershipApplication(capabilityDefinition) {
        const capabilityId = capabilityDefinition?.details?.id;
    
        const link = capabilityDefinition?._links?.membershipApplications;
        if (!link) {
            throw Error("Error! No membership applications link found on capability " + capabilityId);
        }
    
        if (!(link.allow || []).includes("POST")) {
            throw Error("Error! Not authorized to submit membership application for capability " + capabilityId);
        }
    
        const accessToken = await getSelfServiceAccessToken();
        const response = await callApi(link.href, accessToken, "POST", {
            capabilityId: capabilityId
        });

        this.responseHandler(response);
    
        if (!response.ok) {
            console.log("response was: ", await response.text());
            throw Error(`Error! Response from server: (${response.status}) ${response.statusText}`);
        }
    }
    
    async submitLeaveCapability(capabilityDefinition) {
        const capabilityId = capabilityDefinition?.details?.id;
    
        const link = capabilityDefinition?._links?.leaveCapability;
        if (!link) {
            throw Error("Error! No leave capability link found on capability " + capabilityId);
        }
        if (!(link.allow || []).includes("POST")) {
            throw Error("Error! Not possible to leave capability " + capabilityId);
        }
    
        const accessToken = await getSelfServiceAccessToken();
        const response = await callApi(link.href, accessToken, "POST", {});
        this.responseHandler(response);
    
        if (!response.ok) {
            console.log("response was: ", await response.text());
            throw Error(`Error! Response from server: (${response.status}) ${response.statusText}`);
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
            console.log("Warning! No AWS account link found on capability definition:", capabilityDefinition);
            return null;
        }
    
        const accessToken = await getSelfServiceAccessToken();
        const response = await callApi(awsAccountLink.href, accessToken);
        this.responseHandler(response);
        if( !response.ok ) {
            return null;
        }
    
        const awsAccount = await response.json();
        return awsAccount || null;
    }
    
    async requestAwsAccount(capabilityDefinition) {
        const capabilityId = capabilityDefinition?.details?.id;
    
        const link = capabilityDefinition?._links?.awsAccount;
        if (!link) {
            throw Error("Error! No AWS account link found on capability " + capabilityId);
        }
    
        if (!(link.allow || []).includes("POST")) {
            throw Error("Error! Not authorized to request AWS account for capability " + capabilityId);
        }
    
        const accessToken = await getSelfServiceAccessToken();
        const response = await callApi(link.href, accessToken, "POST");
        this.responseHandler(response);
    
        if (!response.ok) {
            console.log("response was: ", await response.text());
            throw Error(`Error! Response from server: (${response.status}) ${response.statusText}`);
        }
    }
    
    async getTopVisitors(myProfileDefinition) {
        const link = myProfileDefinition?._links?.topVisitors;
        if (!link) {
            throw Error("Error! No top visitors link found on my profile definition: " + JSON.stringify(myProfileDefinition, null, 2));
        }
    
        if (!(link.allow || []).includes("GET")) {
            throw Error("Error! You are not allowed to get top visitors. Options was " + JSON.stringify(link.allow, null, 2));
        }
    
        const accessToken = await getSelfServiceAccessToken();
    
        const url = link.href;
        const response = await callApi(url, accessToken);
        this.responseHandler(response);
    
        if (!response.ok) {
            console.log(`Warning: failed getting top visitors using url ${url} - response was ${response.status} ${response.statusText}`);
            return [];
        }
    
        const { items } = await response.json();
        return items || [];
    }
}

function composeUrl(...args) {
    let url = window.apiBaseUrl;
    (args || []).forEach(x => {
        if (x[0] === '/') {
            url += x;
        } else {
            url += '/' + x;
        }
    });
    return url;
}




