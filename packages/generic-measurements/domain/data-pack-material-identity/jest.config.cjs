const path = require('path');
const { createJestConfig } = require('../../../../tests/jest.base.cjs');
module.exports = createJestConfig(__dirname, {
  testMatch: [
    '**/__tests__/core/**/*.core.test.(ts|tsx)',
    '**/__tests__/edges/**/*.edges.test.(ts|tsx)',
  ],
  moduleNameMapper: {
    '^@bitcode/generic-measurements-domain-data-pack-material-identity$': path.join(
      __dirname,
      'src/index.ts',
    ),
  },
});
