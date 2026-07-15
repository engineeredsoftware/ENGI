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
      'Usage: node scripts/check-v45-gate3-assetpack-lifecycle-state-machine.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 AssetPack lifecycle state machine specification atom.',
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
    'package.json',
    'scripts/check-v45-gate2-knowledge-commoditization-law.mjs',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 3 file: ${relativePath}`);
  }

  const notes = read(root, 'specifications/BITCODE_SPEC_V45_NOTES.md');
  const normalizedNotes = normalize(notes);
  const packageJson = read(root, 'package.json');

  for (const phrase of [
    'V45 protocol atom 2: AssetPack lifecycle state machine',
    'V43/V44 correctly establish AssetPacks in and AssetPacks out',
    'Every AssetPack-like object must occupy exactly one lifecycle state at every protocol boundary',
    'source safe only, source-bearing but withheld, quoteable, settled, deliverable, compensable, or in repair',
    'No interface, API, pipeline, proof artifact, or operator tool may collapse lifecycle states',
    'deposit option look like settled BTD',
    'preview look like source disclosure',
    'quote look like payment finality',
    'admitted Depository AssetPack look like a delivered Need-Fit AssetPack',
    'deposit-option-synthesized',
    'deposit-option-reviewed',
    'depository-assetpack-admitted',
    'fit-candidates-recalled',
    'fit-set-selected',
    'need-fit-assetpack-synthesized',
    'need-fit-assetpack-quoted',
    'settlement-observed',
    'btd-settled-rights-transferred',
    'source-unlocked-delivery',
    'compensated-and-reconciled',
    'repair-required',
    'Deposit-time BTD-relevant measurements may show potential',
    'no final BTD size',
    'Admitted supply may carry BTD potential, not final BTD',
    'Candidate BTD contribution is only provisional until selected against the reviewed Need',
    'Need-relative BTD scalar volume may be computed for quote',
    'rights-bearing BTD is not minted or transferred',
    'Quoteable BTD volume exists because a reviewed Need and selected Fit set exist',
    'BTC payment is observed but not final',
    'Rights-bearing BTD is minted/mined/assigned for the Need-Fit AssetPack',
    'A deposit option may transition to `depository-assetpack-admitted` only after depositor approval',
    'the search may recall many candidates above threshold',
    'selected Fit set may contain one or many admitted Depository AssetPacks',
    'The Need-Fit AssetPack is synthesized from the reviewed Need plus the selected Fit set',
    'may not see source before BTC settlement finality and BTD rights transfer',
    'BTD final scalar knowledge-volume is Need-relative',
    'becomes rights-bearing only after settlement',
    'BTC payment observation, BTC finality, BTD rights transfer, source unlock, repository delivery, source-to-shares compensation, and reconciliation are distinct states',
    'moves the object to `repair-required`',
    'Acceptance for this atom',
    'Need-relative BTD calculation condition',
    'one-to-many Finding Fits input set',
    'BTC settlement-before-source law',
  ]) {
    assertCheck(failures, normalizedNotes.includes(phrase), `V45 Gate 3 notes must include phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate3": "node scripts/check-v45-gate3-assetpack-lifecycle-state-machine.mjs"'),
    'package.json must expose check:v45-gate3.',
  );

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 3 AssetPack lifecycle state machine check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 3 AssetPack lifecycle state machine check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
