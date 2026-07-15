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
      'Usage: node scripts/check-v46-gate1-commercial-protocol-comprehension-roadmap.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks the V46 Gate 1 draft-opening posture: active V45 pointer, draft V46 spec family, roadmap scope, package script, and CI workflow hooks.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

const STALE_PROMOTED_PHRASES = Object.freeze([
  'canonical promotion complete',
  'Canonical proof-source commit',
  'Current canonical/latest target: `V46`',
  'Canonical pointer: `BITCODE_SPEC.txt` -> `V46`',
  'Active canonical anchor: `BITCODE_SPEC_V46.md`',
  'Active generated proof appendix: `BITCODE_SPEC_V46_PROVEN.md`',
  'V46 is active canon',
  'active V46 / draft V46',
  'promoted V46',
  'active `BITCODE_SPEC_V46_PROVEN.md`',
  'check:v46-gate18',
]);

const GATE8_PROMOTION_READINESS_PHRASES = Object.freeze([
  'v46-canon-promotion.yml',
]);

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V45', `BITCODE_SPEC.txt must remain V45 during V46 Gate 1. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v46' || /^v46\/gate-1-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V46 Gate 1 work must occur on version/v46 or v46/gate-1-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'specifications/BITCODE_SPEC.txt',
    'specifications/BITCODE_SPEC_V45.md',
    'specifications/BITCODE_SPEC_V45_PROVEN.md',
    'specifications/BITCODE_SPEC_V46.md',
    'specifications/BITCODE_SPEC_V46_DELTA.md',
    'specifications/BITCODE_SPEC_V46_NOTES.md',
    'specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];
  for (const relativePath of requiredFiles) {
    assertCheck(failures, exists(root, relativePath), `Missing required V46 Gate 1 file: ${relativePath}`);
  }

  const specFamilyFiles = [
    'specifications/BITCODE_SPEC_V46.md',
    'specifications/BITCODE_SPEC_V46_DELTA.md',
    'specifications/BITCODE_SPEC_V46_NOTES.md',
    'specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md',
  ];
  const gate8PromotionReadinessAccepted =
    exists(root, 'scripts/check-v46-gate8-promotion-readiness.mjs') &&
    exists(root, '.bitcode/v46-promotion-readiness-report.json');
  const stalePromotedPhrases = gate8PromotionReadinessAccepted
    ? STALE_PROMOTED_PHRASES
    : [...STALE_PROMOTED_PHRASES, ...GATE8_PROMOTION_READINESS_PHRASES];

  for (const relativePath of specFamilyFiles) {
    const content = read(root, relativePath);
    for (const phrase of stalePromotedPhrases) {
      assertCheck(failures, !content.includes(phrase), `${relativePath} contains stale promoted V46 posture phrase "${phrase}".`);
    }
    for (const phrase of [
      'Version: `V46`',
      'Current canonical/latest target: `V45`',
      'Prior canonical anchor: `BITCODE_SPEC_V45.md`',
      'Prior generated proof appendix: `BITCODE_SPEC_V45_PROVEN.md`',
      'Source parity state:',
      'Last fully realized canonical target preserved in source: `V45`',
    ]) {
      assertCheck(failures, content.includes(phrase), `${relativePath} must include "${phrase}".`);
    }
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V46.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V46_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V46_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V46_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const [label, content, phrase] of [
    ['spec', spec, '`BITCODE_SPEC.txt` points to `V45`; V45 is the active promoted Bitcode canon.'],
    ['spec', spec, 'V46 does not replace V45 as active canon until promotion workflow validation.'],
    ['delta', delta, 'Gate 1: V46 Commercial Protocol Comprehension Roadmap Opening'],
    ['notes', notes, 'Gate 1: V46 Commercial Protocol Comprehension Roadmap Opening'],
    ['parity', parity, 'V46 Gate 1 is complete when the V46 draft spec family'],
    ['roadmap', roadmap, 'Current draft target: `BITCODE_SPEC_V46.md`'],
    ['roadmap', roadmap, 'V46 Gate 1 closure anchor'],
    ['roadmap', roadmap, '| V46 | `BITCODE_SPEC_V46.md` | active draft target |'],
    ['package.json', packageJson, '"check:v46-gate1"'],
    ['gate workflow', gateWorkflow, 'check-v46-gate1-commercial-protocol-comprehension-roadmap.mjs'],
    ['canon workflow', canonWorkflow, 'check-v46-gate1-commercial-protocol-comprehension-roadmap.mjs'],
  ]) {
    assertCheck(failures, content.includes(phrase), `${label} must include "${phrase}".`);
  }

  for (const phrase of [
    'commercial protocol comprehension',
    'source-safe public/operator explanation',
    '/packs',
    '/read',
    '/deposit',
    'API/MCP',
    'ChatGPT App',
    'Bitcode Chat',
    'proof-readable',
    'value-bearing mainnet',
  ]) {
    assertCheck(
      failures,
      spec.includes(phrase) || delta.includes(phrase) || notes.includes(phrase) || parity.includes(phrase) || roadmap.includes(phrase),
      `V46 Gate 1 opening must name ${phrase}.`,
    );
  }

  const commandChecks = [
    ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V45', '--mode', 'promoted', '--current-target', 'V45']],
    ['node', ['scripts/check-bitcode-spec-family.mjs', '--version', 'V46', '--mode', 'draft', '--current-target', 'V45']],
    ['node', ['scripts/check-bitcode-canonical-inputs.mjs', '--current-target', 'V45']],
    ['node', ['scripts/check-bitcode-canon-posture-drift.mjs', '--active-canon', 'V45', '--draft-target', 'V46']],
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
    process.stderr.write(['V46 Gate 1 roadmap opening check failed:', ...failures.map((failure) => `- ${failure}`)].join('\n'));
    process.stderr.write('\n');
    process.exit(1);
  }

  process.stdout.write('V46 Gate 1 roadmap opening check passed.\n');
}

main();
