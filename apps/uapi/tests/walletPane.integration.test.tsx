import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

import WalletPane from '@/components/auxillaries/AuxillariesWalletPane/AuxillariesWalletPane';
import { useAuth } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import { useUserData } from '@/hooks/useUserData';

jest.mock('@/components/bitcode/auth/AuthProvider/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

describe('WalletPane interactions', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, repos: [] }),
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
          team_members: [{ id: 'tm-1', display_name: 'Lin Ortega', role: 'admin' }],
        },
        modelPreferences: {
          existingSetting: 'keep-me',
          btdDefaults: {
            shareLens: 'account',
            settlementView: 'bounded',
            btdDetailView: 'transactions',
            automationBias: 'review-first',
            walletSync: 'manual',
          },
        },
      },
      hasGitHubConnection: true,
      btdBalance: 1200,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: false,
      onboardedSteps: ['profile', 'externals', 'interfaces'],
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps share posture controls hidden while still marking the wallet step complete', async () => {
    const onSave = jest.fn();
    const onCompletionStatusChange = jest.fn();

    render(
      <WalletPane
        onSave={onSave}
        loading={false}
        onCompletionStatusChange={onCompletionStatusChange}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText('loading…')).not.toBeInTheDocument();
    });

    // Share posture preference cards stay in code but are hidden for now.
    expect(
      screen.queryByRole('heading', {
        name: /Choose how \$BTD detail should read back into transactions/i,
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /organization/i })).not.toBeInTheDocument();
    expect(onCompletionStatusChange).toHaveBeenCalledWith(true);
  });
});
