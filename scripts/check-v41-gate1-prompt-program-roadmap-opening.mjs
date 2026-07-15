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
      'Usage: node scripts/check-v41-gate1-prompt-program-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V41 Gate 1 spec family, roadmap, branch, workflow, docs, and active V40 / draft V41 prompt-program posture.'
    ].join('\n')
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
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V40', `BITCODE_SPEC.txt must remain V40 during V41 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v41' || /^v41\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V41 work must occur on version/v41 or v41/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  for (const relativePath of [
    'BITCODE_SPEC_V41.md',
    'BITCODE_SPEC_V41_DELTA.md',
    'BITCODE_SPEC_V41_NOTES.md',
    'BITCODE_SPEC_V41_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'packages/specifying/README.md',
    '.github/pull_request_template.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json'
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V41 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V41.md');
  const delta = read(root, 'BITCODE_SPEC_V41_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V41_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V41_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const demoReadme = read(root, 'packages/specifying/README.md');
  const prTemplate = read(root, '.github/pull_request_template.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const [label, content] of [
    ['V41 SPEC', spec],
    ['V41 DELTA', delta],
    ['V41 NOTES', notes],
    ['V41 PARITY', parity]
  ]) {
    assertCheck(failures, content.includes('Current canonical/latest target: `V40`'), `${label} must declare V40 as current canonical/latest target.`);
  }

  for (const phrase of [
    'PromptPart',
    'Prompt',
    'prompts as programs',
    'ReadNeedComprehensionSynthesis',
    'ReadFitsFindingSynthesis',
    'FailsafeGenerationSequence',
    'ThricifiedGeneration',
    'registry',
    'interpolation',
    'benchmark',
    'inference callsite',
    'parsed return type',
    'source-safe telemetry',
    'raw provider responses',
    'unpaid AssetPack source'
  ]) {
    assertCheck(failures, spec.includes(phrase) || notes.includes(phrase) || roadmap.includes(phrase), `V41 opening must name ${phrase}.`);
  }

  for (const gate of [
    'Gate 1: Prompt Program Roadmap And Spec Opening',
    'Gate 2: PromptPart And Prompt Inventory Catalog',
    'Gate 3: Registry Composition And Interpolation Contracts',
    'Gate 4: Reading Pipeline Prompt Benchmark Baselines',
    'Gate 5: ReadNeedComprehensionSynthesis Prompt Rewrite And Return-Type Hardening',
    'Gate 6: ReadFitsFindingSynthesis Prompt Rewrite Search And AssetPack Context Hardening',
    'Gate 7: Conversation Tool And Interface Prompt Rewrite',
    'Gate 8: Prompt Benchmark Report And Telemetry Integration',
    'Gate 9: V41 Promotion Readiness'
  ]) {
    assertCheck(failures, spec.includes(gate) || delta.includes(gate), `V41 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V40`'), 'Roadmap must state V40 active pointer.');
  assertCheck(failures, /Current working gate: V41 Gate (?:1|2|3|4|5|6|7|8|9)\b/u.test(roadmap), 'Roadmap must state active V41 gate progression.');
  assertCheck(failures, roadmap.includes('| V41 | `BITCODE_SPEC_V41.md` | active draft target |'), 'Roadmap must list V41 as active draft target.');
  assertCheck(failures, readme.includes('resolves to `V40`; V41 is the active draft target'), 'README must state V40 active / V41 draft posture.');
  assertCheck(failures, protocolReadme.includes('V41 Gate 1') && protocolReadme.includes('V40` active, `V41` draft'), 'Protocol README must document V41 Gate 1 active/draft posture.');
  assertCheck(failures, demoReadme.includes('`BITCODE_SPEC.txt -> V40`'), 'Demonstration README must keep V40 pointer truth.');
  assertCheck(failures, prTemplate.includes('V41 Gate N:'), 'PR template must use V41 gate title examples.');
  assertCheck(failures, packageJson.includes('"check:v41-gate1"'), 'package.json must expose check:v41-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v41-gate1-prompt-program-roadmap-opening.mjs'), 'Gate workflow must run V41 Gate 1 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v41-gate1-prompt-program-roadmap-opening.mjs'), 'Canon workflow must run V41 Gate 1 checker.');

  if (failures.length > 0) {
    process.stderr.write('V41 Gate 1 prompt-program roadmap opening check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V41 Gate 1 prompt-program roadmap opening check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
