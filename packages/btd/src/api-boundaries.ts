import { createHash } from 'crypto';
import type {
  BtdAccessPolicy,
  BtdOwnershipClaim,
  BtdReadLicense,
} from './access';
import { evaluateBtdReadAccess } from './access';
import type { BtdContributorMeasure } from './allocation';
import { allocateBtdContributorCells } from './allocation';
import type {
  BtdAncestorEdgeInput,
  BtdAncestorGraphEdge,
} from './ancestry';
import { reviewBtdAncestorEdges } from './ancestry';
import type {
  BtdInterfaceAuthoritySurface,
  BtdOrganizationPermissionAction,
  BtdOrganizationRole,
  BtdRepairApprovalState,
  BtdSettlementAuthorityState,
} from './authority';
import { evaluateBtdOrganizationInterfaceAuthority } from './authority';
import type {
  BtcFeeFinalityState,
  BtcFeePurpose,
  BtcFeeTransactionReceipt,
} from './bitcoin-fees';
import {
  advanceBtcFeeTransactionReceipt,
  assertBtcFeeTransactionReceipt,
  buildPreparedBtcFeeTransactionReceipt,
} from './bitcoin-fees';
import type {
  BtcFeeOperationPosture,
  BtcFeeQuote,
} from './btc-fee-operation';
import {
  assertBtcFeeQuote,
  assertBtcFeeQuoteActive,
  buildBtcFeeOperationPosture,
} from './btc-fee-operation';
import type { BridgeReadinessResearchRecordInput } from './bridge-readiness';
import { buildBridgeReadinessResearchPosture } from './bridge-readiness';
import type {
  BitcoinNetwork,
  LedgerNetwork,
} from './constants';
import {
  BTD_MAX_MINTABLE_SUPPLY,
  assertNonEmptyString,
} from './constants';
import type { V27CryptoDeploymentLaneKind } from './deployment-lanes';
import {
  buildV27CryptoDeploymentLane,
  buildV27CryptoDeploymentReadinessReceipt,
} from './deployment-lanes';
import type {
  AssetPackExchangeOrder,
  AssetPackExchangeOrderKind,
  AssetPackRightsTransferReceipt,
} from './exchange';
import {
  acceptAssetPackExchangeOrder,
  buildAssetPackRightsTransferReceipt,
  cancelAssetPackExchangeOrder,
  createAssetPackExchangeOrder,
  settleAssetPackExchangeOrder,
} from './exchange';
import type {
  BtdInterfaceIntegrationRecordInput,
  BtdInterfaceIntegrationRegressionProof,
} from './interface-integration';
import { buildBtdInterfaceIntegrationRegressionProof } from './interface-integration';
import type {
  AssetPackLedgerAnchor,
  LedgerFinalityState,
} from './ledger-anchor';
import {
  advanceAssetPackLedgerAnchor,
  assertAssetPackLedgerAnchor,
  buildPreparedAssetPackLedgerAnchor,
} from './ledger-anchor';
import type { BtdMeasureMintState } from './measuremint';
import {
  applyBtdMeasureMint,
  createBtdMeasureMintState,
} from './measuremint';
import { allocateAssetPackRange } from './range';
import {
  buildBtdAssetPackMintReceipt,
  buildBtdMintReceipt,
  buildBtdReadReceipt,
  buildBtdRightsTransferReceipt,
} from './receipts';
import type {
  DatabaseProjectedFact,
  LedgerObservedFact,
  MetaphysicalCanonicalFact,
  ObjectStorageArtifactFact,
  ProjectionRepairReceipt,
  SupabaseStagingTestnetProjectionReadback,
} from './reconciliation';
import { reconcileLedgerDatabaseProjection } from './reconciliation';
import type {
  BtdRevenueRecipientInput,
  BtdRevenueRouteException,
} from './revenue';
import {
  assertLicensedReadRevenueRouteConserved,
  buildLicensedReadRevenueRoute,
} from './revenue';
import type { SemanticVolumeUnitInput } from './semantic-volume';
import { measureProofAddressableSemanticVolume } from './semantic-volume';
import type { SourceToSharesProofInput } from './source-to-shares';
import { buildSourceToSharesProof } from './source-to-shares';
import { createBtdSupplyState } from './supply';
import type {
  BtdProtocolProofHookInput,
  BtdProtocolTelemetryInput,
  BtdProtocolTelemetryEnvelope,
  V27CryptoTelemetryEvent,
  V27CryptoTelemetryRecord,
} from './telemetry';
import {
  buildBtdProtocolTelemetryEnvelope,
  buildV27CryptoTelemetryRecord,
} from './telemetry';
import type {
  JournalEntry,
  JournalProjection,
  JournalTransactionKind,
} from './journal';
import {
  buildJournalCoverageReceipt,
  buildJournalEntry,
  diffJournalProjection,
} from './journal';
import type {
  BtdProtocolUpgradeReceipt,
  BtdProtocolUpgradeState,
} from './upgrade';
import {
  advanceBtdProtocolUpgradeReceipt,
  buildPlannedBtdProtocolUpgradeReceipt,
} from './upgrade';
import type { WalletSignerSession } from './wallet';
import { createWalletSignerSession } from './wallet';

export interface BtdRegistrySnapshotReader {
  getSupplyState(): Promise<unknown>;
  listAssetPackRanges(assetPackId?: string): Promise<unknown[]>;
}

export interface BtdMintDraftInput {
  assetPackId: string;
  readId: string;
  acceptedNeed: true;
  acceptedFit: true;
  sourceManifestRoot: string;
  fitReceiptRoot: string;
  proofRoot: string;
  dedupeReceiptRoot: string;
  settlementJournalRoot: string;
  exchangeReceiptRoot: string;
  accessPolicyId: string;
  accessPolicyHash: string;
  semanticUnits: SemanticVolumeUnitInput[];
  contributors?: BtdContributorMeasure[];
  measureMintState?: BtdMeasureMintState;
  exchangeSequence: bigint;
  actorId?: string;
  issuedAt?: string;
  depositorWalletId?: string;
  sourceSafePreviewRoot?: string;
  findingFitsResultRoot?: string;
  settlementConservationRoot?: string;
  ledgerProjectionRoot?: string;
  paidUnlockRoot?: string | null;
  deliveryAdmissionRoot?: string | null;
}

export interface BtdMintDraft {
  kind: 'btd_mint_draft';
  assetPackId: string;
  measurement: ReturnType<typeof measureProofAddressableSemanticVolume>;
  measureMint: ReturnType<typeof applyBtdMeasureMint>['receipt'];
  rangeAllocation?: ReturnType<typeof allocateAssetPackRange>;
  mintReceipt?: ReturnType<typeof buildBtdMintReceipt>;
  assetPackMintReceipt?: ReturnType<typeof buildBtdAssetPackMintReceipt>;
  contributorAllocation?: ReturnType<typeof allocateBtdContributorCells>;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  blocking: boolean;
  zeroCell: boolean;
}

export interface BtdReadReceiptBoundaryInput {
  actorId: string;
  receiptId?: string;
  assetPackId: string;
  readId: string;
  readRequestId: string;
  acceptedNeedRoot: string;
  findingFitsResultRoot: string;
  readerWalletId: string;
  depositorWalletId: string;
  rangeStart: number;
  rangeEndExclusive: number;
  tokenCount?: number;
  sourceManifestRoot: string;
  sourceSafePreviewRoot: string;
  accessPolicyHash: string;
  disclosureState: Parameters<typeof buildBtdReadReceipt>[0]['disclosureState'];
  readRightState: Parameters<typeof buildBtdReadReceipt>[0]['readRightState'];
  paidUnlockRoot?: string | null;
  deliveryAdmissionState: Parameters<typeof buildBtdReadReceipt>[0]['deliveryAdmissionState'];
  deliveryAdmissionRoot?: string | null;
  ledgerProjectionRoot: string;
  protectedSourceVisible?: boolean;
  exchangeSequence: bigint;
  commitToRegistry?: boolean;
  issuedAt?: string;
}

export interface BtdReadReceiptBoundarySettlement {
  kind: 'btd_read_receipt_boundary_settlement';
  actorId: string;
  readReceipt: ReturnType<typeof buildBtdReadReceipt>;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  registryWrite?: unknown;
  committed: boolean;
}

export interface BtdReadAccessInput {
  walletId: string;
  assetPackId: string;
  accessPolicy: BtdAccessPolicy;
  ownershipClaims?: BtdOwnershipClaim[];
  licenses?: BtdReadLicense[];
  at?: string;
}

export interface BtdReadAccessDecision {
  kind: 'btd_read_access_decision';
  actorId: string;
  assetPackId: string;
  decision: ReturnType<typeof evaluateBtdReadAccess>;
  policyDisclosure: {
    accessPolicyId: string;
    accessPolicyHash: string;
    ownerRead: boolean;
    licensedRead: boolean;
    derivativeUse: boolean;
    redistributionAllowed: boolean;
    confidentiality: BtdAccessPolicy['confidentiality'];
  };
}

export interface BtdOrganizationInterfaceAuthorityRouteInput {
  organizationId: string;
  organizationRole?: BtdOrganizationRole | null;
  organizationPermissionGrants?: string[];
  interfaceSurface: BtdInterfaceAuthoritySurface;
  action: BtdOrganizationPermissionAction;
  walletId?: string | null;
  readAccessDecision?: ReturnType<typeof evaluateBtdReadAccess> | null;
  settlementState?: BtdSettlementAuthorityState;
  confirmed?: boolean;
  repairApprovalState?: BtdRepairApprovalState;
  targetAnchor?: string | null;
  at?: string;
}

