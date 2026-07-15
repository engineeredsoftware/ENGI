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
      'Usage: node scripts/check-v45-gate6-spec-consolidation-sequencing.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 notes-to-spec consolidation sequencing atom.',
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
    '.specifications/BITCODE_SPEC.txt',
    'package.json',
    'scripts/check-v45-gate5-btc-settlement-state-machine.mjs',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 6 file: ${relativePath}`);
  }

  const notes = read(root, '.specifications/BITCODE_SPEC_V45_NOTES.md');
  const normalizedNotes = normalize(notes);
  const packageJson = read(root, 'package.json');

  for (const phrase of [
    'V45 proceeds in four ordered movements',
    'Formal specification consolidation gate',
    'After the notes-level specification atoms are accepted, one gate updates the V45 specification family',
    'After the V45 specification family is updated, one gate audits implementation',
    'specification atoms remain unsettled',
    'accepted notes have not yet been consolidated into the V45 specification family',
    'implementation parity has not yet been audited from that formal specification',
    'V45 protocol-development atom 5: notes-to-spec consolidation before parity',
    'accepted notes are not enough to audit implementations',
    'consolidate the accepted notes into the formal V45 specification family',
    'The implementation parity matrix must audit against the formal V45 specification family',
    'not against loose notes, branch discussion, PR bodies, or operator memory',
    'notes-specification-atoms',
    'formal-specification-consolidation',
    'implementation-parity-audit',
    'grouped-implementation-closure',
    'formal specification consolidation gate must update the V45 spec-family documents before any implementation audit begins',
    'preserve `BITCODE_SPEC.txt -> V44`',
    'parity matrix gate must cite the formal V45 specification family',
    'Implementation gates must be grouped from parity gaps found against the formal specification',
    'notes-specification atoms before formal spec consolidation',
    'formal spec consolidation before implementation parity auditing',
    'parity auditing before grouped implementation closure',
  ]) {
    assertCheck(failures, normalizedNotes.includes(phrase), `V45 Gate 6 notes must include phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate6": "node scripts/check-v45-gate6-spec-consolidation-sequencing.mjs"'),
    'package.json must expose check:v45-gate6.',
  );

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 6 spec consolidation sequencing check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 6 spec consolidation sequencing check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
