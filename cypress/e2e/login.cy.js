describe('Login Tests', () => {
    it('Valid login with correct credentials', () => {
      cy.visit('/login');
      cy.get('input[name="username"]').type('validUser');
      cy.get('input[name="password"]').type('validPass');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  
    it('Invalid login with wrong password', () => {
      cy.visit('/login');
      cy.get('input[name="username"]').type('validUser');
      cy.get('input[name="password"]').type('wrongPass');
      cy.get('button[type="submit"]').click();
      cy.contains('Invalid username or password');
    });
  });
  