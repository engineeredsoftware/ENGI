// Package lives at apps/chatgpt — monorepo packages are under ../../packages.
const customModuleNameMapper = {
  '^@bitcode/btd$': '<rootDir>/../../packages/btd/src/authority.ts',
  '^@bitcode/btd/api-schema-compatibility-matrix$': '<rootDir>/../../packages/btd/src/api-schema-compatibility-matrix.ts',
  '^@bitcode/btd/chatgpt-app-action-contract$': '<rootDir>/../../packages/btd/src/chatgpt-app-action-contract.ts',
  '^@bitcode/btd/interface-authorization-policy$': '<rootDir>/../../packages/btd/src/interface-authorization-policy.ts',
  '^@bitcode/btd/interface-consumer-ux-regression-proof$': '<rootDir>/../../packages/btd/src/interface-consumer-ux-regression-proof.ts',
  '^@bitcode/btd/interface-telemetry-proof-hook$': '<rootDir>/../../packages/btd/src/interface-telemetry-proof-hook.ts',
  '^@bitcode/btd/read-license-assetpack-rights-contract$': '<rootDir>/../../packages/btd/src/read-license-assetpack-rights-contract.ts',
  '^@bitcode/tools-generics$': '<rootDir>/src/__stubs__/tools-generics.ts',
  '^@bitcode/prompts/prompt$': '<rootDir>/../../packages/prompts/src/prompt.ts',
  '^@bitcode/prompts/parts/PromptPart$': '<rootDir>/../../packages/prompts/src/parts/PromptPart.ts',
  '^@bitcode/prompts/formatters$': '<rootDir>/../../packages/prompts/src/formatters/index.ts',
  '^@bitcode/prompts/execution/PromptExecution$': '<rootDir>/../../packages/prompts/src/execution/PromptExecution.ts',
  '^@bitcode/prompts/raw_promptparts/(.*)$': '<rootDir>/../../packages/prompts/src/raw_promptparts/$1',
  '^@bitcode/generic-tools-mcps-aws$': '<rootDir>/src/__stubs__/generic-tools-mcps-aws.ts',
  '^@bitcode/generic-tools-mcps-vercel$': '<rootDir>/src/__stubs__/generic-tools-mcps-vercel.ts',
  '^@bitcode/generic-tools-simple-system-text-search$': '<rootDir>/src/__stubs__/generic-tools-simple-system-text-search.ts',
  '^@bitcode/generic-tools-web-search$': '<rootDir>/src/__stubs__/generic-tools-web-search.ts',
  '^@bitcode/generic-vcs-github$': '<rootDir>/src/__stubs__/github.ts',
  '^@bitcode/vcs-generics$': '<rootDir>/src/__stubs__/vcs.ts',
  '^@bitcode/generic-generations-failsafes$': '<rootDir>/src/__stubs__/context.ts',
  '^@bitcode/generic-tools-mcps-vercel/src/prompts/VercelMCPDocCodeToolPrompt$': '<rootDir>/src/__stubs__/vercel-doc-prompt.ts',
  '^@bitcode/generic-tools-mcps-aws/src/prompts/AWSMCPDocCodeToolPrompt$': '<rootDir>/src/__stubs__/aws-doc-prompt.ts',
  '^@bitcode/generic-tools-simple-system-text-search/src/prompts/SimpleSystemTextSearchDocCodeToolPrompt$': '<rootDir>/src/__stubs__/ssts-doc-prompt.ts',
  '^@bitcode/generic-tools-web-search/src/prompts/WebSearchDocCodeToolPrompt$': '<rootDir>/src/__stubs__/web-search-doc-prompt.ts',
  '^@bitcode/generic-artifacts-compose$': '<rootDir>/src/__mocks__/bitcode-artifacts.ts'
};

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: customModuleNameMapper,
  // Single transform entry so diagnostics:false always applies (preset pattern would win otherwise).
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
        diagnostics: false,
        isolatedModules: true,
      },
    ],
  },
};
