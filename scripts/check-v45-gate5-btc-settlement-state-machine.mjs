#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

function normalize(content) {
  return content.replace(/\s+/gu, ' ').trim();
}

function parseArgs(argv) {
  const args = { repoRoot: defaultRepoRoot, skipBranchCheck: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v45-gate5-btc-settlement-state-machine.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 BTC settlement state machine specification atom.',
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

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 atom work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v45' || /^v45\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 work must occur on version/v45 or v45/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'specifications/BITCODE_SPEC_V45_NOTES.md',
    'specifications/BITCODE_SPEC_V44.md',
    'packages/btd/src/bitcoin-fees.ts',
    'packages/btd/src/btc-fee-operation.ts',
    'packages/btd/src/settlement.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
    'packages/asset-packs-pipelines/domain/src/btd-btc-compensation-statements.ts',
    'package.json',
    'scripts/check-v45-gate4-btd-scalar-volume-state-machine.mjs',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 5 file: ${relativePath}`);
  }

  const notes = read(root, 'specifications/BITCODE_SPEC_V45_NOTES.md');
  const normalizedNotes = normalize(notes);
  const packageJson = read(root, 'package.json');

  for (const phrase of [
    'V45 protocol atom 4: BTC settlement state machine',
    'V44 correctly names estimates, quotes, observed payment, final settlement, contributor allocation, delivery, and repair',
    'separates BTC fee quotes, PSBT handoff, broadcast observation, finality receipts, settlement unlock, source-to-shares, and compensation statements',
    'BTC is Bitcode settlement money and payment truth',
    'A BTC quote is a source-safe procurement offer',
    'bound to a reviewed Need, selected Fit set, synthesized Need-Fit AssetPack',
    'BTD scalar-volume/range',
    'A BTC payment is not final merely because a transaction is prepared, signed, broadcast, visible in mempool, or observed by a provider',
    'confirmed BTC finality, quote/payment conservation, ledger/database/storage readback, and repair-free settlement receipts',
    'btc-not-quoteable',
    'btc-quote-issued',
    'btc-quote-accepted',
    'btc-quote-inactive',
    'btc-wallet-ready',
    'btc-psbt-prepared',
    'btc-psbt-signed',
    'btc-broadcast-submitted',
    'btc-payment-observed',
    'btc-payment-mismatch-repair-required',
    'btc-finality-confirmed',
    'btc-replaced-reorged-or-failed',
    'btc-settlement-finalized',
    'btc-contributor-compensation-routable',
    'btc-refund-or-escalation-required',
    'btc-settlement-repair-required',
    'wrong-network, wrong-wallet, or mismatched quotes cannot unlock rights',
    'never take server custody of wallet private material',
    'Prepared, signed, broadcast, and observed states are not final settlement',
    'Payment observation must conserve the accepted quote',
    'BTC finality requires the configured confirmation/finality policy',
    'Refund or escalation is a repair path, not a successful purchase path',
    'Contributor compensation is routable only after final settlement',
    'Estimated depositor earning ranges remain non-final',
    'must not expose private settlement payloads, wallet private material, unpaid AssetPack source',
    'Acceptance for this atom',
    'BTC as settlement money',
    'quote as source-safe deterministic procurement offer',
    'observed payment as non-final',
    'confirmed finality as prerequisite to BTD rights transfer',
    'source unlock only after settlement readback',
    'refund/escalation as fail-closed repair',
    'contributor compensation as post-finality source-to-shares allocation',
  ]) {
    assertCheck(failures, normalizedNotes.includes(phrase), `V45 Gate 5 notes must include phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate5": "node scripts/check-v45-gate5-btc-settlement-state-machine.mjs"'),
    'package.json must expose check:v45-gate5.',
  );

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 5 BTC settlement state machine check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 5 BTC settlement state machine check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