export type BtdOrganizationInterfaceAuthorityRouteDecision = ReturnType<
  typeof evaluateBtdOrganizationInterfaceAuthority
> & {
  routeKind: 'btd_organization_interface_authority_route_decision';
};

export interface BtdLicensedReadRevenueInput {
  paymentId: string;
  assetPackId: string;
  grossSats: bigint | number | string;
  directRecipients: BtdRevenueRecipientInput[];
  ancestorRecipients?: BtdRevenueRecipientInput[];
  treasuryWalletId: string;
  disputeHoldbackWalletId?: string;
  exchangeSequence: bigint;
  directSplitBps?: number;
  ancestorSplitBps?: number;
  treasurySplitBps?: number;
  disputeHoldbackBps?: number;
  pendingRoutes?: BtdRevenueRouteException[];
  failedRoutes?: BtdRevenueRouteException[];
  commitToRegistry?: boolean;
  actorId?: string;
  issuedAt?: string;
}

export interface BtdAncestryReviewInput {
  reviewId?: string;
  childAssetPackId: string;
  edges: BtdAncestorEdgeInput[];
  existingEdges?: BtdAncestorGraphEdge[];
  duplicateSourceRoots?: string[];
  minConfidenceBps?: number;
  citationOnlyPayable?: boolean;
  exchangeSequence: bigint;
  commitToRegistry?: boolean;
  actorId?: string;
  issuedAt?: string;
}

export type BtdBtcFeeTransactionAction =
  | 'prepare'
  | 'mark_signed'
  | 'mark_broadcast'
  | 'observe';

export type BtdWalletSignerSessionInput = Parameters<typeof createWalletSignerSession>[0];

export interface BtdBtcFeeTransactionInput {
  action: BtdBtcFeeTransactionAction;
  receiptId?: string;
  feePurpose?: BtcFeePurpose;
  payerSession?: WalletSignerSession | BtdWalletSignerSessionInput;
  psbt?: string;
  signedPsbt?: string;
  satsPaid?: bigint | number | string;
  satsPerVbyte?: number;
  exchangeSequence?: bigint;
  terminalJournalRoot?: string;
  relatedAssetPackId?: string;
  relatedOrderId?: string;
  previousReceipt?: BtcFeeTransactionReceipt;
  feeQuote?: BtcFeeQuote;
  txid?: string;
  vout?: number;
  observedFinalityState?: Exclude<BtcFeeFinalityState, 'prepared' | 'signed'>;
  confirmations?: number;
  commitToRegistry?: boolean;
  actorId?: string;
  issuedAt?: string;
}

export type BtdAssetPackLedgerAnchorAction = 'prepare' | 'mark_broadcast' | 'observe';

export interface BtdAssetPackLedgerAnchorInput {
  action: BtdAssetPackLedgerAnchorAction;
  anchorId?: string;
  assetPackId?: string;
  chain?: AssetPackLedgerAnchor['chain'];
  network?: AssetPackLedgerAnchor['network'];
  commitmentMethod?: AssetPackLedgerAnchor['commitmentMethod'];
  commitmentRoot?: string;
  sourceManifestRoot?: string;
  proofRoot?: string;
  accessPolicyHash?: string;
  btdRangeStart?: number;
  btdRangeEndExclusive?: number;
  contractAddress?: string;
  tokenId?: string;
  previousAnchor?: AssetPackLedgerAnchor;
  txidOrHash?: string;
  outputIndex?: number;
  observedFinalityState?: Exclude<LedgerFinalityState, 'prepared'>;
  confirmations?: number;
  exchangeSequence: bigint;
  commitToRegistry?: boolean;
  actorId?: string;
  issuedAt?: string;
}

export type BtdAssetPackExchangeAction =
  | 'create_order'
  | 'cancel_order'
  | 'accept_order'
  | 'settle_order'
  | 'transfer_rights';

export type BtdJournalAction = 'commit_entry' | 'diff_projection' | 'coverage';

export interface BtdAssetPackExchangeInput {
  action: BtdAssetPackExchangeAction;
  orderId?: string;
  orderKind?: AssetPackExchangeOrderKind;
  assetPackId?: string;
  rangeStart?: number;
  rangeEndExclusive?: number;
  makerWalletId?: string;
  takerWalletId?: string;
  priceSats?: bigint | number | string;
  accessPolicyHash?: string;
  createdAtExchangeSequence?: bigint;
  previousOrder?: AssetPackExchangeOrder;
  settledAtExchangeSequence?: bigint;
  ledgerAnchorId?: string;
  receiptId?: string;
  fromWalletId?: string;
  toWalletId?: string;
  btcFeeReceiptId?: string;
  btcFeeFinalityState?: BtcFeeFinalityState;
  readLicenseId?: string;
  readerWalletId?: string;
  depositorWalletId?: string;
  sourceSafePreviewRoot?: string;
  paidUnlockRoot?: string;
  deliveryAdmissionRoot?: string;
  ledgerProjectionRoot?: string;
  protectedSourceVisible?: boolean;
  commitToRegistry?: boolean;
  actorId?: string;
  issuedAt?: string;
}

export interface BtdJournalInput {
  action: BtdJournalAction;
  journalEntryId?: string;
  transactionKind?: JournalTransactionKind;
  preStateRoot?: string;
  postStateRoot?: string;
  receiptRoots?: string[];
  ledgerAnchorIds?: string[];
  exchangeSequence?: bigint;
  entry?: JournalEntry;
  projection?: JournalProjection;
  coverageId?: string;
  entries?: JournalEntry[];
  commitToRegistry?: boolean;
  actorId?: string;
  issuedAt?: string;
}

export interface BtdLedgerDatabaseReconciliationInput {
  reconciliationId: string;
  ledgerFacts: LedgerObservedFact[];
  databaseFacts: DatabaseProjectedFact[];
  objectStorageArtifacts?: ObjectStorageArtifactFact[];
  metaphysicalFacts?: MetaphysicalCanonicalFact[];
  stagingTestnetReadback?: SupabaseStagingTestnetProjectionReadback | null;
  settlementConservationChecks?: Parameters<typeof reconcileLedgerDatabaseProjection>[0]['settlementConservationChecks'];
  commitToRegistry?: boolean;
  actorId?: string;
  issuedAt?: string;
}

export interface BtdSourceToSharesProofInput extends SourceToSharesProofInput {
  exchangeSequence: bigint;
  actorId?: string;
  commitToRegistry?: boolean;
}

export interface BtdBridgeReadinessResearchInput {
  postureId: string;
  records?: BridgeReadinessResearchRecordInput[];
  policyRoot?: string;
  exchangeSequence: bigint;
  actorId?: string;
  commitToRegistry?: boolean;
  issuedAt?: string;
}

export interface BtdProtocolTelemetryBoundaryInput {
  envelopeId?: string;
  telemetry: BtdProtocolTelemetryInput[];
  proofHooks: BtdProtocolProofHookInput[];
  exchangeSequence: bigint;
  actorId?: string;
  issuedAt?: string;
}

export interface BtdInterfaceIntegrationRegressionInput {
  proofId?: string;
  records: BtdInterfaceIntegrationRecordInput[];
  lowDetailProofRoot: string;
  transactionCockpitProofRoot: string;
  exchangeSequence: bigint;
  actorId?: string;
  issuedAt?: string;
}

export type BtdDeploymentReadinessAction =
  | 'deployment_lane'
  | 'telemetry_event'
  | 'upgrade_plan'
  | 'upgrade_transition';

export interface BtdDeploymentReadinessInput {
  action: BtdDeploymentReadinessAction;
  readinessId?: string;
  lane?: V27CryptoDeploymentLaneKind;
  bitcoinNetwork?: BitcoinNetwork;
  ledgerNetwork?: LedgerNetwork;
  rollbackPlanRoot?: string;
  operationalApprovalRoot?: string;
  presentEnvironmentKeys?: string[];
  telemetryEvent?: V27CryptoTelemetryEvent;
  telemetrySubjectId?: string;
  telemetryReceiptRoot?: string;
  telemetryLedgerAnchorId?: string;
  upgradeId?: string;
  fromVersion?: string;
  toVersion?: string;
  migrationRoot?: string;
  preStateRoot?: string;
  postStateRoot?: string;
  approvalReceiptRoot?: string;
  previousUpgradeReceipt?: BtdProtocolUpgradeReceipt;
  nextUpgradeState?: Exclude<BtdProtocolUpgradeState, 'planned'>;
  ledgerAnchorId?: string;
  commitToRegistry?: boolean;
  actorId?: string;
  issuedAt?: string;
}

export interface BtdLicensedReadRevenueSettlement {
  kind: 'btd_licensed_read_revenue_settlement';
  actorId: string;
  receipt: ReturnType<typeof buildLicensedReadRevenueRoute>;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  registryWrite?: unknown;
  committed: boolean;
}

export interface BtdAncestryReviewSettlement {
  kind: 'btd_ancestry_review_settlement';
  actorId: string;
  receipt: ReturnType<typeof reviewBtdAncestorEdges>;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  registryWrites?: unknown[];
  committed: boolean;
}

export interface BtdBtcFeeTransactionSettlement {
  kind: 'btd_btc_fee_transaction_settlement';
  actorId: string;
  action: BtdBtcFeeTransactionAction;
  receipt: BtcFeeTransactionReceipt;
  operationPosture: BtcFeeOperationPosture;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  registryWrite?: unknown;
  committed: boolean;
}

