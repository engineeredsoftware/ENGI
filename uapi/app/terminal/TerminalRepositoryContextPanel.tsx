'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, CheckCircle2, FolderGit2, GitBranch, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import type { VCSBranch, VCSCommit, VCSRepository } from '@bitcode/vcs-core';

import BitcodeInlineExplainer from '@/components/bitcode/execution/BitcodeInlineExplainer';
import { VCSRepositorySelector } from '@/components/bitcode/vcs/VCSRepositorySelector';

import TerminalOpenAuxillariesButton from './TerminalOpenAuxillariesButton';
import TerminalWorkspaceCard from './TerminalWorkspaceCard';
import {
  buildTerminalRepositoryAnchorDraft,
  type TerminalActivityRecordDraft,
} from './terminal-activity-history';
import {
  TERMINAL_INLINE_EXPLAINERS,
  TERMINAL_WORKSPACE_EXPLAINERS,
} from './terminal-workspace-explainers';
import {
  TERMINAL_REPOSITORY_PROVIDERS,
  getRepositoryInventorySourceLabel,
  type TerminalRepositoryConnectionStatus,
  type TerminalRepositoryInventorySource,
  type TerminalRepositoryContextState,
  deriveSelectedRepository,
  deriveSelectedBranch,
  deriveSelectedCommit,
  getProviderLabel,
  normalizeRepositoryProvider,
} from './terminal-repository-context';
import { buildTerminalHref, TERMINAL_ROUTE } from './terminal-routes';
import { jumpToShellSection } from './terminal-shell-reading';

async function readJsonResponse(response: Response) {
  const contentType = response.headers?.get?.('content-type') || '';
  if (contentType && !contentType.includes('application/json')) {
    return null;
  }

  return response.json().catch(() => null);
}

function splitRepositoryFullName(fullName?: string | null) {
  const normalizedFullName = fullName?.trim();
  if (!normalizedFullName || !normalizedFullName.includes('/')) return null;
  const [owner, repo] = normalizedFullName.split('/', 2);
  if (!owner || !repo) return null;
  return { owner, repo };
}

function formatCommitOption(commit: VCSCommit) {
  const shortSha = commit.sha.slice(0, 7);
  const title = commit.message.split('\n')[0]?.trim() || 'Commit';
  return `${shortSha} - ${title}`;
}

interface TerminalRepositoryContextPanelProps {
  preferredRepository?: string | null;
  onContextChange?: (context: TerminalRepositoryContextState) => void;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  routePath?: string;
  buildRouteHref?: (params?: URLSearchParams | string | null) => string;
  // The deposit surface flattens A→B (repo selection flows straight into
  // describe/synthesize), so it hides this terminal step-advance button.
  showContinueToDeposit?: boolean;
}

