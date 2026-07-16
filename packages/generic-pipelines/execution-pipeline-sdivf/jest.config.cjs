const path = require('path');
const { createJestConfig } = require('../../../tests/jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@bitcode/generic-pipelines-execution-pipeline-sdivf$': path.join(__dirname, 'src/index.ts'),
    '^@bitcode/doc-comment-generics$': path.join(
      __dirname,
      '../../pipelines-generics/src/__mocks__/doc-comment.ts',
    ),
    '^@bitcode/tools-generics$': path.join(
      __dirname,
      '../../pipelines-generics/src/__mocks__/tools-generics.ts',
    ),
  },
});
