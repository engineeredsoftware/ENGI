import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Footer from '@/components/bitcode/layout/Footer/Footer';

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockOpenOrbital = jest.fn();
const mockPrefetchOrbital = jest.fn();

jest.mock('@bitcode/supabase/ssr/client', () => ({
  createClient: () => ({
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: () => mockOnAuthStateChange(),
    },
  }),
}));

jest.mock('@/components/auxillaries/AuxillariesProvider/AuxillariesProvider', () => ({
  openAuxillaries: (...args: unknown[]) => mockOpenOrbital(...args),
  prefetchAuxillaries: () => mockPrefetchOrbital(),
}));

jest.mock('@/config/features', () => ({
  FEATURE_FLAGS: {
    DISABLE_USING: false,
  },
}));

jest.mock('@/components/bitcode/branding/BitcodeSoftwareSvgLogo/BitcodeSoftwareSvgLogo', () => ({
  __esModule: true,
  default: () => <div>Software logo</div>,
}));

describe('Footer public shell', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    });
    mockOpenOrbital.mockReset();
    mockPrefetchOrbital.mockReset();
  });

  it('renders third-gate public labels and opens orbitals access for guests', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Exchange' })).toHaveAttribute(
      'href',
      '/exchange',
    );
    expect(screen.getByRole('link', { name: 'Deposits' })).toHaveAttribute(
      'href',
      '/deposits',
    );
    expect(screen.getByRole('link', { name: 'Reads' })).toHaveAttribute(
      'href',
      '/reads',
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/docs',
    );
    expect(screen.getByRole('link', { name: 'Source' })).toHaveAttribute(
      'href',
      'https://github.com/advancedengineeredsoftware/Bitcode',
    );
    expect(screen.getByRole('button', { name: 'Explain Exchange' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explain Deposit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explain Read' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explain Docs' })).toBeInTheDocument();
    expect(screen.getByText('Trade the exchange')).toBeInTheDocument();
    expect(screen.getByText('List your data')).toBeInTheDocument();
    expect(screen.getByText('Buy data that fits')).toBeInTheDocument();
    expect(screen.getByText('Learn to operate')).toBeInTheDocument();
    expect(screen.getByText('Protocol, products')).toBeInTheDocument();
    expect(screen.getAllByText('Deposit').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Read').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settle').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🧪').length).toBeGreaterThan(0);
    const protocolSpecLink = screen.getByRole('link', { name: 'Protocol spec' });
    // Phone chrome is icon-only; title + aria-label keep the control named.
    expect(protocolSpecLink).toHaveAttribute('title', 'Protocol spec');
    expect(protocolSpecLink).toHaveAttribute(
      'href',
      'https://github.com/advancedengineeredsoftware/Bitcode/blob/version/v48/Whitepaper.md',
    );
    expect(screen.getByRole('button', { name: 'Explain Protocol specification' })).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Open Auxillaries' });
    fireEvent.mouseEnter(button);
    fireEvent.click(button);

    expect(mockPrefetchOrbital).toHaveBeenCalledTimes(1);
    expect(mockOpenOrbital).toHaveBeenCalledWith('connect', undefined);
  });
});
