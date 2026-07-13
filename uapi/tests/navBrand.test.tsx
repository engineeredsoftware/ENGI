import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import NavBrand, {
  BITCODE_WHITEPAPER_URL,
} from '@/components/bitcode/layout/NavBrand/NavBrand';

describe('NavBrand', () => {
  it('renders logo-area docs and whitepaper links instead of page-name subtext', () => {
    render(<NavBrand surface="home" onClick={() => {}} />);

    expect(screen.getByLabelText('Bitcode logo')).toBeTruthy();
    expect(screen.getByText('Bitcode')).toBeTruthy();
    expect(screen.queryByText('homepage')).toBeNull();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('link', { name: 'Whitepaper' })).toHaveAttribute(
      'href',
      BITCODE_WHITEPAPER_URL,
    );
    expect(screen.getByRole('link', { name: 'Whitepaper' })).toHaveAttribute('target', '_blank');
  });

  it('keeps docs | whitepaper links on product surfaces (no page-name subtext)', () => {
    render(<NavBrand surface="deposit" onClick={() => {}} />);

    expect(screen.queryByText('deposit')).toBeNull();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('link', { name: 'Whitepaper' })).toBeInTheDocument();
  });

  it('keeps docs | whitepaper links on docs routes', () => {
    render(<NavBrand surface="docs" onClick={() => {}} />);

    expect(screen.queryByText(/^docs$/i)).toBeTruthy(); // the spelled docs link
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  it('renders beta posture outside the product workspace and remains clickable', () => {
    const onClick = jest.fn();

    render(<NavBrand surface={null} onClick={onClick} />);

    fireEvent.click(screen.getByLabelText('Bitcode logo'));

    expect(screen.getByText('V26')).toBeTruthy();
    expect(screen.getByText('PRC')).toBeTruthy();
    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull();
  });

  it('home control remains clickable via the brand mark', () => {
    const onClick = jest.fn();

    render(<NavBrand surface="network" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Bitcode home' }));
    expect(onClick).toHaveBeenCalled();
  });
});
