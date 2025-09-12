export class Header {
  openProfile() {
    cy.get('[data-cy="profile"]').click();
  }

  assertProfileName(expectedName) {
    cy.get('[data-cy="profile-name"]').should('have.text', expectedName);

  }

  logout() {
    cy.get('[data-cy="logout"]').click();
  }
}
