const path = require('path');
const { createJestConfig } = require('../../jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@bitcode/logger$': path.join(__dirname, '../logger/src/logger.ts'),
    // Deep subpaths not covered by package root map
    '^@bitcode/pipelines-generics/(.*)$': path.join(__dirname, '../pipelines-generics/src/$1'),
    '^@bitcode/generic-agents-ptrr/(.*)$': path.join(__dirname, '../generic-agents/PTRR/src/$1'),
    '^@bitcode/agent-generics/agents/factories$': path.join(__dirname, 'src/agents/factories.ts'),
    '^@bitcode/agent-generics/types$': path.join(__dirname, 'src/types.ts'),
    '^@bitcode/api/streams$': path.join(__dirname, '../api/src/streams/index.ts'),
    '^@bitcode/generic-artifacts-compose$': path.join(__dirname, '../generic-artifacts/compose/src/index.ts'),
    '^@bitcode/parsing$': path.join(__dirname, '../parsing/src/parsing.ts'),
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
});
