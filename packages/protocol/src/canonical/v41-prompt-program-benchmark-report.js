// @ts-check

import crypto from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV38InferenceTelemetryDisclosureReport } from './inference-telemetry-disclosure-report.js';
import { buildV38PromptBenchmarkReport } from './prompt-benchmark-report.js';
import { buildV38PtrrFailsafeThricifiedStack } from './ptrr-failsafe-thricified-stack.js';
import { buildV38ReadFitsFindingSearchEmbeddings } from './read-fits-finding-search-embeddings.js';
import { buildV39OperationalTelemetryRepairReadback } from './v39-operational-telemetry-repair-readback.js';
import { buildV40PromptBenchmarkSmokeV41Readiness } from './v40-prompt-benchmark-smoke-v41-readiness.js';
import { buildV41ConversationToolInterfacePromptRewrite } from './v41-conversation-tool-interface-prompt-rewrite.js';
import { buildV41PromptPartPromptInventory } from './v41-promptpart-prompt-inventory.js';
import { buildV41ReadFitsFindingPromptHardening } from './v41-readfitsfinding-prompt-hardening.js';
import { buildV41ReadNeedPromptHardening } from './v41-readneed-prompt-hardening.js';
import { buildV41ReadingPromptBenchmarkBaselines } from './v41-reading-prompt-benchmark-baselines.js';
import { buildV41RegistryInterpolationContracts } from './v41-registry-interpolation-contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH =
  '.bitcode/v41-prompt-program-benchmark-report.json';
export const V41_PROMPT_PROGRAM_BENCHMARK_REPORT_SCHEMA_ID =
  'bitcode.v41.promptProgramBenchmarkReport.v1';
export const V41_PROMPT_PROGRAM_BENCHMARK_REPORT_VERSION = 'V41';
export const V41_PROMPT_PROGRAM_BENCHMARK_REPORT_CURRENT_TARGET = 'V40';
export const V41_PROMPT_PROGRAM_BENCHMARK_REPORT_SOURCE_SAFETY_VERDICT =
  'source-safe-prompt-program-benchmark-telemetry-metadata';

export const V41_PROMPT_PROGRAM_BENCHMARK_REPORT_METRIC_IDS = Object.freeze([
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
]);

export const V41_PROMPT_PROGRAM_BENCHMARK_REPORT_DISCLOSURE_TIERS = Object.freeze([
  'prompt_identity_source_safe',
  'promptpart_identity_source_safe',
  'prompt_registry_lineage_source_safe',
  'benchmark_fixture_id_source_safe',
  'benchmark_delta_score_source_safe',
  'telemetry_event_identity_source_safe',
  'failsafe_receipt_identity_source_safe',
  'thricified_generation_identity_source_safe',
  'parsed_output_shape_source_safe',
  'schema_verdict_source_safe',
  'repair_hook_identity_source_safe',
  'source_hash_source_safe',
  'raw_prompt_text_private',
  'raw_interpolated_prompt_private',
  'raw_provider_response_private',
  'protected_prompt_private',
  'protected_source_private',
  'private_context_private',
  'unpaid_assetpack_source_private',
  'wallet_private_material_private',
  'settlement_private_payload_private',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'settlement-private-payloads',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-prompt-text',
  'raw-interpolated-prompts',
  'raw-provider-responses',
  'private-context',
  'unpaid-assetpack-source',
]);

