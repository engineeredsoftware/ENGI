#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v41/reading-prompt-benchmark-baselines.json';

const REQUIRED_BASELINE_IDS = [
  'readneed-request-to-need-baseline',
  'readneed-review-resynthesis-baseline',
  'readneed-measurement-pricing-baseline',
  'readfits-query-synthesis-baseline',
  'readfits-many-candidate-ranking-baseline',
  'readfits-assetpack-context-synthesis-baseline',
  'assetpack-preview-disclosure-quote-baseline',
  'settlement-rights-delivery-baseline',
  'reading-telemetry-summary-baseline',
  'failure-repair-prompt-baseline',
];

const REQUIRED_PIPELINE_IDS = [
  'ReadNeedComprehensionSynthesis',
  'ReadFitsFindingSynthesis',
];

const REQUIRED_UX_STEP_IDS = [
  'request-read',
  'review-synthesized-need',
  'request-fit',
  'review-synthesized-asset-pack',
  'buy-asset-pack-settle',
];

const REQUIRED_METRIC_IDS = [
  'need_boundary_precision',
  'source_constraint_preservation',
  'registry_composition_integrity',
  'typed_parser_conformance',
  'benchmark_fixture_coverage',
  'many_candidate_fit_recall',
  'source_safe_preview_boundary',
  'settlement_quote_explainability',
  'telemetry_repair_readback',
  'source_safety_non_disclosure',
];

