import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodeInlineExplainer from '@/components/bitcode/execution/BitcodeInlineExplainer';
import type { BitcodeExplainer } from '@/components/bitcode/execution/bitcode-transaction-types';

const EXPLAINER: BitcodeExplainer = {
  kicker: 'Option synthesis',
  title: 'Protected IP exclusions (one per line)',
  summary: 'The hard, fail-closed boundary for excluded paths.',
};

describe('BitcodeInlineExplainer — triggerAriaLabel override (aria-label collision fix)', () => {
  it('defaults to "Explain {title}" when no override is given', () => {
    render(<BitcodeInlineExplainer explainer={EXPLAINER} />);
    expect(
      screen.getByRole('button', { name: 'Explain Protected IP exclusions (one per line)' }),
    ).toBeInTheDocument();
  });

  it('uses the override so it no longer collides with an adjacent field\'s own label text', () => {
    // Regression: the default "Explain {title}" label repeats the field's own
    // label verbatim, so getByLabelText(/Protected IP exclusions/) (or a
    // screen reader's label lookup) ambiguously matches BOTH the field and
    // this trigger button. A distinct override avoids the collision.
    render(
      <div>
        <label htmlFor="protected-ip-exclusions">Protected IP exclusions (one per line)</label>
        <textarea id="protected-ip-exclusions" />
        <BitcodeInlineExplainer explainer={EXPLAINER} triggerAriaLabel="More info about this field" />
      </div>,
    );

    expect(screen.getByLabelText('Protected IP exclusions (one per line)').tagName).toBe('TEXTAREA');
    expect(screen.getByRole('button', { name: 'More info about this field' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Explain/ })).not.toBeInTheDocument();
  });
});
