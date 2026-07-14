import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import AuxillariesWorkspacePanels from '@/components/auxillaries/shared/AuxillariesWorkspacePanels/AuxillariesWorkspacePanels';

describe('AuxillariesWorkspacePanels', () => {
  it('renders lane state as visual indicators instead of joined raw state text', () => {
    render(
      <AuxillariesWorkspacePanels
        steps={['externals', 'interfaces', 'profile', 'wallet']}
        currentStep="profile"
        availableSteps={['externals', 'interfaces', 'profile', 'wallet']}
        onStepClick={jest.fn()}
      />,
    );

    expect(screen.queryByText(/laneactive/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/laneready/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^active$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^ready$/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Active auxillary')).toHaveAttribute('data-state', 'active');
    expect(screen.getAllByLabelText('Ready auxillary')).toHaveLength(3);
  });

  it('renders one-word feature pills on each selector card', () => {
    render(
      <AuxillariesWorkspacePanels
        steps={['wallet', 'externals', 'profile', 'interfaces']}
        currentStep="wallet"
        availableSteps={['wallet', 'externals', 'profile', 'interfaces']}
        onStepClick={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Wallet key features')).toBeInTheDocument();
    expect(screen.getByText('Providers')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Identity')).toBeInTheDocument();
    expect(screen.getByText('MCP')).toBeInTheDocument();
  });
});
