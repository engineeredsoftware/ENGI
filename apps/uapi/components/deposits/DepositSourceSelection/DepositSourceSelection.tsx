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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/Popover/Popover";
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
  const [repositoryAnchorName, setRepositoryAnchorName] = useState("");
  const [isRepositoryAnchorPopoverOpen, setIsRepositoryAnchorPopoverOpen] =
    useState(false);

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
  //
  // URL is source of truth for explicit choices (Load anchor, field pickers).
  // Only *fill* missing defaults from derived selection — never clobber an
  // explicit sourceBranch/sourceCommit with a fallback (that race left repo
  // correct after Load anchor but rewound branch to default + cleared commit).
  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    let changed = false;
    if (nextParams.get("provider") !== provider) {
      nextParams.set("provider", provider);
      changed = true;
    }

    const urlRepo = nextParams.get("repo");
    if (selectedRepository) {
      if (!urlRepo) {
        // Auto-selected first inventory row with no explicit URL — publish it.
        nextParams.set("repo", selectedRepository.fullName);
        changed = true;
      }
      // When URL already names a repo, do not rewrite it to a different
      // selectedRepository (inventory still catching up after Load anchor) and
      // do not strip branch/commit.
    }

    if (selectedRepository && selectedBranch && !isLoadingBranches) {
      const urlBranch =
        nextParams.get("sourceBranch") || nextParams.get("branch");
      if (!urlBranch) {
        nextParams.set("sourceBranch", selectedBranch);
        nextParams.delete("branch");
        changed = true;
      } else if (!nextParams.get("sourceBranch") && nextParams.get("branch")) {
        nextParams.set("sourceBranch", urlBranch);
        nextParams.delete("branch");
        changed = true;
      }
      // Explicit URL branch (incl. Load-anchor) is never overwritten by a
      // derived default such as the repository default branch.
    }

    if (selectedRepository && selectedBranch && !isLoadingCommits) {
      const urlCommit =
        nextParams.get("sourceCommit") || nextParams.get("commit");
      if (!urlCommit) {
        // Nothing pinned yet — track branch head.
        nextParams.set("sourceCommit", DEPOSIT_COMMIT_LATEST_REF);
        nextParams.delete("commit");
        changed = true;
      } else if (!nextParams.get("sourceCommit") && nextParams.get("commit")) {
        nextParams.set("sourceCommit", urlCommit);
        nextParams.delete("commit");
        changed = true;
      } else if (isLatestCommitMode) {
        if (
          nextParams.get("sourceCommit") !== DEPOSIT_COMMIT_LATEST_REF ||
          nextParams.has("commit")
        ) {
          nextParams.set("sourceCommit", DEPOSIT_COMMIT_LATEST_REF);
          nextParams.delete("commit");
          changed = true;
        }
      } else if (selectedCommit) {
        const pinned = nextParams.get("sourceCommit") || urlCommit;
        // Expand short SHA from ledger/anchor to full object id once resolved.
        if (
          pinned &&
          pinned !== selectedCommit &&
          selectedCommit.startsWith(pinned) &&
          pinned.length >= 7
        ) {
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
    if (!selectedBranch) {
      setRecordMessage("Select a branch before anchoring the repository package.");
      return;
    }
    const resolvedCommit =
      selectedCommit ||
      (isLatestCommitMode ? headCommit?.sha || null : null);
    if (!resolvedCommit) {
      setRecordMessage(
        "Wait for commits to load (or pin a SHA) before anchoring.",
      );
      return;
    }
    setIsRecording(true);
    setRecordMessage(null);
    try {
      // Full source package (branch + resolved commit) so Load-anchor restores it.
      await onRecordActivity(
        buildProductRepositoryAnchorDraft({
          provider,
          connectionStatus,
          inventorySource,
          repositories,
          selectedRepository,
          selectedBranch,
          selectedCommit: resolvedCommit,
          headCommitSha: headCommit?.sha || null,
          name: repositoryAnchorName,
          branches,
          commits,
          defaultBranch,
        }),
      );
      setRecordMessage(
        repositoryAnchorName.trim()
          ? `Repository anchor "${repositoryAnchorName.trim()}" saved into the Bitcode activity ledger.`
          : "Repository package anchored into the Bitcode activity ledger.",
      );
      setRepositoryAnchorName("");
      setIsRepositoryAnchorPopoverOpen(false);
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
          <div className="w-52">
            <SearchableSelect
              aria-label="Load a previously anchored repository"
              items={repositoryAnchors.map((anchor) => ({
                key: anchor.id,
                label:
                  anchor.name ||
                  anchor.repositoryFullName ||
                  "Repository anchor",
                description: [
                  anchor.name ? anchor.repositoryFullName : null,
                  anchor.branch
                    ? `${anchor.branch}${
                        anchor.commit ? ` · ${anchor.commit.slice(0, 7)}` : ""
                      }`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · "),
                searchText: [
                  anchor.name,
                  anchor.repositoryFullName,
                  anchor.branch,
                  anchor.commit,
                ]
                  .filter(Boolean)
                  .join(" "),
              }))}
              value={null}
              disabled={disabled}
              onSelect={(key) => {
                if (disabled) return;
                const anchor = repositoryAnchors.find(
                  (entry) => entry.id === key,
                );
                if (!anchor) return;
                // Always set full package explicitly — pin SHA (not "latest")
                // so branch+commit both restore for Load anchor.
                updateSourceParams((params) => {
                  params.set("repo", anchor.repositoryFullName);
                  if (anchor.branch) {
                    params.set("sourceBranch", anchor.branch);
                  } else {
                    params.delete("sourceBranch");
                  }
                  if (anchor.commit) {
                    params.set("sourceCommit", anchor.commit);
                  } else {
                    params.delete("sourceCommit");
                  }
                  params.delete("branch");
                  params.delete("commit");
                });
              }}
              showSelectionIndicator={false}
              placeholder="Load anchor..."
              searchPlaceholder="Search anchors..."
              emptyMessage="No anchors yet."
              className="h-9"
            />
          </div>
          <Popover
            open={isRepositoryAnchorPopoverOpen}
            onOpenChange={(open) => {
              if (disabled) return;
              if (open && !selectedRepository) return;
              if (isRecording) return;
              setIsRepositoryAnchorPopoverOpen(open);
            }}
          >
            {/*
              Explainer wraps only the icon trigger — not PopoverContent —
              and is disabled while the name box is open so the large portal
              tooltip cannot sit above the input (z-index) and steal hover.
            */}
            <TelemetryExplainerTrigger
              side="bottom"
              disabled={isRepositoryAnchorPopoverOpen}
              explainer={toRichHoverExplainer(
                DEPOSIT_SECTION_EXPLAINERS.repositoryAnchor,
              )}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Anchor repository to the activity ledger"
                  disabled={
                    disabled ||
                    !selectedRepository ||
                    !selectedBranch ||
                    isRecording
                  }
                  className="flex h-9 w-9 items-center justify-center border border-white/10 bg-white/5 text-neutral-200 transition hover:border-emerald-300/35 hover:bg-emerald-300/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isRecording ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Anchor className="h-4 w-4" />
                  )}
                </button>
              </PopoverTrigger>
            </TelemetryExplainerTrigger>
            <PopoverContent
              align="end"
              sideOffset={6}
              className="z-[10200] w-64 border-white/10 bg-neutral-950 p-3 text-neutral-100 shadow-xl"
              onOpenAutoFocus={(event) => {
                // Keep focus on the name field without re-triggering the
                // explainer (which listens for focus on its icon wrapper).
                event.preventDefault();
                const input = document.getElementById(
                  "deposit-repository-anchor-name",
                );
                if (input instanceof HTMLInputElement) {
                  input.focus();
                }
              }}
            >
              <p className="text-[0.62rem] uppercase tracking-[0.14em] text-neutral-500">
                Name this anchor
              </p>
              <input
                id="deposit-repository-anchor-name"
                type="text"
                value={repositoryAnchorName}
                onChange={(event) =>
                  setRepositoryAnchorName(event.target.value.slice(0, 80))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleAnchorRepository();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setIsRepositoryAnchorPopoverOpen(false);
                  }
                }}
                placeholder="Optional name"
                maxLength={80}
                aria-label="Repository anchor name"
                className="mt-2 h-9 w-full border border-white/10 bg-black/40 px-2.5 text-xs text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-emerald-300/35"
              />
              <p className="mt-1.5 text-[0.68rem] leading-4 text-neutral-500">
                Shown as the label when reloading. Leave blank to use the
                repository full name. Saves repo · branch · commit.
              </p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRepositoryAnchorPopoverOpen(false)}
                  disabled={isRecording}
                  className="border border-white/10 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-neutral-300 transition hover:border-white/25 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleAnchorRepository();
                  }}
                  disabled={
                    !selectedRepository || !selectedBranch || isRecording
                  }
                  className="inline-flex items-center gap-1.5 border border-emerald-300/30 bg-emerald-300/12 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-emerald-100 transition hover:border-emerald-200/45 hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isRecording ? (
                    <RefreshCw
                      className="h-3 w-3 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Anchor className="h-3 w-3" aria-hidden="true" />
                  )}
                  Save anchor
                </button>
              </div>
            </PopoverContent>
          </Popover>
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
