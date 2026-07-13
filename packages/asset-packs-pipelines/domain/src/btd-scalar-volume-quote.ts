import { createHash } from 'node:crypto';
import {
  buildSourceToSharesProof,
  type SourceToSharesFitDepositInput,
  type SourceToSharesProof,
} from '@bitcode/btd/source-to-shares';
import type {
  AssetPackSourceSafePreview,
  ReadNeed,
  ReadNeedMeasurementDimension,
  ShareToFeeQuote,
} from './read-need';

export const BTD_SCALAR_VOLUME_QUOTE_SCHEMA = 'bitcode.btd.scalar-volume.quote-conservation' as const;

const BPS_SCALE = 10_000;
const BPS_SCALE_BIGINT = 10_000n;
const VOLUME_SCALE = 1_000_000n;

export type BtdScalarVolumeBlockedReason =
  | 'reviewed_need_required'
  | 'selected_fit_set_required'
  | 'positive_admitted_fit_quality_required'
  | 'need_fit_assetpack_required'
  | 'measurement_weight_policy_required'
  | 'dedupe_proof_root_required'
  | 'source_safe_proof_root_required'
  | 'settlement_bound_quote_required'
  | 'quote_conservation_failed'
  | 'btd_range_conservation_failed'
  | 'source_to_shares_conservation_failed';

export interface BtdScalarVolumeSelectedFitInput {
  depositId?: string | null;
  assetId?: string | null;
  assetPackId?: string | null;
  depositorWalletId?: string | null;
  sourceManifestRoot?: string | null;
  findingFitsResultRoot?: string | null;
  measurementRoot?: string | null;
  normalizedMeasurementUnits?: bigint | number | string | null;
  fitQualityBps?: number | null;
  finalScore?: number | null;
  provenanceBps?: number | null;
  accepted?: true;
}

export interface BtdScalarVolumeMeasurementWeightPolicy {
  policyId: 'need-relative-fixed-point-weighted-volume';
  arithmetic: 'fixed-point-integer';
  weightScaleBps: 10_000;
  fitQualityScaleBps: 10_000;
  volumeScale: '1000000';
  requiredWeightBpsTotal: 10_000;
  rounding: 'floor-row-remainder-rooted';
  policyRoot: string;
}

export interface BtdScalarVolumeMeasurementRow {
  dimension: string;
  weightBps: number;
  requestedVolumeUnits: string;
  admittedFitQualityBps: number;
  scalarMicroBtd: string;
  numeratorBeforeScaleDivision: string;
  roundingRemainderUnits: string;
  rowRoot: string;
}

export interface BtdScalarVolumeQuoteAudit {
  quoteRoot: string;
  quoteSats: number;
  expectedSats: number;
  quoteConserved: boolean;
  feeSchedule: ShareToFeeQuote['feeSchedule'];
  finalityState: ShareToFeeQuote['finalityState'];
  auditRoot: string;
}

export interface BtdScalarVolumeRangeProjection {
  tokenCount: number;
  normalizedBitcodeVolume: number;
  rangeStart: number | null;
  rangeEndExclusive: number | null;
  conservedWithScalarVolume: boolean;
  rangeRoot: string;
}

export interface BtdScalarVolumeSourceToSharesReadback {
  proof: SourceToSharesProof;
  sourceToSharesConserved: boolean;
  allocatedSats: string;
  grossSats: string;
  allocatedTokenCount: number;
  rangeTokenCount: number;
  readbackRoot: string;
}

