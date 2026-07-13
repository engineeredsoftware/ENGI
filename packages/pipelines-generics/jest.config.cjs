const path = require('path');
const { createJestConfig } = require('../../jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@bitcode/pipelines-generics$': path.join(__dirname, 'src/index.ts'),
    '^@bitcode/pipelines-generics/(.*)$': path.join(__dirname, 'src/$1'),
    '^@bitcode/doc-comment-generics$': path.join(__dirname, 'src/__mocks__/doc-comment.ts'),
    '^@bitcode/tools-generics$': path.join(__dirname, 'src/__mocks__/tools-generics.ts'),
    '^@bitcode/api/streams$': path.join(__dirname, '../api/src/streams/index.ts'),
    '^@bitcode/generic-artifacts-compose$': path.join(__dirname, '../generic-artifacts/compose/src/index.ts'),
    '^@bitcode/parsing$': path.join(__dirname, '../parsing/src/parsing.ts'),
    '^@bitcode/logger$': path.join(__dirname, '../logger/src/logger.ts'),
  },
});
