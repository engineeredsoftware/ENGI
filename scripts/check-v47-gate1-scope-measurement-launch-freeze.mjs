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

function run(root, command, args) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function parseArgs(argv) {
  const args = {
    repoRoot: defaultRepoRoot,
    skipBranchCheck: false,
    help: false,
  };
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
      'Usage: node scripts/check-v47-gate1-scope-measurement-launch-freeze.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V47 Gate 1 draft-opening posture: active V46 pointer, draft V47 spec family, website launch scope, measurement law, package script, and CI workflow hooks.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

const DRAFT_FILES = Object.freeze([
  'specifications/BITCODE_SPEC_V47.md',
  'specifications/BITCODE_SPEC_V47_DELTA.md',
  'specifications/BITCODE_SPEC_V47_NOTES.md',
  'specifications/BITCODE_SPEC_V47_PARITY_MATRIX.md',
]);

const REQUIRED_FILES = Object.freeze([
  'specifications/BITCODE_SPEC.txt',
  'specifications/BITCODE_SPEC_V46.md',
  'specifications/BITCODE_SPEC_V46_PROVEN.md',
  ...DRAFT_FILES,
  'specifications/SPECIFICATIONS_ROADMAP.md',
  'package.json',
  '.github/workflows/bitcode-gate-quality.yml',
  '.github/workflows/bitcode-canon-quality.yml',
]);

const DRAFT_FILE_PHRASES = Object.freeze([
  'Version: `V47`',
  'Current canonical/latest target: `V46`',
  'Prior canonical anchor: `BITCODE_SPEC_V46.md`',
  'Prior generated proof appendix: `BITCODE_SPEC_V46_PROVEN.md`',
  'Generated structured artifact inventory:',
  'Source parity state:',
]);

const REQUIRED_SCOPE_PHRASES = Object.freeze([
  'commercial website testnet launch readiness',
  'testnet means BTC amounts',
  'Measurement is the singular key',
  'No measurement, no price',
  '/deposit',
  '/read',
  '/packs',
  'Auxillaries',
  'IP seller',
  'IP buyer',
  'Feature Excess And Gate Alignment Audit',
  'E2E IP Selling And Buying Tests',
  'Landing Page And Public Launch Messaging',
  'check:v47-gate1',
]);

const FORBIDDEN_PROMOTION_PHRASES = Object.freeze([
  'canonical promotion complete',
  'Canonical proof-source commit',
  'Active canonical anchor: `BITCODE_SPEC_V47.md`',
  'Active generated proof appendix: `BITCODE_SPEC_V47_PROVEN.md`',
  'Canonical pointer: `BITCODE_SPEC.txt` -> `V47`',
  'V47 is active canon',
  'promoted V47',
  'active `BITCODE_SPEC_V47_PROVEN.md`',
]);

function includesInsensitive(content, phrase) {
  return content.toLowerCase().includes(phrase.toLowerCase());
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

  assertCheck(failures, pointer === 'V46', `BITCODE_SPEC.txt must remain V46 during V47 Gate 1. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v47' || /^v47\/gate-1-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V47 Gate 1 work must occur on version/v47 or v47/gate-1-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of REQUIRED_FILES) {
    assertCheck(failures, exists(root, relativePath), `Missing required V47 Gate 1 file: ${relativePath}`);
  }

  for (const relativePath of DRAFT_FILES) {
    const content = exists(root, relativePath) ? read(root, relativePath) : '';
    for (const phrase of DRAFT_FILE_PHRASES) {
      assertCheck(failures, content.includes(phrase), `${relativePath} must include "${phrase}".`);
    }
    for (const phrase of FORBIDDEN_PROMOTION_PHRASES) {
      assertCheck(failures, !content.includes(phrase), `${relativePath} contains premature promoted V47 posture phrase "${phrase}".`);
    }
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V47.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V47_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V47_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V47_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const combined = [spec, delta, notes, parity, roadmap, packageJson, gateWorkflow, canonWorkflow].join('\n');

  for (const phrase of REQUIRED_SCOPE_PHRASES) {
    assertCheck(failures, includesInsensitive(combined, phrase), `V47 Gate 1 opening must include "${phrase}".`);
  }

  for (const [label, content, phrase] of [
    ['spec', spec, '`BITCODE_SPEC.txt` points to `V46`; V46 is the active promoted Bitcode canon.'],
    ['spec', spec, 'V47 does not make mainnet value-bearing claims.'],
    ['spec', spec, 'Weighted scalar BTD formula:'],
    ['delta', delta, 'Gate 1: V47 Scope, Testnet Semantics, Measurement Law, And Launch Freeze'],
    ['notes', notes, 'Measurement is the commercial center.'],
    ['parity', parity, 'V47 Gate 1 is complete when the V47 draft spec family'],
    ['roadmap', roadmap, 'Current draft target: `BITCODE_SPEC_V47.md`'],
    ['roadmap', roadmap, 'V47 Gate 1 closure anchor'],
    ['roadmap', roadmap, '| V47 | `BITCODE_SPEC_V47.md` | active draft target |'],
    ['package.json', packageJson, '"check:v47-gate1"'],
    ['gate workflow', gateWorkflow, 'check-v47-gate1-scope-measurement-launch-freeze.mjs'],
    ['canon workflow', canonWorkflow, 'check-v47-gate1-scope-measurement-launch-freeze.mjs'],
  ]) {
    assertCheck(failures, content.includes(phrase), `${label} must include "${phrase}".`);
  }

  const commandChecks = [
    ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V46', '--mode', 'promoted', '--current-target', 'V46']],
    ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V47', '--mode', 'draft', '--current-target', 'V46']],
    ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V46']],
    ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V46', '--draft-target', 'V47']],
  ];

  for (const [command, commandArgs] of commandChecks) {
    try {
      run(root, command, commandArgs);
    } catch (error) {
      failures.push(`Command failed: ${command} ${commandArgs.join(' ')}`);
      if (error && typeof error === 'object' && 'stdout' in error) {
        const stdout = String(error.stdout || '').trim();
        if (stdout) failures.push(stdout);
      }
      if (error && typeof error === 'object' && 'stderr' in error) {
        const stderr = String(error.stderr || '').trim();
        if (stderr) failures.push(stderr);
      }
    }
  }

  if (failures.length > 0) {
    process.stderr.write(['V47 Gate 1 scope/measurement/launch-freeze check failed:', ...failures.map((failure) => `- ${failure}`)].join('\n'));
    process.stderr.write('\n');
    process.exit(1);
  }

  process.stdout.write('V47 Gate 1 scope/measurement/launch-freeze check passed.\n');
}

main();
