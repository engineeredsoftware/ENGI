// @ts-check

import crypto from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV38PromptBenchmarkReport } from './prompt-benchmark-report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_ARTIFACT_PATH =
  '.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json';
export const V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_SCHEMA_ID =
  'bitcode.v40.promptBenchmarkSmokeV41Readiness.v1';
export const V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_VERSION = 'V40';
export const V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_CURRENT_TARGET = 'V39';
export const V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_SOURCE_SAFETY_VERDICT =
  'source-safe-prompt-benchmark-smoke-and-v41-readiness';

export const V40_PROMPT_BENCHMARK_SMOKE_ROW_IDS = Object.freeze([
  'benchmark:runner-cli-report-smoke',
  'benchmark:promptpart-smoke-execution',
  'benchmark:complete-prompt-smoke-execution',
  'inventory:v38-benchmark-report-binding',
  'coverage:reading-prompt-suites-and-fixtures',
  'coverage:conversation-and-tool-prompt-suites',
  'boundary:source-safe-no-prompt-rewrite',
  'handoff:v41-prompt-program-worklist',
  'workflow:gate-and-canon-quality-wiring',
  'proof:artifact-tests-command-docs',
]);

export const V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS = Object.freeze({
  rowCount: 10,
  smokeBenchmarkExecutionCount: 2,
  requiredV38BenchmarkRows: 7,
  requiredFixtureCount: 12,
  v41WorkItemCount: 8,
  sourceSafetyBoundaryCount: 7,
});

export const V40_PROMPT_BENCHMARK_SMOKE_COMMAND_IDS = Object.freeze([
  'node scripts/run-v40-prompt-benchmark-smoke.mjs --json',
  'pnpm -C packages/prompts benchmark:report',
  'node scripts/generate-v38-prompt-benchmark-report.mjs --check',
  'node scripts/generate-v40-prompt-benchmark-smoke-v41-readiness.mjs --check',
  'node --test --test-force-exit packages/specifying/test/v40-prompt-benchmark-smoke-v41-readiness.test.js',
]);

export const V40_PROMPT_BENCHMARK_SMOKE_V41_WORK_ITEM_IDS = Object.freeze([
  'audit-every-raw-promptpart',
  'audit-every-composed-prompt',
  'benchmark-every-meaningful-semantic-part',
  'repartition-where-benchmark-signal-requires',
  'retitle-promptparts-and-prompts-where-semantics-are-weak',
  'rewrite-prompt-program-content-where-benchmark-signal-requires',
  'catalogue-prompt-registry-edges-and-interpolation-bindings',
  'validate-reading-and-conversation-inference-prompt-quality',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-prompt-text',
  'raw-provider-responses',
  'unpaid-assetpack-source',
]);

