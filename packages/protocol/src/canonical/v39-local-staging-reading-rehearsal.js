// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V39_LOCAL_STAGING_READING_REHEARSAL_ARTIFACT_PATH =
  '.bitcode/v39-local-staging-reading-rehearsal.json';
export const V39_LOCAL_STAGING_READING_REHEARSAL_SCHEMA_ID =
  'bitcode.v39.localStagingReadingRehearsal.v1';
export const V39_LOCAL_STAGING_READING_REHEARSAL_VERSION = 'V39';
export const V39_LOCAL_STAGING_READING_REHEARSAL_CURRENT_TARGET = 'V38';
export const V39_LOCAL_STAGING_READING_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-reading-local-staging-rehearsal-metadata';

export const V39_LOCAL_STAGING_READING_REHEARSAL_LANE_IDS = Object.freeze([
  'local',
  'staging-testnet',
]);

export const V39_LOCAL_STAGING_READING_REHEARSAL_STAGE_IDS = Object.freeze([
  'request-read',
  'review-synthesized-need',
  'request-finding-fits',
  'review-assetpack-preview',
  'buy-assetpack-settle',
]);

export const V39_LOCAL_STAGING_READING_REHEARSAL_ROW_IDS = Object.freeze([
  'lane:local-reading-rehearsal',
  'lane:staging-testnet-reading-rehearsal',
  'stage:request-read',
  'stage:review-synthesized-need',
  'stage:request-finding-fits',
  'stage:review-assetpack-preview',
  'stage:buy-assetpack-settle',
  'search:depository-many-fits',
  'telemetry:rich-stream-readback',
  'sync:ledger-database-storage-reconciliation',
  'delivery:post-settlement-pull-request',
  'boundary:value-bearing-mainnet-blocked',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-interpolated-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'wallet-private-material',
  'settlement-private-payloads',
  'secret-values',
  'live-log-payloads',
  'value-bearing-mainnet-admission',
]);

