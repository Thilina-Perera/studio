describe('Login', () => {
  it('TC-01: Valid user login with correct credentials', () => {
    // Navigate to the login page
    cy.visit('/');

    // Enter valid credentials
    cy.get('input[type="email"]').type('m@example.com');
    cy.get('input[type="password"]').type('123456');

    // Click the login button
    cy.get('button[type="submit"]').click();

    // Assert that the user is redirected to the dashboard
    cy.url().should('include', '/dashboard');

    // Optional: Assert that some dashboard-specific element is visible
    cy.contains('h1', 'Dashboard').should('be.visible');
  });
});
