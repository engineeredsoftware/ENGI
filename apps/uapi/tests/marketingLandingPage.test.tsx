/* eslint-disable react/no-multi-comp */

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { BITCODE_PUBLIC_COPY } from '@/components/bitcode/layout/BitcodePublicCopy/bitcode-public-copy';
import MarketingLandingPage from '@/components/marketing/MarketingLandingPage/MarketingLandingPage';
import { verificationRows } from '@/components/marketing/MarketingLandingShared/MarketingLandingShared';

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

    expect(screen.getByText(BITCODE_PUBLIC_COPY.headline)).toBeInTheDocument();
    const buyLinks = screen.getAllByRole('link', {
      name: BITCODE_PUBLIC_COPY.primaryCta.label,
    });
    expect(buyLinks.length).toBeGreaterThanOrEqual(1);
    buyLinks.forEach((link) =>
      expect(link).toHaveAttribute('href', BITCODE_PUBLIC_COPY.primaryCta.href),
    );
    expect(
      screen.getByRole('link', { name: BITCODE_PUBLIC_COPY.secondaryCta.label }),
    ).toHaveAttribute('href', BITCODE_PUBLIC_COPY.secondaryCta.href);
    expect(
      screen.getByRole('link', { name: BITCODE_PUBLIC_COPY.tertiaryCta.label }),
    ).toHaveAttribute('href', BITCODE_PUBLIC_COPY.tertiaryCta.href);

    expect(screen.getByRole('button', { name: 'May–July' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'April' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'March' })).toBeInTheDocument();
    expect(screen.getByText('Developing an MVP')).toBeInTheDocument();
    expect(screen.getByTestId('micro-blog-meta')).toHaveAttribute(
      'aria-label',
      'May–July 2026',
    );

    expect(screen.getByText('A Data Marketplace')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        const normalized = node?.textContent?.replace(/\s+/g, ' ').trim();
        return (
          normalized === 'A Knowledge Depot, An Endless Economy' &&
          node?.tagName === 'P'
        );
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(BITCODE_PUBLIC_COPY.productPreview.rail),
    ).toBeInTheDocument();
    // Upper depot renders mobile + laptop trees (CSS-hidden), so labels can match more than once.
    expect(screen.getAllByText('Source Measurements').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Absolutes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Needinesses').length).toBeGreaterThan(0);
    expect(screen.getAllByText("Packs' BTD Volume").length).toBeGreaterThan(0);
    expect(screen.getAllByText('431').length).toBeGreaterThan(0);
    expect(screen.getByTestId('landing-depot-upper')).toBeInTheDocument();
    expect(screen.getByTestId('landing-depot-lower')).toBeInTheDocument();
    expect(screen.getByTestId('landing-production-band')).toBeInTheDocument();

    // Soft-gate waitlist below the fold (after audience); scroll cue unregressed.
    expect(screen.getByTestId('landing-waitlist-enter')).toBeInTheDocument();
    expect(screen.getByTestId('landing-waitlist')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: BITCODE_PUBLIC_COPY.waitlist.title }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('landing-waitlist-email')).toBeInTheDocument();
    expect(screen.getByTestId('landing-waitlist-submit')).toHaveTextContent(
      BITCODE_PUBLIC_COPY.waitlist.ctaLabel,
    );
    expect(screen.getByTestId('landing-scroll-cue')).toBeInTheDocument();

    // Depot panels (page copy is SSOT).
    expect(
      screen.getAllByText(BITCODE_PUBLIC_COPY.operatorFrame.title).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(BITCODE_PUBLIC_COPY.operatorFrame.subtitle).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(BITCODE_PUBLIC_COPY.sourceToSettlement.title).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(BITCODE_PUBLIC_COPY.sourceToSettlement.subtitle)
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(BITCODE_PUBLIC_COPY.settlementLedger.title).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(BITCODE_PUBLIC_COPY.settlementLedger.subtitle)
        .length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Safe on both sides').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Private Source').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Clean Rights').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fail-Closed Settle').length).toBeGreaterThan(0);

    for (const row of BITCODE_PUBLIC_COPY.operatorFrame.rows) {
      expect(screen.getAllByText(row.label).length).toBeGreaterThan(0);
    }
    for (const row of BITCODE_PUBLIC_COPY.sourceToSettlement.rows) {
      expect(screen.getAllByText(row.label).length).toBeGreaterThan(0);
    }
    for (const row of BITCODE_PUBLIC_COPY.settlementLedger.rows) {
      expect(screen.getAllByText(row.label).length).toBeGreaterThan(0);
    }
    for (const row of verificationRows) {
      expect(screen.getAllByText(row.label).length).toBeGreaterThan(0);
    }

    expect(screen.getAllByText('DataPacks').length).toBeGreaterThan(0);
    expect(screen.getByTestId('landing-why-now')).toBeInTheDocument();
    expect(screen.getByText('Why now')).toBeInTheDocument();
    expect(
      screen.getByText(/Buying the data that trains AI is broken/u),
    ).toBeInTheDocument();
    expect(screen.getByText(/~\$100B/u)).toBeInTheDocument();
    expect(screen.getByText(/~25%/u)).toBeInTheDocument();

    expect(screen.getByTestId('landing-audience-sections')).toBeInTheDocument();
    expect(screen.getByTestId('landing-scroll-cue')).toBeInTheDocument();
    expect(screen.getByTestId('landing-value-flow')).toBeInTheDocument();
    expect(screen.getByText(BITCODE_PUBLIC_COPY.valueFlow.title)).toBeInTheDocument();
    expect(
      screen.getByText(BITCODE_PUBLIC_COPY.audienceBuyers.headline),
    ).toBeInTheDocument();
    expect(
      screen.getByText(BITCODE_PUBLIC_COPY.audienceSellers.headline),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: BITCODE_PUBLIC_COPY.audienceSellers.cta.label,
      }),
    ).toHaveAttribute('href', BITCODE_PUBLIC_COPY.audienceSellers.cta.href);

    expect(
      screen.getByText((_, node) => {
        if (node?.tagName !== 'P') return false;
        const text = node.textContent ?? '';
        return (
          text.includes('The stock market for data is here') &&
          text.includes('DataPacks') &&
          text.includes('Ironclad IP protection') &&
          text.includes('global') &&
          text.includes('liquid') &&
          text.includes('on-chain settlement')
        );
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Synthesize Packs')).toBeInTheDocument();
    expect(screen.getByText('Review Options')).toBeInTheDocument();
    expect(screen.getByText('Buy Bitcodes')).toBeInTheDocument();
    expect(screen.getAllByText('Deposit').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Read').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settle').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Exchange').length).toBeGreaterThan(0);
    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.getByTestId('landing-orbital-ambience')).toHaveClass(
      'hidden',
      'laptop:block',
    );
    expect(screen.getByTestId('landing-pointer-glow')).toHaveClass(
      'hidden',
      'laptop:block',
    );
    expect(screen.getByTestId('landing-ambient-glow')).toHaveClass(
      'hidden',
      'laptop:block',
    );
  });

  it('explains commercial product launch readiness with core flows and source-safe trust messaging', () => {
    render(<MarketingLandingPage />);

    const section = screen.getByTestId('landing-testnet-launch');
    expect(section).toBeInTheDocument();
    // Badge splits across two spans on phone (Productionized / Protocol).
    const badge = BITCODE_PUBLIC_COPY.testnetLaunch.badge;
    expect(section.textContent ?? '').toMatch(
      new RegExp(badge.split(/\s+/).join('\\s*'), 'u'),
    );
    expect(
      screen.getByText((_, node) => {
        if (node?.tagName !== 'H2') return false;
        return (node.textContent ?? '').includes('Code for Coin.');
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Code', { selector: 'h2 span' })).toBeInTheDocument();
    expect(screen.getByText('Coin', { selector: 'h2 span' })).toBeInTheDocument();
    // Phone + tablet meaning copy both render; any match is enough.
    expect(
      screen.getAllByText((_, node) => {
        if (node?.tagName !== 'P') return false;
        const text = node.textContent ?? '';
        return (
          text.includes("Bitcode's data-commerce") &&
          text.includes('products are the Tokens') &&
          text.includes('and Exchange') &&
          text.includes('ledgers, and the applications')
        );
      }).length,
    ).toBeGreaterThan(0);
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
    expect(
      screen.queryByRole('link', { name: /Website Application/u }),
    ).toBeNull();
    expect(
      screen.queryByRole('link', { name: /Conversational Extensions/u }),
    ).toBeNull();
    const whitepaperLink = screen.getByRole('link', {
      name: /Bitcode Whitepaper/u,
    });
    expect(whitepaperLink).toHaveAttribute(
      'href',
      'https://github.com/advancedengineeredsoftware/Bitcode/blob/version/v48/Whitepaper.md',
    );
    expect(screen.getByRole('link', { name: 'MCP API' })).toHaveAttribute(
      'href',
      '/docs/mcp-api',
    );
    const repoLink = screen.getByRole('link', {
      name: /Contributable Repository/u,
    });
    expect(repoLink).toHaveAttribute(
      'href',
      'https://github.com/advancedengineeredsoftware/Bitcode',
    );
    const interfaceList = screen.getByRole('list', {
      name: 'Product interfaces',
    });
    const interfaceLabels = Array.from(
      interfaceList.querySelectorAll('li'),
    ).map((li) => li.textContent ?? '');
    expect(interfaceLabels[0]).toMatch(/Bitcode Whitepaper/u);
    expect(
      screen.getByText(
        /Measurements are visible; IP is not\. Bitcode is source-safe knowledge trading/u,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Tokens \(BTD, DataPacks\) are an immutable, scarce, deflationary, data-backed digital asset/u,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /A DataPack's BTD volume is a protocol determination\. The price of BTD is a market one/u,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('***').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('**').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('*').length).toBeGreaterThanOrEqual(2);
  });
});
