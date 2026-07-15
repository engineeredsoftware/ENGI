/**
 * Reads experience page client — deposit-parity orchestration for /reads.
 *
 * Compact header + pipelines table; New (+) opens compose/detail mode with
 * shared DepositSourceSelection (SHA), Need (+ relevant/irrelevant paths),
 * options, settle. Master-detail matches /deposits and /packs (table → detail + Back).
 */

"use client";

import { formatSats } from "@/components/reads/models/read-format";
import React, { useCallback, useMemo, useState } from "react";
import { Workflow } from "lucide-react";
import { useReadRouteParams } from "./hooks/use-read-route-params";
import { useReadLiveRuns } from "./hooks/use-read-live-runs";
import { useReadUrlNavigation } from "./hooks/use-read-url-navigation";
import { useReadPipelineTelemetry } from "./hooks/use-read-pipeline-telemetry";
import { useReadSessionProjections } from "./hooks/use-read-session-projections";
import { useReadActivityRecording } from "./hooks/use-read-activity-recording";
import { useReadOptionSynthesis } from "./hooks/use-read-option-synthesis";

import { ProductRouteShell } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import { ProductDetailStage } from "@/components/bitcode/routes/ProductRouteEntrance/ProductRouteEntrance";
import DepositSourceSelection from "@/components/deposits/DepositSourceSelection/DepositSourceSelection";
import { deriveRepositoryAnchors } from "@/components/deposits/models/deposit-activity-ledger";
import { ReadsNeedComposePanel } from "@/components/reads/ReadsNeedComposePanel/ReadsNeedComposePanel";
import { ReadsAssetPackOptions } from "@/components/reads/ReadsAssetPackOptions/ReadsAssetPackOptions";
import { ReadsPipelinesMaster } from "@/components/reads/ReadsPipelinesMaster/ReadsPipelinesMaster";
import { ReadsPipelineTelemetry } from "@/components/reads/ReadsPipelineTelemetry/ReadsPipelineTelemetry";
import { ReadsRouteStateAside } from "@/components/reads/ReadsRouteStateAside/ReadsRouteStateAside";
import { BitcodeShellBridgeProvider } from "@/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge";
import type { TerminalRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import {
  buildReadsHref,
  READS_ROUTE,
} from "@/components/bitcode/routes/ProductRoutes/product-routes";
import {
  DEFAULT_TRANSACTION_FILTERS,
  DEFAULT_TRANSACTION_PAGINATION,
  type TransactionFilters,
  type TransactionPagination,
} from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import {
  buildReadAuthorityRows,
  buildReadProcurementRows,
  buildReadSessionRows,
} from "@/components/reads/models/read-route-rows";

export default function ReadPageClient() {
  const { selectedTransactionId, routeReadingStage } = useReadRouteParams();
  const {
    liveRuns,
    setLiveRuns,
    isLoadingRuns,
    runsLoadError,
    refreshLiveRuns,
  } = useReadLiveRuns();
  const {
    openReadRouteTransaction,
    closePipelineDetail: closeUrlDetail,
  } = useReadUrlNavigation();

  const [repositoryContext, setRepositoryContext] =
    useState<TerminalRepositoryContextState | null>(null);
  const [need, setNeed] = useState("");
  const [relevantPaths, setRelevantPaths] = useState<string[]>([]);
  const [irrelevantPaths, setIrrelevantPaths] = useState<string[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [settleBusy, setSettleBusy] = useState(false);
  const [settleError, setSettleError] = useState<string | null>(null);
  const [settleMessage, setSettleMessage] = useState<string | null>(null);

  const synthesis = useReadOptionSynthesis({
    repositoryContext,
    need,
    relevantPaths,
    irrelevantPaths,
    refreshLiveRuns,
    onRunDispatched: (runId) => {
      setIsComposeOpen(false);
      openReadRouteTransaction(runId);
    },
  });

  const handleSettleSelected = useCallback(async () => {
    const selected = synthesis.options.filter((o) =>
      synthesis.selectedIndexes.includes(o.index),
    );
    if (selected.length === 0) return;
    setSettleBusy(true);
    setSettleError(null);
    setSettleMessage(null);
    try {
      const response = await fetch("/api/read/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOptions: selected,
          synthesisRunId: synthesis.runId,
          need: need.trim() || null,
          relevantPaths,
          irrelevantPaths,
          repositoryFullName:
            repositoryContext?.selectedRepository?.fullName || null,
          repository: {
            fullName: repositoryContext?.selectedRepository?.fullName || null,
            owner: repositoryContext?.selectedRepository?.owner || null,
            name: repositoryContext?.selectedRepository?.name || null,
            branch: repositoryContext?.selectedBranch || null,
            commit: repositoryContext?.selectedCommit || null,
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Settlement failed.",
        );
      }
      const runIds = Array.isArray(payload.settleRunIds)
        ? payload.settleRunIds.join(", ")
        : payload.settleRunId;
      setSettleMessage(
        `Settled ${selected.length} option(s). Track rights and delivery on Packs${
          runIds ? ` (run ${runIds})` : ""
        }.`,
      );
      void Promise.resolve(refreshLiveRuns() as unknown);
    } catch (err) {
      setSettleError(
        err instanceof Error ? err.message : "Settlement failed.",
      );
    } finally {
      setSettleBusy(false);
    }
  }, [
    need,
    relevantPaths,
    irrelevantPaths,
    refreshLiveRuns,
    repositoryContext?.selectedBranch,
    repositoryContext?.selectedCommit,
    repositoryContext?.selectedRepository?.fullName,
    repositoryContext?.selectedRepository?.name,
    repositoryContext?.selectedRepository?.owner,
    synthesis.options,
    synthesis.runId,
    synthesis.selectedIndexes,
  ]);

  const [pipelineFilters, setPipelineFilters] = useState<TransactionFilters>({
    ...DEFAULT_TRANSACTION_FILTERS,
    transactionLens: "read",
  });
  const [pipelinePagination, setPipelinePagination] =
    useState<TransactionPagination>(DEFAULT_TRANSACTION_PAGINATION);

  const selectedRun = useMemo(
    () => liveRuns.find((run) => run.id === selectedTransactionId) || null,
    [liveRuns, selectedTransactionId],
  );

  const repositoryAnchors = useMemo(
    () => deriveRepositoryAnchors(liveRuns),
    [liveRuns],
  );

  const isReadDetailOpen =
    Boolean(selectedTransactionId) || isComposeOpen || Boolean(synthesis.runId);

  const closePipelineDetail = useCallback(() => {
    closeUrlDetail();
    setIsComposeOpen(false);
    synthesis.reset();
    setSettleError(null);
    setSettleMessage(null);
  }, [closeUrlDetail, synthesis.reset]);

  const openComposeDetail = useCallback(() => {
    closeUrlDetail();
    synthesis.reset();
    setSettleError(null);
    setSettleMessage(null);
    setIsComposeOpen(true);
  }, [closeUrlDetail, synthesis.reset]);

  const telemetry = useReadPipelineTelemetry(
    selectedRun || (synthesis.runId ? ({ id: synthesis.runId } as any) : null),
  );
  const {
    depositedSourceRevision: _depositedSourceRevision,
    admittedReadActivityId: _admittedReadActivityId,
    readRouteSession,
  } = useReadSessionProjections({
    liveRuns,
    repositoryContext,
    selectedTransactionId,
    selectedRun,
    routeReadingStage,
  });
  const { handleRecordActivity } = useReadActivityRecording({
    repositoryContext,
    selectedRun,
    setLiveRuns,
    refreshLiveRuns,
    replaceReadRouteTransaction: openReadRouteTransaction,
  });

  const sessionRows = buildReadSessionRows(readRouteSession);
  const procurementRows = buildReadProcurementRows(readRouteSession);
  const authorityRows = buildReadAuthorityRows(readRouteSession);

  const isConfigLocked = synthesis.status === "running";
  const selectedPipelineRunId =
    telemetry.selectedPipelineRunId || synthesis.runId;

  return (
    <BitcodeShellBridgeProvider>
      <ProductRouteShell
        testId="route-shell-read"
        tone="orange"
        label="Read"
        title="Reading"
        summary="Describe a Need, synthesize measured AssetPack options, choose what fits, then settle and track delivery on Packs."
        icon={Workflow}
        metrics={[
          {
            label: "Stage",
            description:
              "Where this reading session sits: compose a Need, synthesize options, or settle selected AssetPacks.",
            value: isComposeOpen
              ? "compose"
              : readRouteSession.activeStepId.replace(/-/g, " "),
          },
          {
            label: "Rows",
            description:
              "How many Read runs appear in the pipelines table for this account.",
            value: isLoadingRuns ? "reading" : String(liveRuns.length),
          },
          {
            label: "Options",
            description: "Synthesized source-safe AssetPack options ready to settle.",
            value: synthesis.options.length,
          },
          {
            label: "Quote",
            description:
              "Deterministic BTC-testnet quote basis (sats) for the current read under the procurement budget policy.",
            value: formatSats(
              readRouteSession.procurementGovernance.budgetPolicy.quoteSats,
            ),
          },
        ]}
      >
        <ReadsPipelinesMaster
          isReadDetailOpen={isReadDetailOpen}
          onCloseDetail={closePipelineDetail}
          onOpenCompose={openComposeDetail}
          onRefresh={() => {
            void refreshLiveRuns();
          }}
          runs={liveRuns}
          selectedTransactionId={selectedRun?.id ?? null}
          onSelectTransaction={(id) => {
            if (id) {
              setIsComposeOpen(false);
              openReadRouteTransaction(id);
            }
          }}
          filters={pipelineFilters}
          onFiltersChange={setPipelineFilters}
          pagination={pipelinePagination}
          onPaginationChange={setPipelinePagination}
          isLoadingRuns={isLoadingRuns}
          runsError={runsLoadError}
        />

        <ProductDetailStage
          open={isReadDetailOpen}
          stageKey={
            isComposeOpen
              ? "reads-compose"
              : selectedPipelineRunId || "reads-detail"
          }
          testId="reads-run-configuration"
          className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.55fr)]"
          dataAttrs={{
            "data-compose": isComposeOpen ? "true" : "false",
            "data-locked": isConfigLocked ? "true" : "false",
          }}
        >
          <div className="grid min-w-0 gap-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <div id="reads-section-source" className="min-w-0">
                <DepositSourceSelection
                  preferredRepository={selectedRun?.repository || null}
                  onContextChange={setRepositoryContext}
                  onRecordActivity={handleRecordActivity}
                  routePath={READS_ROUTE}
                  buildRouteHref={buildReadsHref}
                  repositoryAnchors={repositoryAnchors}
                  disabled={isConfigLocked}
                  heading="Select the repository you are reading"
                  description="One connected repository, branch, and commit form the source package measured against your Need."
                  descriptionLocked="Source package for this read run — locked while reviewing run detail."
                  ariaLabel="Repository source selector"
                />
              </div>
              <ReadsNeedComposePanel
                need={need}
                onNeedChange={setNeed}
                relevantPaths={relevantPaths}
                onRelevantPathsChange={setRelevantPaths}
                irrelevantPaths={irrelevantPaths}
                onIrrelevantPathsChange={setIrrelevantPaths}
                repositoryContext={repositoryContext}
                status={synthesis.status}
                error={synthesis.error}
                runId={synthesis.runId}
                onSynthesize={() => void synthesis.synthesize()}
                canSynthesize={Boolean(
                  repositoryContext?.selectedRepository?.fullName &&
                    repositoryContext?.selectedCommit,
                )}
                isConfigLocked={isConfigLocked}
              />
            </div>

            {selectedPipelineRunId ? (
              <ReadsPipelineTelemetry
                selectedRun={selectedRun}
                selectedPipelineRunId={selectedPipelineRunId}
                readRunActivity={telemetry.readRunActivity}
                readRunIsProcessing={
                  telemetry.readRunIsProcessing ||
                  synthesis.status === "running"
                }
                readRunMode={telemetry.readRunMode || "read"}
                readRunTelemetryError={
                  telemetry.readRunTelemetryError || synthesis.error
                }
                readRunStartMs={telemetry.readRunStartMs}
                readRunEndMs={telemetry.readRunEndMs}
                readRunEvents={telemetry.readRunEvents}
                readLogScrolled={telemetry.readLogScrolled}
                setReadLogScrolled={telemetry.setReadLogScrolled}
                onDismissError={() =>
                  telemetry.setDismissedTelemetryErrorRunId(
                    selectedPipelineRunId,
                  )
                }
                onRefresh={() => {
                  void refreshLiveRuns();
                }}
                selectedRunPacks={telemetry.selectedRunPacks}
              />
            ) : null}

            <ReadsAssetPackOptions
              options={synthesis.options}
              envelope={synthesis.envelope}
              selectedIndexes={synthesis.selectedIndexes}
              onToggleSelect={synthesis.toggleSelect}
              onSettleSelected={() => void handleSettleSelected()}
              settleBusy={settleBusy}
              settleError={settleError}
              settleMessage={settleMessage}
            />
          </div>

          <ReadsRouteStateAside
            readRouteSession={readRouteSession}
            sessionRows={sessionRows}
            authorityRows={authorityRows}
            procurementRows={procurementRows}
          />
        </ProductDetailStage>
      </ProductRouteShell>
    </BitcodeShellBridgeProvider>
  );
}
