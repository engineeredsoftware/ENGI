"use client";

/**
 * Deposit experience page client — composes source selection, option review,
 * pipeline execution, and deposit journal UI for /deposits.
 */


import {
  DEPOSIT_OBFUSCATIONS_PLACEHOLDER,
  formatSats,
  readStringField,
  shortIdentifier,
} from "@/components/deposits/models/deposit-format";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDepositRouteParams } from "./hooks/use-deposit-route-params";
import { DepositRouteStateAside } from "@/components/deposits/DepositRouteStateAside/DepositRouteStateAside";
import {
  Anchor,
  ArrowLeft,
  Boxes,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/bitcode/auth/AuthProvider/AuthProvider";
import {
  ProductRouteDisclosure,
  ProductRouteProofDetail,
  ProductRouteShell,
} from "@/components/bitcode/routes/ProductRouteShell/ProductRouteShell";
import { useUserData } from "@/hooks/useUserData";
import { trackProductEvent } from "@/lib/product-analytics";
import { fetchPipelineExecutionHistory } from "@/networking/api-client";
import type { PipelineExecution } from "@/types/api";

import DepositSourceSelection, {
  type DepositRepositoryAnchor,
} from "@/components/deposits/DepositSourceSelection/DepositSourceSelection";
import {
  buildTerminalExecutionHistoryRequest,
  buildTerminalObfuscationsAnchorDraft,
  formatObfuscationsAnchorDescription,
  mapExecutionHistoryRunToWorkspaceRun,
  readTerminalRouteError,
  type TerminalActivityRecordDraft,
  upsertWorkspaceRun,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import {
  DepositExcludePathsIcon,
  DepositIncludePathsIcon,
  ObfuscationsAnchorDescription,
} from "@/components/deposits/DepositObfuscationsPathIcons/DepositObfuscationsPathIcons";
import type { TerminalRepositoryContextState } from "@/components/bitcode/pipeline/models/repository-context";
import {
  clearTerminalTransactionId,
  readTerminalTransactionId,
  writeTerminalTransactionId,
} from "@/components/bitcode/pipeline/models/pipeline-selection-query";
import type { WorkspaceRun } from "@/components/bitcode/pipeline/models/pipeline-run-data";
import BitcodePipelinesTable from "@/components/bitcode/pipeline/BitcodePipelinesTable/BitcodePipelinesTable";
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
  readDepositRouteStage,
  writeDepositRouteStage,
  type DepositRouteSession,
} from "@/components/deposits/models/deposit-route-model";
import { usePipelineExecution } from "@/hooks/usePipelineExecution";
import { buildPipelineRunActivityFromEvents } from "@/components/bitcode/pipeline/models/pipeline-run-activity";
import { PipelineExecutionLog } from "@/components/bitcode/pipeline/PipelineExecutionLog/PipelineExecutionLog";
import { ExecutionContextPillRow } from "@/components/bitcode/pipeline/ExecutionContextPillRow/ExecutionContextPillRow";
import { RunClock } from "@/components/bitcode/pipeline/RunClock/RunClock";
import { QuantumOrb } from "@/components/bitcode/effects/quantum-orb";
import { verifiedAccessOrbConfig } from "@/components/marketing/MarketingLandingShared/MarketingLandingShared";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import {
  DEPOSIT_AUTHORITY_BLOCKERS_EXPLAINER,
  DEPOSIT_STAT_TOOLTIP_GENERICS,
  DEPOSIT_STAT_TOOLTIP_SECTIONS,
  DEPOSIT_AUTHORITY_ROW_EXPLAINERS,
  DEPOSIT_DISCLOSURE_BOUNDARY_EXPLAINER,
  DEPOSIT_EARNING_ROW_EXPLAINERS,
  DEPOSIT_HEADER_METRIC_EXPLAINERS,
  DEPOSIT_OPPORTUNITY_ROOT_EXPLAINER,
  DEPOSIT_PROOF_ROOT_EXPLAINERS,
  DEPOSIT_SESSION_ROW_EXPLAINERS,
} from "@/components/deposits/models/deposit-stat-explainers";
import { TelemetryExplainerTrigger } from "@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger";
import { VCSFileTreePicker } from "@/components/bitcode/vcs/VCSFileTreePicker/VCSFileTreePicker";
import { SearchableSelect } from "@/components/bitcode/forms/SearchableSelect/SearchableSelect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/Popover/Popover";
import type {
  DepositOptionReviewDecision,
  DepositOptionReviewDecisionState,
} from "@bitcode/pipeline-asset-pack/deposit-asset-pack-option-admission";

import {
  DEPOSIT_OPTION_PIPELINE_ID,
  DEPOSIT_OPTION_POLICY_ID,
  DEPOSIT_OPTION_ADMISSION_ID,
  DEPOSITOR_EARNING_SUPPLY_INTELLIGENCE_ID,
} from './deposit-page-client.constants';


export default function DepositPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    data: userData,
    hasValidGitHubConnection,
    hasVerifiedWalletConnection,
    walletConnectionStatus,
  } = useUserData();
  const { routeSearchParams, selectedTransactionId, routeDepositStage } =
    useDepositRouteParams();
  const [liveRuns, setLiveRuns] = useState<WorkspaceRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [runsLoadError, setRunsLoadError] = useState<string | null>(null);
  const [repositoryContext, setRepositoryContext] =
    useState<TerminalRepositoryContextState | null>(null);
  const [obfuscations, setObfuscations] = useState("");
  // Optional display name drafted in the Anchor popover (and restored when a
  // named anchor is loaded from the activity ledger).
  const [obfuscationsAnchorName, setObfuscationsAnchorName] = useState("");
  const [isObfuscationsAnchorPopoverOpen, setIsObfuscationsAnchorPopoverOpen] =
    useState(false);
  // Picked from the repository file tree (selected repo·branch·commit);
  // hints and exclusions are mutually exclusive path sets.
  const [forcedInclusions, setForcedInclusions] = useState<string[]>([]);
  const [forcedExclusions, setForcedExclusions] = useState<string[]>([]);
  // Settled Depository AssetPack demand (search-grounded). Defaults unestimatable
  // until the demand-estimate route returns — never invent placeholder demand.
  const [settledDemandEstimate, setSettledDemandEstimate] = useState<{
    estimatable: boolean;
    demand: number | null;
    saturation: number | null;
    needinessVolume: number | null;
    settledPackCount: number;
    matchedPackCount: number;
    rationale: string;
  } | null>(null);
  const [settledDemandSignals, setSettledDemandSignals] = useState<{
    depositoryDemandSignals: Array<{ id: string; label: string; weight: number }>;
    readingDemandSignals: Array<{ id: string; label: string; weight: number }>;
    existingDepositorySignals: Array<{ id: string; label: string; weight: number }>;
    unfitNeedOpportunitySignals: Array<{ id: string; label: string; weight: number }>;
  }>({
    depositoryDemandSignals: [],
    readingDemandSignals: [],
    existingDepositorySignals: [],
    unfitNeedOpportunitySignals: [],
  });
  const [optionsRequested, setOptionsRequested] = useState(false);
  const [synthesisRunId, setSynthesisRunId] = useState<string | null>(null);
  // Master-detail: pipelines table is master; compose (new deposit) or a
  // selected run replaces the table with the configuration/detail experience.
  const [isComposeOpen, setIsComposeOpen] = useState(false);
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
    "idle" | "running" | "complete" | "failed" | "cancelled"
  >("idle");
  const [isCancellingSynthesis, setIsCancellingSynthesis] = useState(false);
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
        .catch(() => { });
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

  // Back from compose or run detail to the pipelines table: clear the URL
  // selection, detach any run, and leave compose so the master table returns.
  const closePipelineDetail = useCallback(() => {
    replaceDepositSearchParams(
      clearTerminalTransactionId(readCurrentSearchParams()),
    );
    setIsComposeOpen(false);
    setSynthesisRunId(null);
    setSynthesisStatus("idle");
    setSynthesisError(null);
    setSynthesisDispatchedAtMs(null);
  }, [readCurrentSearchParams, replaceDepositSearchParams]);

  // Open the new-deposit configuration detail (replaces the table, same
  // drill-in shape as selecting a run row — but editable, no run locked yet).
  const openComposeDetail = useCallback(() => {
    replaceDepositSearchParams(
      clearTerminalTransactionId(readCurrentSearchParams()),
    );
    setSynthesisRunId(null);
    setSynthesisStatus("idle");
    setSynthesisError(null);
    setSynthesisDispatchedAtMs(null);
    setRealSynthesis(null);
    setIsComposeOpen(true);
  }, [readCurrentSearchParams, replaceDepositSearchParams]);

  // Detail owns the page when composing a new deposit OR viewing a run.
  const isDepositDetailOpen = Boolean(synthesisRunId) || isComposeOpen;

  // Config is always editable before synthesizing. Lock only while a run is
  // actively executing, or when reviewing a selected historical pipeline row
  // (master-detail, not compose). A failed dispatch that still has compose open
  // stays editable so Forced Inclusion / Exclusions / Obfuscations can be fixed
  // and re-dispatched without Back → New deposit.
  const isRunReviewLocked =
    Boolean(synthesisRunId) &&
    !isComposeOpen &&
    synthesisStatus !== "running";
  const isConfigLocked =
    synthesisStatus === "running" || isRunReviewLocked;

  // Activity-ledger rows (Obfuscations / repository anchors) feed Load-anchor
  // dropdowns but are NOT pipeline executions — exclude them from the pipelines
  // table so selecting them cannot open empty "Telemetry / No logs" detail.
  const ACTIVITY_LEDGER_SOURCES = useMemo(
    () =>
      new Set([
        "deposit-obfuscations-anchor",
        "terminal-repository-context-panel",
      ]),
    [],
  );
  const pipelineTableRuns = useMemo(
    () =>
      liveRuns.filter(
        (run) =>
          !run.contextSource || !ACTIVITY_LEDGER_SOURCES.has(run.contextSource),
      ),
    [liveRuns, ACTIVITY_LEDGER_SOURCES],
  );
  const selectedDetailRun = useMemo(
    () =>
      synthesisRunId
        ? liveRuns.find((run) => run.id === synthesisRunId) || null
        : null,
    [liveRuns, synthesisRunId],
  );
  const isActivityLedgerDetail = Boolean(
    selectedDetailRun?.contextSource &&
      ACTIVITY_LEDGER_SOURCES.has(selectedDetailRun.contextSource),
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

  // Selection is EXPLICIT (drill-in sub-page model): no auto-recovery to the
  // newest run and no first-row fallback — with nothing selected the master
  // table shows, and selecting a row replaces it with the run detail.
  const selectedRun = useMemo(
    () =>
      liveRuns.find((run) => run.id === selectedTransactionId) || null,
    [liveRuns, selectedTransactionId],
  );

  const profileRecord =
    userData?.profile && typeof userData.profile === "object"
      ? (userData.profile as Record<string, unknown>)
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
  const sourceCriticalitySignals = useMemo(
    () => [
      {
        id: "depositor-sub-critical-intent",
        label:
          "Depositor intends this option set to avoid critical source exposure.",
        severity: "sub-critical" as const,
        weight: 0.74,
      },
      ...(forcedInclusions.some((path) =>
        /secret|credential|wallet|auth|key|payment|settlement/iu.test(path),
      )
        ? [
          {
            id: "source-path-sensitive-scope-warning",
            label:
              "Forced Inclusion paths include sensitive operational terms requiring review.",
            severity: "warning" as const,
            weight: 0.64,
          },
        ]
        : []),
    ],
    [forcedInclusions],
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
  // V48-Gate3-F17: previously anchored repositories, newest first, one per
  // distinct repository — derived from the SAME activity history fetch this
  // page already loads (liveRuns), no extra request.
  const repositoryAnchors = useMemo<DepositRepositoryAnchor[]>(() => {
    const newestByRepository = new Map<string, WorkspaceRun>();
    for (const run of liveRuns) {
      if (
        run.contextSource !== "terminal-repository-context-panel" ||
        !run.repository
      )
        continue;
      const existing = newestByRepository.get(run.repository);
      if (!existing || new Date(run.created_at) > new Date(existing.created_at)) {
        newestByRepository.set(run.repository, run);
      }
    }
    return Array.from(newestByRepository.values())
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .map((run) => ({
        id: run.id,
        repositoryFullName: run.repository as string,
        branch: run.branch || null,
        commit: run.sourceCommit || null,
      }));
  }, [liveRuns]);
  // V48-Gate3-F13/F18: previously anchored Obfuscations configurations,
  // newest first — same derivation pattern as repositoryAnchors above.
  // Dedupe by name+text so two differently-named saves of the same body
  // both remain selectable.
  const obfuscationsAnchors = useMemo(() => {
    const seen = new Set<string>();
    const anchors: Array<{
      id: string;
      name: string | null;
      text: string;
      forcedInclusions: string[];
      forcedExclusions: string[];
      repositoryFullName: string | null;
      createdAt: string;
    }> = [];
    for (const run of [...liveRuns].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )) {
      if (
        run.contextSource !== "deposit-obfuscations-anchor" ||
        !run.obfuscationsAnchorText
      )
        continue;
      const name =
        typeof run.obfuscationsAnchorName === "string" &&
        run.obfuscationsAnchorName.trim()
          ? run.obfuscationsAnchorName.trim()
          : null;
      const forcedInclusions = Array.isArray(run.obfuscationsAnchorForcedInclusions)
        ? run.obfuscationsAnchorForcedInclusions.filter(
            (path): path is string =>
              typeof path === "string" && path.trim().length > 0,
          )
        : [];
      const forcedExclusions = Array.isArray(
        run.obfuscationsAnchorForcedExclusions,
      )
        ? run.obfuscationsAnchorForcedExclusions.filter(
            (path): path is string =>
              typeof path === "string" && path.trim().length > 0,
          )
        : [];
      const dedupeKey = `${name || ""}\u0000${run.obfuscationsAnchorText}\u0000${forcedInclusions.join(",")}\u0000${forcedExclusions.join(",")}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      anchors.push({
        id: run.id,
        name,
        text: run.obfuscationsAnchorText,
        forcedInclusions,
        forcedExclusions,
        repositoryFullName: run.repository || null,
        createdAt: run.created_at,
      });
    }
    return anchors;
  }, [liveRuns]);
  const [isAnchoringObfuscations, setIsAnchoringObfuscations] = useState(false);
  const [obfuscationsAnchorMessage, setObfuscationsAnchorMessage] = useState<
    string | null
  >(null);
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
      forcedInclusions,
      // Demand signals only from settled-Depository search (never hardcoded).
      depositoryDemandSignals: settledDemandSignals.depositoryDemandSignals,
      readingDemandSignals: settledDemandSignals.readingDemandSignals,
      existingDepositorySignals: settledDemandSignals.existingDepositorySignals,
      unfitNeedOpportunitySignals:
        settledDemandSignals.unfitNeedOpportunitySignals,
      settledDemandEstimate: settledDemandEstimate
        ? {
            estimatable: settledDemandEstimate.estimatable,
            demand: settledDemandEstimate.demand,
            saturation: settledDemandEstimate.saturation,
            settledPackCount: settledDemandEstimate.settledPackCount,
            matchedPackCount: settledDemandEstimate.matchedPackCount,
            rationale: settledDemandEstimate.rationale,
          }
        : {
            estimatable: false,
            demand: null,
            settledPackCount: 0,
            rationale:
              "Unestimatable: settled Depository demand has not been measured yet.",
          },
      sourceCriticalitySignals,
      developmentCostSats: Math.max(1600, 1200 + forcedInclusions.length * 240),
      // Provisional settlement for ROI/policy ranking. Earnings display still
      // shows Unestimatable when settled demand is not estimatable.
      expectedSettlementSats:
        settledDemandEstimate?.estimatable &&
        typeof settledDemandEstimate.demand === "number"
          ? Math.max(
              1200,
              Math.round(
                1800 +
                  settledDemandEstimate.demand * 4200 +
                  forcedInclusions.length * 240 +
                  liveRuns.length * 40,
              ),
            )
          : Math.max(
              2000,
              1200 + forcedInclusions.length * 240 + liveRuns.length * 40,
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
      settledDemandEstimate,
      settledDemandSignals,
      sourceCriticalitySignals,
      forcedInclusions,
      user?.id,
    ],
  );

  // Load demand from settled Depository AssetPacks (search-grounded).
  useEffect(() => {
    let cancelled = false;
    const fullName = repositoryContext?.selectedRepository?.fullName || "";
    const params = new URLSearchParams();
    if (fullName) params.set("repositoryFullName", fullName);
    void (async () => {
      try {
        const res = await fetch(
          `/api/deposit/demand-estimate?${params.toString()}`,
        );
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok || !data?.ok || !data?.estimate) {
          setSettledDemandEstimate({
            estimatable: false,
            demand: null,
            saturation: null,
            needinessVolume: null,
            settledPackCount: 0,
            matchedPackCount: 0,
            rationale:
              typeof data?.error === "string"
                ? data.error
                : "Unestimatable: could not load settled Depository demand.",
          });
          setSettledDemandSignals({
            depositoryDemandSignals: [],
            readingDemandSignals: [],
            existingDepositorySignals: [],
            unfitNeedOpportunitySignals: [],
          });
          return;
        }
        setSettledDemandEstimate(data.estimate);
        setSettledDemandSignals(
          data.signals || {
            depositoryDemandSignals: [],
            readingDemandSignals: [],
            existingDepositorySignals: [],
            unfitNeedOpportunitySignals: [],
          },
        );
      } catch {
        if (cancelled) return;
        setSettledDemandEstimate({
          estimatable: false,
          demand: null,
          saturation: null,
          needinessVolume: null,
          settledPackCount: 0,
          matchedPackCount: 0,
          rationale:
            "Unestimatable: settled Depository demand request failed.",
        });
        setSettledDemandSignals({
          depositoryDemandSignals: [],
          readingDemandSignals: [],
          existingDepositorySignals: [],
          unfitNeedOpportunitySignals: [],
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repositoryContext?.selectedRepository?.fullName]);
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
      buildPipelineRunActivityFromEvents(
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

  const handleCancelSynthesis = useCallback(async () => {
    if (!synthesisRunId || !synthesisRunning || isCancellingSynthesis) return;
    setIsCancellingSynthesis(true);
    try {
      const response = await fetch(
        `/api/executions/${encodeURIComponent(synthesisRunId)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Run cancelled by depositor." }),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to cancel the synthesis run.",
        );
      }
      setSynthesisStatus("cancelled");
      setSynthesisError(null);
      const durationMs =
        synthesisDispatchedAtMs !== null
          ? Date.now() - synthesisDispatchedAtMs
          : null;
      trackProductEvent({
        name: "deposit_synthesis_cancelled",
        data: { durationMs },
      });
      void refreshLiveRuns();
    } catch (error) {
      setSynthesisError(
        error instanceof Error
          ? error.message
          : "Unable to cancel the synthesis run.",
      );
    } finally {
      setIsCancellingSynthesis(false);
    }
  }, [
    isCancellingSynthesis,
    refreshLiveRuns,
    synthesisDispatchedAtMs,
    synthesisRunId,
    synthesisRunning,
  ]);
  // TOTAL RUN TIME: prefer the executions row wall-clock (started_at /
  // completed_at / duration_ms). Falling back to first/last *loaded* event
  // under-counts when history was truncated (Supabase 1000-row default —
  // refresh used to show ~half the live duration).
  const synthesisRunStartMs = useMemo(() => {
    const rowStart = (synthesisExecution as { started_at?: string | null } | null)
      ?.started_at;
    const fromRow = rowStart ? new Date(rowStart).getTime() : Number.NaN;
    if (Number.isFinite(fromRow)) return fromRow;
    const first = synthesisEvents[0]?.created_at;
    const parsed = first ? new Date(first).getTime() : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
    return synthesisDispatchedAtMs;
  }, [synthesisEvents, synthesisDispatchedAtMs, synthesisExecution]);
  const synthesisRunEndMs = useMemo(() => {
    if (synthesisRunning) return null;
    const row = synthesisExecution as {
      completed_at?: string | null;
      duration_ms?: number | null;
      started_at?: string | null;
    } | null;
    const completedAt = row?.completed_at
      ? new Date(row.completed_at).getTime()
      : Number.NaN;
    if (Number.isFinite(completedAt)) return completedAt;
    const durationMs =
      typeof row?.duration_ms === "number" && Number.isFinite(row.duration_ms)
        ? row.duration_ms
        : null;
    const startedAt = row?.started_at ? new Date(row.started_at).getTime() : Number.NaN;
    if (durationMs !== null && Number.isFinite(startedAt)) {
      return startedAt + durationMs;
    }
    const last = synthesisEvents[synthesisEvents.length - 1]?.created_at;
    const parsed = last ? new Date(last).getTime() : Number.NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [synthesisEvents, synthesisRunning, synthesisExecution]);
  // Live header tracker: the CURRENT active call chain, rendered with the
  // same pills as the log title-lines while the pipeline runs.
  const synthesisLiveContext =
    synthesisRunning && !synthesisError ? synthesisActivity.latestContext : null;

  // V48-Gate3-F26-B: the synthesis run is dispatched (decoupled from the request). When the
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
      // Funnel analytics fire only for runs dispatched in THIS session
      // (adopting a historical row must not emit funnel telemetry).
      if (synthesisDispatchedAtMs !== null) {
        trackProductEvent({
          name: "deposit_synthesis_failed",
          data: { stage: "run", durationMs: Date.now() - synthesisDispatchedAtMs },
        });
      }
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
          error instanceof Error ? error.message : "Synthesis result not found.",
        );
        if (synthesisDispatchedAtMs !== null) {
          trackProductEvent({
            name: "deposit_synthesis_failed",
            data: { stage: "resume", durationMs: Date.now() - synthesisDispatchedAtMs },
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
    if (status === "cancelled") {
      setSynthesisStatus("cancelled");
      setSynthesisError(null);
      if (synthesisDispatchedAtMs !== null) {
        trackProductEvent({
          name: "deposit_synthesis_cancelled",
          data: { durationMs: Date.now() - synthesisDispatchedAtMs },
        });
      }
      return;
    }
    if (status === "failed" || status === "interrupted") {
      setSynthesisStatus("failed");
      // Prefer concrete failure text (executions.error.message / summary) over
      // the generic "Run failed." that left stalled hosts opaque (QA c7b84ad5).
      const detail =
        (typeof run.errorMessage === "string" && run.errorMessage.trim()) ||
        (typeof run.summary === "string" && run.summary.trim()) ||
        null;
      setSynthesisError(
        detail
          ? detail.startsWith("Run ")
            ? detail
            : `Run ${status} — ${detail}`
          : status === "interrupted"
            ? "Run interrupted — host stopped mid-pipeline (restart, maxDuration, or crash). Check server logs."
            : "Run failed — no error message was persisted. The host may have been killed mid-pipeline.",
      );
      if (synthesisDispatchedAtMs !== null) {
        trackProductEvent({
          name: "deposit_synthesis_failed",
          data: { stage: "run", durationMs: Date.now() - synthesisDispatchedAtMs },
        });
      }
    }
  }, [liveRuns, synthesisDispatchedAtMs, synthesisRunId, synthesisStatus]);

  // While a synthesis is running, poll the executions list so terminal row
  // status (failed/interrupted with error.message) surfaces even when the SSE
  // tail goes quiet (maxDuration kill, process death, empty reconnects).
  useEffect(() => {
    if (synthesisStatus !== "running" || !synthesisRunId) return;
    const interval = window.setInterval(() => {
      void refreshLiveRuns();
    }, 15_000);
    return () => window.clearInterval(interval);
  }, [refreshLiveRuns, synthesisRunId, synthesisStatus]);

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
      const detail =
        (typeof run.errorMessage === "string" && run.errorMessage.trim()) ||
        (typeof run.summary === "string" && run.summary.trim()) ||
        null;
      setSynthesisError(
        detail
          ? detail.startsWith("Run ")
            ? detail
            : `Run ${status} — ${detail}`
          : status === "interrupted"
            ? "Run interrupted — host stopped mid-pipeline (restart, maxDuration, or crash)."
            : status === "cancelled"
              ? "Run cancelled."
              : "Run failed — no error message was persisted.",
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

  // Funnel analytics: one source-safe event per distinct repository selection
  // per mount — provider + pin shape only, never the repository name.
  const lastTrackedSourceRef = useRef<string | null>(null);
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

  // V48-Gate3-F13/F18: anchor the CURRENT Obfuscations text into the activity
  // ledger (mirrors handleAnchorRepository in DepositSourceSelection), so it
  // can be reloaded on a later run via the "Load anchor" selector below.
  // Optional display name (from the Anchor popover) labels the dropdown entry.
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

  // Delete a saved Obfuscations anchor from the activity ledger (hover-trash
  // on the Load-anchor dropdown). Optimistic local removal; server is the
  // fail-closed authority (own row + anchor-source only).
  const handleDeleteObfuscationsAnchor = useCallback(async (anchorId: string) => {
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
  }, [liveRuns]);

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
          // Forced Inclusion / Forced Exclusion — always from current compose
          // state so scoped measurement reaches the server (never omit).
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
      // V48-Gate3-F26-B: the route DISPATCHED the run (it no longer returns the synthesis
      // inline — the full pipeline runs to completion in the background while
      // telemetry streams). Stay 'running'; the completion effect reads the
      // persisted synthesis from the execution row and flips to 'complete'.
      // Master-detail: the running row was inserted before the route
      // responded — surface it in the pipelines table and select it so the
      // detail follows this run (and so a reload can reattach from the URL).
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
  }, [
    obfuscations,
    depositRouteInput.depositoryDemandSignals,
    depositRouteInput.existingDepositorySignals,
    depositRouteInput.readingDemandSignals,
    forcedExclusions,
    refreshLiveRuns,
    replaceDepositRouteTransaction,
    repositoryContext,
    forcedInclusions,
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
        summary: `Admitted ${admittedReceipts.length} AssetPack${admittedReceipts.length === 1 ? "" : "s"
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
        <section
          className="border border-white/10 bg-white/[0.035] px-4 py-4"
          aria-label="Deposit"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {isDepositDetailOpen ? (
                <button
                  type="button"
                  onClick={closePipelineDetail}
                  className="inline-flex h-9 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 text-xs font-medium uppercase tracking-[0.14em] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
                  aria-label="Back to Deposit"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </button>
              ) : null}
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-neutral-500">
                  Pipelines
                </p>
                <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                  <span>Deposit</span>
                  <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.readback} />
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isDepositDetailOpen ? (
                <button
                  type="button"
                  onClick={openComposeDetail}
                  className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
                  aria-label="New deposit"
                  title="New deposit"
                  data-testid="deposit-open-compose"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  void refreshLiveRuns();
                }}
                className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
                aria-label="Refresh Deposit"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          {/* Drill-in master-detail: master = pipelines table. Detail (compose
              or selected run) REPLACES the table; Back returns to the table.
              New (+) opens compose; row selection opens run detail. */}
          {!isDepositDetailOpen ? (
            <div className="mt-4" data-testid="deposits-pipelines-table">
              <BitcodePipelinesTable
                runs={pipelineTableRuns}
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
          ) : null}
        </section>

        {/* Configuration + telemetry + options only in detail (compose or run).
            Once a run is attached, configuration locks above telemetry. */}
        {isDepositDetailOpen ? (
        <section
          className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.55fr)]"
          data-testid="deposit-run-configuration"
          data-locked={isConfigLocked ? "true" : "false"}
          data-compose={isComposeOpen && !isRunReviewLocked ? "true" : "false"}
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
              <section
                id="deposit-section-synthesize"
                className={`border border-white/10 bg-white/[0.035] px-4 py-4 ${
                  isConfigLocked ? "opacity-80" : ""
                }`}
                aria-disabled={isConfigLocked ? true : undefined}
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
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {obfuscationsAnchors.length > 0 ? (
                      <div className="w-56">
                        <SearchableSelect
                          aria-label="Load a previously anchored Obfuscations configuration"
                          items={obfuscationsAnchors.map((anchor) => ({
                            key: anchor.id,
                            label:
                              anchor.name ||
                              anchor.repositoryFullName ||
                              "Obfuscations anchor",
                            // Sub-text: clipped body | include icon+count | exclude
                            // icon+count — same icons as the picker section headers.
                            description: (
                              <ObfuscationsAnchorDescription
                                text={anchor.text}
                                forcedInclusions={anchor.forcedInclusions}
                                forcedExclusions={
                                  anchor.forcedExclusions
                                }
                              />
                            ),
                            searchText: [
                              anchor.name,
                              anchor.repositoryFullName,
                              formatObfuscationsAnchorDescription({
                                text: anchor.text,
                                forcedInclusions: anchor.forcedInclusions,
                                forcedExclusions:
                                  anchor.forcedExclusions,
                              }),
                            ]
                              .filter(Boolean)
                              .join(" "),
                            deletable: true,
                          }))}
                          value={null}
                          disabled={isConfigLocked}
                          onSelect={(key) => {
                            if (isConfigLocked) return;
                            const anchor = obfuscationsAnchors.find(
                              (entry) => entry.id === key,
                            );
                            if (!anchor) return;
                            setObfuscations(anchor.text);
                            setObfuscationsAnchorName(anchor.name || "");
                            setForcedInclusions(anchor.forcedInclusions);
                            setForcedExclusions(anchor.forcedExclusions);
                          }}
                          onDeleteItem={
                            isConfigLocked
                              ? undefined
                              : (key) => {
                                  void handleDeleteObfuscationsAnchor(key);
                                }
                          }
                          // One-shot load-in: always shows the placeholder, never
                          // a selected value — no check indicator in the list.
                          showSelectionIndicator={false}
                          placeholder="Load anchor..."
                          searchPlaceholder="Search anchors..."
                          emptyMessage="No anchors yet."
                          className="h-9"
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      aria-label="Clear obfuscations"
                      title="Clear obfuscations"
                      disabled={
                        isConfigLocked ||
                        (!obfuscations &&
                          !obfuscationsAnchorName &&
                          forcedInclusions.length === 0 &&
                          forcedExclusions.length === 0)
                      }
                      onClick={() => {
                        setObfuscations("");
                        setObfuscationsAnchorName("");
                        setForcedInclusions([]);
                        setForcedExclusions([]);
                        setIsObfuscationsAnchorPopoverOpen(false);
                      }}
                      className="border border-white/10 px-2.5 py-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-rose-300/35 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Clear
                    </button>
                    <Popover
                      open={isObfuscationsAnchorPopoverOpen}
                      onOpenChange={(open) => {
                        // Require Obfuscations body before opening the name popover.
                        if (isConfigLocked) return;
                        if (open && !obfuscations.trim()) return;
                        if (isAnchoringObfuscations) return;
                        setIsObfuscationsAnchorPopoverOpen(open);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="Anchor obfuscations to the activity ledger"
                          title="Anchor obfuscations to the activity ledger"
                          disabled={
                            isConfigLocked ||
                            !obfuscations.trim() ||
                            isAnchoringObfuscations
                          }
                          className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isAnchoringObfuscations ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Anchor className="h-4 w-4" />
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        sideOffset={6}
                        className="w-64 border-white/10 bg-neutral-950 p-3 text-neutral-100 shadow-xl"
                      >
                        <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
                          Name this anchor
                        </p>
                        <input
                          id="deposit-obfuscations-anchor-name"
                          type="text"
                          value={obfuscationsAnchorName}
                          onChange={(event) =>
                            setObfuscationsAnchorName(
                              event.target.value.slice(0, 80),
                            )
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void handleAnchorObfuscations();
                            }
                            if (event.key === "Escape") {
                              event.preventDefault();
                              setIsObfuscationsAnchorPopoverOpen(false);
                            }
                          }}
                          placeholder="Optional name"
                          maxLength={80}
                          autoFocus
                          aria-label="Obfuscations anchor name"
                          className="mt-2 h-9 w-full border border-white/10 bg-black/40 px-2.5 text-xs text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-emerald-300/35"
                        />
                        <p className="mt-1.5 text-[0.68rem] leading-4 text-neutral-500">
                          Shown as the label when reloading. Leave blank to use
                          the repository name.
                        </p>
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setIsObfuscationsAnchorPopoverOpen(false)
                            }
                            disabled={isAnchoringObfuscations}
                            className="border border-white/10 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-white/25 disabled:opacity-40"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void handleAnchorObfuscations();
                            }}
                            disabled={
                              !obfuscations.trim() || isAnchoringObfuscations
                            }
                            className="inline-flex items-center gap-1.5 border border-emerald-300/30 bg-emerald-300/12 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isAnchoringObfuscations ? (
                              <RefreshCw
                                className="h-3 w-3 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Anchor
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                            )}
                            Save anchor
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Sparkles
                      className="h-5 w-5 text-emerald-200"
                      aria-hidden="true"
                    />
                  </div>
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
                    readOnly={isConfigLocked}
                    disabled={isConfigLocked}
                    placeholder={DEPOSIT_OBFUSCATIONS_PLACEHOLDER}
                    className="mt-2 min-h-[8rem] w-full border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-neutral-100 outline-none transition focus:border-emerald-300/35 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                  {obfuscationsAnchorMessage ? (
                    <p className="mt-2 text-xs leading-5 text-neutral-400">
                      {obfuscationsAnchorMessage}
                    </p>
                  ) : null}
                </div>
                {/* File-tree pickers over the selected repository·branch·
                    commit. Forced Inclusion and Forced Exclusions are MUTUALLY
                    EXCLUSIVE — a path picked on one side is disabled on the
                    other. Concept-level withholding belongs to Obfuscations. */}
                <div className="mt-4 grid gap-4 tablet:grid-cols-2">
                  <div className="block">
                    <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
                      <DepositIncludePathsIcon />
                      <span>Forced Inclusion</span>
                      <span onClick={(event) => event.stopPropagation()}>
                        <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.forcedInclusions} triggerAriaLabel="More info about this field" />
                      </span>
                    </span>
                    <div className="mt-2">
                      <VCSFileTreePicker
                        aria-label="Forced Inclusion file tree"
                        provider={repositoryContext?.provider ?? "github"}
                        repositoryFullName={
                          repositoryContext?.selectedRepository?.fullName ?? null
                        }
                        treeRef={
                          repositoryContext?.selectedCommit ||
                          repositoryContext?.selectedBranch ||
                          null
                        }
                        selectedPaths={forcedInclusions}
                        onChange={setForcedInclusions}
                        conflictingPaths={forcedExclusions}
                        conflictLabel="Already a Forced Exclusion"
                        disabled={isConfigLocked}
                      />
                    </div>
                  </div>
                  <div className="block">
                    <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">
                      <DepositExcludePathsIcon />
                      <span>Forced Exclusions</span>
                      <span onClick={(event) => event.stopPropagation()}>
                        <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.forcedExclusions} triggerAriaLabel="More info about this field" />
                      </span>
                    </span>
                    <div className="mt-2">
                      <VCSFileTreePicker
                        aria-label="Forced Exclusions file tree"
                        provider={repositoryContext?.provider ?? "github"}
                        repositoryFullName={
                          repositoryContext?.selectedRepository?.fullName ?? null
                        }
                        treeRef={
                          repositoryContext?.selectedCommit ||
                          repositoryContext?.selectedBranch ||
                          null
                        }
                        selectedPaths={forcedExclusions}
                        onChange={setForcedExclusions}
                        conflictingPaths={forcedInclusions}
                        conflictLabel="Already a Forced Inclusion"
                        disabled={isConfigLocked}
                      />
                    </div>
                    <span className="mt-1 block text-xs leading-5 text-neutral-500">
                      Forced Exclusions never enter AssetPack knowledge
                      synthesis: they are removed from the source inventory
                      before measurement, and candidates that touch them are
                      dropped fail-closed. Concept-level withholding belongs in
                      Obfuscations above.
                    </span>
                  </div>
                </div>
                {isRunReviewLocked ? (
                  // Historical run detail freezes the configuration that
                  // produced that run. Compose (incl. post-failure re-edit)
                  // stays editable until the next synthesize.
                  <p
                    data-testid="deposit-obfuscations-run-loaded-note"
                    className="mt-4 text-xs leading-5 text-neutral-500"
                  >
                    Run configuration is locked for this pipeline detail.
                    Select Back on Deposit to start a new synthesis.
                  </p>
                ) : (
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
                      : "Synthesize AssetPack Options"}
                  </button>
                )}
              </section>
            </div>

            {synthesisRunId && isActivityLedgerDetail ? (
              <section
                className="min-w-0 overflow-hidden border border-white/10 bg-white/[0.035] px-4 py-4"
                aria-label="Activity ledger record"
                data-testid="deposit-activity-ledger-detail"
              >
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
                  Activity ledger
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  {selectedDetailRun?.contextSource ===
                  "deposit-obfuscations-anchor"
                    ? "Obfuscations anchor"
                    : selectedDetailRun?.contextSource ===
                        "terminal-repository-context-panel"
                      ? "Repository anchor"
                      : "Activity record"}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
                  This row is a saved configuration bookmark, not a pipeline
                  run. Pipeline telemetry (phases, agents, generations) only
                  appears for Asset Pack Synthesis executions. Use Load
                  anchor on a New deposit to apply this configuration, or Back
                  to return to the pipelines table.
                </p>
                {selectedDetailRun?.summary ? (
                  <p
                    className="mt-4 border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-neutral-200"
                    data-testid="deposit-activity-ledger-summary"
                  >
                    {selectedDetailRun.summary}
                  </p>
                ) : null}
                <p className="mt-3 font-mono text-[0.62rem] text-neutral-500">
                  {synthesisRunId}
                </p>
              </section>
            ) : null}

            {synthesisRunId && !isActivityLedgerDetail ? (
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
                    {synthesisRunning ? (
                      <button
                        type="button"
                        data-testid="deposit-cancel-synthesis"
                        aria-label="Cancel synthesis run"
                        disabled={isCancellingSynthesis}
                        onClick={() => {
                          void handleCancelSynthesis();
                        }}
                        className="border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-200/45 hover:bg-rose-300/18 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isCancellingSynthesis ? "Cancelling…" : "Cancel run"}
                      </button>
                    ) : null}
                    {synthesisStatus === "cancelled" ? (
                      <span
                        data-testid="deposit-synthesis-cancelled-badge"
                        className="border border-rose-300/25 bg-rose-300/10 px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-rose-100"
                      >
                        Cancelled
                      </span>
                    ) : null}
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
                        className={`mt-3 border px-3 py-2 text-xs leading-5 ${approved
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
                                  `iter ${verdict.iteration ?? "—"}: ${verdict.finalApproval === true
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
                        forcedInclusions,
                        forcedExclusions,
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
                    Source-Safe Proposals
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                    <span>AssetPack Options</span>
                    <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.options} />
                  </h2>
                </div>
                {/* <span className="border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-[0.62rem] uppercase tracking-[0.16em] text-emerald-100">
                  {depositRouteSession.synthesis.pipeline.replace(/([a-z])([A-Z])/g, "$1 $2")}
                </span> */}
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
                    ? ` · ${realSynthesis.synthesis.exclusionPosture.forcedExclusionCount} exclusions, ${realSynthesis.synthesis.exclusionPosture.excludedPathCount} paths withheld`
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
                      className={`grid min-w-0 gap-4 border px-4 py-4 ${reviewed
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
                            className="flex h-7 w-7 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-neutral-300 transition hover:border-emerald-300/35 hover:bg-emerald-300/10"
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
                                        className={`shrink-0 uppercase ${change.op === "create"
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
                                  {policyEvaluation.demand.state ===
                                  "unestimatable-demand" ? (
                                    <span className="text-amber-100/95">
                                      Unestimatable
                                    </span>
                                  ) : (
                                    policyEvaluation.demand.state
                                  )}
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
                                  {earningStatement.state ===
                                  "unestimatable-demand" ? (
                                    <span className="text-amber-100/95">
                                      Unestimatable
                                      {settledDemandEstimate?.rationale ? (
                                        <span className="mt-1 block text-[0.7rem] leading-5 text-neutral-400">
                                          {settledDemandEstimate.rationale}
                                        </span>
                                      ) : null}
                                    </span>
                                  ) : (
                                    <>
                                      {
                                        earningStatement
                                          .expectedCompensationRangeSats.low
                                      }
                                      -
                                      {
                                        earningStatement
                                          .expectedCompensationRangeSats.high
                                      }{" "}
                                      sats / {earningStatement.state}
                                    </>
                                  )}
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
                        {(() => {
                          // Prefer settled-Depository grounding over LLM-invented neediness.
                          const rationale =
                            option.neediness?.rationale ||
                            settledDemandEstimate?.rationale ||
                            "";
                          const unestimatable =
                            settledDemandEstimate?.estimatable === false ||
                            policyEvaluation?.demand.state ===
                              "unestimatable-demand" ||
                            rationale.startsWith("Unestimatable");
                          if (unestimatable) {
                            return (
                              <div className="min-w-0 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/85">
                                  Neediness · est. read demand
                                </dt>
                                <dd className="mt-1 text-sm text-amber-100/95">
                                  Unestimatable
                                </dd>
                                {rationale ? (
                                  <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
                                    {rationale}
                                  </dd>
                                ) : (
                                  <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
                                    Unestimatable: settled Depository AssetPack
                                    demand has not been measured for this option.
                                  </dd>
                                )}
                              </div>
                            );
                          }
                          // Settled-grounded display: prefer option neediness when
                          // already grounded; else fall back to corpus estimate.
                          const demand =
                            option.neediness?.demand ??
                            settledDemandEstimate?.demand ??
                            null;
                          const saturation =
                            option.neediness?.saturation ??
                            settledDemandEstimate?.saturation ??
                            null;
                          const volume =
                            option.neediness?.volume ??
                            settledDemandEstimate?.needinessVolume ??
                            (typeof demand === "number" &&
                            typeof saturation === "number"
                              ? demand * (0.5 + 0.5 * (1 - saturation))
                              : null);
                          if (
                            typeof volume !== "number" ||
                            typeof demand !== "number" ||
                            typeof saturation !== "number"
                          ) {
                            return (
                              <div className="min-w-0 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
                                <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/85">
                                  Neediness · est. read demand
                                </dt>
                                <dd className="mt-1 text-sm text-amber-100/95">
                                  Unestimatable
                                </dd>
                                <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
                                  Unestimatable: no settled Depository neediness
                                  signal for this AssetPack option.
                                </dd>
                              </div>
                            );
                          }
                          return (
                            <div className="min-w-0 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2">
                              <dt className="text-[0.58rem] uppercase tracking-[0.14em] text-amber-200/85">
                                Neediness · est. read demand
                              </dt>
                              <dd className="mt-1 text-sm text-neutral-100">
                                {(volume * 100).toFixed(0)}%
                                <span className="text-neutral-500">
                                  {" "}
                                  · demand {(demand * 100).toFixed(0)}% ·
                                  saturation {(saturation * 100).toFixed(0)}%
                                </span>
                              </dd>
                              {rationale || settledDemandEstimate?.rationale ? (
                                <dd className="mt-1 break-words text-[0.7rem] leading-5 text-neutral-400">
                                  {rationale || settledDemandEstimate?.rationale}
                                </dd>
                              ) : null}
                            </div>
                          );
                        })()}
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
                              className={`border px-4 py-3 text-sm font-medium transition ${selectedPackIds.includes(option.optionId)
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
                                  className="w-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none transition focus:border-amber-300/40"
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
                        : `${selectedPackIds.length} AssetPack${selectedPackIds.length === 1 ? "" : "s"
                        } selected for deposit.`}
                    </p>
                    <button
                      type="button"
                      data-testid="deposit-selected-packs"
                      disabled={selectedPackIds.length === 0}
                      onClick={() => {
                        void handleDepositSelected();
                      }}
                      className={`border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${confirmingBatchDeposit
                        ? "border-amber-300/45 bg-amber-300/15 text-amber-100 hover:border-amber-200/60 hover:bg-amber-300/20"
                        : "border-emerald-300/30 bg-emerald-300/14 text-emerald-100 hover:border-emerald-200/50 hover:bg-emerald-300/20"
                        }`}
                    >
                      {confirmingBatchDeposit
                        ? `Confirm deposit of ${selectedPackIds.length} AssetPack${selectedPackIds.length === 1 ? "" : "s"
                        }`
                        : selectedPackIds.length
                          ? `Deposit ${selectedPackIds.length} selected AssetPack${selectedPackIds.length === 1 ? "" : "s"
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
