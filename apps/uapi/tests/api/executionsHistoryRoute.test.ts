import { GET as getHistory } from '@/app/api/executions/history/route';

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';

function buildExecutionHistoryListQuery(result: { data: any[]; error: any }) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };
}

describe('GET /api/executions/history', () => {
  const mockUser = { id: 'user-1' };
  const mockGetUser = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (createClient as jest.Mock).mockResolvedValue({ auth: { getUser: mockGetUser } });
  });

  it('fails closed to an empty history list when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('no') });
    const req = new Request('http://localhost/api/executions/history');
    const res = await getHistory(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('returns normalized persisted execution history rows with reread summary, repo snapshot, and processing stats', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const rows = [
      {
        id: 'run-proof',
        user_id: mockUser.id,
        created_at: '2026-04-22T12:00:00.000Z',
        started_at: '2026-04-22T11:58:00.000Z',
        completed_at: '2026-04-22T12:04:00.000Z',
        status: 'completed',
        type: 'agentic-execution:proof-refresh',
        input: {
          guide: 'refresh proof families',
        },
        output: {
          summary: 'Recorded closure posture.',
          asset_pack_completion: {
            summary: 'Recorded closure posture.',
            assetPackSynthesisArtifacts: {
              summary: 'Recorded closure AssetPack synthesis artifacts.',
              fileChanges: { edited: 2, created: 0, deleted: 0 },
              proofEvidence: ['history-list-primary-artifacts'],
            },
            writtenAssets: {
              summary: 'Recorded closure posture.',
            },
            deliveryMechanism: {
              comments: [{ title: 'Proof note', url: 'https://example.com/comments/1', number: 1 }],
            },
            read: 'Refresh fifth-gate proof posture and closure evidence.',
            writtenAssetType: 'proof-refresh',
            assetPack: {
              read: 'Refresh fifth-gate proof posture and closure evidence.',
              writtenAssetType: 'proof-refresh',
              deliveryTarget: 'proof',
            },
            processingStats: {
              time: '4m 12s',
              tokens: {
                input: 120,
                output: 40,
                total: 160,
              },
              measuredBtd: 24.5,
              btcFeeUsdEquivalent: 1.62,
              averageLatencyMs: 930,
            },
          },
        },
        context: {
          source: 'terminal-closure-control',
          repoSnapshot: {
            org: 'bitcode',
            repo: 'terminal',
            branch: 'main',
            commit: 'abc123',
          },
        },
        items: [{ id: 'artifact-1' }],
        error: null,
        total_tokens: null,
        total_cost: null,
        duration_ms: null,
      },
      {
        id: 'run-branch',
        user_id: mockUser.id,
        created_at: '2026-04-22T11:00:00.000Z',
        started_at: null,
        completed_at: null,
        status: 'completed',
        type: 'agentic-execution:asset-pack',
        input: {},
        output: {
          preprocessed: {
            read: 'Materialize a branch-ready asset pack for settlement follow-through.',
            writtenAssetType: 'branch-artifact',
            assetPack: {
              read: 'Materialize a branch-ready asset pack for settlement follow-through.',
              writtenAssetType: 'branch-artifact',
              deliveryTarget: 'pr',
            },
          },
          asset_pack_completion: {
            summary: 'Branch artifact persisted.',
            assetPackSynthesisArtifacts: {
              summary: 'Branch AssetPack synthesis artifacts.',
              fileChanges: { edited: 1, created: 1, deleted: 0 },
            },
            repoSnapshot: {
              org: 'bitcode',
              repo: 'terminal',
              branch: 'repair',
              commit: 'def456',
            },
            processingStats: {
              time: '55s',
              tokens: {
                total: 80,
              },
            },
          },
        },
        context: {
          guide: 'materialize branch pack',
        },
        items: [],
        error: null,
        total_tokens: null,
        total_cost: null,
        duration_ms: null,
      },
    ];

    const builder = buildExecutionHistoryListQuery({ data: rows, error: null });
    (supabaseAdmin.from as jest.Mock).mockReturnValue(builder);

    const req = new Request('http://localhost/api/executions/history');
    const res = await getHistory(req);

    expect(res.status).toBe(200);
    expect(builder.eq).toHaveBeenCalledWith('user_id', mockUser.id);

    const body = await res.json();
    expect(body).toEqual([
      expect.objectContaining({
        id: 'run-proof',
        status: 'completed',
        type: 'agentic-execution:proof-refresh',
        guide: 'refresh proof families',
        summary: 'Recorded closure posture.',
        repo_snapshot: {
          org: 'bitcode',
          repo: 'terminal',
          branch: 'main',
          commit: 'abc123',
        },
        processing_stats: {
          time: '4m 12s',
          tokens: {
            input: 120,
            output: 40,
            total: 160,
          },
          measuredBtd: 24.5,
          btdSemantics: 'non_fungible_asset_pack_share_read_right',
          feeAsset: 'BTC',
          btcFeeUsdEquivalent: 1.62,
          averageLatencyMs: 930,
        },
        written_assets: {
          summary: 'Recorded closure posture.',
        },
        asset_pack_synthesis_artifacts: {
          summary: 'Recorded closure AssetPack synthesis artifacts.',
          fileChanges: { edited: 2, created: 0, deleted: 0 },
          proofEvidence: ['history-list-primary-artifacts'],
        },
        delivery_mechanism: {
          summary: 'Recorded closure posture.',
        },
        shippables: null,
        read: 'Refresh fifth-gate proof posture and closure evidence.',
        written_asset_type: 'proof-refresh',
        asset_pack: {
          read: 'Refresh fifth-gate proof posture and closure evidence.',
          writtenAssetType: 'proof-refresh',
          deliveryTarget: 'proof',
        },
        asset_pack_completion: expect.objectContaining({
          summary: 'Recorded closure posture.',
          assetPackSynthesisArtifacts: {
            summary: 'Recorded closure AssetPack synthesis artifacts.',
            fileChanges: { edited: 2, created: 0, deleted: 0 },
            proofEvidence: ['history-list-primary-artifacts'],
          },
          writtenAssets: {
            summary: 'Recorded closure posture.',
          },
          deliveryMechanism: {
            summary: 'Recorded closure posture.',
          },
          read: 'Refresh fifth-gate proof posture and closure evidence.',
          writtenAssetType: 'proof-refresh',
          assetPack: {
            read: 'Refresh fifth-gate proof posture and closure evidence.',
            writtenAssetType: 'proof-refresh',
            deliveryTarget: 'proof',
          },
        }),
      }),
      expect.objectContaining({
        id: 'run-branch',
        type: 'agentic-execution:asset-pack',
        guide: 'materialize branch pack',
        summary: 'Branch artifact persisted.',
        repo_snapshot: {
          org: 'bitcode',
          repo: 'terminal',
          branch: 'repair',
          commit: 'def456',
        },
        processing_stats: {
          time: '55s',
          tokens: {
            input: 0,
            output: 0,
            total: 80,
          },
          btdSemantics: 'non_fungible_asset_pack_share_read_right',
          feeAsset: 'BTC',
        },
        asset_pack_synthesis_artifacts: {
          summary: 'Branch AssetPack synthesis artifacts.',
          fileChanges: { edited: 1, created: 1, deleted: 0 },
        },
        written_assets: {
          summary: 'Branch AssetPack synthesis artifacts.',
          fileChanges: { edited: 1, created: 1, deleted: 0 },
        },
        delivery_mechanism: {
          summary: 'Branch artifact persisted.',
        },
        shippables: null,
        read: 'Materialize a branch-ready asset pack for settlement follow-through.',
        written_asset_type: 'branch-artifact',
        asset_pack: {
          read: 'Materialize a branch-ready asset pack for settlement follow-through.',
          writtenAssetType: 'branch-artifact',
          deliveryTarget: 'pr',
        },
        asset_pack_completion: expect.objectContaining({
          summary: 'Branch artifact persisted.',
          assetPackSynthesisArtifacts: {
            summary: 'Branch AssetPack synthesis artifacts.',
            fileChanges: { edited: 1, created: 1, deleted: 0 },
          },
          writtenAssets: {
            summary: 'Branch AssetPack synthesis artifacts.',
            fileChanges: { edited: 1, created: 1, deleted: 0 },
          },
          deliveryMechanism: {
            summary: 'Branch artifact persisted.',
          },
          read: 'Materialize a branch-ready asset pack for settlement follow-through.',
          writtenAssetType: 'branch-artifact',
          assetPack: {
            read: 'Materialize a branch-ready asset pack for settlement follow-through.',
            writtenAssetType: 'branch-artifact',
            deliveryTarget: 'pr',
          },
        }),
      }),
    ]);
  });
});
