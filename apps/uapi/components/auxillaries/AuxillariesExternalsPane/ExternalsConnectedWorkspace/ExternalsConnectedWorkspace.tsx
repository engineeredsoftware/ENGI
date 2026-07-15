'use client';

/**
 * Connected Externals workspace — GitHub VCS panel, readiness, scope, data sharing.
 * Repository Connection card accepts purple attention cue after wallet Connect.
 */

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import { VCSIntegrationPanel } from '@/components/bitcode/vcs/VCSIntegrationPanel/VCSIntegrationPanel';
import { getRepositoryInventorySourceLabel } from '@/components/bitcode/pipeline/models/repository-context';
import AuxillariesDataSharingPanel from '@/components/auxillaries/AuxillariesDataSharingPanel/AuxillariesDataSharingPanel';
import { buildAuxillariesRoutePath } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

import {
  BITCODE_FOCUS_GITHUB_CONNECT_EVENT,
  clearPendingGitHubConnectAttention,
  GITHUB_CONNECT_ATTENTION_MS,
  hasPendingGitHubConnectAttention,
} from '../models/github-connect-attention';
import { compactRoot, formatProviderClass } from '../models/externals-pane-format';

export interface ExternalsConnectedWorkspaceProps {
  isOnboardingComplete: boolean;
  isLoading: boolean;
  transactionReadiness: {
    canSettle: boolean;
    canTransact: boolean;
    summary: string;
  };
  hasGitHubConnection: boolean;
  hasValidGitHubConnection: boolean;
  hasWalletConnection: boolean;
  hasStoredVerifiedWalletConnection: boolean;
  hasVerifiedWalletConnection: boolean;
  walletBindingStatus: string | null | undefined;
  walletConnectionStatus: any;
  repositoryConnectionStatus: any;
  repositoryInventorySource: any;
  providerReadiness: any;
  latestRecoveryRun: any;
  telemetryProofHooks: any[];
  latestTelemetryProofHook: any;
  organizations: string[];
  repositories: any[];
  onSave: (data: any) => void;
  refresh: () => Promise<void> | void;
}

