'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { TransactionDataMode } from '@/components/bitcode/pipeline/bitcode-transaction-types';
import { useAuth } from '@/components/bitcode/auth/AuthProvider';
import { useUserData } from '@/hooks/useUserData';
import { fetchPipelineExecutionHistory } from '@/networking/api-client';
import { isAuxillariesMockMode } from '@/lib/mock-review-mode';
import { FEATURE_FLAGS } from '@/config/features';
import type { PipelineExecution } from '@/types/api';

import TerminalCommandDeck from './TerminalCommandDeck';
import TerminalClosureControlDeck from './TerminalClosureControlDeck';
import TerminalClosureNativeSections from './TerminalClosureNativeSections';
import TerminalCoreNativeSections from './TerminalCoreNativeSections';
import TerminalDepositComposer from './TerminalDepositComposer';
import TerminalExperienceFrame from './TerminalExperienceFrame';
import TerminalExternalInterfacingPanel from './TerminalExternalInterfacingPanel';
import TerminalFloatingDebugWidget from './TerminalFloatingDebugWidget';
import TerminalDepositReadWorkbench from './TerminalDepositReadWorkbench';
import TerminalLiveSummaryStrip from './TerminalLiveSummaryStrip';
import TerminalReadScenarioPanel from './TerminalReadScenarioPanel';
import TerminalPreservedShellSurface from './TerminalPreservedShellSurface';
import TerminalRepositoryContextPanel from './TerminalRepositoryContextPanel';
import TerminalSectionAtlas from './TerminalSectionAtlas';
import TerminalSurfaceSection from './TerminalSurfaceSection';
import TerminalSupplySelectionPanel from './TerminalSupplySelectionPanel';
import TerminalMvpMap from './TerminalMvpMap';
import TerminalOperationalHealthPanel from './TerminalOperationalHealthPanel';
import TerminalTransactionWorkspace from './TerminalTransactionWorkspace';
import TerminalWorkspaceRail from './TerminalWorkspaceRail';
import {
  buildTerminalExecutionHistoryRequest,
  mapExecutionHistoryRunToWorkspaceRun,
  readTerminalRouteError,
  type TerminalActivityRecordDraft,
  upsertWorkspaceRun,
} from './terminal-activity-history';
import { TERMINAL_SURFACE_COPY } from './terminal-workspace-copy';
import { TerminalShellBridgeProvider } from './terminal-shell-bridge';
import type { TerminalRepositoryContextState } from './terminal-repository-context';
import {
  readTerminalDebugEnabled,
  readTerminalConversationHandoffContext,
  readTerminalEnvironmentMode,
  readTerminalTransactionDetailSection,
  readTerminalTransactionFilters,
  readTerminalTransactionId,
  readTerminalTransactionPagination,
  writeTerminalTransactionDetailSection,
  writeTerminalDebugEnabled,
  writeTerminalEnvironmentMode,
  resetTerminalTransactionFilters,
  shouldRecoverTerminalTransactionRoute,
  writeTerminalTransactionFilters,
  writeTerminalTransactionId,
  writeTerminalTransactionPagination,
} from './terminal-transaction-query';
import { deriveTerminalTransactionReadiness } from './terminal-transaction-readiness-source';
import { resolveTerminalTransactionSource } from './terminal-transaction-source';
import type { WorkspaceRun } from './terminal-run-data';
import type { TerminalDepositedSourceRevision } from './terminal-deposit-read-workbench';
import { buildProtocolProjectedWorkspaceRun } from './terminal-protocol-projection';
import { buildTerminalHref, TERMINAL_ROUTE } from './terminal-routes';
import { readBitcodeDemonstrationShellSnapshot } from './demonstration-witness-runtime';

const ConversationsOverlay = dynamic(() => import('@/app/conversations/components/ConversationsOverlay'), {
  ssr: false,
  loading: () => null,
});

