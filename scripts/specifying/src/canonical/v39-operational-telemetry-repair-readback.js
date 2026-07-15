// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ARTIFACT_PATH =
  '.bitcode/v39-operational-telemetry-repair-readback.json';
export const V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_SCHEMA_ID =
  'bitcode.v39.operationalTelemetryRepairReadback.v1';
export const V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_VERSION = 'V39';
export const V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_CURRENT_TARGET = 'V38';
export const V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_SOURCE_SAFETY_VERDICT =
  'source-safe-operational-telemetry-repair-readback';

export const V39_OPERATIONAL_TELEMETRY_EVENT_KIND_IDS = Object.freeze([
  'phase',
  'ptrr-agent',
  'ptrr-step',
  'failsafe',
  'thricified-generation',
  'tool',
  'storage',
  'ledger',
  'wallet',
  'delivery',
  'ui',
  'repair',
]);

export const V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROW_IDS = Object.freeze([
  'pipeline:phase-agent-step-stream',
  'inference:failsafe-thricified-readback',
  'tool:depository-search-execution',
  'storage:source-safe-projections',
  'settlement:ledger-wallet-delivery-events',
  'ui:terminal-stage-readback',
  'repair:runbook-hooks',
  'source-safety:metadata-only-disclosure',
  'interface:rich-log-rendering',
  'proof:tests-artifact-workflow',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'raw-interpolated-prompts',
  'unpaid-assetpack-source',
  'wallet-private-material',
  'settlement-private-payloads',
  'secret-values',
]);

