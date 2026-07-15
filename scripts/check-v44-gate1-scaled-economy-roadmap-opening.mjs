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

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write('Usage: node scripts/check-v44-gate1-scaled-economy-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]\n');
    return;
  }

  const root = args.repoRoot;
  const failures = [];
  const pointer = read(root, 'specifications/BITCODE_SPEC.txt').trim();

  assertCheck(failures, pointer === 'V43', `BITCODE_SPEC.txt must remain V43 during V44 gate work. Observed ${pointer || 'empty'}.`);

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v44' || /^v44\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V44 work must occur on version/v44 or v44/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  for (const relativePath of [
    'specifications/BITCODE_SPEC_V44.md',
    'specifications/BITCODE_SPEC_V44_DELTA.md',
    'specifications/BITCODE_SPEC_V44_NOTES.md',
    'specifications/BITCODE_SPEC_V44_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'scripts/specifying/README.md',
    '.github/pull_request_template.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    'package.json',
  ]) {
    assertCheck(failures, exists(root, relativePath), `Missing required V44 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V44.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V44_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V44_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V44_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const demoReadme = read(root, 'scripts/specifying/README.md');
  const prTemplate = read(root, '.github/pull_request_template.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');

  for (const [label, content] of [
    ['V44 SPEC', spec],
    ['V44 DELTA', delta],
    ['V44 NOTES', notes],
    ['V44 PARITY', parity],
  ]) {
    assertCheck(failures, content.includes('Current canonical/latest target: `V43`'), `${label} must declare V43 as current canonical/latest target.`);
  }

  for (const phrase of [
    'digitizing and tokenizing scaled engineering economies',
    'EnterprisePackPortfolio',
    'PackMarketSignal',
    'ReadDemandSignal',
    'DepositSupplyOpportunity',
    'ReadingBudgetPolicy',
    'AssetPackQuotePolicy',
    'ContributorCompensationStatement',
    'OrganizationPackPolicy',
    'ScaledNetworkRehearsalReceipt',
    'estimate, quote, observed payment, final settlement, contributor allocation, delivery, or repair state',
    '/packs',
    '/read',
    '/deposit',
    'source-to-shares',
    'value-bearing mainnet',
  ]) {
    assertCheck(
      failures,
      spec.includes(phrase) || delta.includes(phrase) || notes.includes(phrase) || parity.includes(phrase) || roadmap.includes(phrase),
      `V44 opening must name ${phrase}.`,
    );
  }

  for (const gate of [
    'Gate 1 Scaled Engineering Economy Roadmap Opening',
    'Gate 2 Economic Domain Model And Receipt Taxonomy',
    'Gate 3 Packs Portfolio Search And Market Intelligence',
    'Gate 4 Reading Budget, Quote Policy, And Procurement Governance',
    'Gate 5 Depositor Earnings, ROI, And Supply Opportunity Intelligence',
    'Gate 6 BTD/BTC Accounting And Contributor Compensation Statements',
    'Gate 7 Organization Policy, Approval, And Wallet Authority',
    'Gate 8 Enterprise Product UX For Economic Operation',
    'Gate 9 Scaled Local/Staging Network Rehearsal',
    'Gate 10 Promotion Readiness',
  ]) {
    assertCheck(failures, spec.includes(gate) || delta.includes(gate), `V44 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V43`'), 'Roadmap must state V43 active pointer.');
  assertCheck(failures, /Current working gate: V44 Gate (?:1|2|3|4|5|6|7|8|9|10)\b/u.test(roadmap), 'Roadmap must state active V44 gate progression.');
  assertCheck(failures, roadmap.includes('| V44 | `BITCODE_SPEC_V44.md` | active draft target |'), 'Roadmap must list V44 as active draft target.');
  assertCheck(failures, readme.includes('resolves to `V43`; V44 is the active draft target'), 'README must state V43 active / V44 draft posture.');
  assertCheck(failures, protocolReadme.includes('V44 Gate 1') && protocolReadme.includes('V43` active, `V44` draft'), 'Protocol README must document V44 Gate 1 active/draft posture.');
  assertCheck(failures, demoReadme.includes('`BITCODE_SPEC.txt -> V43`'), 'Demonstration README must keep V43 pointer truth.');
  assertCheck(failures, prTemplate.includes('V44 Gate N:'), 'PR template must use V44 gate title examples.');
  assertCheck(failures, packageJson.includes('"check:v44-gate1"'), 'package.json must expose check:v44-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v44-gate1-scaled-economy-roadmap-opening.mjs'), 'Gate workflow must run V44 Gate 1 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v44-gate1-scaled-economy-roadmap-opening.mjs'), 'Canon workflow must run V44 Gate 1 checker.');

  if (failures.length > 0) {
    process.stderr.write('V44 Gate 1 scaled economy roadmap check failed:\n');
    for (const failure of failures.filter(Boolean)) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V44 Gate 1 scaled economy roadmap check passed.\n');
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
