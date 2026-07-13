/**
 * Docs chapter groupings and page lookup helpers.
 */
import type { BitcodeDocsChapter, BitcodeDocsPage } from '../bitcode-docs-types';
import { BITCODE_DOCS_PAGES } from './pages';

function docsPagesFor(slugs: readonly string[]) {
  return slugs.map((slug) => {
    const page = BITCODE_DOCS_PAGES.find((candidate) => candidate.slug === slug);
    if (!page) {
      throw new Error(`Missing Bitcode docs page for slug: ${slug}`);
    }
    return page;
  });
}

export const BITCODE_DOCS_CHAPTERS = [
  {
    id: 'start',
    number: '00',
    title: 'Start Here',
    summary: 'A zero-to-hero introduction to AssetPacks, BTD scalar volume and rights, BTC settlement, /deposits, /reads, /packs, and the product map.',
    pages: docsPagesFor(['what-is-bitcode', 'source-shares']),
  },
  {
    id: 'experiences',
    number: '01',
    title: 'Product Routes',
    summary: 'The product experiences: /packs master-detail, bounded write actions, and proof-bearing reads.',
    pages: docsPagesFor(['exchange', 'terminal', 'terminal-actions', 'read-results']),
  },
  {
    id: 'modes',
    number: '02',
    title: 'Operator Modes',
    summary: 'Auxillaries, conversations, configuration, feature flags, launch mode, and readiness posture.',
    pages: docsPagesFor(['auxillaries', 'conversations', 'configuration']),
  },
  {
    id: 'protocol',
    number: '03',
    title: 'Protocol And Proof',
    summary: 'Canon, proof families, generated evidence, settlement, BTD, disclosure, and fail-closed rules.',
    pages: docsPagesFor(['protocol', 'proofs', 'settlement-btd']),
  },
  {
    id: 'interfaces',
    number: '04',
    title: 'Commercial Interfaces',
    summary: 'GitHub, webhooks, MCP/API, ChatGPT App, compute, storage, and connected-interface admission.',
    pages: docsPagesFor(['commercial-interfaces', 'mcp-api', 'chatgpt-app']),
  },
] as const satisfies readonly BitcodeDocsChapter[];

export const BITCODE_DOCS_PAGE_SLUGS = BITCODE_DOCS_PAGES.map((page) => page.slug);

export function getBitcodeDocsPage(slug: string | undefined): BitcodeDocsPage | null {
  return BITCODE_DOCS_PAGES.find((page) => page.slug === slug) ?? null;
}
