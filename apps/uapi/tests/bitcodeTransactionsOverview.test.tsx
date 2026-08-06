import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodeTransactionsOverview from '@/components/bitcode/pipeline/BitcodeTransactionsOverview/BitcodeTransactionsOverview';

describe('BitcodeTransactionsOverview', () => {
  it('renders the explicit transaction data mode and fallback explanation', () => {
    render(
      <BitcodeTransactionsOverview
        recordCount={3}
        ownTransactionCount={2}
        visibleTokenTotal={18420}
        selectedTransactionId="mock-run-branch-remediation"
        dataMode="review-fallback"
        statsReady
      />,
    );

    expect(screen.getByText('Activity')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('mode review fallback')).toBeTruthy();
    expect(screen.getByText(/live history is empty here/i)).toBeTruthy();
    expect(screen.getByText('selected activity active')).toBeTruthy();
    expect(screen.getByTestId('transactions-overview-stats')).toBeTruthy();
  });

  it('keeps fixed chip shells while stats load (labels stay; values pulse; no remount)', () => {
    render(
      <BitcodeTransactionsOverview
        recordCount={0}
        ownTransactionCount={0}
        visibleTokenTotal={0}
        selectedTransactionId={null}
        dataMode="live"
        statsReady={false}
      />,
    );

    const pending = screen.getByTestId('transactions-overview-stats-pending');
    expect(pending).toBeTruthy();
    expect(pending).toHaveAttribute('aria-busy', 'true');
    // Labels stay mounted so y-geometry never changes when values arrive.
    expect(screen.getByText('Activity')).toBeTruthy();
    expect(screen.getByText('Own visible')).toBeTruthy();
    expect(screen.getByText('Visible tokens')).toBeTruthy();
    // Three fixed chip shells.
    expect(pending.children.length).toBe(3);
    // Numeric values withheld until ready.
    expect(screen.queryByText('0')).toBeNull();
    // State pills remain available while stats load.
    expect(screen.getByText('selected none')).toBeTruthy();
  });
});
