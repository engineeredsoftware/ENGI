import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { VCSFileTreePicker } from '@/components/base/bitcode/vcs/VCSFileTreePicker';

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
        repositoryFullName="engineeredsoftware/ENGI"
        treeRef="31bbc0c5"
        selectedPaths={[]}
        onChange={jest.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('src/')).toBeInTheDocument());
    expect(screen.getByText('README.md')).toBeInTheDocument();
    const firstUrl = String((global.fetch as jest.Mock).mock.calls[0][0]);
    expect(firstUrl).toContain('resource=tree');
    expect(firstUrl).toContain('owner=engineeredsoftware');
    expect(firstUrl).toContain('repo=ENGI');
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
        repositoryFullName="engineeredsoftware/ENGI"
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
        repositoryFullName="engineeredsoftware/ENGI"
        selectedPaths={[]}
        onChange={onChange}
        conflictingPaths={['README.md']}
        conflictLabel="Already a source path hint"
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
      'Already a source path hint',
    );
    fireEvent.click(conflictButton);
    expect(onChange).not.toHaveBeenCalled();
  });
});
