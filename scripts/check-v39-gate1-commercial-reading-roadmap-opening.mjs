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
      'Usage: node scripts/check-v39-gate1-commercial-reading-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V39 Gate 1 spec family, roadmap, branch, workflow, docs, and active/draft commercial-reading posture readiness.',
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
    pointer === 'V38',
    `BITCODE_SPEC.txt must remain V38 during V39 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v39' || /^v39\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V39 work must occur on version/v39 or v39/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V39.md',
    'BITCODE_SPEC_V39_DELTA.md',
    'BITCODE_SPEC_V39_NOTES.md',
    'BITCODE_SPEC_V39_PARITY_MATRIX.md',
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
    'packages/agent-generics/src/steps/failsafe-sequence.ts',
    'packages/agent-generics/src/steps/thricified-generation.ts',
    'packages/agent-generics/src/agents/factories.ts',
    'packages/tools-generics/src/Tool.ts',
    'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
    'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/domain/src/tools/AssetPackLexicalDepositorySearchTool.ts',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing required V39 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V39.md');
  const delta = read(root, 'BITCODE_SPEC_V39_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V39_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V39_PARITY_MATRIX.md');
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
  const failsafeSource = read(root, 'packages/agent-generics/src/steps/failsafe-sequence.ts');
  const thricifiedSource = read(root, 'packages/agent-generics/src/steps/thricified-generation.ts');
  const agentFactorySource = read(root, 'packages/agent-generics/src/agents/factories.ts');
  const toolPromptSource = read(root, 'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts');
  const usableToolsSource = read(root, 'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts');
  const readingContractSource = read(root, 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts');
  const embeddingConfigSource = read(root, 'packages/asset-packs-pipelines/domain/src/embedding-config.ts');
  const searchSource = read(root, 'packages/asset-packs-pipelines/domain/src/depository-search.ts');

  for (const [label, content] of [
    ['V39 SPEC', spec],
    ['V39 DELTA', delta],
    ['V39 NOTES', notes],
    ['V39 PARITY', parity],
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V38`'),
      `${label} must declare V38 as current canonical/latest target.`,
    );
  }

  for (const phrase of [
    'five-step enterprise Reading',
    'Depository supply',
    'ReadNeed review',
    'Finding Fits',
    'AssetPack preview',
    'deterministic BTC quote',
    'BTD rights transfer',
    'post-settlement delivery',
    'commercial Reading',
    'PipelineExecution',
    'PTRR',
    'Plan',
    'Try',
    'Refine',
    'Retry',
    'FailsafeGenerationSequence',
    'ThricifiedGeneration',
    'ToolExecution',
    'DocCodeToolPrompt',
    'ReadNeedComprehensionSynthesis',
    'ReadFitsFindingSynthesis',
    'PromptPart',
    'prompt benchmarking',
    'source-safe telemetry',
    'text-embedding-3-small',
    '1536 dimensions',
    'match_deliverable_vectors',
    'lexical',
    'symbolic',
    'metadata',
    'measurement',
    'embedding/vector',
    'candidate deposits',
    'selected-fit provenance',
    'protected source',
    'unpaid AssetPack',
  ]) {
    assertCheck(failures, spec.includes(phrase), `V39 SPEC must name ${phrase}.`);
  }

  for (const gate of [
    'Gate 1: V39 Commercial Reading Roadmap And Spec Opening',
    'Gate 2: Depository Supply Indexing And Searchable Deposit Lifecycle',
    'Gate 3: Enterprise Reading UX State Machine',
    'Gate 4: ReadNeed Review, Resynthesis, And Admission Runtime',
    'Gate 5: ReadFitsFinding Runtime, Ranking, And Replay',
    'Gate 6: AssetPack Preview, Quote, And Disclosure Boundary',
    'Gate 7: Settlement, BTD Rights Transfer, And Delivery',
    'Gate 8: Operational Telemetry, Repair, And Operator Readback',
    'Gate 9: Interface And Conversation Product Parity',
    'Gate 10: Local And Staging Commercial Reading Rehearsal',
    'Gate 11: V39 Promotion Readiness',
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate) || spec.includes(gate), `V39 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V39 NOTES must include Notes companion rule.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V39 NOTES must include Simplified-spec reading rule.');
  assertCheck(failures, notes.includes('Candidate V39 workstreams'), 'V39 NOTES must carry the V39 workstreams.');
  assertCheck(failures, notes.includes('loose post-V38 notes committed on `main`'), 'V39 NOTES must preserve the loose main-note origin.');

  assertCheck(failures, parity.includes('## V39 implementation matrix'), 'V39 PARITY must include the V39 implementation matrix.');
  assertCheck(failures, parity.includes('## V39 implementation checklist'), 'V39 PARITY must include the V39 implementation checklist.');
  assertCheck(failures, parity.includes('## Gate 1 Parity'), 'V39 PARITY must include Gate 1 parity.');
  assertCheck(failures, parity.includes('v39/gate-1-commercial-reading-roadmap-opening'), 'V39 PARITY must name the Gate 1 branch.');
  assertCheck(failures, parity.includes('Commercial Reading vocabulary'), 'V39 PARITY must include Commercial Reading vocabulary row.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V38`'), 'Roadmap must state V38 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V39.md`'), 'Roadmap must state V39 as active draft target.');
  assertCheck(failures, roadmap.includes('| V38 | `BITCODE_SPEC_V38.md` | active canon |'), 'Roadmap must mark V38 active canon.');
  assertCheck(failures, roadmap.includes('| V39 | `BITCODE_SPEC_V39.md` | active draft target |'), 'Roadmap must mark V39 active draft target.');
  assertCheck(failures, roadmap.includes('V39 Gate 1 opening anchor'), 'Roadmap must include V39 Gate 1 opening anchor.');

  assertCheck(failures, packageJson.includes('"check:v39-gate1"'), 'package.json must expose check:v39-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v39-gate1-commercial-reading-roadmap-opening.mjs'), 'Gate workflow must run the V39 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V39 --mode draft --current-target V38'), 'Gate workflow must validate V39 draft spec over V38.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V38 --draft-target V39'), 'Gate workflow must validate V38/V39 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V39 --mode draft --current-target V38'), 'Canon workflow must validate V39 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V38 --draft-target V39'), 'Canon workflow must validate V38/V39 canon posture.');
  assertCheck(failures, canonWorkflow.includes('spec:\\ V39*|spec:\\ v39*'), 'Canon workflow must enforce V39 spec-title conformance.');

  assertCheck(failures, readme.includes('resolves to `V38`; V39 is the active draft target'), 'README must state V38 active / V39 draft posture.');
  assertCheck(failures, readme.includes('version/v39'), 'README must document the version/v39 branch workflow.');
  assertCheck(failures, readme.includes('v39/gate-1-commercial-reading-roadmap-opening'), 'README must document a V39 gate branch example.');
  assertCheck(failures, prTemplate.includes('V39 Gate N:'), 'PR template must show V39 gate title format.');
  assertCheck(failures, protocolReadme.includes('V38` active, `V39` draft'), 'Protocol README must state V38/V39 posture.');
  assertCheck(failures, protocolReadme.includes('check:v39-gate1'), 'Protocol README must mention check:v39-gate1.');
  assertCheck(failures, demoReadme.includes('resolves to `V38`; V39 is the active draft target'), 'Demonstration README must state V38/V39 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture],
    ['protocol state projection', postureState],
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V38'") || content.includes('"activeCanonVersion": "V38"'), `${label} must keep V38 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V39'") || content.includes('"draftTargetVersion": "V39"'), `${label} must declare V39 draft target.`);
  }

  assertCheck(failures, failsafeSource.includes('ThricifiedGeneration'), 'Failsafe source must delegate to ThricifiedGeneration.');
  assertCheck(failures, thricifiedSource.includes('Reason') && thricifiedSource.includes('Judge'), 'Thricified source must preserve Reason and Judge stages.');
  assertCheck(failures, agentFactorySource.includes('factoryPTRRAgent'), 'Agent factory source must expose factoryPTRRAgent.');
  assertCheck(failures, toolPromptSource.includes('DocCodeToolPrompt'), 'Tool prompt source must expose DocCodeToolPrompt.');
  assertCheck(failures, usableToolsSource.includes('formatToolsWithDocCodeToolsIntoUsableTools'), 'Tool formatting source must expose usable tool formatting.');
  assertCheck(failures, readingContractSource.includes('ReadNeedComprehensionSynthesis'), 'Reading contract must name ReadNeedComprehensionSynthesis.');
  assertCheck(failures, readingContractSource.includes('ReadFitsFindingSynthesis'), 'Reading contract must name ReadFitsFindingSynthesis.');
  assertCheck(failures, embeddingConfigSource.includes('text-embedding-3-small'), 'Embedding config source must preserve OpenAI embedding policy.');
  assertCheck(failures, embeddingConfigSource.includes('match_deliverable_vectors'), 'Embedding config source must preserve vector match function name.');
  assertCheck(failures, searchSource.includes('buildAssetPackEmbeddingPolicy'), 'Depository search source must consume the embedding policy.');

  const routeScan = execFileSync('find', ['apps/uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V39 Gate 1 commercial Reading roadmap opening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V39 Gate 1 commercial Reading roadmap opening ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
