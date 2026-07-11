import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import TerminalLiveSummaryStrip from '@/app/terminal/TerminalLiveSummaryStrip';

const mockUseTerminalShellBridge = jest.fn();

jest.mock('@/components/bitcode/pipeline/cards/BitcodeWorkspaceCard', () => ({
  __esModule: true,
  default: function MockTerminalWorkspaceCard({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <section>
        <h2>{title}</h2>
        {children}
      </section>
    );
  },
}));

jest.mock('@/components/bitcode/pipeline/models/workspace-explainers', () => ({
  TERMINAL_WORKSPACE_EXPLAINERS: {
    ledgerPulse: [],
  },
}));

jest.mock('@/app/terminal/terminal-shell-bridge', () => ({
  useTerminalShellBridge: () => mockUseTerminalShellBridge(),
}));

describe('TerminalLiveSummaryStrip', () => {
  beforeEach(() => {
    mockUseTerminalShellBridge.mockReset();
  });

  it('renders exact repository and settlement reconnect posture in the Terminal pulse', () => {
    mockUseTerminalShellBridge.mockReturnValue({
      snapshot: {
        summarySurface: [
          { label: 'Settlement posture', value: 'stale shell value' },
          { label: 'Active scenario', value: 'monorepo-auth-rollback' },
        ],
      },
    });

    render(
      <TerminalLiveSummaryStrip
        transactionReadiness={{
          label: 'wallet reconnect required',
          canTransact: true,
          canSettle: false,
        }}
        repositoryContext={{
          provider: 'github',
          connectionStatus: {
            connected: true,
            provider: 'github',
            valid: false,
          },
          inventorySource: 'stored_repository_inventory',
          selectedRepository: {
            id: 'repo-1',
            name: 'bitcode',
            fullName: 'bitcode/bitcode',
            owner: {
              id: 'org-1',
              username: 'bitcode',
            },
          },
        }}
      />,
    );

    expect(screen.getByText('Pinned operating signals')).toBeInTheDocument();
    expect(screen.getAllByText('Settlement posture').length).toBeGreaterThan(0);
    expect(screen.getAllByText('wallet reconnect required').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Repository posture').length).toBeGreaterThan(0);
    expect(screen.getAllByText('GitHub reconnect required · stored protocol inventory').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Repository anchor').length).toBeGreaterThan(0);
    expect(screen.getAllByText('bitcode/bitcode').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Active scenario').length).toBeGreaterThan(0);
    expect(screen.getAllByText('monorepo-auth-rollback').length).toBeGreaterThan(0);
    expect(screen.queryByText('stale shell value')).not.toBeInTheDocument();
  });
});
