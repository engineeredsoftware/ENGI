const tsJestPreset = require('ts-jest/presets/js-with-ts/jest-preset');
const customModuleNameMapper = {
  '^@bitcode/btd$': '<rootDir>/../btd/src/authority.ts',
  '^@bitcode/btd/api-schema-compatibility-matrix$': '<rootDir>/../btd/src/api-schema-compatibility-matrix.ts',
  '^@bitcode/btd/chatgpt-app-action-contract$': '<rootDir>/../btd/src/chatgpt-app-action-contract.ts',
  '^@bitcode/btd/interface-authorization-policy$': '<rootDir>/../btd/src/interface-authorization-policy.ts',
  '^@bitcode/btd/interface-consumer-ux-regression-proof$': '<rootDir>/../btd/src/interface-consumer-ux-regression-proof.ts',
  '^@bitcode/btd/interface-telemetry-proof-hook$': '<rootDir>/../btd/src/interface-telemetry-proof-hook.ts',
  '^@bitcode/btd/read-license-assetpack-rights-contract$': '<rootDir>/../btd/src/read-license-assetpack-rights-contract.ts',
  '^@bitcode/tools-generics$': '<rootDir>/src/__stubs__/tools-generics.ts',
  '^@bitcode/prompts/prompt$': '<rootDir>/../prompts/src/prompt.ts',
  '^@bitcode/prompts/parts/PromptPart$': '<rootDir>/../prompts/src/parts/PromptPart.ts',
  '^@bitcode/prompts/formatters$': '<rootDir>/../prompts/src/formatters/index.ts',
  '^@bitcode/prompts/execution/PromptExecution$': '<rootDir>/../prompts/src/execution/PromptExecution.ts',
  '^@bitcode/prompts/raw_promptparts/(.*)$': '<rootDir>/../prompts/src/raw_promptparts/$1',
  '^@bitcode/generic-tools-mcps-aws$': '<rootDir>/src/__stubs__/generic-tools-mcps-aws.ts',
  '^@bitcode/generic-tools-mcps-vercel$': '<rootDir>/src/__stubs__/generic-tools-mcps-vercel.ts',
  '^@bitcode/generic-tools-simple-system-text-search$': '<rootDir>/src/__stubs__/generic-tools-simple-system-text-search.ts',
  '^@bitcode/generic-tools-web-search$': '<rootDir>/src/__stubs__/generic-tools-web-search.ts',
  '^@bitcode/digest/run$': '<rootDir>/src/__stubs__/digest-run.ts',
  '^@bitcode/github$': '<rootDir>/src/__stubs__/github.ts',
  '^@bitcode/vcs$': '<rootDir>/src/__stubs__/vcs.ts',
  '^@bitcode/context$': '<rootDir>/src/__stubs__/context.ts',
  '^@bitcode/generic-tools-mcps-vercel/src/prompts/VercelMCPDocCodeToolPrompt$': '<rootDir>/src/__stubs__/vercel-doc-prompt.ts',
  '^@bitcode/generic-tools-mcps-aws/src/prompts/AWSMCPDocCodeToolPrompt$': '<rootDir>/src/__stubs__/aws-doc-prompt.ts',
  '^@bitcode/generic-tools-simple-system-text-search/src/prompts/SimpleSystemTextSearchDocCodeToolPrompt$': '<rootDir>/src/__stubs__/ssts-doc-prompt.ts',
  '^@bitcode/generic-tools-web-search/src/prompts/WebSearchDocCodeToolPrompt$': '<rootDir>/src/__stubs__/web-search-doc-prompt.ts',
  '^@bitcode/artifacts$': '<rootDir>/src/__mocks__/bitcode-artifacts.ts'
};

module.exports = {
  ...tsJestPreset,
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: customModuleNameMapper,
  transform: {
    ...tsJestPreset.transform,
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
};
