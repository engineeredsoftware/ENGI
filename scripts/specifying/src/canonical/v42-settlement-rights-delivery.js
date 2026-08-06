// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V42_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH =
  '.proofs/v42/settlement-rights-delivery.json';
export const V42_SETTLEMENT_RIGHTS_DELIVERY_SCHEMA_ID =
  'bitcode.v42.settlementRightsDelivery.v1';
export const V42_SETTLEMENT_RIGHTS_DELIVERY_VERSION = 'V42';
export const V42_SETTLEMENT_RIGHTS_DELIVERY_CURRENT_TARGET = 'V41';
export const V42_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT =
  'source-safe-v42-settlement-rights-delivery-metadata';

export const V42_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS = Object.freeze([
  'purchase:quote-to-payment-observation',
  'finality:btc-testnet-confirmation-gate',
  'rights:btd-read-right-transfer',
  'compensation:source-to-shares-conservation',
  'delivery:source-bearing-pull-request-unlock',
  'sync:ledger-database-object-storage-reconciliation',
  'repair:fail-closed-settlement-posture',
  'route:harness-settlement-summary',
  'ui:terminal-settlement-readback',
  'host:live-harness-boundary-materialization',
  'proof:tests-artifact-workflow',
]);

const SOURCE_ROOTS = Object.freeze({
  boundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  boundaryTest: 'packages/asset-packs-pipelines/syntheses/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
  previewBoundary: 'packages/asset-packs-pipelines/syntheses/domain/src/asset-pack-preview-boundary.ts',
  postprocess: 'packages/asset-packs-pipelines/syntheses/domain/src/postprocess.ts',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  pipelineHostHarness: 'packages/pipeline-hosts/src/asset-pack-host-plan.ts',
  pipelineHostHarnessTest: 'packages/pipeline-hosts/src/__tests__/asset-pack-host-plan.test.ts',
  harnessRunner: 'apps/uapi/app/api/pipeline-host/asset-pack/runner.ts',
  harnessRouteTest: 'apps/uapi/tests/api/pipelineHostRoute.test.ts',
  terminalWorkbench: 'apps/uapi/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench.tsx',
  terminalHarnessClient: 'apps/uapi/components/bitcode/pipeline/PipelineHostClient/pipeline-host-client.ts',
  terminalHarnessClientTest: 'apps/uapi/tests/terminalPipelineHarnessClient.test.ts',
  btdReceipts: 'packages/btd/src/receipts.ts',
  btdSourceToShares: 'packages/btd/src/source-to-shares.ts',
  btdSettlement: 'packages/btd/src/settlement.ts',
  btdReconciliation: 'packages/btd/src/reconciliation.ts',
  protocolReadme: 'scripts/specifying/README.md',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  terminalReadme: 'apps/uapi/components/README.md',
  rootReadme: 'README.md',
  v42Spec: '.specifications/BITCODE_SPEC_V42.md',
  v42Delta: '.specifications/BITCODE_SPEC_V42_DELTA.md',
  v42Notes: '.specifications/BITCODE_SPEC_V42_NOTES.md',
  v42Parity: '.specifications/BITCODE_SPEC_V42_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  packageJson: 'package.json',
  protocolIndex: 'scripts/specifying/src/index.js',
  protocolTypes: 'scripts/specifying/src/index.d.ts',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'wallet-private-material',
  'settlement-private-payloads',
  'secret-values',
]);

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v42-settlement-rights-delivery-row:${digest(id)}`;
}

function readSource(repoRoot, sourcePath) {
  const absolutePath = path.join(repoRoot, sourcePath);
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';
}

function predicateResult(id, sourcePath, passed) {
  return { id, sourcePath, passed: Boolean(passed) };
}

function settlementFinalityTestsCovered(boundaryTest) {
  return (
    boundaryTest.includes('fails closed until BTC finality is confirmed') ||
    (
      boundaryTest.includes('fails closed for %s BTC state before finality') &&
      boundaryTest.includes("'prepared'") &&
      boundaryTest.includes("'signed'") &&
      boundaryTest.includes("'broadcast'") &&
      boundaryTest.includes("'observed'")
    )
  ) && boundaryTest.includes('blocked_until_payment_finality');
}

function row(input) {
  return {
    ...input,
    rowRoot: rowRoot(input.rowId),
    sourceSafetyClass: 'source_safe_v42_settlement_rights_delivery_metadata',
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    credentialsSerialized: false,
    forbiddenPayloadClasses: [...FORBIDDEN_PAYLOAD_CLASSES],
  };
}

export const V42_SETTLEMENT_RIGHTS_DELIVERY_ROWS = Object.freeze([
  row({
    rowId: 'purchase:quote-to-payment-observation',
    purpose:
      'Convert the Gate 5 deterministic quote into a reader BTC payment observation without server custody or private wallet material.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.previewBoundary, SOURCE_ROOTS.harnessRunner],
    emittedTypes: ['AssetPackSettlementPaymentObservation', 'AssetPackPreviewQuoteReceipt'],
    requiredEvidence: ['expectedSats', 'observedDebitSats', 'observedCreditSats', 'serverCustody: false'],
  }),
  row({
    rowId: 'finality:btc-testnet-confirmation-gate',
    purpose:
      'Require confirmed BTC/testnet finality before BTD rights transfer, source unlock, or source-bearing repository delivery.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.boundaryTest, SOURCE_ROOTS.btdReceipts],
    emittedTypes: ['AssetPackSettlementFinalityReceipt', 'BtdRightsTransferReceipt'],
    requiredEvidence: ['finalityState', 'confirmed', 'Rights transfer receipt requires confirmed BTC fee finality'],
  }),
  row({
    rowId: 'rights:btd-read-right-transfer',
    purpose:
      'Transfer the BTD read right to the paying reader only after the quote, payment, finality, and conservation checks agree.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.btdReceipts, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['BtdRightsTransferReceipt', 'BtdReadReceipt'],
    requiredEvidence: ['buildBtdRightsTransferReceipt', 'buildBtdReadReceipt', 'paid_unlocked', 'licensed_read'],
  }),
  row({
    rowId: 'compensation:source-to-shares-conservation',
    purpose:
      'Allocate BTC sats to selected fit deposits with deterministic source-to-shares conservation and proof roots.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.btdSourceToShares, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['SourceToSharesProof', 'settlementConservation'],
    requiredEvidence: ['buildSourceToSharesProof', 'settlementAllocations', 'balanced'],
  }),
  row({
    rowId: 'delivery:source-bearing-pull-request-unlock',
    purpose:
      'Unlock the source-bearing pull request only after payment finality, BTD rights, compensation, and reconciliation readbacks pass.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.btdSettlement, SOURCE_ROOTS.terminalWorkbench],
    emittedTypes: ['AssetPackDeliveryUnlockReceipt', 'AssetPackSettlementUnlock'],
    requiredEvidence: ['source_bearing_pull_request_ready', 'pull_request_after_settlement', 'sourceBearingDeliveryVisibleToReader'],
  }),
  row({
    rowId: 'sync:ledger-database-object-storage-reconciliation',
    purpose:
      'Synchronize ledger facts, database projections, object storage roots, and staging-testnet readback before delivery is visible.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.btdReconciliation, SOURCE_ROOTS.harnessRunner],
    emittedTypes: ['LedgerDatabaseReconciliationReport'],
    requiredEvidence: ['reconcileLedgerDatabaseProjection', 'buildSupabaseStagingTestnetProjectionReadback', 'tkpyosihuouusyaxtbau'],
  }),
  row({
    rowId: 'repair:fail-closed-settlement-posture',
    purpose:
      'Represent underpayment, missing finality, projection drift, and missing delivery as repairable blockers without leaking source.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['AssetPackSettlementRightsDeliveryRepairPosture'],
    requiredEvidence: ['blocked_until_payment_finality', 'blocked_until_compensation_conservation', 'blocked_until_projection_repair'],
  }),
  row({
    rowId: 'route:harness-settlement-summary',
    purpose:
      'Summarize payment, finality, rights, source-to-shares, delivery, reconciliation, replay, and storage roots through the harness route.',
    sourceRoots: [SOURCE_ROOTS.harnessRunner, SOURCE_ROOTS.harnessRouteTest],
    emittedTypes: ['assetPackSettlementRightsDeliveryBoundary', 'assetPackDeliveryUnlock'],
    requiredEvidence: ['summarizeAssetPackSettlementRightsDeliveryBoundary', 'assetPackLedgerDatabaseStorageReconciliation'],
  }),
  row({
    rowId: 'ui:terminal-settlement-readback',
    purpose:
      'Render settlement rights, compensation, delivery, replay, and reconciliation readback in product expandable metadata.',
    sourceRoots: [SOURCE_ROOTS.terminalWorkbench, SOURCE_ROOTS.terminalHarnessClient, SOURCE_ROOTS.terminalHarnessClientTest],
    emittedTypes: ['assetPackSettlementBoundaryRows', 'TerminalReadFitsFindingSynthesisHarnessStreamSnapshot'],
    requiredEvidence: ['Settlement rights, compensation, and delivery', 'settlement-boundary', 'delivery-unlock'],
  }),
  row({
    rowId: 'host:live-harness-boundary-materialization',
    purpose:
      'Materialize AssetPackPreviewBoundary and AssetPackSettlementRightsDeliveryBoundary inside the live sandbox harness output.',
    sourceRoots: [SOURCE_ROOTS.pipelineHostHarness, SOURCE_ROOTS.pipelineHostHarnessTest],
    emittedTypes: ['assetPackPreviewBoundary', 'assetPackSettlementRightsDeliveryBoundary'],
    requiredEvidence: ['buildAssetPackSettlementRightsDeliveryBoundary', 'persistAssetPackSettlementRightsDeliveryBoundary'],
  }),
  row({
    rowId: 'proof:tests-artifact-workflow',
    purpose:
      'Bind V42 Gate 6 closure to generated artifact, protocol test, package tests, harness route tests, docs, and workflow checks.',
    sourceRoots: [SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow, SOURCE_ROOTS.packageJson],
    emittedTypes: ['V42SettlementRightsDelivery'],
    requiredEvidence: ['check-v42-gate6-settlement-rights-delivery.mjs', 'v42-settlement-rights-delivery'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const sources = Object.fromEntries(
    Object.entries(SOURCE_ROOTS).map(([key, sourcePath]) => [key, readSource(repoRoot, sourcePath)]),
  );

  return [
    predicateResult('boundary-defines-core-types', SOURCE_ROOTS.boundary, sources.boundary.includes('AssetPackSettlementRightsDeliveryBoundary') && sources.boundary.includes('AssetPackSettlementPaymentObservation') && sources.boundary.includes('AssetPackDeliveryUnlockReceipt')),
    predicateResult('boundary-composes-btd-primitives', SOURCE_ROOTS.boundary, sources.boundary.includes('buildBtdRightsTransferReceipt') && sources.boundary.includes('buildBtdReadReceipt') && sources.boundary.includes('buildAssetPackSettlementUnlock')),
    predicateResult('boundary-builds-source-to-shares', SOURCE_ROOTS.boundary, sources.boundary.includes('buildSourceToSharesProof') && sources.btdSourceToShares.includes('settlementConservation')),
    predicateResult('boundary-builds-reconciliation', SOURCE_ROOTS.boundary, sources.boundary.includes('reconcileLedgerDatabaseProjection') && sources.btdReconciliation.includes('objectStorageArtifacts')),
    predicateResult('boundary-source-safety', SOURCE_ROOTS.boundary, sources.boundary.includes('source_safe_settlement_rights_delivery_boundary') && sources.boundary.includes('walletPrivateMaterialVisible: false')),
    predicateResult('tests-cover-confirmed-delivery', SOURCE_ROOTS.boundaryTest, sources.boundaryTest.includes('unlocks BTD rights') && sources.boundaryTest.includes('settlement_delivered')),
    predicateResult('tests-cover-underpayment', SOURCE_ROOTS.boundaryTest, sources.boundaryTest.includes('fails closed when BTC payment is underpaid') && sources.boundaryTest.includes('blocked_until_compensation_conservation')),
    predicateResult('tests-cover-finality', SOURCE_ROOTS.boundaryTest, settlementFinalityTestsCovered(sources.boundaryTest)),
    predicateResult('tests-cover-reconciliation-drift', SOURCE_ROOTS.boundaryTest, sources.boundaryTest.includes('ledger, database, or object storage projections drift') && sources.boundaryTest.includes('blocked_until_projection_repair')),
    predicateResult('host-materializes-boundary', SOURCE_ROOTS.pipelineHostHarness, sources.pipelineHostHarness.includes('buildAssetPackSettlementRightsDeliveryBoundary') && sources.pipelineHostHarness.includes('assetPackSettlementRightsDeliveryBoundary')),
    predicateResult('host-test-covers-boundary', SOURCE_ROOTS.pipelineHostHarnessTest, sources.pipelineHostHarnessTest.includes('buildAssetPackSettlementRightsDeliveryBoundary') && sources.pipelineHostHarnessTest.includes('assetPackSettlementRightsDeliveryBoundary')),
    predicateResult('route-summarizes-boundary', SOURCE_ROOTS.harnessRunner, sources.harnessRunner.includes('summarizeAssetPackSettlementRightsDeliveryBoundary') && sources.harnessRunner.includes('assetPackLedgerDatabaseStorageReconciliation')),
    predicateResult('route-test-covers-boundary', SOURCE_ROOTS.harnessRouteTest, sources.harnessRouteTest.includes('assetPackSettlementRightsDeliveryBoundary') && sources.harnessRouteTest.includes('source_bearing_pull_request_ready')),
    predicateResult('terminal-renders-boundary', SOURCE_ROOTS.terminalWorkbench, sources.terminalWorkbench.includes('Settlement rights, compensation, and delivery') && sources.terminalWorkbench.includes('assetPackSettlementBoundaryRows')),
    predicateResult('terminal-client-summarizes-boundary', SOURCE_ROOTS.terminalHarnessClient, sources.terminalHarnessClient.includes('settlement-boundary') && sources.terminalHarnessClient.includes('delivery-unlock')),
    predicateResult('terminal-client-test-covers-boundary', SOURCE_ROOTS.terminalHarnessClientTest, sources.terminalHarnessClientTest.includes('settlement-boundary settlement_delivered') && sources.terminalHarnessClientTest.includes('reconciliation aligned')),
    predicateResult('v42-spec-expanded', SOURCE_ROOTS.v42Spec, sources.v42Spec.includes('V42 Gate 6') && sources.v42Spec.includes('AssetPackSettlementRightsDeliveryBoundary')),
    predicateResult('v42-delta-expanded', SOURCE_ROOTS.v42Delta, sources.v42Delta.includes('Gate 6') && sources.v42Delta.includes('settlement rights transfer')),
    predicateResult('v42-notes-expanded', SOURCE_ROOTS.v42Notes, sources.v42Notes.includes('Gate 6') && sources.v42Notes.includes('source-to-shares compensation')),
    predicateResult('v42-parity-implemented', SOURCE_ROOTS.v42Parity, sources.v42Parity.includes('Settlement and delivery') && sources.v42Parity.includes('implemented')),
    predicateResult('roadmap-records-gate6-closure', SOURCE_ROOTS.roadmap, sources.roadmap.includes('V42 Gate 6 closure anchor') && sources.roadmap.includes('check:v42-gate6')),
    predicateResult('readmes-document-gate6', SOURCE_ROOTS.rootReadme, sources.rootReadme.includes('V42 Gate 6') && sources.assetPackReadme.includes('Settlement Rights Delivery') && sources.protocolReadme.includes('V42SettlementRightsDelivery') && sources.terminalReadme.includes('Settlement rights')),
    predicateResult('protocol-exports-gate6', SOURCE_ROOTS.protocolIndex, sources.protocolIndex.includes('buildV42SettlementRightsDelivery') && sources.protocolTypes.includes('buildV42SettlementRightsDelivery')),
    predicateResult('package-scripts-wire-gate6', SOURCE_ROOTS.packageJson, sources.packageJson.includes('generate:v42-settlement-rights-delivery') && sources.packageJson.includes('check:v42-gate6')),
    predicateResult('workflows-run-gate6-check', SOURCE_ROOTS.gateWorkflow, sources.gateWorkflow.includes('check-v42-gate6-settlement-rights-delivery.mjs') && sources.canonWorkflow.includes('check-v42-gate6-settlement-rights-delivery.mjs')),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  return {
    rowCount: rows.length,
    sourceSafetyVerdict: V42_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT,
    runtimeType: 'AssetPackSettlementRightsDeliveryBoundary',
    paymentType: 'AssetPackSettlementPaymentObservation',
    btcSettlementReadbackType: 'AssetPackBtcSettlementReadback',
    finalityType: 'AssetPackSettlementFinalityReceipt',
    rightsTransferType: 'BtdRightsTransferReceipt',
    readReceiptType: 'BtdReadReceipt',
    sourceToSharesType: 'SourceToSharesProof',
    reconciliationType: 'LedgerDatabaseReconciliationReport',
    deliveryType: 'AssetPackDeliveryUnlockReceipt',
    replayType: 'AssetPackSettlementRightsDeliveryReplayReceipt',
    requiredReadbacksBeforeUnlock: [
      'btc_payment_observation',
      'settlement_finality',
      'source_to_shares_compensation',
      'btd_rights_transfer',
      'ledger_database_storage_reconciliation',
    ],
    stagingProjectRef: 'tkpyosihuouusyaxtbau',
    stagingRestHost: 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
    sourceSafeMetadataOnly: true,
    protectedSourcePayloadSerialized: false,
    unpaidAssetPackSourceVisible: false,
    walletPrivateMaterialVisible: false,
    settlementPrivatePayloadVisible: false,
    credentialsSerialized: false,
    hostBoundaryMaterializationCovered: predicateResults.some((predicate) => predicate.id === 'host-materializes-boundary' && predicate.passed),
    routeReadbackCovered: predicateResults.some((predicate) => predicate.id === 'route-summarizes-boundary' && predicate.passed),
    terminalReadbackCovered: predicateResults.some((predicate) => predicate.id === 'terminal-renders-boundary' && predicate.passed),
    confirmedPaymentCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-confirmed-delivery' && predicate.passed),
    underpaymentBlockedCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-underpayment' && predicate.passed),
    finalityBlockedCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-finality' && predicate.passed),
    reconciliationRepairCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-reconciliation-drift' && predicate.passed),
    failedPredicateIds,
  };
}

export function buildV42SettlementRightsDelivery(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const rows = [...V42_SETTLEMENT_RIGHTS_DELIVERY_ROWS];
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v42-settlement-rights-delivery:${digest(JSON.stringify({
    rowIds: V42_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS,
    predicateResults,
    coverage,
  }))}`;

  return {
    artifactId: 'v42-settlement-rights-delivery',
    schemaId: V42_SETTLEMENT_RIGHTS_DELIVERY_SCHEMA_ID,
    version: V42_SETTLEMENT_RIGHTS_DELIVERY_VERSION,
    currentTarget: V42_SETTLEMENT_RIGHTS_DELIVERY_CURRENT_TARGET,
    sourceSafetyVerdict: V42_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT,
    rowIds: [...V42_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS],
    rows,
    predicateResults,
    coverage,
    passed: coverage.failedPredicateIds.length === 0,
    artifactRoot,
  };
}
