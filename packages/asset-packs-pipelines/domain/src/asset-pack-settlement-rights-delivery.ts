import { createHash } from 'node:crypto';
import {
  assertSourceToSharesSettlementAdmissible,
  buildSourceToSharesProof,
  sourceToSharesProofToSettlementConservationCheck,
  type SourceToSharesFitDepositInput,
} from '@bitcode/btd/source-to-shares';
import {
  buildBtdReadReceipt,
  buildBtdRightsTransferReceipt,
} from '@bitcode/btd/receipts';
import {
  buildAssetPackSettlementUnlock,
  type AssetPackSettlementUnlock,
} from '@bitcode/btd/settlement';
import {
  buildSupabaseStagingTestnetProjectionReadback,
  reconcileLedgerDatabaseProjection,
  type DatabaseProjectedFact,
  type LedgerDatabaseReconciliationReport,
  type LedgerObservedFact,
  type ObjectStorageArtifactFact,
} from '@bitcode/btd/reconciliation';
import type { AssetPackPreviewBoundary } from './asset-pack-preview-boundary';
import type { AssetPackSourceSafePreview } from './read-need';

export type AssetPackSettlementRightsDeliveryState =
  | 'settlement_delivered'
  | 'blocked_until_payment_finality'
  | 'blocked_until_compensation_conservation'
  | 'blocked_until_projection_repair'
  | 'blocked_until_pull_request_delivery'
  | 'blocked_until_worthy_preview';

export type AssetPackSettlementRightsDeliveryStorageRecordKind =
  | 'btc_payment_observation'
  | 'btc_settlement_readback'
  | 'settlement_finality'
  | 'source_to_shares_compensation'
  | 'btd_read_receipt'
  | 'btd_rights_transfer'
  | 'delivery_unlock'
  | 'ledger_database_storage_reconciliation'
  | 'replay_receipt'
  | 'repair_posture';

export type AssetPackSettlementRightsDeliveryRepairAction =
  | 'run_worthy_assetpack_preview'
  | 'refresh_stale_btc_quote'
  | 'observe_btc_payment'
  | 'wait_for_btc_finality'
  | 'repair_source_to_shares_conservation'
  | 'repair_ledger_database_storage_projection'
  | 'recover_pull_request_delivery'
  | 'ship_source_bearing_pull_request';

export interface AssetPackSettlementRightsDeliverySourceSafety {
  sourceSafetyClass: 'source_safe_settlement_rights_delivery_boundary';
  sourceSafeMetadataOnly: true;
  protectedSourcePayloadSerialized: false;
  sourceBearingDeliveryUnlockedToReader: boolean;
  rawProtectedPromptVisible: false;
  rawProviderResponseVisible: false;
  unpaidAssetPackSourceVisible: false;
  walletPrivateMaterialVisible: false;
  settlementPrivatePayloadVisible: false;
  credentialsSerialized: false;
}

export interface AssetPackSettlementPaymentObservation {
  schema: 'bitcode.asset-pack.settlement.payment-observation';
  paymentReceiptId: string;
  payer: 'reader';
  payee: 'depositor';
  payerWalletId: string;
  payeeWalletId: string;
  btcNetwork: 'testnet' | 'mainnet' | 'signet' | 'regtest';
  expectedSats: number;
  observedDebitSats: number;
  observedCreditSats: number;
  txid: string;
  serverCustody: false;
  paymentReceiptRoot: string;
}

export interface AssetPackSettlementFinalityReceipt {
  schema: 'bitcode.asset-pack.settlement.finality-receipt';
  finalityState: 'prepared' | 'signed' | 'broadcast' | 'observed' | 'confirmed' | 'replaced' | 'reorged' | 'failed';
  confirmations: number;
  blockHeight: number | null;
  txid: string;
  finalityRoot: string;
}

export interface AssetPackBtcSettlementReadback {
  schema: 'bitcode.asset-pack.btc-settlement-readback';
  quoteAcceptanceState: 'accepted' | 'stale_quote_repair_required';
  walletReadinessState: 'wallet_ready_non_custodial';
  psbtPreparationState: 'psbt_prepared_source_safe';
  psbtSignatureState: 'psbt_signed_by_reader_wallet';
  broadcastState: 'not_broadcast' | 'broadcast_submitted';
  paymentObservationState: 'payment_observed' | 'payment_missing';
  finalityState: AssetPackSettlementFinalityReceipt['finalityState'];
  settlementFinalizationState: 'settlement_finalized' | 'not_finalized';
  rightsTransferState: 'rights_transferred' | 'rights_withheld';
  deliveryState: 'source_unlocked_delivery' | 'delivery_withheld';
  compensationRoutingState: 'compensation_routable' | 'compensation_withheld';
  sourceUnlockAdmissible: boolean;
  rightsTransferAdmissible: boolean;
  compensationRoutingAdmissible: boolean;
  serverCustody: false;
  walletPrivateMaterialVisible: false;
  blockerCodes: string[];
  readbackRoot: string;
}

export interface AssetPackDeliveryUnlockReceipt {
  schema: 'bitcode.asset-pack.delivery-unlock';
  state: 'source_bearing_pull_request_ready' | 'withheld';
  deliveryMechanism: 'pull_request_after_settlement';
  pullRequestTarget: string | null;
  sourceBearingDeliveryVisibleToReader: boolean;
  protectedSourcePayloadSerialized: false;
  requiredReceipts: string[];
  blockerCodes: string[];
  deliveryRoot: string;
}

export interface AssetPackSettlementRightsDeliveryStorageRecord {
  schema: 'bitcode.asset-pack.settlement-rights-delivery.storage-record';
  recordId: string;
  recordKind: AssetPackSettlementRightsDeliveryStorageRecordKind;
  namespace: string;
  key: string;
  root: string;
  sourceSafety: AssetPackSettlementRightsDeliverySourceSafety;
  payload: Record<string, unknown>;
}

export interface AssetPackSettlementRightsDeliveryReplayReceipt {
  schema: 'bitcode.asset-pack.settlement-rights-delivery.replay-receipt';
  replayMode: 'settlement-rights-delivery-replay';
  assetPackId: string;
  previewBoundaryRoot: string;
  quoteRoot: string;
  paymentReceiptRoot: string;
  finalityRoot: string;
  sourceToSharesRoot: string | null;
  rightsTransferRoot: string | null;
  readReceiptRoot: string | null;
  deliveryRoot: string;
  reconciliationRoot: string;
  replayRoot: string;
  verified: {
    paymentMatchesQuote: boolean;
    finalityConfirmed: boolean;
    sourceToSharesConserved: boolean;
    rightsTransferConfirmed: boolean;
    reconciliationAligned: boolean;
    deliveryUnlockedOnlyAfterSettlement: boolean;
    protectedSourcePayloadAbsent: boolean;
  };
}

