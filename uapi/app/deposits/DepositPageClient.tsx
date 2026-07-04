"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Anchor,
  Boxes,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/base/bitcode/auth/AuthProvider";
import {
  ProductRouteDisclosure,
  ProductRouteEnterpriseSummary,
  ProductRouteKeyboardHint,
  ProductRouteProofDetail,
  ProductRouteShell,
  ProductRouteStatePanel,
  ProductRouteStepGrid,
} from "@/components/base/bitcode/routes/product-route-shell";
import { useUserData } from "@/hooks/useUserData";
import { fetchPipelineExecutionHistory } from "@/networking/api-client";
import type { PipelineExecution } from "@/types/api";

import DepositSourceSelection from "@/app/deposits/DepositSourceSelection";
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
import TerminalTransactionsTable from "@/app/terminal/TerminalTransactionsTable";
import {
  DEFAULT_TRANSACTION_FILTERS,
  DEFAULT_TRANSACTION_PAGINATION,
  type TransactionFilters,
  type TransactionPagination,
} from "@/components/base/bitcode/execution/bitcode-transaction-types";
import {
  buildDepositHref,
  DEPOSIT_ROUTE,
} from "@/app/terminal/terminal-routes";
import { TerminalShellBridgeProvider } from "@/app/terminal/terminal-shell-bridge";
import { deriveTerminalTransactionReadiness } from "@/app/terminal/terminal-transaction-readiness-source";

import {
  buildDepositRouteSession,
  readDepositRouteStage,
  writeDepositRouteStage,
  type DepositRouteSession,
} from "./deposit-route-model";
import { usePipelineExecution } from "@/hooks/usePipelineExecution";
import { buildTerminalRunActivityFromEvents } from "@/app/terminal/terminal-run-activity";
import { PipelineExecutionLog } from "@/components/base/bitcode/execution/pipeline-execution-log";
import { ExecutionContextPillRow } from "@/components/base/bitcode/execution/ExecutionContextPillRow";
import { RunClock } from "@/components/base/bitcode/execution/RunClock";
import { QuantumOrb } from "@/components/base/bitcode/effects/quantum-orb";
import { verifiedAccessOrbConfig } from "@/app/(root)/components/landing/marketing-landing-shared";
import BitcodeInlineExplainer from "@/components/base/bitcode/execution/BitcodeInlineExplainer";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/app/deposits/deposit-explainers";
import type {
  DepositOptionReviewDecision,
  DepositOptionReviewDecisionState,
} from "@bitcode/pipeline-asset-pack/deposit-asset-pack-option-admission";

const DEPOSIT_OPTION_PIPELINE_ID = "DepositAssetPackOptionSynthesis";
const DEPOSIT_OPTION_POLICY_ID = "DepositAssetPackOptionPolicy";
const DEPOSIT_OPTION_ADMISSION_ID = "DepositAssetPackOptionAdmissionReport";
const DEPOSITOR_EARNING_SUPPLY_INTELLIGENCE_ID =
  "DepositorEarningSupplyIntelligence";

