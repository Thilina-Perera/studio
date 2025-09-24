
describe('Smoke Test', () => {
  it('should load the home page successfully', () => {
    // Visit the base URL defined in cypress.config.ts
    cy.visit('/');
    // Check for a piece of text that should always be on the login page
    cy.contains('Log in to your account').should('be.visible');
  });

  it('should be true', () => {
    // A test that is guaranteed to pass
    expect(true).to.equal(true);
  });
});
