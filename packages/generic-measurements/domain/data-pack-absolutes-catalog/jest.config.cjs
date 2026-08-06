const path = require('path');
const { createJestConfig } = require('../../../../tests/jest.base.cjs');
module.exports = createJestConfig(__dirname, {
  testMatch: ['**/__tests__/core/**/*.core.test.(ts|tsx)'],
  moduleNameMapper: {
    '^@bitcode/generic-measurements-domain-data-pack-absolutes-catalog$': path.join(__dirname, 'src/index.ts'),
    '^@bitcode/measurement-generics$': path.join(__dirname, '../../../measurement-generics/src/index.ts'),
  },
});
