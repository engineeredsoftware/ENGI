
/**
 * Reads repository context VCS hook — connection, inventory, branches, commits,
 * URL sync, and repository-anchor recording for ReadsRepositoryContextPanel.
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { VCSBranch, VCSCommit, VCSRepository } from '@bitcode/vcs-core';
import {
  buildTerminalRepositoryAnchorDraft,
  type TerminalActivityRecordDraft,
} from '@/components/bitcode/pipeline/models/pipeline-activity-history';
import {
  type TerminalRepositoryConnectionStatus,
  type TerminalRepositoryInventorySource,
  type TerminalRepositoryContextState,
  deriveSelectedRepository,
  deriveSelectedBranch,
  deriveSelectedCommit,
  normalizeRepositoryProvider,
} from '@/components/bitcode/pipeline/models/repository-context';
import { buildPacksHref, PACKS_ROUTE } from '@/components/bitcode/routes/ProductRoutes/product-routes';

async function readJsonResponse(response: Response) {
  const contentType = response.headers?.get?.('content-type') || '';
  if (contentType && !contentType.includes('application/json')) {
    return null;
  }
  return response.json().catch(() => null);
}

export function splitRepositoryFullName(fullName?: string | null) {
  const normalizedFullName = fullName?.trim();
  if (!normalizedFullName || !normalizedFullName.includes('/')) return null;
  const [owner, repo] = normalizedFullName.split('/', 2);
  if (!owner || !repo) return null;
  return { owner, repo };
}

export function formatCommitOption(commit: VCSCommit) {
  const shortSha = commit.sha.slice(0, 7);
  const title = commit.message.split('\n')[0]?.trim() || 'Commit';
  return `${shortSha} - ${title}`;
}

export type UseReadsRepositoryVcsInput = {
  preferredRepository?: string | null;
  onContextChange?: (context: TerminalRepositoryContextState) => void;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  routePath?: string;
  buildRouteHref?: (params?: URLSearchParams | string | null) => string;
};

export function useReadsRepositoryVcs({
  preferredRepository,
  onContextChange,
  onRecordActivity,
  routePath = PACKS_ROUTE,
  buildRouteHref = buildPacksHref,
}: UseReadsRepositoryVcsInput) {
  const router = useRouter();
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

  return {
    router,
    searchParams,
    provider,
    connectionStatus,
    inventorySource,
    repositories,
    branches,
    commits,
    defaultBranch,
    isLoadingConnection,
    isLoadingRepositories,
    isLoadingBranches,
    isLoadingCommits,
    error,
    sourceSelectionError,
    recordMessage,
    isRecording,
    selectedRepository,
    selectedBranch,
    selectedCommit,
    routePath,
    buildRouteHref,
    refreshRepositoryContext,
    handleRecordRepositoryAnchor,
  };
}
