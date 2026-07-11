import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import TerminalSupplySelectionPanel from '@/app/terminal/TerminalSupplySelectionPanel';

const replaceMock = jest.fn();
const runControlMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/components/bitcode/pipeline/cards/BitcodeWorkspaceCard', () => ({
  __esModule: true,
  default: function MockTerminalWorkspaceCard({
    title,
    summary,
    children,
  }: {
    title: string;
    summary?: string;
    children: React.ReactNode;
  }) {
    return (
      <section>
        <h2>{title}</h2>
        {summary ? <p>{summary}</p> : null}
        {children}
      </section>
    );
  },
}));

jest.mock('@/components/bitcode/execution/BitcodeInlineExplainer', () => ({
  __esModule: true,
  default: function MockBitcodeInlineExplainer() {
    return null;
  },
}));

jest.mock('@/components/bitcode/execution/BitcodeMetricGrid', () => ({
  __esModule: true,
  default: function MockBitcodeMetricGrid() {
    return null;
  },
}));

jest.mock('@/components/bitcode/execution/BitcodeChipCloud', () => ({
  __esModule: true,
  default: function MockBitcodeChipCloud({ chips }: { chips: string[] }) {
    return (
      <div>
        {chips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>
    );
  },
}));

jest.mock('@/components/bitcode/pipeline/models/workspace-explainers', () => ({
  TERMINAL_WORKSPACE_EXPLAINERS: {
    supplyInventory: [],
    depositReadChain: [],
  },
  TERMINAL_INLINE_EXPLAINERS: {
    authSession: [],
    artifactKind: [],
    inventorySearch: [],
    providerRepository: [],
  },
}));

jest.mock('@/app/terminal/terminal-shell-reading', () => ({
  jumpToShellSection: jest.fn(),
}));

jest.mock('@/app/terminal/terminal-shell-bridge', () => ({
  useTerminalShellBridge: () => ({
    snapshot: {
      authSessions: [
        {
          authSessionId: 'gh_inst_bitcode_001',
          repo: 'frontier/demo-auth',
          installationId: 42,
          selected: true,
        },
      ],
      inventory: {
        selectedCount: 1,
        filteredCount: 1,
        totalFilteredEntries: 1,
        kind: 'patch',
        kindOptions: ['all', 'patch'],
        filteredEntries: [
          {
            inventoryEntryId: 'frontier-entry',
            title: 'frontier auth patch',
            artifactKind: 'patch',
            selected: true,
          },
        ],
      },
    },
    runControl: runControlMock,
  }),
}));

describe('TerminalSupplySelectionPanel', () => {
  it('centers live repository selection on one rich inventory dropdown', () => {
    render(
      <TerminalSupplySelectionPanel
        repositoryContext={{
          provider: 'github',
          connectionStatus: {
            connected: true,
            valid: true,
            provider: 'github',
            username: 'engineeredsoftware',
            metadata: { mock_mode: false, repositories: 2 },
          },
          inventorySource: 'stored_repository_inventory',
          repositories: [
            {
              id: '1094184056',
              name: 'ENGI',
              fullName: 'engineeredsoftware/ENGI',
              private: false,
              defaultBranch: 'main',
              url: 'https://github.com/engineeredsoftware/ENGI',
              cloneUrl: 'https://github.com/engineeredsoftware/ENGI.git',
              owner: { id: '84343342', username: 'engineeredsoftware', type: 'organization' },
              language: 'TypeScript',
              topics: ['ai', 'crypto'],
            },
            {
              id: '507945912',
              name: 'same-story-storybook',
              fullName: 'engineeredsoftware/same-story-storybook',
              private: true,
              defaultBranch: 'main',
              url: 'https://github.com/engineeredsoftware/same-story-storybook',
              cloneUrl: 'https://github.com/engineeredsoftware/same-story-storybook.git',
              owner: { id: '84343342', username: 'engineeredsoftware', type: 'organization' },
              language: 'JavaScript',
              topics: [],
            },
          ],
          selectedRepository: {
            id: '1094184056',
            name: 'ENGI',
            fullName: 'engineeredsoftware/ENGI',
            private: false,
            defaultBranch: 'main',
            url: 'https://github.com/engineeredsoftware/ENGI',
            cloneUrl: 'https://github.com/engineeredsoftware/ENGI.git',
            owner: { id: '84343342', username: 'engineeredsoftware', type: 'organization' },
            language: 'TypeScript',
            topics: ['ai', 'crypto'],
          },
        }}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Repository inventory' })).toHaveDisplayValue(
      'engineeredsoftware/ENGI - GitHub source / main / public / TypeScript',
    );
    expect(screen.getByText('GitHub / stored protocol inventory')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('ai')).toBeInTheDocument();
    expect(screen.queryByText(/choose repository/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/frontier\/demo-auth/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Search connected repositories/i)).not.toBeInTheDocument();
  });
});
