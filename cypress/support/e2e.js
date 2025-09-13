// cypress/support/e2e.js

// Register Mochawesome reporter hooks
import 'cypress-mochawesome-reporter/register.js';

// Load custom Cypress commands (cy.stubCreateUser, cy.stubError, etc.)
import './commands.js';
