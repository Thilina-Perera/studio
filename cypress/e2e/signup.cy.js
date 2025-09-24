
describe('Sign Up', () => {
  beforeEach(() => {
    // Clear the Firestore emulator before each test
    cy.task('clearFirestore');
    // Navigate to the signup page
    cy.visit('/signup');
  });

  it('TC-07: User can sign up with valid information', () => {
    cy.get('input[placeholder="John Doe"]').type('Test User');
    cy.get('input[placeholder="m@example.com"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').contains('Create account').click();

    // Assert user is redirected to the dashboard after signing up
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Dashboard').should('be.visible');
  });

  it('TC-08: User sees an error when signing up with an existing email', () => {
    // First, sign up a user to ensure the email exists
    cy.get('input[placeholder="John Doe"]').type('Test User');
    cy.get('input[placeholder="m@example.com"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.url().should('include', '/dashboard');

    // Now, go back to signup and try to use the same email
    cy.visit('/signup');
    cy.get('input[placeholder="John Doe"]').type('Another User');
    cy.get('input[placeholder="m@example.com"]').type('test@example.com');
    cy.get('input[type="password"]').type('password456');
    cy.get('button[type="submit"]').contains('Create account').click();

    // Assert that an error toast is shown
    cy.contains('h3', 'Sign Up Failed').should('be.visible');
    cy.contains('p', 'An account with this email already exists. Please log in or use a different email.').should('be.visible');
  });

  it('TC-06: Sign Up link navigates to the correct page', () => {
    cy.url().should('include', '/signup');
    cy.contains('h2', 'Create an account').should('be.visible');
  });
});
