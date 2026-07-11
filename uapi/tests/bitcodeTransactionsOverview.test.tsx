import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodeTransactionsOverview from '@/components/bitcode/execution/BitcodeTransactionsOverview';

describe('BitcodeTransactionsOverview', () => {
  it('renders the explicit transaction data mode and fallback explanation', () => {
    render(
      <BitcodeTransactionsOverview
        recordCount={3}
        ownTransactionCount={2}
        visibleTokenTotal={18420}
        selectedTransactionId="mock-run-branch-remediation"
        dataMode="review-fallback"
      />,
    );

    expect(screen.getByText('Activity')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('mode review fallback')).toBeTruthy();
    expect(screen.getByText(/live history is empty here/i)).toBeTruthy();
    expect(screen.getByText('selected activity active')).toBeTruthy();
  });
});
