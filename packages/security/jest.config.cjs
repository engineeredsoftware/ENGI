const path = require('path');
const { createJestConfig } = require('../../tests/jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/__mocks__/**'],
  coverageDirectory: path.join(__dirname, 'coverage')
});
