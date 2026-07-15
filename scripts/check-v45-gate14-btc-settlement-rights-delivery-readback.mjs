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

function run(root, args) {
  return execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
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
      'Usage: node scripts/check-v45-gate14-btc-settlement-rights-delivery-readback.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V45 Gate 14 BTC settlement, rights transfer, source unlock, compensation, repair, and delivery readback coverage.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

function assertIncludesAll(failures, content, phrases, location) {
  for (const phrase of phrases) {
    assertCheck(failures, content.includes(phrase), `${location} must include: ${phrase}`);
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

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 Gate 14 work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v45' || /^v45\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V45 work must occur on version/v45 or v45/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V45.md',
    '.specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md',
    '.specifications/BITCODE_SPEC.txt',
    'package.json',
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
    'packages/asset-packs-pipelines/domain/src/btd-btc-compensation-statements.ts',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 14 file: ${relativePath}`);
  }

  const implementation = read(root, 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts');
  const test = read(root, 'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts');
  const packageJson = read(root, 'package.json');
  const parity = read(root, '.specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md');

  assertIncludesAll(failures, implementation, [
    'AssetPackBtcSettlementReadback',
    'bitcode.asset-pack.btc-settlement-readback',
    'btc_settlement_readback',
    'quoteAcceptanceState',
    'wallet_ready_non_custodial',
    'psbt_prepared_source_safe',
    'psbt_signed_by_reader_wallet',
    'broadcast_submitted',
    'payment_observed',
    'settlement_finalized',
    'rights_withheld',
    'source_unlocked_delivery',
    'compensation_routable',
    'stale_btc_quote_or_payment_mismatch',
    'pull_request_target_missing',
    'source_to_shares_conservation_failed',
  ], 'asset-pack-settlement-rights-delivery.ts');

  assertIncludesAll(failures, test, [
    'fails closed for %s BTC state before finality',
    "'prepared'",
    "'signed'",
    "'broadcast'",
    "'observed'",
    'stale accepted BTC quote',
    'contributor compensation conservation fails',
    'repository delivery is missing',
    'sourceUnlockAdmissible: false',
    'rightsTransferState: \'rights_withheld\'',
    'btc_settlement_readback',
    'wallet_ready_non_custodial',
  ], 'asset-pack-settlement-rights-delivery.test.ts');

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate14": "node scripts/check-v45-gate14-btc-settlement-rights-delivery-readback.mjs"'),
    'package.json must expose check:v45-gate14.',
  );

  assertIncludesAll(failures, parity, [
    'Gate 14 implementation readback',
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
    'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
    'check:v45-gate14',
  ], 'V45 parity matrix Gate 14 readback');

  try {
    const output = run(root, [
      'scripts/check-bitcode-spec-family.mjs',
      '--version',
      'V45',
      '--mode',
      'draft',
      '--current-target',
      'V44',
    ]);
    assertCheck(failures, output.includes('Bitcode spec family ok for V45'), 'V45 draft spec-family check did not report success.');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    failures.push(`V45 draft spec-family check failed: ${detail}`);
  }

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 14 BTC settlement rights delivery readback check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 14 BTC settlement rights delivery readback check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
