import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/bitcode/auth/LoginForm/LoginForm', () => ({
  __esModule: true,
  default: ({ surfaceVariant }: { surfaceVariant?: string }) => (
    <div data-testid="login-form" data-surface-variant={surfaceVariant || 'default'}>
      Connect form
    </div>
  ),
}));

import OrbitalsLoginPane from '@/components/auxillaries/AuxillariesLoginPane/AuxillariesLoginPane';

describe('OrbitalsLoginPane', () => {
  it('renders the terminal-owned orbital access shell', () => {
    render(<OrbitalsLoginPane />);

    expect(screen.getByText('Open Profile, Wallet, Externals, and Interfaces')).toBeTruthy();
    expect(screen.getByText('Primary path')).toBeTruthy();
    expect(screen.getByText('Required providers')).toBeTruthy();
    expect(screen.getByText('Auxillaries after connect')).toBeTruthy();
    expect(screen.getByTestId('login-form')).toBeTruthy();
  });

  it('passes the contained surface contract into the login form when requested', () => {
    render(<OrbitalsLoginPane surfaceVariant="contained" />);

    expect(screen.getByTestId('login-form')).toHaveAttribute('data-surface-variant', 'contained');
  });
});
