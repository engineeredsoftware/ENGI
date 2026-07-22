/**
 * Co-located Jest for @bitcode/parsing.
 * Core vs edges: .docs/AGENTS.md / CONTRIBUTING §8.0.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testMatch: [
    '<rootDir>/src/__tests__/core/**/*.core.test.ts',
    '<rootDir>/src/__tests__/edges/**/*.edges.test.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.typecheck.json',
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@bitcode/parsing$': '<rootDir>/src/parsing.ts',
    '^@bitcode/logger$': '<rootDir>/../logger/src/index.ts',
  },
};
