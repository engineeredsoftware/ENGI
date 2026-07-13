/**
 * Jest configuration for execution-generics
 *
 * Mirrors the sibling generics packages (agent-generics, pipelines-generics):
 * ts-jest against the repo-root tsconfig, with workspace aliases mapped to
 * sources so tests never require built output.
 */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  roots: ['<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@bitcode/execution-generics$': '<rootDir>/src/index.ts',
    '^@bitcode/execution-generics/(.*)$': '<rootDir>/src/$1',
    '^@bitcode/executor-generics$': '<rootDir>/../executor-generics/src/index.ts',
    '^@bitcode/generic-executors$': '<rootDir>/../generic-executors/src/index.ts',
    '^@bitcode/generic-executors/(.*)$': '<rootDir>/../generic-executors/src/$1',
    '^@bitcode/generic-executions$': '<rootDir>/../generic-executions/src/index.ts',
    '^@bitcode/generic-executions/(.*)$': '<rootDir>/../generic-executions/src/$1',
    '^@bitcode/logger$': '<rootDir>/../logger/src/index.ts',
    '^@bitcode/parsing$': '<rootDir>/../parsing/src/parsing.ts',
    '^@bitcode/streams$': '<rootDir>/../api/src/streams/index.ts',
    '^@bitcode/supabase$': '<rootDir>/../supabase/src/index.ts',
    '^@bitcode/artifacts$': '<rootDir>/../artifacts/src/artifacts.ts',
    '^@bitcode/([^/]+)$': '<rootDir>/../$1/src/index.ts',
    '^@bitcode/([^/]+)/(.*)$': '<rootDir>/../$1/src/$2',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../tsconfig.json',
      diagnostics: false,
    },
  },
};
