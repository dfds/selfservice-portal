describe('Capability page', () => {
  it('Loads correctly', () => {
    cy.visit('http://localhost:8000')

    cy.contains('Congratulations')
  })
});