export interface BtdAssetPackLedgerAnchorSettlement {
  kind: 'btd_asset_pack_ledger_anchor_settlement';
  actorId: string;
  action: BtdAssetPackLedgerAnchorAction;
  anchor: AssetPackLedgerAnchor;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  registryWrite?: unknown;
  committed: boolean;
}

export interface BtdAssetPackExchangeSettlement {
  kind: 'btd_asset_pack_exchange_settlement';
  actorId: string;
  action: BtdAssetPackExchangeAction;
  order?: AssetPackExchangeOrder;
  rightsTransfer?: AssetPackRightsTransferReceipt;
  btdRightsTransferReceipt?: ReturnType<typeof buildBtdRightsTransferReceipt>;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  registryWrite?: unknown;
  committed: boolean;
}

export interface BtdJournalSettlement {
  kind: 'btd_terminal_journal_settlement';
  actorId: string;
  action: BtdJournalAction;
  entry?: JournalEntry;
  diff?: ReturnType<typeof diffJournalProjection>;
  coverage?: ReturnType<typeof buildJournalCoverageReceipt>;
  registryWrite?: unknown;
  committed: boolean;
}

export interface BtdLedgerDatabaseReconciliationSettlement {
  kind: 'btd_ledger_database_reconciliation_settlement';
  actorId: string;
  report: ReturnType<typeof reconcileLedgerDatabaseProjection>;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  registryWrites?: unknown[];
  committed: boolean;
}

export interface BtdSourceToSharesProofSettlement {
  kind: 'btd_source_to_shares_proof_settlement';
  actorId: string;
  proof: ReturnType<typeof buildSourceToSharesProof>;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  committed: false;
}

export interface BtdBridgeReadinessResearchSettlement {
  kind: 'btd_bridge_readiness_research_settlement';
  actorId: string;
  posture: ReturnType<typeof buildBridgeReadinessResearchPosture>;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  committed: false;
}

export interface BtdProtocolTelemetrySettlement {
  kind: 'btd_protocol_telemetry_settlement';
  actorId: string;
  envelope: BtdProtocolTelemetryEnvelope;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  committed: false;
}

export interface BtdInterfaceIntegrationRegressionSettlement {
  kind: 'btd_interface_integration_regression_settlement';
  actorId: string;
  proof: BtdInterfaceIntegrationRegressionProof;
  terminalJournalEntry: ReturnType<typeof buildJournalEntry>;
  committed: false;
}

export interface BtdDeploymentReadinessSettlement {
  kind: 'btd_deployment_readiness_settlement';
  actorId: string;
  action: BtdDeploymentReadinessAction;
  readiness?: ReturnType<typeof buildV27CryptoDeploymentReadinessReceipt>;
  telemetry?: V27CryptoTelemetryRecord;
  upgradeReceipt?: BtdProtocolUpgradeReceipt;
  registryWrite?: unknown;
  committed: boolean;
}

export function buildBtdStableId(prefix: string, parts: string[]): string {
  const hash = createHash('sha256').update(parts.join('\u001f')).digest('hex').slice(0, 16);
  return `${prefix}_${hash}`;
}

export function parseBtdRequiredBigInt(value: unknown, label: string): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new Error(`${label} must be a safe integer when supplied as a number.`);
    }
    return BigInt(value);
  }
  if (typeof value === 'string' && /^-?\d+$/.test(value)) return BigInt(value);
  throw new Error(`${label} must be an integer string, safe integer number, or bigint.`);
}

export function parseBtdOptionalBigInt(value: unknown, label: string): bigint | undefined {
  return value === undefined || value === null ? undefined : parseBtdRequiredBigInt(value, label);
}

export async function buildBtdRegistrySnapshot(input: {
  registry: BtdRegistrySnapshotReader;
  assetPackId?: string | null;
  activeCanonicalPointer?: string;
  draftTargetVersion?: string;
}) {
  const [supplyState, ranges] = await Promise.all([
    input.registry.getSupplyState(),
    input.registry.listAssetPackRanges(input.assetPackId || undefined),
  ]);

  return {
    kind: 'btd_registry_snapshot',
    activeCanonicalPointer: input.activeCanonicalPointer ?? 'V29',
    draftTargetVersion: input.draftTargetVersion ?? 'V30',
    maxSupply: BTD_MAX_MINTABLE_SUPPLY,
    supplyState,
    ranges,
    routePosture: {
      canonicalUnit: 'asset_pack_range',
      feeAsset: 'BTC',
      btdSpendableAsFee: false,
      valueBearingMainnetRequiresOperationalApproval: true,
    },
  };
}

export function buildBtdMintDraft(input: BtdMintDraftInput): BtdMintDraft {
  assertMintDraftAdmission(input);
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const measurementId = buildBtdStableId('btd-semantic-volume', [
    input.assetPackId,
    input.readId,
    input.semanticUnits.map((unit) => `${unit.unitId}:${unit.proofReceiptRoot}`).join('|'),
  ]);
  const measurement = measureProofAddressableSemanticVolume({
    measurementId,
    assetPackId: input.assetPackId,
    units: input.semanticUnits,
    issuedAt,
  });
  const measureMint = applyBtdMeasureMint({
    state: normalizeMeasureMintState(input.measureMintState),
    assetPackId: input.assetPackId,
    semanticVolume: measurement,
    proofRoot: input.proofRoot,
    settlementJournalRoot: input.settlementJournalRoot,
    accessPolicyHash: input.accessPolicyHash,
    exchangeSequence: input.exchangeSequence,
    issuedAt,
  });

  const rangeAllocation =
    measureMint.receipt.tokenCount > 0
      ? allocateAssetPackRange(
          createBtdSupplyState({
            totalMinted: measureMint.receipt.totalMintedBefore,
            nextTokenId: measureMint.receipt.totalMintedBefore,
            cumulativeAdmittedMeasurement: measureMint.receipt.cumulativeMeasurementBefore,
            residualMintCredit: measureMint.previousState.residualMintCredit,
            curveParameter: measureMint.previousState.curveParameter,
          }),
          {
            assetPackId: input.assetPackId,
            readId: input.readId,
            acceptedNeed: input.acceptedNeed,
            acceptedFit: input.acceptedFit,
            sourceManifestRoot: input.sourceManifestRoot,
            measurementReceiptRoot: measurement.measurementId,
            fitReceiptRoot: input.fitReceiptRoot,
            proofRoot: input.proofRoot,
            dedupeReceiptRoot: input.dedupeReceiptRoot,
            settlementJournalRoot: input.settlementJournalRoot,
            exchangeReceiptRoot: input.exchangeReceiptRoot,
            accessPolicyId: input.accessPolicyId,
            accessPolicyHash: input.accessPolicyHash,
            normalizedBitcodeVolume: measurement.normalizedBitcodeVolume,
            tokenCount: measureMint.receipt.tokenCount,
            mintedAtExchangeSequence: input.exchangeSequence,
          },
        )
      : undefined;
  const mintReceipt = rangeAllocation ? buildBtdMintReceipt(rangeAllocation, issuedAt) : undefined;
  const assetPackMintReceipt =
    mintReceipt && shouldBuildAssetPackMintReceipt(input)
      ? buildBtdAssetPackMintReceipt({
          mintReceipt,
          readId: input.readId,
          depositorWalletId: input.depositorWalletId,
          sourceSafePreviewRoot: input.sourceSafePreviewRoot,
          findingFitsResultRoot: input.findingFitsResultRoot ?? input.fitReceiptRoot,
          settlementConservationRoot: input.settlementConservationRoot,
          ledgerProjectionRoot: input.ledgerProjectionRoot,
          paidUnlockRoot: input.paidUnlockRoot,
          deliveryAdmissionRoot: input.deliveryAdmissionRoot,
          issuedAt,
        })
      : undefined;
  const contributorAllocation =
    rangeAllocation && input.contributors?.length
      ? allocateBtdContributorCells({
          assetPackId: input.assetPackId,
          rangeStart: rangeAllocation.range.rangeStart,
          rangeEndExclusive: rangeAllocation.range.rangeEndExclusive,
          contributors: input.contributors,
          issuedAt,
        })
      : undefined;
  const receiptRoots = [
    measurement.measurementId,
    buildBtdStableId('btd-measure-mint', [input.assetPackId, input.exchangeSequence.toString()]),
    mintReceipt ? buildBtdStableId('btd-asset-pack-mint', [input.assetPackId, mintReceipt.issuedAt]) : null,
    assetPackMintReceipt?.receiptRoot ?? null,
    contributorAllocation
      ? buildBtdStableId('btd-contributor-allocation', [input.assetPackId, contributorAllocation.issuedAt])
      : null,
  ].filter((value): value is string => Boolean(value));
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-mint-draft', [
      input.assetPackId,
      input.exchangeSequence.toString(),
    ]),
    transactionKind: measureMint.receipt.tokenCount > 0 ? 'asset_pack_mint' : 'measure_mint_tail',
    actorId: input.actorId ?? 'system:btd-mint-draft',
    preStateRoot: buildBtdStableId('btd-pre-state', [measureMint.receipt.totalMintedBefore.toString()]),
    postStateRoot: buildBtdStableId('btd-post-state', [
      measureMint.receipt.totalMintedAfter.toString(),
      measureMint.receipt.cumulativeMeasurementAfter.toString(),
    ]),
    receiptRoots,
    ledgerAnchorIds: [],
    exchangeSequence: input.exchangeSequence,
    issuedAt,
  });

  return {
    kind: 'btd_mint_draft',
    assetPackId: input.assetPackId,
    measurement,
    measureMint: measureMint.receipt,
    rangeAllocation,
    mintReceipt,
    assetPackMintReceipt,
    contributorAllocation,
    terminalJournalEntry,
    blocking: false,
    zeroCell: measureMint.receipt.tokenCount === 0,
  };
}

