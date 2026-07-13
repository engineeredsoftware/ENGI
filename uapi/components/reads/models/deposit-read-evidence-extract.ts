/**
 * Extract/derive completed harness evidence for the deposit-read workbench.
 */

import type { TerminalReadFitsFindingSynthesisHarnessEvent } from '@/components/bitcode/pipeline/PipelineHarnessClient/pipeline-harness-client';
import { objectValue, textValue } from './read-workbench-values';
import type { DepositReadCompletedEvidence } from './deposit-read-evidence-types';

export function extractCompletedHarnessEvidence(
  harnessEvents: TerminalReadFitsFindingSynthesisHarnessEvent[],
): Record<string, unknown> | null {
  for (let index = harnessEvents.length - 1; index >= 0; index -= 1) {
    const event = harnessEvents[index];
    if (event.event !== 'harness-completed') continue;
    const data = objectValue(event.data);
    const evidence = objectValue(data?.evidence);
    if (evidence) return evidence;
  }
  return null;
}

export function deriveDepositReadCompletedEvidence(
  completedHarnessEvidence: Record<string, unknown> | null,
): DepositReadCompletedEvidence {
  const assetPackPreviewBoundary = objectValue(completedHarnessEvidence?.assetPackPreviewBoundary);
  const boundarySourceSafePreview = objectValue(assetPackPreviewBoundary?.sourceSafePreview);
  const sourceSafePreview =
    objectValue(completedHarnessEvidence?.sourceSafePreview) || boundarySourceSafePreview;
  const assetPackSelectedFitProvenance = objectValue(assetPackPreviewBoundary?.selectedFitProvenance);
  const assetPackQuoteReceipt =
    objectValue(assetPackPreviewBoundary?.quoteReceipt) ||
    objectValue(completedHarnessEvidence?.assetPackQuoteReceipt);
  const assetPackSettlementInstructions =
    objectValue(assetPackPreviewBoundary?.settlementInstructions) ||
    objectValue(completedHarnessEvidence?.assetPackSettlementInstructions);
  const assetPackDeliveryPosture =
    objectValue(assetPackPreviewBoundary?.deliveryPosture) ||
    objectValue(completedHarnessEvidence?.assetPackDeliveryPosture);
  const assetPackPreviewProofRoots = objectValue(assetPackPreviewBoundary?.proofRoots);
  const assetPackPreviewReplayReceipt = objectValue(assetPackPreviewBoundary?.replayReceipt);
  const assetPackDisclosureReview =
    objectValue(completedHarnessEvidence?.assetPackDisclosureReview) ||
    objectValue(assetPackPreviewBoundary?.disclosureReview) ||
    objectValue(sourceSafePreview?.disclosureReview);
  const disclosureAccess = objectValue(assetPackDisclosureReview?.access);
  const disclosurePolicy = objectValue(assetPackDisclosureReview?.policy);
  const disclosureLeakage = objectValue(assetPackDisclosureReview?.sourceLeakage);
  const disclosureRoots = objectValue(assetPackDisclosureReview?.roots);
  const disclosureSourceSafe = disclosureLeakage?.protectedSourceDetected !== true;
  const ledgerSettlement = objectValue(completedHarnessEvidence?.ledgerSettlement);
  const assetPackSettlementRightsDeliveryBoundary = objectValue(
    completedHarnessEvidence?.assetPackSettlementRightsDeliveryBoundary,
  );
  const assetPackSettlementPaymentObservation = objectValue(
    assetPackSettlementRightsDeliveryBoundary?.paymentObservation,
  );
  const assetPackSettlementFinalityReceipt = objectValue(
    assetPackSettlementRightsDeliveryBoundary?.finalityReceipt,
  );
  const assetPackSettlementDeliveryUnlock =
    objectValue(assetPackSettlementRightsDeliveryBoundary?.deliveryUnlock) ||
    objectValue(completedHarnessEvidence?.assetPackDeliveryUnlock);
  const assetPackSettlementReplayReceipt =
    objectValue(assetPackSettlementRightsDeliveryBoundary?.replayReceipt) ||
    objectValue(completedHarnessEvidence?.assetPackSettlementReplayReceipt);
  const assetPackSettlementReconciliation =
    objectValue(assetPackSettlementRightsDeliveryBoundary?.reconciliationReport) ||
    objectValue(completedHarnessEvidence?.assetPackLedgerDatabaseStorageReconciliation);
  const assetPackSettlementProofRoots = objectValue(assetPackSettlementRightsDeliveryBoundary?.proofRoots);
  const readingLocalStagingRehearsal = objectValue(completedHarnessEvidence?.readingLocalStagingRehearsal);
  const readingLocalStagingCoverage = objectValue(readingLocalStagingRehearsal?.coverage);
  const readingLocalStagingProofRoots = objectValue(readingLocalStagingRehearsal?.proofRoots);
  const readingLocalStagingStageReadback = objectValue(readingLocalStagingRehearsal?.stageReadback);
  const previewFeeQuote = assetPackQuoteReceipt || objectValue(sourceSafePreview?.feeQuote);
  const protectedSourceUnlock =
    objectValue(sourceSafePreview?.unlock) || objectValue(ledgerSettlement?.protectedSourceUnlock);
  const settledReadback = ledgerSettlement?.status === 'settled';
  const previewDelivery = objectValue(sourceSafePreview?.delivery);
  const pullRequestDelivered =
    settledReadback &&
    Boolean(
      textValue(previewDelivery?.pullRequestTarget) ||
        textValue(assetPackDeliveryPosture?.pullRequestTarget),
    );

  return {
    sourceSafePreview,
    assetPackPreviewBoundary,
    assetPackSelectedFitProvenance,
    assetPackQuoteReceipt,
    assetPackSettlementInstructions,
    assetPackDeliveryPosture,
    assetPackPreviewProofRoots,
    assetPackPreviewReplayReceipt,
    assetPackDisclosureReview,
    disclosureAccess,
    disclosurePolicy,
    disclosureLeakage,
    disclosureRoots,
    disclosureSourceSafe,
    ledgerSettlement,
    assetPackSettlementRightsDeliveryBoundary,
    assetPackSettlementPaymentObservation,
    assetPackSettlementFinalityReceipt,
    assetPackSettlementDeliveryUnlock,
    assetPackSettlementReplayReceipt,
    assetPackSettlementReconciliation,
    assetPackSettlementProofRoots,
    readingLocalStagingRehearsal,
    readingLocalStagingCoverage,
    readingLocalStagingProofRoots,
    readingLocalStagingStageReadback,
    previewFeeQuote,
    protectedSourceUnlock,
    settledReadback,
    previewDelivery,
    pullRequestDelivered,
  };
}

