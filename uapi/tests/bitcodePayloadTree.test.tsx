import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodePayloadTree from '@/components/bitcode/pipeline/BitcodePayloadTree';

describe('BitcodePayloadTree', () => {
  it('renders a nested payload tree with shared explainer copy', () => {
    render(
      <BitcodePayloadTree
        payload={{
          transactionId: 'txn-001',
          closure: {
            proofs: [{ artifact: 'proof.json', status: 'ready' }],
          },
        }}
      />,
    );

    expect(screen.getAllByText('Payload field tree').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Explain Payload field tree' })).toBeTruthy();
    expect(screen.getByText('root')).toBeTruthy();
    expect(screen.getByText('transactionId')).toBeTruthy();
    expect(screen.getByText('closure')).toBeTruthy();
    expect(screen.getByText('proofs')).toBeTruthy();
  });

  it('bounds the rendered branch width per level', () => {
    render(
      <BitcodePayloadTree
        payload={{
          first: 'one',
          second: 'two',
          third: 'three',
          fourth: 'four',
        }}
        maxChildrenPerLevel={2}
      />,
    );

    expect(screen.getByText('+2 more fields remain in this payload branch.')).toBeTruthy();
  });
});
