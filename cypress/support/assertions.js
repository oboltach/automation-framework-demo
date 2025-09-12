// cypress/support/assertions.js

// Validate a single User object
export function expectUserShape(u) {
  expect(u, 'user object').to.be.an('object');
  expect(u).to.have.all.keys('id', 'name', 'email', 'accountType');

  expect(u.id).to.be.a('string').and.not.empty;
  expect(u.name).to.be.a('string').and.not.empty;
  expect(u.email).to.be.a('string').and.include('@');
  expect(u.accountType).to.be.a('string');
}

// Validate a single Transaction object
export function expectTransactionShape(t) {
  expect(t, 'transaction object').to.be.an('object');
  expect(t).to.include.all.keys('id', 'userId', 'amount', 'type', 'status');

  expect(t.id).to.be.a('string').and.not.empty;
  expect(t.userId).to.be.a('string').and.not.empty;
  expect(t.amount).to.be.a('number');
  expect(t.type).to.be.a('string');
  expect(['PENDING', 'SETTLED', 'FAILED']).to.include(t.status);
}

// Validate an array of transactions (at least `min` items)
export function expectArrayOfTransactions(arr, min = 1) {
  expect(arr, 'transactions array').to.be.an('array').with.length.gte(min);
  arr.forEach(expectTransactionShape);
}

// Quick HTTP status assertion for cy.request responses
export function expectHttpStatus(res, status) {
  expect(res.status, `HTTP status should be ${status}`).to.eq(status);
}
