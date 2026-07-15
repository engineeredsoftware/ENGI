import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import BitcodePayloadCollectionCard from '@/components/bitcode/pipeline/BitcodePayloadCollectionCard/BitcodePayloadCollectionCard';

describe('BitcodePayloadCollectionCard', () => {
  it('renders shared payload detail with collection items and actions', () => {
    const onOpenProofs = jest.fn();

    render(
      <BitcodePayloadCollectionCard
        kicker="Proof families"
        title="Shared collection card"
        summary="Shared collection carrier."
        payload={{ proofFamilies: [{ label: 'selection-materialization' }] }}
        rawLabel="Proof payload"
        items={[
          {
            id: 'selection-materialization',
            title: 'selection-materialization',
            summary: 'passed · replay 3',
            supportingText: '.proofs/_shared/selection-and-materialization-proof.json',
          },
        ]}
        actions={[{ label: 'Open proofs', onClick: onOpenProofs }]}
      />,
    );

    expect(screen.getByText('Proof families')).toBeTruthy();
    expect(screen.getByText('Shared collection card')).toBeTruthy();
    expect(screen.getAllByText('selection-materialization').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Open proofs' }));
    expect(onOpenProofs).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Raw JSON' }));
    expect(screen.getByText(/"proofFamilies"/)).toBeTruthy();
  });
});
