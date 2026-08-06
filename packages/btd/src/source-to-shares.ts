import { createHash } from 'crypto';
import type { BtdAncestryReviewReceipt } from './ancestry';
import {
  BITCODE_FEE_ASSET,
  type BtdTokenId,
  assertNonEmptyString,
  assertNonNegativeSafeInteger,
  toBigIntAmount,
} from './constants';
import type { BtdZeroCellReason } from './measuremint';
import type { SettlementConservationCheck } from './reconciliation';

const MAX_BPS = 10_000;
const MAX_BPS_BIGINT = 10_000n;

export type SourceToSharesContributionDisposition =
  | 'positive_marginal_contribution'
  | 'clipped_zero_contribution';

export type SourceToSharesSettlementConservationState =
  | 'balanced'
  | 'overpayment'
  | 'underpayment'
  | 'drifted';

export type SourceToSharesRangeSliceState = 'allocated' | 'zero_cell_refit_tail';

export interface SourceToSharesFitDepositInput {
  depositId: string;
  assetPackId: string;
  depositorWalletId: string;
  sourceManifestRoot: string;
  findingFitsResultRoot: string;
  measurementRoot: string;
  normalizedMeasurementUnits: bigint | number | string;
  fitQualityBps: number;
  provenanceBps?: number;
  accepted: true;
}

export interface SourceToSharesBtdRangeInput {
  assetPackId: string;
  rangeStart?: BtdTokenId;
  rangeEndExclusive?: BtdTokenId;
  tokenCount?: number;
  rangeRoot?: string;
  measureMintReceiptRoot?: string;
  zeroCellReason?: BtdZeroCellReason;
}

export interface SourceToSharesFeeQuoteInput {
  quoteId: string;
  quoteRoot: string;
  grossSats: bigint | number | string;
  priceAsset?: typeof BITCODE_FEE_ASSET;
}

export interface SourceToSharesPaymentObservationInput {
  paymentReceiptRoot: string;
  observedDebitSats: bigint | number | string;
  observedCreditSats?: bigint | number | string;
  finalityState?: 'prepared' | 'signed' | 'broadcast' | 'confirmed' | 'replaced' | 'reorged' | 'failed';
  txid?: string;
}

export interface SourceToSharesProofInput {
  proofId?: string;
  readId: string;
  assetPackId: string;
  acceptedNeedRoot: string;
  findingFitsResultRoot: string;
  fitDeposits: SourceToSharesFitDepositInput[];
  btdRange: SourceToSharesBtdRangeInput;
  feeQuote: SourceToSharesFeeQuoteInput;
  paymentObservation: SourceToSharesPaymentObservationInput;
  ancestryReview?: BtdAncestryReviewReceipt | null;
  issuedAt?: string;
}

export interface SourceToSharesBoundFitDeposit {
  depositId: string;
  assetPackId: string;
  depositorWalletId: string;
  sourceManifestRoot: string;
  findingFitsResultRoot: string;
  measurementRoot: string;
  normalizedMeasurementUnits: bigint;
  fitQualityBps: number;
  provenanceBps: number;
  accepted: true;
}

export interface SourceToSharesContributionWeight {
  depositId: string;
  assetPackId: string;
  depositorWalletId: string;
  measurementRoot: string;
  sourceManifestRoot: string;
  findingFitsResultRoot: string;
  rawWeight: string;
  clippedWeight: string;
  shareBps: number;
  normalizationRemainderUnits: string;
  disposition: SourceToSharesContributionDisposition;
  reasons: string[];
}

export interface SourceToSharesNormalizationTrace {
  method: 'largest_remainder';
  totalClippedWeight: string;
  normalizedTotalBps: number;
  tieBreakPolicy: 'remainder_desc_weight_desc_deposit_id_asc';
  remainderDistributionOrder: string[];
  provisionalShares: Array<{
    depositId: string;
    floorShareBps: number;
    remainderUnits: string;
    remainderAwardedBps: number;
    finalShareBps: number;
    tieBreakRank: number;
  }>;
}

export interface SourceToSharesRangeSlice {
  depositId: string;
  assetPackId: string;
  depositorWalletId: string;
  shareBps: number;
  tokenCount: number;
  rangeStart?: BtdTokenId;
  rangeEndExclusive?: BtdTokenId;
  sliceState: SourceToSharesRangeSliceState;
  sliceRoot: string;
}

export interface SourceToSharesSettlementAllocation {
  depositId: string;
  assetPackId: string;
  depositorWalletId: string;
  shareBps: number;
  allocatedSats: bigint;
  allocationRemainderUnits: string;
  allocationRoot: string;
}

