/**
 * Live Finding Fits host stream state for the deposit/read workbench.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { TerminalRepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';
import {
  buildTerminalReadFitsFindingSynthesisHostRequest,
  buildTerminalReadFitsFindingSynthesisHostStreamSnapshot,
  streamTerminalReadFitsFindingSynthesisHost,
  summarizeTerminalReadFitsFindingSynthesisHostEvent,
  type TerminalReadFitsFindingSynthesisHostEvent,
} from '@/components/bitcode/pipeline/PipelineHostClient/pipeline-host-client';
import type {
  TerminalDepositedSourceRevision,
  TerminalDepositReadWorkbench,
} from '@/components/reads/models/deposit-read-workbench';
import {
  buildHostIdentifierRows,
  deriveDepositReadCompletedEvidence,
  extractCompletedHostEvidence,
} from '@/components/reads/models/deposit-read-evidence-rows';
import type { TerminalReadNeedState } from '@/components/reads/models/read-workbench-values';

export type UseDepositReadHostParams = {
  workbench: TerminalDepositReadWorkbench | null;
  repositoryContext?: TerminalRepositoryContextState | null;
  depositedSourceRevision?: TerminalDepositedSourceRevision | null;
  hostReadActivityId: string | null;
  acceptedReadNeed: TerminalReadNeedState | null;
  onHostCompleted?: () => Promise<unknown> | unknown;
  setRecordMessage: (message: string | null) => void;
};

export function useDepositReadHost({
  workbench,
  repositoryContext,
  depositedSourceRevision,
  hostReadActivityId,
  acceptedReadNeed,
  onHostCompleted,
  setRecordMessage,
}: UseDepositReadHostParams) {
  const [hostState, setHostState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [hostMessage, setHostMessage] = useState<string | null>(null);
  const [hostEvents, setHostEvents] = useState<TerminalReadFitsFindingSynthesisHostEvent[]>([]);
  const [hostUserHasScrolled, setHostUserHasScrolled] = useState(false);

  const resetHostSession = useCallback(() => {
    setHostState('idle');
    setHostMessage(null);
    setHostEvents([]);
    setHostUserHasScrolled(false);
  }, []);

  const hostRequestState = useMemo(
    () =>
      buildTerminalReadFitsFindingSynthesisHostRequest({
        workbench,
        repositoryContext,
        depositedSourceRevision,
        readActivityId: hostReadActivityId,
        acceptedReadNeed,
      }),
    [acceptedReadNeed, depositedSourceRevision, hostReadActivityId, repositoryContext, workbench],
  );

  const hostIdentifierRows = useMemo(
    () =>
      buildHostIdentifierRows({
        hostRequestState,
        acceptedReadNeed,
        hostEvents,
      }),
    [acceptedReadNeed, hostEvents, hostRequestState],
  );

  const hostStreamSnapshot = useMemo(
    () =>
      buildTerminalReadFitsFindingSynthesisHostStreamSnapshot(
        hostEvents,
        hostState,
        hostState === 'failed' ? hostMessage : null,
      ),
    [hostEvents, hostMessage, hostState],
  );

  useEffect(() => {
    const runId = hostStreamSnapshot.runId;
    if (!runId || hostState === 'idle' || typeof window === 'undefined') return;

    const nextUrl = new URL(window.location.href);
    if (nextUrl.searchParams.get('runId') === runId) return;
    nextUrl.searchParams.set('runId', runId);
    window.history.replaceState(window.history.state, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  }, [hostState, hostStreamSnapshot.runId]);

  const completedHostEvidence = useMemo(
    () => extractCompletedHostEvidence(hostEvents),
    [hostEvents],
  );
  const evidence = useMemo(
    () => deriveDepositReadCompletedEvidence(completedHostEvidence),
    [completedHostEvidence],
  );

  const handleRunLiveFit = useCallback(async () => {
    if (!hostRequestState.ready) {
      setHostState('failed');
      setHostMessage(`Live fit cannot start yet: missing ${hostRequestState.missing.join(', ')}.`);
      return;
    }

    setHostState('running');
    setHostMessage('Starting live AssetPack fit host run...');
    setHostEvents([]);
    setHostUserHasScrolled(false);

    try {
      await streamTerminalReadFitsFindingSynthesisHost(hostRequestState.request, {
        onEvent: (event) => {
          setHostEvents((currentEvents) => [...currentEvents.slice(-79), event]);
          setHostMessage(summarizeTerminalReadFitsFindingSynthesisHostEvent(event));
        },
      });
      setHostState('completed');
      setRecordMessage('Live AssetPack fit host run completed. Refreshing activity and telemetry readback.');
      await onHostCompleted?.();
    } catch (error) {
      setHostState('failed');
      setHostMessage(error instanceof Error ? error.message : 'Live AssetPack fit host run failed.');
    }
  }, [hostRequestState, onHostCompleted, setRecordMessage]);

  return {
    hostState,
    hostMessage,
    setHostMessage,
    hostEvents,
    hostUserHasScrolled,
    setHostUserHasScrolled,
    hostRequestState,
    hostIdentifierRows,
    hostStreamSnapshot,
    evidence,
    resetHostSession,
    handleRunLiveFit,
  };
}
