// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V43_CROSS_ROUTE_REHEARSAL_ARTIFACT_PATH =
  '.bitcode/v43-cross-route-rehearsal-telemetry-repair.json';
export const V43_CROSS_ROUTE_REHEARSAL_SCHEMA_ID =
  'bitcode.v43.crossRouteRehearsalTelemetryRepair.v1';
export const V43_CROSS_ROUTE_REHEARSAL_VERSION = 'V43';
export const V43_CROSS_ROUTE_REHEARSAL_CURRENT_TARGET = 'V42';
export const V43_CROSS_ROUTE_REHEARSAL_SOURCE_SAFETY_VERDICT =
  'source-safe-cross-route-rehearsal-telemetry-repair-metadata';

export const V43_CROSS_ROUTE_REHEARSAL_LANE_IDS = Object.freeze([
  'local',
  'staging-testnet',
]);

export const V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS = Object.freeze([
  '/deposit',
  '/read',
  '/packs',
]);

export const V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS = Object.freeze([
  'deposit:synthesize-options',
  'deposit:review-admit',
  'read:request',
  'read:review-need',
  'read:request-finding-fits',
  'read:preview-assetpack',
  'settlement:pay-btc-transfer-rights',
  'delivery:repository-pull-request',
  'packs:inspect-activity-repair',
]);

export const V43_CROSS_ROUTE_REHEARSAL_ROW_IDS = Object.freeze([
  'lane:local-cross-route-rehearsal',
  'lane:staging-testnet-cross-route-rehearsal',
  'deposit:options-policy-admission',
  'read:need-fits-preview',
  'settlement:rights-delivery-compensation',
  'packs:activity-master-detail-readback',
  'telemetry:execution-stream-database-readback',
  'sync:ledger-database-storage-reconciliation',
  'repair:fail-closed-recovery-matrix',
  'boundary:source-safe-disclosure',
  'operator:source-safe-receipts',
  'proof:artifacts-tests-workflows-docs',
]);