export interface SourceToSharesInvariantVerdict {
  theoremId: string;
  passed: boolean;
  expectedSats: bigint;
  observedSats: bigint;
  summary: string;
}

export interface SourceToSharesSettlementConservation {
  state: SourceToSharesSettlementConservationState;
  expectedDebitSats: bigint;
  observedDebitSats: bigint;
  expectedCreditSats: bigint;
  observedCreditSats: bigint;
  allocatedCreditSats: bigint;
  noOverpayment: SourceToSharesInvariantVerdict;
  noUnderpayment: SourceToSharesInvariantVerdict;
  allocationConserved: boolean;
  settlementAdmissible: boolean;
  blockerReasons: string[];
  conservationRoot: string;
  reconciliationCheck: SettlementConservationCheck;
}

export interface SourceToSharesZeroCellRefitTail {
  tailPolicy: 'zero_cell_receipt_then_refit_only';
  state: 'no_zero_cell_tail' | 'zero_cell_refit_tail';
  rangeTokenCount: number;
  zeroCellReason?: BtdZeroCellReason;
  measureMintReceiptRoot?: string;
  zeroCellDepositIds: string[];
  refitRequired: boolean;
  tailRoot: string;
}

export interface SourceToSharesAncestryEvidence {
  state: 'not_provided' | 'reviewed';
  reviewId?: string;
  reviewRoot: string;
  payableEdgeCount: number;
  recordedUnpaidEdgeCount: number;
  rejectedEdgeCount: number;
  payableRouteWeight: string;
}

export interface SourceToSharesProof {
  kind: 'btd.source_to_shares_proof';
  proofId: string;
  readId: string;
  assetPackId: string;
  acceptedNeedRoot: string;
  findingFitsResultRoot: string;
  proofArtifactPath: '.proofs/v30/settlement-source-to-shares-proof.json';
  sourceToSharesArtifactPath: '.proofs/_shared/source-to-shares.json';
  feeQuote: {
    quoteId: string;
    quoteRoot: string;
    priceAsset: typeof BITCODE_FEE_ASSET;
    grossSats: bigint;
  };
  paymentObservation: {
    paymentReceiptRoot: string;
    observedDebitSats: bigint;
    observedCreditSats: bigint;
    finalityState?: SourceToSharesPaymentObservationInput['finalityState'];
    txid?: string;
  };
  fitDeposits: SourceToSharesBoundFitDeposit[];
  contributionWeights: SourceToSharesContributionWeight[];
  normalizationTrace: SourceToSharesNormalizationTrace;
  rangeSlices: SourceToSharesRangeSlice[];
  settlementAllocations: SourceToSharesSettlementAllocation[];
  settlementConservation: SourceToSharesSettlementConservation;
  zeroCellRefitTail: SourceToSharesZeroCellRefitTail;
  ancestryEvidence: SourceToSharesAncestryEvidence;
  proofRoot: string;
  issuedAt: string;
}

export function buildSourceToSharesProof(input: SourceToSharesProofInput): SourceToSharesProof {
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const readId = assertNonEmptyString(input.readId, 'readId');
  const assetPackId = assertNonEmptyString(input.assetPackId, 'assetPackId');
  const fitDeposits = normalizeFitDeposits(input.fitDeposits);
  const btdRange = normalizeBtdRange(input.btdRange, assetPackId);
  const feeQuote = normalizeFeeQuote(input.feeQuote);
  const paymentObservation = normalizePaymentObservation(input.paymentObservation);
  const proofId =
    input.proofId ??
    stableId('btd-source-to-shares-proof', [
      readId,
      assetPackId,
      input.findingFitsResultRoot,
      feeQuote.quoteRoot,
      paymentObservation.paymentReceiptRoot,
    ]);

  if (!fitDeposits.length) {
    throw new Error('Source-to-shares proof requires at least one fit deposit.');
  }

  const { contributionWeights, normalizationTrace } = buildContributionWeights(fitDeposits);
  const rangeSlices = allocateRangeSlices({
    assetPackId,
    fitDeposits,
    contributionWeights,
    rangeStart: btdRange.rangeStart,
    tokenCount: btdRange.tokenCount,
  });
  const settlementAllocations = allocateSettlementSats({
    fitDeposits,
    contributionWeights,
    grossSats: feeQuote.grossSats,
  });
  const settlementConservation = buildSettlementConservation({
    proofId,
    feeQuote,
    paymentObservation,
    settlementAllocations,
  });
  const zeroCellRefitTail = buildZeroCellRefitTail({
    btdRange,
    rangeSlices,
    fitDeposits,
  });
  const ancestryEvidence = buildAncestryEvidence(input.ancestryReview);
  const proofRoot = stableProofRoot('source-to-shares', [
    proofId,
    readId,
    assetPackId,
    input.acceptedNeedRoot,
    input.findingFitsResultRoot,
    feeQuote,
    paymentObservation,
    contributionWeights,
    normalizationTrace,
    rangeSlices,
    settlementAllocations,
    settlementConservation.conservationRoot,
    zeroCellRefitTail.tailRoot,
    ancestryEvidence.reviewRoot,
  ]);

  return assertSourceToSharesProof({
    kind: 'btd.source_to_shares_proof',
    proofId,
    readId,
    assetPackId,
    acceptedNeedRoot: assertNonEmptyString(input.acceptedNeedRoot, 'acceptedNeedRoot'),
    findingFitsResultRoot: assertNonEmptyString(
      input.findingFitsResultRoot,
      'findingFitsResultRoot',
    ),
    proofArtifactPath: '.proofs/v30/settlement-source-to-shares-proof.json',
    sourceToSharesArtifactPath: '.proofs/_shared/source-to-shares.json',
    feeQuote,
    paymentObservation,
    fitDeposits,
    contributionWeights,
    normalizationTrace,
    rangeSlices,
    settlementAllocations,
    settlementConservation,
    zeroCellRefitTail,
    ancestryEvidence,
    proofRoot,
    issuedAt,
  });
}