export interface AssetPackSettlementRightsDeliveryRepairPosture {
  schema: 'bitcode.asset-pack.settlement-rights-delivery.repair-posture';
  state: AssetPackSettlementRightsDeliveryState;
  blockers: string[];
  warnings: string[];
  nextActions: AssetPackSettlementRightsDeliveryRepairAction[];
  repairRoot: string;
}

export interface AssetPackSettlementRightsDeliveryBoundary {
  schema: 'bitcode.asset-pack.settlement-rights-delivery-boundary';
  boundaryId: string;
  state: AssetPackSettlementRightsDeliveryState;
  assetPackId: string;
  readId: string;
  orderId: string;
  previewBoundaryRoot: string;
  paymentObservation: AssetPackSettlementPaymentObservation;
  finalityReceipt: AssetPackSettlementFinalityReceipt;
  btcSettlementReadback: AssetPackBtcSettlementReadback;
  sourceToSharesProof: Record<string, unknown> | null;
  btdReadReceipt: Record<string, unknown> | null;
  rightsTransferReceipt: Record<string, unknown> | null;
  settlementUnlock: AssetPackSettlementUnlock;
  deliveryUnlock: AssetPackDeliveryUnlockReceipt;
  reconciliationReport: LedgerDatabaseReconciliationReport;
  storageProjection: AssetPackSettlementRightsDeliveryStorageRecord[];
  replayReceipt: AssetPackSettlementRightsDeliveryReplayReceipt;
  repairPosture: AssetPackSettlementRightsDeliveryRepairPosture;
  sourceSafety: AssetPackSettlementRightsDeliverySourceSafety;
  proofRoots: {
    previewBoundaryRoot: string;
    paymentReceiptRoot: string;
    finalityRoot: string;
    sourceToSharesRoot: string | null;
    btdReadReceiptRoot: string | null;
    rightsTransferRoot: string | null;
    settlementUnlockRoot: string;
    deliveryRoot: string;
    reconciliationRoot: string;
    storageRoot: string;
    replayRoot: string;
    boundaryRoot: string;
  };
}

export interface AssetPackSettlementRightsDeliveryInput {
  previewBoundary: AssetPackPreviewBoundary;
  paymentObservation?: Partial<AssetPackSettlementPaymentObservation>;
  finality?: Partial<AssetPackSettlementFinalityReceipt>;
  readerWalletId?: string | null;
  depositorWalletId?: string | null;
  orderId?: string | null;
  readId?: string | null;
  readLicenseId?: string | null;
  ledgerAnchorId?: string | null;
  pullRequestTarget?: string | null;
  projectionMode?: 'aligned' | 'missing_database_projection' | 'drifted_object_storage' | 'blocked_staging_readback';
  stagingProjectRef?: string | null;
  stagingRestHost?: string | null;
  createdAt?: string;
}

const BASE_SOURCE_SAFETY: Omit<
  AssetPackSettlementRightsDeliverySourceSafety,
  'sourceBearingDeliveryUnlockedToReader'
> = {
  sourceSafetyClass: 'source_safe_settlement_rights_delivery_boundary',
  sourceSafeMetadataOnly: true,
  protectedSourcePayloadSerialized: false,
  rawProtectedPromptVisible: false,
  rawProviderResponseVisible: false,
  unpaidAssetPackSourceVisible: false,
  walletPrivateMaterialVisible: false,
  settlementPrivatePayloadVisible: false,
  credentialsSerialized: false,
};

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (typeof value === 'undefined') return 'null';
  if (typeof value === 'bigint') return JSON.stringify(value.toString());
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function rootOf(value: unknown): string {
  return `sha256:${sha256(stableStringify(value))}`;
}

