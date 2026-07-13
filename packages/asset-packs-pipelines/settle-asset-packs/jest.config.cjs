module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/asset-packs-pipelines-settle-asset-packs$': '<rootDir>/src/index.ts',
    '^@bitcode/generic-pipelines-simple$': '<rootDir>/../../generic-pipelines/Simple/src/index.ts',
    '^@bitcode/pipeline-asset-pack$': '<rootDir>/../../asset-packs-pipelines/domain/src/index.ts',
    '^@bitcode/pipeline-asset-pack/(.*)$': '<rootDir>/../../asset-packs-pipelines/domain/src/$1',
    '^@bitcode/execution-generics$': '<rootDir>/../../execution-generics/src/index.ts',
    '^@bitcode/execution-generics/(.*)$': '<rootDir>/../../execution-generics/src/$1',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../../tsconfig.json', diagnostics: false },
  },
};