export function assertBtdMintDraft(draft: BtdMintDraft): BtdMintDraft {
  if (draft.kind !== 'btd_mint_draft') {
    throw new Error('Invalid BTD mint draft kind.');
  }
  assertNonEmptyString(draft.assetPackId, 'assetPackId');
  if (!draft.measurement || draft.measurement.kind !== 'btd.semantic_volume_measurement') {
    throw new Error('BTD mint draft requires a semantic-volume measurement receipt.');
  }
  if (!draft.measureMint || draft.measureMint.kind !== 'btd.measure_mint') {
    throw new Error('BTD mint draft requires a measuremint receipt.');
  }
  if (!draft.terminalJournalEntry?.journalEntryId) {
    throw new Error('BTD mint draft requires a BTD journal entry.');
  }
  return draft;
}

export function buildBtdReadAccessDecision(
  input: BtdReadAccessInput & { actorId: string },
): BtdReadAccessDecision {
  assertNonEmptyString(input.actorId, 'actorId');
  assertNonEmptyString(input.walletId, 'walletId');
  assertNonEmptyString(input.assetPackId, 'assetPackId');
  const decision = evaluateBtdReadAccess(input);

  return {
    kind: 'btd_read_access_decision',
    actorId: input.actorId,
    assetPackId: input.assetPackId,
    decision,
    policyDisclosure: {
      accessPolicyId: input.accessPolicy.accessPolicyId,
      accessPolicyHash: input.accessPolicy.accessPolicyHash,
      ownerRead: input.accessPolicy.ownerRead,
      licensedRead: input.accessPolicy.licensedRead,
      derivativeUse: input.accessPolicy.derivativeUse,
      redistributionAllowed: input.accessPolicy.redistributionAllowed,
      confidentiality: input.accessPolicy.confidentiality,
    },
  };
}

export function buildBtdReadReceiptBoundarySettlement(
  input: BtdReadReceiptBoundaryInput,
): Omit<BtdReadReceiptBoundarySettlement, 'committed'> {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  const readReceipt = buildBtdReadReceipt({
    receiptId: input.receiptId,
    assetPackId: input.assetPackId,
    readId: input.readId,
    readRequestId: input.readRequestId,
    acceptedNeedRoot: input.acceptedNeedRoot,
    findingFitsResultRoot: input.findingFitsResultRoot,
    readerWalletId: input.readerWalletId,
    depositorWalletId: input.depositorWalletId,
    rangeStart: input.rangeStart,
    rangeEndExclusive: input.rangeEndExclusive,
    tokenCount: input.tokenCount,
    sourceManifestRoot: input.sourceManifestRoot,
    sourceSafePreviewRoot: input.sourceSafePreviewRoot,
    accessPolicyHash: input.accessPolicyHash,
    disclosureState: input.disclosureState,
    readRightState: input.readRightState,
    paidUnlockRoot: input.paidUnlockRoot,
    deliveryAdmissionState: input.deliveryAdmissionState,
    deliveryAdmissionRoot: input.deliveryAdmissionRoot,
    ledgerProjectionRoot: input.ledgerProjectionRoot,
    protectedSourceVisible: input.protectedSourceVisible,
    issuedAt: input.issuedAt,
  });
  const transactionKind =
    readReceipt.deliveryAdmissionState === 'admitted'
      ? 'licensed_read_purchase'
      : 'read_submission';
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-read-receipt', [
      readReceipt.assetPackId,
      readReceipt.readId,
      readReceipt.readerWalletId,
      readReceipt.disclosureState,
    ]),
    transactionKind,
    actorId,
    preStateRoot: buildBtdStableId('btd-read-receipt-pre-state', [
      readReceipt.assetPackId,
      readReceipt.readId,
    ]),
    postStateRoot: buildBtdStableId('btd-read-receipt-post-state', [
      readReceipt.assetPackId,
      readReceipt.readId,
      readReceipt.disclosureState,
      readReceipt.deliveryAdmissionState,
    ]),
    receiptRoots: [readReceipt.receiptRoot],
    ledgerAnchorIds: [],
    exchangeSequence: input.exchangeSequence,
    issuedAt: input.issuedAt,
  });

  return {
    kind: 'btd_read_receipt_boundary_settlement',
    actorId,
    readReceipt,
    terminalJournalEntry,
  };
}

export function buildBtdOrganizationInterfaceAuthorityDecision(
  input: BtdOrganizationInterfaceAuthorityRouteInput & { actorId: string },
): BtdOrganizationInterfaceAuthorityRouteDecision {
  const decision = evaluateBtdOrganizationInterfaceAuthority({
    ...input,
    actorId: assertNonEmptyString(input.actorId, 'actorId'),
  });

  return {
    ...decision,
    routeKind: 'btd_organization_interface_authority_route_decision',
  };
}

export function buildBtdLicensedReadRevenueSettlement(
  input: BtdLicensedReadRevenueInput & { actorId: string },
): Omit<BtdLicensedReadRevenueSettlement, 'committed'> {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  const receipt = assertLicensedReadRevenueRouteConserved(
    buildLicensedReadRevenueRoute({
      paymentId: input.paymentId,
      assetPackId: input.assetPackId,
      grossSats: input.grossSats,
      directRecipients: input.directRecipients,
      ancestorRecipients: input.ancestorRecipients,
      treasuryWalletId: input.treasuryWalletId,
      disputeHoldbackWalletId: input.disputeHoldbackWalletId,
      exchangeSequence: input.exchangeSequence,
      directSplitBps: input.directSplitBps,
      ancestorSplitBps: input.ancestorSplitBps,
      treasurySplitBps: input.treasurySplitBps,
      disputeHoldbackBps: input.disputeHoldbackBps,
      pendingRoutes: input.pendingRoutes,
      failedRoutes: input.failedRoutes,
      issuedAt: input.issuedAt,
    }),
  );
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-licensed-read-revenue', [
      receipt.assetPackId,
      receipt.paymentId,
      receipt.exchangeSequence.toString(),
    ]),
    transactionKind: 'settlement_finalization',
    actorId,
    preStateRoot: buildBtdStableId('btd-revenue-pre-state', [receipt.paymentId]),
    postStateRoot: buildBtdStableId('btd-revenue-post-state', [
      receipt.paymentId,
      receipt.grossSats.toString(),
      receipt.routeState,
    ]),
    receiptRoots: [
      buildBtdStableId('btd-licensed-read-revenue-route', [
        receipt.assetPackId,
        receipt.paymentId,
        receipt.issuedAt,
      ]),
    ],
    ledgerAnchorIds: [],
    exchangeSequence: receipt.exchangeSequence,
    issuedAt: receipt.issuedAt,
  });

  return {
    kind: 'btd_licensed_read_revenue_settlement',
    actorId,
    receipt,
    terminalJournalEntry,
  };
}

export function buildBtdAncestryReviewSettlement(
  input: BtdAncestryReviewInput & { actorId: string },
): Omit<BtdAncestryReviewSettlement, 'committed'> {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  assertNonEmptyString(input.childAssetPackId, 'childAssetPackId');
  if (typeof input.exchangeSequence !== 'bigint' || input.exchangeSequence <= 0n) {
    throw new Error('BTD ancestry review requires a positive Exchange sequence.');
  }

  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const reviewId =
    input.reviewId ??
    buildBtdStableId('btd-ancestry-review', [input.childAssetPackId, input.exchangeSequence.toString()]);
  const receipt = reviewBtdAncestorEdges({
    reviewId,
    childAssetPackId: input.childAssetPackId,
    edges: input.edges,
    existingEdges: input.existingEdges,
    duplicateSourceRoots: input.duplicateSourceRoots,
    minConfidenceBps: input.minConfidenceBps,
    citationOnlyPayable: input.citationOnlyPayable,
    issuedAt,
  });
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-ancestry-review', [
      receipt.childAssetPackId,
      receipt.reviewId,
    ]),
    transactionKind: 'settlement_finalization',
    actorId,
    preStateRoot: buildBtdStableId('btd-ancestry-pre-state', [receipt.childAssetPackId]),
    postStateRoot: buildBtdStableId('btd-ancestry-post-state', [
      receipt.childAssetPackId,
      String(receipt.payableEdgeCount),
      String(receipt.recordedUnpaidEdgeCount),
      String(receipt.rejectedEdgeCount),
    ]),
    receiptRoots: [receipt.reviewId],
    ledgerAnchorIds: [],
    exchangeSequence: input.exchangeSequence,
    issuedAt,
  });

  return {
    kind: 'btd_ancestry_review_settlement',
    actorId,
    receipt,
    terminalJournalEntry,
  };
}

