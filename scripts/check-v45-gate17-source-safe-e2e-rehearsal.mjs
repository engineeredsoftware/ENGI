#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH,
  V45_SOURCE_SAFE_E2E_REHEARSAL_EVIDENCE_CLASS_IDS,
  V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS,
  V45_SOURCE_SAFE_E2E_REHEARSAL_SCHEMA_ID,
  buildV45SourceSafeEndToEndRehearsal,
} from '../scripts/specifying/src/canonical/v45-source-safe-e2e-rehearsal.js';

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
  return execFileSync(command, args, {
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
    skipPackageTests: false,
    skipOperatorDryRun: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
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
      'Usage: node scripts/check-v45-gate17-source-safe-e2e-rehearsal.mjs [--skip-branch-check] [--skip-package-tests] [--skip-operator-dry-run] [--repo-root <path>]',
      '',
      'Checks V45 Gate 17 source-safe end-to-end rehearsal artifacts, repair behavior, operator receipts, docs, workflows, and generated artifact freshness.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function parseReceipt(result, failures, label) {
  if (result.status !== 0) {
    failures.push(`${label} operator dry-run must exit successfully: ${result.stderr || result.stdout}`);
    return null;
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    failures.push(`${label} operator dry-run must emit JSON.`);
    return null;
  }
}

function assertReceipt(failures, receipt, laneId, expectedStatus = 'completed_source_safe') {
  if (!receipt) return;
  assertCheck(failures, receipt.schema === 'bitcode.v45.sourceSafeEndToEndRehearsal.operatorReceipt', `${laneId} receipt schema must match.`);
  assertCheck(failures, receipt.version === 'V45', `${laneId} receipt version must be V45.`);
  assertCheck(failures, receipt.currentTarget === 'V44', `${laneId} receipt current target must remain V44.`);
  assertCheck(failures, receipt.laneId === laneId, `${laneId} receipt lane must match.`);
  assertCheck(failures, receipt.dryRun === true, `${laneId} receipt must be dry-run in checker.`);
  assertCheck(failures, receipt.liveExecutionOptInRequired === true, `${laneId} receipt must require live execution opt-in.`);
  assertCheck(failures, receipt.rehearsalStatus === expectedStatus, `${laneId} receipt status must be ${expectedStatus}.`);
  assertCheck(failures, receipt.sourceSafety?.sourceSafeMetadataOnly === true, `${laneId} receipt must be source-safe metadata.`);
  assertCheck(failures, receipt.sourceSafety?.secretValueSerialized === false, `${laneId} receipt must not serialize secret values.`);
  assertCheck(failures, receipt.sourceSafety?.protectedSourcePayloadSerialized === false, `${laneId} receipt must not serialize protected source.`);
  assertCheck(failures, receipt.sourceSafety?.unpaidAssetPackSourceVisible === false, `${laneId} receipt must not expose unpaid AssetPack source.`);
  assertCheck(failures, receipt.sourceSafety?.rawPromptVisible === false, `${laneId} receipt must not expose raw prompts.`);
  assertCheck(failures, receipt.sourceSafety?.rawProviderResponseVisible === false, `${laneId} receipt must not expose raw provider responses.`);
  assertCheck(failures, receipt.sourceSafety?.walletPrivateMaterialVisible === false, `${laneId} receipt must not expose wallet private material.`);
  assertCheck(failures, receipt.sourceSafety?.valueBearingMainnetAdmitted === false, `${laneId} receipt must block value-bearing mainnet.`);
  assertCheck(failures, Array.isArray(receipt.evidenceClassIds) && receipt.evidenceClassIds.length === V45_SOURCE_SAFE_E2E_REHEARSAL_EVIDENCE_CLASS_IDS.length, `${laneId} receipt must cover all evidence classes.`);
  for (const rootName of [
    'artifactRoot',
    'telemetrySummaryRoot',
    'ledgerReadbackRoot',
    'databaseReadbackRoot',
    'storageReadbackRoot',
    'browserReceiptRoot',
    'repairRoot',
  ]) {
    assertCheck(failures, typeof receipt.roots?.[rootName] === 'string', `${laneId} receipt must include ${rootName}.`);
  }
  const serialized = JSON.stringify(receipt);
  for (const forbidden of ['sk-', 'sb_secret', 'eyJhbGci', 'PRIVATE KEY']) {
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 Gate 17 work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v45' || /^v45\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 work must occur on version/v45 or v45/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH,
    'scripts/specifying/src/canonical/v45-source-safe-e2e-rehearsal.js',
    'scripts/specifying/test/v45-source-safe-e2e-rehearsal.test.js',
    'scripts/generate-v45-source-safe-e2e-rehearsal.mjs',
    'scripts/check-v45-gate17-source-safe-e2e-rehearsal.mjs',
    'scripts/rehearse-v45-source-safe-e2e.mjs',
    '.specifications/BITCODE_SPEC_V45.md',
    '.specifications/BITCODE_SPEC_V45_DELTA.md',
    '.specifications/BITCODE_SPEC_V45_NOTES.md',
    '.specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md',
    'README.md',
    'scripts/specifying/README.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 17 file: ${relativePath}`);
  }

  const artifact = buildV45SourceSafeEndToEndRehearsal({ repoRoot: root });
  assertCheck(failures, artifact.schemaId === V45_SOURCE_SAFE_E2E_REHEARSAL_SCHEMA_ID, 'Artifact schema must match Gate 17 schema.');
  assertCheck(failures, artifact.passed === true, `V45 Gate 17 artifact must pass: ${(artifact.coverage.failedPredicateIds || []).join(', ')}`);
  assertCheck(failures, artifact.rehearsalStatus === 'completed_source_safe', 'Successful V45 Gate 17 artifact must be completed_source_safe.');
  assertCheck(failures, artifact.coverage.rowCount === 13, 'V45 Gate 17 must bind thirteen rehearsal rows.');
  assertCheck(failures, artifact.coverage.laneCount === 3, 'V45 Gate 17 must bind local, staging-testnet, and blocked mainnet lanes.');
  assertCheck(failures, artifact.coverage.stageCount === 11, 'V45 Gate 17 must bind eleven end-to-end stages.');
  assertCheck(failures, artifact.coverage.evidenceClassCount === 16, 'V45 Gate 17 must bind sixteen evidence classes.');
  for (const key of [
    'localDeterministicLaneCovered',
    'stagingTestnetCredentialedLaneCovered',
    'valueBearingMainnetBlocked',
    'depositOptionCovered',
    'depositoryAdmissionCovered',
    'readRequestCovered',
    'readNeedReviewCovered',
    'findingFitsCovered',
    'sourceSafePreviewCovered',
    'btdQuoteCovered',
    'btcSettlementReadinessCovered',
    'rightsDeliveryPostureCovered',
    'compensationPostureCovered',
    'ledgerDatabaseStorageReadbackCovered',
    'interfaceBrowserReceiptCovered',
    'repairPostureCovered',
    'sourceSafeMetadataOnly',
  ]) {
    assertCheck(failures, artifact.coverage[key] === true, `Artifact coverage ${key} must be true.`);
  }
  for (const key of [
    'protectedSourcePayloadSerialized',
    'rawSourceTextVisible',
    'unpaidAssetPackSourceVisible',
    'rawPromptVisible',
    'interpolatedPromptVisible',
    'rawProviderResponseVisible',
    'credentialsSerialized',
    'walletPrivateMaterialVisible',
    'privateSettlementPayloadVisible',
    'liveRehearsalLogPayloadSerialized',
    'valueBearingMainnetAdmitted',
  ]) {
    assertCheck(failures, artifact.coverage[key] === false, `Artifact coverage ${key} must be false.`);
  }

  const missing = buildV45SourceSafeEndToEndRehearsal({
    repoRoot: root,
    evidenceOverrides: { 'ledger-database-storage-readback-root': { present: false } },
  });
  assertCheck(failures, missing.passed === false, 'Missing evidence must fail the rehearsal.');
  assertCheck(failures, missing.rehearsalStatus === 'repair_required', 'Missing evidence must return repair_required.');
  assertCheck(
    failures,
    missing.coverage.missingEvidenceClassIds.includes('ledger-database-storage-readback-root'),
    'Missing evidence repair must name ledger-database-storage-readback-root.',
  );

  const contradictory = buildV45SourceSafeEndToEndRehearsal({
    repoRoot: root,
    evidenceOverrides: { 'btc-settlement-readiness-receipt': { contradictory: true } },
  });
  assertCheck(failures, contradictory.passed === false, 'Contradictory evidence must fail the rehearsal.');
  assertCheck(failures, contradictory.rehearsalStatus === 'repair_required', 'Contradictory evidence must return repair_required.');
  assertCheck(
    failures,
    contradictory.coverage.contradictoryEvidenceClassIds.includes('btc-settlement-readiness-receipt'),
    'Contradictory evidence repair must name btc-settlement-readiness-receipt.',
  );

  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  assertCheck(
    failures,
    exists(root, V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH) &&
      read(root, V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH) === serialized,
    `${V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH} must be generated and current.`,
  );

  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const spec = read(root, '.specifications/BITCODE_SPEC_V45.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V45_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V45_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md');
  const rootReadme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');

  for (const phrase of [
    'generate:v45-source-safe-e2e-rehearsal',
    'check:v45-source-safe-e2e-rehearsal',
    'rehearse:v45-source-safe-e2e',
    'check:v45-gate17',
  ]) {
    assertCheck(failures, packageJson.includes(phrase), `package.json must expose ${phrase}.`);
  }
  assertCheck(failures, gateWorkflow.includes('check-v45-gate17-source-safe-e2e-rehearsal.mjs'), 'Gate workflow must run V45 Gate 17 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v45-gate17-source-safe-e2e-rehearsal.mjs'), 'Canon workflow must run V45 Gate 17 checker.');
  assertCheck(failures, spec.includes(V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH), 'V45 spec must list Gate 17 artifact.');
  assertCheck(failures, delta.includes(V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH), 'V45 delta must list Gate 17 artifact.');
  assertCheck(failures, notes.includes(V45_SOURCE_SAFE_E2E_REHEARSAL_ARTIFACT_PATH), 'V45 notes must list Gate 17 artifact.');
  assertCheck(failures, parity.includes('Gate 17 implementation readback'), 'V45 parity matrix must include Gate 17 readback.');
  assertCheck(failures, rootReadme.includes('V45 Gate 17'), 'Root README must document V45 Gate 17.');
  assertCheck(failures, protocolReadme.includes('V45SourceSafeEndToEndRehearsal'), 'Protocol README must document V45SourceSafeEndToEndRehearsal.');

  try {
    run(root, 'node', ['scripts/generate-v45-source-safe-e2e-rehearsal.mjs', '--check']);
  } catch {
    failures.push('V45 source-safe end-to-end rehearsal artifact must be fresh.');
  }

  try {
    run(root, 'node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V45', '--mode', 'draft', '--current-target', 'V44']);
  } catch {
    failures.push('V45 draft spec-family check must pass.');
  }

  try {
    run(root, 'node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V45', '--skip-pointer-check']);
  } catch {
    failures.push('V45 canonical-input check must pass.');
  }

  if (!args.skipOperatorDryRun) {
    for (const laneId of V45_SOURCE_SAFE_E2E_REHEARSAL_LANE_IDS) {
      const result = spawnSync(
        process.execPath,
        ['scripts/rehearse-v45-source-safe-e2e.mjs', '--lane', laneId, '--dry-run', '--json'],
        { cwd: root, encoding: 'utf8' },
      );
      assertReceipt(failures, parseReceipt(result, failures, laneId), laneId);
    }
    const missingReceipt = spawnSync(
      process.execPath,
      [
        'scripts/rehearse-v45-source-safe-e2e.mjs',
        '--lane',
        'local-deterministic',
        '--dry-run',
        '--missing-evidence',
        'ledger-database-storage-readback-root',
        '--json',
      ],
      { cwd: root, encoding: 'utf8' },
    );
    assertReceipt(failures, parseReceipt(missingReceipt, failures, 'missing-evidence'), 'local-deterministic', 'repair_required');
  }

  if (!args.skipPackageTests) {
    try {
      run(root, 'pnpm', [
        '--dir',
        'scripts/specifying',
        'exec',
        'node',
        '--test',
        '--test-force-exit',
        'test/v45-source-safe-e2e-rehearsal.test.js',
      ]);
    } catch {
      failures.push('scripts/specifying/test/v45-source-safe-e2e-rehearsal.test.js must pass.');
    }
  }

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 17 source-safe end-to-end rehearsal check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 17 source-safe end-to-end rehearsal check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
