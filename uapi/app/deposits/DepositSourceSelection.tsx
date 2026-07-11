"use client";

/**
 * Deposit-native source selection (north-star Sell step A).
 *
 * Replaces the shared /terminal panels (TerminalRepositoryContextPanel +
 * TerminalSupplySelectionPanel) on the deposit surface with ONE clean section:
 * repository + branch + commit selection, a full-repo earnings estimate, and a
 * single anchor icon. It reuses the shared VCS data layer (/api/vcs/*) and the
 * data-contract helpers, but carries no terminal-UI dependency.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Anchor, GitBranch, Lock, RefreshCw } from "lucide-react";
import type { VCSBranch, VCSCommit, VCSRepository } from "@bitcode/vcs-core";

import { VCSRepositorySelector } from "@/components/bitcode/vcs/VCSRepositorySelector";
import { SearchableSelect } from "@/components/bitcode/forms/SearchableSelect";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer";
import { TelemetryExplainerTrigger } from "@/components/bitcode/pipeline/TelemetryExplainerTrigger";
import {
  DEPOSIT_SECTION_EXPLAINERS,
  toRichHoverExplainer,
} from "@/app/deposits/deposit-explainers";
import AuxillariesOpenButton from "@/components/auxillaries/AuxillariesOpenButton";
import {
  buildTerminalRepositoryAnchorDraft,
  type TerminalActivityRecordDraft,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import {
  DEPOSIT_COMMIT_LATEST_REF,
  deriveSelectedBranch,
  deriveSelectedCommit,
  deriveSelectedRepository,
  getProviderLabel,
  isLatestCommitRef,
  normalizeRepositoryProvider,
  TERMINAL_REPOSITORY_PROVIDERS,
  type TerminalRepositoryConnectionStatus,
  type TerminalRepositoryContextState,
  type TerminalRepositoryInventorySource,
} from "@/components/bitcode/pipeline/models/repository-context";

/** A previously anchored repository·branch·commit, ready to reload. */
export interface DepositRepositoryAnchor {
  id: string;
  repositoryFullName: string;
  branch: string | null;
  commit: string | null;
}

type DepositSourceSelectionProps = {
  preferredRepository?: string | null;
  onContextChange?: (context: TerminalRepositoryContextState) => void;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  routePath: string;
  buildRouteHref: (params?: URLSearchParams | string | null) => string;
  /** Full-repo earnings estimate (sats) for the selected source, if available. */
  repoEarningEstimateSats?: number | null;
  /** V48-Gate3-F17: previously anchored repositories, newest first. */
  repositoryAnchors?: DepositRepositoryAnchor[];
  /**
   * When true (run detail / post-submit), freeze repository·branch·commit
   * selection — the configuration that produced the loaded run is read-only.
   */
  disabled?: boolean;
};

async function readJsonResponse(response: Response) {
  const contentType = response.headers?.get?.("content-type") || "";
  if (contentType && !contentType.includes("application/json")) return null;
  return response.json().catch(() => null);
}

function splitRepositoryFullName(fullName?: string | null) {
  const normalized = fullName?.trim();
  if (!normalized || !normalized.includes("/")) return null;
  const [owner, repo] = normalized.split("/", 2);
  if (!owner || !repo) return null;
  return { owner, repo };
}

/** Shared square refresh control for source-selection lists. */
function SourceListRefreshButton({
  ariaLabel,
  explainer,
  disabled,
  loading,
  onRefresh,
}: {
  ariaLabel: string;
  explainer: (typeof DEPOSIT_SECTION_EXPLAINERS)[keyof typeof DEPOSIT_SECTION_EXPLAINERS];
  disabled?: boolean;
  loading?: boolean;
  onRefresh: () => void;
}) {
  return (
    <TelemetryExplainerTrigger
      side="bottom"
      explainer={toRichHoverExplainer(explainer)}
    >
      <button
        type="button"
        aria-label={loading ? `Refreshing ${ariaLabel}` : ariaLabel}
        disabled={disabled || loading}
        onClick={onRefresh}
        className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RefreshCw
          className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
      </button>
    </TelemetryExplainerTrigger>
  );
}