function shortIdentifier(value: string | null | undefined) {
  if (!value) return "pending";
  return value.length > 18 ? `${value.slice(0, 12)}...` : value;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSats(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "pending";
  return `${value.toLocaleString()} sats`;
}

function readStringField(source: unknown, ...keys: string[]) {
  if (!source || typeof source !== "object") return null;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export default function DepositPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    data: userData,
    hasGitHubConnection,
    hasValidGitHubConnection,
    hasWalletConnection,
    hasVerifiedWalletConnection,
    hasStoredVerifiedWalletConnection,
    walletConnectionStatus,
  } = useUserData();
  const routeSearchParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );
  const selectedTransactionId = useMemo(
    () => readTerminalTransactionId(routeSearchParams),
    [routeSearchParams],
  );
  const routeDepositStage = useMemo(
    () => readDepositRouteStage(routeSearchParams),
    [routeSearchParams],
  );
  const [liveRuns, setLiveRuns] = useState<WorkspaceRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [runsLoadError, setRunsLoadError] = useState<string | null>(null);
  const [repositoryContext, setRepositoryContext] =
    useState<TerminalRepositoryContextState | null>(null);
  const [obfuscations, setObfuscations] = useState(
    "Note anything to obfuscate or withhold from the synthesized options: internal names, proprietary framing, or sensitive specifics the source-safe AssetPacks should avoid surfacing.",
  );
  const [sourcePathHintsText, setSourcePathHintsText] = useState(
    [
      "uapi/app/terminal/TerminalDepositComposer.tsx",
      "packages/pipelines/asset-pack/src/depository-supply-index.ts",
    ].join("\n"),
  );
  const [protectedIpExclusionsText, setProtectedIpExclusionsText] = useState("");
  const [optionsRequested, setOptionsRequested] = useState(false);
  const [synthesisRunId, setSynthesisRunId] = useState<string | null>(null);
  // Whether the attached run is an option synthesis (its completed output
  // carries synthesized AssetPack options to resume into review) or any
  // other pipeline execution (telemetry-only detail).
  const [synthesisRunExpectsOptions, setSynthesisRunExpectsOptions] =
    useState(true);
  // Master-detail pipelines table: lens-preset filters + pagination for the
  // Deposits run table (selection itself lives in the URL transactionId).
  const [pipelineFilters, setPipelineFilters] = useState<TransactionFilters>({
    ...DEFAULT_TRANSACTION_FILTERS,
    transactionLens: "deposit",
  });
  const [pipelinePagination, setPipelinePagination] =
    useState<TransactionPagination>(DEFAULT_TRANSACTION_PAGINATION);
  const [synthesisLogScrolled, setSynthesisLogScrolled] = useState(false);
  // Dispatch timestamp — the run clock's fallback start until the first
  // streamed event's created_at arrives.
  const [synthesisDispatchedAtMs, setSynthesisDispatchedAtMs] = useState<
    number | null
  >(null);
  const [synthesisStatus, setSynthesisStatus] = useState<
    "idle" | "running" | "complete" | "failed"
  >("idle");
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [realSynthesis, setRealSynthesis] = useState<{
    synthesis: DepositRouteSession["synthesis"] & {
      synthesisMode?: string;
      inference?: {
        provider: string | null;
        model: string | null;
        totalTokens: number | null;
        durationMs: number | null;
      };
      exclusionPosture?: {
        protectedIpExclusionCount: number;
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
  // North-star Sell step D: the depositor SELECTS which synthesized AssetPacks
  // to deposit, then ONE armed confirmation admits the whole selected set in a
  // single deposit call (V48 Gate 2, QA ledger F13). Admission is permanent;
  // 'rejected-by-depositor' is Archive (re-depositable; stale measurements
  // trigger resynthesis on re-deposit).
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);
  const [confirmingBatchDeposit, setConfirmingBatchDeposit] = useState(false);
  // Per-option resynthesis with optional new steering instructions: clicking
  // Resynthesize opens an optional instructions input that re-runs the
  // AssetPacksSynthesis pipeline (north-star Sell §C).
  const [resynthesisForOptionId, setResynthesisForOptionId] = useState<
    string | null
  >(null);
  const [resynthesisInstructions, setResynthesisInstructions] = useState("");
  // Network depository visibility ("the" half of the economy overview): count
  // of network-visible admitted AssetPacks from the global Depository feed.
  const [networkDepositoryCount, setNetworkDepositoryCount] = useState<
    number | null
  >(null);
  useEffect(() => {
    let disposed = false;
    const request = fetch(
      "/api/packs/activity?scope=network&type=depository-assetpack",
    );
    if (request && typeof request.then === "function") {
      request
        .then((response) => (response && response.ok ? response.json() : null))
        .then((payload) => {
          if (disposed || !payload) return;
          setNetworkDepositoryCount(
            Array.isArray(payload.records) ? payload.records.length : null,
          );
        })
        .catch(() => {});
    }
    return () => {
      disposed = true;
    };
  }, []);
  // A submitted deposit request immediately runs AssetPacksSynthesis with
  // visible telemetry (V48 Gate 2 law: every deposit/read submission shows
  // the executing pipeline live). Ref breaks the callback ordering cycle.
  const synthesizeOptionsRef = useRef<(() => Promise<void>) | null>(null);
  const synthesisTelemetryRef = useRef<HTMLElement | null>(null);

  const readCurrentSearchParams = useCallback(
    () =>
      typeof window !== "undefined" &&
      window.location.pathname === DEPOSIT_ROUTE
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const replaceDepositSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      const query = nextParams.toString();
      router.replace(buildDepositHref(query), { scroll: false });
    },
    [router],
  );

  const replaceDepositRouteTransaction = useCallback(
    (transactionId: string) => {
      replaceDepositSearchParams(
        writeTerminalTransactionId(readCurrentSearchParams(), transactionId),
      );
    },
    [readCurrentSearchParams, replaceDepositSearchParams],
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
          : "Unable to load recent Deposit activity.",
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
    replaceDepositRouteTransaction(liveRuns[0].id);
  }, [liveRuns, replaceDepositRouteTransaction, selectedTransactionId]);

  const selectedRun = useMemo(
    () =>
      liveRuns.find((run) => run.id === selectedTransactionId) ||
      liveRuns[0] ||
      null,
    [liveRuns, selectedTransactionId],
  );

  const profileRecord =
    userData?.profile && typeof userData.profile === "object"
      ? (userData.profile as Record<string, unknown>)
      : null;
  const walletBinding =
    profileRecord?.wallet_binding &&
    typeof profileRecord.wallet_binding === "object"
      ? (profileRecord.wallet_binding as Record<string, unknown>)
      : null;
  const preferredSignerAddress = useMemo(() => {
    const profileAuthAddress = readStringField(profileRecord, "auth_address");
    const profileWalletAddress = readStringField(
      profileRecord,
      "wallet_address",
    );
    const walletAuthAddress =
      walletConnectionStatus?.metadata?.authAddress?.trim() || "";
    const walletAddress = walletConnectionStatus?.address?.trim() || "";
    return (
      walletAuthAddress ||
      walletAddress ||
      profileAuthAddress ||
      profileWalletAddress ||
      null
    );
  }, [profileRecord, walletConnectionStatus]);
  const preferredSignerLabel = walletConnectionStatus?.provider
    ? `${walletConnectionStatus.provider} wallet`
    : "connected wallet";
  const transactionReadiness = useMemo(
    () =>
      deriveTerminalTransactionReadiness({
        signedIn: Boolean(user),
        repositoryContext,
        repositoryConnectionStatus: repositoryContext?.connectionStatus || null,
        hasRepositoryProviderAttachment: hasGitHubConnection,
        hasValidRepositoryProviderAttachment: hasValidGitHubConnection,
        hasWalletBinding:
          hasWalletConnection ||
          Boolean(
            readStringField(profileRecord, "wallet_address") ||
              readStringField(walletBinding, "address"),
          ),
        hasVerifiedWalletBinding: hasVerifiedWalletConnection,
        hasStoredVerifiedWalletBinding: hasStoredVerifiedWalletConnection,
      }).readiness,
    [
      hasGitHubConnection,
      hasStoredVerifiedWalletConnection,
      hasValidGitHubConnection,
      hasVerifiedWalletConnection,
      hasWalletConnection,
      profileRecord,
      repositoryContext,
      user,
      walletBinding,
    ],
  );

  const sourcePathHints = useMemo(
    () =>
      sourcePathHintsText
        .split(/\r?\n|,/u)
        .map((entry) => entry.trim())
        .filter(Boolean),
    [sourcePathHintsText],
  );
  const sourceCriticalitySignals = useMemo(
    () => [
      {
        id: "depositor-sub-critical-intent",
        label:
          "Depositor intends this option set to avoid critical source exposure.",
        severity: "sub-critical" as const,
        weight: 0.74,
      },
      ...(sourcePathHints.some((path) =>
        /secret|credential|wallet|auth|key|payment|settlement/iu.test(path),
      )
        ? [
            {
              id: "source-path-sensitive-scope-warning",
              label:
                "Source path hints include sensitive operational terms requiring review.",
              severity: "warning" as const,
              weight: 0.64,
            },
          ]
        : []),
    ],
    [sourcePathHints],
  );
  const hasSubmittedDeposit = useMemo(() => {
    const selectedRepository = repositoryContext?.selectedRepository || null;
    if (!selectedRepository) return false;
    const selectedBranch =
      repositoryContext?.selectedBranch ||
      selectedRepository.defaultBranch ||
      "main";
    return liveRuns.some(
      (run) =>
        run.contextSource === "terminal-deposit-composer" &&
        run.repository === selectedRepository.fullName &&
        run.branch === selectedBranch &&
        Boolean(run.candidateAssetId),
    );
  }, [liveRuns, repositoryContext]);
  const hasDepositoryReadback = useMemo(
    () =>
      liveRuns.some(
        (run) =>
          run.contextSource === "terminal-deposit-composer" &&
          Boolean(
            run.depositorySearchDocumentRoot ||
              run.vectorDocumentRoot ||
              run.compensationPreviewRoot,
          ),
      ),
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
    () => ({
      transactionId: selectedTransactionId || selectedRun?.id || null,
      depositStage: routeDepositStage,
      repositoryFullName:
        repositoryContext?.selectedRepository?.fullName || null,
      sourceBranch: repositoryContext?.selectedBranch || null,
      sourceCommit: repositoryContext?.selectedCommit || null,
      obfuscations,
      sourcePathHints,
      depositoryDemandSignals: [
        {
          id: "depository-gap-source-safe-pack-options",
          label:
            "Depository benefits from reviewable source-safe AssetPack supply options.",
          weight: 0.72,
        },
      ],
      readingDemandSignals: [
        {
          id: "reading-demand-fit-ready-source-supply",
          label:
            "Reading demand needs searchable, proof-bearing source supply for Finding Fits.",
          weight: 0.8,
        },
      ],
      existingDepositorySignals: [
        {
          id: "existing-supply-compensation-route",
          label:
            "Existing supply expects proof roots, vector projections, and compensation previews.",
          weight: 0.58,
        },
      ],
      unfitNeedOpportunitySignals: [
        {
          id: "unfit-need-route-proof-supply",
          label:
            "Unfit Reads need more source-safe route proof and delivery supply.",
          weight: 0.82,
        },
        {
          id: "unfit-need-depository-search-supply",
          label:
            "Finding Fits benefits from more indexed Depository implementation patterns.",
          weight: 0.74,
        },
      ],
      sourceCriticalitySignals,
      developmentCostSats: Math.max(1600, 1200 + sourcePathHints.length * 240),
      expectedSettlementSats: Math.max(
        4200,
        3600 + sourcePathHints.length * 360 + liveRuns.length * 90,
      ),
      depositorWalletId: preferredSignerAddress
        ? "connected-depositor-wallet"
        : null,
      walletAuthorityPresent: hasVerifiedWalletConnection,
      actorId: user?.id || null,
      organizationId:
        repositoryContext?.selectedRepository?.owner?.username ||
        repositoryContext?.selectedRepository?.fullName?.split("/")[0] ||
        null,
      teamId: repositoryContext?.selectedRepository?.fullName
        ? `repository:${repositoryContext.selectedRepository.fullName}`
        : null,
      memberId: user?.id || preferredSignerAddress || null,
      organizationRole:
        hasValidGitHubConnection && hasVerifiedWalletConnection
          ? "admin"
          : "member",
      organizationPermissionGrants: [
        "deposit:synthesize_options",
        ...(hasVerifiedWalletConnection
          ? ["deposit:approve_option", "deposit:submit"]
          : []),
      ],
      sourceCriticalityApproved: true,
      reviewerId: user?.id || preferredSignerAddress || null,
      hasRepositorySource: Boolean(repositoryContext?.selectedRepository),
      optionsRequested,
      precomputedOptionSynthesis: realSynthesis?.synthesis ?? null,
      hasReviewedOption: optionReviewDecisionRecords.length > 0,
      hasSubmittedDeposit,
      hasDepositoryReadback,
    }),
    [
      obfuscations,
      hasDepositoryReadback,
      hasSubmittedDeposit,
      hasValidGitHubConnection,
      hasVerifiedWalletConnection,
      liveRuns.length,
      optionsRequested,
      optionReviewDecisionRecords.length,
      preferredSignerAddress,
      realSynthesis,
      repositoryContext,
      routeDepositStage,
      selectedRun?.id,
      selectedTransactionId,
      sourceCriticalitySignals,
      sourcePathHints,
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

  // Live tail of the AssetPacksSynthesis run: execution_events stream into
  // the rich accordion log while the route works.
  const {
    execution: synthesisExecution,
    events: synthesisEvents,
    latestWorkUpdate: synthesisWorkUpdate,
    iterationUpdates: synthesisIterationUpdates,
    error: synthesisStreamError,
  } = usePipelineExecution(synthesisRunId);
  // Terminal-state attribution guard: the activity snapshot is derived from
  // the hook's events, which belong to the CURRENT run only once its history
  // hydrate resolved (the hook resets on runId change, but within the same
  // commit the memo still reads the previous render's events). Only trust
  // terminal signals attributed to this run.
  const synthesisExecutionMatchesRun = Boolean(
    synthesisRunId && (synthesisExecution as { id?: string } | null)?.id === synthesisRunId,
  );
  const synthesisActivity = useMemo(
    () =>
      buildTerminalRunActivityFromEvents(
        synthesisEvents,
        synthesisWorkUpdate,
        synthesisIterationUpdates,
        synthesisStreamError,
      ),
    [
      synthesisEvents,
      synthesisIterationUpdates,
      synthesisStreamError,
      synthesisWorkUpdate,
    ],
  );
  const synthesisRunning = synthesisStatus === "running";
  // TOTAL RUN TIME clock bounds: start at the first event's created_at (fall
  // back to the dispatch timestamp), freeze at the last event's created_at on
  // completion/error.
  const synthesisRunStartMs = useMemo(() => {
    const first = synthesisEvents[0]?.created_at;
    const parsed = first ? new Date(first).getTime() : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
    return synthesisDispatchedAtMs;
  }, [synthesisEvents, synthesisDispatchedAtMs]);
  const synthesisRunEndMs = useMemo(() => {
    if (synthesisRunning) return null;
    const last = synthesisEvents[synthesisEvents.length - 1]?.created_at;
    const parsed = last ? new Date(last).getTime() : Number.NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [synthesisEvents, synthesisRunning]);
  // Live header tracker: the CURRENT active call chain, rendered with the
  // same pills as the log title-lines while the pipeline runs.
  const synthesisLiveContext =
    synthesisRunning && !synthesisError ? synthesisActivity.latestContext : null;

  // F26-B: the synthesis run is dispatched (decoupled from the request). When the
  // streamed run completes, read the persisted synthesis from the execution row
  // output and surface the reviewable options; a streamed error fails the run.
  useEffect(() => {
    // Runs while a run is attached and its results are not resumed yet:
    // 'running' covers live tails, 'complete' covers adopted terminal rows
    // whose persisted output still needs loading (realSynthesis guards
    // against re-fetch loops once the options are in).
    if (
      (synthesisStatus !== "running" && synthesisStatus !== "complete") ||
      !synthesisRunId ||
      realSynthesis
    )
      return;
    // A hook-level fetch error (history unavailable) fails the run outright;
    // an event-derived error counts only once the events are attributed to
    // THIS run (execution match) — otherwise a previously selected run's
    // failure would poison a freshly adopted/dispatched run.
    if (synthesisActivity.error && (synthesisExecutionMatchesRun || synthesisStreamError)) {
      setSynthesisStatus("failed");
      setSynthesisError(synthesisActivity.error);
      return;
    }
    if (!synthesisExecutionMatchesRun) return;
    // Terminal detection: the streamed completion event, or the persisted
    // row already marked completed (an adopted historical run whose events
    // were trimmed or whose completion event never landed must not hang the
    // detail in 'running' forever).
    const rowCompleted =
      String((synthesisExecution as { status?: string } | null)?.status || "").toLowerCase() ===
      "completed";
    if (!synthesisActivity.isStreamingComplete && !rowCompleted) return;
    if (!synthesisRunExpectsOptions) {
      // Telemetry-only run (not an option synthesis): the replayed history
      // IS the resumed result — freeze the clock, nothing to load.
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
            ? (output!.reviewProjections as NonNullable<typeof realSynthesis>["reviewProjections"])
            : [],
        });
        setOptionsRequested(true);
        setSynthesisStatus("complete");
        replaceDepositSearchParams(
          writeDepositRouteStage(readCurrentSearchParams(), "review-options"),
        );
        void refreshLiveRuns();
      } catch (error) {
        if (cancelled) return;
        setSynthesisStatus("failed");
        setSynthesisError(
          error instanceof Error ? error.message : "Synthesis result not found.",
        );
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
    synthesisExecution,
    synthesisExecutionMatchesRun,
    synthesisStreamError,
    readCurrentSearchParams,
    refreshLiveRuns,
    replaceDepositSearchParams,
  ]);

  // Row-status reconciliation: an attached run whose executions row turns
  // terminal WITHOUT observable events (the orphan sweeper marks stale
  // running rows 'interrupted'; a failure row may carry no error event)
  // must not stay 'running' in the detail forever. liveRuns refreshes carry
  // the authoritative row status.
  useEffect(() => {
    if (synthesisStatus !== "running" || !synthesisRunId) return;
    const run = liveRuns.find((candidate) => candidate.id === synthesisRunId);
    if (!run) return;
    const status = String(run.status || "").toLowerCase();
    if (status === "failed" || status === "interrupted" || status === "cancelled") {
      setSynthesisStatus("failed");
      setSynthesisError(run.summary ? `Run ${status} — ${run.summary}` : `Run ${status}.`);
    }
  }, [liveRuns, synthesisRunId, synthesisStatus]);

  // Master-detail adoption: selecting ANY pipeline run in the table connects
  // the Telemetry detail to it. A RUNNING run reattaches its live stream
  // (usePipelineExecution tails any runId); a COMPLETED run replays its
  // persisted history, and a synthesis run additionally resumes its
  // synthesized options into review through the completion effect; a
  // failed/interrupted run surfaces its terminal state with the historical
  // log attached. Adoption fires only on SELECTION-ID transitions: a fresh
  // dispatch changes synthesisRunId while the URL selection is still the
  // previous run, and re-adopting that stale selection would clobber the
  // just-dispatched run.
  const lastAdoptedSelectionIdRef = useRef<string | null>(null);
  useEffect(() => {
    const run = selectedRun;
    if (!run?.id) {
      lastAdoptedSelectionIdRef.current = null;
      return;
    }
    if (lastAdoptedSelectionIdRef.current === run.id) return;
    lastAdoptedSelectionIdRef.current = run.id;
    if (run.id === synthesisRunId) return;
    // An actively dispatched run owns the detail until the user actually
    // changes selection — the FIRST liveRuns arrival after a fast dispatch
    // must not re-point the detail at a historical row.
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
    const status = String(run.status || "").toLowerCase();
    if (status === "failed" || status === "interrupted" || status === "cancelled") {
      setSynthesisStatus("failed");
      setSynthesisError(
        run.summary ? `Run ${status} — ${run.summary}` : `Run ${status}.`,
      );
    } else if (status === "completed") {
      // Adopt a completed row AT its terminal status — never pass through a
      // transient 'running' (it would relabel/disable the dispatch button
      // and animate the orb until the tail hydrates). The completion effect
      // also resumes from 'complete' while options are not loaded yet.
      setSynthesisStatus("complete");
    } else {
      setSynthesisStatus("running");
    }
  }, [selectedRun, synthesisRunId, synthesisDispatchedAtMs, synthesisStatus]);

  const sessionRows = [
    {
      label: "Repository",
      value:
        depositRouteSession.routeState.repositoryFullName ||
        "select repository",
    },
    {
      label: "Branch",
      value: depositRouteSession.routeState.sourceBranch || "pending",
    },
    {
      label: "Commit",
      value: shortIdentifier(depositRouteSession.routeState.sourceCommit),
    },
    {
      label: "Transaction",
      value: shortIdentifier(depositRouteSession.routeState.transactionId),
    },
    { label: "Pipeline", value: DEPOSIT_OPTION_PIPELINE_ID },
    { label: "Policy", value: DEPOSIT_OPTION_POLICY_ID },
    { label: "Admission", value: DEPOSIT_OPTION_ADMISSION_ID },
    { label: "Earnings", value: DEPOSITOR_EARNING_SUPPLY_INTELLIGENCE_ID },
    {
      label: "Option roots",
      value: String(depositRouteSession.synthesis.roots.optionRoots.length),
    },
    {
      label: "Positive ROI options",
      value: String(depositRouteSession.policy.reviewablePositiveRoiCount),
    },
    {
      label: "Admitted options",
      value: String(depositRouteSession.admission.admittedCount),
    },
    {
      label: "Expected compensation",
      value: formatSats(
        depositRouteSession.earningSupplyIntelligence.aggregate
          .totalExpectedCompensationSats,
      ),
    },
  ];

  const authorityRows = [
    {
      label: "Authority",
      value: depositRouteSession.organizationPolicyWalletAuthority.aggregate.state,
    },
    {
      label: "Wallet",
      value: depositRouteSession.organizationPolicyWalletAuthority.walletAuthority.state,
    },
    {
      label: "Deposit policy",
      value: depositRouteSession.organizationPolicyWalletAuthority.depositApproval.state,
    },
    {
      label: "Required denials",
      value: String(
        depositRouteSession.organizationPolicyWalletAuthority.aggregate
          .requiredDeniedActionCount,
      ),
    },
    {
      label: "Authority root",
      value: depositRouteSession.organizationPolicyWalletAuthority.roots.authorityRoot,
    },
  ];

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
            "Unable to record Deposit activity.",
          ),
        );
      }

      const payload = (await response.json()) as {
        execution?: PipelineExecution;
      };
      if (!payload.execution)
        throw new Error(
          "Deposit activity response did not include an execution row.",
        );

      const nextRun = mapExecutionHistoryRunToWorkspaceRun(payload.execution);
      setLiveRuns((currentRuns) => upsertWorkspaceRun(currentRuns, nextRun));
      if (draft.selectAfterRecord !== false)
        replaceDepositRouteTransaction(nextRun.id);
      void refreshLiveRuns();
      // A composer deposit submission IS a Deposit Request: run
      // AssetPacksSynthesis immediately so the executing pipeline is
      // visible from the moment of submission.
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
    ],
  );

  // Real option synthesis via the AssetPacksSynthesis pipeline (deposit
  // lens). The server route builds the exclusion-filtered source inventory,
  // runs bounded inference, persists the execution row with real
  // token/duration accounting, and returns the measured synthesis. The
  // deterministic blueprint path is no longer reachable from this surface
  // (V48 Gate 2, QA ledger F12/F14).
  const handleSynthesizeOptions = useCallback(async (instructionsOverride?: string) => {
    const effectiveInstructions =
      typeof instructionsOverride === "string" && instructionsOverride.trim()
        ? instructionsOverride
        : obfuscations;
    setSynthesisStatus("running");
    setSynthesisError(null);
    setRealSynthesis(null);
    // Client-issued run id so the streaming log can tail the execution from
    // the first event while the route is still working.
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
          protectedIpExclusions: protectedIpExclusionsText,
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
      // F26-B: the route DISPATCHED the run (it no longer returns the synthesis
      // inline — the full pipeline runs to completion in the background while
      // telemetry streams). Stay 'running'; the completion effect reads the
      // persisted synthesis from the execution row and flips to 'complete'.
      // Master-detail: the running row was inserted before the route
      // responded — surface it in the pipelines table and select it so the
      // detail follows this run (and so a reload can reattach from the URL).
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
    }
  }, [
    obfuscations,
    depositRouteInput.depositoryDemandSignals,
    depositRouteInput.existingDepositorySignals,
    depositRouteInput.readingDemandSignals,
    protectedIpExclusionsText,
    refreshLiveRuns,
    replaceDepositRouteTransaction,
    repositoryContext,
  ]);

  useEffect(() => {
    synthesizeOptionsRef.current = handleSynthesizeOptions;
  }, [handleSynthesizeOptions]);

  // Auto-scroll to Telemetry only for DISPATCHED runs (dispatch stamps the
  // timestamp; table adoption clears it) — adopting a row on page load or a
  // table click must not yank the viewport away from where the user is.
  useEffect(() => {
    if (!synthesisRunId || synthesisDispatchedAtMs === null) return;
    synthesisTelemetryRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  }, [synthesisRunId, synthesisDispatchedAtMs]);

  // Secondary per-option actions only: Archive (rejected-by-depositor) and
  // Resynthesize. Approval/deposit is a single batch call (handleDepositSelected).
  const handleOptionReviewDecision = useCallback(
    async (optionId: string, decision: DepositOptionReviewDecisionState) => {
      // An admitted option accepts no further decisions.
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
      user?.id,
    ],
  );

  // Toggle a synthesized option in/out of the deposit selection (north-star
  // step D). Re-arming the confirmation is reset whenever the set changes.
  const handleToggleSelect = useCallback((optionId: string) => {
    setConfirmingBatchDeposit(false);
    setSelectedPackIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
  }, []);

  // Single deposit call: admit the whole selected set at once. First click arms
  // the permanent-admission confirmation; the second performs one admission run
  // (not one per pack), recording the aggregate admission as a single activity.
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
          assetPackTitle: admittedReceipts.map((entry) => entry.title).join("; "),
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
    user?.id,
  ]);

  const handleRepositorySourceBranchChange = useCallback(
    (branch: string) => {
      const nextParams = readCurrentSearchParams();
      if (repositoryContext?.provider)
        nextParams.set("provider", repositoryContext.provider);
      if (repositoryContext?.selectedRepository?.fullName)
        nextParams.set("repo", repositoryContext.selectedRepository.fullName);
      nextParams.set("sourceBranch", branch);
      nextParams.delete("sourceCommit");
      nextParams.delete("branch");
      nextParams.delete("commit");
      replaceDepositSearchParams(nextParams);
    },
    [readCurrentSearchParams, replaceDepositSearchParams, repositoryContext],
  );

  const handleRepositorySourceCommitChange = useCallback(
    (commit: string) => {
      const nextParams = readCurrentSearchParams();
      if (repositoryContext?.provider)
        nextParams.set("provider", repositoryContext.provider);
      if (repositoryContext?.selectedRepository?.fullName)
        nextParams.set("repo", repositoryContext.selectedRepository.fullName);
      if (repositoryContext?.selectedBranch)
        nextParams.set("sourceBranch", repositoryContext.selectedBranch);
      nextParams.set("sourceCommit", commit);
      nextParams.delete("branch");
      nextParams.delete("commit");
      replaceDepositSearchParams(nextParams);
    },
    [readCurrentSearchParams, replaceDepositSearchParams, repositoryContext],
  );

  return (
    <TerminalShellBridgeProvider>
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
            value: depositRouteSession.activeStepId.replace(/-/g, " "),
          },
          {
            label: "Options",
            value: depositRouteSession.synthesis.optionCount,
          },
          {
            label: "Positive ROI",
            value: depositRouteSession.policy.reviewablePositiveRoiCount,
          },
          {
            label: "Admitted",
            value: depositRouteSession.admission.admittedCount,
          },
          {
            label: "Network",
            value:
              networkDepositoryCount === null ? "—" : networkDepositoryCount,
          },
          {
            label: "Authority",
            value:
              depositRouteSession.organizationPolicyWalletAuthority.aggregate
                .state,
          },
          {
            label: "Earning estimate",
            value: formatSats(
              depositRouteSession.earningSupplyIntelligence.aggregate
                .totalExpectedCompensationSats,
            ),
          },
        ]}
      >
        <ProductRouteStepGrid
          ariaLabel="Deposit steps"
          activeStepId={depositRouteSession.activeStepId}
          steps={depositRouteSession.steps}
          tone="emerald"
          testIdPrefix="deposit-route-step"
          stateDataAttribute="data-deposit-step-state"
          compact
          onSelect={(stepId) => {
            replaceDepositSearchParams(
              writeDepositRouteStage(readCurrentSearchParams(), stepId),
            );
            if (typeof document === "undefined") return;
            const targetId =
              stepId.includes("connect") || stepId.includes("source")
                ? "deposit-section-source"
                : stepId.includes("synth")
                  ? "deposit-section-synthesize"
                  : "deposit-section-review";
            document
              .getElementById(targetId)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />

        <section
          className="border border-white/10 bg-white/[0.035] px-4 py-4"
          aria-label="Deposit pipelines"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
                Pipelines
              </p>
              <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                <span>Deposit pipelines</span>
                <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.readback} />
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                void refreshLiveRuns();
              }}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
              aria-label="Refresh Deposit pipelines"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {/* Master table of Deposit pipeline runs — selecting a row writes
              the URL transactionId; a synthesis run's selection connects the
              Telemetry + Options detail below (live stream when running,
              resumed results when completed). */}
          <div className="mt-4" data-testid="deposits-pipelines-table">
            <TerminalTransactionsTable
              runs={liveRuns}
              selectedTransactionId={selectedRun?.id ?? null}
              onSelectTransaction={replaceDepositRouteTransaction}
              filters={pipelineFilters}
              onFiltersChange={setPipelineFilters}
              onResetFilters={() =>
                setPipelineFilters({
                  ...DEFAULT_TRANSACTION_FILTERS,
                  transactionLens: "deposit",
                })
              }
              pagination={pipelinePagination}
              onPaginationChange={setPipelinePagination}
              isLoadingRuns={isLoadingRuns}
              runsError={runsLoadError}
              transactionDataMode="live"
              surface="pipelines"
            />
          </div>
          <Link
            href="/packs?type=depository-assetpack"
            className="mt-3 inline-flex w-full items-center justify-center border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-300/15"
          >
            Open pack activity
          </Link>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.55fr)]">
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
                />
              </div>
              <section
                id="deposit-section-synthesize"
                className="border border-white/10 bg-white/[0.035] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                      Option synthesis
                    </p>
                    <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                      <span>Obfuscations</span>
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.obfuscations} />
                    </h2>
                  </div>
                  <Sparkles
                    className="h-5 w-5 text-emerald-200"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-4 block">
                  <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
                    <label htmlFor="deposit-obfuscations-input">What to obfuscate or withhold</label>
                    <span onClick={(event) => event.stopPropagation()}>
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.whatToObfuscate} triggerAriaLabel="More info about this field" />
                    </span>
                  </span>
                  <textarea
                    id="deposit-obfuscations-input"
                    value={obfuscations}
                    onChange={(event) =>
                      setObfuscations(event.target.value)
                    }
                    className="mt-2 min-h-[8rem] w-full border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-neutral-100 outline-none transition focus:border-emerald-300/35"
                  />
                </div>
                <div className="mt-4 block">
                  <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
                    <label htmlFor="deposit-source-path-hints-input">Source path hints</label>
                    <span onClick={(event) => event.stopPropagation()}>
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.sourcePathHints} triggerAriaLabel="More info about this field" />
                    </span>
                  </span>
                  <textarea
                    id="deposit-source-path-hints-input"
                    value={sourcePathHintsText}
                    onChange={(event) =>
                      setSourcePathHintsText(event.target.value)
                    }
                    className="mt-2 min-h-[6rem] w-full border border-white/10 bg-black/30 px-3 py-3 font-mono text-xs leading-5 text-neutral-100 outline-none transition focus:border-emerald-300/35"
                  />
                </div>
                <div className="mt-4 block">
                  <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
                    <label htmlFor="deposit-protected-ip-exclusions-input">
                      Protected IP exclusions (one per line)
                    </label>
                    <span onClick={(event) => event.stopPropagation()}>
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.protectedIpExclusions} triggerAriaLabel="More info about this field" />
                    </span>
                  </span>
                  <textarea
                    id="deposit-protected-ip-exclusions-input"
                    value={protectedIpExclusionsText}
                    onChange={(event) =>
                      setProtectedIpExclusionsText(event.target.value)
                    }
                    placeholder={"e.g. src/secret-engine/\ninternal pricing model"}
                    className="mt-2 min-h-[6rem] w-full border border-amber-300/15 bg-black/30 px-3 py-3 font-mono text-xs leading-5 text-neutral-100 outline-none transition focus:border-amber-300/40"
                  />
                  <span className="mt-1 block text-xs leading-5 text-neutral-500">
                    Excluded paths and concepts never enter AssetPack knowledge
                    synthesis: they are removed from the source inventory before
                    measurement, and candidates that touch them are dropped
                    fail-closed.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void handleSynthesizeOptions();
                  }}
                  disabled={
                    !depositRouteSession.routeState.repositoryFullName ||
                    synthesisStatus === "running"
                  }
                  className="mt-4 inline-flex w-full items-center justify-center border border-emerald-300/25 bg-emerald-300/12 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-neutral-500"
                >
                  {synthesisStatus === "running"
                    ? "Synthesizing with AssetPacksSynthesis…"
                    : "Synthesize options"}
                </button>
                {synthesisStatus === "failed" && synthesisError ? (
                  <p
                    role="alert"
                    className="mt-3 border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs leading-5 text-rose-100"
                  >
                    {synthesisError}
                  </p>
                ) : null}
              </section>
            </div>

            {synthesisRunId ? (
              <section
                ref={synthesisTelemetryRef}
                className="min-w-0 overflow-hidden border border-white/10 bg-white/[0.035] px-4 py-4"
                aria-label="Asset Pack Synthesis telemetry"
                data-testid="deposit-synthesis-telemetry"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                      {synthesisRunExpectsOptions
                        ? "Asset Pack Synthesis"
                        : "Pipeline run"}
                    </p>
                    <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                      <span>Telemetry</span>
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.synthesisTelemetry} />
                    </h2>
                    {synthesisLiveContext ? (
                      <div
                        className="mt-3"
                        data-testid="deposit-telemetry-live-tracker"
                      >
                        <ExecutionContextPillRow
                          phase={synthesisLiveContext.phase}
                          agent={synthesisLiveContext.agent}
                          step={synthesisLiveContext.step}
                          failsafe={synthesisLiveContext.failsafe}
                          generation={synthesisLiveContext.generation}
                          mode="deposit"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
                        Source-safe pipeline telemetry streamed live from the
                        running synthesis: phases, agents, generation stages,
                        provider, model, and usage. Prompt and response content
                        stays withheld by law.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <QuantumOrb
                      key={synthesisRunning ? "telemetry-orb-running" : "telemetry-orb-idle"}
                      size={24}
                      config={verifiedAccessOrbConfig}
                      initialState={synthesisRunning ? "active" : "rest"}
                      interactive={false}
                      respectReducedMotion
                      className="shrink-0"
                    />
                    <RunClock
                      startedAtMs={synthesisRunStartMs}
                      running={synthesisRunning}
                      endedAtMs={synthesisRunEndMs}
                      className="font-mono text-[0.72rem] text-emerald-100/90"
                    />
                    {typeof synthesisActivity.currentIteration === "number" && (
                      <span
                        title="DIV loop iteration (Discovery → Implementation → Validation)"
                        className="border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100"
                      >
                        iter {synthesisActivity.currentIteration}
                      </span>
                    )}
                    <span className="border border-white/10 bg-black/30 px-3 py-2 font-mono text-[0.62rem] text-neutral-400">
                      {synthesisRunId}
                    </span>
                  </div>
                </div>
                {synthesisActivity.readyToFinishVerdicts.length > 0 &&
                  (() => {
                    const verdicts = synthesisActivity.readyToFinishVerdicts;
                    const latest = verdicts[verdicts.length - 1];
                    const prior = verdicts.slice(0, -1);
                    const approved = latest.finalApproval === true;
                    return (
                      <div
                        data-testid="deposit-telemetry-readiness-verdict"
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
                          {typeof latest.qualityScore === "number" &&
                            ` · quality ${latest.qualityScore.toFixed(2)}`}
                          {typeof latest.overallConfidence === "number" &&
                            ` · confidence ${latest.overallConfidence.toFixed(2)}`}
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
                        {prior.length > 0 && (
                          <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-neutral-500">
                            {prior
                              .map(
                                (verdict) =>
                                  `iter ${verdict.iteration ?? "—"}: ${
                                    verdict.finalApproval === true
                                      ? "ready"
                                      : `iterate (${verdict.recommendation ?? "not approved"}, ${verdict.reasons.length} reasons)`
                                  }`,
                              )
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                <div className="mt-4 min-w-0">
                  <PipelineExecutionLog
                    output={synthesisActivity.output}
                    outputDetails={synthesisActivity.outputDetails}
                    isProcessing={synthesisStatus === "running"}
                    error={
                      synthesisStatus === "failed"
                        ? synthesisError
                        : synthesisActivity.error
                    }
                    onRetry={() => {
                      void handleSynthesizeOptions();
                    }}
                    onDismissError={() => setSynthesisError(null)}
                    userHasScrolled={synthesisLogScrolled}
                    setUserHasScrolled={setSynthesisLogScrolled}
                    pipelineMode="deposit"
                    liveContext={synthesisLiveContext}
                    copyData={{
                      runId: synthesisRunId,
                      status: synthesisStatus,
                      error:
                        synthesisStatus === "failed"
                          ? synthesisError
                          : synthesisActivity.error,
                      inputs: {
                        repositoryFullName:
                          repositoryContext?.selectedRepository?.fullName ?? null,
                        sourceBranch: repositoryContext?.selectedBranch ?? null,
                        sourceCommit: repositoryContext?.selectedCommit ?? null,
                        obfuscations,
                        protectedIpExclusions: protectedIpExclusionsText,
                      },
                      outputDetails: synthesisActivity.outputDetails,
                      events: synthesisEvents,
                    }}
                    compact
                  />
                </div>
              </section>
            ) : null}

            <section
              id="deposit-section-review"
              className="border border-white/10 bg-white/[0.035] px-4 py-4"
              aria-label="Deposit AssetPack options"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                    Options
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>Source-safe AssetPack proposals</span>
                    <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.options} />
                  </h2>
                </div>
                <span className="border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100">
                  {depositRouteSession.synthesis.pipeline}
                </span>
              </div>
              {realSynthesis?.synthesis?.inference ? (
                <p
                  data-testid="deposit-synthesis-inference"
                  className="mt-3 border border-emerald-300/12 bg-emerald-300/[0.05] px-3 py-2 text-xs leading-5 text-emerald-100/90"
                >
                  Measured by AssetPacksSynthesis (deposit lens):{" "}
                  {realSynthesis.synthesis.inference.model || "configured model"}
                  {typeof realSynthesis.synthesis.inference.totalTokens ===
                  "number"
                    ? ` · ${realSynthesis.synthesis.inference.totalTokens.toLocaleString()} tokens`
                    : ""}
                  {typeof realSynthesis.synthesis.inference.durationMs ===
                  "number"
                    ? ` · ${(realSynthesis.synthesis.inference.durationMs / 1000).toFixed(1)}s`
                    : ""}
                  {realSynthesis.synthesis.exclusionPosture
                    ? ` · ${realSynthesis.synthesis.exclusionPosture.protectedIpExclusionCount} exclusions, ${realSynthesis.synthesis.exclusionPosture.excludedPathCount} paths withheld`
                    : ""}
                </p>
              ) : null}
              {!realSynthesis ? (
                <div
                  data-testid="deposit-options-await-synthesis"
                  className="mt-5 border border-white/10 bg-black/20 px-4 py-6 text-sm leading-6 text-neutral-400"
                >
                  Measured AssetPack options appear here after synthesis —
                  select a repository, describe what to synthesize, then
                  Synthesize.
                </div>
              ) : null}
              <div className="mt-5 grid gap-3 xl:grid-cols-3">
                {(realSynthesis
                  ? depositRouteSession.synthesis.options
                  : []
                ).map((option) => {
                  const reviewDecision =
                    optionReviewDecisions[option.optionId] ||
                    "pending-depositor-review";
                  const reviewed =
                    reviewDecision !== "pending-depositor-review";
                  const policyEvaluation =
                    depositRouteSession.policy.evaluations.find(
                      (evaluation) => evaluation.optionId === option.optionId,
                    );
                  const admissionReceipt =
                    depositRouteSession.admission.receipts.find(
                      (receipt) => receipt.optionId === option.optionId,
                    );
                  const earningStatement =
                    depositRouteSession.earningSupplyIntelligence.earningStatements.find(
                      (statement) => statement.optionId === option.optionId,
                    );
                  const supplyRecommendation =
                    depositRouteSession.earningSupplyIntelligence.supplyRecommendations.find(
                      (recommendation) =>
                        recommendation.optionId === option.optionId,
                    );
                  return (
                    <article
                      key={option.optionId}
                      data-testid={`deposit-option-${option.kind}`}
                      className={`grid min-w-0 gap-4 border px-4 py-4 ${
                        reviewed
                          ? "border-emerald-300/38 bg-emerald-300/10"
                          : "border-white/10 bg-black/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
                            {option.kind}
                          </p>
                          <button
                            type="button"
                            aria-label="Anchor this AssetPack to the activity ledger"
                            title="Anchor AssetPack to the activity ledger"
                            onClick={() => {
                              void handleRecordActivity({
                                type: "pipeline:deposit-option-anchor",
                                status: "completed",
                                summary: `Anchored ${option.title} to the activity ledger.`,
                                selectAfterRecord: false,
                                output: {
                                  assetPackTitle: option.title,
                                  optionId: option.optionId,
                                  optionRoots: option.roots,
                                },
                                context: {
                                  source: "deposit-option-anchor",
                                  workbench: "deposit-option-review",
                                  optionId: option.optionId,
                                },
                              });
                            }}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition hover:border-emerald-300/35 hover:bg-emerald-300/10"
                          >
                            <Anchor className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-white">
                          {option.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-400">
                          {option.summary}
                        </p>
                        {option.contents ? (
                          // The deposit/no-deposit decision payload: what Bitcode
                          // RECEIVES if this AssetPack is deposited — the synthesized
                          // AP contents + the provenant source files.
                          <div className="mt-3 border border-emerald-300/20 bg-emerald-300/[0.05] px-3 py-3">
                            <p className="text-[0.58rem] font-medium uppercase tracking-[0.16em] text-emerald-200/85">
                              If deposited, Bitcode receives
                            </p>
                            {option.contents.patchSummary ? (
                              <p className="mt-2 break-words text-xs leading-5 text-neutral-300">
                                {option.contents.patchSummary}
                              </p>
                            ) : null}
                            {option.contents.fileChanges.length > 0 ? (
                              <div className="mt-2">
                                <p className="text-[0.56rem] uppercase tracking-[0.14em] text-neutral-500">
                                  Synthesized contents · {option.contents.fileChanges.length} file
                                  {option.contents.fileChanges.length === 1 ? "" : "s"}
                                </p>
                                <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto break-all font-mono text-[0.7rem]">
                                  {option.contents.fileChanges.map((change) => (
                                    <li
                                      key={`${change.op}:${change.path}`}
                                      className="flex items-baseline gap-1.5"
                                    >
                                      <span
                                        className={`shrink-0 uppercase ${
                                          change.op === "create"
                                            ? "text-emerald-300/80"
                                            : change.op === "delete"
                                              ? "text-rose-300/80"
                                              : "text-amber-300/80"
                                        }`}
                                      >
                                        {change.op}
                                      </span>
                                      <span className="text-neutral-400">{change.path}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            <div className="mt-2">
                              <p className="text-[0.56rem] uppercase tracking-[0.14em] text-neutral-500">
                                Provenant source · {option.contents.provenantSourceCount} file
                                {option.contents.provenantSourceCount === 1 ? "" : "s"} available to
                                Bitcode
                              </p>
                              <ul className="mt-1 max-h-32 overflow-y-auto break-all font-mono text-[0.7rem] text-neutral-400">
                                {option.contents.provenantSourcePaths.map((path) => (
                                  <li key={path}>{path}</li>
                                ))}
                              </ul>
                            </div>
                            {(() => {
                              const projection = realSynthesis?.reviewProjections.find(
                                (entry) => entry.optionId === option.optionId,
                              );
                              return projection?.measurementRationale ? (
                                <p className="mt-2 break-words text-[0.7rem] leading-5 text-neutral-500">
                                  {projection.measurementRationale}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        ) : (
                          (() => {
                            const projection = realSynthesis?.reviewProjections.find(
                              (entry) => entry.optionId === option.optionId,
                            );
                            if (!projection) return null;
                            return (
                              <details className="mt-2 text-xs leading-5 text-neutral-400">
                                <summary className="cursor-pointer text-neutral-300">
                                  Covered source ({projection.coveredSourcePaths.length} paths)
                                </summary>
                                <ul className="mt-1 max-h-32 overflow-y-auto break-all font-mono">
                                  {projection.coveredSourcePaths.map((path) => (
                                    <li key={path}>{path}</li>
                                  ))}
                                </ul>
                                <p className="mt-2 text-neutral-500">
                                  {projection.measurementRationale}
                                </p>
                              </details>
                            );
                          })()
                        )}
                      </div>
                      <dl className="grid gap-2">
                        {policyEvaluation ? (
                          <>
                            <div className="border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-2">
                              <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                Policy
                              </dt>
                              <dd className="mt-1 text-sm text-emerald-100">
                                {policyEvaluation.policyDecision}
                              </dd>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                  Criticality
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-200">
                                  {policyEvaluation.sourceCriticality.state}
                                </dd>
                              </div>
                              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                  Demand
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-200">
                                  {policyEvaluation.demand.state}
                                </dd>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                  ROI
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-200">
                                  {policyEvaluation.roi.state} /{" "}
                                  {policyEvaluation.roi.expectedNetSats} sats
                                  net
                                </dd>
                              </div>
                              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                  BTD potential
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-200">
                                  {policyEvaluation.btdPotential.state}
                                </dd>
                              </div>
                            </div>
                            <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                              <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                Compensation
                              </dt>
                              <dd className="mt-1 text-sm text-neutral-200">
                                {policyEvaluation.compensation.state}
                              </dd>
                            </div>
                            <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                              <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                {"BTC source-to-shares preview"}
                              </dt>
                              <dd className="mt-1 text-sm text-neutral-200">
                                depositor{" "}
                                {policyEvaluation.compensation
                                  .depositorShareBasisPoints / 100}
                                % / treasury{" "}
                                {policyEvaluation.compensation
                                  .protocolTreasuryBasisPoints / 100}
                                % /{" "}
                                {
                                  policyEvaluation.compensation
                                    .sourceToSharesProofState
                                }
                              </dd>
                            </div>
                            {admissionReceipt ? (
                              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                  Admission
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-200">
                                  {admissionReceipt.admission.state} /{" "}
                                  {admissionReceipt.packsActivitySync.state}
                                </dd>
                              </div>
                            ) : null}
                            {earningStatement ? (
                              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                  Earning estimate
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-200">
                                  {
                                    earningStatement
                                      .expectedCompensationRangeSats.low
                                  }
                                  -{
                                    earningStatement
                                      .expectedCompensationRangeSats.high
                                  }{" "}
                                  sats / {earningStatement.state}
                                </dd>
                              </div>
                            ) : null}
                            {supplyRecommendation ? (
                              <div className="border border-white/8 bg-white/[0.035] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                                  Recommendation
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-200">
                                  {supplyRecommendation.action}
                                </dd>
                              </div>
                            ) : null}
                          </>
                        ) : null}
                        {option.neediness ? (
                          <div className="min-w-0 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
                            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/85">
                              Neediness · est. read demand
                            </dt>
                            <dd className="mt-1 text-sm text-neutral-100">
                              {(option.neediness.volume * 100).toFixed(0)}%
                              <span className="text-neutral-500">
                                {" "}
                                · demand {(option.neediness.demand * 100).toFixed(0)}% · saturation{" "}
                                {(option.neediness.saturation * 100).toFixed(0)}%
                              </span>
                            </dd>
                            {option.neediness.rationale ? (
                              <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
                                {option.neediness.rationale}
                              </dd>
                            ) : null}
                          </div>
                        ) : null}
                        {option.measurements.map((measurement) => (
                          <div
                            key={measurement.id}
                            className="border border-white/8 bg-white/[0.035] px-3 py-2"
                          >
                            <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                              {measurement.label}
                            </dt>
                            <dd className="mt-1 text-sm text-neutral-200">
                              {typeof measurement.magnitude === "number" ? (
                                <>
                                  {measurement.magnitude}
                                  {measurement.unit &&
                                  measurement.unit !== "normalized" &&
                                  measurement.unit !== "estimate"
                                    ? ` ${measurement.unit}`
                                    : ""}
                                  <span className="text-neutral-500">
                                    {" "}
                                    · {(measurement.volume * 100).toFixed(0)}% / weight{" "}
                                    {measurement.weight.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  {(measurement.volume * 100).toFixed(0)}% / weight{" "}
                                  {measurement.weight.toFixed(2)}
                                </>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <details className="border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-3">
                        <summary className="cursor-pointer text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100/85">
                          Option roots
                        </summary>
                        <dl className="mt-2 grid gap-2">
                          {Object.entries(option.roots).map(
                            ([label, value]) => (
                              <div key={label}>
                                <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">
                                  {label}
                                </dt>
                                <dd className="break-all font-mono text-[0.66rem] text-neutral-300">
                                  {value}
                                </dd>
                              </div>
                            ),
                          )}
                        </dl>
                      </details>
                      <div className="grid gap-2">
                        {/* North-star step D: select packs to deposit; one batch
                            action admits the selected set. Archive
                            (re-depositable) and Resynthesize are secondary. */}
                        {reviewDecision === "approved-for-admission" ? (
                          <p className="border border-emerald-300/30 bg-emerald-300/12 px-4 py-3 text-sm font-medium text-emerald-100">
                            Admitted to Depository — permanent
                          </p>
                        ) : (
                          <>
                            <button
                              type="button"
                              data-testid={`deposit-option-select-${option.kind}`}
                              aria-pressed={selectedPackIds.includes(
                                option.optionId,
                              )}
                              onClick={() => handleToggleSelect(option.optionId)}
                              className={`border px-4 py-3 text-sm font-medium transition ${
                                selectedPackIds.includes(option.optionId)
                                  ? "border-emerald-300/45 bg-emerald-300/18 text-emerald-100 hover:border-emerald-200/60 hover:bg-emerald-300/24"
                                  : "border-white/15 bg-white/[0.04] text-neutral-200 hover:border-emerald-300/35 hover:bg-emerald-300/10"
                              }`}
                            >
                              {selectedPackIds.includes(option.optionId)
                                ? "Selected for deposit ✓"
                                : "Select for deposit"}
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  void handleOptionReviewDecision(
                                    option.optionId,
                                    "rejected-by-depositor",
                                  );
                                }}
                                className="border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-sky-300/30 hover:bg-sky-300/10"
                              >
                                {reviewDecision === "rejected-by-depositor"
                                  ? "Archived"
                                  : "Archive"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setResynthesisForOptionId(
                                    resynthesisForOptionId === option.optionId
                                      ? null
                                      : option.optionId,
                                  )
                                }
                                className="border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-200 transition hover:border-amber-300/30 hover:bg-amber-300/10"
                              >
                                {resynthesisForOptionId === option.optionId
                                  ? "Cancel resynthesis"
                                  : "Resynthesize"}
                              </button>
                            </div>
                            {resynthesisForOptionId === option.optionId ? (
                              <div className="grid gap-2 border border-amber-300/20 bg-amber-300/[0.04] px-3 py-3">
                                <label className="text-[0.6rem] uppercase tracking-[0.16em] text-amber-100/80">
                                  Optional new synthesis instructions
                                </label>
                                <textarea
                                  rows={2}
                                  value={resynthesisInstructions}
                                  onChange={(event) =>
                                    setResynthesisInstructions(event.target.value)
                                  }
                                  placeholder="Steer the re-run, or leave blank to resynthesize with current instructions…"
                                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none transition focus:border-amber-300/40"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const trimmed = resynthesisInstructions.trim();
                                    if (trimmed) setObfuscations(trimmed);
                                    setResynthesisForOptionId(null);
                                    setResynthesisInstructions("");
                                    void handleSynthesizeOptions(
                                      trimmed || undefined,
                                    );
                                  }}
                                  className="border border-amber-300/35 bg-amber-300/15 px-3 py-2 text-xs font-medium text-amber-100 transition hover:border-amber-200/55 hover:bg-amber-300/22"
                                >
                                  Resynthesize now
                                </button>
                              </div>
                            ) : null}
                          </>
                        )}
                        {reviewDecision === "rejected-by-depositor" ? (
                          <p className="text-xs leading-5 text-neutral-400">
                            Archived — visible in your packs and re-depositable
                            anytime; measurements go stale over time, so
                            re-deposit triggers resynthesis.
                          </p>
                        ) : null}
                        <p className="text-[0.66rem] uppercase tracking-[0.14em] text-neutral-500">
                          {reviewDecision === "approved-for-admission"
                            ? "admitted to depository"
                            : reviewDecision === "rejected-by-depositor"
                              ? "archived by depositor"
                              : selectedPackIds.includes(option.optionId)
                                ? "selected for deposit"
                                : "Pending depositor review"}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
              {realSynthesis ? (
                <div
                  className="mt-4 border border-emerald-300/20 bg-emerald-300/[0.04] px-4 py-4"
                  aria-label="Deposit selected AssetPacks"
                >
                  {depositRouteSession.admission.admittedCount > 0 ? (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-emerald-300/35 bg-emerald-300/15 px-4 py-3">
                      <p className="text-sm font-medium text-emerald-100">
                        ✓ {depositRouteSession.admission.admittedCount} AssetPack
                        {depositRouteSession.admission.admittedCount === 1
                          ? ""
                          : "s"}{" "}
                        deposited to the Depository — permanent.
                      </p>
                      <Link
                        href="/packs?type=depository-assetpack"
                        className="inline-flex items-center border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18"
                      >
                        View in your packs
                      </Link>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-neutral-300">
                      {selectedPackIds.length === 0
                        ? "Select the AssetPacks you want to deposit, then deposit the set in one step."
                        : `${selectedPackIds.length} AssetPack${
                            selectedPackIds.length === 1 ? "" : "s"
                          } selected for deposit.`}
                    </p>
                    <button
                      type="button"
                      data-testid="deposit-selected-packs"
                      disabled={selectedPackIds.length === 0}
                      onClick={() => {
                        void handleDepositSelected();
                      }}
                      className={`border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        confirmingBatchDeposit
                          ? "border-amber-300/45 bg-amber-300/15 text-amber-100 hover:border-amber-200/60 hover:bg-amber-300/20"
                          : "border-emerald-300/30 bg-emerald-300/14 text-emerald-100 hover:border-emerald-200/50 hover:bg-emerald-300/20"
                      }`}
                    >
                      {confirmingBatchDeposit
                        ? `Confirm deposit of ${selectedPackIds.length} AssetPack${
                            selectedPackIds.length === 1 ? "" : "s"
                          }`
                        : selectedPackIds.length
                          ? `Deposit ${selectedPackIds.length} selected AssetPack${
                              selectedPackIds.length === 1 ? "" : "s"
                            }`
                          : "Deposit selected AssetPacks"}
                    </button>
                  </div>
                  {confirmingBatchDeposit ? (
                    <p className="mt-3 text-xs leading-5 text-amber-100/85">
                      Deposit is final: the selected AssetPacks are admitted to
                      the Bitcode Depository permanently. Confirm to deposit, or
                      change the selection to stand down.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>

          <aside className="grid h-fit gap-5" aria-label="Deposit route state">
            <details className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 outline-none">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                    Earnings
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>All-repositories supply estimate</span>
                    <span onClick={(event) => event.stopPropagation()} className="shrink-0">
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.earnings} />
                    </span>
                  </h2>
                </div>
                <TrendingUp
                  className="h-5 w-5 text-emerald-200"
                  aria-hidden="true"
                />
              </summary>
              <dl className="mt-4 grid gap-2">
                <div className="border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Likely demand
                  </dt>
                  <dd className="mt-1 text-sm text-emerald-100">
                    {depositRouteSession.earningSupplyIntelligence.likelyDemand.state} /{" "}
                    {Math.round(
                      depositRouteSession.earningSupplyIntelligence.likelyDemand
                        .averageConfidence * 100,
                    )}
                    %
                  </dd>
                </div>
                <div className="border border-white/8 bg-black/20 px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Unfit Need opportunities
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">
                    {
                      depositRouteSession.earningSupplyIntelligence
                        .unfitNeedOpportunities.opportunityCount
                    }{" "}
                    /{" "}
                    {
                      depositRouteSession.earningSupplyIntelligence
                        .unfitNeedOpportunities.state
                    }
                  </dd>
                </div>
                <div className="border border-white/8 bg-black/20 px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Expected compensation
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">
                    {formatSats(
                      depositRouteSession.earningSupplyIntelligence.aggregate
                        .expectedCompensationRangeSats.low,
                    )}{" "}
                    -{" "}
                    {formatSats(
                      depositRouteSession.earningSupplyIntelligence.aggregate
                        .expectedCompensationRangeSats.high,
                    )}
                  </dd>
                </div>
                <div className="border border-white/8 bg-black/20 px-3 py-2">
                  <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-neutral-500">
                    Supply recommendations
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">
                    {
                      depositRouteSession.earningSupplyIntelligence.aggregate
                        .sourceSafeSupplyRecommendationCount
                    }{" "}
                    approve-ready /{" "}
                    {
                      depositRouteSession.earningSupplyIntelligence.aggregate
                        .repairRequiredCount
                    }{" "}
                    repair
                  </dd>
                </div>
              </dl>
              <details className="mt-3 border border-emerald-300/15 bg-emerald-300/[0.04] px-3 py-3">
                <summary className="cursor-pointer text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100/85">
                  Opportunity roots
                </summary>
                <dl className="mt-2 grid gap-2">
                  {depositRouteSession.earningSupplyIntelligence.unfitNeedOpportunities.opportunities.map(
                    (opportunity) => (
                      <div key={opportunity.id}>
                        <dt className="text-[0.56rem] uppercase tracking-[0.12em] text-neutral-500">
                          {opportunity.label}
                        </dt>
                        <dd className="break-all font-mono text-[0.66rem] text-neutral-300">
                          {opportunity.opportunityRoot}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              </details>
            </details>

            <details className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 outline-none">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                    Governance
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>Organization authority</span>
                    <span onClick={(event) => event.stopPropagation()} className="shrink-0">
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.governance} />
                    </span>
                  </h2>
                </div>
                <ShieldCheck
                  className="h-5 w-5 text-emerald-200"
                  aria-hidden="true"
                />
              </summary>
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
              {depositRouteSession.organizationPolicyWalletAuthority.aggregate
                .blockers.length ? (
                <div className="mt-3">
                  <ProductRouteDisclosure
                    title="Authority blockers"
                    tone="emerald"
                  >
                    {depositRouteSession.organizationPolicyWalletAuthority.aggregate.blockers.join(
                      "; ",
                    )}
                  </ProductRouteDisclosure>
                </div>
              ) : null}
            </details>

            <details className="border border-white/10 bg-white/[0.035] px-4 py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 outline-none">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                    Session
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>Source-safe deposit state</span>
                    <span onClick={(event) => event.stopPropagation()} className="shrink-0">
                      <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.session} />
                    </span>
                  </h2>
                </div>
                <ShieldCheck
                  className="h-5 w-5 text-emerald-200"
                  aria-hidden="true"
                />
              </summary>
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
                <ProductRouteDisclosure
                  title="Disclosure boundary"
                  tone="emerald"
                >
                  Visible: measurements, demand roots, source path roots, policy
                  roots, estimated ROI, BTD potential, compensation metadata.
                  Withheld: raw source, unpaid AssetPack source, prompts,
                  provider responses, settlement private payloads, wallet
                  private material.
                </ProductRouteDisclosure>
              </div>
              <div className="mt-3">
                <ProductRouteProofDetail
                  testId="deposit-expandable-proof-detail"
                  title="Deposit proof detail"
                  tone="emerald"
                  roots={[
                    {
                      id: "route-session-root",
                      label: "Route session root",
                      root: depositRouteSession.proofRoot,
                    },
                    {
                      id: "synthesis-root",
                      label: "Synthesis root",
                      root: depositRouteSession.synthesis.roots.synthesisRoot,
                    },
                    {
                      id: "policy-root",
                      label: "Policy root",
                      root: depositRouteSession.policy.roots.policyReportRoot,
                    },
                    {
                      id: "admission-root",
                      label: "Admission root",
                      root:
                        depositRouteSession.admission.roots.admissionReportRoot,
                    },
                    {
                      id: "earning-root",
                      label: "Earning intelligence root",
                      root:
                        depositRouteSession.earningSupplyIntelligence.roots
                          .intelligenceRoot,
                    },
                    {
                      id: "authority-root",
                      label: "Authority root",
                      root:
                        depositRouteSession.organizationPolicyWalletAuthority
                          .roots.authorityRoot,
                    },
                  ]}
                />
              </div>
            </details>
          </aside>
        </section>
      </ProductRouteShell>
    </TerminalShellBridgeProvider>
  );
}
