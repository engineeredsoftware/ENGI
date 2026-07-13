module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '^@bitcode/host-generics$': '<rootDir>/../../host-generics/src/index.ts',
    '^@bitcode/host-generics/(.*)$': '<rootDir>/../../host-generics/src/$1',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../../tsconfig.json', diagnostics: false },
  },
};