const SOURCE_ROOTS = Object.freeze({
  v38PromptBenchmarkReport: 'packages/specifying/src/canonical/prompt-benchmark-report.js',
  v38PromptBenchmarkArtifact: '.bitcode/v38-prompt-benchmark-report.json',
  v38PromptBenchmarkGenerator: 'scripts/generate-v38-prompt-benchmark-report.mjs',
  v38PromptBenchmarkCheck: 'scripts/check-v38-gate4-prompt-benchmark-report.mjs',
  v38PromptBenchmarkTest: 'packages/specifying/test/v38-prompt-benchmark-report.test.js',
  promptBenchmarkRunner: 'packages/prompts/src/benchmarking/runner.ts',
  promptBenchmarkCli: 'packages/prompts/src/benchmarking/cli.ts',
  promptBenchmarkTypes: 'packages/prompts/src/benchmarking/types.ts',
  promptBenchmarkReadme: 'packages/prompts/src/benchmarking/README.md',
  promptPackageJson: 'packages/prompts/package.json',
  promptGenericParts: 'packages/prompts/src/raw_promptparts/generic',
  promptSpecificParts: 'packages/prompts/src/raw_promptparts/specific',
  readingAgentPrompts: 'packages/asset-packs-pipelines/domain/src/agents/prompts',
  conversationPrompt: 'packages/conversations/src/prompts/BitcodeConversationSystemPrompt.ts',
  toolPrompt: 'packages/tools-generics/src/doc-code-tool/DocCodeToolPrompt.ts',
  smokeRunner: 'scripts/run-v40-prompt-benchmark-smoke.mjs',
  v40Source: 'packages/specifying/src/canonical/v40-prompt-benchmark-smoke-v41-readiness.js',
  v40Test: 'packages/specifying/test/v40-prompt-benchmark-smoke-v41-readiness.test.js',
  v40Generator: 'scripts/generate-v40-prompt-benchmark-smoke-v41-readiness.mjs',
  v40Check: 'scripts/check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs',
  spec: 'BITCODE_SPEC_V40.md',
  delta: 'BITCODE_SPEC_V40_DELTA.md',
  notes: 'BITCODE_SPEC_V40_NOTES.md',
  parity: 'BITCODE_SPEC_V40_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'packages/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v40-prompt-benchmark-smoke-row:${digest(id)}`;
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function listFiles(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  if (!existsSync(absolutePath)) return [];
  const rootStat = statSync(absolutePath);
  if (rootStat.isFile()) return [sourcePath];
  if (!rootStat.isDirectory()) return [];

  const files = [];
  const walk = (currentAbsolutePath, currentRelativePath) => {
    for (const entry of readdirSync(currentAbsolutePath, { withFileTypes: true })) {
      if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name === '_legacy') continue;
      const nextAbsolutePath = path.join(currentAbsolutePath, entry.name);
      const nextRelativePath = path.join(currentRelativePath, entry.name);
      if (entry.isDirectory()) walk(nextAbsolutePath, nextRelativePath);
      else if (/\.(?:ts|md|json)$/u.test(entry.name) && !/\.d\.ts$/u.test(entry.name)) {
        files.push(nextRelativePath);
      }
    }
  };
  walk(absolutePath, sourcePath);
  return files.sort();
}

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function predicate(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_prompt_benchmark_smoke_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    rawPromptTextSerialized: false,
    rawProviderResponseSerialized: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    promptContentRewriteAllowedInV40: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V40_PROMPT_BENCHMARK_SMOKE_ROWS = Object.freeze([
  row({
    rowId: 'benchmark:runner-cli-report-smoke',
    surfaceKind: 'benchmark-command',
    sourceRoots: [
      SOURCE_ROOTS.promptBenchmarkRunner,
      SOURCE_ROOTS.promptBenchmarkCli,
      SOURCE_ROOTS.promptBenchmarkTypes,
      SOURCE_ROOTS.promptBenchmarkReadme,
      SOURCE_ROOTS.promptPackageJson,
      SOURCE_ROOTS.smokeRunner,
    ],
    commandIds: [
      'node scripts/run-v40-prompt-benchmark-smoke.mjs --json',
      'pnpm -C packages/prompts benchmark:report',
    ],
    closureRequirement:
      'Prompt benchmark smoke commands must run locally with deterministic mock inference and source-safe report totals.',
  }),
  row({
    rowId: 'benchmark:promptpart-smoke-execution',
    surfaceKind: 'PromptPart-benchmark-execution',
    sourceRoots: [SOURCE_ROOTS.promptBenchmarkRunner, SOURCE_ROOTS.promptGenericParts, SOURCE_ROOTS.promptSpecificParts],
    commandIds: ['node scripts/run-v40-prompt-benchmark-smoke.mjs --json'],
    closureRequirement:
      'The smoke runner must execute at least one PromptPart benchmark and return scores without writing PromptPart files or serializing raw prompt text.',
  }),
  row({
    rowId: 'benchmark:complete-prompt-smoke-execution',
    surfaceKind: 'Prompt-benchmark-execution',
    sourceRoots: [SOURCE_ROOTS.promptBenchmarkRunner, SOURCE_ROOTS.readingAgentPrompts, SOURCE_ROOTS.conversationPrompt],
    commandIds: ['node scripts/run-v40-prompt-benchmark-smoke.mjs --json'],
    closureRequirement:
      'The smoke runner must execute at least one composed Prompt benchmark and return scores without serializing formatted prompt text or model responses.',
  }),
  row({
    rowId: 'inventory:v38-benchmark-report-binding',
    surfaceKind: 'prior-benchmark-report',
    sourceRoots: [
      SOURCE_ROOTS.v38PromptBenchmarkReport,
      SOURCE_ROOTS.v38PromptBenchmarkArtifact,
      SOURCE_ROOTS.v38PromptBenchmarkGenerator,
      SOURCE_ROOTS.v38PromptBenchmarkCheck,
      SOURCE_ROOTS.v38PromptBenchmarkTest,
    ],
    commandIds: ['node scripts/generate-v38-prompt-benchmark-report.mjs --check'],
    closureRequirement:
      'V40 Gate 10 must bind the V38 prompt benchmark inventory and prove it remains source-safe and passing before V41 prompt evolution.',
  }),
  row({
    rowId: 'coverage:reading-prompt-suites-and-fixtures',
    surfaceKind: 'Reading-prompt-coverage',
    sourceRoots: [SOURCE_ROOTS.readingAgentPrompts, SOURCE_ROOTS.promptSpecificParts, SOURCE_ROOTS.v38PromptBenchmarkReport],
    commandIds: ['node scripts/generate-v40-prompt-benchmark-smoke-v41-readiness.mjs --check'],
    closureRequirement:
      'Reading PromptPart and Prompt benchmark suites must remain discoverable and fixture-bound for ReadNeedComprehensionSynthesis and ReadFitsFindingSynthesis.',
  }),
  row({
    rowId: 'coverage:conversation-and-tool-prompt-suites',
    surfaceKind: 'interface-and-tool-prompt-coverage',
    sourceRoots: [SOURCE_ROOTS.conversationPrompt, SOURCE_ROOTS.toolPrompt, SOURCE_ROOTS.v38PromptBenchmarkReport],
    commandIds: ['node scripts/generate-v40-prompt-benchmark-smoke-v41-readiness.mjs --check'],
    closureRequirement:
      'Conversation and tool-definition Prompt benchmark suites must remain visible so V41 can audit all non-Reading inference prompt programs too.',
  }),
  row({
    rowId: 'boundary:source-safe-no-prompt-rewrite',
    surfaceKind: 'source-safety-boundary',
    sourceRoots: [SOURCE_ROOTS.smokeRunner, SOURCE_ROOTS.v40Source, SOURCE_ROOTS.notes],
    commandIds: ['node scripts/check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs'],
    closureRequirement:
      'V40 may execute smoke benchmarks and produce receipts, but raw prompt content rewriting, repartitioning, and retitling remain V41 work.',
  }),
  row({
    rowId: 'handoff:v41-prompt-program-worklist',
    surfaceKind: 'V41-readiness',
    sourceRoots: [SOURCE_ROOTS.notes, SOURCE_ROOTS.roadmap, SOURCE_ROOTS.parity],
    commandIds: ['node scripts/generate-v40-prompt-benchmark-smoke-v41-readiness.mjs --check'],
    closureRequirement:
      'V41 must receive a concrete worklist for auditing every PromptPart, Prompt, benchmark fixture, registry edge, and interpolation binding.',
  }),
  row({
    rowId: 'workflow:gate-and-canon-quality-wiring',
    surfaceKind: 'workflow-wiring',
    sourceRoots: [SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow, SOURCE_ROOTS.packageJson],
    commandIds: ['pnpm run check:v40-gate10'],
    closureRequirement:
      'Gate and canon quality workflows must run the Gate 10 checker and protocol smoke test in draft posture.',
  }),
  row({
    rowId: 'proof:artifact-tests-command-docs',
    surfaceKind: 'proof-and-docs',
    sourceRoots: [
      SOURCE_ROOTS.v40Source,
      SOURCE_ROOTS.v40Test,
      SOURCE_ROOTS.v40Generator,
      SOURCE_ROOTS.v40Check,
      SOURCE_ROOTS.spec,
      SOURCE_ROOTS.delta,
      SOURCE_ROOTS.notes,
      SOURCE_ROOTS.parity,
      SOURCE_ROOTS.roadmap,
      SOURCE_ROOTS.readme,
      SOURCE_ROOTS.protocolReadme,
    ],
    commandIds: [
      'node --test --test-force-exit packages/specifying/test/v40-prompt-benchmark-smoke-v41-readiness.test.js',
      'node scripts/check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs',
    ],
    closureRequirement:
      'The generated artifact, tests, scripts, workflows, and documentation must close the Gate 10 prompt benchmark smoke proof.',
  }),
]);

function sourceStats(repoRoot) {
  const promptPartFiles = [
    ...listFiles(repoRoot, SOURCE_ROOTS.promptGenericParts),
    ...listFiles(repoRoot, SOURCE_ROOTS.promptSpecificParts),
  ].filter((file) => /promptpart_/u.test(file));
  const benchmarkSources = [
    SOURCE_ROOTS.promptBenchmarkRunner,
    SOURCE_ROOTS.promptBenchmarkCli,
    SOURCE_ROOTS.promptBenchmarkTypes,
    SOURCE_ROOTS.promptBenchmarkReadme,
    SOURCE_ROOTS.v38PromptBenchmarkReport,
  ].map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
  const promptSources = [
    SOURCE_ROOTS.readingAgentPrompts,
    SOURCE_ROOTS.conversationPrompt,
    SOURCE_ROOTS.toolPrompt,
  ].flatMap((sourcePath) => listFiles(repoRoot, sourcePath))
    .map((sourcePath) => readSource(repoRoot, sourcePath))
    .join('\n');

  return {
    promptPartFileCount: promptPartFiles.length,
    promptPartFileSample: promptPartFiles.slice(0, 12),
    benchmarkRunnerMethodCount: countMatches(benchmarkSources, /benchmarkPromptPart|benchmarkPrompt\(/gu),
    benchmarkReportCommandCount: countMatches(readSource(repoRoot, SOURCE_ROOTS.promptPackageJson), /benchmark:report/gu),
    benchmarkDefinitionCount:
      countMatches(promptSources, /benchmarks:\s*\[/gu)
      + countMatches(benchmarkSources, /benchmarks:\s*\[/gu),
    promptConstructionCount: countMatches(promptSources, /new\s+Prompt\s*\(/gu),
    promptPartExportCount: promptPartFiles.length,
    v41WorkItemCount: V40_PROMPT_BENCHMARK_SMOKE_V41_WORK_ITEM_IDS.length,
  };
}

function sourceEvidence(repoRoot) {
  const roots = [...new Set(V40_PROMPT_BENCHMARK_SMOKE_ROWS.flatMap((item) => item.sourceRoots))].sort();
  return roots.map((sourcePath) => ({
    sourcePath,
    exists: sourceExists(repoRoot, sourcePath),
    legacy: sourcePath.startsWith('_legacy/'),
  }));
}

function predicateResults(repoRoot, rows, stats, v38Report) {
  return [
    predicate('smoke.script.exists', SOURCE_ROOTS.smokeRunner, sourceExists(repoRoot, SOURCE_ROOTS.smokeRunner)),
    predicate('smoke.command.package-report-exists', SOURCE_ROOTS.promptPackageJson, stats.benchmarkReportCommandCount >= 1),
    predicate('smoke.runner.has-promptpart-method', SOURCE_ROOTS.promptBenchmarkRunner, stats.benchmarkRunnerMethodCount >= 2),
    predicate('smoke.promptpart-files-present', SOURCE_ROOTS.promptGenericParts, stats.promptPartFileCount > 0),
    predicate('smoke.prompt-constructions-present', SOURCE_ROOTS.readingAgentPrompts, stats.promptConstructionCount > 0),
    predicate('smoke.v38-report-passing', SOURCE_ROOTS.v38PromptBenchmarkReport, v38Report.passed),
    predicate('smoke.v38-rows-covered', SOURCE_ROOTS.v38PromptBenchmarkReport, v38Report.coverage.rowCount >= V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS.requiredV38BenchmarkRows),
    predicate('smoke.v38-fixtures-covered', SOURCE_ROOTS.v38PromptBenchmarkReport, v38Report.coverage.fixtureCount >= V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS.requiredFixtureCount),
    predicate('smoke.no-source-rewrite-boundary', SOURCE_ROOTS.notes, rows.every((item) => item.promptContentRewriteAllowedInV40 === false)),
    predicate('smoke.v41-worklist-present', SOURCE_ROOTS.roadmap, stats.v41WorkItemCount >= V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS.v41WorkItemCount),
    predicate('smoke.docs-bind-artifact', SOURCE_ROOTS.spec, readSource(repoRoot, SOURCE_ROOTS.spec).includes(V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_ARTIFACT_PATH)),
    predicate('smoke.package-script-bound', SOURCE_ROOTS.packageJson, readSource(repoRoot, SOURCE_ROOTS.packageJson).includes('check:v40-gate10')),
    predicate('smoke.gate-workflow-bound', SOURCE_ROOTS.gateWorkflow, readSource(repoRoot, SOURCE_ROOTS.gateWorkflow).includes('check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs')),
    predicate('smoke.canon-workflow-bound', SOURCE_ROOTS.canonWorkflow, readSource(repoRoot, SOURCE_ROOTS.canonWorkflow).includes('check-v40-gate10-prompt-benchmark-smoke-v41-readiness.mjs')),
  ];
}

export function buildV40PromptBenchmarkSmokeV41Readiness(input = {}) {
  const generatedAt = typeof input.generatedAt === 'string' ? input.generatedAt : '2026-05-25T00:00:00.000Z';
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const rows = V40_PROMPT_BENCHMARK_SMOKE_ROWS.map((item) => ({
    ...item,
    sourceRootsPresent: item.sourceRoots.every((sourceRoot) => sourceExists(repoRoot, sourceRoot)),
  }));
  const stats = sourceStats(repoRoot);
  const evidence = sourceEvidence(repoRoot);
  const v38Report = buildV38PromptBenchmarkReport({ generatedAt, repoRoot });
  const predicates = predicateResults(repoRoot, rows, stats, v38Report);
  const failedPredicateIds = predicates.filter((item) => !item.passed).map((item) => item.id);
  const missingSourceRoots = evidence.filter((item) => !item.exists).map((item) => item.sourcePath);
  const legacySourceRoots = evidence.filter((item) => item.legacy).map((item) => item.sourcePath);
  const failures = [];

  if (!v38Report.passed) failures.push('V38 prompt benchmark report is not passing.');
  if (failedPredicateIds.length) failures.push(`failed predicates: ${failedPredicateIds.join(', ')}`);
  if (missingSourceRoots.length) failures.push(`missing source roots: ${missingSourceRoots.join(', ')}`);
  if (legacySourceRoots.length) failures.push(`legacy source roots present: ${legacySourceRoots.join(', ')}`);

  const sourceSafety = {
    sourceSafeMetadataOnly: rows.every((item) => item.sourceSafeMetadataOnly),
    protectedSourceVisible: rows.some((item) => item.protectedSourceVisible),
    rawPromptTextSerialized: rows.some((item) => item.rawPromptTextSerialized),
    rawProviderResponseSerialized: rows.some((item) => item.rawProviderResponseSerialized),
    credentialsSerialized: rows.some((item) => item.credentialsSerialized),
    unpaidAssetPackSourceVisible: rows.some((item) => item.unpaidAssetPackSourceVisible),
    promptContentRewriteAllowedInV40: rows.some((item) => item.promptContentRewriteAllowedInV40),
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
  const coverage = {
    rowCount: rows.length,
    coveredRowCount: rows.filter((item) => item.sourceRootsPresent).length,
    expectedTotals: { ...V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS },
    commandIds: [...V40_PROMPT_BENCHMARK_SMOKE_COMMAND_IDS],
    promptPartFileCount: stats.promptPartFileCount,
    promptPartExportCount: stats.promptPartExportCount,
    promptConstructionCount: stats.promptConstructionCount,
    benchmarkDefinitionCount: stats.benchmarkDefinitionCount,
    benchmarkRunnerMethodCount: stats.benchmarkRunnerMethodCount,
    packageBenchmarkReportCommandPresent: stats.benchmarkReportCommandCount > 0,
    v38BenchmarkReportRoot: v38Report.artifactRoot,
    v38BenchmarkReportPassed: v38Report.passed,
    v38BenchmarkRowCount: v38Report.coverage.rowCount,
    v38BenchmarkFixtureCount: v38Report.coverage.fixtureCount,
    v38BenchmarkSourceSafeMetadataOnly: v38Report.coverage.sourceSafeMetadataOnly,
    sourceRootCount: evidence.length,
    missingSourceRoots,
    legacySourceRoots: legacySourceRoots.length > 0,
    failedPredicateIds,
    passedPredicateCount: predicates.filter((item) => item.passed).length,
    predicateCount: predicates.length,
    v41WorkItemIds: [...V40_PROMPT_BENCHMARK_SMOKE_V41_WORK_ITEM_IDS],
    v41WorkItemCount: V40_PROMPT_BENCHMARK_SMOKE_V41_WORK_ITEM_IDS.length,
  };
  const artifactRoot = `v40-prompt-benchmark-smoke-v41-readiness:${digest(
    JSON.stringify({
      rows: rows.map((item) => item.rowRoot),
      commands: coverage.commandIds,
      v38BenchmarkReportRoot: coverage.v38BenchmarkReportRoot,
      v41WorkItemIds: coverage.v41WorkItemIds,
      predicates: predicates.filter((item) => item.passed).map((item) => item.id).sort(),
    }),
  )}`;

  return {
    artifactId: 'v40-prompt-benchmark-smoke-v41-readiness',
    schemaId: V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_SCHEMA_ID,
    version: V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_VERSION,
    currentTarget: V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_CURRENT_TARGET,
    generatedAt,
    artifactPath: V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_ARTIFACT_PATH,
    sourceSafetyVerdict: V40_PROMPT_BENCHMARK_SMOKE_V41_READINESS_SOURCE_SAFETY_VERDICT,
    rows,
    sourceEvidence: evidence,
    sourceStats: stats,
    predicateResults: predicates,
    sourceSafety,
    coverage,
    failures,
    passed:
      failures.length === 0
      && rows.length === V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS.rowCount
      && coverage.coveredRowCount === rows.length
      && coverage.v38BenchmarkReportPassed
      && coverage.v38BenchmarkSourceSafeMetadataOnly
      && coverage.v38BenchmarkRowCount >= V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS.requiredV38BenchmarkRows
      && coverage.v38BenchmarkFixtureCount >= V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS.requiredFixtureCount
      && coverage.packageBenchmarkReportCommandPresent
      && coverage.v41WorkItemCount >= V40_PROMPT_BENCHMARK_SMOKE_EXPECTED_TOTALS.v41WorkItemCount
      && coverage.failedPredicateIds.length === 0
      && sourceSafety.sourceSafeMetadataOnly
      && sourceSafety.protectedSourceVisible === false
      && sourceSafety.rawPromptTextSerialized === false
      && sourceSafety.rawProviderResponseSerialized === false
      && sourceSafety.credentialsSerialized === false
      && sourceSafety.unpaidAssetPackSourceVisible === false
      && sourceSafety.promptContentRewriteAllowedInV40 === false,
    artifactRoot,
  };
}

export function listMissingV40PromptBenchmarkSmokeV41ReadinessSources(repoRoot = DEFAULT_REPO_ROOT) {
  return sourceEvidence(repoRoot)
    .filter((item) => !item.exists)
    .map((item) => item.sourcePath);
}