export default function TerminalRepositoryContextPanel({
  preferredRepository,
  onContextChange,
  onRecordActivity,
  routePath = TERMINAL_ROUTE,
  buildRouteHref = buildTerminalHref,
  showContinueToDeposit = true,
}: TerminalRepositoryContextPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedProvider = searchParams.get('provider');
  const requestedRepository = searchParams.get('repo');
  const requestedBranch = searchParams.get('sourceBranch') || searchParams.get('branch');
  const requestedCommit = searchParams.get('sourceCommit') || searchParams.get('commit');
  const provider = normalizeRepositoryProvider(requestedProvider);

  const [connectionStatus, setConnectionStatus] = useState<TerminalRepositoryConnectionStatus | null>(null);
  const [inventorySource, setInventorySource] = useState<TerminalRepositoryInventorySource | null>(null);
  const [repositories, setRepositories] = useState<VCSRepository[]>([]);
  const [branches, setBranches] = useState<VCSBranch[]>([]);
  const [commits, setCommits] = useState<VCSCommit[]>([]);
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);
  const [isLoadingConnection, setIsLoadingConnection] = useState(true);
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceSelectionError, setSourceSelectionError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [recordMessage, setRecordMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const selectedRepository = useMemo(
    () => deriveSelectedRepository(repositories, requestedRepository, preferredRepository),
    [preferredRepository, repositories, requestedRepository],
  );
  const selectedBranch = useMemo(
    () => deriveSelectedBranch(branches, requestedBranch, defaultBranch || selectedRepository?.defaultBranch || null),
    [branches, defaultBranch, requestedBranch, selectedRepository?.defaultBranch],
  );
  const selectedCommit = useMemo(
    () => deriveSelectedCommit(commits, requestedCommit),
    [commits, requestedCommit],
  );

  useEffect(() => {
    let disposed = false;

    setIsLoadingConnection(true);
    setError(null);

    fetch(`/api/vcs/${provider}/connection`)
      .then(async (response) => {
        const payload = await readJsonResponse(response);
        if (!response.ok || !payload) {
          throw new Error('Unable to load repository connection posture.');
        }
        if (!disposed) {
          setConnectionStatus(payload as TerminalRepositoryConnectionStatus);
        }
      })
      .catch((nextError) => {
        if (disposed) return;
        setConnectionStatus(null);
        setError(nextError instanceof Error ? nextError.message : 'Unable to load repository connection posture.');
      })
      .finally(() => {
        if (!disposed) setIsLoadingConnection(false);
      });

    return () => {
      disposed = true;
    };
  }, [provider, refreshNonce]);

  useEffect(() => {
    let disposed = false;

    if (!connectionStatus?.connected) {
      setRepositories([]);
      setInventorySource(null);
      setBranches([]);
      setCommits([]);
      setDefaultBranch(null);
      setIsLoadingRepositories(false);
      setIsLoadingBranches(false);
      setIsLoadingCommits(false);
      return () => {
        disposed = true;
      };
    }

    setIsLoadingRepositories(true);
    setError(null);

    fetch(`/api/vcs/${provider}/repositories`)
      .then(async (response) => {
        const payload = await readJsonResponse(response);
        if (!response.ok || !payload) {
          throw new Error('Unable to load repository inventory.');
        }
        if (!disposed) {
          setRepositories(Array.isArray(payload.repositories) ? payload.repositories : []);
          setInventorySource(
            payload && typeof payload.inventorySource === 'string'
              ? (payload.inventorySource as TerminalRepositoryInventorySource)
              : null,
          );
        }
      })
      .catch((nextError) => {
        if (disposed) return;
        setRepositories([]);
        setInventorySource(null);
        setError(nextError instanceof Error ? nextError.message : 'Unable to load repository inventory.');
      })
      .finally(() => {
        if (!disposed) setIsLoadingRepositories(false);
      });

    return () => {
      disposed = true;
    };
  }, [connectionStatus?.connected, connectionStatus?.valid, provider, refreshNonce]);

  useEffect(() => {
    let disposed = false;
    const coordinates = splitRepositoryFullName(selectedRepository?.fullName);

    setBranches([]);
    setCommits([]);
    setDefaultBranch(selectedRepository?.defaultBranch || null);
    setSourceSelectionError(null);

    if (!coordinates || !connectionStatus?.connected || !connectionStatus.valid) {
      setIsLoadingBranches(false);
      setIsLoadingCommits(false);
      return () => {
        disposed = true;
      };
    }

    setIsLoadingBranches(true);

    fetch(
      `/api/vcs?resource=branches&provider=${encodeURIComponent(provider)}&owner=${encodeURIComponent(
        coordinates.owner,
      )}&repo=${encodeURIComponent(coordinates.repo)}`,
    )
      .then(async (response) => {
        const payload = await readJsonResponse(response);
        if (!response.ok || !payload) {
          throw new Error('Unable to load repository branches.');
        }
        if (!disposed) {
          setBranches(Array.isArray(payload.branches) ? payload.branches : []);
          setDefaultBranch(
            typeof payload.defaultBranch === 'string' && payload.defaultBranch.trim()
              ? payload.defaultBranch
              : selectedRepository?.defaultBranch || null,
          );
        }
      })
      .catch((nextError) => {
        if (disposed) return;
        setBranches([]);
        setDefaultBranch(selectedRepository?.defaultBranch || null);
        setSourceSelectionError(
          nextError instanceof Error ? nextError.message : 'Unable to load repository branches.',
        );
      })
      .finally(() => {
        if (!disposed) setIsLoadingBranches(false);
      });

    return () => {
      disposed = true;
    };
  }, [connectionStatus?.connected, connectionStatus?.valid, provider, refreshNonce, selectedRepository]);

  useEffect(() => {
    let disposed = false;
    const coordinates = splitRepositoryFullName(selectedRepository?.fullName);

    setCommits([]);
    setSourceSelectionError(null);

    if (!coordinates || !selectedBranch || !connectionStatus?.connected || !connectionStatus.valid) {
      setIsLoadingCommits(false);
      return () => {
        disposed = true;
      };
    }

    setIsLoadingCommits(true);

    fetch(
      `/api/vcs?resource=commits&provider=${encodeURIComponent(provider)}&owner=${encodeURIComponent(
        coordinates.owner,
      )}&repo=${encodeURIComponent(coordinates.repo)}&branch=${encodeURIComponent(selectedBranch)}`,
    )
      .then(async (response) => {
        const payload = await readJsonResponse(response);
        if (!response.ok || !payload) {
          throw new Error('Unable to load repository commits.');
        }
        if (!disposed) {
          setCommits(Array.isArray(payload.commits) ? payload.commits : []);
        }
      })
      .catch((nextError) => {
        if (disposed) return;
        setCommits([]);
        setSourceSelectionError(
          nextError instanceof Error ? nextError.message : 'Unable to load repository commits.',
        );
      })
      .finally(() => {
        if (!disposed) setIsLoadingCommits(false);
      });

    return () => {
      disposed = true;
    };
  }, [connectionStatus?.connected, connectionStatus?.valid, provider, refreshNonce, selectedBranch, selectedRepository]);

  useEffect(() => {
    onContextChange?.({
      provider,
      connectionStatus,
      inventorySource,
      repositories,
      selectedRepository,
      branches,
      commits,
      defaultBranch,
      selectedBranch,
      selectedCommit,
      isLoadingBranches,
      isLoadingCommits,
      sourceSelectionError,
    });
  }, [
    branches,
    commits,
    connectionStatus,
    defaultBranch,
    inventorySource,
    isLoadingBranches,
    isLoadingCommits,
    onContextChange,
    provider,
    repositories,
    selectedBranch,
    selectedCommit,
    selectedRepository,
    sourceSelectionError,
  ]);

  useEffect(() => {
    const hasRouteContext =
      typeof window !== 'undefined'
        ? window.location.pathname === routePath && window.location.search.length > 1
        : searchParams.toString().length > 0;
    if (!hasRouteContext) return;

    const nextParams =
      typeof window !== 'undefined' && window.location.pathname === routePath
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString());
    let changed = false;

    if (nextParams.get('provider') !== provider) {
      nextParams.set('provider', provider);
      changed = true;
    }

    if (selectedRepository) {
      if (nextParams.get('repo') !== selectedRepository.fullName) {
        nextParams.set('repo', selectedRepository.fullName);
        nextParams.delete('sourceBranch');
        nextParams.delete('sourceCommit');
        nextParams.delete('branch');
        nextParams.delete('commit');
        changed = true;
      }
    } else if (nextParams.has('repo')) {
      nextParams.delete('repo');
      nextParams.delete('sourceBranch');
      nextParams.delete('sourceCommit');
      nextParams.delete('branch');
      nextParams.delete('commit');
      changed = true;
    }

    if (selectedRepository && selectedBranch && !isLoadingBranches) {
      if (nextParams.get('sourceBranch') !== selectedBranch) {
        nextParams.set('sourceBranch', selectedBranch);
        nextParams.delete('branch');
        if (requestedBranch !== selectedBranch) {
          nextParams.delete('sourceCommit');
          nextParams.delete('commit');
        }
        changed = true;
      }
    } else if ((nextParams.has('sourceBranch') || nextParams.has('branch')) && !isLoadingBranches) {
      nextParams.delete('sourceBranch');
      nextParams.delete('branch');
      changed = true;
    }

    if (selectedRepository && selectedBranch && selectedCommit && !isLoadingCommits) {
      if (nextParams.get('sourceCommit') !== selectedCommit) {
        nextParams.set('sourceCommit', selectedCommit);
        nextParams.delete('commit');
        changed = true;
      }
    } else if ((nextParams.has('sourceCommit') || nextParams.has('commit')) && !isLoadingCommits) {
      nextParams.delete('sourceCommit');
      nextParams.delete('commit');
      changed = true;
    }

    if (!changed) return;
    if (typeof window !== 'undefined' && window.location.pathname !== routePath) return;
    router.replace(buildRouteHref(nextParams), { scroll: false });
  }, [
    isLoadingBranches,
    isLoadingCommits,
    provider,
    requestedBranch,
    router,
    searchParams,
    selectedBranch,
    selectedCommit,
    selectedRepository,
    routePath,
    buildRouteHref,
  ]);

  const refreshRepositoryContext = () => {
    setConnectionStatus(null);
    setInventorySource(null);
    setRepositories([]);
    setBranches([]);
    setCommits([]);
    setDefaultBranch(null);
    setError(null);
    setSourceSelectionError(null);
    setIsLoadingConnection(true);
    setIsLoadingRepositories(false);
    setIsLoadingBranches(false);
    setIsLoadingCommits(false);
    setRefreshNonce((value) => value + 1);
  };

  const handleRecordRepositoryAnchor = async () => {
    if (!selectedRepository || !onRecordActivity) return;

    setIsRecording(true);
    setRecordMessage(null);

    try {
      await onRecordActivity(
        buildTerminalRepositoryAnchorDraft({
          provider,
          connectionStatus,
          inventorySource,
          repositories,
          selectedRepository,
        }),
      );
      setRecordMessage('Repository anchor recorded into the Bitcode activity ledger.');
    } catch (nextError) {
      setRecordMessage(
        nextError instanceof Error ? nextError.message : 'Unable to record the repository anchor posture.',
      );
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <TerminalWorkspaceCard
      id="terminalRepositorySupply"
      kicker="Repository supply"
      title="Connect and select searchable supply"
      summary="Choose the GitHub repository that will anchor deposit-side supply before you move deeper into Deposit, Read, and closure."
      explainer={TERMINAL_WORKSPACE_EXPLAINERS.repositorySupply}
      tone="emerald"
    >
      {recordMessage ? (
        <div className="mb-4 rounded-[1.3rem] border border-white/8 bg-white/5 px-4 py-4 text-sm leading-6 text-neutral-200">
          {recordMessage}
        </div>
      ) : null}

      <div className="grid gap-3 text-xs uppercase tracking-[0.22em] text-neutral-400 tablet:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <p className="text-emerald-300/85">Main action</p>
          <p className="mt-2 text-neutral-200">deposit</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <p className="text-emerald-300/85">Boundary</p>
          <p className="mt-2 text-neutral-200">repository supply</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
            <div className="flex items-center gap-2">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">Provider and repository</p>
              <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.providerRepository} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {TERMINAL_REPOSITORY_PROVIDERS.map((option) => {
                const isActive = provider === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      const nextParams = new URLSearchParams(searchParams.toString());
                      nextParams.set('provider', option);
                      nextParams.delete('repo');
                      nextParams.delete('sourceBranch');
                      nextParams.delete('sourceCommit');
                      nextParams.delete('branch');
                      nextParams.delete('commit');
                      if (typeof window !== 'undefined' && window.location.pathname !== routePath) return;
                      router.replace(buildRouteHref(nextParams), { scroll: false });
                    }}
                    className={`rounded-full border px-3 py-2 text-[0.72rem] uppercase tracking-[0.18em] transition ${
                      isActive
                        ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-100'
                        : 'border-white/10 bg-white/5 text-neutral-200 hover:border-white/18 hover:bg-white/10'
                    }`}
                  >
                    {getProviderLabel(option)}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <VCSRepositorySelector
                provider={provider}
                repositories={repositories}
                loading={isLoadingRepositories}
                value={selectedRepository?.fullName}
                onSelect={(repository) => {
                  const nextParams = new URLSearchParams(searchParams.toString());
                  nextParams.set('provider', provider);
                  if (repository) {
                    nextParams.set('repo', repository.fullName);
                  } else {
                    nextParams.delete('repo');
                  }
                  nextParams.delete('sourceBranch');
                  nextParams.delete('sourceCommit');
                  nextParams.delete('branch');
                  nextParams.delete('commit');
                  if (typeof window !== 'undefined' && window.location.pathname !== routePath) return;
                  router.replace(buildRouteHref(nextParams), { scroll: false });
                }}
                placeholder={
                  connectionStatus?.connected
                    ? 'Select repository supply...'
                    : 'Connect a repository provider first...'
                }
                className="w-full"
              />

              <div className="flex flex-wrap items-center gap-3">
                {showContinueToDeposit ? (
                  <button
                    type="button"
                    // Depositing requires the full source package: repository,
                    // branch, and commit (defaults count once they resolve).
                    disabled={!selectedRepository || !selectedBranch || !selectedCommit}
                    onClick={() => jumpToShellSection('terminalSupplySelection')}
                    className="rounded-[1.2rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-neutral-500"
                  >
                    Continue to deposit
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={!selectedRepository || isRecording}
                  onClick={() => {
                    void handleRecordRepositoryAnchor();
                  }}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRecording ? 'Recording anchor…' : 'Record repository anchor'}
                </button>
                <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.repositoryAnchor} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <label className="rounded-[1.25rem] border border-white/8 bg-white/5 px-4 py-4">
                <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-neutral-400">
                  <span>Branch</span>
                  <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.sourceBranch} />
                </span>
                <select
                  aria-label="Repository source branch"
                  value={selectedBranch || ''}
                  disabled={!selectedRepository || isLoadingBranches || branches.length === 0}
                  onChange={(event) => {
                    const nextParams = new URLSearchParams(searchParams.toString());
                    nextParams.set('provider', provider);
                    if (selectedRepository) nextParams.set('repo', selectedRepository.fullName);
                    nextParams.set('sourceBranch', event.target.value);
                    nextParams.delete('sourceCommit');
                    nextParams.delete('branch');
                    nextParams.delete('commit');
                    if (typeof window !== 'undefined' && window.location.pathname !== routePath) return;
                    router.replace(buildRouteHref(nextParams), { scroll: false });
                  }}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {branches.length ? null : <option value="">No branches loaded</option>}
                  {branches.map((branch) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                      {branch.name === (defaultBranch || selectedRepository?.defaultBranch) ? ' · default' : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-500">
                  {isLoadingBranches ? 'Loading branches…' : 'Default branch is selected when available'}
                </p>
              </label>

              <label className="rounded-[1.25rem] border border-white/8 bg-white/5 px-4 py-4">
                <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-neutral-400">
                  <span>Commit / ref</span>
                  <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.sourceCommit} />
                </span>
                <select
                  aria-label="Repository source commit"
                  value={selectedCommit || ''}
                  disabled={!selectedBranch || isLoadingCommits || commits.length === 0}
                  onChange={(event) => {
                    const nextParams = new URLSearchParams(searchParams.toString());
                    nextParams.set('provider', provider);
                    if (selectedRepository) nextParams.set('repo', selectedRepository.fullName);
                    if (selectedBranch) nextParams.set('sourceBranch', selectedBranch);
                    nextParams.set('sourceCommit', event.target.value);
                    nextParams.delete('branch');
                    nextParams.delete('commit');
                    if (typeof window !== 'undefined' && window.location.pathname !== routePath) return;
                    router.replace(buildRouteHref(nextParams), { scroll: false });
                  }}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {commits.length ? null : <option value="">No commits loaded</option>}
                  {commits.map((commit) => (
                    <option key={commit.sha} value={commit.sha}>
                      {formatCommitOption(commit)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-500">
                  {isLoadingCommits ? 'Loading commits…' : 'Latest branch commit is selected when available'}
                </p>
              </label>
            </div>

            {sourceSelectionError ? (
              <p className="mt-4 rounded-[1.1rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {sourceSelectionError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-300/75">Connection posture</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{getProviderLabel(provider)}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-300">
                  contract
                </span>
              </div>

              {isLoadingConnection ? (
                <p className="mt-4 text-sm leading-6 text-neutral-400">Loading repository connection posture…</p>
              ) : connectionStatus?.connected && connectionStatus.valid ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-100">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected as {connectionStatus.username || connectionStatus.metadata?.account || 'linked account'}
                  </div>
                  <dl className="space-y-3 rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4 text-sm">
                    <div>
                      <dt className="text-neutral-500">Inventory count</dt>
                      <dd className="mt-1 text-neutral-100">{connectionStatus.metadata?.repositories ?? repositories.length}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Status</dt>
                      <dd className="mt-1 text-neutral-100">{connectionStatus.metadata?.status || 'connected'}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Mode</dt>
                      <dd className="mt-1 text-neutral-100">
                        {connectionStatus.metadata?.mock_mode ? 'mock review' : 'live connection'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Inventory source</dt>
                      <dd className="mt-1 text-neutral-100">
                        {getRepositoryInventorySourceLabel(inventorySource)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : connectionStatus?.connected ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-amber-100">
                    <RefreshCw className="h-4 w-4" />
                    Saved {getProviderLabel(provider)} attachment found, but the live provider session must reconnect.
                  </div>
                  <p className="text-sm leading-6 text-neutral-300">
                    Bitcode can keep rereading stored repository inventory from Exchange so repository supply stays
                    explicit inside the Terminal, but settlement-bearing writes remain fail-closed until Externals
                    restores a live {getProviderLabel(provider)} session.
                  </p>
                  <dl className="space-y-3 rounded-[1.2rem] border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm">
                    <div>
                      <dt className="text-amber-100/70">Inventory count</dt>
                      <dd className="mt-1 text-neutral-100">{connectionStatus.metadata?.repositories ?? repositories.length}</dd>
                    </div>
                    <div>
                      <dt className="text-amber-100/70">Status</dt>
                      <dd className="mt-1 text-neutral-100">{connectionStatus.metadata?.status || 'reconnect required'}</dd>
                    </div>
                    <div>
                      <dt className="text-amber-100/70">Write admission</dt>
                      <dd className="mt-1 text-neutral-100">Reconnect required before deposit, branch, or closure writes.</dd>
                    </div>
                    <div>
                      <dt className="text-amber-100/70">Inventory source</dt>
                      <dd className="mt-1 text-neutral-100">
                        {getRepositoryInventorySourceLabel(inventorySource)}
                      </dd>
                    </div>
                  </dl>
                  <TerminalOpenAuxillariesButton
                    step="externals"
                    label="Reconnect Externals to restore live write admission"
                    className="rounded-[1.2rem] border border-amber-300/24 bg-amber-400/12 px-4 py-3 text-sm font-medium text-amber-50 transition hover:border-amber-300/42 hover:bg-amber-400/18"
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-6 text-neutral-300">
                    No active {getProviderLabel(provider)} connection is available for repository supply in this Terminal
                    context.
                  </p>
                  <TerminalOpenAuxillariesButton
                    step="externals"
                    className="rounded-[1.2rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10"
                  />
                </div>
              )}
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-300/75">Supply context</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {selectedRepository ? selectedRepository.fullName : 'Awaiting repository selection'}
                  </h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-300">
                  deposit
                </span>
              </div>

              {selectedRepository ? (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-6 text-neutral-300">
                    The selected repository now anchors the deposit-side Terminal frame before live Bitcode deposit
                    surfaces below.
                  </p>
                  {connectionStatus?.connected && !connectionStatus.valid ? (
                    <p className="rounded-[1.1rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
                      Stored repository inventory remains readable from Exchange, but Bitcode will fail closed on
                      settlement-bearing writes until Externals reconnects the live {getProviderLabel(provider)} session.
                    </p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-4">
                      <p className="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500">Selected branch</p>
                      <p className="mt-2 flex items-center gap-2 text-base font-semibold text-white">
                        <GitBranch className="h-4 w-4 text-emerald-200" />
                        {selectedBranch || selectedRepository.defaultBranch || 'main'}
                      </p>
                    </div>
                    <div className="rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-4">
                      <p className="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500">Visibility</p>
                      <p className="mt-2 flex items-center gap-2 text-base font-semibold text-white">
                        {selectedRepository.private ? <Lock className="h-4 w-4 text-amber-200" /> : <ShieldCheck className="h-4 w-4 text-emerald-200" />}
                        {selectedRepository.private ? 'private' : 'public'}
                      </p>
                    </div>
                  </div>

                  <dl className="space-y-3 rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4 text-sm">
                    <div>
                      <dt className="text-neutral-500">Selected commit</dt>
                      <dd className="mt-1 break-all text-neutral-100">{selectedCommit || 'commit pending'}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Language</dt>
                      <dd className="mt-1 text-neutral-100">{selectedRepository.language || 'n/a'}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Owner</dt>
                      <dd className="mt-1 text-neutral-100">{selectedRepository.owner.username || selectedRepository.owner.id}</dd>
                    </div>
                    <div>
                      <dt className="text-neutral-500">Topics</dt>
                      <dd className="mt-1 text-neutral-100">
                        {selectedRepository.topics?.length ? selectedRepository.topics.join(', ') : 'no tagged topics'}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => jumpToShellSection('terminalDepositComposer')}
                      className="rounded-[1.2rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/15"
                    >
                      Open deposit draft
                    </button>
                    <button
                      type="button"
                      disabled={isRecording}
                      onClick={() => {
                        void handleRecordRepositoryAnchor();
                      }}
                      className="rounded-[1.2rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRecording ? 'Recording anchor…' : 'Record anchor'}
                    </button>
                    <a
                      href={selectedRepository.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-[1.2rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10"
                    >
                      Open repository
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-neutral-400">
                  Select a connected repository to make the current deposit-side supply boundary explicit.
                </p>
              )}
            </article>
          </div>
        </div>

        <div className="space-y-4">
          <article className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">Deposit-side guidance</p>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              Keep repository connection, repository selection, and deposit focus visible before you move deeper into
              supply, read, and closure.
            </p>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => jumpToShellSection('terminalSupplySelection')}
                className="rounded-[1.2rem] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/15"
              >
                Focus repo supply
              </button>
              <button
                type="button"
                // Reading measures the same full source package: repository,
                // branch, and commit must be resolved before continuing.
                disabled={!selectedRepository || !selectedBranch || !selectedCommit}
                onClick={() => jumpToShellSection('terminalReadScenarios')}
                className="rounded-[1.2rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue to Read
              </button>
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">Refresh posture</p>
              <button
                type="button"
                onClick={refreshRepositoryContext}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-200 transition hover:border-white/18 hover:bg-white/10"
                aria-label="Refresh repository context"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              Re-read the repository context if connection posture or inventory changed.
            </p>
            {error ? (
              <p className="mt-4 rounded-[1.1rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}
            <div className="mt-4 rounded-[1.2rem] border border-white/8 bg-white/5 px-4 py-4 text-sm text-neutral-300">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-emerald-200" />
                {repositories.length} repositories surfaced for {getProviderLabel(provider)}
              </div>
            </div>
          </article>
        </div>
      </div>
    </TerminalWorkspaceCard>
  );
}
