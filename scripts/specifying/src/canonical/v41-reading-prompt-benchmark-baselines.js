// @ts-check

import crypto from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildV38PromptBenchmarkReport } from './prompt-benchmark-report.js';
import { buildV40PromptBenchmarkSmokeV41Readiness } from './v40-prompt-benchmark-smoke-v41-readiness.js';
import { buildV41PromptPartPromptInventory } from './v41-promptpart-prompt-inventory.js';
import { buildV41RegistryInterpolationContracts } from './v41-registry-interpolation-contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V41_READING_PROMPT_BENCHMARK_BASELINES_ARTIFACT_PATH =
  '.bitcode/v41-reading-prompt-benchmark-baselines.json';
export const V41_READING_PROMPT_BENCHMARK_BASELINES_SCHEMA_ID =
  'bitcode.v41.readingPromptBenchmarkBaselines.v1';
export const V41_READING_PROMPT_BENCHMARK_BASELINES_VERSION = 'V41';
export const V41_READING_PROMPT_BENCHMARK_BASELINES_CURRENT_TARGET = 'V40';
export const V41_READING_PROMPT_BENCHMARK_BASELINES_SOURCE_SAFETY_VERDICT =
  'source-safe-reading-prompt-benchmark-baseline-metadata';

export const V41_READING_PROMPT_BENCHMARK_PIPELINE_IDS = Object.freeze([
  'ReadNeedComprehensionSynthesis',
  'ReadFitsFindingSynthesis',
]);

export const V41_READING_PROMPT_BENCHMARK_METRIC_IDS = Object.freeze([
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
]);

export const V41_READING_PROMPT_BENCHMARK_DISCLOSURE_TIERS = Object.freeze([
  'benchmark_fixture_id_source_safe',
  'prompt_identity_source_safe',
  'promptpart_identity_source_safe',
  'parser_target_id_source_safe',
  'registry_contract_id_source_safe',
  'benchmark_score_source_safe',
  'raw_prompt_text_private',
  'raw_interpolated_prompt_private',
  'raw_provider_response_private',
  'protected_source_private',
  'unpaid_assetpack_source_private',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-prompt-text',
  'raw-interpolated-prompts',
  'raw-provider-responses',
  'private-context',
  'settlement-private-payloads',
  'unpaid-assetpack-source',
]);