export function buildBtdBtcFeeTransactionSettlement(
  input: BtdBtcFeeTransactionInput & { actorId: string },
): Omit<BtdBtcFeeTransactionSettlement, 'committed'> {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const feeQuote = normalizeBtcFeeQuote(input.feeQuote);
  const receipt = buildBtcFeeReceiptForAction({ ...input, feeQuote, issuedAt });
  const payerSession = input.payerSession ? normalizeWalletSignerSession(input.payerSession) : undefined;
  const operationPosture = buildBtcFeeOperationPosture({
    quote: feeQuote,
    receipt,
    payerSession,
    at: issuedAt,
  });
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-btc-fee', [
      receipt.receiptId,
      receipt.finalityState,
      receipt.exchangeSequence.toString(),
    ]),
    transactionKind: 'btc_fee_payment',
    actorId,
    preStateRoot: buildBtdStableId('btc-fee-pre-state', [
      input.previousReceipt?.receiptId ?? receipt.receiptId,
      input.previousReceipt?.finalityState ?? 'none',
    ]),
    postStateRoot: buildBtdStableId('btc-fee-post-state', [
      receipt.receiptId,
      receipt.finalityState,
      receipt.txid ?? 'no-txid',
      String(receipt.confirmations),
    ]),
    receiptRoots: [receipt.receiptId],
    ledgerAnchorIds: receipt.txid ? [receipt.txid] : [],
    exchangeSequence: receipt.exchangeSequence,
    issuedAt,
  });

  return {
    kind: 'btd_btc_fee_transaction_settlement',
    actorId,
    action: input.action,
    receipt,
    operationPosture,
    terminalJournalEntry,
  };
}

export function buildBtdAssetPackLedgerAnchorSettlement(
  input: BtdAssetPackLedgerAnchorInput & { actorId: string },
): Omit<BtdAssetPackLedgerAnchorSettlement, 'committed'> {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  if (typeof input.exchangeSequence !== 'bigint' || input.exchangeSequence <= 0n) {
    throw new Error('AssetPack ledger anchor settlement requires a positive Exchange sequence.');
  }
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const anchor = buildAssetPackLedgerAnchorForAction(input);
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-asset-pack-anchor', [
      anchor.anchorId,
      anchor.finalityState,
      input.exchangeSequence.toString(),
    ]),
    transactionKind: 'asset_pack_anchor',
    actorId,
    preStateRoot: buildBtdStableId('asset-pack-anchor-pre-state', [
      input.previousAnchor?.anchorId ?? anchor.anchorId,
      input.previousAnchor?.finalityState ?? 'none',
    ]),
    postStateRoot: buildBtdStableId('asset-pack-anchor-post-state', [
      anchor.anchorId,
      anchor.finalityState,
      anchor.txidOrHash ?? 'no-ledger-id',
      String(anchor.confirmations),
    ]),
    receiptRoots: [anchor.anchorId],
    ledgerAnchorIds: anchor.txidOrHash ? [anchor.txidOrHash] : [],
    exchangeSequence: input.exchangeSequence,
    issuedAt,
  });

  return {
    kind: 'btd_asset_pack_ledger_anchor_settlement',
    actorId,
    action: input.action,
    anchor,
    terminalJournalEntry,
  };
}

export function buildBtdAssetPackExchangeSettlement(
  input: BtdAssetPackExchangeInput & { actorId: string },
): Omit<BtdAssetPackExchangeSettlement, 'committed'> {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  const { order, rightsTransfer, exchangeSequence } = buildAssetPackExchangeForAction(input);
  const btdRightsTransferReceipt =
    rightsTransfer && shouldBuildBtdRightsTransferReceipt(input)
      ? buildBtdRightsTransferReceipt({
          orderId: rightsTransfer.orderId,
          assetPackId: rightsTransfer.assetPackId,
          rangeStart: rightsTransfer.rangeStart,
          rangeEndExclusive: rightsTransfer.rangeEndExclusive,
          fromWalletId: rightsTransfer.fromWalletId,
          toWalletId: rightsTransfer.toWalletId,
          readerWalletId: input.readerWalletId ?? rightsTransfer.toWalletId,
          depositorWalletId: input.depositorWalletId ?? rightsTransfer.fromWalletId,
          priceSats: rightsTransfer.priceSats,
          accessPolicyHash: rightsTransfer.accessPolicyHash,
          btcFeeReceiptId: rightsTransfer.btcFeeReceiptId,
          btcFeeFinalityState: input.btcFeeFinalityState,
          readLicenseId: input.readLicenseId,
          sourceSafePreviewRoot: input.sourceSafePreviewRoot,
          paidUnlockRoot: input.paidUnlockRoot,
          deliveryAdmissionRoot: input.deliveryAdmissionRoot,
          ledgerAnchorId: rightsTransfer.ledgerAnchorId,
          ledgerProjectionRoot: input.ledgerProjectionRoot,
          exchangeSequence: rightsTransfer.exchangeSequence,
          protectedSourceVisible: input.protectedSourceVisible,
          issuedAt: input.issuedAt,
        })
      : undefined;
  const receiptRoot = rightsTransfer?.receiptId ?? order?.orderId;
  if (!receiptRoot) {
    throw new Error('AssetPack Exchange settlement requires an order or rights-transfer receipt.');
  }
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-asset-pack-exchange', [
      input.action,
      receiptRoot,
      exchangeSequence.toString(),
    ]),
    transactionKind: rightsTransfer ? 'rights_transfer' : 'exchange_order',
    actorId,
    preStateRoot: buildBtdStableId('asset-pack-exchange-pre-state', [
      input.previousOrder?.orderId ?? input.orderId ?? receiptRoot,
      input.previousOrder?.orderState ?? 'none',
    ]),
    postStateRoot: buildBtdStableId('asset-pack-exchange-post-state', [
      order?.orderId ?? rightsTransfer?.orderId ?? receiptRoot,
      order?.orderState ?? 'rights_transfer',
      btdRightsTransferReceipt?.paidUnlockRoot ?? rightsTransfer?.btcFeeReceiptId ?? 'no-fee',
    ]),
    receiptRoots: [receiptRoot, btdRightsTransferReceipt?.receiptRoot].filter(
      (value): value is string => Boolean(value),
    ),
    ledgerAnchorIds: [order?.ledgerAnchorId, rightsTransfer?.ledgerAnchorId].filter(
      (value): value is string => Boolean(value),
    ),
    exchangeSequence,
    issuedAt: input.issuedAt,
  });

  return {
    kind: 'btd_asset_pack_exchange_settlement',
    actorId,
    action: input.action,
    order,
    rightsTransfer,
    btdRightsTransferReceipt,
    terminalJournalEntry,
  };
}

export function buildBtdJournalSettlement(
  input: BtdJournalInput & { actorId: string },
): Omit<BtdJournalSettlement, 'committed'> {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');

  switch (input.action) {
    case 'commit_entry': {
      const entry =
        input.entry ??
        buildJournalEntry({
          journalEntryId: assertNonEmptyString(input.journalEntryId, 'journalEntryId'),
          transactionKind: requireJournalTransactionKind(input.transactionKind),
          actorId,
          preStateRoot: assertNonEmptyString(input.preStateRoot, 'preStateRoot'),
          postStateRoot: assertNonEmptyString(input.postStateRoot, 'postStateRoot'),
          receiptRoots: input.receiptRoots ?? [],
          ledgerAnchorIds: input.ledgerAnchorIds,
          exchangeSequence: requireBigInt(input.exchangeSequence, 'exchangeSequence'),
          issuedAt: input.issuedAt,
        });

      return {
        kind: 'btd_terminal_journal_settlement',
        actorId,
        action: input.action,
        entry: normalizeJournalEntry(entry),
      };
    }
    case 'diff_projection': {
      const entry = normalizeJournalEntry(input.entry);
      if (!input.projection) {
        throw new Error('BTD journal diff requires projection.');
      }

      return {
        kind: 'btd_terminal_journal_settlement',
        actorId,
        action: input.action,
        entry,
        diff: diffJournalProjection(entry, input.projection),
      };
    }
    case 'coverage': {
      if (!input.coverageId) throw new Error('BTD journal coverage requires coverageId.');
      if (!input.entries?.length) {
        throw new Error('BTD journal coverage requires entries.');
      }

      return {
        kind: 'btd_terminal_journal_settlement',
        actorId,
        action: input.action,
        coverage: buildJournalCoverageReceipt({
          coverageId: input.coverageId,
          entries: input.entries.map((entry) => normalizeJournalEntry(entry)),
          issuedAt: input.issuedAt,
        }),
      };
    }
    default:
      throw new Error(
        `Unsupported BTD journal action: ${(input as { action: string }).action}.`,
      );
  }
}

export function buildBtdLedgerDatabaseReconciliationSettlement(
  input: BtdLedgerDatabaseReconciliationInput & { actorId: string },
): Omit<BtdLedgerDatabaseReconciliationSettlement, 'committed'> {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  const report = reconcileLedgerDatabaseProjection({
    reconciliationId: input.reconciliationId,
    ledgerFacts: input.ledgerFacts,
    databaseFacts: input.databaseFacts,
    objectStorageArtifacts: input.objectStorageArtifacts,
    metaphysicalFacts: input.metaphysicalFacts,
    stagingTestnetReadback: input.stagingTestnetReadback,
    settlementConservationChecks: input.settlementConservationChecks,
    issuedAt: input.issuedAt,
  });
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-reconciliation', [
      report.reconciliationId,
      String(report.repairs.length),
      String(report.blocking),
    ]),
    transactionKind: 'ledger_database_reconciliation',
    actorId,
    preStateRoot: buildBtdStableId('reconciliation-pre-state', [
      report.reconciliationId,
      String(input.databaseFacts.length),
    ]),
    postStateRoot: buildBtdStableId('reconciliation-post-state', [
      report.reconciliationId,
      String(report.repairs.length),
      String(report.blocking),
      String(report.metaphysicalFacts.length),
    ]),
    receiptRoots: [
      report.reconciliationId,
      ...report.repairs.map((repair) => repair.repairId),
      ...report.objectStorageArtifacts.map((artifact) => artifact.storageRoot),
      ...report.metaphysicalFacts.map((fact) => fact.receiptRoot ?? fact.canonicalRoot),
      report.proofRoots.ledgerObservedRoot,
      report.proofRoots.databaseProjectionRoot,
      report.proofRoots.objectStorageRoot,
      report.proofRoots.stagingTestnetReadbackRoot,
      report.proofRoots.repairPlanRoot,
      report.proofRoots.settlementConservationRoot,
    ],
    ledgerAnchorIds: input.ledgerFacts.map((fact) => fact.factId),
    exchangeSequence: BigInt(Math.max(1, input.ledgerFacts.length + input.databaseFacts.length)),
    issuedAt: input.issuedAt,
  });

  return {
    kind: 'btd_ledger_database_reconciliation_settlement',
    actorId,
    report,
    terminalJournalEntry,
  };
}

