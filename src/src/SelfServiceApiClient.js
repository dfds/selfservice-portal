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

    const { items } = await response.json();

    return items || [];
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
    console.group("addTopicToCapability");

    const topicsLink = capabilityDefinition?._links?.topics;
    if (!topicsLink) {
        console.log("Warning! No topics link found on capability definition:", capabilityDefinition);
        return [];
    }

    const accessToken = await getSelfServiceAccessToken();

    const url = topicsLink.href;
    const payload = {
        name: topicDefinition.name,
        description: topicDefinition.description,
        partitions: topicDefinition.partitions,
        retention: topicDefinition.retention,
        kafkaClusterId: clusterId,
    };

    console.log("sending payload: ", payload);
    const response = await callApi(url, accessToken, "POST", payload);

    if (!response.ok) {
        console.log(`Warning: failed adding topic to capability using url ${url} - response was ${response.status} ${response.statusText}`);
        return;
    }

    const resVal = response;
    console.log("recieved new topic: ", resVal.json());


    console.groupEnd();

    return resVal;
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

export async function getKafkaClusters() {
    const accessToken = await getSelfServiceAccessToken();

    const url = composeUrl("kafkaclusters");
    const response = await callApi(url, accessToken);
    const { items } = await response.json();

    return items || [];
}