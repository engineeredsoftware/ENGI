const path = require('path');
const { createJestConfig } = require('../../tests/jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  testTimeout: 60_000,
  // Language-server child processes keep handles open; force exit after tests.
  forceExit: true,
  tsconfig: path.join(__dirname, 'tsconfig.json'),
  moduleNameMapper: {
    '^@bitcode/logger$': path.join(__dirname, '../logger/src/logger.ts'),
  },
});
