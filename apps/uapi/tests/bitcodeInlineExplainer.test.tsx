import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodeInlineExplainer from '@/components/bitcode/pipeline/BitcodeInlineExplainer/BitcodeInlineExplainer';

describe('BitcodeInlineExplainer', () => {
  it('renders current source and current canon reference groups', () => {
    render(
      <BitcodeInlineExplainer
        explainer={{
          title: 'Transaction readiness',
          summary: 'Shared readiness posture for Bitcode branch, deposit, and closure actions.',
          detail: 'Review continuity stays open, but transactable actions fail closed until readiness is complete.',
          references: {
            source: ['apps/uapi/components/bitcode/pipeline/'],
            canon: ['BITCODE_SPEC_V26.md § Wallet and signed transaction posture'],
          },
        }}
      />,
    );

    expect(screen.getByLabelText('Explain Transaction readiness')).toBeTruthy();
    expect(screen.getByText('Current source')).toBeTruthy();
    expect(screen.getByText('apps/uapi/components/bitcode/pipeline/')).toBeTruthy();
    expect(screen.getByText('Current canon')).toBeTruthy();
    expect(screen.getByText('BITCODE_SPEC_V26.md § Wallet and signed transaction posture')).toBeTruthy();
  });
});
