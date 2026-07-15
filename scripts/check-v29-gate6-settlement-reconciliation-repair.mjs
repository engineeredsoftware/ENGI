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
      'Usage: node scripts/check-v29-gate6-settlement-reconciliation-repair.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 6 settlement reconciliation and repair closure.',
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

  assertCheck(
    failures,
    pointer === 'V28',
    `BITCODE_SPEC.txt must remain V28 during V29 Gate 6 work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-6-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 Gate 6 work must occur on version/v29 or v29/gate-6-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V29.md',
    'BITCODE_SPEC_V29_DELTA.md',
    'BITCODE_SPEC_V29_NOTES.md',
    'BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'scripts/check-v29-gate6-settlement-reconciliation-repair.mjs',
    'packages/btd/src/reconciliation.ts',
    'packages/btd/__tests__/btd.test.ts',
    'packages/api/src/routes/btd-crypto.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'packages/api/jest.config.cjs',
    'packages/api/package.json',
    'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
    'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
    'apps/uapi/app/terminal/terminal-journal-reconciliation.ts',
    'apps/uapi/app/terminal/TerminalTransactionJournalReconciliationCard.tsx',
    'apps/uapi/app/terminal/terminal-transaction-detail-snapshot.ts',
    'apps/uapi/app/terminal/README.md',
    'apps/uapi/tests/terminalJournalReconciliation.test.ts',
    'apps/uapi/tests/terminalTransactionDetailCards.test.tsx',
    '.github/workflows/bitcode-gate-quality.yml',
    'package.json',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing Gate 6 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V29.md');
  const delta = read(root, 'BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const reconciliation = read(root, 'packages/btd/src/reconciliation.ts');
  const btdTest = read(root, 'packages/btd/__tests__/btd.test.ts');
  const apiRoute = read(root, 'packages/api/src/routes/btd-crypto.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const apiPackageJson = read(root, 'packages/api/package.json');
  const harness = read(root, 'packages/pipeline-hosts/src/asset-pack-host-plan.ts');
  const harnessTest = read(root, 'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts');
  const terminalProjection = read(root, 'apps/uapi/app/terminal/terminal-journal-reconciliation.ts');
  const terminalCard = read(root, 'apps/uapi/app/terminal/TerminalTransactionJournalReconciliationCard.tsx');
  const terminalSnapshot = read(root, 'apps/uapi/app/terminal/terminal-transaction-detail-snapshot.ts');
  const terminalReadme = read(root, 'apps/uapi/app/terminal/README.md');
  const terminalTest = read(root, 'apps/uapi/tests/terminalJournalReconciliation.test.ts');
  const terminalCardTest = read(root, 'apps/uapi/tests/terminalTransactionDetailCards.test.tsx');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  assertCheck(failures, spec.includes('V29 settlement reconciliation repair canon'), 'V29 SPEC must define settlement reconciliation repair canon.');
  assertCheck(failures, delta.includes('Closure acceptance') && delta.includes('repairActions'), 'V29 DELTA must define Gate 6 closure acceptance.');
  assertCheck(failures, notes.includes('Gate 6 working notes'), 'V29 NOTES must carry Gate 6 working notes.');
  assertCheck(failures, parity.includes('## Gate 6 Parity'), 'V29 PARITY must include Gate 6 parity.');
  assertCheck(failures, parity.includes('Gate 6 completion condition'), 'V29 PARITY must include Gate 6 completion condition.');

  for (const symbol of [
    'ProjectionDriftKind',
    'ProjectionRepairActionKind',
    'LedgerDatabaseReconciliationState',
    'ProjectionRepairAction',
    'SettlementConservationCheck',
    'LedgerDatabaseReconciliationProofRoots',
    'driftKindCounts',
    'repairActions',
    'proofRoots',
    'settlementConservation',
    'missing_database_projection',
    'ledger_root_mismatch',
    'ledger_finality_mismatch',
    'database_orphan_projection',
    'settlement_conservation_drift',
    'pause_settlement_unlock',
    'recover_delivery',
  ]) {
    assertCheck(failures, reconciliation.includes(symbol), `BTD reconciliation primitive is missing ${symbol}.`);
  }

  assertCheck(
    failures,
    btdTest.includes('ledger/database reconciliation repair') &&
      btdTest.includes('settlement_conservation_drift') &&
      btdTest.includes('repairActions') &&
      btdTest.includes('proofRoots'),
    'BTD tests must cover Gate 6 repair actions, conservation drift, and proof roots.',
  );
  assertCheck(
    failures,
      apiRoute.includes('settlementConservationChecks') &&
      apiRoute.includes('report.proofRoots.repairPlanRoot') &&
      apiTest.includes('settlementConservationChecks') &&
      apiTest.includes('settlement_conservation_drift') &&
      apiPackageJson.includes('jest --config jest.config.cjs'),
    'BTD API route/tests must accept conservation checks and bind proof roots.',
  );
  assertCheck(
    failures,
    harness.includes('ledgerDatabaseReconciliation') &&
      harness.includes("execution.store('asset-pack/settlement', 'ledgerDatabaseReconciliation'") &&
      harness.includes('repairActionCount') &&
      harnessTest.includes('ledgerDatabaseReconciliation'),
    'Sandbox harness must persist and test reconciliation report evidence.',
  );
  assertCheck(
    failures,
    terminalProjection.includes('repairActions') &&
      terminalProjection.includes('proofRoots') &&
      terminalProjection.includes('driftKindCounts') &&
      terminalProjection.includes('buildSettlementConservationReason') &&
      terminalProjection.includes('recover_delivery') &&
      terminalSnapshot.includes('repairActionKind') &&
      terminalSnapshot.includes('proofRoot'),
    'Terminal projection/snapshot must include repair actions, proof roots, drift classes, and conservation repair posture.',
  );
  assertCheck(
    failures,
      terminalCard.includes('Drift classes') &&
      terminalCard.includes('Repair actions') &&
      terminalCard.includes('Proof roots') &&
      terminalTest.includes('blocks settlement conservation drift') &&
      terminalTest.includes('recover_delivery') &&
      terminalCardTest.includes('Repair actions') &&
      terminalCardTest.includes('Proof roots') &&
      terminalReadme.includes('settlement reconciliation repair cockpit'),
    'Terminal UI/docs/tests must expose Gate 6 repair visibility.',
  );
  assertCheck(
    failures,
    packageJson.includes('"check:v29-gate6"') &&
      gateWorkflow.includes('check-v29-gate6-settlement-reconciliation-repair.mjs') &&
      gateWorkflow.includes('terminalJournalReconciliation.test.ts') &&
      gateWorkflow.includes('btd-crypto.test.ts'),
    'Package scripts and gate-quality workflow must invoke Gate 6 checker and focused tests.',
  );

  if (failures.length) {
    process.stderr.write('V29 Gate 6 check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V29 Gate 6 settlement reconciliation and repair check passed.\n');
}

main();
