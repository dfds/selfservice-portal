import { InteractionType, PublicClientApplication } from "@azure/msal-browser";

const graphScopes = ["user.read"];
const selfServiceApiScopes = [
  "api://3007f683-c3c2-4bf9-b6bd-2af03fb94f6d/access_as_user",
];

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: "3007f683-c3c2-4bf9-b6bd-2af03fb94f6d",
    authority:
      "https://login.microsoftonline.com/73a99466-ad05-4221-9f90-e7142aa2f6c1",
    redirectUri: process.env.REACT_APP_AUTH_REDIRECT_URL,
  },
  cache: {
    cacheLocation: "localStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
});

await msalInstance.initialize();

console.log("initialise msalInstance");

export { msalInstance, graphScopes, selfServiceApiScopes };