export function assertSourceToSharesProof(proof: SourceToSharesProof): SourceToSharesProof {
  if (proof.kind !== 'btd.source_to_shares_proof') {
    throw new Error('Invalid source-to-shares proof kind.');
  }

  assertNonEmptyString(proof.proofId, 'proofId');
  assertNonEmptyString(proof.readId, 'readId');
  assertNonEmptyString(proof.assetPackId, 'assetPackId');
  assertNonEmptyString(proof.acceptedNeedRoot, 'acceptedNeedRoot');
  assertNonEmptyString(proof.findingFitsResultRoot, 'findingFitsResultRoot');
  assertNonEmptyString(proof.proofRoot, 'proofRoot');
  assertNonEmptyString(proof.issuedAt, 'issuedAt');
  normalizeFitDeposits(proof.fitDeposits);

  const shareTotal = proof.contributionWeights.reduce((sum, entry) => sum + entry.shareBps, 0);
  if (shareTotal !== MAX_BPS || proof.normalizationTrace.normalizedTotalBps !== MAX_BPS) {
    throw new Error('Source-to-shares contribution weights must sum to 10000 basis points.');
  }

  const allocatedRange = proof.rangeSlices.reduce((sum, slice) => sum + slice.tokenCount, 0);
  if (allocatedRange !== proof.zeroCellRefitTail.rangeTokenCount) {
    throw new Error('Source-to-shares range slices do not conserve the BTD range token count.');
  }

  const allocatedSats = proof.settlementAllocations.reduce(
    (sum, allocation) => sum + allocation.allocatedSats,
    0n,
  );
  if (allocatedSats !== proof.feeQuote.grossSats) {
    throw new Error('Source-to-shares settlement allocations do not conserve gross sats.');
  }

  if (proof.settlementConservation.allocatedCreditSats !== allocatedSats) {
    throw new Error('Source-to-shares conservation allocated credit does not match allocations.');
  }

  return proof;
}

export function assertSourceToSharesSettlementAdmissible(
  proof: SourceToSharesProof,
): SourceToSharesProof {
  assertSourceToSharesProof(proof);
  if (!proof.settlementConservation.settlementAdmissible) {
    throw new Error(
      `Source-to-shares settlement is not admissible: ${proof.settlementConservation.blockerReasons.join('; ')}`,
    );
  }
  return proof;
}

export function sourceToSharesProofToSettlementConservationCheck(
  proof: SourceToSharesProof,
): SettlementConservationCheck {
  assertSourceToSharesProof(proof);
  return proof.settlementConservation.reconciliationCheck;
}

