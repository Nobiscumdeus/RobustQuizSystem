describe('Home Page and Navigation Tests', () => {
  
  it('should visit the home page and see the QUIZMASTER title', () => {
    cy.visit('/'); // Should visit the home page
    cy.contains('Elevate Your Knowledge with Interactive Quizzes').should('be.visible'); // Ensure that 'QUIZMASTER' is visible on the home page
    cy.url().should('include', '/'); // Ensure the URL is correct
  });

  it('should visit the About page and see the About content', () => {
    cy.visit('/about'); // Visit the About page
    cy.contains('About Us').should('be.visible'); // Assuming the About page contains 'About Us' text
    cy.url().should('include', '/about'); // Check URL
  });

  it('should visit the Contact page and see the Contact form', () => {
    cy.visit('/contact'); // Visit the Contact page
    cy.contains('Get in Touch').should('be.visible'); // Ensure that Contact page content is visible
    cy.url().should('include', '/contact'); // URL validation
  });

  it('should visit the Register page and see the Registration form', () => {
    cy.visit('/register'); // Visit the Register page
    cy.contains('Register').should('be.visible'); // Check for registration page content
    cy.url().should('include', '/register'); // Ensure URL is correct
  });

  it('should visit the Login page and see the Login form', () => {
    cy.visit('/login'); // Visit the Login page
    cy.contains('Login').should('be.visible'); // Ensure Login form is visible
    cy.url().should('include', '/login'); // URL validation
  });

  it('should visit the Manage page and see the Management title', () => {
    cy.visit('/manage'); // Visit the Manage page
    cy.contains('Management').should('be.visible'); // Check the page for the title 'Management'
    cy.url().should('include', '/manage'); // URL check
  });



  it('should visit the Admin Panel page', () => {
    cy.visit('/admin_panel'); // Visit Admin Panel page
    cy.contains('Admin Panel').should('be.visible'); // Check for text or content unique to Admin Panel
    cy.url().should('include', '/admin_panel'); // URL validation
  });

  it('should visit the Create Course page and check the title', () => {
    cy.visit('/course'); // Visit the Create Course page
    cy.contains('Create Course').should('be.visible'); // Ensure the Create Course page title is visible
    cy.url().should('include', '/course'); // URL validation
  });

  // Example of testing form elements on the Register page
  it('should fill out the registration form and submit it', () => {
    cy.visit('/register'); // Visit registration page

    cy.get('input[name="email"]').type('testuser@example.com'); // Type into the email input
    cy.get('input[name="password"]').type('password123'); // Type into the password input
    cy.get('form').submit(); // Submit the form

   
  });

  // Test if a specific page (e.g., Quiz Demo) has its content
  it('should visit the Quiz Demo page and see the content', () => {
    cy.visit('/quiz_demo');
    cy.contains('Exam').should('be.visible'); // Check for quiz demo content
    cy.url().should('include', '/quiz_demo'); // URL check
  });

});
