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
      'Usage: node scripts/check-v45-gate9-gate-taxonomy-formal-spec-readiness.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V45 gate taxonomy and formal specification readiness atom.',
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
    'scripts/check-v45-gate8-proof-readback-operational-boundaries.mjs',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V45 Gate 9 file: ${relativePath}`);
  }

  const notes = read(root, '.specifications/BITCODE_SPEC_V45_NOTES.md');
  const normalizedNotes = normalize(notes);
  const packageJson = read(root, 'package.json');

  for (const phrase of [
    'V45 protocol-development atom 8: gate taxonomy and formal spec readiness',
    'The remaining opening question is process taxonomy',
    'V45 gates must be classified before the formal specification consolidation begins',
    'No gate may claim a stronger class than its accepted artifacts prove',
    'Notes-level atom gates are discussion-to-law preparation',
    'formal specification gates are draft canon authoring',
    'parity gates are implementation audit',
    'proof-only gates harden validation',
    'interface-only gates adjust protocol windows',
    'implementation gates close audited parity gaps',
    'rehearsal gates prove whole-system behavior',
    'promotion gates alone may advance `BITCODE_SPEC.txt`',
    'The canonical V45 gate taxonomy is',
    'notes-specification-atom',
    'formal-specification-consolidation',
    'specification-parity-matrix',
    'proof-only',
    'interface-only',
    'implementation',
    'rehearsal',
    'promotion',
    'source-safe UX/UI',
    'entitlement/disclosure trace to formal spec',
    'using PR discussion, memory, or notes as primary implementation authority',
    'Readiness law',
    'The notes-specification atom set for the V45 opening is complete enough to begin formal specification consolidation',
    'Formal consolidation must preserve the accepted semantics of all notes atoms',
    'AssetPack as commodity, Need-relative BTD scalar-volume, BTC settlement finality',
    'After consolidation, the parity matrix gate must treat the formal V45 specification family as the only implementation-audit authority',
    'Promotion remains prohibited until formal specification, parity, grouped implementation, proof, interface, rehearsal, and promotion-readiness gates are accepted',
    'Acceptance for this atom',
    'formal-specification consolidation as the next movement after accepted notes',
    'parity auditing from the formal V45 specification',
    'implementation only from accepted parity gaps',
    '`BITCODE_SPEC.txt` promotion only through the promotion gate',
  ]) {
    assertCheck(failures, normalizedNotes.includes(phrase), `V45 Gate 9 notes must include phrase: ${phrase}`);
  }

  assertCheck(
    failures,
    packageJson.includes('"check:v45-gate9": "node scripts/check-v45-gate9-gate-taxonomy-formal-spec-readiness.mjs"'),
    'package.json must expose check:v45-gate9.',
  );

  if (failures.length > 0) {
    process.stderr.write('V45 Gate 9 gate taxonomy and formal spec readiness check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V45 Gate 9 gate taxonomy and formal spec readiness check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
