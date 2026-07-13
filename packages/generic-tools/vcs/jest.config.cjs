module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  roots: ['<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      diagnostics: false,
    },
  },
  moduleNameMapper: {
    '^@bitcode/generic-tools-editing/execution-context$':
      '<rootDir>/../files-maintaining/src/execution-context.ts',
    '^@bitcode/tools-generics$': '<rootDir>/../../tools-generics/src/index.ts',
    '^@bitcode/tools-generics/(.*)$': '<rootDir>/../../tools-generics/src/$1',
    '^@bitcode/pipelines-generics$': '<rootDir>/../../pipelines-generics/src/index.ts',
    '^@bitcode/pipelines-generics/(.*)$': '<rootDir>/../../pipelines-generics/$1',
    '^@bitcode/vcs-generics$': '<rootDir>/../../vcs/src/index.ts',
    '^@bitcode/vcs-generics/(.*)$': '<rootDir>/../../vcs/src/$1',
    '^@bitcode/supabase$': '<rootDir>/../../supabase/src/index.ts',
    '^@bitcode/supabase/(.*)$': '<rootDir>/../../supabase/src/$1',
    '^@bitcode/errors$': '<rootDir>/../../errors/src/index.ts',
  },
};
