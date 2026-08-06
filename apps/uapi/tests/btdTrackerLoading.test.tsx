import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { BTDTracker } from '@/components/bitcode/btd/BtdTracker/BtdTracker';

jest.mock('@/components/bitcode/auth/AuthProvider/AuthProvider', () => ({
  useAuth: () => ({
    user: {
      id: 'mock-bitcode-review-user',
      email: 'reviewer@bitcode.ai',
    },
  }),
}));

jest.mock('@/components/bitcode/branding/Logo/Logo', () => ({
  __esModule: true,
  default: () => <span data-testid="mock-bitcode-logo" />,
}));

describe('BTDTracker loading posture', () => {
  it('uses an integrated wallet-reading state before BTD and APs hydrate', () => {
    render(<BTDTracker btdBalance={0} btcFeeBalance={null} isLoading />);

    expect(
      screen.getByLabelText(/Reading BTD and APs posture/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Reading wallet').length).toBeGreaterThan(0);
  });

  it('renders hydrated BTD and APs count as "# LABEL" (not BTC) after user data resolves', () => {
    render(
      <BTDTracker
        btdBalance={1200}
        btcFeeBalance={0.042}
        recentBtdAssetPacks={[
          { assetPackId: 'pack-a', label: 'Alpha' },
          { assetPackId: 'pack-b', label: 'Beta' },
        ]}
        isLoading={false}
        walletAddress="tb1qbitcodemockoperator0000000000000000000000"
        walletProvider="leather"
      />,
    );

    expect(
      screen.getByLabelText(
        /1,200 BTD; 2 APs\. Open BTD wallet auxillary for leather/i,
      ),
    ).toBeInTheDocument();
    // Visible + hidden measure spans both carry the default BTD|APs tokens.
    expect(screen.getAllByText('1,200 BTD').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2 APs').length).toBeGreaterThan(0);
    expect(screen.queryByText(/\bBTC\b/)).not.toBeInTheDocument();
  });
});
