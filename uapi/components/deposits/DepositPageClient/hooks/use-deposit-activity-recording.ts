/**
 * Deposit activity-ledger recording: POST history, obfuscations anchor save/delete.
 */
"use client";

import { useCallback } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { PipelineExecution } from "@/types/api";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type { TerminalRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import {
  buildTerminalExecutionHistoryRequest,
  buildTerminalObfuscationsAnchorDraft,
  mapExecutionHistoryRunToWorkspaceRun,
  readTerminalRouteError,
  upsertWorkspaceRun,
  type TerminalActivityRecordDraft,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";

export function useDepositActivityRecording(input: {
  repositoryContext: TerminalRepositoryContextState | null;
  selectedRun: WorkspaceRun | null;
  liveRuns: WorkspaceRun[];
  setLiveRuns: Dispatch<SetStateAction<WorkspaceRun[]>>;
  refreshLiveRuns: () => void | Promise<void>;
  replaceDepositRouteTransaction: (id: string) => void;
  synthesizeOptionsRef: MutableRefObject<(() => Promise<void>) | null>;
  obfuscations: string;
  obfuscationsAnchorName: string;
  forcedInclusions: string[];
  forcedExclusions: string[];
  setIsAnchoringObfuscations: (v: boolean) => void;
  setObfuscationsAnchorMessage: (v: string | null) => void;
  setIsObfuscationsAnchorPopoverOpen: (v: boolean) => void;
}) {
  const {
    repositoryContext,
    selectedRun,
    liveRuns,
    setLiveRuns,
    refreshLiveRuns,
    replaceDepositRouteTransaction,
    synthesizeOptionsRef,
    obfuscations,
    obfuscationsAnchorName,
    forcedInclusions,
    forcedExclusions,
    setIsAnchoringObfuscations,
    setObfuscationsAnchorMessage,
    setIsObfuscationsAnchorPopoverOpen,
  } = input;

  const handleRecordActivity = useCallback(
    async (draft: TerminalActivityRecordDraft) => {
      const response = await fetch("/api/executions/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildTerminalExecutionHistoryRequest(draft, {
            repositoryContext,
            fallbackRun: selectedRun,
          }),
        ),
      });

      if (!response.ok) {
        throw new Error(
          await readTerminalRouteError(
            response,
            "Unable to record Deposit activity.",
          ),
        );
      }

      const payload = (await response.json()) as {
        execution?: PipelineExecution;
      };
      if (!payload.execution) {
        throw new Error(
          "Deposit activity response did not include an execution row.",
        );
      }

      const nextRun = mapExecutionHistoryRunToWorkspaceRun(payload.execution);
      setLiveRuns((currentRuns) => upsertWorkspaceRun(currentRuns, nextRun));
      if (draft.selectAfterRecord !== false) {
        replaceDepositRouteTransaction(nextRun.id);
      }
      void refreshLiveRuns();
      if (
        (draft.context as Record<string, unknown> | undefined)?.source ===
        "terminal-deposit-composer"
      ) {
        void synthesizeOptionsRef.current?.();
      }
      return nextRun;
    },
    [
      refreshLiveRuns,
      replaceDepositRouteTransaction,
      repositoryContext,
      selectedRun,
      setLiveRuns,
      synthesizeOptionsRef,
    ],
  );

  const handleAnchorObfuscations = useCallback(async () => {
    if (!obfuscations.trim()) return;
    setIsAnchoringObfuscations(true);
    setObfuscationsAnchorMessage(null);
    try {
      await handleRecordActivity(
        buildTerminalObfuscationsAnchorDraft({
          obfuscations,
          name: obfuscationsAnchorName,
          repositoryFullName:
            repositoryContext?.selectedRepository?.fullName || null,
          forcedInclusions,
          forcedExclusions,
        }),
      );
      setObfuscationsAnchorMessage(
        obfuscationsAnchorName.trim()
          ? `Obfuscations anchor "${obfuscationsAnchorName.trim()}" saved into the Bitcode activity ledger.`
          : "Obfuscations configuration anchored into the Bitcode activity ledger.",
      );
      setIsObfuscationsAnchorPopoverOpen(false);
    } catch (error) {
      setObfuscationsAnchorMessage(
        error instanceof Error
          ? error.message
          : "Unable to anchor the Obfuscations configuration.",
      );
    } finally {
      setIsAnchoringObfuscations(false);
    }
  }, [
    forcedExclusions,
    forcedInclusions,
    handleRecordActivity,
    obfuscations,
    obfuscationsAnchorName,
    repositoryContext,
    setIsAnchoringObfuscations,
    setIsObfuscationsAnchorPopoverOpen,
    setObfuscationsAnchorMessage,
  ]);

  const handleDeleteObfuscationsAnchor = useCallback(
    async (anchorId: string) => {
      if (!anchorId) return;
      const previousRuns = liveRuns;
      setLiveRuns((current) => current.filter((run) => run.id !== anchorId));
      setObfuscationsAnchorMessage(null);
      try {
        const response = await fetch(
          `/api/executions/history/${encodeURIComponent(anchorId)}`,
          { method: "DELETE" },
        );
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            payload?.error || "Unable to delete the Obfuscations anchor.",
          );
        }
        setObfuscationsAnchorMessage("Obfuscations anchor deleted.");
      } catch (error) {
        setLiveRuns(previousRuns);
        setObfuscationsAnchorMessage(
          error instanceof Error
            ? error.message
            : "Unable to delete the Obfuscations anchor.",
        );
      }
    },
    [liveRuns, setLiveRuns, setObfuscationsAnchorMessage],
  );

  return {
    handleRecordActivity,
    handleAnchorObfuscations,
    handleDeleteObfuscationsAnchor,
  };
}
