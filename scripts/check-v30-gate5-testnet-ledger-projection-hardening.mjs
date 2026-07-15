#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    repoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v30-gate5-testnet-ledger-projection-hardening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 5 testnet ledger projection hardening, object-storage facts, secret-free Supabase readback, Terminal rendering, tests, docs, and workflow readiness.',
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

  assertCheck(
    failures,
    pointer === 'V29',
    `BITCODE_SPEC.txt must remain V29 during V30 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v30' || /^v30\/gate-5-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 Gate 5 work must occur on version/v30 or v30/gate-5-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/btd/src/reconciliation.ts',
    'packages/btd/src/api-boundaries.ts',
    'packages/btd/__tests__/reconciliation.test.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
    'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
    'apps/uapi/app/terminal/terminal-journal-reconciliation.ts',
    'apps/uapi/app/terminal/TerminalTransactionJournalReconciliationCard.tsx',
    'apps/uapi/app/terminal/terminal-transaction-detail-snapshot.ts',
    'apps/uapi/tests/terminalJournalReconciliation.test.ts',
    'apps/uapi/tests/terminalTransactionDetailSnapshot.test.ts',
    'packages/btd/README.md',
    'apps/uapi/app/terminal/README.md',
    'specifications/BITCODE_SPEC_V30.md',
    'specifications/BITCODE_SPEC_V30_DELTA.md',
    'specifications/BITCODE_SPEC_V30_NOTES.md',
    'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V30 Gate 5 file: ${relativePath}`);
  }

  const reconciliation = read(root, 'packages/btd/src/reconciliation.ts');
  const apiBoundary = read(root, 'packages/btd/src/api-boundaries.ts');
  const btdTest = read(root, 'packages/btd/__tests__/reconciliation.test.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const harness = read(root, 'packages/pipeline-hosts/src/asset-pack-host-plan.ts');
  const harnessTest = read(root, 'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts');
  const terminalProjection = read(root, 'apps/uapi/app/terminal/terminal-journal-reconciliation.ts');
  const terminalCard = read(root, 'apps/uapi/app/terminal/TerminalTransactionJournalReconciliationCard.tsx');
  const terminalSnapshot = read(root, 'apps/uapi/app/terminal/terminal-transaction-detail-snapshot.ts');
  const terminalTest = read(root, 'apps/uapi/tests/terminalJournalReconciliation.test.ts');
  const btdReadme = read(root, 'packages/btd/README.md');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  const spec = read(root, 'specifications/BITCODE_SPEC_V30.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V30_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V30_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'ObjectStorageArtifactFact',
    'SupabaseStagingTestnetProjectionReadback',
    'buildSupabaseStagingTestnetProjectionReadback',
    'objectStorageArtifacts',
    'stagingTestnetReadback',
    'objectStorageRoot',
    'stagingTestnetReadbackRoot',
  ]) {
    assertCheck(failures, reconciliation.includes(symbol), `BTD reconciliation primitive is missing ${symbol}.`);
  }

  for (const driftOrAction of [
    'missing_object_storage_artifact',
    'object_storage_root_mismatch',
    'staging_testnet_readback_blocked',
    'retry_object_storage_write',
    'retry_staging_testnet_readback',
    'quarantine_object_storage_artifact',
  ]) {
    assertCheck(failures, reconciliation.includes(driftOrAction), `BTD reconciliation must define ${driftOrAction}.`);
    assertCheck(failures, btdTest.includes(driftOrAction), `BTD reconciliation tests must cover ${driftOrAction}.`);
  }

  for (const secretGuard of [
    'secretValuesStored: false',
    'sb_secret__',
    'service_role',
    'sk-(?:proj|live|test)-',
    'must not contain a secret value',
  ]) {
    assertCheck(failures, reconciliation.includes(secretGuard), `Supabase readback receipt must guard ${secretGuard}.`);
  }

  for (const apiEvidence of [
    'objectStorageArtifacts',
    'stagingTestnetReadback',
  ]) {
    assertCheck(failures, apiBoundary.includes(apiEvidence), `BTD API boundary must accept ${apiEvidence}.`);
  }
  for (const apiEvidence of [
    'objectStorageArtifacts',
    'stagingTestnetReadback',
    'projectedObjectStorageRoot',
    'secretValuesStored',
  ]) {
    assertCheck(failures, apiTest.includes(apiEvidence), `API tests must cover ${apiEvidence}.`);
  }

  for (const harnessEvidence of [
    'buildSupabaseStagingTestnetProjectionReadback',
    'buildProjectionTableReadbacks',
    'objectStorageArtifacts',
    'pipeline_evidence',
    'asset_pack_source_safe_preview',
    'staging-testnet-readback-',
  ]) {
    assertCheck(failures, harness.includes(harnessEvidence), `Sandbox harness must emit ${harnessEvidence}.`);
    assertCheck(failures, harnessTest.includes(harnessEvidence), `Harness tests must assert ${harnessEvidence}.`);
  }

  for (const terminalEvidence of [
    'objectStorageFacts',
    'object_storage_artifact',
    'ledgerDatabaseReconciliation',
    'Object storage artifacts',
    'blocks unlock or delivery',
  ]) {
    assertCheck(
      failures,
      terminalProjection.includes(terminalEvidence) ||
        terminalCard.includes(terminalEvidence) ||
        terminalSnapshot.includes(terminalEvidence) ||
        terminalTest.includes(terminalEvidence),
      `Terminal reconciliation surface must include ${terminalEvidence}.`,
    );
  }

  assertCheck(
    failures,
    btdReadme.includes('ledger/database/object-storage projection reconciliation'),
    'BTD README must document Gate 5 projection ownership.',
  );
  assertCheck(
    failures,
    terminalReadme.includes('object-storage artifact facts'),
    'Terminal README must document object-storage reconciliation facts.',
  );
  assertCheck(
    failures,
    spec.includes('object-storage artifact facts') &&
      spec.includes('Supabase staging-testnet readback receipts must never store'),
    'V30 SPEC must define Gate 5 projection and secret-free readback canon.',
  );
  assertCheck(failures, delta.includes('Gate 5 implementation centers'), 'V30 DELTA must include Gate 5 implementation evidence.');
  assertCheck(failures, notes.includes('Gate 5 testnet ledger projection notes'), 'V30 NOTES must include Gate 5 implementation notes.');
  assertCheck(failures, parity.includes('## Gate 5 Parity'), 'V30 PARITY must include Gate 5 parity evidence.');
  assertCheck(failures, parity.includes('Gate 5 accepted boundaries'), 'V30 PARITY must include Gate 5 accepted boundaries.');
  assertCheck(failures, packageJson.includes('"check:v30-gate5"'), 'package.json must expose check:v30-gate5.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v30-gate5-testnet-ledger-projection-hardening.mjs'),
    'Gate workflow must run the V30 Gate 5 checker.',
  );

  if (failures.length) {
    process.stderr.write('V30 Gate 5 testnet ledger projection hardening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V30 Gate 5 testnet ledger projection hardening check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
