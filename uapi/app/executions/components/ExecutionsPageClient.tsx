"use client";
// Client component with the unified executions logic

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ExecutionsPageHeaderShippablePostprocess from '@/app/executions/components/ExecutionsPageHeaderShippablePostprocess';
import ShippablesDocPanel from '@/components/base/bitcode/execution/ShippablesDocPanel';
import ShippablesCardsPanel from '@/components/base/bitcode/execution/ShippablesCardsPanel';
import BitcodeExecutionStreamPanel from '@/components/base/bitcode/execution/BitcodeExecutionStreamPanel';
import { ErrorBox } from '@/components/base/bitcode/execution/error-box';
import { VCSSourceSelectors as RawVCSSourceSelectors } from '@/components/base/bitcode/vcs/VCSSourceSelectors';
import { UrlAttachments } from '@/components/base/bitcode/execution/url-attachments';
import { IntegrationsSelector, IntegrationItem } from '@/components/base/bitcode/execution/integrations-selector';
import { SelectedAttachments } from '@/components/base/bitcode/execution/selected-attachments';
import { OrbitalBackground } from '@/components/base/bitcode/execution/orbital-background';
import { buildAuxillariesRoutePath } from '@/app/auxillaries/components/auxillary-pane-meta';
import { useVCSData } from '@/hooks/useVCSData';
import { useVCSSelections } from '@/hooks/useVCSSelections';
import { VCSProviderType } from '@bitcode/vcs-core';
import { useExecutionState } from '@/hooks/useExecutionState';
import { usePersistedState } from '@/app/executions/hooks/usePersistedState';
import { DEFAULT_PROVIDER, DEFAULT_MODEL_API } from '@bitcode/models';
import '@/styles/animations.css';
import '@/styles/components.css';
import type { UrlEntry } from '@/types/api';
import { IssueSelector } from '@/components/base/bitcode/execution/issue-selector';
import { ExecutionsExecuteButton as ExecuteButton } from '@/app/executions/components/ExecutionsExecuteButton';
import { IterationSlider } from '@/components/base/bitcode/interactions/IterationSlider';
import FlipText from '@/components/base/bitcode/layout/sidebars/FlipText';
import { templates as defaultTemplates } from '@/config/templates';
import type { ShippableTemplates } from '@/types/templates';
import { useTemplatePreferences } from '@/hooks/useTemplatePreferences';
import { useShippableTemplates } from '@/hooks/useShippableTemplates';
import {
  getHeaderShippables,
  getHeaderWrittenAssets,
  mergeHeaderShippables,
  type HeaderAssetPackCompletion,
} from '@/app/executions/components/ExecutionsCompleteHeaderContent';

const VCSSourceSelectors = React.memo(RawVCSSourceSelectors);

const INSTRUCTION_TIMEOUT_BASE_SECONDS = 200;
const INSTRUCTION_TIMEOUT_MIN_SECONDS = 20;
const INSTRUCTION_TIMEOUT_DECAY_RATE = 3;
const INSTRUCTION_WAIT_THRESHOLD = 0.8; // Matches validation wait gate

const calculateInstructionTimeoutSeconds = (confidence: number): number => {
  if (confidence <= 0) return Number.POSITIVE_INFINITY;
  return INSTRUCTION_TIMEOUT_MIN_SECONDS +
    (INSTRUCTION_TIMEOUT_BASE_SECONDS - INSTRUCTION_TIMEOUT_MIN_SECONDS) * Math.exp(-INSTRUCTION_TIMEOUT_DECAY_RATE * confidence);
};

