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
      'Usage: node scripts/check-v43-gate1-packs-read-deposit-roadmap.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V43 Gate 1 spec family, roadmap, docs, workflow, package script, and active V42 / draft V43 route-product posture.',
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
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V42', `BITCODE_SPEC.txt must remain V42 during V43 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v43' || /^v43\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V43 work must occur on version/v43 or v43/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'BITCODE_SPEC_V43.md',
    'BITCODE_SPEC_V43_DELTA.md',
    'BITCODE_SPEC_V43_NOTES.md',
    'BITCODE_SPEC_V43_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'scripts/specifying/README.md',
    '.github/pull_request_template.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V43 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V43.md');
  const delta = read(root, 'BITCODE_SPEC_V43_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V43_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V43_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const demoReadme = read(root, 'scripts/specifying/README.md');
  const prTemplate = read(root, '.github/pull_request_template.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const [label, content] of [
    ['V43 SPEC', spec],
    ['V43 DELTA', delta],
    ['V43 NOTES', notes],
    ['V43 PARITY', parity],
  ]) {
    assertCheck(failures, content.includes('Current canonical/latest target: `V42`'), `${label} must declare V42 as current canonical/latest target.`);
  }

  for (const phrase of [
    '/packs',
    '/read',
    '/deposit',
    'AssetPacks in and AssetPacks out',
    'agentic deposit',
    'DepositAssetPackOption',
    'PackActivity',
    'searchable master-detail',
    'column sorting',
    'filtering',
    'source-safe measurements',
    'sub-critical',
    'positive ROI',
    'Reading demand',
    'self-referential',
    'self-explanatory',
    'unpaid AssetPack source',
  ]) {
    assertCheck(
      failures,
      spec.includes(phrase) || delta.includes(phrase) || notes.includes(phrase) || parity.includes(phrase) || roadmap.includes(phrase),
      `V43 opening must name ${phrase}.`,
    );
  }

  for (const gate of [
    'Gate 1 Packs, Read, Deposit Roadmap And Spec Opening',
    'Gate 2 Route Vocabulary Inventory And Migration Plan',
    'Gate 3 Packs Activity Master-Detail Data Model',
    'Gate 4 Read Route Extraction And Five-Step UX',
    'Gate 5 Deposit Route And Agentic AssetPack Option Synthesis',
    'Gate 6 Source Criticality, Demand, ROI, And Compensation Policy',
    'Gate 7 Deposit Option Review, Approval, And Admission',
    'Gate 8 UX/UI Product Excellence Pass',
    'Gate 9 Cross-Route Rehearsal, Telemetry, And Repair',
    'Gate 10 Promotion Readiness',
  ]) {
    assertCheck(failures, spec.includes(gate) || delta.includes(gate), `V43 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V42`'), 'Roadmap must state V42 active pointer.');
  assertCheck(failures, roadmap.includes('Current working gate: V43 Gate'), 'Roadmap must state active V43 gate work.');
  assertCheck(failures, roadmap.includes('| V43 | `BITCODE_SPEC_V43.md` | active draft target |'), 'Roadmap must list V43 as active draft target.');
  assertCheck(failures, readme.includes('resolves to `V42`; V43 is the active draft target'), 'README must state V42 active / V43 draft posture.');
  assertCheck(failures, readme.includes('/packs') && readme.includes('/read') && readme.includes('/deposit'), 'README must document V43 routes.');
  assertCheck(failures, protocolReadme.includes('V43 Gate 1') && protocolReadme.includes('V42` active, `V43` draft'), 'Protocol README must document V43 Gate 1 active/draft posture.');
  assertCheck(failures, demoReadme.includes('`BITCODE_SPEC.txt -> V42`'), 'Demonstration README must keep V42 pointer truth.');
  assertCheck(failures, prTemplate.includes('V43 Gate N:'), 'PR template must use V43 gate title examples.');
  assertCheck(failures, packageJson.includes('"check:v43-gate1"'), 'package.json must expose check:v43-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v43-gate1-packs-read-deposit-roadmap.mjs'), 'Gate workflow must run V43 Gate 1 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v43-gate1-packs-read-deposit-roadmap.mjs'), 'Canon workflow must run V43 Gate 1 checker.');

  if (failures.length > 0) {
    process.stderr.write('V43 Gate 1 packs/read/deposit roadmap check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V43 Gate 1 packs/read/deposit roadmap check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
