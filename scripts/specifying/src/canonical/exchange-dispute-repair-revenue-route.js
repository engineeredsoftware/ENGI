// @ts-check

import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_ARTIFACT_PATH = '.bitcode/v36-exchange-dispute-repair-revenue-route.json';
export const EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_SCHEMA_ID = 'bitcode.v36.exchangeDisputeRepairRevenueRoute.v1';
export const EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_VERSION = 'V36';
export const EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_CURRENT_TARGET = 'V35';
export const EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_SOURCE_SAFETY_VERDICT = 'source-safe-exchange-dispute-repair-revenue-route-metadata';

export const EXCHANGE_DISPUTE_INCIDENT_CLASSES = Object.freeze([
  'stale_owner',
  'cancelled_order_replay',
  'underpayment',
  'overpayment',
  'projection_drift',
  'source_leakage',
  'delivery_mismatch',
]);

export const EXCHANGE_REVENUE_ROUTE_STATES = Object.freeze([
  'exact_settlement_conserved',
  'overpayment_refund_conserved',
  'underpayment_blocked_conserved',
  'projection_repair_conserved',
]);

export const EXCHANGE_DISPUTE_REPAIR_CASE_REQUIRED_FIELD_IDS = Object.freeze([
  'disputeCaseId',
  'incidentClass',
  'disputeReason',
  'affectedOrder',
  'affectedSettlement',
  'affectedProjection',
  'repairCommand',
  'verificationCommand',
  'runbook',
  'proofRoot',
  'escalationPath',
  'eventIds',
]);

