#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultRepoRoot = path.resolve(__dirname, '..');
const ARTIFACT_PATH = '.proofs/v41/prompt-program-benchmark-report.json';

const REQUIRED_ROW_IDS = [
  'post-rewrite-prompt-inventory-delta',
  'readneed-post-rewrite-benchmark-delta',
  'readfitsfinding-post-rewrite-benchmark-delta',
  'conversation-interface-post-rewrite-benchmark-delta',
  'registry-lineage-version-telemetry-binding',
  'failsafe-thricified-inference-receipt-projection',
  'rich-stream-source-safe-telemetry-projection',
  'repair-hooks-parsed-output-redaction-posture',
  'gate8-tests-docs-workflows',
];

const REQUIRED_METRIC_IDS = [
  'post_rewrite_promptpart_delta',
  'post_rewrite_prompt_delta',
  'benchmark_fixture_result_projection',
  'prompt_lineage_registry_versioning',
  'failsafe_thricified_receipt_projection',
  'parsed_output_schema_verdict_projection',
  'rich_stream_prompt_telemetry_projection',
  'repair_hook_redaction_posture',
  'source_safe_benchmark_report_disclosure',
  'depository_search_embedding_query_projection',
];

const REQUIRED_TELEMETRY_RECEIPT_IDS = [
  'ReadNeed',
  'ReadFitsFindingSynthesis',
  'ConversationStreamEvent',
  'ReadingPipelineTelemetryProjection',
  'ReadingOperationalTelemetryEvent',
  'PromptPartBenchmarkResult',
  'PromptBenchmarkResult',
  'failsafe',
  'thricified_generation',
  'interpolated_prompt',
  'raw_response',
  'parsed_output',
  'schema_verdict',
  'repair',
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
      'Usage: node scripts/check-v41-gate8-prompt-program-benchmark-report.mjs [--skip-branch-check] [--skip-package-tests] [--repo-root <path>]',
      '',
      'Checks V41 Gate 8 source-safe prompt-program benchmark report and telemetry integration.',
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
      branch === 'version/v41' || /^v41\/gate-(?:8|9|10)-[a-z0-9][a-z0-9-]*$/u.test(branch),
      `V41 Gate 8+ work must occur on version/v41 or v41/gate-8..10-* branches. Observed ${branch || 'detached HEAD'}.`,
    );
  }

  const requiredFiles = [
    ARTIFACT_PATH,
    '.proofs/v38/prompt-benchmark-report.json',
    '.proofs/v38/disclosure-boundary-report.json',
    '.proofs/v39/operational-telemetry-repair-readback.json',
    '.proofs/v40/prompt-benchmark-smoke-v41-readiness.json',
    '.proofs/v41/promptpart-prompt-inventory.json',
    '.proofs/v41/registry-interpolation-contracts.json',
    '.proofs/v41/reading-prompt-benchmark-baselines.json',
    '.proofs/v41/readneed-prompt-hardening.json',
    '.proofs/v41/readfitsfinding-prompt-hardening.json',
    '.proofs/v41/conversation-tool-interface-prompt-rewrite.json',
    'scripts/specifying/src/canonical/v41-prompt-program-benchmark-report.js',
    'scripts/specifying/test/v41-prompt-program-benchmark-report.test.js',
    'scripts/generate-v41-prompt-program-benchmark-report.mjs',
    'scripts/check-v41-gate8-prompt-program-benchmark-report.mjs',
    'packages/prompts/src/benchmarking/runner.ts',
    'packages/prompts/src/benchmarking/types.ts',
    'packages/asset-packs-pipelines/domain/src/reading-pipeline-observability.ts',
    'packages/asset-packs-pipelines/domain/src/reading-operational-telemetry-repair-readback.ts',
    'packages/api/src/conversations/stream-events.ts',
    'packages/api/src/conversations/telemetry.ts',
    'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
    'apps/uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
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
    assertCheck(failures, fileExists(root, relativePath), `Missing V41 Gate 8 file: ${relativePath}`);
  }

  if (failures.length === 0) {
    try {
      run(root, 'node', ['scripts/generate-v41-prompt-program-benchmark-report.mjs', '--check']);
    } catch (error) {
      failures.push(`V41 prompt-program benchmark report artifact check failed: ${error.stderr || error.message}`);
    }
  }

  if (!args.skipPackageTests && failures.length === 0) {
    try {
      run(root, 'node', [
        '--test',
        '--test-force-exit',
        'scripts/specifying/test/v41-prompt-program-benchmark-report.test.js',
      ]);
    } catch (error) {
      failures.push(`V41 prompt-program benchmark report protocol test failed: ${error.stderr || error.message}`);
    }
  }

  const serializedArtifact = fileExists(root, ARTIFACT_PATH) ? read(root, ARTIFACT_PATH) : '';
  for (const marker of SECRET_MARKERS) {
    assertCheck(failures, !serializedArtifact.includes(marker), `V41 prompt-program benchmark report artifact must not contain secret marker ${marker}.`);
  }

  const artifact = serializedArtifact ? JSON.parse(serializedArtifact) : null;
  if (artifact) {
    assertCheck(failures, artifact.artifactId === 'v41-prompt-program-benchmark-report', 'Prompt-program benchmark report artifactId must match.');
    assertCheck(failures, artifact.schemaId === 'bitcode.v41.promptProgramBenchmarkReport.v1', 'Prompt-program benchmark report schemaId must match.');
    assertCheck(failures, artifact.version === 'V41' && artifact.currentTarget === 'V40', 'Prompt-program benchmark report must bind V41 over active V40.');
    assertCheck(failures, artifact.passed === true, 'Prompt-program benchmark report artifact must pass.');
    assertCheck(
      failures,
      artifact.sourceSafetyVerdict === 'source-safe-prompt-program-benchmark-telemetry-metadata',
      'Prompt-program benchmark report artifact must be source-safe metadata.',
    );
    assertCheck(failures, includesAll(artifact.metricIds, REQUIRED_METRIC_IDS), 'Prompt-program benchmark report must expose every required metric id.');
    assertCheck(failures, includesAll(artifact.rows.map((row) => row.reportRowId), REQUIRED_ROW_IDS), 'Prompt-program benchmark report must cover every row.');
    assertCheck(failures, includesAll(artifact.coverage.telemetryReceiptIds, REQUIRED_TELEMETRY_RECEIPT_IDS), 'Prompt-program benchmark report must cover required telemetry receipts.');
    assertCheck(failures, artifact.coverage.rowCount === REQUIRED_ROW_IDS.length, 'Prompt-program benchmark report row count must match required rows.');
    assertCheck(failures, artifact.coverage.promptProgramArtifactCount >= 10, 'Prompt-program benchmark report must bind prompt-program artifacts.');
    assertCheck(failures, artifact.coverage.telemetryReceiptCount >= 20, 'Prompt-program benchmark report must bind telemetry receipts.');
    assertCheck(failures, artifact.coverage.sourceRootPresentCount === artifact.coverage.sourceRootCount, 'All prompt-program benchmark report source roots must exist.');
    assertCheck(failures, artifact.coverage.requiredPredicateCount >= 45, 'Prompt-program benchmark report must require at least 45 predicates.');
    assertCheck(failures, artifact.coverage.passedPredicateCount === artifact.coverage.requiredPredicateCount, 'Prompt-program benchmark report predicates must all pass.');
    assertCheck(failures, artifact.coverage.failedPredicateIds.length === 0, 'Prompt-program benchmark report must have no failed predicates.');
    assertCheck(failures, artifact.coverage.failingRowIds.length === 0, 'Prompt-program benchmark report must have no failing rows.');
    assertCheck(failures, artifact.coverage.dependenciesPassing === true, 'Prompt-program benchmark report dependencies must pass.');
    assertCheck(failures, artifact.coverage.v38PromptBenchmarkRowCount >= 7, 'V38 prompt benchmark dependency must remain bound.');
    assertCheck(failures, artifact.coverage.v38InferenceTelemetryLevelCount >= 13, 'V38 inference telemetry dependency must remain bound.');
    assertCheck(failures, artifact.coverage.v41ReadingBenchmarkBaselineRowCount >= 10, 'Gate 4 Reading benchmark dependency must remain bound.');
    assertCheck(failures, artifact.coverage.v41ReadNeedHardeningRowCount >= 7, 'Gate 5 ReadNeed dependency must remain bound.');
    assertCheck(failures, artifact.coverage.v41ReadFitsFindingHardeningRowCount >= 8, 'Gate 6 ReadFitsFinding dependency must remain bound.');
    assertCheck(failures, artifact.coverage.v41ConversationToolInterfaceRowCount >= 9, 'Gate 7 Conversation/tool/interface dependency must remain bound.');
    assertCheck(failures, /^v38-prompt-benchmark-report:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.v38PromptBenchmarkReportRoot), 'V38 prompt benchmark root must be present.');
    assertCheck(failures, /^v38-inference-telemetry-disclosure-report:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.v38InferenceTelemetryDisclosureRoot), 'V38 inference telemetry root must be present.');
    assertCheck(failures, /^v38-ptrr-failsafe-thricified-stack:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.v38PtrrFailsafeThricifiedStackRoot), 'V38 PTRR stack root must be present.');
    assertCheck(failures, /^v38-read-fits-finding-search:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.v38ReadFitsFindingSearchEmbeddingsRoot), 'V38 ReadFitsFinding search embedding root must be present.');
    assertCheck(failures, /^v39-operational-telemetry-repair-readback:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.v39OperationalTelemetryRepairReadbackRoot), 'V39 operational telemetry root must be present.');
    assertCheck(failures, /^v40-prompt-benchmark-smoke-v41-readiness:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.v40PromptBenchmarkSmokeRoot), 'V40 prompt benchmark smoke root must be present.');
    assertCheck(failures, /^v41-promptpart-prompt-inventory:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate2InventoryRoot), 'Gate 2 dependency root must be present.');
    assertCheck(failures, /^v41-registry-interpolation-contract:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate3RegistryInterpolationRoot), 'Gate 3 dependency root must be present.');
    assertCheck(failures, /^v41-reading-prompt-benchmark-baselines:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate4ReadingPromptBenchmarkBaselineRoot), 'Gate 4 dependency root must be present.');
    assertCheck(failures, /^v41-readneed-prompt-hardening:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate5ReadNeedPromptHardeningRoot), 'Gate 5 dependency root must be present.');
    assertCheck(failures, /^v41-readfitsfinding-prompt-hardening:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate6ReadFitsFindingPromptHardeningRoot), 'Gate 6 dependency root must be present.');
    assertCheck(failures, /^v41-conversation-tool-interface-prompt-rewrite:[a-f0-9]{24}$/u.test(artifact.dependencyRoots.gate7ConversationToolInterfacePromptRewriteRoot), 'Gate 7 dependency root must be present.');
    assertCheck(failures, artifact.sourceSafety.sourceSafeMetadataOnly === true, 'Prompt-program benchmark report must be metadata-only.');
    assertCheck(failures, artifact.sourceSafety.rawPromptTextSerialized === false, 'Prompt-program benchmark report must not serialize raw prompt text.');
    assertCheck(failures, artifact.sourceSafety.rawInterpolatedPromptSerialized === false, 'Prompt-program benchmark report must not serialize interpolated prompts.');
    assertCheck(failures, artifact.sourceSafety.rawProviderResponseSerialized === false, 'Prompt-program benchmark report must not serialize provider responses.');
    assertCheck(failures, artifact.sourceSafety.protectedPromptSerialized === false, 'Prompt-program benchmark report must not serialize protected prompts.');
    assertCheck(failures, artifact.sourceSafety.protectedSourceVisible === false, 'Prompt-program benchmark report must not expose protected source.');
    assertCheck(failures, artifact.sourceSafety.unpaidAssetPackSourceVisible === false, 'Prompt-program benchmark report must not expose unpaid AssetPack source.');
    assertCheck(failures, artifact.sourceSafety.credentialsSerialized === false, 'Prompt-program benchmark report must not serialize credentials.');
    assertCheck(failures, artifact.sourceSafety.walletPrivateMaterialVisible === false, 'Prompt-program benchmark report must not expose wallet private material.');
    assertCheck(failures, artifact.sourceSafety.settlementPrivatePayloadVisible === false, 'Prompt-program benchmark report must not expose settlement private payloads.');
    assertCheck(
      failures,
      artifact.rows.every((row) => /^v41-prompt-program-benchmark-report-row:[a-f0-9]{24}$/u.test(row.rowRoot)),
      'Prompt-program benchmark report rows must have deterministic row roots.',
    );
    assertCheck(
      failures,
      artifact.rows.every((row) => row.sourceSafeMetadataOnly === true && row.rawPromptTextSerialized === false && row.rawProviderResponseSerialized === false),
      'Prompt-program benchmark report rows must remain source-safe metadata only.',
    );
  }

  const packageJson = fileExists(root, 'package.json') ? read(root, 'package.json') : '';
  assertCheck(failures, packageJson.includes('generate:v41-prompt-program-benchmark-report'), 'package.json must expose generate:v41-prompt-program-benchmark-report.');
  assertCheck(failures, packageJson.includes('check:v41-gate8'), 'package.json must expose check:v41-gate8.');

  const roadmap = fileExists(root, '.specifications/SPECIFICATIONS_ROADMAP.md') ? read(root, '.specifications/SPECIFICATIONS_ROADMAP.md') : '';
  assertCheck(failures, /Current working gate: V41 Gate (?:8|9)\b/u.test(roadmap), 'Roadmap must name V41 Gate 8 or later V41 gate progression.');
  assertCheck(failures, roadmap.includes('V41 Gate 9 closure anchor'), 'Roadmap must carry V41 Gate 9 closure anchor after Gate 8.');
  assertCheck(failures, roadmap.includes('V41 Gate 8 closure anchor'), 'Roadmap must preserve V41 Gate 8 closure anchor.');
  assertCheck(failures, roadmap.includes('V43+ agentic depositing'), 'Roadmap must preserve V43+ agentic depositing note.');

  if (failures.length > 0) {
    process.stderr.write(`V41 Gate 8 check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `V41 Gate 8 check passed: rows=${artifact.coverage.rowCount} predicates=${artifact.coverage.passedPredicateCount} root=${artifact.artifactRoot}\n`,
  );
}

main();
