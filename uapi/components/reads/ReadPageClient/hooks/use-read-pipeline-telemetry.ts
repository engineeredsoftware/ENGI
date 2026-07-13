/**
 * Selected pipeline run telemetry: live stream, clocks, completed-run pack resume.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePipelineExecution } from "@/hooks/usePipelineExecution";
import { buildPipelineRunActivityFromEvents } from "@/components/bitcode/pipeline/models/pipeline-run-activity";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";

export type SelectedRunPackSummary = {
  runId: string;
  options: Array<{
    optionId: string;
    title: string;
    coveredSourcePathCount: number;
  }>;
};

export function useReadPipelineTelemetry(selectedRun: WorkspaceRun | null) {
  const [readLogScrolled, setReadLogScrolled] = useState(false);
  const [dismissedTelemetryErrorRunId, setDismissedTelemetryErrorRunId] =
    useState<string | null>(null);
  const [selectedRunPacks, setSelectedRunPacks] =
    useState<SelectedRunPackSummary | null>(null);

  const selectedPipelineRunId =
    selectedRun && selectedRun.type === "agentic-execution:asset-pack"
      ? selectedRun.id
      : null;

  const {
    events: readRunEvents,
    latestWorkUpdate: readRunWorkUpdate,
    iterationUpdates: readRunIterationUpdates,
    error: readRunStreamError,
  } = usePipelineExecution(selectedPipelineRunId);

  const readRunActivity = useMemo(
    () =>
      buildPipelineRunActivityFromEvents(
        readRunEvents,
        readRunWorkUpdate,
        readRunIterationUpdates,
        readRunStreamError,
      ),
    [
      readRunEvents,
      readRunIterationUpdates,
      readRunStreamError,
      readRunWorkUpdate,
    ],
  );

  const readRunIsProcessing =
    selectedRun?.status === "running" &&
    !readRunActivity.isStreamingComplete &&
    !readRunActivity.error;

  // Labels follow the RUN's lens, not the page: a deposit synthesis run selected
  // here must not be narrated as a Reading run.
  const readRunMode =
    selectedRun?.contextSource === "deposit-option-synthesis"
      ? "deposit"
      : "read";

  const readRunTelemetryError =
    dismissedTelemetryErrorRunId === selectedPipelineRunId
      ? null
      : readRunActivity.error;

  const readRunStartMs = useMemo(() => {
    const first = readRunEvents[0]?.created_at;
    const parsed = first ? new Date(first).getTime() : Number.NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [readRunEvents]);

  const readRunEndMs = useMemo(() => {
    if (readRunIsProcessing) return null;
    const last = readRunEvents[readRunEvents.length - 1]?.created_at;
    const parsed = last ? new Date(last).getTime() : Number.NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [readRunEvents, readRunIsProcessing]);

  // Resume a completed run's synthesized AssetPacks (best-effort additive summary).
  useEffect(() => {
    setSelectedRunPacks(null);
    if (!selectedPipelineRunId || selectedRun?.status !== "completed") return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/executions/history/${selectedPipelineRunId}`,
        );
        const data = await res.json().catch(() => null);
        if (cancelled || !res?.ok) return;
        const output = data?.run?.output as {
          depositOptionSynthesis?: {
            options?: Array<{ optionId?: string; title?: string }>;
          };
          reviewProjections?: Array<{
            optionId?: string;
            title?: string;
            coveredSourcePaths?: string[];
          }>;
        } | null;
        const projections = Array.isArray(output?.reviewProjections)
          ? output.reviewProjections
          : [];
        const fallback = Array.isArray(output?.depositOptionSynthesis?.options)
          ? output.depositOptionSynthesis.options
          : [];
        const options = (projections.length > 0 ? projections : fallback)
          .map((option) => ({
            optionId: String(option?.optionId || ""),
            title: String(option?.title || "Untitled AssetPack option"),
            coveredSourcePathCount: Array.isArray(
              (option as { coveredSourcePaths?: string[] })?.coveredSourcePaths,
            )
              ? (option as { coveredSourcePaths: string[] }).coveredSourcePaths
                  .length
              : 0,
          }))
          .filter((option) => option.optionId);
        if (cancelled || options.length === 0) return;
        setSelectedRunPacks({ runId: selectedPipelineRunId, options });
      } catch {
        // Telemetry replay stands on its own; the packs summary is additive.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedPipelineRunId, selectedRun?.status]);

  return {
    selectedPipelineRunId,
    readRunEvents,
    readRunActivity,
    readRunIsProcessing,
    readRunMode,
    readRunTelemetryError,
    readRunStartMs,
    readRunEndMs,
    readLogScrolled,
    setReadLogScrolled,
    setDismissedTelemetryErrorRunId,
    selectedRunPacks,
  };
}