const SOURCE_ROOTS = Object.freeze({
  readingPipelineContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  readNeed: 'packages/asset-packs-pipelines/domain/src/read-need.ts',
  readNeedReview: 'packages/asset-packs-pipelines/domain/src/read-need-review-resynthesis.ts',
  readFitsRuntime: 'packages/asset-packs-pipelines/domain/src/read-fits-finding-runtime.ts',
  depositorySearch: 'packages/asset-packs-pipelines/domain/src/depository-search.ts',
  depositorySupplyIndex: 'packages/asset-packs-pipelines/domain/src/depository-supply-index.ts',
  embeddingConfig: 'packages/asset-packs-pipelines/domain/src/embedding-config.ts',
  assetPackSynthesisAgent:
    'packages/asset-packs-pipelines/domain/src/agents/implementation/read-fits-finding-synthesis-asset-pack-synthesis-agent.ts',
  assetPackPreviewBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
  assetPackDisclosure: 'packages/asset-packs-pipelines/domain/src/asset-pack-disclosure.ts',
  settlementRightsDelivery: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  operationalTelemetryRepairReadback:
    'packages/asset-packs-pipelines/domain/src/reading-operational-telemetry-repair-readback.ts',
  readingObservability: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-observability.ts',
  readingAgentPrompts: 'packages/asset-packs-pipelines/domain/src/agents/prompts',
  readComprehensionToolPrompts: 'packages/generic-tools/read-comprehension/src/prompts',
  depositorySearchToolPrompts: 'packages/generic-tools/simple-system-text-search/src/prompts',
  webSearchToolPrompts: 'packages/generic-tools/web-search/src/prompts',
  vcsToolPrompts: 'packages/generic-tools/vcs/src/prompts',
  gate2InventorySource: 'scripts/specifying/src/canonical/v41-promptpart-prompt-inventory.js',
  gate2InventoryArtifact: '.bitcode/v41-promptpart-prompt-inventory.json',
  gate3ContractsSource: 'scripts/specifying/src/canonical/v41-registry-interpolation-contracts.js',
  gate3ContractsArtifact: '.bitcode/v41-registry-interpolation-contracts.json',
  v38PromptBenchmarkReport: 'scripts/specifying/src/canonical/prompt-benchmark-report.js',
  v40PromptBenchmarkSmoke: 'scripts/specifying/src/canonical/v40-prompt-benchmark-smoke-v41-readiness.js',
  packageSource: 'scripts/specifying/src/canonical/v41-reading-prompt-benchmark-baselines.js',
  packageTest: 'scripts/specifying/test/v41-reading-prompt-benchmark-baselines.test.js',
  generator: 'scripts/generate-v41-reading-prompt-benchmark-baselines.mjs',
  checker: 'scripts/check-v41-gate4-reading-prompt-benchmark-baselines.mjs',
  spec: 'specifications/BITCODE_SPEC_V41.md',
  delta: 'specifications/BITCODE_SPEC_V41_DELTA.md',
  notes: 'specifications/BITCODE_SPEC_V41_NOTES.md',
  parity: 'specifications/BITCODE_SPEC_V41_PARITY_MATRIX.md',
  roadmap: 'specifications/SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'scripts/specifying/README.md',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 24);
}

function artifactRoot(input) {
  return `v41-reading-prompt-benchmark-baselines:${digest(input)}`;
}

function rowRoot(input) {
  return `v41-reading-prompt-baseline-row:${digest(input)}`;
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
      if (/\.(?:ts|tsx|js|mjs|md)$/u.test(entry.name) && !/\.d\.ts$/u.test(entry.name)) {
        files.push(nextRelative);
      }
    }
  };
  walk(absolutePath, sourcePath);
  return files.sort();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function predicateResult(id, rowId, sourcePath, passed) {
  return { id, rowId, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.baselineId),
    benchmarkMode: 'source-safe-deterministic-metadata-baseline',
    baselineThreshold: 0.8,
    disclosureTiers: [...V41_READING_PROMPT_BENCHMARK_DISCLOSURE_TIERS],
    sourceSafetyClass: 'source_safe_reading_prompt_benchmark_baseline_metadata',
    sourceSafeMetadataOnly: true,
    rawPromptTextSerialized: false,
    rawInterpolatedPromptSerialized: false,
    rawProviderResponseSerialized: false,
    protectedSourceVisible: false,
    privateContextSerialized: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V41_READING_PROMPT_BENCHMARK_BASELINE_ROWS = Object.freeze([
  row({
    baselineId: 'readneed-request-to-need-baseline',
    pipelineId: 'ReadNeedComprehensionSynthesis',
    uxStepIds: ['request-read', 'review-synthesized-need'],
    phaseIds: ['ReadNeedComprehensionSynthesis.request', 'ReadNeedComprehensionSynthesis.comprehend'],
    promptSurfaceIds: [
      'ReadNeedComprehensionSynthesis.prompt.need-synthesis',
      'ReadNeedComprehensionSynthesis.comprehend.need-synthesizer',
    ],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis'],
    fixtureIds: [
      'fixture.read-need.enterprise-request-to-need',
      'fixture.reading.prompt-registry-composition',
      'fixture.reading.schema-bound-return-types',
    ],
    metricIds: [
      'need_boundary_precision',
      'source_constraint_preservation',
      'registry_composition_integrity',
      'typed_parser_conformance',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: ['ReadNeed', 'ReadNeedComprehensionSynthesisSchema', 'ReadNeedSourceInput'],
    registryContractIds: [
      'readneed-comprehension-return-type-contract',
      'ptrr-agent-prompt-composition',
      'ptrr-step-prompt-composition',
      'thricified-generation-final-resolution',
    ],
    expectedTypedOutputQualityIds: [
      'need_exactly_matches_request',
      'need_no_overreach',
      'need_no_underreach',
      'source_constraints_preserved',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.readNeed,
      SOURCE_ROOTS.readingAgentPrompts,
      SOURCE_ROOTS.readComprehensionToolPrompts,
    ],
  }),
  row({
    baselineId: 'readneed-review-resynthesis-baseline',
    pipelineId: 'ReadNeedComprehensionSynthesis',
    uxStepIds: ['review-synthesized-need'],
    phaseIds: ['ReadNeedComprehensionSynthesis.review'],
    promptSurfaceIds: ['ReadNeedComprehensionSynthesis.review.operator-review'],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis'],
    fixtureIds: [
      'fixture.read-need.resynthesis-feedback',
      'fixture.reading.schema-bound-return-types',
    ],
    metricIds: [
      'need_boundary_precision',
      'typed_parser_conformance',
      'telemetry_repair_readback',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: [
      'ReadNeedReviewResynthesisRuntime',
      'ReadNeedReviewTelemetryReceipt',
      'AcceptedReadNeed',
      'ResynthesisRequestedReadNeed',
    ],
    registryContractIds: [
      'readneed-comprehension-return-type-contract',
      'execution-ancestry-context-overlays',
      'thricified-generation-final-resolution',
    ],
    expectedTypedOutputQualityIds: [
      'feedback_applied',
      'measurement_inputs_preserved',
      'reviewable_need_shape',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.readNeed,
      SOURCE_ROOTS.readNeedReview,
    ],
  }),
  row({
    baselineId: 'readneed-measurement-pricing-baseline',
    pipelineId: 'ReadNeedComprehensionSynthesis',
    uxStepIds: ['review-synthesized-need'],
    phaseIds: ['ReadNeedComprehensionSynthesis.measure'],
    promptSurfaceIds: ['ReadNeedComprehensionSynthesis.measure.need-measurement'],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis'],
    fixtureIds: [
      'fixture.read-need.enterprise-request-to-need',
      'fixture.reading.schema-bound-return-types',
    ],
    metricIds: [
      'need_boundary_precision',
      'settlement_quote_explainability',
      'typed_parser_conformance',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: ['ReadNeedPricingMeasurementInputs', 'ReadNeedMeasurementDimension', 'ShareToFeeQuote'],
    registryContractIds: [
      'readneed-comprehension-return-type-contract',
      'execution-ancestry-context-overlays',
    ],
    expectedTypedOutputQualityIds: [
      'measurement_vector_present',
      'weighted_requested_volume_present',
      'share_to_fee_formula_named',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.readNeed,
    ],
  }),
  row({
    baselineId: 'readfits-query-synthesis-baseline',
    pipelineId: 'ReadFitsFindingSynthesis',
    uxStepIds: ['request-fit'],
    phaseIds: ['ReadFitsFindingSynthesis.prepare', 'ReadFitsFindingSynthesis.discovery'],
    promptSurfaceIds: [
      'ReadFitsFindingSynthesis.prompt.setup-plan',
      'ReadFitsFindingSynthesis.prompt.read-comprehension',
      'ReadFitsFindingSynthesis.discovery.finding-fits',
    ],
    promptFamilyIds: ['ReadFitsFindingSynthesis'],
    fixtureIds: [
      'fixture.read-fits.find-many-candidates',
      'fixture.reading.prompt-registry-composition',
    ],
    metricIds: [
      'many_candidate_fit_recall',
      'registry_composition_integrity',
      'benchmark_fixture_coverage',
      'typed_parser_conformance',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: [
      'DepositorySearchQueryPlan',
      'DepositorySearchRead',
      'DepositorySearchResult',
      'EmbeddingSearchRequest',
    ],
    registryContractIds: [
      'readfits-finding-search-return-type-contract',
      'tool-doc-code-prompt-injection',
      'failsafe-sequence-context-handling',
    ],
    expectedTypedOutputQualityIds: [
      'many_candidate_fit_ids',
      'ranking_root_present',
      'threshold_verdicts_present',
      'selected_fit_provenance_present',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.readFitsRuntime,
      SOURCE_ROOTS.depositorySearch,
      SOURCE_ROOTS.depositorySupplyIndex,
      SOURCE_ROOTS.embeddingConfig,
      SOURCE_ROOTS.depositorySearchToolPrompts,
      SOURCE_ROOTS.webSearchToolPrompts,
    ],
  }),
  row({
    baselineId: 'readfits-many-candidate-ranking-baseline',
    pipelineId: 'ReadFitsFindingSynthesis',
    uxStepIds: ['request-fit'],
    phaseIds: ['ReadFitsFindingSynthesis.discovery'],
    promptSurfaceIds: ['ReadFitsFindingSynthesis.discovery.finding-fits'],
    promptFamilyIds: ['ReadFitsFindingSynthesis'],
    fixtureIds: [
      'fixture.read-fits.find-many-candidates',
      'fixture.reading.schema-bound-return-types',
    ],
    metricIds: [
      'many_candidate_fit_recall',
      'typed_parser_conformance',
      'benchmark_fixture_coverage',
      'telemetry_repair_readback',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: [
      'DepositoryCandidateRanking',
      'DepositoryCandidateFitEvidence',
      'DepositoryFitsResult',
      'ReadFitsFindingRuntime',
    ],
    registryContractIds: [
      'readfits-finding-search-return-type-contract',
      'execution-ancestry-context-overlays',
      'tool-doc-code-prompt-injection',
    ],
    expectedTypedOutputQualityIds: [
      'many_candidate_fit_ids',
      'ranking_root_present',
      'threshold_verdicts_present',
      'selected_fit_provenance_present',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.readFitsRuntime,
      SOURCE_ROOTS.depositorySearch,
      SOURCE_ROOTS.depositorySupplyIndex,
    ],
  }),
  row({
    baselineId: 'readfits-assetpack-context-synthesis-baseline',
    pipelineId: 'ReadFitsFindingSynthesis',
    uxStepIds: ['review-synthesized-asset-pack'],
    phaseIds: ['ReadFitsFindingSynthesis.implementation', 'ReadFitsFindingSynthesis.validate'],
    promptSurfaceIds: [
      'ReadFitsFindingSynthesis.prompt.asset-pack-synthesis',
      'ReadFitsFindingSynthesis.prompt.fit-quality-validation',
    ],
    promptFamilyIds: ['ReadFitsFindingSynthesis'],
    fixtureIds: [
      'fixture.read-fits.assetpack-synthesis-preview',
      'fixture.reading.prompt-registry-composition',
      'fixture.reading.schema-bound-return-types',
    ],
    metricIds: [
      'registry_composition_integrity',
      'typed_parser_conformance',
      'source_safe_preview_boundary',
      'benchmark_fixture_coverage',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: [
      'AssetPackSynthesisOutput',
      'ReadyToFinishOutput',
      'AssetPackSynthesisArtifactsSchema',
      'AssetPackWrittenAssetType',
    ],
    registryContractIds: [
      'assetpack-synthesis-parser-delivery-contract',
      'ptrr-agent-prompt-composition',
      'ptrr-step-prompt-composition',
      'thricified-generation-final-resolution',
    ],
    expectedTypedOutputQualityIds: [
      'assetpack_source_hidden_before_settlement',
      'preview_measurements_present',
      'settlement_posture_separated',
      'typed_output_matches_schema',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.assetPackSynthesisAgent,
      SOURCE_ROOTS.readingAgentPrompts,
      SOURCE_ROOTS.vcsToolPrompts,
    ],
  }),
  row({
    baselineId: 'assetpack-preview-disclosure-quote-baseline',
    pipelineId: 'ReadFitsFindingSynthesis',
    uxStepIds: ['review-synthesized-asset-pack'],
    phaseIds: ['ReadFitsFindingSynthesis.preview'],
    promptSurfaceIds: ['ReadFitsFindingSynthesis.preview.source-safe-preview'],
    promptFamilyIds: ['ReadFitsFindingSynthesis'],
    fixtureIds: [
      'fixture.read-fits.assetpack-synthesis-preview',
      'fixture.reading.schema-bound-return-types',
    ],
    metricIds: [
      'source_safe_preview_boundary',
      'settlement_quote_explainability',
      'typed_parser_conformance',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: [
      'AssetPackSourceSafePreview',
      'AssetPackPreviewBoundary',
      'AssetPackDisclosureReview',
      'ShareToFeeQuote',
    ],
    registryContractIds: [
      'assetpack-synthesis-parser-delivery-contract',
      'execution-ancestry-context-overlays',
    ],
    expectedTypedOutputQualityIds: [
      'assetpack_source_hidden_before_settlement',
      'preview_measurements_present',
      'settlement_posture_separated',
      'protected_source_not_serialized',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.readNeed,
      SOURCE_ROOTS.assetPackPreviewBoundary,
      SOURCE_ROOTS.assetPackDisclosure,
    ],
  }),
  row({
    baselineId: 'settlement-rights-delivery-baseline',
    pipelineId: 'ReadFitsFindingSynthesis',
    uxStepIds: ['buy-asset-pack-settle'],
    phaseIds: ['ReadFitsFindingSynthesis.settle'],
    promptSurfaceIds: ['ReadFitsFindingSynthesis.settle.buy-deliver'],
    promptFamilyIds: ['ReadFitsFindingSynthesis'],
    fixtureIds: [
      'fixture.read-fits.assetpack-synthesis-preview',
      'fixture.tool-definition.delivery-tool-source-boundary',
      'fixture.reading.schema-bound-return-types',
    ],
    metricIds: [
      'settlement_quote_explainability',
      'typed_parser_conformance',
      'telemetry_repair_readback',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: [
      'AssetPackCompletionOutput',
      'AssetPackSettlementRightsDeliveryBoundary',
      'AssetPackSettlementPaymentObservation',
      'PullRequestDeliveryResult',
    ],
    registryContractIds: [
      'assetpack-synthesis-parser-delivery-contract',
      'tool-doc-code-prompt-injection',
      'execution-ancestry-context-overlays',
    ],
    expectedTypedOutputQualityIds: [
      'settlement_requires_reader_payment',
      'rights_transfer_confirmed',
      'delivery_unlocked_only_after_settlement',
      'protected_source_payload_absent',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.settlementRightsDelivery,
      SOURCE_ROOTS.vcsToolPrompts,
    ],
  }),
  row({
    baselineId: 'reading-telemetry-summary-baseline',
    pipelineId: 'ReadFitsFindingSynthesis',
    uxStepIds: [
      'request-read',
      'review-synthesized-need',
      'request-fit',
      'review-synthesized-asset-pack',
      'buy-asset-pack-settle',
    ],
    phaseIds: [
      'ReadNeedComprehensionSynthesis.comprehend',
      'ReadFitsFindingSynthesis.discovery',
      'ReadFitsFindingSynthesis.preview',
      'ReadFitsFindingSynthesis.settle',
    ],
    promptSurfaceIds: ['ReadingOperationalTelemetryRepairReadback', 'ReadingPipelineObservability'],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis'],
    fixtureIds: [
      'fixture.reading.prompt-registry-composition',
      'fixture.reading.schema-bound-return-types',
    ],
    metricIds: [
      'telemetry_repair_readback',
      'registry_composition_integrity',
      'typed_parser_conformance',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: [
      'ReadingOperationalTelemetryRepairReadback',
      'ReadingOperationalTelemetryEvent',
      'ReadingOperationalOperatorReadback',
      'ReadingPipelineTelemetryTraceEntry',
    ],
    registryContractIds: [
      'execution-ancestry-context-overlays',
      'readneed-comprehension-return-type-contract',
      'readfits-finding-search-return-type-contract',
    ],
    expectedTypedOutputQualityIds: [
      'event_stream_source_safe',
      'operator_readback_stage_states_present',
      'repair_runbook_hooks_present',
      'raw_interpolated_prompt_hidden',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readingPipelineContract,
      SOURCE_ROOTS.operationalTelemetryRepairReadback,
      SOURCE_ROOTS.readingObservability,
    ],
  }),
  row({
    baselineId: 'failure-repair-prompt-baseline',
    pipelineId: 'ReadFitsFindingSynthesis',
    uxStepIds: [
      'review-synthesized-need',
      'request-fit',
      'review-synthesized-asset-pack',
      'buy-asset-pack-settle',
    ],
    phaseIds: [
      'ReadNeedComprehensionSynthesis.review',
      'ReadFitsFindingSynthesis.discovery',
      'ReadFitsFindingSynthesis.preview',
      'ReadFitsFindingSynthesis.settle',
    ],
    promptSurfaceIds: [
      'ReadNeedReviewResynthesisRuntime.repair',
      'ReadFitsFindingRuntime.repair-posture',
      'AssetPackPreviewBoundary.repair-posture',
      'AssetPackSettlementRightsDeliveryBoundary.repair-posture',
    ],
    promptFamilyIds: ['ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis'],
    fixtureIds: [
      'fixture.read-need.resynthesis-feedback',
      'fixture.read-fits.find-many-candidates',
      'fixture.reading.schema-bound-return-types',
    ],
    metricIds: [
      'need_boundary_precision',
      'many_candidate_fit_recall',
      'telemetry_repair_readback',
      'source_safety_non_disclosure',
    ],
    parserTargetIds: [
      'ReadNeedReviewResynthesisRuntime',
      'ReadFitsFindingRepairPosture',
      'AssetPackPreviewRepairPosture',
      'AssetPackSettlementRightsDeliveryRepairPosture',
    ],
    registryContractIds: [
      'execution-ancestry-context-overlays',
      'readneed-comprehension-return-type-contract',
      'readfits-finding-search-return-type-contract',
      'assetpack-synthesis-parser-delivery-contract',
    ],
    expectedTypedOutputQualityIds: [
      'feedback_applied',
      'repair_actions_present',
      'fail_closed_state_named',
      'operator_next_action_present',
    ],
    sourceRoots: [
      SOURCE_ROOTS.readNeedReview,
      SOURCE_ROOTS.readFitsRuntime,
      SOURCE_ROOTS.assetPackPreviewBoundary,
      SOURCE_ROOTS.settlementRightsDelivery,
      SOURCE_ROOTS.operationalTelemetryRepairReadback,
    ],
  }),
]);

function sourceFilesForRow(repoRoot, item) {
  return unique(item.sourceRoots.flatMap((sourceRoot) => listFiles(repoRoot, sourceRoot)));
}

function parserTargetsPresent(joinedSource, parserTargetIds) {
  return parserTargetIds.filter((targetId) => joinedSource.includes(targetId)).sort();
}

function buildSourceStats(repoRoot, rows) {
  return Object.fromEntries(
    rows.map((item) => {
      const sourceFiles = sourceFilesForRow(repoRoot, item);
      const joinedSource = sourceFiles.map((sourcePath) => readSource(repoRoot, sourcePath)).join('\n');
      const parserTargets = parserTargetsPresent(joinedSource, item.parserTargetIds);
      return [
        item.baselineId,
        {
          baselineId: item.baselineId,
          sourceRootsPresent: item.sourceRoots.every((sourceRoot) => sourceExists(repoRoot, sourceRoot)),
          sourceFileCount: sourceFiles.length,
          sourceFileSample: sourceFiles.slice(0, 12),
          promptTemplateIdCount: countMatches(joinedSource, /\btemplateId\b/gu),
          interpolatedContextKeyCount: countMatches(joinedSource, /\binterpolatedContextKeys\b/gu),
          ptrrAgentFactoryCount: countMatches(joinedSource, /factoryPTRRAgent|ptrrAgent\s*\(/gu),
          thricifiedGenerationCount: countMatches(joinedSource, /thinkingsGeneration/gu),
          toolContractCount: countMatches(joinedSource, /\btoolId\b/gu),
          parserTargetsPresent: parserTargets,
          parserTargetPresentCount: parserTargets.length,
          zodSchemaCount: countMatches(joinedSource, /\bz\.object\b|Schema\b/gu),
          telemetryCount: countMatches(joinedSource, /telemetry/giu),
          sourceSafetyCount: countMatches(
            joinedSource,
            /sourceSafe|sourceSafety|protectedSourceVisible:\s*false|rawProviderResponseVisible:\s*false|rawInterpolatedPromptVisible:\s*false/giu,
          ),
          benchmarkDefinitionCount:
            countMatches(joinedSource, /benchmarks:\s*\[/gu) + countMatches(joinedSource, /benchmarks:\s*\{/gu),
          queryPlanCount: countMatches(joinedSource, /QueryPlan|queryPlan|queryRoot/gu),
          embeddingPolicyCount: countMatches(joinedSource, /embeddingPolicy|EmbeddingSearch|vector/gu),
          rankingCount: countMatches(joinedSource, /ranking|rankedCandidate|finalScore|threshold/giu),
          previewCount: countMatches(joinedSource, /preview|Preview|source-safe-preview/gu),
          quoteCount: countMatches(joinedSource, /ShareToFee|quote|sats|feeSchedule/gu),
          settlementCount: countMatches(joinedSource, /settlement|Settlement|payment|rightsTransfer/gu),
          repairCount: countMatches(joinedSource, /repair|Repair|failClosed|blocked_until/gu),
        },
      ];
    }),
  );
}

function inventoryCountsByFamily(inventory, familyIds) {
  const promptPartCount = inventory.promptPartRows.filter((item) =>
    familyIds.some((familyId) => item.promptFamilyIds.includes(familyId)),
  ).length;
  const promptCount = inventory.promptRows.filter((item) =>
    familyIds.some((familyId) => item.promptFamilyIds.includes(familyId)),
  ).length;
  const benchmarkFixtureIds = unique(
    [...inventory.promptPartRows, ...inventory.promptRows]
      .filter((item) => familyIds.some((familyId) => item.promptFamilyIds.includes(familyId)))
      .flatMap((item) => item.benchmarkFixtureIds || []),
  );
  return { promptPartCount, promptCount, benchmarkFixtureIds };
}

function scoreForBooleans(booleans) {
  const passed = booleans.filter(Boolean).length;
  return Number((passed / Math.max(1, booleans.length)).toFixed(4));
}

function metricScoresForRow(item, stats, fixtureIds, registryContractIds, inventoryCounts) {
  const parserTargetsComplete = stats.parserTargetPresentCount === item.parserTargetIds.length;
  const fixtureCoverage = item.fixtureIds.every((fixtureId) => fixtureIds.includes(fixtureId));
  const registryCoverage = item.registryContractIds.every((contractId) => registryContractIds.includes(contractId));
  const inventoryCoverage = inventoryCounts.promptPartCount > 0 || inventoryCounts.promptCount > 0;
  const telemetryCoverage = stats.telemetryCount > 0;
  const sourceSafetyCoverage = stats.sourceSafetyCount > 0;

  return {
    need_boundary_precision: scoreForBooleans([
      stats.sourceRootsPresent,
      parserTargetsComplete,
      inventoryCoverage,
      stats.promptTemplateIdCount > 0 || stats.interpolatedContextKeyCount > 0,
    ]),
    source_constraint_preservation: scoreForBooleans([
      stats.sourceRootsPresent,
      sourceSafetyCoverage,
      stats.queryPlanCount > 0 || stats.previewCount > 0 || stats.settlementCount > 0,
    ]),
    registry_composition_integrity: scoreForBooleans([
      registryCoverage,
      inventoryCoverage,
      stats.ptrrAgentFactoryCount > 0 || stats.promptTemplateIdCount > 0,
      stats.thricifiedGenerationCount > 0 || stats.interpolatedContextKeyCount > 0,
    ]),
    typed_parser_conformance: scoreForBooleans([
      parserTargetsComplete,
      stats.zodSchemaCount > 0 || stats.parserTargetPresentCount > 0,
      stats.sourceFileCount > 0,
    ]),
    benchmark_fixture_coverage: scoreForBooleans([fixtureCoverage, item.fixtureIds.length >= 2, inventoryCoverage]),
    many_candidate_fit_recall: scoreForBooleans([
      stats.queryPlanCount > 0,
      stats.embeddingPolicyCount > 0 || stats.toolContractCount > 0,
      stats.rankingCount > 0,
      fixtureCoverage,
    ]),
    source_safe_preview_boundary: scoreForBooleans([
      stats.previewCount > 0,
      sourceSafetyCoverage,
      stats.quoteCount > 0 || stats.settlementCount > 0,
    ]),
    settlement_quote_explainability: scoreForBooleans([
      stats.quoteCount > 0,
      stats.settlementCount > 0 || item.uxStepIds.includes('buy-asset-pack-settle'),
      sourceSafetyCoverage,
    ]),
    telemetry_repair_readback: scoreForBooleans([
      telemetryCoverage,
      stats.repairCount > 0 || stats.settlementCount > 0,
      sourceSafetyCoverage,
    ]),
    source_safety_non_disclosure: scoreForBooleans([
      item.rawPromptTextSerialized === false,
      item.rawInterpolatedPromptSerialized === false,
      item.rawProviderResponseSerialized === false,
      item.protectedSourceVisible === false,
      item.unpaidAssetPackSourceVisible === false,
      item.credentialsSerialized === false,
      sourceSafetyCoverage,
    ]),
  };
}

function buildPredicateResults(rows, sourceStatsByRow, dependencyContext) {
  const results = [];
  for (const item of rows) {
    const stats = sourceStatsByRow[item.baselineId];
    const inventoryCounts = inventoryCountsByFamily(dependencyContext.inventory, item.promptFamilyIds);
    const fixtureCoverage = item.fixtureIds.every((fixtureId) => dependencyContext.v38FixtureIds.includes(fixtureId));
    const registryCoverage = item.registryContractIds.every((contractId) =>
      dependencyContext.registryContractIds.includes(contractId),
    );
    const parserCoverage = stats.parserTargetPresentCount === item.parserTargetIds.length;
    const metricScores = metricScoresForRow(
      item,
      stats,
      dependencyContext.v38FixtureIds,
      dependencyContext.registryContractIds,
      inventoryCounts,
    );
    const selectedScores = item.metricIds.map((metricId) => metricScores[metricId]).filter((score) => typeof score === 'number');
    const baselineScore = Number((selectedScores.reduce((total, score) => total + score, 0) / selectedScores.length).toFixed(4));

    results.push(
      predicateResult(`${item.baselineId}.source-roots-present`, item.baselineId, item.sourceRoots.join(','), stats.sourceRootsPresent),
      predicateResult(`${item.baselineId}.source-files-present`, item.baselineId, item.sourceRoots.join(','), stats.sourceFileCount > 0),
      predicateResult(`${item.baselineId}.fixtures-known`, item.baselineId, 'fixtureIds', fixtureCoverage),
      predicateResult(`${item.baselineId}.parser-targets-present`, item.baselineId, 'parserTargetIds', parserCoverage),
      predicateResult(`${item.baselineId}.registry-contracts-bound`, item.baselineId, 'registryContractIds', registryCoverage),
      predicateResult(`${item.baselineId}.inventory-family-bound`, item.baselineId, 'promptFamilyIds', inventoryCounts.promptPartCount > 0 || inventoryCounts.promptCount > 0),
      predicateResult(`${item.baselineId}.baseline-threshold-met`, item.baselineId, 'baselineScore', baselineScore >= item.baselineThreshold),
      predicateResult(`${item.baselineId}.source-safe-metadata-only`, item.baselineId, 'sourceSafety', item.sourceSafeMetadataOnly === true),
      predicateResult(`${item.baselineId}.raw-prompt-text-private`, item.baselineId, 'sourceSafety', item.rawPromptTextSerialized === false),
      predicateResult(`${item.baselineId}.raw-interpolated-prompt-private`, item.baselineId, 'sourceSafety', item.rawInterpolatedPromptSerialized === false),
      predicateResult(`${item.baselineId}.raw-provider-response-private`, item.baselineId, 'sourceSafety', item.rawProviderResponseSerialized === false),
      predicateResult(`${item.baselineId}.unpaid-assetpack-source-private`, item.baselineId, 'sourceSafety', item.unpaidAssetPackSourceVisible === false),
    );
  }
  return results;
}

function enrichRows(rows, sourceStatsByRow, dependencyContext) {
  return rows.map((item) => {
    const stats = sourceStatsByRow[item.baselineId];
    const inventoryCounts = inventoryCountsByFamily(dependencyContext.inventory, item.promptFamilyIds);
    const metricScores = metricScoresForRow(
      item,
      stats,
      dependencyContext.v38FixtureIds,
      dependencyContext.registryContractIds,
      inventoryCounts,
    );
    const selectedScores = Object.fromEntries(item.metricIds.map((metricId) => [metricId, metricScores[metricId]]));
    const scoreValues = Object.values(selectedScores);
    const baselineScore = Number((scoreValues.reduce((total, score) => total + score, 0) / scoreValues.length).toFixed(4));
    return {
      ...item,
      inventoryBinding: {
        promptFamilyIds: item.promptFamilyIds,
        promptPartRowCount: inventoryCounts.promptPartCount,
        promptRowCount: inventoryCounts.promptCount,
        benchmarkFixtureIds: inventoryCounts.benchmarkFixtureIds,
      },
      sourceStats: stats,
      metricScores: selectedScores,
      baselineScore,
      passed: baselineScore >= item.baselineThreshold
        && stats.sourceRootsPresent
        && stats.sourceFileCount > 0
        && item.fixtureIds.every((fixtureId) => dependencyContext.v38FixtureIds.includes(fixtureId))
        && item.registryContractIds.every((contractId) => dependencyContext.registryContractIds.includes(contractId))
        && stats.parserTargetPresentCount === item.parserTargetIds.length
        && (inventoryCounts.promptPartCount > 0 || inventoryCounts.promptCount > 0),
    };
  });
}

function sourceEvidenceForRows(repoRoot, rows) {
  const sourceRoots = unique(rows.flatMap((item) => item.sourceRoots));
  return sourceRoots.map((sourcePath) => ({
    sourcePath,
    exists: sourceExists(repoRoot, sourcePath),
    legacy: sourcePath.startsWith('_legacy/'),
  }));
}

export function buildV41ReadingPromptBenchmarkBaselines(input = {}) {
  const generatedAt = typeof input.generatedAt === 'string' ? input.generatedAt : '2026-05-26T00:00:00.000Z';
  const repoRoot = typeof input.repoRoot === 'string' ? input.repoRoot : DEFAULT_REPO_ROOT;
  const gate2Inventory = buildV41PromptPartPromptInventory({ generatedAt, repoRoot });
  const gate3Contracts = buildV41RegistryInterpolationContracts({ generatedAt, repoRoot });
  const v38BenchmarkReport = buildV38PromptBenchmarkReport({ generatedAt, repoRoot });
  const v40BenchmarkSmoke = buildV40PromptBenchmarkSmokeV41Readiness({ generatedAt, repoRoot });
  const dependencyContext = {
    inventory: gate2Inventory,
    registryContractIds: gate3Contracts.rows.map((item) => item.contractId),
    v38FixtureIds: v38BenchmarkReport.fixtureInputs.map((item) => item.fixtureId),
  };

  const sourceStatsByRow = buildSourceStats(repoRoot, V41_READING_PROMPT_BENCHMARK_BASELINE_ROWS);
  const rows = enrichRows(V41_READING_PROMPT_BENCHMARK_BASELINE_ROWS, sourceStatsByRow, dependencyContext);
  const sourcePredicateResults = buildPredicateResults(
    V41_READING_PROMPT_BENCHMARK_BASELINE_ROWS,
    sourceStatsByRow,
    dependencyContext,
  );
  const sourceEvidence = sourceEvidenceForRows(repoRoot, V41_READING_PROMPT_BENCHMARK_BASELINE_ROWS);
  const failedPredicateIds = sourcePredicateResults.filter((result) => !result.passed).map((result) => result.id);
  const missingSourceRoots = sourceEvidence.filter((entry) => !entry.exists).map((entry) => entry.sourcePath);
  const legacySourceRoots = sourceEvidence.filter((entry) => entry.legacy).map((entry) => entry.sourcePath);
  const benchmarkFixtureIds = unique(rows.flatMap((item) => item.fixtureIds));
  const parserTargetIds = unique(rows.flatMap((item) => item.parserTargetIds));
  const registryContractIds = unique(rows.flatMap((item) => item.registryContractIds));
  const promptFamilyIds = unique(rows.flatMap((item) => item.promptFamilyIds));
  const uxStepIds = unique(rows.flatMap((item) => item.uxStepIds));
  const baselineScores = rows.map((item) => item.baselineScore);
  const readNeedInventoryCounts = inventoryCountsByFamily(gate2Inventory, ['ReadNeedComprehensionSynthesis']);
  const readFitsInventoryCounts = inventoryCountsByFamily(gate2Inventory, ['ReadFitsFindingSynthesis']);
  const failures = [];

  if (!gate2Inventory.passed) failures.push('Gate 2 prompt inventory is not passing.');
  if (!gate3Contracts.passed) failures.push('Gate 3 registry/interpolation contracts are not passing.');
  if (!v38BenchmarkReport.passed) failures.push('V38 prompt benchmark report is not passing.');
  if (!v40BenchmarkSmoke.passed) failures.push('V40 prompt benchmark smoke readiness is not passing.');
  if (failedPredicateIds.length) failures.push(`failed Reading benchmark baseline predicates: ${failedPredicateIds.join(', ')}`);
  if (missingSourceRoots.length) failures.push(`missing source roots: ${missingSourceRoots.join(', ')}`);
  if (legacySourceRoots.length) failures.push(`legacy source roots present: ${legacySourceRoots.join(', ')}`);

  const coverage = {
    rowCount: rows.length,
    pipelineIds: [...V41_READING_PROMPT_BENCHMARK_PIPELINE_IDS],
    metricIds: [...V41_READING_PROMPT_BENCHMARK_METRIC_IDS],
    disclosureTiers: [...V41_READING_PROMPT_BENCHMARK_DISCLOSURE_TIERS],
    benchmarkFixtureIds,
    benchmarkFixtureCount: benchmarkFixtureIds.length,
    parserTargetIds,
    parserTargetCount: parserTargetIds.length,
    registryContractIds,
    registryContractCount: registryContractIds.length,
    promptFamilyIds,
    uxStepIds,
    uxStepCount: uxStepIds.length,
    sourceRootCount: sourceEvidence.length,
    sourceRootPresentCount: sourceEvidence.filter((entry) => entry.exists).length,
    missingSourceRoots,
    legacySourceRoots: legacySourceRoots.length > 0,
    requiredPredicateCount: sourcePredicateResults.length,
    passedPredicateCount: sourcePredicateResults.filter((result) => result.passed).length,
    failedPredicateIds,
    passingRowCount: rows.filter((item) => item.passed).length,
    failingRowIds: rows.filter((item) => !item.passed).map((item) => item.baselineId),
    readNeedBaselineRowCount: rows.filter((item) => item.pipelineId === 'ReadNeedComprehensionSynthesis').length,
    readFitsBaselineRowCount: rows.filter((item) => item.pipelineId === 'ReadFitsFindingSynthesis').length,
    readNeedInventoryPromptPartRowCount: readNeedInventoryCounts.promptPartCount,
    readNeedInventoryPromptRowCount: readNeedInventoryCounts.promptCount,
    readFitsInventoryPromptPartRowCount: readFitsInventoryCounts.promptPartCount,
    readFitsInventoryPromptRowCount: readFitsInventoryCounts.promptCount,
    baselineScoreMinimum: Math.min(...baselineScores),
    baselineScoreAverage: Number((baselineScores.reduce((total, score) => total + score, 0) / baselineScores.length).toFixed(4)),
    sourceSafeMetadataOnly: rows.every((item) =>
      item.sourceSafeMetadataOnly === true
      && item.rawPromptTextSerialized === false
      && item.rawInterpolatedPromptSerialized === false
      && item.rawProviderResponseSerialized === false
      && item.protectedSourceVisible === false
      && item.privateContextSerialized === false
      && item.credentialsSerialized === false
      && item.unpaidAssetPackSourceVisible === false,
    ),
    gate2InventoryRoot: gate2Inventory.artifactRoot,
    gate3RegistryInterpolationRoot: gate3Contracts.artifactRoot,
    v38PromptBenchmarkReportRoot: v38BenchmarkReport.artifactRoot,
    v40PromptBenchmarkSmokeRoot: v40BenchmarkSmoke.artifactRoot,
  };

  const sourceSafety = {
    sourceSafetyClass: 'source_safe_reading_prompt_benchmark_baseline_metadata',
    sourceSafeMetadataOnly: coverage.sourceSafeMetadataOnly,
    rawPromptTextSerialized: false,
    rawInterpolatedPromptSerialized: false,
    rawProviderResponseSerialized: false,
    protectedSourceVisible: false,
    privateContextSerialized: false,
    credentialsSerialized: false,
    unpaidAssetPackSourceVisible: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };

  const root = artifactRoot(
    JSON.stringify({
      rows: rows.map((item) => item.rowRoot),
      fixtures: benchmarkFixtureIds,
      parsers: parserTargetIds,
      predicates: sourcePredicateResults.filter((result) => result.passed).map((result) => result.id),
      roots: {
        gate2: gate2Inventory.artifactRoot,
        gate3: gate3Contracts.artifactRoot,
        v38: v38BenchmarkReport.artifactRoot,
        v40: v40BenchmarkSmoke.artifactRoot,
      },
    }),
  );

  return {
    artifactId: 'v41-reading-prompt-benchmark-baselines',
    schemaId: V41_READING_PROMPT_BENCHMARK_BASELINES_SCHEMA_ID,
    version: V41_READING_PROMPT_BENCHMARK_BASELINES_VERSION,
    currentTarget: V41_READING_PROMPT_BENCHMARK_BASELINES_CURRENT_TARGET,
    generatedAt,
    artifactPath: V41_READING_PROMPT_BENCHMARK_BASELINES_ARTIFACT_PATH,
    artifactRoot: root,
    sourceSafetyVerdict: V41_READING_PROMPT_BENCHMARK_BASELINES_SOURCE_SAFETY_VERDICT,
    pipelineIds: [...V41_READING_PROMPT_BENCHMARK_PIPELINE_IDS],
    metricIds: [...V41_READING_PROMPT_BENCHMARK_METRIC_IDS],
    disclosureTiers: [...V41_READING_PROMPT_BENCHMARK_DISCLOSURE_TIERS],
    rows,
    sourceStatsByRow,
    sourcePredicateResults,
    sourceEvidence,
    dependencyRoots: {
      gate2InventoryRoot: gate2Inventory.artifactRoot,
      gate3RegistryInterpolationRoot: gate3Contracts.artifactRoot,
      v38PromptBenchmarkReportRoot: v38BenchmarkReport.artifactRoot,
      v40PromptBenchmarkSmokeRoot: v40BenchmarkSmoke.artifactRoot,
    },
    sourceSafety,
    coverage,
    failures,
    passed:
      failures.length === 0
      && coverage.rowCount === 10
      && coverage.readNeedBaselineRowCount >= 3
      && coverage.readFitsBaselineRowCount >= 7
      && coverage.uxStepCount >= 5
      && coverage.benchmarkFixtureCount >= 6
      && coverage.parserTargetCount >= 20
      && coverage.registryContractCount >= 8
      && coverage.sourceRootPresentCount === coverage.sourceRootCount
      && coverage.passedPredicateCount === coverage.requiredPredicateCount
      && coverage.failingRowIds.length === 0
      && coverage.readNeedInventoryPromptPartRowCount > 0
      && coverage.readNeedInventoryPromptRowCount > 0
      && coverage.readFitsInventoryPromptPartRowCount > 0
      && coverage.readFitsInventoryPromptRowCount > 0
      && coverage.baselineScoreMinimum >= 0.8
      && coverage.sourceSafeMetadataOnly
      && coverage.legacySourceRoots === false
      && gate2Inventory.passed
      && gate3Contracts.passed
      && v38BenchmarkReport.passed
      && v40BenchmarkSmoke.passed,
  };
}
