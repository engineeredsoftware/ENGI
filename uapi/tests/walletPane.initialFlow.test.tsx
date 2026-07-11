import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import WalletPane from '@/components/auxillaries/AuxillariesWalletPane/AuxillariesWalletPane';
import { useAuth } from '@/components/bitcode/auth/AuthProvider/AuthProvider';
import { useUserData } from '@/hooks/useUserData';

jest.mock('@/components/auxillaries/AuxillariesDataSharingPanel/AuxillariesDataSharingPanel', () => ({
  __esModule: true,
  default: function MockDataSharingPanel() {
    return null;
  },
}));

jest.mock('@/components/bitcode/auth/AuthProvider/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

describe('WalletPane Returning User Flow', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, repos: [] }),
    }) as jest.Mock;

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
      btdBalance: 200,
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

  it('calls onCompletionStatusChange(true) when the operator is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email_confirmed_at: '2026-04-18T12:00:00.000Z',
      },
      loading: false,
    } as any);

    const onCompletionStatusChange = jest.fn();
    render(
      <WalletPane
        onSave={() => {}}
        loading={false}
        onCompletionStatusChange={onCompletionStatusChange}
      />,
    );

    expect(onCompletionStatusChange).toHaveBeenCalledWith(true);
  });

  it('calls onCompletionStatusChange(false) when the operator is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    } as any);
    mockUseUserData.mockReturnValue({
      data: {
        profile: {},
        modelPreferences: {},
      },
      hasGitHubConnection: true,
      btdBalance: 0,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: false,
      onboardedSteps: [],
    } as any);

    const onCompletionStatusChange = jest.fn();
    render(
      <WalletPane
        onSave={() => {}}
        loading={false}
        onCompletionStatusChange={onCompletionStatusChange}
      />,
    );

    expect(onCompletionStatusChange).toHaveBeenCalledWith(false);
  });
});
