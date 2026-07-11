import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { BTDTracker } from '@/components/bitcode/btd/btd-tracker';

jest.mock('@/components/bitcode/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: {
      id: 'mock-bitcode-review-user',
      email: 'reviewer@bitcode.ai',
    },
  }),
}));

jest.mock('@/components/bitcode/branding/logo', () => ({
  __esModule: true,
  default: () => <span data-testid="mock-bitcode-logo" />,
}));

describe('BTDTracker loading posture', () => {
  it('uses an integrated wallet-reading state before BTC and BTD values hydrate', () => {
    render(<BTDTracker btdBalance={0} btcFeeBalance={null} isLoading />);

    expect(
      screen.getByLabelText(/Reading BTC and BTD wallet posture/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Reading wallet').length).toBeGreaterThan(0);
  });

  it('renders hydrated BTC and BTD values after user data resolves', () => {
    render(
      <BTDTracker
        btdBalance={1200}
        btcFeeBalance={0.042}
        isLoading={false}
        walletAddress="tb1qbitcodemockoperator0000000000000000000000"
        walletProvider="leather"
      />,
    );

    expect(screen.getByLabelText(/0.042 BTC; 1,200 BTD\. Open BTD wallet auxillary for leather/i)).toBeInTheDocument();
  });
});
