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
      'Usage: node scripts/check-v45-gate4-btd-scalar-volume-state-machine.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 BTD scalar-volume state machine specification atom.',
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

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
    '.specifications/BITCODE_SPEC_V45_NOTES.md',
    '.specifications/BITCODE_SPEC_V44.md',
    'packages/btd/src/semantic-volume.ts',
    'packages/btd/src/measuremint.ts',
    'packages/btd/src/range.ts',
    'packages/btd/src/source-to-shares.ts',
    'package.json',
    'scripts/check-v45-gate3-assetpack-lifecycle-state-machine.mjs',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 4 file: ${relativePath}`);
  }

  const notes = read(root, '.specifications/BITCODE_SPEC_V45_NOTES.md');
  const normalizedNotes = normalize(notes);
  const packageJson = read(root, 'package.json');

  for (const phrase of [
    'V45 protocol atom 3: BTD scalar-volume state machine',
    'BTD is first the weighted scalar knowledge-volume of a Need-Fit AssetPack',
    'only its settled form carries rights',
    'BTD is the non-fungible, proof-addressed scalar unit of technical knowledge volume',
    'Deposit-time measurement may estimate BTD potential',
    'final BTD size is only computed after a reviewed Need',
    'selected Fit set, synthesized Need-Fit AssetPack',
    'deterministic measurement weights',
    'BTC remains the payment asset',
    'BTD is not money',
    'btd-not-applicable',
    'btd-potential-measured',
    'need-fit-measurements-admitted',
    'measurement-weight-policy-locked',
    'weighted-scalar-volume-computed',
    'btd-quantized',
    'measuremint-applied',
    'btd-range-assigned',
    'btd-quote-bound',
    'btd-rights-pending',
    'btd-rights-transferred',
    'btd-source-to-shares-allocated',
    'btd-repair-required',
    'potential/range language only; no final BTD size',
    'normalizedMeasurementVolume * measurementWeight',
    'Need-relative normalized BTD volume',
    'quoteable BTD token count or zero-cell receipt',
    'source-safe mint receipt; no Reader rights yet',
    'rights-bearing BTD and source unlock authority',
    'Every final BTD measurement row must be Need-relative',
    'Measurement weights are deterministic protocol policy',
    'Scalar volume calculation uses fixed-point or integer arithmetic',
    'Deposit-time measurements may inform depositor review',
    'cannot mint, transfer, quote final BTD, unlock source, or allocate contributor shares',
    'contiguous, non-overlapping AssetPack range',
    'Zero-cell tail receipts remain valid measuremint evidence',
    'Rights-bearing BTD exists only after BTC settlement finality and BTD rights transfer',
    'Source-to-shares uses the settled Need-Fit AssetPack',
    'must not be confused with scalar-volume calculation',
    'Acceptance for this atom',
    'BTD as Need-relative weighted scalar knowledge-volume',
    'deposit-time BTD potential as non-final',
    'deterministic fixed-point measurement weighting',
    'measuremint/range conservation',
    'BTC-before-rights law',
  ]) {
    assertCheck(failures, normalizedNotes.includes(phrase), `V45 Gate 4 notes must include phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate4": "node scripts/check-v45-gate4-btd-scalar-volume-state-machine.mjs"'),
    'package.json must expose check:v45-gate4.',
  );

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 4 BTD scalar-volume state machine check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 4 BTD scalar-volume state machine check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
