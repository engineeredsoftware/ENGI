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
  return new RegExp(`^#{2,6}\\s+.*${escaped}.*$`, 'imu').test(content);
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
      'Usage: node scripts/check-v37-gate1-conversations-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V37 Gate 1 spec family, roadmap, branch, workflow, docs, and active/draft Website Conversations posture readiness.',
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
    pointer === 'V36',
    `BITCODE_SPEC.txt must remain V36 during V37 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v37' || /^v37\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V37 work must occur on version/v37 or v37/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V37.md',
    'BITCODE_SPEC_V37_DELTA.md',
    'BITCODE_SPEC_V37_NOTES.md',
    'BITCODE_SPEC_V37_PARITY_MATRIX.md',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing required V37 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V37.md');
  const delta = read(root, 'BITCODE_SPEC_V37_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V37_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V37_PARITY_MATRIX.md');
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
    ['V37 SPEC', spec],
    ['V37 DELTA', delta],
    ['V37 NOTES', notes],
    ['V37 PARITY', parity],
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V36`'),
      `${label} must declare V36 as current canonical/latest target.`,
    );
  }

  for (const phrase of [
    'Website Conversations',
    'ConversationSession',
    'ConversationMessage',
    'ConversationStreamEvent',
    'ConversationWritingWorkspace',
    'ConversationSourceSelector',
    'ConversationProductHandoff',
    'route-local history',
    'stream UI',
    'fullscreen writing mode',
    'source selectors',
    'Terminal handoff',
    'persistence/privacy',
    'redaction',
    'telemetry/proof',
    'local/staging rehearsal',
    'source-safe',
    'protected source',
    'unpaid AssetPack',
  ]) {
    assertCheck(failures, spec.includes(phrase), `V37 SPEC must name ${phrase}.`);
  }

  for (const gate of [
    'Gate 1: V37 Conversations Roadmap And Spec Opening',
    'Gate 2: Conversation Session And Route History Contracts',
    'Gate 3: Conversation Stream UI And Event Contracts',
    'Gate 4: Fullscreen Writing Mode And Composer Workspace',
    'Gate 5: Source Selectors And Context Policy',
    'Gate 6: Conversation To Terminal Transaction Handoff',
    'Gate 7: Conversation Persistence Privacy And Redaction',
    'Gate 8: Conversations Telemetry Proof Hooks And Docs',
    'Gate 9: Local Staging Conversations Rehearsal',
    'Gate 10: V37 Promotion Readiness',
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate) || spec.includes(gate), `V37 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V37 NOTES must include Notes companion rule.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V37 NOTES must include Simplified-spec reading rule.');
  assertCheck(failures, notes.includes('V37 gate plan'), 'V37 NOTES must carry the V37 gate plan.');
  assertCheck(failures, notes.includes('Website Conversations'), 'V37 NOTES must name Website Conversations scope.');

  assertCheck(failures, parity.includes('## V37 implementation matrix'), 'V37 PARITY must include the V37 implementation matrix.');
  assertCheck(failures, parity.includes('## V37 implementation checklist'), 'V37 PARITY must include the V37 implementation checklist.');
  assertCheck(failures, parity.includes('v37/gate-1-conversations-roadmap-opening'), 'V37 PARITY must name the Gate 1 branch.');
  assertCheck(failures, parity.includes('Conversations vocabulary'), 'V37 PARITY must include Conversations vocabulary row.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V36`'), 'Roadmap must state V36 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V37.md`'), 'Roadmap must state V37 as active draft target.');
  assertCheck(failures, roadmap.includes('| V36 | `BITCODE_SPEC_V36.md` | active canon |'), 'Roadmap must mark V36 active canon.');
  assertCheck(failures, roadmap.includes('| V37 | `BITCODE_SPEC_V37.md` | active draft target |'), 'Roadmap must mark V37 active draft target.');
  assertCheck(failures, roadmap.includes('V37 Gate 1 opening anchor'), 'Roadmap must include V37 Gate 1 opening anchor.');

  assertCheck(failures, packageJson.includes('"check:v37-gate1"'), 'package.json must expose check:v37-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v37-gate1-conversations-roadmap-opening.mjs'), 'Gate workflow must run the V37 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V37 --mode draft --current-target V36'), 'Gate workflow must validate V37 draft spec over V36.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V36 --draft-target V37'), 'Gate workflow must validate V36/V37 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V37 --mode draft --current-target V36'), 'Canon workflow must validate V37 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V36 --draft-target V37'), 'Canon workflow must validate V36/V37 canon posture.');
  assertCheck(failures, canonWorkflow.includes('spec:\\ V37*|spec:\\ v37*'), 'Canon workflow must enforce V37 spec-title conformance.');

  assertCheck(failures, readme.includes('resolves to `V36`; V37 is the active draft target'), 'README must state V36 active / V37 draft posture.');
  assertCheck(failures, readme.includes('version/v37'), 'README must document the version/v37 branch workflow.');
  assertCheck(failures, readme.includes('v37/gate-1-conversations-roadmap-opening'), 'README must document a V37 gate branch example.');
  assertCheck(failures, prTemplate.includes('V37 Gate N:'), 'PR template must show V37 gate title format.');
  assertCheck(failures, protocolReadme.includes('V36` active, `V37` draft'), 'Protocol README must state V36/V37 posture.');
  assertCheck(failures, demoReadme.includes('resolves to `V36`; V37 is the active draft target'), 'Demonstration README must state V36/V37 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture],
    ['protocol state projection', postureState],
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V36'") || content.includes('"activeCanonVersion": "V36"'), `${label} must keep V36 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V37'") || content.includes('"draftTargetVersion": "V37"'), `${label} must declare V37 draft target.`);
  }

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V37 Gate 1 conversations roadmap opening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V37 Gate 1 conversations roadmap opening ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
