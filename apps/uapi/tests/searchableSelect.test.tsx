import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { SearchableSelect, type SearchableSelectItem } from '@/components/bitcode/forms/SearchableSelect/SearchableSelect';

const ITEMS: SearchableSelectItem[] = [
  { key: 'main', label: 'main', badge: 'default' },
  { key: 'feature/foo', label: 'feature/foo', description: 'Foo work' },
  { key: 'feature/bar', label: 'feature/bar', description: 'Bar work' },
];

describe('SearchableSelect — the reused rich search-dropdown component', () => {
  it('shows the placeholder when nothing is selected', () => {
    render(<SearchableSelect items={ITEMS} onSelect={jest.fn()} placeholder="Select branch..." />);
    expect(screen.getByText('Select branch...')).toBeInTheDocument();
  });

  it('shows the selected item label on the trigger', () => {
    render(<SearchableSelect items={ITEMS} value="feature/foo" onSelect={jest.fn()} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('feature/foo');
  });

  it('opens on click and lists every item', async () => {
    render(<SearchableSelect items={ITEMS} onSelect={jest.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getByText('main')).toBeInTheDocument();
      expect(screen.getByText('feature/foo')).toBeInTheDocument();
      expect(screen.getByText('feature/bar')).toBeInTheDocument();
    });
  });

  it('filters items by the search query (label and description)', async () => {
    render(<SearchableSelect items={ITEMS} onSelect={jest.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));

    await waitFor(() => expect(screen.getByText('main')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'bar' } });

    expect(screen.getByText('feature/bar')).toBeInTheDocument();
    expect(screen.queryByText('feature/foo')).not.toBeInTheDocument();
    expect(screen.queryByText('main')).not.toBeInTheDocument();
  });

  it('shows the empty message when no items match the search', async () => {
    render(<SearchableSelect items={ITEMS} onSelect={jest.fn()} emptyMessage="Nothing here." />);
    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => expect(screen.getByText('main')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'zzz-no-match' } });
    expect(screen.getByText('Nothing here.')).toBeInTheDocument();
  });

  it('calls onSelect with the item key and closes on selection', async () => {
    const onSelect = jest.fn();
    render(<SearchableSelect items={ITEMS} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('combobox'));

    await waitFor(() => expect(screen.getByText('feature/bar')).toBeInTheDocument());
    fireEvent.click(screen.getByText('feature/bar'));

    expect(onSelect).toHaveBeenCalledWith('feature/bar');
    await waitFor(() => expect(screen.queryByText('main')).not.toBeInTheDocument());
  });

  it('shows the loading message instead of items while loading', async () => {
    render(<SearchableSelect items={[]} onSelect={jest.fn()} loading loadingMessage="Fetching branches…" />);
    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => expect(screen.getByText('Fetching branches…')).toBeInTheDocument());
  });

  it('disables the trigger and does not open when disabled', () => {
    render(<SearchableSelect items={ITEMS} onSelect={jest.fn()} disabled />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });
});
