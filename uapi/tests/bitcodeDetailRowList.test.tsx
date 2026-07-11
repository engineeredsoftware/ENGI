import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodeDetailRowList from '@/components/bitcode/pipeline/BitcodeDetailRowList/BitcodeDetailRowList';

describe('BitcodeDetailRowList', () => {
  it('renders key-value rows', () => {
    render(
      <BitcodeDetailRowList
        rows={[
          { label: 'Activity id', value: 'tx-001' },
          { label: 'Branch', value: 'bitcode/refit' },
        ]}
      />,
    );

    expect(screen.getByText('Activity id')).toBeTruthy();
    expect(screen.getByText('tx-001')).toBeTruthy();
    expect(screen.getByText('Branch')).toBeTruthy();
    expect(screen.getByText('bitcode/refit')).toBeTruthy();
  });

  it('renders the empty message when no rows are present', () => {
    render(<BitcodeDetailRowList rows={[]} emptyMessage="No activity rows are available." />);

    expect(screen.getByText('No activity rows are available.')).toBeTruthy();
  });
});
