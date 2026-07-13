/**
 * Jest configuration for pipelines-generics
 */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  roots: ['<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@bitcode/pipelines-generics$': '<rootDir>/src/index.ts',
    '^@bitcode/pipelines-generics/(.*)$': '<rootDir>/src/$1',
    '^@bitcode/generic-pipelines-sdivf$': '<rootDir>/../generic-pipelines/SDIVF/src/index.ts',
    '^@bitcode/generic-pipelines-sdivf/(.*)$': '<rootDir>/../generic-pipelines/SDIVF/src/$1',
    '^@bitcode/execution-generics$': '<rootDir>/../execution-generics/src/index.ts',
    '^@bitcode/registry$': '<rootDir>/../registry/src/index.ts',
    '^@bitcode/prompts$': '<rootDir>/../prompts/src/index.ts',
    '^@bitcode/doc-comment$': '<rootDir>/src/__mocks__/doc-comment.ts',
    '^@bitcode/tools-generics$': '<rootDir>/src/__mocks__/tools-generics.ts',
    '^@bitcode/llm-generics$': '<rootDir>/../llm-generics/src/index.ts',
    '^@bitcode/orm$': '<rootDir>/../orm/src/index.ts',
    '^@bitcode/streams$': '<rootDir>/../streams/src/index.ts',
    '^@bitcode/logger$': '<rootDir>/../logger/src/index.ts',
    '^@bitcode/parsing$': '<rootDir>/../parsing/src/parsing.ts',
    '^@bitcode/supabase$': '<rootDir>/../supabase/src/index.ts',
    '^@bitcode/artifacts$': '<rootDir>/../artifacts/src/artifacts.ts',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../tsconfig.json',
      diagnostics: false,
    },
  },
};
