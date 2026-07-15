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
      'Usage: node scripts/check-v30-gate1-roadmap-and-gating.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V30 Gate 1 roadmap, draft-family, branch, workflow, docs, and active/draft posture readiness.'
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
    pointer === 'V29',
    `BITCODE_SPEC.txt must remain V29 during V30 gate work. Observed ${pointer || 'empty'}.`
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v30' || /^v30\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V30 work must occur on version/v30 or v30/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V30.md',
    'BITCODE_SPEC_V30_DELTA.md',
    'BITCODE_SPEC_V30_NOTES.md',
    'BITCODE_SPEC_V30_PARITY_MATRIX.md',
    'BITCODE_SPECIFYING.md',
    'BITCODE_SPEC_TEMPLATEGUIDE.md',
    'SPECIFICATIONS_ROADMAP.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/pull_request_template.md',
    'README.md',
    'AGENTS.md',
    'packages/specifying/src/canon-posture.js',
    'protocol-demonstration/src/canon-posture.js'
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing required V30 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V30.md');
  const delta = read(root, 'BITCODE_SPEC_V30_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V30_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V30_PARITY_MATRIX.md');
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
    ['V30 SPEC', spec],
    ['V30 DELTA', delta],
    ['V30 NOTES', notes],
    ['V30 PARITY', parity]
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V29`'),
      `${label} must declare V29 as current canonical/latest target.`
    );
  }

  assertCheck(failures, spec.includes('Protocol/BTD hardening'), 'V30 SPEC must define Protocol/BTD hardening scope.');
  assertCheck(failures, spec.includes('BtdAssetPackMintReceipt'), 'V30 SPEC must name BTD AssetPack mint receipts.');
  assertCheck(failures, spec.includes('SourceToSharesProof'), 'V30 SPEC must name source-to-shares proof cleanup.');
  assertCheck(failures, spec.includes('BridgeReadinessResearchPosture'), 'V30 SPEC must name bridge-readiness research posture.');
  assertCheck(failures, delta.includes('Gate 1: V30 Roadmap And Gating'), 'V30 DELTA must define Gate 1.');
  assertCheck(failures, notes.includes('V30 gate plan'), 'V30 NOTES must carry the V30 gate plan.');
  assertCheck(failures, parity.includes('## Gate 1 Parity'), 'V30 PARITY must include Gate 1 parity.');
  assertCheck(failures, parity.includes('V30 implementation matrix'), 'V30 PARITY must include the implementation matrix.');
  assertCheck(failures, parity.includes('completion condition'), 'V30 PARITY must include a completion condition.');

  for (const gate of [
    'Gate 1: V30 Roadmap And Gating',
    'Gate 2: Protocol Package API Boundaries',
    'Gate 3: Bitcoin Taproot PSBT Fee Rigor',
    'Gate 4: BTD AssetPack Mint And Read Receipts',
    'Gate 5: Testnet Ledger Projection Hardening',
    'Gate 6: Source-To-Shares Proof Cleanup',
    'Gate 7: Bridge Readiness Research Boundaries',
    'Gate 8: Protocol Telemetry And Proof Hooks',
    'Gate 9: Interface Integration And Regression Proof',
    'Gate 10: V30 Promotion Readiness'
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate), `V30 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V30 NOTES must be a notes companion, not notes-only planning memory.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V30 NOTES must carry the simplified-spec reading rule.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V29`'), 'Roadmap must state V29 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V30.md`'), 'Roadmap must state V30 as active draft target.');
  assertCheck(failures, roadmap.includes('| V29 | `BITCODE_SPEC_V29.md` | active canon |'), 'Roadmap must mark V29 active canon.');
  assertCheck(failures, roadmap.includes('| V30 | `BITCODE_SPEC_V30.md` | active draft target |'), 'Roadmap must mark V30 active draft target.');
  for (const version of ['V31', 'V32', 'V33', 'V34', 'V35', 'V36', 'V37']) {
    assertCheck(failures, roadmap.includes(`| ${version} |`), `Roadmap must preserve ${version} scope.`);
  }

  assertCheck(failures, packageJson.includes('"check:v30-gate1"'), 'package.json must expose check:v30-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v30-gate1-roadmap-and-gating.mjs'), 'Gate workflow must run the V30 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V30 --mode draft --current-target V29'), 'Gate workflow must validate V30 draft spec over V29.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V29 --draft-target V30'), 'Gate workflow must validate V29/V30 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V30 --mode draft --current-target V29'), 'Canon workflow must validate V30 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V29 --draft-target V30'), 'Canon workflow must validate V29/V30 canon posture.');

  assertCheck(failures, readme.includes('resolves to `V29`; V30 is the active draft target'), 'README must state V29 active / V30 draft posture.');
  assertCheck(failures, readme.includes('version/v30'), 'README must document the version/v30 branch workflow.');
  assertCheck(failures, readme.includes('v30/gate-1-roadmap-and-gating'), 'README must document a V30 gate branch example.');
  assertCheck(failures, prTemplate.includes('V30 Gate N:'), 'PR template must show V30 gate title format.');
  assertCheck(failures, protocolReadme.includes('V29` active, `V30` draft'), 'Protocol README must state V29/V30 posture.');
  assertCheck(failures, demoReadme.includes('resolves to `V29`; V30 is the active draft target'), 'Demonstration README must state V29/V30 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture]
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V29'"), `${label} must keep V29 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V30'"), `${label} must declare V30 draft target.`);
  }

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8'
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V30 Gate 1 roadmap and gating check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V30 Gate 1 roadmap and gating ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
