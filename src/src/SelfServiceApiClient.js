import { callApi, getSelfServiceAccessToken } from "./AuthService";

export async function getCapabilities() {
    const accessToken = await getSelfServiceAccessToken();
 
    const url = window.apiBaseUrl + "/capabilities";
    const response = await callApi(url, accessToken);
 
    const { items } = await response.json();

    return items || [];
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
 
    const url = window.apiBaseUrl + "/me";
    const response = await callApi(url, accessToken);
    const myProfile = await response.json();

    const defaultValues = {
        myCapabilities: []
    };

    return {...defaultValues, ...myProfile};
}