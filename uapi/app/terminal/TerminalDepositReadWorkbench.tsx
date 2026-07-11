'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import BitcodeMetricGrid from '@/components/bitcode/execution/BitcodeMetricGrid';
import BitcodeExecutionStreamPanel from '@/components/bitcode/execution/BitcodeExecutionStreamPanel';

import TerminalActionWorkbenchCard from './TerminalActionWorkbenchCard';
import TerminalWorkspaceCard from './TerminalWorkspaceCard';
import {
  buildTerminalFitWorkbenchDraft,
  buildTerminalDepositWorkbenchDraft,
  buildTerminalReadAdmissionDraft,
  buildTerminalReadMeasurementDraft,
  readTerminalRouteError,
  type TerminalActivityRecordDraft,
} from './terminal-activity-history';
import { TERMINAL_WORKSPACE_EXPLAINERS } from './terminal-workspace-explainers';
import type { TerminalRepositoryContextState } from './terminal-repository-context';
import {
  buildLiveTerminalDepositReadWorkbenchSnapshot,
  normalizeTerminalDepositReadWorkbench,
  TERMINAL_ENTERPRISE_READING_STEPS,
  type TerminalDepositedSourceRevision,
  type TerminalDepositReadWorkbench as TerminalDepositReadWorkbenchState,
  type TerminalEnterpriseReadingStepId,
} from './terminal-deposit-read-workbench';
import { buildTerminalEnterpriseReadingUxState } from './terminal-enterprise-reading-ux-state';
import {
  buildTerminalReadFitsFindingSynthesisHarnessStreamSnapshot,
  buildTerminalReadFitsFindingSynthesisHarnessRequest,
  streamTerminalReadFitsFindingSynthesisHarness,
  summarizeTerminalReadFitsFindingSynthesisHarnessEvent,
  type TerminalReadFitsFindingSynthesisHarnessEvent,
} from './terminal-pipeline-harness-client';
import { useTerminalShellBridge } from './terminal-shell-bridge';
import { jumpToShellSection } from './terminal-shell-reading';

function readMetricValue(metrics: Array<{ label: string; value: string }>, label: string) {
  return metrics.find((metric) => metric.label === label)?.value || '0';
}

