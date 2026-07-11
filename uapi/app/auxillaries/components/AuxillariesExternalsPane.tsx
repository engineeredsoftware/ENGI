"use client";

import Link from 'next/link';
import React, { useEffect } from 'react';

import { useAuth } from '@/components/bitcode/auth/AuthProvider';
import { VCSIntegrationPanel } from '@/components/bitcode/vcs/VCSIntegrationPanel';
import { getRepositoryInventorySourceLabel } from '@/app/terminal/terminal-repository-context';
import { deriveBitcodeTransactionReadiness } from '@/app/terminal/bitcode-transaction-readiness';
import { useUserData } from '@/hooks/useUserData';
import { bitcodeQaTelemetry } from '../../../lib/bitcode-qa-telemetry';

import AuxillariesExternalsPaneHeader from '@/app/auxillaries/components/headers/AuxillariesExternalsPaneHeader';
import AuxillariesDataSharingPanel from '@/app/auxillaries/components/AuxillariesDataSharingPanel';
import { buildAuxillariesRoutePath } from '@/app/auxillaries/components/auxillary-pane-meta';

function formatProviderClass(value: unknown) {
  return typeof value === 'string' && value.trim()
    ? value.replace(/_/g, ' ')
    : 'unknown';
}

function compactRoot(value: unknown) {
  return typeof value === 'string' && value.length > 12
    ? `${value.slice(0, 8)}...${value.slice(-6)}`
    : typeof value === 'string'
      ? value
      : 'unavailable';
}

export interface AuxillariesExternalsPaneProps {
  onSave: (data: any) => void;
  loading: boolean;
  isOnboardingComplete?: boolean;
  onCompletionStatusChange?: (isComplete: boolean) => void;
}

