'use client';

/**
 * Connection posture unit for Reads repository context (connected / reconnect / empty).
 */

import React from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import AuxillariesOpenButton from '@/components/auxillaries/AuxillariesOpenButton/AuxillariesOpenButton';
import {
  getProviderLabel,
  getRepositoryInventorySourceLabel,
  type TerminalRepositoryConnectionStatus,
  type TerminalRepositoryInventorySource,
} from '@/components/bitcode/pipeline/models/repository-context';
import type { VCSRepository } from '@bitcode/vcs-generics-core';

export type ReadsRepositoryConnectionUnitProps = {
  provider: Parameters<typeof getProviderLabel>[0];
  connectionStatus: TerminalRepositoryConnectionStatus | null;
  inventorySource: TerminalRepositoryInventorySource | null;
  repositories: VCSRepository[];
  isLoadingConnection: boolean;
};

export function ReadsRepositoryConnectionUnit({
  provider,
  connectionStatus,
  inventorySource,
  repositories,
  isLoadingConnection,
}: ReadsRepositoryConnectionUnitProps) {
  return (
    <article className="rounded-none border border-white/8 bg-black/20 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.2em] text-emerald-300/75">
            Connection posture
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {getProviderLabel(provider)}
          </h3>
        </div>
        <span className="rounded-none border border-white/10 bg-white/5 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-300">
          contract
        </span>
      </div>

      {isLoadingConnection ? (
        <p className="mt-4 text-sm leading-6 text-neutral-400">
          Loading repository connection posture…
        </p>
      ) : connectionStatus?.connected && connectionStatus.valid ? (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 text-sm text-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            Connected as{' '}
            {connectionStatus.username ||
              connectionStatus.metadata?.account ||
              'linked account'}
          </div>
          <dl className="space-y-3 rounded-none border border-white/8 bg-white/5 px-4 py-4 text-sm">
            <div>
              <dt className="text-neutral-500">Inventory count</dt>
              <dd className="mt-1 text-neutral-100">
                {connectionStatus.metadata?.repositories ?? repositories.length}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Status</dt>
              <dd className="mt-1 text-neutral-100">
                {connectionStatus.metadata?.status || 'connected'}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Mode</dt>
              <dd className="mt-1 text-neutral-100">
                {connectionStatus.metadata?.mock_mode ? 'mock review' : 'live connection'}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Inventory source</dt>
              <dd className="mt-1 text-neutral-100">
                {getRepositoryInventorySourceLabel(inventorySource)}
              </dd>
            </div>
          </dl>
        </div>
      ) : connectionStatus?.connected ? (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 text-sm text-amber-100">
            <RefreshCw className="h-4 w-4" />
            Saved {getProviderLabel(provider)} attachment found, but the live provider
            session must reconnect.
          </div>
          <p className="text-sm leading-6 text-neutral-300">
            Bitcode can keep rereading stored repository inventory from Exchange so
            repository supply stays explicit, but settlement-bearing writes remain
            fail-closed until Externals restores a live {getProviderLabel(provider)}{' '}
            session.
          </p>
          <dl className="space-y-3 rounded-none border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm">
            <div>
              <dt className="text-amber-100/70">Inventory count</dt>
              <dd className="mt-1 text-neutral-100">
                {connectionStatus.metadata?.repositories ?? repositories.length}
              </dd>
            </div>
            <div>
              <dt className="text-amber-100/70">Status</dt>
              <dd className="mt-1 text-neutral-100">
                {connectionStatus.metadata?.status || 'reconnect required'}
              </dd>
            </div>
            <div>
              <dt className="text-amber-100/70">Write admission</dt>
              <dd className="mt-1 text-neutral-100">
                Reconnect required before deposit, branch, or closure writes.
              </dd>
            </div>
            <div>
              <dt className="text-amber-100/70">Inventory source</dt>
              <dd className="mt-1 text-neutral-100">
                {getRepositoryInventorySourceLabel(inventorySource)}
              </dd>
            </div>
          </dl>
          <AuxillariesOpenButton
            step="externals"
            label="Reconnect Externals to restore live write admission"
            className="rounded-none border border-amber-300/24 bg-amber-400/12 px-4 py-3 text-sm font-medium text-amber-50 transition hover:border-amber-300/42 hover:bg-amber-400/18"
          />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-sm leading-6 text-neutral-300">
            No active {getProviderLabel(provider)} connection is available for repository
            supply in this Reading context.
          </p>
          <AuxillariesOpenButton
            step="externals"
            className="rounded-none border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/20 hover:bg-white/10"
          />
        </div>
      )}
    </article>
  );
}
