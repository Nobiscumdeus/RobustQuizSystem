// cypress/integration/login.spec.js
describe('Login Test', () => {
    it('should log in successfully', () => {
      // Visit the login page
      cy.visit('/login');
  
      // Fill in the login form
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="password"]').type('password123');
  
      // Submit the form
      cy.get('button[type="submit"]').click();
  
      // Assert that the user is redirected to the dashboard
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome, testuser').should('be.visible');
    });
  });