const REQUIRED_FIXTURE_IDS = [
  'fixture.read-need.enterprise-request-to-need',
  'fixture.read-need.resynthesis-feedback',
  'fixture.read-fits.find-many-candidates',
  'fixture.read-fits.assetpack-synthesis-preview',
  'fixture.reading.prompt-registry-composition',
  'fixture.reading.schema-bound-return-types',
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
      'Usage: node scripts/check-v41-gate4-reading-prompt-benchmark-baselines.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V41 Gate 4 source-safe Reading prompt benchmark baselines for ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis.',
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
      branch === 'version/v41' || /^v41\/gate-(?:[4-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V41 Gate 4+ work must occur on version/v41 or v41/gate-4..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.proofs/v41/promptpart-prompt-inventory.json',
    '.proofs/v41/registry-interpolation-contracts.json',
    'scripts/specifying/src/canonical/v41-reading-prompt-benchmark-baselines.js',
    'scripts/specifying/src/canonical/v41-promptpart-prompt-inventory.js',
    'scripts/specifying/src/canonical/v41-registry-interpolation-contracts.js',
    'scripts/specifying/test/v41-reading-prompt-benchmark-baselines.test.js',
    'scripts/generate-v41-reading-prompt-benchmark-baselines.mjs',
    'scripts/check-v41-gate4-reading-prompt-benchmark-baselines.mjs',
    'scripts/specifying/src/index.js',
    'scripts/specifying/src/index.d.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/read-need.ts',
    'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
    'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
    'packages/asset-packs-pipelines/domain/src/reading-operational-telemetry-repair-readback.ts',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V41 Gate 4 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v41-reading-prompt-benchmark-baselines.mjs', '--check']);
    } catch (error) {
      failures.push(`V41 Reading prompt benchmark baseline artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (!args.skipPackageTests && failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'scripts/specifying/test/v41-reading-prompt-benchmark-baselines.test.js']);
    } catch (error) {
      failures.push(`V41 Reading prompt benchmark baseline protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V41 Reading prompt benchmark baseline artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v41-reading-prompt-benchmark-baselines', 'Reading prompt benchmark artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v41.readingPromptBenchmarkBaselines.v1', 'Reading prompt benchmark schemaId must match.');
    assertCheck(
      failures,
      artifact.version === 'V41' && artifact.currentTarget === 'V40',
      'Reading prompt benchmark baselines must bind V41 over active V40.',
    );
    assertCheck(failures, artifact.passed === true, 'Reading prompt benchmark baseline artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-reading-prompt-benchmark-baseline-metadata',
      'Reading prompt benchmark artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.pipelineIds, REQUIRED_PIPELINE_IDS), 'Reading prompt benchmarks must cover both Reading pipelines.');
    assertCheck(failures, includesAll(artifact.coverage.uxStepIds, REQUIRED_UX_STEP_IDS), 'Reading prompt benchmarks must cover all five Reading UX steps.');
    assertCheck(failures, includesAll(artifact.metricIds, REQUIRED_METRIC_IDS), 'Reading prompt benchmarks must expose every required metric id.');
    assertCheck(failures, includesAll(artifact.coverage.benchmarkFixtureIds, REQUIRED_FIXTURE_IDS), 'Reading prompt benchmarks must bind required benchmark fixtures.');
    assertCheck(failures, includesAll(artifact.rows.map((row) => row.baselineId), REQUIRED_BASELINE_IDS), 'Reading prompt benchmarks must cover every required baseline row.');
    assertCheck(failures, artifact.coverage.rowCount === REQUIRED_BASELINE_IDS.length, 'Reading prompt baseline row count must match required rows.');
    assertCheck(failures, artifact.coverage.readNeedBaselineRowCount >= 3, 'Reading prompt baselines must cover ReadNeedComprehensionSynthesis.');
    assertCheck(failures, artifact.coverage.readFitsBaselineRowCount >= 7, 'Reading prompt baselines must cover ReadFitsFindingSynthesis.');
    assertCheck(failures, artifact.coverage.benchmarkFixtureCount >= 6, 'Reading prompt baselines must bind benchmark fixtures.');
    assertCheck(failures, artifact.coverage.parserTargetCount >= 20, 'Reading prompt baselines must bind parser targets.');
    assertCheck(failures, artifact.coverage.registryContractCount >= 8, 'Reading prompt baselines must bind registry/interpolation contracts.');
    assertCheck(failures, artifact.coverage.sourceRootPresentCount === artifact.coverage.sourceRootCount, 'All Reading prompt benchmark source roots must exist.');
    assertCheck(failures, artifact.coverage.requiredPredicateCount >= 100, 'Reading prompt baselines must require at least 100 predicates.');
    assertCheck(failures, artifact.coverage.passedPredicateCount === artifact.coverage.requiredPredicateCount, 'Reading prompt baseline predicates must all pass.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Reading prompt baselines must have no failed predicates.');
    assertCheck(failures, artifact.coverage.failingRowIds.length === 0, 'Reading prompt baselines must have no failing rows.');
    assertCheck(failures, artifact.coverage.baselineScoreMinimum >= 0.8, 'Reading prompt baselines must meet minimum benchmark score.');
    assertCheck(failures, artifact.coverage.readNeedInventoryPromptPartRowCount > 0, 'Reading prompt baselines must bind ReadNeed PromptParts.');
    assertCheck(failures, artifact.coverage.readNeedInventoryPromptRowCount > 0, 'Reading prompt baselines must bind ReadNeed Prompts.');
    assertCheck(failures, artifact.coverage.readFitsInventoryPromptPartRowCount > 0, 'Reading prompt baselines must bind ReadFits PromptParts.');
    assertCheck(failures, artifact.coverage.readFitsInventoryPromptRowCount > 0, 'Reading prompt baselines must bind ReadFits Prompts.');
    assertCheck(failures, artifact.sourceSafety.sourceSafeMetadataOnly === true, 'Reading prompt baselines must be metadata-only.');
    assertCheck(failures, artifact.sourceSafety.rawPromptTextSerialized === false, 'Reading prompt baselines must not serialize raw prompt text.');
    assertCheck(failures, artifact.sourceSafety.rawInterpolatedPromptSerialized === false, 'Reading prompt baselines must not serialize interpolated prompts.');
    assertCheck(failures, artifact.sourceSafety.rawProviderResponseSerialized === false, 'Reading prompt baselines must not serialize provider responses.');
    assertCheck(failures, artifact.sourceSafety.protectedSourceVisible === false, 'Reading prompt baselines must not expose protected source.');
    assertCheck(failures, artifact.sourceSafety.unpaidAssetPackSourceVisible === false, 'Reading prompt baselines must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.sourceSafety.credentialsSerialized === false, 'Reading prompt baselines must not serialize credentials.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^v41-reading-prompt-baseline-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Reading prompt baseline rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.sourceSafeMetadataOnly === true && row.rawPromptTextSerialized === false && row.rawProviderResponseSerialized === false),
      'Reading prompt baseline rows must remain source-safe metadata only.',
    );
  }

  const packageJson = fileExists(root, 'package.json') ? read(root, 'package.json') : '';
  assertCheck(failures, packageJson.includes('generate:v41-reading-prompt-benchmark-baselines'), 'package.json must expose generate:v41-reading-prompt-benchmark-baselines.');
  assertCheck(failures, packageJson.includes('check:v41-gate4'), 'package.json must expose check:v41-gate4.');

  const roadmap = fileExists(root, '.specifications/SPECIFICATIONS_ROADMAP.md') ? read(root, '.specifications/SPECIFICATIONS_ROADMAP.md') : '';
  assertCheck(failures, /Current working gate: V41 Gate (?:4|5|6|7|8|9)\b/u.test(roadmap), 'Roadmap must name V41 Gate 4 or later as current working gate.');
  assertCheck(
    failures,
    roadmap.includes('V41 Gate 8 closure anchor: prompt-program work now owns package-backed `V41PromptProgramBenchmarkReport`') ||
      roadmap.includes('V41 Gate 7 closure anchor: prompt-program work now owns package-backed `V41ConversationToolInterfacePromptRewrite`') ||
      roadmap.includes('V41 Gate 6 closure anchor: prompt-program work now owns package-backed `V41ReadFitsFindingPromptHardening`') ||
      roadmap.includes('V41 Gate 5 closure anchor: prompt-program work now owns package-backed `V41ReadNeedPromptHardening`') ||
      roadmap.includes('Next queued gate after V41 Gate 4: V41 ReadNeedComprehensionSynthesis Prompt Rewrite And Return-Type Hardening.'),
    'Roadmap must preserve V41 Gate 5, Gate 6, Gate 7, or Gate 8 progression.',
  );
  assertCheck(failures, roadmap.includes('V42 should focus on the reliable MVP product experience'), 'Roadmap must preserve V42 reliable MVP product note.');
  assertCheck(failures, roadmap.includes('AI-reading dominant demonstration'), 'Roadmap must preserve AI-reading dominant demonstration note.');

  if (failures.length > 0) {
    process.stderr.write(`V41 Gate 4 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V41 Gate 4 check passed: rows=${artifact.coverage.rowCount} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
