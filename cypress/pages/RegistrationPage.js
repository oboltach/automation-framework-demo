export class RegistrationPage {
  visit() {
    cy.visit('/register'); // change if your route differs
  }

  typeName(name) {
    cy.get('[data-cy="name"]').clear().type(name);
  }

  typeEmail(email) {
    cy.get('[data-cy="email"]').clear().type(email);
  }

  selectAccountType(type) {
    cy.get('[data-cy="accountType"]').select(type); // expects a <select>
  }

  submit() {
    cy.get('[data-cy="submit"]').click();
  }
}
