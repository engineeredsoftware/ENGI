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

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Anchor, GitBranch, Lock, RefreshCw } from "lucide-react";
import type { VCSBranch, VCSCommit, VCSRepository } from "@bitcode/vcs-core";

import { VCSRepositorySelector } from "@/components/base/bitcode/vcs/VCSRepositorySelector";
import { SearchableSelect } from "@/components/base/bitcode/forms/SearchableSelect";
import BitcodeInlineExplainer from "@/components/base/bitcode/execution/BitcodeInlineExplainer";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/app/deposits/deposit-explainers";
import {
  buildTerminalRepositoryAnchorDraft,
  type TerminalActivityRecordDraft,
} from "@/app/terminal/terminal-activity-history";
import {
  deriveSelectedBranch,
  deriveSelectedCommit,
  deriveSelectedRepository,
  getProviderLabel,
  normalizeRepositoryProvider,
  TERMINAL_REPOSITORY_PROVIDERS,
  type TerminalRepositoryConnectionStatus,
  type TerminalRepositoryContextState,
  type TerminalRepositoryInventorySource,
} from "@/app/terminal/terminal-repository-context";

type DepositSourceSelectionProps = {
  preferredRepository?: string | null;
  onContextChange?: (context: TerminalRepositoryContextState) => void;
  onRecordActivity?: (draft: TerminalActivityRecordDraft) => Promise<unknown>;
  routePath: string;
  buildRouteHref: (params?: URLSearchParams | string | null) => string;
  /** Full-repo earnings estimate (sats) for the selected source, if available. */
  repoEarningEstimateSats?: number | null;
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

export default function DepositSourceSelection({
  preferredRepository,
  onContextChange,
  onRecordActivity,
  routePath,
  buildRouteHref,
  repoEarningEstimateSats,
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
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceSelectionError, setSourceSelectionError] = useState<
    string | null
  >(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
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
  const selectedCommit = useMemo(
    () => deriveSelectedCommit(commits, requestedCommit),
    [commits, requestedCommit],
  );

  // Connection posture.
  useEffect(() => {
    let disposed = false;
    setError(null);
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
      });
    return () => {
      disposed = true;
    };
  }, [provider, refreshNonce]);

  // Repository inventory.
  useEffect(() => {
    let disposed = false;
    if (!connectionStatus?.connected) {
      setRepositories([]);
      setInventorySource(null);
      setBranches([]);
      setCommits([]);
      setDefaultBranch(null);
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
        setRepositories([]);
        setInventorySource(null);
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
  }, [connectionStatus?.connected, connectionStatus?.valid, provider, refreshNonce]);

  // Branches for the selected repository.
  useEffect(() => {
    let disposed = false;
    const coordinates = splitRepositoryFullName(selectedRepository?.fullName);
    setBranches([]);
    setCommits([]);
    setDefaultBranch(selectedRepository?.defaultBranch || null);
    setSourceSelectionError(null);
    if (!coordinates || !connectionStatus?.connected || !connectionStatus.valid) {
      return () => {
        disposed = true;
      };
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
        setBranches([]);
        setDefaultBranch(selectedRepository?.defaultBranch || null);
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
  }, [connectionStatus?.connected, connectionStatus?.valid, provider, refreshNonce, selectedRepository]);

  // Commits for the selected branch.
  useEffect(() => {
    let disposed = false;
    const coordinates = splitRepositoryFullName(selectedRepository?.fullName);
    setCommits([]);
    setSourceSelectionError(null);
    if (
      !coordinates ||
      !selectedBranch ||
      !connectionStatus?.connected ||
      !connectionStatus.valid
    ) {
      return () => {
        disposed = true;
      };
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
        setCommits([]);
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
  }, [connectionStatus?.connected, connectionStatus?.valid, provider, refreshNonce, selectedBranch, selectedRepository]);

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
    if (
      selectedRepository &&
      selectedBranch &&
      selectedCommit &&
      !isLoadingCommits
    ) {
      if (nextParams.get("sourceCommit") !== selectedCommit) {
        nextParams.set("sourceCommit", selectedCommit);
        nextParams.delete("commit");
        changed = true;
      }
    }
    if (!changed) return;
    if (typeof window !== "undefined" && window.location.pathname !== routePath)
      return;
    router.replace(buildRouteHref(nextParams), { scroll: false });
  }, [buildRouteHref, isLoadingBranches, isLoadingCommits, provider, requestedBranch, router, searchParams, selectedBranch, selectedCommit, selectedRepository, routePath]);

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
      className="border border-white/10 bg-white/[0.035] px-4 py-4"
      aria-label="Select deposit repository"
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
            One connected repository, branch, and commit form the source package
            the rest of the Deposit reads.
          </p>
        </div>
        <button
          type="button"
          aria-label="Anchor repository to the activity ledger"
          title="Anchor repository to the activity ledger"
          disabled={!selectedRepository || isRecording}
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
      </div>

      <div className="mt-3 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-[minmax(0,180px)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            <span>Provider</span>
            <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.provider} triggerAriaLabel="More info about this field" />
          </span>
          <div className="mt-1.5">
            <SearchableSelect
              aria-label="Repository provider"
              items={TERMINAL_REPOSITORY_PROVIDERS.map((option) => ({
                key: option,
                label: getProviderLabel(option),
                description:
                  option === provider
                    ? connectionStatus?.connected
                      ? "Connected"
                      : "Not connected"
                    : null,
              }))}
              value={provider}
              onSelect={(key) => {
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
        </div>
        <div>
          <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            <span>Repository</span>
            <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.repository} triggerAriaLabel="More info about this field" />
          </span>
          <div className="mt-1.5">
            <VCSRepositorySelector
              provider={provider}
              repositories={repositories}
              loading={isLoadingRepositories}
              value={selectedRepository?.fullName}
              onSelect={(repository) =>
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
                })
              }
              placeholder={
                connectionStatus?.connected
                  ? "Select repository supply..."
                  : "Connect a repository provider first..."
              }
              className="w-full"
            />
          </div>
        </div>
        <div>
          <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-neutral-400">
            <GitBranch className="h-3.5 w-3.5" />
            <span>Branch</span>
            <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.branch} triggerAriaLabel="More info about this field" />
          </span>
          <div className="mt-2">
            <SearchableSelect
              aria-label="Repository source branch"
              value={selectedBranch || null}
              disabled={!selectedRepository || isLoadingBranches || branches.length === 0}
              loading={isLoadingBranches}
              loadingMessage="Loading branches…"
              placeholder="Select branch..."
              searchPlaceholder="Search branches..."
              emptyMessage="No branches loaded."
              items={branches.map((branch) => ({
                key: branch.name,
                label: branch.name,
                badge:
                  branch.name === (defaultBranch || selectedRepository?.defaultBranch)
                    ? "default"
                    : null,
              }))}
              onSelect={(branchName) =>
                updateSourceParams((params) => {
                  if (selectedRepository)
                    params.set("repo", selectedRepository.fullName);
                  if (branchName) params.set("sourceBranch", branchName);
                  else params.delete("sourceBranch");
                  params.delete("sourceCommit");
                  params.delete("branch");
                  params.delete("commit");
                })
              }
              className="h-9 border-white/10 bg-[rgba(10,15,30,0.88)] px-3 text-sm text-white hover:bg-[rgba(10,15,30,0.88)] focus:border-emerald-400/40"
            />
          </div>
          <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
            {isLoadingBranches
              ? "Loading branches…"
              : "Default branch is selected when available"}
          </p>
        </div>

        <div>
          <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-neutral-400">
            <span>Commit / ref</span>
            <BitcodeInlineExplainer explainer={DEPOSIT_SECTION_EXPLAINERS.commit} triggerAriaLabel="More info about this field" />
          </span>
          <div className="mt-2">
            <SearchableSelect
              aria-label="Repository source commit"
              value={selectedCommit || null}
              disabled={!selectedBranch || isLoadingCommits || commits.length === 0}
              loading={isLoadingCommits}
              loadingMessage="Loading commits…"
              placeholder="Select commit..."
              searchPlaceholder="Search commits..."
              emptyMessage="No commits loaded."
              items={commits.map((commit) => ({
                key: commit.sha,
                label: commit.sha.slice(0, 7),
                description: commit.message.split("\n")[0]?.trim() || "Commit",
              }))}
              onSelect={(commitSha) =>
                updateSourceParams((params) => {
                  if (selectedRepository)
                    params.set("repo", selectedRepository.fullName);
                  if (selectedBranch) params.set("sourceBranch", selectedBranch);
                  if (commitSha) params.set("sourceCommit", commitSha);
                  else params.delete("sourceCommit");
                  params.delete("branch");
                  params.delete("commit");
                })
              }
              className="h-9 border-white/10 bg-[rgba(10,15,30,0.88)] px-3 text-sm text-white hover:bg-[rgba(10,15,30,0.88)] focus:border-emerald-400/40"
            />
          </div>
          <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-neutral-500">
            {isLoadingCommits
              ? "Loading commits…"
              : "Latest branch commit is selected when available"}
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

      <button
        type="button"
        aria-label="Refresh repository inventory"
        onClick={() => {
          setConnectionStatus(null);
          setRepositories([]);
          setBranches([]);
          setCommits([]);
          setDefaultBranch(null);
          setError(null);
          setSourceSelectionError(null);
          setRefreshNonce((value) => value + 1);
        }}
        className="mt-3 inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-neutral-500 transition hover:text-neutral-300"
      >
        <RefreshCw className="h-3 w-3" /> Refresh inventory
      </button>
    </section>
  );
}