export function buildBtdSourceToSharesProofSettlement(
  input: BtdSourceToSharesProofInput & { actorId: string },
): BtdSourceToSharesProofSettlement {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  if (typeof input.exchangeSequence !== 'bigint' || input.exchangeSequence <= 0n) {
    throw new Error('Source-to-shares proof settlement requires a positive Exchange sequence.');
  }

  const proof = buildSourceToSharesProof(input);
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-source-to-shares-proof', [
      proof.proofId,
      input.exchangeSequence.toString(),
    ]),
    transactionKind: 'settlement_finalization',
    actorId,
    preStateRoot: buildBtdStableId('source-to-shares-pre-state', [
      proof.readId,
      proof.acceptedNeedRoot,
    ]),
    postStateRoot: buildBtdStableId('source-to-shares-post-state', [
      proof.proofRoot,
      proof.settlementConservation.state,
      String(proof.settlementConservation.settlementAdmissible),
    ]),
    receiptRoots: [
      proof.proofRoot,
      proof.feeQuote.quoteRoot,
      proof.paymentObservation.paymentReceiptRoot,
      proof.settlementConservation.conservationRoot,
      proof.zeroCellRefitTail.tailRoot,
      proof.ancestryEvidence.reviewRoot,
      ...proof.settlementAllocations.map((allocation) => allocation.allocationRoot),
    ],
    ledgerAnchorIds: proof.paymentObservation.txid ? [proof.paymentObservation.txid] : [],
    exchangeSequence: input.exchangeSequence,
    issuedAt: proof.issuedAt,
  });

  return {
    kind: 'btd_source_to_shares_proof_settlement',
    actorId,
    proof,
    terminalJournalEntry,
    committed: false,
  };
}

export function buildBtdBridgeReadinessResearchSettlement(
  input: BtdBridgeReadinessResearchInput & { actorId: string },
): BtdBridgeReadinessResearchSettlement {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  if (typeof input.exchangeSequence !== 'bigint' || input.exchangeSequence <= 0n) {
    throw new Error('Bridge-readiness research settlement requires a positive Exchange sequence.');
  }

  const posture = buildBridgeReadinessResearchPosture(input);
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-bridge-readiness-research', [
      posture.postureId,
      input.exchangeSequence.toString(),
    ]),
    transactionKind: 'proof_admission',
    actorId,
    preStateRoot: buildBtdStableId('bridge-readiness-pre-state', [
      posture.activeBtdChainOfRecord,
      'research-only',
    ]),
    postStateRoot: buildBtdStableId('bridge-readiness-post-state', [
      posture.proofRoot,
      posture.bridgeChainOfRecordTruth,
      String(posture.allNonAdmitted),
    ]),
    receiptRoots: [
      posture.proofRoot,
      posture.policyRoot,
      ...posture.records.map((record) => record.researchRoot),
    ],
    ledgerAnchorIds: [],
    exchangeSequence: input.exchangeSequence,
    issuedAt: posture.issuedAt,
  });

  return {
    kind: 'btd_bridge_readiness_research_settlement',
    actorId,
    posture,
    terminalJournalEntry,
    committed: false,
  };
}

export function buildBtdProtocolTelemetrySettlement(
  input: BtdProtocolTelemetryBoundaryInput & { actorId: string },
): BtdProtocolTelemetrySettlement {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  if (typeof input.exchangeSequence !== 'bigint' || input.exchangeSequence <= 0n) {
    throw new Error('Protocol telemetry settlement requires a positive Exchange sequence.');
  }

  const envelope = buildBtdProtocolTelemetryEnvelope({
    envelopeId: input.envelopeId,
    telemetry: input.telemetry,
    proofHooks: input.proofHooks,
    issuedAt: input.issuedAt,
  });
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-protocol-telemetry', [
      envelope.envelopeId,
      input.exchangeSequence.toString(),
    ]),
    transactionKind: 'proof_admission',
    actorId,
    preStateRoot: buildBtdStableId('protocol-telemetry-pre-state', [
      envelope.telemetry[0].subjectKind,
      envelope.telemetry[0].subjectId,
    ]),
    postStateRoot: buildBtdStableId('protocol-telemetry-post-state', [
      envelope.telemetryRoot,
      envelope.proofRoot,
    ]),
    receiptRoots: [
      envelope.telemetryRoot,
      envelope.proofRoot,
      ...envelope.telemetry.map((record) => record.telemetryRoot),
      ...envelope.proofHooks.map((hook) => hook.hookRoot),
    ],
    ledgerAnchorIds: envelope.telemetry
      .map((record) => record.ledgerAnchorId)
      .filter((ledgerAnchorId): ledgerAnchorId is string => Boolean(ledgerAnchorId)),
    exchangeSequence: input.exchangeSequence,
    issuedAt: envelope.issuedAt,
  });

  return {
    kind: 'btd_protocol_telemetry_settlement',
    actorId,
    envelope,
    terminalJournalEntry,
    committed: false,
  };
}

export function buildBtdInterfaceIntegrationRegressionSettlement(
  input: BtdInterfaceIntegrationRegressionInput & { actorId: string },
): BtdInterfaceIntegrationRegressionSettlement {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');
  if (typeof input.exchangeSequence !== 'bigint' || input.exchangeSequence <= 0n) {
    throw new Error('Interface integration regression settlement requires a positive Exchange sequence.');
  }

  const proof = buildBtdInterfaceIntegrationRegressionProof({
    proofId: input.proofId,
    records: input.records,
    lowDetailProofRoot: input.lowDetailProofRoot,
    transactionCockpitProofRoot: input.transactionCockpitProofRoot,
    issuedAt: input.issuedAt,
  });
  const terminalJournalEntry = buildJournalEntry({
    journalEntryId: buildBtdStableId('terminal-btd-interface-integration-regression', [
      proof.proofId,
      input.exchangeSequence.toString(),
    ]),
    transactionKind: 'proof_admission',
    actorId,
    preStateRoot: buildBtdStableId('interface-integration-pre-state', [
      proof.lowDetailProofRoot,
      proof.transactionCockpitProofRoot,
    ]),
    postStateRoot: buildBtdStableId('interface-integration-post-state', [
      proof.proofRoot,
      proof.coverage.surfaces.observed.join(','),
      proof.coverage.objectFamilies.observed.join(','),
    ]),
    receiptRoots: [
      proof.proofRoot,
      proof.lowDetailProofRoot,
      proof.transactionCockpitProofRoot,
      ...proof.records.map((record) => record.recordRoot),
    ],
    ledgerAnchorIds: [],
    exchangeSequence: input.exchangeSequence,
    issuedAt: proof.issuedAt,
  });

  return {
    kind: 'btd_interface_integration_regression_settlement',
    actorId,
    proof,
    terminalJournalEntry,
    committed: false,
  };
}

