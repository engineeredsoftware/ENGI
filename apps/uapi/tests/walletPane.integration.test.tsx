import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

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

  it('submits merged $BTD defaults through the auxillaries pane', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: /organization/i }));
    fireEvent.click(
      screen.getByRole('button', {
        name: /replay bias toward replayable accounting and witness detail\./i,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: /proofs/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          existingSetting: 'keep-me',
          btdDefaults: expect.objectContaining({
            shareLens: 'organization',
            settlementView: 'replay',
            btdDetailView: 'proofs',
          }),
        }),
      );
    });
    expect(onCompletionStatusChange).toHaveBeenCalledWith(true);
  });
});
