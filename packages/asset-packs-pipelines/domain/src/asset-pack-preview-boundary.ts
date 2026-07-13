import { createHash } from 'node:crypto';
import {
  assertAssetPackDisclosureSourceSafe,
  buildAssetPackDisclosureReview,
  reviewAssetPackProtectedSourceLeakage,
  type AssetPackDisclosureReview,
} from './asset-pack-disclosure';
import type { DepositoryFitResultEvidence } from './depository-search';
import {
  buildAssetPackSourceSafePreview,
  isAcceptedReadNeed,
  type AssetPackSourceSafePreview,
  type ReadNeed,
  type ShareToFeeQuote,
} from './read-need';

export type AssetPackPreviewStorageRecordKind =
  | 'source_safe_preview'
  | 'fit_measurement_preview'
  | 'selected_fit_provenance'
  | 'deterministic_btc_quote'
  | 'disclosure_review'
  | 'settlement_instructions'
  | 'delivery_posture'
  | 'replay_receipt'
  | 'repair_posture';

export type AssetPackPreviewRepairAction =
  | 'accept_read_need'
  | 'run_read_fits_finding'
  | 'adjust_need_constraints_or_thresholds'
  | 'repair_preview_leakage'
  | 'prepare_reader_wallet_payment'
  | 'continue_to_settlement';

export interface AssetPackPreviewBoundarySourceSafety {
  sourceSafetyClass: 'source_safe_assetpack_preview_quote_boundary';
  sourceSafeMetadataOnly: true;
  protectedSourceVisible: false;
  rawProtectedPromptVisible: false;
  rawProviderResponseVisible: false;
  unpaidAssetPackSourceVisible: false;
  walletPrivateMaterialVisible: false;
  settlementPrivatePayloadVisible: false;
  credentialsSerialized: false;
}

export interface AssetPackPreviewQuoteReceipt {
  schema: 'bitcode.asset-pack.preview.quote-receipt';
  quoteId: string;
  deterministic: true;
  formula: ShareToFeeQuote['formula'];
  needId: string;
  needMeasurementRoot: string;
  measurementVector: ShareToFeeQuote['measurementVector'];
  admittedFitQuality: number;
  weightedRequestedVolume: number;
  weightedAdmittedVolume: number;
  sats: number;
  feeSchedule: ShareToFeeQuote['feeSchedule'];
  finalityState: ShareToFeeQuote['finalityState'];
  payer: ShareToFeeQuote['payer'];
  quoteRoot: string;
  receiptRoot: string;
}

export interface AssetPackPreviewSelectedFitProvenance {
  schema: 'bitcode.asset-pack.preview.selected-fit-provenance';
  resultState: string;
  selectedCandidateAssetIds: string[];
  fitDepositAssetIds: string[];
  queryRoot: string | null;
  rankingRoot: string | null;
  selectedCandidates: Array<{
    assetId: string;
    finalScore: number;
    semanticScore: number;
    proofRoot: string | null;
    measurementRoot: string | null;
    reconciliationReadbackRoot: string | null;
  }>;
  provenanceRoot: string;
}

export interface AssetPackPreviewSettlementInstructions {
  schema: 'bitcode.asset-pack.preview.settlement-instructions';
  state: 'quote_ready_settlement_required' | 'blocked_until_worthy_fit';
  payer: 'reader';
  payee: 'depositor';
  btcNetwork: 'testnet' | 'mainnet' | 'signet' | 'regtest';
  sats: number;
  quoteRoot: string;
  serverCustody: false;
  btcFeeOperation: 'reader_wallet_authorized_before_broadcast';
  settlementRequiredBeforeUnlock: true;
  requiredReadbacksBeforeUnlock: string[];
  forbiddenBeforeSettlement: string[];
  instructionsRoot: string;
}

export interface AssetPackPreviewDeliveryPosture {
  schema: 'bitcode.asset-pack.preview.delivery-posture';
  state: 'withheld_until_settlement' | 'blocked_until_worthy_fit' | 'available_after_settlement';
  deliveryMechanism: 'pull_request_after_settlement';
  pullRequestTarget: string | null;
  sourceBearingDeliveryVisible: false;
  availableAfterSettlement: true;
  blockerCodes: string[];
  deliveryRoot: string;
}

