/**
 * Build source-safe key-value rows for deposit-read workbench panels.
 */

import type { TerminalReadFitsFindingSynthesisHarnessEvent } from '@/components/bitcode/pipeline/PipelineHarnessClient/pipeline-harness-client';
import {
  objectValue,
  shortIdentifier,
  textValue,
  type TerminalReadNeedReviewRuntimeState,
  type TerminalReadNeedState,
} from './read-workbench-values';
import type {
  DepositReadCompletedEvidence,
  WorkbenchKeyValueRow,
} from './deposit-read-evidence-types';

export function buildDisclosureRows(evidence: DepositReadCompletedEvidence): WorkbenchKeyValueRow[] {
  const {
    disclosureAccess,
    disclosurePolicy,
    disclosureRoots,
    disclosureLeakage,
    protectedSourceUnlock,
    sourceSafePreview,
  } = evidence;
  return [
    {
      label: 'Visibility',
      value: textValue(disclosureAccess?.sourceVisibility) || 'withheld before settlement',
    },
    {
      label: 'Reader action',
      value: textValue(disclosureAccess?.readerAction) || 'pay to unlock',
    },
    {
      label: 'Policy root',
      value:
        shortIdentifier(disclosurePolicy?.accessPolicyHash) ||
        shortIdentifier(objectValue(sourceSafePreview?.accessPolicy)?.accessPolicyHash) ||
        'pending',
    },
    {
      label: 'Review root',
      value: shortIdentifier(disclosureRoots?.reviewRoot) || 'pending',
    },
    {
      label: 'Visible facts',
      value: `${countList(disclosurePolicy?.visibleBeforeSettlement)} before payment`,
    },
    {
      label: 'Withheld facts',
      value: `${countList(disclosurePolicy?.withheldBeforeSettlement)} until paid`,
    },
    {
      label: 'Leakage',
      value:
        disclosureLeakage?.protectedSourceDetected === true
          ? `${String(disclosureLeakage.findingCount || 'detected')} finding(s)`
          : disclosureLeakage
            ? 'none detected'
            : 'pending',
    },
    {
      label: 'Source',
      value: protectedSourceUnlock?.sourceAvailable === true ? 'available after settlement' : 'withheld',
    },
  ];
}

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

export function buildReadNeedRows(currentReadNeed: TerminalReadNeedState | null): WorkbenchKeyValueRow[] {
  if (!currentReadNeed) return [];
  return [
    {
      label: 'Need id',
      value: shortIdentifier(currentReadNeed.needId) || currentReadNeed.needId || 'pending',
    },
    {
      label: 'Request id',
      value:
        shortIdentifier(currentReadNeed.request?.requestId) ||
        currentReadNeed.request?.requestId ||
        'pending',
    },
    {
      label: 'Measurement root',
      value:
        shortIdentifier(currentReadNeed.measurementRoot) ||
        currentReadNeed.measurementRoot ||
        'pending',
    },
    { label: 'Review state', value: currentReadNeed.reviewState || 'pending' },
    {
      label: 'Target kinds',
      value: stringList(currentReadNeed.targetArtifactKinds).join(', ') || 'pending',
    },
    {
      label: 'Closure criteria',
      value: String(stringList(currentReadNeed.closureCriteria).length),
    },
    {
      label: 'Weighted volume',
      value: String(currentReadNeed.pricingMeasurementInputs?.weightedRequestedVolume ?? 'pending'),
    },
    { label: 'Feedback turns', value: String(stringList(currentReadNeed.feedbackHistory).length) },
    {
      label: 'Previous Need',
      value:
        shortIdentifier(currentReadNeed.request?.previousNeedId) ||
        currentReadNeed.request?.previousNeedId ||
        'none',
    },
  ];
}

export function buildReadNeedRuntimeRows(params: {
  readNeedReviewRuntime: TerminalReadNeedReviewRuntimeState | null;
  readNeedTelemetry: Record<string, unknown> | null;
  readNeedStorageProjection: Array<Record<string, unknown>>;
}): WorkbenchKeyValueRow[] {
  const { readNeedReviewRuntime, readNeedTelemetry, readNeedStorageProjection } = params;
  if (!readNeedReviewRuntime && !readNeedTelemetry && readNeedStorageProjection.length === 0) {
    return [];
  }
  const admission = objectValue(readNeedReviewRuntime?.findingFitsAdmission);
  const proofRoots = objectValue(readNeedReviewRuntime?.proofRoots);
  return [
    {
      label: 'Runtime',
      value:
        shortIdentifier(readNeedReviewRuntime?.runtimeId) ||
        textValue(readNeedReviewRuntime?.runtimeId) ||
        'pending',
    },
    { label: 'Action', value: textValue(readNeedReviewRuntime?.action) || 'pending' },
    { label: 'Admission', value: admission?.admitted === true ? 'admitted' : 'blocked' },
    { label: 'Blockers', value: stringList(admission?.blockers).join(', ') || 'none' },
    {
      label: 'Storage records',
      value: String(readNeedStorageProjection.length || 'pending'),
    },
    { label: 'Runtime root', value: shortIdentifier(proofRoots?.runtimeRoot) || 'pending' },
    { label: 'Storage root', value: shortIdentifier(proofRoots?.storageRoot) || 'pending' },
    {
      label: 'Telemetry root',
      value: shortIdentifier(proofRoots?.telemetryRoot || readNeedTelemetry?.telemetryRoot) || 'pending',
    },
    {
      label: 'PTRR step',
      value:
        shortIdentifier(readNeedTelemetry?.ptrrStepId) ||
        textValue(readNeedTelemetry?.ptrrStepId) ||
        'pending',
    },
    { label: 'Return type', value: textValue(readNeedTelemetry?.returnType) || 'pending' },
  ];
}

