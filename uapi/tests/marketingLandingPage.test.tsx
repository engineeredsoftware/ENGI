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
      screen.getByText("AIs trade technical knowledge using Bitcode's on-chain marketplace."),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buy Packs' })).toHaveAttribute('href', '/reads');
    expect(screen.getByRole('link', { name: 'Sell Source' })).toHaveAttribute(
      'href',
      '/deposits',
    );
    expect(screen.getByRole('link', { name: 'View Exchange' })).toHaveAttribute(
      'href',
      '/packs',
    );
    expect(screen.getByRole('button', { name: 'May–July' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'April' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'March' })).toBeInTheDocument();
    expect(screen.getByText('Developing an MVP')).toBeInTheDocument();
    expect(screen.getByTestId('micro-blog-meta')).toHaveAttribute(
      'aria-label',
      'May–July 2026',
    );
    expect(screen.getByText('A Data Marketplace')).toBeInTheDocument();
    expect(
      screen.getByText('A Knowledge Depot, An Endless Economy'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('For Humans, Agents, Aliens...'),
    ).toBeInTheDocument();
    expect(screen.getByText('Source Measurements')).toBeInTheDocument();
    expect(screen.getByText('Absolutes')).toBeInTheDocument();
    expect(screen.getByText('Needinesses')).toBeInTheDocument();
    expect(screen.getByText("Packs' BTD Volume")).toBeInTheDocument();
    expect(screen.getByText('431')).toBeInTheDocument();
    expect(screen.getByText('Source Safety')).toBeInTheDocument();
    expect(screen.getByText('BTC · BTD · AssetPacks')).toBeInTheDocument();
    expect(screen.getByText(/Mint volume from needinesses/i)).toBeInTheDocument();
    expect(screen.getByText('On-chain')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        if (node?.tagName !== 'P') return false;
        const text = node.textContent ?? '';
        return (
          text.includes('List AssetPacks made from source-code') &&
          text.includes('Buy them with Bitcoin') &&
          text.includes('fully auditable ledger')
        );
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Synthesize Packs')).toBeInTheDocument();
    expect(screen.getByText('Review Options')).toBeInTheDocument();
    expect(screen.getByText('Buy Bitcodes')).toBeInTheDocument();
    expect(screen.getAllByText('Deposit').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Read').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settle').length).toBeGreaterThan(0);
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
    expect(screen.getByText('Productionized Protocol')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        if (node?.tagName !== 'H2') return false;
        return (node.textContent ?? '').includes('Exchanging Bitcoins for Bitcodes.');
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Bitcodes', { selector: 'h2 span' })).toBeInTheDocument();
    expect(screen.getByText('Bitcoins', { selector: 'h2 span' })).toBeInTheDocument();
    expect(screen.getByText(/ERC-1155 on Ethereum/i)).toBeInTheDocument();
    expect(screen.getByText(/measurements, quotes, settlements, BTD, and delivery/iu)).toBeInTheDocument();
    expect(screen.queryByText(/testnet/i)).toBeNull();
    expect(screen.queryByText(/on Bitcoin/i)).toBeNull();
    expect(screen.getByText('Website Application')).toBeInTheDocument();
    expect(screen.getByText('MCP API')).toBeInTheDocument();
    expect(screen.getByText('Conversational Extensions')).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.getAllByText('Live').length).toBe(2);
    // Interface cards are descriptive only — not navigable.
    expect(screen.queryByRole('link', { name: /Website Application/u })).toBeNull();
    expect(screen.queryByRole('link', { name: /MCP API/u })).toBeNull();
    expect(screen.queryByRole('link', { name: /Conversational Extensions/u })).toBeNull();
    expect(
      screen.getByText(
        /On the exchange, measurements are visible; IP is not\. Bitcode is source-safe knowledge trading\./u,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Public Measures')).toBeInTheDocument();
    expect(screen.getByText('Private Source')).toBeInTheDocument();
    expect(screen.getByText('Auditable Trade')).toBeInTheDocument();
  });
});
