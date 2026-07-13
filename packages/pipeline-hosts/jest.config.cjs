module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  roots: ['<rootDir>'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../tsconfig.json',
      diagnostics: false,
    },
  },
};
module.exports.moduleNameMapper = {
  '^@bitcode/host-generics$': '<rootDir>/../host-generics/src/index.ts',
  '^@bitcode/host-generics/(.*)$': '<rootDir>/../host-generics/src/$1',
  '^@bitcode/generic-hosts-local$': '<rootDir>/../generic-hosts/Local/src/index.ts',
  '^@bitcode/generic-hosts-vercel-sandbox$': '<rootDir>/../generic-hosts/VercelSandbox/src/index.ts',
};
