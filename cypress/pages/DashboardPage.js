// cypress/pages/DashboardPage.js
import { Header } from './Header.js';

export class DashboardPage {
  constructor() {
    this.header = new Header();
  }

  checkWelcomeMessage() {
    cy.contains('Welcome').should('be.visible');
  }

  // optional: verify a success toast after registration
  checkSuccessToast() {
    cy.get('[data-cy="toast"]').should('contain.text', 'Account created');
  }
}
