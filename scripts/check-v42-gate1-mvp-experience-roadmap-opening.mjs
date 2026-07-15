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
      'Usage: node scripts/check-v42-gate1-mvp-experience-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V42 Gate 1 spec family, roadmap, branch, workflow, docs, and active V41 / draft V42 reliable MVP experience posture.'
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

  assertCheck(failures, pointer === 'V41', `BITCODE_SPEC.txt must remain V41 during V42 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v42' || /^v42\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V42 work must occur on version/v42 or v42/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  for (const relativePath of [
    'BITCODE_SPEC_V42.md',
    'BITCODE_SPEC_V42_DELTA.md',
    'BITCODE_SPEC_V42_NOTES.md',
    'BITCODE_SPEC_V42_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'scripts/specifying/README.md',
    '.github/pull_request_template.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json'
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V42 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V42.md');
  const delta = read(root, 'BITCODE_SPEC_V42_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V42_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V42_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const demoReadme = read(root, 'scripts/specifying/README.md');
  const prTemplate = read(root, '.github/pull_request_template.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const [label, content] of [
    ['V42 SPEC', spec],
    ['V42 DELTA', delta],
    ['V42 NOTES', notes],
    ['V42 PARITY', parity]
  ]) {
    assertCheck(failures, content.includes('Current canonical/latest target: `V41`'), `${label} must declare V41 as current canonical/latest target.`);
  }

  for (const phrase of [
    'reliable MVP',
    'shortest-path Depositing',
    'shortest-path Reading',
    'ReadNeedComprehensionSynthesis',
    'ReadFitsFindingSynthesis',
    'source-safe AssetPack preview',
    'BTD/BTC settlement',
    'BTD rights transfer',
    'repository delivery',
    'depositor compensation',
    'AI-reading dominant demonstration',
    'public-data-only baseline',
    'Need review',
    'Finding Fits'
  ]) {
    assertCheck(
      failures,
      spec.includes(phrase) || delta.includes(phrase) || notes.includes(phrase) || roadmap.includes(phrase),
      `V42 opening must name ${phrase}.`
    );
  }

  for (const gate of [
    'Gate 1: MVP Experience Roadmap And Spec Opening',
    'Gate 2: Depositing Shortest Path And Compensation Visibility',
    'Gate 3: Reading Shortest Path State Machine',
    'Gate 4: ReadNeed Review And Resynthesis Product Closure',
    'Gate 5: ReadFitsFinding AssetPack Preview And Quote Closure',
    'Gate 6: Settlement Rights Transfer And Repository Delivery Closure',
    'Gate 7: AI-Reading Dominant Demonstration MVP',
    'Gate 8: Local And Staging-Testnet Full MVP Rehearsal',
    'Gate 9: V42 Promotion Readiness'
  ]) {
    assertCheck(failures, spec.includes(gate) || delta.includes(gate), `V42 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V41`'), 'Roadmap must state V41 active pointer.');
  assertCheck(failures, /Current working gate: V42 Gate (?:1|2|3|4|5|6|7|8|9)\b/u.test(roadmap), 'Roadmap must state active V42 gate progression.');
  assertCheck(failures, roadmap.includes('| V42 | `BITCODE_SPEC_V42.md` | active draft target |'), 'Roadmap must list V42 as active draft target.');
  assertCheck(failures, readme.includes('resolves to `V41`; V42 is the active draft target'), 'README must state V41 active / V42 draft posture.');
  assertCheck(failures, protocolReadme.includes('V42 Gate 1') && protocolReadme.includes('V41` active, `V42` draft'), 'Protocol README must document V42 Gate 1 active/draft posture.');
  assertCheck(failures, demoReadme.includes('`BITCODE_SPEC.txt -> V41`'), 'Demonstration README must keep V41 pointer truth.');
  assertCheck(failures, prTemplate.includes('V42 Gate N:'), 'PR template must use V42 gate title examples.');
  assertCheck(failures, packageJson.includes('"check:v42-gate1"'), 'package.json must expose check:v42-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v42-gate1-mvp-experience-roadmap-opening.mjs'), 'Gate workflow must run V42 Gate 1 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v42-gate1-mvp-experience-roadmap-opening.mjs'), 'Canon workflow must run V42 Gate 1 checker.');

  if (failures.length > 0) {
    process.stderr.write('V42 Gate 1 MVP experience roadmap opening check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V42 Gate 1 MVP experience roadmap opening check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
