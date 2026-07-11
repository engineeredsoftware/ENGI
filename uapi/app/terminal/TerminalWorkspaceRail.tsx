"use client";

import React from 'react';
import { formatAgenticExecutionLabel } from '@bitcode/api/src/executions/agentic-execution';
import {
  getTransactionDataModeLabel,
  isMockTransactionDataMode,
} from '@/components/bitcode/execution/bitcode-transaction-data-mode';
import type { TransactionDataMode } from '@/components/bitcode/execution/bitcode-transaction-types';

import TerminalOpenConversationsButton from './TerminalOpenConversationsButton';
import TerminalOpenAuxillariesButton from './TerminalOpenAuxillariesButton';
import type { WorkspaceRun } from './terminal-run-data';
import { TERMINAL_SURFACE_EXPLAINERS } from './terminal-workspace-explainers';
import { TERMINAL_SURFACE_COPY } from './terminal-workspace-copy';
import TerminalWorkspaceRailCard from './TerminalWorkspaceRailCard';

function formatRunTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getRunStatusTone(status?: string | null) {
  if (status === 'completed') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  if (status === 'error' || status === 'failed') return 'border-red-500/30 bg-red-500/10 text-red-200';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
}

interface TerminalWorkspaceRailProps {
  onOpenConversations: () => void;
  conversationsEnabled?: boolean;
  runs: WorkspaceRun[];
  isLoadingRuns: boolean;
  runsError: string | null;
  selectedRun: WorkspaceRun | null;
  transactionDataMode: TransactionDataMode;
}

export default function TerminalWorkspaceRail({
  onOpenConversations,
  conversationsEnabled = true,
  runs,
  isLoadingRuns,
  runsError,
  selectedRun,
  transactionDataMode,
}: TerminalWorkspaceRailProps) {
  const usesMockTransactions = isMockTransactionDataMode(transactionDataMode);

  return (
    <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <TerminalWorkspaceRailCard
        kicker={TERMINAL_SURFACE_COPY.rail.control.kicker}
        title={TERMINAL_SURFACE_COPY.rail.control.title}
        summary={TERMINAL_SURFACE_COPY.rail.control.summary}
        tone="emerald"
        explainer={TERMINAL_SURFACE_EXPLAINERS.railModes}
      >
        <div className="mt-5 grid gap-3">
          {conversationsEnabled ? <TerminalOpenConversationsButton onOpen={onOpenConversations} /> : null}
          <TerminalOpenAuxillariesButton />
        </div>
      </TerminalWorkspaceRailCard>

      <TerminalWorkspaceRailCard
        kicker={TERMINAL_SURFACE_COPY.rail.support.kicker}
        title={TERMINAL_SURFACE_COPY.rail.support.title}
        summary={TERMINAL_SURFACE_COPY.rail.support.summary}
        explainer={TERMINAL_SURFACE_EXPLAINERS.railSupport}
      >
        <div className="flex items-center justify-between gap-3">
          {usesMockTransactions ? (
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.22em] text-emerald-200">
              {getTransactionDataModeLabel(transactionDataMode)}
            </span>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          {isLoadingRuns ? (
            <div className="rounded-2xl border border-white/6 bg-black/20 px-4 py-6 text-sm text-neutral-400">
              Loading transaction support…
            </div>
          ) : runsError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
              {runsError}
            </div>
          ) : !selectedRun ? (
            <div className="rounded-2xl border border-white/6 bg-black/20 px-4 py-6 text-sm text-neutral-400">
              Select a Bitcode transaction in the ledger to load support context here.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/6 bg-black/20 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {selectedRun.agentic_execution?.label || formatAgenticExecutionLabel(selectedRun.type)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    {selectedRun.summary || 'The selected Bitcode activity is now loaded in the central result surface.'}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.18em] ${getRunStatusTone(selectedRun.status)}`}>
                  {selectedRun.status || 'running'}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">Terminal runs loaded</p>
                  <p className="mt-2 text-sm font-semibold text-white">{runs.length}</p>
                </div>
                <div className="rounded-[1rem] border border-white/8 bg-white/5 px-3 py-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-neutral-500">Started</p>
                  <p className="mt-2 text-sm font-semibold text-white">{formatRunTimestamp(selectedRun.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </TerminalWorkspaceRailCard>

      {selectedRun ? (
        <TerminalWorkspaceRailCard
          kicker={TERMINAL_SURFACE_COPY.rail.focus.kicker}
          title={TERMINAL_SURFACE_COPY.rail.focus.title}
          summary={TERMINAL_SURFACE_COPY.rail.focus.summary}
          explainer={TERMINAL_SURFACE_EXPLAINERS.railFocus}
        >
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-neutral-500">Activity id</dt>
              <dd className="mt-1 font-mono text-neutral-100">{selectedRun.id}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Summary</dt>
              <dd className="mt-1 text-neutral-100">
                {selectedRun.summary || 'Select the central Bitcode result surface to inspect this activity.'}
              </dd>
            </div>
          </dl>
        </TerminalWorkspaceRailCard>
      ) : null}
    </div>
  );
}