export function buildBtdDeploymentReadinessSettlement(
  input: BtdDeploymentReadinessInput & { actorId: string },
): Omit<BtdDeploymentReadinessSettlement, 'committed'> {
  const actorId = assertNonEmptyString(input.actorId, 'actorId');

  switch (input.action) {
    case 'deployment_lane': {
      if (!input.readinessId) throw new Error('Deployment readiness requires readinessId.');
      if (!input.lane) throw new Error('Deployment readiness requires lane.');
      if (!input.bitcoinNetwork) throw new Error('Deployment readiness requires bitcoinNetwork.');
      if (!input.ledgerNetwork) throw new Error('Deployment readiness requires ledgerNetwork.');
      if (!input.rollbackPlanRoot) {
        throw new Error('Deployment readiness requires rollbackPlanRoot.');
      }

      const lane = buildV27CryptoDeploymentLane({
        lane: input.lane,
        bitcoinNetwork: input.bitcoinNetwork,
        ledgerNetwork: input.ledgerNetwork,
        rollbackPlanRoot: input.rollbackPlanRoot,
        operationalApprovalRoot: input.operationalApprovalRoot,
      });

      return {
        kind: 'btd_deployment_readiness_settlement',
        actorId,
        action: input.action,
        readiness: buildV27CryptoDeploymentReadinessReceipt({
          readinessId: input.readinessId,
          lane,
          presentEnvironmentKeys: input.presentEnvironmentKeys ?? [],
          issuedAt: input.issuedAt,
        }),
      };
    }
    case 'telemetry_event': {
      if (!input.telemetryEvent) throw new Error('Telemetry settlement requires event.');
      if (!input.telemetrySubjectId) {
        throw new Error('Telemetry settlement requires subjectId.');
      }

      return {
        kind: 'btd_deployment_readiness_settlement',
        actorId,
        action: input.action,
        telemetry: buildV27CryptoTelemetryRecord({
          event: input.telemetryEvent,
          subjectId: input.telemetrySubjectId,
          receiptRoot: input.telemetryReceiptRoot,
          ledgerAnchorId: input.telemetryLedgerAnchorId,
          issuedAt: input.issuedAt,
        }),
      };
    }
    case 'upgrade_plan': {
      if (!input.upgradeId) throw new Error('Upgrade plan requires upgradeId.');
      if (!input.fromVersion) throw new Error('Upgrade plan requires fromVersion.');
      if (!input.toVersion) throw new Error('Upgrade plan requires toVersion.');
      if (!input.ledgerNetwork) throw new Error('Upgrade plan requires ledgerNetwork.');
      if (!input.migrationRoot) throw new Error('Upgrade plan requires migrationRoot.');
      if (!input.preStateRoot) throw new Error('Upgrade plan requires preStateRoot.');
      if (!input.approvalReceiptRoot) {
        throw new Error('Upgrade plan requires approvalReceiptRoot.');
      }
      if (!input.rollbackPlanRoot) throw new Error('Upgrade plan requires rollbackPlanRoot.');

      return {
        kind: 'btd_deployment_readiness_settlement',
        actorId,
        action: input.action,
        upgradeReceipt: buildPlannedBtdProtocolUpgradeReceipt({
          upgradeId: input.upgradeId,
          fromVersion: input.fromVersion,
          toVersion: input.toVersion,
          network: input.ledgerNetwork,
          migrationRoot: input.migrationRoot,
          preStateRoot: input.preStateRoot,
          approvalReceiptRoot: input.approvalReceiptRoot,
          rollbackPlanRoot: input.rollbackPlanRoot,
          issuedAt: input.issuedAt,
        }),
      };
    }
    case 'upgrade_transition': {
      if (!input.previousUpgradeReceipt) {
        throw new Error('Upgrade transition requires previousUpgradeReceipt.');
      }
      if (!input.nextUpgradeState) {
        throw new Error('Upgrade transition requires nextUpgradeState.');
      }

      return {
        kind: 'btd_deployment_readiness_settlement',
        actorId,
        action: input.action,
        upgradeReceipt: advanceBtdProtocolUpgradeReceipt(input.previousUpgradeReceipt, {
          upgradeState: input.nextUpgradeState,
          postStateRoot: input.postStateRoot,
          ledgerAnchorId: input.ledgerAnchorId,
        }),
      };
    }
    default:
      throw new Error(
        `Unsupported deployment readiness action: ${(input as { action: string }).action}.`,
      );
  }
}

export function toBtdJsonSafe(value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => toBtdJsonSafe(entry));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        toBtdJsonSafe(entry),
      ]),
    );
  }

  return value;
}

function assertMintDraftAdmission(input: BtdMintDraftInput): void {
  if (input.acceptedNeed !== true) {
    throw new Error('BTD mint draft requires accepted Read.');
  }

  if (input.acceptedFit !== true) {
    throw new Error('BTD mint draft requires accepted Finding Fits result.');
  }

  if (!input.semanticUnits.length) {
    throw new Error('BTD mint draft requires at least one semantic unit.');
  }

  assertNonEmptyString(input.assetPackId, 'assetPackId');
  assertNonEmptyString(input.readId, 'readId');
  assertNonEmptyString(input.sourceManifestRoot, 'sourceManifestRoot');
  assertNonEmptyString(input.fitReceiptRoot, 'fitReceiptRoot');
  assertNonEmptyString(input.proofRoot, 'proofRoot');
  assertNonEmptyString(input.dedupeReceiptRoot, 'dedupeReceiptRoot');
  assertNonEmptyString(input.settlementJournalRoot, 'settlementJournalRoot');
  assertNonEmptyString(input.exchangeReceiptRoot, 'exchangeReceiptRoot');
  assertNonEmptyString(input.accessPolicyId, 'accessPolicyId');
  assertNonEmptyString(input.accessPolicyHash, 'accessPolicyHash');

  if (typeof input.exchangeSequence !== 'bigint' || input.exchangeSequence <= 0n) {
    throw new Error('BTD mint draft requires a positive Exchange sequence.');
  }
}

function shouldBuildAssetPackMintReceipt(
  input: BtdMintDraftInput,
): input is BtdMintDraftInput & {
  depositorWalletId: string;
  sourceSafePreviewRoot: string;
  settlementConservationRoot: string;
  ledgerProjectionRoot: string;
} {
  return Boolean(
    input.depositorWalletId &&
      input.sourceSafePreviewRoot &&
      input.settlementConservationRoot &&
      input.ledgerProjectionRoot,
  );
}

function normalizeMeasureMintState(state?: BtdMeasureMintState): BtdMeasureMintState {
  if (!state) {
    return createBtdMeasureMintState();
  }

  return createBtdMeasureMintState({
    totalMinted: state.totalMinted,
    nextTokenId: state.nextTokenId,
    cumulativeAdmittedMeasurement: state.cumulativeAdmittedMeasurement,
    curveParameter: state.curveParameter,
  });
}

function buildBtcFeeReceiptForAction(
  input: BtdBtcFeeTransactionInput,
): BtcFeeTransactionReceipt {
  switch (input.action) {
    case 'prepare': {
      if (!input.receiptId) throw new Error('BTC fee prepare requires receiptId.');
      if (!input.feePurpose) throw new Error('BTC fee prepare requires feePurpose.');
      if (!input.payerSession) throw new Error('BTC fee prepare requires payerSession.');
      if (!input.psbt) throw new Error('BTC fee prepare requires psbt.');
      if (input.satsPaid === undefined) throw new Error('BTC fee prepare requires satsPaid.');
      if (typeof input.exchangeSequence !== 'bigint') {
        throw new Error('BTC fee prepare requires bigint exchangeSequence.');
      }
      if (!input.terminalJournalRoot) {
        throw new Error('BTC fee prepare requires terminalJournalRoot.');
      }

      if (input.feeQuote) {
        const feeQuote = assertBtcFeeQuoteActive(input.feeQuote, input.issuedAt);
        if (feeQuote.state !== 'accepted') {
          throw new Error('BTC fee prepare requires an accepted feeQuote.');
        }
        if (feeQuote.feePurpose !== input.feePurpose) {
          throw new Error('BTC fee quote purpose does not match prepare input.');
        }
        if (feeQuote.sats !== BigInt(input.satsPaid)) {
          throw new Error('BTC fee quote sats do not match prepare input.');
        }
      }

      return buildPreparedBtcFeeTransactionReceipt({
        receiptId: input.receiptId,
        feePurpose: input.feePurpose,
        payerSession: normalizeWalletSignerSession(input.payerSession),
        psbt: input.psbt,
        satsPaid: input.satsPaid,
        satsPerVbyte: input.satsPerVbyte,
        exchangeSequence: input.exchangeSequence,
        terminalJournalRoot: input.terminalJournalRoot,
        relatedAssetPackId: input.relatedAssetPackId,
        relatedOrderId: input.relatedOrderId,
        issuedAt: input.issuedAt,
      });
    }
    case 'mark_signed': {
      const previous = normalizeBtcFeeTransactionReceipt(input.previousReceipt);
      return advanceBtcFeeTransactionReceipt(previous, {
        finalityState: 'signed',
        psbt: assertNonEmptyString(input.signedPsbt, 'signedPsbt'),
      });
    }
    case 'mark_broadcast': {
      const previous = normalizeBtcFeeTransactionReceipt(input.previousReceipt);
      return advanceBtcFeeTransactionReceipt(previous, {
        finalityState: 'broadcast',
        txid: assertNonEmptyString(input.txid, 'txid'),
        vout: input.vout,
      });
    }
    case 'observe': {
      const previous = normalizeBtcFeeTransactionReceipt(input.previousReceipt);
      const observedFinalityState = input.observedFinalityState;
      if (
        observedFinalityState !== 'confirmed' &&
        observedFinalityState !== 'replaced' &&
        observedFinalityState !== 'reorged' &&
        observedFinalityState !== 'failed' &&
        observedFinalityState !== 'broadcast'
      ) {
        throw new Error('BTC fee observe requires an observed finality state.');
      }

      return advanceBtcFeeTransactionReceipt(previous, {
        finalityState: observedFinalityState,
        txid: input.txid ?? previous.txid ?? undefined,
        confirmations: input.confirmations,
      });
    }
    default:
      throw new Error(`Unsupported BTC fee transaction action: ${(input as { action: string }).action}.`);
  }
}

