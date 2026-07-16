"use client";

/**
 * Shared source selection (repository · branch · commit SHA package).
 *
 * Primary home remains deposits/; /reads reuses this control for master-detail
 * parity (same SHA element). Field columns live in DepositSourceFieldGrid;
 * VCS data is owned by use-deposit-source-vcs. Optional heading/description
 * props keep route-facing copy accurate without forking the control.
 */

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Anchor, Lock, RefreshCw } from "lucide-react";

import { SearchableSelect } from "@/components/bitcode/forms/SearchableSelect/SearchableSelect";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { TelemetryExplainerTrigger } from "@/components/bitcode/pipeline/TelemetryExplainerTrigger/TelemetryExplainerTrigger";
import {
  DEPOSIT_SECTION_EXPLAINERS,
  toRichHoverExplainer,
} from "@/components/deposits/models/deposit-explainers";
import AuxillariesOpenButton from "@/components/auxillaries/AuxillariesOpenButton/AuxillariesOpenButton";
import {
  buildProductRepositoryAnchorDraft,
  type ProductActivityRecordDraft,
} from "@/components/bitcode/pipeline/models/pipeline-activity-history";
import {
  DEPOSIT_COMMIT_LATEST_REF,
  getProviderLabel,
  normalizeRepositoryProvider,
  type RepositoryContextState,
} from "@/components/bitcode/pipeline/models/repository-context";
import type { DepositRepositoryAnchor } from "@/components/deposits/models/deposit-repository-anchor";
import { DepositSourceFieldGrid } from "@/components/deposits/DepositSourceFieldGrid/DepositSourceFieldGrid";
import { useDepositSourceVcs } from "./hooks/use-deposit-source-vcs";

export type { DepositRepositoryAnchor };

type DepositSourceSelectionProps = {
  preferredRepository?: string | null;
  onContextChange?: (context: RepositoryContextState) => void;
  onRecordActivity?: (draft: ProductActivityRecordDraft) => Promise<unknown>;
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
  /**
   * Route-facing copy overrides so /reads can reuse the same SHA source
   * package control without deposit-only wording (master-detail parity).
   */
  heading?: string;
  description?: string;
  descriptionLocked?: string;
  ariaLabel?: string;
};

export default function DepositSourceSelection({
  preferredRepository,
  onContextChange,
  onRecordActivity,
  routePath,
  buildRouteHref,
  repoEarningEstimateSats,
  repositoryAnchors = [],
  disabled = false,
  heading = "Select the repository you are depositing",
  description = "One connected repository, branch, and commit form the source package the rest of the Deposit reads.",
  descriptionLocked = "Source package that produced this run — locked while reviewing run detail.",
  ariaLabel = "Select deposit repository",
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

  const vcs = useDepositSourceVcs({
    provider,
    requestedRepository,
    preferredRepository,
    requestedBranch,
    requestedCommit,
  });
  const {
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
    refreshConnection,
    refreshBranches,
    refreshCommits,
    hardRefreshInventory,
  } = vcs;

  const [recordMessage, setRecordMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Publish the selection context to the deposit page.
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
        buildProductRepositoryAnchorDraft({
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
      aria-label={ariaLabel}
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
            <span>{heading}</span>
            <BitcodeInlineExplainer
              explainer={DEPOSIT_SECTION_EXPLAINERS.repository}
            />
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
            {disabled ? descriptionLocked : description}
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
                  const anchor = repositoryAnchors.find(
                    (entry) => entry.id === key,
                  );
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
            Saved {getProviderLabel(provider)} attachment found, but the live
            session needs to reconnect — Branch and Commit stay empty (and
            non-interactive) until then; the Repository list above is read from
            stored inventory only.
          </span>
          <AuxillariesOpenButton
            step="externals"
            label={`Reconnect ${getProviderLabel(provider)}`}
            className="shrink-0 border border-amber-300/24 bg-amber-400/12 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-amber-50 transition hover:border-amber-300/42 hover:bg-amber-400/18"
          />
        </div>
      ) : null}

      <DepositSourceFieldGrid
        disabled={disabled}
        provider={provider}
        connectionStatus={connectionStatus}
        connectionNeedsReconnect={connectionNeedsReconnect}
        repositories={repositories}
        branches={branches}
        commits={commits}
        defaultBranch={defaultBranch}
        selectedRepository={selectedRepository}
        selectedBranch={selectedBranch}
        selectedCommit={selectedCommit}
        isLatestCommitMode={isLatestCommitMode}
        headCommit={headCommit}
        isLoadingConnection={isLoadingConnection}
        isLoadingRepositories={isLoadingRepositories}
        isLoadingBranches={isLoadingBranches}
        isLoadingCommits={isLoadingCommits}
        updateSourceParams={updateSourceParams}
        onRefreshConnection={refreshConnection}
        onRefreshRepositories={hardRefreshInventory}
        onRefreshBranches={refreshBranches}
        onRefreshCommits={refreshCommits}
      />

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
