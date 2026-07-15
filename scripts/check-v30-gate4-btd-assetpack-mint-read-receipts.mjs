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
      'Usage: node scripts/check-v30-gate4-btd-assetpack-mint-read-receipts.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 4 typed BTD AssetPack mint, read, rights-transfer receipts, source-safe boundaries, product readback, harness evidence, docs, and workflow readiness.',
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
      branch === 'version/v30' || /^v30\/gate-4-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 Gate 4 work must occur on version/v30 or v30/gate-4-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/btd/src/receipts.ts',
    'packages/btd/src/api-boundaries.ts',
    'packages/btd/__tests__/api-boundaries.test.ts',
    'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
    'apps/uapi/app/ (removed cockpit tree) terminal-transaction-detail-snapshot.ts',
    'apps/uapi/app/ (removed cockpit tree) terminal-transaction-read-model.ts',
    'apps/uapi/tests/terminalTransactionDetailSnapshot.test.ts',
    'apps/uapi/tests/terminalTransactionReadModel.test.ts',
    'packages/btd/README.md',
    'specifications/BITCODE_SPEC_V30.md',
    'specifications/BITCODE_SPEC_V30_DELTA.md',
    'specifications/BITCODE_SPEC_V30_NOTES.md',
    'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V30 Gate 4 file: ${relativePath}`);
  }

  const receipts = read(root, 'packages/btd/src/receipts.ts');
  const apiBoundary = read(root, 'packages/btd/src/api-boundaries.ts');
  const btdTest = read(root, 'packages/btd/__tests__/api-boundaries.test.ts');
  const harness = read(root, 'packages/pipeline-hosts/src/asset-pack-host-plan.ts');
  const terminalSnapshot = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-transaction-detail-snapshot.ts');
  const terminalReadModel = read(root, 'apps/uapi/app/ (removed cockpit tree) terminal-transaction-read-model.ts');
  const terminalSnapshotTest = read(root, 'apps/uapi/tests/terminalTransactionDetailSnapshot.test.ts');
  const terminalReadModelTest = read(root, 'apps/uapi/tests/terminalTransactionReadModel.test.ts');
  const btdReadme = read(root, 'packages/btd/README.md');
  const spec = read(root, 'specifications/BITCODE_SPEC_V30.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V30_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V30_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'BtdAssetPackMintReceipt',
    'BtdReadReceipt',
    'BtdRightsTransferReceipt',
    'buildBtdAssetPackMintReceipt',
    'buildBtdReadReceipt',
    'buildBtdRightsTransferReceipt',
    'assertBtdAssetPackMintReceipt',
    'assertBtdReadReceipt',
    'assertBtdRightsTransferReceipt',
  ]) {
    assertCheck(failures, receipts.includes(symbol), `BTD receipts module must define/export ${symbol}.`);
  }

  for (const requiredField of [
    'sourceSafePreviewRoot',
    'paidUnlockRoot',
    'deliveryAdmissionRoot',
    'ledgerProjectionRoot',
    'readerWalletId',
    'depositorWalletId',
    'protectedSourceVisible',
  ]) {
    assertCheck(failures, receipts.includes(requiredField), `BTD receipts must bind ${requiredField}.`);
  }

  assertCheck(
    failures,
    receipts.includes('Protected source cannot be visible before paid unlock.'),
    'BTD read receipts must reject protected source visibility before paid unlock.',
  );
  assertCheck(
    failures,
    receipts.includes("btcFeeFinalityState !== 'confirmed'"),
    'BTD rights-transfer receipts must require confirmed BTC fee finality.',
  );
  assertCheck(
    failures,
    receipts.includes("disclosureState: 'source_safe_preview'") &&
      receipts.includes('protectedSourceVisible: false'),
    'BTD AssetPack mint receipts must remain source-safe.',
  );

  for (const symbol of [
    'buildBtdAssetPackMintReceipt',
    'buildBtdReadReceiptBoundarySettlement',
    'buildBtdRightsTransferReceipt',
    'assetPackMintReceipt',
    'btdRightsTransferReceipt',
  ]) {
    assertCheck(failures, apiBoundary.includes(symbol), `BTD API boundary must expose/use ${symbol}.`);
  }

  for (const expectedEvidence of [
    'source_safe_preview',
    'paidUnlockRoot',
    'deliveryAdmissionRoot',
    "btcFeeFinalityState: 'confirmed'",
    'Rights transfer receipt requires confirmed BTC fee finality.',
  ]) {
    assertCheck(failures, btdTest.includes(expectedEvidence), `BTD tests must cover ${expectedEvidence}.`);
  }

  for (const harnessEvidence of [
    'buildBtdAssetPackMintReceiptFn',
    'buildBtdReadReceiptFn',
    'assetPackMintReceipt',
    'readReceipt',
    'assetPackMintReceiptRoot',
    'readReceiptRoot',
  ]) {
    assertCheck(failures, harness.includes(harnessEvidence), `Sandbox harness must store or stream ${harnessEvidence}.`);
  }

  for (const terminalEvidence of [
    'assetPackMintReceipt',
    'readReceipt',
    'rightsTransferReceipt',
  ]) {
    assertCheck(failures, terminalSnapshot.includes(terminalEvidence), `product snapshot must coerce ${terminalEvidence}.`);
    assertCheck(failures, terminalReadModel.includes(terminalEvidence), `product read model must count ${terminalEvidence}.`);
  }
  assertCheck(
    failures,
    terminalSnapshot.includes('asset_pack_mint_receipt') && terminalSnapshot.includes('btd_rights_transfer_receipt'),
    'product snapshot must accept database-style receipt payload keys.',
  );
  assertCheck(
    failures,
    terminalSnapshotTest.includes('asset-pack-mint-receipt-root-run-1') &&
      terminalReadModelTest.includes('read-receipt-root-1'),
    'product tests must cover receipt readback and read model counting.',
  );

  assertCheck(failures, btdReadme.includes('typed AssetPack mint/read/rights-transfer receipts'), 'BTD README must document Gate 4 receipt ownership.');
  assertCheck(failures, spec.includes('Gate 4 receipt precision'), 'V30 SPEC must include Gate 4 receipt precision.');
  assertCheck(failures, delta.includes('Gate 4 implementation centers'), 'V30 DELTA must include Gate 4 implementation evidence.');
  assertCheck(failures, notes.includes('Gate 4 BTD AssetPack mint and read receipt notes'), 'V30 NOTES must include Gate 4 implementation notes.');
  assertCheck(failures, parity.includes('## Gate 4 Parity'), 'V30 PARITY must include Gate 4 parity evidence.');
  assertCheck(failures, parity.includes('Gate 4 accepted boundaries'), 'V30 PARITY must include Gate 4 accepted boundaries.');
  assertCheck(failures, packageJson.includes('"check:v30-gate4"'), 'package.json must expose check:v30-gate4.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v30-gate4-btd-assetpack-mint-read-receipts.mjs'),
    'Gate workflow must run the V30 Gate 4 checker.',
  );

  if (failures.length) {
    process.stderr.write('V30 Gate 4 BTD AssetPack mint/read receipts check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V30 Gate 4 BTD AssetPack mint/read receipts check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
