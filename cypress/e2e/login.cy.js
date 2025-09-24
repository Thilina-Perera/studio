
describe('Login', () => {
  const userEmail = 'test@example.com';
  const userPassword = 'password123';

  beforeEach(() => {
    // Clear the Firestore emulator and create a user for login tests
    cy.task('clearFirestore');
    cy.visit('/signup');
    cy.get('input[placeholder="John Doe"]').type('Test User');
    cy.get('input[placeholder="m@example.com"]').type(userEmail);
    cy.get('input[type="password"]').type(userPassword);
    cy.get('button[type="submit"]').contains('Create account').click();
    cy.url().should('include', '/dashboard');

    // "Log out" by clearing cookies and visit the login page
    cy.clearCookies();
    cy.visit('/');
  });

  it('TC-01: Valid user login with correct credentials', () => {
    cy.get('input[placeholder="m@example.com"]').type(userEmail);
    cy.get('input[type="password"]').type(userPassword);
    cy.get('button[type="submit"]').click();

    // Assert that the user is redirected to the dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Dashboard').should('be.visible');
  });

  it('TC-02: User login with invalid credentials', () => {
    cy.get('input[placeholder="m@example.com"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Assert that the toast error message is shown
    cy.contains('h3', 'Login Failed').should('be.visible');
    cy.contains('p', 'Invalid email or password. Please try again.').should('be.visible');
  });

  it('TC-03: User login with empty credentials', () => {
    cy.get('button[type="submit"]').click();

    // Assert that validation messages appear for both fields
    cy.get('.text-destructive').should('have.length', 2);
    cy.contains('.text-destructive', 'Invalid email address.').should('be.visible');
    cy.contains('.text-destructive', 'Password must be at least 6 characters.').should('be.visible');
  });
});