function normalizeFitDeposits(
  deposits: readonly SourceToSharesFitDepositInput[],
): SourceToSharesBoundFitDeposit[] {
  const seen = new Set<string>();
  return deposits.map((deposit) => {
    const depositId = assertNonEmptyString(deposit.depositId, 'depositId');
    if (seen.has(depositId)) {
      throw new Error(`Duplicate source-to-shares fit deposit: ${depositId}.`);
    }
    seen.add(depositId);

    if (deposit.accepted !== true) {
      throw new Error('Source-to-shares proof only accepts admitted fit deposits.');
    }

    const normalizedMeasurementUnits = toBigIntAmount(
      deposit.normalizedMeasurementUnits,
      'normalizedMeasurementUnits',
    );
    if (normalizedMeasurementUnits <= 0n) {
      throw new Error('Source-to-shares fit deposit measurement units must be positive.');
    }

    return {
      depositId,
      assetPackId: assertNonEmptyString(deposit.assetPackId, 'deposit.assetPackId'),
      depositorWalletId: assertNonEmptyString(
        deposit.depositorWalletId,
        'depositorWalletId',
      ),
      sourceManifestRoot: assertNonEmptyString(
        deposit.sourceManifestRoot,
        'sourceManifestRoot',
      ),
      findingFitsResultRoot: assertNonEmptyString(
        deposit.findingFitsResultRoot,
        'deposit.findingFitsResultRoot',
      ),
      measurementRoot: assertNonEmptyString(deposit.measurementRoot, 'measurementRoot'),
      normalizedMeasurementUnits,
      fitQualityBps: assertBasisPoints(deposit.fitQualityBps, 'fitQualityBps'),
      provenanceBps: assertBasisPoints(deposit.provenanceBps ?? MAX_BPS, 'provenanceBps'),
      accepted: true,
    };
  });
}

function normalizeBtdRange(input: SourceToSharesBtdRangeInput, assetPackId: string): {
  assetPackId: string;
  rangeStart?: BtdTokenId;
  rangeEndExclusive?: BtdTokenId;
  tokenCount: number;
  rangeRoot?: string;
  measureMintReceiptRoot?: string;
  zeroCellReason?: BtdZeroCellReason;
} {
  const rangeAssetPackId = assertNonEmptyString(input.assetPackId, 'btdRange.assetPackId');
  if (rangeAssetPackId !== assetPackId) {
    throw new Error('Source-to-shares BTD range assetPackId must match the proof assetPackId.');
  }

  const hasRangeBounds =
    input.rangeStart !== undefined || input.rangeEndExclusive !== undefined;
  const rangeStart = hasRangeBounds
    ? assertNonNegativeSafeInteger(input.rangeStart, 'rangeStart')
    : undefined;
  const rangeEndExclusive = hasRangeBounds
    ? assertNonNegativeSafeInteger(input.rangeEndExclusive, 'rangeEndExclusive')
    : undefined;
  if (hasRangeBounds && rangeEndExclusive! < rangeStart!) {
    throw new Error('Source-to-shares BTD range cannot be negative.');
  }

  const derivedTokenCount = hasRangeBounds ? rangeEndExclusive! - rangeStart! : 0;
  const tokenCount =
    input.tokenCount === undefined
      ? derivedTokenCount
      : assertNonNegativeSafeInteger(input.tokenCount, 'tokenCount');

  if (hasRangeBounds && tokenCount !== derivedTokenCount) {
    throw new Error('Source-to-shares BTD tokenCount does not match range bounds.');
  }
  if (!hasRangeBounds && tokenCount > 0) {
    throw new Error('Source-to-shares positive tokenCount requires range bounds.');
  }

  return {
    assetPackId: rangeAssetPackId,
    rangeStart,
    rangeEndExclusive,
    tokenCount,
    rangeRoot: input.rangeRoot ? assertNonEmptyString(input.rangeRoot, 'rangeRoot') : undefined,
    measureMintReceiptRoot: input.measureMintReceiptRoot
      ? assertNonEmptyString(input.measureMintReceiptRoot, 'measureMintReceiptRoot')
      : undefined,
    zeroCellReason: input.zeroCellReason,
  };
}

function normalizeFeeQuote(input: SourceToSharesFeeQuoteInput): SourceToSharesProof['feeQuote'] {
  if ((input.priceAsset ?? BITCODE_FEE_ASSET) !== BITCODE_FEE_ASSET) {
    throw new Error('Source-to-shares fee quote must be priced in BTC.');
  }
  const grossSats = toBigIntAmount(input.grossSats, 'grossSats');
  if (grossSats <= 0n) {
    throw new Error('Source-to-shares fee quote grossSats must be positive.');
  }

  return {
    quoteId: assertNonEmptyString(input.quoteId, 'quoteId'),
    quoteRoot: assertNonEmptyString(input.quoteRoot, 'quoteRoot'),
    priceAsset: BITCODE_FEE_ASSET,
    grossSats,
  };
}