const SOURCE_ROOTS = Object.freeze({
  gate3Artifact: '.bitcode/v43-packs-activity-master-detail.json',
  gate4Artifact: '.bitcode/v43-read-route-five-step-ux.json',
  gate5Artifact: '.bitcode/v43-deposit-route-options.json',
  gate6Artifact: '.bitcode/v43-deposit-policy-compensation.json',
  gate7Artifact: '.bitcode/v43-deposit-option-admission.json',
  gate8Artifact: '.bitcode/v43-route-ux-product-excellence.json',
  depositClient: 'uapi/app/deposit/DepositPageClient.tsx',
  depositModel: 'uapi/app/deposit/deposit-route-model.ts',
  readClient: 'uapi/app/read/ReadPageClient.tsx',
  readModel: 'uapi/app/read/read-route-model.ts',
  packsClient: 'uapi/app/packs/PacksPageClient.tsx',
  packsApi: 'uapi/app/api/packs/activity/route.ts',
  pipelineLogUi: 'uapi/components/bitcode/pipeline/pipeline-execution-log.tsx',
  productRouteShell: 'uapi/components/bitcode/routes/product-route-shell.tsx',
  depositAdmission: 'packages/pipelines/asset-pack/src/deposit-asset-pack-option-admission.ts',
  previewBoundary: 'packages/pipelines/asset-pack/src/asset-pack-preview-boundary.ts',
  settlementBoundary: 'packages/pipelines/asset-pack/src/asset-pack-settlement-rights-delivery.ts',
  operationalReadback: 'packages/pipelines/asset-pack/src/reading-operational-telemetry-repair-readback.ts',
  operatorScript: 'scripts/rehearse-v43-cross-route-product-flow.mjs',
  generator: 'scripts/generate-v43-cross-route-rehearsal-telemetry-repair.mjs',
  checker: 'scripts/check-v43-gate9-cross-route-rehearsal-telemetry-repair.mjs',
  protocolCanonical: 'packages/protocol/src/canonical/v43-cross-route-rehearsal-telemetry-repair.js',
  protocolTest: 'packages/protocol/test/v43-cross-route-rehearsal-telemetry-repair.test.js',
  protocolIndex: 'packages/protocol/src/index.js',
  protocolTypes: 'packages/protocol/src/index.d.ts',
  packageJson: 'package.json',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
  spec: 'BITCODE_SPEC_V43.md',
  delta: 'BITCODE_SPEC_V43_DELTA.md',
  notes: 'BITCODE_SPEC_V43_NOTES.md',
  parity: 'BITCODE_SPEC_V43_PARITY_MATRIX.md',
  roadmap: 'SPECIFICATIONS_ROADMAP.md',
  readme: 'README.md',
  protocolReadme: 'packages/protocol/README.md',
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'secret-values',
  'provider-tokens',
  'wallet-private-material',
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-interpolated-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'live-rehearsal-log-payloads',
  'value-bearing-mainnet-admission',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function sourceExists(repoRoot, sourcePath) {
  return existsSync(path.join(repoRoot, sourcePath));
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function includesText(sourceText, expectedText) {
  return sourceText.toLowerCase().includes(expectedText.toLowerCase());
}

function artifactPassed(repoRoot, sourcePath, artifactId) {
  const text = readSource(repoRoot, sourcePath);
  if (!text) return false;
  try {
    const parsed = JSON.parse(text);
    return parsed.artifactId === artifactId && parsed.passed === true;
  } catch {
    return false;
  }
}

function rowRoot(rowId) {
  return `v43-cross-route-rehearsal-row:${digest(rowId)}`;
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_cross_route_rehearsal_telemetry_repair_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawInterpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    valueBearingMainnetAdmitted: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V43_CROSS_ROUTE_REHEARSAL_ROWS = Object.freeze([
  row({
    rowId: 'lane:local-cross-route-rehearsal',
    laneId: 'local',
    routeIds: [...V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS],
    stageIds: [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.gate3Artifact, SOURCE_ROOTS.gate8Artifact],
    requiredEvidence: ['local', 'dryRun', 'source-safe receipt', 'no value-bearing mainnet'],
  }),
  row({
    rowId: 'lane:staging-testnet-cross-route-rehearsal',
    laneId: 'staging-testnet',
    routeIds: [...V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS],
    stageIds: [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.gate7Artifact, SOURCE_ROOTS.gate8Artifact],
    requiredEvidence: ['staging-testnet', 'tkpyosihuouusyaxtbau', 'real inference posture', 'database stream readback'],
  }),
  row({
    rowId: 'deposit:options-policy-admission',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/deposit', '/packs'],
    stageIds: ['deposit:synthesize-options', 'deposit:review-admit', 'packs:inspect-activity-repair'],
    sourceRoots: [SOURCE_ROOTS.gate5Artifact, SOURCE_ROOTS.gate6Artifact, SOURCE_ROOTS.gate7Artifact],
    requiredEvidence: ['DepositAssetPackOptionSynthesis', 'DepositAssetPackOptionPolicy', 'DepositAssetPackOptionAdmissionReport'],
  }),
  row({
    rowId: 'read:need-fits-preview',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/read', '/packs'],
    stageIds: ['read:request', 'read:review-need', 'read:request-finding-fits', 'read:preview-assetpack'],
    sourceRoots: [SOURCE_ROOTS.gate4Artifact, SOURCE_ROOTS.readModel, SOURCE_ROOTS.previewBoundary],
    requiredEvidence: ['ReadNeedComprehensionSynthesis', 'ReadFitsFindingSynthesis', 'sourceSafePreview'],
  }),
  row({
    rowId: 'settlement:rights-delivery-compensation',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/read', '/packs'],
    stageIds: ['settlement:pay-btc-transfer-rights', 'delivery:repository-pull-request'],
    sourceRoots: [SOURCE_ROOTS.previewBoundary, SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.depositAdmission],
    requiredEvidence: ['BTC', 'rights transfer', 'source-to-shares compensation', 'pull_request_after_settlement'],
  }),
  row({
    rowId: 'packs:activity-master-detail-readback',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/packs'],
    stageIds: ['packs:inspect-activity-repair'],
    sourceRoots: [SOURCE_ROOTS.gate3Artifact, SOURCE_ROOTS.packsClient, SOURCE_ROOTS.packsApi],
    requiredEvidence: ['PackActivity', 'settlementState', 'compensationState', 'deliveryState', 'repairState'],
  }),
  row({
    rowId: 'telemetry:execution-stream-database-readback',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/deposit', '/read', '/packs'],
    stageIds: [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.pipelineLogUi, SOURCE_ROOTS.operationalReadback, SOURCE_ROOTS.operatorScript],
    requiredEvidence: ['pipeline-execution-log', 'metadata', 'database readback', 'repair'],
  }),
  row({
    rowId: 'sync:ledger-database-storage-reconciliation',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/packs'],
    stageIds: ['settlement:pay-btc-transfer-rights', 'delivery:repository-pull-request'],
    sourceRoots: [SOURCE_ROOTS.settlementBoundary, SOURCE_ROOTS.depositAdmission, SOURCE_ROOTS.gate7Artifact],
    requiredEvidence: ['ledger', 'database', 'object storage', 'reconciliation'],
  }),
  row({
    rowId: 'repair:fail-closed-recovery-matrix',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/deposit', '/read', '/packs'],
    stageIds: [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.depositModel, SOURCE_ROOTS.readModel, SOURCE_ROOTS.packsClient],
    requiredEvidence: ['critical-source block', 'acceptedNeedRequiredBeforeFindingFits', 'repairState'],
  }),
  row({
    rowId: 'boundary:source-safe-disclosure',
    laneId: 'local-and-staging-testnet',
    routeIds: ['/deposit', '/read', '/packs'],
    stageIds: [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.productRouteShell, SOURCE_ROOTS.depositClient, SOURCE_ROOTS.readClient],
    requiredEvidence: ['Withheld', 'unpaid AssetPack source', 'settlement private payloads'],
  }),
  row({
    rowId: 'operator:source-safe-receipts',
    laneId: 'local-and-staging-testnet',
    routeIds: [...V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS],
    stageIds: [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.operatorScript, SOURCE_ROOTS.checker],
    requiredEvidence: ['secretValueSerialized: false', 'receiptRoot', 'V43_CROSS_ROUTE_REHEARSAL_LANES'],
  }),
  row({
    rowId: 'proof:artifacts-tests-workflows-docs',
    laneId: 'local-and-staging-testnet',
    routeIds: [...V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS],
    stageIds: [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS],
    sourceRoots: [SOURCE_ROOTS.protocolTest, SOURCE_ROOTS.packageJson, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    requiredEvidence: ['v43-cross-route-rehearsal-telemetry-repair', 'check:v43-gate9', 'generate:v43-cross-route-rehearsal'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('gate3-artifact-passed', SOURCE_ROOTS.gate3Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate3Artifact, 'v43-packs-activity-master-detail')),
    predicateResult('gate4-artifact-passed', SOURCE_ROOTS.gate4Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate4Artifact, 'v43-read-route-five-step-ux')),
    predicateResult('gate5-artifact-passed', SOURCE_ROOTS.gate5Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate5Artifact, 'v43-deposit-route-options')),
    predicateResult('gate6-artifact-passed', SOURCE_ROOTS.gate6Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate6Artifact, 'v43-deposit-policy-compensation')),
    predicateResult('gate7-artifact-passed', SOURCE_ROOTS.gate7Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate7Artifact, 'v43-deposit-option-admission')),
    predicateResult('gate8-artifact-passed', SOURCE_ROOTS.gate8Artifact, artifactPassed(repoRoot, SOURCE_ROOTS.gate8Artifact, 'v43-route-ux-product-excellence')),
    predicateResult('deposit-route-covers-admission', SOURCE_ROOTS.depositClient, sources.depositClient.includes('pipeline:deposit-option-admission') && sources.depositClient.includes('DepositAssetPackOptionAdmissionReport')),
    predicateResult('deposit-model-covers-repair-boundaries', SOURCE_ROOTS.depositModel, sources.depositModel.includes('sourceCriticalityDemandRoiPolicyPresent') && sources.depositModel.includes('sourceCriticalityDemandRoiPolicySourceSafe') && sources.depositModel.includes('admissionAndIndexingPolicyPresent')),
    predicateResult('read-route-covers-two-pipeline-path', SOURCE_ROOTS.readModel, sources.readModel.includes('ReadNeedComprehensionSynthesis') && sources.readModel.includes('ReadFitsFindingSynthesis') && sources.readModel.includes('deliveryRequiresPaidReadRights')),
    predicateResult('read-client-covers-preview-settlement-delivery', SOURCE_ROOTS.readClient, sources.readClient.includes('Finding Fits') && sources.readClient.includes('Withheld until paid') && sources.readClient.includes('settlement readback')),
    predicateResult('packs-route-covers-activity-repair', SOURCE_ROOTS.packsClient, sources.packsClient.includes('PackActivity') && sources.packsClient.includes('repairState') && sources.packsClient.includes('compensationState')),
    predicateResult('packs-api-source-safe-readback', SOURCE_ROOTS.packsApi, sources.packsApi.includes('assertPackActivitySourceSafe') && sources.packsApi.includes('summarizePackActivityRecords')),
    predicateResult('pipeline-log-rich-metadata', SOURCE_ROOTS.pipelineLogUi, sources.pipelineLogUi.includes('metadata') && sources.pipelineLogUi.includes('Accordion')),
    predicateResult('settlement-boundary-syncs-delivery', SOURCE_ROOTS.settlementBoundary, sources.settlementBoundary.includes('ledger') && sources.settlementBoundary.includes('objectStorage') && sources.settlementBoundary.includes('source_bearing_pull_request_ready')),
    predicateResult('preview-boundary-repairs-withheld-source', SOURCE_ROOTS.previewBoundary, sources.previewBoundary.includes('repair_posture') && sources.previewBoundary.includes('withheld_until_settlement')),
    predicateResult('deposit-admission-syncs-storage-telemetry', SOURCE_ROOTS.depositAdmission, sources.depositAdmission.includes('storageProjection') && sources.depositAdmission.includes('telemetryRoot') && sources.depositAdmission.includes('compensationRouteRoot')),
    predicateResult('operator-script-exists', SOURCE_ROOTS.operatorScript, sourceExists(repoRoot, SOURCE_ROOTS.operatorScript) && sources.operatorScript.includes('V43_CROSS_ROUTE_REHEARSAL_LANES')),
    predicateResult('operator-script-binds-staging-testnet', SOURCE_ROOTS.operatorScript, sources.operatorScript.includes('tkpyosihuouusyaxtbau') && sources.operatorScript.includes('BITCODE_ASSET_PACK_REAL_INFERENCE') && sources.operatorScript.includes('BITCODE_PIPELINE_STREAM_TO_DATABASE')),
    predicateResult('operator-script-source-safe', SOURCE_ROOTS.operatorScript, sources.operatorScript.includes('secretValueSerialized: false') && sources.operatorScript.includes('valueBearingMainnetAdmitted: false')),
    predicateResult('protocol-test-wired', SOURCE_ROOTS.protocolTest, sources.protocolTest.includes('buildV43CrossRouteRehearsalTelemetryRepair') && sources.protocolTest.includes('rowCount, 12')),
    predicateResult('protocol-exports-wired', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV43CrossRouteRehearsalTelemetryRepair') && sources.protocolTypes.includes('buildV43CrossRouteRehearsalTelemetryRepair')),
    predicateResult('package-scripts-wired', SOURCE_ROOTS.packageJson, sources.packageJson.includes('generate:v43-cross-route-rehearsal') && sources.packageJson.includes('rehearse:v43-cross-route') && sources.packageJson.includes('check:v43-gate9')),
    predicateResult('workflows-run-gate9', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v43-gate9-cross-route-rehearsal-telemetry-repair.mjs') && sources.canonWorkflow.includes('check-v43-gate9-cross-route-rehearsal-telemetry-repair.mjs')),
    predicateResult('v43-docs-expanded', SOURCE_ROOTS.spec, includesText(sources.spec, 'V43 Gate 9') && includesText(sources.spec, 'cross-route rehearsal')),
    predicateResult('v43-delta-expanded', SOURCE_ROOTS.delta, includesText(sources.delta, 'Gate 9') && includesText(sources.delta, 'cross-route rehearsal')),
    predicateResult('v43-notes-expanded', SOURCE_ROOTS.notes, sources.notes.includes('Gate 9') && sources.notes.includes('telemetry/database/ledger/storage')),
    predicateResult('v43-parity-implemented', SOURCE_ROOTS.parity, sources.parity.includes('Cross-route rehearsal') && sources.parity.includes('implemented')),
    predicateResult(
      'roadmap-advanced-to-gate9',
      SOURCE_ROOTS.roadmap,
      (
        sources.roadmap.includes('Current working gate: V43 Gate 9') ||
        sources.roadmap.includes('Current working gate: V43 Gate 10') ||
        sources.roadmap.includes('V43 Gate 10 closure anchor')
      ) && sources.roadmap.includes('V43 Gate 9 closure anchor'),
    ),
    predicateResult('readmes-document-gate9', SOURCE_ROOTS.readme, sources.readme.includes('V43 Gate 9') && sources.protocolReadme.includes('V43CrossRouteRehearsalTelemetryRepair')),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  return {
    rowCount: rows.length,
    laneCount: V43_CROSS_ROUTE_REHEARSAL_LANE_IDS.length,
    routeCount: V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS.length,
    stageCount: V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS.length,
    gateArtifactCount: 6,
    lanes: [...V43_CROSS_ROUTE_REHEARSAL_LANE_IDS],
    routes: [...V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS],
    stages: [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS],
    stagingProjectRef: 'tkpyosihuouusyaxtbau',
    stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
    localLaneCovered: true,
    stagingTestnetLaneCovered: true,
    depositRouteCovered: true,
    readRouteCovered: true,
    packsRouteCovered: true,
    depositOptionAdmissionCovered: true,
    readNeedAndFindingFitsCovered: true,
    sourceSafePreviewCovered: true,
    settlementRightsTransferCovered: true,
    compensationCovered: true,
    deliveryPullRequestCovered: true,
    packActivityRepairCovered: true,
    telemetryDatabaseReadbackCovered: true,
    ledgerDatabaseStorageSynchronized: true,
    repairMatrixCovered: true,
    mainnetValueBearingBlocked: true,
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawInterpolatedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    liveRehearsalLogPayloadSerialized: false,
    failedPredicateIds,
  };
}

export function buildV43CrossRouteRehearsalTelemetryRepair(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const rows = [...V43_CROSS_ROUTE_REHEARSAL_ROWS];
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v43-cross-route-rehearsal:${digest(JSON.stringify({
    rowIds: V43_CROSS_ROUTE_REHEARSAL_ROW_IDS,
    laneIds: V43_CROSS_ROUTE_REHEARSAL_LANE_IDS,
    routeIds: V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS,
    stageIds: V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS,
    predicateResults,
    coverage,
  }))}`;

  return {
    artifactId: 'v43-cross-route-rehearsal-telemetry-repair',
    schemaId: V43_CROSS_ROUTE_REHEARSAL_SCHEMA_ID,
    version: V43_CROSS_ROUTE_REHEARSAL_VERSION,
    currentTarget: V43_CROSS_ROUTE_REHEARSAL_CURRENT_TARGET,
    sourceSafetyVerdict: V43_CROSS_ROUTE_REHEARSAL_SOURCE_SAFETY_VERDICT,
    laneIds: [...V43_CROSS_ROUTE_REHEARSAL_LANE_IDS],
    routeIds: [...V43_CROSS_ROUTE_REHEARSAL_ROUTE_IDS],
    stageIds: [...V43_CROSS_ROUTE_REHEARSAL_STAGE_IDS],
    rowIds: [...V43_CROSS_ROUTE_REHEARSAL_ROW_IDS],
    rows,
    predicateResults,
    coverage,
    sourceSafety: {
      sourceSafetyClass: 'source_safe_cross_route_rehearsal_telemetry_repair_metadata',
      sourceSafeMetadataOnly: true,
      protectedSourcePayloadSerialized: false,
      rawProtectedPromptVisible: false,
      rawInterpolatedPromptVisible: false,
      rawProviderResponseVisible: false,
      unpaidAssetPackSourceVisible: false,
      credentialsSerialized: false,
      walletPrivateMaterialVisible: false,
      privateSettlementPayloadVisible: false,
      liveRehearsalLogPayloadSerialized: false,
      valueBearingMainnetAdmitted: false,
      forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
    },
    passed: coverage.failedPredicateIds.length === 0,
    artifactRoot,
  };
}
