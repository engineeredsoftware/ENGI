const path = require('path');
const ts = require('typescript');
const { pathsToModuleNameMapper } = require('ts-jest');

const rootTsconfigPath = path.resolve(__dirname, '../../../tsconfig.json');
const { config: rootTsconfig } = ts.readConfigFile(rootTsconfigPath, ts.sys.readFile);
const compilerOptions = rootTsconfig && rootTsconfig.compilerOptions ? rootTsconfig.compilerOptions : {};
const rootMapper = pathsToModuleNameMapper(compilerOptions.paths || {}, {
  prefix: '<rootDir>/../../../',
});
delete rootMapper['^@bitcode/(.*)$'];

const explicitMapper = {
  '^@bitcode/pipelines-generics$': '<rootDir>/../../../packages/pipelines-generics/src/index.ts',
  '^@bitcode/pipelines-generics/src/llm/dry_running/config$': '<rootDir>/src/__stubs__/dry-run-config.ts',
  '^@bitcode/pipelines-generics/src/(.*)$': '<rootDir>/../../../packages/pipelines-generics/src/$1',
  '^@bitcode/pipelines-generics/(.*)$': '<rootDir>/../../../packages/pipelines-generics/src/$1',
  '^@bitcode/pipelines/asset-pack$': '<rootDir>/../../../packages/pipelines/asset-pack/src/index.ts',
  '^@bitcode/agent-generics$': '<rootDir>/../../../packages/agent-generics/src/index.ts',
  '^@bitcode/agent-generics/(.*)$': '<rootDir>/../../../packages/agent-generics/src/$1',
  '^@bitcode/generic-llms$': '<rootDir>/../../../packages/generic-llms/registry/src/index.ts',
  '^@bitcode/generic-llms/defaults$': '<rootDir>/../../../packages/generic-llms/defaults/src/index.ts',
  '^@bitcode/generic-llms-defaults$': '<rootDir>/../../../packages/generic-llms/defaults/src/index.ts',
  '^@bitcode/generic-llms-xai$': '<rootDir>/../../../packages/generic-llms/xAI/src/index.ts',
  '^@bitcode/generic-llms-openai$': '<rootDir>/../../../packages/generic-llms/OpenAI/src/index.ts',
  '^@bitcode/generic-llms-anthropic$': '<rootDir>/../../../packages/generic-llms/Anthropic/src/index.ts',
  '^@bitcode/generic-llms-google$': '<rootDir>/../../../packages/generic-llms/Google/src/index.ts',
  '^@bitcode/llm-generics$': '<rootDir>/../../../packages/llm-generics/src/index.ts',
  '^@bitcode/llm-generics/(.*)$': '<rootDir>/../../../packages/llm-generics/src/$1',
  '^@bitcode/execution-generics$': '<rootDir>/../../../packages/execution-generics/src/index.ts',
  '^@bitcode/execution-generics/(.*)$': '<rootDir>/../../../packages/execution-generics/src/$1',
  '^@bitcode/tools-generics$': '<rootDir>/../../../packages/tools-generics/src/index.ts',
  '^@bitcode/tools-generics/(.*)$': '<rootDir>/../../../packages/tools-generics/src/$1',
  '^@bitcode/registry$': '<rootDir>/../../../packages/registry/src/index.ts',
  '^@bitcode/registry/(.*)$': '<rootDir>/../../../packages/registry/src/$1',
  '^@bitcode/prompts$': '<rootDir>/../../../packages/prompts/src/index.ts',
  '^@bitcode/prompts/(.*)$': '<rootDir>/../../../packages/prompts/src/$1',
  '^@bitcode/doc-comment-generics$': '<rootDir>/../../../packages/doc-comment-generics/src/index.ts',
  '^@bitcode/doc-comment-generics/(.*)$': '<rootDir>/../../../packages/doc-comment-generics/src/$1',
  '^@bitcode/doc-comment$': '<rootDir>/../../../packages/doc-comment/src/index.ts',
  '^@bitcode/doc-comment/(.*)$': '<rootDir>/../../../packages/doc-comment/src/$1',
  '^@bitcode/generic-doc-comments-doc-code$': '<rootDir>/../../../packages/generic-doc-comments/doc-code/src/index.ts',
  '^@bitcode/generic-doc-comments-doc-developing$': '<rootDir>/../../../packages/generic-doc-comments/doc-developing/src/index.ts',
  '^@bitcode/generic-tools-editing$': '<rootDir>/../../../packages/generic-tools/files-maintaining/src/index.ts',
  '^@bitcode/generic-tools-editing/(.*)$': '<rootDir>/../../../packages/generic-tools/files-maintaining/src/$1',
  '^@bitcode/vcs-tools$': '<rootDir>/../../../packages/generic-tools/vcs/src/index.ts',
  '^@bitcode/file-editing$': '<rootDir>/../../../packages/file-editing/src/index.ts',
  '^@bitcode/file-editing/(.*)$': '<rootDir>/../../../packages/file-editing/src/$1',
  '^@bitcode/editing$': '<rootDir>/../../../packages/editing/src/index.ts',
  '^@bitcode/editing/(.*)$': '<rootDir>/../../../packages/editing/src/$1',
  '^@bitcode/generic-tools/(.*)/src/(.*)$': '<rootDir>/../../../packages/generic-tools/$1/src/$2',
  '^@bitcode/supabase$': '<rootDir>/../../../packages/supabase/src/index.ts',
  '^@bitcode/supabase/src/ssr/admin$': '<rootDir>/../../../packages/supabase/src/ssr/admin.ts',
  '^@bitcode/supabase/(.*)$': '<rootDir>/../../../packages/supabase/src/$1',
  '^@bitcode/artifacts$': '<rootDir>/../../../packages/artifacts/src/artifacts.ts',
  '^@bitcode/logger$': '<rootDir>/../../../packages/logger/src/logger.ts',
  '^@bitcode/observability$': '<rootDir>/../../../packages/observability/src/observability.ts',
  '^@bitcode/errors$': '<rootDir>/../../../packages/errors/src/errors.ts',
  '^@bitcode/sentry$': '<rootDir>/../../../packages/sentry/src/sentry.ts',
  '^@bitcode/streams$': '<rootDir>/../../../packages/streams/src/index.ts',
  '^@bitcode/orm$': '<rootDir>/../../../packages/orm/src/index.ts',
  '^@bitcode/jira-tools$': '<rootDir>/../../../packages/jira/src/index.ts',
  '^@bitcode/pipeline-recovery$': '<rootDir>/src/__stubs__/pipeline-recovery.ts',
  '^@bitcode/generic-mcps-bitcode$': '<rootDir>/src/index.ts',
  '^@bitcode/mcp-server$': '<rootDir>/src/index.ts',
  '^@bitcode/mcp-generics$': '<rootDir>/../../mcp-generics/src/index.ts',
  '^@bitcode/mcp$': '<rootDir>/../../mcp-generics/src/index.ts',
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/mcpTestSetup.ts'],
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    ...explicitMapper,
    ...rootMapper,
  },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  testTimeout: 30000,
};
