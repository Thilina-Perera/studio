describe('Password Reset', () => {
  beforeEach(() => {
    cy.visit('/'); // Start at the login page
  });

  it('TC-04: Forgot Password link navigates to the correct page', () => {
    cy.contains('a', 'Forgot password').click();
    cy.url().should('include', '/password-reset');
    cy.contains('h2', 'Reset your password').should('be.visible');
  });

  it('TC-05: User can request a password reset with a valid email', () => {
    cy.visit('/password-reset');
    cy.get('input[placeholder="m@example.com"]').type('registered@example.com');
    cy.get('button[type="submit"]').click();

    // Assert that a confirmation message is shown
    cy.contains('p', 'A password reset link has been sent to your email.').should('be.visible');
  });
});
