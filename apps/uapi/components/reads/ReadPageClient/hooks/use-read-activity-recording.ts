/**
 * Reading activity-ledger recording: POST history and upsert into live runs.
 */
"use client";

import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { PipelineExecution } from "@/types/api";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import type { RepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import {
  buildProductExecutionHistoryRequest,
  mapExecutionHistoryRunToWorkspaceRun,
  readProductRouteError,
  upsertWorkspaceRun,
  type ProductActivityRecordDraft,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";

export function useReadActivityRecording(input: {
  repositoryContext: RepositoryContextState | null;
  selectedRun: WorkspaceRun | null;
  setLiveRuns: Dispatch<SetStateAction<WorkspaceRun[]>>;
  refreshLiveRuns: () => void | Promise<unknown>;
  openReadRouteTransaction: (id: string) => void;
}) {
  const {
    repositoryContext,
    selectedRun,
    setLiveRuns,
    refreshLiveRuns,
    openReadRouteTransaction,
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

  return { handleRecordActivity };
}
