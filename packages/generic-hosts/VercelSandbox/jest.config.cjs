module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '^@bitcode/host-generics$': '<rootDir>/../../host-generics/src/index.ts',
    '^@bitcode/host-generics/(.*)$': '<rootDir>/../../host-generics/src/$1',
    '^@bitcode/pipeline-hosts$': '<rootDir>/../../pipeline-hosts/src/index.ts',
    '^@bitcode/pipeline-hosts/(.*)$': '<rootDir>/../../pipeline-hosts/src/$1',
    '^@bitcode/generic-hosts-vercel-sandbox$': '<rootDir>/src/index.ts',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../../tsconfig.json', diagnostics: false },
  },
};
