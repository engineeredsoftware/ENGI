module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../../tsconfig.json',
      diagnostics: false,
    },
  },
  moduleNameMapper: {
    '^openai$': '<rootDir>/tests/__mocks__/openai.ts',
    '^@anthropic-ai/sdk$': '<rootDir>/tests/__mocks__/anthropic-sdk.ts',
    '^@bitcode/llm-generics$': '<rootDir>/../../llm-generics/src/index.ts',
    '^@bitcode/llm-generics/(.*)$': '<rootDir>/../../llm-generics/src/$1',
    '^@bitcode/registry$': '<rootDir>/../../registry/src/index.ts',
    '^@bitcode/generic-llms$': '<rootDir>/src/index.ts',
    '^@bitcode/generic-llms/defaults$': '<rootDir>/../defaults/src/index.ts',
    '^@bitcode/generic-llms-defaults$': '<rootDir>/../defaults/src/index.ts',
    '^@bitcode/generic-llms-xai$': '<rootDir>/../xAI/src/index.ts',
    '^@bitcode/generic-llms-openai$': '<rootDir>/../OpenAI/src/index.ts',
    '^@bitcode/generic-llms-anthropic$': '<rootDir>/../Anthropic/src/index.ts',
    '^@bitcode/generic-llms-google$': '<rootDir>/../Google/src/index.ts',
  },
};
