export const msalConfig = {
    auth: {

        clientId: "3007f683-c3c2-4bf9-b6bd-2af03fb94f6d",
        authority: "https://login.microsoftonline.com/73a99466-ad05-4221-9f90-e7142aa2f6c1",
        redirectUri: "http://localhost:3000"
    },
    cache: {
        cacheLocation: "localStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
    scopes: ["User.Read"]
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};