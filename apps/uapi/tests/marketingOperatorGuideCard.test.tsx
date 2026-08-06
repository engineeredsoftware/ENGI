import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import MarketingOperatorGuideCard from '@/components/marketing/MarketingOperatorGuideCard/MarketingOperatorGuideCard';
import { MARKETING_OPERATOR_GUIDE_SOURCE } from '@/components/marketing/MarketingOperatorGuideAssets/marketing-operator-guide-assets';

describe('MarketingOperatorGuideCard', () => {
  it('renders the Bitcode operator guide posture', async () => {
    render(
      <MarketingOperatorGuideCard
        initialSourcePlayable
        initialSourceResolved
      />,
    );

    expect(
      await screen.findByRole('button', { name: /Recorded operator walkthrough/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Use the walkthrough when you want the commercial flow narrated before you open Deposit, Read, or Exchange.',
      ),
    ).toBeInTheDocument();
  });

  it('falls back cleanly when no operator guide asset is available', async () => {
    render(<MarketingOperatorGuideCard initialSourceResolved />);

    expect(await screen.findByText('Walkthrough')).toBeInTheDocument();
    expect(
      await screen.findByText(
        'The recorded walkthrough is being refreshed. Use the docs chapters and the Exchange activity ledger while the next capture is published.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open Exchange' }),
    ).toHaveAttribute('href', '/exchange');
  });

  it('resolves only the Bitcode guide media source', () => {
    expect(MARKETING_OPERATOR_GUIDE_SOURCE.src).toBe('/videos/bitcode-operator-guide.mp4');
    expect(MARKETING_OPERATOR_GUIDE_SOURCE.relativeSourcePath).toBe(
      'public/videos/bitcode-operator-guide.mp4',
    );
  });
});
