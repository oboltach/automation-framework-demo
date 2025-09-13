// cypress/e2e/ui/transactions.ui.cy.js
import { TransactionsPage } from '../../pages/TransactionsPage.js';

const txPage = new TransactionsPage();

describe('transactions suite (UI only)', function () {
  beforeEach(function () {
    cy.fixture('transactions.json').as('tx');
  });

  it('creates a transfer successfully', function () {
    const t = this.tx.valid.transfer; // { userId, amount, type: 'transfer', recipientId }

    txPage.visit();
    txPage.typeAmount(t.amount);
    txPage.selectType(t.type);
    txPage.typeRecipient(t.recipientId);
    txPage.submit();

    // Pure UI checks (no API stubs)
    txPage.checkSuccessToast(); // e.g., 'Transaction created'
    txPage.assertTransactionInList({
      amount: t.amount,
      type: t.type,
      recipientId: t.recipientId,
    });
  });

  it('shows validation error on negative amount', function () {
    const bad = this.tx.invalid.negativeAmount; // { amount: -1, type: 'deposit' }

    txPage.visit();
    txPage.typeAmount(bad.amount);
    txPage.selectType(bad.type); // 'deposit'
    // no recipient for deposit in your fixture
    txPage.submit();

    cy.contains('Invalid amount').should('be.visible'); // adjust to your UI text
  });
});
