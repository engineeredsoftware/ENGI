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
      'Usage: node scripts/check-v40-gate1-testing-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V40 Gate 1 spec family, roadmap, branch, workflow, docs, and V41 prompt-program boundary posture.'
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
  const pointer = read(root, '.specifications/BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V39', `BITCODE_SPEC.txt must remain V39 during V40 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v40' || /^v40\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V40 work must occur on version/v40 or v40/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  for (const relativePath of [
    '.specifications/BITCODE_SPEC_V40.md',
    '.specifications/BITCODE_SPEC_V40_DELTA.md',
    '.specifications/BITCODE_SPEC_V40_NOTES.md',
    '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'scripts/specifying/README.md',
    '.github/pull_request_template.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json'
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V40 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V40.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V40_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V40_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V40_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const demoReadme = read(root, 'scripts/specifying/README.md');
  const prTemplate = read(root, '.github/pull_request_template.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const [label, content] of [
    ['V40 SPEC', spec],
    ['V40 DELTA', delta],
    ['V40 NOTES', notes],
    ['V40 PARITY', parity]
  ]) {
    assertCheck(failures, content.includes('Current canonical/latest target: `V39`'), `${label} must declare V39 as current canonical/latest target.`);
  }

  for (const phrase of [
    'exhaustive commercial application testing',
    'browser E2E',
    'visual/screenshot',
    'API',
    'integration',
    'unit coverage',
    'ReadNeedComprehensionSynthesis',
    'ReadFitsFindingSynthesis',
    'ledger/database/storage',
    'local/staging',
    'PromptPart',
    'prompts as programs',
    'V41'
  ]) {
    assertCheck(failures, spec.includes(phrase) || notes.includes(phrase) || roadmap.includes(phrase), `V40 opening must name ${phrase}.`);
  }

  for (const gate of [
    'Gate 1: Exhaustive Testing Roadmap And Spec Opening',
    'Gate 2: Test Inventory And Coverage Matrix',
    'Gate 3: Unit Coverage For Packages And Primitives',
    'Gate 4: API And Route Integration Contracts',
    'Gate 5: Reading Pipeline Integration Coverage',
    'Gate 6: Conversation And product Integration Coverage',
    'Gate 7: Browser E2E, Accessibility, Responsive, And Visual Proof',
    'Gate 8: Ledger, Database, Storage, Wallet, And Delivery Synchronization',
    'Gate 9: Local And Staging-Testnet Rehearsal Automation',
    'Gate 10: Prompt Benchmark Smoke And V41 Readiness',
    'Gate 11: V40 Promotion Readiness'
  ]) {
    assertCheck(failures, spec.includes(gate) || delta.includes(gate), `V40 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V39`'), 'Roadmap must state V39 active pointer.');
  assertCheck(failures, /Current working gate: V40 Gate (?:1|2|3|4|5|6|7|8|9|10|11)\b/u.test(roadmap), 'Roadmap must state active V40 gate progression.');
  assertCheck(failures, roadmap.includes('| V40 | `BITCODE_SPEC_V40.md` | active draft target |'), 'Roadmap must list V40 as active draft target.');
  assertCheck(failures, roadmap.includes('| V41 | future draft target after V40 | planned | Prompt and PromptPart'), 'Roadmap must retain V41 prompt-program focus.');
  assertCheck(failures, readme.includes('resolves to `V39`; V40 is the active draft target'), 'README must state V39 active / V40 draft posture.');
  assertCheck(failures, protocolReadme.includes('V39` active') && protocolReadme.includes('V40` draft'), 'Protocol README must state V39 active / V40 draft posture.');
  assertCheck(failures, demoReadme.includes('`BITCODE_SPEC.txt -> V39`'), 'Demonstration README must keep V39 pointer truth.');
  assertCheck(failures, prTemplate.includes('V40 Gate N:'), 'PR template must use V40 gate title examples.');
  assertCheck(failures, packageJson.includes('"check:v40-gate1"'), 'package.json must expose check:v40-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v40-gate1-testing-roadmap-opening.mjs'), 'Gate workflow must run V40 Gate 1 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v40-gate1-testing-roadmap-opening.mjs'), 'Canon workflow must run V40 Gate 1 checker.');

  if (failures.length > 0) {
    process.stderr.write('V40 Gate 1 testing roadmap opening check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V40 Gate 1 testing roadmap opening check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
