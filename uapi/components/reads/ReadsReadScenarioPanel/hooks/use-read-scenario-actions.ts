/**
 * Read scenario actions: load fitting review, record measurement, accept/reject/remeasure.
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildTerminalReadMeasurementDraft,
  readTerminalRouteError,
  type TerminalActivityRecordDraft,
} from '@/components/bitcode/pipeline/models/pipeline-activity-history';
import {
  normalizeTerminalReadFittingReview,
  normalizeTerminalReadScenarios,
  type TerminalReadFittingReviewState,
  type TerminalReadScenariosState,
} from '@/components/reads/models/read-scenarios';
import { useBitcodeShellBridge } from '@/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge';

export function useReadScenarioActions(input: {
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  showDemonstrationScenarios?: boolean;
}) {
  const { onRecordActivity, showDemonstrationScenarios = true } = input;
  const { snapshot, runControl } = useBitcodeShellBridge();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isLoadingReadFittingReview, setIsLoadingReadFittingReview] = useState(false);
  const [readFittingReview, setReadFittingReview] =
    useState<TerminalReadFittingReviewState | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');

  const needState = useMemo<TerminalReadScenariosState | null>(
    () => (showDemonstrationScenarios ? normalizeTerminalReadScenarios(snapshot) : null),
    [showDemonstrationScenarios, snapshot],
  );

  useEffect(() => {
    if (!needState?.selectedScenarioId) {
      setReadFittingReview(null);
      return;
    }

    let cancelled = false;
    setIsLoadingReadFittingReview(true);

    fetch(`/api/read-review?scenarioId=${encodeURIComponent(needState.selectedScenarioId)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            await readTerminalRouteError(
              response,
              'Unable to read the active Read-fitting review.',
            ),
          );
        }
        return response.json();
      })
      .then((payload) => {
        if (!cancelled) {
          setReadFittingReview(normalizeTerminalReadFittingReview(payload));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setReadFittingReview(null);
          setActionMessage(
            error instanceof Error
              ? error.message
              : 'Unable to read the active Read-fitting review.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingReadFittingReview(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [needState?.selectedScenarioId]);

  const selectScenario = async (scenarioId: string) => {
    await runControl((controls) => controls.setScenario?.(scenarioId));
  };

  const handleRecordActiveNeed = async () => {
    if (!needState || !onRecordActivity) return;

    setIsRecording(true);
    setActionMessage(null);

    try {
      await onRecordActivity(buildTerminalReadMeasurementDraft(needState));
      setActionMessage('Active read measurement recorded into the Bitcode activity ledger.');
    } catch (error) {
      setActionMessage(
        error instanceof Error
          ? error.message
          : 'Unable to record the active read measurement.',
      );
    } finally {
      setIsRecording(false);
    }
  };

  const handleReviewNeed = async (
    action: 'accept' | 'reject' | 'remeasure-with-feedback',
  ) => {
    if (!needState) return;

    setIsReviewing(true);
    setActionMessage(null);

    try {
      const response = await fetch('/api/read-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId: needState.selectedScenarioId || undefined,
          readReviewAction: action,
          readReviewFeedback: reviewFeedback.trim() ? [reviewFeedback.trim()] : [],
          readReviewActorId: 'bitcode-terminal:read-review',
          readReviewDecisionMode: 'operator-terminal-review',
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readTerminalRouteError(response, 'Unable to review the active Read.'),
        );
      }

      const payload = (await response.json()) as Record<string, unknown>;
      setReadFittingReview(normalizeTerminalReadFittingReview(payload));
      const fitSearchAdmission = payload.fitSearchAdmission as
        | { admitted?: boolean }
        | undefined;
      const nextProtocolAction = String(
        payload.nextProtocolAction || 'Continue from the Bitcode Terminal.',
      );
      await onRecordActivity?.({
        type: 'agentic-execution:read-measurement',
        detailSection: 'activity',
        summary: `Reviewed the active Read with action ${action}.`,
        context: {
          source: 'terminal-read-scenario-panel',
          scenarioId: needState.selectedScenarioId,
          reviewAction: action,
          fitSearchAdmitted: fitSearchAdmission?.admitted === true,
        },
        output: {
          readReview: payload.readReview ?? null,
          reviewDecision: payload.reviewDecision ?? null,
          assetPackCompletion: {
            bitcodeActivityState: {
              readReview: payload,
            },
          },
        },
      });
      setActionMessage(
        fitSearchAdmission?.admitted
          ? `Read accepted for Finding Fits. Next: ${nextProtocolAction}.`
          : `Read review recorded. Finding Fits remains blocked. Next: ${nextProtocolAction}.`,
      );
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : 'Unable to review the active Read.',
      );
    } finally {
      setIsReviewing(false);
    }
  };

  return {
    needState,
    actionMessage,
    isRecording,
    isReviewing,
    isLoadingReadFittingReview,
    readFittingReview,
    reviewFeedback,
    setReviewFeedback,
    selectScenario,
    handleRecordActiveNeed,
    handleReviewNeed,
  };
}
