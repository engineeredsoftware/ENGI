'use client';

/**
 * Provider / repository / branch / commit field grid for Reads repository context.
 * Presentational: parent owns URL mutation and selection state.
 */

import React from 'react';
import type { VCSBranch, VCSCommit, VCSRepository } from '@bitcode/vcs-generics-core';
import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';
import { VCSRepositorySelector } from '@/components/bitcode/vcs/VCSRepositorySelector/VCSRepositorySelector';
import {
  TERMINAL_INLINE_EXPLAINERS,
} from '@/components/bitcode/pipeline/models/workspace-explainers';
import {
  TERMINAL_REPOSITORY_PROVIDERS,
  getProviderLabel,
  type TerminalRepositoryConnectionStatus,
} from '@/components/bitcode/pipeline/models/repository-context';
import { formatCommitOption } from '@/components/reads/ReadsRepositoryContextPanel/hooks/use-reads-repository-vcs';

type RepositoryProvider = (typeof TERMINAL_REPOSITORY_PROVIDERS)[number];

export type ReadsRepositoryFieldGridProps = {
  provider: RepositoryProvider;
  repositories: VCSRepository[];
  branches: VCSBranch[];
  commits: VCSCommit[];
  defaultBranch: string | null;
  selectedRepository: VCSRepository | null;
  selectedBranch: string | null;
  selectedCommit: string | null;
  connectionStatus: TerminalRepositoryConnectionStatus | null;
  isLoadingRepositories: boolean;
  isLoadingBranches: boolean;
  isLoadingCommits: boolean;
  sourceSelectionError: string | null;
  isRecording: boolean;
  showContinueToDeposit: boolean;
  onProviderChange: (provider: RepositoryProvider) => void;
  onRepositorySelect: (repository: VCSRepository | null) => void;
  onBranchChange: (branch: string) => void;
  onCommitChange: (commit: string) => void;
  onContinueToDeposit: () => void;
  onRecordAnchor: () => void;
};

export function ReadsRepositoryFieldGrid({
  provider,
  repositories,
  branches,
  commits,
  defaultBranch,
  selectedRepository,
  selectedBranch,
  selectedCommit,
  connectionStatus,
  isLoadingRepositories,
  isLoadingBranches,
  isLoadingCommits,
  sourceSelectionError,
  isRecording,
  showContinueToDeposit,
  onProviderChange,
  onRepositorySelect,
  onBranchChange,
  onCommitChange,
  onContinueToDeposit,
  onRecordAnchor,
}: ReadsRepositoryFieldGridProps) {
  return (
    <div className="rounded-none border border-white/8 bg-black/20 px-5 py-5">
      <div className="flex items-center gap-2">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">
          Provider and repository
        </p>
        <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.providerRepository} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {TERMINAL_REPOSITORY_PROVIDERS.map((option) => {
          const isActive = provider === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onProviderChange(option)}
              className={`rounded-none border px-3 py-2 text-[0.72rem] uppercase tracking-[0.18em] transition ${
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
          onSelect={onRepositorySelect}
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
              disabled={!selectedRepository || !selectedBranch || !selectedCommit}
              onClick={onContinueToDeposit}
              className="rounded-none border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-neutral-500"
            >
              Continue to deposit
            </button>
          ) : null}
          <button
            type="button"
            disabled={!selectedRepository || isRecording}
            onClick={onRecordAnchor}
            className="rounded-none border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/18 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRecording ? 'Recording anchor…' : 'Record repository anchor'}
          </button>
          <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.repositoryAnchor} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="rounded-none border border-white/8 bg-white/5 px-4 py-4">
          <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-neutral-400">
            <span>Branch</span>
            <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.sourceBranch} />
          </span>
          <select
            aria-label="Repository source branch"
            value={selectedBranch || ''}
            disabled={!selectedRepository || isLoadingBranches || branches.length === 0}
            onChange={(event) => onBranchChange(event.target.value)}
            className="mt-3 w-full rounded-none border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {branches.length ? null : <option value="">No branches loaded</option>}
            {branches.map((branch) => (
              <option key={branch.name} value={branch.name}>
                {branch.name}
                {branch.name === (defaultBranch || selectedRepository?.defaultBranch)
                  ? ' · default'
                  : ''}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-500">
            {isLoadingBranches
              ? 'Loading branches…'
              : 'Default branch is selected when available'}
          </p>
        </label>

        <label className="rounded-none border border-white/8 bg-white/5 px-4 py-4">
          <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.2em] text-neutral-400">
            <span>Commit / ref</span>
            <BitcodeInlineExplainer explainer={TERMINAL_INLINE_EXPLAINERS.sourceCommit} />
          </span>
          <select
            aria-label="Repository source commit"
            value={selectedCommit || ''}
            disabled={!selectedBranch || isLoadingCommits || commits.length === 0}
            onChange={(event) => onCommitChange(event.target.value)}
            className="mt-3 w-full rounded-none border border-white/10 bg-[rgba(10,15,30,0.88)] px-3 py-3 text-sm text-white outline-none transition focus:border-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {commits.length ? null : <option value="">No commits loaded</option>}
            {commits.map((commit) => (
              <option key={commit.sha} value={commit.sha}>
                {formatCommitOption(commit)}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-neutral-500">
            {isLoadingCommits
              ? 'Loading commits…'
              : 'Latest branch commit is selected when available'}
          </p>
        </label>
      </div>

      {sourceSelectionError ? (
        <p className="mt-4 rounded-none border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {sourceSelectionError}
        </p>
      ) : null}
    </div>
  );
}
