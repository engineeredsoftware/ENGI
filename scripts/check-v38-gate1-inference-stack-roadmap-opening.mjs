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
      'Usage: node scripts/check-v38-gate1-inference-stack-roadmap-opening.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V38 Gate 1 spec family, roadmap, branch, workflow, docs, and active/draft inference-stack posture readiness.',
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
    pointer === 'V37',
    `BITCODE_SPEC.txt must remain V37 during V38 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v38' || /^v38\/gate-\d+-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 work must occur on version/v38 or v38/gate-N-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    'BITCODE_SPEC_V38.md',
    'BITCODE_SPEC_V38_DELTA.md',
    'BITCODE_SPEC_V38_NOTES.md',
    'BITCODE_SPEC_V38_PARITY_MATRIX.md',
    'BITCODE_SPECIFYING.md',
    'BITCODE_SPEC_TEMPLATEGUIDE.md',
    'SPECIFICATIONS_ROADMAP.md',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
    '.github/pull_request_template.md',
    'README.md',
    'AGENTS.md',
    'package.json',
    'packages/protocol/README.md',
    'protocol-demonstration/README.md',
    'packages/protocol/src/canon-posture.js',
    'protocol-demonstration/src/canon-posture.js',
    'packages/protocol/data/state.json',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing required V38 Gate 1 file: ${relativePath}`);
  }

  const spec = read(root, 'BITCODE_SPEC_V38.md');
  const delta = read(root, 'BITCODE_SPEC_V38_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V38_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V38_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const prTemplate = read(root, '.github/pull_request_template.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'packages/protocol/README.md');
  const demoReadme = read(root, 'protocol-demonstration/README.md');
  const packagePosture = read(root, 'packages/protocol/src/canon-posture.js');
  const demoPosture = read(root, 'protocol-demonstration/src/canon-posture.js');
  const postureState = read(root, 'packages/protocol/data/state.json');
  const failsafeSource = read(root, 'packages/agent-generics/src/steps/failsafe-sequence.ts');
  const thricifiedSource = read(root, 'packages/agent-generics/src/steps/thricified-generation.ts');
  const agentFactorySource = read(root, 'packages/agent-generics/src/agents/factories.ts');
  const toolPromptSource = read(root, 'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts');
  const usableToolsSource = read(root, 'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts');
  const readingContractSource = read(root, 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts');
  const embeddingConfigSource = read(root, 'packages/asset-packs-pipelines/domain/src/embedding-config.ts');
  const searchSource = read(root, 'packages/asset-packs-pipelines/domain/src/depository-search.ts');

  for (const [label, content] of [
    ['V38 SPEC', spec],
    ['V38 DELTA', delta],
    ['V38 NOTES', notes],
    ['V38 PARITY', parity],
  ]) {
    assertCheck(
      failures,
      content.includes('Current canonical/latest target: `V37`'),
      `${label} must declare V37 as current canonical/latest target.`,
    );
  }

  for (const phrase of [
    'inference stack',
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
    assertCheck(failures, spec.includes(phrase), `V38 SPEC must name ${phrase}.`);
  }

  for (const gate of [
    'Gate 1: V38 Inference Stack Roadmap And Spec Opening',
    'Gate 2: Inference Surface Inventory And Prompt Registry Map',
    'Gate 3: PTRR Failsafe And Thricified Execution Stack',
    'Gate 4: PromptPart And Prompt Benchmarking',
    'Gate 5: Inference Telemetry And Disclosure Tiers',
    'Gate 6: ReadNeedComprehensionSynthesis Inference Hardening',
    'Gate 7: ReadFitsFindingSynthesis Depository Search And Embeddings',
    'Gate 8: AssetPack Synthesis Handoff And Economic Traceability',
    'Gate 9: Conversation And Tool-Prompt Inference Parity',
    'Gate 10: Local Staging Inference And Depository Search Rehearsal',
    'Gate 11: V38 Promotion Readiness',
  ]) {
    assertCheck(failures, delta.includes(gate) || notes.includes(gate) || spec.includes(gate), `V38 gate plan is missing ${gate}.`);
  }

  assertCheck(failures, hasSection(notes, 'Notes companion rule'), 'V38 NOTES must include Notes companion rule.');
  assertCheck(failures, hasSection(notes, 'Simplified-spec reading rule'), 'V38 NOTES must include Simplified-spec reading rule.');
  assertCheck(failures, notes.includes('V38 gate plan'), 'V38 NOTES must carry the V38 gate plan.');
  assertCheck(failures, notes.includes('loose V38 notes committed on `main`'), 'V38 NOTES must preserve the loose main-note origin.');

  assertCheck(failures, parity.includes('## V38 implementation matrix'), 'V38 PARITY must include the V38 implementation matrix.');
  assertCheck(failures, parity.includes('## V38 implementation checklist'), 'V38 PARITY must include the V38 implementation checklist.');
  assertCheck(failures, parity.includes('## Gate 1 Parity'), 'V38 PARITY must include Gate 1 parity.');
  assertCheck(failures, parity.includes('v38/gate-1-inference-stack-roadmap-opening'), 'V38 PARITY must name the Gate 1 branch.');
  assertCheck(failures, parity.includes('Inference stack vocabulary'), 'V38 PARITY must include Inference stack vocabulary row.');

  assertCheck(failures, roadmap.includes('Current active canonical pointer: `BITCODE_SPEC.txt` -> `V37`'), 'Roadmap must state V37 as active pointer.');
  assertCheck(failures, roadmap.includes('Current draft target: `BITCODE_SPEC_V38.md`'), 'Roadmap must state V38 as active draft target.');
  assertCheck(failures, roadmap.includes('| V37 | `BITCODE_SPEC_V37.md` | active canon |'), 'Roadmap must mark V37 active canon.');
  assertCheck(failures, roadmap.includes('| V38 | `BITCODE_SPEC_V38.md` | active draft target |'), 'Roadmap must mark V38 active draft target.');
  assertCheck(failures, roadmap.includes('V38 Gate 1 opening anchor'), 'Roadmap must include V38 Gate 1 opening anchor.');

  assertCheck(failures, packageJson.includes('"check:v38-gate1"'), 'package.json must expose check:v38-gate1.');
  assertCheck(failures, gateWorkflow.includes('check-v38-gate1-inference-stack-roadmap-opening.mjs'), 'Gate workflow must run the V38 Gate 1 checker.');
  assertCheck(failures, gateWorkflow.includes('--version V38 --mode draft --current-target V37'), 'Gate workflow must validate V38 draft spec over V37.');
  assertCheck(failures, gateWorkflow.includes('--active-canon V37 --draft-target V38'), 'Gate workflow must validate V37/V38 canon posture.');
  assertCheck(failures, canonWorkflow.includes('--version V38 --mode draft --current-target V37'), 'Canon workflow must validate V38 draft family.');
  assertCheck(failures, canonWorkflow.includes('--active-canon V37 --draft-target V38'), 'Canon workflow must validate V37/V38 canon posture.');
  assertCheck(failures, canonWorkflow.includes('spec:\\ V38*|spec:\\ v38*'), 'Canon workflow must enforce V38 spec-title conformance.');

  assertCheck(failures, readme.includes('resolves to `V37`; V38 is the active draft target'), 'README must state V37 active / V38 draft posture.');
  assertCheck(failures, readme.includes('version/v38'), 'README must document the version/v38 branch workflow.');
  assertCheck(failures, readme.includes('v38/gate-1-inference-stack-roadmap-opening'), 'README must document a V38 gate branch example.');
  assertCheck(failures, prTemplate.includes('V38 Gate N:'), 'PR template must show V38 gate title format.');
  assertCheck(failures, protocolReadme.includes('V37` active, `V38` draft'), 'Protocol README must state V37/V38 posture.');
  assertCheck(failures, protocolReadme.includes('check:v38-gate1'), 'Protocol README must mention check:v38-gate1.');
  assertCheck(failures, demoReadme.includes('resolves to `V37`; V38 is the active draft target'), 'Demonstration README must state V37/V38 posture.');

  for (const [label, content] of [
    ['commercial protocol package', packagePosture],
    ['standalone demonstration', demoPosture],
    ['protocol state projection', postureState],
  ]) {
    assertCheck(failures, content.includes("ACTIVE_CANON_VERSION = 'V37'") || content.includes('"activeCanonVersion": "V37"'), `${label} must keep V37 active.`);
    assertCheck(failures, content.includes("DRAFT_TARGET_VERSION = 'V38'") || content.includes('"draftTargetVersion": "V38"'), `${label} must declare V38 draft target.`);
  }

  assertCheck(failures, failsafeSource.includes('ThricifiedGeneration'), 'Failsafe source must delegate to ThricifiedGeneration.');
  assertCheck(failures, thricifiedSource.includes('Reason') && thricifiedSource.includes('Judge'), 'Thricified source must preserve Reason and Judge stages.');
  assertCheck(failures, agentFactorySource.includes('factoryAgentWithPTRR'), 'Agent factory source must expose factoryAgentWithPTRR.');
  assertCheck(failures, toolPromptSource.includes('DocCodeToolPrompt'), 'Tool prompt source must expose DocCodeToolPrompt.');
  assertCheck(failures, usableToolsSource.includes('formatToolsWithDocCodeToolsIntoUsableTools'), 'Tool formatting source must expose usable tool formatting.');
  assertCheck(failures, readingContractSource.includes('ReadNeedComprehensionSynthesis'), 'Reading contract must name ReadNeedComprehensionSynthesis.');
  assertCheck(failures, readingContractSource.includes('ReadFitsFindingSynthesis'), 'Reading contract must name ReadFitsFindingSynthesis.');
  assertCheck(failures, embeddingConfigSource.includes('text-embedding-3-small'), 'Embedding config source must preserve OpenAI embedding policy.');
  assertCheck(failures, embeddingConfigSource.includes('match_deliverable_vectors'), 'Embedding config source must preserve vector match function name.');
  assertCheck(failures, searchSource.includes('buildAssetPackEmbeddingPolicy'), 'Depository search source must consume the embedding policy.');

  const routeScan = execFileSync('find', ['uapi/app/api', '-path', '*v[0-9]*', '-print'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  assertCheck(failures, routeScan.length === 0, `UAPI API routes must remain unversioned. Found:\n${routeScan}`);

  if (failures.length > 0) {
    process.stderr.write('V38 Gate 1 inference stack roadmap opening check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`V38 Gate 1 inference stack roadmap opening ok pointer=${pointer}\n`);
}

try {
  main();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${detail}\n`);
  process.exitCode = 1;
}
