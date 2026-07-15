#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ARTIFACT_PATH,
  buildV44PacksPortfolioMarketIntelligence,
} from '../packages/specifying/src/canonical/v44-packs-portfolio-market-intelligence.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function run(root, command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
}

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    skipUapiTests: false,
    skipPackageTests: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v44-gate3-packs-portfolio-market-intelligence.mjs [--skip-branch-check] [--skip-uapi-tests] [--skip-package-tests] [--repo-root <path>]',
      '',
      'V44 Gate 3 packs portfolio market intelligence check: validates /packs portfolio positions, saved filters, organization views, market signals, unfit Need surfaces, settlement/compensation facets, proof drilldown, source-safety tests, and generated artifact freshness.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V43', `BITCODE_SPEC.txt must remain V43 during V44 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v44' || /^v44\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V44 work must occur on version/v44 or v44/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ARTIFACT_PATH,
    'apps/uapi/components/bitcode/activity/pack-activity-model.ts',
    'apps/uapi/app/api/packs/activity/route.ts',
    'apps/uapi/app/packs/PacksPageClient.tsx',
    'apps/uapi/tests/packActivityModel.test.ts',
    'packages/specifying/src/canonical/v44-packs-portfolio-market-intelligence.js',
    'packages/specifying/test/v44-packs-portfolio-market-intelligence.test.js',
    'scripts/generate-v44-packs-portfolio-market-intelligence.mjs',
    'scripts/check-v44-gate3-packs-portfolio-market-intelligence.mjs',
    'BITCODE_SPEC_V44.md',
    'BITCODE_SPEC_V44_DELTA.md',
    'BITCODE_SPEC_V44_NOTES.md',
    'BITCODE_SPEC_V44_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V44 Gate 3 file: ${relativePath}`);
  }

  const artifact = buildV44PacksPortfolioMarketIntelligence({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V44 Packs portfolio predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.portfolioPositionsImplemented === true, 'Portfolio positions must be implemented.');
  assertCheck(failures, artifact.coverage.savedFiltersImplemented === true, 'Saved filters must be implemented.');
  assertCheck(failures, artifact.coverage.organizationViewsImplemented === true, 'Organization views must be implemented.');
  assertCheck(failures, artifact.coverage.marketSignalsImplemented === true, 'Market signals must be implemented.');
  assertCheck(failures, artifact.coverage.unfitNeedSignalsImplemented === true, 'Unfit Need signals must be implemented.');
  assertCheck(failures, artifact.coverage.settlementFacetsImplemented === true, 'Settlement facets must be implemented.');
  assertCheck(failures, artifact.coverage.compensationFacetsImplemented === true, 'Compensation facets must be implemented.');
  assertCheck(failures, artifact.coverage.proofRootDrilldownImplemented === true, 'Proof-root drilldown must be implemented.');
  assertCheck(failures, artifact.coverage.noSourceLeakTestsImplemented === true, 'No-source-leak tests must be implemented.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Artifact must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ARTIFACT_PATH) &&
      read(root, V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ARTIFACT_PATH) === serialized,
    `${V44_PACKS_PORTFOLIO_MARKET_INTELLIGENCE_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v44-packs-portfolio-market-intelligence"'), 'package.json must expose generate:v44-packs-portfolio-market-intelligence.');
  assertCheck(failures, packageJson.includes('"check:v44-packs-portfolio-market-intelligence"'), 'package.json must expose check:v44-packs-portfolio-market-intelligence.');
  assertCheck(failures, packageJson.includes('"check:v44-gate3"'), 'package.json must expose check:v44-gate3.');
  assertCheck(failures, gateWorkflow.includes('check-v44-gate3-packs-portfolio-market-intelligence.mjs'), 'Gate workflow must run V44 Gate 3 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v44-gate3-packs-portfolio-market-intelligence.mjs'), 'Canon workflow must run V44 Gate 3 checker.');

  try {
    run(root, 'node', ['scripts/generate-v44-packs-portfolio-market-intelligence.mjs', '--check']);
  } catch {
    failures.push('V44 Packs portfolio market intelligence artifact must be fresh.');
  }

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--dir', 'packages/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v44-packs-portfolio-market-intelligence.test.js']);
    } catch {
      failures.push('packages/specifying/test/v44-packs-portfolio-market-intelligence.test.js must pass.');
    }
  }

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'apps/uapi', 'exec', 'jest', 'packActivityModel.test.ts', '--runInBand']);
    } catch {
      failures.push('uapi packActivityModel.test.ts must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V44 Gate 3 packs portfolio market intelligence check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V44 Gate 3 packs portfolio market intelligence check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
