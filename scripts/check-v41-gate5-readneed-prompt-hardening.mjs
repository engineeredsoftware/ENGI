#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v41/readneed-prompt-hardening.json';

const REQUIRED_HARDENING_IDS = [
  'readneed-promptpart-rewrite-boundary',
  'readneed-ptrr-prompt-composition',
  'readneed-real-inference-return-type-hardening',
  'readneed-source-constraint-preservation',
  'readneed-review-resynthesis-admission',
  'readneed-source-safe-telemetry',
  'readneed-comprehension-tool-prompt-alignment',
];

const REQUIRED_METRIC_IDS = [
  'exact_read_request_boundary',
  'source_constraint_preservation',
  'typed_return_schema_strictness',
  'review_resynthesis_gate_integrity',
  'ptrr_failsafe_thricified_composition',
  'source_safe_telemetry_redaction',
  'read_comprehension_tool_alignment',
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

function parseArgs(argv) {
  const args = {
    skipBranchCheck: false,
    skipPackageTests: false,
    repoRoot: defaultRepoRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--skip-branch-check') args.skipBranchCheck = true;
    else if (arg === '--skip-package-tests') args.skipPackageTests = true;
    else if (arg === '--repo-root') args.repoRoot = path.resolve(argv[++index]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else throw new Error(`Unknown argument ${arg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(
    [
      'Usage: node scripts/check-v41-gate5-readneed-prompt-hardening.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V41 Gate 5 source-safe ReadNeedComprehensionSynthesis prompt rewrite and return-type hardening.',
    ].join('\n'),
  );
  process.stdout.write('\n');
}

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
    pointer === 'V40',
    `BITCODE_SPEC.txt must remain V40 during V41 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v41' || /^v41\/gate-(?:[5-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V41 Gate 5+ work must occur on version/v41 or v41/gate-5..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.proofs/v41/promptpart-prompt-inventory.json',
    '.proofs/v41/registry-interpolation-contracts.json',
    '.proofs/v41/reading-prompt-benchmark-baselines.json',
    'scripts/specifying/src/canonical/v41-readneed-prompt-hardening.js',
    'scripts/specifying/test/v41-readneed-prompt-hardening.test.js',
    'scripts/generate-v41-readneed-prompt-hardening.mjs',
    'scripts/check-v41-gate5-readneed-prompt-hardening.mjs',
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/read-need-review-resynthesis.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/agents/prompts/comprehend-read-prompt.ts',
    'packages/generic-tools/read-comprehension/src/prompts',
    '.specifications/BITCODE_SPEC_V41.md',
    '.specifications/BITCODE_SPEC_V41_DELTA.md',
    '.specifications/BITCODE_SPEC_V41_NOTES.md',
    '.specifications/BITCODE_SPEC_V41_PARITY_MATRIX.md',
    '.specifications/SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'scripts/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V41 Gate 5 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v41-readneed-prompt-hardening.mjs', '--check']);
    } catch (error) {
      failures.push(`V41 ReadNeed prompt hardening artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (!args.skipPackageTests && failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/v41-readneed-prompt-hardening.test.js']);
    } catch (error) {
      failures.push(`V41 ReadNeed prompt hardening protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V41 ReadNeed prompt hardening artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v41-readneed-prompt-hardening', 'ReadNeed hardening artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v41.readneedPromptHardening.v1', 'ReadNeed hardening schemaId must match.');
    assertCheck(
      failures,
      artifact.version === 'V41' && artifact.currentTarget === 'V40',
      'ReadNeed hardening must bind V41 over active V40.',
    );
    assertCheck(failures, artifact.passed === true, 'ReadNeed hardening artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-readneed-prompt-hardening-metadata',
      'ReadNeed hardening artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.metricIds, REQUIRED_METRIC_IDS), 'ReadNeed hardening must expose every required metric id.');
    assertCheck(failures, includesAll(artifact.rows.map((row) => row.hardeningId), REQUIRED_HARDENING_IDS), 'ReadNeed hardening must cover every row.');
    assertCheck(failures, artifact.coverage.rowCount === REQUIRED_HARDENING_IDS.length, 'ReadNeed hardening row count must match required rows.');
    assertCheck(failures, artifact.coverage.promptSurfaceCount >= 10, 'ReadNeed hardening must cover prompt surfaces.');
    assertCheck(failures, artifact.coverage.parserTargetCount >= 10, 'ReadNeed hardening must bind parser targets.');
    assertCheck(failures, artifact.coverage.benchmarkFixtureCount >= 5, 'ReadNeed hardening must bind benchmark fixtures.');
    assertCheck(failures, artifact.coverage.sourceRootPresentCount === artifact.coverage.sourceRootCount, 'All ReadNeed hardening source roots must exist.');
    assertCheck(failures, artifact.coverage.requiredPredicateCount >= 60, 'ReadNeed hardening must require at least 60 predicates.');
    assertCheck(failures, artifact.coverage.passedPredicateCount === artifact.coverage.requiredPredicateCount, 'ReadNeed hardening predicates must all pass.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'ReadNeed hardening must have no failed predicates.');
    assertCheck(failures, artifact.coverage.failingRowIds.length === 0, 'ReadNeed hardening must have no failing rows.');
    assertCheck(failures, artifact.coverage.hardeningScoreMinimum >= 1, 'ReadNeed hardening rows must be fully hardened.');
    assertCheck(failures, artifact.coverage.readNeedInventoryPromptPartRowCount > 0, 'ReadNeed hardening must bind ReadNeed PromptParts.');
    assertCheck(failures, artifact.coverage.readNeedInventoryPromptRowCount > 0, 'ReadNeed hardening must bind ReadNeed Prompts.');
    assertCheck(failures, artifact.coverage.gate4ReadNeedBaselineRowCount >= 3, 'ReadNeed hardening must bind Gate 4 ReadNeed baselines.');
    assertCheck(failures, /^v41-promptpart-prompt-inventory:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate2InventoryRoot), 'Gate 2 dependency root must be present.');
    assertCheck(failures, /^v41-registry-interpolation-contract:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate3RegistryInterpolationRoot), 'Gate 3 dependency root must be present.');
    assertCheck(failures, /^v41-reading-prompt-benchmark-baselines:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate4ReadingPromptBenchmarkBaselineRoot), 'Gate 4 dependency root must be present.');
    assertCheck(failures, artifact.sourceSafety.sourceSafeMetadataOnly === true, 'ReadNeed hardening must be metadata-only.');
    assertCheck(failures, artifact.sourceSafety.rawPromptTextSerialized === false, 'ReadNeed hardening must not serialize raw prompt text.');
    assertCheck(failures, artifact.sourceSafety.rawInterpolatedPromptSerialized === false, 'ReadNeed hardening must not serialize interpolated prompts.');
    assertCheck(failures, artifact.sourceSafety.rawProviderResponseSerialized === false, 'ReadNeed hardening must not serialize provider responses.');
    assertCheck(failures, artifact.sourceSafety.protectedSourceVisible === false, 'ReadNeed hardening must not expose protected source.');
    assertCheck(failures, artifact.sourceSafety.unpaidAssetPackSourceVisible === false, 'ReadNeed hardening must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.sourceSafety.credentialsSerialized === false, 'ReadNeed hardening must not serialize credentials.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^v41-readneed-prompt-hardening-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'ReadNeed hardening rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.sourceSafeMetadataOnly === true && row.rawPromptTextSerialized === false && row.rawProviderResponseSerialized === false),
      'ReadNeed hardening rows must remain source-safe metadata only.',
    );
  }

  const packageJson = fileExists(root, 'package.json') ? read(root, 'package.json') : '';
  assertCheck(failures, packageJson.includes('generate:v41-readneed-prompt-hardening'), 'package.json must expose generate:v41-readneed-prompt-hardening.');
  assertCheck(failures, packageJson.includes('check:v41-gate5'), 'package.json must expose check:v41-gate5.');

  const roadmap = fileExists(root, '.specifications/SPECIFICATIONS_ROADMAP.md') ? read(root, '.specifications/SPECIFICATIONS_ROADMAP.md') : '';
  assertCheck(
    failures,
    roadmap.includes('Current working gate: V41 Gate 5') ||
      roadmap.includes('Current working gate: V41 Gate 6') ||
      roadmap.includes('Current working gate: V41 Gate 7') ||
      roadmap.includes('Current working gate: V41 Gate 8') ||
      roadmap.includes('Current working gate: V41 Gate 9'),
    'Roadmap must name V41 Gate 5 or later as current working gate.',
  );
  assertCheck(
    failures,
    roadmap.includes('Next queued gate after V41 Gate 5: V41 ReadFitsFindingSynthesis Prompt Rewrite Search And AssetPack Context Hardening.') ||
      roadmap.includes('Next queued gate after V41 Gate 6: V41 Conversation Tool And Interface Prompt Rewrite.') ||
      roadmap.includes('Next queued gate after V41 Gate 7: V41 Prompt Benchmark Report And Telemetry Integration.') ||
      roadmap.includes('Next queued gate after V41 Gate 8: V41 Promotion Readiness.') ||
      roadmap.includes('V41 Gate 9 closure anchor'),
    'Roadmap must preserve V41 Gate 6, Gate 7, Gate 8, or Gate 9 progression.',
  );
  assertCheck(failures, roadmap.includes('V43+ agentic depositing'), 'Roadmap must preserve V43+ agentic depositing note.');

  if (failures.length > 0) {
    process.stderr.write(`V41 Gate 5 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V41 Gate 5 check passed: rows=${artifact.coverage.rowCount} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
