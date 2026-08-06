import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VCSIntegrationPanel } from '../VCSIntegrationPanel';

// Mock child components
jest.mock('../VCSConnectionCard', () => ({
  VCSConnectionCard: ({ provider, onConnectionChange }: any) => (
    <div data-testid={`vcs-card-${provider}`}>
      <button 
        data-testid={`vcs-card-button-${provider}`}
        onClick={() => onConnectionChange?.(true)}
      >
        {provider} Card
      </button>
    </div>
  )
}));

// Mock icons
jest.mock('lucide-react', () => ({
  GitBranch: () => <div data-testid="git-branch-icon" />,
  Server: () => <div data-testid="server-icon" />,
  Info: () => <div data-testid="info-icon" />,
}));

describe('VCSIntegrationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering providers', () => {
    test('renders GitHub by default', () => {
      render(<VCSIntegrationPanel />);

      // Section intro is owned by Externals Repository connection subtitle.
      expect(screen.queryByText('Version Control System Integrations')).not.toBeInTheDocument();
      expect(screen.getByText(/GitHub App/i)).toBeInTheDocument();

      expect(screen.getByTestId('vcs-card-github')).toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-gitlab')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-bitbucket')).not.toBeInTheDocument();
    });

    test('renders only GitHub when specified', () => {
      render(
        <VCSIntegrationPanel 
          showGitHub={true}
          showGitLab={false}
          showBitbucket={false}
        />
      );

      expect(screen.getByTestId('vcs-card-github')).toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-gitlab')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-bitbucket')).not.toBeInTheDocument();
    });

    test('renders only GitLab when specified', () => {
      render(
        <VCSIntegrationPanel 
          showGitHub={false}
          showGitLab={true}
          showBitbucket={false}
        />
      );

      expect(screen.queryByTestId('vcs-card-github')).not.toBeInTheDocument();
      expect(screen.getByTestId('vcs-card-gitlab')).toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-bitbucket')).not.toBeInTheDocument();
    });

    test('renders only Bitbucket when specified', () => {
      render(
        <VCSIntegrationPanel 
          showGitHub={false}
          showGitLab={false}
          showBitbucket={true}
        />
      );

      expect(screen.queryByTestId('vcs-card-github')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-gitlab')).not.toBeInTheDocument();
      expect(screen.getByTestId('vcs-card-bitbucket')).toBeInTheDocument();
    });

    test('renders multiple providers when specified', () => {
      render(
        <VCSIntegrationPanel 
          showGitHub={true}
          showGitLab={true}
          showBitbucket={false}
        />
      );

      expect(screen.getByTestId('vcs-card-github')).toBeInTheDocument();
      expect(screen.getByTestId('vcs-card-gitlab')).toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-bitbucket')).not.toBeInTheDocument();
    });

    test('renders nothing when all providers are hidden', () => {
      render(
        <VCSIntegrationPanel 
          showGitHub={false}
          showGitLab={false}
          showBitbucket={false}
        />
      );

      expect(screen.getByText('No VCS providers enabled')).toBeInTheDocument();
      
      // But no provider cards
      expect(screen.queryByTestId('vcs-card-github')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-gitlab')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-bitbucket')).not.toBeInTheDocument();
    });
  });

  describe('Connection callbacks', () => {
    test('calls onConnectionChange for GitHub', () => {
      const onConnectionChange = jest.fn();
      
      render(
        <VCSIntegrationPanel
          showGitHub={true}
          showGitLab={false}
          showBitbucket={false}
          onConnectionChange={onConnectionChange}
        />
      );

      fireEvent.click(screen.getByTestId('vcs-card-button-github'));

      expect(onConnectionChange).toHaveBeenCalledWith('github', true);
    });

    test('calls onConnectionChange for GitLab', () => {
      const onConnectionChange = jest.fn();
      
      render(
        <VCSIntegrationPanel
          showGitHub={false}
          showGitLab={true}
          showBitbucket={false}
          onConnectionChange={onConnectionChange}
        />
      );

      fireEvent.click(screen.getByTestId('vcs-card-button-gitlab'));

      expect(onConnectionChange).toHaveBeenCalledWith('gitlab', true);
    });

    test('calls onConnectionChange for Bitbucket', () => {
      const onConnectionChange = jest.fn();
      
      render(
        <VCSIntegrationPanel
          showGitHub={false}
          showGitLab={false}
          showBitbucket={true}
          onConnectionChange={onConnectionChange}
        />
      );

      fireEvent.click(screen.getByTestId('vcs-card-button-bitbucket'));

      expect(onConnectionChange).toHaveBeenCalledWith('bitbucket', true);
    });

    test('does not call onConnectionChange if not provided', () => {
      render(<VCSIntegrationPanel />);

      // Should not throw error
      fireEvent.click(screen.getByTestId('vcs-card-button-github'));
    });
  });

  describe('Layout and styling', () => {
    test('applies correct CSS classes', () => {
      const { container } = render(<VCSIntegrationPanel />);

      const panel = container.firstChild;
      expect(panel).toHaveClass('space-y-6');

      const cardsContainer = screen.getByTestId('vcs-card-github').parentElement;
      expect(cardsContainer).toHaveClass('grid', 'gap-4');
    });

    test('renders the recommended GitHub App guidance', () => {
      render(<VCSIntegrationPanel />);

      expect(screen.getByText('Recommended')).toBeInTheDocument();
      const alert = screen.getByText('Recommended').closest('div');
      expect(alert).not.toBeNull();
      expect(within(alert!).getByTestId('info-icon')).toBeInTheDocument();
    });

    test('is controls-only without a stacked VCSI heading', () => {
      render(<VCSIntegrationPanel />);

      expect(screen.queryByText('Version Control System Integrations')).not.toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /GitHub App/i })).toBeInTheDocument();
    });
  });

  describe('Provider order', () => {
    test('maintains consistent provider order', () => {
      const { container } = render(<VCSIntegrationPanel />);

      const cards = container.querySelectorAll('[data-testid^="vcs-card-"]');
      expect(cards).toHaveLength(1);
      
      expect(cards[0]).toHaveAttribute('data-testid', 'vcs-card-github');
    });
  });

  describe('Accessibility', () => {
    test('uses semantic HTML structure', () => {
      render(<VCSIntegrationPanel />);

      // Tabs + card actions — intro heading lives on the Externals section.
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    test('provides descriptive text for screen readers', () => {
      render(<VCSIntegrationPanel />);

      expect(screen.getByText(/Recommended/i)).toBeInTheDocument();
      expect(
        screen.getByText(/installation-scoped connection needed for permitted repository reads/i),
      ).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    test('handles rapid connection changes', async () => {
      const onConnectionChange = jest.fn();
      
      render(
        <VCSIntegrationPanel
          showGitHub={true}
          showGitLab={true}
          showBitbucket={true}
          onConnectionChange={onConnectionChange}
        />
      );

      // Rapidly click multiple providers
      fireEvent.click(screen.getByTestId('vcs-card-button-github'));
      fireEvent.click(screen.getByTestId('vcs-card-button-gitlab'));
      fireEvent.click(screen.getByTestId('vcs-card-button-bitbucket'));

      await waitFor(() => {
        expect(onConnectionChange).toHaveBeenCalledTimes(3);
      });

      expect(onConnectionChange).toHaveBeenNthCalledWith(1, 'github', true);
      expect(onConnectionChange).toHaveBeenNthCalledWith(2, 'gitlab', true);
      expect(onConnectionChange).toHaveBeenNthCalledWith(3, 'bitbucket', true);
    });

    test('handles undefined show props gracefully', () => {
      render(
        <VCSIntegrationPanel 
          showGitHub={undefined}
          showGitLab={undefined}
          showBitbucket={undefined}
        />
      );

      // Should default to GitHub only.
      expect(screen.getByTestId('vcs-card-github')).toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-gitlab')).not.toBeInTheDocument();
      expect(screen.queryByTestId('vcs-card-bitbucket')).not.toBeInTheDocument();
    });
  });
});