export default function ExternalsConnectedWorkspace({
  isOnboardingComplete,
  isLoading,
  transactionReadiness,
  hasGitHubConnection,
  hasValidGitHubConnection,
  hasWalletConnection,
  hasStoredVerifiedWalletConnection,
  hasVerifiedWalletConnection,
  walletBindingStatus,
  walletConnectionStatus,
  repositoryConnectionStatus,
  repositoryInventorySource,
  providerReadiness,
  latestRecoveryRun,
  telemetryProofHooks,
  latestTelemetryProofHook,
  organizations,
  repositories,
  onSave,
  refresh,
}: ExternalsConnectedWorkspaceProps) {
  const repositorySectionRef = useRef<HTMLElement | null>(null);
  const [attentionActive, setAttentionActive] = useState(false);
  const attentionTimerRef = useRef<number | null>(null);
  const [attentionKey, setAttentionKey] = useState(0);

  useEffect(() => {
    const runAttention = () => {
      clearPendingGitHubConnectAttention();
      setAttentionActive(false);
      setAttentionKey((key) => key + 1);
      if (attentionTimerRef.current != null) {
        window.clearTimeout(attentionTimerRef.current);
      }
      window.requestAnimationFrame(() => {
        setAttentionActive(true);
        repositorySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        attentionTimerRef.current = window.setTimeout(() => {
          setAttentionActive(false);
          attentionTimerRef.current = null;
        }, GITHUB_CONNECT_ATTENTION_MS);
      });
    };

    window.addEventListener(BITCODE_FOCUS_GITHUB_CONNECT_EVENT, runAttention);
    if (hasPendingGitHubConnectAttention()) {
      runAttention();
    }
    return () => {
      window.removeEventListener(BITCODE_FOCUS_GITHUB_CONNECT_EVENT, runAttention);
      if (attentionTimerRef.current != null) {
        window.clearTimeout(attentionTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <div className="grid min-w-0 gap-4 tablet:grid-cols-[1.15fr_0.85fr]">
        <section
          ref={repositorySectionRef}
          data-testid="repository-connection-section"
          data-github-attention-key={attentionKey || undefined}
          className={[
            'repository-connection-section min-w-0 rounded-none border p-5',
            attentionActive ? 'github-connect-attention-section' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200/78">
              Repository connection
            </p>
            <h3 className="text-lg font-semibold text-white">Connect GitHub for source-bearing input</h3>
            <p className="text-sm leading-7 text-white/68">
              Manage the repository attachment that Bitcode reuses across read measurement, asset-pack synthesis, and settlement follow-through.
            </p>
          </div>

          <VCSIntegrationPanel
            showGitHub
            showGitLab={false}
            showBitbucket={false}
            githubInstallAttentionActive={attentionActive}
            onConnectionChange={async (provider, connected) => {
              if (provider !== 'github') return;
              await refresh();
              if (connected) {
                onSave({ provider, connected });
              }
            }}
          />
        </section>

        <aside className="min-w-0 space-y-4 overflow-x-hidden">
          <div className="min-w-0 rounded-none border border-violet-300/18 bg-violet-950/25 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200/78">
              Mainnet readiness
            </p>
            <div className="mt-3 rounded-none border border-white/8 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">
                {isLoading
                  ? 'Checking GitHub and wallet posture...'
                  : transactionReadiness.canSettle
                    ? 'GitHub and verified wallet are ready'
                    : transactionReadiness.canTransact
                      ? 'GitHub and wallet identity are ready'
                      : 'GitHub and wallet are not both ready yet'}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                {transactionReadiness.canSettle
                  ? 'Bitcode can now reuse live repository context and verified wallet posture across read measurement, asset-pack synthesis, and signed settlement follow-through.'
                  : transactionReadiness.canTransact
                    ? 'Bitcode can now reuse live repository context and Wallet-owned identity across read measurement, asset-pack synthesis, and transaction drafting. Signed settlement still waits on verified wallet-provider access.'
                    : `${transactionReadiness.summary} Bitcode may stay in review, but settlement requires both a live GitHub connection here and a wallet binding in Wallet before it should move from evaluation into asset-pack delivery.`}
              </p>
              {hasGitHubConnection && !hasValidGitHubConnection ? (
                <p className="mt-2 text-xs leading-6 text-amber-200/82">
                  Externals found a saved repository-provider attachment, but the live provider
                  session is no longer valid. Reconnect before Bitcode writes, settles, or
                  signs source-to-shares activity.
                </p>
              ) : null}
              {hasStoredVerifiedWalletConnection && !hasVerifiedWalletConnection ? (
                <p className="mt-2 text-xs leading-6 text-amber-200/82">
                  Wallet has saved verified wallet-provider signer posture, but the live
                  signer session is no longer available. Reconnect the wallet provider before
                  signed settlement resumes.
                </p>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 tablet:grid-cols-3">
              <div className="rounded-none border border-white/8 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/64">
                  GitHub
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {!hasGitHubConnection
                    ? 'Pending'
                    : hasValidGitHubConnection
                      ? 'Connected'
                      : 'Reconnect required'}
                </p>
              </div>
              <div className="rounded-none border border-white/8 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/64">
                  Wallet
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {!hasWalletConnection
                    ? 'Pending in Wallet'
                    : hasVerifiedWalletConnection
                      ? 'Verified signer'
                      : hasStoredVerifiedWalletConnection
                        ? 'Reconnect required'
                        : walletBindingStatus === 'pending'
                          ? 'Verification staged'
                          : 'Identity bound'}
                </p>
                {walletConnectionStatus &&
                hasStoredVerifiedWalletConnection &&
                !hasVerifiedWalletConnection ? (
                  <p className="mt-2 text-[11px] leading-5 text-amber-200/75">
                    Saved signer posture remains visible, but settlement still waits on a live
                    wallet-provider connection.
                  </p>
                ) : null}
              </div>
              <div className="rounded-none border border-white/8 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/64">
                  Inventory source
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {getRepositoryInventorySourceLabel(repositoryInventorySource)}
                </p>
                {repositoryConnectionStatus && !repositoryConnectionStatus.valid ? (
                  <p className="mt-2 text-[11px] leading-5 text-amber-200/75">
                    Stored inventory can still be reread, but write admission will fail closed
                    until the live provider connection is restored.
                  </p>
                ) : null}
              </div>
            </div>
            {providerReadiness ? (
              <div
                data-testid="auxillaries-provider-readiness"
                className="mt-3 rounded-none border border-emerald-300/14 bg-emerald-400/8 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/72">
                      Provider readiness
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {providerReadiness.providerName || providerReadiness.provider || 'Provider'}:
                      {' '}
                      {formatProviderClass(providerReadiness.lastReadbackStatus)}
                    </p>
                  </div>
                  <span className="rounded-none border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
                    {compactRoot(providerReadiness.providerReadinessRoot)}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs leading-6 text-white/68 tablet:grid-cols-2">
                  <p>Provider id: {providerReadiness.providerId || providerReadiness.provider}</p>
                  <p>Token: {formatProviderClass(providerReadiness.tokenPresenceClass)}</p>
                  <p>Scopes: {formatProviderClass(providerReadiness.scopesClass)}</p>
                  <p>Repair: {formatProviderClass(providerReadiness.repairAction ?? providerReadiness.requiredRepairAction)}</p>
                </div>
                {providerReadiness.blocker ? (
                  <p className="mt-3 text-xs leading-6 text-amber-200/82">
                    Blocker: {providerReadiness.blocker}
                  </p>
                ) : null}
                {latestRecoveryRun ? (
                  <p className="mt-3 text-xs leading-6 text-white/64">
                    Latest recovery: {latestRecoveryRun.outcome} from{' '}
                    {compactRoot(latestRecoveryRun.beforeReadinessRoot)} to{' '}
                    {compactRoot(latestRecoveryRun.afterReadinessRoot)}.
                  </p>
                ) : null}
              </div>
            ) : null}
            {telemetryProofHooks.length > 0 ? (
              <div
                data-testid="auxillaries-telemetry-proof-hooks"
                className="mt-3 min-w-0 overflow-hidden rounded-none border border-cyan-300/14 bg-cyan-400/8 p-4"
              >
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/76">
                      Telemetry proof hooks
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {telemetryProofHooks.length} source-safe proof{' '}
                      {telemetryProofHooks.length === 1 ? 'hook' : 'hooks'} available
                    </p>
                  </div>
                  <span className="shrink-0 rounded-none border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
                    {formatProviderClass(latestTelemetryProofHook?.sourceSafetyClass)}
                  </span>
                </div>
                {latestTelemetryProofHook ? (
                  <div className="mt-3 grid min-w-0 gap-2 text-xs leading-6 text-white/68 tablet:grid-cols-2">
                    <p className="min-w-0 break-words">
                      Latest subject: {formatProviderClass(latestTelemetryProofHook.subject)}
                    </p>
                    <p className="min-w-0 break-all font-mono text-[0.7rem] leading-5">
                      Theorem: {latestTelemetryProofHook.theoremId}
                    </p>
                    <p className="min-w-0 break-all font-mono text-[0.7rem] leading-5">
                      Replay: {latestTelemetryProofHook.replayStepId}
                    </p>
                    <p className="min-w-0 break-words">
                      Outcome: {formatProviderClass(latestTelemetryProofHook.repairOutcome)}
                    </p>
                    <p className="min-w-0 break-all font-mono text-[0.7rem] leading-5">
                      Evidence: {compactRoot(latestTelemetryProofHook.evidenceRoot)}
                    </p>
                    <p className="min-w-0 break-all font-mono text-[0.7rem] leading-5">
                      Telemetry: {compactRoot(latestTelemetryProofHook.telemetryRoot)}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
            {!hasWalletConnection && (
              <div className="mt-3">
                <Link
                  href={buildAuxillariesRoutePath('wallet')}
                  className="inline-flex items-center justify-center rounded-none border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82 transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  Open Wallet for wallet binding
                </Link>
              </div>
            )}
          </div>

          {(organizations.length > 0 || repositories.length > 0) && (
            <div className="github-connection-summary rounded-none border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
                Connected scope
              </p>
              <p className="mt-3 text-sm leading-7 text-white/68">
                These repository attachments define the live scope Bitcode can read when it
                measures read, synthesizes asset packs, and prepares settlement follow-through.
                The current source of truth is {getRepositoryInventorySourceLabel(repositoryInventorySource)}.
              </p>

              {organizations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-white">Organizations</p>
                  <div className="flex flex-wrap gap-2">
                    {organizations.map((organization: string) => (
                      <span
                        key={organization}
                        className="rounded-none border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100"
                      >
                        {organization}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {repositories.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-white">
                    Connected Repositories ({repositories.length})
                  </p>
                  <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto">
                    {repositories.map((repository: any) => {
                      const label =
                        typeof repository === 'string'
                          ? repository
                          : repository?.fullName || repository?.full_name || repository?.name || 'repository';
                      return (
                        <span
                          key={label}
                          className="rounded-none border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/74"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-none border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">
              Read-space knowledge sharing
            </p>
            <div className="mt-3 space-y-3 text-sm leading-7 text-white/68">
              <p>
                Externals owns the consent setting for connected source context. Wallet identity stays in Wallet, while GitHub scope becomes source-bearing inputability for Read and Deposit.
              </p>
              <AuxillariesDataSharingPanel overlayed={!isOnboardingComplete} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
