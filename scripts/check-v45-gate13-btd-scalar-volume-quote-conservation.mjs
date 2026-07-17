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
      'Usage: node scripts/check-v45-gate13-btd-scalar-volume-quote-conservation.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V45 Gate 13 deterministic BTD scalar-volume, quote conservation, BTD range, and source-to-shares readback binding.',
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

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 Gate 13 work. Observed ${pointer || 'empty'}.`);

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
    'packages/asset-packs-pipelines/domain/package.json',
    'packages/asset-packs-pipelines/domain/src/index.ts',
    'packages/asset-packs-pipelines/domain/src/btd-scalar-volume-quote.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/btd-scalar-volume-quote.test.ts',
    'packages/btd/src/source-to-shares.ts',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 13 file: ${relativePath}`);
  }

  const implementation = read(root, 'packages/asset-packs-pipelines/domain/src/btd-scalar-volume-quote.ts');
  const test = read(root, 'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/btd-scalar-volume-quote.test.ts');
  const packageJson = read(root, 'package.json');
  const assetPackPackageJson = read(root, 'packages/asset-packs-pipelines/domain/package.json');
  const assetPackIndex = read(root, 'packages/asset-packs-pipelines/domain/src/index.ts');
  const parity = read(root, '.specifications/BITCODE_SPEC_V45_PARITY_MATRIX.md');

  assertIncludesAll(failures, implementation, [
    'bitcode.btd.scalar-volume.quote-conservation',
    'BtdScalarVolumeMeasurementWeightPolicy',
    'need-relative-fixed-point-weighted-volume',
    'fixed-point-integer',
    'floor-row-remainder-rooted',
    'measurementRows',
    'weightedMicroBtd',
    'quoteSats',
    'expectedQuoteSats',
    'quoteConserved',
    'conservedWithScalarVolume',
    'buildSourceToSharesProof',
    'sourceToSharesConserved',
    'assertFinalBtdScalarVolumeAdmissible',
  ], 'btd-scalar-volume-quote.ts');

  assertIncludesAll(failures, implementation, [
    'reviewed_need_required',
    'selected_fit_set_required',
    'positive_admitted_fit_quality_required',
    'need_fit_assetpack_required',
    'measurement_weight_policy_required',
    'dedupe_proof_root_required',
    'source_safe_proof_root_required',
    'settlement_bound_quote_required',
    'quote_conservation_failed',
    'btd_range_conservation_failed',
    'source_to_shares_conservation_failed',
  ], 'btd-scalar-volume-quote.ts blockers');

  assertIncludesAll(failures, test, [
    'conserved quote and one selected Fit',
    'many selected Fits',
    'reviewed_need_required',
    'selected_fit_set_required',
    'need_fit_assetpack_required',
    'measurement_weight_policy_required',
    'source_safe_proof_root_required',
    'settlement_bound_quote_required',
    'quote_conservation_failed',
    'btd_range_conservation_failed',
    'assertFinalBtdScalarVolumeAdmissible',
  ], 'btd-scalar-volume-quote.test.ts');

  assertCheck(
    failures,
    assetPackPackageJson.includes('"./btd-scalar-volume-quote": "./src/btd-scalar-volume-quote.ts"'),
    '@bitcode/asset-packs-pipelines-domain package must export ./btd-scalar-volume-quote.',
  );
  assertCheck(
    failures,
    assetPackIndex.includes("export * from './btd-scalar-volume-quote';"),
    '@bitcode/asset-packs-pipelines-domain root index must export btd-scalar-volume-quote.',
  );
  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate13": "node scripts/check-v45-gate13-btd-scalar-volume-quote-conservation.mjs"'),
    'package.json must expose check:v45-gate13.',
  );

  assertIncludesAll(failures, parity, [
    'Gate 13 implementation readback',
    'packages/asset-packs-pipelines/domain/src/btd-scalar-volume-quote.ts',
    'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/btd-scalar-volume-quote.test.ts',
    'check:v45-gate13',
  ], 'V45 parity matrix Gate 13 readback');

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
    process.stderr.write('V45 Gate 13 BTD scalar-volume quote conservation check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 13 BTD scalar-volume quote conservation check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
