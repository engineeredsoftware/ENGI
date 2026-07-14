/* eslint-disable react/no-multi-comp */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import MarketingLandingPage from '@/components/marketing/MarketingLandingPage/MarketingLandingPage';

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

jest.mock('@/components/bitcode/layout/Footer/Footer', () => ({
  __esModule: true,
  default: () => <div>Footer</div>,
}));

jest.mock('@/components/bitcode/branding/BitcodePill/BitcodePill', () => ({
  __esModule: true,
  default: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

jest.mock('@/components/bitcode/branding/BitcodeSoftwareSvgLogo/BitcodeSoftwareSvgLogo', () => ({
  __esModule: true,
  default: () => <div>Software logo</div>,
}));

jest.mock('@/components/bitcode/branding/Logo/Logo', () => ({
  __esModule: true,
  default: () => <div>Logo</div>,
}));

jest.mock('@/components/bitcode/effects/quantum-orb', () => ({
  QuantumOrb: () => <div>QuantumOrb</div>,
  minimalPreset: {},
}));

jest.mock('@/components/bitcode/MultiLineTypingAnimation/MultiLineTypingAnimation', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <>{text}</>,
}));

jest.mock('@/components/bitcode/layout/DemonstrationWitnessRuntime/demonstration-witness-runtime', () => ({
  mountBitcodeDemonstrationShell: jest.fn(async () => jest.fn()),
  readBitcodeDemonstrationShellSnapshot: jest.fn(),
  readBitcodeDemonstrationShellControls: jest.fn(),
}));

const { mountBitcodeDemonstrationShell } = jest.requireMock(
  '@/components/bitcode/layout/DemonstrationWitnessRuntime/demonstration-witness-runtime',
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
      screen.getByText("AIs trade technical knowledge with Bitcode's on-chain marketplace."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Buy AssetPacks' }),
    ).toHaveAttribute('href', '/reads');
    expect(screen.getByRole('link', { name: 'Sell AssetPacks' })).toHaveAttribute(
      'href',
      '/deposits',
    );
    expect(screen.getByRole('link', { name: 'View AssetPacks' })).toHaveAttribute(
      'href',
      '/packs',
    );
    expect(screen.getByRole('button', { name: 'May–July' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'April' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'March' })).toBeInTheDocument();
    expect(screen.getByText('Commercial MVP Development, Protocol Precision')).toBeInTheDocument();
    expect(screen.getByTestId('micro-blog-meta')).toHaveAttribute(
      'aria-label',
      'May–July 2026 * Garrett Maring',
    );
    expect(screen.getByText('Data Depot')).toBeInTheDocument();
    expect(screen.getByText('Depot Surface')).toBeInTheDocument();
    expect(screen.getByText('AssetPacks Measurements')).toBeInTheDocument();
    expect(screen.getByText('Absolutes')).toBeInTheDocument();
    expect(screen.getByText('Needinesses')).toBeInTheDocument();
    expect(screen.getByText('Final Fit')).toBeInTheDocument();
    expect(screen.getByText('Verified access')).toBeInTheDocument();
    expect(screen.getByText('BTC · BTD · AssetPacks')).toBeInTheDocument();
    expect(screen.getByText(/Mint volume from Final Fit/i)).toBeInTheDocument();
    expect(screen.getByText('On-chain')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Make AssetPacks from source-code, exposing only IP you confirm/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Synthesize Options')).toBeInTheDocument();
    expect(screen.getByText('Deposit AssetPacks')).toBeInTheDocument();
    // Chip + Buy CTA can both render; assert chip via exact case from capability chips.
    expect(screen.getAllByText(/Buy AssetPacks/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Packs').length).toBeGreaterThan(0);
    expect(document.getElementById('bitcodeDemonstrationRoot')).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
    expect(mountBitcodeDemonstrationShell).not.toHaveBeenCalled();
    expect(screen.getByTestId('landing-orbital-ambience')).toHaveClass('hidden', 'laptop:block');
    expect(screen.getByTestId('landing-pointer-glow')).toHaveClass('hidden', 'laptop:block');
    expect(screen.getByTestId('landing-ambient-glow')).toHaveClass('hidden', 'laptop:block');
  });

  it('explains commercial product launch readiness with core flows and source-safe trust messaging', () => {
    render(<MarketingLandingPage />);

    const section = screen.getByTestId('landing-testnet-launch');
    expect(section).toBeInTheDocument();
    expect(screen.getByText('Commercial Product')).toBeInTheDocument();
    expect(screen.getByText('Sell and buy AssetPacks on Bitcoin.')).toBeInTheDocument();
    expect(screen.getByText(/measurements, quotes, settlement order/iu)).toBeInTheDocument();
    expect(screen.queryByText(/testnet/i)).toBeNull();
    expect(screen.getByRole('link', { name: /01\s*Sell \(Deposit\)/u })).toHaveAttribute(
      'href',
      '/deposits',
    );
    expect(screen.getByRole('link', { name: /02\s*Buy \(Read\)/u })).toHaveAttribute(
      'href',
      '/reads',
    );
    expect(screen.getByRole('link', { name: /03\s*Audit \(Packs\)/u })).toHaveAttribute(
      'href',
      '/packs',
    );
    expect(
      screen.getByText(/protocol law and proof readback decide state/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/protected source stays withheld until BTC finality and BTD rights transfer/u),
    ).toBeInTheDocument();
    expect(screen.getByText('Public Measures')).toBeInTheDocument();
    expect(screen.getByText('Private Source')).toBeInTheDocument();
    expect(screen.getByText('Auditable Trade')).toBeInTheDocument();
  });
});
