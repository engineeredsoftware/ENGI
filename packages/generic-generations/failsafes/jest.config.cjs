/**
 * Co-located Jest harness for @bitcode/generic-generations-failsafes.
 * Package tests live under src/__tests__/{core,edges}/ — not under consumers
 * (e.g. agent-generics). Core vs edges: .docs/AGENTS.md, CONTRIBUTING §8.0.
 */
const path = require('path');
const { createJestConfig } = require('../../../tests/jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: [
    '**/__tests__/core/**/*.core.test.(ts|tsx)',
    '**/__tests__/edges/**/*.edges.test.(ts|tsx)',
  ],
  moduleNameMapper: {
    '^@bitcode/generic-generations-failsafes$': path.join(__dirname, 'src/index.ts'),
    '^@bitcode/generic-generations-failsafes/(.*)$': path.join(__dirname, 'src/$1'),
    '^@bitcode/agent-generics$': path.join(__dirname, '../../agent-generics/src/index.ts'),
    '^@bitcode/agent-generics/(.*)$': path.join(__dirname, '../../agent-generics/src/$1'),
    '^@bitcode/execution-generics$': path.join(__dirname, '../../execution-generics/src/index.ts'),
    '^@bitcode/execution-generics/(.*)$': path.join(__dirname, '../../execution-generics/src/$1'),
    '^@bitcode/logger$': path.join(__dirname, '../../logger/src/logger.ts'),
    '^@bitcode/parsing$': path.join(__dirname, '../../parsing/src/parsing.ts'),
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
});
