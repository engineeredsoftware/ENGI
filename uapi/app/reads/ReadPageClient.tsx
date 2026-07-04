"use client";

import Link from "next/link";
import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Wallet,
  Workflow,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchPipelineExecutionHistory } from "@/networking/api-client";
import type { PipelineExecution } from "@/types/api";

import {
  ProductRouteDisclosure,
  ProductRouteEnterpriseSummary,
  ProductRouteKeyboardHint,
  ProductRouteProofDetail,
  ProductRouteShell,
  ProductRouteStatePanel,
  ProductRouteStepGrid,
} from "@/components/base/bitcode/routes/product-route-shell";
import TerminalDepositReadWorkbench from "@/app/terminal/TerminalDepositReadWorkbench";
import TerminalRepositoryContextPanel from "@/app/terminal/TerminalRepositoryContextPanel";
import TerminalReadScenarioPanel from "@/app/terminal/TerminalReadScenarioPanel";
import { TerminalShellBridgeProvider } from "@/app/terminal/terminal-shell-bridge";
import type { TerminalDepositedSourceRevision } from "@/app/terminal/terminal-deposit-read-workbench";
import {
  buildTerminalExecutionHistoryRequest,
  mapExecutionHistoryRunToWorkspaceRun,
  readTerminalRouteError,
  type TerminalActivityRecordDraft,
  upsertWorkspaceRun,
} from "@/app/terminal/terminal-activity-history";
import type { TerminalRepositoryContextState } from "@/app/terminal/terminal-repository-context";
import {
  readTerminalTransactionId,
  writeTerminalTransactionId,
} from "@/app/terminal/terminal-transaction-query";
import { shouldRecoverTerminalTransactionRoute } from "@/app/terminal/terminal-transaction-query";
import type { WorkspaceRun } from "@/app/terminal/terminal-run-data";
import { buildReadHref } from "@/app/terminal/terminal-routes";
import TerminalTransactionsTable from "@/app/terminal/TerminalTransactionsTable";
import {
  DEFAULT_TRANSACTION_FILTERS,
  DEFAULT_TRANSACTION_PAGINATION,
  type TransactionFilters,
  type TransactionPagination,
} from "@/components/base/bitcode/execution/bitcode-transaction-types";
import { usePipelineExecution } from "@/hooks/usePipelineExecution";
import { buildTerminalRunActivityFromEvents } from "@/app/terminal/terminal-run-activity";
import { PipelineExecutionLog } from "@/components/base/bitcode/execution/pipeline-execution-log";
import { ExecutionContextPillRow } from "@/components/base/bitcode/execution/ExecutionContextPillRow";
import { RunClock } from "@/components/base/bitcode/execution/RunClock";

import {
  buildReadRouteSession,
  readReadRouteStage,
  writeReadRouteStage,
} from "./read-route-model";

function shortIdentifier(value: string | null | undefined) {
  if (!value) return "pending";
  return value.length > 18 ? `${value.slice(0, 12)}...` : value;
}

