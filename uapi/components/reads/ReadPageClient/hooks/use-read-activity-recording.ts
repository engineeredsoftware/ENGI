/**
 * Reading activity-ledger recording: POST history and upsert into live runs.
 */
"use client";

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PipelineExecution } from "@/types/api";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type { TerminalRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import {
  buildTerminalExecutionHistoryRequest,
  mapExecutionHistoryRunToWorkspaceRun,
  readTerminalRouteError,
  upsertWorkspaceRun,
  type TerminalActivityRecordDraft,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";

export function useReadActivityRecording(input: {
  repositoryContext: TerminalRepositoryContextState | null;
  selectedRun: WorkspaceRun | null;
  setLiveRuns: Dispatch<SetStateAction<WorkspaceRun[]>>;
  refreshLiveRuns: () => void | Promise<void>;
  replaceReadRouteTransaction: (id: string) => void;
}) {
  const {
    repositoryContext,
    selectedRun,
    setLiveRuns,
    refreshLiveRuns,
    replaceReadRouteTransaction,
  } = input;

  const handleRecordActivity = useCallback(
    async (draft: TerminalActivityRecordDraft) => {
      const response = await fetch("/api/executions/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        replaceReadRouteTransaction(nextRun.id);
      }
      void refreshLiveRuns();
      return nextRun;
    },
    [
      refreshLiveRuns,
      replaceReadRouteTransaction,
      repositoryContext,
      selectedRun,
      setLiveRuns,
    ],
  );

  return { handleRecordActivity };
}
