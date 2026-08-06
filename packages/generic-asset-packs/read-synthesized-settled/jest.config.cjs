module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/generic-asset-packs-read-synthesized-settled$': '<rootDir>/src/index.ts',
    '^@bitcode/generic-asset-packs-read-synthesized$':
      '<rootDir>/../read-synthesized/src/index.ts',
    '^@bitcode/generic-asset-packs-synthesis/synthesis-asset-pack$':
      '<rootDir>/../synthesis/src/synthesis-asset-pack.ts',
    '^@bitcode/generic-asset-packs-synthesis$':
      '<rootDir>/../synthesis/src/index.ts',
    '^@bitcode/asset-packs-generics$':
      '<rootDir>/../../asset-packs-generics/src/index.ts',
    '^@bitcode/measurement-generics$':
      '<rootDir>/../../measurement-generics/src/index.ts',
    '^@bitcode/files$': '<rootDir>/../../files/src/index.ts',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../../tsconfig.json', diagnostics: false },
  },
};