export interface BtdScalarVolumeQuoteConservationProjection {
  schema: typeof BTD_SCALAR_VOLUME_QUOTE_SCHEMA;
  state: 'final_btd_scalar_volume_admissible' | 'final_btd_scalar_volume_blocked';
  blockers: BtdScalarVolumeBlockedReason[];
  depositPotential: {
    state: 'estimate_only_before_need_fit' | 'not_applicable';
    measurementRoot: string | null;
    weightedRequestedVolume: number | null;
    potentialRoot: string | null;
  };
  need: {
    needId: string | null;
    reviewState: string | null;
    accepted: boolean;
    measurementRoot: string | null;
    acceptanceRoot: string | null;
  };
  selectedFitSet: {
    fitDepositAssetIds: string[];
    selectedCandidateAssetIds: string[];
    admittedFitQualityBps: number;
    findingFitsResultRoot: string | null;
    dedupeProofRoot: string | null;
  };
  needFitAssetPack: {
    assetPackId: string | null;
    previewRoot: string | null;
    sourceSafeProofRoot: string | null;
    sourceManifestRoot: string | null;
  };
  measurementWeightPolicy: BtdScalarVolumeMeasurementWeightPolicy | null;
  measurementRows: BtdScalarVolumeMeasurementRow[];
  scalarVolume: {
    weightedMicroBtd: string;
    weightedAdmittedVolume: number;
    normalizedBitcodeVolume: number;
    scalarVolumeRoot: string;
  };
  quote: BtdScalarVolumeQuoteAudit | null;
  rangeProjection: BtdScalarVolumeRangeProjection | null;
  rightsReceipt: {
    state: 'pending_settlement' | 'rights_receipt_bound';
    rightsReceiptRoot: string | null;
    sourceUnlockAuthorized: boolean;
  };
  sourceToShares: BtdScalarVolumeSourceToSharesReadback | null;
  sourceSafety: {
    sourceSafeMetadataOnly: true;
    protectedSourceVisible: false;
    unpaidAssetPackSourceVisible: false;
    rawProviderResponseVisible: false;
    walletPrivateMaterialVisible: false;
    credentialsSerialized: false;
  };
  roots: {
    measurementRowsRoot: string;
    quoteAuditRoot: string | null;
    rangeRoot: string | null;
    sourceToSharesReadbackRoot: string | null;
    projectionRoot: string;
  };
}