function normalizePaymentObservation(
  input: SourceToSharesPaymentObservationInput,
): SourceToSharesProof['paymentObservation'] {
  const observedDebitSats = toBigIntAmount(input.observedDebitSats, 'observedDebitSats');
  if (observedDebitSats < 0n) {
    throw new Error('Source-to-shares observedDebitSats must be non-negative.');
  }
  const observedCreditSats =
    input.observedCreditSats === undefined
      ? observedDebitSats
      : toBigIntAmount(input.observedCreditSats, 'observedCreditSats');
  if (observedCreditSats < 0n) {
    throw new Error('Source-to-shares observedCreditSats must be non-negative.');
  }

  return {
    paymentReceiptRoot: assertNonEmptyString(input.paymentReceiptRoot, 'paymentReceiptRoot'),
    observedDebitSats,
    observedCreditSats,
    finalityState: input.finalityState,
    txid: input.txid ? assertNonEmptyString(input.txid, 'txid') : undefined,
  };
}

function buildContributionWeights(
  fitDeposits: readonly SourceToSharesBoundFitDeposit[],
): {
  contributionWeights: SourceToSharesContributionWeight[];
  normalizationTrace: SourceToSharesNormalizationTrace;
} {
  const rawEntries = fitDeposits
    .map((deposit) => {
      const rawWeight =
        deposit.normalizedMeasurementUnits *
        BigInt(deposit.fitQualityBps) *
        BigInt(deposit.provenanceBps);
      const clippedWeight = rawWeight > 0n ? rawWeight : 0n;
      return {
        deposit,
        rawWeight,
        clippedWeight,
        disposition:
          clippedWeight > 0n
            ? 'positive_marginal_contribution'
            : 'clipped_zero_contribution',
      } as const;
    })
    .sort((left, right) => left.deposit.depositId.localeCompare(right.deposit.depositId));

  const totalClippedWeight = rawEntries.reduce((sum, entry) => sum + entry.clippedWeight, 0n);
  if (totalClippedWeight <= 0n) {
    throw new Error('Source-to-shares proof requires at least one positive contribution weight.');
  }

  const provisional = rawEntries.map((entry) => {
    const numerator = entry.clippedWeight * MAX_BPS_BIGINT;
    return {
      ...entry,
      floorShareBps: Number(numerator / totalClippedWeight),
      remainderUnits: numerator % totalClippedWeight,
      remainderAwardedBps: 0,
      tieBreakRank: 0,
    };
  });
  let remainingBps =
    MAX_BPS - provisional.reduce((sum, entry) => sum + entry.floorShareBps, 0);
  const remainderOrder = [...provisional].sort(compareShareRemainders);
  remainderOrder.forEach((entry, index) => {
    entry.tieBreakRank = index + 1;
  });
  for (const entry of remainderOrder) {
    if (remainingBps <= 0) break;
    entry.floorShareBps += 1;
    entry.remainderAwardedBps += 1;
    remainingBps -= 1;
  }

  const contributionWeights = provisional
    .sort((left, right) => right.floorShareBps - left.floorShareBps || left.deposit.depositId.localeCompare(right.deposit.depositId))
    .map((entry): SourceToSharesContributionWeight => ({
      depositId: entry.deposit.depositId,
      assetPackId: entry.deposit.assetPackId,
      depositorWalletId: entry.deposit.depositorWalletId,
      measurementRoot: entry.deposit.measurementRoot,
      sourceManifestRoot: entry.deposit.sourceManifestRoot,
      findingFitsResultRoot: entry.deposit.findingFitsResultRoot,
      rawWeight: entry.rawWeight.toString(),
      clippedWeight: entry.clippedWeight.toString(),
      shareBps: entry.floorShareBps,
      normalizationRemainderUnits: entry.remainderUnits.toString(),
      disposition: entry.disposition,
      reasons: [
        `measurementUnits=${entry.deposit.normalizedMeasurementUnits.toString()}`,
        `fitQualityBps=${entry.deposit.fitQualityBps}`,
        `provenanceBps=${entry.deposit.provenanceBps}`,
      ],
    }));

  return {
    contributionWeights,
    normalizationTrace: {
      method: 'largest_remainder',
      totalClippedWeight: totalClippedWeight.toString(),
      normalizedTotalBps: contributionWeights.reduce((sum, entry) => sum + entry.shareBps, 0),
      tieBreakPolicy: 'remainder_desc_weight_desc_deposit_id_asc',
      remainderDistributionOrder: remainderOrder.map((entry) => entry.deposit.depositId),
      provisionalShares: provisional.map((entry) => ({
        depositId: entry.deposit.depositId,
        floorShareBps: entry.floorShareBps - entry.remainderAwardedBps,
        remainderUnits: entry.remainderUnits.toString(),
        remainderAwardedBps: entry.remainderAwardedBps,
        finalShareBps: entry.floorShareBps,
        tieBreakRank: entry.tieBreakRank,
      })),
    },
  };
}

