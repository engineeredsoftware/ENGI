import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import BitcodeDetailPanel from '@/components/bitcode/execution/BitcodeDetailPanel';

describe('BitcodeDetailPanel', () => {
  it('renders summary, metrics, rows, and action follow-through', () => {
    const onAction = jest.fn();

    render(
      <BitcodeDetailPanel
        badge="master"
        title="Bitcode Terminal"
        summary="Search, filter, and inspect Bitcode activity inside the Bitcode Terminal."
        metrics={[
          { label: 'Status', value: 'completed' },
          { label: 'Started', value: 'Apr 16, 12:00 PM' },
        ]}
        rows={[
          { label: 'Activity id', value: 'tx-001' },
          { label: 'Repository', value: 'bitcode/bitcode' },
        ]}
        tagLabel="substructure"
        actionLabel="Open Bitcode Terminal"
        onAction={onAction}
      />,
    );

    expect(screen.getByText('master')).toBeTruthy();
    expect(screen.getByText('Bitcode Terminal')).toBeTruthy();
    expect(screen.getByText('Search, filter, and inspect Bitcode activity inside the Bitcode Terminal.')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.getByText('completed')).toBeTruthy();
    expect(screen.getByText('Activity id')).toBeTruthy();
    expect(screen.getByText('tx-001')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Open Bitcode Terminal' }));

    expect(onAction).toHaveBeenCalled();
  });
});
