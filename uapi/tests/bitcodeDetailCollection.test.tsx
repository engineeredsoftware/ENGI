import React from 'react';
import { render, screen } from '@testing-library/react';

import BitcodeDetailCollection from '@/components/bitcode/pipeline/BitcodeDetailCollection/BitcodeDetailCollection';

describe('BitcodeDetailCollection', () => {
  it('renders collection items with title, summary, and supporting text', () => {
    render(
      <BitcodeDetailCollection
        items={[
          {
            id: 'selection-materialization',
            title: 'selection-materialization',
            summary: 'passed · replay 3',
            supportingText: '.bitcode/selection-and-materialization-proof.json',
          },
        ]}
      />,
    );

    expect(screen.getByText('selection-materialization')).toBeTruthy();
    expect(screen.getByText('passed · replay 3')).toBeTruthy();
    expect(screen.getByText('.bitcode/selection-and-materialization-proof.json')).toBeTruthy();
  });

  it('renders an empty message when there are no items', () => {
    render(<BitcodeDetailCollection items={[]} emptyMessage="No items remain on this transaction." />);

    expect(screen.getByText('No items remain on this transaction.')).toBeTruthy();
  });
});
