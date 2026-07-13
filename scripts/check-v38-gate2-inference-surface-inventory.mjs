#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v38-inference-surface-inventory.json';

const REQUIRED_FAMILY_IDS = [
  'reading_pipeline',
  'conversation_agent',
  'tool_definition_prompt',
  'interface_entrypoint',
  'prompt_registry',
  'execution_primitive',
];

const REQUIRED_PRIMITIVE_IDS = [
  'PipelineExecution',
  'PipelinePromptRegistry',
  'PipelineAgentRegistry',
  'factoryAgentWithPTRR',
  'AgentPrompt',
  'AgentStepPrompt',
  'FailsafeGenerationSequence',
  'ThricifiedGeneration',
  'ToolExecution',
  'DocCodeToolPrompt',
  'PromptPart',
  'PromptExecution',
];

const REQUIRED_READING_PIPELINES = [
  'ReadNeedComprehensionSynthesis',
  'ReadFitsFindingSynthesis',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  Buffer.from('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5', 'base64url').toString('utf8'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
];

function read(root, relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fileExists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function run(root, command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function assertCheck(failures, condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
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
      'Usage: node scripts/check-v38-gate2-inference-surface-inventory.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V38 Gate 2 source-backed inference surface inventory, generated artifact, protocol tests, docs, and workflow wiring.',
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
      branch === 'version/v38' || /^v38\/gate-(?:[2-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 2+ work must occur on version/v38 or v38/gate-2..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    'packages/protocol/src/canonical/inference-surface-inventory.js',
    'packages/protocol/src/index.js',
    'packages/protocol/src/index.d.ts',
    'packages/protocol/test/v38-inference-surface-inventory.test.js',
    'scripts/generate-v38-inference-surface-inventory.mjs',
    'scripts/check-v38-gate2-inference-surface-inventory.mjs',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/domain/src/embedding-config.ts',
    'packages/conversations-generics/src/agent/ConversationAgent.ts',
    'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
    'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
    'packages/prompts/src/parts/PromptPart.ts',
    'packages/prompts/src/benchmarking/runner.ts',
    'BITCODE_SPEC_V38.md',
    'BITCODE_SPEC_V38_DELTA.md',
    'BITCODE_SPEC_V38_NOTES.md',
    'BITCODE_SPEC_V38_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 2 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v38-inference-surface-inventory.mjs', '--check']);
    } catch (error) {
      failures.push(`V38 inference surface artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/protocol/test/v38-inference-surface-inventory.test.js']);
    } catch (error) {
      failures.push(`V38 inference surface protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V38 inference surface inventory must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-inference-surface-inventory', 'Inference inventory artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.inferenceSurfaceInventory.v1', 'Inference inventory schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'Inference inventory must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'Inference inventory artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-inference-surface-metadata',
      'Inference inventory must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.requiredFamilyIds, REQUIRED_FAMILY_IDS), 'Inference inventory must enumerate required family ids.');
    assertCheck(failures, includesAll(artifact.requiredPrimitiveIds, REQUIRED_PRIMITIVE_IDS), 'Inference inventory must enumerate required primitive ids.');
    assertCheck(
      failures,
      includesAll(artifact.requiredReadingPipelineNames, REQUIRED_READING_PIPELINES),
      'Inference inventory must enumerate both Reading pipelines.',
    );
    assertCheck(failures, includesAll(artifact.coverage.observedFamilyIds, REQUIRED_FAMILY_IDS), 'Inference inventory coverage must observe all families.');
    assertCheck(failures, includesAll(artifact.coverage.observedPrimitiveIds, REQUIRED_PRIMITIVE_IDS), 'Inference inventory coverage must observe all primitives.');
    assertCheck(failures, includesAll(artifact.coverage.readingPipelineNames, REQUIRED_READING_PIPELINES), 'Inference inventory coverage must observe both Reading pipelines.');
    assertCheck(failures, artifact.coverage.readingPipelinesCovered === true, 'Reading pipeline coverage must pass.');
    assertCheck(failures, artifact.coverage.conversationSurfacesCovered === true, 'Conversation surface coverage must pass.');
    assertCheck(failures, artifact.coverage.toolDefinitionPromptsCovered === true, 'Tool prompt surface coverage must pass.');
    assertCheck(failures, artifact.coverage.interfaceEntrypointsCovered === true, 'Interface entrypoint coverage must pass.');
    assertCheck(failures, artifact.coverage.promptRegistriesCovered === true, 'Prompt registry coverage must pass.');
    assertCheck(failures, artifact.coverage.executionPrimitivesCovered === true, 'Execution primitive coverage must pass.');
    assertCheck(failures, artifact.coverage.totalPhaseCount === 13, 'Inference inventory must count 13 active phase/surface groups.');
    assertCheck(failures, artifact.coverage.totalPtrrAgentCount === 13, 'Inference inventory must count 13 PTRR agents.');
    assertCheck(failures, artifact.coverage.totalPtrrStepCount === 52, 'Inference inventory must count 52 PTRR steps.');
    assertCheck(failures, artifact.coverage.totalFailsafeSequenceCount === 156, 'Inference inventory must count 156 failsafe sequences.');
    assertCheck(failures, artifact.coverage.totalThricifiedGenerationCount === 156, 'Inference inventory must count 156 ThricifiedGeneration chains.');
    assertCheck(failures, artifact.coverage.totalProviderCallCount === 468, 'Inference inventory must count 468 provider-call slots.');
    assertCheck(failures, artifact.coverage.totalToolCount === 9, 'Inference inventory must count 9 tool/tool-definition prompt surfaces.');
    assertCheck(failures, artifact.coverage.protectedSourceVisible === false, 'Inference inventory must not expose protected source.');
    assertCheck(failures, artifact.coverage.credentialsSerialized === false, 'Inference inventory must not serialize credentials.');
    assertCheck(failures, artifact.coverage.unpaidAssetPackSourceVisible === false, 'Inference inventory must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Inference inventory must not point at _legacy source roots.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^v38-inference-surface-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Inference inventory rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.sourceRootsPresent === true),
      'Inference inventory rows must have present source roots.',
    );
    for (const requiredKey of [
      'promptRegistryIds',
      'promptPartNamespaces',
      'interpolationBindingIds',
      'contextFieldIds',
      'outputSchemaIds',
      'failureSurfaceIds',
      'storageTargetIds',
      'streamTargetIds',
    ]) {
      assertCheck(
        failures,
        artifact.rows.every((row) => Array.isArray(row[requiredKey])),
        `Inference inventory rows must carry ${requiredKey}.`,
      );
    }
  }

  const spec = read(root, 'BITCODE_SPEC_V38.md');
  const delta = read(root, 'BITCODE_SPEC_V38_DELTA.md');
  const notes = read(root, 'BITCODE_SPEC_V38_NOTES.md');
  const parity = read(root, 'BITCODE_SPEC_V38_PARITY_MATRIX.md');
  const roadmap = read(root, 'SPECIFICATIONS_ROADMAP.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const source = read(root, 'packages/protocol/src/canonical/inference-surface-inventory.js');
  const index = read(root, 'packages/protocol/src/index.js');
  const typeDefs = read(root, 'packages/protocol/src/index.d.ts');
  const test = read(root, 'packages/protocol/test/v38-inference-surface-inventory.test.js');

  for (const doc of [spec, delta, notes, parity]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V38 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('V38InferenceSurfaceInventory') || doc.includes('inference surface inventory'), 'V38 docs must name the inference surface inventory.');
    assertCheck(failures, doc.includes('ReadNeedComprehensionSynthesis'), 'V38 docs must name ReadNeedComprehensionSynthesis.');
    assertCheck(failures, doc.includes('ReadFitsFindingSynthesis'), 'V38 docs must name ReadFitsFindingSynthesis.');
    assertCheck(failures, doc.includes('source-safe-inference-surface-metadata'), 'V38 docs must name inference inventory source safety verdict.');
    assertCheck(failures, doc.includes('52 PTRR steps') || doc.includes('totalPtrrStepCount'), 'V38 docs must name the counted PTRR step total.');
  }

  assertCheck(failures, parity.includes('| Inference surface inventory | Gate 2 |') && parity.includes('| closed |'), 'V38 parity must close the Gate 2 matrix row.');
  assertCheck(failures, parity.includes('## Gate 2 Parity') && parity.includes('closed'), 'V38 parity must include closed Gate 2 parity.');
  assertCheck(
    failures,
    /Current working gate: V38 Gate (?:3|4|5|6|7|8|9|10|11)\b/u.test(roadmap),
    'Roadmap must advance past V38 Gate 2 after this gate closes.',
  );
  assertCheck(failures, roadmap.includes('V38 Gate 2 closure anchor'), 'Roadmap must include a V38 Gate 2 closure anchor.');
  assertCheck(failures, packageJson.includes('"generate:v38-inference-surface-inventory"'), 'package.json must expose the Gate 2 generator.');
  assertCheck(failures, packageJson.includes('"check:v38-inference-surface-inventory"'), 'package.json must expose the Gate 2 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v38-gate2"'), 'package.json must expose check:v38-gate2.');
  assertCheck(failures, gateWorkflow.includes('check-v38-gate2-inference-surface-inventory.mjs'), 'Gate workflow must run the V38 Gate 2 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v38-gate2-inference-surface-inventory.mjs'), 'Canon workflow must run the V38 Gate 2 checker.');

  for (const phrase of [
    'buildV38InferenceSurfaceInventory',
    'V38_INFERENCE_SURFACE_REQUIRED_FAMILY_IDS',
    'V38_INFERENCE_SURFACE_REQUIRED_PRIMITIVE_IDS',
    'ReadNeedComprehensionSynthesis',
    'ReadFitsFindingSynthesis',
    'DocCodeToolPrompt',
    'ThricifiedGeneration',
    'FailsafeGenerationSequence',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 2 source must include ${phrase}.`);
  }

  for (const phrase of ['buildV38InferenceSurfaceInventory', 'totalPtrrStepCount', 'totalProviderCallCount']) {
    assertCheck(failures, test.includes(phrase), `Gate 2 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildV38InferenceSurfaceInventory'), 'Protocol index must export buildV38InferenceSurfaceInventory.');
  assertCheck(failures, typeDefs.includes('buildV38InferenceSurfaceInventory'), 'Protocol type declarations must export buildV38InferenceSurfaceInventory.');

  if (failures.length > 0) {
    process.stderr.write('V38 Gate 2 inference surface inventory check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V38 Gate 2 inference surface inventory ok rows=7 ptrrSteps=52 providerCalls=468\n');
}

main();
