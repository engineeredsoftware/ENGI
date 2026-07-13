module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/generic-artifacts-patch$': '<rootDir>/src/index.ts',
    '^@bitcode/artifact-generics$': '<rootDir>/../../artifact-generics/src/index.ts',
    '^@bitcode/artifact-generics/(.*)$': '<rootDir>/../../artifact-generics/src/$1',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../../tsconfig.json', diagnostics: false },
  },
};
