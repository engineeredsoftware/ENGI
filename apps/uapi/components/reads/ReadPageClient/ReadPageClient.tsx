/**
 * Reads experience page client — deposit-parity orchestration for /reads.
 *
 * Compact header + pipelines table; New (+) opens compose/detail mode with
 * shared DepositSourceSelection (SHA), Need (+ relevant/irrelevant paths),
 * options, settle. Master-detail matches /deposits and /exchange (table → detail + Back).
 */

"use client";

import { formatSats } from "@/components/reads/models/read-format";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  deriveNeedAnchors,
  filterReadPipelineTableRuns,
} from "@/components/reads/models/read-activity-ledger";
import {
  ReadsAssetPackOptions,
  type ReadPayAsset,
  type ReadSettleQuote,
} from "@/components/reads/ReadsAssetPackOptions/ReadsAssetPackOptions";
import { ReadsNeedComposePanel } from "@/components/reads/ReadsNeedComposePanel/ReadsNeedComposePanel";
import { ReadsPipelinesMaster } from "@/components/reads/ReadsPipelinesMaster/ReadsPipelinesMaster";
import { ReadsPipelineTelemetry } from "@/components/reads/ReadsPipelineTelemetry/ReadsPipelineTelemetry";
import { ReadsRouteStateAside } from "@/components/reads/ReadsRouteStateAside/ReadsRouteStateAside";
import { BitcodeShellBridgeProvider } from "@/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge";
import type { RepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
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
import { useUserData } from "@/hooks/useUserData";
import { isPlausibleEthereumAddress } from "@bitcode/auth/ethereum-wallet-client";

function payAssetToNetwork(payAsset: ReadPayAsset): string {
  if (payAsset === "BTC") return "btc-testnet";
  if (payAsset === "SOL") return "solana-devnet";
  return "ethereum-sepolia";
}

/** Aggregate needinesses from selected options for a single multi-rail quote. */
function aggregateMeasurementsForQuote(
  options: Array<{ measurements?: { needinesses?: unknown[]; absolutes?: unknown[] } }>,
): { needinesses: unknown[]; absolutes: unknown[] } {
  const needinesses: unknown[] = [];
  const absolutes: unknown[] = [];
  for (const opt of options) {
    const n = opt.measurements?.needinesses;
    const a = opt.measurements?.absolutes;
    if (Array.isArray(n)) needinesses.push(...n);
    if (Array.isArray(a)) absolutes.push(...a);
  }
  return { needinesses, absolutes };
}

export default function ReadPageClient() {
  const { selectedTransactionId, routeReadingStage, purchaseIntent } =
    useReadRouteParams();
  const {
    liveRuns,
    setLiveRuns,
    isLoadingRuns,
    runsLoadError,
    refreshLiveRuns,
  } = useReadLiveRuns();
  const {
    openReadRouteTransaction,
    attachLiveReadRun,
    closePipelineDetail: closeUrlDetail,
  } = useReadUrlNavigation();
  const { walletConnectionStatus, data: userData } = useUserData();
  const buyerEthereumAddress = useMemo(() => {
    const fromWallet = walletConnectionStatus?.address?.trim() || "";
    const fromProfile =
      typeof (userData as { profile?: { wallet_address?: string } } | null)?.profile
        ?.wallet_address === "string"
        ? (userData as { profile: { wallet_address: string } }).profile.wallet_address.trim()
        : "";
    const candidate = fromWallet || fromProfile || null;
    return candidate && isPlausibleEthereumAddress(candidate) ? candidate : candidate;
  }, [userData, walletConnectionStatus?.address]);

  const [repositoryContext, setRepositoryContext] =
    useState<RepositoryContextState | null>(null);
  const [need, setNeed] = useState("");
  const [relevantPaths, setRelevantPaths] = useState<string[]>([]);
  const [irrelevantPaths, setIrrelevantPaths] = useState<string[]>([]);
  const [needAnchorName, setNeedAnchorName] = useState("");
  const [isNeedAnchorPopoverOpen, setIsNeedAnchorPopoverOpen] = useState(false);
  const [isAnchoringNeed, setIsAnchoringNeed] = useState(false);
  const [needAnchorMessage, setNeedAnchorMessage] = useState<string | null>(
    null,
  );
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [settleBusy, setSettleBusy] = useState(false);
  const [settleError, setSettleError] = useState<string | null>(null);
  const [settleMessage, setSettleMessage] = useState<string | null>(null);
  const [payAsset, setPayAsset] = useState<ReadPayAsset>("ETH");
  const [quote, setQuote] = useState<ReadSettleQuote | null>(null);
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const selectedRun = useMemo(
    () => liveRuns.find((run) => run.id === selectedTransactionId) || null,
    [liveRuns, selectedTransactionId],
  );

  /** Deposit twin: scroll rich telemetry into view on synthesize dispatch. */
  const synthesisTelemetryRef = useRef<HTMLElement | null>(null);

  const synthesis = useReadOptionSynthesis({
    repositoryContext,
    need,
    relevantPaths,
    irrelevantPaths,
    refreshLiveRuns,
    // Prefer URL/liveRuns row so cancel survives soft navigation.
    activeRunId: selectedTransactionId,
    activeRunStatus: selectedRun?.status ?? null,
    onRunDispatched: (runId) => {
      // Leave compose (deposit openRunDetail twin): hide synthesize CTA and
      // lock Need/source for this run detail. Attach run id via replace so
      // searchParams update without a full remount (stageKey stays workbench).
      setIsComposeOpen(false);
      attachLiveReadRun(runId);
      void Promise.resolve(refreshLiveRuns() as unknown);
    },
  });

  useEffect(() => {
    if (!synthesis.runId || synthesis.dispatchedAtMs === null) return;
    synthesisTelemetryRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  }, [synthesis.dispatchedAtMs, synthesis.runId]);

  const selectedOptions = useMemo(
    () =>
      synthesis.options.filter((o) =>
        synthesis.selectedIndexes.includes(o.index),
      ),
    [synthesis.options, synthesis.selectedIndexes],
  );

  const fetchSettleQuote = useCallback(async () => {
    if (selectedOptions.length === 0) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    setQuoteBusy(true);
    setQuoteError(null);
    try {
      const measurements = aggregateMeasurementsForQuote(selectedOptions);
      if (measurements.needinesses.length === 0) {
        throw new Error(
          "Selected options need needinesses measurements for BTD volume.",
        );
      }
      const response = await fetch("/api/read/settle/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ measurements }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Quote failed.",
        );
      }
      setQuote({
        provider: String(payload.provider || "mock"),
        needFitVolume: Number(payload.needFitVolume) || 0,
        rawVolumeBaseUnits: String(payload.rawVolumeBaseUnits || "0"),
        btdVolume: String(payload.btdVolume || "0"),
        btdVolumeDisplay: String(payload.btdVolumeDisplay || "0"),
        decay: Number(payload.decay) || 0,
        decayMicro: Number(payload.decayMicro) || 0,
        expiresAt: String(payload.expiresAt || ""),
        options: Array.isArray(payload.options) ? payload.options : [],
      });
    } catch (err) {
      setQuote(null);
      setQuoteError(err instanceof Error ? err.message : "Quote failed.");
    } finally {
      setQuoteBusy(false);
    }
  }, [selectedOptions]);

  useEffect(() => {
    void fetchSettleQuote();
  }, [fetchSettleQuote]);

  const handleSettleSelected = useCallback(async () => {
    if (selectedOptions.length === 0) return;
    setSettleBusy(true);
    setSettleError(null);
    setSettleMessage(null);
    try {
      const railQuote = quote?.options.find((o) => o.payAsset === payAsset);
      // V48-Gate5-F01: send indexes only — server rehydrates fullOptions.
      const response = await fetch("/api/read/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          synthesisRunId: synthesis.runId,
          selectedIndexes: synthesis.selectedIndexes,
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
          payAsset,
          buyerEthereumAddress: buyerEthereumAddress || null,
          paymentObservation: {
            schema: "bitcode.settle-asset-pack.payment-observation",
            network: payAssetToNetwork(payAsset),
            status: "observed-projection",
            amountSats:
              payAsset === "BTC" && railQuote?.payAmount
                ? Number(railQuote.payAmount)
                : null,
            txId: null,
            payAmount: railQuote?.payAmount ?? null,
            payAsset,
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
        `Settled ${selectedOptions.length} option(s) paying ${payAsset}. ` +
          `BTD escrow + co-own on Packs; seller finalizes split there` +
          `${runIds ? ` (run ${runIds})` : ""}.`,
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
    buyerEthereumAddress,
    need,
    payAsset,
    quote?.options,
    relevantPaths,
    irrelevantPaths,
    refreshLiveRuns,
    repositoryContext?.selectedBranch,
    repositoryContext?.selectedCommit,
    repositoryContext?.selectedRepository?.fullName,
    repositoryContext?.selectedRepository?.name,
    repositoryContext?.selectedRepository?.owner,
    synthesis.selectedIndexes,
    synthesis.runId,
  ]);

  const [pipelineFilters, setPipelineFilters] = useState<TransactionFilters>({
    ...DEFAULT_TRANSACTION_FILTERS,
    transactionLens: "read",
  });
  const [pipelinePagination, setPipelinePagination] =
    useState<TransactionPagination>(DEFAULT_TRANSACTION_PAGINATION);

  const repositoryAnchors = useMemo(
    () => deriveRepositoryAnchors(liveRuns),
    [liveRuns],
  );
  const needAnchors = useMemo(() => deriveNeedAnchors(liveRuns), [liveRuns]);
  const pipelineTableRuns = useMemo(
    () => filterReadPipelineTableRuns(liveRuns),
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
    setQuote(null);
    setQuoteError(null);
    setPayAsset("ETH");
  }, [closeUrlDetail, synthesis.reset]);

  const openComposeDetail = useCallback(() => {
    closeUrlDetail();
    synthesis.reset();
    setSettleError(null);
    setSettleMessage(null);
    setIsComposeOpen(true);
  }, [closeUrlDetail, synthesis.reset]);

  const telemetry = useReadPipelineTelemetry(
    selectedRun ||
      (synthesis.runId
        ? ({
            id: synthesis.runId,
            type: "agentic-execution:asset-pack",
            status: synthesis.synthesisRunning ? "running" : synthesis.status,
          } as any)
        : null),
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
  const {
    handleRecordActivity,
    handleAnchorNeed,
    handleDeleteNeedAnchor,
  } = useReadActivityRecording({
    repositoryContext,
    selectedRun,
    liveRuns,
    setLiveRuns,
    refreshLiveRuns,
    openReadRouteTransaction: openReadRouteTransaction,
    need,
    needAnchorName,
    relevantPaths,
    irrelevantPaths,
    setIsAnchoringNeed,
    setNeedAnchorMessage,
    setIsNeedAnchorPopoverOpen,
  });

  const sessionRows = buildReadSessionRows(readRouteSession);
  const procurementRows = buildReadProcurementRows(readRouteSession);
  const authorityRows = buildReadAuthorityRows(readRouteSession);

  // Fresh compose only may synthesize. Any pipeline run detail (selected
  // transaction and/or synthesis.runId after leaving compose) locks config and
  // hides the CTA — including cancelled/complete runs after new → runId.
  const isRunReviewLocked =
    !isComposeOpen && Boolean(selectedTransactionId || synthesis.runId);
  const isConfigLocked = synthesis.synthesisRunning || isRunReviewLocked;
  const selectedPipelineRunId =
    telemetry.selectedPipelineRunId || synthesis.runId;
  const showCancel =
    synthesis.synthesisRunning && Boolean(selectedPipelineRunId);

  return (
    <BitcodeShellBridgeProvider>
      <ProductRouteShell
        testId="route-shell-read"
        tone="orange"
        label="Read"
        title="Reading"
        summary="Reading from the Bitcode Depository means expressing a desired patch to your repository and reviewing synthesized options for purchase."
        icon={Workflow}
        detailOpen={isReadDetailOpen}
        // Hold chips until run history loads so the set enters once with final values.
        metricsReady={!isLoadingRuns}
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
            value: String(pipelineTableRuns.length),
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
          runs={pipelineTableRuns}
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
          /*
           * Stable workbench key for compose + synthesize. Do not key by run id —
           * that remounts Need/source and replays entrance on every synthesize.
           */
          stageKey={
            isComposeOpen || synthesis.status === "running" || Boolean(synthesis.runId)
              ? "reads-workbench"
              : selectedPipelineRunId
                ? "reads-review"
                : "reads-detail"
          }
          testId="reads-run-configuration"
          // Full-width stack: repository + Need as full rows, then
          // route-state panels as one 3-col row (never main|aside columns).
          className="grid min-w-0 gap-4 phone:gap-5"
          dataAttrs={{
            "data-compose":
              isComposeOpen && !isRunReviewLocked ? "true" : "false",
            "data-locked": isConfigLocked ? "true" : "false",
          }}
        >
          <div className="grid min-w-0 gap-5">
            {purchaseIntent.active ? (
              <div
                className="border border-emerald-300/30 bg-emerald-400/10 px-4 py-3"
                data-testid="reads-purchase-intent-banner"
              >
                <p className="text-[0.58rem] font-medium uppercase tracking-[0.14em] text-emerald-100/90">
                  Purchase flow
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-200">
                  Continue from Exchange: quote multi-rail settlement, settle money,
                  transfer BTD rights, then unlock entitled .patch delivery.
                  {purchaseIntent.packTitle
                    ? ` Target: ${purchaseIntent.packTitle}.`
                    : ""}
                  {purchaseIntent.synthesisRunId
                    ? ` Synthesis run attached for rehydration.`
                    : " Compose or select a fit, then settle selected options."}
                </p>
              </div>
            ) : null}
            <div className="grid min-w-0 gap-4 phone:gap-5">
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
                isRunReviewLocked={isRunReviewLocked}
                needAnchors={needAnchors}
                needAnchorName={needAnchorName}
                onNeedAnchorNameChange={setNeedAnchorName}
                isNeedAnchorPopoverOpen={isNeedAnchorPopoverOpen}
                onNeedAnchorPopoverOpenChange={setIsNeedAnchorPopoverOpen}
                isAnchoringNeed={isAnchoringNeed}
                needAnchorMessage={needAnchorMessage}
                onAnchorNeed={() => {
                  void handleAnchorNeed();
                }}
                onDeleteNeedAnchor={(id) => {
                  void handleDeleteNeedAnchor(id);
                }}
              />
            </div>

            {selectedPipelineRunId ? (
              <ReadsPipelineTelemetry
                telemetryRef={synthesisTelemetryRef}
                selectedRun={selectedRun}
                selectedPipelineRunId={selectedPipelineRunId}
                readRunActivity={telemetry.readRunActivity}
                readRunIsProcessing={
                  telemetry.readRunIsProcessing || synthesis.synthesisRunning
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
                onCancel={
                  showCancel
                    ? () => {
                        void synthesis.cancel();
                      }
                    : undefined
                }
                isCancelling={synthesis.isCancelling}
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
              payAsset={payAsset}
              onPayAssetChange={setPayAsset}
              quote={quote}
              quoteBusy={quoteBusy}
              quoteError={quoteError}
              onRefreshQuote={() => void fetchSettleQuote()}
              buyerEthereumAddress={buyerEthereumAddress}
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
