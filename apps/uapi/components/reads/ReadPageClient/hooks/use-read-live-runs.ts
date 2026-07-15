/**
 * Reading activity history: load, refresh, and local upsert of workspace runs.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPipelineExecutionHistory } from "@/networking/api-client";
import {
  mapExecutionHistoryRunToWorkspaceRun,
  upsertWorkspaceRun,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

export function useReadLiveRuns() {
  const [liveRuns, setLiveRuns] = useState<WorkspaceRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [runsLoadError, setRunsLoadError] = useState<string | null>(null);

  const refreshLiveRuns = useCallback(async () => {
    setIsLoadingRuns(true);
    setRunsLoadError(null);
    try {
      const history = await fetchPipelineExecutionHistory();
      const nextRuns = history.map(mapExecutionHistoryRunToWorkspaceRun);
      setLiveRuns(nextRuns);
      return nextRuns;
    } catch (error) {
      setLiveRuns([]);
      setRunsLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load recent Reading activity.",
      );
      return [] as WorkspaceRun[];
    } finally {
      setIsLoadingRuns(false);
    }
  }, []);

  useEffect(() => {
    void refreshLiveRuns();
  }, [refreshLiveRuns]);

  const upsertRun = useCallback((run: WorkspaceRun) => {
    setLiveRuns((currentRuns) => upsertWorkspaceRun(currentRuns, run));
  }, []);

  return {
    liveRuns,
    setLiveRuns,
    isLoadingRuns,
    runsLoadError,
    setRunsLoadError,
    refreshLiveRuns,
    upsertRun,
  };
}