export interface BtdScalarVolumeQuoteConservationInput {
  acceptedNeed?: ReadNeed | null;
  sourceSafePreview?: AssetPackSourceSafePreview | null;
  selectedFits?: BtdScalarVolumeSelectedFitInput[] | null;
  quote?: ShareToFeeQuote | null;
  assetPackId?: string | null;
  needFitAssetPackRoot?: string | null;
  sourceSafeProofRoot?: string | null;
  sourceManifestRoot?: string | null;
  previewRoot?: string | null;
  dedupeProofRoot?: string | null;
  findingFitsResultRoot?: string | null;
  rangeStart?: number | null;
  rangeEndExclusive?: number | null;
  tokenCount?: number | null;
  rightsReceiptRoot?: string | null;
  readerWalletId?: string | null;
  depositorWalletId?: string | null;
  paymentReceiptRoot?: string | null;
  issuedAt?: string;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
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

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function toBps(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number.`);
  }
  return Math.max(0, Math.min(BPS_SCALE, Math.round(value * BPS_SCALE)));
}

function toVolumeUnits(value: number): bigint {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('measurement volume must be a non-negative finite number.');
  }
  return BigInt(Math.round(value * Number(VOLUME_SCALE)));
}

function toSafePositiveInteger(value: unknown, fallback: number): number {
  if (Number.isSafeInteger(value) && Number(value) > 0) return Number(value);
  return fallback;
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((value) => firstString(value)).filter((value): value is string => Boolean(value)))];
}

function buildMeasurementWeightPolicy(vector: readonly ReadNeedMeasurementDimension[]): BtdScalarVolumeMeasurementWeightPolicy | null {
  if (!vector.length) return null;
  const weights = vector.map((measurement) => toBps(measurement.weight, `measurement weight ${measurement.dimension}`));
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightTotal !== BPS_SCALE) return null;
  const withoutRoot = {
    policyId: 'need-relative-fixed-point-weighted-volume' as const,
    arithmetic: 'fixed-point-integer' as const,
    weightScaleBps: BPS_SCALE as 10_000,
    fitQualityScaleBps: BPS_SCALE as 10_000,
    volumeScale: '1000000' as const,
    requiredWeightBpsTotal: BPS_SCALE as 10_000,
    rounding: 'floor-row-remainder-rooted' as const,
    dimensions: vector.map((measurement, index) => ({
      dimension: measurement.dimension,
      weightBps: weights[index],
    })),
  };
  return {
    policyId: withoutRoot.policyId,
    arithmetic: withoutRoot.arithmetic,
    weightScaleBps: withoutRoot.weightScaleBps,
    fitQualityScaleBps: withoutRoot.fitQualityScaleBps,
    volumeScale: withoutRoot.volumeScale,
    requiredWeightBpsTotal: withoutRoot.requiredWeightBpsTotal,
    rounding: withoutRoot.rounding,
    policyRoot: rootOf(withoutRoot),
  };
}

function buildMeasurementRows(input: {
  vector: readonly ReadNeedMeasurementDimension[];
  admittedFitQualityBps: number;
}): BtdScalarVolumeMeasurementRow[] {
  return input.vector.map((measurement) => {
    const weightBps = toBps(measurement.weight, `measurement weight ${measurement.dimension}`);
    const requestedVolumeUnits = toVolumeUnits(measurement.volume);
    const numerator =
      requestedVolumeUnits *
      BigInt(weightBps) *
      BigInt(input.admittedFitQualityBps);
    const denominator = BPS_SCALE_BIGINT * BPS_SCALE_BIGINT;
    const scalarMicroBtd = numerator / denominator;
    const roundingRemainderUnits = numerator % denominator;
    const withoutRoot = {
      dimension: measurement.dimension,
      weightBps,
      requestedVolumeUnits: requestedVolumeUnits.toString(),
      admittedFitQualityBps: input.admittedFitQualityBps,
      scalarMicroBtd: scalarMicroBtd.toString(),
      numeratorBeforeScaleDivision: numerator.toString(),
      roundingRemainderUnits: roundingRemainderUnits.toString(),
    };
    return {
      ...withoutRoot,
      rowRoot: rootOf(withoutRoot),
    };
  });
}

function deriveSelectedFits(input: BtdScalarVolumeQuoteConservationInput): BtdScalarVolumeSelectedFitInput[] {
  if (input.selectedFits !== undefined && input.selectedFits !== null) return [...input.selectedFits];
  const preview = input.sourceSafePreview;
  if (!preview) return [];
  return preview.fit.selectedCandidateAssetIds.map((assetId) => ({
    assetId,
    depositId: assetId,
    assetPackId: preview.assetPackId,
    depositorWalletId: null,
    sourceManifestRoot: preview.roots.sourceManifestRoot,
    findingFitsResultRoot: preview.fit.rankingRoot || preview.fit.queryRoot,
    measurementRoot: preview.need.measurementRoot,
    finalScore: preview.fit.admittedFitQuality,
    fitQualityBps: toBps(preview.fit.admittedFitQuality, 'preview admitted fit quality'),
    accepted: true as const,
  }));
}

function selectedFitIds(selectedFits: readonly BtdScalarVolumeSelectedFitInput[]): string[] {
  return uniqueStrings(selectedFits.map((fit) => firstString(fit.depositId, fit.assetId)));
}

function sourceToSharesFitDeposits(input: {
  selectedFits: readonly BtdScalarVolumeSelectedFitInput[];
  assetPackId: string;
  depositorWalletId: string;
  sourceManifestRoot: string;
  findingFitsResultRoot: string;
  measurementRoot: string;
  admittedFitQualityBps: number;
}): SourceToSharesFitDepositInput[] {
  return input.selectedFits.map((fit, index) => {
    const depositId = firstString(fit.depositId, fit.assetId) || `fit-${index + 1}`;
    const candidateQualityBps =
      Number.isSafeInteger(fit.fitQualityBps) && Number(fit.fitQualityBps) > 0
        ? Number(fit.fitQualityBps)
        : fit.finalScore !== undefined && fit.finalScore !== null
          ? toBps(Number(fit.finalScore), `fit quality ${depositId}`)
          : input.admittedFitQualityBps;
    return {
      depositId,
      assetPackId: firstString(fit.assetPackId) || input.assetPackId,
      depositorWalletId:
        firstString(fit.depositorWalletId) ||
        (index === 0 ? input.depositorWalletId : `${input.depositorWalletId}-${depositId}`),
      sourceManifestRoot: firstString(fit.sourceManifestRoot) || input.sourceManifestRoot,
      findingFitsResultRoot: firstString(fit.findingFitsResultRoot) || input.findingFitsResultRoot,
      measurementRoot: firstString(fit.measurementRoot) || input.measurementRoot,
      normalizedMeasurementUnits:
        fit.normalizedMeasurementUnits !== undefined && fit.normalizedMeasurementUnits !== null
          ? fit.normalizedMeasurementUnits
          : Math.max(1, Math.round(candidateQualityBps)),
      fitQualityBps: Math.max(1, Math.min(BPS_SCALE, candidateQualityBps)),
      provenanceBps:
        Number.isSafeInteger(fit.provenanceBps) && Number(fit.provenanceBps) > 0
          ? Math.min(BPS_SCALE, Number(fit.provenanceBps))
          : BPS_SCALE,
      accepted: true as const,
    };
  });
}

function expectedQuoteSats(input: {
  weightedMicroBtd: bigint;
  feeSchedule: ShareToFeeQuote['feeSchedule'];
}): number {
  const scaledSats =
    (input.weightedMicroBtd * BigInt(input.feeSchedule.satsPerWeightedVolume) + (VOLUME_SCALE / 2n)) /
    VOLUME_SCALE;
  return Math.max(
    input.feeSchedule.minimumSats,
    input.feeSchedule.dustFloorSats,
    Number(scaledSats),
  );
}

export function buildBtdScalarVolumeQuoteConservation(
  input: BtdScalarVolumeQuoteConservationInput,
): BtdScalarVolumeQuoteConservationProjection {
  const preview = input.sourceSafePreview || null;
  const need = input.acceptedNeed || null;
  const quote = input.quote || preview?.feeQuote || null;
  const selectedFits = deriveSelectedFits(input);
  const selectedIds = selectedFitIds(selectedFits);
  const vector = need?.pricingMeasurementInputs.measurementVector || quote?.measurementVector || [];
  const policy = buildMeasurementWeightPolicy(vector);
  const admittedFitQualityBps = quote
    ? toBps(quote.admittedFitQuality, 'admitted fit quality')
    : preview
      ? toBps(preview.fit.admittedFitQuality, 'preview admitted fit quality')
      : 0;
  const measurementRows = policy
    ? buildMeasurementRows({ vector, admittedFitQualityBps })
    : [];
  const weightedMicroBtd = measurementRows.reduce(
    (sum, row) => sum + BigInt(row.scalarMicroBtd),
    0n,
  );
  const weightedAdmittedVolume = Number(weightedMicroBtd) / Number(VOLUME_SCALE);
  const normalizedBitcodeVolume =
    weightedMicroBtd > 0n ? Number((weightedMicroBtd + VOLUME_SCALE - 1n) / VOLUME_SCALE) : 0;
  const assetPackId = firstString(input.assetPackId, preview?.assetPackId);
  const previewRoot = firstString(input.previewRoot, preview?.roots.previewRoot);
  const sourceSafeProofRoot = firstString(input.sourceSafeProofRoot, input.needFitAssetPackRoot, preview?.roots.proofRoot);
  const sourceManifestRoot = firstString(input.sourceManifestRoot, preview?.roots.sourceManifestRoot);
  const findingFitsResultRoot = firstString(
    input.findingFitsResultRoot,
    preview?.fit.rankingRoot,
    preview?.fit.queryRoot,
  );
  const dedupeProofRoot = firstString(input.dedupeProofRoot) || (
    selectedIds.length > 0 && selectedIds.length === new Set(selectedIds).size
      ? rootOf({
          dedupe: 'selected-fit-set',
          needId: need?.needId || null,
          assetPackId,
          selectedIds,
          findingFitsResultRoot,
        })
      : null
  );
  const rangeTokenCount = toSafePositiveInteger(
    input.tokenCount,
    preview?.rangeProjection.tokenCount || Math.max(1, normalizedBitcodeVolume),
  );
  const rangeStart = Number.isSafeInteger(input.rangeStart)
    ? Number(input.rangeStart)
    : Number.isSafeInteger(preview?.rangeProjection.rangeStart)
      ? Number(preview?.rangeProjection.rangeStart)
      : null;
  const rangeEndExclusive = Number.isSafeInteger(input.rangeEndExclusive)
    ? Number(input.rangeEndExclusive)
    : Number.isSafeInteger(preview?.rangeProjection.rangeEndExclusive)
      ? Number(preview?.rangeProjection.rangeEndExclusive)
      : rangeStart === null
        ? null
        : rangeStart + rangeTokenCount;
  const measurementRowsRoot = rootOf({ measurementRows, policyRoot: policy?.policyRoot || null });
  const scalarVolumeRoot = rootOf({
    needId: need?.needId || null,
    measurementRowsRoot,
    weightedMicroBtd: weightedMicroBtd.toString(),
    normalizedBitcodeVolume,
  });
  const quoteAudit = quote && policy
    ? (() => {
        const expectedSats = expectedQuoteSats({
          weightedMicroBtd,
          feeSchedule: quote.feeSchedule,
        });
        const withoutRoot = {
          quoteRoot: quote.quoteRoot,
          quoteSats: quote.sats,
          expectedSats,
          quoteConserved: quote.sats === expectedSats,
          feeSchedule: quote.feeSchedule,
          finalityState: quote.finalityState,
          weightedMicroBtd: weightedMicroBtd.toString(),
          measurementRowsRoot,
        };
        return {
          quoteRoot: withoutRoot.quoteRoot,
          quoteSats: withoutRoot.quoteSats,
          expectedSats: withoutRoot.expectedSats,
          quoteConserved: withoutRoot.quoteConserved,
          feeSchedule: withoutRoot.feeSchedule,
          finalityState: withoutRoot.finalityState,
          auditRoot: rootOf(withoutRoot),
        };
      })()
    : null;
  const rangeProjection = assetPackId
    ? (() => {
        const conservedWithScalarVolume =
          rangeTokenCount === Math.max(1, normalizedBitcodeVolume) &&
          rangeStart !== null &&
          rangeEndExclusive === rangeStart + rangeTokenCount;
        const withoutRoot = {
          assetPackId,
          tokenCount: rangeTokenCount,
          normalizedBitcodeVolume,
          rangeStart,
          rangeEndExclusive,
          conservedWithScalarVolume,
          scalarVolumeRoot,
        };
        return {
          tokenCount: withoutRoot.tokenCount,
          normalizedBitcodeVolume: withoutRoot.normalizedBitcodeVolume,
          rangeStart: withoutRoot.rangeStart,
          rangeEndExclusive: withoutRoot.rangeEndExclusive,
          conservedWithScalarVolume: withoutRoot.conservedWithScalarVolume,
          rangeRoot: rootOf(withoutRoot),
        };
      })()
    : null;
  const blockers: BtdScalarVolumeBlockedReason[] = [];
  if (!need || need.reviewState !== 'accepted') blockers.push('reviewed_need_required');
  if (!selectedIds.length || selectedIds.length !== new Set(selectedIds).size) blockers.push('selected_fit_set_required');
  if (admittedFitQualityBps <= 0) blockers.push('positive_admitted_fit_quality_required');
  if (!assetPackId || !previewRoot) blockers.push('need_fit_assetpack_required');
  if (!policy) blockers.push('measurement_weight_policy_required');
  if (!dedupeProofRoot) blockers.push('dedupe_proof_root_required');
  if (!sourceSafeProofRoot || !sourceManifestRoot) blockers.push('source_safe_proof_root_required');
  if (!quote || !quoteAudit) blockers.push('settlement_bound_quote_required');
  if (quoteAudit && !quoteAudit.quoteConserved) blockers.push('quote_conservation_failed');
  if (rangeProjection && !rangeProjection.conservedWithScalarVolume) blockers.push('btd_range_conservation_failed');

  let sourceToShares: BtdScalarVolumeSourceToSharesReadback | null = null;
  if (
    !blockers.length &&
    assetPackId &&
    need &&
    quote &&
    quoteAudit &&
    rangeProjection &&
    sourceManifestRoot &&
    findingFitsResultRoot
  ) {
    const proof = buildSourceToSharesProof({
      readId: need.needId,
      assetPackId,
      acceptedNeedRoot: need.review?.acceptanceRoot || need.measurementRoot,
      findingFitsResultRoot,
      fitDeposits: sourceToSharesFitDeposits({
        selectedFits,
        assetPackId,
        depositorWalletId: firstString(input.depositorWalletId) || 'depositor-wallet-pending',
        sourceManifestRoot,
        findingFitsResultRoot,
        measurementRoot: need.measurementRoot,
        admittedFitQualityBps,
      }),
      btdRange: {
        assetPackId,
        rangeStart: rangeProjection.rangeStart === null ? undefined : rangeProjection.rangeStart,
        rangeEndExclusive: rangeProjection.rangeEndExclusive === null ? undefined : rangeProjection.rangeEndExclusive,
        tokenCount: rangeProjection.tokenCount,
        rangeRoot: rangeProjection.rangeRoot,
        measureMintReceiptRoot: scalarVolumeRoot,
      },
      feeQuote: {
        quoteId: `quote-${sha256(quote.quoteRoot).slice(0, 16)}`,
        quoteRoot: quote.quoteRoot,
        grossSats: quote.sats,
      },
      paymentObservation: {
        paymentReceiptRoot:
          firstString(input.paymentReceiptRoot) ||
          rootOf({
            quoteRoot: quote.quoteRoot,
            projection: 'settlement-bound-quote-conservation',
          }),
        observedDebitSats: quote.sats,
        observedCreditSats: quote.sats,
        finalityState: 'prepared',
      },
      issuedAt: input.issuedAt,
    });
    const allocatedSats = proof.settlementAllocations.reduce(
      (sum, allocation) => sum + allocation.allocatedSats,
      0n,
    );
    const allocatedTokenCount = proof.rangeSlices.reduce((sum, slice) => sum + slice.tokenCount, 0);
    const sourceToSharesConserved =
      proof.settlementConservation.settlementAdmissible &&
      allocatedSats === proof.feeQuote.grossSats &&
      allocatedTokenCount === proof.zeroCellRefitTail.rangeTokenCount;
    const withoutRoot = {
      proofRoot: proof.proofRoot,
      sourceToSharesConserved,
      allocatedSats: allocatedSats.toString(),
      grossSats: proof.feeQuote.grossSats.toString(),
      allocatedTokenCount,
      rangeTokenCount: proof.zeroCellRefitTail.rangeTokenCount,
    };
    sourceToShares = {
      proof,
      sourceToSharesConserved,
      allocatedSats: withoutRoot.allocatedSats,
      grossSats: withoutRoot.grossSats,
      allocatedTokenCount,
      rangeTokenCount: withoutRoot.rangeTokenCount,
      readbackRoot: rootOf(withoutRoot),
    };
    if (!sourceToSharesConserved) blockers.push('source_to_shares_conservation_failed');
  }

  const depositPotential = need
    ? {
        state: 'estimate_only_before_need_fit' as const,
        measurementRoot: need.measurementRoot,
        weightedRequestedVolume: need.pricingMeasurementInputs.weightedRequestedVolume,
        potentialRoot: rootOf({
          needId: need.needId,
          measurementRoot: need.measurementRoot,
          weightedRequestedVolume: need.pricingMeasurementInputs.weightedRequestedVolume,
          estimateOnly: true,
        }),
      }
    : {
        state: 'not_applicable' as const,
        measurementRoot: null,
        weightedRequestedVolume: null,
        potentialRoot: null,
      };
  const rightsReceiptRoot = firstString(input.rightsReceiptRoot);
  const state = blockers.length
    ? 'final_btd_scalar_volume_blocked' as const
    : 'final_btd_scalar_volume_admissible' as const;
  const withoutProjectionRoot = {
    schema: BTD_SCALAR_VOLUME_QUOTE_SCHEMA,
    state,
    blockers,
    needId: need?.needId || null,
    selectedIds,
    assetPackId,
    measurementRowsRoot,
    scalarVolumeRoot,
    quoteAuditRoot: quoteAudit?.auditRoot || null,
    rangeRoot: rangeProjection?.rangeRoot || null,
    sourceToSharesReadbackRoot: sourceToShares?.readbackRoot || null,
  };

  return {
    schema: BTD_SCALAR_VOLUME_QUOTE_SCHEMA,
    state,
    blockers,
    depositPotential,
    need: {
      needId: need?.needId || null,
      reviewState: need?.reviewState || null,
      accepted: need?.reviewState === 'accepted',
      measurementRoot: need?.measurementRoot || null,
      acceptanceRoot: need?.review?.acceptanceRoot || null,
    },
    selectedFitSet: {
      fitDepositAssetIds: selectedIds,
      selectedCandidateAssetIds: selectedIds,
      admittedFitQualityBps,
      findingFitsResultRoot,
      dedupeProofRoot,
    },
    needFitAssetPack: {
      assetPackId,
      previewRoot,
      sourceSafeProofRoot,
      sourceManifestRoot,
    },
    measurementWeightPolicy: policy,
    measurementRows,
    scalarVolume: {
      weightedMicroBtd: weightedMicroBtd.toString(),
      weightedAdmittedVolume,
      normalizedBitcodeVolume,
      scalarVolumeRoot,
    },
    quote: quoteAudit,
    rangeProjection,
    rightsReceipt: {
      state: rightsReceiptRoot ? 'rights_receipt_bound' : 'pending_settlement',
      rightsReceiptRoot,
      sourceUnlockAuthorized: Boolean(rightsReceiptRoot),
    },
    sourceToShares,
    sourceSafety: {
      sourceSafeMetadataOnly: true,
      protectedSourceVisible: false,
      unpaidAssetPackSourceVisible: false,
      rawProviderResponseVisible: false,
      walletPrivateMaterialVisible: false,
      credentialsSerialized: false,
    },
    roots: {
      measurementRowsRoot,
      quoteAuditRoot: quoteAudit?.auditRoot || null,
      rangeRoot: rangeProjection?.rangeRoot || null,
      sourceToSharesReadbackRoot: sourceToShares?.readbackRoot || null,
      projectionRoot: rootOf(withoutProjectionRoot),
    },
  };
}

export function assertFinalBtdScalarVolumeAdmissible(
  projection: BtdScalarVolumeQuoteConservationProjection,
): BtdScalarVolumeQuoteConservationProjection {
  if (projection.schema !== BTD_SCALAR_VOLUME_QUOTE_SCHEMA) {
    throw new Error('Invalid BTD scalar-volume quote-conservation projection schema.');
  }
  if (projection.state !== 'final_btd_scalar_volume_admissible' || projection.blockers.length) {
    throw new Error(
      `Final BTD scalar volume is not admissible: ${projection.blockers.join('; ')}`,
    );
  }
  if (!projection.quote?.quoteConserved) {
    throw new Error('Final BTD scalar volume requires conserved settlement-bound quote sats.');
  }
  if (!projection.rangeProjection?.conservedWithScalarVolume) {
    throw new Error('Final BTD scalar volume requires BTD range conservation.');
  }
  if (!projection.sourceToShares?.sourceToSharesConserved) {
    throw new Error('Final BTD scalar volume requires source-to-shares conservation.');
  }
  return projection;
}
