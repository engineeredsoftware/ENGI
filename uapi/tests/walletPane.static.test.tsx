import React from 'react';
import { renderToString } from 'react-dom/server';

import WalletPane from '@/app/auxillaries/components/AuxillariesWalletPane';
import { useAuth } from '@/components/bitcode/auth/AuthProvider';
import { useUserData } from '@/hooks/useUserData';

jest.mock('@/components/bitcode/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

jest.mock('@bitcode/orm', () => ({
  readBitcodeWalletBindingFromProfile: jest.fn(() => null),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

describe('WalletPane SSR Onboarding View', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    } as any);

    mockUseUserData.mockReturnValue({
      data: null,
      hasGitHubConnection: false,
      btdBalance: 0,
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      isOnboardingComplete: false,
      onboardedSteps: [],
    } as any);
  });

  it('renders the unauthenticated Wallet auxillary posture', () => {
    const html = renderToString(
      <WalletPane
        onSave={() => {}}
        loading={false}
        onCompletionStatusChange={() => {}}
      />,
    );

    expect(html).toContain('Wallet Auxillary');
    expect(html).toContain('Connect Bitcoin wallet');
    expect(html).toContain('Stage Bitcoin address');
  });
});
