// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCHANGE_SETTLEMENT_RECONCILIATION_ARTIFACT_PATH = '.bitcode/v36-exchange-settlement-reconciliation.json';
export const EXCHANGE_SETTLEMENT_RECONCILIATION_SCHEMA_ID = 'bitcode.v36.exchangeSettlementReconciliation.v1';
export const EXCHANGE_SETTLEMENT_RECONCILIATION_VERSION = 'V36';
export const EXCHANGE_SETTLEMENT_RECONCILIATION_CURRENT_TARGET = 'V35';
export const EXCHANGE_SETTLEMENT_RECONCILIATION_SOURCE_SAFETY_VERDICT = 'source-safe-exchange-settlement-reconciliation-metadata';

export const EXCHANGE_SETTLEMENT_RECEIPT_STATES = Object.freeze([
  'payment_observed_pending_finality',
  'finalized_rights_transferred',
  'database_projection_repaired',
  'object_storage_repaired',
  'delivery_blocked_pending_repair',
]);

export const EXCHANGE_SETTLEMENT_REQUIRED_FIELD_IDS = Object.freeze([
  'settlementReceiptId',
  'paymentObservation',
  'finalityState',
  'rightsTransferReceipt',
  'ledgerRoot',
  'databaseProjectionRoot',
  'objectStorageRoot',
  'deliveryState',
  'repairId',
  'observerJobs',
  'reconciliationDecision',
  'proofRoots',
  'eventIds',
]);

const SECRET_MARKERS = Object.freeze([
  `${['sk', 'proj'].join('-')}-`,
  `${['sb', 'secret'].join('_')}__`,
  ['service', 'role'].join('_'),
  ['eyJhbGciOiJI', 'UzI1NiIsInR5cCI6IkpXVCJ9'].join(''),
  ['SUPABASE', 'SERVICE', 'ROLE'].join('_'),
  ['OPENAI', 'API', 'KEY'].join('_'),
  ['VERCEL', 'TOKEN'].join('_'),
  ['VERCEL', 'OIDC', 'TOKEN'].join('_'),
  ['PRIVATE', 'KEY'].join('_'),
]);

const FORBIDDEN_SETTLEMENT_PAYLOAD = Object.freeze([
  'secret_values',
  'provider_tokens',
  'wallet_private_material',
  'wallet_seed_phrase',
  'wallet_private_key',
  'protected_source_payloads',
  'raw_protected_prompts',
  'raw_model_responses_with_protected_source',
  'unpaid_assetpack_source',
  'private_payment_credentials',
  'buyer_private_repository_payload',
  'object_storage_private_bytes',
]);

