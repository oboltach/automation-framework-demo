import { RegistrationPage } from '../../pages/RegistrationPage.js';
import { DashboardPage } from '../../pages/DashboardPage.js';

const registrationPage = new RegistrationPage();
const dashboardPage = new DashboardPage();

describe('registration suite (UI only)', function () {
  beforeEach(function () {
    cy.fixture('users.json').as('users');
  });

  it('successful registration', function () {
    const { name, email, accountType } = this.users.valid.janeBasic;

    registrationPage.visit();
    registrationPage.typeName(name);
    registrationPage.typeEmail(email);
    registrationPage.selectAccountType(accountType);
    registrationPage.submit();

    //  UI checks
    dashboardPage.checkWelcomeMessage();
    dashboardPage.header.openProfile();
    //assert profile shows the correct name
    dashboardPage.header.assertProfileName(name);
    dashboardPage.header.logout();

    cy.url().should('include', '/login'); // or '/login' depending on your app after logout
  });

  it('unsuccessful registration (invalid email)', function () {
    const { name, email, accountType } = this.users.invalid.badEmail;

    registrationPage.visit();
    registrationPage.typeName(name);
    registrationPage.typeEmail(email);
    registrationPage.selectAccountType(accountType);
    registrationPage.submit();

    cy.contains('Invalid email').should('be.visible'); // adjust to your UI copy
    cy.url().should('include', '/register');
  });
});