function jsonSafe<T>(value: T): Record<string, unknown> {
  return JSON.parse(stableStringify(value)) as Record<string, unknown>;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function recordId(
  kind: AssetPackSettlementRightsDeliveryStorageRecordKind,
  key: string,
  root: string,
): string {
  return `asset-pack-settlement-${kind}-${sha256(`${key}:${root}`).slice(0, 16)}`;
}

function sourceSafety(unlocked: boolean): AssetPackSettlementRightsDeliverySourceSafety {
  return {
    ...BASE_SOURCE_SAFETY,
    sourceBearingDeliveryUnlockedToReader: unlocked,
  };
}

function storageRecord(
  recordKind: AssetPackSettlementRightsDeliveryStorageRecordKind,
  namespace: string,
  key: string,
  payload: Record<string, unknown>,
  unlocked: boolean,
): AssetPackSettlementRightsDeliveryStorageRecord {
  const root = rootOf({ recordKind, namespace, key, payload });
  return {
    schema: 'bitcode.asset-pack.settlement-rights-delivery.storage-record',
    recordId: recordId(recordKind, `${namespace}:${key}`, root),
    recordKind,
    namespace,
    key,
    root,
    sourceSafety: sourceSafety(unlocked),
    payload,
  };
}

function rangeFor(preview: AssetPackSourceSafePreview): {
  rangeStart: number;
  rangeEndExclusive: number;
  tokenCount: number;
} {
  const tokenCount = Math.max(1, preview.rangeProjection.tokenCount || 1);
  const rangeStart = preview.rangeProjection.rangeStart ?? 1;
  const rangeEndExclusive = preview.rangeProjection.rangeEndExclusive ?? rangeStart + tokenCount;
  return {
    rangeStart,
    rangeEndExclusive,
    tokenCount: rangeEndExclusive - rangeStart,
  };
}

function paymentObservationFor(input: AssetPackSettlementRightsDeliveryInput): AssetPackSettlementPaymentObservation {
  const preview = input.previewBoundary.sourceSafePreview;
  const expectedSats = numberValue(
    input.paymentObservation?.expectedSats,
    input.previewBoundary.quoteReceipt.sats,
  );
  const payerWalletId =
    firstString(input.paymentObservation?.payerWalletId, input.readerWalletId, preview.feeQuote.payer) ||
    'reader-wallet-unbound';
  const payeeWalletId =
    firstString(input.paymentObservation?.payeeWalletId, input.depositorWalletId) ||
    `depositor-wallet-${input.previewBoundary.selectedFitProvenance.fitDepositAssetIds[0] || preview.assetPackId}`;
  const observedDebitSats = numberValue(input.paymentObservation?.observedDebitSats, expectedSats);
  const observedCreditSats = numberValue(input.paymentObservation?.observedCreditSats, observedDebitSats);
  const txid = firstString(input.paymentObservation?.txid, `testnet-${sha256(preview.assetPackId).slice(0, 32)}`)!;
  const withoutRoot = {
    schema: 'bitcode.asset-pack.settlement.payment-observation' as const,
    paymentReceiptId:
      firstString(input.paymentObservation?.paymentReceiptId, `btc-fee-${sha256(`${preview.assetPackId}:${txid}`).slice(0, 16)}`)!,
    payer: 'reader' as const,
    payee: 'depositor' as const,
    payerWalletId,
    payeeWalletId,
    btcNetwork: input.previewBoundary.settlementInstructions.btcNetwork,
    expectedSats,
    observedDebitSats,
    observedCreditSats,
    txid,
    serverCustody: false as const,
  };

  return {
    ...withoutRoot,
    paymentReceiptRoot: rootOf(withoutRoot),
  };
}

function finalityReceiptFor(input: {
  payment: AssetPackSettlementPaymentObservation;
  finality?: Partial<AssetPackSettlementFinalityReceipt>;
}): AssetPackSettlementFinalityReceipt {
  const finalityState = input.finality?.finalityState || 'confirmed' as const;
  const withoutRoot = {
    schema: 'bitcode.asset-pack.settlement.finality-receipt' as const,
    finalityState,
    confirmations: numberValue(
      input.finality?.confirmations,
      finalityState === 'confirmed' ? 6 : 0,
    ),
    blockHeight:
      typeof input.finality?.blockHeight === 'number'
        ? input.finality.blockHeight
        : finalityState === 'confirmed'
          ? 840_000
          : null,
    txid: firstString(input.finality?.txid, input.payment.txid)!,
  };

  return {
    ...withoutRoot,
    finalityRoot: rootOf(withoutRoot),
  };
}

function fitDepositsFor(
  previewBoundary: AssetPackPreviewBoundary,
  findingFitsResultRoot: string,
  depositorWalletId: string,
): SourceToSharesFitDepositInput[] {
  const selected = previewBoundary.selectedFitProvenance.selectedCandidates.length
    ? previewBoundary.selectedFitProvenance.selectedCandidates
    : previewBoundary.selectedFitProvenance.fitDepositAssetIds.map((assetId) => ({
        assetId,
        finalScore: previewBoundary.sourceSafePreview.fit.admittedFitQuality,
        semanticScore: previewBoundary.sourceSafePreview.fit.admittedFitQuality,
        proofRoot: null,
        measurementRoot: null,
        reconciliationReadbackRoot: null,
      }));

  return selected.map((candidate, index) => ({
    depositId: candidate.assetId,
    assetPackId: previewBoundary.sourceSafePreview.assetPackId,
    depositorWalletId: index === 0 ? depositorWalletId : `${depositorWalletId}-${candidate.assetId}`,
    sourceManifestRoot:
      candidate.proofRoot ||
      previewBoundary.sourceSafePreview.roots.sourceManifestRoot ||
      rootOf({ sourceManifest: candidate.assetId }),
    findingFitsResultRoot,
    measurementRoot:
      candidate.measurementRoot ||
      previewBoundary.sourceSafePreview.need.measurementRoot ||
      rootOf({ measurement: candidate.assetId }),
    normalizedMeasurementUnits: Math.max(1, Math.round(candidate.finalScore * 1000)),
    fitQualityBps: Math.max(1, Math.min(10_000, Math.round(candidate.finalScore * 10_000))),
    accepted: true as const,
  }));
}

function buildReconciliation(input: {
  previewBoundary: AssetPackPreviewBoundary;
  payment: AssetPackSettlementPaymentObservation;
  finality: AssetPackSettlementFinalityReceipt;
  sourceToSharesRoot: string | null;
  rightsTransferRoot: string | null;
  readReceiptRoot: string | null;
  deliveryRoot: string;
  settlementCheck: ReturnType<typeof sourceToSharesProofToSettlementConservationCheck> | null;
  mode: AssetPackSettlementRightsDeliveryInput['projectionMode'];
  createdAt: string;
  stagingProjectRef: string;
  stagingRestHost: string;
}): LedgerDatabaseReconciliationReport {
  const ledgerFacts: LedgerObservedFact[] = [
    {
      factId: 'btc-fee-payment',
      ledgerRoot: input.payment.paymentReceiptRoot,
      finalityState: input.finality.finalityState === 'confirmed' ? 'confirmed' : 'broadcast',
    },
    {
      factId: 'settlement-finality',
      ledgerRoot: input.finality.finalityRoot,
      finalityState: input.finality.finalityState === 'confirmed' ? 'confirmed' : 'broadcast',
    },
    ...(input.sourceToSharesRoot
      ? [{
          factId: 'source-to-shares-compensation',
          ledgerRoot: input.sourceToSharesRoot,
          finalityState: 'confirmed' as const,
        }]
      : []),
    ...(input.rightsTransferRoot
      ? [{
          factId: 'btd-rights-transfer',
          ledgerRoot: input.rightsTransferRoot,
          finalityState: 'confirmed' as const,
        }]
      : []),
    ...(input.readReceiptRoot
      ? [{
          factId: 'btd-read-receipt',
          ledgerRoot: input.readReceiptRoot,
          finalityState: 'confirmed' as const,
        }]
      : []),
    {
      factId: 'delivery-unlock',
      ledgerRoot: input.deliveryRoot,
      finalityState: input.rightsTransferRoot ? 'confirmed' : 'prepared',
    },
  ];

  const databaseFacts: DatabaseProjectedFact[] = ledgerFacts
    .filter((fact) => input.mode !== 'missing_database_projection' || fact.factId !== 'btd-rights-transfer')
    .map((fact) => ({
      factId: fact.factId,
      projectedLedgerRoot:
        input.mode === 'drifted_object_storage' && fact.factId === 'delivery-unlock'
          ? rootOf({ drifted: fact.ledgerRoot })
          : fact.ledgerRoot,
      projectedFinalityState: fact.finalityState,
      projectedObjectStorageRoot:
        fact.factId === 'delivery-unlock'
          ? input.mode === 'drifted_object_storage'
            ? rootOf({ driftedObjectStorage: input.deliveryRoot })
            : input.deliveryRoot
          : undefined,
    }));

  const objectStorageArtifacts: ObjectStorageArtifactFact[] = [
    {
      factId: 'source-safe-preview',
      artifactId: `${input.previewBoundary.assetPackId}:source-safe-preview`,
      artifactKind: 'asset_pack_source_safe_preview',
      storageRoot: input.previewBoundary.proofRoots.previewRoot,
      manifestRoot: input.previewBoundary.proofRoots.boundaryRoot,
      sourceVisibility: 'source_safe',
      durable: true,
      containsProtectedSource: false,
      encrypted: false,
    },
    {
      factId: 'protected-source-encrypted',
      artifactId: `${input.previewBoundary.assetPackId}:protected-source-encrypted`,
      artifactKind: 'asset_pack_protected_source_encrypted',
      storageRoot: rootOf({
        assetPackId: input.previewBoundary.assetPackId,
        protectedSource: 'encrypted',
        previewRoot: input.previewBoundary.proofRoots.previewRoot,
      }),
      manifestRoot: input.previewBoundary.sourceSafePreview.roots.sourceManifestRoot,
      sourceVisibility: 'encrypted_protected_source',
      durable: true,
      containsProtectedSource: true,
      encrypted: true,
    },
    {
      factId: 'delivery-unlock',
      artifactId: `${input.previewBoundary.assetPackId}:delivery-manifest`,
      artifactKind: 'delivery_manifest',
      storageRoot: input.deliveryRoot,
      manifestRoot: input.deliveryRoot,
      sourceVisibility: 'source_safe',
      durable: input.mode !== 'drifted_object_storage',
      containsProtectedSource: false,
      encrypted: false,
    },
  ];

  const expectedReadbackCount = input.mode === 'blocked_staging_readback' ? 2 : 3;
  const stagingTestnetReadback = buildSupabaseStagingTestnetProjectionReadback({
    readbackId: `staging-readback-${sha256(input.previewBoundary.assetPackId).slice(0, 16)}`,
    lane: 'staging-testnet',
    supabaseProjectRef: input.stagingProjectRef,
    restHost: input.stagingRestHost,
    adminCredentialState: 'provided_out_of_band',
    tableReadbacks: [
      {
        table: 'pipeline_runs',
        expectedCount: 1,
        observedCount: 1,
        synchronized: true,
        proofRoot: rootOf(['pipeline_runs', input.previewBoundary.assetPackId]),
      },
      {
        table: 'ledger_entries',
        expectedCount: 3,
        observedCount: expectedReadbackCount,
        synchronized: expectedReadbackCount === 3,
        proofRoot: rootOf(['ledger_entries', input.previewBoundary.assetPackId, expectedReadbackCount]),
      },
      {
        table: 'asset_pack_deliveries',
        expectedCount: 1,
        observedCount: 1,
        synchronized: true,
        proofRoot: rootOf(['asset_pack_deliveries', input.previewBoundary.assetPackId]),
      },
    ],
    issuedAt: input.createdAt,
  });

  return reconcileLedgerDatabaseProjection({
    reconciliationId: `asset-pack-settlement-reconciliation-${sha256(input.previewBoundary.assetPackId).slice(0, 16)}`,
    ledgerFacts,
    databaseFacts,
    objectStorageArtifacts,
    metaphysicalFacts: [
      {
        factId: 'private-source-license',
        factKind: 'access_policy_document',
        canonicalRoot: input.previewBoundary.sourceSafePreview.accessPolicy.accessPolicyHash,
        receiptRoot: input.rightsTransferRoot || undefined,
        private: true,
      },
    ],
    stagingTestnetReadback,
    settlementConservationChecks: input.settlementCheck ? [input.settlementCheck] : [],
    issuedAt: input.createdAt,
  });
}

function deliveryUnlockFor(input: {
  settlementUnlock: AssetPackSettlementUnlock;
  rightsTransferRoot: string | null;
  reconciliation: LedgerDatabaseReconciliationReport;
  pullRequestTarget: string | null;
}): AssetPackDeliveryUnlockReceipt {
  const blockerCodes = [
    ...(input.settlementUnlock.sourceAvailable ? [] : ['settlement_unlock_missing']),
    ...(input.rightsTransferRoot ? [] : ['btd_rights_transfer_missing']),
    ...(input.reconciliation.blocking ? ['ledger_database_storage_repair_required'] : []),
    ...(input.pullRequestTarget ? [] : ['pull_request_target_missing']),
  ];
  const unlocked = blockerCodes.length === 0;
  const withoutRoot = {
    schema: 'bitcode.asset-pack.delivery-unlock' as const,
    state: unlocked ? 'source_bearing_pull_request_ready' as const : 'withheld' as const,
    deliveryMechanism: 'pull_request_after_settlement' as const,
    pullRequestTarget: input.pullRequestTarget,
    sourceBearingDeliveryVisibleToReader: unlocked,
    protectedSourcePayloadSerialized: false as const,
    requiredReceipts: [
      'btc_payment_observation',
      'settlement_finality',
      'source_to_shares_compensation',
      'btd_rights_transfer',
      'ledger_database_storage_reconciliation',
    ],
    blockerCodes,
  };

  return {
    ...withoutRoot,
    deliveryRoot: rootOf(withoutRoot),
  };
}

function stateFor(input: {
  previewBoundary: AssetPackPreviewBoundary;
  finalityConfirmed: boolean;
  sourceToSharesAdmissible: boolean;
  reconciliation: LedgerDatabaseReconciliationReport;
  delivery: AssetPackDeliveryUnlockReceipt;
}): AssetPackSettlementRightsDeliveryState {
  if (input.previewBoundary.sourceSafePreview.fit.resultState !== 'worthy_fit') {
    return 'blocked_until_worthy_preview';
  }
  if (!input.finalityConfirmed) return 'blocked_until_payment_finality';
  if (!input.sourceToSharesAdmissible) return 'blocked_until_compensation_conservation';
  if (input.reconciliation.blocking) return 'blocked_until_projection_repair';
  if (!input.delivery.sourceBearingDeliveryVisibleToReader) return 'blocked_until_pull_request_delivery';
  return 'settlement_delivered';
}

function paymentMatchesQuote(input: {
  previewBoundary: AssetPackPreviewBoundary;
  payment: AssetPackSettlementPaymentObservation;
}): boolean {
  return (
    input.payment.expectedSats === input.previewBoundary.quoteReceipt.sats &&
    input.payment.observedDebitSats === input.previewBoundary.quoteReceipt.sats &&
    input.payment.observedCreditSats === input.previewBoundary.quoteReceipt.sats
  );
}

function repairPostureFor(input: {
  state: AssetPackSettlementRightsDeliveryState;
  paymentMatchesAcceptedQuote: boolean;
  finalityConfirmed: boolean;
  sourceToSharesAdmissible: boolean;
  reconciliation: LedgerDatabaseReconciliationReport;
  delivery: AssetPackDeliveryUnlockReceipt;
}): AssetPackSettlementRightsDeliveryRepairPosture {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const nextActions: AssetPackSettlementRightsDeliveryRepairAction[] = [];

  if (input.state === 'blocked_until_worthy_preview') {
    blockers.push('worthy_assetpack_preview_missing');
    nextActions.push('run_worthy_assetpack_preview');
  }
  if (!input.paymentMatchesAcceptedQuote) {
    blockers.push('stale_btc_quote_or_payment_mismatch');
    nextActions.push('refresh_stale_btc_quote', 'observe_btc_payment');
  }
  if (!input.finalityConfirmed) {
    blockers.push('btc_payment_finality_missing');
    nextActions.push('observe_btc_payment', 'wait_for_btc_finality');
  }
  if (!input.sourceToSharesAdmissible) {
    blockers.push('source_to_shares_conservation_failed');
    nextActions.push('repair_source_to_shares_conservation');
  }
  if (input.reconciliation.blocking) {
    blockers.push('ledger_database_storage_projection_not_aligned');
    nextActions.push('repair_ledger_database_storage_projection');
  }
  if (input.delivery.blockerCodes.includes('pull_request_target_missing')) {
    blockers.push('pull_request_delivery_missing');
    nextActions.push('recover_pull_request_delivery');
  }
  if (!blockers.length) {
    nextActions.push('ship_source_bearing_pull_request');
  }
  if (input.reconciliation.repairActions.length) {
    warnings.push(`repair_actions=${input.reconciliation.repairActions.length}`);
  }

  const withoutRoot = {
    schema: 'bitcode.asset-pack.settlement-rights-delivery.repair-posture' as const,
    state: input.state,
    blockers,
    warnings,
    nextActions,
  };

  return {
    ...withoutRoot,
    repairRoot: rootOf(withoutRoot),
  };
}

function btcSettlementReadbackFor(input: {
  previewBoundary: AssetPackPreviewBoundary;
  payment: AssetPackSettlementPaymentObservation;
  finality: AssetPackSettlementFinalityReceipt;
  paymentMatchesAcceptedQuote: boolean;
  sourceToSharesAdmissible: boolean;
  rightsTransferRoot: string | null;
  delivery: AssetPackDeliveryUnlockReceipt;
}): AssetPackBtcSettlementReadback {
  const finalityConfirmed = input.finality.finalityState === 'confirmed';
  const sourceUnlockAdmissible =
    input.delivery.sourceBearingDeliveryVisibleToReader &&
    finalityConfirmed &&
    Boolean(input.rightsTransferRoot) &&
    input.sourceToSharesAdmissible &&
    input.paymentMatchesAcceptedQuote;
  const blockerCodes = [
    input.paymentMatchesAcceptedQuote ? null : 'stale_btc_quote_or_payment_mismatch',
    finalityConfirmed ? null : 'btc_payment_finality_missing',
    input.sourceToSharesAdmissible ? null : 'source_to_shares_conservation_failed',
    input.rightsTransferRoot ? null : 'btd_rights_transfer_missing',
    input.delivery.sourceBearingDeliveryVisibleToReader ? null : 'source_bearing_delivery_withheld',
  ].filter((entry): entry is string => Boolean(entry));
  const withoutRoot = {
    schema: 'bitcode.asset-pack.btc-settlement-readback' as const,
    quoteAcceptanceState: input.paymentMatchesAcceptedQuote
      ? 'accepted' as const
      : 'stale_quote_repair_required' as const,
    walletReadinessState: 'wallet_ready_non_custodial' as const,
    psbtPreparationState: 'psbt_prepared_source_safe' as const,
    psbtSignatureState: 'psbt_signed_by_reader_wallet' as const,
    broadcastState:
      ['broadcast', 'observed', 'confirmed'].includes(input.finality.finalityState)
        ? 'broadcast_submitted' as const
        : 'not_broadcast' as const,
    paymentObservationState:
      input.payment.observedDebitSats > 0 && input.payment.observedCreditSats > 0
        ? 'payment_observed' as const
        : 'payment_missing' as const,
    finalityState: input.finality.finalityState,
    settlementFinalizationState:
      finalityConfirmed && input.paymentMatchesAcceptedQuote
        ? 'settlement_finalized' as const
        : 'not_finalized' as const,
    rightsTransferState: input.rightsTransferRoot ? 'rights_transferred' as const : 'rights_withheld' as const,
    deliveryState: input.delivery.sourceBearingDeliveryVisibleToReader
      ? 'source_unlocked_delivery' as const
      : 'delivery_withheld' as const,
    compensationRoutingState:
      finalityConfirmed && input.sourceToSharesAdmissible
        ? 'compensation_routable' as const
        : 'compensation_withheld' as const,
    sourceUnlockAdmissible,
    rightsTransferAdmissible: finalityConfirmed && Boolean(input.rightsTransferRoot),
    compensationRoutingAdmissible: finalityConfirmed && input.sourceToSharesAdmissible,
    serverCustody: false as const,
    walletPrivateMaterialVisible: false as const,
    blockerCodes,
  };

  return {
    ...withoutRoot,
    readbackRoot: rootOf(withoutRoot),
  };
}

function replayReceiptFor(input: {
  previewBoundary: AssetPackPreviewBoundary;
  payment: AssetPackSettlementPaymentObservation;
  finality: AssetPackSettlementFinalityReceipt;
  sourceToSharesRoot: string | null;
  rightsTransferRoot: string | null;
  readReceiptRoot: string | null;
  sourceToSharesAdmissible: boolean;
  delivery: AssetPackDeliveryUnlockReceipt;
  reconciliation: LedgerDatabaseReconciliationReport;
}): AssetPackSettlementRightsDeliveryReplayReceipt {
  const quoteMatches = paymentMatchesQuote(input);
  const verified = {
    paymentMatchesQuote: quoteMatches,
    finalityConfirmed: input.finality.finalityState === 'confirmed',
    sourceToSharesConserved: input.sourceToSharesAdmissible,
    rightsTransferConfirmed: Boolean(input.rightsTransferRoot),
    reconciliationAligned: !input.reconciliation.blocking && input.reconciliation.state === 'aligned',
    deliveryUnlockedOnlyAfterSettlement:
      !input.delivery.sourceBearingDeliveryVisibleToReader ||
      (
        input.finality.finalityState === 'confirmed' &&
        Boolean(input.rightsTransferRoot) &&
        input.sourceToSharesAdmissible &&
        !input.reconciliation.blocking
      ),
    protectedSourcePayloadAbsent: input.delivery.protectedSourcePayloadSerialized === false,
  };
  const withoutRoot = {
    schema: 'bitcode.asset-pack.settlement-rights-delivery.replay-receipt' as const,
    replayMode: 'settlement-rights-delivery-replay' as const,
    assetPackId: input.previewBoundary.assetPackId,
    previewBoundaryRoot: input.previewBoundary.proofRoots.boundaryRoot,
    quoteRoot: input.previewBoundary.quoteReceipt.quoteRoot,
    paymentReceiptRoot: input.payment.paymentReceiptRoot,
    finalityRoot: input.finality.finalityRoot,
    sourceToSharesRoot: input.sourceToSharesRoot,
    rightsTransferRoot: input.rightsTransferRoot,
    readReceiptRoot: input.readReceiptRoot,
    deliveryRoot: input.delivery.deliveryRoot,
    reconciliationRoot: input.reconciliation.proofRoots.repairPlanRoot,
    verified,
  };

  return {
    ...withoutRoot,
    replayRoot: rootOf(withoutRoot),
  };
}

function settlementUnlockFor(input: {
  previewBoundary: AssetPackPreviewBoundary;
  payment: AssetPackSettlementPaymentObservation;
  finality: AssetPackSettlementFinalityReceipt;
  paymentMatchesAcceptedQuote: boolean;
  sourceToSharesAdmissible: boolean;
  rightsTransferRoot: string | null;
  reconciliation: LedgerDatabaseReconciliationReport;
  readLicenseId: string;
  ledgerAnchorId: string;
  pullRequestTarget: string | null;
}): AssetPackSettlementUnlock {
  const settled =
    input.finality.finalityState === 'confirmed' &&
    input.paymentMatchesAcceptedQuote &&
    input.sourceToSharesAdmissible &&
    Boolean(input.rightsTransferRoot) &&
    !input.reconciliation.blocking;
  const readback = Object.fromEntries([
    'semanticMeasurement',
    'measureMintReceipt',
    'assetPackRange',
    'btdCell',
    'ownershipEvent',
    'readLicense',
    'mintReceipt',
    'btcFeeTransaction',
    'ledgerAnchor',
    'terminalJournal',
    'cryptoTelemetry',
  ].map((key) => [key, settled]));

  return buildAssetPackSettlementUnlock({
    ledgerSettlement: {
      status: settled ? 'settled' : 'blocked',
      settlementAdmissible: settled,
      reason: settled ? 'Settlement, rights transfer, compensation, and projections agree.' : 'Settlement boundary is not fully admissible.',
      assetPackId: input.previewBoundary.assetPackId,
      ledgerAnchorId: input.ledgerAnchorId,
      btcFeeReceiptId: input.payment.paymentReceiptId,
      ownershipEventId: input.rightsTransferRoot,
      readLicenseId: input.readLicenseId,
      depositorWalletId: input.payment.payeeWalletId,
      readerWalletId: input.payment.payerWalletId,
      readback,
    },
    pullRequestTarget: input.pullRequestTarget,
    requirePullRequestDelivery: true,
  });
}

export function buildAssetPackSettlementRightsDeliveryBoundary(
  input: AssetPackSettlementRightsDeliveryInput,
): AssetPackSettlementRightsDeliveryBoundary {
  const previewBoundary = input.previewBoundary;
  const preview = previewBoundary.sourceSafePreview;
  const createdAt = input.createdAt || preview.createdAt;
  const payment = paymentObservationFor(input);
  const finality = finalityReceiptFor({ payment, finality: input.finality });
  const finalityConfirmed = finality.finalityState === 'confirmed';
  const paymentMatchesAcceptedQuote = paymentMatchesQuote({ previewBoundary, payment });
  const range = rangeFor(preview);
  const readId = firstString(input.readId, preview.need.needId, preview.need.acceptanceRoot) || `read-${sha256(preview.assetPackId).slice(0, 16)}`;
  const orderId = firstString(input.orderId, `order-${sha256(`${preview.assetPackId}:${payment.paymentReceiptRoot}`).slice(0, 16)}`)!;
  const readLicenseId = firstString(input.readLicenseId, `read-license-${sha256(`${readId}:${preview.assetPackId}`).slice(0, 16)}`)!;
  const ledgerAnchorId = firstString(input.ledgerAnchorId, `ledger-anchor-${sha256(payment.paymentReceiptRoot).slice(0, 16)}`)!;
  const pullRequestTarget =
    input.pullRequestTarget === null
      ? null
      : firstString(input.pullRequestTarget, preview.delivery.pullRequestTarget);
  const findingFitsResultRoot =
    preview.fit.rankingRoot ||
    previewBoundary.selectedFitProvenance.rankingRoot ||
    previewBoundary.selectedFitProvenance.provenanceRoot;
  const depositorWalletId = payment.payeeWalletId;
  const fitDeposits = fitDepositsFor(previewBoundary, findingFitsResultRoot, depositorWalletId);
  let sourceToSharesProof: ReturnType<typeof buildSourceToSharesProof> | null = null;
  let sourceToSharesAdmissible = false;
  let sourceToSharesRoot: string | null = null;
  let settlementCheck: ReturnType<typeof sourceToSharesProofToSettlementConservationCheck> | null = null;

  try {
    sourceToSharesProof = buildSourceToSharesProof({
      readId,
      assetPackId: preview.assetPackId,
      acceptedNeedRoot: preview.need.acceptanceRoot || preview.need.measurementRoot,
      findingFitsResultRoot,
      fitDeposits,
      btdRange: {
        assetPackId: preview.assetPackId,
        rangeStart: range.rangeStart,
        rangeEndExclusive: range.rangeEndExclusive,
        tokenCount: range.tokenCount,
        rangeRoot: preview.rangeProjection.projectionRoot,
        measureMintReceiptRoot: preview.need.measurementRoot,
      },
      feeQuote: {
        quoteId: previewBoundary.quoteReceipt.quoteId,
        quoteRoot: previewBoundary.quoteReceipt.quoteRoot,
        grossSats: previewBoundary.quoteReceipt.sats,
      },
      paymentObservation: {
        paymentReceiptRoot: payment.paymentReceiptRoot,
        observedDebitSats: payment.observedDebitSats,
        observedCreditSats: payment.observedCreditSats,
        finalityState: finality.finalityState === 'observed' ? 'broadcast' : finality.finalityState,
        txid: payment.txid,
      },
      issuedAt: createdAt,
    });
    settlementCheck = sourceToSharesProofToSettlementConservationCheck(sourceToSharesProof);
    assertSourceToSharesSettlementAdmissible(sourceToSharesProof);
    sourceToSharesAdmissible = true;
    sourceToSharesRoot = sourceToSharesProof.proofRoot;
  } catch {
    sourceToSharesAdmissible = false;
  }

  const paidUnlockRoot = rootOf({
    assetPackId: preview.assetPackId,
    quoteRoot: previewBoundary.quoteReceipt.quoteRoot,
    paymentReceiptRoot: payment.paymentReceiptRoot,
    finalityRoot: finality.finalityRoot,
  });
  const deliveryAdmissionRoot = rootOf({
    assetPackId: preview.assetPackId,
    paidUnlockRoot,
    deliveryMechanism: 'pull_request_after_settlement',
    pullRequestTarget,
  });
  const ledgerProjectionRoot = rootOf({
    assetPackId: preview.assetPackId,
    paymentReceiptRoot: payment.paymentReceiptRoot,
    sourceToSharesRoot,
    ledgerAnchorId,
  });

  let rightsTransferReceipt: Record<string, unknown> | null = null;
  let rightsTransferRoot: string | null = null;
  let btdReadReceipt: Record<string, unknown> | null = null;
  let readReceiptRoot: string | null = null;
  if (finalityConfirmed && paymentMatchesAcceptedQuote && sourceToSharesAdmissible && sourceToSharesProof) {
    try {
      const rightsReceipt = buildBtdRightsTransferReceipt({
        orderId,
        assetPackId: preview.assetPackId,
        rangeStart: range.rangeStart,
        rangeEndExclusive: range.rangeEndExclusive,
        tokenCount: range.tokenCount,
        fromWalletId: depositorWalletId,
        toWalletId: payment.payerWalletId,
        readerWalletId: payment.payerWalletId,
        depositorWalletId,
        priceSats: previewBoundary.quoteReceipt.sats,
        accessPolicyHash: preview.accessPolicy.accessPolicyHash,
        btcFeeReceiptId: payment.paymentReceiptId,
        btcFeeFinalityState: 'confirmed',
        readLicenseId,
        sourceSafePreviewRoot: preview.roots.previewRoot,
        paidUnlockRoot,
        deliveryAdmissionRoot,
        ledgerAnchorId,
        ledgerProjectionRoot,
        exchangeSequence: 1n,
        protectedSourceVisible: true,
        issuedAt: createdAt,
      });
      rightsTransferRoot = rightsReceipt.receiptRoot;
      rightsTransferReceipt = jsonSafe(rightsReceipt);
      const readReceipt = buildBtdReadReceipt({
        assetPackId: preview.assetPackId,
        readId,
        readRequestId: preview.need.needId,
        acceptedNeedRoot: preview.need.acceptanceRoot || preview.need.measurementRoot,
        findingFitsResultRoot,
        readerWalletId: payment.payerWalletId,
        depositorWalletId,
        rangeStart: range.rangeStart,
        rangeEndExclusive: range.rangeEndExclusive,
        tokenCount: range.tokenCount,
        sourceManifestRoot: preview.roots.sourceManifestRoot,
        sourceSafePreviewRoot: preview.roots.previewRoot,
        accessPolicyHash: preview.accessPolicy.accessPolicyHash,
        disclosureState: 'paid_unlocked',
        readRightState: 'licensed_read',
        paidUnlockRoot,
        deliveryAdmissionState: 'admitted',
        deliveryAdmissionRoot,
        ledgerProjectionRoot,
        protectedSourceVisible: true,
        issuedAt: createdAt,
      });
      readReceiptRoot = readReceipt.receiptRoot;
      btdReadReceipt = jsonSafe(readReceipt);
    } catch {
      rightsTransferReceipt = null;
      rightsTransferRoot = null;
      btdReadReceipt = null;
      readReceiptRoot = null;
    }
  }

  const preliminaryDelivery = {
    schema: 'bitcode.asset-pack.delivery-unlock' as const,
    state: 'withheld' as const,
    deliveryMechanism: 'pull_request_after_settlement' as const,
    pullRequestTarget,
    sourceBearingDeliveryVisibleToReader: false,
    protectedSourcePayloadSerialized: false as const,
    requiredReceipts: [] as string[],
    blockerCodes: [] as string[],
  };
  const preliminaryDeliveryRoot = rootOf(preliminaryDelivery);
  const reconciliation = buildReconciliation({
    previewBoundary,
    payment,
    finality,
    sourceToSharesRoot,
    rightsTransferRoot,
    readReceiptRoot,
    deliveryRoot: preliminaryDeliveryRoot,
    settlementCheck,
    mode: input.projectionMode || 'aligned',
    createdAt,
    stagingProjectRef: input.stagingProjectRef || 'tkpyosihuouusyaxtbau',
    stagingRestHost: input.stagingRestHost || 'https://tkpyosihuouusyaxtbau.supabase.co/rest/v1/',
  });
  const settlementUnlock = settlementUnlockFor({
    previewBoundary,
    payment,
    finality,
    paymentMatchesAcceptedQuote,
    sourceToSharesAdmissible,
    rightsTransferRoot,
    reconciliation,
    readLicenseId,
    ledgerAnchorId,
    pullRequestTarget,
  });
  const deliveryUnlock = deliveryUnlockFor({
    settlementUnlock,
    rightsTransferRoot,
    reconciliation,
    pullRequestTarget,
  });
  const state = stateFor({
    previewBoundary,
    finalityConfirmed,
    sourceToSharesAdmissible,
    reconciliation,
    delivery: deliveryUnlock,
  });
  const repairPosture = repairPostureFor({
    state,
    paymentMatchesAcceptedQuote,
    finalityConfirmed,
    sourceToSharesAdmissible,
    reconciliation,
    delivery: deliveryUnlock,
  });
  const btcSettlementReadback = btcSettlementReadbackFor({
    previewBoundary,
    payment,
    finality,
    paymentMatchesAcceptedQuote,
    sourceToSharesAdmissible,
    rightsTransferRoot,
    delivery: deliveryUnlock,
  });
  const replayReceipt = replayReceiptFor({
    previewBoundary,
    payment,
    finality,
    sourceToSharesRoot,
    rightsTransferRoot,
    readReceiptRoot,
    sourceToSharesAdmissible,
    delivery: deliveryUnlock,
    reconciliation,
  });
  const unlocked = deliveryUnlock.sourceBearingDeliveryVisibleToReader;
  const baseStorage = [
    storageRecord('btc_payment_observation', 'asset-pack/settlement', 'paymentObservation', jsonSafe(payment), unlocked),
    storageRecord('btc_settlement_readback', 'asset-pack/settlement', 'btcSettlementReadback', jsonSafe(btcSettlementReadback), unlocked),
    storageRecord('settlement_finality', 'asset-pack/settlement', 'finalityReceipt', jsonSafe(finality), unlocked),
    ...(sourceToSharesProof
      ? [storageRecord('source_to_shares_compensation', 'asset-pack/settlement', 'sourceToSharesProof', jsonSafe(sourceToSharesProof), unlocked)]
      : []),
    ...(btdReadReceipt
      ? [storageRecord('btd_read_receipt', 'asset-pack/settlement', 'btdReadReceipt', btdReadReceipt, unlocked)]
      : []),
    ...(rightsTransferReceipt
      ? [storageRecord('btd_rights_transfer', 'asset-pack/settlement', 'rightsTransferReceipt', rightsTransferReceipt, unlocked)]
      : []),
    storageRecord('delivery_unlock', 'asset-pack/settlement', 'deliveryUnlock', jsonSafe(deliveryUnlock), unlocked),
    storageRecord('ledger_database_storage_reconciliation', 'asset-pack/settlement', 'reconciliationReport', jsonSafe(reconciliation), unlocked),
    storageRecord('repair_posture', 'asset-pack/settlement', 'repairPosture', jsonSafe(repairPosture), unlocked),
  ];
  const storageRoot = rootOf(baseStorage.map((record) => record.root));
  const replayRecord = storageRecord('replay_receipt', 'asset-pack/settlement', 'replayReceipt', jsonSafe(replayReceipt), unlocked);
  const storageProjection = [...baseStorage, replayRecord];
  const settlementUnlockRoot = rootOf(settlementUnlock);
  const boundaryWithoutRoot = {
    schema: 'bitcode.asset-pack.settlement-rights-delivery-boundary' as const,
    state,
    assetPackId: preview.assetPackId,
    readId,
    orderId,
    previewBoundaryRoot: previewBoundary.proofRoots.boundaryRoot,
    paymentReceiptRoot: payment.paymentReceiptRoot,
    finalityRoot: finality.finalityRoot,
    sourceToSharesRoot,
    rightsTransferRoot,
    readReceiptRoot,
    settlementUnlockRoot,
    deliveryRoot: deliveryUnlock.deliveryRoot,
    reconciliationRoot: reconciliation.proofRoots.repairPlanRoot,
    storageRoot,
    replayRoot: replayReceipt.replayRoot,
    sourceSafety: sourceSafety(unlocked),
  };
  const boundaryRoot = rootOf(boundaryWithoutRoot);

  return {
    schema: 'bitcode.asset-pack.settlement-rights-delivery-boundary',
    boundaryId: `asset-pack-settlement-rights-delivery-${sha256(boundaryRoot).slice(0, 16)}`,
    state,
    assetPackId: preview.assetPackId,
    readId,
    orderId,
    previewBoundaryRoot: previewBoundary.proofRoots.boundaryRoot,
    paymentObservation: payment,
    finalityReceipt: finality,
    btcSettlementReadback,
    sourceToSharesProof: sourceToSharesProof ? jsonSafe(sourceToSharesProof) : null,
    btdReadReceipt,
    rightsTransferReceipt,
    settlementUnlock,
    deliveryUnlock,
    reconciliationReport: reconciliation,
    storageProjection,
    replayReceipt,
    repairPosture,
    sourceSafety: sourceSafety(unlocked),
    proofRoots: {
      previewBoundaryRoot: previewBoundary.proofRoots.boundaryRoot,
      paymentReceiptRoot: payment.paymentReceiptRoot,
      finalityRoot: finality.finalityRoot,
      sourceToSharesRoot,
      btdReadReceiptRoot: readReceiptRoot,
      rightsTransferRoot,
      settlementUnlockRoot,
      deliveryRoot: deliveryUnlock.deliveryRoot,
      reconciliationRoot: reconciliation.proofRoots.repairPlanRoot,
      storageRoot,
      replayRoot: replayReceipt.replayRoot,
      boundaryRoot,
    },
  };
}

export function persistAssetPackSettlementRightsDeliveryBoundary(
  execution: { store?: (namespace: string, key: string, value: unknown) => unknown } | null | undefined,
  boundary: AssetPackSettlementRightsDeliveryBoundary,
): AssetPackSettlementRightsDeliveryBoundary {
  try {
    execution?.store?.('asset-pack/settlement', 'boundary', boundary as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/settlement', 'boundaryRoot', boundary.proofRoots.boundaryRoot);
    execution?.store?.('asset-pack/settlement', 'paymentObservation', boundary.paymentObservation as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/settlement', 'finalityReceipt', boundary.finalityReceipt as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/settlement', 'btcSettlementReadback', boundary.btcSettlementReadback as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/settlement', 'sourceToSharesProof', boundary.sourceToSharesProof);
    execution?.store?.('asset-pack/settlement', 'btdReadReceipt', boundary.btdReadReceipt);
    execution?.store?.('asset-pack/settlement', 'rightsTransferReceipt', boundary.rightsTransferReceipt);
    execution?.store?.('asset-pack/settlement', 'settlementUnlock', boundary.settlementUnlock as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/settlement', 'deliveryUnlock', boundary.deliveryUnlock as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/settlement', 'reconciliationReport', boundary.reconciliationReport as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/settlement', 'replayReceipt', boundary.replayReceipt as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/settlement', 'repairPosture', boundary.repairPosture as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/settlement', 'storageProjection', boundary.storageProjection as unknown as Record<string, unknown>);
  } catch {
    // Settlement persistence must not mask an already built delivery boundary.
  }
  return boundary;
}

export function summarizeAssetPackSettlementRightsDeliveryBoundary(
  boundary: AssetPackSettlementRightsDeliveryBoundary,
): string {
  return [
    `AssetPack ${boundary.assetPackId}`,
    `state ${boundary.state}`,
    `payment ${boundary.paymentObservation.observedDebitSats}/${boundary.paymentObservation.expectedSats} sats`,
    `finality ${boundary.finalityReceipt.finalityState}`,
    `rights ${boundary.rightsTransferReceipt ? 'transferred' : 'withheld'}`,
    `delivery ${boundary.deliveryUnlock.state}`,
  ].join('; ');
}
