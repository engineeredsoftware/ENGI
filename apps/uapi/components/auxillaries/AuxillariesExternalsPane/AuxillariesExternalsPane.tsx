"use client";

/**
 * Externals auxillary pane — GitHub repository attachment, readiness, and data sharing.
 * State projection lives in hooks/; gate and connected workspace are named units.
 */

import React from 'react';

import AuxillariesExternalsPaneHeader from '@/components/auxillaries/headers/AuxillariesExternalsPaneHeader/AuxillariesExternalsPaneHeader';

import ExternalsConnectedWorkspace from './ExternalsConnectedWorkspace/ExternalsConnectedWorkspace';
import ExternalsWalletRequiredGate from './ExternalsWalletRequiredGate/ExternalsWalletRequiredGate';
import { useExternalsPaneState } from './hooks/use-externals-pane-state';

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
  const state = useExternalsPaneState(onCompletionStatusChange);

  return (
    <div data-testid="externals-pane-container">
      <div className="orbital-step-content externals-step">
        <AuxillariesExternalsPaneHeader isOnboardingComplete={isOnboardingComplete} />

        {!state.hasExternalsIdentity ? (
          <ExternalsWalletRequiredGate />
        ) : (
          <ExternalsConnectedWorkspace
            isOnboardingComplete={isOnboardingComplete}
            isLoading={state.isLoading}
            transactionReadiness={state.transactionReadiness}
            hasGitHubConnection={state.hasGitHubConnection}
            hasValidGitHubConnection={state.hasValidGitHubConnection}
            hasWalletConnection={state.hasWalletConnection}
            hasStoredVerifiedWalletConnection={state.hasStoredVerifiedWalletConnection}
            hasVerifiedWalletConnection={state.hasVerifiedWalletConnection}
            walletBindingStatus={state.walletBindingStatus}
            walletConnectionStatus={state.walletConnectionStatus}
            repositoryConnectionStatus={state.repositoryConnectionStatus}
            repositoryInventorySource={state.repositoryInventorySource}
            providerReadiness={state.providerReadiness}
            latestRecoveryRun={state.latestRecoveryRun}
            telemetryProofHooks={state.telemetryProofHooks}
            latestTelemetryProofHook={state.latestTelemetryProofHook}
            organizations={state.organizations}
            repositories={state.repositories}
            onSave={onSave}
            refresh={state.refresh}
          />
        )}
      </div>
    </div>
  );
}