function allocateRangeSlices(input: {
  assetPackId: string;
  fitDeposits: readonly SourceToSharesBoundFitDeposit[];
  contributionWeights: readonly SourceToSharesContributionWeight[];
  rangeStart?: BtdTokenId;
  tokenCount: number;
}): SourceToSharesRangeSlice[] {
  if (input.tokenCount === 0) {
    return input.contributionWeights.map((weight) => ({
      depositId: weight.depositId,
      assetPackId: weight.assetPackId,
      depositorWalletId: weight.depositorWalletId,
      shareBps: weight.shareBps,
      tokenCount: 0,
      sliceState: 'zero_cell_refit_tail',
      sliceRoot: stableProofRoot('source-to-shares-range-slice', [
        input.assetPackId,
        weight.depositId,
        0,
        'zero_cell_refit_tail',
      ]),
    }));
  }

  const provisional = input.contributionWeights.map((weight) => {
    const numerator = BigInt(input.tokenCount) * BigInt(weight.shareBps);
    return {
      weight,
      tokenCount: Number(numerator / MAX_BPS_BIGINT),
      remainderUnits: numerator % MAX_BPS_BIGINT,
      extraTokensAwarded: 0,
    };
  });
  let remaining =
    input.tokenCount - provisional.reduce((sum, entry) => sum + entry.tokenCount, 0);
  for (const entry of [...provisional].sort(compareAllocationRemainders)) {
    if (remaining <= 0) break;
    entry.tokenCount += 1;
    entry.extraTokensAwarded += 1;
    remaining -= 1;
  }

  let cursor = assertNonNegativeSafeInteger(input.rangeStart, 'rangeStart');
  return provisional
    .sort((left, right) => left.weight.depositId.localeCompare(right.weight.depositId))
    .map((entry): SourceToSharesRangeSlice => {
      const rangeStart = entry.tokenCount > 0 ? cursor : undefined;
      const rangeEndExclusive = entry.tokenCount > 0 ? cursor + entry.tokenCount : undefined;
      cursor += entry.tokenCount;
      return {
        depositId: entry.weight.depositId,
        assetPackId: entry.weight.assetPackId,
        depositorWalletId: entry.weight.depositorWalletId,
        shareBps: entry.weight.shareBps,
        tokenCount: entry.tokenCount,
        rangeStart,
        rangeEndExclusive,
        sliceState: entry.tokenCount > 0 ? 'allocated' : 'zero_cell_refit_tail',
        sliceRoot: stableProofRoot('source-to-shares-range-slice', [
          input.assetPackId,
          entry.weight.depositId,
          rangeStart ?? 'zero',
          rangeEndExclusive ?? 'zero',
          entry.tokenCount,
        ]),
      };
    });
}

function allocateSettlementSats(input: {
  fitDeposits: readonly SourceToSharesBoundFitDeposit[];
  contributionWeights: readonly SourceToSharesContributionWeight[];
  grossSats: bigint;
}): SourceToSharesSettlementAllocation[] {
  const provisional = input.contributionWeights.map((weight) => {
    const numerator = input.grossSats * BigInt(weight.shareBps);
    return {
      weight,
      allocatedSats: numerator / MAX_BPS_BIGINT,
      remainderUnits: numerator % MAX_BPS_BIGINT,
      extraSatsAwarded: 0n,
    };
  });
  let remaining =
    input.grossSats - provisional.reduce((sum, entry) => sum + entry.allocatedSats, 0n);
  for (const entry of [...provisional].sort(compareAllocationRemainders)) {
    if (remaining <= 0n) break;
    entry.allocatedSats += 1n;
    entry.extraSatsAwarded += 1n;
    remaining -= 1n;
  }

  return provisional
    .sort((left, right) => left.weight.depositId.localeCompare(right.weight.depositId))
    .map((entry): SourceToSharesSettlementAllocation => ({
      depositId: entry.weight.depositId,
      assetPackId: entry.weight.assetPackId,
      depositorWalletId: entry.weight.depositorWalletId,
      shareBps: entry.weight.shareBps,
      allocatedSats: entry.allocatedSats,
      allocationRemainderUnits: entry.remainderUnits.toString(),
      allocationRoot: stableProofRoot('source-to-shares-settlement-allocation', [
        entry.weight.depositId,
        entry.weight.shareBps,
        entry.allocatedSats.toString(),
      ]),
    }));
}

