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
      'Usage: node scripts/check-v30-gate3-bitcoin-taproot-psbt-fee-rigor.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 3 BTC fee quote, signer, PSBT handoff, Taproot posture, network policy, API serialization, docs, and workflow readiness.',
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
      branch === 'version/v30' || /^v30\/gate-3-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 Gate 3 work must occur on version/v30 or v30/gate-3-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'packages/btd/src/btc-fee-operation.ts',
    'packages/btd/src/bitcoin-fees.ts',
    'packages/btd/__tests__/btc-fee-operation.test.ts',
    'packages/api/src/routes/__tests__/btd-crypto.test.ts',
    'packages/btd/README.md',
    'specifications/BITCODE_SPEC_V30.md',
    'specifications/BITCODE_SPEC_V30_DELTA.md',
    'specifications/BITCODE_SPEC_V30_NOTES.md',
    'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md',
  ]) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V30 Gate 3 file: ${relativePath}`);
  }

  const feeOperation = read(root, 'packages/btd/src/btc-fee-operation.ts');
  const bitcoinFees = read(root, 'packages/btd/src/bitcoin-fees.ts');
  const btdTest = read(root, 'packages/btd/__tests__/btc-fee-operation.test.ts');
  const apiTest = read(root, 'packages/api/src/routes/__tests__/btd-crypto.test.ts');
  const btdReadme = read(root, 'packages/btd/README.md');
  const spec = read(root, 'specifications/BITCODE_SPEC_V30.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V30_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V30_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V30_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');

  for (const symbol of [
    'BtcFeeNetworkEnvironment',
    'BtcFeePsbtHandoffState',
    'BtcFeeBroadcastObservationState',
    'BtcFeeNetworkPolicy',
    'BtcFeeTaprootPsbtPosture',
    'buildBtcFeeNetworkPolicy',
    'buildBtcFeeTaprootPsbtPosture',
    'deriveBtcFeePsbtHandoffState',
    'deriveBtcFeeBroadcastState',
  ]) {
    assertCheck(failures, feeOperation.includes(symbol), `BTC fee operation must define/export ${symbol}.`);
  }

  for (const field of [
    'networkPolicy: BtcFeeNetworkPolicy',
    'taprootScriptPosture: BtcFeeTaprootPsbtPosture',
    'psbtHandoffState: BtcFeePsbtHandoffState',
    'broadcastState: BtcFeeBroadcastObservationState',
  ]) {
    assertCheck(failures, feeOperation.includes(field), `BtcFeeOperationPosture must include ${field}.`);
  }

  assertCheck(
    failures,
    feeOperation.includes("blockerId: 'network-policy'"),
    'BTC fee operation posture must block on network-policy when production-mainnet value-bearing settlement is not admitted.',
  );
  assertCheck(
    failures,
    feeOperation.includes('assertBtcFeeQuoteTimestamps'),
    'BTC fee quotes must validate issuedAt/expiresAt timestamp windows.',
  );
  assertCheck(
    failures,
    bitcoinFees.includes("next.finalityState === 'signed'") && bitcoinFees.includes('signedPsbt'),
    'Signed BTC fee receipt advancement must require signed PSBT evidence.',
  );

  for (const expectedEvidence of [
    'server_custody_rejected',
    'prepared_unsigned',
    'signed_ready_to_broadcast',
    'replacement_or_reorg_repair_required',
    'production-mainnet',
    'network-policy',
    'BTC fee quote expiresAt must be after issuedAt',
    'signedPsbt must be a non-empty string',
  ]) {
    assertCheck(failures, btdTest.includes(expectedEvidence), `BTD fee tests must cover ${expectedEvidence}.`);
  }

  for (const expectedEvidence of [
    'psbtHandoffState',
    'broadcastState',
    'networkPolicy',
    'taprootScriptPosture',
    'staging-testnet',
  ]) {
    assertCheck(failures, apiTest.includes(expectedEvidence), `API route tests must serialize ${expectedEvidence}.`);
  }

  assertCheck(failures, btdReadme.includes('BTC fee operation posture'), 'BTD README must document BTC fee operation posture ownership.');
  assertCheck(failures, spec.includes('BtcFeeNetworkPolicy'), 'V30 SPEC must name BtcFeeNetworkPolicy.');
  assertCheck(failures, spec.includes('BtcFeeTaprootPsbtPosture'), 'V30 SPEC must name BtcFeeTaprootPsbtPosture.');
  assertCheck(failures, delta.includes('Gate 3 implementation centers'), 'V30 DELTA must include Gate 3 implementation evidence.');
  assertCheck(failures, notes.includes('Gate 3 Bitcoin Taproot PSBT fee rigor notes'), 'V30 NOTES must include Gate 3 implementation notes.');
  assertCheck(failures, parity.includes('## Gate 3 Parity'), 'V30 PARITY must include Gate 3 parity evidence.');
  assertCheck(failures, parity.includes('Gate 3 accepted boundaries'), 'V30 PARITY must include Gate 3 accepted boundaries.');
  assertCheck(failures, packageJson.includes('"check:v30-gate3"'), 'package.json must expose check:v30-gate3.');
  assertCheck(
    failures,
    gateWorkflow.includes('check-v30-gate3-bitcoin-taproot-psbt-fee-rigor.mjs'),
    'Gate workflow must run the V30 Gate 3 checker.',
  );

  if (failures.length) {
    process.stderr.write('V30 Gate 3 Bitcoin Taproot PSBT fee rigor check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exit(1);
  }

  process.stdout.write('V30 Gate 3 Bitcoin Taproot PSBT fee rigor check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
