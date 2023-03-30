import { callApi, getSelfServiceAccessToken } from "./AuthService";

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

export async function getCapabilities() {
    const accessToken = await getSelfServiceAccessToken();

    const url = composeUrl("capabilities");
    const response = await callApi(url, accessToken);

    const { items } = await response.json();

    return items || [];
}

export async function getCapabilityById(id) {
    const accessToken = await getSelfServiceAccessToken();

    const url = composeUrl("capabilities", id);
    const response = await callApi(url, accessToken);

    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}

export async function getAllTopics() {
    const accessToken = await getSelfServiceAccessToken();

    const url =  composeUrl("kafkatopics"); //window.apiBaseUrl + "/api/topics";
    const response = await callApi(url, accessToken);

    const { items, _embedded } = await response.json();
    console.log("embedded ", _embedded)
    return (items || []).map(topic => {
        const copy = {...topic};
        const found = (_embedded?.kafkaClusters?.items || []).find(cluster => cluster.id == topic.kafkaClusterId);
        copy.kafkaClusterName = found?.name || "";
        return copy;
    });
}

export async function getMyPortalProfile() {
    const accessToken = await getSelfServiceAccessToken();

    const url = composeUrl("me");
    const response = await callApi(url, accessToken);
    const myProfile = await response.json();

    const defaultValues = {
        capabilities: []
    };

    return {...defaultValues, ...myProfile};
}

export async function getCapabilityTopicsGroupedByCluster(capabilityDefinition) {
    const topicsLink = capabilityDefinition?._links?.topics;
    if (!topicsLink) {
        console.log("Warning! No topics link found on capability definition:", capabilityDefinition);
        return [];
    }

    const accessToken = await getSelfServiceAccessToken();

    const url = topicsLink.href;
    const response = await callApi(url, accessToken);
    const { items, _embedded } = await response.json();

    let clusters = _embedded?.kafkaClusters?.items || [];
    if (clusters.length === 0) {
        clusters = await getKafkaClusters();
    }

    clusters.forEach(cluster => {
        const publicTopics = items
            .filter(topic => topic.kafkaClusterId === cluster.id)
            .filter(topic => topic.name.startsWith("pub."));

        const privateTopics = items
            .filter(topic => topic.kafkaClusterId === cluster.id)
            .filter(topic => !topic.name.startsWith("pub."));


        publicTopics.sort((a,b) => a.name.localeCompare(b.name));
        privateTopics.sort((a,b) => a.name.localeCompare(b.name));

        cluster.topics = [...publicTopics, ...privateTopics];
    });

    return clusters;
}

export async function createCapability(capabilityDefinition){
    console.group("createCapability");

    const url = composeUrl("capabilities");

    const accessToken = await getSelfServiceAccessToken();

    const payload = {
        name: capabilityDefinition.name,
        description: capabilityDefinition.description,
    };

    const response = await callApi(url, accessToken, "POST", payload);
    if (!response.ok) {
        let exceptionMessage = "";
        if (response.status === 409){
            console.log(`Warning: failed adding capability using url ${url} for name ${capabilityDefinition.name} - response was ${response.status} ${response.statusText}`);
            exceptionMessage = await response.text().then((text) => { return text })
            throw new Error(`Capability already exists with that name: ${capabilityDefinition.name}`);
        }
        if (response.status === 400){
            throw new Error("Invalid capability name: "+exceptionMessage);
        }
    }

    const resVal = response;
    return resVal;
}

export async function addTopicToCapability(capabilityDefinition, clusterId, topicDefinition) {
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

    if (!response.ok) {
        console.log(`Warning: failed adding topic to capability using url ${url} - response was ${response.status} ${response.statusText}`);
        // NOTE: [jandr] handle problem details instead
        return;
    }

    return await response.json();
}

export async function getMessageContracts(topicDefinition) {
    const messageContractsLink = topicDefinition?._links?.messageContracts;

    const accessToken = await getSelfServiceAccessToken();

    const url = messageContractsLink.href;
    const response = await callApi(url, accessToken);

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    return data.items;
}

export async function addMessageContractToTopic(topicDefinition, messageContractDescriptor) {
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

    if (!response.ok) {
        console.log(`Warning: failed adding message contract to topic on capability using url ${url} - response was ${response.status} ${response.statusText}`);
        // NOTE: [jandr] handle problem details instead
        return;
    }

    return await response.json();
}

export async function getCapabilityMembers(capabilityDefinition) {
    const membersLink = capabilityDefinition?._links?.members;
    if (!membersLink) {
        return [];
    }

    const accessToken = await getSelfServiceAccessToken();


    const url = membersLink.href;
    const response = await callApi(url, accessToken);

    if (!response.ok) {
        console.log(`Warning: failed getting all members from ${url} - response was ${response.status} ${response.statusText}`);
        return [];
    }

    const { items } = await response.json();

    return items || [];
}

export async function getCapabilityMembershipApplications(capabilityDefinition){
    const membershipApplicationsLink = capabilityDefinition?._links?.membershipApplications;
    if (!membershipApplicationsLink) {
        console.log("Warning! No memberships applications link found on capability definition:", capabilityDefinition);
        return [];
    }
    const accessToken = await getSelfServiceAccessToken();

    // check for allow get access!

    const url = membershipApplicationsLink.href;
    const response = await callApi(url, accessToken);

    if (!response.ok) {
        console.log("response was: ", response.status);
        return [];
    }

    const items  = await response.json();
    return items.membershipApplications || [];
}

export async function getKafkaClusters() {
    const accessToken = await getSelfServiceAccessToken();

    const url = composeUrl("kafkaclusters");
    const response = await callApi(url, accessToken);
    const { items } = await response.json();

    return items || [];
}