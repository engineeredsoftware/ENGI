module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/asset-packs-synthesis$': '<rootDir>/src/index.ts',
    '^@bitcode/artifact-generics$': '<rootDir>/../../artifact-generics/src/index.ts',
    '^@bitcode/generic-artifacts-patch$': '<rootDir>/../../generic-artifacts/patch/src/index.ts',
    '^@bitcode/asset-packs-generics$': '<rootDir>/../../asset-packs-generics/src/index.ts',
    '^@bitcode/measurement-generics$': '<rootDir>/../../measurement-generics/src/index.ts',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../../tsconfig.json', diagnostics: false },
  },
};
