const path = require('path');
const { createJestConfig } = require('../../../tests/jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  tsconfig: path.join(__dirname, 'tsconfig.test.json'),
  setupFilesAfterEnv: [path.join(__dirname, 'jest.setup.cjs')]
});
