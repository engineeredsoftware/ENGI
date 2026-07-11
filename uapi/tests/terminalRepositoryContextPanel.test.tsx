import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import TerminalRepositoryContextPanel from '@/app/terminal/TerminalRepositoryContextPanel';

const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams('provider=github&repo=bitcode/bitcode');
const mockJumpToShellSection = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/terminal',
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/app/terminal/TerminalWorkspaceCard', () => ({
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

jest.mock('@/components/bitcode/execution/BitcodeInlineExplainer', () => ({
  __esModule: true,
  default: function MockBitcodeInlineExplainer() {
    return null;
  },
}));

jest.mock('@/components/bitcode/vcs/VCSRepositorySelector', () => ({
  VCSRepositorySelector: function MockVCSRepositorySelector({
    repositories,
    value,
    placeholder,
  }: {
    repositories?: Array<{ fullName: string }>;
    value?: string;
    placeholder?: string;
  }) {
    return (
      <div data-testid="mock-repository-selector">
        {(value || placeholder || 'repository selector').toString()} :: {repositories?.length ?? 0}
      </div>
    );
  },
}));

jest.mock('@/app/terminal/TerminalOpenAuxillariesButton', () => ({
  __esModule: true,
  default: function MockTerminalOpenAuxillariesButton({
    label,
  }: {
    label?: string;
  }) {
    return <button type="button">{label || 'Open Externals'}</button>;
  },
}));

jest.mock('@/app/terminal/terminal-shell-reading', () => ({
  jumpToShellSection: (...args: unknown[]) => mockJumpToShellSection(...args),
}));

describe('TerminalRepositoryContextPanel', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockJumpToShellSection.mockReset();
    mockSearchParams = new URLSearchParams('provider=github&repo=bitcode/bitcode');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps stored repository inventory readable when the saved provider session must reconnect', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          connected: true,
          provider: 'github',
          valid: false,
          username: 'bitcode-operator',
          metadata: {
            repositories: 1,
            status: 'reconnect required',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          repositories: [
            {
              id: 'repo-1',
              name: 'bitcode',
              fullName: 'bitcode/bitcode',
              defaultBranch: 'main',
              private: true,
              url: 'https://github.com/bitcode/bitcode',
              language: 'TypeScript',
              topics: ['shares'],
              owner: {
                username: 'bitcode',
                id: 'org-1',
              },
            },
          ],
          inventorySource: 'stored_repository_inventory',
        }),
      }) as jest.Mock;

    render(<TerminalRepositoryContextPanel />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/vcs/github/connection');
      expect(global.fetch).toHaveBeenCalledWith('/api/vcs/github/repositories');
    });
    await waitFor(() => {
      expect(screen.getAllByText('stored protocol inventory').length).toBeGreaterThan(0);
    });

    expect(
      screen.getByText(/Saved GitHub attachment found, but the live provider session must reconnect/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bitcode can keep rereading stored repository inventory from Exchange/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Reconnect Externals to restore live write admission/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('bitcode/bitcode')).toBeInTheDocument();
    expect(
      screen.getByText(/Stored repository inventory remains readable from Exchange/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/No active GitHub connection is available/i)).not.toBeInTheDocument();
  });

  it('treats a fully disconnected provider as no inventory-bearing repository context', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        connected: false,
        provider: 'github',
        valid: false,
      }),
    }) as jest.Mock;

    render(<TerminalRepositoryContextPanel />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/vcs/github/connection');
    });
    await waitFor(() => {
      expect(screen.getByText(/No active GitHub connection is available/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId('mock-repository-selector')).toHaveTextContent(
      'Connect a repository provider first... :: 0',
    );
    expect(screen.queryByText(/Saved GitHub attachment found, but the live provider session must reconnect/i)).toBeNull();
  });

  it('loads branch and commit selectors for the selected live repository source', async () => {
    const onContextChange = jest.fn();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          connected: true,
          provider: 'github',
          valid: true,
          username: 'bitcode-operator',
          metadata: { repositories: 1, status: 'connected' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          repositories: [
            {
              id: 'repo-1',
              name: 'bitcode',
              fullName: 'bitcode/bitcode',
              defaultBranch: 'main',
              private: true,
              url: 'https://github.com/bitcode/bitcode',
              language: 'TypeScript',
              topics: ['shares'],
              owner: {
                username: 'bitcode',
                id: 'org-1',
              },
            },
          ],
          inventorySource: 'live_provider_inventory',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          defaultBranch: 'main',
          branches: [
            {
              name: 'main',
              commit: {
                sha: 'abc123456789',
                message: 'head',
                author: { name: 'Dev', email: 'dev@example.com', date: '2026-05-14T00:00:00.000Z' },
              },
              protected: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({
          commits: [
            {
              sha: 'abc123456789',
              message: 'feat: source selector',
              author: { name: 'Dev', email: 'dev@example.com', date: '2026-05-14T00:00:00.000Z' },
              parents: [],
            },
          ],
        }),
      }) as jest.Mock;

    render(<TerminalRepositoryContextPanel onContextChange={onContextChange} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/vcs/github/connection');
      expect(global.fetch).toHaveBeenCalledWith('/api/vcs/github/repositories');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/vcs?resource=branches&provider=github&owner=bitcode&repo=bitcode',
      );
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/vcs?resource=commits&provider=github&owner=bitcode&repo=bitcode&branch=main',
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Repository source branch' })).toHaveValue('main');
      expect(screen.getByRole('combobox', { name: 'Repository source commit' })).toHaveValue('abc123456789');
    });

    await waitFor(() => {
      expect(onContextChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          selectedBranch: 'main',
          selectedCommit: 'abc123456789',
        }),
      );
    });
  });
});
