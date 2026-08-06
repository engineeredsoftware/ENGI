module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/generic-attachments-external$': '<rootDir>/src/index.ts',
    '^@bitcode/attachment-generics$': '<rootDir>/../../attachment-generics/src/index.ts',
  },
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../../../tsconfig.json', diagnostics: false },
  },
};