export default function AuxillariesExternalsPane({
  onSave,
  loading: _loading,
  isOnboardingComplete = false,
  onCompletionStatusChange,
}: AuxillariesExternalsPaneProps) {
  const { user } = useAuth();
  const {
    data: auxillaryData,
    hasGitHubConnection,
    hasValidGitHubConnection = hasGitHubConnection,
    hasWalletConnection,
    hasStoredVerifiedWalletConnection = false,
    hasVerifiedWalletConnection,
    walletBindingStatus,
    walletConnectionStatus = null,
    repositoryConnectionStatus = null,
    organizations = [],
    repositories = [],
    repositoryInventorySource = null,
    isLoading,
    refresh,
  } = useUserData();
  const providerReadiness = Array.isArray(auxillaryData?.connectionReadiness)
    ? auxillaryData.connectionReadiness.find((readiness: any) => readiness?.provider === 'github') ??
      auxillaryData.connectionReadiness[0]
    : null;
  const latestRecoveryRun = Array.isArray(auxillaryData?.recoveryRuns)
    ? auxillaryData.recoveryRuns[0]
    : null;
  const telemetryProofHooks = Array.isArray(auxillaryData?.telemetryProofHooks)
    ? auxillaryData.telemetryProofHooks
    : [];
  const latestTelemetryProofHook =
    telemetryProofHooks.find((hook: any) => hook?.pane === 'externals') ?? telemetryProofHooks[0] ?? null;

  const hasExternalsIdentity = Boolean(user || hasWalletConnection);

  useEffect(() => {
    onCompletionStatusChange?.(Boolean(hasExternalsIdentity && hasValidGitHubConnection));
  }, [hasExternalsIdentity, hasValidGitHubConnection, onCompletionStatusChange]);

  useEffect(() => {
    bitcodeQaTelemetry('info', 'auxillaries.externals', 'readiness', {
      hasEmailSession: Boolean(user),
      hasWalletConnection,
      hasExternalsIdentity,
      hasGitHubConnection,
      hasValidGitHubConnection,
      walletBindingStatus,
      walletProvider: walletConnectionStatus?.provider ?? null,
      repositoryProvider: repositoryConnectionStatus?.provider ?? null,
      repositoryValid: repositoryConnectionStatus?.valid ?? null,
    });
  }, [
    hasExternalsIdentity,
    hasGitHubConnection,
    hasValidGitHubConnection,
    hasWalletConnection,
    repositoryConnectionStatus?.provider,
    repositoryConnectionStatus?.valid,
    user,
    walletBindingStatus,
    walletConnectionStatus?.provider,
  ]);

  const transactionReadiness = deriveBitcodeTransactionReadiness({
    signedIn: hasExternalsIdentity,
    hasRepositoryProvider: hasGitHubConnection,
    hasValidRepositoryProvider: hasValidGitHubConnection,
    hasWalletBinding: hasWalletConnection,
    hasVerifiedWalletBinding: hasVerifiedWalletConnection,
    hasStoredVerifiedWalletBinding: hasStoredVerifiedWalletConnection,
  });

  return (
    <div data-testid="externals-pane-container">
      <div className="orbital-step-content externals-step">
        <AuxillariesExternalsPaneHeader isOnboardingComplete={isOnboardingComplete} />

        {!hasExternalsIdentity ? (
          <div className="space-y-4 rounded-[24px] border border-white/10 bg-black/20 p-5 text-white/80">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Connect Bitcoin wallet first</h3>
              <p className="text-sm leading-7 text-white/68">
                Connect a Bitcoin-capable wallet in Wallet, then attach GitHub here so read
                measurement, asset-pack synthesis, and settlement follow-through can operate
                against a live repository source.
              </p>
            </div>

              <div className="grid gap-3 tablet:grid-cols-2">
                <div className="rounded-2xl border border-emerald-300/16 bg-emerald-400/8 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/78">
                    Execution prerequisite
                  </p>
                  <p className="mt-2 text-sm leading-7 text-white/74">
                    GitHub plus a connected wallet are the minimum live prerequisites before Bitcode
                    should measure read, synthesize asset packs, settle, and deliver.
                  </p>
                </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/72">
                  Current posture
                </p>
                  <p className="mt-2 text-sm leading-7 text-white/74">
                  Wallet authentication opens Bitcode access first. Externals then owns repository
                  attachment, scope review, and non-wallet third-party posture.
                  </p>
              </div>
            </div>

            <div>
              <Link
                href={buildAuxillariesRoutePath('wallet')}
                className="inline-flex items-center justify-center rounded-full border border-emerald-300/24 bg-emerald-400/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 transition-colors hover:border-emerald-300/42 hover:bg-emerald-400/18"
              >
                Open Wallet auxillary
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 tablet:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/72">
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
                  onConnectionChange={async (provider, connected) => {
                    if (provider !== 'github') return;
                    await refresh();
                    if (connected) {
                      onSave({ provider, connected });
                    }
                  }}
                />
              </section>

              <aside className="space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/72">
                    Mainnet readiness
                  </p>
                  <div className="mt-3 rounded-2xl border border-white/8 bg-black/20 p-4">
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
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
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
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
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
                    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
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
                      className="mt-3 rounded-2xl border border-emerald-300/14 bg-emerald-400/8 p-4"
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
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
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
                      className="mt-3 rounded-2xl border border-cyan-300/14 bg-cyan-400/8 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/76">
                            Telemetry proof hooks
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {telemetryProofHooks.length} source-safe proof{' '}
                            {telemetryProofHooks.length === 1 ? 'hook' : 'hooks'} available
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
                          {formatProviderClass(latestTelemetryProofHook?.sourceSafetyClass)}
                        </span>
                      </div>
                      {latestTelemetryProofHook ? (
                        <div className="mt-3 grid gap-2 text-xs leading-6 text-white/68 tablet:grid-cols-2">
                          <p>Latest subject: {formatProviderClass(latestTelemetryProofHook.subject)}</p>
                          <p>Theorem: {latestTelemetryProofHook.theoremId}</p>
                          <p>Replay: {latestTelemetryProofHook.replayStepId}</p>
                          <p>Outcome: {formatProviderClass(latestTelemetryProofHook.repairOutcome)}</p>
                          <p>Evidence: {compactRoot(latestTelemetryProofHook.evidenceRoot)}</p>
                          <p>Telemetry: {compactRoot(latestTelemetryProofHook.telemetryRoot)}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {!hasWalletConnection && (
                    <div className="mt-3">
                      <Link
                        href={buildAuxillariesRoutePath('wallet')}
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82 transition-colors hover:border-white/20 hover:bg-white/10"
                      >
                        Open Wallet for wallet binding
                      </Link>
                    </div>
                  )}
                </div>

                {(organizations.length > 0 || repositories.length > 0) && (
                  <div className="github-connection-summary rounded-[24px] border border-white/10 bg-white/5 p-5">
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
                              className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100"
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
                                className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/74"
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

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
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
        )}
      </div>
    </div>
  );
}
