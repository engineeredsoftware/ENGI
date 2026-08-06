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
      'Usage: node scripts/check-v31-gate1-spec-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V31 Gate 1 spec family, roadmap, branch, workflow, docs, and active/draft posture readiness.'
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

  assertCheck(
    failures,
    pointer === 'V30',
    `BITCODE_SPEC.txt must remain V30 during V31 gate work. Observed ${pointer || 'empty'}.`
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v31' || /^v31\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V31 work must occur on version/v31 or v31/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V31.md',
    '.specifications/BITCODE_SPEC_V31_DELTA.md',
    '.specifications/BITCODE_SPEC_V31_NOTES.md',
    '.specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md',
    'BITCODE_SPECIFYING.md',
    '.specifications/BITCODE_SPEC_TEMPLATEGUIDE.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/pull_request_template.md',
    'README.md',
    'AGENTS.md',
    'scripts/specifying/README.md',
    'scripts/specifying/README.md',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/src/canon-posture.js'
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing required V31 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V31.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V31_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V31_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V31_PARITY_MATRIX.md');
  const roadmap = read(root, '.specifications/SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const prTemplate = read(root, '.github/pull_request_template.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const demoReadme = read(root, 'scripts/specifying/README.md');
  const packagePosture = read(root, 'scripts/specifying/src/canon-posture.js');
  const demoPosture = read(root, 'scripts/specifying/src/canon-posture.js');

  for (const [label, content] of [
    ['V31 SPEC', spec],
    ['V31 DELTA', delta],
    ['V31 NOTES', notes],
    ['V31 PARITY', parity]
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V30`'),
      `${label} must declare V30 as current canonical/latest target.`
    );
  }

  for (const phrase of [
    'Auxillaries deepening',
    'AuxillariesProfileState',
    'AuxillariesConnectionReadiness',
    'AuxillariesInterfaceAdmission',
    'AuxillariesWalletBtdPaneState',
    'OrganizationPolicyAuthority',
    'AuxillariesReadinessDiagnostic',
    'AuxillariesRecoveryRun',
    'AuxillariesTelemetryProofHook'
  ]) {
    assertCheck(failures, spec.includes(phrase), `V31 SPEC must name ${phrase}.`);
  }

  for (const gate of [
    'Gate 1: V31 Roadmap And Spec Opening',
    'Gate 2: Auxillaries Package And Route Contracts',
    'Gate 3: Profile And Account State',
    'Gate 4: Connects Provider Readiness And Recovery',
    'Gate 5: Wallet And BTD Pane Readiness',
    'Gate 6: Organization Team Role Policy Authority',
    'Gate 7: Interfaces Pane Admission And Cross-Surface Contracts',
    'Gate 8: Auxillaries UX Accessibility And Responsive Proof',
    'Gate 9: Auxillaries Telemetry Proof And Recovery Runs',
    'Gate 10: V31 Promotion Readiness'
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate) || spec.includes(gate), `V31 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V31 NOTES must include Notes companion rule.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V31 NOTES must include Simplified-spec reading rule.');
  assertCheck(failures, notes.includes('V31 gate plan'), 'V31 NOTES must carry the V31 gate plan.');
  assertCheck(failures, notes.includes('Auxillaries'), 'V31 NOTES must name Auxillaries scope.');

  assertCheck(failures, parity.includes('## Gate 1 Parity'), 'V31 PARITY must include Gate 1 parity.');
  assertCheck(failures, parity.includes('V31 implementation matrix'), 'V31 PARITY must include the implementation matrix.');
  assertCheck(failures, parity.includes('completion condition'), 'V31 PARITY must include a completion condition.');
  assertCheck(failures, parity.includes('v31/gate-1-spec-roadmap-opening'), 'V31 PARITY must name the Gate 1 branch.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V30`'), 'Roadmap must state V30 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V31.md`'), 'Roadmap must state V31 as active draft target.');
  assertCheck(failures, roadmap.includes('| V30 | `BITCODE_SPEC_V30.md` | active canon |'), 'Roadmap must mark V30 active canon.');
  assertCheck(failures, roadmap.includes('| V31 | `BITCODE_SPEC_V31.md` | active draft target |'), 'Roadmap must mark V31 active draft target.');
  for (const version of ['V32', 'V33', 'V34', 'V35', 'V36', 'V37']) {
    assertCheck(failures, roadmap.includes(`| ${version} |`), `Roadmap must preserve ${version} scope.`);
  }

  assertCheck(failures, packageJson.includes('"check:v31-gate1"'), 'package.json must expose check:v31-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v31-gate1-spec-roadmap-opening.mjs'), 'Gate workflow must run the V31 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V31 --mode draft --current-target V30'), 'Gate workflow must validate V31 draft spec over V30.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V30 --draft-target V31'), 'Gate workflow must validate V30/V31 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V31 --mode draft --current-target V30'), 'Canon workflow must validate V31 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V30 --draft-target V31'), 'Canon workflow must validate V30/V31 canon posture.');

  assertCheck(failures, readme.includes('resolves to `V30`; V31 is the active draft target'), 'README must state V30 active / V31 draft posture.');
  assertCheck(failures, readme.includes('version/v31'), 'README must document the version/v31 branch workflow.');
  assertCheck(failures, readme.includes('v31/gate-1-spec-roadmap-opening'), 'README must document a V31 gate branch example.');
  assertCheck(failures, prTemplate.includes('V31 Gate N:'), 'PR template must show V31 gate title format.');
  assertCheck(failures, protocolReadme.includes('V30` active, `V31` draft'), 'Protocol README must state V30/V31 posture.');
  assertCheck(failures, demoReadme.includes('resolves to `V30`; V31 is the next draft target'), 'Demonstration README must state V30/V31 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture]
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V30'"), `${label} must keep V30 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V31'"), `${label} must declare V31 draft target.`);
  }

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8'
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V31 Gate 1 spec roadmap opening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V31 Gate 1 spec roadmap opening ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
