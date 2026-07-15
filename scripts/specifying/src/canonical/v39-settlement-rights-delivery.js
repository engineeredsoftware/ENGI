// @ts-check

import crypto from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export const V39_SETTLEMENT_RIGHTS_DELIVERY_ARTIFACT_PATH =
  '.proofs/v39/settlement-rights-delivery.json';
export const V39_SETTLEMENT_RIGHTS_DELIVERY_SCHEMA_ID =
  'bitcode.v39.settlementRightsDelivery.v1';
export const V39_SETTLEMENT_RIGHTS_DELIVERY_VERSION = 'V39';
export const V39_SETTLEMENT_RIGHTS_DELIVERY_CURRENT_TARGET = 'V38';
export const V39_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT =
  'source-safe-settlement-rights-delivery';

export const V39_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS = Object.freeze([
  'settlement:btc-payment-finality',
  'rights:btd-transfer-receipt',
  'compensation:source-to-shares-conservation',
  'delivery:post-settlement-pr-unlock',
  'sync:ledger-database-storage-reconciliation',
  'repair:fail-closed-boundary',
  'storage:settlement-projection',
  'replay:settlement-rights-delivery-receipt',
  'proof:tests-artifact-workflow',
]);

const FORBIDDEN_PAYLOAD_CLASSES = Object.freeze([
  'protected-source-payloads',
  'raw-protected-prompts',
  'raw-provider-responses',
  'unpaid-assetpack-source',
  'wallet-private-material',
  'settlement-private-payloads',
  'secret-values',
]);