export default function DepositSourceSelection({
  preferredRepository,
  onContextChange,
  onRecordActivity,
  routePath,
  buildRouteHref,
  repoEarningEstimateSats,
  repositoryAnchors = [],
  disabled = false,
}: DepositSourceSelectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedProvider = searchParams.get("provider");
  const requestedRepository = searchParams.get("repo");
  const requestedBranch =
    searchParams.get("sourceBranch") || searchParams.get("branch");
  const requestedCommit =
    searchParams.get("sourceCommit") || searchParams.get("commit");
  const provider = normalizeRepositoryProvider(requestedProvider);

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
  // Independent refresh nonces so each column can soft-refresh its own list.
  const [connectionRefreshNonce, setConnectionRefreshNonce] = useState(0);
  const [repositoriesRefreshNonce, setRepositoriesRefreshNonce] = useState(0);
  const [branchesRefreshNonce, setBranchesRefreshNonce] = useState(0);
  const [commitsRefreshNonce, setCommitsRefreshNonce] = useState(0);
  // Identities for soft-refresh (same package → keep painted list).
  const repositoriesIdentityRef = useRef<string>("");
  const branchesIdentityRef = useRef<string>("");
  const commitsIdentityRef = useRef<string>("");
  const [recordMessage, setRecordMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

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
  // Default is "Latest" (track branch head). Resolved SHA still flows to
  // synthesis via selectedCommit; the URL keeps the `latest` sentinel while
  // that mode is active so Refresh can re-resolve head.
  const isLatestCommitMode = isLatestCommitRef(requestedCommit);
  const selectedCommit = useMemo(
    () => deriveSelectedCommit(commits, requestedCommit),
    [commits, requestedCommit],
  );
  const headCommit = commits[0] || null;
  // Repositories list from stored inventory regardless of token validity
  // (below), but branches/commits require a LIVE, valid session — a stale
  // installation token (they expire ~hourly) leaves this true while a
  // repository is still selectable, which otherwise reads as "broken":
  // Branch/Commit silently stay empty and disabled with no explanation.
  const connectionNeedsReconnect = Boolean(
    connectionStatus?.connected && !connectionStatus.valid,
  );

  // Connection posture.
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

  // Repository inventory.
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
            Array.isArray(payload.repositories) ? payload.repositories : [],
          );
          setInventorySource(
            typeof payload.inventorySource === "string"
              ? (payload.inventorySource as TerminalRepositoryInventorySource)
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

  // Branches for the selected repository.
  useEffect(() => {
    let disposed = false;
    const coordinates = splitRepositoryFullName(selectedRepository?.fullName);
    setSourceSelectionError(null);
    if (!coordinates || !connectionStatus?.connected || !connectionStatus.valid) {
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
          setBranches(Array.isArray(payload.branches) ? payload.branches : []);
          setDefaultBranch(
            typeof payload.defaultBranch === "string" &&
              payload.defaultBranch.trim()
              ? payload.defaultBranch
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

  // Commits for the selected branch (also re-run by the refresh control).
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
    // Soft refresh (same branch, refresh button): keep the painted list so
    // Latest·sha does not flicker empty. Hard reload (repo/branch change): clear.
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
          setCommits(Array.isArray(payload.commits) ? payload.commits : []);
        }
      })
      .catch((nextError) => {
        if (disposed) return;
        // Only wipe the list on hard failure when we had no prior paint —
        // soft-refresh errors keep the last good list.
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

  // Publish the selection context to the deposit page (same contract as the
  // legacy panel, so downstream synthesis/admission read one source).
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
  }, [branches, commits, connectionStatus, defaultBranch, inventorySource, isLoadingBranches, isLoadingCommits, onContextChange, provider, repositories, selectedBranch, selectedCommit, selectedRepository, sourceSelectionError]);

  // Keep the route-owned source params (repo/sourceBranch/sourceCommit) in sync.
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (nextParams.get("provider") !== provider) {
      nextParams.set("provider", provider);
      changed = true;
    }
    if (selectedRepository) {
      if (nextParams.get("repo") !== selectedRepository.fullName) {
        nextParams.set("repo", selectedRepository.fullName);
        nextParams.delete("sourceBranch");
        nextParams.delete("sourceCommit");
        nextParams.delete("branch");
        nextParams.delete("commit");
        changed = true;
      }
    } else if (nextParams.has("repo")) {
      nextParams.delete("repo");
      changed = true;
    }
    if (selectedRepository && selectedBranch && !isLoadingBranches) {
      if (nextParams.get("sourceBranch") !== selectedBranch) {
        nextParams.set("sourceBranch", selectedBranch);
        nextParams.delete("branch");
        if (requestedBranch !== selectedBranch) {
          nextParams.delete("sourceCommit");
          nextParams.delete("commit");
        }
        changed = true;
      }
    }
    if (selectedRepository && selectedBranch && !isLoadingCommits) {
      // Keep the `latest` sentinel in the URL while tracking head — do NOT
      // rewrite it to the resolved SHA (that would pin the selection).
      if (isLatestCommitMode) {
        if (
          nextParams.get("sourceCommit") !== DEPOSIT_COMMIT_LATEST_REF ||
          nextParams.has("commit")
        ) {
          nextParams.set("sourceCommit", DEPOSIT_COMMIT_LATEST_REF);
          nextParams.delete("commit");
          changed = true;
        }
      } else if (selectedCommit) {
        if (nextParams.get("sourceCommit") !== selectedCommit) {
          nextParams.set("sourceCommit", selectedCommit);
          nextParams.delete("commit");
          changed = true;
        }
      }
    }
    if (!changed) return;
    if (typeof window !== "undefined" && window.location.pathname !== routePath)
      return;
    router.replace(buildRouteHref(nextParams), { scroll: false });
  }, [
    buildRouteHref,
    isLatestCommitMode,
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
  ]);

  const updateSourceParams = (mutate: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("provider", provider);
    mutate(nextParams);
    if (typeof window !== "undefined" && window.location.pathname !== routePath)
      return;
    router.replace(buildRouteHref(nextParams), { scroll: false });
  };

  const handleAnchorRepository = async () => {
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
      setRecordMessage("Repository anchored into the Bitcode activity ledger.");
    } catch (nextError) {
      setRecordMessage(
        nextError instanceof Error
          ? nextError.message
          : "Unable to anchor the repository.",
      );
    } finally {
      setIsRecording(false);
    }
  };

  const fullSourceReady = Boolean(
    selectedRepository && selectedBranch && selectedCommit,
  );

  return (
    <section
      className={`border border-white/10 bg-white/[0.035] px-4 py-4 ${
        disabled ? "opacity-80" : ""
      }`}
      aria-label="Select deposit repository"
      data-testid="deposit-source-selection"
      data-locked={disabled ? "true" : "false"}
      aria-disabled={disabled || undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200/80">
            Repository
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
            <span>Select the repository you are depositing</span>
            <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.repository} />
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
            {disabled
              ? "Source package that produced this run — locked while reviewing run detail."
              : "One connected repository, branch, and commit form the source package the rest of the Deposit reads."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {repositoryAnchors.length > 0 ? (
            <div className="w-48">
              <SearchableSelect
                aria-label="Load a previously anchored repository"
                items={repositoryAnchors.map((anchor) => ({
                  key: anchor.id,
                  label: anchor.repositoryFullName,
                  description: anchor.branch
                    ? `${anchor.branch}${
                        anchor.commit ? ` · ${anchor.commit.slice(0, 7)}` : ""
                      }`
                    : null,
                }))}
                value={null}
                disabled={disabled}
                onSelect={(key) => {
                  if (disabled) return;
                  const anchor = repositoryAnchors.find((entry) => entry.id === key);
                  if (!anchor) return;
                  updateSourceParams((params) => {
                    params.set("repo", anchor.repositoryFullName);
                    if (anchor.branch) params.set("sourceBranch", anchor.branch);
                    else params.delete("sourceBranch");
                    if (anchor.commit) params.set("sourceCommit", anchor.commit);
                    else params.delete("sourceCommit");
                    params.delete("branch");
                    params.delete("commit");
                  });
                }}
                // One-shot load-in (always placeholder) — no selection check.
                showSelectionIndicator={false}
                placeholder="Load anchor..."
                searchPlaceholder="Search anchors..."
                emptyMessage="No anchors yet."
                className="h-9"
              />
            </div>
          ) : null}
          <TelemetryExplainerTrigger
            side="bottom"
            explainer={toRichHoverExplainer(
              DEPOSIT_SECTION_EXPLAINERS.repositoryAnchor,
            )}
          >
            <button
              type="button"
              aria-label="Anchor repository to the activity ledger"
              disabled={disabled || !selectedRepository || isRecording}
              onClick={() => {
                void handleAnchorRepository();
              }}
              className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isRecording ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Anchor className="h-4 w-4" />
              )}
            </button>
          </TelemetryExplainerTrigger>
        </div>
      </div>

      {connectionNeedsReconnect ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-amber-300/24 bg-amber-400/10 px-3 py-2.5 text-sm text-amber-100">
          <span className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 shrink-0" />
            Saved {getProviderLabel(provider)} attachment found, but the live session
            needs to reconnect — Branch and Commit stay empty (and non-interactive)
            until then; the Repository list above is read from stored inventory only.
          </span>
          <AuxillariesOpenButton
            step="externals"
            label={`Reconnect ${getProviderLabel(provider)}`}
            className="shrink-0 border border-amber-300/24 bg-amber-400/12 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-50 transition hover:border-amber-300/42 hover:bg-amber-400/18"
          />
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-[minmax(0,180px)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            <span>Provider</span>
            <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.provider} triggerAriaLabel="More info about this field" />
          </span>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchableSelect
                aria-label="Repository provider"
                items={TERMINAL_REPOSITORY_PROVIDERS.map((option) => ({
                  key: option,
                  label: getProviderLabel(option),
                  description:
                    option === provider
                      ? isLoadingConnection
                        ? "Checking connection…"
                        : connectionStatus?.connected
                          ? "Connected"
                          : "Not connected"
                      : null,
                }))}
                value={provider}
                disabled={disabled}
                onSelect={(key) => {
                  if (disabled) return;
                  const nextProvider = key ?? "github";
                  updateSourceParams((params) => {
                    params.set("provider", nextProvider);
                    params.delete("repo");
                    params.delete("sourceBranch");
                    params.delete("sourceCommit");
                    params.delete("branch");
                    params.delete("commit");
                  });
                }}
                placeholder="Select provider..."
                searchPlaceholder="Search providers..."
                emptyMessage="No providers found."
                className="w-full"
              />
            </div>
            <SourceListRefreshButton
              ariaLabel="Refresh provider connection"
              explainer={DEPOSIT_SECTION_EXPLAINERS.refreshProviderConnection}
              disabled={disabled}
              loading={isLoadingConnection}
              onRefresh={() =>
                setConnectionRefreshNonce((nonce) => nonce + 1)
              }
            />
          </div>
          <p className="mt-1.5 truncate text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
            {isLoadingConnection
              ? "Refreshing…"
              : connectionStatus?.connected
                ? connectionStatus.valid
                  ? "Connected"
                  : "Reconnect required"
                : "Not connected"}
          </p>
        </div>
        <div>
          <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            <span>Repository</span>
            <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.repository} triggerAriaLabel="More info about this field" />
          </span>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <VCSRepositorySelector
                provider={provider}
                repositories={repositories}
                loading={isLoadingRepositories && repositories.length === 0}
                value={selectedRepository?.fullName}
                disabled={disabled}
                onSelect={(repository) => {
                  if (disabled) return;
                  updateSourceParams((params) => {
                    if (repository) {
                      params.set("repo", repository.fullName);
                    } else {
                      params.delete("repo");
                    }
                    params.delete("sourceBranch");
                    params.delete("sourceCommit");
                    params.delete("branch");
                    params.delete("commit");
                  });
                }}
                placeholder={
                  connectionStatus?.connected
                    ? "Select repository supply..."
                    : isLoadingConnection
                      ? "Checking provider connection..."
                      : "Connect a repository provider first..."
                }
                className="w-full"
              />
            </div>
            <SourceListRefreshButton
              ariaLabel="Refresh repository inventory"
              explainer={DEPOSIT_SECTION_EXPLAINERS.refreshRepositoryInventory}
              disabled={disabled || !connectionStatus?.connected}
              loading={isLoadingRepositories}
              onRefresh={() => {
                // Hard-refresh inventory next to the inventory select (resets
                // soft-refresh identities for repos → branches → commits).
                repositoriesIdentityRef.current = "";
                branchesIdentityRef.current = "";
                commitsIdentityRef.current = "";
                setError(null);
                setSourceSelectionError(null);
                setRepositoriesRefreshNonce((nonce) => nonce + 1);
                setBranchesRefreshNonce((nonce) => nonce + 1);
                setCommitsRefreshNonce((nonce) => nonce + 1);
              }}
            />
          </div>
          <p className="mt-1.5 truncate text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
            {isLoadingRepositories
              ? repositories.length > 0
                ? "Refreshing inventory…"
                : "Loading repositories…"
              : null}
          </p>
        </div>
        <div>
          <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-neutral-400">
            <GitBranch className="h-3.5 w-3.5" />
            <span>Branch</span>
            <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.branch} triggerAriaLabel="More info about this field" />
          </span>
          <div className="mt-2 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchableSelect
                aria-label="Repository source branch"
                value={selectedBranch || null}
                disabled={
                  disabled ||
                  !selectedRepository ||
                  connectionNeedsReconnect ||
                  (!isLoadingBranches && branches.length === 0)
                }
                loading={isLoadingBranches && branches.length === 0}
                loadingMessage="Loading branches…"
                placeholder="Select branch..."
                searchPlaceholder="Search branches..."
                emptyMessage="No branches loaded."
                items={branches.map((branch) => ({
                  key: branch.name,
                  label: branch.name,
                  badge:
                    branch.name ===
                    (defaultBranch || selectedRepository?.defaultBranch)
                      ? "default"
                      : null,
                }))}
                onSelect={(branchName) => {
                  if (disabled) return;
                  updateSourceParams((params) => {
                    if (selectedRepository)
                      params.set("repo", selectedRepository.fullName);
                    if (branchName) params.set("sourceBranch", branchName);
                    else params.delete("sourceBranch");
                    params.delete("sourceCommit");
                    params.delete("branch");
                    params.delete("commit");
                  });
                }}
                className="h-9 border-white/10 bg-[rgba(10,15,30,0.88)] px-3 text-sm text-white hover:bg-[rgba(10,15,30,0.88)] focus:border-emerald-400/40"
              />
            </div>
            <SourceListRefreshButton
              ariaLabel="Refresh branches list"
              explainer={DEPOSIT_SECTION_EXPLAINERS.refreshBranches}
              disabled={
                disabled || !selectedRepository || connectionNeedsReconnect
              }
              loading={isLoadingBranches}
              onRefresh={() => setBranchesRefreshNonce((nonce) => nonce + 1)}
            />
          </div>
          <p className="mt-1.5 truncate text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
            {isLoadingBranches
              ? branches.length > 0
                ? "Refreshing…"
                : "Loading branches…"
              : connectionNeedsReconnect
                ? "Reconnect required"
                : "Default when available"}
          </p>
        </div>

        <div>
          <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-neutral-400">
            <span>Commit / ref</span>
            <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.commit} triggerAriaLabel="More info about this field" />
          </span>
          <div className="mt-2 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchableSelect
                aria-label="Repository source commit"
                value={
                  selectedBranch
                    ? isLatestCommitMode
                      ? DEPOSIT_COMMIT_LATEST_REF
                      : selectedCommit || null
                    : null
                }
                disabled={
                  disabled ||
                  !selectedBranch ||
                  connectionNeedsReconnect ||
                  (!isLoadingCommits && commits.length === 0)
                }
                // Soft refresh keeps items painted — only show the loading
                // sheet when we have nothing to display yet.
                loading={isLoadingCommits && commits.length === 0}
                loadingMessage="Loading commits…"
                placeholder="Select commit..."
                searchPlaceholder="Search commits..."
                emptyMessage="No commits loaded."
                items={[
                  {
                    key: DEPOSIT_COMMIT_LATEST_REF,
                    // Trigger + list label both carry the short SHA so "Latest"
                    // is never opaque once head is resolved.
                    label: headCommit
                      ? `Latest · ${headCommit.sha.slice(0, 7)}`
                      : isLoadingCommits
                        ? "Latest · …"
                        : "Latest",
                    description: headCommit
                      ? isLoadingCommits
                        ? "Refreshing…"
                        : headCommit.message.split("\n")[0]?.trim() ||
                          "Branch head"
                      : isLoadingCommits
                        ? "Resolving branch head…"
                        : "Head of the selected branch",
                    badge: "default",
                    searchText: headCommit
                      ? `latest ${headCommit.sha} ${headCommit.message}`
                      : "latest head",
                  },
                  ...commits.map((commit) => ({
                    key: commit.sha,
                    label: commit.sha.slice(0, 7),
                    description:
                      commit.message.split("\n")[0]?.trim() || "Commit",
                    searchText: `${commit.sha} ${commit.message}`,
                  })),
                ]}
                onSelect={(commitKey) => {
                  if (disabled) return;
                  updateSourceParams((params) => {
                    if (selectedRepository)
                      params.set("repo", selectedRepository.fullName);
                    if (selectedBranch)
                      params.set("sourceBranch", selectedBranch);
                    if (!commitKey || commitKey === DEPOSIT_COMMIT_LATEST_REF) {
                      params.set("sourceCommit", DEPOSIT_COMMIT_LATEST_REF);
                    } else {
                      params.set("sourceCommit", commitKey);
                    }
                    params.delete("branch");
                    params.delete("commit");
                  });
                }}
                className="h-9 border-white/10 bg-[rgba(10,15,30,0.88)] px-3 text-sm text-white hover:bg-[rgba(10,15,30,0.88)] focus:border-emerald-400/40"
              />
            </div>
            <SourceListRefreshButton
              ariaLabel="Refresh commits list"
              explainer={DEPOSIT_SECTION_EXPLAINERS.refreshLatestCommit}
              disabled={disabled || !selectedBranch || connectionNeedsReconnect}
              loading={isLoadingCommits}
              onRefresh={() => setCommitsRefreshNonce((nonce) => nonce + 1)}
            />
          </div>
          <p className="mt-1.5 truncate text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
            {isLoadingCommits
              ? commits.length > 0
                ? "Refreshing…"
                : "Loading commits…"
              : connectionNeedsReconnect
                ? "Reconnect required"
                : isLatestCommitMode
                  ? "Tracks branch head"
                  : "Pinned SHA"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-white/8 bg-white/[0.025] px-3 py-2.5">
        <span className="flex items-center gap-2 text-sm text-neutral-300">
          {connectionStatus?.connected ? null : (
            <Lock className="h-3.5 w-3.5 text-neutral-500" />
          )}
          {selectedRepository
            ? `${selectedRepository.fullName}${
                selectedRepository.private ? " · private" : ""
              }`
            : "No repository selected"}
        </span>
        {typeof repoEarningEstimateSats === "number" ? (
          <span className="text-sm text-emerald-100/90">
            Full-repo earnings estimate ·{" "}
            {repoEarningEstimateSats.toLocaleString()} sats
          </span>
        ) : null}
      </div>

      {recordMessage ? (
        <p className="mt-3 text-xs leading-5 text-neutral-400">{recordMessage}</p>
      ) : null}
      {sourceSelectionError || error ? (
        <p className="mt-3 border border-amber-300/24 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-100">
          {sourceSelectionError || error}
        </p>
      ) : null}
      {!fullSourceReady && selectedRepository ? (
        <p className="mt-3 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-500">
          Resolving full source package (repository · branch · commit)…
        </p>
      ) : null}
    </section>
  );
}
