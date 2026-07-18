import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ExternalsPane from '@/components/auxillaries/AuxillariesExternalsPane/AuxillariesExternalsPane';
import { useAuth } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import { useUserData } from '@/hooks/useUserData';

jest.mock('@/components/bitcode/auth/AuthProvider/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

jest.mock('@/components/bitcode/vcs/VCSIntegrationPanel/VCSIntegrationPanel', () => ({
  VCSIntegrationPanel: function MockVCSIntegrationPanel() {
    return <div data-testid="mock-vcs-integration-panel">VCS integration panel</div>;
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

describe('ExternalsPane data-share flow', () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          repos: [
            {
              fullName: 'engineeredsoftware/bitcode',
              branch: 'main',
              commit: 'abcdef1234567',
              enabled: false,
            },
          ],
        }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }) as jest.Mock;

    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email_confirmed_at: '2026-04-18T12:00:00.000Z',
      },
      loading: false,
    } as any);

    mockUseUserData.mockReturnValue({
      data: {
        profile: {
          wallet_address: 'bc1qbitcodeoperator',
          btc_balance: '0.125',
          team_members: [],
        },
        modelPreferences: {},
      },
      hasGitHubConnection: true,
      hasValidGitHubConnection: true,
      hasWalletConnection: true,
      hasStoredVerifiedWalletConnection: true,
      hasVerifiedWalletConnection: true,
      walletBindingStatus: 'verified',
      walletConnectionStatus: {
        connected: true,
        provider: 'leather',
        valid: true,
        verificationState: 'verified',
      },
      repositoryConnectionStatus: {
        connected: true,
        provider: 'github',
        valid: true,
      },
      btdBalance: 1200,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: true,
      onboardedSteps: ['profile', 'externals', 'interfaces', 'wallet'],
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('enables continuous read-space repository sharing from Externals', async () => {
    render(<ExternalsPane onSave={() => {}} loading={false} isOnboardingComplete />);

    await waitFor(() => {
      expect(screen.queryByText('loading…')).not.toBeInTheDocument();
    });

    // Single section kicker — panel intro is collapsed into the subtitle above.
    expect(screen.getByText('Read-space knowledge sharing')).toBeInTheDocument();
    expect(screen.getByText('engineeredsoftware/bitcode')).toBeInTheDocument();

    const [toggle] = screen.getAllByRole('checkbox');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByText(/All current and future Externals-approved repositories/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auxillaries/user/data-share',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
