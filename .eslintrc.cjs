/* Root ESLint config wiring GA-1 prompt hierarchy rules */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: { node: true, es6: true, jest: true },
  plugins: ['@typescript-eslint', 'bitcode', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended'
  ],
  rules: {
    'bitcode/no-write-tools-outside-implementation': 'error',
    'bitcode/require-prompt-hierarchy': 'error',
    // Forbid legacy deep-imports into prompts using /src in consumer code.
    // Canonical pattern is: @bitcode/prompts/raw_promptparts/*
    'no-restricted-imports': ['error', {
      'patterns': [
        '@bitcode/prompts/src/raw_promptparts/*'
      ]
    }],
    // Focus on GA-1 custom rules; reduce noise from generic rules
    'no-unused-vars': 'off',
    'no-undef': 'off',
    // The application uses compound UI primitives and colocated small render
    // helpers extensively. Enforce component clarity through reviews and
    // focused refactors rather than a repo-wide one-component-per-file rule.
    'react/no-multi-comp': 'off',
  },
  ignorePatterns: [
    '**/dist/**',
    '**/build/**',
    '**/.turbo/**',
    '**/.next/**',
    '**/node_modules/**',
    '**/*.generated.ts',
    '**/*.d.ts',
  ],
  overrides: [
    // Temporarily allow multiple components in complex route headers
    {
      files: [
        'uapi/app/conversations/components/ConversationsOverlay.tsx',
        'uapi/app/executions/components/ExecutionPageHeader.tsx'
      ],
      rules: {
        'react/no-multi-comp': 'off',
      }
    },
    // Allow multiple components in stories/tests
    {
      files: ['**/*.stories.*', '**/*.test.*'],
      rules: {
        'react/no-multi-comp': 'off',
      }
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      rules: {
        // Disable core rules that are noisy with TS types (handled by TS compiler if needed)
        'no-unused-vars': 'off',
        'no-undef': 'off',
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-redeclare': 'off',
        'no-case-declarations': 'off',
        'no-constant-condition': 'off',
        'no-dupe-class-members': 'off',
        'no-inner-declarations': 'off',
        'no-useless-catch': 'off',
        'no-useless-escape': 'off',
      }
    },
    {
      files: [
        'packages/external-apps/chatgpt/src/tools.ts',
        'packages/generic-tools/files-maintaining/src/__tests__/**',
        'packages/asset-packs-pipelines/domain/src/tools/**',
      ],
      rules: {
        'bitcode/no-write-tools-outside-implementation': 'off',
      }
    },
    {
      files: ['uapi/app/**/*', 'uapi/components/vcs/**/*'],
      rules: {
        // Enforce SSOT: forbid importing UI primitives from the vendored folder
        'no-restricted-imports': ['error', {
          'patterns': [
            '@/components/ui/{button,card,input,label,select,tabs,dialog,alert-dialog,dropdown-menu,avatar,switch,textarea,progress,checkbox,popover,collapsible,command,calendar,tooltip,table,badge,alert}'
          ]
        }],
      }
    },
    {
      files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'react/no-multi-comp': 'off',
        'no-import-assign': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
  settings: {
    react: { version: 'detect' }
  }
};
