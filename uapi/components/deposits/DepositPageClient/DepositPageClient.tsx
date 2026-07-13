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
import { DepositRouteStateAside } from "@/components/deposits/DepositRouteStateAside/DepositRouteStateAside";
import { DepositPipelinesMaster } from "@/components/deposits/DepositPipelinesMaster/DepositPipelinesMaster";
import { DepositSynthesisTelemetry } from "@/components/deposits/DepositSynthesisTelemetry/DepositSynthesisTelemetry";
import { DepositAssetPackOptions } from "@/components/deposits/DepositAssetPackOptions/DepositAssetPackOptions";
import { DepositObfuscationsPanel } from "@/components/deposits/DepositObfuscationsPanel/DepositObfuscationsPanel";
import { DepositActivityLedgerDetail } from "@/components/deposits/DepositActivityLedgerDetail/DepositActivityLedgerDetail";
import { Boxes } from "lucide-react";

import { useAuth } from "@/components/bitcode/auth/AuthProvider/AuthProvider";
import { ProductRouteShell } from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import { useUserData } from "@/hooks/useUserData";
import { trackProductEvent } from "@/lib/product-analytics";
import type { PipelineExecution } from "@/types/api";

import DepositSourceSelection from "@/components/deposits/DepositSourceSelection/DepositSourceSelection";
import {
  buildTerminalExecutionHistoryRequest,
  buildTerminalObfuscationsAnchorDraft,
  mapExecutionHistoryRunToWorkspaceRun,
  readTerminalRouteError,
  upsertWorkspaceRun,
  type TerminalActivityRecordDraft,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import type { TerminalRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import {
  DEFAULT_TRANSACTION_FILTERS,
  DEFAULT_TRANSACTION_PAGINATION,
  type TransactionFilters,
  type TransactionPagination,
} from "@/components/bitcode/pipeline/BitcodeTransactionTypes/bitcode-transaction-types";
import {
  buildDepositHref,
  DEPOSIT_ROUTE,
} from "@/components/bitcode/routes/ProductRoutes/product-routes";
import { BitcodeShellBridgeProvider } from "@/components/bitcode/layout/BitcodeShellBridge/BitcodeShellBridge";
import {
  buildDepositRouteSession,
  writeDepositRouteStage,
} from "@/components/deposits/models/deposit-route-model";
import {
  DEPOSIT_HEADER_METRIC_EXPLAINERS,
} from "@/components/deposits/models/deposit-stat-explainers";
import type {
  DepositOptionReviewDecision,
  DepositOptionReviewDecisionState,
} from "@bitcode/pipeline-asset-pack/deposit-asset-pack-option-admission";

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
import {
  adoptSelectionStatusFromRun,
  synthesisStatusFromRunRow,
} from "@/components/deposits/models/deposit-run-status";

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
    replaceDepositRouteTransaction,
    clearDepositRouteTransaction,
  } = useDepositUrlNavigation();
  const networkDepositoryCount = useDepositNetworkDepositoryCount();

  const [repositoryContext, setRepositoryContext] =
    useState<TerminalRepositoryContextState | null>(null);
  const [obfuscations, setObfuscations] = useState("");
  const [obfuscationsAnchorName, setObfuscationsAnchorName] = useState("");
  const [isObfuscationsAnchorPopoverOpen, setIsObfuscationsAnchorPopoverOpen] =
    useState(false);
  const [forcedInclusions, setForcedInclusions] = useState<string[]>([]);
  const [forcedExclusions, setForcedExclusions] = useState<string[]>([]);
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
        forcedExclusionCount: number;
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
  const lastAdoptedSelectionIdRef = useRef<string | null>(null);
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
    () => buildDepositSourceCriticalitySignals(forcedInclusions),
    [forcedInclusions],
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
        forcedInclusions,
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
      forcedInclusions,
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

  // Resume synthesized options when a dispatched/adopted run completes.
  useEffect(() => {
    if (
      (synthesisStatus !== "running" && synthesisStatus !== "complete") ||
      !synthesisRunId ||
      realSynthesis
    ) {
      return;
    }
    if (
      synthesisActivity.error &&
      (synthesisExecutionMatchesRun || synthesisStreamError)
    ) {
      setSynthesisStatus("failed");
      setSynthesisError(synthesisActivity.error);
      if (synthesisDispatchedAtMs !== null) {
        trackProductEvent({
          name: "deposit_synthesis_failed",
          data: {
            stage: "run",
            durationMs: Date.now() - synthesisDispatchedAtMs,
          },
        });
      }
      return;
    }
    if (!synthesisExecutionMatchesRun) return;
    const rowCompleted =
      String(
        (synthesisExecution as { status?: string } | null)?.status || "",
      ).toLowerCase() === "completed";
    if (!synthesisActivity.isStreamingComplete && !rowCompleted) return;
    if (!synthesisRunExpectsOptions) {
      setSynthesisStatus("complete");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/executions/history/${synthesisRunId}`);
        const data = await res.json().catch(() => null);
        const output = data?.run?.output as
          | { depositOptionSynthesis?: unknown; reviewProjections?: unknown }
          | undefined;
        const synthesis = output?.depositOptionSynthesis;
        if (!res.ok || !synthesis) {
          throw new Error("Synthesized options were not found for this run.");
        }
        if (cancelled) return;
        setRealSynthesis({
          synthesis: synthesis as NonNullable<typeof realSynthesis>["synthesis"],
          reviewProjections: Array.isArray(output?.reviewProjections)
            ? (output!.reviewProjections as NonNullable<
                typeof realSynthesis
              >["reviewProjections"])
            : [],
        });
        setOptionsRequested(true);
        setSynthesisStatus("complete");
        if (synthesisDispatchedAtMs !== null) {
          const options = (synthesis as { options?: unknown[] }).options;
          trackProductEvent({
            name: "deposit_synthesis_completed",
            data: {
              optionCount: Array.isArray(options) ? options.length : 0,
              durationMs: Date.now() - synthesisDispatchedAtMs,
            },
          });
        }
        replaceDepositSearchParams(
          writeDepositRouteStage(readCurrentSearchParams(), "review-options"),
        );
        void refreshLiveRuns();
      } catch (error) {
        if (cancelled) return;
        setSynthesisStatus("failed");
        setSynthesisError(
          error instanceof Error
            ? error.message
            : "Synthesis result not found.",
        );
        if (synthesisDispatchedAtMs !== null) {
          trackProductEvent({
            name: "deposit_synthesis_failed",
            data: {
              stage: "resume",
              durationMs: Date.now() - synthesisDispatchedAtMs,
            },
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    synthesisStatus,
    synthesisRunId,
    synthesisRunExpectsOptions,
    realSynthesis,
    synthesisActivity.isStreamingComplete,
    synthesisActivity.error,
    synthesisDispatchedAtMs,
    synthesisExecution,
    synthesisExecutionMatchesRun,
    synthesisStreamError,
    readCurrentSearchParams,
    refreshLiveRuns,
    replaceDepositSearchParams,
  ]);

  // Row-status reconciliation when SSE is quiet but the row is terminal.
  useEffect(() => {
    if (synthesisStatus !== "running" || !synthesisRunId) return;
    const run = liveRuns.find((candidate) => candidate.id === synthesisRunId);
    if (!run) return;
    const mapped = synthesisStatusFromRunRow(run);
    if (mapped.status === "running") return;
    setSynthesisStatus(mapped.status);
    setSynthesisError(mapped.error);
    if (synthesisDispatchedAtMs === null) return;
    if (mapped.status === "cancelled") {
      trackProductEvent({
        name: "deposit_synthesis_cancelled",
        data: { durationMs: Date.now() - synthesisDispatchedAtMs },
      });
    } else if (mapped.status === "failed") {
      trackProductEvent({
        name: "deposit_synthesis_failed",
        data: {
          stage: "run",
          durationMs: Date.now() - synthesisDispatchedAtMs,
        },
      });
    }
  }, [liveRuns, synthesisDispatchedAtMs, synthesisRunId, synthesisStatus]);

  useEffect(() => {
    if (synthesisStatus !== "running" || !synthesisRunId) return;
    const interval = window.setInterval(() => {
      void refreshLiveRuns();
    }, 15_000);
    return () => window.clearInterval(interval);
  }, [refreshLiveRuns, synthesisRunId, synthesisStatus]);

  // Master-detail adoption from URL selection.
  useEffect(() => {
    const run = selectedRun;
    if (!run?.id) {
      lastAdoptedSelectionIdRef.current = null;
      return;
    }
    if (lastAdoptedSelectionIdRef.current === run.id) return;
    lastAdoptedSelectionIdRef.current = run.id;
    if (run.id === synthesisRunId) return;
    if (synthesisDispatchedAtMs !== null && synthesisStatus === "running") {
      return;
    }
    setSynthesisRunId(run.id);
    setSynthesisRunExpectsOptions(
      run.contextSource === "deposit-option-synthesis",
    );
    setSynthesisDispatchedAtMs(null);
    setSynthesisLogScrolled(false);
    setRealSynthesis(null);
    setSynthesisError(null);
    setOptionsRequested(false);
    const mapped = adoptSelectionStatusFromRun(run);
    setSynthesisStatus(mapped.status);
    setSynthesisError(mapped.error);
  }, [selectedRun, synthesisRunId, synthesisDispatchedAtMs, synthesisStatus]);

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

  const handleRecordActivity = useCallback(
    async (draft: TerminalActivityRecordDraft) => {
      const response = await fetch("/api/executions/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            "Unable to record Deposit activity.",
          ),
        );
      }

      const payload = (await response.json()) as {
        execution?: PipelineExecution;
      };
      if (!payload.execution) {
        throw new Error(
          "Deposit activity response did not include an execution row.",
        );
      }

      const nextRun = mapExecutionHistoryRunToWorkspaceRun(payload.execution);
      setLiveRuns((currentRuns) => upsertWorkspaceRun(currentRuns, nextRun));
      if (draft.selectAfterRecord !== false) {
        replaceDepositRouteTransaction(nextRun.id);
      }
      void refreshLiveRuns();
      if (
        (draft.context as Record<string, unknown> | undefined)?.source ===
        "terminal-deposit-composer"
      ) {
        void synthesizeOptionsRef.current?.();
      }
      return nextRun;
    },
    [
      refreshLiveRuns,
      replaceDepositRouteTransaction,
      repositoryContext,
      selectedRun,
      setLiveRuns,
    ],
  );

  const handleAnchorObfuscations = useCallback(async () => {
    if (!obfuscations.trim()) return;
    setIsAnchoringObfuscations(true);
    setObfuscationsAnchorMessage(null);
    try {
      await handleRecordActivity(
        buildTerminalObfuscationsAnchorDraft({
          obfuscations,
          name: obfuscationsAnchorName,
          repositoryFullName:
            repositoryContext?.selectedRepository?.fullName || null,
          forcedInclusions,
          forcedExclusions,
        }),
      );
      setObfuscationsAnchorMessage(
        obfuscationsAnchorName.trim()
          ? `Obfuscations anchor "${obfuscationsAnchorName.trim()}" saved into the Bitcode activity ledger.`
          : "Obfuscations configuration anchored into the Bitcode activity ledger.",
      );
      setIsObfuscationsAnchorPopoverOpen(false);
    } catch (error) {
      setObfuscationsAnchorMessage(
        error instanceof Error
          ? error.message
          : "Unable to anchor the Obfuscations configuration.",
      );
    } finally {
      setIsAnchoringObfuscations(false);
    }
  }, [
    handleRecordActivity,
    obfuscations,
    obfuscationsAnchorName,
    forcedExclusions,
    repositoryContext,
    forcedInclusions,
  ]);

  const handleDeleteObfuscationsAnchor = useCallback(
    async (anchorId: string) => {
      if (!anchorId) return;
      const previousRuns = liveRuns;
      setLiveRuns((current) => current.filter((run) => run.id !== anchorId));
      setObfuscationsAnchorMessage(null);
      try {
        const response = await fetch(
          `/api/executions/history/${encodeURIComponent(anchorId)}`,
          { method: "DELETE" },
        );
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            payload?.error || "Unable to delete the Obfuscations anchor.",
          );
        }
        setObfuscationsAnchorMessage("Obfuscations anchor deleted.");
      } catch (error) {
        setLiveRuns(previousRuns);
        setObfuscationsAnchorMessage(
          error instanceof Error
            ? error.message
            : "Unable to delete the Obfuscations anchor.",
        );
      }
    },
    [liveRuns, setLiveRuns],
  );

  const handleSynthesizeOptions = useCallback(
    async (instructionsOverride?: string) => {
      const effectiveInstructions =
        typeof instructionsOverride === "string" && instructionsOverride.trim()
          ? instructionsOverride
          : obfuscations;
      setSynthesisStatus("running");
      setSynthesisError(null);
      setRealSynthesis(null);
      const runId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setSynthesisRunId(runId);
      setSynthesisRunExpectsOptions(true);
      setSynthesisDispatchedAtMs(Date.now());
      setSynthesisLogScrolled(false);

      try {
        const response = await fetch("/api/deposit/synthesize-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId,
            repositoryFullName:
              repositoryContext?.selectedRepository?.fullName || null,
            sourceBranch: repositoryContext?.selectedBranch || null,
            sourceCommit: repositoryContext?.selectedCommit || null,
            obfuscations: effectiveInstructions,
            forcedInclusions,
            forcedExclusions,
            demandContext: [
              ...depositRouteInput.depositoryDemandSignals.map(
                (signal) => signal.label,
              ),
              ...depositRouteInput.readingDemandSignals.map(
                (signal) => signal.label,
              ),
            ],
            depositoryDemandSignals: depositRouteInput.depositoryDemandSignals,
            readingDemandSignals: depositRouteInput.readingDemandSignals,
            existingDepositorySignals:
              depositRouteInput.existingDepositorySignals,
          }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok) {
          throw new Error(
            typeof payload?.error === "string"
              ? payload.error
              : "Deposit option synthesis failed.",
          );
        }
        trackProductEvent({
          name: "deposit_synthesis_dispatched",
          data: {
            hasObfuscations: Boolean(effectiveInstructions.trim()),
            forcedInclusionCount: forcedInclusions.length,
            forcedExclusionCount: forcedExclusions.length,
            demandSignalCount:
              depositRouteInput.depositoryDemandSignals.length +
              depositRouteInput.readingDemandSignals.length,
          },
        });
        void refreshLiveRuns().then(() => {
          replaceDepositRouteTransaction(runId);
        });
      } catch (error) {
        setSynthesisStatus("failed");
        setSynthesisError(
          error instanceof Error
            ? error.message
            : "Deposit option synthesis failed.",
        );
        trackProductEvent({
          name: "deposit_synthesis_failed",
          data: { stage: "dispatch", durationMs: null },
        });
      }
    },
    [
      obfuscations,
      depositRouteInput.depositoryDemandSignals,
      depositRouteInput.existingDepositorySignals,
      depositRouteInput.readingDemandSignals,
      forcedExclusions,
      refreshLiveRuns,
      replaceDepositRouteTransaction,
      repositoryContext,
      forcedInclusions,
    ],
  );

  useEffect(() => {
    synthesizeOptionsRef.current = handleSynthesizeOptions;
  }, [handleSynthesizeOptions]);

  useEffect(() => {
    if (!synthesisRunId || synthesisDispatchedAtMs === null) return;
    synthesisTelemetryRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  }, [synthesisRunId, synthesisDispatchedAtMs]);

  const handleOptionReviewDecision = useCallback(
    async (optionId: string, decision: DepositOptionReviewDecisionState) => {
      if (optionReviewDecisions[optionId] === "approved-for-admission") {
        return;
      }
      const nextDecisions = {
        ...optionReviewDecisions,
        [optionId]: decision,
      };
      setOptionsRequested(true);
      setOptionReviewDecisions(nextDecisions);

      const nextDecisionRecords = Object.entries(nextDecisions).map(
        ([entryOptionId, entryDecision]) => ({
          optionId: entryOptionId,
          decision: entryDecision,
          reviewerId: user?.id || preferredSignerAddress || null,
        }),
      );
      const nextSession = buildDepositRouteSession({
        ...depositRouteInput,
        optionsRequested: true,
        hasReviewedOption: true,
        optionReviewDecisions: nextDecisionRecords,
      });
      const receipt = nextSession.admission.receipts.find(
        (entry) => entry.optionId === optionId,
      );
      const admitted = receipt?.admission.state === "admitted-to-depository";
      trackProductEvent({
        name: "deposit_option_review",
        data: { decision, admitted },
      });
      replaceDepositSearchParams(
        writeDepositRouteStage(
          readCurrentSearchParams(),
          admitted ? "read-depository-state" : "review-options",
        ),
      );

      if (!receipt) return;

      try {
        await handleRecordActivity({
          type: admitted
            ? "pipeline:deposit-option-admission"
            : "pipeline:deposit-option-review",
          status: "completed",
          summary: admitted
            ? `Admitted ${receipt.title} to the Depository.`
            : decision === "rejected-by-depositor"
              ? `Archived ${receipt.title} (re-depositable; measurements staled by time trigger resynthesis).`
              : `Recorded ${decision.replace(/-/g, " ")} for ${receipt.title}.`,
          selectAfterRecord: admitted,
          output: {
            assetPackTitle: receipt.title,
            depositAdmission: nextSession.admission,
            admissionState: receipt.admission.state,
            depositoryAssetPackId: receipt.admission.depositoryAssetPackId,
            compensationState: receipt.compensationPreview.state,
            packActivitySyncState: receipt.packsActivitySync.state,
            packsActivityRoot: receipt.packsActivitySync.activityRoot,
          },
          context: {
            source: "deposit-option-review-admission",
            workbench: "deposit-option-review",
            optionId,
            reviewDecision: decision,
            admissionState: receipt.admission.state,
            depositoryAssetPackId: receipt.admission.depositoryAssetPackId,
            compensationState: receipt.compensationPreview.state,
            packActivitySyncState: receipt.packsActivitySync.state,
            packActivityType: receipt.packsActivitySync.activityType,
            packsRoute: receipt.packsActivitySync.route,
          },
        });
      } catch (error) {
        setRunsLoadError(
          error instanceof Error
            ? error.message
            : "Unable to record deposit option review.",
        );
      }
    },
    [
      depositRouteInput,
      handleRecordActivity,
      optionReviewDecisions,
      preferredSignerAddress,
      readCurrentSearchParams,
      replaceDepositSearchParams,
      setRunsLoadError,
      user?.id,
    ],
  );

  const handleToggleSelect = useCallback((optionId: string) => {
    setConfirmingBatchDeposit(false);
    setSelectedPackIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
  }, []);

  const handleDepositSelected = useCallback(async () => {
    const idsToDeposit = selectedPackIds.filter(
      (id) => optionReviewDecisions[id] !== "approved-for-admission",
    );
    if (idsToDeposit.length === 0) return;
    if (!confirmingBatchDeposit) {
      setConfirmingBatchDeposit(true);
      return;
    }
    setConfirmingBatchDeposit(false);

    const nextDecisions = { ...optionReviewDecisions };
    for (const id of idsToDeposit) {
      nextDecisions[id] = "approved-for-admission";
    }
    setOptionsRequested(true);
    setOptionReviewDecisions(nextDecisions);
    setSelectedPackIds([]);

    const nextDecisionRecords = Object.entries(nextDecisions).map(
      ([optionId, decision]) => ({
        optionId,
        decision,
        reviewerId: user?.id || preferredSignerAddress || null,
      }),
    );
    const nextSession = buildDepositRouteSession({
      ...depositRouteInput,
      optionsRequested: true,
      hasReviewedOption: true,
      optionReviewDecisions: nextDecisionRecords,
    });
    const admittedReceipts = nextSession.admission.receipts.filter(
      (entry) =>
        idsToDeposit.includes(entry.optionId) &&
        entry.admission.state === "admitted-to-depository",
    );
    trackProductEvent({
      name: "deposit_admission",
      data: {
        selectedCount: idsToDeposit.length,
        admittedCount: admittedReceipts.length,
      },
    });
    replaceDepositSearchParams(
      writeDepositRouteStage(
        readCurrentSearchParams(),
        admittedReceipts.length ? "read-depository-state" : "review-options",
      ),
    );
    if (admittedReceipts.length === 0) return;

    try {
      await handleRecordActivity({
        type: "pipeline:deposit-option-admission",
        status: "completed",
        summary: `Admitted ${admittedReceipts.length} AssetPack${
          admittedReceipts.length === 1 ? "" : "s"
        } to the Depository.`,
        selectAfterRecord: true,
        output: {
          assetPackTitle: admittedReceipts
            .map((entry) => entry.title)
            .join("; "),
          depositAdmission: nextSession.admission,
          admittedCount: admittedReceipts.length,
          depositoryAssetPackIds: admittedReceipts.map(
            (entry) => entry.admission.depositoryAssetPackId,
          ),
          packsActivityRoot:
            admittedReceipts[0]?.packsActivitySync.activityRoot ?? null,
        },
        context: {
          source: "deposit-batch-admission",
          workbench: "deposit-option-review",
          admittedOptionIds: admittedReceipts.map((entry) => entry.optionId),
          admittedCount: admittedReceipts.length,
        },
      });
    } catch (error) {
      setRunsLoadError(
        error instanceof Error
          ? error.message
          : "Unable to record deposit admission.",
      );
    }
  }, [
    confirmingBatchDeposit,
    depositRouteInput,
    handleRecordActivity,
    optionReviewDecisions,
    preferredSignerAddress,
    readCurrentSearchParams,
    replaceDepositSearchParams,
    selectedPackIds,
    setRunsLoadError,
    user?.id,
  ]);

  return (
    <BitcodeShellBridgeProvider>
      <ProductRouteShell
        testId="route-shell-deposit"
        tone="emerald"
        label="Deposit"
        title="Depositing"
        summary="Synthesize, review, and deposit AssetPacks from your repository."
        icon={Boxes}
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
            value:
              networkDepositoryCount === null ? "—" : networkDepositoryCount,
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
          onSelectTransaction={replaceDepositRouteTransaction}
          filters={pipelineFilters}
          onFiltersChange={setPipelineFilters}
          pagination={pipelinePagination}
          onPaginationChange={setPipelinePagination}
          isLoadingRuns={isLoadingRuns}
          runsError={runsLoadError}
        />

        {isDepositDetailOpen ? (
          <section
            className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.55fr)]"
            data-testid="deposit-run-configuration"
            data-locked={isConfigLocked ? "true" : "false"}
            data-compose={
              isComposeOpen && !isRunReviewLocked ? "true" : "false"
            }
          >
            <div className="grid min-w-0 gap-5">
              <div className="grid gap-5 xl:grid-cols-2">
                <div id="deposit-section-source" className="min-w-0">
                  <DepositSourceSelection
                    preferredRepository={selectedRun?.repository || null}
                    onContextChange={setRepositoryContext}
                    onRecordActivity={handleRecordActivity}
                    routePath={DEPOSIT_ROUTE}
                    buildRouteHref={buildDepositHref}
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
                  forcedInclusions={forcedInclusions}
                  onForcedInclusionsChange={setForcedInclusions}
                  forcedExclusions={forcedExclusions}
                  onForcedExclusionsChange={setForcedExclusions}
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
                  forcedInclusions={forcedInclusions}
                  forcedExclusions={forcedExclusions}
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
          </section>
        ) : null}
      </ProductRouteShell>
    </BitcodeShellBridgeProvider>
  );
}
