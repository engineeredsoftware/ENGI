/**
 * Co-located Jest for AbsolutesMeasureAgent base.
 */
const path = require('path');
const { createJestConfig } = require('../../../tests/jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: [
    '**/__tests__/core/**/*.core.test.(ts|tsx)',
    '**/__tests__/edges/**/*.edges.test.(ts|tsx)',
  ],
  moduleNameMapper: {
    '^@bitcode/generic-measurements-absolutes$': path.join(__dirname, 'src/index.ts'),
    '^@bitcode/generic-agents-agent-measure$': path.join(
      __dirname,
      '../../generic-agents/agent-measure/src/index.ts',
    ),
    '^@bitcode/measurement-generics$': path.join(
      __dirname,
      '../../measurement-generics/src/index.ts',
    ),
    '^@bitcode/agent-generics$': path.join(__dirname, '../../agent-generics/src/index.ts'),
    '^@bitcode/agent-generics/(.*)$': path.join(__dirname, '../../agent-generics/src/$1'),
    '^@bitcode/prompts$': path.join(__dirname, '../../prompts/src/index.ts'),
    '^@bitcode/prompts/(.*)$': path.join(__dirname, '../../prompts/src/$1'),
    '^@bitcode/logger$': path.join(__dirname, '../../logger/src/logger.ts'),
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/__tests__/**'],
});
