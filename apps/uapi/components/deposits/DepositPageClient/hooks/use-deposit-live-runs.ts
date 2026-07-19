/**
 * Deposit activity history: load, refresh, and local upsert of workspace runs.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPipelineExecutionHistory } from "@/networking/api-client";
import {
  mapExecutionHistoryRunToWorkspaceRun,
  upsertWorkspaceRun,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

export function useDepositLiveRuns() {
  const [liveRuns, setLiveRuns] = useState<WorkspaceRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [runsLoadError, setRunsLoadError] = useState<string | null>(null);

  const refreshLiveRuns = useCallback(async (options?: { soft?: boolean }) => {
    const soft = Boolean(options?.soft);
    if (!soft) {
      setIsLoadingRuns(true);
    }
    setRunsLoadError(null);
    try {
      const history = await fetchPipelineExecutionHistory();
      const nextRuns = history.map(mapExecutionHistoryRunToWorkspaceRun);
      setLiveRuns((current) => {
        if (!soft || current.length === 0) return nextRuns;
        // Soft refresh: merge so optimistic anchor upserts are not blanked if
        // the server list races slightly behind the POST.
        let merged = nextRuns;
        for (const run of current) {
          if (!merged.some((entry) => entry.id === run.id)) {
            merged = upsertWorkspaceRun(merged, run);
          }
        }
        return merged;
      });
      return nextRuns;
    } catch (error) {
      if (!soft) {
        setLiveRuns([]);
      }
      setRunsLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load recent Deposit activity.",
      );
      return [] as WorkspaceRun[];
    } finally {
      if (!soft) {
        setIsLoadingRuns(false);
      }
    }
  }, []);

  useEffect(() => {
    void refreshLiveRuns();
  }, [refreshLiveRuns]);

  const upsertRun = useCallback((run: WorkspaceRun) => {
    setLiveRuns((currentRuns) => upsertWorkspaceRun(currentRuns, run));
  }, []);

  const removeRunById = useCallback((runId: string) => {
    setLiveRuns((current) => current.filter((run) => run.id !== runId));
  }, []);

  const restoreRuns = useCallback((runs: WorkspaceRun[]) => {
    setLiveRuns(runs);
  }, []);

  return {
    liveRuns,
    setLiveRuns,
    isLoadingRuns,
    runsLoadError,
    setRunsLoadError,
    refreshLiveRuns,
    upsertRun,
    removeRunById,
    restoreRuns,
  };
}
