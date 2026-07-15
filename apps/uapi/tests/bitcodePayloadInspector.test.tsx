import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import BitcodePayloadInspector from '@/components/bitcode/pipeline/BitcodePayloadInspector/BitcodePayloadInspector';

describe('BitcodePayloadInspector', () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('switches between visual content and raw payload content', async () => {
    render(
      <BitcodePayloadInspector
        kicker="Transaction payload"
        title="Visual and raw detail"
        summary="Carries a visual and raw payload view."
        payload={{ transactionId: 'txn-001', status: 'completed' }}
      >
        <div>Visual payload body</div>
      </BitcodePayloadInspector>,
    );

    expect(screen.getByText('Visual payload body')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Explain Visual and raw modes' })).toBeTruthy();
    expect(screen.getAllByText('Structured payload shape').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Payload field tree').length).toBeGreaterThan(0);
    expect(screen.getAllByText('transactionId').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Explain Raw payload view' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Explain Structured payload shape' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Explain Payload field tree' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Raw JSON' }));

    expect(screen.getByText(/"transactionId": "txn-001"/)).toBeTruthy();
    expect(screen.getByText(/4 lines/i)).toBeTruthy();
    expect(screen.queryByText('Visual payload body')).toBeNull();
    expect(screen.queryByText('Payload field tree')).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy JSON' }));
    });
    expect(global.navigator.clipboard.writeText).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Visual' }));

    expect(screen.getByText('Visual payload body')).toBeTruthy();
  });
});
