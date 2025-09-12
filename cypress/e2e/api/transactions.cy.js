// cypress/e2e/api/transactions.cy.js
import { makeTransaction } from '../../utils/dataFactory.js';
import {
  expectTransactionShape,
  expectArrayOfTransactions,
  expectHttpStatus,
} from '../../support/assertions.js';

describe('Transactions API', () => {
  // ───────────────────────────────────────────────────────────
  // CRUD (Create, Read, Update, Delete) suite
  // ───────────────────────────────────────────────────────────
  describe('CRUD', () => {
    it('Create → 201 with valid payload', () => {
      cy.stubCreateTransaction({ id: 'tx-1', status: 'SETTLED' }, 201); // RESPONSE stub
      const payload = makeTransaction({ userId: 'u-1', amount: 250.75, type: 'transfer' }); // REQUEST factory

      cy.request('POST', '/api/transactions', payload).then((res) => {
        expectHttpStatus(res, 201);
        expectTransactionShape(res.body);
        expect(res.body.status).to.eq('SETTLED');
      });

      cy.wait('@createTransaction').its('request.body').should('deep.include', payload);
    });

    it('Read → 200 list for a user', () => {
      const userId = 'u-1';
      cy.stubGetTransactions(userId, 200); // default stub returns one tx

      cy.request('GET', `/api/transactions/${userId}`).then((res) => {
        expectHttpStatus(res, 200);
        expectArrayOfTransactions(res.body, 1);
      });

      cy.wait(`@getTransactions-${userId}`);
    });

    it('Update amount for transaction → 200', () => {
      const txId = 'tx-1';
      const update = { amount: 300 };

      cy.intercept('PATCH', `/api/transactions/${txId}`, {
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

      cy.request('PATCH', `/api/transactions/${txId}`, update).then((res) => {
        expectHttpStatus(res, 200);
        expectTransactionShape(res.body);
        expect(res.body.amount).to.eq(300);   // assert the changed field
      });

      cy.wait('@updateTx').its('request.body').should('deep.include', update);
    });

    it('Delete transaction → 204', () => {
      const txId = 'tx-1';
      cy.intercept('DELETE', `/api/transactions/${txId}`, { statusCode: 204, body: {} }).as('deleteTx');

      cy.request('DELETE', `/api/transactions/${txId}`).then((res) => {
        expect(res.status).to.eq(204);
      });

      cy.wait('@deleteTx');
    });
  });

  // ───────────────────────────────────────────────────────────
  // Error scenarios suite
  // ───────────────────────────────────────────────────────────
  describe('Errors', () => {
    it('400 on invalid amount (negative)', () => {
      cy.stubError('POST', '/api/transactions', 400, { error: 'Invalid amount' });
      const bad = makeTransaction({ amount: -1 });

      cy.request({
        method: 'POST',
        url: '/api/transactions',
        body: bad,
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 400);
    });

    it('400 on invalid type', () => {
      cy.stubError('POST', '/api/transactions', 400, { error: 'Invalid type' });
      const bad = makeTransaction({ type: 'wire' }); // not in allowed set

      cy.request({
        method: 'POST',
        url: '/api/transactions',
        body: bad,
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 400);
    });

    it('404 on transactions for unknown user', () => {
      cy.stubError('GET', '/api/transactions/unknown-user', 404, { error: 'User not found' });

      cy.request({
        method: 'GET',
        url: '/api/transactions/unknown-user',
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 404);
    });

    it('500 on server error (read)', () => {
      cy.stubError('GET', '/api/transactions/u-err', 500, { error: 'Internal error' });

      cy.request({
        method: 'GET',
        url: '/api/transactions/u-err',
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 500);
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

      cy.request('POST', '/api/transactions', payload).then((res) => {
        expectHttpStatus(res, 201);
        expectTransactionShape(res.body);
        expect(res.body.userId).to.eq(payload.userId);
        expect(res.body.amount).to.eq(payload.amount);
        expect(res.body.type).to.eq(payload.type);
      });
    });
  });

  // ───────────────────────────────────────────────────────────
  // Authentication / Authorization suite
  // ───────────────────────────────────────────────────────────
  describe('Auth', () => {
    it('401 Unauthorized when creating a transaction', () => {
      cy.intercept('POST', '/api/transactions', {
        statusCode: 401,
        body: { error: 'Unauthorized' },
      }).as('createTx401');

      const payload = makeTransaction();

      cy.request({
        method: 'POST',
        url: '/api/transactions',
        body: payload,
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 401);

      cy.wait('@createTx401');
    });

    it('403 Forbidden when reading transactions list', () => {
      cy.intercept('GET', '/api/transactions/*', {
        statusCode: 403,
        body: { error: 'Forbidden' },
      }).as('listTx403');

      cy.request({
        method: 'GET',
        url: '/api/transactions/u-1',
        failOnStatusCode: false,
      })
        .its('status')
        .should('eq', 403);

      cy.wait('@listTx403');
    });

    it('201 Created (create)', () => {
      cy.intercept('POST', '/api/transactions', {
        statusCode: 201,
        body: {
          id: 'tx-auth-ok',
          userId: 'u-1',
          amount: 42,
          type: 'transfer',
          status: 'PENDING',
        },
      }).as('createTx201');

      const payload = makeTransaction({ userId: 'u-1', amount: 42, type: 'transfer' });

      cy.request({
        method: 'POST',
        url: '/api/transactions',
        headers: { Authorization: 'Bearer test-token' }, // optional now
        body: payload,
      }).then((res) => {
        expectHttpStatus(res, 201);
        expectTransactionShape(res.body);
      });

      cy.wait('@createTx201').its('request.body').should('deep.include', payload);
    });
  });
});
