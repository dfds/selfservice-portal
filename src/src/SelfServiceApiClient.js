export async function getCapabilities() {
    const url = window.apiBaseUrl + "/api/capabilities";

    const response = await fetch(url, {mode: "cors"});
    const items = await response.json();

    return items || [];
}