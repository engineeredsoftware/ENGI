const path = require('path');
const { createJestConfig } = require('../../tests/jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@bitcode/execution-generics$': path.join(__dirname, 'src/index.ts'),
    '^@bitcode/execution-generics/(.*)$': path.join(__dirname, 'src/$1'),
    '^@bitcode/api/streams$': path.join(__dirname, '../api/src/streams/index.ts'),
    '^@bitcode/generic-artifacts-compose$': path.join(__dirname, '../generic-artifacts/compose/src/index.ts'),
    '^@bitcode/parsing$': path.join(__dirname, '../parsing/src/parsing.ts'),
    '^@bitcode/logger$': path.join(__dirname, '../logger/src/logger.ts'),
  },
});
