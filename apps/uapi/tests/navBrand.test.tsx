import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import NavBrand, {
  BITCODE_DECK_HREF,
  BITCODE_WHITEPAPER_URL,
  BITCODE_X_URL,
} from '@/components/bitcode/layout/NavBrand/NavBrand';

describe('NavBrand', () => {
  it('renders wordmark + whitepaper, then docs | X | deck', () => {
    render(<NavBrand surface="home" onClick={() => {}} />);

    expect(screen.getByLabelText('Bitcode logo')).toBeTruthy();
    expect(screen.getByText('Bitcode')).toBeTruthy();
    expect(screen.queryByText('homepage')).toBeNull();

    // Whitepaper sits beside the Bitcode wordmark (not in the lower row).
    expect(screen.getByRole('link', { name: 'Whitepaper' })).toHaveAttribute(
      'href',
      BITCODE_WHITEPAPER_URL,
    );
    expect(screen.getByRole('link', { name: 'Whitepaper' })).toHaveAttribute('target', '_blank');

    const refs = screen.getByRole('navigation', { name: 'Bitcode references' });
    const refLinks = Array.from(refs.querySelectorAll('a')).map((el) =>
      el.getAttribute('aria-label'),
    );
    expect(refLinks).toEqual(['Docs', 'Bitcode on X', 'Pitch deck']);

    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('link', { name: 'Bitcode on X' })).toHaveAttribute(
      'href',
      BITCODE_X_URL,
    );
    expect(screen.getByRole('link', { name: 'Pitch deck' })).toHaveAttribute(
      'href',
      BITCODE_DECK_HREF,
    );
  });

  it('keeps icon links on product surfaces (no page-name subtext)', () => {
    render(<NavBrand surface="deposit" onClick={() => {}} />);

    expect(screen.queryByText('deposit')).toBeNull();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('link', { name: 'Whitepaper' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bitcode on X' })).toBeInTheDocument();
  });

  it('keeps icon links on docs routes without spelled docs subtext', () => {
    render(<NavBrand surface="docs" onClick={() => {}} />);

    expect(screen.queryByText(/^docs$/i)).toBeNull();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  /**
   * Frozen V26-era beta badge expectation (canon-at-that-time).
   * Do not rewrite: V48 removed beta chrome from NavBrand; living check is below.
   */
  it.skip(
    'renders beta posture outside the product workspace and remains clickable',
    () => {
      const onClick = jest.fn();

      render(<NavBrand surface={null} onClick={onClick} />);

      fireEvent.click(screen.getByLabelText('Bitcode logo'));

      expect(screen.getByText('V26')).toBeTruthy();
      expect(screen.getByText('PRC')).toBeTruthy();
      expect(onClick).toHaveBeenCalled();
      expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
      expect(screen.queryByRole('link', { name: 'Whitepaper' })).toBeNull();
    },
  );

  it('renders logo-only chrome outside the product workspace and remains clickable (V48)', () => {
    const onClick = jest.fn();

    render(<NavBrand surface={null} onClick={onClick} />);

    fireEvent.click(screen.getByLabelText('Bitcode logo'));

    // Living: bare logo mark, no V26 beta badge, no wordmark/links when surface is null.
    expect(screen.queryByText('Bitcode')).toBeNull();
    expect(screen.queryByText('V26')).toBeNull();
    expect(screen.queryByText('PRC')).toBeNull();
    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Whitepaper' })).toBeNull();
  });

  it('home control remains clickable via the brand mark', () => {
    const onClick = jest.fn();

    render(<NavBrand surface="network" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Bitcode home' }));
    expect(onClick).toHaveBeenCalled();
  });
});
