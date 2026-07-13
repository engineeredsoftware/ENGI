#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_ARTIFACT_PATH,
  buildV44DepositorEarningsSupplyOpportunities,
} from '../packages/protocol/src/canonical/v44-depositor-earnings-supply-opportunities.js';

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

function run(root, command, args) {
  execFileSync(command, args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
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
      'Usage: node scripts/check-v44-gate5-depositor-earnings-supply-opportunities.mjs [--skip-branch-check] [--skip-uapi-tests] [--skip-package-tests] [--repo-root <path>]',
      '',
      'V44 Gate 5 Depositor earnings supply opportunities check: validates likely demand, unfit Need opportunities, ROI posture, source criticality, expected BTC compensation ranges, earning statements, source-safe supply recommendations, route UI, tests, workflows, and generated artifact freshness.',
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
    V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_ARTIFACT_PATH,
    'packages/asset-packs-pipelines/domain/src/depositor-earning-supply-intelligence.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/depositor-earning-supply-intelligence.test.ts',
    'packages/asset-packs-pipelines/domain/src/deposit-asset-pack-option-policy.ts',
    'uapi/app/deposit/deposit-route-model.ts',
    'uapi/app/deposit/DepositPageClient.tsx',
    'uapi/tests/depositRouteModel.test.ts',
    'uapi/tests/depositPageClient.test.tsx',
    'packages/btd/src/source-to-shares.ts',
    'packages/protocol/src/canonical/v44-depositor-earnings-supply-opportunities.js',
    'packages/protocol/test/v44-depositor-earnings-supply-opportunities.test.js',
    'scripts/generate-v44-depositor-earnings-supply-opportunities.mjs',
    'scripts/check-v44-gate5-depositor-earnings-supply-opportunities.mjs',
    'BITCODE_SPEC_V44.md',
    'BITCODE_SPEC_V44_DELTA.md',
    'BITCODE_SPEC_V44_NOTES.md',
    'BITCODE_SPEC_V44_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/protocol/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V44 Gate 5 file: ${relativePath}`);
  }

  const artifact = buildV44DepositorEarningsSupplyOpportunities({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V44 Depositor earnings supply opportunity predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.depositorEarningSupplyIntelligenceImplemented === true, 'Depositor earning supply intelligence must be implemented.');
  assertCheck(failures, artifact.coverage.likelyDemandImplemented === true, 'Likely demand must be implemented.');
  assertCheck(failures, artifact.coverage.unfitNeedOpportunitiesImplemented === true, 'Unfit Need opportunities must be implemented.');
  assertCheck(failures, artifact.coverage.roiPostureImplemented === true, 'ROI posture must be implemented.');
  assertCheck(failures, artifact.coverage.sourceCriticalityPostureImplemented === true, 'Source criticality posture must be implemented.');
  assertCheck(failures, artifact.coverage.expectedCompensationRangesImplemented === true, 'Expected compensation ranges must be implemented.');
  assertCheck(failures, artifact.coverage.earningStatementsImplemented === true, 'Earning statements must be implemented.');
  assertCheck(failures, artifact.coverage.sourceSafeSupplyRecommendationsImplemented === true, 'Source-safe supply recommendations must be implemented.');
  assertCheck(failures, artifact.coverage.depositRouteUiImplemented === true, '/deposit earning UI must be implemented.');
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.rawSourceTextVisible === false, 'Artifact must not expose raw source text.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawPromptVisible === false, 'Artifact must not expose raw prompts.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(failures, artifact.coverage.settlementPrivatePayloadVisible === false, 'Artifact must not expose private settlement payloads.');
  assertCheck(failures, artifact.coverage.valueBearingMainnetAdmitted === false, 'Artifact must not admit value-bearing mainnet operation.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_ARTIFACT_PATH) &&
      read(root, V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_ARTIFACT_PATH) === serialized,
    `${V44_DEPOSITOR_EARNINGS_SUPPLY_OPPORTUNITIES_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v44-depositor-earnings-supply-opportunities"'), 'package.json must expose generate:v44-depositor-earnings-supply-opportunities.');
  assertCheck(failures, packageJson.includes('"check:v44-depositor-earnings-supply-opportunities"'), 'package.json must expose check:v44-depositor-earnings-supply-opportunities.');
  assertCheck(failures, packageJson.includes('"check:v44-gate5"'), 'package.json must expose check:v44-gate5.');
  assertCheck(failures, gateWorkflow.includes('check-v44-gate5-depositor-earnings-supply-opportunities.mjs'), 'Gate workflow must run V44 Gate 5 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v44-gate5-depositor-earnings-supply-opportunities.mjs'), 'Canon workflow must run V44 Gate 5 checker.');

  try {
    run(root, 'node', ['scripts/generate-v44-depositor-earnings-supply-opportunities.mjs', '--check']);
  } catch {
    failures.push('V44 Depositor earnings supply opportunities artifact must be fresh.');
  }

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--dir', 'packages/protocol', 'exec', 'node', '--test', '--test-force-exit', 'test/v44-depositor-earnings-supply-opportunities.test.js']);
    } catch {
      failures.push('packages/protocol/test/v44-depositor-earnings-supply-opportunities.test.js must pass.');
    }

    try {
      run(root, 'pnpm', ['--filter', '@bitcode/asset-packs-pipelines-domain', 'test', '--', 'depositor-earning-supply-intelligence.test.ts', '--runInBand']);
    } catch {
      failures.push('packages/pipelines/asset-pack depositor earning supply intelligence tests must pass.');
    }
  }

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'uapi', 'exec', 'jest', 'depositRouteModel.test.ts', 'depositPageClient.test.tsx', '--runInBand']);
    } catch {
      failures.push('uapi deposit route/page tests must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V44 Gate 5 Depositor earnings supply opportunities check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V44 Gate 5 Depositor earnings supply opportunities check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
