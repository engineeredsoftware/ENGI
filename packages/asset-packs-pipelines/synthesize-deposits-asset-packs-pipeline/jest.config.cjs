module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/asset-packs-pipelines-synthesize-deposits-asset-packs-pipeline$': '<rootDir>/src/index.ts',
    '^@bitcode/generic-pipelines-sdivf$': '<rootDir>/../../generic-pipelines/SDIVF/src/index.ts',
    '^@bitcode/asset-packs-pipelines-domain$': '<rootDir>/../../asset-packs-pipelines/domain/src/index.ts',
    '^@bitcode/asset-packs-pipelines-domain/(.*)$': '<rootDir>/../../asset-packs-pipelines/domain/src/$1',
    '^@bitcode/execution-generics$': '<rootDir>/../../execution-generics/src/index.ts',
    '^@bitcode/execution-generics/(.*)$': '<rootDir>/../../execution-generics/src/$1',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../../tsconfig.json', diagnostics: false },
  },
};
