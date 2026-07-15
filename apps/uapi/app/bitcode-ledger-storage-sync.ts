export const BITCODE_LEDGER_STORAGE_SYNC_SURFACES = [
  {
    id: 'settlement-source-to-shares',
    label: 'Settlement Source-To-Shares',
    systems: ['btc-fee', 'btd-rights', 'ledger', 'database', 'object-storage'],
    requiredReadbacks: [
      'btc_payment_observation',
      'settlement_finality',
      'source_to_shares_compensation',
      'btd_rights_transfer',
      'ledger_database_storage_reconciliation',
    ],
    interfaceStates: [
      'quote-presented-source-safe',
      'payment-observed',
      'finality-confirmed',
      'rights-transferred',
      'projections-aligned',
    ],
    evidenceFiles: [
      'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
      'packages/asset-packs-pipelines/domain/src/__tests__/asset-pack-settlement-rights-delivery.test.ts',
      'packages/btd/src/reconciliation.ts',
      'apps/uapi/tests/terminalJournalReconciliation.test.ts',
    ],
  },
  {
    id: 'wallet-no-custody-authority',
    label: 'Wallet No-Custody Authority',
    systems: ['wallet', 'btc-fee', 'terminal'],
    requiredReadbacks: [
      'wallet_provider_session',
      'wallet_authorization_proof',
      'server_custody_rejected',
      'private_key_absent',
    ],
    interfaceStates: [
      'wallet-connected',
      'signing-session-live',
      'wrong-network-blocked',
      'server-custody-blocked',
    ],
    evidenceFiles: [
      'packages/btd/src/wallet.ts',
      'packages/btd/src/btc-fee-operation.ts',
      'apps/uapi/tests/terminalWalletBtcOperation.test.ts',
      'apps/uapi/tests/api/transactionWriteReadinessRoutes.test.ts',
    ],
  },
  {
    id: 'post-settlement-pull-request-delivery',
    label: 'Post-Settlement Pull Request Delivery',
    systems: ['delivery', 'vcs', 'assetpack-storage', 'terminal'],
    requiredReadbacks: [
      'delivery_unlock',
      'pull_request_after_settlement',
      'source_bearing_pull_request_ready',
      'rights_transfer_root',
    ],
    interfaceStates: [
      'preview-only-before-settlement',
      'source-bearing-delivery-withheld',
      'delivery-ready-after-rights',
      'repairable-delivery-failure',
    ],
    evidenceFiles: [
      'packages/asset-packs-pipelines/domain/src/asset-pack-settlement-rights-delivery.ts',
      'packages/asset-packs-pipelines/domain/src/reading-local-staging-rehearsal.ts',
      'apps/uapi/tests/terminalTransactionDetailCards.test.tsx',
    ],
  },
] as const;

export const BITCODE_LEDGER_STORAGE_SYNC_REPAIR_STATES = [
  'blocked_until_payment_finality',
  'blocked_until_compensation_conservation',
  'blocked_until_projection_repair',
  'blocked_until_pull_request_delivery',
] as const;

export const BITCODE_LEDGER_STORAGE_SYNC_CONTRACT = {
  surfaces: BITCODE_LEDGER_STORAGE_SYNC_SURFACES,
  repairStates: BITCODE_LEDGER_STORAGE_SYNC_REPAIR_STATES,
  sourceSafety: {
    sourceSafe: true,
    protectedSourcePayloadSerialized: false,
    unpaidAssetPackSourceVisible: false,
    rawProtectedPromptVisible: false,
    rawProviderResponseVisible: false,
    credentialsSerialized: false,
    walletPrivateMaterialVisible: false,
    privateSettlementPayloadVisible: false,
    serverCustodyAdmitted: false,
  },
  deliveryBoundary: {
    previewVisibleBeforeSettlement: true,
    sourceBearingDeliveryVisibleBeforeSettlement: false,
    sourceBearingDeliveryVisibleWithoutBtdRights: false,
    sourceBearingDeliveryVisibleAfterSettlementAndRights: true,
    deliveryMechanism: 'pull_request_after_settlement',
  },
} as const;

export function summarizeBitcodeLedgerStorageSyncContract() {
  const systemCount = new Set(
    BITCODE_LEDGER_STORAGE_SYNC_SURFACES.flatMap((surface) => surface.systems),
  ).size;
  const requiredReadbackCount = new Set(
    BITCODE_LEDGER_STORAGE_SYNC_SURFACES.flatMap((surface) => surface.requiredReadbacks),
  ).size;
  const interfaceStateCount = new Set(
    BITCODE_LEDGER_STORAGE_SYNC_SURFACES.flatMap((surface) => surface.interfaceStates),
  ).size;
  const evidenceFileCount = new Set(
    BITCODE_LEDGER_STORAGE_SYNC_SURFACES.flatMap((surface) => surface.evidenceFiles),
  ).size;

  return {
    surfaceCount: BITCODE_LEDGER_STORAGE_SYNC_SURFACES.length,
    systemCount,
    requiredReadbackCount,
    interfaceStateCount,
    evidenceFileCount,
    repairStateCount: BITCODE_LEDGER_STORAGE_SYNC_REPAIR_STATES.length,
    sourceSafe: BITCODE_LEDGER_STORAGE_SYNC_CONTRACT.sourceSafety.sourceSafe,
    serverCustodyAdmitted: BITCODE_LEDGER_STORAGE_SYNC_CONTRACT.sourceSafety.serverCustodyAdmitted,
    sourceBearingDeliveryVisibleBeforeSettlement:
      BITCODE_LEDGER_STORAGE_SYNC_CONTRACT.deliveryBoundary.sourceBearingDeliveryVisibleBeforeSettlement,
    sourceBearingDeliveryVisibleAfterSettlementAndRights:
      BITCODE_LEDGER_STORAGE_SYNC_CONTRACT.deliveryBoundary.sourceBearingDeliveryVisibleAfterSettlementAndRights,
  };
}
