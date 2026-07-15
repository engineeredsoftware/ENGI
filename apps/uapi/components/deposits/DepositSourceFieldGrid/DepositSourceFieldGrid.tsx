'use client';

/**
 * Deposit source provider/repository/branch/commit field columns.
 * Presentational: parent owns URL mutation and VCS refresh handlers.
 */

import React from "react";
import { GitBranch } from "lucide-react";

import { VCSRepositorySelector } from "@/components/bitcode/vcs/VCSRepositorySelector/VCSRepositorySelector";
import { SearchableSelect } from "@/components/bitcode/forms/SearchableSelect/SearchableSelect";
import BitcodeInlineExplainer from "@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer";
import { DEPOSIT_SECTION_EXPLAINERS } from "@/components/deposits/models/deposit-explainers";
import type { VCSBranch, VCSCommit, VCSProviderType, VCSRepository } from "@bitcode/vcs-generics-core";
import {
  DEPOSIT_COMMIT_LATEST_REF,
  getProviderLabel,
  PRODUCT_REPOSITORY_PROVIDERS,
  type RepositoryConnectionStatus,
} from "@/components/bitcode/pipeline/models/repository-context";
import { DepositSourceListRefreshButton } from "@/components/deposits/DepositSourceSelection/DepositSourceListRefreshButton";

export type DepositSourceFieldGridProps = {
  disabled: boolean;
  provider: VCSProviderType;
  connectionStatus: RepositoryConnectionStatus | null;
  connectionNeedsReconnect: boolean;
  repositories: VCSRepository[];
  branches: VCSBranch[];
  commits: VCSCommit[];
  defaultBranch: string | null;
  selectedRepository: VCSRepository | null;
  selectedBranch: string | null;
  selectedCommit: string | null;
  isLatestCommitMode: boolean;
  headCommit: VCSCommit | null;
  isLoadingConnection: boolean;
  isLoadingRepositories: boolean;
  isLoadingBranches: boolean;
  isLoadingCommits: boolean;
  updateSourceParams: (mutate: (params: URLSearchParams) => void) => void;
  onRefreshConnection: () => void;
  onRefreshRepositories: () => void;
  onRefreshBranches: () => void;
  onRefreshCommits: () => void;
};

export function DepositSourceFieldGrid(props: DepositSourceFieldGridProps) {
  const {
    disabled,
    provider,
    connectionStatus,
    connectionNeedsReconnect,
    repositories,
    branches,
    commits,
    defaultBranch,
    selectedRepository,
    selectedBranch,
    selectedCommit,
    isLatestCommitMode,
    headCommit,
    isLoadingConnection,
    isLoadingRepositories,
    isLoadingBranches,
    isLoadingCommits,
    updateSourceParams,
    onRefreshConnection,
    onRefreshRepositories,
    onRefreshBranches,
    onRefreshCommits,
  } = props;

  return (
    <div className="mt-3 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-[minmax(0,180px)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
          <span>Provider</span>
          <BitcodeInlineExplainer
            explainer={DEPOSIT_SECTION_EXPLAINERS.provider}
            triggerAriaLabel="More info about this field"
          />
        </span>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchableSelect
              aria-label="Repository provider"
              items={PRODUCT_REPOSITORY_PROVIDERS.map((option) => ({
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
          <DepositSourceListRefreshButton
            ariaLabel="Refresh provider connection"
            explainer={DEPOSIT_SECTION_EXPLAINERS.refreshProviderConnection}
            disabled={disabled}
            loading={isLoadingConnection}
            onRefresh={() => onRefreshConnection()}
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
          <BitcodeInlineExplainer
            explainer={DEPOSIT_SECTION_EXPLAINERS.repository}
            triggerAriaLabel="More info about this field"
          />
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
          <DepositSourceListRefreshButton
            ariaLabel="Refresh repository inventory"
            explainer={DEPOSIT_SECTION_EXPLAINERS.refreshRepositoryInventory}
            disabled={disabled || !connectionStatus?.connected}
            loading={isLoadingRepositories}
            onRefresh={() => onRefreshRepositories()}
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
          <BitcodeInlineExplainer
            explainer={DEPOSIT_SECTION_EXPLAINERS.branch}
            triggerAriaLabel="More info about this field"
          />
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
          <DepositSourceListRefreshButton
            ariaLabel="Refresh branches list"
            explainer={DEPOSIT_SECTION_EXPLAINERS.refreshBranches}
            disabled={
              disabled || !selectedRepository || connectionNeedsReconnect
            }
            loading={isLoadingBranches}
            onRefresh={() => onRefreshBranches()}
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
          <BitcodeInlineExplainer
            explainer={DEPOSIT_SECTION_EXPLAINERS.commit}
            triggerAriaLabel="More info about this field"
          />
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
                  if (selectedBranch) params.set("sourceBranch", selectedBranch);
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
          <DepositSourceListRefreshButton
            ariaLabel="Refresh commits list"
            explainer={DEPOSIT_SECTION_EXPLAINERS.refreshLatestCommit}
            disabled={disabled || !selectedBranch || connectionNeedsReconnect}
            loading={isLoadingCommits}
            onRefresh={() => onRefreshCommits()}
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
  );
}
