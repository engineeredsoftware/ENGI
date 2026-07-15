import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import PublicDocsPageContent from '@/components/marketing/PublicDocsPageContent/PublicDocsPageContent';

jest.mock('@/components/bitcode/layout/Footer/Footer', () => ({
  __esModule: true,
  default: () => <div>Footer</div>,
}));

jest.mock('@/components/marketing/MarketingOperatorGuideCard/MarketingOperatorGuideCard', () => ({
  __esModule: true,
  default: ({ initialSourcePlayable }: { initialSourcePlayable: boolean }) => (
    <div>{initialSourcePlayable ? 'Guide playable' : 'Guide fallback'}</div>
  ),
}));

describe('PublicDocsPageContent', () => {
  it('renders docs-owned public teaching surfaces', () => {
    render(<PublicDocsPageContent sourcePlayable={false} />);

    expect(screen.getByText('Learn Bitcode from AssetPacks to proof.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start reading' })).toHaveAttribute('href', '/docs/what-is-bitcode');
    expect(screen.getByText('Read in this order if Bitcode is new.')).toBeInTheDocument();
    expect(screen.getByText('Product docs map back to the active canon.')).toBeInTheDocument();
    expect(screen.getByText(/V48/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /What Bitcode is/ })).toHaveAttribute(
      'href',
      '/docs/what-is-bitcode',
    );
    expect(
      screen.getByRole('link', {
        name: /AssetPacks, BTD, and the Bitcode activity ledger/,
      }),
    ).toHaveAttribute('href', '/docs/source-shares');
    expect(
      screen.getByRole('link', {
        name: /Understand \/exchange compatibility and \/packs/,
      }),
    ).toHaveAttribute('href', '/docs/exchange');
    expect(
      screen.getByRole('link', { name: /Orient on Packs, Deposit, and Read/ }),
    ).toHaveAttribute('href', '/docs/product-workspace');
    expect(
      screen.getByRole('link', {
        name: /Actions: what writes and what should read back/,
      }),
    ).toHaveAttribute('href', '/docs/product-actions');
    expect(
      screen.getByRole('link', {
        name: /Reads, proofs, readiness, and expected results/,
      }),
    ).toHaveAttribute('href', '/docs/read-results');
    expect(
      screen.getByRole('link', {
        name: /Operate Bitcode through MCP and API surfaces/,
      }),
    ).toHaveAttribute('href', '/docs/mcp-api');
    expect(
      screen.getByRole('link', {
        name: /Use the ChatGPT App as a connected Bitcode interface/,
      }),
    ).toHaveAttribute('href', '/docs/chatgpt-app');
    expect(screen.getByText('Guide fallback')).toBeInTheDocument();
  });
});
