/**
 * Shared pure value helpers used by deposit-read evidence row builders.
 */
import {
  countList,
  numericValue,
  objectValue,
  shortIdentifier,
  stringList,
  terminalReadNeed,
  textValue,
  type TerminalReadNeedReviewRuntimeState,
  type TerminalReadNeedState,
} from './read-workbench-values';
import type {
  DepositReadCompletedEvidence,
  WorkbenchKeyValueRow,
} from './deposit-read-evidence-types';

export function buildAssetPackPreviewBoundaryRows(
  evidence: DepositReadCompletedEvidence,
): WorkbenchKeyValueRow[] {
  const {
    assetPackPreviewBoundary,
    assetPackPreviewProofRoots,
    sourceSafePreview,
    previewFeeQuote,
    assetPackQuoteReceipt,
    assetPackSelectedFitProvenance,
    assetPackSettlementInstructions,
    assetPackDeliveryPosture,
    assetPackPreviewReplayReceipt,
  } = evidence;
  return [
    {
      label: 'Boundary',
      value: shortIdentifier(assetPackPreviewBoundary?.boundaryId) || 'pending',
    },
    {
      label: 'Preview root',
      value:
        shortIdentifier(assetPackPreviewProofRoots?.previewRoot) ||
        shortIdentifier(objectValue(sourceSafePreview?.roots)?.previewRoot) ||
        'pending',
    },
    {
      label: 'Quote',
      value: numericValue(previewFeeQuote?.sats) ? `${String(previewFeeQuote?.sats)} sats` : 'pending',
    },
    {
      label: 'Quote root',
      value:
        shortIdentifier(assetPackQuoteReceipt?.quoteRoot) ||
        shortIdentifier(previewFeeQuote?.quoteRoot) ||
        'pending',
    },
    {
      label: 'Formula',
      value: textValue(assetPackQuoteReceipt?.formula) || textValue(previewFeeQuote?.formula) || 'pending',
    },
    {
      label: 'Deterministic',
      value: assetPackQuoteReceipt?.deterministic === true ? 'yes' : 'pending',
    },
    {
      label: 'Selected fits',
      value: stringList(assetPackSelectedFitProvenance?.selectedCandidateAssetIds).join(', ') || 'pending',
    },
    {
      label: 'Fit deposits',
      value: stringList(assetPackSelectedFitProvenance?.fitDepositAssetIds).join(', ') || 'pending',
    },
    {
      label: 'Provenance root',
      value:
        shortIdentifier(assetPackSelectedFitProvenance?.provenanceRoot) ||
        shortIdentifier(assetPackPreviewProofRoots?.selectedFitProvenanceRoot) ||
        'pending',
    },
    {
      label: 'Settlement',
      value: textValue(assetPackSettlementInstructions?.state) || 'pending',
    },
    {
      label: 'Network',
      value: textValue(assetPackSettlementInstructions?.btcNetwork) || 'pending',
    },
    {
      label: 'Instructions root',
      value: shortIdentifier(assetPackSettlementInstructions?.instructionsRoot) || 'pending',
    },
    {
      label: 'Delivery',
      value: textValue(assetPackDeliveryPosture?.state) || 'pending',
    },
    {
      label: 'Delivery root',
      value: shortIdentifier(assetPackDeliveryPosture?.deliveryRoot) || 'pending',
    },
    {
      label: 'Replay root',
      value:
        shortIdentifier(assetPackPreviewReplayReceipt?.replayRoot) ||
        shortIdentifier(assetPackPreviewProofRoots?.replayRoot) ||
        'pending',
    },
    {
      label: 'Storage records',
      value: numericValue(assetPackPreviewBoundary?.storageRecordCount)
        ? String(assetPackPreviewBoundary?.storageRecordCount)
        : String(countList(assetPackPreviewBoundary?.storageProjection) || 0),
    },
  ];
}

