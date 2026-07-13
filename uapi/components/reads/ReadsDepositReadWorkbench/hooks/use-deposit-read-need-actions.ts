/**
 * Read-Need synthesize / accept / reject actions for the deposit/read workbench.
 */

'use client';

import { useCallback, useState } from 'react';

import { readTerminalRouteError, type TerminalActivityRecordDraft } from '@/components/bitcode/pipeline/models/pipeline-activity-history';
import type { TerminalDepositReadWorkbench } from '@/components/reads/models/deposit-read-workbench';
import {
  objectValue,
  terminalReadNeed,
  type TerminalReadNeedReviewRuntimeState,
  type TerminalReadNeedState,
} from '@/components/reads/models/read-workbench-values';

export type UseDepositReadNeedActionsParams = {
  workbench: TerminalDepositReadWorkbench | null;
  harnessReadActivityId: string | null;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
};

export function useDepositReadNeedActions({
  workbench,
  harnessReadActivityId,
  onRecordActivity,
}: UseDepositReadNeedActionsParams) {
  const [readNeed, setReadNeed] = useState<TerminalReadNeedState | null>(null);
  const [acceptedReadNeed, setAcceptedReadNeed] = useState<TerminalReadNeedState | null>(null);
  const [readNeedReviewRuntime, setReadNeedReviewRuntime] =
    useState<TerminalReadNeedReviewRuntimeState | null>(null);
  const [readNeedStorageProjection, setReadNeedStorageProjection] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [readNeedTelemetry, setReadNeedTelemetry] = useState<Record<string, unknown> | null>(null);
  const [readNeedFeedback, setReadNeedFeedback] = useState('');
  const [readNeedMessage, setReadNeedMessage] = useState<string | null>(null);
  const [readNeedAction, setReadNeedAction] = useState<
    'synthesize' | 'accept' | 'reject' | 'resynthesize' | null
  >(null);
  const [readNeedSynthesisCount, setReadNeedSynthesisCount] = useState(0);

  const resetReadNeedSession = useCallback(() => {
    setReadNeed(null);
    setAcceptedReadNeed(null);
    setReadNeedReviewRuntime(null);
    setReadNeedStorageProjection([]);
    setReadNeedTelemetry(null);
    setReadNeedFeedback('');
    setReadNeedMessage(null);
    setReadNeedAction(null);
    setReadNeedSynthesisCount(0);
  }, []);

  const handleSynthesizeReadNeed = useCallback(
    async (action: 'synthesize_read_need' | 'resynthesize_read_need') => {
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
        setReadNeedReviewRuntime(
          objectValue(payload?.readNeedReviewRuntime) as TerminalReadNeedReviewRuntimeState | null,
        );
        setReadNeedStorageProjection(
          Array.isArray(payload?.storageProjection)
            ? (payload.storageProjection as Array<Record<string, unknown>>)
            : [],
        );
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
    },
    [harnessReadActivityId, readNeed, readNeedFeedback, workbench],
  );

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
      setReadNeedReviewRuntime(
        objectValue(payload?.readNeedReviewRuntime) as TerminalReadNeedReviewRuntimeState | null,
      );
      setReadNeedStorageProjection(
        Array.isArray(payload?.storageProjection)
          ? (payload.storageProjection as Array<Record<string, unknown>>)
          : [],
      );
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
      setReadNeedReviewRuntime(
        objectValue(payload?.readNeedReviewRuntime) as TerminalReadNeedReviewRuntimeState | null,
      );
      setReadNeedStorageProjection(
        Array.isArray(payload?.storageProjection)
          ? (payload.storageProjection as Array<Record<string, unknown>>)
          : [],
      );
      setReadNeedTelemetry(objectValue(payload?.telemetry));
      setReadNeedMessage(
        'Read-Need rejected. Finding Fits remains blocked until a resynthesized Need is accepted.',
      );
    } catch (error) {
      setReadNeedMessage(error instanceof Error ? error.message : 'Unable to reject the Read-Need.');
    } finally {
      setReadNeedAction(null);
    }
  }, [readNeed, readNeedFeedback]);

  return {
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
  };
}
