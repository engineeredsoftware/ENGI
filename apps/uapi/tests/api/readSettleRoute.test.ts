/**
 * @jest-environment node
 *
 * MVP-E2E L1-R3: POST /api/read/settle fail-closed contracts.
 * Server rehydrate (synthesisRunId + selectedIndexes) is required —
 * client selectedOptions are not accepted.
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock('@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack', () => {
  const actual = jest.requireActual(
    '@bitcode/asset-packs-pipelines-execution-pipeline-simple-settle-asset-pack',
  );
  return {
    ...actual,
    runExecutionPipelineSimpleSettleAssetPack: jest.fn(async () => ({
      ok: true,
      schema: 'bitcode.settle-asset-pack.result',
      summary: 'Mock settle completed for L1-R3.',
      packActivity: {
        deliveryState: 'projected',
        prUrl: null,
        measurements: [],
        assetPackTitle: 'Session refresh pack',
        repositoryFullName: 'acme/payments',
        assetPackKey: 'ap-mock-1',
        paymentObservation: { amountSats: 0 },
        shippable: null,
      },
      shippable: {
        schema: 'bitcode.settle-asset-pack.shippable',
        deliveryMechanism: 'projected-pr',
        repository: { fullName: 'acme/payments' },
        patchCount: 1,
        prUrl: null,
        status: 'projected',
        note: 'Mock projected delivery',
      },
      mintBtd: null,
      settleBtd: null,
      settleAssetPack: null,
      pendingPayout: { status: 'pending-seller-review' },
    })),
  };
});

// Avoid loading domain preprocess/tools (generic-tools-editing path) for this gate suite.
jest.mock('@bitcode/asset-packs-pipelines-syntheses-domain', () => ({
  storeCrossPhaseArtifact: jest.fn(),
}));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { POST } from '@/app/api/read/settle/route';

const mockCreateClient = createClient as jest.Mock;
const mockFrom = supabaseAdmin.from as jest.Mock;

function requestFor(body: unknown) {
  return new Request('http://localhost/api/read/settle', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function settleableOption(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Session refresh pack',
    summary: 'Need-serving OAuth session refresh knowledge.',
    kind: 'capability-slice',
    confidence: 0.8,
    needFit: 0.75,
    patch: {
      patchSummary: 'Session refresh',
      fileChanges: [{ path: 'src/auth/session.ts', op: 'modify', body: 'export const x = 1' }],
    },
    measurements: {
      needinesses: [
        { measurementKind: 'domain-fit', volume: 0.8, weight: 1, magnitude: 0.8 },
        { measurementKind: 'language-fit', volume: 0.7, weight: 1, magnitude: 0.7 },
      ],
      absolutes: [
        {
          measurementKind: 'function-count',
          volume: 0.5,
          magnitude: 10,
          status: 'measured',
          weight: 0.01,
        },
      ],
    },
    ...overrides,
  };
}

describe('POST /api/read/settle (MVP-E2E L1-R3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires a session (L1-A1)', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    });
    const response = await POST(
      requestFor({
        synthesisRunId: 'run-1',
        selectedIndexes: [0],
      }),
    );
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'read_session_required' }),
    );
  });

  it('requires synthesisRunId + selectedIndexes (rehydrate law)', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    const response = await POST(
      requestFor({
        selectedOptions: [settleableOption()],
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'rehydrate_required' }),
    );
  });

  it('404 when synthesis run missing or not owned', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { id: 'run-other', user_id: 'other-user', output: {}, context: {} },
            error: null,
          }),
        }),
      }),
    });
    const response = await POST(
      requestFor({
        synthesisRunId: 'run-other',
        selectedIndexes: [0],
      }),
    );
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'synthesis_run_required' }),
    );
  });

  it('400 when selected index is missing from fullOptions', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              id: 'run-1',
              user_id: 'u1',
              output: { fullOptions: [settleableOption()] },
              context: {},
            },
            error: null,
          }),
        }),
      }),
      insert: jest.fn(async () => ({ error: null })),
      update: () => ({
        eq: () => ({
          eq: async () => ({ error: null }),
        }),
      }),
    });
    const response = await POST(
      requestFor({
        synthesisRunId: 'run-1',
        selectedIndexes: [5],
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'option_index_missing' }),
    );
  });

  it('400 when rehydrated option fails commercial parse (no needinesses)', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: {
              id: 'run-1',
              user_id: 'u1',
              output: {
                fullOptions: [{ title: 'Broken', measurements: { needinesses: [] } }],
              },
              context: {},
            },
            error: null,
          }),
        }),
      }),
    });
    const response = await POST(
      requestFor({
        synthesisRunId: 'run-1',
        selectedIndexes: [0],
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ code: 'option_rehydrate_invalid' }),
    );
  });

  it('dispatches settle for rehydrated fullOptions (mock pipeline)', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    });
    const insert = jest.fn(async () => ({ error: null }));
    const updateEq = jest.fn(async () => ({ error: null }));
    mockFrom.mockImplementation((table: string) => {
      if (table === 'executions') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: 'run-1',
                  user_id: 'u1',
                  output: { fullOptions: [settleableOption()] },
                  context: {},
                },
                error: null,
              }),
            }),
          }),
          insert,
          update: () => ({
            eq: () => ({
              eq: updateEq,
            }),
          }),
        };
      }
      if (table === 'user_connections') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null, error: null }),
                }),
              }),
            }),
          }),
        };
      }
      return {
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
        insert: async () => ({ error: null }),
        update: () => ({ eq: async () => ({ error: null }) }),
      };
    });

    const response = await POST(
      requestFor({
        synthesisRunId: 'run-1',
        selectedIndexes: [0],
        repositoryFullName: 'acme/payments',
        payAsset: 'ETH',
        need: 'OAuth session refresh',
      }),
    );
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.optionCount).toBe(1);
    expect(Array.isArray(payload.settleRunIds)).toBe(true);
    expect(payload.settleRunIds.length).toBe(1);
    expect(insert).toHaveBeenCalled();
  });
});
