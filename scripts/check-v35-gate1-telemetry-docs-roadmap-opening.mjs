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
      'Usage: node scripts/check-v35-gate1-telemetry-docs-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V35 Gate 1 spec family, roadmap, branch, workflow, docs, and active/draft telemetry/documentation posture readiness.',
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

  assertCheck(
    failures,
    pointer === 'V34',
    `BITCODE_SPEC.txt must remain V34 during V35 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v35' || /^v35\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V35 work must occur on version/v35 or v35/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V35.md',
    'BITCODE_SPEC_V35_DELTA.md',
    'BITCODE_SPEC_V35_NOTES.md',
    'BITCODE_SPEC_V35_PARITY_MATRIX.md',
    'BITCODE_SPECIFYING.md',
    'BITCODE_SPEC_TEMPLATEGUIDE.md',
    'SPECIFICATIONS_ROADMAP.md',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing required V35 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V35.md');
  const delta = read(root, 'BITCODE_SPEC_V35_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V35_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V35_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
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
    ['V35 SPEC', spec],
    ['V35 DELTA', delta],
    ['V35 NOTES', notes],
    ['V35 PARITY', parity],
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V34`'),
      `${label} must declare V34 as current canonical/latest target.`,
    );
  }

  for (const phrase of [
    'telemetry and documentation depth',
    'TelemetryTaxonomyCatalog',
    'DocumentationSurfaceCatalog',
    'DocsQaAlignmentReport',
    'OperatorRunbookCatalog',
    'TestnetRolloutReadinessGuide',
    'DocumentationTelemetryPromotionReadinessReport',
    'public `/docs`',
    'internal codebase docs',
    'dashboards',
    'alert runbooks',
    'incident response',
    'operator escalation',
    'documentation QA',
    'testnet-rollout readiness',
    'source-safe telemetry',
    'redaction posture',
    'proof root',
    'staging-testnet',
    'value-bearing mainnet',
  ]) {
    assertCheck(failures, spec.includes(phrase), `V35 SPEC must name ${phrase}.`);
  }

  for (const staleGate of [
    'Gate 1: V35 Deployment Roadmap And Spec Opening',
    'Gate 2: Host Capability And Environment Lane Catalog',
    'Gate 3: Distributed Execution Runtime Contracts',
    'Gate 4: Ledger Database Object Storage Deployment Posture',
    'Gate 5: Secret Rotation And Credential Boundary Operations',
    'Gate 6: Migration CI/CD Deployment Approval Gates',
    'Gate 7: Runtime Observers Broadcasters Repair Jobs',
    'Gate 8: Rollback Upgrade Data Repair Playbooks',
    'Gate 9: Local Staging Testnet Deployment Rehearsal',
  ]) {
    assertCheck(
      failures,
      !spec.includes(staleGate) && !delta.includes(staleGate) && !notes.includes(staleGate) && !parity.includes(staleGate),
      `V35 family must not retain stale deployment-depth gate "${staleGate}".`,
    );
  }

  for (const gate of [
    'Gate 1: V35 Telemetry Documentation Roadmap And Spec Opening',
    'Gate 2: Documentation Surface Catalog',
    'Gate 3: Telemetry Taxonomy Event Schema And Redaction',
    'Gate 4: Public Docs Usage Guides',
    'Gate 5: Dashboards Alerts Runbooks Incident Escalation',
    'Gate 6: Documentation QA Alignment Proofs',
    'Gate 7: Developer Operator Testnet Rollout Guides',
    'Gate 8: Telemetry Documentation Interface Integration',
    'Gate 9: Local Staging Telemetry Documentation Rehearsal',
    'Gate 10: V35 Promotion Readiness',
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate) || spec.includes(gate), `V35 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V35 NOTES must include Notes companion rule.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V35 NOTES must include Simplified-spec reading rule.');
  assertCheck(failures, notes.includes('V35 gate plan'), 'V35 NOTES must carry the V35 gate plan.');
  assertCheck(failures, notes.includes('Telemetry and documentation depth notes'), 'V35 NOTES must name telemetry and documentation depth scope.');

  assertCheck(failures, parity.includes('## Gate 1 Parity'), 'V35 PARITY must include Gate 1 parity.');
  assertCheck(failures, parity.includes('V35 implementation matrix'), 'V35 PARITY must include the implementation matrix.');
  assertCheck(failures, parity.includes('completion condition'), 'V35 PARITY must include a completion condition.');
  assertCheck(failures, parity.includes('v35/gate-1-telemetry-docs-roadmap-opening'), 'V35 PARITY must name the Gate 1 branch.');
  assertCheck(failures, parity.includes('Telemetry/documentation vocabulary'), 'V35 PARITY must include telemetry/documentation vocabulary row.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V34`'), 'Roadmap must state V34 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V35.md`'), 'Roadmap must state V35 as active draft target.');
  assertCheck(failures, roadmap.includes('| V34 | `BITCODE_SPEC_V34.md` | active canon |'), 'Roadmap must mark V34 active canon.');
  assertCheck(failures, roadmap.includes('| V35 | `BITCODE_SPEC_V35.md` | active draft target |'), 'Roadmap must mark V35 active draft target.');
  for (const version of ['V34', 'V35', 'V36', 'V37']) {
    assertCheck(failures, roadmap.includes(`| ${version} |`), `Roadmap must preserve ${version} scope.`);
  }

  assertCheck(failures, packageJson.includes('"check:v35-gate1"'), 'package.json must expose check:v35-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v35-gate1-telemetry-docs-roadmap-opening.mjs'), 'Gate workflow must run the V35 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V35 --mode draft --current-target V34'), 'Gate workflow must validate V35 draft spec over V34.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V34 --draft-target V35'), 'Gate workflow must validate V34/V35 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V35 --mode draft --current-target V34'), 'Canon workflow must validate V35 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V34 --draft-target V35'), 'Canon workflow must validate V34/V35 canon posture.');
  assertCheck(failures, canonWorkflow.includes('spec:\\ V35*|spec:\\ v35*'), 'Canon workflow must enforce V35 spec-title conformance.');

  assertCheck(failures, readme.includes('resolves to `V34`; V35 is the active draft target'), 'README must state V34 active / V35 draft posture.');
  assertCheck(failures, readme.includes('version/v35'), 'README must document the version/v35 branch workflow.');
  assertCheck(failures, readme.includes('v35/gate-1-telemetry-docs-roadmap-opening'), 'README must document a V35 gate branch example.');
  assertCheck(failures, prTemplate.includes('V35 Gate N:'), 'PR template must show V35 gate title format.');
  assertCheck(failures, protocolReadme.includes('V34` active, `V35` draft'), 'Protocol README must state V34/V35 posture.');
  assertCheck(failures, demoReadme.includes('resolves to `V34`; V35 is the active draft target'), 'Demonstration README must state V34/V35 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture],
    ['protocol state projection', postureState],
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V34'") || content.includes('"activeCanonVersion": "V34"'), `${label} must keep V34 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V35'") || content.includes('"draftTargetVersion": "V35"'), `${label} must declare V35 draft target.`);
  }

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V35 Gate 1 telemetry documentation roadmap opening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V35 Gate 1 telemetry documentation roadmap opening ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