function formatSats(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "pending";
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)} sats`;
}

export default function ReadPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );
  const selectedTransactionId = useMemo(
    () => readTerminalTransactionId(routeSearchParams),
    [routeSearchParams],
  );
  const routeReadingStage = useMemo(
    () => readReadRouteStage(routeSearchParams),
    [routeSearchParams],
  );
  const [liveRuns, setLiveRuns] = useState<WorkspaceRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [runsLoadError, setRunsLoadError] = useState<string | null>(null);
  const [repositoryContext, setRepositoryContext] =
    useState<TerminalRepositoryContextState | null>(null);
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
  const [readLogScrolled, setReadLogScrolled] = useState(false);
  // Telemetry error dismissal is per selected run.
  const [dismissedTelemetryErrorRunId, setDismissedTelemetryErrorRunId] =
    useState<string | null>(null);

  const readCurrentSearchParams = useCallback(
    () =>
      typeof window !== "undefined" && window.location.pathname === "/reads"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const replaceReadSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.replace(buildReadHref(query), { scroll: false });
    },
    [router],
  );

  const replaceReadRouteTransaction = useCallback(
    (transactionId: string) => {
      replaceReadSearchParams(
        writeTerminalTransactionId(readCurrentSearchParams(), transactionId),
      );
    },
    [readCurrentSearchParams, replaceReadSearchParams],
  );

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
      return [];
    } finally {
      setIsLoadingRuns(false);
    }
  }, []);

  useEffect(() => {
    void refreshLiveRuns();
  }, [refreshLiveRuns]);

  useEffect(() => {
    if (
      !shouldRecoverTerminalTransactionRoute({
        transactionIds: liveRuns.map((run) => run.id),
        selectedTransactionId,
      })
    ) {
      return;
    }
    replaceReadRouteTransaction(liveRuns[0].id);
  }, [liveRuns, replaceReadRouteTransaction, selectedTransactionId]);

  const selectedRun = useMemo(
    () =>
      liveRuns.find((run) => run.id === selectedTransactionId) ||
      liveRuns[0] ||
      null,
    [liveRuns, selectedTransactionId],
  );

  // Master-detail telemetry: selecting a PIPELINE run (an executions row the
  // formal pipeline streams events into) connects the Telemetry detail to it —
  // a running run attaches its live stream (usePipelineExecution tails any
  // runId), a terminal run replays its persisted history.
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
      buildTerminalRunActivityFromEvents(
        readRunEvents,
        readRunWorkUpdate,
        readRunIterationUpdates,
        readRunStreamError,
      ),
    [readRunEvents, readRunIterationUpdates, readRunStreamError, readRunWorkUpdate],
  );
  const readRunIsProcessing =
    selectedRun?.status === "running" &&
    !readRunActivity.isStreamingComplete &&
    !readRunActivity.error;
  // The telemetry labels follow the RUN's lens, not the page: a deposit
  // synthesis run selected here must not be narrated as a Reading run.
  const readRunMode =
    selectedRun?.contextSource === "deposit-option-synthesis" ? "deposit" : "read";
  const readRunTelemetryError =
    dismissedTelemetryErrorRunId === selectedPipelineRunId ? null : readRunActivity.error;
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

  const depositedSourceRevision =
    useMemo<TerminalDepositedSourceRevision | null>(() => {
      const selectedRepository = repositoryContext?.selectedRepository || null;
      if (!selectedRepository) return null;
      const selectedBranch =
        repositoryContext?.selectedBranch ||
        selectedRepository.defaultBranch ||
        "main";
      const matchingSubmission = liveRuns.find(
        (run) =>
          run.contextSource === "terminal-deposit-composer" &&
          run.repository === selectedRepository.fullName &&
          run.branch === selectedBranch &&
          Boolean(run.sourceCommit) &&
          Boolean(run.candidateAssetId),
      );
      if (!matchingSubmission?.sourceCommit) return null;

      return {
        repositoryFullName: selectedRepository.fullName,
        branch: selectedBranch,
        commit: matchingSubmission.sourceCommit,
        activityId: matchingSubmission.id,
        createdAt: matchingSubmission.created_at,
        depositAssetId: matchingSubmission.candidateAssetId || null,
        hasWalletOrAttestationProof: Boolean(
          matchingSubmission.candidateAssetId,
        ),
        hasAssetMeasurementEvidence: Boolean(
          matchingSubmission.candidateAssetId,
        ),
        proofRoot: matchingSubmission.depositProofRoot || null,
        measurementRoot: matchingSubmission.depositMeasurementRoot || null,
        reconciliationReadbackRoot:
          matchingSubmission.depositReconciliationReadbackRoot || null,
        depositorySearchDocumentRoot:
          matchingSubmission.depositorySearchDocumentRoot || null,
        lexicalDocumentRoot: matchingSubmission.lexicalDocumentRoot || null,
        vectorDocumentRoot: matchingSubmission.vectorDocumentRoot || null,
        compensationPreviewRoot:
          matchingSubmission.compensationPreviewRoot || null,
        sourceToSharesPreviewRoot:
          matchingSubmission.sourceToSharesPreviewRoot || null,
        compensationState: matchingSubmission.compensationState || null,
        compensationAllocationMethod:
          matchingSubmission.compensationAllocationMethod || null,
        compensationPriceAsset:
          matchingSubmission.compensationPriceAsset || null,
        depositorWalletId: matchingSubmission.depositorWalletId || null,
        depositoryIndexState: matchingSubmission.depositoryIndexState || null,
      };
    }, [liveRuns, repositoryContext]);

  const admittedReadActivityId = useMemo(() => {
    const selectedRepository = repositoryContext?.selectedRepository || null;
    if (!selectedRepository) return null;
    const sourceBranch =
      depositedSourceRevision?.branch ||
      repositoryContext?.selectedBranch ||
      selectedRepository.defaultBranch ||
      "main";
    const sourceCommit =
      depositedSourceRevision?.commit ||
      repositoryContext?.selectedCommit ||
      null;
    const matchingRead = liveRuns.find(
      (run) =>
        run.contextSource === "terminal-deposit-read-workbench" &&
        run.contextWorkbench === "read-admission" &&
        run.repository === selectedRepository.fullName &&
        run.branch === sourceBranch &&
        (!sourceCommit || run.sourceCommit === sourceCommit),
    );
    return matchingRead?.id || null;
  }, [depositedSourceRevision, liveRuns, repositoryContext]);

  const readRouteSession = useMemo(
    () =>
      buildReadRouteSession({
        transactionId: selectedTransactionId || admittedReadActivityId || null,
        routeReadingStage,
        repositoryFullName:
          repositoryContext?.selectedRepository?.fullName || null,
        sourceBranch:
          depositedSourceRevision?.branch ||
          repositoryContext?.selectedBranch ||
          null,
        sourceCommit:
          depositedSourceRevision?.commit ||
          repositoryContext?.selectedCommit ||
          null,
        hasRepositorySource: Boolean(repositoryContext?.selectedRepository),
        hasReadMeasurement: Boolean(
          admittedReadActivityId ||
            selectedRun?.contextWorkbench === "read-admission" ||
            selectedRun?.transactionLens === "read",
        ),
        hasSynthesizedNeed: Boolean(
          admittedReadActivityId ||
            selectedRun?.contextSource === "terminal-staged-reading",
        ),
        hasAcceptedNeed: Boolean(admittedReadActivityId),
        findingFitsRunning: Boolean(
          selectedRun?.type?.includes("asset-pack") &&
            selectedRun.status === "running",
        ),
        hasSourceSafePreview: Boolean(
          selectedRun?.type?.includes("asset-pack") &&
            selectedRun.status === "completed",
        ),
        hasSettlementReadback: Boolean(
          selectedRun?.closureFocus?.toLowerCase().includes("settlement"),
        ),
        hasDeliveryReadback: Boolean(
          selectedRun?.closureFocus?.toLowerCase().includes("delivery"),
        ),
        measuredBtd: selectedRun?.measuredBtd ?? null,
        quoteSats:
          typeof selectedRun?.btcFeeUsdEquivalent === "number"
            ? Math.max(1, Math.round(selectedRun.btcFeeUsdEquivalent * 10_000))
            : null,
        settlementQuoteId: selectedRun?.id ? `quote:${selectedRun.id}` : null,
        procurementApproved: Boolean(
          selectedRun?.closureFocus?.toLowerCase().includes("settlement") ||
            selectedRun?.closureFocus?.toLowerCase().includes("delivery"),
        ),
        buyerAuthorized: true,
        walletAuthorityPresent: Boolean(
          selectedRun?.closureFocus?.toLowerCase().includes("wallet") ||
            selectedRun?.closureFocus?.toLowerCase().includes("settlement") ||
            selectedRun?.closureFocus?.toLowerCase().includes("delivery"),
        ),
      }),
    [
      admittedReadActivityId,
      depositedSourceRevision,
      repositoryContext,
      routeReadingStage,
      selectedRun,
      selectedTransactionId,
    ],
  );

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
      if (!payload.execution)
        throw new Error(
          "Reading activity response did not include an execution row.",
        );

      const nextRun = mapExecutionHistoryRunToWorkspaceRun(payload.execution);
      setLiveRuns((currentRuns) => upsertWorkspaceRun(currentRuns, nextRun));
      if (draft.selectAfterRecord !== false)
        replaceReadRouteTransaction(nextRun.id);
      void refreshLiveRuns();
      return nextRun;
    },
    [
      refreshLiveRuns,
      replaceReadRouteTransaction,
      repositoryContext,
      selectedRun,
    ],
  );

  const sessionRows = [
    {
      label: "Repository",
      value:
        readRouteSession.routeState.repositoryFullName || "select repository",
    },
    {
      label: "Branch",
      value: readRouteSession.routeState.sourceBranch || "pending",
    },
    {
      label: "Commit",
      value: shortIdentifier(readRouteSession.routeState.sourceCommit),
    },
    {
      label: "Transaction",
      value: shortIdentifier(readRouteSession.routeState.transactionId),
    },
    {
      label: "Need pipeline",
      value: readRouteSession.pipelineOwnership.readNeedPipeline,
    },
    {
      label: "Fits pipeline",
      value: readRouteSession.pipelineOwnership.findingFitsPipeline,
    },
  ];

  const procurementRows = [
    {
      label: "Budget",
      value: formatSats(
        readRouteSession.procurementGovernance.budgetPolicy.budgetEnvelopeSats,
      ),
    },
    {
      label: "Quote",
      value: formatSats(
        readRouteSession.procurementGovernance.quotePolicy.shareToFee.grossSats,
      ),
    },
    {
      label: "Approval",
      value: readRouteSession.procurementGovernance.budgetPolicy.approvalRequired
        ? readRouteSession.procurementGovernance.approval.procurementApproved
          ? "approved"
          : "required"
        : "not required",
    },
    {
      label: "Settlement",
      value: readRouteSession.procurementGovernance.settlement.readiness.replace(
        /-/g,
        " ",
      ),
    },
  ];

  const authorityRows = [
    {
      label: "Authority",
      value: readRouteSession.organizationPolicyWalletAuthority.aggregate.state,
    },
    {
      label: "Wallet",
      value: readRouteSession.organizationPolicyWalletAuthority.walletAuthority.state,
    },
    {
      label: "Spend",
      value: readRouteSession.organizationPolicyWalletAuthority.budgetApproval.state,
    },
    {
      label: "Required denials",
      value: String(
        readRouteSession.organizationPolicyWalletAuthority.aggregate
          .requiredDeniedActionCount,
      ),
    },
    {
      label: "Authority root",
      value: readRouteSession.organizationPolicyWalletAuthority.roots.authorityRoot,
    },
  ];

  return (
    <TerminalShellBridgeProvider>
      <ProductRouteShell
        testId="route-shell-read"
        tone="sky"
        label="Read"
        title="Reading"
        summary="Read request -> Need -> Finding Fits -> Preview -> Settlement."
        icon={Workflow}
        metrics={[
          {
            label: "Stage",
            value: readRouteSession.activeStepId.replace(/-/g, " "),
          },
          {
            label: "Rows",
            value: isLoadingRuns ? "reading" : String(liveRuns.length),
          },
          { label: "Boundary", value: "source-safe" },
          {
            label: "Quote",
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
              description: "Finding Fits remains blocked until the Need is accepted.",
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
              value: readRouteSession.procurementGovernance.settlement.readiness.replace(
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

        <section
          aria-label="Read pipelines"
          className="border border-white/10 bg-white/[0.035] px-4 py-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
                Pipelines
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                Read pipelines
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                void refreshLiveRuns();
              }}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-sky-300/30 hover:bg-sky-300/10"
              aria-label="Refresh Read pipelines"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {/* Master table of Read pipeline runs — selecting a row writes the
              URL transactionId; a pipeline run's selection connects the
              Telemetry detail below (live stream when running, replayed
              history when terminal). */}
          <div className="mt-4" data-testid="reads-pipelines-table">
            <TerminalTransactionsTable
              runs={liveRuns}
              selectedTransactionId={selectedRun?.id ?? null}
              onSelectTransaction={replaceReadRouteTransaction}
              filters={pipelineFilters}
              onFiltersChange={setPipelineFilters}
              onResetFilters={() => setPipelineFilters(DEFAULT_TRANSACTION_FILTERS)}
              pagination={pipelinePagination}
              onPaginationChange={setPipelinePagination}
              isLoadingRuns={isLoadingRuns}
              runsError={runsLoadError}
              transactionDataMode="live"
              surface="pipelines"
            />
          </div>
        </section>

        {selectedPipelineRunId ? (
          <section
            aria-label="Read pipeline telemetry"
            className="border border-white/10 bg-white/[0.035] px-4 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
                  Telemetry
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Read pipeline telemetry
                </h2>
                {readRunIsProcessing && readRunActivity.latestContext ? (
                  <div className="mt-3" data-testid="reads-telemetry-live-tracker">
                    <ExecutionContextPillRow
                      phase={readRunActivity.latestContext.phase}
                      agent={readRunActivity.latestContext.agent}
                      step={readRunActivity.latestContext.step}
                      failsafe={readRunActivity.latestContext.failsafe}
                      generation={readRunActivity.latestContext.generation}
                      mode={readRunMode}
                    />
                  </div>
                ) : (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
                    Source-safe pipeline telemetry for the selected run:
                    phases, agents, generation stages, provider, model, and
                    usage. Prompt and response content stays withheld by law.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {typeof readRunActivity.currentIteration === "number" && (
                  <span
                    title="DIV loop iteration (Discovery → Implementation → Validation)"
                    className="border border-sky-300/15 bg-sky-300/10 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sky-100"
                  >
                    iter {readRunActivity.currentIteration}
                  </span>
                )}
                <RunClock
                  startedAtMs={readRunStartMs}
                  running={readRunIsProcessing}
                  endedAtMs={readRunEndMs}
                  className="font-mono text-[0.72rem] text-sky-100/90"
                />
                <span className="border border-white/10 bg-black/30 px-3 py-2 font-mono text-[0.62rem] text-neutral-400">
                  {selectedPipelineRunId}
                </span>
              </div>
            </div>
            {readRunActivity.readyToFinishVerdicts.length > 0 &&
              (() => {
                const verdicts = readRunActivity.readyToFinishVerdicts;
                const latest = verdicts[verdicts.length - 1];
                const approved = latest.finalApproval === true;
                return (
                  <div
                    data-testid="reads-telemetry-readiness-verdict"
                    className={`mt-3 border px-3 py-2 text-xs leading-5 ${
                      approved
                        ? "border-emerald-300/20 bg-emerald-300/5 text-emerald-100/90"
                        : "border-amber-300/20 bg-amber-300/5 text-amber-100/90"
                    }`}
                  >
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                      {`iter ${latest.iteration ?? "—"} verdict · `}
                      {approved
                        ? "ready to finish"
                        : `iterate${latest.recommendation ? ` (${latest.recommendation})` : ""}`}
                      {latest.warningsCount > 0 && ` · ${latest.warningsCount} warnings`}
                    </p>
                    {approved
                      ? latest.summary && (
                          <p className="mt-1 max-w-4xl text-neutral-300">{latest.summary}</p>
                        )
                      : latest.reasons.length > 0 && (
                          <ul className="mt-1 max-w-4xl list-disc space-y-1 pl-4 text-neutral-300">
                            {latest.reasons.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        )}
                  </div>
                );
              })()}
            <div className="mt-4 min-w-0">
              <PipelineExecutionLog
                output={readRunActivity.output}
                outputDetails={readRunActivity.outputDetails}
                isProcessing={Boolean(readRunIsProcessing)}
                error={readRunTelemetryError}
                onRetry={() => {
                  void refreshLiveRuns();
                }}
                onDismissError={() => setDismissedTelemetryErrorRunId(selectedPipelineRunId)}
                userHasScrolled={readLogScrolled}
                setUserHasScrolled={setReadLogScrolled}
                compact
                pipelineMode={readRunMode}
                liveContext={readRunActivity.latestContext}
                copyData={{
                  runId: selectedPipelineRunId,
                  status: selectedRun?.status ?? null,
                  error: readRunActivity.error,
                  outputDetails: readRunActivity.outputDetails,
                  events: readRunEvents,
                }}
              />
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
          <div className="grid min-w-0 gap-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <TerminalRepositoryContextPanel
                preferredRepository={selectedRun?.repository || null}
                onContextChange={setRepositoryContext}
                onRecordActivity={handleRecordActivity}
              />
              <TerminalReadScenarioPanel
                onRecordActivity={handleRecordActivity}
                showDemonstrationScenarios={false}
              />
            </div>
            <TerminalDepositReadWorkbench
              repositoryContext={repositoryContext}
              depositedSourceRevision={depositedSourceRevision}
              admittedReadActivityId={admittedReadActivityId}
              routeReadingStage={routeReadingStage}
              onRecordActivity={handleRecordActivity}
              onHarnessCompleted={refreshLiveRuns}
              showDemonstrationWorkbench={false}
            />
          </div>

          <aside className="grid h-fit gap-5" aria-label="Reading route state">
            <ProductRouteKeyboardHint
              testId="read-keyboard-navigation"
              tone="sky"
              shortcuts={[
                { keys: "Tab", label: "Move through the five Reading steps and source controls." },
                { keys: "Enter", label: "Activate the focused step, refresh, or route action." },
                { keys: "Space", label: "Open or close source-safe proof detail." },
              ]}
            />

            <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
                    Session
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Source-safe read state
                  </h2>
                </div>
                <ShieldCheck
                  className="h-5 w-5 text-emerald-200"
                  aria-hidden="true"
                />
              </div>
              <dl className="mt-4 grid gap-2">
                {sessionRows.map((row) => (
                  <div
                    key={row.label}
                    className="border border-white/8 bg-black/20 px-3 py-2"
                  >
                    <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                      {row.label}
                    </dt>
                    <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3">
                <ProductRouteDisclosure title="Disclosure boundary" tone="sky">
                  Visible: Need measurements, fit ids, proof roots, fee quotes,
                  settlement readback, delivery posture. Withheld until paid
                  rights: source-bearing AssetPack contents.
                </ProductRouteDisclosure>
              </div>
              <div className="mt-3">
                <ProductRouteProofDetail
                  testId="read-expandable-proof-detail"
                  title="Reading proof detail"
                  tone="sky"
                  roots={[
                    {
                      id: "route-session-root",
                      label: "Route session root",
                      root: readRouteSession.proofRoot,
                    },
                    {
                      id: "budget-policy-root",
                      label: "Budget policy root",
                      root: readRouteSession.procurementGovernance.budgetPolicy
                        .policyRoot,
                    },
                    {
                      id: "quote-root",
                      label: "Quote root",
                      root: readRouteSession.procurementGovernance.quotePolicy
                        .quoteRoot,
                    },
                    {
                      id: "settlement-readiness-root",
                      label: "Settlement readiness root",
                      root: readRouteSession.procurementGovernance.settlement
                        .readinessRoot,
                    },
                    {
                      id: "fit-measurement-review-root",
                      label: "Fit measurement review root",
                      root: readRouteSession.fitMeasurementReview.reviewRoot,
                    },
                    {
                      id: "quote-basis-root",
                      label: "Quote basis root",
                      root: readRouteSession.fitMeasurementReview.quoteBasis
                        .basisRoot,
                    },
                    {
                      id: "rights-receipt-root",
                      label: "BTD rights receipt root",
                      root: readRouteSession.settlementRightsDelivery.btdRights
                        .rightsReceiptRoot,
                    },
                    {
                      id: "delivery-receipt-root",
                      label: "Delivery receipt root",
                      root: readRouteSession.settlementRightsDelivery.delivery
                        .deliveryReceiptRoot,
                    },
                    {
                      id: "authority-root",
                      label: "Authority root",
                      root: readRouteSession.organizationPolicyWalletAuthority
                        .roots.authorityRoot,
                    },
                  ]}
                />
              </div>
            </section>

            <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
                    Governance
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Organization authority
                  </h2>
                </div>
                <ShieldCheck
                  className="h-5 w-5 text-sky-200"
                  aria-hidden="true"
                />
              </div>
              <dl className="mt-4 grid gap-2">
                {authorityRows.map((row) => (
                  <div
                    key={row.label}
                    className="border border-white/8 bg-black/20 px-3 py-2"
                  >
                    <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                      {row.label}
                    </dt>
                    <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {readRouteSession.organizationPolicyWalletAuthority.aggregate
                .blockers.length ? (
                <div className="mt-3">
                  <ProductRouteDisclosure
                    title="Authority blockers"
                    tone="sky"
                  >
                    {readRouteSession.organizationPolicyWalletAuthority.aggregate.blockers.join(
                      "; ",
                    )}
                  </ProductRouteDisclosure>
                </div>
              ) : null}
            </section>

            <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
                    Procurement
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Budget and quote
                  </h2>
                </div>
                <BadgeDollarSign
                  className="h-5 w-5 text-emerald-200"
                  aria-hidden="true"
                />
              </div>
              <dl className="mt-4 grid gap-2">
                {procurementRows.map((row) => (
                  <div
                    key={row.label}
                    className="border border-white/8 bg-black/20 px-3 py-2"
                  >
                    <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                      {row.label}
                    </dt>
                    <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 grid gap-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5 text-sky-200" aria-hidden="true" />
                  <span>
                    {readRouteSession.procurementGovernance.quotePolicy.state.replace(
                      /-/g,
                      " ",
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet
                    className="h-3.5 w-3.5 text-sky-200"
                    aria-hidden="true"
                  />
                  <span>
                    {readRouteSession.procurementGovernance.approval.walletAuthorityPresent
                      ? "wallet authority present"
                      : "wallet authority pending"}
                  </span>
                </div>
              </div>
              {readRouteSession.procurementGovernance.settlement.blockers
                .length ? (
                <div className="mt-3">
                  <ProductRouteDisclosure
                    title="Procurement blockers"
                    tone="sky"
                  >
                    {readRouteSession.procurementGovernance.settlement.blockers.join(
                      "; ",
                    )}
                  </ProductRouteDisclosure>
                </div>
              ) : null}
            </section>

            <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
                    Measurement
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Fit measurement review
                  </h2>
                </div>
                <ShieldCheck
                  className="h-5 w-5 text-emerald-200"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-xs text-neutral-400">
                Source-safe Need-relative measurements decide the BTC-testnet
                quote before any payment. No measurement, no price.
              </p>
              {readRouteSession.fitMeasurementReview.visible ? (
                <>
                  <dl className="mt-4 grid grid-cols-2 gap-2">
                    {readRouteSession.fitMeasurementReview.measurements.map(
                      (measurement) => (
                        <div
                          key={measurement.measurementId}
                          className="border border-white/8 bg-black/20 px-3 py-2"
                        >
                          <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                            {measurement.label}
                          </dt>
                          <dd className="mt-1 text-sm text-neutral-200">
                            {(measurement.measurementVolume * 100).toFixed(0)}%
                            / weight {measurement.weight.toFixed(2)}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                  <dl className="mt-2 grid gap-2">
                    <div className="border border-white/8 bg-black/20 px-3 py-2">
                      <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                        Final BTD scalar
                      </dt>
                      <dd className="mt-1 text-sm text-neutral-200">
                        {readRouteSession.fitMeasurementReview.btdScalarVolume}{" "}
                        BTD knowledge-volume
                      </dd>
                    </div>
                    <div className="border border-white/8 bg-black/20 px-3 py-2">
                      <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                        Quote basis
                      </dt>
                      <dd className="mt-1 text-sm text-neutral-200">
                        {formatSats(
                          readRouteSession.fitMeasurementReview.quoteBasis
                            .grossSats,
                        )}{" "}
                        on {readRouteSession.fitMeasurementReview.quoteBasis.network}
                      </dd>
                    </div>
                    <div className="border border-white/8 bg-black/20 px-3 py-2">
                      <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                        Selected Fit provenance
                      </dt>
                      <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
                        {
                          readRouteSession.fitMeasurementReview
                            .selectedFitProvenance.depositoryAssetPackCount
                        }{" "}
                        Depository AssetPack fit(s) /{" "}
                        {
                          readRouteSession.fitMeasurementReview
                            .selectedFitProvenance.provenanceRoot
                        }
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <div className="mt-4">
                  <ProductRouteStatePanel
                    compact
                    variant="empty"
                    title="Measurement review pending"
                    message={
                      readRouteSession.fitMeasurementReview.repairBlockers.join(
                        "; ",
                      ) || "Accept a Need and request Finding Fits first."
                    }
                  />
                </div>
              )}
            </section>

            <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-sky-200/80">
                    Settlement
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Settlement, rights, and delivery
                  </h2>
                </div>
                <Wallet className="h-5 w-5 text-emerald-200" aria-hidden="true" />
              </div>
              <p className="mt-2 text-xs text-neutral-400">
                BTC-testnet finality precedes BTD rights; BTD rights precede
                source-bearing repository delivery.
              </p>
              <dl className="mt-4 grid gap-2">
                <div className="border border-white/8 bg-black/20 px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Payment observation
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">
                    {readRouteSession.settlementRightsDelivery.paymentObservation.state.replace(
                      /-/g,
                      " ",
                    )}
                  </dd>
                </div>
                <div className="border border-white/8 bg-black/20 px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Finality
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">
                    {readRouteSession.settlementRightsDelivery.finality.state.replace(
                      /-/g,
                      " ",
                    )}
                  </dd>
                </div>
                <div className="border border-white/8 bg-black/20 px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    BTD rights receipt
                  </dt>
                  <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
                    {readRouteSession.settlementRightsDelivery.btdRights.state.replace(
                      /-/g,
                      " ",
                    )}{" "}
                    /{" "}
                    {
                      readRouteSession.settlementRightsDelivery.btdRights
                        .rightsReceiptRoot
                    }
                  </dd>
                </div>
                <div className="border border-white/8 bg-black/20 px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Repository PR delivery
                  </dt>
                  <dd className="mt-1 break-words font-mono text-[0.68rem] text-neutral-200">
                    {readRouteSession.settlementRightsDelivery.delivery.state.replace(
                      /-/g,
                      " ",
                    )}
                    {readRouteSession.settlementRightsDelivery.delivery
                      .pullRequestReference
                      ? ` / ${readRouteSession.settlementRightsDelivery.delivery.pullRequestReference}`
                      : ""}
                  </dd>
                </div>
              </dl>
              {readRouteSession.settlementRightsDelivery.blockers.length ? (
                <div className="mt-3">
                  <ProductRouteDisclosure title="Settlement blockers" tone="sky">
                    {readRouteSession.settlementRightsDelivery.blockers.join(
                      "; ",
                    )}
                  </ProductRouteDisclosure>
                </div>
              ) : null}
              <Link
                href="/packs?type=settled-assetpack"
                className="mt-4 inline-flex w-full items-center justify-center border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/15"
              >
                Open settled pack activity
              </Link>
            </section>

            <section className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
                Readback
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                Pack activity
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Pipeline runs live in the Read pipelines table above; settled
                and previewed packs read back on the packs surface.
              </p>
              <Link
                href="/packs?type=read-need-fit-preview"
                className="mt-3 inline-flex w-full items-center justify-center border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/15"
              >
                Open pack activity
              </Link>
            </section>
          </aside>
        </section>
      </ProductRouteShell>
    </TerminalShellBridgeProvider>
  );
}
