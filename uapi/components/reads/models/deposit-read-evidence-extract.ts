/**
 * Extract/derive completed host evidence for the deposit-read workbench.
 */

import type { TerminalReadFitsFindingSynthesisHostEvent } from '@/components/bitcode/pipeline/PipelineHostClient/pipeline-host-client';
import { objectValue, textValue } from './read-workbench-values';
import type { DepositReadCompletedEvidence } from './deposit-read-evidence-types';

export function extractCompletedHostEvidence(
  hostEvents: TerminalReadFitsFindingSynthesisHostEvent[],
): Record<string, unknown> | null {
  for (let index = hostEvents.length - 1; index >= 0; index -= 1) {
    const event = hostEvents[index];
    if (event.event !== 'host-completed') continue;
    const data = objectValue(event.data);
    const evidence = objectValue(data?.evidence);
    if (evidence) return evidence;
  }
  return null;
}

export function deriveDepositReadCompletedEvidence(
  completedHostEvidence: Record<string, unknown> | null,
): DepositReadCompletedEvidence {
  const assetPackPreviewBoundary = objectValue(completedHostEvidence?.assetPackPreviewBoundary);
  const boundarySourceSafePreview = objectValue(assetPackPreviewBoundary?.sourceSafePreview);
  const sourceSafePreview =
    objectValue(completedHostEvidence?.sourceSafePreview) || boundarySourceSafePreview;
  const assetPackSelectedFitProvenance = objectValue(assetPackPreviewBoundary?.selectedFitProvenance);
  const assetPackQuoteReceipt =
    objectValue(assetPackPreviewBoundary?.quoteReceipt) ||
    objectValue(completedHostEvidence?.assetPackQuoteReceipt);
  const assetPackSettlementInstructions =
    objectValue(assetPackPreviewBoundary?.settlementInstructions) ||
    objectValue(completedHostEvidence?.assetPackSettlementInstructions);
  const assetPackDeliveryPosture =
    objectValue(assetPackPreviewBoundary?.deliveryPosture) ||
    objectValue(completedHostEvidence?.assetPackDeliveryPosture);
  const assetPackPreviewProofRoots = objectValue(assetPackPreviewBoundary?.proofRoots);
  const assetPackPreviewReplayReceipt = objectValue(assetPackPreviewBoundary?.replayReceipt);
  const assetPackDisclosureReview =
    objectValue(completedHostEvidence?.assetPackDisclosureReview) ||
    objectValue(assetPackPreviewBoundary?.disclosureReview) ||
    objectValue(sourceSafePreview?.disclosureReview);
  const disclosureAccess = objectValue(assetPackDisclosureReview?.access);
  const disclosurePolicy = objectValue(assetPackDisclosureReview?.policy);
  const disclosureLeakage = objectValue(assetPackDisclosureReview?.sourceLeakage);
  const disclosureRoots = objectValue(assetPackDisclosureReview?.roots);
  const disclosureSourceSafe = disclosureLeakage?.protectedSourceDetected !== true;
  const ledgerSettlement = objectValue(completedHostEvidence?.ledgerSettlement);
  const assetPackSettlementRightsDeliveryBoundary = objectValue(
    completedHostEvidence?.assetPackSettlementRightsDeliveryBoundary,
  );
  const assetPackSettlementPaymentObservation = objectValue(
    assetPackSettlementRightsDeliveryBoundary?.paymentObservation,
  );
  const assetPackSettlementFinalityReceipt = objectValue(
    assetPackSettlementRightsDeliveryBoundary?.finalityReceipt,
  );
  const assetPackSettlementDeliveryUnlock =
    objectValue(assetPackSettlementRightsDeliveryBoundary?.deliveryUnlock) ||
    objectValue(completedHostEvidence?.assetPackDeliveryUnlock);
  const assetPackSettlementReplayReceipt =
    objectValue(assetPackSettlementRightsDeliveryBoundary?.replayReceipt) ||
    objectValue(completedHostEvidence?.assetPackSettlementReplayReceipt);
  const assetPackSettlementReconciliation =
    objectValue(assetPackSettlementRightsDeliveryBoundary?.reconciliationReport) ||
    objectValue(completedHostEvidence?.assetPackLedgerDatabaseStorageReconciliation);
  const assetPackSettlementProofRoots = objectValue(assetPackSettlementRightsDeliveryBoundary?.proofRoots);
  const readingLocalStagingRehearsal = objectValue(completedHostEvidence?.readingLocalStagingRehearsal);
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