export default function TerminalPageClient() {
  const { user } = useAuth();
  const {
    data: userData,
    hasGitHubConnection,
    hasValidGitHubConnection = hasGitHubConnection,
    hasWalletConnection,
    hasStoredVerifiedWalletConnection = false,
    hasVerifiedWalletConnection,
    walletConnectionStatus,
    repositoryConnectionStatus,
  } = useUserData();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeSearchParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);
  const mockMode = isAuxillariesMockMode();
  const selectedTransactionId = useMemo(
    () => readTerminalTransactionId(routeSearchParams),
    [routeSearchParams],
  );
  const selectedTransactionDetailSection = useMemo(
    () => readTerminalTransactionDetailSection(routeSearchParams),
    [routeSearchParams],
  );
  const transactionFilters = useMemo(
    () => readTerminalTransactionFilters(routeSearchParams),
    [routeSearchParams],
  );
  const transactionPagination = useMemo(
    () => readTerminalTransactionPagination(routeSearchParams),
    [routeSearchParams],
  );
  const environmentMode = useMemo(
    () => readTerminalEnvironmentMode(routeSearchParams),
    [routeSearchParams],
  );
  const showDemonstrationSurfaces = mockMode || environmentMode === 'mock';
  const debugEnabled = useMemo(
    () => readTerminalDebugEnabled(routeSearchParams),
    [routeSearchParams],
  );
  const conversationHandoffContext = useMemo(
    () => readTerminalConversationHandoffContext(routeSearchParams),
    [routeSearchParams],
  );
  const [isConversationOverlayOpen, setIsConversationOverlayOpen] = useState(false);
  const [liveRuns, setLiveRuns] = useState<WorkspaceRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(!mockMode);
  const [runsLoadError, setRunsLoadError] = useState<string | null>(null);
  const [repositoryContext, setRepositoryContext] = useState<TerminalRepositoryContextState | null>(null);
  const [projectedProtocolRun, setProjectedProtocolRun] = useState<WorkspaceRun | null>(null);
  const conversationsEnabled = !FEATURE_FLAGS.DISABLE_CONVERSATIONS_ROUTE && FEATURE_FLAGS.CONVERSATIONS_WIDGET;

  const transactionSource = useMemo(
    () =>
      resolveTerminalTransactionSource({
        liveRuns,
        mockMode,
        mocksEnabled: showDemonstrationSurfaces,
        allowExplicitMockSelection: showDemonstrationSurfaces,
        selectedTransactionId,
        projectedRun: showDemonstrationSurfaces ? projectedProtocolRun : null,
      }),
    [liveRuns, mockMode, projectedProtocolRun, selectedTransactionId, showDemonstrationSurfaces],
  );
  const runs = transactionSource.runs;
  const transactionDataMode: TransactionDataMode = transactionSource.dataMode;
  const runsError = transactionDataMode === 'review-fallback' ? null : runsLoadError;
  const transactionReadiness = useMemo(
    () =>
      deriveTerminalTransactionReadiness({
        signedIn: Boolean(user),
        repositoryContext,
        repositoryConnectionStatus,
        hasRepositoryProviderAttachment: hasGitHubConnection,
        hasValidRepositoryProviderAttachment: hasValidGitHubConnection,
        hasWalletBinding: hasWalletConnection,
        hasVerifiedWalletBinding: hasVerifiedWalletConnection,
        hasStoredVerifiedWalletBinding: hasStoredVerifiedWalletConnection,
      }).readiness,
    [
      hasGitHubConnection,
      hasValidGitHubConnection,
      hasStoredVerifiedWalletConnection,
      hasVerifiedWalletConnection,
      hasWalletConnection,
      repositoryContext,
      repositoryConnectionStatus,
      user,
    ],
  );
  const preferredSignerAddress = useMemo(() => {
    const profile = userData?.profile as Record<string, unknown> | null | undefined;
    const profileAuthAddress = typeof profile?.auth_address === 'string' ? profile.auth_address.trim() : '';
    const profileWalletAddress = typeof profile?.wallet_address === 'string' ? profile.wallet_address.trim() : '';
    const walletAuthAddress = walletConnectionStatus?.metadata?.authAddress?.trim() || '';
    const walletAddress = walletConnectionStatus?.address?.trim() || '';
    return walletAuthAddress || walletAddress || profileAuthAddress || profileWalletAddress || null;
  }, [userData?.profile, walletConnectionStatus]);
  const preferredSignerLabel = walletConnectionStatus?.provider
    ? `${walletConnectionStatus.provider} wallet`
    : 'connected wallet';
  const replaceTerminalSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      if (typeof window !== 'undefined' && window.location.pathname !== TERMINAL_ROUTE) return;
      const nextQuery = nextParams.toString();
      router.replace(buildTerminalHref(nextQuery), { scroll: false });
    },
    [router],
  );
  const readCurrentTerminalSearchParams = useCallback(
    () =>
      typeof window !== 'undefined' && window.location.pathname === TERMINAL_ROUTE
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString()),
    [searchParams],
  );
  const replaceTerminalRoute = useCallback(
    (transactionId: string, detailSection = selectedTransactionDetailSection) => {
      const nextParams = writeTerminalTransactionDetailSection(
        writeTerminalTransactionId(readCurrentTerminalSearchParams(), transactionId),
        detailSection,
      );
      replaceTerminalSearchParams(nextParams);
    },
    [readCurrentTerminalSearchParams, replaceTerminalSearchParams, selectedTransactionDetailSection],
  );

  const refreshLiveRuns = useCallback(async () => {
    if (mockMode) {
      setLiveRuns([]);
      setIsLoadingRuns(false);
      setRunsLoadError(null);
      return [];
    }

    setIsLoadingRuns(true);
    setRunsLoadError(null);

    try {
      const history = await fetchPipelineExecutionHistory();
      const nextRuns = history.map(mapExecutionHistoryRunToWorkspaceRun);
      setLiveRuns(nextRuns);
      return nextRuns;
    } catch (error) {
      setLiveRuns([]);
      setRunsLoadError(error instanceof Error ? error.message : 'Unable to load recent runs.');
      return [];
    } finally {
      setIsLoadingRuns(false);
    }
  }, [mockMode]);

  useEffect(() => {
    void refreshLiveRuns();
  }, [refreshLiveRuns]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== TERMINAL_ROUTE) return;
    if (window.location.hash) return;

    const navigationEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navigationEntry?.type === 'back_forward') return;

    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  useEffect(() => {
    let disposed = false;

    if (!showDemonstrationSurfaces) {
      setProjectedProtocolRun(null);
      return () => {
        disposed = true;
      };
    }

    const refreshProjectedRun = async () => {
      try {
        const snapshot = await readBitcodeDemonstrationShellSnapshot();
        if (disposed) return;
        setProjectedProtocolRun(buildProtocolProjectedWorkspaceRun(snapshot, repositoryContext));
      } catch {
        if (!disposed) {
          setProjectedProtocolRun(null);
        }
      }
    };

    void refreshProjectedRun();
    const intervalId = window.setInterval(() => {
      void refreshProjectedRun();
    }, 1200);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
    };
  }, [repositoryContext, showDemonstrationSurfaces]);

  useEffect(() => {
    if (
      !shouldRecoverTerminalTransactionRoute({
        transactionIds: runs.map((run) => run.id),
        selectedTransactionId,
      })
    ) {
      return;
    }
    const nextParams = writeTerminalTransactionId(readCurrentTerminalSearchParams(), runs[0].id);
    replaceTerminalSearchParams(nextParams);
  }, [
    readCurrentTerminalSearchParams,
    replaceTerminalSearchParams,
    runs,
    searchParams,
    selectedTransactionId,
  ]);

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedTransactionId) || runs[0] || null,
    [runs, selectedTransactionId],
  );
  const depositedSourceRevision = useMemo<TerminalDepositedSourceRevision | null>(() => {
    if (showDemonstrationSurfaces) return null;
    const selectedRepository = repositoryContext?.selectedRepository || null;
    if (!selectedRepository) return null;
    const selectedBranch = repositoryContext?.selectedBranch || selectedRepository.defaultBranch || 'main';
    const matchingSubmission = runs.find(
      (run) =>
        run.contextSource === 'terminal-deposit-composer' &&
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
      hasWalletOrAttestationProof: Boolean(matchingSubmission.candidateAssetId),
      hasAssetMeasurementEvidence: Boolean(matchingSubmission.candidateAssetId),
      proofRoot: matchingSubmission.depositProofRoot || null,
      measurementRoot: matchingSubmission.depositMeasurementRoot || null,
      reconciliationReadbackRoot: matchingSubmission.depositReconciliationReadbackRoot || null,
      depositorySearchDocumentRoot: matchingSubmission.depositorySearchDocumentRoot || null,
      lexicalDocumentRoot: matchingSubmission.lexicalDocumentRoot || null,
      vectorDocumentRoot: matchingSubmission.vectorDocumentRoot || null,
      compensationPreviewRoot: matchingSubmission.compensationPreviewRoot || null,
      sourceToSharesPreviewRoot: matchingSubmission.sourceToSharesPreviewRoot || null,
      compensationState: matchingSubmission.compensationState || null,
      compensationAllocationMethod: matchingSubmission.compensationAllocationMethod || null,
      compensationPriceAsset: matchingSubmission.compensationPriceAsset || null,
      depositorWalletId: matchingSubmission.depositorWalletId || null,
      depositoryIndexState: matchingSubmission.depositoryIndexState || null,
    };
  }, [repositoryContext, runs, showDemonstrationSurfaces]);
  const admittedReadActivityId = useMemo(() => {
    if (showDemonstrationSurfaces) return null;
    const selectedRepository = repositoryContext?.selectedRepository || null;
    if (!selectedRepository) return null;
    const sourceBranch = depositedSourceRevision?.branch || repositoryContext?.selectedBranch || selectedRepository.defaultBranch || 'main';
    const sourceCommit = depositedSourceRevision?.commit || repositoryContext?.selectedCommit || null;
    const matchingRead = runs.find(
      (run) =>
        run.contextSource === 'terminal-deposit-read-workbench' &&
        run.contextWorkbench === 'read-admission' &&
        run.repository === selectedRepository.fullName &&
        run.branch === sourceBranch &&
        (!sourceCommit || run.sourceCommit === sourceCommit),
    );
    return matchingRead?.id || null;
  }, [depositedSourceRevision, repositoryContext, runs, showDemonstrationSurfaces]);

  const handleSelectTransaction = (transactionId: string) => {
    replaceTerminalRoute(transactionId);
  };

  const handleRecordActivity = useCallback(
    async (draft: TerminalActivityRecordDraft) => {
      if (mockMode) return null;

      const response = await fetch('/api/executions/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          await readTerminalRouteError(response, 'Unable to record Bitcode activity into the ledger.'),
        );
      }

      const payload = (await response.json()) as { execution?: PipelineExecution };
      if (!payload.execution) {
        throw new Error('Bitcode activity response did not include an execution row.');
      }

      const nextRun = mapExecutionHistoryRunToWorkspaceRun(payload.execution);
      setLiveRuns((currentRuns) => upsertWorkspaceRun(currentRuns, nextRun));
      if (draft.selectAfterRecord !== false) {
        replaceTerminalRoute(nextRun.id, draft.detailSection || 'activity');
      }
      void refreshLiveRuns();
      return nextRun;
    },
    [mockMode, refreshLiveRuns, replaceTerminalRoute, repositoryContext, selectedRun],
  );

  const handleTransactionFiltersChange = (nextFilters: typeof transactionFilters) => {
    const nextParams = writeTerminalTransactionPagination(
      writeTerminalTransactionFilters(readCurrentTerminalSearchParams(), nextFilters),
      { page: 1, pageSize: transactionPagination.pageSize },
    );
    replaceTerminalSearchParams(nextParams);
  };

  const handleTransactionFiltersReset = () => {
    const nextParams = writeTerminalTransactionPagination(
      resetTerminalTransactionFilters(readCurrentTerminalSearchParams()),
      { page: 1, pageSize: transactionPagination.pageSize },
    );
    replaceTerminalSearchParams(nextParams);
  };

  const handleTransactionPaginationChange = (nextPagination: typeof transactionPagination) => {
    const nextParams = writeTerminalTransactionPagination(readCurrentTerminalSearchParams(), nextPagination);
    replaceTerminalSearchParams(nextParams);
  };

  const handleTransactionDetailSectionChange = (detailSection: typeof selectedTransactionDetailSection) => {
    const nextParams = writeTerminalTransactionDetailSection(readCurrentTerminalSearchParams(), detailSection);
    replaceTerminalSearchParams(nextParams);
  };

  const handleEnvironmentModeChange = useCallback(
    (nextEnvironmentMode: ReturnType<typeof readTerminalEnvironmentMode>) => {
      replaceTerminalSearchParams(writeTerminalEnvironmentMode(readCurrentTerminalSearchParams(), nextEnvironmentMode));
    },
    [readCurrentTerminalSearchParams, replaceTerminalSearchParams],
  );

  const handleDebugEnabledChange = useCallback(
    (enabled: boolean) => {
      replaceTerminalSearchParams(writeTerminalDebugEnabled(readCurrentTerminalSearchParams(), enabled));
    },
    [readCurrentTerminalSearchParams, replaceTerminalSearchParams],
  );

  const handleRepositorySourceBranchChange = useCallback(
    (branch: string) => {
      const nextParams = readCurrentTerminalSearchParams();
      if (repositoryContext?.provider) nextParams.set('provider', repositoryContext.provider);
      if (repositoryContext?.selectedRepository?.fullName) {
        nextParams.set('repo', repositoryContext.selectedRepository.fullName);
      }
      nextParams.set('sourceBranch', branch);
      nextParams.delete('sourceCommit');
      nextParams.delete('branch');
      nextParams.delete('commit');
      replaceTerminalSearchParams(nextParams);
    },
    [readCurrentTerminalSearchParams, replaceTerminalSearchParams, repositoryContext],
  );

  const handleRepositorySourceCommitChange = useCallback(
    (commit: string) => {
      const nextParams = readCurrentTerminalSearchParams();
      if (repositoryContext?.provider) nextParams.set('provider', repositoryContext.provider);
      if (repositoryContext?.selectedRepository?.fullName) {
        nextParams.set('repo', repositoryContext.selectedRepository.fullName);
      }
      if (repositoryContext?.selectedBranch) nextParams.set('sourceBranch', repositoryContext.selectedBranch);
      nextParams.set('sourceCommit', commit);
      nextParams.delete('branch');
      nextParams.delete('commit');
      replaceTerminalSearchParams(nextParams);
    },
    [readCurrentTerminalSearchParams, replaceTerminalSearchParams, repositoryContext],
  );

  return (
    <>
      {conversationsEnabled ? (
        <ConversationsOverlay
          forceOpen={isConversationOverlayOpen}
          forceFullscreen={isConversationOverlayOpen}
          onCloseRequest={() => setIsConversationOverlayOpen(false)}
          showFloatingOrb={false}
        />
      ) : null}
      <TerminalShellBridgeProvider>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(73,203,146,0.16),transparent_26%),linear-gradient(180deg,#050915_0%,#02050d_100%)] text-neutral-100">
          <a
            href="#terminalTransactionWorkspace"
            className="sr-only fixed left-4 top-4 z-50 rounded-full border border-emerald-300/40 bg-[#06101d] px-4 py-2 text-sm font-medium text-emerald-50 shadow-xl focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
          >
            Skip to selected Terminal activity
          </a>
          <main
            id="terminalMain"
            data-testid="terminal-cockpit-root"
            aria-labelledby="terminalPageTitle"
            className="mx-auto flex w-full max-w-none flex-col gap-6 px-4 pb-24 pt-32 tablet:px-6 desktop:px-8"
          >
          <section
            aria-labelledby="terminalPageTitle"
            className="overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-[linear-gradient(135deg,rgba(7,14,26,0.96),rgba(4,9,18,0.92))] px-6 py-6 shadow-[0_30px_100px_rgba(0,0,0,0.38)]"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <p className="text-[0.72rem] uppercase tracking-[0.34em] text-emerald-300/80">Bitcode Terminal</p>
                <h1 id="terminalPageTitle" className="mt-3 text-3xl font-semibold tracking-tight text-white tablet:text-4xl">
                  Deposit, Read, and read recent Bitcode activity
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-300 tablet:text-base">
                  The Bitcode Terminal is where operators prepare Deposit and Read work, then read
                  the recent activity, AssetPack results, proofs, and closure history produced by
                  that work. Use Exchange for market-wide activity search and deeper activity records.
                </p>
              </div>
            </div>
          </section>

          <TerminalMvpMap />

          {conversationHandoffContext.present ? (
            <section
              aria-label="Conversation Terminal handoff context"
              className="rounded-2xl border border-sky-300/20 bg-sky-400/10 px-5 py-4 text-sm text-sky-50 shadow-[0_18px_70px_rgba(8,47,73,0.28)]"
            >
              <div className="flex flex-col gap-3 desktop:flex-row desktop:items-start desktop:justify-between">
                <div className="min-w-0 space-y-2">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-200/80">
                    Conversation handoff
                  </p>
                  <h2 className="text-lg font-semibold text-white">
                    {conversationHandoffContext.workflow
                      ? conversationHandoffContext.workflow.replace('_', ' ')
                      : 'Terminal context'}{' '}
                    prepared from Conversations
                  </h2>
                  <p className="max-w-4xl leading-6 text-sky-100/85">
                    {conversationHandoffContext.summary || 'No source-safe handoff summary was provided.'}
                  </p>
                </div>
                <dl className="grid shrink-0 gap-2 text-xs text-sky-100/80 tablet:grid-cols-2 desktop:min-w-[28rem]">
                  <div>
                    <dt className="uppercase tracking-[0.18em] text-sky-300/75">Policy</dt>
                    <dd className="font-medium text-sky-50">{conversationHandoffContext.policy || 'unknown'}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.18em] text-sky-300/75">Proof</dt>
                    <dd className="truncate font-mono text-[0.7rem] text-sky-50">
                      {conversationHandoffContext.proofRoot || 'missing'}
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.18em] text-sky-300/75">Repository</dt>
                    <dd className="truncate text-sky-50">{conversationHandoffContext.repositoryAnchor || 'not supplied'}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.18em] text-sky-300/75">Sources</dt>
                    <dd className="text-sky-50">{conversationHandoffContext.sourceSelectors.length || 0} selector refs</dd>
                  </div>
                </dl>
              </div>
            </section>
          ) : null}

          <TerminalOperationalHealthPanel />

          <div className="grid gap-6">
            <div className="min-w-0">
              <TerminalTransactionWorkspace
                runs={runs}
                selectedRun={selectedRun}
                routeSearchParams={routeSearchParams}
                isLoadingRuns={isLoadingRuns}
                runsError={runsError}
                transactionDataMode={transactionDataMode}
                onSelectTransaction={handleSelectTransaction}
                filters={transactionFilters}
                onFiltersChange={handleTransactionFiltersChange}
                onResetFilters={handleTransactionFiltersReset}
                pagination={transactionPagination}
                onPaginationChange={handleTransactionPaginationChange}
                detailSection={selectedTransactionDetailSection}
                onDetailSectionChange={handleTransactionDetailSectionChange}
                onRecordActivity={handleRecordActivity}
              />
            </div>
            <aside className="min-w-0" aria-label="Terminal support controls">
              <TerminalWorkspaceRail
                onOpenConversations={() => {
                  if (conversationsEnabled) setIsConversationOverlayOpen(true);
                }}
                conversationsEnabled={conversationsEnabled}
                runs={runs}
                isLoadingRuns={isLoadingRuns}
                runsError={runsError}
                selectedRun={selectedRun}
                transactionDataMode={transactionDataMode}
              />
            </aside>
          </div>

          <div className="grid gap-6">
            <div className="min-w-0">
              <TerminalSurfaceSection
                id="terminalFrameSurface"
                kicker={TERMINAL_SURFACE_COPY.frame.kicker}
                title={TERMINAL_SURFACE_COPY.frame.title}
                summary={TERMINAL_SURFACE_COPY.frame.summary}
              >
                <TerminalExperienceFrame
                  onOpenConversations={() => {
                    if (conversationsEnabled) setIsConversationOverlayOpen(true);
                  }}
                  conversationsEnabled={conversationsEnabled}
                />
                <div className="grid gap-6">
                  <div className="space-y-6">
                    <TerminalCommandDeck
                      onRecordActivity={handleRecordActivity}
                      repositoryAnchor={repositoryContext?.selectedRepository?.fullName || null}
                      repositoryProvider={repositoryContext?.provider || null}
                      transactionReadiness={transactionReadiness}
                      showDemonstrationControls={showDemonstrationSurfaces}
                    />
                    <TerminalLiveSummaryStrip
                      transactionReadiness={transactionReadiness}
                      repositoryContext={repositoryContext}
                      showDemonstrationSignals={showDemonstrationSurfaces}
                    />
                  </div>
                  <div className="space-y-6">
                    <TerminalExternalInterfacingPanel
                      environmentMode={environmentMode}
                      onRecordActivity={handleRecordActivity}
                    />
                    {showDemonstrationSurfaces ? <TerminalSectionAtlas /> : null}
                  </div>
                </div>
              </TerminalSurfaceSection>

              <TerminalSurfaceSection
                id="terminalSupplySurface"
                kicker={TERMINAL_SURFACE_COPY.supply.kicker}
                title={TERMINAL_SURFACE_COPY.supply.title}
                summary={TERMINAL_SURFACE_COPY.supply.summary}
                tone="emerald"
              >
                <div className="grid gap-6">
                  <div className="space-y-6">
                    <TerminalRepositoryContextPanel
                      preferredRepository={selectedRun?.repository || null}
                      onContextChange={setRepositoryContext}
                      onRecordActivity={handleRecordActivity}
                    />
                    <TerminalSupplySelectionPanel
                      repositoryContext={repositoryContext}
                      onRecordActivity={handleRecordActivity}
                    />
                    <TerminalDepositComposer
                      onRecordActivity={handleRecordActivity}
                      repositoryAnchor={repositoryContext?.selectedRepository?.fullName || null}
                      repositoryProvider={repositoryContext?.provider || null}
                      repositoryBranch={repositoryContext?.selectedBranch || null}
                      repositoryCommit={repositoryContext?.selectedCommit || null}
                      repositoryBranches={repositoryContext?.branches || []}
                      repositoryCommits={repositoryContext?.commits || []}
                      isLoadingRepositoryBranches={repositoryContext?.isLoadingBranches || false}
                      isLoadingRepositoryCommits={repositoryContext?.isLoadingCommits || false}
                      onRepositorySourceBranchChange={handleRepositorySourceBranchChange}
                      onRepositorySourceCommitChange={handleRepositorySourceCommitChange}
                      transactionReadiness={transactionReadiness}
                      showDemonstrationDraft={showDemonstrationSurfaces}
                      preferredSignerAddress={preferredSignerAddress}
                      preferredSignerLabel={preferredSignerLabel}
                      preferredSignerProvider={walletConnectionStatus?.provider || null}
                    />
                  </div>
                </div>
              </TerminalSurfaceSection>

              <TerminalSurfaceSection
                id="terminalNeedSurface"
                kicker={TERMINAL_SURFACE_COPY.read.kicker}
                title={TERMINAL_SURFACE_COPY.read.title}
                summary={TERMINAL_SURFACE_COPY.read.summary}
              >
                <div className="grid gap-6">
                  <div className="space-y-6">
                    <TerminalReadScenarioPanel
                      onRecordActivity={handleRecordActivity}
                      showDemonstrationScenarios={showDemonstrationSurfaces}
                    />
                    <TerminalDepositReadWorkbench
                      repositoryContext={repositoryContext}
                      depositedSourceRevision={depositedSourceRevision}
                      admittedReadActivityId={admittedReadActivityId}
                      routeReadingStage={conversationHandoffContext.readingStage}
                      onRecordActivity={handleRecordActivity}
                      onHarnessCompleted={refreshLiveRuns}
                      showDemonstrationWorkbench={showDemonstrationSurfaces}
                    />
                    <TerminalCoreNativeSections
                      repositoryContext={repositoryContext}
                      showDemonstrationPanels={showDemonstrationSurfaces}
                    />
                  </div>
                </div>
              </TerminalSurfaceSection>

              <TerminalSurfaceSection
                id="terminalClosureSurface"
                kicker={TERMINAL_SURFACE_COPY.closure.kicker}
                title={TERMINAL_SURFACE_COPY.closure.title}
                summary={TERMINAL_SURFACE_COPY.closure.summary}
              >
                <TerminalClosureControlDeck
                  onRecordActivity={handleRecordActivity}
                  transactionReadiness={transactionReadiness}
                  showDemonstrationControls={showDemonstrationSurfaces}
                />
                {showDemonstrationSurfaces ? (
                  <>
                    <TerminalClosureNativeSections />
                    <TerminalPreservedShellSurface />
                  </>
                ) : null}
              </TerminalSurfaceSection>
            </div>
          </div>
          </main>
        </div>
        {FEATURE_FLAGS.TERMINAL_DEBUG_WIDGET ? (
          <TerminalFloatingDebugWidget
            debugEnabled={debugEnabled}
            environmentMode={environmentMode}
            transactionDataMode={transactionDataMode}
            selectedTransactionId={selectedRun?.id || null}
            hasRepositoryAnchor={Boolean(repositoryContext?.selectedRepository)}
            hasVerifiedWalletBinding={hasVerifiedWalletConnection}
            onDebugEnabledChange={handleDebugEnabledChange}
            onEnvironmentModeChange={handleEnvironmentModeChange}
          />
        ) : null}
      </TerminalShellBridgeProvider>
    </>
  );
}
