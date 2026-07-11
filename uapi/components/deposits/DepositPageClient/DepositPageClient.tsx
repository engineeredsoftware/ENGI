"use client";

/**
 * Deposit experience page client — composes source selection, option review,
 * pipeline execution, and deposit journal UI for /deposits.
 */


import {
  formatSats,
  readStringField,
  shortIdentifier,
} from "@/components/deposits/models/deposit-format";
import {
  buildDepositAuthorityRows,
  buildDepositSessionRows,
} from "@/components/deposits/models/deposit-route-rows";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDepositRouteParams } from "./hooks/use-deposit-route-params";
import { useDepositSynthesisActivity } from "./hooks/use-deposit-synthesis-activity";
import { DepositRouteStateAside } from "@/components/deposits/DepositRouteStateAside/DepositRouteStateAside";
import { DepositPipelinesMaster } from "@/components/deposits/DepositPipelinesMaster/DepositPipelinesMaster";
import { DepositSynthesisTelemetry } from "@/components/deposits/DepositSynthesisTelemetry/DepositSynthesisTelemetry";
import { DepositAssetPackOptions } from "@/components/deposits/DepositAssetPackOptions/DepositAssetPackOptions";
import { DepositObfuscationsPanel } from "@/components/deposits/DepositObfuscationsPanel/DepositObfuscationsPanel";
import { DepositActivityLedgerDetail } from "@/components/deposits/DepositActivityLedgerDetail/DepositActivityLedgerDetail";
import { Boxes } from "lucide-react";
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
              <DepositObfuscationsPanel
                isConfigLocked={isConfigLocked}
                obfuscations={obfuscations}
                onObfuscationsChange={setObfuscations}
                obfuscationsAnchors={obfuscationsAnchors}
                obfuscationsAnchorName={obfuscationsAnchorName}
                onObfuscationsAnchorNameChange={setObfuscationsAnchorName}
                isObfuscationsAnchorPopoverOpen={isObfuscationsAnchorPopoverOpen}
                onObfuscationsAnchorPopoverOpenChange={setIsObfuscationsAnchorPopoverOpen}
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