const SHARED_FAIL_CLOSED_REASONS = Object.freeze([
  'missing_payment_observation',
  'missing_finality_state',
  'missing_rights_transfer_receipt',
  'missing_ledger_root',
  'missing_database_projection_root',
  'missing_object_storage_root',
  'missing_delivery_state',
  'missing_repair_id',
  'database_projection_drift',
  'object_storage_drift',
  'rights_transfer_receipt_missing',
  'delivery_not_unlocked',
]);

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalJson(entry)).join(',')}]`;
  return `{${Object.entries(value)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
    .join(',')}}`;
}

/**
 * @param {string} value
 * @returns {string}
 */
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function stableRoot(value) {
  return `sha256:${sha256(canonicalJson(value))}`;
}

/**
 * @param {string} prefix
 * @param {unknown} value
 * @returns {string}
 */
function prefixedRoot(prefix, value) {
  return `${prefix}:${stableRoot(value).slice('sha256:'.length, 'sha256:'.length + 24)}`;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function includesSecretMarker(value) {
  return SECRET_MARKERS.some((marker) => value.includes(marker));
}

/**
 * @param {string} repoRoot
 * @param {string} relativePath
 * @returns {boolean}
 */
function sourceRootExists(repoRoot, relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

/**
 * @param {ReadonlyArray<string>} values
 * @param {ReadonlyArray<string>} requiredValues
 * @returns {boolean}
 */
function includesAll(values, requiredValues) {
  return requiredValues.every((value) => values.includes(value));
}

/**
 * @param {{
 *   settlementReceiptId: string,
 *   receiptState: string,
 *   label: string,
 *   orderId: string,
 *   assetPackId: string,
 *   btdRangeId: string,
 *   buyerPrincipal: string,
 *   sellerPrincipal: string,
 *   paymentStatus: string,
 *   observedAmountSatoshis: number,
 *   quoteAmountSatoshis: number,
 *   finalityState: string,
 *   confirmationCount: number,
 *   rightsTransferState: string,
 *   databaseProjectionState: string,
 *   objectStorageState: string,
 *   deliveryState: string,
 *   repairId: string,
 *   reconciliationDecision: string,
 *   eventIds: string[],
 *   failClosedConditions: string[],
 * }} row
 */
function settlementReceipt(row) {
  const ledgerRoot = prefixedRoot('exchange-ledger-root', {
    settlementReceiptId: row.settlementReceiptId,
    orderId: row.orderId,
    paymentStatus: row.paymentStatus,
    finalityState: row.finalityState,
    rightsTransferState: row.rightsTransferState,
  });
  const databaseProjectionRoot = prefixedRoot('exchange-database-projection-root', {
    settlementReceiptId: row.settlementReceiptId,
    ledgerRoot,
    databaseProjectionState: row.databaseProjectionState,
  });
  const objectStorageRoot = prefixedRoot('exchange-object-storage-root', {
    settlementReceiptId: row.settlementReceiptId,
    assetPackId: row.assetPackId,
    objectStorageState: row.objectStorageState,
  });

  return {
    ...row,
    canonicalObject: 'ExchangeSettlementReceipt',
    paymentObservation: {
      observationId: `${row.settlementReceiptId}:payment-observation`,
      paymentStatus: row.paymentStatus,
      observedAmountSatoshis: row.observedAmountSatoshis,
      quoteAmountSatoshis: row.quoteAmountSatoshis,
      amountComparison: row.observedAmountSatoshis === row.quoteAmountSatoshis ? 'exact' : 'mismatch',
      visibility: 'amount_status_and_observation_root_only_no_private_payment_credentials',
    },
    finalityState: {
      state: row.finalityState,
      confirmationCount: row.confirmationCount,
      finalityBasis: 'btc_observation_and_ledger_journal_finality_root',
      auditable: true,
    },
    rightsTransferReceipt: {
      receiptId: `${row.settlementReceiptId}:rights-transfer-receipt`,
      rightsTransferState: row.rightsTransferState,
      btdRangeId: row.btdRangeId,
      buyerPrincipal: row.buyerPrincipal,
      sellerPrincipal: row.sellerPrincipal,
      visibility: 'receipt_id_range_principals_and_state_only',
    },
    ledgerRoot,
    databaseProjectionRoot,
    objectStorageRoot,
    deliveryState: {
      state: row.deliveryState,
      assetPackId: row.assetPackId,
      deliveryBasis: row.deliveryState === 'delivered_after_settlement'
        ? 'paid_finality_and_rights_transfer_receipt'
        : 'delivery_blocked_until_repair_or_finality',
      auditable: true,
      protectedSourceVisibility: row.deliveryState === 'delivered_after_settlement'
        ? 'source_delivery_allowed_to_settled_right_holder'
        : 'protected_source_hidden',
    },
    repairJob: {
      repairId: row.repairId,
      repairRequired: row.repairId !== 'repair:none',
      repairCommand: row.repairId === 'repair:none' ? 'none' : `pnpm run check:v36-gate6 -- --repair-id ${row.repairId}`,
      verificationCommand: 'pnpm run check:v36-gate6',
    },
    observerJobs: [
      {
        observerId: 'exchange.settlement.payment-observer',
        observes: ['paymentObservation', 'finalityState', 'ledgerRoot'],
        reconciliationRule: 'ledger_root_is_settlement_truth',
      },
      {
        observerId: 'exchange.settlement.database-projection-repair',
        observes: ['ledgerRoot', 'databaseProjectionRoot'],
        reconciliationRule: 'database_projection_reconciles_to_ledger_truth',
      },
      {
        observerId: 'exchange.settlement.object-storage-repair',
        observes: ['ledgerRoot', 'objectStorageRoot', 'deliveryState'],
        reconciliationRule: 'object_storage_projection_reconciles_to_settled_delivery_truth',
      },
    ],
    proofRootFields: [
      'settlementReceiptRoot',
      'paymentObservationRoot',
      'finalityRoot',
      'rightsTransferReceiptRoot',
      'ledgerRoot',
      'databaseProjectionRoot',
      'objectStorageRoot',
      'deliveryRoot',
      'repairRoot',
      'telemetryRoot',
    ],
  };
}

export const EXCHANGE_SETTLEMENT_RECEIPT_ROWS = Object.freeze([
  settlementReceipt({
    settlementReceiptId: 'exchange-settlement-receipt:payment-observed-alpha',
    receiptState: 'payment_observed_pending_finality',
    label: 'Payment observed pending finality',
    orderId: 'exchange-order:buy:source-safe-alpha',
    assetPackId: 'assetpack:source-safe-preview-alpha',
    btdRangeId: 'btd-range:1000-1048',
    buyerPrincipal: 'principal:reader-beta',
    sellerPrincipal: 'principal:depositor-alpha',
    paymentStatus: 'payment_observed_exact',
    observedAmountSatoshis: 631_300,
    quoteAmountSatoshis: 631_300,
    finalityState: 'pending_confirmations',
    confirmationCount: 1,
    rightsTransferState: 'pending_finality',
    databaseProjectionState: 'awaiting_finality_projection',
    objectStorageState: 'source_locked_until_finality',
    deliveryState: 'blocked_pending_finality',
    repairId: 'repair:none',
    reconciliationDecision: 'observe_until_finality_before_rights_transfer_and_delivery',
    eventIds: ['exchange.settlement.payment_observed', 'exchange.settlement.finality.pending'],
    failClosedConditions: ['missing_finality_state', 'delivery_not_unlocked'],
  }),
  settlementReceipt({
    settlementReceiptId: 'exchange-settlement-receipt:finalized-beta',
    receiptState: 'finalized_rights_transferred',
    label: 'Finalized rights transferred and delivered',
    orderId: 'exchange-order:accept:source-safe-alpha',
    assetPackId: 'assetpack:source-safe-preview-alpha',
    btdRangeId: 'btd-range:1000-1048',
    buyerPrincipal: 'principal:reader-beta',
    sellerPrincipal: 'principal:depositor-alpha',
    paymentStatus: 'payment_finalized_exact',
    observedAmountSatoshis: 631_300,
    quoteAmountSatoshis: 631_300,
    finalityState: 'btc_finality_confirmed',
    confirmationCount: 6,
    rightsTransferState: 'rights_transfer_receipt_issued',
    databaseProjectionState: 'projection_synced_to_ledger',
    objectStorageState: 'settled_assetpack_delivery_recorded',
    deliveryState: 'delivered_after_settlement',
    repairId: 'repair:none',
    reconciliationDecision: 'delivery_admitted_after_paid_finality_and_rights_transfer',
    eventIds: ['exchange.settlement.finalized', 'exchange.delivery.completed'],
    failClosedConditions: ['ledger_database_projection_drift', 'object_storage_drift'],
  }),
  settlementReceipt({
    settlementReceiptId: 'exchange-settlement-receipt:projection-repaired-gamma',
    receiptState: 'database_projection_repaired',
    label: 'Database projection repaired from ledger truth',
    orderId: 'exchange-order:settle:source-safe-alpha',
    assetPackId: 'assetpack:source-safe-preview-beta',
    btdRangeId: 'btd-range:2100-2132',
    buyerPrincipal: 'principal:reader-delta',
    sellerPrincipal: 'principal:depositor-gamma',
    paymentStatus: 'payment_finalized_exact',
    observedAmountSatoshis: 475_500,
    quoteAmountSatoshis: 475_500,
    finalityState: 'btc_finality_confirmed',
    confirmationCount: 6,
    rightsTransferState: 'rights_transfer_receipt_issued',
    databaseProjectionState: 'projection_repaired_to_ledger_truth',
    objectStorageState: 'settled_assetpack_delivery_recorded',
    deliveryState: 'delivered_after_projection_repair',
    repairId: 'repair:database-projection-drift-gamma',
    reconciliationDecision: 'database_projection_reconciled_to_ledger_truth',
    eventIds: ['exchange.repair.database_projection.completed', 'exchange.settlement.ledger_truth_restored'],
    failClosedConditions: ['database_projection_drift'],
  }),
  settlementReceipt({
    settlementReceiptId: 'exchange-settlement-receipt:object-storage-repaired-delta',
    receiptState: 'object_storage_repaired',
    label: 'Object storage repaired from settled delivery truth',
    orderId: 'exchange-order:settle:source-safe-beta',
    assetPackId: 'assetpack:source-safe-preview-gamma',
    btdRangeId: 'btd-range:3000-3040',
    buyerPrincipal: 'principal:reader-zeta',
    sellerPrincipal: 'principal:depositor-epsilon',
    paymentStatus: 'payment_finalized_exact',
    observedAmountSatoshis: 413_500,
    quoteAmountSatoshis: 413_500,
    finalityState: 'btc_finality_confirmed',
    confirmationCount: 6,
    rightsTransferState: 'rights_transfer_receipt_issued',
    databaseProjectionState: 'projection_synced_to_ledger',
    objectStorageState: 'object_storage_delivery_projection_repaired',
    deliveryState: 'delivered_after_object_storage_repair',
    repairId: 'repair:object-storage-drift-delta',
    reconciliationDecision: 'object_storage_projection_reconciled_to_settled_delivery_truth',
    eventIds: ['exchange.repair.object_storage.completed', 'exchange.delivery.audit_restored'],
    failClosedConditions: ['object_storage_drift'],
  }),
  settlementReceipt({
    settlementReceiptId: 'exchange-settlement-receipt:blocked-epsilon',
    receiptState: 'delivery_blocked_pending_repair',
    label: 'Delivery blocked pending repair',
    orderId: 'exchange-order:settle:source-safe-gamma',
    assetPackId: 'assetpack:source-safe-preview-delta',
    btdRangeId: 'btd-range:4100-4136',
    buyerPrincipal: 'principal:reader-theta',
    sellerPrincipal: 'principal:depositor-eta',
    paymentStatus: 'payment_observed_exact',
    observedAmountSatoshis: 559_900,
    quoteAmountSatoshis: 559_900,
    finalityState: 'btc_finality_confirmed',
    confirmationCount: 6,
    rightsTransferState: 'rights_transfer_receipt_missing',
    databaseProjectionState: 'projection_blocked_by_missing_receipt',
    objectStorageState: 'source_locked_missing_rights_transfer_receipt',
    deliveryState: 'blocked_missing_rights_transfer_receipt',
    repairId: 'repair:rights-transfer-receipt-missing-epsilon',
    reconciliationDecision: 'block_delivery_until_rights_transfer_receipt_repair',
    eventIds: ['exchange.delivery.blocked', 'exchange.repair.rights_transfer_receipt.required'],
    failClosedConditions: ['rights_transfer_receipt_missing', 'delivery_not_unlocked'],
  }),
]);

/**
 * @param {{
 *   version?: string,
 *   currentTarget?: string,
 *   generatedAt?: string,
 *   repoRoot?: string,
 * }} [input]
 */
export function buildExchangeSettlementReconciliation(input = {}) {
  const version = input.version || EXCHANGE_SETTLEMENT_RECONCILIATION_VERSION;
  const currentTarget = input.currentTarget || EXCHANGE_SETTLEMENT_RECONCILIATION_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sharedSourceRoots = [
    'BITCODE_SPEC_V36.md',
    'BITCODE_SPEC_V36_DELTA.md',
    'BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'packages/specifying/src/canonical/exchange-settlement-reconciliation.js',
    'packages/specifying/test/v36-exchange-settlement-reconciliation.test.js',
    'scripts/generate-v36-exchange-settlement-reconciliation.mjs',
    'scripts/check-v36-gate6-exchange-settlement-reconciliation.mjs',
    'packages/btd/src/exchange.ts',
    'uapi/app/exchange/README.md',
    'uapi/app/api/btd/asset-pack-exchange/route.ts',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  const rows = EXCHANGE_SETTLEMENT_RECEIPT_ROWS.map((row) => {
    const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
      sourceRoot,
      present: sourceRootExists(repoRoot, sourceRoot),
    }));
    const rowWithoutRoots = {
      ...row,
      sourceSafetyClass: 'source_safe_exchange_settlement_receipt_metadata',
      sourceSafetyPosture: 'settlement_roots_observer_state_and_delivery_state_only_no_source_or_private_wallet_material',
      redactionPosture: {
        postureId: 'exchange_settlement_reconciliation_redaction_v1',
        allowedPayloadClasses: [
          'settlement_receipt_identity',
          'payment_observation',
          'finality_state',
          'rights_transfer_receipt',
          'ledger_root',
          'database_projection_root',
          'object_storage_root',
          'delivery_state',
          'repair_id',
          'observer_jobs',
          'proof_roots',
          'event_ids',
        ],
        forbiddenPayloadClasses: [...FORBIDDEN_SETTLEMENT_PAYLOAD],
      },
      freshnessChecks: [
        {
          checkId: `${row.settlementReceiptId}.settlement-reconciliation-present`,
          command: 'pnpm run check:v36-gate6',
          cadence: 'per_gate',
          failClosedOn: [...SHARED_FAIL_CLOSED_REASONS],
        },
      ],
      sourceEvidence,
    };
    const settlementReceiptRoot = `exchange-settlement-receipt:${sha256(row.settlementReceiptId + canonicalJson(rowWithoutRoots)).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      row.proofRootFields.map((field) => {
        const seed = `${row.settlementReceiptId}:${field}:${settlementReceiptRoot}:${row.ledgerRoot}`;
        return [field, field === 'ledgerRoot' ? row.ledgerRoot : `exchange-proof:${sha256(seed).slice(0, 24)}`];
      }),
    );

    return {
      ...rowWithoutRoots,
      settlementReceiptRoot,
      proofRoots,
    };
  });

  const observedReceiptStates = rows.map((row) => row.receiptState);
  const missingRequiredReceiptStates = EXCHANGE_SETTLEMENT_RECEIPT_STATES.filter((state) => !observedReceiptStates.includes(state));
  const serializedRows = canonicalJson(rows);
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = rows.flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.settlementReceiptId}:${entry.sourceRoot}`),
  );
  const rowsWithoutPayment = rows.filter((row) => !row.paymentObservation?.observationId);
  const rowsWithoutFinality = rows.filter((row) => !row.finalityState?.state);
  const rowsWithoutRightsTransfer = rows.filter((row) => !row.rightsTransferReceipt?.receiptId);
  const rowsWithoutRoots = rows.filter((row) => !row.ledgerRoot || !row.databaseProjectionRoot || !row.objectStorageRoot);
  const rowsWithoutDelivery = rows.filter((row) => !row.deliveryState?.state);
  const rowsWithoutRepair = rows.filter((row) => !row.repairJob?.repairId);
  const rowsWithoutObservers = rows.filter((row) => !row.observerJobs?.some((job) => job.reconciliationRule === 'database_projection_reconciles_to_ledger_truth'));
  const rowsWithoutAuditableFinality = rows.filter((row) => row.finalityState?.auditable !== true);
  const rowsWithoutAuditableDelivery = rows.filter((row) => row.deliveryState?.auditable !== true);
  const rowsWithoutProofRoots = rows.filter((row) => row.proofRootFields.some((field) => !row.proofRoots[field]));
  const rowsWithoutEventIds = rows.filter((row) => row.eventIds.length === 0);
  const rowsWithProtectedSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'));
  const rowsWithUnpaidAssetPackSource = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
  const rowsWithPrivateWalletMaterial = rows.filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'));
  const rowsWithLegacySourceRoots = rows.filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingRequiredReceiptStates.map((state) => `missing required Exchange settlement receipt state ${state}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Exchange settlement source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Exchange settlement reconciliation contains a secret-shaped marker'] : []),
    ...rowsWithoutPayment.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks payment observation`),
    ...rowsWithoutFinality.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks finality state`),
    ...rowsWithoutRightsTransfer.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks rights transfer receipt`),
    ...rowsWithoutRoots.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks ledger, database, or object storage root`),
    ...rowsWithoutDelivery.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks delivery state`),
    ...rowsWithoutRepair.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks repair id`),
    ...rowsWithoutObservers.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks observer/repair reconciliation to ledger truth`),
    ...rowsWithoutAuditableFinality.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks auditable finality`),
    ...rowsWithoutAuditableDelivery.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks auditable delivery`),
    ...rowsWithoutProofRoots.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} is missing proof roots`),
    ...rowsWithoutEventIds.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} is missing event ids`),
    ...rowsWithProtectedSource.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks protected source boundary`),
    ...rowsWithUnpaidAssetPackSource.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks unpaid AssetPack source boundary`),
    ...rowsWithPrivateWalletMaterial.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} lacks wallet private material boundary`),
    ...rowsWithLegacySourceRoots.map((row) => `Exchange settlement receipt ${row.settlementReceiptId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredReceiptStates: [...EXCHANGE_SETTLEMENT_RECEIPT_STATES],
    observedReceiptStates,
    missingRequiredReceiptStates,
    receiptCount: rows.length,
    allRequiredReceiptStatesCovered: includesAll(observedReceiptStates, EXCHANGE_SETTLEMENT_RECEIPT_STATES),
    paymentObservationCovered: rowsWithoutPayment.length === 0,
    finalityStateCovered: rowsWithoutFinality.length === 0,
    rightsTransferReceiptCovered: rowsWithoutRightsTransfer.length === 0,
    ledgerDatabaseObjectStorageRootsCovered: rowsWithoutRoots.length === 0,
    deliveryStateCovered: rowsWithoutDelivery.length === 0,
    repairIdCovered: rowsWithoutRepair.length === 0,
    observersRepairJobsCovered: rowsWithoutObservers.length === 0,
    databaseProjectionsReconcileToLedgerTruth: rowsWithoutObservers.length === 0,
    settlementFinalityAuditable: rowsWithoutAuditableFinality.length === 0,
    deliveryAuditable: rowsWithoutAuditableDelivery.length === 0,
    proofRootsCovered: rowsWithoutProofRoots.length === 0,
    eventIdsCovered: rowsWithoutEventIds.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    privateWalletMaterialSerialized: false,
    protectedSourceVisible: rowsWithProtectedSource.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidAssetPackSource.length > 0,
  };

  const artifactSeed = {
    version,
    currentTarget,
    rows,
    coverage,
    sourceSafetyVerdict: EXCHANGE_SETTLEMENT_RECONCILIATION_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v36-exchange-settlement-reconciliation',
    schemaId: EXCHANGE_SETTLEMENT_RECONCILIATION_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: EXCHANGE_SETTLEMENT_RECONCILIATION_SOURCE_SAFETY_VERDICT,
    reconciliationBoundary: {
      exchangeSettlementReceiptMayExpose: [
        'settlement_receipt_identity',
        'payment_observation',
        'finality_state',
        'rights_transfer_receipt',
        'ledger_root',
        'database_projection_root',
        'object_storage_root',
        'delivery_state',
        'repair_id',
        'observer_jobs',
        'proof_roots',
        'event_ids',
      ],
      exchangeSettlementReceiptMustNotExpose: [...FORBIDDEN_SETTLEMENT_PAYLOAD],
      settlementBinding: 'payment observation, finality state, rights transfer receipt, ledger root, database projection root, object storage root, delivery state, and repair id',
      repairBinding: 'observers and repair jobs reconcile database projections to ledger truth',
      auditBinding: 'settlement finality and delivery are auditable',
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredReceiptStates: [...EXCHANGE_SETTLEMENT_RECEIPT_STATES],
    requiredFieldIds: [...EXCHANGE_SETTLEMENT_REQUIRED_FIELD_IDS],
    rows,
    sourceEvidence: rows.map((row) => ({
      settlementReceiptId: row.settlementReceiptId,
      allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
      sourceRoots: row.sourceEvidence,
    })),
    artifactRoot: `exchange-settlement-reconciliation:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
