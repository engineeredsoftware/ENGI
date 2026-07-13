module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/generic-asset-packs-measured-patch$': '<rootDir>/src/index.ts',
    '^@bitcode/asset-packs-generics$': '<rootDir>/../../asset-packs-generics/src/index.ts',
    '^@bitcode/asset-packs-generics/(.*)$': '<rootDir>/../../asset-packs-generics/src/$1',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../../tsconfig.json', diagnostics: false },
  },
};
