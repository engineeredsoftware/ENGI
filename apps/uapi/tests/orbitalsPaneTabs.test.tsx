import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import AuxillariesPaneTabs from '@/components/auxillaries/shared/AuxillariesPaneTabs/AuxillariesPaneTabs';

describe('AuxillariesPaneTabs', () => {
  it('renders calmer auxillaries tabs and only fires for available steps', () => {
    const onStepClick = jest.fn();

    render(
      <AuxillariesPaneTabs
        mode="auxillaries"
        steps={['externals', 'interfaces', 'profile', 'wallet']}
        currentStep="externals"
        completedSteps={['externals']}
        availableSteps={['externals', 'interfaces', 'profile']}
        onStepClick={onStepClick}
      />,
    );

    expect(screen.getByText('Auxillaries')).toBeTruthy();
    expect(screen.getByText(/Active auxillary:/i)).toBeTruthy();
    expect(screen.getByText('1/4 complete')).toBeTruthy();
    expect(screen.getByRole('button', { name: /1 Externals/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /4 \$BTD/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /2 Interfaces/i }));
    fireEvent.click(screen.getByRole('button', { name: /4 \$BTD/i }));

    expect(onStepClick).toHaveBeenCalledTimes(1);
    expect(onStepClick).toHaveBeenCalledWith('interfaces');
  });
});
