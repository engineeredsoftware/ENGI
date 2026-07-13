import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import BitcoinWalletAuthorizeClient from '@/app/tps/wallet/authorize/BitcoinWalletAuthorizeClient';
import { inspectBitcoinWalletProviders } from '@bitcode/auth/bitcoin-wallet-client';

jest.mock('@bitcode/auth/bitcoin-wallet-client', () => ({
  connectBitcoinWallet: jest.fn(),
  inspectBitcoinWalletProviders: jest.fn(),
}));

jest.mock('@bitcode/auth/wallet-local', () => ({
  writeLocalBitcodeWalletIdentity: jest.fn(),
}));

jest.mock('@bitcode/auth/qa-telemetry', () => ({
  bitcodeQaTelemetry: jest.fn(),
  compactBitcodeAddress: (value: string | null | undefined) => value ?? null,
}));

const inspectProviders = inspectBitcoinWalletProviders as jest.MockedFunction<typeof inspectBitcoinWalletProviders>;

function renderAuthorize(overrides: Partial<React.ComponentProps<typeof BitcoinWalletAuthorizeClient>> = {}) {
  return render(
    <BitcoinWalletAuthorizeClient
      clientId="bitcode-bitcoin-wallet"
      redirectUri="https://tkpyosihuouusyaxtbau.supabase.co/auth/v1/callback"
      responseType="code"
      state="state-1"
      scope="profile wallet:bitcoin"
      codeChallenge="challenge"
      codeChallengeMethod="S256"
      walletProviderHint=""
      {...overrides}
    />,
  );
}

describe('BitcoinWalletAuthorizeClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps a hinted provider-specific fallback when the first scan is empty', async () => {
    inspectProviders.mockResolvedValue([]);

    renderAuthorize({ walletProviderHint: 'leather' });

    await waitFor(() => {
      expect(screen.getByText('No compatible Bitcoin wallet provider was detected.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Continue with Leather' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rescan wallets' })).toBeInTheDocument();
  });

  it('can rescan and render wallet-specific choices after delayed extension injection', async () => {
    inspectProviders
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 'leather', label: 'Leather' },
        { id: 'xverse', label: 'Xverse' },
      ]);

    renderAuthorize();

    await waitFor(() => {
      expect(screen.getByText('No compatible Bitcoin wallet provider was detected.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Rescan wallets' }));

    await waitFor(() => {
      expect(screen.getByText('Detected Leather, Xverse')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Continue with Leather' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Xverse' })).toBeInTheDocument();
  });
});