export function buildAssetPackSettlementBoundaryRows(
  evidence: DepositReadCompletedEvidence,
): WorkbenchKeyValueRow[] {
  const {
    assetPackSettlementRightsDeliveryBoundary,
    assetPackSettlementPaymentObservation,
    assetPackSettlementFinalityReceipt,
    assetPackSettlementProofRoots,
    assetPackSettlementDeliveryUnlock,
    assetPackSettlementReconciliation,
    assetPackSettlementReplayReceipt,
  } = evidence;
  return [
    {
      label: 'Boundary',
      value: shortIdentifier(assetPackSettlementRightsDeliveryBoundary?.boundaryId) || 'pending',
    },
    {
      label: 'State',
      value: textValue(assetPackSettlementRightsDeliveryBoundary?.state) || 'pending',
    },
    {
      label: 'Payment',
      value:
        numericValue(assetPackSettlementPaymentObservation?.observedDebitSats) &&
        numericValue(assetPackSettlementPaymentObservation?.expectedSats)
          ? `${String(assetPackSettlementPaymentObservation?.observedDebitSats)}/${String(assetPackSettlementPaymentObservation?.expectedSats)} sats`
          : 'pending',
    },
    {
      label: 'Payment root',
      value: shortIdentifier(assetPackSettlementPaymentObservation?.paymentReceiptRoot) || 'pending',
    },
    {
      label: 'Finality',
      value: textValue(assetPackSettlementFinalityReceipt?.finalityState) || 'pending',
    },
    {
      label: 'Finality root',
      value: shortIdentifier(assetPackSettlementFinalityReceipt?.finalityRoot) || 'pending',
    },
    {
      label: 'Source-to-shares',
      value: shortIdentifier(assetPackSettlementProofRoots?.sourceToSharesRoot) || 'pending',
    },
    {
      label: 'Rights transfer',
      value: shortIdentifier(assetPackSettlementProofRoots?.rightsTransferRoot) || 'pending',
    },
    {
      label: 'Read receipt',
      value: shortIdentifier(assetPackSettlementProofRoots?.btdReadReceiptRoot) || 'pending',
    },
    {
      label: 'Delivery unlock',
      value: textValue(assetPackSettlementDeliveryUnlock?.state) || 'pending',
    },
    {
      label: 'Delivery root',
      value: shortIdentifier(assetPackSettlementDeliveryUnlock?.deliveryRoot) || 'pending',
    },
    {
      label: 'Reconciliation',
      value: textValue(assetPackSettlementReconciliation?.state) || 'pending',
    },
    {
      label: 'Reconciliation root',
      value:
        shortIdentifier(objectValue(assetPackSettlementReconciliation?.proofRoots)?.repairPlanRoot) ||
        shortIdentifier(assetPackSettlementProofRoots?.reconciliationRoot) ||
        'pending',
    },
    {
      label: 'Replay root',
      value:
        shortIdentifier(assetPackSettlementReplayReceipt?.replayRoot) ||
        shortIdentifier(assetPackSettlementProofRoots?.replayRoot) ||
        'pending',
    },
    {
      label: 'Storage records',
      value: numericValue(assetPackSettlementRightsDeliveryBoundary?.storageRecordCount)
        ? String(assetPackSettlementRightsDeliveryBoundary?.storageRecordCount)
        : String(countList(assetPackSettlementRightsDeliveryBoundary?.storageProjection) || 0),
    },
  ];
}

export function buildReadingLocalStagingRehearsalRows(
  evidence: DepositReadCompletedEvidence,
): WorkbenchKeyValueRow[] {
  const {
    readingLocalStagingRehearsal,
    readingLocalStagingStageReadback,
    readingLocalStagingCoverage,
    readingLocalStagingProofRoots,
  } = evidence;
  return [
    {
      label: 'Rehearsal',
      value: shortIdentifier(readingLocalStagingRehearsal?.rehearsalId) || 'pending',
    },
    {
      label: 'Run',
      value:
        shortIdentifier(readingLocalStagingRehearsal?.runId) ||
        textValue(readingLocalStagingRehearsal?.runId) ||
        'pending',
    },
    {
      label: 'Lanes',
      value: stringList(readingLocalStagingRehearsal?.lanes).join(', ') || 'pending',
    },
    {
      label: 'Stages complete',
      value: `${Object.values(readingLocalStagingStageReadback || {}).filter((status) => status === 'completed').length}/${String(countList(readingLocalStagingRehearsal?.stageIds) || 0)}`,
    },
    {
      label: 'Staging',
      value: textValue(readingLocalStagingCoverage?.stagingProjectRef) || 'pending',
    },
    {
      label: 'Many fits',
      value: readingLocalStagingCoverage?.depositoryManyFitsCovered === true ? 'covered' : 'pending',
    },
    {
      label: 'Telemetry',
      value:
        readingLocalStagingCoverage?.telemetryStreamingReadbackCovered === true
          ? 'readback covered'
          : 'pending',
    },
    {
      label: 'Sync',
      value: readingLocalStagingCoverage?.ledgerDatabaseStorageSynchronized === true ? 'aligned' : 'pending',
    },
    {
      label: 'Delivery',
      value:
        readingLocalStagingCoverage?.postSettlementPullRequestDeliveryCovered === true
          ? 'post-settlement PR'
          : 'pending',
    },
    {
      label: 'Mainnet',
      value: readingLocalStagingCoverage?.valueBearingMainnetAdmitted === false ? 'blocked' : 'pending',
    },
    {
      label: 'Root',
      value: shortIdentifier(readingLocalStagingProofRoots?.rehearsalRoot) || 'pending',
    },
    {
      label: 'Rows',
      value: String(countList(readingLocalStagingRehearsal?.rows) || 'pending'),
    },
  ];
}