function readRowValue(rows: Array<{ label: string; value: string }>, label: string) {
  return rows.find((row) => row.label === label)?.value || '—';
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function shortIdentifier(value: unknown): string | null {
  const text = textValue(value);
  if (!text) return null;
  return text.length > 18 ? `${text.slice(0, 12)}...` : text;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((entry) => String(entry || '').trim()).filter(Boolean)
    : [];
}

function countList(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function numericValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function terminalReadNeed(value: unknown): TerminalReadNeedState | null {
  const record = objectValue(value);
  return record?.schema === 'bitcode.read.need' ? record as TerminalReadNeedState : null;
}

type ReadFitsFindingProgressState = 'draft' | 'measured' | 'admitted' | 'fit-recorded';
type ReadingStageId = TerminalEnterpriseReadingStepId;

type TerminalReadNeedState = Record<string, unknown> & {
  schema?: 'bitcode.read.need';
  needId?: string;
  reviewState?: string;
  measurementRoot?: string;
  request?: {
    requestId?: string;
    previousNeedId?: string | null;
    feedbackHistory?: string[];
  };
  requirements?: string[];
  closureCriteria?: string[];
  failureModes?: string[];
  targetArtifactKinds?: string[];
  proofExpectations?: string[];
  feedbackHistory?: string[];
  pricingMeasurementInputs?: {
    weightedRequestedVolume?: number;
    measurementVector?: Array<{ dimension?: string; weight?: number; volume?: number }>;
  };
};

type TerminalReadNeedReviewRuntimeState = Record<string, unknown> & {
  schema?: 'bitcode.read-need-review-resynthesis-runtime';
  runtimeId?: string;
  action?: string;
  reviewState?: string;
  findingFitsAdmission?: {
    admitted?: boolean;
    blockers?: string[];
  };
  reviewLoop?: Record<string, unknown>;
  proofRoots?: {
    runtimeRoot?: string;
    storageRoot?: string;
    telemetryRoot?: string;
    readRequestRoot?: string;
  };
};

interface TerminalDepositReadWorkbenchProps {
  repositoryContext?: TerminalRepositoryContextState | null;
  depositedSourceRevision?: TerminalDepositedSourceRevision | null;
  admittedReadActivityId?: string | null;
  routeReadingStage?: TerminalEnterpriseReadingStepId | null;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  onHarnessCompleted?: () => Promise<unknown> | unknown;
  showDemonstrationWorkbench?: boolean;
}

export default function TerminalDepositReadWorkbench({
  repositoryContext = null,
  depositedSourceRevision = null,
  admittedReadActivityId = null,
  routeReadingStage = null,
  onRecordActivity,
  onHarnessCompleted,
  showDemonstrationWorkbench = true,
}: TerminalDepositReadWorkbenchProps) {
  const { snapshot } = useTerminalShellBridge();
  const [recordingKey, setRecordingKey] = useState<'deposit' | 'read' | 'read-admission' | 'fit' | null>(null);
  const [recordMessage, setRecordMessage] = useState<string | null>(null);
  const [readFitsFindingProgress, setReadFitsFindingProgress] = useState<ReadFitsFindingProgressState>('draft');
  const [recordedAdmittedReadActivityId, setRecordedAdmittedReadActivityId] = useState<string | null>(null);
  const [harnessState, setHarnessState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [harnessMessage, setHarnessMessage] = useState<string | null>(null);
  const [harnessEvents, setHarnessEvents] = useState<TerminalReadFitsFindingSynthesisHarnessEvent[]>([]);
  const [harnessUserHasScrolled, setHarnessUserHasScrolled] = useState(false);
  const [readNeed, setReadNeed] = useState<TerminalReadNeedState | null>(null);
  const [acceptedReadNeed, setAcceptedReadNeed] = useState<TerminalReadNeedState | null>(null);
  const [readNeedReviewRuntime, setReadNeedReviewRuntime] = useState<TerminalReadNeedReviewRuntimeState | null>(null);
  const [readNeedStorageProjection, setReadNeedStorageProjection] = useState<Array<Record<string, unknown>>>([]);
  const [readNeedTelemetry, setReadNeedTelemetry] = useState<Record<string, unknown> | null>(null);
  const [readNeedFeedback, setReadNeedFeedback] = useState('');
  const [readNeedMessage, setReadNeedMessage] = useState<string | null>(null);
  const [readNeedAction, setReadNeedAction] = useState<'synthesize' | 'accept' | 'reject' | 'resynthesize' | null>(null);
  const [readNeedSynthesisCount, setReadNeedSynthesisCount] = useState(0);
  const workbenchSnapshot = useMemo(() => {
    const liveWorkbenchSnapshot = buildLiveTerminalDepositReadWorkbenchSnapshot(repositoryContext, depositedSourceRevision);
    if (showDemonstrationWorkbench) return snapshot || liveWorkbenchSnapshot;
    return liveWorkbenchSnapshot;
  }, [depositedSourceRevision, repositoryContext, showDemonstrationWorkbench, snapshot]);
  const workbench = useMemo<TerminalDepositReadWorkbenchState | null>(
    () => normalizeTerminalDepositReadWorkbench(workbenchSnapshot, repositoryContext),
    [repositoryContext, workbenchSnapshot],
  );
  const scenarioKey = `${workbench?.scenarioLabel || ''}:${workbench?.sourceRevision?.commit || ''}`;

  useEffect(() => {
    setReadFitsFindingProgress('draft');
    setRecordedAdmittedReadActivityId(null);
    setHarnessState('idle');
    setHarnessMessage(null);
    setHarnessEvents([]);
    setReadNeed(null);
    setAcceptedReadNeed(null);
    setReadNeedReviewRuntime(null);
    setReadNeedStorageProjection([]);
    setReadNeedTelemetry(null);
    setReadNeedFeedback('');
    setReadNeedMessage(null);
    setReadNeedAction(null);
    setReadNeedSynthesisCount(0);
  }, [scenarioKey]);

  useEffect(() => {
    if (!admittedReadActivityId) return;
    setReadFitsFindingProgress((currentProgress) => (currentProgress === 'draft' ? 'admitted' : currentProgress));
  }, [admittedReadActivityId]);

  const selectedEntryChips = useMemo(() => {
    if (!workbench?.deposit.selectedEntries.length) return [];
    return workbench.deposit.selectedEntries.slice(0, 6).map((entry) => entry.label);
  }, [workbench]);
  const readAdmissionActionLabel =
    recordingKey === 'read-admission'
      ? 'Admitting Read...'
      : readFitsFindingProgress === 'draft'
        ? 'Record Read before admitting'
        : readFitsFindingProgress === 'measured'
          ? 'Admit measured Read for Finding Fits'
          : 'Read admitted for Finding Fits';
  const fitResultActionLabel =
    recordingKey === 'fit'
      ? 'Recording fit...'
      : readFitsFindingProgress === 'fit-recorded'
        ? 'Fit result recorded'
        : 'Record fit result posture';
  const liveFitActionLabel =
    harnessState === 'running'
      ? 'Running Finding Fits...'
      : harnessState === 'completed'
        ? 'Request Fit again'
        : 'Request Fit';
  const harnessReadActivityId = recordedAdmittedReadActivityId || admittedReadActivityId;
  const harnessRequestState = useMemo(
    () =>
      buildTerminalReadFitsFindingSynthesisHarnessRequest({
        workbench,
        repositoryContext,
        depositedSourceRevision,
        readActivityId: harnessReadActivityId,
        acceptedReadNeed,
      }),
    [acceptedReadNeed, depositedSourceRevision, harnessReadActivityId, repositoryContext, workbench],
  );
  const harnessIdentifierRows = useMemo(() => {
    const rows: Array<{ label: string; value: string }> = [];
    if (harnessRequestState.ready) {
      rows.push(
        { label: 'read', value: shortIdentifier(harnessRequestState.request.readId) || 'pending' },
        { label: 'need', value: shortIdentifier(terminalReadNeed(harnessRequestState.request.acceptedReadNeed)?.needId) || 'pending' },
        { label: 'deposit', value: shortIdentifier(harnessRequestState.request.depositId) || 'pending' },
        { label: 'commit', value: shortIdentifier(harnessRequestState.request.sourceCommit) || 'pending' },
      );
    } else if (acceptedReadNeed?.needId) {
      rows.push({ label: 'need', value: shortIdentifier(acceptedReadNeed.needId) || acceptedReadNeed.needId });
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
        lastTelemetryLine = data.type === 'telemetry-artifact-event'
          ? String(data.lineNumber || '')
          : lastTelemetryLine;
      }
    }

    if (sandboxId) rows.push({ label: 'sandbox', value: shortIdentifier(sandboxId) || sandboxId });
    if (runId) rows.push({ label: 'run', value: shortIdentifier(runId) || runId });
    if (pipelineRunId) rows.push({ label: 'pipeline row', value: shortIdentifier(pipelineRunId) || pipelineRunId });
    if (inferenceGate) rows.push({ label: 'inference gate', value: inferenceGate });
    if (inferenceProfile) rows.push({ label: 'profile', value: inferenceProfile });
    if (runtimeBudget) rows.push({ label: 'budget', value: runtimeBudget });
    if (supabaseHost) rows.push({ label: 'database', value: supabaseHost });
    if (lastTelemetryLine) rows.push({ label: 'telemetry line', value: lastTelemetryLine });
    return rows;
  }, [acceptedReadNeed, harnessEvents, harnessRequestState]);
  const harnessStreamSnapshot = useMemo(
    () => buildTerminalReadFitsFindingSynthesisHarnessStreamSnapshot(harnessEvents, harnessState, harnessState === 'failed' ? harnessMessage : null),
    [harnessEvents, harnessMessage, harnessState],
  );
  useEffect(() => {
    const runId = harnessStreamSnapshot.runId;
    if (!runId || harnessState === 'idle' || typeof window === 'undefined') return;

    const nextUrl = new URL(window.location.href);
    if (nextUrl.searchParams.get('runId') === runId) return;
    nextUrl.searchParams.set('runId', runId);
    window.history.replaceState(window.history.state, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }, [harnessState, harnessStreamSnapshot.runId]);
  const completedHarnessEvidence = useMemo(() => {
    for (let index = harnessEvents.length - 1; index >= 0; index -= 1) {
      const event = harnessEvents[index];
      if (event.event !== 'harness-completed') continue;
      const data = objectValue(event.data);
      const evidence = objectValue(data?.evidence);
      if (evidence) return evidence;
    }
    return null;
  }, [harnessEvents]);
  const assetPackPreviewBoundary = objectValue(completedHarnessEvidence?.assetPackPreviewBoundary);
  const boundarySourceSafePreview = objectValue(assetPackPreviewBoundary?.sourceSafePreview);
  const sourceSafePreview =
    objectValue(completedHarnessEvidence?.sourceSafePreview) ||
    boundarySourceSafePreview;
  const assetPackSelectedFitProvenance =
    objectValue(assetPackPreviewBoundary?.selectedFitProvenance);
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
  const previewFeeQuote =
    assetPackQuoteReceipt ||
    objectValue(sourceSafePreview?.feeQuote);
  const protectedSourceUnlock =
    objectValue(sourceSafePreview?.unlock) ||
    objectValue(ledgerSettlement?.protectedSourceUnlock);
  const settledReadback = ledgerSettlement?.status === 'settled';
  const previewDelivery = objectValue(sourceSafePreview?.delivery);
  const pullRequestDelivered = settledReadback && Boolean(
    textValue(previewDelivery?.pullRequestTarget) ||
      textValue(assetPackDeliveryPosture?.pullRequestTarget),
  );
  const enterpriseReadingState = useMemo(
    () =>
      buildTerminalEnterpriseReadingUxState({
        transactionId: recordedAdmittedReadActivityId || harnessReadActivityId || admittedReadActivityId || null,
        routeReadingStage,
        hasRepositorySource: Boolean(workbench?.sourceRevision),
        hasReadMeasurement: readFitsFindingProgress !== 'draft' || Boolean(harnessReadActivityId),
        hasSynthesizedNeed: Boolean(readNeed),
        hasAcceptedNeed: Boolean(acceptedReadNeed),
        findingFitsRunning: harnessState === 'running',
        hasSourceSafePreview: Boolean(sourceSafePreview),
        hasSettlementReadback: settledReadback,
        hasDeliveryReadback: pullRequestDelivered,
        retryRequested: readNeedSynthesisCount > 1 || harnessState === 'failed',
        failureKind: harnessState === 'failed' ? 'fits_finding_failed' : null,
        sourceSafePreviewBlocked: Boolean(sourceSafePreview && !disclosureSourceSafe),
        disclosureLeakageDetected: disclosureLeakage?.protectedSourceDetected === true,
      }),
    [
      acceptedReadNeed,
      admittedReadActivityId,
      disclosureLeakage?.protectedSourceDetected,
      disclosureSourceSafe,
      harnessReadActivityId,
      harnessState,
      readNeedSynthesisCount,
      pullRequestDelivered,
      readFitsFindingProgress,
      recordedAdmittedReadActivityId,
      readNeed,
      routeReadingStage,
      settledReadback,
      sourceSafePreview,
      workbench?.sourceRevision,
    ],
  );
  const activeReadingStage: ReadingStageId = enterpriseReadingState.activeStepId;
  const currentReadNeed = acceptedReadNeed || readNeed;
  const disclosureRows = useMemo(
    () => [
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
        value: disclosureLeakage?.protectedSourceDetected === true
          ? `${String(disclosureLeakage.findingCount || 'detected')} finding(s)`
          : disclosureLeakage
            ? 'none detected'
            : 'pending',
      },
      {
        label: 'Source',
        value: protectedSourceUnlock?.sourceAvailable === true ? 'available after settlement' : 'withheld',
      },
    ],
    [
      disclosureAccess?.readerAction,
      disclosureAccess?.sourceVisibility,
      disclosureLeakage,
      disclosurePolicy,
      disclosureRoots?.reviewRoot,
      protectedSourceUnlock?.sourceAvailable,
      sourceSafePreview?.accessPolicy,
    ],
  );
  const assetPackPreviewBoundaryRows = useMemo(
    () => [
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
    ],
    [
      assetPackDeliveryPosture,
      assetPackPreviewBoundary,
      assetPackPreviewProofRoots,
      assetPackPreviewReplayReceipt,
      assetPackQuoteReceipt,
      assetPackSelectedFitProvenance,
      assetPackSettlementInstructions,
      previewFeeQuote,
      sourceSafePreview?.roots,
    ],
  );
  const assetPackSettlementBoundaryRows = useMemo(
    () => [
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
    ],
    [
      assetPackSettlementDeliveryUnlock,
      assetPackSettlementFinalityReceipt,
      assetPackSettlementPaymentObservation,
      assetPackSettlementProofRoots,
      assetPackSettlementReconciliation,
      assetPackSettlementReplayReceipt,
      assetPackSettlementRightsDeliveryBoundary,
    ],
  );
  const readingLocalStagingRehearsalRows = useMemo(
    () => [
      {
        label: 'Rehearsal',
        value: shortIdentifier(readingLocalStagingRehearsal?.rehearsalId) || 'pending',
      },
      {
        label: 'Run',
        value: shortIdentifier(readingLocalStagingRehearsal?.runId) || textValue(readingLocalStagingRehearsal?.runId) || 'pending',
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
        value: readingLocalStagingCoverage?.telemetryStreamingReadbackCovered === true ? 'readback covered' : 'pending',
      },
      {
        label: 'Sync',
        value: readingLocalStagingCoverage?.ledgerDatabaseStorageSynchronized === true ? 'aligned' : 'pending',
      },
      {
        label: 'Delivery',
        value: readingLocalStagingCoverage?.postSettlementPullRequestDeliveryCovered === true ? 'post-settlement PR' : 'pending',
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
    ],
    [
      readingLocalStagingCoverage,
      readingLocalStagingProofRoots?.rehearsalRoot,
      readingLocalStagingRehearsal,
      readingLocalStagingStageReadback,
    ],
  );
  const readNeedRows = useMemo(() => {
    if (!currentReadNeed) return [];
    return [
      { label: 'Need id', value: shortIdentifier(currentReadNeed.needId) || currentReadNeed.needId || 'pending' },
      { label: 'Request id', value: shortIdentifier(currentReadNeed.request?.requestId) || currentReadNeed.request?.requestId || 'pending' },
      { label: 'Measurement root', value: shortIdentifier(currentReadNeed.measurementRoot) || currentReadNeed.measurementRoot || 'pending' },
      { label: 'Review state', value: currentReadNeed.reviewState || 'pending' },
      { label: 'Target kinds', value: stringList(currentReadNeed.targetArtifactKinds).join(', ') || 'pending' },
      { label: 'Closure criteria', value: String(stringList(currentReadNeed.closureCriteria).length) },
      {
        label: 'Weighted volume',
        value: String(currentReadNeed.pricingMeasurementInputs?.weightedRequestedVolume ?? 'pending'),
      },
      { label: 'Feedback turns', value: String(stringList(currentReadNeed.feedbackHistory).length) },
      { label: 'Previous Need', value: shortIdentifier(currentReadNeed.request?.previousNeedId) || currentReadNeed.request?.previousNeedId || 'none' },
    ];
  }, [currentReadNeed]);
  const readNeedRuntimeRows = useMemo(() => {
    if (!readNeedReviewRuntime && !readNeedTelemetry && readNeedStorageProjection.length === 0) return [];
    const admission = objectValue(readNeedReviewRuntime?.findingFitsAdmission);
    const proofRoots = objectValue(readNeedReviewRuntime?.proofRoots);
    return [
      { label: 'Runtime', value: shortIdentifier(readNeedReviewRuntime?.runtimeId) || textValue(readNeedReviewRuntime?.runtimeId) || 'pending' },
      { label: 'Action', value: textValue(readNeedReviewRuntime?.action) || 'pending' },
      { label: 'Admission', value: admission?.admitted === true ? 'admitted' : 'blocked' },
      { label: 'Blockers', value: stringList(admission?.blockers).join(', ') || 'none' },
      { label: 'Storage records', value: String(readNeedStorageProjection.length || 'pending') },
      { label: 'Runtime root', value: shortIdentifier(proofRoots?.runtimeRoot) || 'pending' },
      { label: 'Storage root', value: shortIdentifier(proofRoots?.storageRoot) || 'pending' },
      { label: 'Telemetry root', value: shortIdentifier(proofRoots?.telemetryRoot || readNeedTelemetry?.telemetryRoot) || 'pending' },
      { label: 'PTRR step', value: shortIdentifier(readNeedTelemetry?.ptrrStepId) || textValue(readNeedTelemetry?.ptrrStepId) || 'pending' },
      { label: 'Return type', value: textValue(readNeedTelemetry?.returnType) || 'pending' },
    ];
  }, [readNeedReviewRuntime, readNeedStorageProjection, readNeedTelemetry]);
  const stageCards = enterpriseReadingState.steps;
  const canRunLiveFit =
    !showDemonstrationWorkbench &&
    recordingKey === null &&
    harnessState !== 'running' &&
    harnessRequestState.ready;

  const recordActivityId = (value: unknown) => {
    if (!value || typeof value !== 'object') return null;
    const id = (value as { id?: unknown }).id;
    return typeof id === 'string' && id.trim() ? id : null;
  };

  const handleRecord = async (kind: 'deposit' | 'read' | 'fit') => {
    if (!workbench || !onRecordActivity) return;

    setRecordingKey(kind);
    setRecordMessage(null);

    try {
      if (kind === 'deposit') {
        await onRecordActivity(buildTerminalDepositWorkbenchDraft(workbench));
        setRecordMessage('Deposit-side share posture recorded into the Bitcode activity ledger.');
      } else if (kind === 'read') {
        await onRecordActivity(
          buildTerminalReadMeasurementDraft(
            {
              selectedScenarioId: workbench.scenarioLabel,
              parserKind: readRowValue(workbench.read.rows, 'Parser'),
              closureCriteriaCount: Number(readMetricValue(workbench.read.metrics, 'Closure criteria')) || 0,
              targetKindCount: Number(readMetricValue(workbench.read.metrics, 'Target kinds')) || 0,
              scenarios: [
                {
                  id: workbench.scenarioLabel,
                  label: workbench.scenarioLabel,
                  repo: readRowValue(workbench.read.rows, 'Repository'),
                  profile: readRowValue(workbench.read.rows, 'Profile'),
                  selected: true,
                },
              ],
            },
            undefined,
            { sourceRevision: workbench.sourceRevision },
          ),
        );
        setReadFitsFindingProgress('measured');
        setRecordMessage(
          'Measured Read recorded. Next admit it for source-bound Finding Fits, or stop if the Read is too broad or unrelated to the deposited source.',
        );
      } else {
        await onRecordActivity(buildTerminalFitWorkbenchDraft(workbench));
        setReadFitsFindingProgress('fit-recorded');
        setRecordMessage(
          'Fit posture recorded. This records current fit evidence/readiness; settlement and finality remain blocked unless a worthy fit is evidenced.',
        );
      }
    } catch (error) {
      setRecordMessage(error instanceof Error ? error.message : 'Unable to record Bitcode workbench posture.');
    } finally {
      setRecordingKey(null);
    }
  };

  const handleRecordReadAdmission = async () => {
    if (!workbench || !onRecordActivity) return;

    setRecordingKey('read-admission');
    setRecordMessage(null);

    try {
      const recorded = await onRecordActivity(buildTerminalReadAdmissionDraft(workbench));
      setRecordedAdmittedReadActivityId(recordActivityId(recorded));
      setReadFitsFindingProgress('admitted');
      setRecordMessage(
        'Measured Read admitted for Finding Fits. Next run or record the fit result posture as worthy_fit, no_worthy_fit, or blocked_readiness evidence.',
      );
    } catch (error) {
      setRecordMessage(error instanceof Error ? error.message : 'Unable to admit the measured Read for Finding Fits.');
    } finally {
      setRecordingKey(null);
    }
  };

  const handleSynthesizeReadNeed = useCallback(async (action: 'synthesize_read_need' | 'resynthesize_read_need') => {
    if (!workbench) return;

    setReadNeedAction(action === 'synthesize_read_need' ? 'synthesize' : 'resynthesize');
    setReadNeedMessage(null);

    try {
      const sourceRevision = workbench.sourceRevision;
      const response = await fetch('/api/read-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          readNeed: action === 'resynthesize_read_need' ? readNeed : undefined,
          previousReadNeed: action === 'resynthesize_read_need' ? readNeed : undefined,
          readId: harnessReadActivityId || workbench.scenarioLabel,
          readPrompt: workbench.read.summary,
          sourceRevision,
          repositoryFullName: sourceRevision?.repositoryFullName,
          sourceBranch: sourceRevision?.branch,
          sourceCommit: sourceRevision?.commit,
          targetArtifactKinds: workbench.read.targetKinds,
          closureCriteria: workbench.read.closureCriteria,
          feedback: readNeedFeedback.trim() ? [readNeedFeedback.trim()] : [],
        }),
      });

      if (!response.ok) {
        throw new Error(await readTerminalRouteError(response, 'Unable to synthesize the Read-Need.'));
      }

      const payload = objectValue(await response.json());
      const nextNeed = terminalReadNeed(payload?.readNeed);
      if (!nextNeed) throw new Error('Read-Need synthesis did not return a typed Need.');
      setReadNeed(nextNeed);
      setAcceptedReadNeed(null);
      setReadNeedReviewRuntime(objectValue(payload?.readNeedReviewRuntime) as TerminalReadNeedReviewRuntimeState | null);
      setReadNeedStorageProjection(Array.isArray(payload?.storageProjection) ? payload.storageProjection as Array<Record<string, unknown>> : []);
      setReadNeedTelemetry(objectValue(payload?.telemetry));
      setReadNeedSynthesisCount((count) => count + 1);
      setReadNeedMessage(
        action === 'synthesize_read_need'
          ? 'Read-Need synthesized for review before Finding Fits.'
          : 'Read-Need resynthesized with feedback for review.',
      );
    } catch (error) {
      setReadNeedMessage(error instanceof Error ? error.message : 'Unable to synthesize the Read-Need.');
    } finally {
      setReadNeedAction(null);
    }
  }, [harnessReadActivityId, readNeedFeedback, workbench]);

  const handleAcceptReadNeed = useCallback(async () => {
    if (!readNeed) return;

    setReadNeedAction('accept');
    setReadNeedMessage(null);

    try {
      const response = await fetch('/api/read-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'accept_read_need',
          readNeed,
        }),
      });

      if (!response.ok) {
        throw new Error(await readTerminalRouteError(response, 'Unable to accept the Read-Need.'));
      }

      const payload = objectValue(await response.json());
      const accepted = terminalReadNeed(payload?.acceptedReadNeed || payload?.readNeed);
      if (!accepted || accepted.reviewState !== 'accepted') {
        throw new Error('Read-Need acceptance did not return an accepted Need.');
      }
      setAcceptedReadNeed(accepted);
      setReadNeed(accepted);
      setReadNeedReviewRuntime(objectValue(payload?.readNeedReviewRuntime) as TerminalReadNeedReviewRuntimeState | null);
      setReadNeedStorageProjection(Array.isArray(payload?.storageProjection) ? payload.storageProjection as Array<Record<string, unknown>> : []);
      setReadNeedTelemetry(objectValue(payload?.telemetry));
      setReadNeedMessage('Read-Need accepted. Finding Fits can now run against deposited source.');
      await onRecordActivity?.({
        type: 'agentic-execution:read-measurement',
        detailSection: 'activity',
        summary: `Accepted Read-Need ${accepted.needId || 'for Finding Fits'}.`,
        context: {
          source: 'terminal-staged-reading',
          needId: accepted.needId,
          measurementRoot: accepted.measurementRoot,
          reviewState: accepted.reviewState,
          readRequest: accepted.request || null,
          fitsFindingAdmission: payload?.fitsFindingAdmission || payload?.fitSearchAdmission || null,
        },
        output: {
          readNeed: accepted,
          fitsFindingAdmission: payload?.fitsFindingAdmission || payload?.fitSearchAdmission || null,
          assetPackCompletion: {
            bitcodeActivityState: {
              readNeed: accepted,
              fitsFindingAdmission: payload?.fitsFindingAdmission || payload?.fitSearchAdmission || null,
            },
          },
        },
      });
    } catch (error) {
      setReadNeedMessage(error instanceof Error ? error.message : 'Unable to accept the Read-Need.');
    } finally {
      setReadNeedAction(null);
    }
  }, [onRecordActivity, readNeed]);

  const handleRejectReadNeed = useCallback(async () => {
    if (!readNeed) return;

    setReadNeedAction('reject');
    setReadNeedMessage(null);

    try {
      const response = await fetch('/api/read-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject_read_need',
          readNeed,
          feedback: readNeedFeedback.trim() ? [readNeedFeedback.trim()] : [],
        }),
      });

      if (!response.ok) {
        throw new Error(await readTerminalRouteError(response, 'Unable to reject the Read-Need.'));
      }

      const payload = objectValue(await response.json());
      const rejected = terminalReadNeed(payload?.rejectedReadNeed || payload?.readNeed);
      if (!rejected || rejected.reviewState !== 'rejected') {
        throw new Error('Read-Need rejection did not return a rejected Need.');
      }
      setReadNeed(rejected);
      setAcceptedReadNeed(null);
      setReadNeedReviewRuntime(objectValue(payload?.readNeedReviewRuntime) as TerminalReadNeedReviewRuntimeState | null);
      setReadNeedStorageProjection(Array.isArray(payload?.storageProjection) ? payload.storageProjection as Array<Record<string, unknown>> : []);
      setReadNeedTelemetry(objectValue(payload?.telemetry));
      setReadNeedMessage('Read-Need rejected. Finding Fits remains blocked until a resynthesized Need is accepted.');
    } catch (error) {
      setReadNeedMessage(error instanceof Error ? error.message : 'Unable to reject the Read-Need.');
    } finally {
      setReadNeedAction(null);
    }
  }, [readNeed, readNeedFeedback]);

  const handleRunLiveFit = useCallback(async () => {
    if (!harnessRequestState.ready) {
      setHarnessState('failed');
      setHarnessMessage(`Live fit cannot start yet: missing ${harnessRequestState.missing.join(', ')}.`);
      return;
    }

    setHarnessState('running');
    setHarnessMessage('Starting live AssetPack fit harness...');
    setHarnessEvents([]);
    setHarnessUserHasScrolled(false);

    try {
      await streamTerminalReadFitsFindingSynthesisHarness(harnessRequestState.request, {
        onEvent: (event) => {
          setHarnessEvents((currentEvents) => [...currentEvents.slice(-79), event]);
          setHarnessMessage(summarizeTerminalReadFitsFindingSynthesisHarnessEvent(event));
        },
      });
      setHarnessState('completed');
      setRecordMessage('Live AssetPack fit harness completed. Refreshing activity and telemetry readback.');
      await onHarnessCompleted?.();
    } catch (error) {
      setHarnessState('failed');
      setHarnessMessage(error instanceof Error ? error.message : 'Live AssetPack fit harness failed.');
    }
  }, [harnessRequestState, onHarnessCompleted]);

  if (!workbench) {
    return (
      <TerminalWorkspaceCard
        id="terminalDepositReadWorkbench"
        kicker="Deposit + read chain"
        title="Read supply, read measurement, and fit together"
        summary="Reading the live deposit-side source, read measurement, and asset-pack fit posture."
        explainer={TERMINAL_WORKSPACE_EXPLAINERS.depositReadChain}
      >
        <p className="mt-4 text-sm leading-6 text-neutral-300">
          Reading the live Bitcode workbench. The enterprise Reading path runs
          ReadNeedComprehensionSynthesis before ReadFitsFindingSynthesis, and it remains
          visible even before a repository is selected.
        </p>
        <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {TERMINAL_ENTERPRISE_READING_STEPS.map((stage) => (
            <li key={stage.id} className="border-l border-sky-300/30 pl-3">
              <p className="text-sm font-semibold text-neutral-100">{stage.label}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-400">{stage.lowDetailGuidance}</p>
            </li>
          ))}
        </ol>
      </TerminalWorkspaceCard>
    );
  }

  return (
    <TerminalWorkspaceCard
      id="terminalDepositReadWorkbench"
      kicker="Deposit + read chain"
      title="Read supply, read measurement, and fit together"
      summary="Keep the deposit-side source, active reader demand frame, and asset-pack fit posture readable as one operating chain."
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.depositReadChain}
      headerAside={
        <BitcodeMetricGrid
          metrics={[
            { label: 'Projection', value: workbench.projectionPrincipal },
            { label: 'Branch mode', value: workbench.branchMode },
            { label: 'Scenario', value: workbench.scenarioLabel },
            { label: 'Profile', value: workbench.profileLabel },
          ]}
          columnsClassName="tablet:grid-cols-2"
          itemClassName="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
          labelClassName="text-[0.62rem] uppercase tracking-[0.16em] text-emerald-300/85"
          valueClassName="text-sm font-semibold text-neutral-200"
        />
      }
    >
      {recordMessage ? (
        <div className="mt-4 rounded-[1.3rem] border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-neutral-200">
          {recordMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <TerminalActionWorkbenchCard
          id="terminalDepositWorkbench"
          badge="deposit"
          title="Repository supply and technical-intelligence posture"
          summary={workbench.deposit.summary}
          metrics={workbench.deposit.metrics}
          rows={workbench.deposit.rows}
          chips={selectedEntryChips.length ? selectedEntryChips : workbench.deposit.artifactKinds}
          actionLabel="Focus deposit draft"
          actionTarget="terminalDepositComposer"
          secondaryActionLabel={recordingKey === 'deposit' ? 'Recording…' : 'Record deposit posture'}
          secondaryActionDisabled={recordingKey !== null}
          onSecondaryAction={() => {
            void handleRecord('deposit');
          }}
        />
        <TerminalActionWorkbenchCard
          id="terminalReadWorkbench"
          badge="read"
          title="Read measurement and scenario posture"
          summary={workbench.read.summary}
          metrics={workbench.read.metrics}
          rows={workbench.read.rows}
          chips={workbench.read.closureCriteria.length ? workbench.read.closureCriteria : workbench.read.targetKinds}
          actionLabel={showDemonstrationWorkbench ? 'Focus read scenarios' : 'Review measured Read'}
          actionTarget={showDemonstrationWorkbench ? 'terminalReadScenarios' : 'terminalReadWorkbench'}
          secondaryActionLabel={recordingKey === 'read' ? 'Recording…' : 'Record read posture'}
          secondaryActionDisabled={recordingKey !== null}
          onSecondaryAction={() => {
            void handleRecord('read');
          }}
        />
      </div>

      <section
        className="mt-5 rounded-[1.45rem] border border-sky-300/18 bg-sky-300/[0.06] px-5 py-5"
        data-reading-route-stage={enterpriseReadingState.routeState.routeReadingStage || ''}
        data-reading-transaction-present={enterpriseReadingState.routeState.transactionIdPresent ? 'true' : 'false'}
        data-reading-failure-kind={enterpriseReadingState.routeState.failureKind}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[0.66rem] uppercase tracking-[0.2em] text-sky-200/80">staged reading</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Request Read, review Need, request Fit, review AssetPack, buy and settle</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
              The live pipeline starts from an accepted Read-Need. Preview can expose measurements, roots, score, fee quote, and range posture. Protected source unlock requires settlement.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-200">
            {activeReadingStage.replace(/-/g, ' ')}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {stageCards.map((stage) => {
            const active = stage.id === activeReadingStage;
            return (
              <div
                key={stage.id}
                data-testid={`terminal-enterprise-reading-step-${stage.id}`}
                data-reading-step-state={stage.state}
                className={`rounded-[1.05rem] border px-3 py-4 text-sm ${
                  active ? 'border-sky-300/35 bg-sky-300/10' : 'border-white/8 bg-black/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-neutral-100">{stage.label}</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.56rem] uppercase tracking-[0.12em] text-neutral-400">
                    {stage.state}
                  </span>
                </div>
                <p className="mt-2 leading-5 text-neutral-400">{stage.lowDetailGuidance}</p>
                <details className="mt-3 rounded-[0.75rem] border border-white/8 bg-black/20 px-3 py-2">
                  <summary className="cursor-pointer text-[0.6rem] uppercase tracking-[0.14em] text-sky-200/80">
                    Source-safe detail
                  </summary>
                  <p className="mt-2 text-xs leading-5 text-neutral-300">{stage.expandableDetail}</p>
                  <dl className="mt-2 grid gap-1.5">
                    <div>
                      <dt className="text-[0.55rem] uppercase tracking-[0.12em] text-neutral-500">visible</dt>
                      <dd className="mt-0.5 break-words font-mono text-[0.62rem] text-neutral-300">
                        {stage.sourceSafeVisibleFields.join(', ')}
                      </dd>
                    </div>
                    {stage.blockers.length ? (
                      <div>
                        <dt className="text-[0.55rem] uppercase tracking-[0.12em] text-neutral-500">blocked by</dt>
                        <dd className="mt-0.5 break-words font-mono text-[0.62rem] text-neutral-300">
                          {stage.blockers.join(', ')}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </details>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[0.64rem] uppercase tracking-[0.18em] text-neutral-500">Read-Need review</p>
                <p className="mt-2 text-sm leading-6 text-neutral-300">
                  {currentReadNeed
                    ? `${currentReadNeed.needId || 'Read-Need'} is ${currentReadNeed.reviewState || 'pending'}.`
                    : 'Synthesize the reader request into a reviewable Need before searching deposits.'}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-300">
                attempts {readNeedSynthesisCount}
              </span>
            </div>

            {readNeedMessage ? (
              <p className="mt-3 rounded-[0.9rem] border border-white/8 bg-white/[0.04] px-3 py-3 text-sm leading-6 text-neutral-200">
                {readNeedMessage}
              </p>
            ) : null}

            <label className="mt-4 block">
              <span className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">Need feedback</span>
              <textarea
                value={readNeedFeedback}
                onChange={(event) => setReadNeedFeedback(event.target.value)}
                rows={3}
                placeholder="Optional feedback before requesting another Read-Need synthesis."
                className="mt-2 w-full resize-none rounded-[1rem] border border-white/8 bg-black/30 px-3 py-3 text-sm leading-6 text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-sky-300/35"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={readNeedAction !== null || !workbench.sourceRevision}
                onClick={() => {
                  void handleSynthesizeReadNeed('synthesize_read_need');
                }}
                className="rounded-[1.2rem] border border-sky-300/30 bg-sky-300/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:border-sky-200/50 hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {readNeedAction === 'synthesize' ? 'Synthesizing…' : 'Synthesize Read-Need'}
              </button>
              <button
                type="button"
                disabled={readNeedAction !== null || !readNeed || readNeed.reviewState === 'accepted'}
                onClick={() => {
                  void handleSynthesizeReadNeed('resynthesize_read_need');
                }}
                className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {readNeedAction === 'resynthesize' ? 'Resynthesizing…' : 'Resynthesize with feedback'}
              </button>
              <button
                type="button"
                disabled={readNeedAction !== null || !readNeed || readNeed.reviewState === 'accepted'}
                onClick={() => {
                  void handleAcceptReadNeed();
                }}
                className="rounded-[1.2rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {readNeedAction === 'accept' ? 'Accepting…' : 'Accept Read-Need'}
              </button>
              <button
                type="button"
                disabled={readNeedAction !== null || !readNeed || readNeed.reviewState === 'accepted'}
                onClick={() => {
                  void handleRejectReadNeed();
                }}
                className="rounded-[1.2rem] border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm font-medium text-red-100 transition hover:border-red-200/50 hover:bg-red-300/15 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {readNeedAction === 'reject' ? 'Rejecting…' : 'Reject Read-Need'}
              </button>
              <button
                type="button"
                disabled={!canRunLiveFit}
                onClick={() => {
                  void handleRunLiveFit();
                }}
                className="rounded-[1.2rem] border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {harnessState === 'running' ? 'Running Finding Fits…' : 'Request Fit'}
              </button>
            </div>
          </div>

          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4">
            <p className="text-[0.64rem] uppercase tracking-[0.18em] text-neutral-500">Source-safe preview and settlement readback</p>
            <dl className="mt-3 grid gap-2">
              {[
                { label: 'AssetPack', value: textValue(sourceSafePreview?.assetPackId) || 'pending' },
                { label: 'Fee quote', value: numericValue(previewFeeQuote?.sats) ? `${String(previewFeeQuote?.sats)} sats` : 'pending' },
                { label: 'Quote root', value: shortIdentifier(previewFeeQuote?.quoteRoot) || 'pending' },
                { label: 'Range projection', value: objectValue(sourceSafePreview?.rangeProjection)?.tokenCount ? `${String(objectValue(sourceSafePreview?.rangeProjection)?.tokenCount)} cells` : 'pending' },
                { label: 'Ledger', value: textValue(ledgerSettlement?.status) || 'pending' },
                { label: 'Access', value: textValue(objectValue(sourceSafePreview?.accessPolicy)?.readRightState) || 'pending settlement' },
                { label: 'Unlock', value: protectedSourceUnlock?.sourceAvailable === true ? 'source available' : textValue(protectedSourceUnlock?.state) || 'withheld' },
                { label: 'Read license', value: shortIdentifier(ledgerSettlement?.readLicenseId) || 'pending' },
                { label: 'BTC fee', value: shortIdentifier(ledgerSettlement?.btcFeeReceiptId) || 'pending' },
                { label: 'PR target', value: textValue(previewDelivery?.pullRequestTarget) || textValue(assetPackDeliveryPosture?.pullRequestTarget) || 'pending' },
              ].map((row) => (
                <div key={row.label} className="rounded-[0.9rem] border border-white/8 bg-white/[0.03] px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">{row.label}</dt>
                  <dd className="mt-1 break-words font-mono text-[0.7rem] text-neutral-200">{row.value}</dd>
                </div>
              ))}
            </dl>
            <details className="mt-3 rounded-[0.9rem] border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-3">
              <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.14em] text-cyan-100/85">
                Finding Fits preview, quote, and provenance
              </summary>
              <dl className="mt-3 grid gap-2 md:grid-cols-2">
                {assetPackPreviewBoundaryRows.map((row) => (
                  <div key={row.label} className="rounded-[0.75rem] border border-white/8 bg-black/20 px-3 py-2">
                    <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">{row.label}</dt>
                    <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-100">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details className="mt-3 rounded-[0.9rem] border border-amber-300/15 bg-amber-300/[0.04] px-3 py-3">
              <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.14em] text-amber-100/85">
                Settlement rights, compensation, and delivery
              </summary>
              <dl className="mt-3 grid gap-2 md:grid-cols-2">
                {assetPackSettlementBoundaryRows.map((row) => (
                  <div key={row.label} className="rounded-[0.75rem] border border-white/8 bg-black/20 px-3 py-2">
                    <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">{row.label}</dt>
                    <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-100">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details className="mt-3 rounded-[0.9rem] border border-violet-300/15 bg-violet-300/[0.04] px-3 py-3">
              <summary className="cursor-pointer text-[0.58rem] uppercase tracking-[0.14em] text-violet-100/85">
                Local/staging MVP rehearsal
              </summary>
              <dl className="mt-3 grid gap-2 md:grid-cols-2">
                {readingLocalStagingRehearsalRows.map((row) => (
                  <div key={row.label} className="rounded-[0.75rem] border border-white/8 bg-black/20 px-3 py-2">
                    <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">{row.label}</dt>
                    <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-100">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <div className="mt-3 rounded-[0.9rem] border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.14em] text-emerald-200/80">Disclosure review</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-300">
                    Measurements, roots, fit ids, fee quote, and policy posture are visible. Protected source stays withheld until the paid read-right unlock is proven.
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.12em] ${disclosureSourceSafe ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-red-300/20 bg-red-300/10 text-red-100'}`}>
                  {disclosureSourceSafe ? 'source-safe' : 'blocked'}
                </span>
              </div>
              <dl className="mt-3 grid gap-2 md:grid-cols-2">
                {disclosureRows.map((row) => (
                  <div key={row.label} className="rounded-[0.75rem] border border-white/8 bg-black/20 px-3 py-2">
                    <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">{row.label}</dt>
                    <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-100">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {readNeedRows.length ? (
          <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {readNeedRows.map((row) => (
              <div key={row.label} className="rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3 text-sm">
                <dt className="text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">{row.label}</dt>
                <dd className="mt-1 break-words text-neutral-100">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {readNeedRuntimeRows.length ? (
          <details className="mt-4 rounded-[1.05rem] border border-white/8 bg-black/20 px-4 py-4">
            <summary className="cursor-pointer text-[0.62rem] uppercase tracking-[0.16em] text-sky-200/80">
              Need runtime, storage, and telemetry
            </summary>
            <dl className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {readNeedRuntimeRows.map((row) => (
                <div key={row.label} className="rounded-[0.9rem] border border-white/8 bg-white/[0.03] px-3 py-2">
                  <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">{row.label}</dt>
                  <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-100">{row.value}</dd>
                </div>
              ))}
            </dl>
            {readNeedStorageProjection.length ? (
              <div className="mt-3 grid gap-2">
                {readNeedStorageProjection.map((record, index) => (
                  <div key={`${String(record.recordId || index)}`} className="rounded-[0.85rem] border border-white/8 bg-black/25 px-3 py-2">
                    <p className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">
                      {textValue(record.recordKind) || 'storage record'}
                    </p>
                    <p className="mt-1 break-words font-mono text-[0.66rem] text-neutral-200">
                      {shortIdentifier(record.root) || textValue(record.root) || 'pending'}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </details>
        ) : null}
      </section>

      <section className="mt-5 rounded-[1.45rem] border border-emerald-400/16 bg-emerald-400/[0.06] px-5 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-200/80">read state</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Measured Read before fit result</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
              Recording a Read stores the measured demand frame. It does not mean Bitcode found a fit. Finding Fits must then return
              worthy_fit, no_worthy_fit, or blocked_readiness before settlement or finality can proceed.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-200">
            {readFitsFindingProgress.replace('-', ' ')}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            { id: 'draft', label: '1. Read framed', detail: 'Repository, branch, commit, and demand frame are visible.' },
            { id: 'measured', label: '2. Read measured', detail: 'Read posture is persisted as ledger evidence.' },
            { id: 'admitted', label: '3. Fit admitted', detail: 'Measured Read may enter source-bound Finding Fits.' },
            { id: 'fit-recorded', label: '4. Result recorded', detail: 'Fit result posture is reviewable before proof or settlement.' },
          ].map((step) => {
            const active = step.id === readFitsFindingProgress;
            return (
              <div
                key={step.id}
                className={`rounded-[1.1rem] border px-4 py-4 text-sm ${
                  active ? 'border-emerald-300/35 bg-emerald-300/10' : 'border-white/8 bg-black/20'
                }`}
              >
                <p className="font-semibold text-neutral-100">{step.label}</p>
                <p className="mt-2 leading-6 text-neutral-400">{step.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={recordingKey !== null || readFitsFindingProgress !== 'measured'}
            onClick={() => {
              void handleRecordReadAdmission();
            }}
            className="rounded-[1.25rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {readAdmissionActionLabel}
          </button>
          <button
            type="button"
            disabled={recordingKey !== null}
            onClick={() => jumpToShellSection('terminalFitWorkbench')}
            className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
          >
            Review fit result posture
          </button>
          <button
            type="button"
            disabled={!canRunLiveFit}
            onClick={() => {
              void handleRunLiveFit();
            }}
            className="rounded-[1.25rem] border border-sky-300/30 bg-sky-300/10 px-4 py-3 text-sm font-medium text-sky-100 transition hover:border-sky-200/50 hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {liveFitActionLabel}
          </button>
          <button
            type="button"
            disabled={recordingKey !== null || readFitsFindingProgress !== 'admitted'}
            onClick={() => {
              void handleRecord('fit');
            }}
            className="rounded-[1.25rem] border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {fitResultActionLabel}
          </button>
        </div>
        {!showDemonstrationWorkbench && (harnessMessage || !harnessRequestState.ready || harnessEvents.length > 0) ? (
          <div className="mt-4 rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-neutral-300">
            <p className="font-medium text-neutral-100">
              {harnessMessage ||
                `Live fit waiting for ${harnessRequestState.ready ? 'stream events' : harnessRequestState.missing.join(', ')}.`}
            </p>
            {harnessIdentifierRows.length ? (
              <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {harnessIdentifierRows.map((row) => (
                  <div key={row.label} className="rounded-[0.9rem] border border-white/8 bg-white/[0.03] px-3 py-2">
                    <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">{row.label}</dt>
                    <dd className="mt-1 break-words font-mono text-[0.7rem] text-neutral-200">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {(harnessEvents.length || harnessState === 'running' || harnessState === 'failed') ? (
              <div className="mt-4 overflow-hidden rounded-[1rem] border border-white/8 bg-[rgba(5,9,18,0.88)]">
                <BitcodeExecutionStreamPanel
                  className="relative"
                  isProcessing={harnessState === 'running'}
                  executionState={harnessStreamSnapshot.executionState}
                  isStreamingComplete={harnessStreamSnapshot.isStreamingComplete}
                  generationCount={harnessStreamSnapshot.generationCount}
                  error={harnessStreamSnapshot.error}
                  runId={harnessStreamSnapshot.runId || undefined}
                  metadataRows={harnessIdentifierRows}
                  output={harnessStreamSnapshot.output}
                  outputDetails={harnessStreamSnapshot.outputDetails}
                  onRetry={() => {
                    void handleRunLiveFit();
                  }}
                  onDismissError={() => {
                    setHarnessMessage(null);
                  }}
                  userHasScrolled={harnessUserHasScrolled}
                  setUserHasScrolled={setHarnessUserHasScrolled}
                  compact={true}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <article
        id="terminalFitWorkbench"
        className="mt-5 rounded-[1.6rem] border border-amber-400/18 bg-amber-400/5 px-5 py-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.66rem] uppercase tracking-[0.2em] text-amber-200/80">fit</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Asset-pack fit and settlement intent</h3>
          </div>
          <button
            type="button"
            onClick={() => jumpToShellSection('terminalFitWorkbench')}
            className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/15"
          >
            Focus asset-pack fit
          </button>
          <button
            type="button"
            disabled={recordingKey !== null || readFitsFindingProgress === 'fit-recorded'}
            onClick={() => {
              void handleRecord('fit');
            }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {fitResultActionLabel}
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-300">{workbench.fit.summary}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {workbench.fit.metrics.map((metric) => (
            <div key={`fit-${metric.label}`} className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">{metric.label}</p>
              <p className="mt-2 text-base font-semibold text-white">{metric.value}</p>
            </div>
          ))}
        </div>

        <dl className="mt-4 grid gap-3 lg:grid-cols-2">
          {workbench.fit.rows.map((row) => (
            <div key={`fit-${row.label}`} className="rounded-[1.15rem] border border-white/8 bg-black/20 px-4 py-4 text-sm">
              <dt className="text-neutral-500">{row.label}</dt>
              <dd className="mt-1 break-words text-neutral-100">{row.value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </TerminalWorkspaceCard>
  );
}
