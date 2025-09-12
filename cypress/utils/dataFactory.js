// cypress/utils/dataFactory.js

// Generate a random id with prefix
const rid = (p) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`; // Example: user-1726078456123-4821

function makeUser(overrides = {}) {
  const name = overrides.name || 'John Doe';
  const safe = name.toLowerCase().replace(/\s+/g, '.');
  const random = Math.floor(Math.random() * 10000); // 0–9999

  return {
    name,
    email: overrides.email || `${safe}${random}@example.com`, // example  - john.doe4821@example.com
    accountType: overrides.accountType || 'premium',
  };
}

function makeTransaction(overrides = {}) {
  return {
    userId: overrides.userId || '123',
    amount: overrides.amount || 100.5,
    type: overrides.type || 'transfer',
    recipientId: overrides.recipientId || '456',
  };
}

// Export functions for use in tests
module.exports = {
  makeUser,
  makeTransaction,
};
