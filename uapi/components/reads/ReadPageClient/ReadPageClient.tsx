"use client";

/**
 * Reads experience page client — thin orchestration for /reads.
 *
 * Owns repository context state, pipeline table filters/pagination, and
 * composition of section components. Live runs, URL, telemetry, session
 * projections, and activity recording live under hooks/.
 */

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

import {
  ProductRouteEnterpriseSummary,
  ProductRouteShell,
  ProductRouteStepGrid,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import ReadsDepositReadWorkbench from "@/components/reads/ReadsDepositReadWorkbench/ReadsDepositReadWorkbench";
import ReadsRepositoryContextPanel from "@/components/reads/ReadsRepositoryContextPanel/ReadsRepositoryContextPanel";
import ReadsReadScenarioPanel from "@/components/reads/ReadsReadScenarioPanel/ReadsReadScenarioPanel";
import { ReadsNeedComposePanel } from "@/components/reads/ReadsNeedComposePanel/ReadsNeedComposePanel";
import { ReadsPipelinesSection } from "@/components/reads/ReadsPipelinesSection/ReadsPipelinesSection";
import { ReadsRouteStateAside } from "@/components/reads/ReadsRouteStateAside/ReadsRouteStateAside";
import { BitcodeShellBridgeProvider } from "@/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge";
import type { TerminalRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import {
  DEFAULT_TRANSACTION_FILTERS,
  DEFAULT_TRANSACTION_PAGINATION,
  type TransactionFilters,
  type TransactionPagination,
} from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import { writeReadRouteStage } from "@/components/reads/models/read-route-model";
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
    readCurrentSearchParams,
    replaceReadSearchParams,
    openReadRouteTransaction,
    closePipelineDetail,
  } = useReadUrlNavigation();

  const [repositoryContext, setRepositoryContext] =
    useState<TerminalRepositoryContextState | null>(null);
  const [need, setNeed] = useState("");
  const [settleBusy, setSettleBusy] = useState(false);
  const [settleError, setSettleError] = useState<string | null>(null);
  const [settleMessage, setSettleMessage] = useState<string | null>(null);

  const synthesis = useReadOptionSynthesis({
    repositoryContext,
    need,
    refreshLiveRuns,
    onRunDispatched: (runId) => {
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
            : "SettleAssetPacks failed.",
        );
      }
      setSettleMessage(
        `Settled ${selected.length} option(s). Settle run ${payload.settleRunId} — see /packs for activity.`,
      );
      void Promise.resolve(refreshLiveRuns() as unknown);
    } catch (err) {
      setSettleError(
        err instanceof Error ? err.message : "SettleAssetPacks failed.",
      );
    } finally {
      setSettleBusy(false);
    }
  }, [
    need,
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
  // Master-detail pipelines table: filters + pagination for the Reads run
  // table (selection itself lives in the URL transactionId). The lens filter
  // defaults to 'all': pipeline runs are typed 'agentic-execution:asset-pack'
  // whichever lens dispatched them, and a 'read'-only preset would hide every
  // telemetry-capable row until the read dispatch stamps its own lens
  // context (read pipeline persistence is a read-gate item).
  const [pipelineFilters, setPipelineFilters] = useState<TransactionFilters>(
    DEFAULT_TRANSACTION_FILTERS,
  );
  const [pipelinePagination, setPipelinePagination] =
    useState<TransactionPagination>(DEFAULT_TRANSACTION_PAGINATION);

  // Selection is EXPLICIT (drill-in sub-page model): no auto-recovery to the
  // newest run and no first-row fallback — with nothing selected the master
  // table shows, and selecting a row replaces it with the run detail.
  const selectedRun = useMemo(
    () => liveRuns.find((run) => run.id === selectedTransactionId) || null,
    [liveRuns, selectedTransactionId],
  );

  const telemetry = useReadPipelineTelemetry(selectedRun);
  const {
    depositedSourceRevision,
    admittedReadActivityId,
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

  return (
    <BitcodeShellBridgeProvider>
      <ProductRouteShell
        testId="route-shell-read"
        tone="sky"
        label="Read"
        title="Reading"
        summary="Need -> SynthesizeReadAssetPacks (SDIVF) -> select options -> SettleAssetPacks (pay · BTD · PR) -> /packs."
        icon={Workflow}
        metrics={[
          {
            label: "Stage",
            description:
              "Where this reading session currently sits in the journey: request read, review the synthesized Need, request fit, review the synthesized AssetPack, then buy and settle.",
            value: readRouteSession.activeStepId.replace(/-/g, " "),
          },
          {
            label: "Rows",
            description:
              "How many pipeline runs this account can read in the Read pipelines table below.",
            value: isLoadingRuns ? "reading" : String(liveRuns.length),
          },
          {
            label: "Boundary",
            description:
              "The disclosure boundary for this page: measurements and proofs are visible; source-bearing AssetPack contents stay withheld until BTC finality and BTD rights transfer.",
            value: "source-safe",
          },
          {
            label: "Quote",
            description:
              "The deterministic BTC-testnet quote basis (sats) for the current read under the procurement budget policy.",
            value: formatSats(
              readRouteSession.procurementGovernance.budgetPolicy.quoteSats,
            ),
          },
        ]}
      >
        <ProductRouteStepGrid
          ariaLabel="Reading steps"
          activeStepId={readRouteSession.activeStepId}
          steps={readRouteSession.steps}
          tone="sky"
          testIdPrefix="read-route-step"
          stateDataAttribute="data-reading-step-state"
          onSelect={(stepId) =>
            replaceReadSearchParams(
              writeReadRouteStage(readCurrentSearchParams(), stepId),
            )
          }
        />

        <ProductRouteEnterpriseSummary
          testId="read-enterprise-economic-summary"
          tone="sky"
          title="Reading economy overview"
          metrics={[
            {
              label: "Need review",
              value: readRouteSession.readObjects.acceptedNeedPresent
                ? "accepted"
                : "pending",
              state: "pre-fit",
              description:
                "Finding Fits remains blocked until the Need is accepted.",
            },
            {
              label: "Quote",
              value: formatSats(
                readRouteSession.procurementGovernance.quotePolicy.shareToFee
                  .grossSats,
              ),
              state: readRouteSession.procurementGovernance.quotePolicy.state,
              description: "Measurement-weight-volume fee calculation.",
            },
            {
              label: "Settlement",
              value:
                readRouteSession.procurementGovernance.settlement.readiness.replace(
                  /-/g,
                  " ",
                ),
              state: "BTC/BTD",
              description: "Source remains withheld until rights are paid.",
            },
            {
              label: "Authority",
              value:
                readRouteSession.organizationPolicyWalletAuthority.aggregate
                  .state,
              state:
                readRouteSession.organizationPolicyWalletAuthority
                  .walletAuthority.state,
              description: "Organization spend and wallet policy readback.",
            },
          ]}
        />

        <ReadsPipelinesSection
          selectedRun={selectedRun}
          liveRuns={liveRuns}
          isLoadingRuns={isLoadingRuns}
          runsLoadError={runsLoadError}
          pipelineFilters={pipelineFilters}
          pipelinePagination={pipelinePagination}
          onFiltersChange={setPipelineFilters}
          onPaginationChange={setPipelinePagination}
          onSelectTransaction={openReadRouteTransaction}
          onCloseDetail={closePipelineDetail}
          onRefresh={() => {
            void refreshLiveRuns();
          }}
          selectedPipelineRunId={telemetry.selectedPipelineRunId}
          telemetry={{
            readRunActivity: telemetry.readRunActivity,
            readRunIsProcessing: telemetry.readRunIsProcessing,
            readRunMode: telemetry.readRunMode,
            readRunTelemetryError: telemetry.readRunTelemetryError,
            readRunStartMs: telemetry.readRunStartMs,
            readRunEndMs: telemetry.readRunEndMs,
            readRunEvents: telemetry.readRunEvents,
            readLogScrolled: telemetry.readLogScrolled,
            setReadLogScrolled: telemetry.setReadLogScrolled,
            onDismissError: () =>
              telemetry.setDismissedTelemetryErrorRunId(
                telemetry.selectedPipelineRunId,
              ),
            selectedRunPacks: telemetry.selectedRunPacks,
          }}
        />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
          <div className="grid min-w-0 gap-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <ReadsRepositoryContextPanel
                preferredRepository={selectedRun?.repository || null}
                onContextChange={setRepositoryContext}
                onRecordActivity={handleRecordActivity}
              />
              <ReadsReadScenarioPanel
                onRecordActivity={handleRecordActivity}
                showDemonstrationScenarios={false}
              />
            </div>
            <ReadsNeedComposePanel
              need={need}
              onNeedChange={setNeed}
              status={synthesis.status}
              error={synthesis.error}
              runId={synthesis.runId}
              options={synthesis.options}
              envelope={synthesis.envelope}
              selectedIndexes={synthesis.selectedIndexes}
              onToggleSelect={synthesis.toggleSelect}
              onSynthesize={() => void synthesis.synthesize()}
              onSettleSelected={() => void handleSettleSelected()}
              settleBusy={settleBusy}
              settleError={settleError}
              settleMessage={settleMessage}
              canSynthesize={Boolean(
                repositoryContext?.selectedRepository?.fullName,
              )}
            />
            <ReadsDepositReadWorkbench
              repositoryContext={repositoryContext}
              depositedSourceRevision={depositedSourceRevision}
              admittedReadActivityId={admittedReadActivityId}
              routeReadingStage={routeReadingStage}
              onRecordActivity={handleRecordActivity}
              onHostCompleted={refreshLiveRuns}
              showDemonstrationWorkbench={false}
            />
          </div>

          <ReadsRouteStateAside
            readRouteSession={readRouteSession}
            sessionRows={sessionRows}
            authorityRows={authorityRows}
            procurementRows={procurementRows}
          />
        </section>
      </ProductRouteShell>
    </BitcodeShellBridgeProvider>
  );
}
