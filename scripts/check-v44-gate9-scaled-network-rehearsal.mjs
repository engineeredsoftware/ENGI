#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH,
  V44_SCALED_NETWORK_REHEARSAL_MINIMUM_COUNTS,
  buildV44ScaledNetworkRehearsal,
} from '../packages/specifying/src/canonical/v44-scaled-network-rehearsal.js';

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

function run(root, command, args, options = {}) {
  execFileSync(command, args, {
    cwd: root,
    stdio: 'pipe',
    encoding: 'utf8',
    env: options.env ?? process.env,
  });
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
    skipOperatorDryRun: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-uapi-tests') args.skipUapiTests = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--skip-operator-dry-run') args.skipOperatorDryRun = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v44-gate9-scaled-network-rehearsal.mjs [--skip-branch-check] [--skip-uapi-tests] [--skip-package-tests] [--skip-operator-dry-run] [--repo-root <path>]',
      '',
      'V44 Gate 9 scaled network rehearsal check: validates package-backed many-pack local/staging-testnet rehearsal proof, source-safe operator receipts, generated artifact freshness, workflows, docs, and protocol exports.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function parseJsonOutput(result, failures, laneId) {
  if (result.status !== 0) {
    failures.push(`V44 scaled network rehearsal ${laneId} dry-run must exit successfully.`);
    return null;
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    failures.push(`V44 scaled network rehearsal ${laneId} dry-run must emit JSON.`);
    return null;
  }
}

