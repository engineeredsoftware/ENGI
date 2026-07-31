const path = require('path');
const { createJestConfig } = require('../../../../tests/jest.base.cjs');

module.exports = createJestConfig(__dirname, {
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@bitcode/asset-packs-pipelines-execution-pipeline-sdivf-synthesize-deposits-asset-packs$':
      path.join(__dirname, 'src/index.ts'),
    // Package name is generic-tools-editing; on-disk folder is files-maintaining.
    '^@bitcode/generic-tools-editing$': path.join(
      __dirname,
      '../../../generic-tools/files-maintaining/src/index.ts',
    ),
    '^@bitcode/generic-tools-editing/(.*)$': path.join(
      __dirname,
      '../../../generic-tools/files-maintaining/src/$1',
    ),
    '^@bitcode/asset-packs-pipelines-syntheses-domain/(.*)$': path.join(
      __dirname,
      '../domain/src/$1',
    ),
    '^@bitcode/generic-llms-models/src/(.*)$': path.join(
      __dirname,
      '../../../generic-llms/models/src/$1',
    ),
    '^@bitcode/generic-llms-models/(.*)$': path.join(
      __dirname,
      '../../../generic-llms/models/src/$1',
    ),
  },
});