const SOURCE_ROOTS = Object.freeze({
  rehearsal: 'packages/pipelines/asset-pack/src/reading-local-staging-rehearsal.ts',
  rehearsalTest: 'packages/pipelines/asset-pack/src/__tests__/reading-local-staging-rehearsal.test.ts',
  packageIndex: 'packages/pipelines/asset-pack/src/index.ts',
  postprocess: 'packages/pipelines/asset-pack/src/postprocess.ts',
  packageJson: 'packages/pipelines/asset-pack/package.json',
  readNeedRuntime: 'packages/pipelines/asset-pack/src/read-need-review-resynthesis.ts',
  readFitsRuntime: 'packages/pipelines/asset-pack/src/read-fits-finding-runtime.ts',
  previewBoundary: 'packages/pipelines/asset-pack/src/asset-pack-preview-boundary.ts',
  settlementBoundary: 'packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts',
  operationalReadback: 'packages/pipelines/asset-pack/src/reading-operational-telemetry-repair-readback.ts',
  interfaceParity: 'packages/pipelines/asset-pack/src/reading-interface-product-parity.ts',
  depositorySearch: 'packages/pipelines/asset-pack/src/depository-search.ts',
  harness: 'packages/pipeline-hosts/src/asset-pack-harness.ts',
  routeRunner: 'uapi/app/api/pipeline-harness/asset-pack/runner.ts',
  routePreflight: 'uapi/app/api/pipeline-harness/asset-pack/preflight.ts',
  pipelineLogUi: 'uapi/components/base/bitcode/execution/pipeline-execution-log.tsx',
  protocolIndex: 'packages/protocol/src/index.js',
  protocolTypes: 'packages/protocol/src/index.d.ts',
  protocolReadme: 'packages/protocol/README.md',
  assetPackReadme: 'packages/pipelines/asset-pack/README.md',
  rootReadme: 'README.md',
  v39Spec: 'BITCODE_SPEC_V39.md',
  v39Delta: 'BITCODE_SPEC_V39_DELTA.md',
  v39Notes: 'BITCODE_SPEC_V39_NOTES.md',
  v39Parity: 'BITCODE_SPEC_V39_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  packageScripts: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v39-local-staging-reading-rehearsal-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_reading_local_staging_rehearsal_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawInterpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    credentialsSerialized: false,
    liveLogPayloadSerialized: false,
    sourceBearingDeliveryUnlockedAfterSettlementOnly: true,
    valueBearingMainnetAdmitted: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V39_LOCAL_STAGING_READING_REHEARSAL_ROWS = Object.freeze([
  row({
    rowId: 'lane:local-reading-rehearsal',
    laneId: 'local',
    stageId: null,
    purpose: 'Bind local Reading rehearsal to explicit sandbox opt-in, untracked env files, local artifact roots, and source-safe redaction.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.rehearsalTest],
    requiredEvidence: ['untracked-env-files-or-host-runtime', 'sandboxExecutionRequired', 'trackedSecretsAllowed: false'],
  }),
  row({
    rowId: 'lane:staging-testnet-reading-rehearsal',
    laneId: 'staging-testnet',
    stageId: null,
    purpose: 'Bind staging-testnet Reading rehearsal to real bounded inference, Supabase project tkpyosihuouusyaxtbau, route streaming, and database readback.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.routePreflight, SOURCE_ROOTS.routeRunner],
    requiredEvidence: ['realInferenceRequired: true', 'tkpyosihuouusyaxtbau', 'databaseReadbackRequired'],
  }),
  row({
    rowId: 'stage:request-read',
    laneId: 'local-and-staging-testnet',
    stageId: 'request-read',
    purpose: 'Persist source-safe Read request and route it into ReadNeedComprehensionSynthesis.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.readNeedRuntime],
    requiredEvidence: ['readRequestRoot', 'ReadNeedComprehensionSynthesis', 'read_request'],
  }),
  row({
    rowId: 'stage:review-synthesized-need',
    laneId: 'local-and-staging-testnet',
    stageId: 'review-synthesized-need',
    purpose: 'Persist synthesized Need, measurement, review state, and accepted Need admission before Finding Fits.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.readNeedRuntime],
    requiredEvidence: ['synthesized_need', 'need_measurement', 'accepted_need_admission'],
  }),
  row({
    rowId: 'stage:request-finding-fits',
    laneId: 'local-and-staging-testnet',
    stageId: 'request-finding-fits',
    purpose: 'Run ReadFitsFindingSynthesis from an accepted Need and preserve query, ranking, and selected fit provenance roots.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.readFitsRuntime, SOURCE_ROOTS.depositorySearch],
    requiredEvidence: ['ReadFitsFindingSynthesis', 'queryPlanRoot', 'selectedFitProvenanceRoot'],
  }),
  row({
    rowId: 'stage:review-assetpack-preview',
    laneId: 'local-and-staging-testnet',
    stageId: 'review-assetpack-preview',
    purpose: 'Expose only source-safe AssetPack measurements, fit reasons, quote, and disclosure posture before settlement.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.previewBoundary],
    requiredEvidence: ['sourceSafePreview', 'deterministicQuote', 'disclosureReview'],
  }),
  row({
    rowId: 'stage:buy-assetpack-settle',
    laneId: 'local-and-staging-testnet',
    stageId: 'buy-assetpack-settle',
    purpose: 'Observe BTC payment, confirm finality, transfer BTD rights, synchronize projections, and unlock pull-request delivery.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.settlementBoundary],
    requiredEvidence: ['paymentReceiptRoot', 'finalityRoot', 'rightsTransferRoot', 'reconciliationRoot'],
  }),
  row({
    rowId: 'search:depository-many-fits',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose: 'Prove many-fit Depository search is rehearsed and carries selected fit provenance into AssetPack synthesis.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.depositorySearch],
    requiredEvidence: ['selectedCandidateCount', 'fitDepositCount', 'selectedFitProvenanceRoot'],
  }),
  row({
    rowId: 'telemetry:rich-stream-readback',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose: 'Prove rich log stream/readback covers phases, PTRR agents, PTRR steps, Failsafes, ThricifiedGenerations, tools, storage, ledger, wallet, delivery, UI, and repairs.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.operationalReadback, SOURCE_ROOTS.pipelineLogUi],
    requiredEvidence: ['phase', 'ptrr-agent', 'ptrr-step', 'failsafe', 'thricified-generation', 'tool'],
  }),
  row({
    rowId: 'sync:ledger-database-storage-reconciliation',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose: 'Synchronize ledger facts, database projections, and object-storage projections before source-bearing delivery.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.settlementBoundary],
    requiredEvidence: ['LedgerDatabaseReconciliationReport', 'stagingProjectRef', 'aligned'],
  }),
  row({
    rowId: 'delivery:post-settlement-pull-request',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose: 'Prove pull-request delivery is source-bearing only after settlement and BTD rights transfer.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.settlementBoundary],
    requiredEvidence: ['pull_request_after_settlement', 'source_bearing_pull_request_ready'],
  }),
  row({
    rowId: 'boundary:value-bearing-mainnet-blocked',
    laneId: 'local-and-staging-testnet',
    stageId: null,
    purpose: 'Keep local and staging-testnet rehearsal non-value-bearing while preserving mainnet admission as blocked.',
    sourceRoots: [SOURCE_ROOTS.rehearsal, SOURCE_ROOTS.interfaceParity],
    requiredEvidence: ['valueBearingMainnetAdmitted: false', 'serverCustody: false', 'source-bearing delivery locked before settlement'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const rehearsal = readSource(repoRoot, SOURCE_ROOTS.rehearsal);
  const rehearsalTest = readSource(repoRoot, SOURCE_ROOTS.rehearsalTest);
  const packageIndex = readSource(repoRoot, SOURCE_ROOTS.packageIndex);
  const postprocess = readSource(repoRoot, SOURCE_ROOTS.postprocess);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const readNeedRuntime = readSource(repoRoot, SOURCE_ROOTS.readNeedRuntime);
  const readFitsRuntime = readSource(repoRoot, SOURCE_ROOTS.readFitsRuntime);
  const previewBoundary = readSource(repoRoot, SOURCE_ROOTS.previewBoundary);
  const settlementBoundary = readSource(repoRoot, SOURCE_ROOTS.settlementBoundary);
  const operationalReadback = readSource(repoRoot, SOURCE_ROOTS.operationalReadback);
  const interfaceParity = readSource(repoRoot, SOURCE_ROOTS.interfaceParity);
  const depositorySearch = readSource(repoRoot, SOURCE_ROOTS.depositorySearch);
  const harness = readSource(repoRoot, SOURCE_ROOTS.harness);
  const routeRunner = readSource(repoRoot, SOURCE_ROOTS.routeRunner);
  const routePreflight = readSource(repoRoot, SOURCE_ROOTS.routePreflight);
  const pipelineLogUi = readSource(repoRoot, SOURCE_ROOTS.pipelineLogUi);
  const protocolIndex = readSource(repoRoot, SOURCE_ROOTS.protocolIndex);
  const protocolTypes = readSource(repoRoot, SOURCE_ROOTS.protocolTypes);
  const protocolReadme = readSource(repoRoot, SOURCE_ROOTS.protocolReadme);
  const assetPackReadme = readSource(repoRoot, SOURCE_ROOTS.assetPackReadme);
  const rootReadme = readSource(repoRoot, SOURCE_ROOTS.rootReadme);
  const spec = readSource(repoRoot, SOURCE_ROOTS.v39Spec);
  const delta = readSource(repoRoot, SOURCE_ROOTS.v39Delta);
  const notes = readSource(repoRoot, SOURCE_ROOTS.v39Notes);
  const parity = readSource(repoRoot, SOURCE_ROOTS.v39Parity);
  const roadmap = readSource(repoRoot, SOURCE_ROOTS.roadmap);
  const packageScripts = readSource(repoRoot, SOURCE_ROOTS.packageScripts);
  const gateWorkflow = readSource(repoRoot, SOURCE_ROOTS.gateWorkflow);
  const canonWorkflow = readSource(repoRoot, SOURCE_ROOTS.canonWorkflow);

  return [
    predicateResult('package-defines-rehearsal-type', SOURCE_ROOTS.rehearsal, rehearsal.includes('ReadingLocalStagingRehearsal') && rehearsal.includes('buildReadingLocalStagingRehearsal')),
    predicateResult('package-defines-five-stages', SOURCE_ROOTS.rehearsal, V39_LOCAL_STAGING_READING_REHEARSAL_STAGE_IDS.every((stageId) => rehearsal.includes(`'${stageId}'`))),
    predicateResult('package-defines-local-staging-lanes', SOURCE_ROOTS.rehearsal, rehearsal.includes("'local'") && rehearsal.includes("'staging-testnet'") && rehearsal.includes('tkpyosihuouusyaxtbau')),
    predicateResult('package-source-safety', SOURCE_ROOTS.rehearsal, rehearsal.includes('source_safe_reading_local_staging_rehearsal_metadata') && rehearsal.includes('valueBearingMainnetAdmitted: false') && rehearsal.includes('unpaidAssetPackSourceVisible: false')),
    predicateResult('package-persistence', SOURCE_ROOTS.rehearsal, rehearsal.includes('persistReadingLocalStagingRehearsal') && rehearsal.includes("'reading/rehearsal'")),
    predicateResult('package-exports-rehearsal', SOURCE_ROOTS.packageJson, packageJson.includes('./reading-local-staging-rehearsal') && packageIndex.includes("export * from './reading-local-staging-rehearsal'")),
    predicateResult('pipeline-preprocess-emits-rehearsal', SOURCE_ROOTS.packageIndex, packageIndex.includes('buildReadingLocalStagingRehearsal') && packageIndex.includes('readingLocalStagingRehearsal')),
    predicateResult('postprocess-emits-rehearsal', SOURCE_ROOTS.postprocess, postprocess.includes('ensureReadingLocalStagingRehearsal') && postprocess.includes('readingLocalStagingRehearsalStageReadback')),
    predicateResult('tests-cover-five-stage-run', SOURCE_ROOTS.rehearsalTest, rehearsalTest.includes('covers the five Reading stages') && rehearsalTest.includes('depositoryManyFitsCovered: true')),
    predicateResult('tests-cover-persistence', SOURCE_ROOTS.rehearsalTest, rehearsalTest.includes('persists rehearsal readback') && rehearsalTest.includes("'reading/rehearsal'")),
    predicateResult('read-need-runtime-present', SOURCE_ROOTS.readNeedRuntime, readNeedRuntime.includes('buildReadNeedReviewResynthesisRuntime') && readNeedRuntime.includes('accepted_need_admission')),
    predicateResult('read-fits-runtime-present', SOURCE_ROOTS.readFitsRuntime, readFitsRuntime.includes('buildReadFitsFindingRuntime') && readFitsRuntime.includes('selectedFitProvenanceRoot')),
    predicateResult('preview-boundary-present', SOURCE_ROOTS.previewBoundary, previewBoundary.includes('buildAssetPackPreviewBoundary') && previewBoundary.includes('source_safe_assetpack_preview_quote_boundary')),
    predicateResult('settlement-boundary-present', SOURCE_ROOTS.settlementBoundary, settlementBoundary.includes('buildAssetPackSettlementRightsDeliveryBoundary') && settlementBoundary.includes('source_bearing_pull_request_ready')),
    predicateResult('operational-readback-present', SOURCE_ROOTS.operationalReadback, operationalReadback.includes('buildReadingOperationalTelemetryRepairReadback') && operationalReadback.includes('thinkings-generation')),
    predicateResult('interface-parity-present', SOURCE_ROOTS.interfaceParity, interfaceParity.includes('buildReadingInterfaceProductParity') && interfaceParity.includes('source_bearing_delivery_locked_until_settlement_and_rights')),
    predicateResult('depository-many-fits-present', SOURCE_ROOTS.depositorySearch, depositorySearch.includes('maxSelectedCandidates: 12') && depositorySearch.includes('selectedFitProvenanceRoot')),
    predicateResult('harness-streams-reading-events', SOURCE_ROOTS.harness, harness.includes('readingPipelineTelemetry') && harness.includes('pipeline-stream-event')),
    predicateResult('route-requires-real-staging-inference', SOURCE_ROOTS.routePreflight, routePreflight.includes('assertRealInferenceEnvironment') && routeRunner.includes('BITCODE_PIPELINE_STREAM_TO_DATABASE')),
    predicateResult('rich-log-ui-present', SOURCE_ROOTS.pipelineLogUi, pipelineLogUi.includes('Accordion') || pipelineLogUi.includes('metadata')),
    predicateResult('protocol-exports-rehearsal', SOURCE_ROOTS.protocolIndex, protocolIndex.includes('buildV39LocalStagingReadingRehearsal') && protocolTypes.includes('buildV39LocalStagingReadingRehearsal')),
    predicateResult('docs-cover-gate10', SOURCE_ROOTS.v39Spec, spec.includes('ReadingLocalStagingRehearsal') && spec.includes('v39-local-staging-reading-rehearsal')),
    predicateResult('delta-cover-gate10', SOURCE_ROOTS.v39Delta, delta.includes('Gate 10') && delta.includes('ReadingLocalStagingRehearsal')),
    predicateResult('notes-cover-gate10', SOURCE_ROOTS.v39Notes, notes.includes('Gate 10 implementation notes') && notes.includes('local and staging')),
    predicateResult('parity-cover-gate10', SOURCE_ROOTS.v39Parity, parity.includes('Gate 10 Parity') && parity.includes('ReadingLocalStagingRehearsal')),
    predicateResult(
      'roadmap-advanced-to-gate10',
      SOURCE_ROOTS.roadmap,
      roadmap.includes('V39 Gate 10 closure anchor') &&
        (/Current working gate: V39 Gate (?:10|11)\b/u.test(roadmap) ||
          roadmap.includes('Latest closed version: V39 Commercial Reading Readiness') ||
          roadmap.includes('Recent V39 closure anchor')),
    ),
    predicateResult('readmes-cover-gate10', SOURCE_ROOTS.rootReadme, rootReadme.includes('V39 Gate 10') && assetPackReadme.includes('Reading Local/Staging Rehearsal') && protocolReadme.includes('V39LocalStagingReadingRehearsal')),
    predicateResult('scripts-cover-gate10', SOURCE_ROOTS.packageScripts, packageScripts.includes('check:v39-gate10') && packageScripts.includes('generate:v39-local-staging-reading-rehearsal')),
    predicateResult('workflows-cover-gate10', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v39-gate10-local-staging-reading-rehearsal') && canonWorkflow.includes('check-v39-gate10-local-staging-reading-rehearsal')),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  return {
    rowCount: rows.length,
    laneCount: V39_LOCAL_STAGING_READING_REHEARSAL_LANE_IDS.length,
    stageCount: V39_LOCAL_STAGING_READING_REHEARSAL_STAGE_IDS.length,
    stagingProjectRef: 'tkpyosihuouusyaxtbau',
    stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
    packageRuntimeType: 'ReadingLocalStagingRehearsal',
    packageSourceSafetyType: 'ReadingLocalStagingRehearsalSourceSafety',
    localLaneCovered: predicateResults.some((predicate) => predicate.id === 'package-defines-local-staging-lanes' && predicate.passed),
    stagingTestnetLaneCovered: predicateResults.some((predicate) => predicate.id === 'package-defines-local-staging-lanes' && predicate.passed),
    fiveStageReadingCovered: predicateResults.some((predicate) => predicate.id === 'package-defines-five-stages' && predicate.passed),
    readNeedComprehensionCovered: predicateResults.some((predicate) => predicate.id === 'read-need-runtime-present' && predicate.passed),
    readFitsFindingCovered: predicateResults.some((predicate) => predicate.id === 'read-fits-runtime-present' && predicate.passed),
    depositoryManyFitsCovered: predicateResults.some((predicate) => predicate.id === 'depository-many-fits-present' && predicate.passed),
    sourceSafePreviewCovered: predicateResults.some((predicate) => predicate.id === 'preview-boundary-present' && predicate.passed),
    settlementRightsDeliveryCovered: predicateResults.some((predicate) => predicate.id === 'settlement-boundary-present' && predicate.passed),
    telemetryStreamingReadbackCovered: predicateResults.some((predicate) => predicate.id === 'operational-readback-present' && predicate.passed),
    interfaceNoBypassCovered: predicateResults.some((predicate) => predicate.id === 'interface-parity-present' && predicate.passed),
    pipelineHarnessCovered: predicateResults.some((predicate) => predicate.id === 'harness-streams-reading-events' && predicate.passed),
    routeRealInferenceCovered: predicateResults.some((predicate) => predicate.id === 'route-requires-real-staging-inference' && predicate.passed),
    richLogUiCovered: predicateResults.some((predicate) => predicate.id === 'rich-log-ui-present' && predicate.passed),
    sourceSafeMetadataOnly: true,
    protectedSourceVisible: false,
    protectedSourcePayloadSerialized: false,
    rawPromptTextSerialized: false,
    rawInterpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveLogPayloadSerialized: false,
    valueBearingMainnetAdmitted: false,
    failedPredicateIds,
  };
}

export function buildV39LocalStagingReadingRehearsal(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const predicates = buildPredicateResults(repoRoot);
  const rows = [...V39_LOCAL_STAGING_READING_REHEARSAL_ROWS];
  const coverage = buildCoverage(rows, predicates);
  const artifactRoot = `v39-local-staging-reading-rehearsal:${digest(JSON.stringify({
    rows: rows.map((entry) => entry.rowRoot),
    predicates,
    coverage,
  }))}`;

  return {
    artifactId: 'v39-local-staging-reading-rehearsal',
    schemaId: V39_LOCAL_STAGING_READING_REHEARSAL_SCHEMA_ID,
    version: V39_LOCAL_STAGING_READING_REHEARSAL_VERSION,
    currentTarget: V39_LOCAL_STAGING_READING_REHEARSAL_CURRENT_TARGET,
    generatedAt: 'deterministic',
    passed: coverage.failedPredicateIds.length === 0,
    artifactRoot,
    sourceSafetyVerdict: V39_LOCAL_STAGING_READING_REHEARSAL_SOURCE_SAFETY_VERDICT,
    laneIds: [...V39_LOCAL_STAGING_READING_REHEARSAL_LANE_IDS],
    stageIds: [...V39_LOCAL_STAGING_READING_REHEARSAL_STAGE_IDS],
    rowIds: rows.map((entry) => entry.rowId),
    rows,
    predicates,
    coverage,
  };
}
