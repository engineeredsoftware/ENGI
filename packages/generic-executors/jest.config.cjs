module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/generic-executors$': '<rootDir>/src/index.ts',
    '^@bitcode/executor-generics$': '<rootDir>/../executor-generics/src/index.ts',
    '^@bitcode/execution-generics$': '<rootDir>/../execution-generics/src/index.ts',
    '^@bitcode/execution-generics/(.*)$': '<rootDir>/../execution-generics/src/$1',
    '^@bitcode/logger$': '<rootDir>/../logger/src/index.ts',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../tsconfig.json', diagnostics: false },
  },
};
