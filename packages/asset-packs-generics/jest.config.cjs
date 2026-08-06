module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/asset-packs-generics$': '<rootDir>/src/index.ts',
    '^@bitcode/asset-packs-generics/(.*)$': '<rootDir>/src/$1',
    '^@bitcode/measurement-generics$': '<rootDir>/../measurement-generics/src/index.ts',
    '^@bitcode/files$': '<rootDir>/../files/src/index.ts',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../tsconfig.json', diagnostics: false },
  },
};
