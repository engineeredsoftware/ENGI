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
  return new RegExp(`^#{2,6}\\s+.*${escaped}.*$`, 'im').test(content);
}

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    repoRoot: defaultRepoRoot,
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
      'Usage: node scripts/check-v34-gate1-deployment-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V34 Gate 1 spec family, roadmap, branch, workflow, docs, and active/draft deployment-depth posture readiness.',
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

  assertCheck(
    failures,
    pointer === 'V33',
    `BITCODE_SPEC.txt must remain V33 during V34 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v34' || /^v34\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V34 work must occur on version/v34 or v34/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V34.md',
    '.specifications/BITCODE_SPEC_V34_DELTA.md',
    '.specifications/BITCODE_SPEC_V34_NOTES.md',
    '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md',
    'BITCODE_SPECIFYING.md',
    '.specifications/BITCODE_SPEC_TEMPLATEGUIDE.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/pull_request_template.md',
    'README.md',
    'AGENTS.md',
    'package.json',
    'scripts/specifying/README.md',
    'scripts/specifying/README.md',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/src/canon-posture.js',
    'scripts/specifying/data/state.json',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing required V34 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V34.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V34_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V34_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V34_PARITY_MATRIX.md');
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
  const postureState = read(root, 'scripts/specifying/data/state.json');

  for (const [label, content] of [
    ['V34 SPEC', spec],
    ['V34 DELTA', delta],
    ['V34 NOTES', notes],
    ['V34 PARITY', parity],
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V33`'),
      `${label} must declare V33 as current canonical/latest target.`,
    );
  }

  for (const phrase of [
    'deployment-depth',
    'DeploymentHostCapabilityCatalog',
    'EnvironmentLaneContract',
    'DistributedExecutionRuntimeReceipt',
    'DeploymentStoragePosture',
    'MigrationApprovalGate',
    'SecretRotationPlan',
    'RuntimeObserverRepairJob',
    'RollbackUpgradeRepairPlaybook',
    'DeploymentReadinessRehearsal',
    'ledger-derived state',
    'object storage',
    'proof artifacts',
    'secret rotation',
    'rollback',
    'staging-testnet',
    'mainnet-ready',
    'value-bearing mainnet',
  ]) {
    assertCheck(failures, spec.includes(phrase), `V34 SPEC must name ${phrase}.`);
  }

  for (const staleGate of [
    'Gate 1: V34 Interface Roadmap And Spec Opening',
    'Gate 2: Interface Inventory And Contract Catalog',
    'Gate 3: MCP API Tool And Registry Contracts',
    'Gate 4: ChatGPT App Action And Tool Contracts',
  ]) {
    assertCheck(failures, !spec.includes(staleGate), `V34 SPEC must not retain stale V33 interface-depth gate "${staleGate}".`);
  }

  for (const gate of [
    'Gate 1: V34 Deployment Roadmap And Spec Opening',
    'Gate 2: Host Capability And Environment Lane Catalog',
    'Gate 3: Distributed Execution Runtime Contracts',
    'Gate 4: Ledger Database Object Storage Deployment Posture',
    'Gate 5: Secret Rotation And Credential Boundary Operations',
    'Gate 6: Migration CI/CD Deployment Approval Gates',
    'Gate 7: Runtime Observers Broadcasters Repair Jobs',
    'Gate 8: Rollback Upgrade Data Repair Playbooks',
    'Gate 9: Local Staging Testnet Deployment Rehearsal',
    'Gate 10: V34 Promotion Readiness',
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate) || spec.includes(gate), `V34 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V34 NOTES must include Notes companion rule.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V34 NOTES must include Simplified-spec reading rule.');
  assertCheck(failures, notes.includes('V34 gate plan'), 'V34 NOTES must carry the V34 gate plan.');
  assertCheck(failures, notes.includes('deployment depth'), 'V34 NOTES must name deployment depth scope.');

  assertCheck(failures, parity.includes('## Gate 1 Parity'), 'V34 PARITY must include Gate 1 parity.');
  assertCheck(failures, parity.includes('V34 implementation matrix'), 'V34 PARITY must include the implementation matrix.');
  assertCheck(failures, parity.includes('completion condition'), 'V34 PARITY must include a completion condition.');
  assertCheck(failures, parity.includes('v34/gate-1-deployment-roadmap-opening'), 'V34 PARITY must name the Gate 1 branch.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V33`'), 'Roadmap must state V33 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V34.md`'), 'Roadmap must state V34 as active draft target.');
  assertCheck(failures, roadmap.includes('| V33 | `BITCODE_SPEC_V33.md` | active canon |'), 'Roadmap must mark V33 active canon.');
  assertCheck(failures, roadmap.includes('| V34 | `BITCODE_SPEC_V34.md` | active draft target |'), 'Roadmap must mark V34 active draft target.');
  for (const version of ['V34', 'V35', 'V36', 'V37']) {
    assertCheck(failures, roadmap.includes(`| ${version} |`), `Roadmap must preserve ${version} scope.`);
  }

  assertCheck(failures, packageJson.includes('"check:v34-gate1"'), 'package.json must expose check:v34-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v34-gate1-deployment-roadmap-opening.mjs'), 'Gate workflow must run the V34 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V34 --mode draft --current-target V33'), 'Gate workflow must validate V34 draft spec over V33.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V33 --draft-target V34'), 'Gate workflow must validate V33/V34 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V34 --mode draft --current-target V33'), 'Canon workflow must validate V34 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V33 --draft-target V34'), 'Canon workflow must validate V33/V34 canon posture.');
  assertCheck(failures, canonWorkflow.includes('spec:\\ V34*|spec:\\ v34*'), 'Canon workflow must enforce V34 spec-title conformance.');

  assertCheck(failures, readme.includes('resolves to `V33`; V34 is the active draft target'), 'README must state V33 active / V34 draft posture.');
  assertCheck(failures, readme.includes('version/v34'), 'README must document the version/v34 branch workflow.');
  assertCheck(failures, readme.includes('v34/gate-1-deployment-roadmap-opening'), 'README must document a V34 gate branch example.');
  assertCheck(failures, prTemplate.includes('V34 Gate N:'), 'PR template must show V34 gate title format.');
  assertCheck(failures, protocolReadme.includes('V33` active, `V34` draft'), 'Protocol README must state V33/V34 posture.');
  assertCheck(failures, demoReadme.includes('resolves to `V33`; V34 is the active draft target'), 'Demonstration README must state V33/V34 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture],
    ['protocol state projection', postureState],
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V33'") || content.includes('"activeCanonVersion": "V33"'), `${label} must keep V33 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V34'") || content.includes('"draftTargetVersion": "V34"'), `${label} must declare V34 draft target.`);
  }

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V34 Gate 1 deployment roadmap opening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V34 Gate 1 deployment roadmap opening ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
