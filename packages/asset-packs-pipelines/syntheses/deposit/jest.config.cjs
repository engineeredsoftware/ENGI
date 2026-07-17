const path = require('path');
const { createJestConfig } = require('../../../../tests/jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs$':
      path.join(__dirname, 'src/index.ts'),
  },
});
