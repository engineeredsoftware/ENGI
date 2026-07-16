import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { VCSFileTreePicker } from '@/components/bitcode/vcs/VCSFileTreePicker/VCSFileTreePicker';

function mockTreeFetch() {
  global.fetch = jest.fn((input: unknown) => {
    const url = String(input);
    const params = new URLSearchParams(url.split('?')[1] || '');
    const path = params.get('path') || '';
    const items =
      path === ''
        ? [
            { path: 'src', type: 'tree', sha: 't1' },
            { path: 'README.md', type: 'blob', sha: 'b1', size: 10 },
          ]
        : path === 'src'
          ? [{ path: 'src/engine.ts', type: 'blob', sha: 'b2', size: 20 }]
          : [];
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ items }),
    });
  }) as unknown as typeof fetch;
}

describe('VCSFileTreePicker', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the connect-first empty state without a repository', () => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    render(
      <VCSFileTreePicker
        provider="github"
        repositoryFullName={null}
        selectedPaths={[]}
        onChange={jest.fn()}
      />,
    );
    expect(
      screen.getByText('Connect a repository to browse its files.'),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches the tree at the selected repository ref and lazy-loads directories', async () => {
    mockTreeFetch();
    render(
      <VCSFileTreePicker
        provider="github"
        repositoryFullName="octocat/Spoon-Knife"
        treeRef="31bbc0c5"
        selectedPaths={[]}
        onChange={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('src/')).toBeInTheDocument());
    expect(screen.getByText('README.md')).toBeInTheDocument();
    const firstUrl = String((global.fetch as jest.Mock).mock.calls[0][0]);
    expect(firstUrl).toContain('resource=tree');
    expect(firstUrl).toContain('owner=octocat');
    expect(firstUrl).toContain('repo=Spoon-Knife');
    expect(firstUrl).toContain('ref=31bbc0c5');

    fireEvent.click(screen.getByRole('button', { name: 'Expand src' }));
    await waitFor(() =>
      expect(screen.getByText('engine.ts')).toBeInTheDocument(),
    );
  });

  it('selects files exactly and directories as prefixes, removable via chips', async () => {
    mockTreeFetch();
    const onChange = jest.fn();
    render(
      <VCSFileTreePicker
        provider="github"
        repositoryFullName="octocat/Spoon-Knife"
        selectedPaths={['README.md']}
        onChange={onChange}
      />,
    );

    await waitFor(() => expect(screen.getByText('src/')).toBeInTheDocument());

    fireEvent.click(screen.getByText('src/'));
    expect(onChange).toHaveBeenCalledWith(['README.md', 'src/']);

    fireEvent.click(screen.getByRole('button', { name: 'Remove README.md' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('disables paths selected by the counterpart picker (mutual exclusivity)', async () => {
    mockTreeFetch();
    const onChange = jest.fn();
    render(
      <VCSFileTreePicker
        provider="github"
        repositoryFullName="octocat/Spoon-Knife"
        selectedPaths={[]}
        onChange={onChange}
        conflictingPaths={['README.md']}
        conflictLabel="Already in permissible sources"
      />,
    );

    await waitFor(() =>
      expect(screen.getByText('README.md')).toBeInTheDocument(),
    );
    const conflictButton = screen
      .getByText('README.md')
      .closest('button') as HTMLButtonElement;
    expect(conflictButton).toBeDisabled();
    expect(conflictButton).toHaveAttribute(
      'title',
      'Already in permissible sources',
    );
    fireEvent.click(conflictButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('selects every root-level file and directory prefix via Select all', async () => {
    mockTreeFetch();
    const onChange = jest.fn();
    render(
      <VCSFileTreePicker
        provider="github"
        repositoryFullName="octocat/Spoon-Knife"
        selectedPaths={[]}
        onChange={onChange}
      />,
    );

    await waitFor(() => expect(screen.getByText('src/')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Select all' }));
    // Directory prefixes cover their subtree downstream, so root-level
    // selection is full-repo coverage without recursively fetching src/.
    expect(onChange).toHaveBeenCalledWith(['src/', 'README.md']);
  });

  it('Select all skips paths already conflicting or already selected', async () => {
    mockTreeFetch();
    const onChange = jest.fn();
    render(
      <VCSFileTreePicker
        provider="github"
        repositoryFullName="octocat/Spoon-Knife"
        selectedPaths={['README.md']}
        onChange={onChange}
        conflictingPaths={['src/']}
      />,
    );

    await waitFor(() => expect(screen.getByText('src/')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Select all' }));
    // 'src/' is conflicting and 'README.md' is already selected — nothing new.
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Clear all removes every selection in one click', async () => {
    mockTreeFetch();
    const onChange = jest.fn();
    render(
      <VCSFileTreePicker
        provider="github"
        repositoryFullName="octocat/Spoon-Knife"
        selectedPaths={['README.md', 'src/']}
        onChange={onChange}
      />,
    );

    await waitFor(() => expect(screen.getByText('src/')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('ignores a stale tree response when treeRef hops (no empty flicker)', async () => {
    // Reproduce the deposit source-selection thrash: branch name is published
    // first, then the head commit once commits load. A slow branch response
    // that lands AFTER the commit package is active must not wipe the tree
    // to "Empty directory".
    let resolveBranch: ((value: unknown) => void) | null = null;
    let resolveCommit: ((value: unknown) => void) | null = null;
    global.fetch = jest.fn((input: unknown) => {
      const url = String(input);
      const params = new URLSearchParams(url.split('?')[1] || '');
      const ref = params.get('ref') || '';
      if (ref === 'main') {
        return new Promise((resolve) => {
          resolveBranch = resolve;
        });
      }
      if (ref === 'abc123') {
        return new Promise((resolve) => {
          resolveCommit = resolve;
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ items: [] }),
      });
    }) as unknown as typeof fetch;

    const { rerender } = render(
      <VCSFileTreePicker
        provider="github"
        repositoryFullName="octocat/Spoon-Knife"
        treeRef="main"
        selectedPaths={[]}
        onChange={jest.fn()}
      />,
    );

    // Tree identity hops to the head commit before the branch fetch settles.
    rerender(
      <VCSFileTreePicker
        provider="github"
        repositoryFullName="octocat/Spoon-Knife"
        treeRef="abc123"
        selectedPaths={[]}
        onChange={jest.fn()}
      />,
    );

    // Commit package wins with real items.
    expect(resolveCommit).toBeTruthy();
    resolveCommit!({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          { path: 'src', type: 'tree', sha: 't1' },
          { path: 'README.md', type: 'blob', sha: 'b1', size: 10 },
        ],
      }),
    });
    await waitFor(() => expect(screen.getByText('src/')).toBeInTheDocument());
    expect(screen.getByText('README.md')).toBeInTheDocument();
    expect(screen.queryByText('Empty directory')).not.toBeInTheDocument();

    // Stale branch response arrives late — empty / failed. Must not overwrite.
    expect(resolveBranch).toBeTruthy();
    resolveBranch!({
      ok: false,
      status: 404,
      json: async () => ({ error: 'not found' }),
    });
    // Give the stale promise a tick to misbehave if the guard is broken.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByText('src/')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
    expect(screen.queryByText('Empty directory')).not.toBeInTheDocument();
  });
});
