// cypress/e2e/api/users.cy.js
import { makeUser } from '../../utils/dataFactory.js';
import { expectUserShape, expectHttpStatus } from '../../support/assertions.js';
import { apiFetch } from '../../support/apiFetch.js';

describe('Users API', () => {
  // CRUD (Create, Read, Update, Delete) suite
  describe('CRUD', () => {
    it('Create → 201 with valid payload', () => {
      cy.stubCreateUser({ id: 'u-1' }, 201);
      const payload = makeUser({ accountType: 'basic' });

      apiFetch('POST', '/api/users', payload).then(({ status, body }) => {
        expect(status).to.eq(201);
        expectUserShape(body);
      });

      cy.wait('@createUser').its('request.body').should('deep.include', payload);
    });

    it('Read → 200 for existing user', () => {
      const id = 'u-1';
      cy.stubGetUser(id, { name: 'John Doe', email: 'john@example.com', accountType: 'premium' }, 200);

      apiFetch('GET', `/api/users/${id}`).then((res) => {
        expectHttpStatus(res, 200);
        expectUserShape(res.body);
        expect(res.body.id).to.eq(id);
      });
      cy.wait(`@getUser-${id}`);
    });

    it('Update existing user → 200', () => {
      const id = 'u-1';
      const update = { name: 'John Updated' };

      // Inline intercept for PATCH (not in commands since endpoint not provided)
      cy.intercept('PATCH', `/api/users/${id}`, {
        statusCode: 200,
        body: { id, name: update.name, email: 'john@example.com', accountType: 'premium' }
      }).as('updateUser');

      apiFetch('PATCH', `/api/users/${id}`, update).then((res) => {
        expectHttpStatus(res, 200);
        expectUserShape(res.body);
        expect(res.body.name).to.eq('John Updated');
      });
      cy.wait('@updateUser').its('request.body').should('deep.include', update);
    });

    it('Delete → 204 (stubbed endpoint)', () => {
      const id = 'u-1';
      cy.intercept('DELETE', `**/api/users/${id}`, { statusCode: 204 }).as('deleteUser');

      apiFetch('DELETE', `/api/users/${id}`, null, { expectJson: false })
        .then(({ status }) => {
          expect(status).to.eq(204);
        });

      cy.wait('@deleteUser');
    });
  });

  // ───────────────────────────────────────────────────────────
  // Error scenarios test suite
  // ───────────────────────────────────────────────────────────
  describe('Errors', () => {
    it('400 on invalid email format', () => {
      cy.stubError('POST', '/api/users', 400, { error: 'Invalid email' });
      const bad = makeUser({ email: 'not-an-email' });

      apiFetch('POST', '/api/users', bad).then(({ status, body }) => {
        expect(status).to.eq(400);
        expect(body).to.have.property('error', 'Invalid email');
      });
    });

    it('404 on missing user', () => {
      cy.stubError('GET', '**/api/users/not-found', 404, { error: 'User not found' });

      apiFetch('GET', '/api/users/not-found', null, { expectJson: false }).then(({ status }) => {
          expect(status).to.eq(404);
        });
    });

    it('409 on duplicate email', () => {
      cy.stubError('POST', '/api/users', 409, { error: 'Duplicate email' });
      const dup = makeUser({ email: 'dup@example.com' });

      apiFetch('POST', '/api/users', dup, { expectJson: false }).then(({ status }) => {
        expect(status).to.eq(409);
      });
    });

    it('500 on server error (read)', () => {
      cy.stubError('GET', '/api/users/u-err', 500, { error: 'Internal error' });

      apiFetch('GET', '/api/users/u-err', null, { expectJson: false }).then(({ status }) => {
        expect(status).to.eq(500);
      });
    });
  });

  // ───────────────────────────────────────────────────────────
  // Data validation suite
  // ───────────────────────────────────────────────────────────
  describe('Data validation', () => {
    it('response contains correct shape and echoes name/email from request', () => {
      const payload = makeUser({ name: 'Echo Me', email: 'echo@example.com', accountType: 'premium' });
      // Build a response that mirrors the inbound payload
      cy.stubCreateUser({ id: 'u-echo', ...payload }, 201);

      apiFetch('POST', '/api/users', payload, { expectJson: true }).then(({ status, body }) => {
        expect(status).to.eq(201);
        expectUserShape(body);
        expect(body.name).to.eq(payload.name);
        expect(body.email).to.eq(payload.email);
        expect(body.accountType).to.eq(payload.accountType);
      });
    });
  });

  // ───────────────────────────────────────────────────────────
  // Authentication / Authorization suite
  // ───────────────────────────────────────────────────────────
  describe('Auth', () => {
    it('401 Unauthorized when token is missing', () => {
      cy.intercept('POST', '/api/users', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('createUserAuth');

      const payload = makeUser();
      apiFetch('POST', '/api/users', payload, { expectJson: false }).then(({ status }) => {
        expect(status).to.eq(401);
      });
      cy.wait('@createUserAuth');
    });

    it('403 Forbidden for insufficient role', () => {
      cy.intercept('GET', '/api/users/*', {
        statusCode: 403,
        body: { error: 'Forbidden' }
      }).as('getUserAuthZ');

      apiFetch('GET', '/api/users/u-1', null, { expectJson: false }).then(({ status }) => {
        expect(status).to.eq(403);
      });
      cy.wait('@getUserAuthZ');
    });

    it('201 Created when Bearer token is present', () => {
      cy.intercept('POST', '**/api/users', {
        statusCode: 201,
        headers: { 'content-type': 'application/json' },
        body: {
          id: 'u-auth',
          name: 'John',
          email: 'john@example.com',
          accountType: 'premium',
        },
      }).as('createUserWithToken');

      const payload = makeUser({ accountType: 'business' });

      apiFetch('POST', '/api/users', payload, {
        headers: { Authorization: 'Bearer test-token' }, // ← this now gets forwarded
        expectJson: true,
      }).then(({ status, body }) => {
        expect(status).to.eq(201);
        expectUserShape(body);
      });

      cy.wait('@createUserWithToken').then(({ request }) => {
        // headers are lowercase
        expect(request.headers).to.have.property('authorization');
        expect(request.headers.authorization).to.match(/^Bearer\s+/);
        expect(request.body).to.deep.include(payload);
      });
    });
  });
});