function buildSettlementConservation(input: {
  proofId: string;
  feeQuote: SourceToSharesProof['feeQuote'];
  paymentObservation: SourceToSharesProof['paymentObservation'];
  settlementAllocations: readonly SourceToSharesSettlementAllocation[];
}): SourceToSharesSettlementConservation {
  const expectedDebitSats = input.feeQuote.grossSats;
  const expectedCreditSats = input.feeQuote.grossSats;
  const observedDebitSats = input.paymentObservation.observedDebitSats;
  const observedCreditSats = input.paymentObservation.observedCreditSats;
  const allocatedCreditSats = input.settlementAllocations.reduce(
    (sum, allocation) => sum + allocation.allocatedSats,
    0n,
  );
  const noOverpaymentPassed =
    observedDebitSats <= expectedDebitSats && observedCreditSats <= expectedCreditSats;
  const noUnderpaymentPassed =
    observedDebitSats >= expectedDebitSats && observedCreditSats >= expectedCreditSats;
  const allocationConserved = allocatedCreditSats === expectedCreditSats;
  const state = deriveConservationState({ noOverpaymentPassed, noUnderpaymentPassed, allocationConserved });
  const blockerReasons = [
    noOverpaymentPassed ? null : 'observed payment or credit exceeds accepted BTC fee quote',
    noUnderpaymentPassed ? null : 'observed payment or credit is below accepted BTC fee quote',
    allocationConserved ? null : 'allocated source-to-shares credits do not conserve gross sats',
  ].filter((reason): reason is string => Boolean(reason));
  const conservationRoot = stableProofRoot('source-to-shares-settlement-conservation', [
    input.proofId,
    input.feeQuote.quoteRoot,
    input.paymentObservation.paymentReceiptRoot,
    expectedDebitSats.toString(),
    observedDebitSats.toString(),
    expectedCreditSats.toString(),
    observedCreditSats.toString(),
    allocatedCreditSats.toString(),
    state,
  ]);

  return {
    state,
    expectedDebitSats,
    observedDebitSats,
    expectedCreditSats,
    observedCreditSats,
    allocatedCreditSats,
    noOverpayment: {
      theoremId: 'settlement_source_to_shares.no_overpayment',
      passed: noOverpaymentPassed,
      expectedSats: expectedDebitSats,
      observedSats: observedDebitSats > observedCreditSats ? observedDebitSats : observedCreditSats,
      summary: noOverpaymentPassed
        ? 'Observed debit and credit do not exceed the accepted BTC fee quote.'
        : 'Observed debit or credit exceeds the accepted BTC fee quote.',
    },
    noUnderpayment: {
      theoremId: 'settlement_source_to_shares.no_underpayment',
      passed: noUnderpaymentPassed,
      expectedSats: expectedDebitSats,
      observedSats: observedDebitSats < observedCreditSats ? observedDebitSats : observedCreditSats,
      summary: noUnderpaymentPassed
        ? 'Observed debit and credit satisfy the accepted BTC fee quote.'
        : 'Observed debit or credit is below the accepted BTC fee quote.',
    },
    allocationConserved,
    settlementAdmissible: state === 'balanced',
    blockerReasons,
    conservationRoot,
    reconciliationCheck: {
      checkId: input.proofId,
      expectedDebitSats: toSafeIntegerSats(expectedDebitSats, 'expectedDebitSats'),
      observedDebitSats: toSafeIntegerSats(observedDebitSats, 'observedDebitSats'),
      expectedCreditSats: toSafeIntegerSats(expectedCreditSats, 'expectedCreditSats'),
      observedCreditSats: toSafeIntegerSats(observedCreditSats, 'observedCreditSats'),
      feeQuoteRoot: input.feeQuote.quoteRoot,
      paymentReceiptRoot: input.paymentObservation.paymentReceiptRoot,
    },
  };
}

function buildZeroCellRefitTail(input: {
  btdRange: ReturnType<typeof normalizeBtdRange>;
  rangeSlices: readonly SourceToSharesRangeSlice[];
  fitDeposits: readonly SourceToSharesBoundFitDeposit[];
}): SourceToSharesZeroCellRefitTail {
  const zeroCellDepositIds = input.rangeSlices
    .filter((slice) => slice.sliceState === 'zero_cell_refit_tail')
    .map((slice) => slice.depositId);
  const state = zeroCellDepositIds.length ? 'zero_cell_refit_tail' : 'no_zero_cell_tail';
  const tailRoot = stableProofRoot('source-to-shares-zero-cell-refit-tail', [
    input.btdRange.assetPackId,
    input.btdRange.tokenCount,
    input.btdRange.zeroCellReason ?? null,
    input.btdRange.measureMintReceiptRoot ?? null,
    zeroCellDepositIds,
  ]);

  return {
    tailPolicy: 'zero_cell_receipt_then_refit_only',
    state,
    rangeTokenCount: input.btdRange.tokenCount,
    zeroCellReason: input.btdRange.zeroCellReason,
    measureMintReceiptRoot: input.btdRange.measureMintReceiptRoot,
    zeroCellDepositIds,
    refitRequired: state === 'zero_cell_refit_tail',
    tailRoot,
  };
}

