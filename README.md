# automation-framework-demo
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
    e2e.js
  /fixtures
    users.json
    transactions.json
  /utils
    dataFactory.ts                # Dynamic test data
/cypress.config.ts                # Register cy.task('redisFindNotification', ...), reporters, screenshots
/cypress.env.json                 # env file for local
/cypres.env.prod.jsonb            # env file for production
/cypress.env.staging.json         # env file for staging


How to Run Tests (no UI)

1) Clone & install
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
npm install

2) Open Cypress (API specs only)

Use the API-only script so the runner only loads cypress/e2e/api/**:

npm run cy:open:api

Notes

No server required. API specs use cy.intercept() to stub /api/* calls, so tests run without a backend.

Base URL: We still set a baseUrl in cypress.config.*, but with stubs it won’t hit the network.

If you later add UI specs, run npm run cy:open to see both API and UI suites.



How to Run Tests

Clone the repo

git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>


Install dependencies

npm install


Open Cypress Test Runner (interactive mode)

npx cypress open


Run tests in headless mode (CI/CD friendly)

npx cypress run
