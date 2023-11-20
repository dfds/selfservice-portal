describe("Capability page", () => {
  beforeEach(() => {
    console.log("LOGGING IN...");
    cy.login(); // login to azure
    console.log("GREAT SUCCESS");
    cy.visit("/");
  });

  it("Loads correctly", () => {
    cy.contains("Congratulations");
  });
});
