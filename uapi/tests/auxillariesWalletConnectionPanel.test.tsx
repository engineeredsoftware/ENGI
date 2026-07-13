import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AuxillariesWalletConnectionPanel from '@/components/auxillaries/AuxillariesWalletConnectionPanel/AuxillariesWalletConnectionPanel';
import { BITCODE_LOCAL_WALLET_STORAGE_KEY } from '@bitcode/auth/wallet-local';
import { mutateUserData } from '@/hooks/useUserData';

const signOut = jest.fn(async () => ({ error: null }));

jest.mock('@bitcode/supabase/ssr/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(async () => ({ data: { user: null } })),
      signOut,
      signInWithOAuth: jest.fn(),
    },
  })),
}));

jest.mock('@/hooks/useUserData', () => ({
  mutateUserData: jest.fn(async () => undefined),
}));

jest.mock('@bitcode/auth/bitcoin-wallet-client', () => ({
  inspectBitcoinWalletProviders: jest.fn(async () => [
    { id: 'leather', label: 'Leather', detected: true },
  ]),
  connectBitcoinWallet: jest.fn(),
}));

const mockMutateUserData = mutateUserData as jest.MockedFunction<typeof mutateUserData>;

describe('AuxillariesWalletConnectionPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://tkpyosihuouusyaxtbau.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'publishable-credential-placeholder';
  });

  it('clears the Bitcode wallet session without claiming extension-level disconnect', async () => {
    const onWalletIdentityChange = jest.fn();
    window.localStorage.setItem(
      BITCODE_LOCAL_WALLET_STORAGE_KEY,
      JSON.stringify({
        address: 'tb1p6x9nmz5we6wc2',
        provider: 'leather',
        network: 'testnet',
        status: 'pending',
        connectedAt: '2026-05-13T14:24:00.000Z',
        proofKind: 'bitcoin_message_signature',
        persistence: 'local',
      }),
    );

    render(
      <AuxillariesWalletConnectionPanel
        initialWalletAddress="tb1p6x9nmz5we6wc2"
        initialWalletProvider="leather"
        initialWalletBindingStatus="pending"
        initialWalletBoundAt="2026-05-13T14:24:00.000Z"
        onWalletIdentityChange={onWalletIdentityChange}
      />,
    );

    fireEvent.click(screen.getByTestId('wallet-disconnect-bitcode'));

    await waitFor(() => {
      expect(window.localStorage.getItem(BITCODE_LOCAL_WALLET_STORAGE_KEY)).toBeNull();
      expect(signOut).toHaveBeenCalled();
      expect(mockMutateUserData).toHaveBeenCalled();
      expect(onWalletIdentityChange).toHaveBeenCalledWith(false);
    });

    expect(
      screen.getByText(/Leather or Xverse may still show this site as connected until you revoke it inside the wallet extension/i),
    ).toBeInTheDocument();
  });
});