function assertReceipt(failures, receipt, laneId) {
  if (!receipt) return;
  assertCheck(failures, receipt.schema === 'bitcode.v44.scaledNetworkRehearsal.operatorReceipt', `${laneId} receipt schema must match.`);
  assertCheck(failures, receipt.version === 'V44', `${laneId} receipt must be V44.`);
  assertCheck(failures, receipt.currentTarget === 'V43', `${laneId} receipt must keep V43 current target.`);
  assertCheck(failures, receipt.laneId === laneId, `${laneId} receipt lane must match.`);
  assertCheck(failures, receipt.ready === true, `${laneId} receipt must be ready with test environment.`);
  assertCheck(failures, receipt.dryRun === true, `${laneId} receipt must be dry-run by default.`);
  assertCheck(failures, receipt.routes?.join(',') === '/deposit,/read,/packs', `${laneId} receipt must cover /deposit, /read, and /packs.`);
  assertCheck(failures, Array.isArray(receipt.stages) && receipt.stages.length === 9, `${laneId} receipt must cover nine rehearsal stages.`);
  assertCheck(failures, receipt.scaleCounts?.depositCount === 24, `${laneId} receipt must bind 24 deposits.`);
  assertCheck(failures, receipt.scaleCounts?.readCount === 18, `${laneId} receipt must bind 18 Reads.`);
  assertCheck(failures, receipt.scaleCounts?.fitCandidateCount === 72, `${laneId} receipt must bind 72 Fits.`);
  assertCheck(failures, receipt.scaleCounts?.quoteCount === 18, `${laneId} receipt must bind 18 quotes.`);
  assertCheck(failures, receipt.scaleCounts?.settlementObservationCount === 12, `${laneId} receipt must bind 12 settlement observations.`);
  assertCheck(failures, receipt.scaleCounts?.contributorCount === 36, `${laneId} receipt must bind 36 contributors.`);
  assertCheck(failures, receipt.scaleCounts?.repairCaseCount === 8, `${laneId} receipt must bind 8 repair cases.`);
  assertCheck(failures, receipt.scaleCounts?.packActivityRows === 54, `${laneId} receipt must bind 54 PackActivity rows.`);
  assertCheck(failures, receipt.sourceSafety?.sourceSafeMetadataOnly === true, `${laneId} receipt must be source-safe metadata.`);
  assertCheck(failures, receipt.sourceSafety?.secretValueSerialized === false, `${laneId} receipt must not serialize secret values.`);
  assertCheck(failures, receipt.sourceSafety?.protectedSourcePayloadSerialized === false, `${laneId} receipt must not serialize protected source.`);
  assertCheck(failures, receipt.sourceSafety?.unpaidAssetPackSourceVisible === false, `${laneId} receipt must not expose unpaid AssetPack source.`);
  assertCheck(failures, receipt.sourceSafety?.valueBearingMainnetAdmitted === false, `${laneId} receipt must block value-bearing mainnet.`);
  assertCheck(failures, receipt.command?.liveExecutionOptInRequired === true, `${laneId} receipt must require live execution opt-in.`);
  assertCheck(failures, typeof receipt.receiptRoot === 'string' && receipt.receiptRoot.startsWith('sha256:'), `${laneId} receipt must include receiptRoot.`);
  const serialized = JSON.stringify(receipt);
  for (const forbidden of ['dummy-do-not-serialize', 'oidc_dummy_do_not_serialize', 'admin_dummy_do_not_serialize']) {
    assertCheck(failures, !serialized.includes(forbidden), `${laneId} receipt must not serialize ${forbidden}.`);
  }
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
    V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH,
    'packages/specifying/src/canonical/v44-scaled-network-rehearsal.js',
    'packages/specifying/test/v44-scaled-network-rehearsal.test.js',
    'scripts/generate-v44-scaled-network-rehearsal.mjs',
    'scripts/check-v44-gate9-scaled-network-rehearsal.mjs',
    'scripts/rehearse-v44-scaled-network-flow.mjs',
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
    assertCheck(failures, exists(root, relativePath), `Missing required V44 Gate 9 file: ${relativePath}`);
  }

  const artifact = buildV44ScaledNetworkRehearsal({ repoRoot: root });
  assertCheck(failures, artifact.passed, `V44 scaled network rehearsal predicates failed: ${artifact.coverage.failedPredicateIds.join(', ')}`);
  assertCheck(failures, artifact.coverage.rowCount === 12, 'Scaled rehearsal must bind twelve contract rows.');
  assertCheck(failures, artifact.coverage.laneCount === 2, 'Scaled rehearsal must bind local and staging-testnet lanes.');
  assertCheck(failures, artifact.coverage.routeCount === 3, 'Scaled rehearsal must bind /deposit, /read, and /packs routes.');
  assertCheck(failures, artifact.coverage.stageCount === 9, 'Scaled rehearsal must bind nine economic stages.');
  assertCheck(failures, artifact.coverage.gateArtifactCount === 7, 'Scaled rehearsal must consume Gate 2 through Gate 8 artifacts.');
  assertCheck(failures, artifact.coverage.stagingProjectRef === 'tkpyosihuouusyaxtbau', 'Scaled rehearsal must bind staging-testnet Supabase ref.');
  assertCheck(failures, artifact.coverage.stagingRestHost === 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/', 'Scaled rehearsal must bind staging-testnet Data API host.');
  for (const [key, value] of Object.entries(V44_SCALED_NETWORK_REHEARSAL_MINIMUM_COUNTS)) {
    assertCheck(failures, artifact.coverage.minimumCounts?.[key] === value, `Scaled rehearsal count ${key} must equal ${value}.`);
  }
  for (const key of [
    'localLaneCovered',
    'stagingTestnetLaneCovered',
    'manyDepositsCovered',
    'manyReadsCovered',
    'manyFitsCovered',
    'manyQuotesCovered',
    'manySettlementsCovered',
    'manyContributorsCovered',
    'repairMatrixCovered',
    'portfolioReadbackCovered',
    'telemetryDatabaseReadbackCovered',
    'ledgerDatabaseStorageSynchronized',
    'mainnetValueBearingBlocked',
    'sourceSafeMetadataOnly',
  ]) {
    assertCheck(failures, artifact.coverage[key] === true, `Scaled rehearsal coverage ${key} must be true.`);
  }
  for (const key of [
    'protectedSourcePayloadSerialized',
    'rawSourceTextVisible',
    'unpaidAssetPackSourceVisible',
    'rawPromptVisible',
    'rawProviderResponseVisible',
    'credentialsSerialized',
    'walletPrivateMaterialVisible',
    'privateSettlementPayloadVisible',
    'liveRehearsalLogPayloadSerialized',
  ]) {
    assertCheck(failures, artifact.coverage[key] === false, `Scaled rehearsal coverage ${key} must be false.`);
  }

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH) &&
      read(root, V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH) === serialized,
    `${V44_SCALED_NETWORK_REHEARSAL_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  assertCheck(failures, packageJson.includes('"rehearse:v44-scaled-network"'), 'package.json must expose rehearse:v44-scaled-network.');
  assertCheck(failures, packageJson.includes('"generate:v44-scaled-network-rehearsal"'), 'package.json must expose generate:v44-scaled-network-rehearsal.');
  assertCheck(failures, packageJson.includes('"check:v44-scaled-network-rehearsal"'), 'package.json must expose check:v44-scaled-network-rehearsal.');
  assertCheck(failures, packageJson.includes('"check:v44-gate9"'), 'package.json must expose check:v44-gate9.');
  assertCheck(failures, gateWorkflow.includes('check-v44-gate9-scaled-network-rehearsal.mjs'), 'Gate workflow must run V44 Gate 9 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v44-gate9-scaled-network-rehearsal.mjs'), 'Canon workflow must run V44 Gate 9 checker.');

  try {
    run(root, 'node', ['scripts/generate-v44-scaled-network-rehearsal.mjs', '--check']);
  } catch {
    failures.push('V44 scaled network rehearsal artifact must be fresh.');
  }

  if (!args.skipOperatorDryRun) {
    const dryRunEnv = {
      ...process.env,
      OPENAI_API_KEY: `${['sk', 'proj'].join('-')}-dummy-do-not-serialize-000000000000`,
      VERCEL_OIDC_TOKEN: 'oidc_dummy_do_not_serialize',
      BITCODE_RUN_VERCEL_SANDBOX_HARNESS: '1',
      BITCODE_ENABLE_PIPELINE_HARNESS_API: '1',
      BITCODE_ASSET_PACK_REAL_INFERENCE: '1',
      BITCODE_PIPELINE_STREAM_TO_DATABASE: '1',
      SUPABASE_URL: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
      SUPABASE_ANON_KEY: 'anon_dummy_do_not_serialize',
      SUPABASE_SECRET_KEY: 'admin_dummy_do_not_serialize',
    };
    for (const laneId of ['local', 'staging-testnet']) {
      const result = spawnSync(
        process.execPath,
        ['scripts/rehearse-v44-scaled-network-flow.mjs', '--lane', laneId, '--dry-run', '--json'],
        { cwd: root, encoding: 'utf8', env: dryRunEnv },
      );
      assertReceipt(failures, parseJsonOutput(result, failures, laneId), laneId);
    }
  }

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', ['--dir', 'packages/specifying', 'exec', 'node', '--test', '--test-force-exit', 'test/v44-scaled-network-rehearsal.test.js']);
    } catch {
      failures.push('packages/specifying/test/v44-scaled-network-rehearsal.test.js must pass.');
    }
  }

  if (!args.skipUapiTests) {
    try {
      run(root, 'pnpm', ['--dir', 'uapi', 'exec', 'jest', 'packsPageClient.test.tsx', 'readPageClient.test.tsx', 'depositPageClient.test.tsx', '--runInBand']);
    } catch {
      failures.push('uapi enterprise route tests must pass for Gate 9 scaled readback.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V44 Gate 9 scaled network rehearsal check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V44 Gate 9 scaled network rehearsal check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
