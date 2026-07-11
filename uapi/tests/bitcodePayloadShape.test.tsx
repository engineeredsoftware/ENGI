import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodePayloadShape from '@/components/bitcode/execution/BitcodePayloadShape';

describe('BitcodePayloadShape', () => {
  it('summarizes object payloads through shared metrics and field previews', () => {
    render(
      <BitcodePayloadShape
        payload={{
          transactionId: 'txn-001',
          status: 'completed',
          participants: ['producer', 'consumer'],
          closure: { proofStatus: 'ready' },
        }}
      />,
    );

    expect(screen.getAllByText('Structured payload shape').length).toBeGreaterThan(0);
    expect(screen.getByText('Top-level fields')).toBeTruthy();
    expect(screen.getByText('Composite fields')).toBeTruthy();
    expect(screen.getByText('transactionId')).toBeTruthy();
    expect(screen.getByText('participants')).toBeTruthy();
    expect(screen.getAllByText('type: object').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Explain Structured payload shape' })).toBeTruthy();
  });

  it('summarizes array payloads through item previews', () => {
    render(
      <BitcodePayloadShape
        payload={[
          { id: 'txn-001', status: 'completed' },
          { id: 'txn-002', status: 'running' },
          'tail',
        ]}
      />,
    );

    expect(screen.getByText('Top-level items')).toBeTruthy();
    expect(screen.getByText('[0]')).toBeTruthy();
    expect(screen.getByText('[2]')).toBeTruthy();
    expect(screen.getByText('type: string')).toBeTruthy();
  });
});
