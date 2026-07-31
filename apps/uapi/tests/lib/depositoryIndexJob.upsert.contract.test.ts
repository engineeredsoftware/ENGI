/**
 * @jest-environment node
 *
 * MVP-E2E L3-IDX: indexDepositoryAssetPack document upsert contract (mocked Supabase).
 * Asserts commercial NL + fixtures land on depository_search_documents without live DB.
 */

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock('@/lib/bitcode-server-telemetry', () => ({
  bitcodeServerTelemetry: jest.fn(),
}));

jest.mock('@bitcode/asset-packs-pipelines-syntheses-domain/depository-embed', () => ({
  embedDepositoryText: jest.fn(async () => null),
}));

import { supabaseAdmin } from '@bitcode/supabase';
import { indexDepositoryAssetPack } from '@/lib/depository-index-job';

const mockFrom = supabaseAdmin.from as jest.Mock;

function installUpsertCapture() {
  const upserts: Array<{ table: string; row: Record<string, unknown> }> = [];
  mockFrom.mockImplementation((table: string) => {
    if (table === 'depository_search_documents') {
      return {
        upsert: async (row: Record<string, unknown>) => {
          upserts.push({ table, row });
          return { error: null };
        },
        update: () => ({
          eq: async () => ({ error: null }),
        }),
      };
    }
    if (table === 'depository_search_vectors') {
      return {
        upsert: async (row: Record<string, unknown>) => {
          upserts.push({ table, row });
          return { error: null };
        },
      };
    }
    throw new Error(`unexpected table ${table}`);
  });
  return upserts;
}

describe('indexDepositoryAssetPack upsert contract (MVP-E2E L3-IDX)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upserts document with commercial NL, fixtures, and sectioned embed_text', async () => {
    const upserts = installUpsertCapture();
    const result = await indexDepositoryAssetPack({
      assetId: 'ap-l3-1',
      title: 'Internal title',
      summary: 'Internal summary',
      commercialTitle: 'Stripe webhook retries knowledge pack',
      commercialDescription: 'Buyer-facing exponential backoff guidance.',
      kind: 'capability-slice',
      repositoryFullName: 'acme/payments',
      lifecycle: 'admitted-to-depository',
      topics: ['stripe', 'webhooks'],
      coveredSourcePaths: ['src/payments/stripe.ts'],
      absoluteVolumes: { 'function-count': 0.4 },
      absoluteFixtures: [
        {
          measurementKind: 'function-count',
          label: 'Functions',
          descriptor: 'Retry helpers',
          volume: 0.4,
          status: 'measured',
        },
      ],
      skipEmbed: true,
    });

    expect(result.ok).toBe(true);
    expect(result.embeddingState).toBe('skipped');
    expect(upserts).toHaveLength(1);
    const row = upserts[0].row;
    expect(row.asset_id).toBe('ap-l3-1');
    expect(row.commercial_title).toBe('Stripe webhook retries knowledge pack');
    expect(row.commercial_description).toContain('Buyer-facing');
    expect(row.embed_text).toEqual(expect.stringContaining('§nl'));
    expect(String(row.embed_text)).toContain('Stripe webhook retries');
    expect(String(row.embed_text)).not.toContain('Internal title');
    expect(row.absolute_fixtures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ measurementKind: 'function-count', volume: 0.4 }),
      ]),
    );
    expect(row.embedding_state).toBe('pending');
    expect(String(row.embed_text_root)).toMatch(/^sha256:/);
  });

  it('fails closed when assetId missing', async () => {
    const upserts = installUpsertCapture();
    const result = await indexDepositoryAssetPack({
      assetId: '',
      title: 'x',
      skipEmbed: true,
    });
    expect(result.ok).toBe(false);
    expect(result.embeddingState).toBe('failed');
    expect(upserts).toHaveLength(0);
  });

  it('returns failed when document upsert errors', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'depository_search_documents') {
        return {
          upsert: async () => ({ error: { message: 'relation missing' } }),
        };
      }
      return { upsert: async () => ({ error: null }) };
    });
    const result = await indexDepositoryAssetPack({
      assetId: 'ap-fail',
      title: 'Pack',
      skipEmbed: true,
    });
    expect(result.ok).toBe(false);
    expect(result.embeddingState).toBe('failed');
    expect(result.error).toMatch(/relation missing/);
  });
});
