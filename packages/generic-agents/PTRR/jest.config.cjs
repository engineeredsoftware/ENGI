/**
 * Jest configuration for @bitcode/generic-agents-ptrr
 */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  roots: ['<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@bitcode/generic-agents-ptrr$': '<rootDir>/src/index.ts',
    '^@bitcode/generic-agents-ptrr/(.*)$': '<rootDir>/src/$1',
    '^@bitcode/agent-generics$': '<rootDir>/../../agent-generics/src/index.ts',
    '^@bitcode/agent-generics/(.*)$': '<rootDir>/../../agent-generics/src/$1',
    '^@bitcode/execution-generics$': '<rootDir>/../../execution-generics/src/index.ts',
    '^@bitcode/execution-generics/(.*)$': '<rootDir>/../../execution-generics/src/$1',
    '^@bitcode/generation-generics$': '<rootDir>/../../generation-generics/src/index.ts',
    '^@bitcode/generation-generics/(.*)$': '<rootDir>/../../generation-generics/src/$1',
    '^@bitcode/generic-generations-failsafes$': '<rootDir>/../../generic-generations/failsafes/src/index.ts',
    '^@bitcode/generic-generations-thinkings$': '<rootDir>/../../generic-generations/thinkings/src/index.ts',
    '^@bitcode/prompts$': '<rootDir>/../../prompts/src/index.ts',
    '^@bitcode/prompts/(.*)$': '<rootDir>/../../prompts/src/$1',
    '^@bitcode/registry$': '<rootDir>/../../registry/src/index.ts',
    '^@bitcode/logger$': '<rootDir>/../../logger/src/logger.ts',
    '^@bitcode/tools-generics$': '<rootDir>/../../tools-generics/src/index.ts',
    '^@bitcode/llm-generics$': '<rootDir>/../../llm-generics/src/index.ts',
    '^@bitcode/generic-llms$': '<rootDir>/../../generic-llms/registry/src/index.ts',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../../tsconfig.json',
      diagnostics: false,
    },
  },
};