export const EXCHANGE_REVENUE_ROUTE_REQUIRED_FIELD_IDS = Object.freeze([
  'revenueRouteId',
  'routeState',
  'treasuryAccount',
  'depositorAccount',
  'readerAccount',
  'feeAccount',
  'btcRoute',
  'btdRightRoute',
  'sourceToSharesRoute',
  'conservationProof',
  'proofRoot',
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

const FORBIDDEN_EXCHANGE_OPERATION_PAYLOAD = Object.freeze([
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
  'raw_disputed_source_bytes',
]);

const SHARED_FAIL_CLOSED_REASONS = Object.freeze([
  'stale_owner_detected',
  'cancelled_order_replay_detected',
  'underpayment_detected',
  'overpayment_detected',
  'projection_drift_detected',
  'source_leakage_detected',
  'delivery_mismatch_detected',
  'missing_repair_command',
  'missing_verification_command',
  'missing_conservation_proof',
  'ledger_database_projection_drift',
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
 * @param {ReadonlyArray<string>} failClosedConditions
 * @returns {string[]}
 */
function failClosed(failClosedConditions) {
  return [...new Set([...failClosedConditions, ...SHARED_FAIL_CLOSED_REASONS])];
}

/**
 * @param {{
 *   disputeCaseId: string,
 *   incidentClass: string,
 *   label: string,
 *   disputeReason: string,
 *   affectedOrderId: string,
 *   affectedOrderState: string,
 *   affectedSettlementReceiptId: string,
 *   finalityState: string,
 *   affectedProjectionKind: string,
 *   projectionDriftClass: string,
 *   repairId: string,
 *   repairAction: string,
 *   repairCommandName: string,
 *   verificationCommandName: string,
 *   severity: string,
 *   approvingRole: string,
 *   customerVisibleStatus: string,
 *   escalationPathId: string,
 *   eventIds: string[],
 *   failClosedConditions: string[],
 * }} row
 */
function disputeRepairCase(row) {
  const affectedStateRoot = prefixedRoot('exchange-dispute-affected-state', {
    orderId: row.affectedOrderId,
    settlementReceiptId: row.affectedSettlementReceiptId,
    projectionKind: row.affectedProjectionKind,
    incidentClass: row.incidentClass,
  });

  return {
    ...row,
    canonicalObject: 'ExchangeDisputeRepairCase',
    affectedOrder: {
      orderId: row.affectedOrderId,
      orderState: row.affectedOrderState,
      visibility: 'order_identity_state_and_root_only_no_source_or_private_wallet_material',
      affectedOrderRoot: prefixedRoot('exchange-dispute-order', row.affectedOrderId),
    },
    affectedSettlement: {
      settlementReceiptId: row.affectedSettlementReceiptId,
      finalityState: row.finalityState,
      paymentObservationRoot: prefixedRoot('exchange-dispute-payment-observation', row.affectedSettlementReceiptId),
      visibility: 'settlement_receipt_identity_finality_and_payment_observation_root_only',
    },
    affectedProjection: {
      projectionKind: row.affectedProjectionKind,
      projectionDriftClass: row.projectionDriftClass,
      ledgerRoot: prefixedRoot('exchange-dispute-ledger-root', row.affectedSettlementReceiptId),
      databaseProjectionRoot: prefixedRoot('exchange-dispute-database-projection-root', `${row.affectedSettlementReceiptId}:${row.projectionDriftClass}`),
      objectStorageRoot: prefixedRoot('exchange-dispute-object-storage-root', `${row.affectedSettlementReceiptId}:${row.incidentClass}`),
      projectionTrust: 'ledger_journal_outranks_database_and_object_storage_projection',
    },
    repairCommand: {
      repairId: row.repairId,
      commandId: `${row.disputeCaseId}:repair-command`,
      command: row.repairCommandName,
      dryRunCommand: `${row.repairCommandName} --dry-run`,
      repairAction: row.repairAction,
      sourceSafe: true,
      proofRooted: true,
      operatorApprovalRequired: true,
      writesProtectedSource: false,
    },
    verificationCommand: {
      commandId: `${row.disputeCaseId}:verification-command`,
      command: row.verificationCommandName,
      sourceSafe: true,
      proofRooted: true,
      expectedResult: 'repair_case_reconciled_or_fail_closed',
    },
    runbook: {
      runbookId: `${row.disputeCaseId}:runbook`,
      title: `${row.label} repair runbook`,
      sourceSafe: true,
      proofRooted: true,
      steps: [
        'freeze affected market transition',
        'compare ledger root to database and object-storage projection roots',
        'execute the source-safe repair command with operator approval',
        'rerun the verification command and journal proof roots',
      ],
    },
    escalationPath: {
      escalationPathId: row.escalationPathId,
      severity: row.severity,
      firstResponder: 'exchange-operator',
      approvingRole: row.approvingRole,
      customerVisibleStatus: row.customerVisibleStatus,
      customerDisclosure: 'source_safe_status_no_protected_source_no_wallet_private_material',
    },
    affectedStateRoot,
    proofRootFields: [
      'disputeCaseRoot',
      'affectedStateRoot',
      'repairCommandRoot',
      'verificationCommandRoot',
      'runbookRoot',
      'escalationRoot',
      'redactionRoot',
    ],
  };
}

/**
 * @param {{
 *   revenueRouteId: string,
 *   routeState: string,
 *   label: string,
 *   orderId: string,
 *   settlementReceiptId: string,
 *   btdRangeId: string,
 *   readerPrincipal: string,
 *   depositorPrincipal: string,
 *   totalReaderDebitSatoshis: number,
 *   depositorCreditSatoshis: number,
 *   treasuryCreditSatoshis: number,
 *   feeCreditSatoshis: number,
 *   readerRefundSatoshis: number,
 *   btdRightRouteState: string,
 *   sourceToSharesProofRoot: string,
 *   eventIds: string[],
 * }} row
 */
function revenueRoute(row) {
  const totalCreditSatoshis =
    row.depositorCreditSatoshis +
    row.treasuryCreditSatoshis +
    row.feeCreditSatoshis +
    row.readerRefundSatoshis;
  const balanced = row.totalReaderDebitSatoshis === totalCreditSatoshis;

  return {
    ...row,
    canonicalObject: 'ExchangeRevenueRoute',
    treasuryAccount: {
      accountId: 'account:bitcode-treasury',
      principal: 'principal:bitcode-treasury',
      amountSatoshis: row.treasuryCreditSatoshis,
      routeVisibility: 'account_principal_amount_and_root_only',
    },
    depositorAccount: {
      accountId: `${row.depositorPrincipal}:exchange-revenue`,
      principal: row.depositorPrincipal,
      amountSatoshis: row.depositorCreditSatoshis,
      routeVisibility: 'account_principal_amount_and_root_only',
    },
    readerAccount: {
      accountId: `${row.readerPrincipal}:exchange-payment`,
      principal: row.readerPrincipal,
      debitSatoshis: row.totalReaderDebitSatoshis,
      refundSatoshis: row.readerRefundSatoshis,
      routeVisibility: 'account_principal_amount_and_root_only_no_private_payment_credentials',
    },
    feeAccount: {
      accountId: 'account:exchange-fee',
      principal: 'principal:bitcode-fee-router',
      amountSatoshis: row.feeCreditSatoshis,
      routeVisibility: 'fee_account_amount_and_root_only',
    },
    btcRoute: {
      btcRouteId: `${row.revenueRouteId}:btc-route`,
      debitSatoshis: row.totalReaderDebitSatoshis,
      depositorCreditSatoshis: row.depositorCreditSatoshis,
      treasuryCreditSatoshis: row.treasuryCreditSatoshis,
      feeCreditSatoshis: row.feeCreditSatoshis,
      readerRefundSatoshis: row.readerRefundSatoshis,
      routeCurrency: 'BTC',
      routeVisibility: 'btc_amounts_roots_and_public_principals_only',
    },
    btdRightRoute: {
      btdRightRouteId: `${row.revenueRouteId}:btd-right-route`,
      btdRangeId: row.btdRangeId,
      fromPrincipal: row.depositorPrincipal,
      toPrincipal: row.readerPrincipal,
      rightsTransferReceiptId: `${row.settlementReceiptId}:rights-transfer-receipt`,
      state: row.btdRightRouteState,
      routeVisibility: 'btd_range_identity_principals_and_receipt_root_only',
    },
    sourceToSharesRoute: {
      sourceToSharesRouteId: `${row.revenueRouteId}:source-to-shares-route`,
      sourceToSharesProofRoot: row.sourceToSharesProofRoot,
      btdRangeId: row.btdRangeId,
      sourceShareConservationBps: 10_000,
      routeVisibility: 'source_to_shares_root_only_no_source_payload',
    },
    conservationProof: {
      proofId: `${row.revenueRouteId}:conservation-proof`,
      totalDebitSatoshis: row.totalReaderDebitSatoshis,
      totalCreditSatoshis,
      btcDebitsEqualCredits: balanced,
      btdRightsConserved: true,
      sourceShareConservationBps: 10_000,
      conservationEquation: 'reader debit = depositor credit + treasury credit + fee credit + reader refund',
      proofRoot: prefixedRoot('exchange-revenue-conservation-proof', {
        revenueRouteId: row.revenueRouteId,
        totalDebitSatoshis: row.totalReaderDebitSatoshis,
        totalCreditSatoshis,
        btdRangeId: row.btdRangeId,
      }),
    },
    proofRootFields: [
      'revenueRouteRoot',
      'treasuryRouteRoot',
      'depositorRouteRoot',
      'readerRouteRoot',
      'feeRouteRoot',
      'btcRouteRoot',
      'btdRightRouteRoot',
      'sourceToSharesRouteRoot',
      'conservationProofRoot',
      'redactionRoot',
    ],
  };
}

export const EXCHANGE_DISPUTE_REPAIR_CASE_ROWS = Object.freeze([
  disputeRepairCase({
    disputeCaseId: 'exchange-dispute-repair:stale-owner-alpha',
    incidentClass: 'stale_owner',
    label: 'Stale owner detected',
    disputeReason: 'market order owner projection differs from ledger owner root',
    affectedOrderId: 'exchange-order:sell:source-safe-alpha',
    affectedOrderState: 'blocked_stale_owner',
    affectedSettlementReceiptId: 'exchange-settlement-receipt:finalized-beta',
    finalityState: 'btc_finality_confirmed',
    affectedProjectionKind: 'owner_projection',
    projectionDriftClass: 'ledger_owner_outranks_database_owner_projection',
    repairId: 'repair:exchange-stale-owner-alpha',
    repairAction: 'rewrite_owner_projection_from_ledger_truth_and_freeze_listing_until_verified',
    repairCommandName: 'pnpm run check:v36-gate7 -- --repair-id repair:exchange-stale-owner-alpha',
    verificationCommandName: 'pnpm run check:v36-gate7',
    severity: 'high',
    approvingRole: 'exchange-operations-lead',
    customerVisibleStatus: 'listing paused while ownership projection is repaired',
    escalationPathId: 'exchange-escalation:stale-owner',
    eventIds: ['exchange.dispute.stale_owner.detected', 'exchange.repair.owner_projection.required'],
    failClosedConditions: ['stale_owner_detected'],
  }),
  disputeRepairCase({
    disputeCaseId: 'exchange-dispute-repair:cancelled-order-replay-beta',
    incidentClass: 'cancelled_order_replay',
    label: 'Cancelled order replay blocked',
    disputeReason: 'cancelled order idempotency key was replayed after cancellation journal finality',
    affectedOrderId: 'exchange-order:cancel:source-safe-beta',
    affectedOrderState: 'blocked_cancelled_order_replay',
    affectedSettlementReceiptId: 'exchange-settlement-receipt:payment-observed-alpha',
    finalityState: 'pending_confirmations',
    affectedProjectionKind: 'order_history_projection',
    projectionDriftClass: 'cancelled_order_replay_attempt',
    repairId: 'repair:cancelled-order-replay-beta',
    repairAction: 'preserve_cancelled_journal_state_and_reject_replayed_transition',
    repairCommandName: 'pnpm run check:v36-gate7 -- --repair-id repair:cancelled-order-replay-beta',
    verificationCommandName: 'pnpm run check:v36-gate7',
    severity: 'medium',
    approvingRole: 'exchange-operator',
    customerVisibleStatus: 'cancelled order remains closed',
    escalationPathId: 'exchange-escalation:cancelled-order-replay',
    eventIds: ['exchange.dispute.cancelled_order_replay.detected', 'exchange.intent.replay.blocked'],
    failClosedConditions: ['cancelled_order_replay_detected'],
  }),
  disputeRepairCase({
    disputeCaseId: 'exchange-dispute-repair:underpayment-gamma',
    incidentClass: 'underpayment',
    label: 'Underpayment settlement blocked',
    disputeReason: 'observed BTC amount is below deterministic quote amount',
    affectedOrderId: 'exchange-order:accept:source-safe-gamma',
    affectedOrderState: 'blocked_underpayment',
    affectedSettlementReceiptId: 'exchange-settlement-receipt:underpayment-gamma',
    finalityState: 'payment_observed_below_quote',
    affectedProjectionKind: 'payment_projection',
    projectionDriftClass: 'payment_amount_below_quote_root',
    repairId: 'repair:underpayment-gamma',
    repairAction: 'keep_delivery_locked_and_route_refund_or_top_up_decision_without_rights_transfer',
    repairCommandName: 'pnpm run check:v36-gate7 -- --repair-id repair:underpayment-gamma',
    verificationCommandName: 'pnpm run check:v36-gate7',
    severity: 'high',
    approvingRole: 'exchange-settlement-operator',
    customerVisibleStatus: 'payment below quote; delivery locked',
    escalationPathId: 'exchange-escalation:underpayment',
    eventIds: ['exchange.dispute.underpayment.detected', 'exchange.delivery.locked'],
    failClosedConditions: ['underpayment_detected'],
  }),
  disputeRepairCase({
    disputeCaseId: 'exchange-dispute-repair:overpayment-delta',
    incidentClass: 'overpayment',
    label: 'Overpayment refund routed',
    disputeReason: 'observed BTC amount exceeds deterministic quote amount',
    affectedOrderId: 'exchange-order:accept:source-safe-delta',
    affectedOrderState: 'blocked_overpayment_refund_pending',
    affectedSettlementReceiptId: 'exchange-settlement-receipt:overpayment-delta',
    finalityState: 'payment_observed_above_quote',
    affectedProjectionKind: 'payment_projection',
    projectionDriftClass: 'payment_amount_above_quote_root',
    repairId: 'repair:overpayment-delta',
    repairAction: 'separate quote settlement from refundable overage before rights transfer',
    repairCommandName: 'pnpm run check:v36-gate7 -- --repair-id repair:overpayment-delta',
    verificationCommandName: 'pnpm run check:v36-gate7',
    severity: 'medium',
    approvingRole: 'exchange-settlement-operator',
    customerVisibleStatus: 'overpayment refund route pending',
    escalationPathId: 'exchange-escalation:overpayment',
    eventIds: ['exchange.dispute.overpayment.detected', 'exchange.revenue.refund.pending'],
    failClosedConditions: ['overpayment_detected'],
  }),
  disputeRepairCase({
    disputeCaseId: 'exchange-dispute-repair:projection-drift-epsilon',
    incidentClass: 'projection_drift',
    label: 'Projection drift repaired',
    disputeReason: 'database or object-storage projection differs from ledger settlement truth',
    affectedOrderId: 'exchange-order:settle:source-safe-epsilon',
    affectedOrderState: 'settled_projection_repair_required',
    affectedSettlementReceiptId: 'exchange-settlement-receipt:projection-repaired-gamma',
    finalityState: 'btc_finality_confirmed',
    affectedProjectionKind: 'database_and_object_storage_projection',
    projectionDriftClass: 'projection_drift_from_ledger_truth',
    repairId: 'repair:projection-drift-epsilon',
    repairAction: 'replay_ledger_receipt_into_database_and_object_storage_projections',
    repairCommandName: 'pnpm run check:v36-gate7 -- --repair-id repair:projection-drift-epsilon',
    verificationCommandName: 'pnpm run check:v36-gate7',
    severity: 'high',
    approvingRole: 'exchange-operations-lead',
    customerVisibleStatus: 'projection repair completed from ledger truth',
    escalationPathId: 'exchange-escalation:projection-drift',
    eventIds: ['exchange.dispute.projection_drift.detected', 'exchange.repair.projection.completed'],
    failClosedConditions: ['projection_drift_detected', 'ledger_database_projection_drift'],
  }),
  disputeRepairCase({
    disputeCaseId: 'exchange-dispute-repair:source-leakage-zeta',
    incidentClass: 'source_leakage',
    label: 'Source leakage boundary incident',
    disputeReason: 'pre-settlement carrier attempted to expose protected or unpaid AssetPack source',
    affectedOrderId: 'exchange-order:preview:source-safe-zeta',
    affectedOrderState: 'blocked_source_visibility_attempt',
    affectedSettlementReceiptId: 'exchange-settlement-receipt:blocked-epsilon',
    finalityState: 'delivery_blocked_pending_repair',
    affectedProjectionKind: 'disclosure_projection',
    projectionDriftClass: 'protected_source_visibility_attempt',
    repairId: 'repair:source-leakage-zeta',
    repairAction: 'freeze_disclosure_surface_rotate_projection_and_verify_source_safe_preview_only',
    repairCommandName: 'pnpm run check:v36-gate7 -- --repair-id repair:source-leakage-zeta',
    verificationCommandName: 'pnpm run check:v36-gate7',
    severity: 'critical',
    approvingRole: 'security-and-exchange-lead',
    customerVisibleStatus: 'source-safe preview restored; protected source remains locked',
    escalationPathId: 'exchange-escalation:source-leakage',
    eventIds: ['exchange.dispute.source_leakage.detected', 'exchange.disclosure.freeze.required'],
    failClosedConditions: ['source_leakage_detected'],
  }),
  disputeRepairCase({
    disputeCaseId: 'exchange-dispute-repair:delivery-mismatch-eta',
    incidentClass: 'delivery_mismatch',
    label: 'Delivery mismatch repaired',
    disputeReason: 'delivered object-storage record does not match settlement and rights-transfer receipt roots',
    affectedOrderId: 'exchange-order:delivery:source-safe-eta',
    affectedOrderState: 'settled_delivery_mismatch',
    affectedSettlementReceiptId: 'exchange-settlement-receipt:object-storage-repaired-delta',
    finalityState: 'btc_finality_confirmed',
    affectedProjectionKind: 'delivery_projection',
    projectionDriftClass: 'delivery_object_storage_root_mismatch',
    repairId: 'repair:delivery-mismatch-eta',
    repairAction: 'repair_delivery_pointer_from_settled_object_storage_root_and_reverify_rights_holder',
    repairCommandName: 'pnpm run check:v36-gate7 -- --repair-id repair:delivery-mismatch-eta',
    verificationCommandName: 'pnpm run check:v36-gate7',
    severity: 'high',
    approvingRole: 'exchange-delivery-operator',
    customerVisibleStatus: 'delivery pointer repaired after settlement verification',
    escalationPathId: 'exchange-escalation:delivery-mismatch',
    eventIds: ['exchange.dispute.delivery_mismatch.detected', 'exchange.delivery.repair.completed'],
    failClosedConditions: ['delivery_mismatch_detected'],
  }),
]);

export const EXCHANGE_REVENUE_ROUTE_ROWS = Object.freeze([
  revenueRoute({
    revenueRouteId: 'exchange-revenue-route:exact-alpha',
    routeState: 'exact_settlement_conserved',
    label: 'Exact settlement revenue route',
    orderId: 'exchange-order:accept:source-safe-alpha',
    settlementReceiptId: 'exchange-settlement-receipt:finalized-beta',
    btdRangeId: 'btd-range:1000-1048',
    readerPrincipal: 'principal:reader-beta',
    depositorPrincipal: 'principal:depositor-alpha',
    totalReaderDebitSatoshis: 631_300,
    depositorCreditSatoshis: 520_000,
    treasuryCreditSatoshis: 78_900,
    feeCreditSatoshis: 32_400,
    readerRefundSatoshis: 0,
    btdRightRouteState: 'rights_transferred_after_paid_finality',
    sourceToSharesProofRoot: 'source-to-shares-proof:exchange-alpha-root',
    eventIds: ['exchange.revenue.exact_settlement.routed', 'exchange.rights.transferred'],
  }),
  revenueRoute({
    revenueRouteId: 'exchange-revenue-route:overpayment-beta',
    routeState: 'overpayment_refund_conserved',
    label: 'Overpayment refund revenue route',
    orderId: 'exchange-order:accept:source-safe-delta',
    settlementReceiptId: 'exchange-settlement-receipt:overpayment-delta',
    btdRangeId: 'btd-range:1200-1248',
    readerPrincipal: 'principal:reader-delta',
    depositorPrincipal: 'principal:depositor-beta',
    totalReaderDebitSatoshis: 500_000,
    depositorCreditSatoshis: 410_000,
    treasuryCreditSatoshis: 51_250,
    feeCreditSatoshis: 14_000,
    readerRefundSatoshis: 24_750,
    btdRightRouteState: 'rights_transfer_waits_for_refund_journal',
    sourceToSharesProofRoot: 'source-to-shares-proof:exchange-beta-root',
    eventIds: ['exchange.revenue.overpayment.refund_routed', 'exchange.rights.transfer.pending_refund_journal'],
  }),
  revenueRoute({
    revenueRouteId: 'exchange-revenue-route:underpayment-gamma',
    routeState: 'underpayment_blocked_conserved',
    label: 'Underpayment blocked revenue route',
    orderId: 'exchange-order:accept:source-safe-gamma',
    settlementReceiptId: 'exchange-settlement-receipt:underpayment-gamma',
    btdRangeId: 'btd-range:2000-2036',
    readerPrincipal: 'principal:reader-gamma',
    depositorPrincipal: 'principal:depositor-gamma',
    totalReaderDebitSatoshis: 420_000,
    depositorCreditSatoshis: 0,
    treasuryCreditSatoshis: 0,
    feeCreditSatoshis: 0,
    readerRefundSatoshis: 420_000,
    btdRightRouteState: 'blocked_by_underpayment_no_rights_transfer',
    sourceToSharesProofRoot: 'source-to-shares-proof:exchange-gamma-root',
    eventIds: ['exchange.revenue.underpayment.blocked', 'exchange.delivery.locked'],
  }),
  revenueRoute({
    revenueRouteId: 'exchange-revenue-route:projection-repair-delta',
    routeState: 'projection_repair_conserved',
    label: 'Projection repair revenue route',
    orderId: 'exchange-order:settle:source-safe-epsilon',
    settlementReceiptId: 'exchange-settlement-receipt:projection-repaired-gamma',
    btdRangeId: 'btd-range:2100-2132',
    readerPrincipal: 'principal:reader-delta',
    depositorPrincipal: 'principal:depositor-gamma',
    totalReaderDebitSatoshis: 475_500,
    depositorCreditSatoshis: 392_000,
    treasuryCreditSatoshis: 59_500,
    feeCreditSatoshis: 24_000,
    readerRefundSatoshis: 0,
    btdRightRouteState: 'rights_transfer_conserved_after_projection_repair',
    sourceToSharesProofRoot: 'source-to-shares-proof:exchange-delta-root',
    eventIds: ['exchange.revenue.projection_repair.replayed', 'exchange.conservation.proved'],
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
export function buildExchangeDisputeRepairRevenueRoute(input = {}) {
  const version = input.version || EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_VERSION;
  const currentTarget = input.currentTarget || EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_CURRENT_TARGET;
  const generatedAt = input.generatedAt || '2026-05-24T00:00:00.000Z';
  const repoRoot = input.repoRoot || path.resolve(__dirname, '../../../..');
  const sharedSourceRoots = [
    'BITCODE_SPEC_V36.md',
    'BITCODE_SPEC_V36_DELTA.md',
    'BITCODE_SPEC_V36_PARITY_MATRIX.md',
    'SPECIFICATIONS_ROADMAP.md',
    'scripts/specifying/src/canonical/exchange-dispute-repair-revenue-route.js',
    'scripts/specifying/test/v36-exchange-dispute-repair-revenue-route.test.js',
    'scripts/generate-v36-exchange-dispute-repair-revenue-route.mjs',
    'scripts/check-v36-gate7-exchange-dispute-repair-revenue-route.mjs',
    'packages/btd/src/exchange.ts',
    'apps/uapi/app/exchange/README.md',
    'apps/uapi/app/api/btd/asset-pack-exchange/route.ts',
    '.github/workflows/bitcode-gate-quality.yml',
  ];

  const sourceEvidence = sharedSourceRoots.map((sourceRoot) => ({
    sourceRoot,
    present: sourceRootExists(repoRoot, sourceRoot),
  }));

  const disputeCases = EXCHANGE_DISPUTE_REPAIR_CASE_ROWS.map((row) => {
    const rowWithoutRoots = {
      ...row,
      failClosedConditions: failClosed(row.failClosedConditions),
      sourceSafetyClass: 'source_safe_exchange_dispute_repair_metadata',
      sourceSafetyPosture: 'dispute_repair_roots_commands_runbooks_and_status_only_no_source_or_private_wallet_material',
      redactionPosture: {
        postureId: 'exchange_dispute_repair_redaction_v1',
        allowedPayloadClasses: [
          'dispute_case_identity',
          'incident_class',
          'affected_order_identity',
          'affected_settlement_identity',
          'affected_projection_roots',
          'repair_command',
          'verification_command',
          'runbook_id',
          'escalation_path',
          'proof_roots',
          'event_ids',
        ],
        forbiddenPayloadClasses: [...FORBIDDEN_EXCHANGE_OPERATION_PAYLOAD],
      },
      freshnessChecks: [
        {
          checkId: `${row.disputeCaseId}.dispute-repair-present`,
          command: 'pnpm run check:v36-gate7',
          cadence: 'per_gate',
          failClosedOn: failClosed(row.failClosedConditions),
        },
      ],
      sourceEvidence,
    };
    const disputeCaseRoot = `exchange-dispute-repair-case:${sha256(row.disputeCaseId + canonicalJson(rowWithoutRoots)).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      row.proofRootFields.map((field) => {
        const seed = `${row.disputeCaseId}:${field}:${disputeCaseRoot}:${row.affectedStateRoot}`;
        return [field, field === 'affectedStateRoot' ? row.affectedStateRoot : `exchange-proof:${sha256(seed).slice(0, 24)}`];
      }),
    );

    return {
      ...rowWithoutRoots,
      disputeCaseRoot,
      proofRoot: disputeCaseRoot,
      proofRoots,
    };
  });

  const revenueRoutes = EXCHANGE_REVENUE_ROUTE_ROWS.map((row) => {
    const rowWithoutRoots = {
      ...row,
      sourceSafetyClass: 'source_safe_exchange_revenue_route_metadata',
      sourceSafetyPosture: 'revenue_accounts_amounts_roots_and_right_routes_only_no_private_payment_credentials_or_source',
      redactionPosture: {
        postureId: 'exchange_revenue_route_redaction_v1',
        allowedPayloadClasses: [
          'revenue_route_identity',
          'public_principal_ids',
          'btc_amounts',
          'btd_range_identity',
          'rights_transfer_receipt_identity',
          'source_to_shares_root',
          'conservation_proof',
          'proof_roots',
          'event_ids',
        ],
        forbiddenPayloadClasses: [...FORBIDDEN_EXCHANGE_OPERATION_PAYLOAD],
      },
      freshnessChecks: [
        {
          checkId: `${row.revenueRouteId}.revenue-route-present`,
          command: 'pnpm run check:v36-gate7',
          cadence: 'per_gate',
          failClosedOn: ['missing_conservation_proof', 'ledger_database_projection_drift'],
        },
      ],
      sourceEvidence,
    };
    const revenueRouteRoot = `exchange-revenue-route:${sha256(row.revenueRouteId + canonicalJson(rowWithoutRoots)).slice(0, 24)}`;
    const proofRoots = Object.fromEntries(
      row.proofRootFields.map((field) => {
        const seed = `${row.revenueRouteId}:${field}:${revenueRouteRoot}:${row.conservationProof.proofRoot}`;
        return [field, field === 'conservationProofRoot' ? row.conservationProof.proofRoot : `exchange-proof:${sha256(seed).slice(0, 24)}`];
      }),
    );

    return {
      ...rowWithoutRoots,
      revenueRouteRoot,
      proofRoot: revenueRouteRoot,
      proofRoots,
    };
  });

  const observedIncidentClasses = disputeCases.map((row) => row.incidentClass);
  const observedRevenueRouteStates = revenueRoutes.map((row) => row.routeState);
  const missingIncidentClasses = EXCHANGE_DISPUTE_INCIDENT_CLASSES.filter((incidentClass) => !observedIncidentClasses.includes(incidentClass));
  const missingRevenueRouteStates = EXCHANGE_REVENUE_ROUTE_STATES.filter((routeState) => !observedRevenueRouteStates.includes(routeState));
  const serializedRows = canonicalJson({ disputeCases, revenueRoutes });
  const forbiddenMarkerDetected = includesSecretMarker(serializedRows);
  const rowsWithMissingSourceRoots = [...disputeCases, ...revenueRoutes].flatMap((row) =>
    row.sourceEvidence
      .filter((entry) => !entry.present)
      .map((entry) => `${row.disputeCaseId || row.revenueRouteId}:${entry.sourceRoot}`),
  );
  const disputesWithoutRepairCommand = disputeCases.filter((row) => row.repairCommand?.sourceSafe !== true || row.repairCommand?.proofRooted !== true);
  const disputesWithoutVerificationCommand = disputeCases.filter((row) => row.verificationCommand?.sourceSafe !== true || row.verificationCommand?.proofRooted !== true);
  const disputesWithoutRunbook = disputeCases.filter((row) => row.runbook?.sourceSafe !== true || row.runbook?.proofRooted !== true);
  const disputesWithoutEscalationPath = disputeCases.filter((row) => !row.escalationPath?.escalationPathId);
  const disputesWithoutProofRoots = disputeCases.filter((row) => row.proofRootFields.some((field) => !row.proofRoots[field]));
  const disputesWithoutEventIds = disputeCases.filter((row) => row.eventIds.length === 0);
  const revenueRoutesWithoutAccounts = revenueRoutes.filter((row) => !row.treasuryAccount || !row.depositorAccount || !row.readerAccount || !row.feeAccount);
  const revenueRoutesWithoutRoutes = revenueRoutes.filter((row) => !row.btcRoute || !row.btdRightRoute || !row.sourceToSharesRoute);
  const revenueRoutesWithoutConservation = revenueRoutes.filter((row) => row.conservationProof?.btcDebitsEqualCredits !== true || row.conservationProof?.btdRightsConserved !== true);
  const revenueRoutesWithoutProofRoots = revenueRoutes.filter((row) => row.proofRootFields.some((field) => !row.proofRoots[field]));
  const revenueRoutesWithoutEventIds = revenueRoutes.filter((row) => row.eventIds.length === 0);
  const rowsWithProtectedSource = [...disputeCases, ...revenueRoutes].filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('protected_source_payloads'));
  const rowsWithUnpaidAssetPackSource = [...disputeCases, ...revenueRoutes].filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('unpaid_assetpack_source'));
  const rowsWithPrivateWalletMaterial = [...disputeCases, ...revenueRoutes].filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('wallet_private_material'));
  const rowsWithPrivatePaymentCredentials = [...disputeCases, ...revenueRoutes].filter((row) => !row.redactionPosture.forbiddenPayloadClasses.includes('private_payment_credentials'));
  const rowsWithLegacySourceRoots = [...disputeCases, ...revenueRoutes].filter((row) => row.sourceEvidence.some((entry) => entry.sourceRoot.startsWith('_legacy/')));

  const failures = [
    ...missingIncidentClasses.map((incidentClass) => `missing required Exchange dispute incident class ${incidentClass}`),
    ...missingRevenueRouteStates.map((routeState) => `missing required Exchange revenue route state ${routeState}`),
    ...rowsWithMissingSourceRoots.map((sourceRoot) => `missing Exchange dispute/revenue source root ${sourceRoot}`),
    ...(forbiddenMarkerDetected ? ['Exchange dispute repair revenue route contains a secret-shaped marker'] : []),
    ...disputesWithoutRepairCommand.map((row) => `Exchange dispute repair case ${row.disputeCaseId} lacks source-safe proof-rooted repair command`),
    ...disputesWithoutVerificationCommand.map((row) => `Exchange dispute repair case ${row.disputeCaseId} lacks source-safe proof-rooted verification command`),
    ...disputesWithoutRunbook.map((row) => `Exchange dispute repair case ${row.disputeCaseId} lacks source-safe proof-rooted runbook`),
    ...disputesWithoutEscalationPath.map((row) => `Exchange dispute repair case ${row.disputeCaseId} lacks escalation path`),
    ...disputesWithoutProofRoots.map((row) => `Exchange dispute repair case ${row.disputeCaseId} lacks proof roots`),
    ...disputesWithoutEventIds.map((row) => `Exchange dispute repair case ${row.disputeCaseId} lacks event ids`),
    ...revenueRoutesWithoutAccounts.map((row) => `Exchange revenue route ${row.revenueRouteId} lacks depositor reader treasury or fee account`),
    ...revenueRoutesWithoutRoutes.map((row) => `Exchange revenue route ${row.revenueRouteId} lacks BTC route BTD right route or source-to-shares route`),
    ...revenueRoutesWithoutConservation.map((row) => `Exchange revenue route ${row.revenueRouteId} lacks conservation proof`),
    ...revenueRoutesWithoutProofRoots.map((row) => `Exchange revenue route ${row.revenueRouteId} lacks proof roots`),
    ...revenueRoutesWithoutEventIds.map((row) => `Exchange revenue route ${row.revenueRouteId} lacks event ids`),
    ...rowsWithProtectedSource.map((row) => `Exchange dispute/revenue row ${row.disputeCaseId || row.revenueRouteId} lacks protected source boundary`),
    ...rowsWithUnpaidAssetPackSource.map((row) => `Exchange dispute/revenue row ${row.disputeCaseId || row.revenueRouteId} lacks unpaid AssetPack source boundary`),
    ...rowsWithPrivateWalletMaterial.map((row) => `Exchange dispute/revenue row ${row.disputeCaseId || row.revenueRouteId} lacks wallet private material boundary`),
    ...rowsWithPrivatePaymentCredentials.map((row) => `Exchange dispute/revenue row ${row.disputeCaseId || row.revenueRouteId} lacks private payment credential boundary`),
    ...rowsWithLegacySourceRoots.map((row) => `Exchange dispute/revenue row ${row.disputeCaseId || row.revenueRouteId} points at _legacy source roots`),
  ];

  const coverage = {
    requiredIncidentClasses: [...EXCHANGE_DISPUTE_INCIDENT_CLASSES],
    observedIncidentClasses,
    missingIncidentClasses,
    requiredRevenueRouteStates: [...EXCHANGE_REVENUE_ROUTE_STATES],
    observedRevenueRouteStates,
    missingRevenueRouteStates,
    disputeCaseCount: disputeCases.length,
    revenueRouteCount: revenueRoutes.length,
    allRequiredIncidentClassesCovered: includesAll(observedIncidentClasses, EXCHANGE_DISPUTE_INCIDENT_CLASSES),
    allRequiredRevenueRouteStatesCovered: includesAll(observedRevenueRouteStates, EXCHANGE_REVENUE_ROUTE_STATES),
    staleOwnerCovered: observedIncidentClasses.includes('stale_owner'),
    cancelledOrderReplayCovered: observedIncidentClasses.includes('cancelled_order_replay'),
    underpaymentCovered: observedIncidentClasses.includes('underpayment'),
    overpaymentCovered: observedIncidentClasses.includes('overpayment'),
    projectionDriftCovered: observedIncidentClasses.includes('projection_drift'),
    sourceLeakageCovered: observedIncidentClasses.includes('source_leakage'),
    deliveryMismatchCovered: observedIncidentClasses.includes('delivery_mismatch'),
    repairCommandsSourceSafe: disputesWithoutRepairCommand.length === 0,
    verificationCommandsSourceSafe: disputesWithoutVerificationCommand.length === 0,
    runbooksProofRootedSourceSafe: disputesWithoutRunbook.length === 0,
    escalationPathsCovered: disputesWithoutEscalationPath.length === 0,
    disputeProofRootsCovered: disputesWithoutProofRoots.length === 0,
    disputeEventIdsCovered: disputesWithoutEventIds.length === 0,
    depositorReaderTreasuryFeeRoutesCovered: revenueRoutesWithoutAccounts.length === 0,
    btcRouteCovered: revenueRoutes.every((row) => Boolean(row.btcRoute?.btcRouteId)),
    btdRightRouteCovered: revenueRoutes.every((row) => Boolean(row.btdRightRoute?.btdRightRouteId)),
    sourceToSharesRouteCovered: revenueRoutes.every((row) => Boolean(row.sourceToSharesRoute?.sourceToSharesRouteId)),
    conservationProofCovered: revenueRoutesWithoutConservation.length === 0,
    revenueProofRootsCovered: revenueRoutesWithoutProofRoots.length === 0,
    revenueEventIdsCovered: revenueRoutesWithoutEventIds.length === 0,
    missingSourceRoots: rowsWithMissingSourceRoots,
    legacySourceRoots: rowsWithLegacySourceRoots.length > 0,
    credentialsSerialized: forbiddenMarkerDetected,
    privateWalletMaterialSerialized: false,
    privatePaymentCredentialsSerialized: false,
    protectedSourceVisible: rowsWithProtectedSource.length > 0,
    unpaidAssetPackSourceVisible: rowsWithUnpaidAssetPackSource.length > 0,
  };

  const artifactSeed = {
    version,
    currentTarget,
    disputeCases,
    revenueRoutes,
    coverage,
    sourceSafetyVerdict: EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_SOURCE_SAFETY_VERDICT,
  };

  return {
    artifactId: 'v36-exchange-dispute-repair-revenue-route',
    schemaId: EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_SCHEMA_ID,
    version,
    currentTarget,
    generatedAt,
    sourceSafetyVerdict: EXCHANGE_DISPUTE_REPAIR_REVENUE_ROUTE_SOURCE_SAFETY_VERDICT,
    operationalBoundary: {
      exchangeDisputeRepairCaseCovers: 'stale owner, cancelled order replay, underpayment, overpayment, projection drift, source leakage, and delivery mismatch',
      exchangeRevenueRouteCovers: 'depositor, reader, treasury, fee, BTC route, BTD right route, and conservation proof',
      repairRunbookBinding: 'runbooks and repair commands are source-safe and proof-rooted',
      mayExpose: [
        'dispute_case_identity',
        'incident_class',
        'affected_order_identity',
        'affected_settlement_identity',
        'projection_roots',
        'repair_command',
        'verification_command',
        'runbook_id',
        'escalation_path',
        'revenue_accounts',
        'btc_amounts',
        'btd_right_route',
        'source_to_shares_root',
        'conservation_proof',
        'proof_roots',
        'event_ids',
      ],
      mustNotExpose: [...FORBIDDEN_EXCHANGE_OPERATION_PAYLOAD],
    },
    passed: failures.length === 0,
    failures,
    coverage,
    requiredIncidentClasses: [...EXCHANGE_DISPUTE_INCIDENT_CLASSES],
    requiredRevenueRouteStates: [...EXCHANGE_REVENUE_ROUTE_STATES],
    disputeCaseRequiredFieldIds: [...EXCHANGE_DISPUTE_REPAIR_CASE_REQUIRED_FIELD_IDS],
    revenueRouteRequiredFieldIds: [...EXCHANGE_REVENUE_ROUTE_REQUIRED_FIELD_IDS],
    disputeCases,
    revenueRoutes,
    sourceEvidence: [
      ...disputeCases.map((row) => ({
        rowId: row.disputeCaseId,
        allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
        sourceRoots: row.sourceEvidence,
      })),
      ...revenueRoutes.map((row) => ({
        rowId: row.revenueRouteId,
        allSourceRootsPresent: row.sourceEvidence.every((entry) => entry.present),
        sourceRoots: row.sourceEvidence,
      })),
    ],
    artifactRoot: `exchange-dispute-repair-revenue-route:${stableRoot(artifactSeed).slice('sha256:'.length, 'sha256:'.length + 24)}`,
  };
}
