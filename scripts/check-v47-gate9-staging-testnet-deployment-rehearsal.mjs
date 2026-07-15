#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH,
  buildV47StagingTestnetDeploymentRehearsal,
} from '../scripts/specifying/src/canonical/v47-staging-testnet-deployment-rehearsal.js';

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
    skipPackageTests: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v47-gate9-staging-testnet-deployment-rehearsal.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V47 Gate 9 staging-testnet deployment rehearsal: deployment truth sources, lane receipts, realistic-data contract, settlement ordering law, blocked mainnet posture, generated artifact freshness, workflows, and focused tests.',
      'Lane receipts are dry-run; live deployment execution remains operator opt-in outside this checker.',
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V46', `BITCODE_SPEC.txt must remain V46 during V47 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v47' || /^v47\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V47 work must occur on version/v47 or v47/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v47-staging-testnet-deployment-rehearsal.js',
    'scripts/specifying/test/v47-staging-testnet-deployment-rehearsal.test.js',
    'scripts/generate-v47-staging-testnet-deployment-rehearsal.mjs',
    'scripts/check-v47-gate9-staging-testnet-deployment-rehearsal.mjs',
    'specifications/BITCODE_SPEC_V47.md',
    'specifications/BITCODE_SPEC_V47_DELTA.md',
    'specifications/BITCODE_SPEC_V47_NOTES.md',
    'specifications/BITCODE_SPEC_V47_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'vercel.json',
    'supabase/config.toml',
    'supabase/migrations/001_v26_production.sql',
    'supabase/migrations/002_v27_btd_crypto_registry.sql',
    'Dockerfile.long-runner',
    'Dockerfile.long-runner-worker',
    'containers/k8/long-runner.yaml',
    'apps/uapi/package.json',
    'apps/uapi/tests/e2e/commercial-mvp.ip-exchange.spec.ts',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V47 Gate 9 file: ${relativePath}`);
  }

  const artifact = buildV47StagingTestnetDeploymentRehearsal({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V47 staging-testnet rehearsal predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.fullStackLaneComplete === true, 'Full-stack lane must be complete.');
  assertCheck(
    failures,
    artifact.coverage.realisticDataContractSatisfied === true,
    'Realistic-data contract must be satisfied.',
  );
  assertCheck(
    failures,
    artifact.coverage.settlementObservationOrdered === true,
    'BTC-testnet settlement observation ordering law must be rehearsed.',
  );
  assertCheck(failures, artifact.coverage.mainnetBlockedRehearsed === true, 'Blocked value-bearing mainnet must be rehearsed.');
  assertCheck(
    failures,
    artifact.coverage.liveExecutionOptInRequired === true,
    'Live execution must remain operator opt-in.',
  );
  assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Artifact must be source-safe metadata only.');
  assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Artifact must not expose protected source.');
  assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Artifact must not expose unpaid AssetPack source.');
  assertCheck(failures, artifact.coverage.rawProviderResponseVisible === false, 'Artifact must not expose raw provider responses.');
  assertCheck(failures, artifact.coverage.walletPrivateMaterialVisible === false, 'Artifact must not expose wallet private material.');
  assertCheck(
    failures,
    artifact.coverage.liveServiceCredentialsSerialized === false,
    'Artifact must not serialize live service credentials.',
  );
  assertCheck(failures, artifact.coverage.valueBearingMainnetEnabled === false, 'Value-bearing mainnet must remain disabled.');

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH) &&
      read(root, V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH) === serialized,
    `${V47_STAGING_TESTNET_REHEARSAL_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"generate:v47-staging-testnet-deployment-rehearsal"'), 'package.json must expose generate:v47-staging-testnet-deployment-rehearsal.');
  assertCheck(failures, packageJson.includes('"check:v47-staging-testnet-deployment-rehearsal"'), 'package.json must expose check:v47-staging-testnet-deployment-rehearsal.');
  assertCheck(failures, packageJson.includes('"check:v47-gate9"'), 'package.json must expose check:v47-gate9.');
  assertCheck(failures, gateWorkflow.includes('check-v47-gate9-staging-testnet-deployment-rehearsal.mjs'), 'Gate workflow must run V47 Gate 9 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v47-gate9-staging-testnet-deployment-rehearsal.mjs'), 'Canon workflow must run V47 Gate 9 checker.');

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'scripts/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v47-staging-testnet-deployment-rehearsal.test.js',
      ]);
    } catch {
      failures.push('scripts/specifying test/v47-staging-testnet-deployment-rehearsal.test.js must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V47 Gate 9 staging-testnet deployment rehearsal check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V47 Gate 9 staging-testnet deployment rehearsal check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
