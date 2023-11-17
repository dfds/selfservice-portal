const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    env: {
      // Override through 'cypress.env.json'
      AUTH_TENANT_ID: 'what-a-tenant',
      AUTH_CLIENT_ID: 'such-client-id',
      AUTH_CLIENT_SECRET: 'shh-shh-shhh',
      AUTH_USERNAME: 'hi-i-am-me',
      AUTH_PASSWORD: 'hush-now',
    },
  },
})
