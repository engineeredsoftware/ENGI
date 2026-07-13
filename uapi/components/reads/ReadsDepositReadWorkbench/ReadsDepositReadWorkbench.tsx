/**
 * Reads/deposit workbench orchestration (shared synthesize + fit review).
 * Composes supply cards, staged reading, admission, and fit panels.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';

import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid/BitcodeMetricGrid';
import BitcodeWorkspaceCard from '@/components/bitcode/pipeline/BitcodeWorkspaceCard/BitcodeWorkspaceCard';
import type { TerminalActivityRecordDraft } from '@/components/bitcode/pipeline/models/pipeline-activity-history';
import { TERMINAL_WORKSPACE_EXPLAINERS } from '@/components/bitcode/pipeline/models/workspace-explainers';
import type { TerminalRepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';
import {
  buildLiveTerminalDepositReadWorkbenchSnapshot,
  normalizeTerminalDepositReadWorkbench,
  type TerminalDepositedSourceRevision,
  type TerminalDepositReadWorkbench as TerminalDepositReadWorkbenchState,
  type TerminalEnterpriseReadingStepId,
} from '@/components/reads/models/deposit-read-workbench';
import {
  buildAssetPackPreviewBoundaryRows,
  buildAssetPackSettlementBoundaryRows,
  buildDisclosureRows,
  buildReadNeedRows,
  buildReadNeedRuntimeRows,
  buildReadingLocalStagingRehearsalRows,
  buildSourceSafePreviewSummaryRows,
} from '@/components/reads/models/deposit-read-evidence-rows';
import { buildTerminalEnterpriseReadingUxState } from '@/components/reads/models/enterprise-reading-ux-state';
import { useBitcodeShellBridge } from '@/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge';
import type { ReadFitsFindingProgressState } from '@/components/reads/models/read-workbench-values';
import { ReadsDepositWorkbenchSupplyCards } from '@/components/reads/ReadsDepositWorkbenchSupplyCards/ReadsDepositWorkbenchSupplyCards';
import ReadsDepositReadWorkbenchEmpty from '@/components/reads/ReadsDepositReadWorkbenchEmpty/ReadsDepositReadWorkbenchEmpty';
import ReadsDepositStagedReadingSection from '@/components/reads/ReadsDepositStagedReadingSection/ReadsDepositStagedReadingSection';
import ReadsMeasuredReadAdmissionPanel from '@/components/reads/ReadsMeasuredReadAdmissionPanel/ReadsMeasuredReadAdmissionPanel';
import ReadsFitWorkbenchPanel from '@/components/reads/ReadsFitWorkbenchPanel/ReadsFitWorkbenchPanel';
import { useDepositReadActivityRecording } from '@/components/reads/ReadsDepositReadWorkbench/hooks/use-deposit-read-activity-recording';
import { useDepositReadHarness } from '@/components/reads/ReadsDepositReadWorkbench/hooks/use-deposit-read-harness';
import { useDepositReadNeedActions } from '@/components/reads/ReadsDepositReadWorkbench/hooks/use-deposit-read-need-actions';

type ReadingStageId = TerminalEnterpriseReadingStepId;

interface TerminalDepositReadWorkbenchProps {
  repositoryContext?: TerminalRepositoryContextState | null;
  depositedSourceRevision?: TerminalDepositedSourceRevision | null;
  admittedReadActivityId?: string | null;
  routeReadingStage?: TerminalEnterpriseReadingStepId | null;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  onHarnessCompleted?: () => Promise<unknown> | unknown;
  showDemonstrationWorkbench?: boolean;
}

export default function ReadsDepositReadWorkbench({
  repositoryContext = null,
  depositedSourceRevision = null,
  admittedReadActivityId = null,
  routeReadingStage = null,
  onRecordActivity,
  onHarnessCompleted,
  showDemonstrationWorkbench = true,
}: TerminalDepositReadWorkbenchProps) {
  const { snapshot } = useBitcodeShellBridge();
  const [readFitsFindingProgress, setReadFitsFindingProgress] =
    useState<ReadFitsFindingProgressState>('draft');
  const [recordedAdmittedReadActivityId, setRecordedAdmittedReadActivityId] = useState<string | null>(
    null,
  );

  const workbenchSnapshot = useMemo(() => {
    const liveWorkbenchSnapshot = buildLiveTerminalDepositReadWorkbenchSnapshot(
      repositoryContext,
      depositedSourceRevision,
    );
    if (showDemonstrationWorkbench) return snapshot || liveWorkbenchSnapshot;
    return liveWorkbenchSnapshot;
  }, [depositedSourceRevision, repositoryContext, showDemonstrationWorkbench, snapshot]);

  const workbench = useMemo<TerminalDepositReadWorkbenchState | null>(
    () => normalizeTerminalDepositReadWorkbench(workbenchSnapshot, repositoryContext),
    [repositoryContext, workbenchSnapshot],
  );

  const scenarioKey = `${workbench?.scenarioLabel || ''}:${workbench?.sourceRevision?.commit || ''}`;
  const harnessReadActivityId = recordedAdmittedReadActivityId || admittedReadActivityId;

  const {
    recordingKey,
    recordMessage,
    setRecordMessage,
    resetRecordingSession,
    handleRecord,
    handleRecordReadAdmission,
  } = useDepositReadActivityRecording({
    workbench,
    onRecordActivity,
    setReadFitsFindingProgress,
    setRecordedAdmittedReadActivityId,
  });

  const {
    readNeed,
    acceptedReadNeed,
    readNeedReviewRuntime,
    readNeedStorageProjection,
    readNeedTelemetry,
    readNeedFeedback,
    setReadNeedFeedback,
    readNeedMessage,
    readNeedAction,
    readNeedSynthesisCount,
    resetReadNeedSession,
    handleSynthesizeReadNeed,
    handleAcceptReadNeed,
    handleRejectReadNeed,
  } = useDepositReadNeedActions({
    workbench,
    harnessReadActivityId,
    onRecordActivity,
  });

  const {
    harnessState,
    harnessMessage,
    setHarnessMessage,
    harnessEvents,
    harnessUserHasScrolled,
    setHarnessUserHasScrolled,
    harnessRequestState,
    harnessIdentifierRows,
    harnessStreamSnapshot,
    evidence,
    resetHarnessSession,
    handleRunLiveFit,
  } = useDepositReadHarness({
    workbench,
    repositoryContext,
    depositedSourceRevision,
    harnessReadActivityId,
    acceptedReadNeed,
    onHarnessCompleted,
    setRecordMessage,
  });

  useEffect(() => {
    setReadFitsFindingProgress('draft');
    setRecordedAdmittedReadActivityId(null);
    resetRecordingSession();
    resetHarnessSession();
    resetReadNeedSession();
  }, [scenarioKey, resetHarnessSession, resetReadNeedSession, resetRecordingSession]);

  useEffect(() => {
    if (!admittedReadActivityId) return;
    setReadFitsFindingProgress((currentProgress) =>
      currentProgress === 'draft' ? 'admitted' : currentProgress,
    );
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
        hasSourceSafePreview: Boolean(evidence.sourceSafePreview),
        hasSettlementReadback: evidence.settledReadback,
        hasDeliveryReadback: evidence.pullRequestDelivered,
        retryRequested: readNeedSynthesisCount > 1 || harnessState === 'failed',
        failureKind: harnessState === 'failed' ? 'fits_finding_failed' : null,
        sourceSafePreviewBlocked: Boolean(evidence.sourceSafePreview && !evidence.disclosureSourceSafe),
        disclosureLeakageDetected: evidence.disclosureLeakage?.protectedSourceDetected === true,
      }),
    [
      acceptedReadNeed,
      admittedReadActivityId,
      evidence.disclosureLeakage?.protectedSourceDetected,
      evidence.disclosureSourceSafe,
      evidence.pullRequestDelivered,
      evidence.settledReadback,
      evidence.sourceSafePreview,
      harnessReadActivityId,
      harnessState,
      readNeed,
      readNeedSynthesisCount,
      readFitsFindingProgress,
      recordedAdmittedReadActivityId,
      routeReadingStage,
      workbench?.sourceRevision,
    ],
  );

  const activeReadingStage: ReadingStageId = enterpriseReadingState.activeStepId;
  const currentReadNeed = acceptedReadNeed || readNeed;

  const disclosureRows = useMemo(() => buildDisclosureRows(evidence), [evidence]);
  const assetPackPreviewBoundaryRows = useMemo(
    () => buildAssetPackPreviewBoundaryRows(evidence),
    [evidence],
  );
  const assetPackSettlementBoundaryRows = useMemo(
    () => buildAssetPackSettlementBoundaryRows(evidence),
    [evidence],
  );
  const readingLocalStagingRehearsalRows = useMemo(
    () => buildReadingLocalStagingRehearsalRows(evidence),
    [evidence],
  );
  const sourceSafeSummaryRows = useMemo(() => buildSourceSafePreviewSummaryRows(evidence), [evidence]);
  const readNeedRows = useMemo(() => buildReadNeedRows(currentReadNeed), [currentReadNeed]);
  const readNeedRuntimeRows = useMemo(
    () =>
      buildReadNeedRuntimeRows({
        readNeedReviewRuntime,
        readNeedTelemetry,
        readNeedStorageProjection,
      }),
    [readNeedReviewRuntime, readNeedStorageProjection, readNeedTelemetry],
  );

  const canRunLiveFit =
    !showDemonstrationWorkbench &&
    recordingKey === null &&
    harnessState !== 'running' &&
    harnessRequestState.ready;

  if (!workbench) {
    return <ReadsDepositReadWorkbenchEmpty />;
  }

  return (
    <BitcodeWorkspaceCard
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

      <ReadsDepositWorkbenchSupplyCards
        deposit={workbench.deposit}
        read={workbench.read}
        selectedEntryChips={selectedEntryChips}
        recordingKey={recordingKey}
        showDemonstrationWorkbench={showDemonstrationWorkbench}
        onRecord={(key) => {
          void handleRecord(key);
        }}
      />

      <ReadsDepositStagedReadingSection
        activeReadingStage={activeReadingStage}
        routeReadingStage={enterpriseReadingState.routeState.routeReadingStage}
        transactionIdPresent={enterpriseReadingState.routeState.transactionIdPresent}
        failureKind={enterpriseReadingState.routeState.failureKind}
        stages={enterpriseReadingState.steps}
        needReview={{
          currentReadNeed,
          readNeed,
          readNeedFeedback,
          readNeedMessage,
          readNeedAction,
          readNeedSynthesisCount,
          hasSourceRevision: Boolean(workbench.sourceRevision),
          canRunLiveFit,
          harnessState,
          onFeedbackChange: setReadNeedFeedback,
          onSynthesize: (action) => {
            void handleSynthesizeReadNeed(action);
          },
          onAccept: () => {
            void handleAcceptReadNeed();
          },
          onReject: () => {
            void handleRejectReadNeed();
          },
          onRequestFit: () => {
            void handleRunLiveFit();
          },
        }}
        sourceSafePreview={{
          summaryRows: sourceSafeSummaryRows,
          assetPackPreviewBoundaryRows,
          assetPackSettlementBoundaryRows,
          readingLocalStagingRehearsalRows,
          disclosureRows,
          disclosureSourceSafe: evidence.disclosureSourceSafe,
        }}
        readNeedRows={readNeedRows}
        readNeedRuntimeRows={readNeedRuntimeRows}
        readNeedStorageProjection={readNeedStorageProjection}
      />

      <ReadsMeasuredReadAdmissionPanel
        readFitsFindingProgress={readFitsFindingProgress}
        recordingKey={recordingKey}
        readAdmissionActionLabel={readAdmissionActionLabel}
        fitResultActionLabel={fitResultActionLabel}
        liveFitActionLabel={liveFitActionLabel}
        canRunLiveFit={canRunLiveFit}
        showDemonstrationWorkbench={showDemonstrationWorkbench}
        harnessMessage={harnessMessage}
        harnessRequestReady={harnessRequestState.ready}
        harnessRequestMissing={harnessRequestState.ready ? [] : harnessRequestState.missing}
        harnessIdentifierRows={harnessIdentifierRows}
        harnessEventsLength={harnessEvents.length}
        harnessState={harnessState}
        harnessStreamSnapshot={harnessStreamSnapshot}
        harnessUserHasScrolled={harnessUserHasScrolled}
        setHarnessUserHasScrolled={setHarnessUserHasScrolled}
        setHarnessMessage={setHarnessMessage}
        onRecordReadAdmission={() => {
          void handleRecordReadAdmission();
        }}
        onRunLiveFit={() => {
          void handleRunLiveFit();
        }}
        onRecordFit={() => {
          void handleRecord('fit');
        }}
      />

      <ReadsFitWorkbenchPanel
        summary={workbench.fit.summary}
        metrics={workbench.fit.metrics}
        rows={workbench.fit.rows}
        recordingKey={recordingKey}
        readFitsFindingProgress={readFitsFindingProgress}
        fitResultActionLabel={fitResultActionLabel}
        onRecordFit={() => {
          void handleRecord('fit');
        }}
      />
    </BitcodeWorkspaceCard>
  );
}
