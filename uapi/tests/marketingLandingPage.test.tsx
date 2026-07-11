/* eslint-disable react/no-multi-comp */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import MarketingLandingPage from '@/app/(root)/components/MarketingLandingPage';

jest.mock('framer-motion', () => {
  const makeComponent = () =>
    ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      <div {...props}>{children}</div>;

  return {
    motion: new Proxy(
      {},
      {
        get: () => makeComponent(),
      },
    ),
  };
});

jest.mock('@/components/bitcode/layout/footer', () => ({
  __esModule: true,
  default: () => <div>Footer</div>,
}));

jest.mock('@/components/bitcode/branding/bitcode-pill', () => ({
  __esModule: true,
  default: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

jest.mock('@/components/bitcode/branding/bitcode-software-svg-logo', () => ({
  __esModule: true,
  default: () => <div>Software logo</div>,
}));

jest.mock('@/components/bitcode/branding/logo', () => ({
  __esModule: true,
  default: () => <div>Logo</div>,
}));

jest.mock('@/components/bitcode/effects/quantum-orb', () => ({
  QuantumOrb: () => <div>QuantumOrb</div>,
  minimalPreset: {},
}));

jest.mock('@/components/bitcode/multi-line-typing-animation', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <>{text}</>,
}));

jest.mock('@/components/bitcode/layout/demonstration-witness-runtime', () => ({
  mountBitcodeDemonstrationShell: jest.fn(async () => jest.fn()),
  readBitcodeDemonstrationShellSnapshot: jest.fn(),
  readBitcodeDemonstrationShellControls: jest.fn(),
}));

const { mountBitcodeDemonstrationShell } = jest.requireMock(
  '@/components/bitcode/layout/demonstration-witness-runtime',
) as {
  mountBitcodeDemonstrationShell: jest.Mock;
};

describe('MarketingLandingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });
  });

  it('renders Bitcode-facing landing CTAs and static depot preview', () => {
    render(<MarketingLandingPage />);

    expect(
      screen.getByText('Bitcode is auditable market infrastructure for technical knowledge.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Request Read' }),
    ).toHaveAttribute('href', '/reads');
    expect(screen.getByRole('link', { name: 'Read docs' })).toHaveAttribute(
      'href',
      '/docs',
    );
    expect(screen.getByRole('button', { name: 'April' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'March' })).toBeInTheDocument();
    expect(screen.getByText('$BTD: Scalar Volume And Rights For Technical Knowledge')).toBeInTheDocument();
    expect(screen.getByTestId('micro-blog-meta')).toHaveAttribute('aria-label', 'April 2026 * Garrett Maring');
    expect(screen.getByText('Data Depot')).toBeInTheDocument();
    expect(screen.getByText('Depot Surface')).toBeInTheDocument();
    expect(screen.getByText('Measurement vector')).toBeInTheDocument();
    expect(screen.getByText('Verified access')).toBeInTheDocument();
    expect(screen.getByText('ASSETPACKS')).toBeInTheDocument();
    expect(screen.getByText('BTD VOLUME')).toBeInTheDocument();
    expect(screen.getByText('BTC SETTLEMENT')).toBeInTheDocument();
    expect(screen.getAllByText('Packs').length).toBeGreaterThan(0);
    expect(document.getElementById('bitcodeDemonstrationRoot')).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
    expect(mountBitcodeDemonstrationShell).not.toHaveBeenCalled();
    expect(screen.getByTestId('landing-orbital-ambience')).toHaveClass('hidden', 'laptop:block');
    expect(screen.getByTestId('landing-pointer-glow')).toHaveClass('hidden', 'laptop:block');
    expect(screen.getByTestId('landing-ambient-glow')).toHaveClass('hidden', 'laptop:block');
  });

  it('explains commercial testnet launch readiness with core flows and source-safe trust messaging', () => {
    render(<MarketingLandingPage />);

    const section = screen.getByTestId('landing-testnet-launch');
    expect(section).toBeInTheDocument();
    expect(screen.getByText('Commercial testnet')).toBeInTheDocument();
    expect(
      screen.getByText('Sell and buy IP the Bitcode way, live on BTC testnet.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/BTC amounts are testnet and free while everything else stays production-intended/u),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /01\s*Deposit IP/u })).toHaveAttribute(
      'href',
      '/deposits',
    );
    expect(screen.getByRole('link', { name: /02\s*Read and buy/u })).toHaveAttribute(
      'href',
      '/reads',
    );
    expect(screen.getByRole('link', { name: /03\s*Audit on Packs/u })).toHaveAttribute(
      'href',
      '/packs',
    );
    expect(
      screen.getByText(/protocol law and proof readback decide state/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/source-bearing AssetPack contents stay withheld until BTC finality and BTD rights transfer/u),
    ).toBeInTheDocument();
  });
});