export interface AssetPackPreviewRepairPosture {
  schema: 'bitcode.asset-pack.preview.repair-posture';
  blockers: string[];
  warnings: string[];
  nextActions: AssetPackPreviewRepairAction[];
  repairRoot: string;
}

export interface AssetPackPreviewStorageRecord {
  schema: 'bitcode.asset-pack.preview.storage-record';
  recordId: string;
  recordKind: AssetPackPreviewStorageRecordKind;
  namespace: string;
  key: string;
  root: string;
  sourceSafety: AssetPackPreviewBoundarySourceSafety;
  payload: Record<string, unknown>;
}

export interface AssetPackPreviewReplayReceipt {
  schema: 'bitcode.asset-pack.preview.replay-receipt';
  replayMode: 'source-safe-preview-quote-disclosure-boundary-replay';
  assetPackId: string;
  previewRoot: string;
  quoteRoot: string;
  disclosureReviewRoot: string;
  selectedFitProvenanceRoot: string;
  settlementInstructionsRoot: string;
  deliveryPostureRoot: string;
  storageRoot: string;
  replayRoot: string;
  verified: {
    quoteRootMatchesPreview: boolean;
    disclosureReviewRootMatchesReview: boolean;
    sourceManifestWithheldBeforeSettlement: boolean;
    settlementRequiresReaderPayment: boolean;
    deliveryWithheldUntilSettlement: boolean;
    protectedSourceLeakageAbsent: boolean;
  };
}

export interface AssetPackPreviewBoundary {
  schema: 'bitcode.asset-pack.preview-boundary';
  boundaryId: string;
  assetPackId: string;
  sourceSafePreview: AssetPackSourceSafePreview;
  selectedFitProvenance: AssetPackPreviewSelectedFitProvenance;
  quoteReceipt: AssetPackPreviewQuoteReceipt;
  disclosureReview: AssetPackDisclosureReview;
  settlementInstructions: AssetPackPreviewSettlementInstructions;
  deliveryPosture: AssetPackPreviewDeliveryPosture;
  storageProjection: AssetPackPreviewStorageRecord[];
  replayReceipt: AssetPackPreviewReplayReceipt;
  repairPosture: AssetPackPreviewRepairPosture;
  sourceSafety: AssetPackPreviewBoundarySourceSafety;
  proofRoots: {
    previewRoot: string;
    quoteRoot: string;
    disclosureReviewRoot: string;
    selectedFitProvenanceRoot: string;
    settlementInstructionsRoot: string;
    deliveryPostureRoot: string;
    storageRoot: string;
    replayRoot: string;
    boundaryRoot: string;
  };
}