const SOURCE_ROOTS = Object.freeze({
  boundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
  boundaryTest: 'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
  previewBoundary: 'packages/asset-packs-pipelines/domain/src/asset-pack-preview-boundary.ts',
  postprocess: 'packages/asset-packs-pipelines/domain/src/postprocess.ts',
  packageIndex: 'packages/asset-packs-pipelines/domain/src/index.ts',
  packageJson: 'packages/asset-packs-pipelines/domain/package.json',
  packageJest: 'packages/asset-packs-pipelines/domain/jest.config.cjs',
  btdPackageJson: 'packages/btd/package.json',
  btdReceipts: 'packages/btd/src/receipts.ts',
  btdSourceToShares: 'packages/btd/src/source-to-shares.ts',
  btdSettlement: 'packages/btd/src/settlement.ts',
  btdReconciliation: 'packages/btd/src/reconciliation.ts',
  tsconfig: 'tsconfig.json',
  assetPackReadme: 'packages/asset-packs-pipelines/domain/README.md',
  protocolReadme: 'scripts/specifying/README.md',
  v39Spec: '.specifications/BITCODE_SPEC_V39.md',
  v39Delta: '.specifications/BITCODE_SPEC_V39_DELTA.md',
  v39Notes: '.specifications/BITCODE_SPEC_V39_NOTES.md',
  v39Parity: '.specifications/BITCODE_SPEC_V39_PARITY_MATRIX.md',
  roadmap: '.specifications/SPECIFICATIONS_ROADMAP.md',
  rootReadme: 'README.md',
  gateWorkflow: '.github/workflows/bitcode-gate-quality.yml',
  canonWorkflow: '.github/workflows/bitcode-canon-quality.yml',
});

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function rowRoot(id) {
  return `v39-settlement-rights-delivery-row:${digest(id)}`;
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
    sourceSafetyClass: 'source_safe_settlement_rights_delivery_boundary',
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

export const V39_SETTLEMENT_RIGHTS_DELIVERY_ROWS = Object.freeze([
  row({
    rowId: 'settlement:btc-payment-finality',
    purpose:
      'Observe reader BTC payment against the deterministic quote and bind finality before rights or delivery unlock.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.boundaryTest, SOURCE_ROOTS.btdSettlement],
    emittedTypes: ['AssetPackSettlementPaymentObservation', 'AssetPackSettlementFinalityReceipt'],
    requiredEvidence: ['observedDebitSats', 'observedCreditSats', 'finalityState', 'serverCustody: false'],
  }),
  row({
    rowId: 'rights:btd-transfer-receipt',
    purpose:
      'Mint or transfer the AssetPack BTD read right to the reader only after confirmed BTC fee finality.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.btdReceipts, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['BtdRightsTransferReceipt', 'BtdReadReceipt'],
    requiredEvidence: ['buildBtdRightsTransferReceipt', 'btcFeeFinalityState', 'protectedSourceVisible'],
  }),
  row({
    rowId: 'compensation:source-to-shares-conservation',
    purpose:
      'Allocate settlement sats to selected fit deposits with source-to-shares conservation and contributor traceability.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.btdSourceToShares, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['SourceToSharesProof'],
    requiredEvidence: ['buildSourceToSharesProof', 'settlementConservation', 'settlementAllocations'],
  }),
  row({
    rowId: 'delivery:post-settlement-pr-unlock',
    purpose:
      'Unlock source-bearing pull-request delivery only after payment, rights transfer, compensation, and projection readback agree.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.btdSettlement, SOURCE_ROOTS.postprocess],
    emittedTypes: ['AssetPackDeliveryUnlockReceipt', 'AssetPackSettlementUnlock'],
    requiredEvidence: ['source_bearing_pull_request_ready', 'pull_request_after_settlement', 'sourceBearingDeliveryVisibleToReader'],
  }),
  row({
    rowId: 'sync:ledger-database-storage-reconciliation',
    purpose:
      'Synchronize ledger facts, database projections, object-storage artifacts, and staging-testnet readback before delivery.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.btdReconciliation, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['LedgerDatabaseReconciliationReport'],
    requiredEvidence: ['reconcileLedgerDatabaseProjection', 'buildSupabaseStagingTestnetProjectionReadback', 'objectStorageArtifacts'],
  }),
  row({
    rowId: 'repair:fail-closed-boundary',
    purpose:
      'Represent underpayment, missing finality, projection drift, and missing delivery as auditable blockers and repair actions.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['AssetPackSettlementRightsDeliveryRepairPosture'],
    requiredEvidence: ['blocked_until_compensation_conservation', 'blocked_until_payment_finality', 'blocked_until_projection_repair'],
  }),
  row({
    rowId: 'storage:settlement-projection',
    purpose:
      'Persist source-safe payment, finality, source-to-shares, BTD receipt, delivery, reconciliation, replay, and repair records.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.packageIndex, SOURCE_ROOTS.postprocess],
    emittedTypes: ['AssetPackSettlementRightsDeliveryStorageRecord'],
    requiredEvidence: ['asset-pack/settlement', 'storageProjection', 'rightsTransferReceipt'],
  }),
  row({
    rowId: 'replay:settlement-rights-delivery-receipt',
    purpose:
      'Replay settlement, rights transfer, compensation, synchronization, and delivery unlock from proof roots.',
    sourceRoots: [SOURCE_ROOTS.boundary, SOURCE_ROOTS.boundaryTest],
    emittedTypes: ['AssetPackSettlementRightsDeliveryReplayReceipt'],
    requiredEvidence: ['settlement-rights-delivery-replay', 'paymentMatchesQuote', 'deliveryUnlockedOnlyAfterSettlement'],
  }),
  row({
    rowId: 'proof:tests-artifact-workflow',
    purpose:
      'Bind Gate 7 closure to package tests, protocol artifact tests, generated artifact, docs, package exports, and workflow wiring.',
    sourceRoots: [SOURCE_ROOTS.boundaryTest, SOURCE_ROOTS.gateWorkflow, SOURCE_ROOTS.canonWorkflow],
    emittedTypes: ['V39SettlementRightsDelivery'],
    requiredEvidence: ['check-v39-gate7-settlement-rights-delivery.mjs', 'v39-settlement-rights-delivery'],
  }),
]);

function buildPredicateResults(repoRoot) {
  const boundary = readSource(repoRoot, SOURCE_ROOTS.boundary);
  const boundaryTest = readSource(repoRoot, SOURCE_ROOTS.boundaryTest);
  const postprocess = readSource(repoRoot, SOURCE_ROOTS.postprocess);
  const packageIndex = readSource(repoRoot, SOURCE_ROOTS.packageIndex);
  const packageJson = readSource(repoRoot, SOURCE_ROOTS.packageJson);
  const packageJest = readSource(repoRoot, SOURCE_ROOTS.packageJest);
  const btdPackageJson = readSource(repoRoot, SOURCE_ROOTS.btdPackageJson);
  const btdReceipts = readSource(repoRoot, SOURCE_ROOTS.btdReceipts);
  const btdSourceToShares = readSource(repoRoot, SOURCE_ROOTS.btdSourceToShares);
  const btdSettlement = readSource(repoRoot, SOURCE_ROOTS.btdSettlement);
  const btdReconciliation = readSource(repoRoot, SOURCE_ROOTS.btdReconciliation);
  const tsconfig = readSource(repoRoot, SOURCE_ROOTS.tsconfig);
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
    predicateResult('boundary-defines-core-types', SOURCE_ROOTS.boundary, boundary.includes('AssetPackSettlementRightsDeliveryBoundary') && boundary.includes('AssetPackSettlementPaymentObservation') && boundary.includes('AssetPackDeliveryUnlockReceipt')),
    predicateResult('boundary-composes-btd-primitives', SOURCE_ROOTS.boundary, boundary.includes('buildBtdRightsTransferReceipt') && boundary.includes('buildBtdReadReceipt') && boundary.includes('buildAssetPackSettlementUnlock')),
    predicateResult('boundary-builds-source-to-shares', SOURCE_ROOTS.boundary, boundary.includes('buildSourceToSharesProof') && boundary.includes('assertSourceToSharesSettlementAdmissible') && btdSourceToShares.includes('settlementConservation')),
    predicateResult('boundary-builds-reconciliation', SOURCE_ROOTS.boundary, boundary.includes('reconcileLedgerDatabaseProjection') && boundary.includes('buildSupabaseStagingTestnetProjectionReadback') && btdReconciliation.includes('objectStorageArtifacts')),
    predicateResult('boundary-fail-closed-states', SOURCE_ROOTS.boundary, boundary.includes('blocked_until_payment_finality') && boundary.includes('blocked_until_compensation_conservation') && boundary.includes('blocked_until_projection_repair')),
    predicateResult('boundary-source-safety', SOURCE_ROOTS.boundary, boundary.includes('source_safe_settlement_rights_delivery_boundary') && boundary.includes('protectedSourcePayloadSerialized: false') && boundary.includes('walletPrivateMaterialVisible: false')),
    predicateResult('receipts-enforce-confirmed-finality', SOURCE_ROOTS.btdReceipts, btdReceipts.includes('Rights transfer receipt requires confirmed BTC fee finality') && btdReceipts.includes('deliveryAdmissionState')),
    predicateResult('settlement-unlock-enforces-readback', SOURCE_ROOTS.btdSettlement, btdSettlement.includes('REQUIRED_ASSET_PACK_SETTLEMENT_READBACK_KEYS') && btdSettlement.includes('buildAssetPackSettlementUnlock')),
    predicateResult('package-exports-boundary', SOURCE_ROOTS.packageJson, packageJson.includes('./asset-pack-settlement-rights-delivery') && packageIndex.includes("export * from './asset-pack-settlement-rights-delivery'")),
    predicateResult('btd-subpaths-exported', SOURCE_ROOTS.btdPackageJson, btdPackageJson.includes('./receipts') && btdPackageJson.includes('./source-to-shares') && btdPackageJson.includes('./reconciliation') && tsconfig.includes('@bitcode/btd/source-to-shares')),
    predicateResult('jest-maps-btd-subpaths', SOURCE_ROOTS.packageJest, packageJest.includes('^@bitcode/btd/(.*)$')),
    predicateResult('postprocess-optionally-emits-settlement', SOURCE_ROOTS.postprocess, postprocess.includes('ensureAssetPackSettlementRightsDeliveryBoundary') && postprocess.includes('assetPackSettlementRightsDeliveryBoundary')),
    predicateResult('tests-cover-confirmed-delivery', SOURCE_ROOTS.boundaryTest, boundaryTest.includes('unlocks BTD rights') && boundaryTest.includes('settlement_delivered')),
    predicateResult('tests-cover-underpayment', SOURCE_ROOTS.boundaryTest, boundaryTest.includes('fails closed when BTC payment is underpaid') && boundaryTest.includes('blocked_until_compensation_conservation')),
    predicateResult('tests-cover-finality', SOURCE_ROOTS.boundaryTest, settlementFinalityTestsCovered(boundaryTest)),
    predicateResult('tests-cover-reconciliation-drift', SOURCE_ROOTS.boundaryTest, boundaryTest.includes('ledger, database, or object storage projections drift') && boundaryTest.includes('blocked_until_projection_repair')),
    predicateResult('spec-gate7-expanded', SOURCE_ROOTS.v39Spec, spec.includes('AssetPackSettlementRightsDeliveryBoundary') && spec.includes('v39-settlement-rights-delivery')),
    predicateResult('delta-gate7-expanded', SOURCE_ROOTS.v39Delta, delta.includes('Gate 7') && delta.includes('AssetPackSettlementRightsDeliveryBoundary')),
    predicateResult('notes-gate7-expanded', SOURCE_ROOTS.v39Notes, notes.includes('Gate 7 implementation notes') && notes.includes('source-to-shares compensation')),
    predicateResult('parity-gate7-expanded', SOURCE_ROOTS.v39Parity, parity.includes('Gate 7 Parity') && parity.includes('AssetPackSettlementRightsDeliveryBoundary')),
    predicateResult(
      'roadmap-advanced-to-gate7',
      SOURCE_ROOTS.roadmap,
      roadmap.includes('V39 Gate 7 closure anchor') &&
        (/Current working gate: V39 Gate (?:7|8|9|10|11)\b/u.test(roadmap) ||
          roadmap.includes('Latest closed version: V39 Commercial Reading Readiness') ||
          roadmap.includes('Recent V39 closure anchor')),
    ),
    predicateResult('readmes-document-gate7', SOURCE_ROOTS.rootReadme, rootReadme.includes('V39 Gate 7') && assetPackReadme.includes('Settlement Rights Delivery') && protocolReadme.includes('V39SettlementRightsDelivery')),
    predicateResult('workflows-run-gate7-check', SOURCE_ROOTS.gateWorkflow, gateWorkflow.includes('check-v39-gate7-settlement-rights-delivery.mjs') && canonWorkflow.includes('check-v39-gate7-settlement-rights-delivery.mjs')),
  ];
}