export function ExecutionsClient() {
  // Retained execution composer logic; Bitcode output nouns are shippables.
  const router = useRouter();
  const searchParams = useSearchParams();
  const runId = searchParams.get('runId');
  const { preferences, isLoading: isLoadingTemplatePrefs, error: templatePrefError, reload: reloadTemplatePrefs } = useTemplatePreferences();
  const { templates: dbTemplates } = useShippableTemplates();

  const templatesSource: ShippableTemplates = useMemo(() => ({
    pullRequests: [...defaultTemplates.pullRequests, ...(dbTemplates?.pullRequests ?? [])],
  }), [dbTemplates]);

  const mergedTemplates: ShippableTemplates = React.useMemo(() => {
    if (!preferences) return templatesSource;
    const filterByPrefs = (category: keyof ShippableTemplates, list: ShippableTemplates[keyof ShippableTemplates]) => {
      const prefIds = preferences.shippable_templates?.[category] ?? [];
      if (!prefIds.length) return list;
      return list.filter((t) => prefIds.includes(t.id));
    };
    return {
      pullRequests: filterByPrefs('pullRequests', templatesSource.pullRequests),
    };
  }, [preferences, templatesSource]);

  const [mcpConfigById, setMcpConfigById] = useState<Record<string, any>>({});
  const [selectedMcpId, setSelectedMcpId] = useState<string | null>(null);
  const handleMcpSelect = useCallback((mcpId: string, config?: Record<string, any>) => {
    setSelectedMcpId(mcpId);
    if (config) {
      setMcpConfigById(prev => ({ ...prev, [mcpId]: config }));
      try {
        localStorage.setItem(
          'bitcode-mcp-configs',
          JSON.stringify({ ...(JSON.parse(localStorage.getItem('bitcode-mcp-configs') || '{}')), [mcpId]: config }),
        );
      } catch {}
    }
  }, []);

  const { state: persistedState, updateDefinitionOfNeed: updatePersistedDefinitionOfNeed, updateModelSelection: updatePersistedModel, updateVCS: updatePersistedVCS } = usePersistedState();

  const {
    definitionOfRead,
    isProcessing,
    output,
    generationCount,
    outputDetails,
    executionProgress,
    latestIterationUpdate,
    currentGuide,
    isStreamingComplete,
    error: doError,
    completion,
    runId: activeRunId,
    latestWorkUpdate,
    iterationUpdates,
    setDefinitionOfNeed,
    submitAssetPackPipeline,
    appendInstructionToLog,
    resetState,
  } = useExecutionState();

  const [initialDefinitionOfNeed, setInitialDefinitionOfNeed] = useState(persistedState.definitionOfRead || definitionOfRead);
  useEffect(() => {
    if (persistedState.definitionOfRead && !definitionOfRead) {
      setDefinitionOfNeed(persistedState.definitionOfRead);
    }
  }, []);

  const handleSetDefinitionOfNeed = (value: string) => {
    setDefinitionOfNeed(value);
    setInitialDefinitionOfNeed(value);
    updatePersistedDefinitionOfNeed(value);
  };

  const [modelSelection, setModelSelection] = useState(persistedState.modelSelection || `${DEFAULT_PROVIDER}||${DEFAULT_MODEL_API}`);
  const handleSetModelSelection = (value: string) => {
    setModelSelection(value);
    updatePersistedModel(value);
  };

  const { provider, accounts: accountsRaw, repositories: repositoriesRaw, branches: branchesRaw, commits: commitsRaw, issuesAndPRs, files, defaultBranch, isLoadingAccounts, isLoadingRepos, isLoadingBranches, isLoadingCommits, isLoadingIssues, isLoadingFiles, error: vcsError, setProvider, loadAccounts, loadRepositories, loadBranches, loadCommits, loadIssuesAndPRs, loadFiles } = useVCSData();

  const [selectedProvider, setSelectedProvider] = useState<VCSProviderType | null>(persistedState.vcs.provider as VCSProviderType | null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(persistedState.vcs.account);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(persistedState.vcs.repo);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(persistedState.vcs.branch);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(persistedState.vcs.commit);
  const [selectedIssueOrPR, setSelectedIssueOrPR] = useState<string[]>(persistedState.vcs.issuesOrPRs);

  const handleProviderChange = useCallback((val: VCSProviderType | null) => {
    setSelectedProvider(val);
    setProvider(val);
    updatePersistedVCS({ provider: val });
    if (val) loadAccounts(val);
  }, [setProvider, loadAccounts, updatePersistedVCS]);

  const handleAccountChange = useCallback((val: string | null) => {
    setSelectedAccount(val);
    updatePersistedVCS({ account: val });
  }, [updatePersistedVCS]);

  const handleRepoChange = useCallback((val: string | null) => {
    setSelectedRepo(val);
    updatePersistedVCS({ repo: val });
  }, [updatePersistedVCS]);

  const handleBranchChange = useCallback((val: string | null) => {
    setSelectedBranch(val);
    updatePersistedVCS({ branch: val });
  }, [updatePersistedVCS]);

  const handleCommitChange = useCallback((val: string | null) => {
    setSelectedCommit(val);
    updatePersistedVCS({ commit: val });
  }, [updatePersistedVCS]);

  const selections = useVCSSelections({ provider: selectedProvider, account: selectedAccount, repo: selectedRepo, branch: selectedBranch });

  // Onboarding gate
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingAllowed, setOnboardingAllowed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auxillaries/data');
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.vcsConnections?.length > 0 && data.btdBalance > 0) setOnboardingAllowed(true);
        }
      } catch {}
      if (!cancelled) setOnboardingChecked(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Attachments and inputs, toggles, errors — unchanged
  const [attachedUrls, setAttachedUrls] = useState<UrlEntry[]>([]);
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<IntegrationItem[]>([]);
  const [iterationCount, setIterationCount] = useState<number>(3);
  const [showSourceEdu, setShowSourceEdu] = useState(false);
  const [showAttachmentsEdu, setShowAttachmentsEdu] = useState(false);
  const [showEnhanceEdu, setShowEnhanceEdu] = useState(false);
  const [showSaveTemplateEdu, setShowSaveTemplateEdu] = useState(false);
  const [showExecuteButtonEdu, setShowExecuteButtonEdu] = useState(false);
  const [showIterationsEdu, setShowIterationsEdu] = useState<boolean | 'minimize' | 'maximize' | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [processLogHasScrolled, setProcessLogHasScrolled] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const combinedError = uiError || doError || vcsError || templatePrefError;

  // Loaders
  useEffect(() => {
    if (selectedProvider && selectedAccount) {
      loadRepositories(selectedProvider, selectedAccount);
      setSelectedRepo(null); setSelectedBranch(null); setSelectedCommit(null); setSelectedIssueOrPR([]);
    }
  }, [selectedProvider, selectedAccount, loadRepositories]);

  useEffect(() => { if (selectedProvider && selectedAccount && selectedRepo) loadBranches(selectedProvider, selectedAccount, selectedRepo); }, [selectedProvider, selectedAccount, selectedRepo, loadBranches]);
  useEffect(() => { setSelectedIssueOrPR([]); if (selectedProvider && selectedAccount && selectedRepo) loadIssuesAndPRs(selectedProvider, selectedAccount, selectedRepo); }, [selectedProvider, selectedAccount, selectedRepo, loadIssuesAndPRs]);
  useEffect(() => { if (selectedProvider && selectedAccount && selectedRepo && selectedBranch) loadCommits(selectedProvider, selectedAccount, selectedRepo, selectedBranch); }, [selectedProvider, selectedAccount, selectedRepo, selectedBranch, loadCommits]);

  // URL update on run start
  useEffect(() => {
    if (activeRunId && !runId) {
      const params = new URLSearchParams();
      params.set('type', 'agentic-execution:asset-pack');
      params.set('runId', activeRunId);
      const newUrl = `/executions?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
    }
  }, [activeRunId, runId]);

  // History hydration and postprocessed fetch
  const [historyAssetPackCompletion, setHistoryAssetPackCompletion] = React.useState<HeaderAssetPackCompletion | null>(null);
  const [headerPostprocessed, setHeaderPostprocessed] = React.useState<any | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!runId) { setHistoryAssetPackCompletion(null); return; }
      try {
        const params = new URLSearchParams(); params.set('type', 'agentic-execution:asset-pack');
        const res = await fetch(`/api/executions/history/${runId}?${params.toString()}`);
        if (!res.ok) return; const data = await res.json(); const run = data?.run || {};
        const runOutput = (run as any)?.output || run?.output_data || null;
        const assetPackCompletion = runOutput?.asset_pack_completion || run?.asset_pack_completion || null;
        const guide = run?.guide || run?.guide || null;
        const gateHistory = (run?.metadata?.gateHistory || run?.metadata?.gate_history) ?? null;
        const enrichedAssetPackCompletion = assetPackCompletion
          ? {
              ...assetPackCompletion,
              processingStats: {
                ...(assetPackCompletion.processingStats || {}),
                guide: guide || (assetPackCompletion.processingStats as any)?.guide || null,
                ...(gateHistory ? { gateHistory } : {})
              }
            }
          : assetPackCompletion;
        if (!cancelled) setHistoryAssetPackCompletion(enrichedAssetPackCompletion as any);
        try { const ppRes = await fetch(`/api/executions/postprocessed?id=${encodeURIComponent(runId)}`); if (ppRes.ok) { const ppJson = await ppRes.json(); if (!cancelled) setHeaderPostprocessed(ppJson?.postprocessed || null); } else if (!cancelled) setHeaderPostprocessed(null); } catch { if (!cancelled) setHeaderPostprocessed(null); }
      } catch { if (!cancelled) setHistoryAssetPackCompletion(null); }
    })();
    return () => { cancelled = true; };
  }, [runId]);

  const liveProcessingStats = React.useMemo(() => {
    const iterationCandidate =
      latestIterationUpdate ??
      (iterationUpdates.length
        ? [...iterationUpdates].sort(
            (a: any, b: any) => (b?.iteration ?? 0) - (a?.iteration ?? 0)
          )[0]
        : null);

    const confidence =
      typeof iterationCandidate?.confidence === 'number'
        ? iterationCandidate.confidence
        : undefined;
    const iterationTimestamp =
      iterationCandidate?.timestamp ??
      latestWorkUpdate?.timestamp ??
      null;

    const timeoutSecondsRaw =
      typeof confidence === 'number'
        ? calculateInstructionTimeoutSeconds(confidence)
        : undefined;

    let timeRemainingSeconds: number | undefined;
    if (
      typeof timeoutSecondsRaw === 'number' &&
      Number.isFinite(timeoutSecondsRaw) &&
      iterationTimestamp
    ) {
      const elapsed =
        (Date.now() - new Date(iterationTimestamp).getTime()) / 1000;
      timeRemainingSeconds = Math.max(
        0,
        Math.round(timeoutSecondsRaw - elapsed)
      );
    }

    if (
      !currentGuide &&
      !executionProgress.phase &&
      !executionProgress.agent &&
      !iterationCandidate
    ) {
      return undefined;
    }

    return {
      guide: currentGuide ?? undefined,
      gate: currentGuide ?? undefined,
      phase: executionProgress.phase,
      agent: executionProgress.agent,
      iteration: iterationCandidate?.iteration,
      confidence,
      selfInstruction:
        iterationCandidate?.selfInstruction ?? iterationCandidate?.prose,
      suggestions: iterationCandidate?.suggestions,
      latestIterationTimestamp: iterationTimestamp,
      timeoutSeconds:
        typeof timeoutSecondsRaw === 'number' &&
        Number.isFinite(timeoutSecondsRaw)
          ? Math.round(timeoutSecondsRaw)
          : undefined,
      timeRemainingSeconds,
      awaitingInstruction:
        typeof confidence === 'number'
          ? confidence < INSTRUCTION_WAIT_THRESHOLD
          : undefined,
      runId: activeRunId ?? undefined,
    } as const;
  }, [
    activeRunId,
    currentGuide,
    executionProgress.agent,
    executionProgress.phase,
    iterationUpdates,
    latestIterationUpdate,
    latestWorkUpdate,
  ]);

  const writtenAssetsForPanels =
    getHeaderWrittenAssets(historyAssetPackCompletion) ||
    headerPostprocessed?.assetPackSynthesisArtifacts ||
    headerPostprocessed?.writtenAssets ||
    null;
  const deliveryMechanismForPanels =
    getHeaderShippables(historyAssetPackCompletion) ||
    headerPostprocessed?.shippables ||
    headerPostprocessed?.deliveryMechanism ||
    null;
  const shippablesForPanels = mergeHeaderShippables(
    writtenAssetsForPanels,
    deliveryMechanismForPanels,
  );
  const runLog = typeof output === 'string' ? output : '';
  const processLogOutputDetails = useMemo(() => {
    const map: Record<string, any> = {};
    runLog.split('\n').forEach((line) => {
      if (line.trim().length) {
        map[line] = map[line] || null;
      }
    });
    return map;
  }, [runLog]);

  const handleDismissError = useCallback(() => {
    setUiError(null);
    setEnhanceError(null);
  }, []);
  const combinedProcessingStats = React.useMemo(() => {
    const finalStats = historyAssetPackCompletion?.processingStats;
    if (!finalStats && !liveProcessingStats) return undefined;

    const merged = {
      ...(finalStats ?? {}),
      ...(liveProcessingStats ?? {}),
    } as HeaderAssetPackCompletion['processingStats'] & {
      gate?: string | null;
      phase?: string | null;
      agent?: string | null;
      iteration?: number | null;
      confidence?: number | null;
      selfInstruction?: string | null;
      suggestions?: string[] | undefined;
      latestIterationTimestamp?: string | null;
      timeoutSeconds?: number | undefined;
      timeRemainingSeconds?: number | undefined;
      awaitingInstruction?: boolean | undefined;
    };

    merged.guide =
      (liveProcessingStats?.guide as string | undefined | null) ??
      merged?.guide ??
      currentGuide ??
      null;
    if (merged.gate === undefined) {
      merged.gate = (liveProcessingStats?.gate as string | undefined | null) ?? merged.guide ?? null;
    }
    merged.runId =
      (liveProcessingStats as any)?.runId ??
      (merged as any).runId ??
      activeRunId ??
      undefined;

    return merged;
  }, [activeRunId, currentGuide, historyAssetPackCompletion, liveProcessingStats]);

  if (!onboardingChecked) return (<><div className="h-[calc(100vh-9rem)]" /><div className="fixed inset-x-0 top-36 bottom-0 skeleton-shine" /></>);
  if (!onboardingAllowed) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-5xl items-center px-4 py-16">
        <section className="w-full rounded-[2rem] border border-white/10 bg-[#06131b]/88 p-8 text-[#d6e7f2] shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#75d7ff]">
            Bitcode execution route
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl">
            The /executions path exposes Bitcode execution primitives, branch-artifact runs, and read measurement while the Bitcode Terminal converges the source-to-shares operator flow.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#9db6c8] md:text-base">
            This route is a live Bitcode surface for run, AssetPack, and pipeline inspection. Connect source
            context in Auxillaries to execute here, or continue in the Bitcode Terminal when you want the converged Bitcode
            Deposit, Read, and closure flow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push('/terminal')}
              className="inline-flex items-center rounded-full border border-[#7fd0ff]/30 bg-[#0c1e29] px-5 py-3 text-sm font-medium text-white transition hover:border-[#7fd0ff]/60 hover:bg-[#133244]"
            >
              Open Bitcode Terminal
            </button>
            <button
              type="button"
              onClick={() => router.push(buildAuxillariesRoutePath('externals'))}
              className="inline-flex items-center rounded-full border border-white/12 bg-transparent px-5 py-3 text-sm font-medium text-[#d6e7f2] transition hover:border-white/30 hover:bg-white/5"
            >
              Open Auxillaries
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Submit/cancel handlers for the Bitcode asset-pack pipeline.
  const onExecuteSubmit = async () => {
    try {
      const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
      const userTimezone = timeZone || 'UTC';
      const modelProvider = modelSelection.split('||')[0] || DEFAULT_PROVIDER;
      const modelId = modelSelection.split('||')[1] || DEFAULT_MODEL_API;
      const attachmentsPayload: { id: string; type: string; content: string }[] = [
        ...attachedUrls.map(u => ({ id: u.url, type: 'URL', content: u.url })),
        ...selectedFiles.map(f => ({ id: f.name, type: 'FILE', content: f.name })),
        ...selectedIssueOrPR.map(id => { const issue = issuesAndPRs.find(i => i.id === id); return { id, type: issue?.isPR ? 'PR' : 'ISSUE', content: issue?.url || id }; }),
        ...selectedIntegrations.map(i => ({ id: i.id, type: 'INTEGRATION', content: i.label || i.id }))
      ];
      const completionResult = await submitAssetPackPipeline(
        0,
        selectedAccount!,
        selectedRepo!,
        selectedBranch!,
        selectedCommit!,
        selectedIssueOrPR?.[0] || null,
        userHasScrolled,
        logContainerRef,
        userTimezone,
        modelProvider,
        modelId,
        attachmentsPayload,
        iterationCount,
        selectedFiles,
        { pipelineType: 'agentic-execution:asset-pack' }
      );
      if (process.env.NODE_ENV === 'development') console.debug('[Execution] onExecuteSubmit completed', { hasCompletion: Boolean(completionResult) });
    } catch (err) { if (process.env.NODE_ENV === 'development') console.error('[Execution] onExecuteSubmit error', err); setUiError((err as Error).message); }
  };

  const onCancelPipeline = async () => {
    if (!activeRunId) return;
    try {
      const res = await fetch(`/api/executions/${activeRunId}?type=agentic-execution:asset-pack`, { method: 'DELETE' });
      if (!res.ok) console.warn('Cancel failed');
    } catch (e) {
      console.error('Cancel error', e);
    }
  };

  const handleRetry = useCallback(() => {
    if (!isProcessing) {
      void onExecuteSubmit();
    }
  }, [isProcessing, onExecuteSubmit]);

  // Render
  return (
    <>
      <OrbitalBackground isProcessing={isProcessing} />
      <ExecutionsPageHeaderShippablePostprocess
          renderDocInsideHeader={false}
          renderCardsInsideHeader={false}
          onSelectShippableTemplateDefinitionOfNeed={handleSetDefinitionOfNeed}
          executionStatus={isProcessing ? 'executing' : (!isProcessing && (isStreamingComplete || (!!runId && !!historyAssetPackCompletion))) ? 'executed' : 'execute'}
          executionType={'agentic-execution:asset-pack'}
          postprocessed={headerPostprocessed || undefined}
          showSourceEdu={showSourceEdu}
          showAttachmentsEdu={showAttachmentsEdu}
          showEnhanceEdu={showEnhanceEdu}
          showSaveTemplateEdu={showSaveTemplateEdu}
          showExecuteButtonEdu={showExecuteButtonEdu}
          showIterationsEdu={showIterationsEdu ?? undefined}
          templates={mergedTemplates}
          onTemplateSelect={(templateId, templateCategory) => {
            const template = mergedTemplates[templateCategory].find((t) => t.id === templateId);
            if (template) {
              handleSetDefinitionOfNeed(template.text);
            }
          }}
          shippables={{
            pullRequest: deliveryMechanismForPanels?.pullRequest ?? null,
            fileChanges: writtenAssetsForPanels?.fileChanges ?? null,
            summary:
              writtenAssetsForPanels?.summary ||
              historyAssetPackCompletion?.summary ||
              deliveryMechanismForPanels?.summary ||
              undefined,
          }}
          processingStats={combinedProcessingStats}
          repoSnapshot={historyAssetPackCompletion?.repoSnapshot || undefined}
        />

      {/* AssetPack artifacts + execution log */}
      {shippablesForPanels && (
        <ShippablesDocPanel
          shippables={{
            pullRequest: shippablesForPanels.pullRequest ?? null,
            fileChanges: shippablesForPanels.fileChanges ?? null,
            summary: shippablesForPanels.summary ?? null,
          }}
          summaryOpen={summaryOpen}
          onToggleSummary={() => setSummaryOpen((prev) => !prev)}
        />
      )}

      {shippablesForPanels && (
        <ShippablesCardsPanel
          shippables={{
            pullRequest: shippablesForPanels.pullRequest ?? null,
          }}
        />
      )}

      <BitcodeExecutionStreamPanel
        ref={logContainerRef as any}
        isProcessing={isProcessing}
        executionState={executionProgress || {}}
        isStreamingComplete={isStreamingComplete}
        generationCount={generationCount}
        error={combinedError ? combinedError.toString() : null}
        runId={activeRunId || runId || undefined}
        output={runLog}
        outputDetails={processLogOutputDetails}
        onRetry={handleRetry}
        onDismissError={handleDismissError}
        userHasScrolled={processLogHasScrolled}
        setUserHasScrolled={setProcessLogHasScrolled}
        compact={false}
        latestWorkUpdate={latestWorkUpdate as any}
        iterationUpdates={(iterationUpdates as any[]) || []}
        onNavigateToExecution={(id) => router.push(`/executions?runId=${id}`)}
        workUpdatesClassName="mt-6 space-y-4"
      />

      {/* Action area */}
      <div className={`max-w-4xl mx-auto px-4 z-20 ${isProcessing ? 'mt-2 mb-4' : combinedError ? 'mt-2 mb-2' : 'mt-8 mb-14'}`}>
        {!false && (
          <div className="w-full flex justify-center mb-4">
            <IterationSlider
              value={iterationCount}
              onChange={setIterationCount}
              disabled={
                !selectedAccount ||
                !selectedRepo ||
                !selectedBranch ||
                !selectedCommit ||
                !definitionOfRead ||
                (definitionOfRead || '').trim() === ''
              }
              onEducationHover={(type) => {
                setShowSourceEdu(false); setShowAttachmentsEdu(false); setShowEnhanceEdu(false); setShowSaveTemplateEdu(false); setShowExecuteButtonEdu(false);
                if (type === 'iterations') setShowIterationsEdu(true);
                else if (type === 'minimize' || type === 'maximize') setShowIterationsEdu(type);
                else setShowIterationsEdu(null);
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-center space-x-8 z-10">
          <div className="relative z-20" onMouseEnter={() => { setShowExecuteButtonEdu(true); setShowSourceEdu(false); setShowAttachmentsEdu(false); setShowEnhanceEdu(false); setShowSaveTemplateEdu(false); }} onMouseLeave={() => setShowExecuteButtonEdu(false)}>
            <ExecuteButton
              isProcessing={isProcessing}
              onSubmit={onExecuteSubmit}
              onCancel={onCancelPipeline}
              labelNode={<FlipText text={'Execute'} />}
              processingLabelNode={<FlipText text={'Executing...'} />}
              disabled={
                !selectedAccount ||
                !selectedRepo ||
                !selectedBranch ||
                !selectedCommit ||
                !definitionOfRead ||
                (definitionOfRead || '').trim() === ''
              }
            />
          </div>
        </div>
        {combinedError && (
          <div className="max-w-4xl mx-auto mt-4">
            <ErrorBox
              error={combinedError.toString()}
              onRetry={handleRetry}
              onDismiss={handleDismissError}
            />
          </div>
        )}
      </div>
    </>
  );
}
