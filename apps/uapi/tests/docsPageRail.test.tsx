import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { DocsPageRail } from '@/components/docs/DocsPageRail/DocsPageRail';
import { BITCODE_DOCS_PAGES } from '@/components/docs/models/bitcode-docs-content';

const whatIsBitcode = BITCODE_DOCS_PAGES.find((page) => page.slug === 'what-is-bitcode');
const sourceShares = BITCODE_DOCS_PAGES.find((page) => page.slug === 'source-shares');

describe('DocsPageRail accordion', () => {
  it('is collapsed by default and expands on toggle', () => {
    if (!whatIsBitcode) throw new Error('missing what-is-bitcode fixture');

    render(<DocsPageRail page={whatIsBitcode} />);

    const toggle = screen.getByTestId('docs-page-rail-toggle');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: /DataPacks, BTD/i })).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /DataPacks, BTD/i })).toBeInTheDocument();
  });

  it('collapses again when the page changes', () => {
    if (!whatIsBitcode || !sourceShares) throw new Error('missing docs fixtures');

    const { rerender } = render(<DocsPageRail page={whatIsBitcode} />);
    fireEvent.click(screen.getByTestId('docs-page-rail-toggle'));
    expect(screen.getByTestId('docs-page-rail-toggle')).toHaveAttribute('aria-expanded', 'true');

    rerender(<DocsPageRail page={sourceShares} />);
    expect(screen.getByTestId('docs-page-rail-toggle')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: /Understand Exchange/i })).not.toBeInTheDocument();
  });
});