function buildCoverage(rows, predicateResults) {
  const failedPredicateIds = predicateResults.filter((predicate) => !predicate.passed).map((predicate) => predicate.id);
  return {
    rowCount: rows.length,
    sourceSafetyVerdict: V39_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT,
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
    storageRecordKinds: [
      'btc_payment_observation',
      'btc_settlement_readback',
      'settlement_finality',
      'source_to_shares_compensation',
      'btd_read_receipt',
      'btd_rights_transfer',
      'delivery_unlock',
      'ledger_database_storage_reconciliation',
      'replay_receipt',
      'repair_posture',
    ],
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
    confirmedPaymentCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-confirmed-delivery' && predicate.passed),
    underpaymentBlockedCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-underpayment' && predicate.passed),
    finalityBlockedCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-finality' && predicate.passed),
    reconciliationRepairCovered: predicateResults.some((predicate) => predicate.id === 'tests-cover-reconciliation-drift' && predicate.passed),
    btdRightsTransferCovered: predicateResults.some((predicate) => predicate.id === 'boundary-composes-btd-primitives' && predicate.passed),
    sourceToSharesCovered: predicateResults.some((predicate) => predicate.id === 'boundary-builds-source-to-shares' && predicate.passed),
    failedPredicateIds,
  };
}

export function buildV39SettlementRightsDelivery(input = {}) {
  const repoRoot = input.repoRoot || DEFAULT_REPO_ROOT;
  const predicateResults = buildPredicateResults(repoRoot);
  const rows = [...V39_SETTLEMENT_RIGHTS_DELIVERY_ROWS];
  const coverage = buildCoverage(rows, predicateResults);
  const artifactRoot = `v39-settlement-rights-delivery:${digest(JSON.stringify({
    rowIds: V39_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS,
    predicateResults,
    coverage,
  }))}`;

  return {
    artifactId: 'v39-settlement-rights-delivery',
    schemaId: V39_SETTLEMENT_RIGHTS_DELIVERY_SCHEMA_ID,
    version: V39_SETTLEMENT_RIGHTS_DELIVERY_VERSION,
    currentTarget: V39_SETTLEMENT_RIGHTS_DELIVERY_CURRENT_TARGET,
    sourceSafetyVerdict: V39_SETTLEMENT_RIGHTS_DELIVERY_SOURCE_SAFETY_VERDICT,
    rowIds: [...V39_SETTLEMENT_RIGHTS_DELIVERY_ROW_IDS],
    rows,
    predicateResults,
    coverage,
    passed: coverage.failedPredicateIds.length === 0,
    artifactRoot,
  };
}
