module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@bitcode/pipelines-generics$': '<rootDir>/../pipelines-generics/src/index.ts',
    '^@bitcode/pipelines-generics/(.*)$': '<rootDir>/../pipelines-generics/src/$1',
    '^@bitcode/execution-generics$': '<rootDir>/../execution-generics/src/index.ts',
    '^@bitcode/execution-generics/(.*)$': '<rootDir>/../execution-generics/src/$1',
  },
};