const SOURCE_ROOTS = Object.freeze({
  readback: 'packages/asset-packs-pipelines/domain/src/reading-operational-telemetry-repair-readback.ts',
  readbackTest: 'packages/asset-packs-pipelines/domain/src/__tests__/reading-operational-telemetry-repair-readback.test.ts',
  readingContract: 'packages/asset-packs-pipelines/domain/src/reading-pipeline-contract.ts',
  postprocess: 'packages/asset-packs-pipelines/domain/src/postprocess.ts',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  packageJson: 'packages/asset-packs-pipelines/domain/package.json',
  pipelineLog: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  pipelineLogHeader: 'apps/uapi/components/bitcode/pipeline/pipeline-execution-log-header.tsx',
  pipelineLogTest: 'apps/uapi/tests/readingOperationalTelemetryPipelineLog.test.tsx',
  pipelineHeaderTest: 'apps/uapi/tests/pipelineExecutionLogHeader.test.tsx',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  protocolReadme: 'scripts/specifying/README.md',
  v39Spec: 'BITCODE_SPEC_V39.md',
  v39Delta: 'BITCODE_SPEC_V39_DELTA.md',
  v39Notes: 'BITCODE_SPEC_V39_NOTES.md',
  v39Parity: 'BITCODE_SPEC_V39_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v39-operational-telemetry-repair-readback-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_reading_operational_telemetry_repair_readback_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    rawInterpolatedPromptVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    credentialsSerialized: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROWS = Object.freeze([
  row({
    rowId: 'pipeline:phase-agent-step-stream',
    purpose:
      'Stream Reading phase, PTRR agent, and PTRR step events with source-safe execution state for operator readback.',
    sourceRoots: [SOURCE_ROOTS.readback, SOURCE_ROOTS.readingContract, SOURCE_ROOTS.readbackTest],
    emittedTypes: ['ReadingOperationalTelemetryEvent', 'ReadingOperationalExecutionState'],
    requiredEvidence: ['phase', 'ptrr-agent', 'ptrr-step', 'eventId', 'proofRoot'],
  }),
  row({
    rowId: 'inference:failsafe-thricified-readback',
    purpose:
      'Expose Failsafe and ThricifiedGeneration identity, prompt template ids, output schemas, and disclosure posture without raw prompt or provider payload leakage.',
    sourceRoots: [SOURCE_ROOTS.readback, SOURCE_ROOTS.readingContract, SOURCE_ROOTS.readbackTest],
    emittedTypes: ['ReadingOperationalTelemetryEvent', 'ReadingPipelineThricifiedGenerationContract'],
    requiredEvidence: ['failsafe', 'thricified-generation', 'prompt_template_id_only', 'parsed_result_shape_and_proof_roots_only'],
  }),
  row({
    rowId: 'tool:depository-search-execution',
    purpose:
      'Stream source-safe ToolExecution readback for depository search, vector recall, ranking, proof, and measurement tools.',
    sourceRoots: [SOURCE_ROOTS.readback, SOURCE_ROOTS.readingContract, SOURCE_ROOTS.pipelineLogTest],
    emittedTypes: ['ReadingOperationalTelemetryEvent', 'ReadingPipelineToolContract'],
    requiredEvidence: ['tool', 'toolId', 'bitcode.depository.vector-search'],
  }),
  row({
    rowId: 'storage:source-safe-projections',
    purpose:
      'Persist operator readback, event streams, repair hooks, telemetry roots, and underlying pipeline storage projections.',
    sourceRoots: [SOURCE_ROOTS.readback, SOURCE_ROOTS.postprocess, SOURCE_ROOTS.packageIndex],
    emittedTypes: ['ReadingOperationalTelemetryStorageRecord'],
    requiredEvidence: ['reading/operational', 'streamEvents', 'operatorReadback', 'telemetryRoot'],
  }),
  row({
    rowId: 'settlement:ledger-wallet-delivery-events',
    purpose:
      'Represent BTC wallet observation, ledger/database/storage reconciliation, and source-bearing delivery unlock state as source-safe events.',
    sourceRoots: [SOURCE_ROOTS.readback, SOURCE_ROOTS.readbackTest],
    emittedTypes: ['ReadingOperationalTelemetryEvent'],
    requiredEvidence: ['wallet', 'ledger', 'delivery', 'AssetPackSettlementRightsDeliveryBoundary'],
  }),
  row({
    rowId: 'ui:terminal-stage-readback',
    purpose:
      'Project the five-stage Terminal Reading flow into operator-readable UI telemetry.',
    sourceRoots: [SOURCE_ROOTS.readback, SOURCE_ROOTS.pipelineLog, SOURCE_ROOTS.v39Spec],
    emittedTypes: ['ReadingOperationalOperatorReadback'],
    requiredEvidence: ['requestRead', 'reviewSynthesizedNeed', 'requestFindingFits', 'reviewAssetPackPreview', 'buyAssetPackSettle'],
  }),
  row({
    rowId: 'repair:runbook-hooks',
    purpose:
      'Attach repair runbook hooks for rich log inspection, Need resynthesis, depository search repair, BTC finality observation, projection repair, and delivery recovery.',
    sourceRoots: [SOURCE_ROOTS.readback, SOURCE_ROOTS.readbackTest],
    emittedTypes: ['ReadingOperationalRepairRunbookHook'],
    requiredEvidence: ['open-rich-execution-log', 'inspect-source-safe-metadata', 'observe-btc-payment-finality'],
  }),
  row({
    rowId: 'source-safety:metadata-only-disclosure',
    purpose:
      'Keep operational readback source-safe: metadata and proof roots only, with protected source, raw prompts, raw responses, wallet private material, and credentials absent.',
    sourceRoots: [SOURCE_ROOTS.readback, SOURCE_ROOTS.readbackTest, SOURCE_ROOTS.pipelineLogTest],
    emittedTypes: ['ReadingOperationalTelemetrySourceSafety'],
    requiredEvidence: ['protectedSourceVisible: false', 'rawProviderResponseVisible: false', 'credentialsSerialized: false'],
  }),
  row({
    rowId: 'interface:rich-log-rendering',
    purpose:
      'Render direct Reading operational telemetry payloads in the shared rich execution log and header with expandable metadata.',
    sourceRoots: [SOURCE_ROOTS.pipelineLog, SOURCE_ROOTS.pipelineLogHeader, SOURCE_ROOTS.pipelineLogTest, SOURCE_ROOTS.pipelineHeaderTest],
    emittedTypes: ['PipelineExecutionLog', 'PipelineExecutionLogHeader'],
    requiredEvidence: ['reading-telemetry', 'operator-readback', 'Execution State:', 'source_safe_reading_operational_telemetry_repair_readback_metadata'],
  }),
  row({
    rowId: 'proof:tests-artifact-workflow',
    purpose:
      'Bind Gate 8 closure to package tests, UI tests, protocol artifact tests, generated artifact, docs, exports, and workflow wiring.',
    sourceRoots: [SOURCE_ROOTS.readbackTest, SOURCE_ROOTS.pipelineLogTest, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    emittedTypes: ['V39OperationalTelemetryRepairReadback'],
    requiredEvidence: ['check-v39-gate8-operational-telemetry-repair-readback.mjs', 'v39-operational-telemetry-repair-readback'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const readback = readSource(repoRoot, SOURCE_ROOTS.readback);
  const readbackTest = readSource(repoRoot, SOURCE_ROOTS.readbackTest);
  const readingContract = readSource(repoRoot, SOURCE_ROOTS.readingContract);
  const postprocess = readSource(repoRoot, SOURCE_ROOTS.postprocess);
  const packageIndex = readSource(repoRoot, SOURCE_ROOTS.packageIndex);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const pipelineLog = readSource(repoRoot, SOURCE_ROOTS.pipelineLog);
  const pipelineLogHeader = readSource(repoRoot, SOURCE_ROOTS.pipelineLogHeader);
  const pipelineLogTest = readSource(repoRoot, SOURCE_ROOTS.pipelineLogTest);
  const pipelineHeaderTest = readSource(repoRoot, SOURCE_ROOTS.pipelineHeaderTest);
  const assetPackReadme = readSource(repoRoot, SOURCE_ROOTS.assetPackReadme);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v39Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v39Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v39Notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.v39Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);

  return [
    // The V39-era 'thricified-generation' event kind is named 'thinkings-generation'
    // in the live readback source (V48 Thinkings rename); the artifact keeps the
    // historical kind id while the live pin follows the renamed source.
    predicateResult('readback-defines-event-kinds', SOURCE_ROOTS.readback, V39_OPERATIONAL_TELEMETRY_EVENT_KIND_IDS.every((kind) => readback.includes(`'${kind === 'thricified-generation' ? 'thinkings-generation' : kind}'`))),
    predicateResult('readback-defines-core-types', SOURCE_ROOTS.readback, readback.includes('ReadingOperationalTelemetryRepairReadback') && readback.includes('ReadingOperationalOperatorReadback') && readback.includes('ReadingOperationalRepairRunbookHook')),
    predicateResult('readback-streams-pipeline-contract', SOURCE_ROOTS.readback, readback.includes('listReadingPipelineTelemetryTrace') && readback.includes('READ_NEED_COMPREHENSION_SYNTHESIS_CONTRACT') && readback.includes('READ_FITS_FINDING_SYNTHESIS_CONTRACT')),
    predicateResult('readback-source-safety', SOURCE_ROOTS.readback, readback.includes('source_safe_reading_operational_telemetry_repair_readback_metadata') && readback.includes('rawInterpolatedPromptVisible: false') && readback.includes('credentialsSerialized: false')),
    predicateResult('readback-persists-operational-records', SOURCE_ROOTS.readback, readback.includes('persistReadingOperationalTelemetryRepairReadback') && readback.includes("'reading/operational'") && readback.includes("'streamEvents'")),
    predicateResult('postprocess-emits-readback', SOURCE_ROOTS.postprocess, postprocess.includes('ensureReadingOperationalTelemetryRepairReadback') && postprocess.includes('readingOperationalTelemetryRepairReadback')),
    predicateResult('pipeline-preprocess-emits-readback', SOURCE_ROOTS.packageIndex, packageIndex.includes('buildReadingOperationalTelemetryRepairReadback') && packageIndex.includes('readingOperationalStreamEvents')),
    predicateResult('package-exports-readback', SOURCE_ROOTS.packageJson, packageJson.includes('./reading-operational-telemetry-repair-readback') && packageIndex.includes("export * from './reading-operational-telemetry-repair-readback'")),
    predicateResult('reading-contract-has-failsafe-and-thricified', SOURCE_ROOTS.readingContract, readingContract.includes('ReadingPipelineThinkingsGenerationContract') && readingContract.includes('prepare-concise-context') && readingContract.includes('structured-output')),
    predicateResult('tests-cover-event-kinds-source-safety', SOURCE_ROOTS.readbackTest, readbackTest.includes('streams source-safe pipeline') && readbackTest.includes('operatorReadback.eventCounts')),
    predicateResult('tests-cover-repair-finality', SOURCE_ROOTS.readbackTest, readbackTest.includes('marks settlement finality as repairable') && readbackTest.includes('observe-btc-payment-finality')),
    predicateResult('tests-cover-persistence', SOURCE_ROOTS.readbackTest, readbackTest.includes('persists operator readback') && readbackTest.includes('sourceSafeStreamEvents')),
    predicateResult('log-supports-reading-telemetry', SOURCE_ROOTS.pipelineLog, pipelineLog.includes('reading-telemetry') && pipelineLog.includes('operator-readback') && pipelineLog.includes('extractExecutionState')),
    predicateResult('header-supports-proof-posture', SOURCE_ROOTS.pipelineLogHeader, pipelineLogHeader.includes('promptDisclosurePosture') && pipelineLogHeader.includes('resultDisclosurePosture') && pipelineLogHeader.includes('failClosedState')),
    predicateResult('ui-tests-cover-reading-telemetry', SOURCE_ROOTS.pipelineLogTest, pipelineLogTest.includes('bitcode.reading.operational-telemetry-event') && pipelineLogTest.includes('source_safe_reading_operational_telemetry_repair_readback_metadata')),
    predicateResult('header-tests-cover-reading-telemetry', SOURCE_ROOTS.pipelineHeaderTest, pipelineHeaderTest.includes('Reading operational telemetry') && pipelineHeaderTest.includes('parsed_result_shape_and_proof_roots_only')),
    predicateResult('spec-gate8-expanded', SOURCE_ROOTS.v39Spec, spec.includes('ReadingOperationalTelemetryRepairReadback') && spec.includes('v39-operational-telemetry-repair-readback')),
    predicateResult('delta-gate8-expanded', SOURCE_ROOTS.v39Delta, delta.includes('Gate 8') && delta.includes('ReadingOperationalTelemetryRepairReadback')),
    predicateResult('notes-gate8-expanded', SOURCE_ROOTS.v39Notes, notes.includes('Gate 8 implementation notes') && notes.includes('operator readback')),
    predicateResult('parity-gate8-expanded', SOURCE_ROOTS.v39Parity, parity.includes('Gate 8 Parity') && parity.includes('ReadingOperationalTelemetryRepairReadback')),
    predicateResult(
      'roadmap-advanced-to-gate8',
      SOURCE_ROOTS.roadmap,
      roadmap.includes('V39 Gate 8 closure anchor') &&
        (/Current working gate: V39 Gate (?:8|9|10|11)\b/u.test(roadmap) ||
          roadmap.includes('Latest closed version: V39 Commercial Reading Readiness') ||
          roadmap.includes('Recent V39 closure anchor')),
    ),
    predicateResult('readmes-document-gate8', SOURCE_ROOTS.rootReadme, rootReadme.includes('V39 Gate 8') && assetPackReadme.includes('Operational Telemetry Repair Readback') && protocolReadme.includes('V39OperationalTelemetryRepairReadback')),
    predicateResult('workflows-run-gate8-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v39-gate8-operational-telemetry-repair-readback.mjs') && canonWorkflow.includes('check-v39-gate8-operational-telemetry-repair-readback.mjs')),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  return {
    rowCount: rows.length,
    sourceSafetyVerdict: V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_SOURCE_SAFETY_VERDICT,
    runtimeType: 'ReadingOperationalTelemetryRepairReadback',
    operatorReadbackType: 'ReadingOperationalOperatorReadback',
    eventType: 'ReadingOperationalTelemetryEvent',
    storageRecordType: 'ReadingOperationalTelemetryStorageRecord',
    repairRunbookType: 'ReadingOperationalRepairRunbookHook',
    eventKindIds: [...V39_OPERATIONAL_TELEMETRY_EVENT_KIND_IDS],
    requiredDisclosurePostures: [
      'source_safe_reading_operational_telemetry_repair_readback_metadata',
      'prompt_template_id_only',
      'parsed_result_shape_and_proof_roots_only',
    ],
    requiredRunbookHooks: [
      'open-rich-execution-log',
      'inspect-source-safe-metadata',
      'retry-read-need-resynthesis',
      'repair-depository-search-readback',
      'observe-btc-payment-finality',
      'repair-ledger-database-storage-projection',
      'recover-pull-request-delivery',
    ],
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    protectedSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    rawInterpolatedPromptVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    credentialsSerialized: false,
    streamEventKindsCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-event-kinds-source-safety' && predicate.passed),
    repairFinalityCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-repair-finality' && predicate.passed),
    persistenceCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-persistence' && predicate.passed),
    richLogCovered: predicateResults.some((predicate) => predicate.id === 'ui-tests-cover-reading-telemetry' && predicate.passed),
    failedPredicateIds,
  };
}

export function buildV39OperationalTelemetryRepairReadback(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const rows = [...V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROWS];
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v39-operational-telemetry-repair-readback:${digest(JSON.stringify({
    rowIds: V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROW_IDS,
    eventKindIds: V39_OPERATIONAL_TELEMETRY_EVENT_KIND_IDS,
    predicateResults,
    coverage,
  }))}`;

  return {
    artifactId: 'v39-operational-telemetry-repair-readback',
    schemaId: V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_SCHEMA_ID,
    version: V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_VERSION,
    currentTarget: V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_CURRENT_TARGET,
    sourceSafetyVerdict: V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_SOURCE_SAFETY_VERDICT,
    eventKindIds: [...V39_OPERATIONAL_TELEMETRY_EVENT_KIND_IDS],
    rowIds: [...V39_OPERATIONAL_TELEMETRY_REPAIR_READBACK_ROW_IDS],
    rows,
    predicateResults,
    coverage,
    passed: coverage.failedPredicateIds.length === 0,
    artifactRoot,
  };
}
