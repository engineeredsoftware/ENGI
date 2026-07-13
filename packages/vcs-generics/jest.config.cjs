const { createJestConfig } = require('../../jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts']
});
