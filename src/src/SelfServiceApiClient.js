import { callApi, getSelfServiceAccessToken } from "./AuthService";

export async function getCapabilities() {
    const accessToken = await getSelfServiceAccessToken();
 
    const url = window.apiBaseUrl + "/api/capabilities";
    const response = await callApi(url, accessToken);
 
    const { items } = await response.json();

    return items || [];
}

export async function getCapabilityById(id) {
    const accessToken = await getSelfServiceAccessToken();
 
    const url = window.apiBaseUrl + "/api/capabilities/" + id;
    const response = await callApi(url, accessToken);
 
    if (response.ok) {
        return await response.json();
    } else {
        return null;
    }
}

export async function getAllTopics() {
    const accessToken = await getSelfServiceAccessToken();
 
    const url = window.apiBaseUrl + "/topics";
    const response = await callApi(url, accessToken);
 
    const { items } = await response.json();

    return items || [];
}

export async function getMyPortalProfile() {
    const accessToken = await getSelfServiceAccessToken();
 
    const url = window.apiBaseUrl + "/api/me";
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
 
    const url = composeUrl(topicsLink.href);
    const response = await callApi(url, accessToken);
    const { items, _embedded } = await response.json();

    let clusters = _embedded?.kafkaClusters?.items || [];
    if (clusters.length === 0) {
        clusters = await getKafkaClusters();
    }

    clusters.forEach(cluster => {
        const publicTopics = items
            .filter(topic => topic.kafkaClusterId == cluster.id)
            .filter(topic => topic.name.startsWith("pub."));
            
        const privateTopics = items
            .filter(topic => topic.kafkaClusterId == cluster.id)
            .filter(topic => !topic.name.startsWith("pub."));


        publicTopics.sort((a,b) => a.name.localeCompare(b.name));
        privateTopics.sort((a,b) => a.name.localeCompare(b.name));

        cluster.topics = [...publicTopics, ...privateTopics];
    });

    return clusters;
}


function composeUrl(...args) {
    let url = window.apiBaseUrl;
    (args || []).forEach(x => {
        if (x[0] == '/') {
            url += x;
        } else {
            url += '/' + x;
        }
    });
    return url;
}

export async function getCapabilityMembers(capabilityDefinition) {
    const membersLink = capabilityDefinition?._links?.members;
    if (!membersLink) {
        return [];
    }

    const accessToken = await getSelfServiceAccessToken();
 

    const url = composeUrl(membersLink.href);
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
 
    const url = `${window.apiBaseUrl}/api/kafkaclusters`;
    const response = await callApi(url, accessToken);
    const { items } = await response.json();

    return items || [];
}