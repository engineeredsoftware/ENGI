/**
 * Externals pane readiness projection from useUserData + completion telemetry.
 */

import { useEffect } from 'react';

import { useAuth } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import { deriveBitcodeTransactionReadiness } from '@/components/bitcode/pipeline/models/transaction-readiness';
import { useUserData } from '@/hooks/useUserData';
import { bitcodeQaTelemetry } from '@/lib/bitcode-qa-telemetry';

export function useExternalsPaneState(onCompletionStatusChange?: (isComplete: boolean) => void) {
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

  return {
    hasExternalsIdentity,
    hasGitHubConnection,
    hasValidGitHubConnection,
    hasWalletConnection,
    hasStoredVerifiedWalletConnection,
    hasVerifiedWalletConnection,
    walletBindingStatus,
    walletConnectionStatus,
    repositoryConnectionStatus,
    organizations,
    repositories,
    repositoryInventorySource,
    isLoading,
    refresh,
    providerReadiness,
    latestRecoveryRun,
    telemetryProofHooks,
    latestTelemetryProofHook,
    transactionReadiness,
  };
}
