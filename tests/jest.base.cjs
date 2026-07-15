const path = require('path');
const ts = require('typescript');

// This file lives in tests/; monorepo root is one level up.
const repoRoot = path.resolve(__dirname, '..');

function createModuleNameMapperFromTsconfig(tsconfigPath) {
  const parsed = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const config = parsed.config || {};
  const paths = (config.compilerOptions && config.compilerOptions.paths) || {};

  const mapper = {};

  for (const [alias, targets] of Object.entries(paths)) {
    if (!targets || targets.length === 0) {
      continue;
    }

    let captureIndex = 1;
    const escapedKey = alias
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\*/g, () => `(.*)`);
    const regexKey = `^${escapedKey}$`;

    const target = targets[0];
    const normalizedTarget = target.replace(/\*/g, () => `$${captureIndex++}`);
    mapper[regexKey] = path.join(repoRoot, normalizedTarget);
  }

  return mapper;
}

const sharedModuleNameMapper = createModuleNameMapperFromTsconfig(path.join(repoRoot, 'tsconfig.json'));
const { buildPackageMap } = require('./jest.package-map.cjs');
const hierarchyPackageMapper = buildPackageMap(path.join(repoRoot, 'packages'));

const defaultTransformIgnore = ['node_modules/(?!(@bitcode)/)'];

function createJestConfig(pkgDir, overrides = {}) {
  const tsconfigPath = overrides.tsconfig || path.join(pkgDir, 'tsconfig.json');
  const testEnvironment = overrides.testEnvironment || 'node';

  return {
    rootDir: pkgDir,
    testEnvironment,
    testMatch: overrides.testMatch || [
      '**/__tests__/**/*.test.(ts|tsx|js)',
      '**/?(*.)+(spec|test).(ts|tsx|js)'
    ],
    transform: overrides.transform || {
      '^.+\\.(t|j)sx?$': [
        'ts-jest',
        {
          tsconfig: tsconfigPath,
          diagnostics: false,
          isolatedModules: false
        }
      ]
    },
    moduleNameMapper: {
      // Hierarchy package names first (nested paths), then tsconfig paths, then overrides
      ...hierarchyPackageMapper,
      ...sharedModuleNameMapper,
      ...(overrides.moduleNameMapper || {})
    },
    setupFiles: overrides.setupFiles || [],
    setupFilesAfterEnv: [
      path.join(repoRoot, 'tests', 'jest.setup.cjs'),
      ...(overrides.setupFilesAfterEnv || [])
    ],
    transformIgnorePatterns: overrides.transformIgnorePatterns || defaultTransformIgnore,
    globals: overrides.globals || {},
    collectCoverageFrom: overrides.collectCoverageFrom,
    coverageDirectory: overrides.coverageDirectory,
    extensionsToTreatAsEsm: overrides.extensionsToTreatAsEsm || []
  };
}

module.exports = {
  createJestConfig,
  repoRoot
};
