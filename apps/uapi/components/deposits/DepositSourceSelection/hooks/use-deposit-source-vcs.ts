/**
 * VCS inventory loading for deposit source selection.
 *
 * Loads connection posture, repositories, branches, and commits with
 * soft-refresh identity so refresh buttons do not blank painted lists.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VCSBranch, VCSCommit, VCSRepository } from "@bitcode/vcs-generics-core";
import {
  deriveSelectedBranch,
  deriveSelectedCommit,
  deriveSelectedRepository,
  isLatestCommitRef,
  type TerminalRepositoryConnectionStatus,
  type TerminalRepositoryInventorySource,
} from "@/components/bitcode/pipeline/models/repository-context";
import {
  readJsonResponse,
  splitRepositoryFullName,
} from "@/components/deposits/models/deposit-source-helpers";

export function useDepositSourceVcs(input: {
  provider: string;
  requestedRepository: string | null;
  preferredRepository?: string | null;
  requestedBranch: string | null;
  requestedCommit: string | null;
}) {
  const {
    provider,
    requestedRepository,
    preferredRepository,
    requestedBranch,
    requestedCommit,
  } = input;

  const [connectionStatus, setConnectionStatus] =
    useState<TerminalRepositoryConnectionStatus | null>(null);
  const [inventorySource, setInventorySource] =
    useState<TerminalRepositoryInventorySource | null>(null);
  const [repositories, setRepositories] = useState<VCSRepository[]>([]);
  const [branches, setBranches] = useState<VCSBranch[]>([]);
  const [commits, setCommits] = useState<VCSCommit[]>([]);
  const [defaultBranch, setDefaultBranch] = useState<string | null>(null);
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);
  const [isLoadingConnection, setIsLoadingConnection] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceSelectionError, setSourceSelectionError] = useState<
    string | null
  >(null);
  const [connectionRefreshNonce, setConnectionRefreshNonce] = useState(0);
  const [repositoriesRefreshNonce, setRepositoriesRefreshNonce] = useState(0);
  const [branchesRefreshNonce, setBranchesRefreshNonce] = useState(0);
  const [commitsRefreshNonce, setCommitsRefreshNonce] = useState(0);
  const repositoriesIdentityRef = useRef<string>("");
  const branchesIdentityRef = useRef<string>("");
  const commitsIdentityRef = useRef<string>("");

  const selectedRepository = useMemo(
    () =>
      deriveSelectedRepository(
        repositories,
        requestedRepository,
        preferredRepository,
      ),
    [repositories, requestedRepository, preferredRepository],
  );
  const selectedBranch = useMemo(
    () =>
      deriveSelectedBranch(
        branches,
        requestedBranch,
        defaultBranch || selectedRepository?.defaultBranch,
      ),
    [branches, requestedBranch, defaultBranch, selectedRepository],
  );
  const isLatestCommitMode = isLatestCommitRef(requestedCommit);
  const selectedCommit = useMemo(
    () => deriveSelectedCommit(commits, requestedCommit),
    [commits, requestedCommit],
  );
  const headCommit = commits[0] || null;
  const connectionNeedsReconnect = Boolean(
    connectionStatus?.connected && !connectionStatus.valid,
  );

  useEffect(() => {
    let disposed = false;
    setError(null);
    setIsLoadingConnection(true);
    fetch(`/api/vcs/${provider}/connection`)
      .then(async (response) => {
        const payload = await readJsonResponse(response);
        if (!response.ok || !payload) {
          throw new Error("Unable to load repository connection posture.");
        }
        if (!disposed) {
          setConnectionStatus(payload as TerminalRepositoryConnectionStatus);
        }
      })
      .catch((nextError) => {
        if (disposed) return;
        setConnectionStatus(null);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load repository connection posture.",
        );
      })
      .finally(() => {
        if (!disposed) setIsLoadingConnection(false);
      });
    return () => {
      disposed = true;
    };
  }, [provider, connectionRefreshNonce]);

  useEffect(() => {
    let disposed = false;
    if (!connectionStatus?.connected) {
      setRepositories([]);
      setInventorySource(null);
      setBranches([]);
      setCommits([]);
      setDefaultBranch(null);
      repositoriesIdentityRef.current = "";
      return () => {
        disposed = true;
      };
    }
    const identity = `${provider}:repos:${connectionStatus.valid ? "valid" : "invalid"}`;
    const softRefresh = repositoriesIdentityRef.current === identity;
    repositoriesIdentityRef.current = identity;
    if (!softRefresh) {
      setRepositories([]);
    }
    setIsLoadingRepositories(true);
    setError(null);
    fetch(`/api/vcs/${provider}/repositories`)
      .then(async (response) => {
        const payload = await readJsonResponse(response);
        if (!response.ok || !payload) {
          throw new Error("Unable to load repository inventory.");
        }
        if (!disposed) {
          setRepositories(
            Array.isArray((payload as { repositories?: unknown }).repositories)
              ? ((payload as { repositories: VCSRepository[] }).repositories)
              : [],
          );
          setInventorySource(
            typeof (payload as { inventorySource?: unknown }).inventorySource ===
              "string"
              ? ((payload as { inventorySource: TerminalRepositoryInventorySource })
                  .inventorySource)
              : null,
          );
        }
      })
      .catch((nextError) => {
        if (disposed) return;
        if (!softRefresh) {
          setRepositories([]);
          setInventorySource(null);
        }
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load repository inventory.",
        );
      })
      .finally(() => {
        if (!disposed) setIsLoadingRepositories(false);
      });
    return () => {
      disposed = true;
    };
  }, [
    connectionStatus?.connected,
    connectionStatus?.valid,
    provider,
    repositoriesRefreshNonce,
  ]);

  useEffect(() => {
    let disposed = false;
    const coordinates = splitRepositoryFullName(selectedRepository?.fullName);
    setSourceSelectionError(null);
    if (
      !coordinates ||
      !connectionStatus?.connected ||
      !connectionStatus.valid
    ) {
      setBranches([]);
      setCommits([]);
      setDefaultBranch(selectedRepository?.defaultBranch || null);
      branchesIdentityRef.current = "";
      return () => {
        disposed = true;
      };
    }
    const identity = `${provider}:${coordinates.owner}/${coordinates.repo}:branches`;
    const softRefresh = branchesIdentityRef.current === identity;
    branchesIdentityRef.current = identity;
    if (!softRefresh) {
      setBranches([]);
      setCommits([]);
      setDefaultBranch(selectedRepository?.defaultBranch || null);
    }
    setIsLoadingBranches(true);
    fetch(
      `/api/vcs?resource=branches&provider=${encodeURIComponent(
        provider,
      )}&owner=${encodeURIComponent(coordinates.owner)}&repo=${encodeURIComponent(
        coordinates.repo,
      )}`,
    )
      .then(async (response) => {
        const payload = await readJsonResponse(response);
        if (!response.ok || !payload) {
          throw new Error("Unable to load repository branches.");
        }
        if (!disposed) {
          setBranches(
            Array.isArray((payload as { branches?: unknown }).branches)
              ? ((payload as { branches: VCSBranch[] }).branches)
              : [],
          );
          setDefaultBranch(
            typeof (payload as { defaultBranch?: unknown }).defaultBranch ===
              "string" &&
              String(
                (payload as { defaultBranch: string }).defaultBranch,
              ).trim()
              ? (payload as { defaultBranch: string }).defaultBranch
              : selectedRepository?.defaultBranch || null,
          );
        }
      })
      .catch((nextError) => {
        if (disposed) return;
        if (!softRefresh) {
          setBranches([]);
          setDefaultBranch(selectedRepository?.defaultBranch || null);
        }
        setSourceSelectionError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load repository branches.",
        );
      })
      .finally(() => {
        if (!disposed) setIsLoadingBranches(false);
      });
    return () => {
      disposed = true;
    };
  }, [
    branchesRefreshNonce,
    connectionStatus?.connected,
    connectionStatus?.valid,
    provider,
    selectedRepository,
  ]);

  useEffect(() => {
    let disposed = false;
    const coordinates = splitRepositoryFullName(selectedRepository?.fullName);
    setSourceSelectionError(null);
    if (
      !coordinates ||
      !selectedBranch ||
      !connectionStatus?.connected ||
      !connectionStatus.valid
    ) {
      setCommits([]);
      commitsIdentityRef.current = "";
      return () => {
        disposed = true;
      };
    }
    const identity = `${provider}:${coordinates.owner}/${coordinates.repo}@${selectedBranch}`;
    const softRefresh = commitsIdentityRef.current === identity;
    commitsIdentityRef.current = identity;
    if (!softRefresh) {
      setCommits([]);
    }
    setIsLoadingCommits(true);
    fetch(
      `/api/vcs?resource=commits&provider=${encodeURIComponent(
        provider,
      )}&owner=${encodeURIComponent(coordinates.owner)}&repo=${encodeURIComponent(
        coordinates.repo,
      )}&branch=${encodeURIComponent(selectedBranch)}`,
    )
      .then(async (response) => {
        const payload = await readJsonResponse(response);
        if (!response.ok || !payload) {
          throw new Error("Unable to load repository commits.");
        }
        if (!disposed) {
          setCommits(
            Array.isArray((payload as { commits?: unknown }).commits)
              ? ((payload as { commits: VCSCommit[] }).commits)
              : [],
          );
        }
      })
      .catch((nextError) => {
        if (disposed) return;
        if (!softRefresh) {
          setCommits([]);
        }
        setSourceSelectionError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load repository commits.",
        );
      })
      .finally(() => {
        if (!disposed) setIsLoadingCommits(false);
      });
    return () => {
      disposed = true;
    };
  }, [
    commitsRefreshNonce,
    connectionStatus?.connected,
    connectionStatus?.valid,
    provider,
    selectedBranch,
    selectedRepository,
  ]);

  return {
    connectionStatus,
    inventorySource,
    repositories,
    branches,
    commits,
    defaultBranch,
    selectedRepository,
    selectedBranch,
    selectedCommit,
    isLatestCommitMode,
    headCommit,
    connectionNeedsReconnect,
    isLoadingRepositories,
    isLoadingConnection,
    isLoadingBranches,
    isLoadingCommits,
    error,
    sourceSelectionError,
    refreshConnection: () => setConnectionRefreshNonce((n) => n + 1),
    refreshRepositories: () => setRepositoriesRefreshNonce((n) => n + 1),
    refreshBranches: () => setBranchesRefreshNonce((n) => n + 1),
    refreshCommits: () => setCommitsRefreshNonce((n) => n + 1),
    /** Hard-refresh inventory: clear soft-refresh identities for repos→branches→commits. */
    hardRefreshInventory: () => {
      repositoriesIdentityRef.current = "";
      branchesIdentityRef.current = "";
      commitsIdentityRef.current = "";
      setError(null);
      setSourceSelectionError(null);
      setRepositoriesRefreshNonce((n) => n + 1);
      setBranchesRefreshNonce((n) => n + 1);
      setCommitsRefreshNonce((n) => n + 1);
    },
  };
}
