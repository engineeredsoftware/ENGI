import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import BitcodeTransactionsFilterBar from '@/components/bitcode/pipeline/BitcodeTransactionsFilterBar';

const BASE_FILTERS = {
  searchTerm: '',
  status: 'all',
  ownership: 'all',
  transactionLens: 'all',
  repository: 'all',
  participant: 'all',
  proofStatus: 'all',
  sort: 'newest',
} as const;

function renderFilterBar(onFiltersChange = jest.fn()) {
  render(
    <BitcodeTransactionsFilterBar
      filters={{ ...BASE_FILTERS }}
      onFiltersChange={onFiltersChange}
      statusOptions={['completed']}
      repositoryOptions={['bitcode/bitcode']}
      participantOptions={['garrett']}
      proofStatusOptions={['bounded proof bundle ready']}
    />,
  );
  return onFiltersChange;
}

describe('BitcodeTransactionsFilterBar', () => {
  it('renders shared explainers and still emits filter changes', () => {
    const onFiltersChange = renderFilterBar();

    expect(screen.getByRole('button', { name: 'Explain Search Bitcode activity' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Explain Proof posture filter' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Explain Sort order' })).toBeTruthy();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search transactions' }), {
      target: { value: 'proof bundle' },
    });

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...BASE_FILTERS,
      searchTerm: 'proof bundle',
    });
  });

  it('uses the rich searchable dropdown for every filter and emits selections', async () => {
    const onFiltersChange = renderFilterBar();

    // Every filter control is the shared SearchableSelect combobox.
    for (const label of [
      'Status',
      'Ownership',
      'Action lens',
      'Repository',
      'Participant',
      'Proof posture',
      'Sort',
    ]) {
      expect(screen.getByRole('combobox', { name: label })).toBeTruthy();
    }

    // Selecting from the Ownership dropdown emits the filter change.
    fireEvent.click(screen.getByRole('combobox', { name: 'Ownership' }));
    await waitFor(() =>
      expect(screen.getByText('Exchange transactions')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText('Exchange transactions'));
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...BASE_FILTERS,
      ownership: 'network',
    });
  });

  it('supports text searching inside a dropdown (repository)', async () => {
    renderFilterBar();

    fireEvent.click(screen.getByRole('combobox', { name: 'Repository' }));
    await waitFor(() =>
      expect(screen.getByText('bitcode/bitcode')).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByPlaceholderText('Search repositories…'), {
      target: { value: 'zzz-no-match' },
    });
    expect(screen.queryByText('bitcode/bitcode')).not.toBeInTheDocument();
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});
