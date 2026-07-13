const path = require('path');
const { createJestConfig } = require('../../../jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@bitcode/generic-artifacts-compose$': path.join(__dirname, 'src/index.ts'),
  },
});
