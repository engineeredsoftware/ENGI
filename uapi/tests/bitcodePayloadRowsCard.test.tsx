import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import BitcodePayloadRowsCard from '@/components/bitcode/execution/BitcodePayloadRowsCard';

describe('BitcodePayloadRowsCard', () => {
  it('renders shared payload detail with rows and actions', () => {
    const onInspect = jest.fn();

    render(
      <BitcodePayloadRowsCard
        kicker="Activity"
        title="Identity"
        summary="Shared rows carrier."
        payload={{ transactionId: 'txn-001', status: 'completed' }}
        rawLabel="Activity payload"
        rows={[
          { label: 'Activity id', value: 'txn-001' },
          { label: 'Status', value: 'completed' },
        ]}
        actions={[{ label: 'Inspect activity', onClick: onInspect }]}
      />,
    );

    expect(screen.getByText('Activity')).toBeTruthy();
    expect(screen.getByText('Identity')).toBeTruthy();
    expect(screen.getByText('Activity id')).toBeTruthy();
    expect(screen.getAllByText('txn-001').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Inspect activity' }));
    expect(onInspect).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Raw JSON' }));
    expect(screen.getByText(/"transactionId": "txn-001"/)).toBeTruthy();
  });
});
