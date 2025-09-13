// cypress/e2e/api/transactions.cy.js
import { makeTransaction } from '../../utils/dataFactory.js';
import {
  expectTransactionShape,
  expectArrayOfTransactions,
} from '../../support/assertions.js';
import { apiFetch } from '../../support/apiFetch.js';

describe('Transactions API', () => {
  // ───────────────────────────────────────────────────────────
  // CRUD (Create, Read, Update, Delete) suite
  // ───────────────────────────────────────────────────────────
  describe('CRUD', () => {
    it('Create → 201 with valid payload', () => {
      cy.stubCreateTransaction({ id: 'tx-1', status: 'SETTLED' }, 201); // stubs **/api/transactions
      const payload = makeTransaction({ userId: 'u-1', amount: 250.75, type: 'transfer' });

      apiFetch('POST', '/api/transactions', payload, { expectJson: true })
        .then(({ status, body }) => {
          expect(status).to.eq(201);
          expectTransactionShape(body);
          expect(body.status).to.eq('SETTLED');
        });

      cy.wait('@createTransaction').its('request.body').should('deep.include', payload);
    });

    it('Read → 200 list for a user', () => {
      const userId = 'u-1';
      cy.stubGetTransactions(userId, 200); // stubs **/api/transactions/:userId

      apiFetch('GET', `/api/transactions/${userId}`, null, { expectJson: true })
        .then(({ status, body }) => {
          expect(status).to.eq(200);
          expectArrayOfTransactions(body, 1);
        });

      cy.wait(`@getTransactions-${userId}`);
    });

    it('Update amount for transaction → 200', () => {
      const txId = 'tx-1';
      const update = { amount: 300 };

      cy.intercept('PATCH', `**/api/transactions/${txId}`, {
        statusCode: 200,
        body: {
          id: txId,
          userId: 'u-1',
          amount: 300,            // reflect the updated amount
          type: 'transfer',
          recipientId: '456',
          status: 'SETTLED',
        },
      }).as('updateTx');

      apiFetch('PATCH', `/api/transactions/${txId}`, update, { expectJson: true })
        .then(({ status, body }) => {
          expect(status).to.eq(200);
          expectTransactionShape(body);
          expect(body.amount).to.eq(300);
        });

      cy.wait('@updateTx').its('request.body').should('deep.include', update);
    });

    it('Delete transaction → 204', () => {
      const txId = 'tx-1';
      cy.intercept('DELETE', `**/api/transactions/${txId}`, { statusCode: 204 }).as('deleteTx');

      apiFetch('DELETE', `/api/transactions/${txId}`, null, { expectJson: false })
        .then(({ status }) => {
          expect(status).to.eq(204);
        });

      cy.wait('@deleteTx');
    });
  });

  // ───────────────────────────────────────────────────────────
  // Error scenarios suite
  // ───────────────────────────────────────────────────────────
  describe('Errors', () => {
    it('400 on invalid amount (negative)', () => {
      cy.intercept('POST', '**/api/transactions', {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Invalid amount' },
      }).as('createTx400');

      const bad = makeTransaction({ amount: -1 });

      apiFetch('POST', '/api/transactions', bad, { expectJson: false })
        .then(({ status }) => {
          expect(status).to.eq(400);
        });

      cy.wait('@createTx400').its('request.body').should('deep.include', bad);
    });

    it('400 on invalid type', () => {
      cy.intercept('POST', '**/api/transactions', {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Invalid type' },
      }).as('createTxType400');

      const bad = makeTransaction({ type: 'wire' }); // not in allowed set

      apiFetch('POST', '/api/transactions', bad, { expectJson: false })
        .then(({ status }) => {
          expect(status).to.eq(400);
        });

      cy.wait('@createTxType400').its('request.body').should('deep.include', bad);
    });

    it('404 on transactions for unknown user', () => {
      cy.intercept('GET', '**/api/transactions/unknown-user', {
        statusCode: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: 'User not found' },
      }).as('listUnknown404');

      apiFetch('GET', '/api/transactions/unknown-user', null, { expectJson: false })
        .then(({ status }) => {
          expect(status).to.eq(404);
        });

      cy.wait('@listUnknown404');
    });

    it('500 on server error (read)', () => {
      cy.intercept('GET', '**/api/transactions/u-err', {
        statusCode: 500,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Internal error' },
      }).as('listErr500');

      apiFetch('GET', '/api/transactions/u-err', null, { expectJson: false })
        .then(({ status }) => {
          expect(status).to.eq(500);
        });

      cy.wait('@listErr500');
    });
  });

  // ───────────────────────────────────────────────────────────
  // Data validation suite
  // ───────────────────────────────────────────────────────────
  describe('Data validation', () => {
    it('response shape and echoes key fields from request', () => {
      const payload = makeTransaction({
        userId: 'u-echo',
        amount: 99.99,
        type: 'deposit',
      });

      // Response mirrors payload and adds id/status
      cy.stubCreateTransaction({ id: 'tx-echo', ...payload, status: 'PENDING' }, 201);

      apiFetch('POST', '/api/transactions', payload, { expectJson: true })
        .then(({ status, body }) => {
          expect(status).to.eq(201);
          expectTransactionShape(body);
          expect(body.userId).to.eq(payload.userId);
          expect(body.amount).to.eq(payload.amount);
          expect(body.type).to.eq(payload.type);
        });

      cy.wait('@createTransaction').its('request.body').should('deep.include', payload);
    });
  });

  // ───────────────────────────────────────────────────────────
  // Authentication / Authorization suite
  // ───────────────────────────────────────────────────────────
  describe('Auth', () => {
    it('401 Unauthorized when creating a transaction', () => {
      cy.intercept('POST', '**/api/transactions', {
        statusCode: 401,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Unauthorized' },
      }).as('createTx401');

      const payload = makeTransaction();

      apiFetch('POST', '/api/transactions', payload, { expectJson: false })
        .then(({ status }) => {
          expect(status).to.eq(401);
        });

      cy.wait('@createTx401');
    });

    it('403 Forbidden when reading transactions list', () => {
      cy.intercept('GET', '**/api/transactions/*', {
        statusCode: 403,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Forbidden' },
      }).as('listTx403');

      apiFetch('GET', '/api/transactions/u-1', null, { expectJson: false })
        .then(({ status }) => {
          expect(status).to.eq(403);
        });

      cy.wait('@listTx403');
    });

    it('201 Created (create)', () => {
      cy.intercept('POST', '**/api/transactions', {
        statusCode: 201,
        headers: { 'content-type': 'application/json' },
        body: {
          id: 'tx-auth-ok',
          userId: 'u-1',
          amount: 42,
          type: 'transfer',
          status: 'PENDING',
        },
      }).as('createTx201');

      const payload = makeTransaction({ userId: 'u-1', amount: 42, type: 'transfer' });

      apiFetch('POST', '/api/transactions', payload, {
        headers: { authorization: 'Bearer test-token' }, // lowercase for consistency
        expectJson: true,
      }).then(({ status, body }) => {
        expect(status).to.eq(201);
        expectTransactionShape(body);
      });

      cy.wait('@createTx201').its('request.body').should('deep.include', payload);
    });
  });
});
