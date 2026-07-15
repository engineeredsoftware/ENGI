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
      'Usage: node scripts/check-v45-gate2-knowledge-commoditization-law.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 opening protocol-law atom for Bitcode as a knowledge commoditization system.',
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

  assertCheck(failures, pointer === 'V44', `BITCODE_SPEC.txt must remain V44 during V45 opening work. Observed ${pointer || 'empty'}.`);

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
    'specifications/BITCODE_SPEC_V44_PROVEN.md',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 2 file: ${relativePath}`);
  }

  const notes = read(root, 'specifications/BITCODE_SPEC_V45_NOTES.md');
  const normalizedNotes = normalize(notes);
  const packageJson = read(root, 'package.json');

  for (const phrase of [
    'V45 gate sequencing rule',
    'Specification atom gates',
    'Each small protocol specification atom is its own gate and pull request',
    'Specification parity matrix gate',
    'builds the V45 parity matrix across source code, tests, proofs, generated artifacts, workflows, documentation, and interface surfaces',
    'Grouped implementation gates',
    'Only after the parity matrix is accepted do implementation gates begin',
    'do not start implementation work, broad parity claims, or promotion planning while the specification atoms remain unsettled',
    'V45 protocol atom 1: knowledge commoditization system',
    'Bitcode is the knowledge commoditization protocol and commercial system',
    'source-safe, measurable AssetPacks whose measurements can be weighted and summed into BTD scalar knowledge-volume',
    'That Need-relative BTD volume drives deterministic BTC quote/settlement',
    'expresses post-settlement rights',
    'controls source unlock',
    'routes contributor shares',
    'proof roots, ledgerized journals, telemetry',
    'The traded commodity is the AssetPack',
    'BTC is settlement money and payment truth',
    'BTD is the protocol\'s weighted scalar knowledge-volume unit',
    'Settled BTD is also rights-bearing',
    'paid read/use rights',
    'source unlock authority',
    'It is not merely a read-right',
    'BTD-relevant measurements may exist before a Need',
    'Final BTD size can only be calculated against a reviewed Need',
    'Need-relative measurement weights',
    'All admissible Need-Fit measurements are weighted and summed',
    'scalar BTD knowledge volume and source-to-shares allocation basis',
    'Depositing forms source-safe AssetPack supply',
    'Reading forms measured demand',
    'Source-to-shares is contributor allocation after paid Need-Fit selection',
    'none may change the protocol law or disclose source outside the settlement boundary',
    'What this atom does not yet decide',
    'exact AssetPack lifecycle state machine',
    'exact BTD measuring, mining, minting, scalar knowledge-volume, ownership, and transfer state machine',
    'exact BTC quote, observation, confirmation, finality, repair, refund, or compensation state machine',
    'Acceptance for this atom',
    'AssetPack as commodity, BTC as settlement money, BTD as weighted scalar knowledge-volume unit whose settled form carries rights',
    'final BTD size as Need-relative',
  ]) {
    assertCheck(failures, normalizedNotes.includes(phrase), `V45 Gate 2 notes must include phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate2": "node scripts/check-v45-gate2-knowledge-commoditization-law.mjs"'),
    'package.json must expose check:v45-gate2.',
  );

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 2 knowledge commoditization law check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 2 knowledge commoditization law check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
