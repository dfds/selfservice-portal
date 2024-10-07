import store from "@/state/local/store";
import { PublicClientApplication } from "@azure/msal-browser";
import { jwtDecode } from "jwt-decode";

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

class TokenCache {
  readonly lsKeyPrefix = "ssu-tokencache";

  hasTokenExpired(key: string): boolean {
    let token = localStorage.getItem(`${this.lsKeyPrefix}-${key}`);
    if (token != null) {
      return isTokenExpired(token);
    }
    return true;
  }

  has(key: string): boolean {
    return localStorage.getItem(`${this.lsKeyPrefix}-${key}`) != null;
  }

  get(key: string): string {
    return localStorage.getItem(`${this.lsKeyPrefix}-${key}`);
  }

  put(key: string, token: string) {
    return localStorage.setItem(`${this.lsKeyPrefix}-${key}`, token);
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = jwtDecode(token);
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime - 60 > decoded.exp; // buffer to ensure it doesn't expire 1 second after the check
}

const tokenCache = new TokenCache();

function allTokensAvailable(): boolean {
  let result = true;
  if (tokenCache.hasTokenExpired("msgraph")) {
    result = false;
  }
  if (tokenCache.hasTokenExpired("selfservice-api")) {
    result = false;
  }
  return result;
}

export {
  msalInstance,
  graphScopes,
  selfServiceApiScopes,
  tokenCache,
  allTokensAvailable,
};
