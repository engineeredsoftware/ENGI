/**
 * Jest configuration for @bitcode/generic-pipelines-sdivf
 */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  roots: ['<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@bitcode/generic-pipelines-sdivf$': '<rootDir>/src/index.ts',
    '^@bitcode/pipelines-generics$': '<rootDir>/../../pipelines-generics/src/index.ts',
    '^@bitcode/pipelines-generics/(.*)$': '<rootDir>/../../pipelines-generics/src/$1',
    '^@bitcode/execution-generics$': '<rootDir>/../../execution-generics/src/index.ts',
    '^@bitcode/execution-generics/(.*)$': '<rootDir>/../../execution-generics/src/$1',
    '^@bitcode/agent-generics$': '<rootDir>/../../agent-generics/src/index.ts',
    '^@bitcode/agent-generics/(.*)$': '<rootDir>/../../agent-generics/src/$1',
    '^@bitcode/registry$': '<rootDir>/../../registry/src/index.ts',
    '^@bitcode/prompts$': '<rootDir>/../../prompts/src/index.ts',
    '^@bitcode/doc-comment-generics$': '<rootDir>/../../pipelines-generics/src/__mocks__/doc-comment.ts',
    '^@bitcode/tools-generics$': '<rootDir>/../../pipelines-generics/src/__mocks__/tools-generics.ts',
    '^@bitcode/llm-generics$': '<rootDir>/../../llm-generics/src/index.ts',
    '^@bitcode/orm$': '<rootDir>/../../orm/src/index.ts',
    '^@bitcode/api/streams$': '<rootDir>/../../api/src/streams/index.ts',
    '^@bitcode/logger$': '<rootDir>/../../logger/src/index.ts',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../../tsconfig.json',
      diagnostics: false,
    },
  },
};
