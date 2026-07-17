/**
 * Reading activity-ledger recording: POST history, Need anchor save/delete.
 */
"use client";

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PipelineExecution } from "@/types/api";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type { RepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import {
  buildProductExecutionHistoryRequest,
  buildProductNeedAnchorDraft,
  mapExecutionHistoryRunToWorkspaceRun,
  readProductRouteError,
  upsertWorkspaceRun,
  type ProductActivityRecordDraft,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";

export function useReadActivityRecording(input: {
  repositoryContext: RepositoryContextState | null;
  selectedRun: WorkspaceRun | null;
  liveRuns: WorkspaceRun[];
  setLiveRuns: Dispatch<SetStateAction<WorkspaceRun[]>>;
  refreshLiveRuns: () => void | Promise<unknown>;
  openReadRouteTransaction: (id: string) => void;
  need: string;
  needAnchorName: string;
  relevantPaths: string[];
  irrelevantPaths: string[];
  setIsAnchoringNeed: (v: boolean) => void;
  setNeedAnchorMessage: (v: string | null) => void;
  setIsNeedAnchorPopoverOpen: (v: boolean) => void;
}) {
  const {
    repositoryContext,
    selectedRun,
    liveRuns,
    setLiveRuns,
    refreshLiveRuns,
    openReadRouteTransaction,
    need,
    needAnchorName,
    relevantPaths,
    irrelevantPaths,
    setIsAnchoringNeed,
    setNeedAnchorMessage,
    setIsNeedAnchorPopoverOpen,
  } = input;

  const handleRecordActivity = useCallback(
    async (draft: ProductActivityRecordDraft) => {
      const response = await fetch("/api/executions/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildProductExecutionHistoryRequest(draft, {
            repositoryContext,
            fallbackRun: selectedRun,
          }),
        ),
      });

      if (!response.ok) {
        throw new Error(
          await readProductRouteError(
            response,
            "Unable to record Reading activity.",
          ),
        );
      }

      const payload = (await response.json()) as {
        execution?: PipelineExecution;
      };
      if (!payload.execution) {
        throw new Error(
          "Reading activity response did not include an execution row.",
        );
      }

      const nextRun = mapExecutionHistoryRunToWorkspaceRun(payload.execution);
      setLiveRuns((currentRuns) => upsertWorkspaceRun(currentRuns, nextRun));
      if (draft.selectAfterRecord !== false) {
        openReadRouteTransaction(nextRun.id);
      }
      void refreshLiveRuns();
      return nextRun;
    },
    [
      refreshLiveRuns,
      openReadRouteTransaction,
      repositoryContext,
      selectedRun,
      setLiveRuns,
    ],
  );

  const handleAnchorNeed = useCallback(async () => {
    if (!need.trim()) return;
    setIsAnchoringNeed(true);
    setNeedAnchorMessage(null);
    try {
      await handleRecordActivity(
        buildProductNeedAnchorDraft({
          need,
          name: needAnchorName,
          repositoryFullName:
            repositoryContext?.selectedRepository?.fullName || null,
          relevantPaths,
          irrelevantPaths,
        }),
      );
      setNeedAnchorMessage(
        needAnchorName.trim()
          ? `Need anchor "${needAnchorName.trim()}" saved into the Bitcode activity ledger.`
          : "Need configuration anchored into the Bitcode activity ledger.",
      );
      setIsNeedAnchorPopoverOpen(false);
    } catch (error) {
      setNeedAnchorMessage(
        error instanceof Error
          ? error.message
          : "Unable to anchor the Need configuration.",
      );
    } finally {
      setIsAnchoringNeed(false);
    }
  }, [
    handleRecordActivity,
    irrelevantPaths,
    need,
    needAnchorName,
    relevantPaths,
    repositoryContext,
    setIsAnchoringNeed,
    setIsNeedAnchorPopoverOpen,
    setNeedAnchorMessage,
  ]);

  const handleDeleteNeedAnchor = useCallback(
    async (anchorId: string) => {
      if (!anchorId) return;
      const previousRuns = liveRuns;
      setLiveRuns((current) => current.filter((run) => run.id !== anchorId));
      setNeedAnchorMessage(null);
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
            payload?.error || "Unable to delete the Need anchor.",
          );
        }
        setNeedAnchorMessage("Need anchor deleted.");
      } catch (error) {
        setLiveRuns(previousRuns);
        setNeedAnchorMessage(
          error instanceof Error
            ? error.message
            : "Unable to delete the Need anchor.",
        );
      }
    },
    [liveRuns, setLiveRuns, setNeedAnchorMessage],
  );

  return {
    handleRecordActivity,
    handleAnchorNeed,
    handleDeleteNeedAnchor,
  };
}
