#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

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
    repoRoot
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
      'Usage: node scripts/check-v29-gate1-objectives-and-gating.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V29 Gate 1 draft-family, branch, workflow, docs, and posture readiness.'
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
    pointer === 'V28',
    `BITCODE_SPEC.txt must remain V28 during V29 gate work. Observed ${pointer || 'empty'}.`
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v29' || /^v29\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V29 work must occur on version/v29 or gate-prefixed branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V29.md',
    '.specifications/BITCODE_SPEC_V29_DELTA.md',
    '.specifications/BITCODE_SPEC_V29_NOTES.md',
    '.specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md',
    'BITCODE_SPECIFYING.md',
    '.specifications/BITCODE_SPEC_TEMPLATEGUIDE.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'README.md',
    'AGENTS.md'
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing required V29 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V29.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V29_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V29_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V29_PARITY_MATRIX.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const readme = read(root, 'README.md');
  const agents = read(root, 'AGENTS.md');
  const posture = read(root, 'scripts/specifying/src/canon-posture.js');

  assertCheck(failures, spec.includes('Current canonical/latest target: `V28`'), 'V29 SPEC must declare V28 as current canonical/latest target.');
  assertCheck(failures, delta.includes('Current canonical/latest target: `V28`'), 'V29 DELTA must declare V28 as current canonical/latest target.');
  assertCheck(failures, notes.includes('Current canonical/latest target: `V28`'), 'V29 NOTES must declare V28 as current canonical/latest target.');
  assertCheck(failures, parity.includes('Current canonical/latest target: `V28`'), 'V29 PARITY must declare V28 as current canonical/latest target.');
  assertCheck(failures, posture.includes("ACTIVE_CANON_VERSION = 'V28'"), 'Runtime canon posture must keep V28 active.');
  assertCheck(failures, posture.includes("DRAFT_TARGET_VERSION = 'V29'"), 'Runtime canon posture must declare V29 as draft target.');

  for (const gate of [
    'Gate 1: V29 Objectives And Gating',
    'Gate 2: product Transaction Read Models And Navigation',
    'Gate 3: Wallet Signer Session And BTC Fee Operations',
    'Gate 4: Reading Transaction Recovery And Pipeline Observability',
    'Gate 5: AssetPack Disclosure Rights And Preview Depth',
    'Gate 6: Settlement Reconciliation And Repair',
    'Gate 7: Organization Permissions And Interface Authority',
    'Gate 8: Demonstration-Origin Commercial Formalization',
    'Gate 9: product UX Quality And Browser Proof',
    'Gate 10: Local And Staging Promotion Readiness'
  ]) {
    assertCheck(failures, hasSection(delta, gate) || notes.includes(gate), `V29 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V29 NOTES must carry the simplified-spec reading rule.');
  assertCheck(failures, hasSection(parity, 'V29 implementation matrix'), 'V29 PARITY must carry an implementation matrix.');
  assertCheck(failures, hasSection(parity, 'V29 implementation checklist'), 'V29 PARITY must carry an implementation checklist.');
  assertCheck(failures, parity.includes('| Draft family and branch posture | Gate 1 |'), 'V29 PARITY must name Gate 1 draft-family posture.');

  assertCheck(failures, packageJson.includes('"check:v29-gate1"'), 'package.json must expose check:v29-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v29-gate1-objectives-and-gating.mjs'), 'Gate workflow must run the V29 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V29 --mode draft --current-target V28'), 'Gate workflow must validate V29 draft spec over V28.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V28 --draft-target V29'), 'Gate workflow must validate V28/V29 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V28 --draft-target V29'), 'Canon quality workflow must validate V28/V29 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V29 --mode draft --current-target V28'), 'Canon quality workflow must validate V29 draft family.');

  assertCheck(failures, readme.includes('resolves to `V28`; V29 is the active draft target'), 'README must state V28 active / V29 draft posture.');
  assertCheck(failures, readme.includes('version/v29'), 'README must document the version/v29 branch workflow.');
  assertCheck(failures, readme.includes('v29/gate-1-objectives-and-gating'), 'README must document a V29 gate branch example.');
  assertCheck(failures, agents.includes('version/v29') || agents.includes('such as `version/v28`'), 'AGENTS.md must document version base branch usage.');
  assertCheck(failures, /gate branches must be prefixed with the gate number/i.test(agents), 'AGENTS.md must retain gate-number branch discipline.');

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8'
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V29 Gate 1 objectives and gating check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V29 Gate 1 objectives and gating ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