const SOURCE_SAFETY: AssetPackPreviewBoundarySourceSafety = {
  sourceSafetyClass: 'source_safe_assetpack_preview_quote_boundary',
  sourceSafeMetadataOnly: true,
  protectedSourceVisible: false,
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

function recordId(kind: AssetPackPreviewStorageRecordKind, key: string, root: string): string {
  return `asset-pack-preview-${kind}-${sha256(`${key}:${root}`).slice(0, 16)}`;
}

function sourceSafeStorageRecord(
  recordKind: AssetPackPreviewStorageRecordKind,
  namespace: string,
  key: string,
  payload: Record<string, unknown>,
): AssetPackPreviewStorageRecord {
  const root = rootOf({ recordKind, namespace, key, payload });
  return {
    schema: 'bitcode.asset-pack.preview.storage-record',
    recordId: recordId(recordKind, `${namespace}:${key}`, root),
    recordKind,
    namespace,
    key,
    root,
    sourceSafety: SOURCE_SAFETY,
    payload,
  };
}

function quoteReceiptFor(preview: AssetPackSourceSafePreview): AssetPackPreviewQuoteReceipt {
  const quote = preview.feeQuote;
  const withoutRoot = {
    schema: 'bitcode.asset-pack.preview.quote-receipt' as const,
    quoteId: `quote-${sha256(quote.quoteRoot).slice(0, 16)}`,
    deterministic: true as const,
    formula: quote.formula,
    needId: quote.needId,
    needMeasurementRoot: quote.needMeasurementRoot,
    measurementVector: quote.measurementVector,
    admittedFitQuality: quote.admittedFitQuality,
    weightedRequestedVolume: preview.measurements.weightedRequestedVolume,
    weightedAdmittedVolume: quote.weightedAdmittedVolume,
    sats: quote.sats,
    feeSchedule: quote.feeSchedule,
    finalityState: quote.finalityState,
    payer: quote.payer,
    quoteRoot: quote.quoteRoot,
  };

  return {
    ...withoutRoot,
    receiptRoot: rootOf(withoutRoot),
  };
}

function selectedFitProvenanceFor(
  preview: AssetPackSourceSafePreview,
  fitResult?: DepositoryFitResultEvidence | null,
): AssetPackPreviewSelectedFitProvenance {
  const selectedCandidates = (fitResult?.selectionTrace?.selectedCandidates || []).map((candidate) => ({
    assetId: candidate.assetId,
    finalScore: candidate.scores.finalScore,
    semanticScore: candidate.scores.semanticScore,
    proofRoot: candidate.proofEvidence?.proofRoot || null,
    measurementRoot: candidate.measurementEvidence?.measurementRoot || null,
    reconciliationReadbackRoot: candidate.readbackEvidence?.reconciliationReadbackRoot || null,
  }));
  const withoutRoot = {
    schema: 'bitcode.asset-pack.preview.selected-fit-provenance' as const,
    resultState: fitResult?.resultState || preview.fit.resultState,
    selectedCandidateAssetIds: [...preview.fit.selectedCandidateAssetIds],
    fitDepositAssetIds: [...preview.fit.fitDepositAssetIds],
    queryRoot: preview.fit.queryRoot,
    rankingRoot: preview.fit.rankingRoot,
    selectedCandidates,
  };

  return {
    ...withoutRoot,
    provenanceRoot: rootOf(withoutRoot),
  };
}

function settlementInstructionsFor(
  preview: AssetPackSourceSafePreview,
  btcNetwork: AssetPackPreviewSettlementInstructions['btcNetwork'],
): AssetPackPreviewSettlementInstructions {
  const withoutRoot = {
    schema: 'bitcode.asset-pack.preview.settlement-instructions' as const,
    state: preview.fit.resultState === 'worthy_fit'
      ? 'quote_ready_settlement_required' as const
      : 'blocked_until_worthy_fit' as const,
    payer: 'reader' as const,
    payee: 'depositor' as const,
    btcNetwork,
    sats: preview.feeQuote.sats,
    quoteRoot: preview.feeQuote.quoteRoot,
    serverCustody: false as const,
    btcFeeOperation: 'reader_wallet_authorized_before_broadcast' as const,
    settlementRequiredBeforeUnlock: true as const,
    requiredReadbacksBeforeUnlock: [
      'btc_fee_payment_receipt',
      'settlement_finality_receipt',
      'btd_rights_transfer_receipt',
      'ledger_database_storage_reconciliation',
    ],
    forbiddenBeforeSettlement: [
      'protected source content',
      'full AssetPack patch',
      'source-bearing manifest entries',
      'licensed read payload',
    ],
  };

  return {
    ...withoutRoot,
    instructionsRoot: rootOf(withoutRoot),
  };
}

function deliveryPostureFor(preview: AssetPackSourceSafePreview): AssetPackPreviewDeliveryPosture {
  const blockerCodes = [
    ...(preview.fit.resultState === 'worthy_fit' ? [] : ['worthy_fit_missing']),
    'btc_fee_unpaid',
    'btd_rights_transfer_missing',
  ];
  const withoutRoot = {
    schema: 'bitcode.asset-pack.preview.delivery-posture' as const,
    state: preview.fit.resultState === 'worthy_fit'
      ? 'withheld_until_settlement' as const
      : 'blocked_until_worthy_fit' as const,
    deliveryMechanism: 'pull_request_after_settlement' as const,
    pullRequestTarget: preview.delivery.pullRequestTarget,
    sourceBearingDeliveryVisible: false as const,
    availableAfterSettlement: true as const,
    blockerCodes,
  };

  return {
    ...withoutRoot,
    deliveryRoot: rootOf(withoutRoot),
  };
}

function repairPostureFor(input: {
  acceptedNeed: boolean;
  preview: AssetPackSourceSafePreview;
  disclosureReview: AssetPackDisclosureReview;
}): AssetPackPreviewRepairPosture {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const nextActions: AssetPackPreviewRepairAction[] = [];

  if (!input.acceptedNeed) {
    blockers.push('accepted_read_need_missing');
    nextActions.push('accept_read_need');
  }
  if (input.preview.fit.resultState !== 'worthy_fit') {
    blockers.push('worthy_fit_missing');
    nextActions.push('run_read_fits_finding', 'adjust_need_constraints_or_thresholds');
  }
  if (input.disclosureReview.sourceLeakage.protectedSourceDetected) {
    blockers.push('protected_source_leakage_detected');
    nextActions.push('repair_preview_leakage');
  }
  if (!input.preview.delivery.pullRequestTarget) {
    warnings.push('pull_request_target_not_yet_bound');
  }
  if (!blockers.length) {
    nextActions.push('prepare_reader_wallet_payment', 'continue_to_settlement');
  }

  const withoutRoot = {
    schema: 'bitcode.asset-pack.preview.repair-posture' as const,
    blockers,
    warnings,
    nextActions,
  };

  return {
    ...withoutRoot,
    repairRoot: rootOf(withoutRoot),
  };
}

function storageProjectionFor(input: {
  preview: AssetPackSourceSafePreview;
  provenance: AssetPackPreviewSelectedFitProvenance;
  quoteReceipt: AssetPackPreviewQuoteReceipt;
  disclosureReview: AssetPackDisclosureReview;
  settlementInstructions: AssetPackPreviewSettlementInstructions;
  deliveryPosture: AssetPackPreviewDeliveryPosture;
  repairPosture: AssetPackPreviewRepairPosture;
}): AssetPackPreviewStorageRecord[] {
  return [
    sourceSafeStorageRecord('source_safe_preview', 'asset-pack/preview', 'sourceSafe', input.preview as unknown as Record<string, unknown>),
    sourceSafeStorageRecord('fit_measurement_preview', 'asset-pack/preview', 'fitMeasurements', {
      fit: input.preview.fit,
      measurements: input.preview.measurements,
      roots: input.preview.roots,
    }),
    sourceSafeStorageRecord('selected_fit_provenance', 'asset-pack/preview', 'selectedFitProvenance', input.provenance as unknown as Record<string, unknown>),
    sourceSafeStorageRecord('deterministic_btc_quote', 'asset-pack/preview', 'quoteReceipt', input.quoteReceipt as unknown as Record<string, unknown>),
    sourceSafeStorageRecord('disclosure_review', 'asset-pack/preview', 'disclosureReview', input.disclosureReview as unknown as Record<string, unknown>),
    sourceSafeStorageRecord('settlement_instructions', 'asset-pack/preview', 'settlementInstructions', input.settlementInstructions as unknown as Record<string, unknown>),
    sourceSafeStorageRecord('delivery_posture', 'asset-pack/preview', 'deliveryPosture', input.deliveryPosture as unknown as Record<string, unknown>),
    sourceSafeStorageRecord('repair_posture', 'asset-pack/preview', 'repairPosture', input.repairPosture as unknown as Record<string, unknown>),
  ];
}

function replayReceiptFor(input: {
  preview: AssetPackSourceSafePreview;
  quoteReceipt: AssetPackPreviewQuoteReceipt;
  disclosureReview: AssetPackDisclosureReview;
  provenance: AssetPackPreviewSelectedFitProvenance;
  settlementInstructions: AssetPackPreviewSettlementInstructions;
  deliveryPosture: AssetPackPreviewDeliveryPosture;
  storageRoot: string;
}): AssetPackPreviewReplayReceipt {
  const verified = {
    quoteRootMatchesPreview: input.quoteReceipt.quoteRoot === input.preview.feeQuote.quoteRoot,
    disclosureReviewRootMatchesReview: input.disclosureReview.roots.reviewRoot.startsWith('sha256:'),
    sourceManifestWithheldBeforeSettlement: input.preview.disclosurePolicy.withheldBeforeSettlement.includes('source-bearing manifest entries'),
    settlementRequiresReaderPayment:
      input.settlementInstructions.payer === 'reader' &&
      input.settlementInstructions.settlementRequiredBeforeUnlock === true &&
      input.settlementInstructions.serverCustody === false,
    deliveryWithheldUntilSettlement:
      input.deliveryPosture.sourceBearingDeliveryVisible === false &&
      input.deliveryPosture.availableAfterSettlement === true,
    protectedSourceLeakageAbsent: input.disclosureReview.sourceLeakage.protectedSourceDetected === false,
  };
  const withoutRoot = {
    schema: 'bitcode.asset-pack.preview.replay-receipt' as const,
    replayMode: 'source-safe-preview-quote-disclosure-boundary-replay' as const,
    assetPackId: input.preview.assetPackId,
    previewRoot: input.preview.roots.previewRoot,
    quoteRoot: input.quoteReceipt.quoteRoot,
    disclosureReviewRoot: input.disclosureReview.roots.reviewRoot,
    selectedFitProvenanceRoot: input.provenance.provenanceRoot,
    settlementInstructionsRoot: input.settlementInstructions.instructionsRoot,
    deliveryPostureRoot: input.deliveryPosture.deliveryRoot,
    storageRoot: input.storageRoot,
    verified,
  };

  return {
    ...withoutRoot,
    replayRoot: rootOf(withoutRoot),
  };
}

export function buildAssetPackPreviewBoundary(input: {
  need?: ReadNeed | null;
  fitResult?: DepositoryFitResultEvidence | null;
  sourceSafePreview?: AssetPackSourceSafePreview | null;
  assetPackId?: string | null;
  pullRequestTarget?: string | null;
  createdAt?: string;
  btcNetwork?: AssetPackPreviewSettlementInstructions['btcNetwork'];
}): AssetPackPreviewBoundary {
  if (!input.sourceSafePreview && !input.need) {
    throw new Error('AssetPack preview boundary requires a source-safe preview or ReadNeed.');
  }
  const preview = input.sourceSafePreview || buildAssetPackSourceSafePreview({
    need: input.need!,
    fitResult: input.fitResult,
    assetPackId: input.assetPackId,
    pullRequestTarget: input.pullRequestTarget,
    createdAt: input.createdAt,
  });
  const disclosureReview = buildAssetPackDisclosureReview({ preview });
  assertAssetPackDisclosureSourceSafe(disclosureReview);
  const provenance = selectedFitProvenanceFor(preview, input.fitResult);
  const quoteReceipt = quoteReceiptFor(preview);
  const settlementInstructions = settlementInstructionsFor(preview, input.btcNetwork || 'testnet');
  const deliveryPosture = deliveryPostureFor(preview);
  const repairPosture = repairPostureFor({
    acceptedNeed: isAcceptedReadNeed(input.need) || preview.need.reviewState === 'accepted',
    preview,
    disclosureReview,
  });
  const baseStorageProjection = storageProjectionFor({
    preview,
    provenance,
    quoteReceipt,
    disclosureReview,
    settlementInstructions,
    deliveryPosture,
    repairPosture,
  });
  const storageRoot = rootOf(baseStorageProjection.map((record) => record.root));
  const replayReceipt = replayReceiptFor({
    preview,
    quoteReceipt,
    disclosureReview,
    provenance,
    settlementInstructions,
    deliveryPosture,
    storageRoot,
  });
  const replayRecord = sourceSafeStorageRecord('replay_receipt', 'asset-pack/preview', 'replayReceipt', replayReceipt as unknown as Record<string, unknown>);
  const storageProjection = [...baseStorageProjection, replayRecord];
  const boundaryWithoutRoot = {
    schema: 'bitcode.asset-pack.preview-boundary' as const,
    assetPackId: preview.assetPackId,
    previewRoot: preview.roots.previewRoot,
    quoteRoot: quoteReceipt.quoteRoot,
    disclosureReviewRoot: disclosureReview.roots.reviewRoot,
    selectedFitProvenanceRoot: provenance.provenanceRoot,
    settlementInstructionsRoot: settlementInstructions.instructionsRoot,
    deliveryPostureRoot: deliveryPosture.deliveryRoot,
    storageRoot,
    replayRoot: replayReceipt.replayRoot,
    sourceSafety: SOURCE_SAFETY,
  };
  const boundaryRoot = rootOf(boundaryWithoutRoot);
  const boundary: AssetPackPreviewBoundary = {
    schema: 'bitcode.asset-pack.preview-boundary',
    boundaryId: `asset-pack-preview-boundary-${sha256(boundaryRoot).slice(0, 16)}`,
    assetPackId: preview.assetPackId,
    sourceSafePreview: preview,
    selectedFitProvenance: provenance,
    quoteReceipt,
    disclosureReview,
    settlementInstructions,
    deliveryPosture,
    storageProjection,
    replayReceipt,
    repairPosture,
    sourceSafety: SOURCE_SAFETY,
    proofRoots: {
      previewRoot: preview.roots.previewRoot,
      quoteRoot: quoteReceipt.quoteRoot,
      disclosureReviewRoot: disclosureReview.roots.reviewRoot,
      selectedFitProvenanceRoot: provenance.provenanceRoot,
      settlementInstructionsRoot: settlementInstructions.instructionsRoot,
      deliveryPostureRoot: deliveryPosture.deliveryRoot,
      storageRoot,
      replayRoot: replayReceipt.replayRoot,
      boundaryRoot,
    },
  };
  const leakage = reviewAssetPackProtectedSourceLeakage(boundary);
  if (leakage.protectedSourceDetected) {
    throw new Error(`AssetPack preview boundary leaked protected source at ${leakage.findings.map((finding) => finding.path).join(', ')}.`);
  }
  return boundary;
}

export function persistAssetPackPreviewBoundary(
  execution: { store?: (namespace: string, key: string, value: unknown) => unknown } | null | undefined,
  boundary: AssetPackPreviewBoundary,
): AssetPackPreviewBoundary {
  try {
    execution?.store?.('asset-pack/preview', 'boundary', boundary as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/preview', 'boundaryRoot', boundary.proofRoots.boundaryRoot);
    execution?.store?.('asset-pack/preview', 'quoteReceipt', boundary.quoteReceipt as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/preview', 'settlementInstructions', boundary.settlementInstructions as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/preview', 'deliveryPosture', boundary.deliveryPosture as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/preview', 'selectedFitProvenance', boundary.selectedFitProvenance as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/preview', 'replayReceipt', boundary.replayReceipt as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/preview', 'repairPosture', boundary.repairPosture as unknown as Record<string, unknown>);
    execution?.store?.('asset-pack/preview', 'storageProjection', boundary.storageProjection as unknown as Record<string, unknown>);
  } catch {
    // Preview persistence must not mask a completed source-safe preview result.
  }
  return boundary;
}

export function summarizeAssetPackPreviewBoundary(boundary: AssetPackPreviewBoundary): string {
  return [
    `AssetPack ${boundary.assetPackId}`,
    `preview ${boundary.sourceSafePreview.previewId}`,
    `fit ${boundary.sourceSafePreview.fit.resultState}`,
    `quote ${boundary.quoteReceipt.sats} sats`,
    `delivery ${boundary.deliveryPosture.state}`,
    `source visible ${boundary.sourceSafety.unpaidAssetPackSourceVisible}`,
  ].join('; ');
}
