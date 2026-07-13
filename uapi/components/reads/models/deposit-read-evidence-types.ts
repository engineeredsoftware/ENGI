/**
 * Deposit-read workbench evidence types.
 */

export type WorkbenchKeyValueRow = { label: string; value: string };

export type DepositReadCompletedEvidence = {
  sourceSafePreview: Record<string, unknown> | null;
  assetPackPreviewBoundary: Record<string, unknown> | null;
  assetPackSelectedFitProvenance: Record<string, unknown> | null;
  assetPackQuoteReceipt: Record<string, unknown> | null;
  assetPackSettlementInstructions: Record<string, unknown> | null;
  assetPackDeliveryPosture: Record<string, unknown> | null;
  assetPackPreviewProofRoots: Record<string, unknown> | null;
  assetPackPreviewReplayReceipt: Record<string, unknown> | null;
  assetPackDisclosureReview: Record<string, unknown> | null;
  disclosureAccess: Record<string, unknown> | null;
  disclosurePolicy: Record<string, unknown> | null;
  disclosureLeakage: Record<string, unknown> | null;
  disclosureRoots: Record<string, unknown> | null;
  disclosureSourceSafe: boolean;
  ledgerSettlement: Record<string, unknown> | null;
  assetPackSettlementRightsDeliveryBoundary: Record<string, unknown> | null;
  assetPackSettlementPaymentObservation: Record<string, unknown> | null;
  assetPackSettlementFinalityReceipt: Record<string, unknown> | null;
  assetPackSettlementDeliveryUnlock: Record<string, unknown> | null;
  assetPackSettlementReplayReceipt: Record<string, unknown> | null;
  assetPackSettlementReconciliation: Record<string, unknown> | null;
  assetPackSettlementProofRoots: Record<string, unknown> | null;
  readingLocalStagingRehearsal: Record<string, unknown> | null;
  readingLocalStagingCoverage: Record<string, unknown> | null;
  readingLocalStagingProofRoots: Record<string, unknown> | null;
  readingLocalStagingStageReadback: Record<string, unknown> | null;
  previewFeeQuote: Record<string, unknown> | null;
  protectedSourceUnlock: Record<string, unknown> | null;
  settledReadback: boolean;
  previewDelivery: Record<string, unknown> | null;
  pullRequestDelivered: boolean;
};
