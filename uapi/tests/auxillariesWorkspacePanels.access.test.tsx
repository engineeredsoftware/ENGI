import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import AuxillariesWorkspacePanels from '@/components/auxillaries/shared/AuxillariesWorkspacePanels/AuxillariesWorkspacePanels';

describe('AuxillariesWorkspacePanels', () => {
  it('renders contained auxillary panels with user-facing layer labels and only opens ready auxillaries', () => {
    const onStepClick = jest.fn();

    render(
      <AuxillariesWorkspacePanels
        steps={['externals', 'interfaces', 'profile', 'wallet']}
        currentStep="interfaces"
        availableSteps={['externals', 'interfaces', 'profile']}
        onStepClick={onStepClick}
      />,
    );

    expect(screen.getByRole('button', { name: 'Externals auxillary' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Interfaces auxillary' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Profile auxillary' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Wallet auxillary' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Interfaces auxillary' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Wallet auxillary' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByLabelText('Active auxillary')).toHaveAttribute('data-state', 'active');
    expect(screen.getByLabelText('Locked auxillary')).toHaveAttribute('data-state', 'locked');

    fireEvent.click(screen.getByRole('button', { name: 'Externals auxillary' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wallet auxillary' }));

    expect(onStepClick).toHaveBeenCalledTimes(1);
    expect(onStepClick).toHaveBeenCalledWith('externals');
  });
});
