/** @type {Record<string, any>} */
export const RECEIPT_SCHEMAS = {
  deposit: {
    predicateType: 'https://bitcode.ai/receipt/deposit/v1',
    required: ['type', 'receiptId', 'assetId', 'title', 'author', 'assetRoot', 'issuedAt'],
    publicClaim: 'An asset commitment was accepted into the depot without revealing the sealed payload.'
  },
  bundle_issuance: {
    predicateType: 'https://bitcode.ai/receipt/bundle-issuance/v1',
    required: ['type', 'receiptId', 'bundleId', 'bundleRoot', 'queryHash', 'meteredUnits', 'chunkRefs', 'issuedAt'],
    publicClaim: 'A licensed reader received a private bundle derived from committed assets.'
  },
  allocation: {
    predicateType: 'https://bitcode.ai/receipt/allocation/v1',
    required: ['type', 'receiptId', 'bundleId', 'totalUnits', 'allocations', 'issuedAt'],
    publicClaim: 'Licensed read value was allocated across contributing assets in a conservation-preserving way.'
  },
  settlement_asset_pack_fit_quality: {
    predicateType: 'https://bitcode.ai/receipt/settlement-asset-pack-fit-quality/v26',
    required: ['type', 'receiptId', 'bundleId', 'assetPackId', 'sourceToSharesRef', 'quantizedObjectiveContractId', 'quantizedFitQualities', 'issuedAt'],
    publicClaim: 'A settlement AssetPack exposed source-to-shares fit qualities under the quantized objective contract before settlement receipts were finalized.'
  },
  btd_semantic_volume_measurement: {
    predicateType: 'https://bitcode.ai/receipt/btd-semantic-volume-measurement/v27',
    required: ['type', 'receiptId', 'assetPackId', 'normalizedBitcodeVolume', 'tokenCount', 'includedUnits', 'excludedUnits', 'issuedAt'],
    publicClaim: 'An AssetPack was measured with proof-addressable semantic volume before range minting.'
  },
  btd_asset_pack_mint: {
    predicateType: 'https://bitcode.ai/receipt/btd-asset-pack-mint/v27',
    required: ['type', 'receiptId', 'assetPackId', 'rangeStart', 'rangeEndExclusive', 'tokenCount', 'totalMintedBefore', 'totalMintedAfter', 'maxSupply', 'sourceManifestRoot', 'measurementReceiptRoot', 'fitReceiptRoot', 'proofRoot', 'dedupeReceiptRoot', 'settlementJournalRoot', 'exchangeReceiptRoot', 'accessPolicyId', 'accessPolicyHash', 'mintedAtExchangeSequence', 'issuedAt'],
    publicClaim: 'A proof-backed Read-Fit settlement minted a contiguous AssetPack range without exceeding the fixed BTD supply cap.'
  },
  btd_measure_mint: {
    predicateType: 'https://bitcode.ai/receipt/btd-measure-mint/v27',
    required: ['type', 'receiptId', 'assetPackId', 'normalizedBitcodeVolume', 'cumulativeMeasurementBefore', 'cumulativeMeasurementAfter', 'targetMintedBefore', 'targetMintedAfter', 'residualMintCreditBefore', 'residualMintCreditAfter', 'tokenCount', 'totalMintedBefore', 'totalMintedAfter', 'maxSupply', 'proofRoot', 'settlementJournalRoot', 'accessPolicyHash', 'issuedAt'],
    publicClaim: 'A Read-Fit-Prove-Settle measurement advanced the fixed-supply measureminting curve and either minted cells or emitted a zero-cell tail receipt.'
  },
  btd_contributor_allocation: {
    predicateType: 'https://bitcode.ai/receipt/btd-contributor-allocation/v27',
    required: ['type', 'receiptId', 'assetPackId', 'rangeStart', 'rangeEndExclusive', 'tokenCount', 'allocationMethod', 'allocations', 'issuedAt'],
    publicClaim: 'A minted AssetPack range was allocated across contributors without losing or creating BTD cells.'
  },
  btd_ancestry_review: {
    predicateType: 'https://bitcode.ai/receipt/btd-ancestry-review/v27',
    required: ['type', 'receiptId', 'childAssetPackId', 'minConfidenceBps', 'payableEdgeCount', 'recordedUnpaidEdgeCount', 'rejectedEdgeCount', 'supplyEffect', 'mintCountDelta', 'edges', 'issuedAt'],
    publicClaim: 'Late-bound ancestry edges were reviewed with loop, duplicate-source, and conflict checks as attribution and routing evidence without changing BTD supply.'
  },
  btd_licensed_read_revenue_route: {
    predicateType: 'https://bitcode.ai/receipt/btd-licensed-read-revenue-route/v27',
    required: ['type', 'receiptId', 'paymentId', 'assetPackId', 'priceAsset', 'grossSats', 'directSats', 'ancestorSats', 'treasurySats', 'disputeHoldbackSats', 'directRoutes', 'ancestorRoutes', 'treasuryRoutes', 'pendingRoutes', 'failedRoutes', 'routeState', 'treasuryWalletId', 'exchangeSequence', 'issuedAt'],
    publicClaim: 'A licensed-read BTC payment was routed locally across holders, proven ancestors, treasury, and dispute holdback without relying on marketplace royalty signaling.'
  },
  btc_fee_transaction: {
    predicateType: 'https://bitcode.ai/receipt/btc-fee-transaction/v27',
    required: ['type', 'receiptId', 'feePurpose', 'payerWalletId', 'walletSessionId', 'network', 'walletAuthorizationProof', 'satsPaid', 'exchangeSequence', 'terminalJournalRoot', 'finalityState', 'confirmations', 'feeAsset', 'serverCustody', 'issuedAt'],
    publicClaim: 'A BTC fee transaction was prepared, signed, broadcast, or confirmed without using BTD as a spend token.'
  },
  btd_asset_pack_ledger_anchor: {
    predicateType: 'https://bitcode.ai/receipt/btd-asset-pack-ledger-anchor/v27',
    required: ['type', 'receiptId', 'assetPackId', 'chain', 'network', 'commitmentMethod', 'commitmentRoot', 'sourceManifestRoot', 'proofRoot', 'accessPolicyHash', 'btdRangeStart', 'btdRangeEndExclusive', 'finalityState', 'confirmations', 'issuedAt'],
    publicClaim: 'An AssetPack range commitment was anchored or prepared for anchoring on an admitted ledger path.'
  },
  btd_asset_pack_rights_transfer: {
    predicateType: 'https://bitcode.ai/receipt/btd-asset-pack-rights-transfer/v27',
    required: ['type', 'receiptId', 'orderId', 'assetPackId', 'rangeStart', 'rangeEndExclusive', 'fromWalletId', 'toWalletId', 'priceAsset', 'priceSats', 'accessPolicyHash', 'btcFeeReceiptId', 'ledgerAnchorId', 'exchangeSequence', 'issuedAt'],
    publicClaim: 'An AssetPack range changed commercial rights through a BTC-priced Exchange settlement receipt.'
  },
  btd_terminal_journal_coverage: {
    predicateType: 'https://bitcode.ai/receipt/btd-terminal-journal-coverage/v27',
    required: ['type', 'receiptId', 'requiredTransactionKinds', 'observedTransactionKinds', 'missingTransactionKinds', 'blocking', 'issuedAt'],
    publicClaim: 'Terminal journal coverage proves the minimum V27 transaction families are represented before commercial finality can be claimed.'
  },
  btd_ledger_database_reconciliation: {
    predicateType: 'https://bitcode.ai/receipt/btd-ledger-database-reconciliation/v27',
    required: ['type', 'receiptId', 'repairs', 'metaphysicalFacts', 'blocking', 'issuedAt'],
    publicClaim: 'Ledger-derived projection drift was detected or cleared through a replayable reconciliation receipt.'
  },
  btd_protocol_upgrade: {
    predicateType: 'https://bitcode.ai/receipt/btd-protocol-upgrade/v27',
    required: ['type', 'receiptId', 'upgradeId', 'fromVersion', 'toVersion', 'network', 'migrationRoot', 'preStateRoot', 'approvalReceiptRoot', 'rollbackPlanRoot', 'upgradeState', 'issuedAt'],
    publicClaim: 'A Bitcode protocol upgrade or deployment migration was recorded with approval, state roots, rollback posture, and network scope.'
  },
  btd_deployment_readiness: {
    predicateType: 'https://bitcode.ai/receipt/btd-deployment-readiness/v27',
    required: ['type', 'receiptId', 'lane', 'network', 'requiredEnvironmentKeys', 'missingEnvironmentKeys', 'blocking', 'issuedAt'],
    publicClaim: 'A V27 crypto deployment lane was checked for network posture, environment readiness, telemetry, and approval gating.'
  },
  btd_crypto_telemetry_event: {
    predicateType: 'https://bitcode.ai/receipt/btd-crypto-telemetry-event/v27',
    required: ['type', 'receiptId', 'event', 'severity', 'subjectId', 'issuedAt'],
    publicClaim: 'A V27 crypto operational event was classified for alerting without changing protocol state.'
  },
  utility: {
    predicateType: 'https://bitcode.ai/receipt/utility/v1',
    required: ['type', 'receiptId', 'bundleId', 'benchmark', 'baselineBp', 'treatmentBp', 'upliftBp', 'issuedAt'],
    publicClaim: 'Licensed bundle consumption produced measurable benchmark lift.'
  }
};

/**
 * @param {any} type
 * @returns {any}
 */
export function schemaForReceipt(type) {
  return RECEIPT_SCHEMAS[type] || null;
}
