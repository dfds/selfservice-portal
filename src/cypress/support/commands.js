// ------------------------------------------
// Log in and set localStorage with auth key
// ------------------------------------------
var jwt = require('jsonwebtoken');

const injectTokens = (tokenResponse) => {
  cy.task("log", JSON.stringify(tokenResponse.body));
  cy.task("log", tokenResponse.body.access_token);
  const environment = "login.windows.net";
  const idTokenClaims = jwt.decode(tokenResponse.body.access_token);
  const localAccountId = idTokenClaims.oid || idTokenClaims.sid;
  const clientId = Cypress.env("AZURE_CLIENT_ID");
  const realm = Cypress.env("AZURE_TENANT_ID");
  const homeAccountId = `${localAccountId}.${realm}`;
  const tokenId = `${homeAccountId}-${environment}-${realm}`;
  const token = {
    authorityType: "MSSTS",
    homeAccountId,
    environment,
    realm,
    idTokenClaims,
    localAccountId,
    username: idTokenClaims.preferred_username,
    name: idTokenClaims.name,
  };
  sessionStorage.setItem(tokenId, JSON.stringify(token));

  const accessTokenId = `${homeAccountId}-${environment}-accesstoken-${Cypress.env(
    "AZURE_CLIENT_ID",
  )}-${Cypress.env("AZURE_TENANT_ID")}---`;

  const now = Math.floor(Date.now() / 1000);
  const accessToken = {
    credentialType: "AccessToken",
    tokenType: "Bearer",
    homeAccountId,
    secret: tokenResponse.body.access_token,
    cachedAt: now.toString(),
    expiresOn: (now + tokenResponse.body.expires_in).toString(),
    extendedExpiresOn: (now + tokenResponse.body.ext_expires_in).toString(),
    environment,
    //target: tokenResponse.scope,
    realm,
    clientId,
  };
  sessionStorage.setItem(accessTokenId, JSON.stringify(accessToken));
};

Cypress.Commands.add("login", () => {
  cy.log("-- Login via Azure AD & Set Local Storage --");
  const options = {
    method: "POST",
    url:
      "https://login.microsoftonline.com" +
      `/${Cypress.env("AUTH_TENANT_ID")}` +
      `/oauth2/v2.0/token`,
    form: true,
    body: {
      client_id: Cypress.env("AUTH_CLIENT_ID"),
      client_secret: Cypress.env("AUTH_CLIENT_SECRET"),
      scope: "api://3007f683-c3c2-4bf9-b6bd-2af03fb94f6d/.default",
      grant_type: "client_credentials",
    },
  };

  cy.request(options).then((response) => {
    // here I am appending an extra type/value
    // to accomodate our app's localStorage requirements
    injectTokens(response);
  });
});
