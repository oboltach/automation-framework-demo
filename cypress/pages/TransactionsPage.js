// cypress/pages/TransactionsPage.js
export class TransactionsPage {
  visit() {
    cy.visit('/transactions'); // change if your route differs
  }

  typeAmount(amount) {
    cy.get('[data-cy="amount"]').clear().type(String(amount));
  }

  selectType(type) {
    // expects a <select>; adjust if it's a custom dropdown
    cy.get('[data-cy="type"]').select(type);
  }

  typeRecipient(recipientId) {
    cy.get('[data-cy="recipientId"]').clear().type(recipientId);
  }

  submit() {
    cy.get('[data-cy="submit-transaction"]').click();
  }

  // UI assertions
  checkSuccessToast() {
    cy.get('[data-cy="toast"]').should('contain.text', 'Transaction created');
  }

  // Verify a row in the list contains the key values (adjust selectors as needed)
  assertTransactionInList({ amount, type, recipientId }) {
    cy.get('[data-cy="tx-row"]')
      .should('exist')
      .first()
      .within(() => {
        cy.contains(String(amount));
        cy.contains(type);
        if (recipientId) cy.contains(recipientId);
      });
  }
}
