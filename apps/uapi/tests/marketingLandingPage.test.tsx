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
      screen.getByText('Trade technical data on the Bitcode marketplace.'),
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
      screen.getByText('For Agents, Humans, Aliens...'),
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
          text.includes('Deposit AssetPacks synthesized from source code') &&
          text.includes('using Bitcoin') &&
          text.includes('completely auditable') &&
          text.includes('verifiable ledger')
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
    expect(document.querySelector('iframe')).toBeNull();
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
        return (node.textContent ?? '').includes('Exchange Bitcoins for Bitcodes.');
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Bitcodes', { selector: 'h2 span' })).toBeInTheDocument();
    expect(screen.getByText('Bitcoins', { selector: 'h2 span' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /Bitcode's canonical, commercial deployments are its mainnet ERC-1155/u,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Measured/u)).toBeInTheDocument();
    expect(screen.getByText(/AssetPacks/u)).toBeInTheDocument();
    expect(screen.getByText(/delightful applications/i)).toBeInTheDocument();
    expect(screen.queryByText(/testnet/i)).toBeNull();
    expect(screen.queryByText(/on Bitcoin/i)).toBeNull();
    expect(screen.getByText('Website Application')).toBeInTheDocument();
    expect(screen.getByText('MCP API')).toBeInTheDocument();
    expect(screen.getByText('Conversational Extensions')).toBeInTheDocument();
    expect(screen.getByText('Contributable Repository')).toBeInTheDocument();
    expect(screen.getByText('Bitcode Whitepaper')).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.getByText('Open-Source')).toBeInTheDocument();
    expect(screen.getByText('Canonical Specification')).toBeInTheDocument();
    expect(screen.getAllByText('Live').length).toBe(2);
    // Whitepaper, MCP API, and repository are whole-row links; Website / Extensions are not.
    expect(screen.queryByRole('link', { name: /Website Application/u })).toBeNull();
    expect(screen.queryByRole('link', { name: /Conversational Extensions/u })).toBeNull();
    const whitepaperLink = screen.getByRole('link', { name: /Bitcode Whitepaper/u });
    expect(whitepaperLink).toHaveAttribute(
      'href',
      'https://github.com/advancedengineeredsoftware/Bitcode/blob/version/v48/Whitepaper.md',
    );
    expect(screen.getByRole('link', { name: 'MCP API' })).toHaveAttribute('href', '/docs/mcp-api');
    const repoLink = screen.getByRole('link', { name: /Contributable Repository/u });
    expect(repoLink).toHaveAttribute(
      'href',
      'https://github.com/advancedengineeredsoftware/Bitcode',
    );
    // Whitepaper is first in the product interfaces list.
    const interfaceList = screen.getByRole('list', { name: 'Product interfaces' });
    const interfaceLabels = Array.from(interfaceList.querySelectorAll('li')).map(
      (li) => li.textContent ?? '',
    );
    expect(interfaceLabels[0]).toMatch(/Bitcode Whitepaper/u);
    expect(
      screen.getByText(
        /Bitcode's canonical, commercial deployments are its mainnet ERC-1155/u,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Bitcode \(BTD\) tokens are an immutable, scarce, deflationary, data-backed digital asset/u,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Measurements are visible; IP is not\. Bitcode is source-safe knowledge trading/u),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /An AssetPack's BTD volume is a protocol determination\. The price of BTD is a market one/u,
      ),
    ).toBeInTheDocument();
    // Claim anchors: * after ERC-1155, ** after Measured, *** after AssetPacks
    // Footnotes: * BTD · ** Measurements · *** AssetPack volume.
    expect(screen.getAllByText('***').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('**').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('*').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Public Measures')).toBeInTheDocument();
    expect(screen.getByText('Private Source')).toBeInTheDocument();
    expect(screen.getByText('Auditable Trade')).toBeInTheDocument();
  });
});
