/**
 * Live Finding Fits harness stream state for the deposit/read workbench.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { TerminalRepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';
import {
  buildTerminalReadFitsFindingSynthesisHarnessRequest,
  buildTerminalReadFitsFindingSynthesisHarnessStreamSnapshot,
  streamTerminalReadFitsFindingSynthesisHarness,
  summarizeTerminalReadFitsFindingSynthesisHarnessEvent,
  type TerminalReadFitsFindingSynthesisHarnessEvent,
} from '@/components/bitcode/pipeline/PipelineHarnessClient/pipeline-harness-client';
import type {
  TerminalDepositedSourceRevision,
  TerminalDepositReadWorkbench,
} from '@/components/reads/models/deposit-read-workbench';
import {
  buildHarnessIdentifierRows,
  deriveDepositReadCompletedEvidence,
  extractCompletedHarnessEvidence,
} from '@/components/reads/models/deposit-read-evidence-rows';
import type { TerminalReadNeedState } from '@/components/reads/models/read-workbench-values';

export type UseDepositReadHarnessParams = {
  workbench: TerminalDepositReadWorkbench | null;
  repositoryContext?: TerminalRepositoryContextState | null;
  depositedSourceRevision?: TerminalDepositedSourceRevision | null;
  harnessReadActivityId: string | null;
  acceptedReadNeed: TerminalReadNeedState | null;
  onHarnessCompleted?: () => Promise<unknown> | unknown;
  setRecordMessage: (message: string | null) => void;
};

export function useDepositReadHarness({
  workbench,
  repositoryContext,
  depositedSourceRevision,
  harnessReadActivityId,
  acceptedReadNeed,
  onHarnessCompleted,
  setRecordMessage,
}: UseDepositReadHarnessParams) {
  const [harnessState, setHarnessState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [harnessMessage, setHarnessMessage] = useState<string | null>(null);
  const [harnessEvents, setHarnessEvents] = useState<TerminalReadFitsFindingSynthesisHarnessEvent[]>([]);
  const [harnessUserHasScrolled, setHarnessUserHasScrolled] = useState(false);

  const resetHarnessSession = useCallback(() => {
    setHarnessState('idle');
    setHarnessMessage(null);
    setHarnessEvents([]);
    setHarnessUserHasScrolled(false);
  }, []);

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

  const harnessIdentifierRows = useMemo(
    () =>
      buildHarnessIdentifierRows({
        harnessRequestState,
        acceptedReadNeed,
        harnessEvents,
      }),
    [acceptedReadNeed, harnessEvents, harnessRequestState],
  );

  const harnessStreamSnapshot = useMemo(
    () =>
      buildTerminalReadFitsFindingSynthesisHarnessStreamSnapshot(
        harnessEvents,
        harnessState,
        harnessState === 'failed' ? harnessMessage : null,
      ),
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

  const completedHarnessEvidence = useMemo(
    () => extractCompletedHarnessEvidence(harnessEvents),
    [harnessEvents],
  );
  const evidence = useMemo(
    () => deriveDepositReadCompletedEvidence(completedHarnessEvidence),
    [completedHarnessEvidence],
  );

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
  }, [harnessRequestState, onHarnessCompleted, setRecordMessage]);

  return {
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
  };
}
