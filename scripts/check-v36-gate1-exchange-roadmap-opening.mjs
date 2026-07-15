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
      'Usage: node scripts/check-v36-gate1-exchange-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V36 Gate 1 spec family, roadmap, branch, workflow, docs, and active/draft Exchange posture readiness.',
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
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V35',
    `BITCODE_SPEC.txt must remain V35 during V36 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v36' || /^v36\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V36 work must occur on version/v36 or v36/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'specifications/BITCODE_SPEC_V36.md',
    'specifications/BITCODE_SPEC_V36_DELTA.md',
    'specifications/BITCODE_SPEC_V36_NOTES.md',
    'specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'BITCODE_SPECIFYING.md',
    'specifications/BITCODE_SPEC_TEMPLATEGUIDE.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing required V36 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V36.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V36_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V36_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V36_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
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
    ['V36 SPEC', spec],
    ['V36 DELTA', delta],
    ['V36 NOTES', notes],
    ['V36 PARITY', parity],
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V35`'),
      `${label} must declare V35 as current canonical/latest target.`,
    );
  }

  for (const phrase of [
    'Exchange-depth',
    'ExchangeActivityBook',
    'ExchangeIntent',
    'ExchangeOrder',
    'ExchangeRightsTransferPreview',
    'ExchangePricingQuote',
    'ExchangeSettlementReceipt',
    'ExchangeDisputeRepairCase',
    'ExchangeRevenueRoute',
    'market-wide activity',
    'buy, sell, bid, ask, cancel, accept, settle, and history',
    'AssetPack range trading',
    'rights-transfer review',
    'pricing',
    'liquidity',
    'wrapper analysis',
    'ledger/database synchronization',
    'dispute',
    'repair',
    'revenue route',
    'source-safe',
    'protected AssetPack source',
    'value-bearing mainnet',
  ]) {
    assertCheck(failures, spec.includes(phrase), `V36 SPEC must name ${phrase}.`);
  }

  for (const staleGate of [
    'Gate 1: V35 Telemetry Documentation Roadmap And Spec Opening',
    'Gate 2: Documentation Surface Catalog',
    'Gate 3: Telemetry Taxonomy Event Schema And Redaction',
    'Gate 4: Public Docs Usage Guides',
    'Gate 5: Dashboards Alerts Runbooks Incident Escalation',
  ]) {
    assertCheck(
      failures,
      !spec.includes(staleGate) && !delta.includes(staleGate) && !notes.includes(staleGate) && !parity.includes(staleGate),
      `V36 family must not retain stale telemetry/documentation gate "${staleGate}".`,
    );
  }

  for (const gate of [
    'Gate 1: V36 Exchange Roadmap And Spec Opening',
    'Gate 2: Exchange Activity Book And Market Master Detail',
    'Gate 3: Buy Sell Bid Ask Cancel Accept Intent Contracts',
    'Gate 4: AssetPack Range Trading And Rights Transfer Review',
    'Gate 5: Pricing Liquidity Fee Quote And Wrapper Analysis',
    'Gate 6: Exchange Settlement Ledger Database Reconciliation',
    'Gate 7: Dispute Repair Revenue Route Operations',
    'Gate 8: Exchange UX And Terminal Navigation Integration',
    'Gate 9: Local Staging Exchange Rehearsal And Proof Coverage',
    'Gate 10: V36 Promotion Readiness',
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate) || spec.includes(gate), `V36 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V36 NOTES must include Notes companion rule.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V36 NOTES must include Simplified-spec reading rule.');
  assertCheck(failures, notes.includes('V36 gate plan'), 'V36 NOTES must carry the V36 gate plan.');
  assertCheck(failures, notes.includes('Exchange depth notes'), 'V36 NOTES must name Exchange depth scope.');

  assertCheck(failures, parity.includes('## Gate 1 Parity'), 'V36 PARITY must include Gate 1 parity.');
  assertCheck(failures, parity.includes('V36 implementation matrix'), 'V36 PARITY must include the implementation matrix.');
  assertCheck(failures, parity.includes('completion condition'), 'V36 PARITY must include a completion condition.');
  assertCheck(failures, parity.includes('v36/gate-1-exchange-roadmap-opening'), 'V36 PARITY must name the Gate 1 branch.');
  assertCheck(failures, parity.includes('Exchange vocabulary'), 'V36 PARITY must include Exchange vocabulary row.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V35`'), 'Roadmap must state V35 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V36.md`'), 'Roadmap must state V36 as active draft target.');
  assertCheck(failures, roadmap.includes('| V35 | `BITCODE_SPEC_V35.md` | active canon |'), 'Roadmap must mark V35 active canon.');
  assertCheck(failures, roadmap.includes('| V36 | `BITCODE_SPEC_V36.md` | active draft target |'), 'Roadmap must mark V36 active draft target.');
  for (const version of ['V35', 'V36', 'V37']) {
    assertCheck(failures, roadmap.includes(`| ${version} |`), `Roadmap must preserve ${version} scope.`);
  }

  assertCheck(failures, packageJson.includes('"check:v36-gate1"'), 'package.json must expose check:v36-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v36-gate1-exchange-roadmap-opening.mjs'), 'Gate workflow must run the V36 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V36 --mode draft --current-target V35'), 'Gate workflow must validate V36 draft spec over V35.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V35 --draft-target V36'), 'Gate workflow must validate V35/V36 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V36 --mode draft --current-target V35'), 'Canon workflow must validate V36 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V35 --draft-target V36'), 'Canon workflow must validate V35/V36 canon posture.');
  assertCheck(failures, canonWorkflow.includes('spec:\\ V36*|spec:\\ v36*'), 'Canon workflow must enforce V36 spec-title conformance.');

  assertCheck(failures, readme.includes('resolves to `V35`; V36 is the active draft target'), 'README must state V35 active / V36 draft posture.');
  assertCheck(failures, readme.includes('version/v36'), 'README must document the version/v36 branch workflow.');
  assertCheck(failures, readme.includes('v36/gate-1-exchange-roadmap-opening'), 'README must document a V36 gate branch example.');
  assertCheck(failures, prTemplate.includes('V36 Gate N:'), 'PR template must show V36 gate title format.');
  assertCheck(failures, protocolReadme.includes('V35` active, `V36` draft'), 'Protocol README must state V35/V36 posture.');
  assertCheck(failures, demoReadme.includes('resolves to `V35`; V36 is the active draft target'), 'Demonstration README must state V35/V36 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture],
    ['protocol state projection', postureState],
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V35'") || content.includes('"activeCanonVersion": "V35"'), `${label} must keep V35 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V36'") || content.includes('"draftTargetVersion": "V36"'), `${label} must declare V36 draft target.`);
  }

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V36 Gate 1 exchange roadmap opening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V36 Gate 1 exchange roadmap opening ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
