'use client';

/**
 * Deposit-side guidance + refresh posture unit for repository context panel.
 */

import React from 'react';
import { FolderGit2, RefreshCw } from 'lucide-react';
import { getProviderLabel } from '@/components/bitcode/pipeline/models/repository-context';
import { jumpToShellSection } from '@/components/bitcode/pipeline/ShellReading/shell-reading';

export type ReadsRepositoryGuidanceUnitProps = {
  provider: Parameters<typeof getProviderLabel>[0];
  repositoriesCount: number;
  error: string | null;
  selectedRepositoryReady: boolean;
  onRefresh: () => void;
};

export function ReadsRepositoryGuidanceUnit({
  provider,
  repositoriesCount,
  error,
  selectedRepositoryReady,
  onRefresh,
}: ReadsRepositoryGuidanceUnitProps) {
  return (
    <div className="space-y-4">
      <article className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">
          Deposit-side guidance
        </p>
        <p className="mt-3 text-sm leading-6 text-neutral-300">
          Keep repository connection, repository selection, and deposit focus visible
          before you move deeper into supply, read, and closure.
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
            disabled={!selectedRepositoryReady}
            onClick={() => jumpToShellSection('terminalReadScenarios')}
            className="rounded-[1.2rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue to Read
          </button>
        </div>
      </article>

      <article className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-neutral-400">
            Refresh posture
          </p>
          <button
            type="button"
            onClick={onRefresh}
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
            {repositoriesCount} repositories surfaced for {getProviderLabel(provider)}
          </div>
        </div>
      </article>
    </div>
  );
}
