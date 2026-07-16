"use client";

/**
 * Deposit experience page client — thin orchestration for /deposits.
 *
 * Owns compose/detail state machine wiring, option selection, and admission
 * handlers. Pure projections live under `models/`; live-runs, demand, URL,
 * network count, and synthesis activity live under `hooks/`.
 */

import {
  formatSats,
  readStringField,
} from "@/components/deposits/models/deposit-format";
import {
  buildDepositAuthorityRows,
  buildDepositSessionRows,
} from "@/components/deposits/models/deposit-route-rows";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDepositRouteParams } from "./hooks/use-deposit-route-params";
import { useDepositSynthesisActivity } from "./hooks/use-deposit-synthesis-activity";
import type { DepositSynthesisStatus } from "./hooks/use-deposit-synthesis-activity";
import { useDepositLiveRuns } from "./hooks/use-deposit-live-runs";
import { useDepositSettledDemand } from "./hooks/use-deposit-settled-demand";
import { useDepositNetworkDepositoryCount } from "./hooks/use-deposit-network-depository-count";
import { useDepositUrlNavigation } from "./hooks/use-deposit-url-navigation";
import { useDepositOptionActions } from "./hooks/use-deposit-option-actions";
import { useDepositActivityRecording } from "./hooks/use-deposit-activity-recording";
import { useDepositSynthesisLifecycle } from "./hooks/use-deposit-synthesis-lifecycle";
import { DepositRouteStateAside } from "@/components/deposits/DepositRouteStateAside/DepositRouteStateAside";
import { DepositPipelinesMaster } from "@/components/deposits/DepositPipelinesMaster/DepositPipelinesMaster";
import { DepositSynthesisTelemetry } from "@/components/deposits/DepositSynthesisTelemetry/DepositSynthesisTelemetry";
import { DepositAssetPackOptions } from "@/components/deposits/DepositAssetPackOptions/DepositAssetPackOptions";
import { DepositObfuscationsPanel } from "@/components/deposits/DepositObfuscationsPanel/DepositObfuscationsPanel";
import { DepositActivityLedgerDetail } from "@/components/deposits/DepositActivityLedgerDetail/DepositActivityLedgerDetail";
import { Boxes } from "lucide-react";

import { useAuth } from "@/components/bitcode/auth/AuthProvider/AuthProvider";
import { ProductRouteShell } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import { ProductDetailStage } from "@/components/bitcode/routes/ProductRouteEntrance/ProductRouteEntrance";
import { useUserData } from "@/hooks/useUserData";
import { trackProductEvent } from "@/lib/product-analytics";

