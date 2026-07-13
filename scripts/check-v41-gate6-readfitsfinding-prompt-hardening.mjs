#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.bitcode/v41-readfitsfinding-prompt-hardening.json';

const REQUIRED_HARDENING_IDS = [
  'readfits-assetpack-promptpart-rewrite-boundary',
  'readfits-bounded-inference-prompt-context',
  'readfits-depository-search-query-ranking',
  'readfits-runtime-replay-telemetry',
  'readfits-lexical-tool-doc-prompt',
  'readfits-preview-quote-disclosure-boundary',
  'readfits-settlement-delivery-rights-boundary',
  'readfits-source-safe-tests-and-docs',
];

const REQUIRED_METRIC_IDS = [
  'accepted_need_gate_integrity',
  'query_synthesis_search_breadth',
  'embedding_vector_ranking_policy',
  'many_candidate_fit_selection',
  'selected_fit_provenance_traceability',
  'assetpack_context_source_safety',
  'preview_quote_disclosure_boundary',
  'settlement_delivery_rights_boundary',
  'readfits_telemetry_redaction',
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
      'Usage: node scripts/check-v41-gate6-readfitsfinding-prompt-hardening.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V41 Gate 6 source-safe ReadFitsFindingSynthesis prompt rewrite, search, AssetPack context, preview, and settlement-boundary hardening.',
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
  const pointer = read(root, 'BITCODE_SPEC.txt').trim();

  assertCheck(
    failures,
    pointer === 'V40',
    `BITCODE_SPEC.txt must remain V40 during V41 gate work. Observed ${pointer || 'empty'}.`,
  );

  if (!args.skipBranchCheck) {
    const branch = git(root, ['branch', '--show-current']);
    assertCheck(
      failures,
      branch === 'version/v41' || /^v41\/gate-(?:[6-9]|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V41 Gate 6+ work must occur on version/v41 or v41/gate-6..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.bitcode/v41-promptpart-prompt-inventory.json',
    '.bitcode/v41-registry-interpolation-contracts.json',
    '.bitcode/v41-reading-prompt-benchmark-baselines.json',
    '.bitcode/v41-readneed-prompt-hardening.json',
    'packages/specifying/src/canonical/v41-readfitsfinding-prompt-hardening.js',
    'packages/specifying/test/v41-readfitsfinding-prompt-hardening.test.js',
    'scripts/generate-v41-readfitsfinding-prompt-hardening.mjs',
    'scripts/check-v41-gate6-readfitsfinding-prompt-hardening.mjs',
    'packages/asset-packs-pipelines/domain/src/agents/setup/read-fits-finding-synthesis-setup-plan-agent.ts',
    'packages/asset-packs-pipelines/domain/src/agents/setup/read-fits-finding-synthesis-read-comprehension-agent.ts',
    'packages/asset-packs-pipelines/domain/src/agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent.ts',
    'packages/asset-packs-pipelines/domain/src/depository-search.ts',
    'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
    'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
    'packages/asset-packs-pipelines/domain/src/tools/AssetPackLexicalDepositorySearchTool.ts',
    'BITCODE_SPEC_V41.md',
    'BITCODE_SPEC_V41_DELTA.md',
    'BITCODE_SPEC_V41_NOTES.md',
    'BITCODE_SPEC_V41_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'README.md',
    'packages/specifying/README.md',
    'package.json',
    '.github/workflows/bitcode-gate-quality.yml',
    '.github/workflows/bitcode-canon-quality.yml',
  ];

  for (const relativePath of requiredFiles) {
    assertCheck(failures, fileExists(root, relativePath), `Missing V41 Gate 6 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v41-readfitsfinding-prompt-hardening.mjs', '--check']);
    } catch (error) {
      failures.push(`V41 ReadFitsFinding prompt hardening artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (!args.skipPackageTests && failures.length === 0) {
    try {
      run(root, 'node', ['--test', '--test-force-exit', 'packages/specifying/test/v41-readfitsfinding-prompt-hardening.test.js']);
    } catch (error) {
      failures.push(`V41 ReadFitsFinding prompt hardening protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V41 ReadFitsFinding prompt hardening artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v41-readfitsfinding-prompt-hardening', 'ReadFitsFinding hardening artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v41.readFitsFindingPromptHardening.v1', 'ReadFitsFinding hardening schemaId must match.');
    assertCheck(
      failures,
      artifact.version === 'V41' && artifact.currentTarget === 'V40',
      'ReadFitsFinding hardening must bind V41 over active V40.',
    );
    assertCheck(failures, artifact.passed === true, 'ReadFitsFinding hardening artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-readfitsfinding-prompt-hardening-metadata',
      'ReadFitsFinding hardening artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.metricIds, REQUIRED_METRIC_IDS), 'ReadFitsFinding hardening must expose every required metric id.');
    assertCheck(failures, includesAll(artifact.rows.map((row) => row.hardeningId), REQUIRED_HARDENING_IDS), 'ReadFitsFinding hardening must cover every row.');
    assertCheck(failures, artifact.coverage.rowCount === REQUIRED_HARDENING_IDS.length, 'ReadFitsFinding hardening row count must match required rows.');
    assertCheck(failures, artifact.coverage.promptSurfaceCount >= 12, 'ReadFitsFinding hardening must cover prompt surfaces.');
    assertCheck(failures, artifact.coverage.parserTargetCount >= 15, 'ReadFitsFinding hardening must bind parser targets.');
    assertCheck(failures, artifact.coverage.benchmarkFixtureCount >= 4, 'ReadFitsFinding hardening must bind benchmark fixtures.');
    assertCheck(failures, artifact.coverage.sourceRootPresentCount === artifact.coverage.sourceRootCount, 'All ReadFitsFinding hardening source roots must exist.');
    assertCheck(failures, artifact.coverage.requiredPredicateCount >= 70, 'ReadFitsFinding hardening must require at least 70 predicates.');
    assertCheck(failures, artifact.coverage.passedPredicateCount === artifact.coverage.requiredPredicateCount, 'ReadFitsFinding hardening predicates must all pass.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'ReadFitsFinding hardening must have no failed predicates.');
    assertCheck(failures, artifact.coverage.failingRowIds.length === 0, 'ReadFitsFinding hardening must have no failing rows.');
    assertCheck(failures, artifact.coverage.hardeningScoreMinimum >= 1, 'ReadFitsFinding hardening rows must be fully hardened.');
    assertCheck(failures, artifact.coverage.readFitsInventoryPromptPartRowCount > 0, 'ReadFitsFinding hardening must bind ReadFits PromptParts.');
    assertCheck(failures, artifact.coverage.readFitsInventoryPromptRowCount > 0, 'ReadFitsFinding hardening must bind ReadFits Prompts.');
    assertCheck(failures, artifact.coverage.gate4ReadFitsBaselineRowCount >= 7, 'ReadFitsFinding hardening must bind Gate 4 ReadFits baselines.');
    assertCheck(failures, artifact.coverage.gate5ReadNeedHardeningRowCount === 7, 'ReadFitsFinding hardening must bind Gate 5 ReadNeed hardening.');
    assertCheck(failures, /^v41-promptpart-prompt-inventory:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate2InventoryRoot), 'Gate 2 dependency root must be present.');
    assertCheck(failures, /^v41-registry-interpolation-contract:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate3RegistryInterpolationRoot), 'Gate 3 dependency root must be present.');
    assertCheck(failures, /^v41-reading-prompt-benchmark-baselines:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate4ReadingPromptBenchmarkBaselineRoot), 'Gate 4 dependency root must be present.');
    assertCheck(failures, /^v41-readneed-prompt-hardening:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate5ReadNeedPromptHardeningRoot), 'Gate 5 dependency root must be present.');
    assertCheck(failures, artifact.sourceSafety.sourceSafeMetadataOnly === true, 'ReadFitsFinding hardening must be metadata-only.');
    assertCheck(failures, artifact.sourceSafety.rawPromptTextSerialized === false, 'ReadFitsFinding hardening must not serialize raw prompt text.');
    assertCheck(failures, artifact.sourceSafety.rawInterpolatedPromptSerialized === false, 'ReadFitsFinding hardening must not serialize interpolated prompts.');
    assertCheck(failures, artifact.sourceSafety.rawProviderResponseSerialized === false, 'ReadFitsFinding hardening must not serialize provider responses.');
    assertCheck(failures, artifact.sourceSafety.protectedSourceVisible === false, 'ReadFitsFinding hardening must not expose protected source.');
    assertCheck(failures, artifact.sourceSafety.unpaidAssetPackSourceVisible === false, 'ReadFitsFinding hardening must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.sourceSafety.credentialsSerialized === false, 'ReadFitsFinding hardening must not serialize credentials.');
    assertCheck(failures, artifact.sourceSafety.walletPrivateMaterialVisible === false, 'ReadFitsFinding hardening must not expose wallet private material.');
    assertCheck(failures, artifact.sourceSafety.settlementPrivatePayloadVisible === false, 'ReadFitsFinding hardening must not expose settlement private payloads.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^v41-readfitsfinding-prompt-hardening-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'ReadFitsFinding hardening rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.sourceSafeMetadataOnly === true && row.rawPromptTextSerialized === false && row.rawProviderResponseSerialized === false),
      'ReadFitsFinding hardening rows must remain source-safe metadata only.',
    );
  }

  const packageJson = fileExists(root, 'package.json') ? read(root, 'package.json') : '';
  assertCheck(failures, packageJson.includes('generate:v41-readfitsfinding-prompt-hardening'), 'package.json must expose generate:v41-readfitsfinding-prompt-hardening.');
  assertCheck(failures, packageJson.includes('check:v41-gate6'), 'package.json must expose check:v41-gate6.');

  const roadmap = fileExists(root, 'SPECIFICATIONS_ROADMAP.md') ? read(root, 'SPECIFICATIONS_ROADMAP.md') : '';
  assertCheck(
    failures,
    roadmap.includes('Current working gate: V41 Gate 6') ||
      roadmap.includes('Current working gate: V41 Gate 7') ||
      roadmap.includes('Current working gate: V41 Gate 8') ||
      roadmap.includes('Current working gate: V41 Gate 9'),
    'Roadmap must name V41 Gate 6 or later as current working gate.',
  );
  assertCheck(
    failures,
    roadmap.includes('Next queued gate after V41 Gate 6: V41 Conversation Tool And Interface Prompt Rewrite.') ||
      roadmap.includes('Next queued gate after V41 Gate 7: V41 Prompt Benchmark Report And Telemetry Integration.') ||
      roadmap.includes('Next queued gate after V41 Gate 8: V41 Promotion Readiness.') ||
      roadmap.includes('V41 Gate 9 closure anchor'),
    'Roadmap must name V41 Gate 7, Gate 8, or Gate 9 as next.',
  );
  assertCheck(failures, roadmap.includes('V41 Gate 6 closure anchor'), 'Roadmap must preserve V41 Gate 6 closure anchor.');
  assertCheck(failures, roadmap.includes('V43+ agentic depositing'), 'Roadmap must preserve V43+ agentic depositing note.');

  if (failures.length > 0) {
    process.stderr.write(`V41 Gate 6 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V41 Gate 6 check passed: rows=${artifact.coverage.rowCount} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
