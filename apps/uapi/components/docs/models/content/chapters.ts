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
    summary:
      'What Bitcode is: AssetPacks, BTD volume and rights, BTC settlement, and the /deposits · /reads · /packs product map.',
    pages: docsPagesFor(['what-is-bitcode', 'source-shares']),
  },
  {
    id: 'experiences',
    number: '01',
    title: 'Product Routes',
    summary:
      'How operators write and reread: Packs activity ledger, deposit/read actions, and proof-bearing results.',
    pages: docsPagesFor(['exchange', 'product-workspace', 'product-actions', 'read-results']),
  },
  {
    id: 'modes',
    number: '02',
    title: 'Operator Modes',
    summary:
      'Auxillaries (wallet, externals, profile, interfaces), conversations, and launch configuration honesty.',
    pages: docsPagesFor(['auxillaries', 'conversations', 'configuration']),
  },
  {
    id: 'protocol',
    number: '03',
    title: 'Protocol And Proof',
    summary:
      'Canon map, proof families, settlement, BTD, disclosure, and fail-closed promotion posture.',
    pages: docsPagesFor(['protocol', 'proofs', 'settlement-btd']),
  },
  {
    id: 'interfaces',
    number: '04',
    title: 'Commercial Interfaces',
    summary:
      'GitHub, webhooks, MCP/API, ChatGPT App, and why every interface rereads the same source-safe state.',
    pages: docsPagesFor(['commercial-interfaces', 'mcp-api', 'chatgpt-app']),
  },
] as const satisfies readonly BitcodeDocsChapter[];

export const BITCODE_DOCS_PAGE_SLUGS = BITCODE_DOCS_PAGES.map((page) => page.slug);

export function getBitcodeDocsPage(slug: string | undefined): BitcodeDocsPage | null {
  return BITCODE_DOCS_PAGES.find((page) => page.slug === slug) ?? null;
}
