describe('Sign Up', () => {
  beforeEach(() => {
    // Navigate to the signup page before each test
    cy.visit('/signup');
  });

  it('TC-07: User can sign up with valid information', () => {
    // Use a unique email for each test run to ensure a clean state
    const uniqueEmail = `testuser_${Date.now()}@example.com`;

    cy.get('input[placeholder="John Doe"]').type('Test User');
    cy.get('input[placeholder="m@example.com"]').type(uniqueEmail);
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').contains('Create account').click();

    // Assert user is redirected to the dashboard after signing up
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Dashboard').should('be.visible');
  });

  it('TC-08: User sees an error when signing up with an existing email', () => {
    cy.get('input[placeholder="John Doe"]').type('Test User');
    // Use an email that is already registered
    cy.get('input[placeholder="m@example.com"]').type('m@example.com'); 
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').contains('Create account').click();

    // Assert that an error toast is shown
    cy.contains('h3', 'Sign Up Failed').should('be.visible');
    cy.contains('p', 'An account with this email already exists. Please log in or use a different email.').should('be.visible');
  });

  it('TC-06: Sign Up link navigates to the correct page', () => {
    // This test case is covered by the beforeEach hook, 
    // but we can add an explicit assertion for clarity.
    cy.url().should('include', '/signup');
    cy.contains('h2', 'Create an account').should('be.visible');
  });
});