const SOURCE_ROOTS = Object.freeze({
  promptBenchmarkRunner: 'packages/prompts/src/benchmarking/runner.ts',
  promptBenchmarkTypes: 'packages/prompts/src/benchmarking/types.ts',
  promptBenchmarkReadme: 'packages/prompts/src/benchmarking/README.md',
  readingPipelineContract: 'packages/pipelines/asset-pack/src/reading-pipeline-contract.ts',
  readingObservability: 'packages/pipelines/asset-pack/src/reading-pipeline-observability.ts',
  readingOperationalTelemetry: 'packages/pipelines/asset-pack/src/reading-operational-telemetry-repair-readback.ts',
  readNeedRealInference: 'packages/pipelines/asset-pack/src/read-need.ts',
  depositorySearch: 'packages/pipelines/asset-pack/src/depository-search.ts',
  depositorySupplyIndex: 'packages/pipelines/asset-pack/src/depository-supply-index.ts',
  embeddingConfig: 'packages/pipelines/asset-pack/src/embedding-config.ts',
  readFitsRuntime: 'packages/pipelines/asset-pack/src/read-fits-finding-runtime.ts',
  conversationStreamEvents: 'packages/api/src/conversations/stream-events.ts',
  conversationTelemetry: 'packages/api/src/conversations/telemetry.ts',
  pipelineLog: 'uapi/components/base/bitcode/execution/pipeline-execution-log.tsx',
  pipelineLogHeader: 'uapi/components/base/bitcode/execution/pipeline-execution-log-header.tsx',
  pipelineLogTest: 'uapi/tests/conversationStreamPipelineLog.test.tsx',
  pipelineLogHeaderTest: 'uapi/tests/pipelineExecutionLogHeader.test.tsx',
  v38PromptBenchmarkSource: 'packages/protocol/src/canonical/prompt-benchmark-report.js',
  v38PromptBenchmarkArtifact: '.bitcode/v38-prompt-benchmark-report.json',
  v38InferenceTelemetrySource: 'packages/protocol/src/canonical/inference-telemetry-disclosure-report.js',
  v38InferenceTelemetryArtifact: '.bitcode/v38-disclosure-boundary-report.json',
  v38PtrrStackSource: 'packages/protocol/src/canonical/ptrr-failsafe-thricified-stack.js',
  v38ReadFitsSearchEmbeddingsSource: 'packages/protocol/src/canonical/read-fits-finding-search-embeddings.js',
  v39OperationalTelemetrySource: 'packages/protocol/src/canonical/v39-operational-telemetry-repair-readback.js',
  v39OperationalTelemetryArtifact: '.bitcode/v39-operational-telemetry-repair-readback.json',
  v40PromptBenchmarkSmokeSource: 'packages/protocol/src/canonical/v40-prompt-benchmark-smoke-v41-readiness.js',
  v40PromptBenchmarkSmokeArtifact: '.bitcode/v40-prompt-benchmark-smoke-v41-readiness.json',
  gate2InventorySource: 'packages/protocol/src/canonical/v41-promptpart-prompt-inventory.js',
  gate2InventoryArtifact: '.bitcode/v41-promptpart-prompt-inventory.json',
  gate3ContractsSource: 'packages/protocol/src/canonical/v41-registry-interpolation-contracts.js',
  gate3ContractsArtifact: '.bitcode/v41-registry-interpolation-contracts.json',
  gate4BaselinesSource: 'packages/protocol/src/canonical/v41-reading-prompt-benchmark-baselines.js',
  gate4BaselinesArtifact: '.bitcode/v41-reading-prompt-benchmark-baselines.json',
  gate5ReadNeedSource: 'packages/protocol/src/canonical/v41-readneed-prompt-hardening.js',
  gate5ReadNeedArtifact: '.bitcode/v41-readneed-prompt-hardening.json',
  gate6ReadFitsSource: 'packages/protocol/src/canonical/v41-readfitsfinding-prompt-hardening.js',
  gate6ReadFitsArtifact: '.bitcode/v41-readfitsfinding-prompt-hardening.json',
  gate7ConversationSource: 'packages/protocol/src/canonical/v41-conversation-tool-interface-prompt-rewrite.js',
  gate7ConversationArtifact: '.bitcode/v41-conversation-tool-interface-prompt-rewrite.json',
  packageSource: 'packages/protocol/src/canonical/v41-prompt-program-benchmark-report.js',
  packageTest: 'packages/protocol/test/v41-prompt-program-benchmark-report.test.js',
  generator: 'scripts/generate-v41-prompt-program-benchmark-report.mjs',
  checker: 'scripts/check-v41-gate8-prompt-program-benchmark-report.mjs',
  spec: 'BITCODE_SPEC_V41.md',
  delta: 'BITCODE_SPEC_V41_DELTA.md',
  notes: 'BITCODE_SPEC_V41_NOTES.md',
  parity: 'BITCODE_SPEC_V41_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'packages/protocol/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function artifactRoot(input) {
  return `v41-prompt-program-benchmark-report:${digest(input)}`;
}

function rowRoot(input) {
  return `v41-prompt-program-benchmark-report-row:${digest(input)}`;
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
  const stat = statSync(absolutePath);
  if (stat.isFile()) return [sourcePath];
  if (!stat.isDirectory()) return [];

  const files = [];
  const walk = (currentAbsolute, currentRelative) => {
    const entries = readdirSync(currentAbsolute, { withFileTypes: true });
    const entryNames = new Set(entries.map((entry) => entry.name));
    for (const entry of entries) {
      if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name === '_legacy') continue;
      const nextAbsolute = path.join(currentAbsolute, entry.name);
      const nextRelative = path.join(currentRelative, entry.name);
      if (entry.isDirectory()) {
        walk(nextAbsolute, nextRelative);
        continue;
      }
      if (entry.name.endsWith('.js') && entryNames.has(`${entry.name.slice(0, -3)}.ts`)) continue;
      if (/\.(?:ts|tsx|js|mjs|md|json|yml)$/u.test(entry.name) && !/\.d\.ts$/u.test(entry.name)) {
        files.push(nextRelative);
      }
    }
  };
  walk(absolutePath, sourcePath);
  return files.sort();
}

function sourceHash(repoRoot, sourcePath) {
  const files = listFiles(repoRoot, sourcePath);
  const input = files.map((file) => `${file}:${digest(readSource(repoRoot, file))}`).join('|');
  return digest(input);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function predicate(id, rowId, sourcePath, passed) {
  return { id, rowId, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.reportRowId),
    benchmarkReportMode: 'post-rewrite-source-safe-metadata',
    sourceSafetyClass: 'source_safe_prompt_program_benchmark_telemetry_metadata',
    sourceSafeMetadataOnly: true,
    disclosureTiers: [...V41_PROMPT_PROGRAM_BENCHMARK_REPORT_DISCLOSURE_TIERS],
    rawPromptTextSerialized: false,
    rawInterpolatedPromptSerialized: false,
    rawProviderResponseSerialized: false,
    protectedPromptSerialized: false,
    protectedSourceVisible: false,
    privateContextSerialized: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ROWS = Object.freeze([
  row({
    reportRowId: 'post-rewrite-prompt-inventory-delta',
    label: 'Gate 2 prompt inventory deltas are re-bound after Reading and Conversation prompt rewrites',
    sourceRoots: [
      SOURCE_ROOTS.gate2InventorySource,
      SOURCE_ROOTS.gate2InventoryArtifact,
      SOURCE_ROOTS.gate5ReadNeedArtifact,
      SOURCE_ROOTS.gate6ReadFitsArtifact,
      SOURCE_ROOTS.gate7ConversationArtifact,
    ],
    promptProgramArtifactIds: [
      'v41-promptpart-prompt-inventory',
      'v41-readneed-prompt-hardening',
      'v41-readfitsfinding-prompt-hardening',
      'v41-conversation-tool-interface-prompt-rewrite',
    ],
    metricIds: ['post_rewrite_promptpart_delta', 'post_rewrite_prompt_delta', 'source_safe_benchmark_report_disclosure'],
    telemetryReceiptIds: ['promptpart_identity_source_safe', 'prompt_identity_source_safe'],
    requiredPredicateIds: [
      'gate2-inventory-passing',
      'gate5-readneed-passing',
      'gate6-readfitsfinding-passing',
      'gate7-conversation-interface-passing',
      'post-rewrite-artifacts-present',
      'post-rewrite-report-does-not-serialize-raw-prompt-text',
    ],
  }),
  row({
    reportRowId: 'readneed-post-rewrite-benchmark-delta',
    label: 'ReadNeedComprehensionSynthesis benchmark deltas bind prompt revisions to typed Need outputs',
    sourceRoots: [
      SOURCE_ROOTS.gate4BaselinesSource,
      SOURCE_ROOTS.gate4BaselinesArtifact,
      SOURCE_ROOTS.gate5ReadNeedSource,
      SOURCE_ROOTS.gate5ReadNeedArtifact,
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.readingObservability,
    ],
    promptProgramArtifactIds: [
      'v41-reading-prompt-benchmark-baselines',
      'v41-readneed-prompt-hardening',
    ],
    metricIds: [
      'benchmark_fixture_result_projection',
      'parsed_output_schema_verdict_projection',
      'prompt_lineage_registry_versioning',
    ],
    telemetryReceiptIds: ['ReadNeed', 'ReadNeedComprehensionSynthesisSchema', 'parsed_typed_output_shape_source_safe'],
    requiredPredicateIds: [
      'gate4-reading-benchmark-passing',
      'readneed-hardening-row-count',
      'readneed-benchmark-baselines-have-quality-scores',
      'readneed-observability-projects-parsed-output',
      'readneed-source-safe-metadata-only',
    ],
  }),
  row({
    reportRowId: 'readfitsfinding-post-rewrite-benchmark-delta',
    label: 'ReadFitsFindingSynthesis benchmark deltas bind many-candidate search, embeddings, and AssetPack preview metadata',
    sourceRoots: [
      SOURCE_ROOTS.gate4BaselinesSource,
      SOURCE_ROOTS.gate4BaselinesArtifact,
      SOURCE_ROOTS.gate6ReadFitsSource,
      SOURCE_ROOTS.gate6ReadFitsArtifact,
      SOURCE_ROOTS.v38ReadFitsSearchEmbeddingsSource,
      SOURCE_ROOTS.depositorySearch,
      SOURCE_ROOTS.embeddingConfig,
      SOURCE_ROOTS.readFitsRuntime,
    ],
    promptProgramArtifactIds: [
      'v41-reading-prompt-benchmark-baselines',
      'v41-readfitsfinding-prompt-hardening',
      'v38-read-fits-finding-search-embeddings',
    ],
    metricIds: [
      'benchmark_fixture_result_projection',
      'depository_search_embedding_query_projection',
      'parsed_output_schema_verdict_projection',
    ],
    telemetryReceiptIds: ['ReadFitsFindingSynthesis', 'CandidateFits', 'AssetPackPreviewBoundary'],
    requiredPredicateIds: [
      'readfitsfinding-hardening-passing',
      'readfitsfinding-has-many-candidate-search',
      'readfitsfinding-embedding-config-present',
      'readfitsfinding-search-embeddings-passing',
      'readfitsfinding-source-safe-preview-only',
    ],
  }),
  row({
    reportRowId: 'conversation-interface-post-rewrite-benchmark-delta',
    label: 'Conversation, tool-definition, MCP API, ChatGPT App, and Terminal prompt rewrites bind to benchmark metadata',
    sourceRoots: [
      SOURCE_ROOTS.gate7ConversationSource,
      SOURCE_ROOTS.gate7ConversationArtifact,
      SOURCE_ROOTS.conversationStreamEvents,
      SOURCE_ROOTS.conversationTelemetry,
      SOURCE_ROOTS.pipelineLog,
      SOURCE_ROOTS.pipelineLogHeader,
    ],
    promptProgramArtifactIds: ['v41-conversation-tool-interface-prompt-rewrite'],
    metricIds: [
      'benchmark_fixture_result_projection',
      'rich_stream_prompt_telemetry_projection',
      'source_safe_benchmark_report_disclosure',
    ],
    telemetryReceiptIds: ['ConversationStreamEvent', 'ConversationTelemetryProofHook', 'PipelineExecutionLog'],
    requiredPredicateIds: [
      'gate7-conversation-artifact-passing',
      'conversation-stream-template-id-only',
      'conversation-telemetry-redacts-protected-context',
      'pipeline-log-projects-prompt-result-disclosure',
      'conversation-interface-artifact-source-safe',
    ],
  }),
  row({
    reportRowId: 'registry-lineage-version-telemetry-binding',
    label: 'Prompt registry lineage and version metadata are projected as ids, roots, counts, and schema names',
    sourceRoots: [
      SOURCE_ROOTS.gate3ContractsSource,
      SOURCE_ROOTS.gate3ContractsArtifact,
      SOURCE_ROOTS.promptBenchmarkTypes,
      SOURCE_ROOTS.promptBenchmarkRunner,
      SOURCE_ROOTS.readingPipelineContract,
    ],
    promptProgramArtifactIds: ['v41-registry-interpolation-contracts', 'v38-prompt-benchmark-report'],
    metricIds: [
      'prompt_lineage_registry_versioning',
      'post_rewrite_promptpart_delta',
      'post_rewrite_prompt_delta',
    ],
    telemetryReceiptIds: ['PromptPartBenchmarkResult', 'PromptBenchmarkResult', 'RegistryInterpolationReceipt'],
    requiredPredicateIds: [
      'gate3-registry-contracts-passing',
      'benchmark-types-have-pbversion-and-quality-gates',
      'benchmark-runner-handles-promptpart-and-prompt',
      'registry-contracts-bind-hierarchy',
      'registry-lineage-source-safe',
    ],
  }),
  row({
    reportRowId: 'failsafe-thricified-inference-receipt-projection',
    label: 'PTRR steps, Failsafe sequences, ThricifiedGeneration calls, raw-output roots, and parsed outputs remain traceable',
    sourceRoots: [
      SOURCE_ROOTS.v38PtrrStackSource,
      SOURCE_ROOTS.v38InferenceTelemetrySource,
      SOURCE_ROOTS.v38InferenceTelemetryArtifact,
      SOURCE_ROOTS.readNeedRealInference,
      SOURCE_ROOTS.readingObservability,
    ],
    promptProgramArtifactIds: [
      'v38-ptrr-failsafe-thricified-stack',
      'v38-inference-telemetry-disclosure-report',
    ],
    metricIds: [
      'failsafe_thricified_receipt_projection',
      'parsed_output_schema_verdict_projection',
      'rich_stream_prompt_telemetry_projection',
    ],
    telemetryReceiptIds: [
      'pipeline_phase',
      'agent',
      'ptrr_step',
      'failsafe',
      'thricified_generation',
      'interpolated_prompt',
      'raw_response',
      'parsed_output',
      'schema_verdict',
    ],
    requiredPredicateIds: [
      'v38-ptrr-stack-passing',
      'v38-inference-telemetry-passing',
      'inference-telemetry-has-required-levels',
      'bounded-inference-records-raw-and-parsed',
      'observability-projects-generation-receipts',
      'failsafe-thricified-source-safe',
    ],
  }),
  row({
    reportRowId: 'rich-stream-source-safe-telemetry-projection',
    label: 'Rich execution-log streams expose prompt and result posture as source-safe metadata for live operator inspection',
    sourceRoots: [
      SOURCE_ROOTS.conversationStreamEvents,
      SOURCE_ROOTS.conversationTelemetry,
      SOURCE_ROOTS.readingObservability,
      SOURCE_ROOTS.readingOperationalTelemetry,
      SOURCE_ROOTS.pipelineLog,
      SOURCE_ROOTS.pipelineLogHeader,
      SOURCE_ROOTS.pipelineLogTest,
      SOURCE_ROOTS.pipelineLogHeaderTest,
    ],
    promptProgramArtifactIds: ['v38-inference-telemetry-disclosure-report', 'v39-operational-telemetry-repair-readback'],
    metricIds: [
      'rich_stream_prompt_telemetry_projection',
      'repair_hook_redaction_posture',
      'source_safe_benchmark_report_disclosure',
    ],
    telemetryReceiptIds: ['ReadingPipelineTelemetryProjection', 'ReadingOperationalTelemetryEvent', 'ConversationStreamEvent'],
    requiredPredicateIds: [
      'reading-operational-telemetry-passing',
      'stream-events-sanitize-metadata',
      'rich-log-header-renders-prompt-result-posture',
      'rich-log-tests-cover-telemetry-disclosure',
      'rich-stream-source-safe-only',
    ],
  }),
  row({
    reportRowId: 'repair-hooks-parsed-output-redaction-posture',
    label: 'Repair hooks and parsed output projections remain debuggable without leaking source, prompts, responses, or settlement payloads',
    sourceRoots: [
      SOURCE_ROOTS.readingOperationalTelemetry,
      SOURCE_ROOTS.v39OperationalTelemetrySource,
      SOURCE_ROOTS.v39OperationalTelemetryArtifact,
      SOURCE_ROOTS.readingObservability,
      SOURCE_ROOTS.conversationTelemetry,
    ],
    promptProgramArtifactIds: ['v39-operational-telemetry-repair-readback', 'v38-inference-telemetry-disclosure-report'],
    metricIds: [
      'repair_hook_redaction_posture',
      'parsed_output_schema_verdict_projection',
      'source_safe_benchmark_report_disclosure',
    ],
    telemetryReceiptIds: ['repair', 'schema_verdict', 'proof_roots_ids_counts_states_and_redacted_error_classes_only'],
    requiredPredicateIds: [
      'repair-hooks-present',
      'repair-readback-redacts-raw-prompts',
      'conversation-telemetry-redacts-secret-values',
      'parsed-output-shape-source-safe',
      'repair-hook-artifacts-source-safe',
    ],
  }),
  row({
    reportRowId: 'gate8-tests-docs-workflows',
    label: 'Gate 8 tests, scripts, docs, generated artifact, package exports, and workflows close benchmark telemetry integration',
    sourceRoots: [
      SOURCE_ROOTS.packageSource,
      SOURCE_ROOTS.packageTest,
      SOURCE_ROOTS.generator,
      SOURCE_ROOTS.checker,
      SOURCE_ROOTS.spec,
      SOURCE_ROOTS.delta,
      SOURCE_ROOTS.notes,
      SOURCE_ROOTS.parity,
      SOURCE_ROOTS.roadmap,
      SOURCE_ROOTS.readme,
      SOURCE_ROOTS.protocolReadme,
      SOURCE_ROOTS.packageJson,
      SOURCE_ROOTS.gateWorkflow,
      SOURCE_ROOTS.canonWorkflow,
    ],
    promptProgramArtifactIds: ['v41-prompt-program-benchmark-report'],
    metricIds: ['source_safe_benchmark_report_disclosure', 'repair_hook_redaction_posture'],
    telemetryReceiptIds: ['V41PromptProgramBenchmarkReportArtifact'],
    requiredPredicateIds: [
      'gate8-source-exists',
      'gate8-test-exists',
      'gate8-generator-exists',
      'gate8-checker-exists',
      'package-json-exposes-gate8-scripts',
      'workflows-run-gate8-checker',
      'spec-documents-gate8-closure',
      'roadmap-documents-gate8-closure',
      'readmes-document-gate8-helpers',
    ],
  }),
]);

function dependencyContext(generatedAt, repoRoot) {
  const v38PromptBenchmark = buildV38PromptBenchmarkReport({ generatedAt, repoRoot });
  const v38InferenceTelemetry = buildV38InferenceTelemetryDisclosureReport({ generatedAt, repoRoot });
  const v38PtrrStack = buildV38PtrrFailsafeThricifiedStack({ generatedAt, repoRoot });
  const v38ReadFitsSearchEmbeddings = buildV38ReadFitsFindingSearchEmbeddings({ generatedAt, repoRoot });
  const v39OperationalTelemetry = buildV39OperationalTelemetryRepairReadback({ generatedAt, repoRoot });
  const v40PromptBenchmarkSmoke = buildV40PromptBenchmarkSmokeV41Readiness({ generatedAt, repoRoot });
  const gate2Inventory = buildV41PromptPartPromptInventory({ generatedAt, repoRoot });
  const gate3Contracts = buildV41RegistryInterpolationContracts({ generatedAt, repoRoot });
  const gate4Baselines = buildV41ReadingPromptBenchmarkBaselines({ generatedAt, repoRoot });
  const gate5ReadNeed = buildV41ReadNeedPromptHardening({ generatedAt, repoRoot });
  const gate6ReadFits = buildV41ReadFitsFindingPromptHardening({ generatedAt, repoRoot });
  const gate7Conversation = buildV41ConversationToolInterfacePromptRewrite({ generatedAt, repoRoot });

  return {
    v38PromptBenchmark,
    v38InferenceTelemetry,
    v38PtrrStack,
    v38ReadFitsSearchEmbeddings,
    v39OperationalTelemetry,
    v40PromptBenchmarkSmoke,
    gate2Inventory,
    gate3Contracts,
    gate4Baselines,
    gate5ReadNeed,
    gate6ReadFits,
    gate7Conversation,
  };
}

function buildSourceEvidence(repoRoot, rows) {
  return unique(rows.flatMap((item) => item.sourceRoots)).map((sourcePath) => {
    const files = listFiles(repoRoot, sourcePath);
    return {
      sourcePath,
      exists: sourceExists(repoRoot, sourcePath),
      legacy: sourcePath.startsWith('_legacy/'),
      fileCount: files.length,
      sourceRootHash: files.length ? sourceHash(repoRoot, sourcePath) : null,
    };
  });
}

function sourceStatsByRow(repoRoot, rows) {
  return Object.fromEntries(
    rows.map((item) => {
      const files = unique(item.sourceRoots.flatMap((sourcePath) => listFiles(repoRoot, sourcePath)));
      return [
        item.reportRowId,
        {
          sourceRootCount: item.sourceRoots.length,
          sourceRootPresentCount: item.sourceRoots.filter((sourcePath) => sourceExists(repoRoot, sourcePath)).length,
          sourceFileCount: files.length,
          sourceFileHashes: Object.fromEntries(files.map((file) => [file, digest(readSource(repoRoot, file))])),
        },
      ];
    }),
  );
}

function buildPredicateResults(repoRoot, context) {
  const promptBenchmarkRunner = readSource(repoRoot, SOURCE_ROOTS.promptBenchmarkRunner);
  const promptBenchmarkTypes = readSource(repoRoot, SOURCE_ROOTS.promptBenchmarkTypes);
  const readingPipelineContract = readSource(repoRoot, SOURCE_ROOTS.readingPipelineContract);
  const readingObservability = readSource(repoRoot, SOURCE_ROOTS.readingObservability);
  const readingOperationalTelemetry = readSource(repoRoot, SOURCE_ROOTS.readingOperationalTelemetry);
  const readNeedRealInference = readSource(repoRoot, SOURCE_ROOTS.readNeedRealInference);
  const depositorySearch = readSource(repoRoot, SOURCE_ROOTS.depositorySearch);
  const embeddingConfig = readSource(repoRoot, SOURCE_ROOTS.embeddingConfig);
  const readFitsRuntime = readSource(repoRoot, SOURCE_ROOTS.readFitsRuntime);
  const conversationStreamEvents = readSource(repoRoot, SOURCE_ROOTS.conversationStreamEvents);
  const conversationTelemetry = readSource(repoRoot, SOURCE_ROOTS.conversationTelemetry);
  const pipelineLog = readSource(repoRoot, SOURCE_ROOTS.pipelineLog);
  const pipelineLogHeader = readSource(repoRoot, SOURCE_ROOTS.pipelineLogHeader);
  const pipelineLogTest = readSource(repoRoot, SOURCE_ROOTS.pipelineLogTest);
  const pipelineLogHeaderTest = readSource(repoRoot, SOURCE_ROOTS.pipelineLogHeaderTest);
  const gate3Contracts = readSource(repoRoot, SOURCE_ROOTS.gate3ContractsSource);
  const spec = readSource(repoRoot, SOURCE_ROOTS.spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const readme = readSource(repoRoot, SOURCE_ROOTS.readme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);

  return [
    predicate('gate2-inventory-passing', 'post-rewrite-prompt-inventory-delta', SOURCE_ROOTS.gate2InventoryArtifact, context.gate2Inventory.passed),
    predicate('gate5-readneed-passing', 'post-rewrite-prompt-inventory-delta', SOURCE_ROOTS.gate5ReadNeedArtifact, context.gate5ReadNeed.passed),
    predicate('gate6-readfitsfinding-passing', 'post-rewrite-prompt-inventory-delta', SOURCE_ROOTS.gate6ReadFitsArtifact, context.gate6ReadFits.passed),
    predicate('gate7-conversation-interface-passing', 'post-rewrite-prompt-inventory-delta', SOURCE_ROOTS.gate7ConversationArtifact, context.gate7Conversation.passed),
    predicate(
      'post-rewrite-artifacts-present',
      'post-rewrite-prompt-inventory-delta',
      '.bitcode',
      [
        SOURCE_ROOTS.gate2InventoryArtifact,
        SOURCE_ROOTS.gate5ReadNeedArtifact,
        SOURCE_ROOTS.gate6ReadFitsArtifact,
        SOURCE_ROOTS.gate7ConversationArtifact,
      ].every((sourcePath) => sourceExists(repoRoot, sourcePath)),
    ),
    predicate(
      'post-rewrite-report-does-not-serialize-raw-prompt-text',
      'post-rewrite-prompt-inventory-delta',
      'sourceSafety',
      V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ROWS.every((item) =>
        item.rawPromptTextSerialized === false
        && item.rawInterpolatedPromptSerialized === false
        && item.rawProviderResponseSerialized === false,
      ),
    ),
    predicate('gate4-reading-benchmark-passing', 'readneed-post-rewrite-benchmark-delta', SOURCE_ROOTS.gate4BaselinesArtifact, context.gate4Baselines.passed),
    predicate('readneed-hardening-row-count', 'readneed-post-rewrite-benchmark-delta', SOURCE_ROOTS.gate5ReadNeedArtifact, context.gate5ReadNeed.coverage?.rowCount >= 7),
    predicate(
      'readneed-benchmark-baselines-have-quality-scores',
      'readneed-post-rewrite-benchmark-delta',
      SOURCE_ROOTS.gate4BaselinesArtifact,
      context.gate4Baselines.coverage?.baselineScoreMinimum >= 0.8
        && context.gate4Baselines.coverage?.readNeedBaselineRowCount >= 3,
    ),
    predicate(
      'readneed-observability-projects-parsed-output',
      'readneed-post-rewrite-benchmark-delta',
      SOURCE_ROOTS.readingObservability,
      readingObservability.includes('parsedTypedOutputPresent') && readingObservability.includes('outputSchema'),
    ),
    predicate(
      'readneed-source-safe-metadata-only',
      'readneed-post-rewrite-benchmark-delta',
      'sourceSafety',
      context.gate5ReadNeed.sourceSafety?.sourceSafeMetadataOnly === true
        && context.gate5ReadNeed.sourceSafety?.rawPromptTextSerialized === false
        && context.gate5ReadNeed.sourceSafety?.rawProviderResponseSerialized === false,
    ),
    predicate('readfitsfinding-hardening-passing', 'readfitsfinding-post-rewrite-benchmark-delta', SOURCE_ROOTS.gate6ReadFitsArtifact, context.gate6ReadFits.passed),
    predicate(
      'readfitsfinding-has-many-candidate-search',
      'readfitsfinding-post-rewrite-benchmark-delta',
      SOURCE_ROOTS.depositorySearch,
      /candidate|rank|threshold/iu.test(depositorySearch) && readFitsRuntime.includes('candidate'),
    ),
    predicate(
      'readfitsfinding-embedding-config-present',
      'readfitsfinding-post-rewrite-benchmark-delta',
      SOURCE_ROOTS.embeddingConfig,
      /embedding/iu.test(embeddingConfig) && /vector|model|dimension/iu.test(embeddingConfig),
    ),
    predicate(
      'readfitsfinding-search-embeddings-passing',
      'readfitsfinding-post-rewrite-benchmark-delta',
      SOURCE_ROOTS.v38ReadFitsSearchEmbeddingsSource,
      context.v38ReadFitsSearchEmbeddings.passed,
    ),
    predicate(
      'readfitsfinding-source-safe-preview-only',
      'readfitsfinding-post-rewrite-benchmark-delta',
      'sourceSafety',
      context.gate6ReadFits.sourceSafety?.sourceSafeMetadataOnly === true
        && context.gate6ReadFits.sourceSafety?.unpaidAssetPackSourceVisible === false,
    ),
    predicate('gate7-conversation-artifact-passing', 'conversation-interface-post-rewrite-benchmark-delta', SOURCE_ROOTS.gate7ConversationArtifact, context.gate7Conversation.passed),
    predicate(
      'conversation-stream-template-id-only',
      'conversation-interface-post-rewrite-benchmark-delta',
      SOURCE_ROOTS.conversationStreamEvents,
      conversationStreamEvents.includes("promptDisclosurePosture: 'prompt_template_id_only'"),
    ),
    predicate(
      'conversation-telemetry-redacts-protected-context',
      'conversation-interface-post-rewrite-benchmark-delta',
      SOURCE_ROOTS.conversationTelemetry,
      conversationTelemetry.includes('PROTECTED_CONTEXT_RE') && conversationTelemetry.includes('SECRET_VALUE_PATTERNS'),
    ),
    predicate(
      'pipeline-log-projects-prompt-result-disclosure',
      'conversation-interface-post-rewrite-benchmark-delta',
      SOURCE_ROOTS.pipelineLog,
      pipelineLog.includes('promptDisclosurePosture') && pipelineLog.includes('resultDisclosurePosture'),
    ),
    predicate(
      'conversation-interface-artifact-source-safe',
      'conversation-interface-post-rewrite-benchmark-delta',
      'sourceSafety',
      context.gate7Conversation.sourceSafety?.sourceSafeMetadataOnly === true
        && context.gate7Conversation.sourceSafety?.rawPromptTextSerialized === false
        && context.gate7Conversation.sourceSafety?.rawProviderResponseSerialized === false,
    ),
    predicate('gate3-registry-contracts-passing', 'registry-lineage-version-telemetry-binding', SOURCE_ROOTS.gate3ContractsArtifact, context.gate3Contracts.passed),
    predicate(
      'benchmark-types-have-pbversion-and-quality-gates',
      'registry-lineage-version-telemetry-binding',
      SOURCE_ROOTS.promptBenchmarkTypes,
      promptBenchmarkTypes.includes('PBVersion') && promptBenchmarkTypes.includes('QualityGates') && promptBenchmarkTypes.includes('PromptBenchmarkResult'),
    ),
    predicate(
      'benchmark-runner-handles-promptpart-and-prompt',
      'registry-lineage-version-telemetry-binding',
      SOURCE_ROOTS.promptBenchmarkRunner,
      promptBenchmarkRunner.includes('benchmarkPromptPart') && promptBenchmarkRunner.includes('benchmarkPrompt('),
    ),
    predicate(
      'registry-contracts-bind-hierarchy',
      'registry-lineage-version-telemetry-binding',
      SOURCE_ROOTS.gate3ContractsSource,
      gate3Contracts.includes('registry-lineage') || (gate3Contracts.includes('hierarchy') && gate3Contracts.includes('interpolation')),
    ),
    predicate(
      'registry-lineage-source-safe',
      'registry-lineage-version-telemetry-binding',
      'sourceSafety',
      context.gate3Contracts.sourceSafety?.sourceSafeMetadataOnly === true
        && context.v38PromptBenchmark.coverage?.sourceSafeMetadataOnly === true,
    ),
    predicate('v38-ptrr-stack-passing', 'failsafe-thricified-inference-receipt-projection', SOURCE_ROOTS.v38PtrrStackSource, context.v38PtrrStack.passed),
    predicate('v38-inference-telemetry-passing', 'failsafe-thricified-inference-receipt-projection', SOURCE_ROOTS.v38InferenceTelemetryArtifact, context.v38InferenceTelemetry.passed),
    predicate(
      'inference-telemetry-has-required-levels',
      'failsafe-thricified-inference-receipt-projection',
      SOURCE_ROOTS.v38InferenceTelemetrySource,
      ['failsafe', 'thricified_generation', 'interpolated_prompt', 'raw_response', 'parsed_output', 'schema_verdict'].every((levelId) =>
        context.v38InferenceTelemetry.telemetryLevelIds.includes(levelId),
      ),
    ),
    predicate(
      'bounded-inference-records-raw-and-parsed',
      'failsafe-thricified-inference-receipt-projection',
      SOURCE_ROOTS.readNeedRealInference,
      readNeedRealInference.includes('rawResponse') && readNeedRealInference.includes('parsedTypedOutput'),
    ),
    predicate(
      'observability-projects-generation-receipts',
      'failsafe-thricified-inference-receipt-projection',
      SOURCE_ROOTS.readingObservability,
      readingObservability.includes('thinkingsGenerationId') && readingObservability.includes('generationPromptIds'),
    ),
    predicate(
      'failsafe-thricified-source-safe',
      'failsafe-thricified-inference-receipt-projection',
      'sourceSafety',
      context.v38InferenceTelemetry.coverage?.sourceSafeMetadataOnly === true
        && context.v38InferenceTelemetry.coverage?.rawProviderResponseVisible === false,
    ),
    predicate('reading-operational-telemetry-passing', 'rich-stream-source-safe-telemetry-projection', SOURCE_ROOTS.v39OperationalTelemetryArtifact, context.v39OperationalTelemetry.passed),
    predicate(
      'stream-events-sanitize-metadata',
      'rich-stream-source-safe-telemetry-projection',
      SOURCE_ROOTS.conversationStreamEvents,
      conversationStreamEvents.includes('sanitizeMetadata') && conversationStreamEvents.includes('rawPrompt') && conversationStreamEvents.includes('rawResponse'),
    ),
    predicate(
      'rich-log-header-renders-prompt-result-posture',
      'rich-stream-source-safe-telemetry-projection',
      SOURCE_ROOTS.pipelineLogHeader,
      pipelineLogHeader.includes('promptDisclosurePosture') && pipelineLogHeader.includes('resultDisclosurePosture') && pipelineLogHeader.includes('failClosedState'),
    ),
    predicate(
      'rich-log-tests-cover-telemetry-disclosure',
      'rich-stream-source-safe-telemetry-projection',
      `${SOURCE_ROOTS.pipelineLogTest},${SOURCE_ROOTS.pipelineLogHeaderTest}`,
      pipelineLogTest.includes('prompt_template_id_only') && pipelineLogHeaderTest.includes('parsed_result_shape'),
    ),
    predicate(
      'rich-stream-source-safe-only',
      'rich-stream-source-safe-telemetry-projection',
      'sourceSafety',
      context.v39OperationalTelemetry.coverage?.sourceSafeMetadataOnly === true
        && context.gate7Conversation.sourceSafety?.sourceSafeMetadataOnly === true,
    ),
    predicate(
      'repair-hooks-present',
      'repair-hooks-parsed-output-redaction-posture',
      SOURCE_ROOTS.readingOperationalTelemetry,
      readingOperationalTelemetry.includes('ReadingOperationalRepairRunbookHook') && readingOperationalTelemetry.includes('repairActions'),
    ),
    predicate(
      'repair-readback-redacts-raw-prompts',
      'repair-hooks-parsed-output-redaction-posture',
      SOURCE_ROOTS.readingOperationalTelemetry,
      readingOperationalTelemetry.includes('rawProtectedPromptVisible: false')
        && readingOperationalTelemetry.includes('rawProviderResponseVisible: false')
        && readingOperationalTelemetry.includes('rawInterpolatedPromptVisible: false'),
    ),
    predicate(
      'conversation-telemetry-redacts-secret-values',
      'repair-hooks-parsed-output-redaction-posture',
      SOURCE_ROOTS.conversationTelemetry,
      conversationTelemetry.includes('redactPemPrivateKeyBlocks') && conversationTelemetry.includes('SECRET_VALUE_PATTERNS'),
    ),
    predicate(
      'parsed-output-shape-source-safe',
      'repair-hooks-parsed-output-redaction-posture',
      SOURCE_ROOTS.readingObservability,
      readingObservability.includes('parsedTypedOutputPresent') && readingObservability.includes('outputSchema'),
    ),
    predicate(
      'repair-hook-artifacts-source-safe',
      'repair-hooks-parsed-output-redaction-posture',
      'sourceSafety',
      context.v39OperationalTelemetry.coverage?.rawProviderResponseVisible === false
        && context.v39OperationalTelemetry.coverage?.rawInterpolatedPromptVisible === false
        && context.v39OperationalTelemetry.coverage?.credentialsSerialized === false,
    ),
    predicate('gate8-source-exists', 'gate8-tests-docs-workflows', SOURCE_ROOTS.packageSource, sourceExists(repoRoot, SOURCE_ROOTS.packageSource)),
    predicate('gate8-test-exists', 'gate8-tests-docs-workflows', SOURCE_ROOTS.packageTest, sourceExists(repoRoot, SOURCE_ROOTS.packageTest)),
    predicate('gate8-generator-exists', 'gate8-tests-docs-workflows', SOURCE_ROOTS.generator, sourceExists(repoRoot, SOURCE_ROOTS.generator)),
    predicate('gate8-checker-exists', 'gate8-tests-docs-workflows', SOURCE_ROOTS.checker, sourceExists(repoRoot, SOURCE_ROOTS.checker)),
    predicate(
      'package-json-exposes-gate8-scripts',
      'gate8-tests-docs-workflows',
      SOURCE_ROOTS.packageJson,
      packageJson.includes('generate:v41-prompt-program-benchmark-report')
        && packageJson.includes('check:v41-prompt-program-benchmark-report')
        && packageJson.includes('check:v41-gate8'),
    ),
    predicate(
      'workflows-run-gate8-checker',
      'gate8-tests-docs-workflows',
      `${SOURCE_ROOTS.gateWorkflow},${SOURCE_ROOTS.canonWorkflow}`,
      gateWorkflow.includes('check-v41-gate8-prompt-program-benchmark-report.mjs')
        && canonWorkflow.includes('check-v41-gate8-prompt-program-benchmark-report.mjs'),
    ),
    predicate(
      'spec-documents-gate8-closure',
      'gate8-tests-docs-workflows',
      SOURCE_ROOTS.spec,
      spec.includes('V41 Gate 8 Prompt Benchmark Report And Telemetry Integration')
        && spec.includes(V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH)
        && delta.includes('Gate 8')
        && notes.includes('Gate 8 implementation notes')
        && parity.includes('Prompt benchmark report and telemetry artifact'),
    ),
    predicate(
      'roadmap-documents-gate8-closure',
      'gate8-tests-docs-workflows',
      SOURCE_ROOTS.roadmap,
      roadmap.includes('V41 Gate 8 closure anchor')
        && ((/Current working gate: V41 Gate (?:8|9)/u.test(roadmap)
          && (roadmap.includes('Next queued gate after V41 Gate 8') || roadmap.includes('V41 Gate 9 closure anchor')))
          || /Latest closed version: V41 Prompt And PromptPart Excellence/u.test(roadmap)
          || /Recent V41 closure anchor/u.test(roadmap)),
    ),
    predicate(
      'readmes-document-gate8-helpers',
      'gate8-tests-docs-workflows',
      `${SOURCE_ROOTS.readme},${SOURCE_ROOTS.protocolReadme}`,
      readme.includes('V41 Gate 8') && protocolReadme.includes('V41PromptProgramBenchmarkReport'),
    ),
  ];
}

function enrichRows(rows, sourceStats, predicateResults) {
  return rows.map((item) => {
    const rowPredicates = predicateResults.filter((result) => result.rowId === item.reportRowId);
    return {
      ...item,
      sourceStats: sourceStats[item.reportRowId],
      requiredPredicateCount: rowPredicates.length,
      passedPredicateCount: rowPredicates.filter((result) => result.passed).length,
      failedPredicateIds: rowPredicates.filter((result) => !result.passed).map((result) => result.id),
      passed: rowPredicates.length === item.requiredPredicateIds.length
        && rowPredicates.every((result) => result.passed)
        && sourceStats[item.reportRowId].sourceRootPresentCount === sourceStats[item.reportRowId].sourceRootCount,
    };
  });
}

function dependencyRoots(context) {
  return {
    v38PromptBenchmarkReportRoot: context.v38PromptBenchmark.artifactRoot,
    v38InferenceTelemetryDisclosureRoot: context.v38InferenceTelemetry.artifactRoot,
    v38PtrrFailsafeThricifiedStackRoot: context.v38PtrrStack.artifactRoot,
    v38ReadFitsFindingSearchEmbeddingsRoot: context.v38ReadFitsSearchEmbeddings.artifactRoot,
    v39OperationalTelemetryRepairReadbackRoot: context.v39OperationalTelemetry.artifactRoot,
    v40PromptBenchmarkSmokeRoot: context.v40PromptBenchmarkSmoke.artifactRoot,
    gate2InventoryRoot: context.gate2Inventory.artifactRoot,
    gate3RegistryInterpolationRoot: context.gate3Contracts.artifactRoot,
    gate4ReadingPromptBenchmarkBaselineRoot: context.gate4Baselines.artifactRoot,
    gate5ReadNeedPromptHardeningRoot: context.gate5ReadNeed.artifactRoot,
    gate6ReadFitsFindingPromptHardeningRoot: context.gate6ReadFits.artifactRoot,
    gate7ConversationToolInterfacePromptRewriteRoot: context.gate7Conversation.artifactRoot,
  };
}

export function buildV41PromptProgramBenchmarkReport(input = {}) {
  const generatedAt = typeof input.generatedAt === 'string' ? input.generatedAt : '2026-05-26T00:00:00.000Z';
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const context = dependencyContext(generatedAt, repoRoot);
  const sourceEvidence = buildSourceEvidence(repoRoot, V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ROWS);
  const sourceStats = sourceStatsByRow(repoRoot, V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ROWS);
  const sourcePredicateResults = buildPredicateResults(repoRoot, context);
  const rows = enrichRows(V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ROWS, sourceStats, sourcePredicateResults);
  const failedPredicateIds = sourcePredicateResults.filter((result) => !result.passed).map((result) => result.id);
  const missingSourceRoots = sourceEvidence.filter((entry) => !entry.exists).map((entry) => entry.sourcePath);
  const legacySourceRoots = sourceEvidence.filter((entry) => entry.legacy).map((entry) => entry.sourcePath);
  const promptProgramArtifactIds = unique(rows.flatMap((item) => item.promptProgramArtifactIds));
  const metricIds = unique(rows.flatMap((item) => item.metricIds));
  const telemetryReceiptIds = unique(rows.flatMap((item) => item.telemetryReceiptIds));
  const dependencyRootValues = dependencyRoots(context);

  const dependenciesPassing = Object.entries(context).every(([, artifact]) => artifact.passed === true);
  const sourceSafeMetadataOnly = rows.every((item) =>
    item.sourceSafeMetadataOnly === true
    && item.rawPromptTextSerialized === false
    && item.rawInterpolatedPromptSerialized === false
    && item.rawProviderResponseSerialized === false
    && item.protectedPromptSerialized === false
    && item.protectedSourceVisible === false
    && item.privateContextSerialized === false
    && item.credentialsSerialized === false
    && item.unpaidAssetPackSourceVisible === false
    && item.walletPrivateMaterialVisible === false
    && item.settlementPrivatePayloadVisible === false,
  );

  const failures = [];
  if (!dependenciesPassing) failures.push('One or more dependency prompt benchmark or telemetry artifacts are not passing.');
  if (failedPredicateIds.length) failures.push(`failed Gate 8 predicates: ${failedPredicateIds.join(', ')}`);
  if (missingSourceRoots.length) failures.push(`missing source roots: ${missingSourceRoots.join(', ')}`);
  if (legacySourceRoots.length) failures.push(`legacy source roots present: ${legacySourceRoots.join(', ')}`);
  if (!sourceSafeMetadataOnly) failures.push('Gate 8 rows are not source-safe metadata only.');

  const coverage = {
    rowCount: rows.length,
    metricIds,
    metricCount: metricIds.length,
    promptProgramArtifactIds,
    promptProgramArtifactCount: promptProgramArtifactIds.length,
    telemetryReceiptIds,
    telemetryReceiptCount: telemetryReceiptIds.length,
    sourceRootCount: sourceEvidence.length,
    sourceRootPresentCount: sourceEvidence.filter((entry) => entry.exists).length,
    missingSourceRoots,
    legacySourceRoots: legacySourceRoots.length > 0,
    requiredPredicateCount: sourcePredicateResults.length,
    passedPredicateCount: sourcePredicateResults.filter((result) => result.passed).length,
    failedPredicateIds,
    passingRowCount: rows.filter((item) => item.passed).length,
    failingRowIds: rows.filter((item) => !item.passed).map((item) => item.reportRowId),
    sourceSafeMetadataOnly,
    dependenciesPassing,
    dependencyRoots: dependencyRootValues,
    v38PromptBenchmarkRowCount: context.v38PromptBenchmark.coverage?.rowCount ?? 0,
    v38InferenceTelemetryLevelCount: context.v38InferenceTelemetry.coverage?.requiredTelemetryLevelCount ?? 0,
    v41PromptInventoryRowCount: context.gate2Inventory.coverage?.rowCount ?? 0,
    v41ReadingBenchmarkBaselineRowCount: context.gate4Baselines.coverage?.rowCount ?? 0,
    v41ReadNeedHardeningRowCount: context.gate5ReadNeed.coverage?.rowCount ?? 0,
    v41ReadFitsFindingHardeningRowCount: context.gate6ReadFits.coverage?.rowCount ?? 0,
    v41ConversationToolInterfaceRowCount: context.gate7Conversation.coverage?.rowCount ?? 0,
  };

  const sourceSafety = {
    sourceSafetyClass: 'source_safe_prompt_program_benchmark_telemetry_metadata',
    sourceSafeMetadataOnly,
    rawPromptTextSerialized: false,
    rawInterpolatedPromptSerialized: false,
    rawProviderResponseSerialized: false,
    protectedPromptSerialized: false,
    protectedSourceVisible: false,
    privateContextSerialized: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };

  const root = artifactRoot(
    JSON.stringify({
      rows: rows.map((item) => item.rowRoot),
      metrics: metricIds,
      receipts: telemetryReceiptIds,
      predicates: sourcePredicateResults.filter((result) => result.passed).map((result) => result.id),
      roots: dependencyRootValues,
    }),
  );

  return {
    artifactId: 'v41-prompt-program-benchmark-report',
    schemaId: V41_PROMPT_PROGRAM_BENCHMARK_REPORT_SCHEMA_ID,
    version: V41_PROMPT_PROGRAM_BENCHMARK_REPORT_VERSION,
    currentTarget: V41_PROMPT_PROGRAM_BENCHMARK_REPORT_CURRENT_TARGET,
    generatedAt,
    artifactPath: V41_PROMPT_PROGRAM_BENCHMARK_REPORT_ARTIFACT_PATH,
    artifactRoot: root,
    sourceSafetyVerdict: V41_PROMPT_PROGRAM_BENCHMARK_REPORT_SOURCE_SAFETY_VERDICT,
    metricIds: [...V41_PROMPT_PROGRAM_BENCHMARK_REPORT_METRIC_IDS],
    disclosureTiers: [...V41_PROMPT_PROGRAM_BENCHMARK_REPORT_DISCLOSURE_TIERS],
    rows,
    sourceEvidence,
    sourceStatsByRow: sourceStats,
    sourcePredicateResults,
    dependencyRoots: dependencyRootValues,
    sourceSafety,
    coverage,
    failures,
    passed:
      failures.length === 0
      && coverage.rowCount === 9
      && coverage.metricCount === V41_PROMPT_PROGRAM_BENCHMARK_REPORT_METRIC_IDS.length
      && coverage.promptProgramArtifactCount >= 10
      && coverage.telemetryReceiptCount >= 20
      && coverage.sourceRootPresentCount === coverage.sourceRootCount
      && coverage.passedPredicateCount === coverage.requiredPredicateCount
      && coverage.failingRowIds.length === 0
      && coverage.dependenciesPassing
      && coverage.sourceSafeMetadataOnly
      && coverage.legacySourceRoots === false
      && coverage.v38PromptBenchmarkRowCount >= 7
      && coverage.v38InferenceTelemetryLevelCount >= 13
      && coverage.v41ReadingBenchmarkBaselineRowCount >= 10
      && coverage.v41ReadNeedHardeningRowCount >= 7
      && coverage.v41ReadFitsFindingHardeningRowCount >= 8
      && coverage.v41ConversationToolInterfaceRowCount >= 9,
  };
}
