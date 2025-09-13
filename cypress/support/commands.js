// Small helpers
// Generates a unique id by combining a given prefix with the current timestamp
const uid = (p) => `${p}-${Date.now()}`;

// POST /api/users
Cypress.Commands.add('stubCreateUser', (resp = {}, statusCode = 201) => {
  const body = {
    id: resp.id ?? uid('u'),
    name: resp.name ?? 'John Doe',
    email: resp.email ?? 'john@example.com',
    accountType: resp.accountType ?? 'premium',
  };
  cy.intercept('POST', '**/api/users', { statusCode, body }).as('createUser');
});

// GET /api/users/:id
Cypress.Commands.add('stubGetUser', (id, resp = {}, statusCode = 200) => {
  const body = {
    id,
    name: resp.name ?? 'John Doe',
    email: resp.email ?? 'john@example.com',
    accountType: resp.accountType ?? 'premium',
  };
  cy.intercept('GET', `**/api/users/${id}`, { statusCode, body }).as(`getUser-${id}`);
});

// POST /api/transactions
Cypress.Commands.add('stubCreateTransaction', (resp = {}, statusCode = 201) => {
  const body = {
    id: resp.id ?? uid('tx'),
    userId: resp.userId ?? '123',
    amount: resp.amount ?? 100.5,
    type: resp.type ?? 'transfer',
    recipientId: resp.recipientId ?? '456',
    status: resp.status ?? 'PENDING',
  };
  cy.intercept('POST', '**/api/transactions', { statusCode, body }).as('createTransaction');
});

// GET /api/transactions/:userId (single default transaction)
Cypress.Commands.add('stubGetTransactions', (userId, statusCode = 200) => {
  const body = [{
    id: uid('tx'),
    userId,
    amount: 100.5,
    type: 'transfer',
    recipientId: '456',
    status: 'SETTLED',
  }];
  cy.intercept('GET', `**/api/transactions/${userId}`, { statusCode, body }).as(`getTransactions-${userId}`);
});

// Generic error stub (string URLs; allows JSON-like body; normalizes method)
Cypress.Commands.add('stubError', (method, url, statusCode, body = { error: 'Stubbed error' }, delayMs = 0) => {
  const m = String(method).toUpperCase();
  cy.intercept({ method: m, url }, { statusCode, body, delay: delayMs }).as(`err-${m}-${url}`);
});