function buildAssetPackLedgerAnchorForAction(
  input: BtdAssetPackLedgerAnchorInput,
): AssetPackLedgerAnchor {
  switch (input.action) {
    case 'prepare': {
      if (!input.anchorId) throw new Error('AssetPack ledger anchor prepare requires anchorId.');
      if (!input.assetPackId) {
        throw new Error('AssetPack ledger anchor prepare requires assetPackId.');
      }
      if (!input.network) throw new Error('AssetPack ledger anchor prepare requires network.');
      if (!input.commitmentRoot) {
        throw new Error('AssetPack ledger anchor prepare requires commitmentRoot.');
      }
      if (!input.sourceManifestRoot) {
        throw new Error('AssetPack ledger anchor prepare requires sourceManifestRoot.');
      }
      if (!input.proofRoot) throw new Error('AssetPack ledger anchor prepare requires proofRoot.');
      if (!input.accessPolicyHash) {
        throw new Error('AssetPack ledger anchor prepare requires accessPolicyHash.');
      }
      if (input.btdRangeStart === undefined || input.btdRangeEndExclusive === undefined) {
        throw new Error('AssetPack ledger anchor prepare requires BTD range bounds.');
      }

      return buildPreparedAssetPackLedgerAnchor({
        anchorId: input.anchorId,
        assetPackId: input.assetPackId,
        chain: input.chain,
        network: input.network,
        commitmentMethod: input.commitmentMethod,
        commitmentRoot: input.commitmentRoot,
        sourceManifestRoot: input.sourceManifestRoot,
        proofRoot: input.proofRoot,
        accessPolicyHash: input.accessPolicyHash,
        btdRangeStart: input.btdRangeStart,
        btdRangeEndExclusive: input.btdRangeEndExclusive,
        contractAddress: input.contractAddress,
        tokenId: input.tokenId,
      });
    }
    case 'mark_broadcast': {
      const previous = normalizeAssetPackLedgerAnchor(input.previousAnchor);
      return advanceAssetPackLedgerAnchor(previous, {
        finalityState: 'broadcast',
        txidOrHash: assertNonEmptyString(input.txidOrHash, 'txidOrHash'),
        outputIndex: input.outputIndex,
        anchoredAt: input.issuedAt,
      });
    }
    case 'observe': {
      const previous = normalizeAssetPackLedgerAnchor(input.previousAnchor);
      const observedFinalityState = input.observedFinalityState;
      if (
        observedFinalityState !== 'confirmed' &&
        observedFinalityState !== 'reorged' &&
        observedFinalityState !== 'failed' &&
        observedFinalityState !== 'broadcast'
      ) {
        throw new Error('AssetPack ledger anchor observe requires an observed finality state.');
      }

      return advanceAssetPackLedgerAnchor(previous, {
        finalityState: observedFinalityState,
        txidOrHash: input.txidOrHash ?? previous.txidOrHash ?? undefined,
        confirmations: input.confirmations,
        outputIndex: input.outputIndex,
        anchoredAt: input.issuedAt,
      });
    }
    default:
      throw new Error(
        `Unsupported AssetPack ledger anchor action: ${(input as { action: string }).action}.`,
      );
  }
}

function buildAssetPackExchangeForAction(input: BtdAssetPackExchangeInput): {
  order?: AssetPackExchangeOrder;
  rightsTransfer?: AssetPackRightsTransferReceipt;
  exchangeSequence: bigint;
} {
  switch (input.action) {
    case 'create_order': {
      if (!input.orderId) throw new Error('AssetPack Exchange order creation requires orderId.');
      if (!input.orderKind) {
        throw new Error('AssetPack Exchange order creation requires orderKind.');
      }
      if (!input.assetPackId) {
        throw new Error('AssetPack Exchange order creation requires assetPackId.');
      }
      if (input.rangeStart === undefined || input.rangeEndExclusive === undefined) {
        throw new Error('AssetPack Exchange order creation requires range bounds.');
      }
      if (!input.makerWalletId) {
        throw new Error('AssetPack Exchange order creation requires makerWalletId.');
      }
      if (input.priceSats === undefined) {
        throw new Error('AssetPack Exchange order creation requires priceSats.');
      }
      if (!input.accessPolicyHash) {
        throw new Error('AssetPack Exchange order creation requires accessPolicyHash.');
      }
      if (typeof input.createdAtExchangeSequence !== 'bigint') {
        throw new Error('AssetPack Exchange order creation requires createdAtExchangeSequence.');
      }

      const order = createAssetPackExchangeOrder({
        orderId: input.orderId,
        orderKind: input.orderKind,
        assetPackId: input.assetPackId,
        rangeStart: input.rangeStart,
        rangeEndExclusive: input.rangeEndExclusive,
        makerWalletId: input.makerWalletId,
        priceSats: input.priceSats,
        accessPolicyHash: input.accessPolicyHash,
        createdAtExchangeSequence: input.createdAtExchangeSequence,
      });
      return { order, exchangeSequence: order.createdAtExchangeSequence };
    }
    case 'cancel_order': {
      const order = cancelAssetPackExchangeOrder(
        normalizeAssetPackExchangeOrder(input.previousOrder),
      );
      return { order, exchangeSequence: order.createdAtExchangeSequence };
    }
    case 'accept_order': {
      if (!input.takerWalletId) {
        throw new Error('AssetPack Exchange order acceptance requires takerWalletId.');
      }
      const order = acceptAssetPackExchangeOrder(
        normalizeAssetPackExchangeOrder(input.previousOrder),
        input.takerWalletId,
      );
      return { order, exchangeSequence: order.createdAtExchangeSequence };
    }
    case 'settle_order': {
      if (typeof input.settledAtExchangeSequence !== 'bigint') {
        throw new Error('AssetPack Exchange order settlement requires settledAtExchangeSequence.');
      }
      const order = settleAssetPackExchangeOrder(
        normalizeAssetPackExchangeOrder(input.previousOrder),
        {
          settledAtExchangeSequence: input.settledAtExchangeSequence,
          ledgerAnchorId: input.ledgerAnchorId,
        },
      );
      return { order, exchangeSequence: input.settledAtExchangeSequence };
    }
    case 'transfer_rights': {
      if (!input.receiptId) {
        throw new Error('AssetPack rights transfer requires receiptId.');
      }
      if (!input.fromWalletId || !input.toWalletId) {
        throw new Error('AssetPack rights transfer requires fromWalletId and toWalletId.');
      }
      if (!input.btcFeeReceiptId) {
        throw new Error('AssetPack rights transfer requires btcFeeReceiptId.');
      }

      const rightsTransfer = buildAssetPackRightsTransferReceipt({
        receiptId: input.receiptId,
        settledOrder: normalizeAssetPackExchangeOrder(input.previousOrder),
        fromWalletId: input.fromWalletId,
        toWalletId: input.toWalletId,
        btcFeeReceiptId: input.btcFeeReceiptId,
        issuedAt: input.issuedAt,
      });
      return { rightsTransfer, exchangeSequence: rightsTransfer.exchangeSequence };
    }
    default:
      throw new Error(
        `Unsupported AssetPack Exchange action: ${(input as { action: string }).action}.`,
      );
  }
}

function shouldBuildBtdRightsTransferReceipt(
  input: BtdAssetPackExchangeInput,
): input is BtdAssetPackExchangeInput & {
  btcFeeFinalityState: BtcFeeFinalityState;
  readLicenseId: string;
  sourceSafePreviewRoot: string;
  paidUnlockRoot: string;
  deliveryAdmissionRoot: string;
  ledgerProjectionRoot: string;
} {
  return Boolean(
    input.btcFeeFinalityState &&
      input.readLicenseId &&
      input.sourceSafePreviewRoot &&
      input.paidUnlockRoot &&
      input.deliveryAdmissionRoot &&
      input.ledgerProjectionRoot,
  );
}

function normalizeWalletSignerSession(
  session: WalletSignerSession | BtdWalletSignerSessionInput,
): WalletSignerSession {
  if ('serverCustody' in session && 'state' in session) {
    return session;
  }

  return createWalletSignerSession(session);
}

function normalizeBtcFeeTransactionReceipt(
  receipt: BtcFeeTransactionReceipt | undefined,
): BtcFeeTransactionReceipt {
  if (!receipt) {
    throw new Error('BTC fee transition requires previousReceipt.');
  }

  return assertBtcFeeTransactionReceipt({
    ...receipt,
    satsPaid: BigInt(receipt.satsPaid),
    exchangeSequence: BigInt(receipt.exchangeSequence),
    serverCustody: false,
  });
}

function normalizeBtcFeeQuote(quote: BtcFeeQuote | undefined): BtcFeeQuote | undefined {
  if (!quote) {
    return undefined;
  }

  return assertBtcFeeQuote({
    ...quote,
    sats: BigInt(quote.sats),
  });
}

function normalizeAssetPackLedgerAnchor(
  anchor: AssetPackLedgerAnchor | undefined,
): AssetPackLedgerAnchor {
  if (!anchor) {
    throw new Error('AssetPack ledger anchor transition requires previousAnchor.');
  }

  return assertAssetPackLedgerAnchor(anchor);
}

function normalizeAssetPackExchangeOrder(
  order: AssetPackExchangeOrder | undefined,
): AssetPackExchangeOrder {
  if (!order) {
    throw new Error('AssetPack Exchange transition requires previousOrder.');
  }

  return {
    ...order,
    priceSats: BigInt(order.priceSats),
    createdAtExchangeSequence: BigInt(order.createdAtExchangeSequence),
    settledAtExchangeSequence:
      order.settledAtExchangeSequence === undefined
        ? undefined
        : BigInt(order.settledAtExchangeSequence),
  };
}

function normalizeJournalEntry(entry: JournalEntry | undefined): JournalEntry {
  if (!entry) {
    throw new Error('BTD journal action requires entry.');
  }

  return buildJournalEntry({
    ...entry,
    exchangeSequence: BigInt(entry.exchangeSequence),
  });
}

function requireJournalTransactionKind(
  kind: JournalTransactionKind | undefined,
): JournalTransactionKind {
  if (!kind) {
    throw new Error('BTD journal entry requires transactionKind.');
  }

  return kind;
}

function requireBigInt(value: bigint | undefined, label: string): bigint {
  if (typeof value !== 'bigint') {
    throw new Error(`${label} must be a bigint.`);
  }

  return value;
}
