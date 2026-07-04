import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Footer from '@/components/base/bitcode/layout/footer';

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

jest.mock('@/app/auxillaries/components/AuxillariesProvider', () => ({
  openAuxillaries: (...args: unknown[]) => mockOpenOrbital(...args),
  prefetchAuxillaries: () => mockPrefetchOrbital(),
}));

jest.mock('@/config/features', () => ({
  FEATURE_FLAGS: {
    DISABLE_USING: false,
  },
}));

jest.mock('@/components/base/bitcode/branding/bitcode-software-svg-logo', () => ({
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

    expect(screen.getByRole('link', { name: 'Packs' })).toHaveAttribute(
      'href',
      '/packs',
    );
    expect(screen.getByRole('link', { name: 'Deposit' })).toHaveAttribute(
      'href',
      '/deposits',
    );
    expect(screen.getByRole('link', { name: 'Read' })).toHaveAttribute(
      'href',
      '/reads',
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/docs',
    );
    expect(screen.getByRole('link', { name: 'Bitcode on GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/engineeredsoftware/bitcode',
    );
    expect(screen.getByRole('button', { name: 'Explain Packs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explain Deposit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explain Read' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explain Docs' })).toBeInTheDocument();
    expect(screen.getByText('Pack activity')).toBeInTheDocument();
    expect(screen.getByText('Depositing flow')).toBeInTheDocument();
    expect(screen.getByText('Reading flow')).toBeInTheDocument();
    expect(screen.getByText('Docs hub')).toBeInTheDocument();
    expect(screen.getAllByText('Deposit').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Read').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settle').length).toBeGreaterThan(0);
    expect(screen.getAllByText('🧪').length).toBeGreaterThan(0);
    const protocolSpecLink = screen.getByRole('link', { name: 'Protocol spec' });
    expect(protocolSpecLink).not.toHaveAttribute('title');
    expect(protocolSpecLink).toHaveAttribute(
      'href',
      'https://github.com/engineeredsoftware/ENGI/blob/main/BITCODE_SPEC.txt',
    );
    expect(screen.getByRole('button', { name: 'Explain Protocol specification' })).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'Open Auxillaries' });
    fireEvent.mouseEnter(button);
    fireEvent.click(button);

    expect(mockPrefetchOrbital).toHaveBeenCalledTimes(1);
    expect(mockOpenOrbital).toHaveBeenCalledWith('login', undefined);
  });
});
