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
      'Usage: node scripts/check-v33-gate1-interface-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V33 Gate 1 spec family, roadmap, branch, workflow, docs, and active/draft posture readiness.'
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
    pointer === 'V32',
    `BITCODE_SPEC.txt must remain V32 during V33 gate work. Observed ${pointer || 'empty'}.`
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v33' || /^v33\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V33 work must occur on version/v33 or v33/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`
    );
  }

  const requiredFiles = [
    '.specifications/BITCODE_SPEC_V33.md',
    '.specifications/BITCODE_SPEC_V33_DELTA.md',
    '.specifications/BITCODE_SPEC_V33_NOTES.md',
    '.specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md',
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
    'scripts/specifying/data/state.json'
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing required V33 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, '.specifications/BITCODE_SPEC_V33.md');
  const delta = read(root, '.specifications/BITCODE_SPEC_V33_DELTA.md');
  const notes = read(root, '.specifications/BITCODE_SPEC_V33_NOTES.md');
  const parity = read(root, '.specifications/BITCODE_SPEC_V33_PARITY_MATRIX.md');
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
    ['V33 SPEC', spec],
    ['V33 DELTA', delta],
    ['V33 NOTES', notes],
    ['V33 PARITY', parity]
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V32`'),
      `${label} must declare V32 as current canonical/latest target.`
    );
  }

  for (const phrase of [
    'interface-depth',
    'MCP API',
    'ChatGPT App',
    'non-Auxillaries non-website',
    'InterfaceContractCatalog',
    'InterfaceAuthorizationPolicy',
    'ReadLicenseInterfaceContract',
    'AssetPackRightsInterfaceContract',
    'APISchemaCompatibilityMatrix',
    'InterfaceTelemetryProofHook',
    'source-safe preview',
    'protected AssetPack source'
  ]) {
    assertCheck(failures, spec.includes(phrase), `V33 SPEC must name ${phrase}.`);
  }

  for (const gate of [
    'Gate 1: V33 Interface Roadmap And Spec Opening',
    'Gate 2: Interface Inventory And Contract Catalog',
    'Gate 3: MCP API Tool And Registry Contracts',
    'Gate 4: ChatGPT App Action And Tool Contracts',
    'Gate 5: Interface Authorization Policy Fail-Closed',
    'Gate 6: Read License And AssetPack Rights Interface Contracts',
    'Gate 7: API Schemas Examples And Compatibility Matrix',
    'Gate 8: Interface Telemetry And Proof Replay Hooks',
    'Gate 9: Interface Consumer UX Regression Proof',
    'Gate 10: V33 Promotion Readiness'
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate) || spec.includes(gate), `V33 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V33 NOTES must include Notes companion rule.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V33 NOTES must include Simplified-spec reading rule.');
  assertCheck(failures, notes.includes('V33 gate plan'), 'V33 NOTES must carry the V33 gate plan.');
  assertCheck(failures, notes.includes('interface-depth'), 'V33 NOTES must name interface-depth scope.');

  assertCheck(failures, parity.includes('## Gate 1 Parity'), 'V33 PARITY must include Gate 1 parity.');
  assertCheck(failures, parity.includes('V33 implementation matrix'), 'V33 PARITY must include the implementation matrix.');
  assertCheck(failures, parity.includes('completion condition'), 'V33 PARITY must include a completion condition.');
  assertCheck(failures, parity.includes('v33/gate-1-interface-roadmap-opening'), 'V33 PARITY must name the Gate 1 branch.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V32`'), 'Roadmap must state V32 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V33.md`'), 'Roadmap must state V33 as active draft target.');
  assertCheck(failures, roadmap.includes('| V32 | `BITCODE_SPEC_V32.md` | active canon |'), 'Roadmap must mark V32 active canon.');
  assertCheck(failures, roadmap.includes('| V33 | `BITCODE_SPEC_V33.md` | active draft target |'), 'Roadmap must mark V33 active draft target.');
  for (const version of ['V33', 'V34', 'V35', 'V36', 'V37']) {
    assertCheck(failures, roadmap.includes(`| ${version} |`), `Roadmap must preserve ${version} scope.`);
  }

  assertCheck(failures, packageJson.includes('"check:v33-gate1"'), 'package.json must expose check:v33-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v33-gate1-interface-roadmap-opening.mjs'), 'Gate workflow must run the V33 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V33 --mode draft --current-target V32'), 'Gate workflow must validate V33 draft spec over V32.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V32 --draft-target V33'), 'Gate workflow must validate V32/V33 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V33 --mode draft --current-target V32'), 'Canon workflow must validate V33 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V32 --draft-target V33'), 'Canon workflow must validate V32/V33 canon posture.');
  assertCheck(failures, canonWorkflow.includes('spec:\\ V33*|spec:\\ v33*'), 'Canon workflow must enforce V33 spec-title conformance.');

  assertCheck(failures, readme.includes('resolves to `V32`; V33 is the active draft target'), 'README must state V32 active / V33 draft posture.');
  assertCheck(failures, readme.includes('version/v33'), 'README must document the version/v33 branch workflow.');
  assertCheck(failures, readme.includes('v33/gate-1-interface-roadmap-opening'), 'README must document a V33 gate branch example.');
  assertCheck(failures, prTemplate.includes('V33 Gate N:'), 'PR template must show V33 gate title format.');
  assertCheck(failures, protocolReadme.includes('V32` active, `V33` draft'), 'Protocol README must state V32/V33 posture.');
  assertCheck(failures, demoReadme.includes('resolves to `V32`; V33 is the next draft target'), 'Demonstration README must state V32/V33 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture],
    ['protocol state projection', postureState]
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V32'") || content.includes('"activeCanonVersion": "V32"'), `${label} must keep V32 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V33'") || content.includes('"draftTargetVersion": "V33"'), `${label} must declare V33 draft target.`);
  }

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8'
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V33 Gate 1 interface roadmap opening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V33 Gate 1 interface roadmap opening ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
