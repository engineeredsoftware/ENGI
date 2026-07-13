/**
 * Ledger activity recording for deposit / read / admission / fit postures.
 */

'use client';

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import {
  buildTerminalDepositWorkbenchDraft,
  buildTerminalFitWorkbenchDraft,
  buildTerminalReadAdmissionDraft,
  buildTerminalReadMeasurementDraft,
  type TerminalActivityRecordDraft,
} from '@/components/bitcode/pipeline/models/pipeline-activity-history';
import type { TerminalDepositReadWorkbench } from '@/components/reads/models/deposit-read-workbench';
import {
  readMetricValue,
  readRowValue,
  type ReadFitsFindingProgressState,
} from '@/components/reads/models/read-workbench-values';

export type UseDepositReadActivityRecordingParams = {
  workbench: TerminalDepositReadWorkbench | null;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  setReadFitsFindingProgress: Dispatch<SetStateAction<ReadFitsFindingProgressState>>;
  setRecordedAdmittedReadActivityId: Dispatch<SetStateAction<string | null>>;
};

function recordActivityId(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const id = (value as { id?: unknown }).id;
  return typeof id === 'string' && id.trim() ? id : null;
}

export function useDepositReadActivityRecording({
  workbench,
  onRecordActivity,
  setReadFitsFindingProgress,
  setRecordedAdmittedReadActivityId,
}: UseDepositReadActivityRecordingParams) {
  const [recordingKey, setRecordingKey] = useState<
    'deposit' | 'read' | 'read-admission' | 'fit' | null
  >(null);
  const [recordMessage, setRecordMessage] = useState<string | null>(null);

  const resetRecordingSession = useCallback(() => {
    setRecordingKey(null);
    setRecordMessage(null);
  }, []);

  const handleRecord = useCallback(
    async (kind: 'deposit' | 'read' | 'fit') => {
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
        setRecordMessage(
          error instanceof Error ? error.message : 'Unable to record Bitcode workbench posture.',
        );
      } finally {
        setRecordingKey(null);
      }
    },
    [onRecordActivity, setReadFitsFindingProgress, workbench],
  );

  const handleRecordReadAdmission = useCallback(async () => {
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
      setRecordMessage(
        error instanceof Error ? error.message : 'Unable to admit the measured Read for Finding Fits.',
      );
    } finally {
      setRecordingKey(null);
    }
  }, [onRecordActivity, setReadFitsFindingProgress, setRecordedAdmittedReadActivityId, workbench]);

  return {
    recordingKey,
    recordMessage,
    setRecordMessage,
    resetRecordingSession,
    handleRecord,
    handleRecordReadAdmission,
  };
}
