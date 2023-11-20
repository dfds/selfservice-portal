// ------------------------------------------
// Log in and set localStorage with auth key
// ------------------------------------------

Cypress.Commands.add('login', () => {
  cy.log('-- Login via Azure AD & Set Local Storage --');
  const options = {
    method: 'POST',
    url: 'https://login.microsoftonline.com' + 
      `/${Cypress.env('AUTH_TENANT_ID')}` + 
      `/oauth2/v2.0/token`,
    form: true,
    body: {
      client_id: Cypress.env('AUTH_CLIENT_ID'),
      client_secret: Cypress.env('AUTH_CLIENT_SECRET'),
      scope: 'api://3007f683-c3c2-4bf9-b6bd-2af03fb94f6d/.default',
      grant_type: 'client_credentials',
    },
  };

  cy.request(options).then((response) => {
    // here I am appending an extra type/value
	// to accomodate our app's localStorage requirements
    response.body.type='azure';
    const authValue = JSON.stringify(response.body);
    window.localStorage.setItem('auth', authValue);
  })
});
