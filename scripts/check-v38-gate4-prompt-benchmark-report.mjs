#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v38-prompt-benchmark-report.json';

const REQUIRED_ROW_IDS = [
  'benchmark:runner-and-doc-comment-infrastructure',
  'promptpart:generic-ptrr-failsafe-thricified-foundation',
  'promptpart:read-need-comprehension-specific',
  'promptpart:read-fits-finding-specific',
  'prompt:reading-pipeline-agent-prompts',
  'prompt:conversation-system-prompt',
  'prompt:tool-definition-doc-code-prompts',
];

const REQUIRED_METRIC_IDS = [
  'intent_alignment',
  'semantic_clarity',
  'token_efficiency',
  'model_stability',
  'task_success',
  'response_quality',
  'schema_conformance',
  'source_boundary_preservation',
];

const SECRET_MARKERS = [
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOi', 'JIUzI1Ni'].join(''),
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
      'Usage: node scripts/check-v38-gate4-prompt-benchmark-report.mjs [--skip-branch-check] [--repo-root <path>]',
      '',
      'Checks V38 Gate 4 source-safe PromptPart and Prompt benchmark report artifacts, tests, docs, and workflow wiring.',
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
    pointer === 'V37',
    `BITCODE_SPEC.txt must remain V37 during V38 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v38' || /^v38\/gate-(?:[4-9]|10|11)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V38 Gate 4+ work must occur on version/v38 or v38/gate-4..11-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.bitcode/v38-inference-surface-inventory.json',
    '.bitcode/v38-ptrr-failsafe-thricified-stack.json',
    'scripts/specifying/src/canonical/prompt-benchmark-report.js',
    'scripts/specifying/src/canonical/inference-surface-inventory.js',
    'scripts/specifying/src/canonical/ptrr-failsafe-thricified-stack.js',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'scripts/specifying/test/v38-prompt-benchmark-report.test.js',
    'scripts/generate-v38-prompt-benchmark-report.mjs',
    'scripts/check-v38-gate4-prompt-benchmark-report.mjs',
    'packages/prompts/src/benchmarking/runner.ts',
    'packages/prompts/src/benchmarking/types.ts',
    'packages/prompts/src/benchmarking/README.md',
    'packages/prompts/src/developing/doc-comment-developing.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/conversations/src/prompts/BitcodeConversationSystemPrompt.ts',
    'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
    'packages/tools-generics/src/doc-code-tool/formatUsableTools.ts',
    'specifications/BITCODE_SPEC_V38.md',
    'specifications/BITCODE_SPEC_V38_DELTA.md',
    'specifications/BITCODE_SPEC_V38_NOTES.md',
    'specifications/BITCODE_SPEC_V38_PARITY_MATRIX.md',
    'specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V38 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v38-prompt-benchmark-report.mjs', '--check']);
    } catch (error) {
      failures.push(`V38 prompt benchmark report artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/v38-prompt-benchmark-report.test.js']);
    } catch (error) {
      failures.push(`V38 prompt benchmark report protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V38 prompt benchmark artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v38-prompt-benchmark-report', 'Prompt benchmark artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v38.promptBenchmarkReport.v1', 'Prompt benchmark schemaId must match.');
    assertCheck(failures, artifact.version === 'V38' && artifact.currentTarget === 'V37', 'Prompt benchmark report must bind V38 over active V37.');
    assertCheck(failures, artifact.passed === true, 'Prompt benchmark report artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-prompt-benchmark-metadata',
      'Prompt benchmark report must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.rows.map((row) => row.rowId), REQUIRED_ROW_IDS), 'Prompt benchmark rows must cover every required row id.');
    assertCheck(failures, includesAll(artifact.metricIds, REQUIRED_METRIC_IDS), 'Prompt benchmark metrics must include every required metric id.');
    assertCheck(failures, artifact.coverage.rowCount === 7, 'Prompt benchmark report must have 7 rows.');
    assertCheck(failures, artifact.coverage.promptPartSuiteCount === 3, 'Prompt benchmark report must cover 3 PromptPart suites.');
    assertCheck(failures, artifact.coverage.completePromptSuiteCount === 3, 'Prompt benchmark report must cover 3 complete Prompt suites.');
    assertCheck(failures, artifact.coverage.benchmarkInfrastructureSuiteCount === 1, 'Prompt benchmark report must cover benchmark infrastructure.');
    assertCheck(failures, artifact.coverage.fixtureCount >= 12, 'Prompt benchmark report must include at least 12 fixtures.');
    assertCheck(failures, artifact.coverage.expectedTypedOutputQualityCount >= 24, 'Prompt benchmark report must include typed-output quality expectations.');
    assertCheck(failures, artifact.coverage.requiredPredicateCount === artifact.coverage.passedPredicateCount, 'Prompt benchmark predicates must all pass.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Prompt benchmark report must have no failed predicates.');
    assertCheck(failures, artifact.coverage.promptPartDocCommentCount > 0, 'Prompt benchmark report must see PromptPart doc-comments.');
    assertCheck(failures, artifact.coverage.promptDocCommentCount > 0, 'Prompt benchmark report must see Prompt doc-comments.');
    assertCheck(failures, artifact.coverage.benchmarkDefinitionCount > 0, 'Prompt benchmark report must see benchmark definitions.');
    assertCheck(failures, artifact.coverage.promptPartExportCount > 0, 'Prompt benchmark report must see PromptPart exports.');
    assertCheck(failures, artifact.coverage.promptConstructionCount > 0, 'Prompt benchmark report must see Prompt constructions.');
    assertCheck(failures, artifact.coverage.sourceSafeMetadataOnly === true, 'Prompt benchmark report must be metadata-only.');
    assertCheck(failures, artifact.coverage.legacySourceRoots === false, 'Prompt benchmark report must not point at _legacy source roots.');
    assertCheck(failures, artifact.coverage.gate2InventoryRoot.startsWith('v38-inference-surface-inventory:'), 'Prompt benchmark report must bind Gate 2 inventory root.');
    assertCheck(failures, artifact.coverage.gate3StackRoot.startsWith('v38-ptrr-failsafe-thricified-stack:'), 'Prompt benchmark report must bind Gate 3 stack root.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^v38-prompt-benchmark-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Prompt benchmark rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.fixtureInputs.every((fixture) => /^v38-prompt-benchmark-fixture:[a-f0-9]{24}$/u.test(fixture.fixtureRoot)),
      'Prompt benchmark fixtures must have deterministic fixture roots.',
    );
  }

  const spec = read(root, 'specifications/BITCODE_SPEC_V38.md');
  const delta = read(root, 'specifications/BITCODE_SPEC_V38_DELTA.md');
  const notes = read(root, 'specifications/BITCODE_SPEC_V38_NOTES.md');
  const parity = read(root, 'specifications/BITCODE_SPEC_V38_PARITY_MATRIX.md');
  const roadmap = read(root, 'specifications/SPECIFICATIONS_ROADMAP.md');
  const readme = read(root, 'README.md');
  const protocolReadme = read(root, 'scripts/specifying/README.md');
  const packageJson = read(root, 'package.json');
  const gateWorkflow = read(root, '.github/workflows/bitcode-gate-quality.yml');
  const canonWorkflow = read(root, '.github/workflows/bitcode-canon-quality.yml');
  const source = read(root, 'scripts/specifying/src/canonical/prompt-benchmark-report.js');
  const index = read(root, 'scripts/specifying/src/index.js');
  const typeDefs = read(root, 'scripts/specifying/src/index.d.ts');
  const test = read(root, 'scripts/specifying/test/v38-prompt-benchmark-report.test.js');

  for (const doc of [spec, delta, notes, parity, readme, protocolReadme]) {
    assertCheck(failures, doc.includes(ARTIFACT_PATH), `V38 docs must mention ${ARTIFACT_PATH}.`);
    assertCheck(failures, doc.includes('V38PromptBenchmarkReport'), 'V38 docs must name V38PromptBenchmarkReport.');
    assertCheck(failures, doc.includes('source-safe-prompt-benchmark-metadata'), 'V38 docs must name prompt benchmark source safety verdict.');
    assertCheck(failures, doc.includes('PromptPart'), 'V38 docs must name PromptPart.');
    assertCheck(failures, doc.includes('Prompt benchmarking'), 'V38 docs must name Prompt benchmarking.');
  }

  assertCheck(failures, parity.includes('| PromptPart and Prompt benchmarking | Gate 4 |') && parity.includes('| closed |'), 'V38 parity must close the Gate 4 matrix row.');
  assertCheck(failures, parity.includes('## Gate 4 Parity') && parity.includes('closed'), 'V38 parity must include closed Gate 4 parity.');
  assertCheck(
    failures,
    /Current working gate: V38 Gate (?:5|6|7|8|9|10|11)\b/u.test(roadmap),
    'Roadmap must advance past V38 Gate 4 after this gate closes.',
  );
  assertCheck(failures, roadmap.includes('V38 Gate 4 closure anchor'), 'Roadmap must include a V38 Gate 4 closure anchor.');
  assertCheck(failures, packageJson.includes('"generate:v38-prompt-benchmark-report"'), 'package.json must expose the Gate 4 generator.');
  assertCheck(failures, packageJson.includes('"check:v38-prompt-benchmark-report"'), 'package.json must expose the Gate 4 artifact check.');
  assertCheck(failures, packageJson.includes('"check:v38-gate4"'), 'package.json must expose check:v38-gate4.');
  assertCheck(failures, gateWorkflow.includes('check-v38-gate4-prompt-benchmark-report.mjs'), 'Gate workflow must run the V38 Gate 4 checker.');
  assertCheck(failures, canonWorkflow.includes('check-v38-gate4-prompt-benchmark-report.mjs'), 'Canon workflow must run the V38 Gate 4 checker.');
  assertCheck(failures, gateWorkflow.includes('v38-prompt-benchmark-report.test.js'), 'Gate workflow must run the V38 Gate 4 protocol test.');

  for (const phrase of [
    'buildV38PromptBenchmarkReport',
    'V38_PROMPT_BENCHMARK_ROWS',
    'fixtureInputs',
    'expectedTypedOutputQualityIds',
    'rawPromptTextSerialized',
    'sourceSafeMetadataOnly',
  ]) {
    assertCheck(failures, source.includes(phrase), `Gate 4 source must include ${phrase}.`);
  }

  for (const phrase of ['buildV38PromptBenchmarkReport', 'fixtureCount', 'sourceSafeMetadataOnly']) {
    assertCheck(failures, test.includes(phrase), `Gate 4 test must include ${phrase}.`);
  }

  assertCheck(failures, index.includes('buildV38PromptBenchmarkReport'), 'Protocol index must export buildV38PromptBenchmarkReport.');
  assertCheck(failures, typeDefs.includes('buildV38PromptBenchmarkReport'), 'Protocol type declarations must export buildV38PromptBenchmarkReport.');

  if (failures.length > 0) {
    process.stderr.write('V38 Gate 4 PromptPart and Prompt benchmark check failed:\n');
    for (const failure of failures) process.stderr.write(`- ${failure}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('V38 Gate 4 PromptPart and Prompt benchmarking ok rows=7 fixtures>=12 source-safe=true\n');
}

main();
