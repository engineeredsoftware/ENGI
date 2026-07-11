import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodeMetricGrid from '@/components/bitcode/pipeline/BitcodeMetricGrid';

describe('BitcodeMetricGrid', () => {
  it('renders metrics in a shared grid carrier', () => {
    render(
      <BitcodeMetricGrid
        metrics={[
          { label: 'Shippable surfaces', value: '4' },
          { label: 'Proof posture', value: 'bounded proof ready' },
        ]}
      />,
    );

    expect(screen.getByText('Shippable surfaces')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('Proof posture')).toBeTruthy();
    expect(screen.getByText('bounded proof ready')).toBeTruthy();
  });

  it('renders the empty message when no metrics are present', () => {
    render(<BitcodeMetricGrid metrics={[]} emptyMessage="No metrics are visible yet." />);

    expect(screen.getByText('No metrics are visible yet.')).toBeTruthy();
  });
});