export function buildHarnessIdentifierRows(params: {
  harnessRequestState: {
    ready: boolean;
    request?: {
      readId?: string;
      acceptedReadNeed?: unknown;
      depositId?: string;
      sourceCommit?: string;
    } | null;
  };
  acceptedReadNeed: TerminalReadNeedState | null;
  harnessEvents: TerminalReadFitsFindingSynthesisHarnessEvent[];
}): WorkbenchKeyValueRow[] {
  const { harnessRequestState, acceptedReadNeed, harnessEvents } = params;
  const rows: WorkbenchKeyValueRow[] = [];
  const request = harnessRequestState.request;
  if (harnessRequestState.ready && request) {
    rows.push(
      {
        label: 'read',
        value: shortIdentifier(request.readId) || 'pending',
      },
      {
        label: 'need',
        value: shortIdentifier(terminalReadNeed(request.acceptedReadNeed)?.needId) || 'pending',
      },
      {
        label: 'deposit',
        value: shortIdentifier(request.depositId) || 'pending',
      },
      {
        label: 'commit',
        value: shortIdentifier(request.sourceCommit) || 'pending',
      },
    );
  } else if (acceptedReadNeed?.needId) {
    rows.push({
      label: 'need',
      value: shortIdentifier(acceptedReadNeed.needId) || acceptedReadNeed.needId,
    });
  }

  let sandboxId: string | null = null;
  let runId: string | null = null;
  let pipelineRunId: string | null = null;
  let lastTelemetryLine: string | null = null;
  let inferenceProfile: string | null = null;
  let inferenceGate: string | null = null;
  let runtimeBudget: string | null = null;
  let supabaseHost: string | null = null;

  for (const event of harnessEvents) {
    const data = objectValue(event.data);
    if (!data) continue;
    runId = textValue(data.runId) || runId;
    sandboxId = textValue(data.sandboxId) || sandboxId;
    inferenceProfile = textValue(data.realInferenceProfile) || inferenceProfile;
    inferenceGate =
      typeof data.realInferenceRequired === 'boolean'
        ? data.realInferenceRequired
          ? 'required'
          : 'local optional'
        : inferenceGate;
    runtimeBudget =
      typeof data.runtimeBudgetMs === 'number' && Number.isFinite(data.runtimeBudgetMs)
        ? `${data.runtimeBudgetMs}ms`
        : runtimeBudget;
    supabaseHost = textValue(data.supabaseHost) || supabaseHost;
    if (event.event === 'harness-event') {
      sandboxId = textValue(data.sandboxId) || sandboxId;
      const telemetryEvent = objectValue(data.telemetryEvent);
      runId = textValue(telemetryEvent?.runId) || runId;
      pipelineRunId = textValue(telemetryEvent?.pipelineRunId) || pipelineRunId;
      lastTelemetryLine =
        data.type === 'telemetry-artifact-event' ? String(data.lineNumber || '') : lastTelemetryLine;
    }
  }

  if (sandboxId) rows.push({ label: 'sandbox', value: shortIdentifier(sandboxId) || sandboxId });
  if (runId) rows.push({ label: 'run', value: shortIdentifier(runId) || runId });
  if (pipelineRunId) {
    rows.push({ label: 'pipeline row', value: shortIdentifier(pipelineRunId) || pipelineRunId });
  }
  if (inferenceGate) rows.push({ label: 'inference gate', value: inferenceGate });
  if (inferenceProfile) rows.push({ label: 'profile', value: inferenceProfile });
  if (runtimeBudget) rows.push({ label: 'budget', value: runtimeBudget });
  if (supabaseHost) rows.push({ label: 'database', value: supabaseHost });
  if (lastTelemetryLine) rows.push({ label: 'telemetry line', value: lastTelemetryLine });
  return rows;
}

export function buildSourceSafePreviewSummaryRows(
  evidence: DepositReadCompletedEvidence,
): WorkbenchKeyValueRow[] {
  const {
    sourceSafePreview,
    previewFeeQuote,
    ledgerSettlement,
    protectedSourceUnlock,
    previewDelivery,
    assetPackDeliveryPosture,
  } = evidence;
  return [
    { label: 'AssetPack', value: textValue(sourceSafePreview?.assetPackId) || 'pending' },
    {
      label: 'Fee quote',
      value: numericValue(previewFeeQuote?.sats) ? `${String(previewFeeQuote?.sats)} sats` : 'pending',
    },
    { label: 'Quote root', value: shortIdentifier(previewFeeQuote?.quoteRoot) || 'pending' },
    {
      label: 'Range projection',
      value: objectValue(sourceSafePreview?.rangeProjection)?.tokenCount
        ? `${String(objectValue(sourceSafePreview?.rangeProjection)?.tokenCount)} cells`
        : 'pending',
    },
    { label: 'Ledger', value: textValue(ledgerSettlement?.status) || 'pending' },
    {
      label: 'Access',
      value:
        textValue(objectValue(sourceSafePreview?.accessPolicy)?.readRightState) || 'pending settlement',
    },
    {
      label: 'Unlock',
      value:
        protectedSourceUnlock?.sourceAvailable === true
          ? 'source available'
          : textValue(protectedSourceUnlock?.state) || 'withheld',
    },
    {
      label: 'Read license',
      value: shortIdentifier(ledgerSettlement?.readLicenseId) || 'pending',
    },
    {
      label: 'BTC fee',
      value: shortIdentifier(ledgerSettlement?.btcFeeReceiptId) || 'pending',
    },
    {
      label: 'PR target',
      value:
        textValue(previewDelivery?.pullRequestTarget) ||
        textValue(assetPackDeliveryPosture?.pullRequestTarget) ||
        'pending',
    },
  ];
}
