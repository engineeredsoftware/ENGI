module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          module: 'commonjs',
          moduleResolution: 'node',
          target: 'ES2020',
          strict: false,
          skipLibCheck: true,
        },
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@bitcode/execution-generics$': '<rootDir>/../../execution-generics/src/index.ts',
    '^@bitcode/execution-generics/(.*)$': '<rootDir>/../../execution-generics/src/$1',
    '^@bitcode/generic-pipelines-simple$': '<rootDir>/../../generic-pipelines/simple/src/index.ts',
    '^@bitcode/generic-pipelines-simple/(.*)$': '<rootDir>/../../generic-pipelines/simple/src/$1',
    '^@bitcode/pipelines-generics$': '<rootDir>/../../pipelines-generics/src/index.ts',
    '^@bitcode/pipelines-generics/(.*)$': '<rootDir>/../../pipelines-generics/src/$1',
    '^@bitcode/btd$': '<rootDir>/../../btd/src/index.ts',
    '^@bitcode/btd/erc1155$': '<rootDir>/../../btd/src/erc1155/index.ts',
    '^@bitcode/btd/(.*)$': '<rootDir>/../../btd/src/$1',
    '^@bitcode/generic-vcs-git$': '<rootDir>/../../generic-vcs/git/src/index.ts',
  },
};
