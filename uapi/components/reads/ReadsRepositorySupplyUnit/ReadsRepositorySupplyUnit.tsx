'use client';

/**
 * Selected repository supply context unit (branch, visibility, anchor actions).
 */

import React from 'react';
import { ArrowUpRight, GitBranch, Lock, ShieldCheck } from 'lucide-react';
import type { VCSRepository } from '@bitcode/vcs-generics-core';
import {
  getProviderLabel,
  type TerminalRepositoryConnectionStatus,
} from '@/components/bitcode/pipeline/models/repository-context';
import { jumpToShellSection } from '@/components/bitcode/pipeline/ShellReading/shell-reading';

export type ReadsRepositorySupplyUnitProps = {
  provider: Parameters<typeof getProviderLabel>[0];
  selectedRepository: VCSRepository | null;
  selectedBranch: string | null;
  selectedCommit: string | null;
  connectionStatus: TerminalRepositoryConnectionStatus | null;
  isRecording: boolean;
  onRecordAnchor: () => void;
};

export function ReadsRepositorySupplyUnit({
  provider,
  selectedRepository,
  selectedBranch,
  selectedCommit,
  connectionStatus,
  isRecording,
  onRecordAnchor,
}: ReadsRepositorySupplyUnitProps) {
  return (
    <article className="rounded-none border border-white/8 bg-black/20 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-300/75">
            Supply context
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {selectedRepository
              ? selectedRepository.fullName
              : 'Awaiting repository selection'}
          </h3>
        </div>
        <span className="rounded-none border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-300">
          deposit
        </span>
      </div>

      {selectedRepository ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-6 text-neutral-300">
            The selected repository now anchors the deposit-side frame before live
            Bitcode deposit surfaces below.
          </p>
          {connectionStatus?.connected && !connectionStatus.valid ? (
            <p className="rounded-none border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
              Stored repository inventory remains readable from Exchange, but Bitcode
              will fail closed on settlement-bearing writes until Externals reconnects
              the live {getProviderLabel(provider)} session.
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-none border border-white/8 bg-white/5 px-4 py-4">
              <p className="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500">
                Selected branch
              </p>
              <p className="mt-2 flex items-center gap-2 text-base font-semibold text-white">
                <GitBranch className="h-4 w-4 text-emerald-200" />
                {selectedBranch || selectedRepository.defaultBranch || 'main'}
              </p>
            </div>
            <div className="rounded-none border border-white/8 bg-white/5 px-4 py-4">
              <p className="text-[0.64rem] uppercase tracking-[0.16em] text-neutral-500">
                Visibility
              </p>
              <p className="mt-2 flex items-center gap-2 text-base font-semibold text-white">
                {selectedRepository.private ? (
                  <Lock className="h-4 w-4 text-amber-200" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-200" />
                )}
                {selectedRepository.private ? 'private' : 'public'}
              </p>
            </div>
          </div>

          <dl className="space-y-3 rounded-none border border-white/8 bg-white/5 px-4 py-4 text-sm">
            <div>
              <dt className="text-neutral-500">Selected commit</dt>
              <dd className="mt-1 break-all text-neutral-100">
                {selectedCommit || 'commit pending'}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Language</dt>
              <dd className="mt-1 text-neutral-100">
                {selectedRepository.language || 'n/a'}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Owner</dt>
              <dd className="mt-1 text-neutral-100">
                {selectedRepository.owner.username || selectedRepository.owner.id}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Topics</dt>
              <dd className="mt-1 text-neutral-100">
                {selectedRepository.topics?.length
                  ? selectedRepository.topics.join(', ')
                  : 'no tagged topics'}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => jumpToShellSection('terminalDepositComposer')}
              className="rounded-none border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-400/15"
            >
              Open deposit draft
            </button>
            <button
              type="button"
              disabled={isRecording}
              onClick={onRecordAnchor}
              className="rounded-none border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRecording ? 'Recording anchor…' : 'Record anchor'}
            </button>
            <a
              href={selectedRepository.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-none border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10"
            >
              Open repository
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-neutral-400">
          Select a connected repository to make the current deposit-side supply boundary
          explicit.
        </p>
      )}
    </article>
  );
}
