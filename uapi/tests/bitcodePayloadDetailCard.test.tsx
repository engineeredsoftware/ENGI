import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import BitcodePayloadDetailCard from '@/components/bitcode/pipeline/BitcodePayloadDetailCard';

describe('BitcodePayloadDetailCard', () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders shared action pills in visual mode and keeps raw JSON available', () => {
    const onOpenVerification = jest.fn();

    render(
      <BitcodePayloadDetailCard
        kicker="Proof families"
        title="Bounded proof stays in activity detail"
        summary="Shared payload detail card for activity-proof reading."
        payload={{ proofStatus: 'ready', proofFamilies: [] }}
        rawLabel="Proof payload"
        actions={[{ label: 'Open verification', onClick: onOpenVerification }]}
      >
        <div>Visual proof detail</div>
      </BitcodePayloadDetailCard>,
    );

    expect(screen.getByText('Visual proof detail')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open verification' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Open verification' }));
    expect(onOpenVerification).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Raw JSON' }));

    expect(screen.queryByRole('button', { name: 'Open verification' })).toBeNull();
    expect(screen.getByText(/"proofStatus": "ready"/)).toBeTruthy();
  });
});