function buildAncestryEvidence(
  receipt?: BtdAncestryReviewReceipt | null,
): SourceToSharesAncestryEvidence {
  if (!receipt) {
    return {
      state: 'not_provided',
      reviewRoot: stableProofRoot('source-to-shares-ancestry', ['not-provided']),
      payableEdgeCount: 0,
      recordedUnpaidEdgeCount: 0,
      rejectedEdgeCount: 0,
      payableRouteWeight: '0',
    };
  }

  const payableRouteWeight = receipt.edges
    .filter((edge) => edge.status === 'payable')
    .reduce((sum, edge) => sum + toBigIntAmount(edge.routeWeight, 'routeWeight'), 0n);
  return {
    state: 'reviewed',
    reviewId: assertNonEmptyString(receipt.reviewId, 'ancestryReview.reviewId'),
    reviewRoot: stableProofRoot('source-to-shares-ancestry', [
      receipt.reviewId,
      receipt.childAssetPackId,
      receipt.payableEdgeCount,
      receipt.recordedUnpaidEdgeCount,
      receipt.rejectedEdgeCount,
      payableRouteWeight.toString(),
    ]),
    payableEdgeCount: receipt.payableEdgeCount,
    recordedUnpaidEdgeCount: receipt.recordedUnpaidEdgeCount,
    rejectedEdgeCount: receipt.rejectedEdgeCount,
    payableRouteWeight: payableRouteWeight.toString(),
  };
}

function deriveConservationState(input: {
  noOverpaymentPassed: boolean;
  noUnderpaymentPassed: boolean;
  allocationConserved: boolean;
}): SourceToSharesSettlementConservationState {
  if (input.noOverpaymentPassed && input.noUnderpaymentPassed && input.allocationConserved) {
    return 'balanced';
  }
  if (!input.noOverpaymentPassed && input.noUnderpaymentPassed) return 'overpayment';
  if (input.noOverpaymentPassed && !input.noUnderpaymentPassed) return 'underpayment';
  return 'drifted';
}

function compareShareRemainders(
  left: {
    deposit: SourceToSharesBoundFitDeposit;
    clippedWeight: bigint;
    remainderUnits: bigint;
  },
  right: {
    deposit: SourceToSharesBoundFitDeposit;
    clippedWeight: bigint;
    remainderUnits: bigint;
  },
): number {
  if (left.remainderUnits !== right.remainderUnits) {
    return left.remainderUnits > right.remainderUnits ? -1 : 1;
  }
  if (left.clippedWeight !== right.clippedWeight) {
    return left.clippedWeight > right.clippedWeight ? -1 : 1;
  }
  return left.deposit.depositId.localeCompare(right.deposit.depositId);
}

function compareAllocationRemainders(
  left: { weight: SourceToSharesContributionWeight; remainderUnits: bigint },
  right: { weight: SourceToSharesContributionWeight; remainderUnits: bigint },
): number {
  if (left.remainderUnits !== right.remainderUnits) {
    return left.remainderUnits > right.remainderUnits ? -1 : 1;
  }
  if (left.weight.shareBps !== right.weight.shareBps) {
    return right.weight.shareBps - left.weight.shareBps;
  }
  return left.weight.depositId.localeCompare(right.weight.depositId);
}

function assertBasisPoints(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_BPS) {
    throw new Error(`${label} must be an integer from 0 to 10000.`);
  }

  return value;
}

function toSafeIntegerSats(value: bigint, label: string): number {
  if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`${label} must fit in a non-negative safe integer sat amount.`);
  }
  return Number(value);
}

function stableId(prefix: string, parts: Array<string | number | bigint>): string {
  const hash = createHash('sha256')
    .update(parts.map((part) => String(part)).join('\u001f'))
    .digest('hex')
    .slice(0, 16);
  return `${prefix}_${hash}`;
}

function stableProofRoot(scope: string, value: unknown): string {
  return `btd-proof-root:${scope}:${createHash('sha256').update(stableSerialize(value)).digest('hex')}`;
}

function stableSerialize(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (typeof value === 'bigint') return `${value.toString()}n`;
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}
