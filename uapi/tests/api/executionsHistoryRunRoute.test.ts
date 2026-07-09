import { GET as getRunHistory } from '@/app/api/executions/history/[runId]/route';

jest.mock('@bitcode/supabase/ssr/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@bitcode/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

const { createClient } = require('@bitcode/supabase/ssr/server');
const { supabaseAdmin } = require('@bitcode/supabase');

describe('GET /api/executions/history/[runId]', () => {
  const mockUser = { id: 'user-1' };
  const mockGetUser = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: mockGetUser },
    });
  });

  it('fails closed to an empty run payload when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('no') });

    const req = new Request('http://localhost/api/executions/history/run-1');
    const res = await getRunHistory(req, { params: { runId: 'run-1' } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ run: null, events: [] });
  });

  it('returns the persisted run detail with normalized event reread', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const runBuilder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest
        .fn()
        .mockResolvedValue({
          data: {
            id: 'run-1',
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
              asset_pack_completion: {
                summary: 'Persisted closure posture.',
                assetPackSynthesisArtifacts: {
                  summary: 'Persisted AssetPack synthesis artifacts.',
                  fileChanges: { edited: 3, created: 1, deleted: 0 },
                  proofEvidence: ['history-detail-primary-artifacts'],
                },
                writtenAssets: {
                  summary: 'Persisted closure posture.',
                },
                deliveryMechanism: {
                  comments: [{ title: 'Proof note', url: 'https://example.com/comments/9', number: 9 }],
                },
                read: 'Refresh closure proofs and reopen fourth-gate truth honestly.',
                writtenAssetType: 'proof-refresh',
                assetPack: {
                  read: 'Refresh closure proofs and reopen fourth-gate truth honestly.',
                  writtenAssetType: 'proof-refresh',
                  deliveryTarget: 'proof',
                },
                ledgerSettlement: {
                  status: 'settled',
                  settlementAdmissible: true,
                  reason: 'Rows read back.',
                  assetPackId: 'asset-pack-run-1',
                  btdRange: { start: 0, endExclusive: 1, tokenCount: 1 },
                  ledgerAnchorId: 'ledger-anchor-run-1',
                  btcFeeReceiptId: 'btc-fee-run-1',
                  ownershipEventId: 'ownership-mint-run-1',
                  readLicenseId: 'read-license-run-1',
                  readback: {
                    assetPackRange: true,
                    btcFeeTransaction: true,
                    ledgerAnchor: true,
                    terminalJournal: true,
                  },
                  journalEntryIds: ['journal-mint-run-1'],
                },
                repoSnapshot: {
                  org: 'bitcode',
                  repo: 'terminal',
                  branch: 'main',
                  commit: 'abc123',
                },
                processingStats: {
                  time: '4m 12s',
                  tokens: {
                    input: 160,
                    output: 60,
                    total: 220,
                  },
                  measuredBtd: 18.5,
                  btcFeeUsdEquivalent: 0.91,
                  averageLatencyMs: 880,
                },
              },
            },
            context: {},
            items: [{ id: 'artifact-1' }],
            error: null,
            total_tokens: null,
            total_cost: null,
            duration_ms: null,
          },
          error: null,
        }),
    };

    const eventsBuilder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      // Paginated history: .range() ends the chain (PostgREST 1000-row pages).
      range: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            run_id: 'run-1',
            event_type: 'phase',
            event_data: { type: 'phase', phase: 'verification', status: 'running' },
            created_at: '2026-04-22T12:01:00.000Z',
            agent_name: null,
            phase: 'verification',
          },
          {
            id: '2',
            run_id: 'run-1',
            event_type: 'completion',
            event_data: null,
            created_at: '2026-04-22T12:04:00.000Z',
            agent_name: 'settlement-agent',
            phase: 'settlement',
          },
        ],
        error: null,
      }),
    };

    const journalBuilder: any = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({
        data: [
          {
            journal_entry_id: 'journal-mint-run-1',
            transaction_kind: 'asset_pack_mint',
            actor_id: 'depositor-wallet',
            pre_state_root: 'sha256:before',
            post_state_root: 'sha256:after',
            receipt_roots: ['sha256:receipt'],
            ledger_anchor_ids: ['ledger-anchor-run-1'],
            exchange_sequence: 1,
            issued_at: '2026-04-22T12:03:00.000Z',
          },
        ],
        error: null,
      }),
    };

    const singleRowBuilder = (data: Record<string, unknown> | null): any => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data, error: null }),
    });

    const repairsBuilder: any = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          {
            repair_id: 'repair-run-1',
            reconciliation_id: 'reconciliation-run-1',
            fact_id: 'ledger-anchor-run-1',
            repair_kind: 'projection_confirmed',
            before_value: 'missing',
            after_value: 'present',
            blocking: false,
            issued_at: '2026-04-22T12:03:30.000Z',
          },
        ],
        error: null,
      }),
    };

    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'executions') return runBuilder;
      if (table === 'execution_events') return eventsBuilder;
      if (table === 'btd_terminal_journal_entries') return journalBuilder;
      if (table === 'btd_asset_pack_ranges') {
        return singleRowBuilder({ asset_pack_id: 'asset-pack-run-1', access_policy_hash: 'sha256:policy' });
      }
      if (table === 'btc_fee_transactions') {
        return singleRowBuilder({ receipt_id: 'btc-fee-run-1', finality_state: 'prepared' });
      }
      if (table === 'btd_asset_pack_ledger_anchors') {
        return singleRowBuilder({ anchor_id: 'ledger-anchor-run-1', finality_state: 'confirmed' });
      }
      if (table === 'btd_ownership_events') {
        return singleRowBuilder({ ownership_event_id: 'ownership-mint-run-1' });
      }
      if (table === 'btd_read_licenses') {
        return singleRowBuilder({ license_id: 'read-license-run-1' });
      }
      if (table === 'btd_ledger_database_reconciliation_repairs') return repairsBuilder;
      return { select: jest.fn().mockReturnThis() };
    });

    const req = new Request('http://localhost/api/executions/history/run-1');
    const res = await getRunHistory(req, { params: { runId: 'run-1' } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(eventsBuilder.range).toHaveBeenCalledWith(0, 999);
    expect(json.eventCount).toBe(2);
    expect(json.events).toHaveLength(2);
    expect(json.tail).toBeNull();
    expect(json.run).toEqual(
      expect.objectContaining({
        id: 'run-1',
        started_at: '2026-04-22T11:58:00.000Z',
        completed_at: '2026-04-22T12:04:00.000Z',
        summary: 'Persisted closure posture.',
        guide: 'refresh proof families',
        repo_snapshot: {
          org: 'bitcode',
          repo: 'terminal',
          branch: 'main',
          commit: 'abc123',
        },
        processing_stats: expect.objectContaining({
          time: '4m 12s',
          tokens: {
            input: 160,
            output: 60,
            total: 220,
          },
          measuredBtd: 18.5,
          btcFeeUsdEquivalent: 0.91,
          averageLatencyMs: 880,
        }),
        written_assets: {
          summary: 'Persisted closure posture.',
        },
        asset_pack_synthesis_artifacts: {
          summary: 'Persisted AssetPack synthesis artifacts.',
          fileChanges: { edited: 3, created: 1, deleted: 0 },
          proofEvidence: ['history-detail-primary-artifacts'],
        },
        read: 'Refresh closure proofs and reopen fourth-gate truth honestly.',
        written_asset_type: 'proof-refresh',
        asset_pack: {
          read: 'Refresh closure proofs and reopen fourth-gate truth honestly.',
          writtenAssetType: 'proof-refresh',
          deliveryTarget: 'proof',
        },
        asset_pack_completion: expect.objectContaining({
          summary: 'Persisted closure posture.',
          read: 'Refresh closure proofs and reopen fourth-gate truth honestly.',
          writtenAssetType: 'proof-refresh',
          assetPack: {
            read: 'Refresh closure proofs and reopen fourth-gate truth honestly.',
            writtenAssetType: 'proof-refresh',
            deliveryTarget: 'proof',
          },
          ledgerSettlement: expect.objectContaining({
            status: 'settled',
            assetPackId: 'asset-pack-run-1',
          }),
        }),
        ledger_settlement: expect.objectContaining({
          status: 'settled',
          assetPackId: 'asset-pack-run-1',
        }),
        terminal_journal: expect.objectContaining({
          expectedJournalEntryIds: expect.arrayContaining(['journal-mint-run-1']),
          entries: [
            expect.objectContaining({
              journal_entry_id: 'journal-mint-run-1',
              transaction_kind: 'asset_pack_mint',
            }),
          ],
          repairs: [
            expect.objectContaining({
              repair_id: 'repair-run-1',
            }),
          ],
        }),
      }),
    );
    expect(json.terminal_journal.ledgerRows.ledgerAnchors).toEqual([
      { anchor_id: 'ledger-anchor-run-1', finality_state: 'confirmed' },
    ]);
    expect(json.run.output.asset_pack_completion.deliveryMechanism.comments).toEqual([
      { title: 'Proof note', url: 'https://example.com/comments/9', number: 9 },
    ]);
    expect(Array.isArray(json.events)).toBe(true);
    expect(json.events[0].event).toEqual({
      type: 'phase',
      phase: 'verification',
      status: 'running',
    });
    expect(json.events[1].event).toEqual({
      type: 'completion',
      agent: 'settlement-agent',
      phase: 'settlement',
      timestamp: '2026-04-22T12:04:00.000Z',
    });
  });

  it('supports ?tail=N for last-N events without full pagination or journal', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const runBuilder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'run-tail',
          user_id: mockUser.id,
          created_at: '2026-04-22T12:00:00.000Z',
          started_at: '2026-04-22T11:58:00.000Z',
          completed_at: '2026-04-22T12:04:00.000Z',
          status: 'failed',
          type: 'agentic-execution:asset-pack',
          input: {},
          output: { summary: 'boom' },
          context: { source: 'deposit-option-synthesis' },
          items: [],
          error: { message: 'boom' },
          total_tokens: null,
          total_cost: null,
          duration_ms: 1000,
        },
        error: null,
      }),
    };

    const eventsBuilder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      // Newest-first page for tail=2 (desc), then route reverses to chrono order.
      range: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'newer',
            run_id: 'run-tail',
            event_type: 'error',
            event_data: { type: 'error', message: 'boom' },
            created_at: '2026-04-22T12:04:00.000Z',
            agent_name: null,
            phase: null,
          },
          {
            id: 'older',
            run_id: 'run-tail',
            event_type: 'status',
            event_data: {
              type: 'status',
              executionState: { phase: 'discovery', agent: 'A', generation: 'reason' },
            },
            created_at: '2026-04-22T12:03:00.000Z',
            agent_name: 'A',
            phase: 'discovery',
          },
        ],
        error: null,
      }),
    };

    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'executions') return runBuilder;
      if (table === 'execution_events') return eventsBuilder;
      throw new Error(`unexpected table ${table}`);
    });

    const req = new Request('http://localhost/api/executions/history/run-tail?tail=2');
    const res = await getRunHistory(req, { params: { runId: 'run-tail' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.tail).toBe(2);
    expect(json.events).toHaveLength(2);
    // Reversed to chronological: older then newer.
    expect(json.events[0].id).toBe('older');
    expect(json.events[1].id).toBe('newer');
    expect(json.terminal_journal).toBeUndefined();
    expect(eventsBuilder.range).toHaveBeenCalledWith(0, 1);
  });

  it('fails closed when the selected run is not owned by the authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const runBuilder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: {
          id: 'run-foreign',
          user_id: 'user-2',
          created_at: '2026-04-22T12:00:00.000Z',
          items: [],
          context: {},
        },
        error: null,
      }),
    };

    (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'executions') return runBuilder;
      throw new Error(`Unexpected table for unauthorized detail read: ${table}`);
    });

    const req = new Request('http://localhost/api/executions/history/run-foreign');
    const res = await getRunHistory(req, { params: { runId: 'run-foreign' } });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Execution not found or access denied' });
  });
});