import DepositSourceSelection from "@/components/deposits/DepositSourceSelection/DepositSourceSelection";
import type { RepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import {
  DEFAULT_TRANSACTION_FILTERS,
  DEFAULT_TRANSACTION_PAGINATION,
  type TransactionFilters,
  type TransactionPagination,
} from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import {
  buildDepositsHref,
  DEPOSITS_ROUTE,
} from "@/components/bitcode/routes/ProductRoutes/product-routes";
import { BitcodeShellBridgeProvider } from "@/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge";
import {
  buildDepositRouteSession,
} from "@/components/deposits/models/deposit-route-model";
import {
  DEPOSIT_HEADER_METRIC_EXPLAINERS,
} from "@/components/deposits/models/deposit-stat-explainers";
import type {
  DepositOptionReviewDecision,
  DepositOptionReviewDecisionState,
} from "@bitcode/asset-packs-pipelines-domain/deposit-asset-pack-option-admission";

import {
  DEPOSIT_OPTION_PIPELINE_ID,
  DEPOSIT_OPTION_POLICY_ID,
  DEPOSIT_OPTION_ADMISSION_ID,
  DEPOSITOR_EARNING_SUPPLY_INTELLIGENCE_ID,
} from "./deposit-page-client.constants";
import {
  deriveObfuscationsAnchors,
  deriveRepositoryAnchors,
  filterPipelineTableRuns,
  hasDepositoryReadbackFromRuns,
  hasSubmittedDepositForSource,
  isActivityLedgerContextSource,
} from "@/components/deposits/models/deposit-activity-ledger";
import { buildDepositSourceCriticalitySignals } from "@/components/deposits/models/deposit-source-criticality";
import { buildDepositRouteInput } from "@/components/deposits/models/deposit-route-input-builder";
import { resolvePreferredSignerAddress } from "@/components/deposits/models/deposit-preferred-signer";

export default function DepositPageClient() {
  const { user } = useAuth();
  const {
    data: userData,
    hasValidGitHubConnection,
    hasVerifiedWalletConnection,
    walletConnectionStatus,
  } = useUserData();
  const { selectedTransactionId, routeDepositStage } = useDepositRouteParams();
  const {
    liveRuns,
    setLiveRuns,
    isLoadingRuns,
    runsLoadError,
    setRunsLoadError,
    refreshLiveRuns,
  } = useDepositLiveRuns();
  const {
    readCurrentSearchParams,
    replaceDepositSearchParams,
    openDepositRouteTransaction,
    clearDepositRouteTransaction,
  } = useDepositUrlNavigation();
  const networkDepositoryCount = useDepositNetworkDepositoryCount();

  const [repositoryContext, setRepositoryContext] =
    useState<RepositoryContextState | null>(null);
  const [obfuscations, setObfuscations] = useState("");
  const [obfuscationsAnchorName, setObfuscationsAnchorName] = useState("");
  const [isObfuscationsAnchorPopoverOpen, setIsObfuscationsAnchorPopoverOpen] =
    useState(false);
  const [permissibleSources, setPermissibleSources] = useState<string[]>([]);
  const [impermissibleSources, setImpermissibleSources] = useState<string[]>([]);
  const { settledDemandEstimate, settledDemandSignals } =
    useDepositSettledDemand(
      repositoryContext?.selectedRepository?.fullName,
    );
  const [optionsRequested, setOptionsRequested] = useState(false);
  const [synthesisRunId, setSynthesisRunId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [synthesisRunExpectsOptions, setSynthesisRunExpectsOptions] =
    useState(true);
  const [pipelineFilters, setPipelineFilters] = useState<TransactionFilters>({
    ...DEFAULT_TRANSACTION_FILTERS,
    transactionLens: "deposit",
  });
  const [pipelinePagination, setPipelinePagination] =
    useState<TransactionPagination>(DEFAULT_TRANSACTION_PAGINATION);
  const [synthesisLogScrolled, setSynthesisLogScrolled] = useState(false);
  const [synthesisDispatchedAtMs, setSynthesisDispatchedAtMs] = useState<
    number | null
  >(null);
  const [synthesisStatus, setSynthesisStatus] =
    useState<DepositSynthesisStatus>("idle");
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [realSynthesis, setRealSynthesis] = useState<{
    synthesis: ReturnType<typeof buildDepositRouteSession>["synthesis"] & {
      synthesisMode?: string;
      inference?: {
        provider: string | null;
        model: string | null;
        totalTokens: number | null;
        durationMs: number | null;
      };
      exclusionPosture?: {
        impermissibleSourceCount: number;
        excludedPathCount: number;
        droppedCandidateCount: number;
      };
    };
    reviewProjections: Array<{
      optionId: string;
      title: string;
      coveredSourcePaths: string[];
      measurementRationale: string;
    }>;
  } | null>(null);
  const [optionReviewDecisions, setOptionReviewDecisions] = useState<
    Record<string, DepositOptionReviewDecisionState>
  >({});
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);
  const [confirmingBatchDeposit, setConfirmingBatchDeposit] = useState(false);
  const [resynthesisForOptionId, setResynthesisForOptionId] = useState<
    string | null
  >(null);
  const [resynthesisInstructions, setResynthesisInstructions] = useState("");
  const [isAnchoringObfuscations, setIsAnchoringObfuscations] = useState(false);
  const [obfuscationsAnchorMessage, setObfuscationsAnchorMessage] = useState<
    string | null
  >(null);

  const synthesizeOptionsRef = useRef<(() => Promise<void>) | null>(null);
  const synthesisTelemetryRef = useRef<HTMLElement | null>(null);
  const lastTrackedSourceRef = useRef<string | null>(null);

  const closePipelineDetail = useCallback(() => {
    clearDepositRouteTransaction();
    setIsComposeOpen(false);
    setSynthesisRunId(null);
    setSynthesisStatus("idle");
    setSynthesisError(null);
    setSynthesisDispatchedAtMs(null);
  }, [clearDepositRouteTransaction]);

  const openComposeDetail = useCallback(() => {
    clearDepositRouteTransaction();
    setSynthesisRunId(null);
    setSynthesisStatus("idle");
    setSynthesisError(null);
    setSynthesisDispatchedAtMs(null);
    setRealSynthesis(null);
    setIsComposeOpen(true);
  }, [clearDepositRouteTransaction]);

  const isDepositDetailOpen = Boolean(synthesisRunId) || isComposeOpen;
  const isRunReviewLocked =
    Boolean(synthesisRunId) &&
    !isComposeOpen &&
    synthesisStatus !== "running";
  const isConfigLocked = synthesisStatus === "running" || isRunReviewLocked;

  const pipelineTableRuns = useMemo(
    () => filterPipelineTableRuns(liveRuns),
    [liveRuns],
  );
  const selectedDetailRun = useMemo(
    () =>
      synthesisRunId
        ? liveRuns.find((run) => run.id === synthesisRunId) || null
        : null,
    [liveRuns, synthesisRunId],
  );
  const isActivityLedgerDetail = isActivityLedgerContextSource(
    selectedDetailRun?.contextSource,
  );

  const selectedRun = useMemo(
    () => liveRuns.find((run) => run.id === selectedTransactionId) || null,
    [liveRuns, selectedTransactionId],
  );

  const profileRecord =
    userData?.profile && typeof userData.profile === "object"
      ? (userData.profile as Record<string, unknown>)
      : null;
  const preferredSignerAddress = useMemo(
    () =>
      resolvePreferredSignerAddress({
        profileRecord,
        walletAuthAddress: walletConnectionStatus?.metadata?.authAddress,
        walletAddress: walletConnectionStatus?.address,
        readStringField,
      }),
    [profileRecord, walletConnectionStatus],
  );
  const sourceCriticalitySignals = useMemo(
    () => buildDepositSourceCriticalitySignals(permissibleSources),
    [permissibleSources],
  );
  const hasSubmittedDeposit = useMemo(() => {
    const selectedRepository = repositoryContext?.selectedRepository || null;
    if (!selectedRepository) return false;
    return hasSubmittedDepositForSource(
      liveRuns,
      selectedRepository.fullName,
      repositoryContext?.selectedBranch ||
        selectedRepository.defaultBranch ||
        "main",
    );
  }, [liveRuns, repositoryContext]);
  const hasDepositoryReadback = useMemo(
    () => hasDepositoryReadbackFromRuns(liveRuns),
    [liveRuns],
  );
  const repositoryAnchors = useMemo(
    () => deriveRepositoryAnchors(liveRuns),
    [liveRuns],
  );
  const obfuscationsAnchors = useMemo(
    () => deriveObfuscationsAnchors(liveRuns),
    [liveRuns],
  );

  const optionReviewDecisionRecords = useMemo<DepositOptionReviewDecision[]>(
    () =>
      Object.entries(optionReviewDecisions).map(([optionId, decision]) => ({
        optionId,
        decision,
        reviewerId: user?.id || preferredSignerAddress || null,
      })),
    [optionReviewDecisions, preferredSignerAddress, user?.id],
  );

  const depositRouteInput = useMemo(
    () =>
      buildDepositRouteInput({
        transactionId: selectedTransactionId || selectedRun?.id || null,
        depositStage: routeDepositStage,
        repositoryContext,
        obfuscations,
        permissibleSources,
        settledDemandSignals,
        settledDemandEstimate,
        sourceCriticalitySignals,
        preferredSignerAddress,
        hasVerifiedWalletConnection,
        hasValidGitHubConnection,
        actorId: user?.id || null,
        optionsRequested,
        precomputedOptionSynthesis: realSynthesis?.synthesis ?? null,
        hasReviewedOption: optionReviewDecisionRecords.length > 0,
        hasSubmittedDeposit,
        hasDepositoryReadback,
        liveRunsLength: liveRuns.length,
      }),
    [
      permissibleSources,
      hasDepositoryReadback,
      hasSubmittedDeposit,
      hasValidGitHubConnection,
      hasVerifiedWalletConnection,
      liveRuns.length,
      obfuscations,
      optionReviewDecisionRecords.length,
      optionsRequested,
      preferredSignerAddress,
      realSynthesis,
      repositoryContext,
      routeDepositStage,
      selectedRun?.id,
      selectedTransactionId,
      settledDemandEstimate,
      settledDemandSignals,
      sourceCriticalitySignals,
      user?.id,
    ],
  );

  const depositRouteSession = useMemo(
    () =>
      buildDepositRouteSession({
        ...depositRouteInput,
        optionReviewDecisions: optionReviewDecisionRecords,
      }),
    [depositRouteInput, optionReviewDecisionRecords],
  );

  const {
    synthesisExecution,
    synthesisEvents,
    synthesisStreamError,
    synthesisExecutionMatchesRun,
    synthesisActivity,
    synthesisRunning,
    isCancellingSynthesis,
    handleCancelSynthesis,
    synthesisRunStartMs,
    synthesisRunEndMs,
    synthesisLiveContext,
  } = useDepositSynthesisActivity({
    synthesisRunId,
    synthesisStatus,
    setSynthesisStatus,
    setSynthesisError,
    synthesisDispatchedAtMs,
    synthesisError,
    refreshLiveRuns,
  });

  const { handleSynthesizeOptions } = useDepositSynthesisLifecycle({
    synthesisStatus,
    setSynthesisStatus,
    synthesisRunId,
    setSynthesisRunId,
    realSynthesis,
    setRealSynthesis,
    synthesisActivity,
    synthesisExecutionMatchesRun,
    synthesisStreamError,
    synthesisExecution,
    synthesisDispatchedAtMs,
    setSynthesisDispatchedAtMs,
    setSynthesisError,
    synthesisRunExpectsOptions,
    setSynthesisRunExpectsOptions,
    setOptionsRequested,
    setSynthesisLogScrolled,
    liveRuns,
    selectedRun,
    readCurrentSearchParams,
    replaceDepositSearchParams,
    openDepositRouteTransaction: openDepositRouteTransaction,
    refreshLiveRuns,
    obfuscations,
    permissibleSources,
    impermissibleSources,
    repositoryContext,
    depositoryDemandSignals: depositRouteInput.depositoryDemandSignals,
    readingDemandSignals: depositRouteInput.readingDemandSignals,
    existingDepositorySignals: depositRouteInput.existingDepositorySignals,
    synthesizeOptionsRef,
    synthesisTelemetryRef,
  });

  // Funnel analytics: one source-safe event per distinct repository selection
  // per mount — provider + pin shape only, never the repository name.
  useEffect(() => {
    const fullName = repositoryContext?.selectedRepository?.fullName || null;
    if (!fullName || lastTrackedSourceRef.current === fullName) return;
    lastTrackedSourceRef.current = fullName;
    trackProductEvent({
      name: "deposit_source_selected",
      data: {
        provider: repositoryContext?.provider || "unknown",
        pinnedBranch: Boolean(repositoryContext?.selectedBranch),
        pinnedCommit: Boolean(repositoryContext?.selectedCommit),
      },
    });
  }, [repositoryContext]);

  const sessionRows = buildDepositSessionRows(depositRouteSession, {
    pipelineId: DEPOSIT_OPTION_PIPELINE_ID,
    policyId: DEPOSIT_OPTION_POLICY_ID,
    admissionId: DEPOSIT_OPTION_ADMISSION_ID,
    earningsId: DEPOSITOR_EARNING_SUPPLY_INTELLIGENCE_ID,
  });
  const authorityRows = buildDepositAuthorityRows(depositRouteSession);

  const {
    handleRecordActivity,
    handleAnchorObfuscations,
    handleDeleteObfuscationsAnchor,
  } = useDepositActivityRecording({
    repositoryContext,
    selectedRun,
    liveRuns,
    setLiveRuns,
    refreshLiveRuns,
    openDepositRouteTransaction: openDepositRouteTransaction,
    synthesizeOptionsRef,
    obfuscations,
    obfuscationsAnchorName,
    permissibleSources,
    impermissibleSources,
    setIsAnchoringObfuscations,
    setObfuscationsAnchorMessage,
    setIsObfuscationsAnchorPopoverOpen,
  });

  const {
    handleOptionReviewDecision,
    handleToggleSelect,
    handleDepositSelected,
  } = useDepositOptionActions({
    depositRouteInput,
    optionReviewDecisions,
    setOptionReviewDecisions,
    setOptionsRequested,
    selectedPackIds,
    setSelectedPackIds,
    confirmingBatchDeposit,
    setConfirmingBatchDeposit,
    userId: user?.id,
    preferredSignerAddress,
    readCurrentSearchParams,
    replaceDepositSearchParams,
    handleRecordActivity,
    setRunsLoadError,
  });


  return (
    <BitcodeShellBridgeProvider>
      <ProductRouteShell
        testId="route-shell-deposit"
        tone="violet"
        label="Deposit"
        title="Depositing"
        summary="Depositing means stating your repository's impermissible IP and then reviewing synthesized options for deposit."
        icon={Boxes}
        // Hold chips until runs + network aggregate settle so the set enters once.
        metricsReady={!isLoadingRuns && networkDepositoryCount !== null}
        metrics={[
          {
            label: "Stage",
            description: DEPOSIT_HEADER_METRIC_EXPLAINERS["Stage"],
            value: depositRouteSession.activeStepId.replace(/-/g, " "),
          },
          {
            label: "Options",
            description: DEPOSIT_HEADER_METRIC_EXPLAINERS["Options"],
            value: depositRouteSession.synthesis.optionCount,
          },
          {
            label: "Positive ROI",
            description: DEPOSIT_HEADER_METRIC_EXPLAINERS["Positive ROI"],
            value: depositRouteSession.policy.reviewablePositiveRoiCount,
          },
          {
            label: "Admitted",
            description: DEPOSIT_HEADER_METRIC_EXPLAINERS["Admitted"],
            value: depositRouteSession.admission.admittedCount,
          },
          {
            label: "Network",
            description: DEPOSIT_HEADER_METRIC_EXPLAINERS["Network"],
            value: networkDepositoryCount ?? 0,
          },
          {
            label: "Authority",
            description: DEPOSIT_HEADER_METRIC_EXPLAINERS["Authority"],
            value:
              depositRouteSession.organizationPolicyWalletAuthority.aggregate
                .state,
          },
          {
            label: "Earning estimate",
            description: DEPOSIT_HEADER_METRIC_EXPLAINERS["Earning estimate"],
            value: formatSats(
              depositRouteSession.earningSupplyIntelligence.aggregate
                .totalExpectedCompensationSats,
            ),
          },
        ]}
      >
        <DepositPipelinesMaster
          isDepositDetailOpen={isDepositDetailOpen}
          onCloseDetail={closePipelineDetail}
          onOpenCompose={openComposeDetail}
          onRefresh={() => {
            void refreshLiveRuns();
          }}
          runs={pipelineTableRuns}
          selectedTransactionId={selectedRun?.id ?? null}
          onSelectTransaction={(id) => { if (id) openDepositRouteTransaction(id); }}
          filters={pipelineFilters}
          onFiltersChange={setPipelineFilters}
          pagination={pipelinePagination}
          onPaginationChange={setPipelinePagination}
          isLoadingRuns={isLoadingRuns}
          runsError={runsLoadError}
        />

        <ProductDetailStage
          open={isDepositDetailOpen}
          stageKey={
            isComposeOpen && !isRunReviewLocked
              ? "deposit-compose"
              : synthesisRunId || "deposit-detail"
          }
          testId="deposit-run-configuration"
          // Full-width stack: repository + synthesis as full rows, then
          // route-state panels as one 3-col row (never main|aside columns).
          className="grid min-w-0 gap-4 phone:gap-5"
          dataAttrs={{
            "data-locked": isConfigLocked ? "true" : "false",
            "data-compose":
              isComposeOpen && !isRunReviewLocked ? "true" : "false",
          }}
        >
          <div className="grid min-w-0 gap-5">
            <div className="grid min-w-0 gap-4 phone:gap-5">
              <div id="deposit-section-source" className="min-w-0">
                <DepositSourceSelection
                  preferredRepository={selectedRun?.repository || null}
                  onContextChange={setRepositoryContext}
                  onRecordActivity={handleRecordActivity}
                  routePath={DEPOSITS_ROUTE}
                  buildRouteHref={buildDepositsHref}
                  repoEarningEstimateSats={
                    depositRouteSession.earningSupplyIntelligence.aggregate
                      .totalExpectedCompensationSats
                  }
                  repositoryAnchors={repositoryAnchors}
                  disabled={isConfigLocked}
                />
              </div>
              <DepositObfuscationsPanel
                isConfigLocked={isConfigLocked}
                obfuscations={obfuscations}
                onObfuscationsChange={setObfuscations}
                obfuscationsAnchors={obfuscationsAnchors}
                obfuscationsAnchorName={obfuscationsAnchorName}
                onObfuscationsAnchorNameChange={setObfuscationsAnchorName}
                isObfuscationsAnchorPopoverOpen={
                  isObfuscationsAnchorPopoverOpen
                }
                onObfuscationsAnchorPopoverOpenChange={
                  setIsObfuscationsAnchorPopoverOpen
                }
                isAnchoringObfuscations={isAnchoringObfuscations}
                obfuscationsAnchorMessage={obfuscationsAnchorMessage}
                onAnchorObfuscations={() => {
                  void handleAnchorObfuscations();
                }}
                onDeleteObfuscationsAnchor={(id) => {
                  void handleDeleteObfuscationsAnchor(id);
                }}
                permissibleSources={permissibleSources}
                onPermissibleSourcesChange={setPermissibleSources}
                impermissibleSources={impermissibleSources}
                onImpermissibleSourcesChange={setImpermissibleSources}
                repositoryContext={repositoryContext}
                repositoryFullName={
                  depositRouteSession.routeState.repositoryFullName
                }
                onSynthesize={() => {
                  void handleSynthesizeOptions();
                }}
                synthesisStatus={synthesisStatus}
                optionsRequested={optionsRequested}
                synthesisRunId={synthesisRunId}
                isRunReviewLocked={isRunReviewLocked}
              />
            </div>

            {synthesisRunId && isActivityLedgerDetail ? (
              <DepositActivityLedgerDetail
                runId={synthesisRunId}
                title={
                  selectedDetailRun?.contextSource ===
                  "deposit-obfuscations-anchor"
                    ? "Obfuscations anchor"
                    : selectedDetailRun?.contextSource ===
                        "terminal-repository-context-panel"
                      ? "Repository anchor"
                      : "Activity record"
                }
                summary={selectedDetailRun?.summary ?? null}
              />
            ) : null}

            {synthesisRunId && !isActivityLedgerDetail ? (
              <DepositSynthesisTelemetry
                telemetryRef={synthesisTelemetryRef}
                synthesisRunId={synthesisRunId}
                synthesisRunExpectsOptions={synthesisRunExpectsOptions}
                synthesisLiveContext={synthesisLiveContext}
                synthesisRunning={synthesisRunning}
                synthesisRunStartMs={synthesisRunStartMs}
                synthesisRunEndMs={synthesisRunEndMs}
                synthesisActivity={synthesisActivity}
                synthesisStatus={synthesisStatus}
                synthesisError={synthesisError}
                isCancellingSynthesis={isCancellingSynthesis}
                onCancel={() => {
                  void handleCancelSynthesis();
                }}
                onRetry={() => {
                  void handleSynthesizeOptions();
                }}
                onDismissError={() => setSynthesisError(null)}
                synthesisLogScrolled={synthesisLogScrolled}
                setSynthesisLogScrolled={setSynthesisLogScrolled}
                repositoryContext={repositoryContext}
                obfuscations={obfuscations}
                permissibleSources={permissibleSources}
                impermissibleSources={impermissibleSources}
                synthesisEvents={synthesisEvents}
              />
            ) : null}

            <DepositAssetPackOptions
              realSynthesis={realSynthesis}
              depositRouteSession={depositRouteSession}
              optionReviewDecisions={optionReviewDecisions}
              selectedPackIds={selectedPackIds}
              confirmingBatchDeposit={confirmingBatchDeposit}
              resynthesisForOptionId={resynthesisForOptionId}
              resynthesisInstructions={resynthesisInstructions}
              settledDemandEstimate={settledDemandEstimate}
              onOptionReviewDecision={(optionId, decision) => {
                void handleOptionReviewDecision(optionId, decision);
              }}
              onToggleSelect={handleToggleSelect}
              onDepositSelected={() => {
                void handleDepositSelected();
              }}
              onResynthesisForOptionIdChange={setResynthesisForOptionId}
              onResynthesisInstructionsChange={setResynthesisInstructions}
              onResynthesize={(_optionId, instructions) => {
                const trimmed = (instructions || "").trim();
                if (trimmed) setObfuscations(trimmed);
                void handleSynthesizeOptions(trimmed || undefined);
              }}
              onAnchorOption={async () => {}}
              onRecordActivity={handleRecordActivity}
            />
          </div>

          <DepositRouteStateAside
            depositRouteSession={depositRouteSession}
            settledDemandEstimate={settledDemandEstimate}
            authorityRows={authorityRows}
            sessionRows={sessionRows}
          />
        </ProductDetailStage>
      </ProductRouteShell>
    </BitcodeShellBridgeProvider>
  );
}
