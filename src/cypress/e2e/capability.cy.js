describe('Capability page', () => {
  beforeEach(() => {
    cy.login(); // login to azure 
    cy.visit('/');
  });
  
  it('Loads correctly', () => {
    cy.contains('Congratulations')
  })
});

