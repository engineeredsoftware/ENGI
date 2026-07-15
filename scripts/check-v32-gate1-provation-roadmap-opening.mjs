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

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function hasSection(content, sectionHeading) {
  const escaped = sectionHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^#{2,6}\\s+${escaped}\\s*$`, 'm').test(content);
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    repoRoot: defaultRepoRoot
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v32-gate1-provation-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V32 Gate 1 spec family, roadmap, branch, workflow, docs, and active/draft posture readiness.'
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

  assertCheck(
    failures,
    pointer === 'V31',
    `BITCODE_SPEC.txt must remain V31 during V32 gate work. Observed ${pointer || 'empty'}.`
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v32' || /^v32\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V32 work must occur on version/v32 or v32/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V32.md',
    'BITCODE_SPEC_V32_DELTA.md',
    'BITCODE_SPEC_V32_NOTES.md',
    'BITCODE_SPEC_V32_PARITY_MATRIX.md',
    'BITCODE_SPECIFYING.md',
    'BITCODE_SPEC_TEMPLATEGUIDE.md',
    'SPECIFICATIONS_ROADMAP.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/pull_request_template.md',
    'README.md',
    'AGENTS.md',
    'packages/specifying/README.md',
    'protocol-demonstration/README.md',
    'packages/specifying/src/canon-posture.js',
    'protocol-demonstration/src/canon-posture.js'
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing required V32 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V32.md');
  const delta = read(root, 'BITCODE_SPEC_V32_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V32_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V32_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const prTemplate = read(root, '.github/pull_request_template.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'packages/specifying/README.md');
  const demoReadme = read(root, 'protocol-demonstration/README.md');
  const packagePosture = read(root, 'packages/specifying/src/canon-posture.js');
  const demoPosture = read(root, 'protocol-demonstration/src/canon-posture.js');

  for (const [label, content] of [
    ['V32 SPEC', spec],
    ['V32 DELTA', delta],
    ['V32 NOTES', notes],
    ['V32 PARITY', parity]
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V31`'),
      `${label} must declare V31 as current canonical/latest target.`
    );
  }

  for (const phrase of [
    'provation and testing deepening',
    'proof-family replay',
    'deterministic generated artifacts',
    'Reading pipeline proof coverage',
    'ReadNeedComprehensionSynthesis',
    'ReadFitsFindingSynthesis',
    'Ledger BTD Settlement Failure-State Coverage',
    'Interface Contract Regression Suites',
    'Testnet And Mainnet Readiness Rehearsal'
  ]) {
    assertCheck(failures, spec.includes(phrase), `V32 SPEC must name ${phrase}.`);
  }

  for (const gate of [
    'Gate 1: V32 Roadmap And Spec Opening',
    'Gate 2: Proof Matrix Inventory And Required Contexts',
    'Gate 3: Deterministic Replay Harness And Artifact Stability',
    'Gate 4: Reading Pipeline Proof Coverage',
    'Gate 5: Ledger BTD Settlement Failure-State Coverage',
    'Gate 6: Interface Contract Regression Suites',
    'Gate 7: Browser Accessibility Responsive Visual Coverage',
    'Gate 8: Testnet And Mainnet Readiness Rehearsal',
    'Gate 9: Promotion Proof Generation Hardening',
    'Gate 10: V32 Promotion Readiness'
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate) || spec.includes(gate), `V32 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V32 NOTES must include Notes companion rule.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V32 NOTES must include Simplified-spec reading rule.');
  assertCheck(failures, notes.includes('V32 gate plan'), 'V32 NOTES must carry the V32 gate plan.');
  assertCheck(failures, notes.includes('provation and testing'), 'V32 NOTES must name provation/testing scope.');

  assertCheck(failures, parity.includes('## Gate 1 Parity'), 'V32 PARITY must include Gate 1 parity.');
  assertCheck(failures, parity.includes('V32 implementation matrix'), 'V32 PARITY must include the implementation matrix.');
  assertCheck(failures, parity.includes('completion condition'), 'V32 PARITY must include a completion condition.');
  assertCheck(failures, parity.includes('v32/gate-1-provation-roadmap-opening'), 'V32 PARITY must name the Gate 1 branch.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V31`'), 'Roadmap must state V31 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V32.md`'), 'Roadmap must state V32 as active draft target.');
  assertCheck(failures, roadmap.includes('| V31 | `BITCODE_SPEC_V31.md` | active canon |'), 'Roadmap must mark V31 active canon.');
  assertCheck(failures, roadmap.includes('| V32 | `BITCODE_SPEC_V32.md` | active draft target |'), 'Roadmap must mark V32 active draft target.');
  for (const version of ['V32', 'V33', 'V34', 'V35', 'V36', 'V37']) {
    assertCheck(failures, roadmap.includes(`| ${version} |`), `Roadmap must preserve ${version} scope.`);
  }

  assertCheck(failures, packageJson.includes('"check:v32-gate1"'), 'package.json must expose check:v32-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v32-gate1-provation-roadmap-opening.mjs'), 'Gate workflow must run the V32 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V32 --mode draft --current-target V31'), 'Gate workflow must validate V32 draft spec over V31.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V31 --draft-target V32'), 'Gate workflow must validate V31/V32 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V32 --mode draft --current-target V31'), 'Canon workflow must validate V32 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V31 --draft-target V32'), 'Canon workflow must validate V31/V32 canon posture.');

  assertCheck(failures, readme.includes('resolves to `V31`; V32 is the active draft target'), 'README must state V31 active / V32 draft posture.');
  assertCheck(failures, readme.includes('version/v32'), 'README must document the version/v32 branch workflow.');
  assertCheck(failures, readme.includes('v32/gate-1-provation-roadmap-opening'), 'README must document a V32 gate branch example.');
  assertCheck(failures, prTemplate.includes('V32 Gate N:'), 'PR template must show V32 gate title format.');
  assertCheck(failures, protocolReadme.includes('V31` active, `V32` draft'), 'Protocol README must state V31/V32 posture.');
  assertCheck(failures, demoReadme.includes('resolves to `V31`; V32 is the next draft target'), 'Demonstration README must state V31/V32 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture]
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V31'"), `${label} must keep V31 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V32'"), `${label} must declare V32 draft target.`);
  }

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8'
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V32 Gate 1 spec roadmap opening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V32 Gate 1 spec roadmap opening ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
