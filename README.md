# automation-framework-demo

A Cypress **API-first** testing framework (pure `cy.intercept`), with optional mock UI.

## How to Run (API only)

```bash
# install
npm install

# interactive
npm run cy:open:api

# headless + reports
npm run cy:run:api

Reports: cypress/reports/ (HTML + JSON per spec)

Screenshots (on failure): cypress/reports/screenshots/

Videos (run mode only): cypress/reports/videos/


Project Notes

Pure intercepts: All requests use browser fetch via a helper (cypress/support/apiFetch.js), so cy.intercept() reliably stubs responses.

Intercepts use patterns like **/api/users to work with any baseUrl.

UI tests exist under cypress/e2e/ui/, but they are not executed by the default commands because there is no HTML app/page being served. Cypress UI tests require a page to cy.visit().


                                  Project Architecture:

/cypress
  /e2e
    api
      users.cy.js                 # /api/users
      transactions.cy.js          # /api/transactions
    ui
      users.ui.cy.js              # User registration flow
      transactions.ui.cy.js           # Transaction creation flow
  /pages                          # Mock frontend POMs (if used)
    RegistrationPage.js           # Methods for filling the registration form & submitting
    TransactionPage.js            # Methods for creating a transaction (amount, description, submit)
    Header.js                     # Common header actions (profile, logout, nav links)
    DashboardPage.js              # (Optional) if you want to validate post-registration/transaction UI
  /support
    commands.js                   # API helpers (cy.createUser, cy.createTransaction, etc.)
    assertions.js                 # Custom assertions
    e2e.js                        # The global Cypress support file that runs before every spec to load custom commands.
    apiFetch.js                   # helper that sends browser fetch requests (so cy.intercept can stub them) and returns parsed status/body for assertions.
  /fixtures
    users.json
    transactions.json
  /utils
    dataFactory.ts                # Dynamic test data
/cypress.config.ts                # Register cy.task('redisFindNotification', ...), reporters, screenshots
/cypress.env.json                 # env file for local
/cypres.env.prod.jsonb            # env file for production
/cypress.env.staging.json         # env file for staging
