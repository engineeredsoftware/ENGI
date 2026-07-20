import React from 'react';
import { renderToString } from 'react-dom/server';

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

describe('WalletPane (SSR)', () => {
  beforeEach(() => {
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
          btc_balance: '0.250',
          team_members: [{ id: 'tm-1', display_name: 'Lin Ortega', role: 'admin' }],
        },
        modelPreferences: {
          btdDefaults: {
            shareLens: 'organization',
            settlementView: 'replay',
            btdDetailView: 'proofs',
            automationBias: 'decisive',
            walletSync: 'live',
          },
        },
      },
      hasGitHubConnection: true,
      btdBalance: 250,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: true,
      onboardedSteps: ['profile', 'externals', 'interfaces', 'wallet'],
    } as any);
  });

  it('renders the authenticated Wallet auxillary summary and wallet posture controls', () => {
    const html = renderToString(
      <WalletPane
        onSave={() => {}}
        loading={false}
        isOnboardingComplete
        onCompletionStatusChange={() => {}}
      />,
    );

    expect(html).toContain('Wallet Auxillary');
    expect(html).toContain(
      'Keep pay-rail fees, BTD holdings, and wallet identity readable together',
    );
    expect(html).toContain('250 BTD');
    expect(html).toContain('0.25 BTC');
    // Share posture preference cards stay in code but are hidden for now.
    expect(html).not.toContain('Choose how $BTD detail should read back into transactions');
  });
});
