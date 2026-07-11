import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import AuxillariesExternalsPane from '@/app/auxillaries/components/AuxillariesExternalsPane';
import { useAuth } from '@/components/bitcode/auth/AuthProvider';
import { useUserData } from '@/hooks/useUserData';

jest.mock('@/components/bitcode/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

jest.mock('@/components/bitcode/vcs/VCSIntegrationPanel', () => ({
  VCSIntegrationPanel: function MockVCSIntegrationPanel() {
    return <div data-testid="mock-vcs-integration-panel">VCS integration panel</div>;
  },
}));

jest.mock('@/app/auxillaries/components/AuxillariesDataSharingPanel', () => ({
  __esModule: true,
  default: function MockAuxillariesDataSharingPanel() {
    return <div data-testid="mock-externals-data-sharing-panel">Read-space knowledge sharing</div>;
  },
}));

jest.mock('@/app/auxillaries/components/headers/AuxillariesExternalsPaneHeader', () => ({
  __esModule: true,
  default: function MockAuxillariesExternalsPaneHeader() {
    return <div data-testid="mock-externals-header">Externals header</div>;
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

describe('AuxillariesExternalsPane', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'operator@bitcode.ai',
      },
      loading: false,
    } as any);

    mockUseUserData.mockReturnValue({
      data: {
        profile: {
          wallet_address: 'bc1qbitcodeoperator',
        },
        connectionReadiness: [
          {
            provider: 'github',
            providerId: 'github',
            providerName: 'GitHub',
            tokenPresenceClass: 'present_source_safe',
            scopesClass: 'repo_read_write',
            lastReadbackStatus: 'succeeded',
            providerReadinessRoot: '0123456789abcdef',
            repairAction: 'none',
            blocker: null,
          },
        ],
        recoveryRuns: [
          {
            outcome: 'succeeded',
            beforeReadinessRoot: 'aaaaaaaaaaaaaaaa',
            afterReadinessRoot: 'bbbbbbbbbbbbbbbb',
          },
        ],
        telemetryProofHooks: [
          {
            kind: 'AuxillariesTelemetryProofHook',
            subject: 'provider_connection',
            subjectId: 'github',
            pane: 'externals',
            theoremId: 'auxillaries.provider_connection.source_safe_readback',
            replayStepId: 'provider-connection-github',
            evidenceRoot: 'cccccccccccccccc',
            telemetryRoot: 'dddddddddddddddd',
            blockerId: null,
            repairOutcome: 'not_required',
            sourceSafetyClass: 'source_safe',
            proofRoot: 'eeeeeeeeeeeeeeee',
          },
        ],
      },
      hasGitHubConnection: true,
      hasValidGitHubConnection: true,
      hasWalletConnection: true,
      hasStoredVerifiedWalletConnection: false,
      hasVerifiedWalletConnection: false,
      walletBindingStatus: 'manual',
      walletConnectionStatus: {
        connected: false,
        provider: 'manual',
        valid: false,
        verificationState: 'manual',
      },
      repositoryConnectionStatus: {
        connected: true,
        provider: 'github',
        valid: true,
      },
      repositories: [
        {
          id: 'repo-1',
          name: 'bitcode',
          fullName: 'bitcode/bitcode',
          defaultBranch: 'main',
          owner: { username: 'bitcode', type: 'organization' },
        },
        {
          id: 'repo-2',
          name: 'bitcode-core',
          fullName: 'bitcode/bitcode-core',
          defaultBranch: 'main',
          owner: { username: 'bitcode', type: 'organization' },
        },
      ],
      repositoryInventorySource: 'stored_repository_inventory',
      organizations: ['bitcode'],
      btdBalance: 1200,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: true,
      onboardedSteps: ['profile', 'externals', 'interfaces', 'wallet'],
    } as any);
  });

  it('surfaces the canonical repository inventory basis alongside connected scope', () => {
    render(
      <AuxillariesExternalsPane
        onSave={jest.fn()}
        loading={false}
        isOnboardingComplete
      />,
    );

    expect(screen.getByText('Inventory source')).toBeInTheDocument();
    expect(screen.getAllByText('stored protocol inventory').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/the current source of truth is stored protocol inventory/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Connected Repositories (2)')).toBeInTheDocument();
    expect(screen.getByText('bitcode/bitcode')).toBeInTheDocument();
    expect(screen.getByText('bitcode/bitcode-core')).toBeInTheDocument();
    expect(screen.getByTestId('mock-externals-data-sharing-panel')).toBeInTheDocument();
    expect(screen.getByTestId('auxillaries-provider-readiness')).toBeInTheDocument();
    expect(screen.getByText(/GitHub:\s+succeeded/i)).toBeInTheDocument();
    expect(screen.getByText(/Token: present source safe/i)).toBeInTheDocument();
    expect(screen.getByText(/Scopes: repo read write/i)).toBeInTheDocument();
    expect(screen.getByText(/Latest recovery: succeeded/i)).toBeInTheDocument();
    expect(screen.getByTestId('auxillaries-telemetry-proof-hooks')).toBeInTheDocument();
    expect(screen.getByText(/1 source-safe proof hook available/i)).toBeInTheDocument();
    expect(screen.getByText(/Latest subject: provider connection/i)).toBeInTheDocument();
    expect(screen.getByText(/Theorem: auxillaries\.provider_connection\.source_safe_readback/i)).toBeInTheDocument();
  });

  it('treats an invalid saved provider session as reconnect-required readiness', () => {
    mockUseUserData.mockReturnValue({
      data: {
        profile: {
          wallet_address: 'bc1qbitcodeoperator',
        },
        connectionReadiness: [
          {
            provider: 'github',
            providerId: 'github',
            providerName: 'GitHub',
            tokenPresenceClass: 'invalid',
            scopesClass: 'repo_read_only',
            lastReadbackStatus: 'failed',
            providerReadinessRoot: 'fedcba9876543210',
            repairAction: 'reauthorize_provider',
            blocker: 'connects.github.reauthorize_provider',
          },
        ],
      },
      hasGitHubConnection: true,
      hasValidGitHubConnection: false,
      hasWalletConnection: true,
      hasStoredVerifiedWalletConnection: true,
      hasVerifiedWalletConnection: true,
      walletBindingStatus: 'verified',
      walletConnectionStatus: {
        connected: true,
        provider: 'walletconnect',
        valid: true,
        verificationState: 'verified',
      },
      repositoryConnectionStatus: {
        connected: true,
        provider: 'github',
        valid: false,
      },
      repositories: [
        {
          id: 'repo-1',
          name: 'bitcode',
          fullName: 'bitcode/bitcode',
          defaultBranch: 'main',
          owner: { username: 'bitcode', type: 'organization' },
        },
      ],
      repositoryInventorySource: 'stored_repository_inventory',
      organizations: ['bitcode'],
      btdBalance: 1200,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: true,
      onboardedSteps: ['profile', 'externals', 'interfaces', 'wallet'],
    } as any);

    render(
      <AuxillariesExternalsPane
        onSave={jest.fn()}
        loading={false}
        isOnboardingComplete
      />,
    );

    expect(screen.getByText('Reconnect required')).toBeInTheDocument();
    expect(screen.getByText(/repository-provider attachment, but the live provider session is no longer valid/i)).toBeInTheDocument();
    expect(screen.getByText(/write admission will fail closed until the live provider connection is restored/i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub:\s+failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Blocker: connects.github.reauthorize_provider/i)).toBeInTheDocument();
  });

  it('renders GitHub connection controls from wallet identity before optional email session exists', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    } as any);

    mockUseUserData.mockReturnValue({
      data: {
        profile: {
          wallet_address: 'tb1qleatheroperator',
          wallet_provider: 'leather',
        },
      },
      hasGitHubConnection: false,
      hasValidGitHubConnection: false,
      hasWalletConnection: true,
      hasStoredVerifiedWalletConnection: false,
      hasVerifiedWalletConnection: false,
      walletBindingStatus: 'pending',
      walletConnectionStatus: {
        connected: true,
        provider: 'leather',
        valid: true,
        address: 'tb1qleatheroperator',
        verificationState: 'pending',
      },
      repositoryConnectionStatus: null,
      repositories: [],
      repositoryInventorySource: null,
      organizations: [],
      btdBalance: 0,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: false,
      onboardedSteps: ['profile'],
    } as any);

    render(
      <AuxillariesExternalsPane
        onSave={jest.fn()}
        loading={false}
        isOnboardingComplete={false}
      />,
    );

    expect(screen.getByText('Connect GitHub for source-bearing input')).toBeInTheDocument();
    expect(screen.getByTestId('mock-vcs-integration-panel')).toBeInTheDocument();
    expect(screen.queryByText(/Sign in to open Externals/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Connect Bitcoin wallet first/i)).not.toBeInTheDocument();
  });

  it('treats a saved verified wallet signer without a live wallet-provider session as reconnect-required settlement posture', () => {
    mockUseUserData.mockReturnValue({
      data: {
        profile: {
          wallet_address: 'bc1qbitcodeoperator',
        },
      },
      hasGitHubConnection: true,
      hasValidGitHubConnection: true,
      hasWalletConnection: true,
      hasStoredVerifiedWalletConnection: true,
      hasVerifiedWalletConnection: false,
      walletBindingStatus: 'verified',
      walletConnectionStatus: {
        connected: false,
        provider: 'walletconnect',
        valid: false,
        address: 'bc1qbitcodeoperator',
        verificationState: 'verified',
      },
      repositoryConnectionStatus: {
        connected: true,
        provider: 'github',
        valid: true,
      },
      repositories: [
        {
          id: 'repo-1',
          name: 'bitcode',
          fullName: 'bitcode/bitcode',
          defaultBranch: 'main',
          owner: { username: 'bitcode', type: 'organization' },
        },
      ],
      repositoryInventorySource: 'stored_repository_inventory',
      organizations: ['bitcode'],
      btdBalance: 1200,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: true,
      onboardedSteps: ['profile', 'externals', 'interfaces', 'wallet'],
    } as any);

    render(
      <AuxillariesExternalsPane
        onSave={jest.fn()}
        loading={false}
        isOnboardingComplete
      />,
    );

    expect(screen.getAllByText('Reconnect required').length).toBeGreaterThan(0);
    expect(screen.getByText(/saved verified wallet-provider signer posture, but the live signer session is no longer available/i)).toBeInTheDocument();
    expect(screen.getByText(/settlement still waits on a live wallet-provider connection/i)).toBeInTheDocument();
  });
});
