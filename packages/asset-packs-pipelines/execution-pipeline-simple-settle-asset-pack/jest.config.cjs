/**
 * Hand-rolled mappers: createJestConfig's `@bitcode/*` → packages/* catch-all
 * wins first-match over nested package subpaths (e.g. @bitcode/btd/erc1155).
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          module: 'commonjs',
          moduleResolution: 'node',
          target: 'ES2020',
          strict: false,
          skipLibCheck: true,
        },
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack$':
      '<rootDir>/src/index.ts',
    '^@bitcode/execution-generics$': '<rootDir>/../../execution-generics/src/index.ts',
    '^@bitcode/execution-generics/(.*)$': '<rootDir>/../../execution-generics/src/$1',
    '^@bitcode/generic-pipelines-execution-pipeline-simple$':
      '<rootDir>/../../generic-pipelines/execution-pipeline-simple/src/index.ts',
    '^@bitcode/generic-pipelines-execution-pipeline-simple/(.*)$':
      '<rootDir>/../../generic-pipelines/execution-pipeline-simple/src/$1',
    '^@bitcode/pipelines-generics$': '<rootDir>/../../pipelines-generics/src/index.ts',
    '^@bitcode/pipelines-generics/(.*)$': '<rootDir>/../../pipelines-generics/src/$1',
    '^@bitcode/btd/erc1155$': '<rootDir>/../../btd/src/erc1155/index.ts',
    '^@bitcode/btd/(.*)$': '<rootDir>/../../btd/src/$1',
    '^@bitcode/btd$': '<rootDir>/../../btd/src/index.ts',
    '^@bitcode/generic-vcs-git$': '<rootDir>/../../generic-vcs/git/src/index.ts',
    '^@bitcode/generic-asset-packs-read-synthesized-settled$':
      '<rootDir>/../../generic-asset-packs/read-synthesized-settled/src/index.ts',
    '^@bitcode/generic-asset-packs-read-synthesized$':
      '<rootDir>/../../generic-asset-packs/read-synthesized/src/index.ts',
    '^@bitcode/generic-asset-packs-synthesis/synthesis-asset-pack$':
      '<rootDir>/../../generic-asset-packs/synthesis/src/synthesis-asset-pack.ts',
    '^@bitcode/generic-asset-packs-synthesis$':
      '<rootDir>/../../generic-asset-packs/synthesis/src/index.ts',
    '^@bitcode/asset-packs-generics$': '<rootDir>/../../asset-packs-generics/src/index.ts',
    '^@bitcode/measurement-generics$': '<rootDir>/../../measurement-generics/src/index.ts',
    '^@bitcode/files$': '<rootDir>/../../files/src/index.ts',
    '^@bitcode/prompts/(.*)$': '<rootDir>/../../prompts/src/$1',
    '^@bitcode/prompts$': '<rootDir>/../../prompts/src/index.ts',
    '^@bitcode/registry$': '<rootDir>/../../registry/src/index.ts',
    '^@bitcode/logger$': '<rootDir>/../../logger/src/index.ts',
    '^@bitcode/agent-generics$': '<rootDir>/../../agent-generics/src/index.ts',
    '^@bitcode/agent-generics/(.*)$': '<rootDir>/../../agent-generics/src/$1',
    '^@bitcode/llm-generics$': '<rootDir>/../../llm-generics/src/index.ts',
    '^@bitcode/llm-generics/(.*)$': '<rootDir>/../../llm-generics/src/$1',
  },
};
