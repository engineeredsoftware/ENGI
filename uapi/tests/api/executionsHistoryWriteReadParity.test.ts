type TerminalClosureState = any;
/**
 * @jest-environment node
 */

jest.mock('@bitcode/supabase/ssr/server', () => ({ createClient: jest.fn() }));
jest.mock('@bitcode/supabase', () => ({ supabaseAdmin: { from: jest.fn() } }));

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';

import { GET as getHistory, POST as postHistory } from '@/app/api/executions/history/route';
import {
  buildTerminalExecutionHistoryRequest,
  buildTerminalDepositWorkbenchDraft,
  buildTerminalReadMeasurementDraft,
  mapExecutionHistoryRunToWorkspaceRun,
} from '@/components/bitcode/pipeline/models/pipeline-activity-history';
import type { TerminalRepositoryContextState } from '@/components/bitcode/pipeline/models/repository-context';

function createExecutionHistoryStore(userId = 'user-1') {
  const storedRows: any[] = [];

  (createClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      }),
    },
  });

  (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
    if (table !== 'executions') {
      throw new Error(`Unexpected table ${table}`);
    }

    let insertPayload: Record<string, unknown> | null = null;
    let eqFilters: Record<string, unknown> = {};
    let inTypes: string[] | null = null;

    const builder: any = {
      insert: jest.fn((payload: Record<string, unknown>) => {
        insertPayload = payload;
        return builder;
      }),
      select: jest.fn(() => builder),
      eq: jest.fn((column: string, value: unknown) => {
        eqFilters = { ...eqFilters, [column]: value };
        return builder;
      }),
      in: jest.fn((column: string, values: string[]) => {
        if (column === 'type') {
          inTypes = values;
        }
        return builder;
      }),
      order: jest.fn(() => builder),
      single: jest.fn(async () => {
        if (!insertPayload) {
          throw new Error('Execution history insert payload missing.');
        }

        const rowIndex = storedRows.length + 1;
        const createdAt = new Date(Date.UTC(2026, 3, 25, 12, 0, rowIndex)).toISOString();
        const row = {
          id: `run-${rowIndex}`,
          user_id: userId,
          created_at: createdAt,
          started_at: insertPayload.started_at ?? createdAt,
          completed_at: insertPayload.completed_at ?? createdAt,
          status: insertPayload.status ?? 'completed',
          type: insertPayload.type ?? 'agentic-execution:asset-pack',
          input: insertPayload.input ?? null,
          output: insertPayload.output ?? null,
          context: insertPayload.context ?? null,
          items: insertPayload.items ?? [],
          error: null,
          total_tokens: null,
          total_cost: null,
          duration_ms: null,
        };

        storedRows.push(row);
        return { data: row, error: null };
      }),
      then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) => {
        let data = [...storedRows];

        if (eqFilters.user_id) {
          data = data.filter((row) => row.user_id === eqFilters.user_id);
        }
        if (typeof eqFilters.type === 'string') {
          data = data.filter((row) => row.type === eqFilters.type);
        }
        if (inTypes?.length) {
          data = data.filter((row) => inTypes?.includes(String(row.type)));
        }

        data.sort((left, right) => String(right.created_at).localeCompare(String(left.created_at)));

        return Promise.resolve({ data, error: null }).then(resolve, reject);
      },
    };

    return builder;
  });

  return { storedRows };
}

describe('Bitcode execution-history write/read parity', () => {
  const repositoryContext: TerminalRepositoryContextState = {
    provider: 'github',
    connectionStatus: {
      connected: true,
      valid: true,
      provider: 'github',
      username: 'bitcode',
      metadata: { mock_mode: false },
    },
    inventorySource: 'stored_repository_inventory',
    repositories: [],
    selectedRepository: {
      id: 'repo-1',
      name: 'terminal',
      fullName: 'bitcode/terminal',
      private: true,
      defaultBranch: 'main',
      url: 'https://github.com/bitcode/terminal',
      cloneUrl: 'https://github.com/bitcode/terminal.git',
      owner: {
        id: 'owner-1',
        username: 'bitcode',
        type: 'organization',
      },
    },
  };

  const closureState: TerminalClosureState = {
    canonLabel: 'Bitcode active posture',
    readReview: {
      id: 'read-review',
      label: 'Read review before Finding Fits',
      summary: 'Measured Read accepted for source-to-shares Finding Fits.',
      metrics: [{ label: 'Finding Fits admitted', value: 'yes' }],
      rows: [{ label: 'Review stage', value: 'post-measurement-pre-fit' }],
      chips: ['source-to-shares'],
    },
    verification: {
      id: 'verification',
      label: 'Verification',
      summary: 'Verification summary.',
      metrics: [{ label: 'Candidates', value: '3' }],
      rows: [{ label: 'Verification state', value: 'allowed-with-policy' }],
      chips: ['rollback runbook'],
    },
    branch: {
      id: 'branch',
      label: 'Branch artifacts',
      summary: 'Branch summary.',
      metrics: [{ label: 'Visible artifacts', value: '4' }],
      rows: [{ label: 'Branch', value: 'bitcode/auth-rollback' }],
      chips: ['BITCODE_READ.md'],
    },
    settlement: {
      id: 'settlement',
      label: 'Settlement + proof',
      summary: 'Settlement summary.',
      metrics: [{ label: 'Credited assets', value: '2' }],
      rows: [{ label: 'Bundle', value: 'bundle-001' }],
      chips: ['selection-materialization'],
      proofFamilies: [
        {
          label: 'selection-materialization',
          artifactPath: '.bitcode/selection-and-materialization-proof.json',
          theoremStatus: 'passed',
          replayArtifacts: '3',
        },
      ],
    },
    ledger: {
      id: 'ledger',
      label: 'Ledger + run history',
      summary: 'Ledger summary.',
      metrics: [{ label: 'History count', value: '1' }],
      rows: [{ label: 'Buyer pool', value: '120 BTD' }],
      chips: [],
      recentRuns: [{ label: 'run-001', summary: 'bitcode/terminal · completed · credited 2' }],
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('round-trips deposit, read, and closure writes through the same Bitcode activity ledger', async () => {
    const { storedRows } = createExecutionHistoryStore();

    const depositRequest = buildTerminalExecutionHistoryRequest(
      buildTerminalDepositWorkbenchDraft({
        canonLabel: 'Bitcode active posture',
        projectionPrincipal: 'depositor',
        branchMode: 'patch',
        scenarioLabel: 'auth-remediation',
        profileLabel: 'Targeted deposit',
        sourceRevision: null,
        deposit: {
          summary: 'Record supply-bearing share posture.',
          metrics: [{ label: 'Selected refs', value: '2' }],
          rows: [{ label: 'Repository', value: 'bitcode/terminal' }],
          selectedEntries: [
            { id: 'entry-1', label: 'rollback runbook' },
            { id: 'entry-2', label: 'issuer patch' },
          ],
          artifactKinds: ['runbook (1)', 'patch (1)'],
        },
        read: {
          summary: 'Read summary',
          metrics: [],
          rows: [],
          closureCriteria: [],
          targetKinds: [],
        },
        fit: {
          summary: 'Fit summary',
          metrics: [],
          rows: [],
        },
      }),
      { repositoryContext },
    );
    const readRequest = buildTerminalExecutionHistoryRequest(
      buildTerminalReadMeasurementDraft({
        parserKind: 'benchmark-parser',
        selectedScenarioId: 'read-auth',
        closureCriteriaCount: 2,
        targetKindCount: 2,
        scenarios: [
          {
            id: 'read-auth',
            label: 'auth-remediation',
            repo: 'bitcode/terminal',
            profile: 'Targeted deposit',
            selected: true,
          },
        ],
      }),
      { repositoryContext },
    );
    const closureRequest = buildTerminalExecutionHistoryRequest(
      {
        type: 'agentic-execution:proof-refresh',
        detailSection: 'closure',
        summary: 'Recorded closure posture.',
        output: {
          protocol: { ok: true },
          assetPackCompletion: {
            summary: 'Recorded closure posture.',
            processingStats: { time: '4m 12s' },
          },
        },
        context: {
          source: 'terminal-closure-control-deck',
          scenario: 'auth-remediation',
        },
      },
      { repositoryContext },
    );

    const depositResponse = await postHistory(
      new Request('http://localhost/api/executions/history', {
        method: 'POST',
        body: JSON.stringify(depositRequest),
      }),
    );
    const readResponse = await postHistory(
      new Request('http://localhost/api/executions/history', {
        method: 'POST',
        body: JSON.stringify(readRequest),
      }),
    );
    const closureResponse = await postHistory(
      new Request('http://localhost/api/executions/history', {
        method: 'POST',
        body: JSON.stringify(closureRequest),
      }),
    );

    expect(depositResponse.status).toBe(201);
    expect(readResponse.status).toBe(201);
    expect(closureResponse.status).toBe(201);

    const depositPayload = await depositResponse.json();
    const readPayload = await readResponse.json();
    const closurePayload = await closureResponse.json();

    expect(storedRows).toHaveLength(3);
    expect(storedRows.map((row) => row.type)).toEqual([
      'agentic-execution:asset-pack',
      'pipeline:measure',
      'pipeline:proof-refresh',
    ]);
    expect(storedRows.every((row) => typeof row.started_at === 'string')).toBe(true);
    expect(storedRows.every((row) => typeof row.completed_at === 'string')).toBe(true);

    expect(depositPayload.execution).toEqual(
      expect.objectContaining({
        status: 'completed',
        summary: 'Recorded deposit-side share posture for bitcode/terminal.',
        repo_snapshot: {
          org: 'bitcode',
          repo: 'terminal',
          branch: 'main',
          commit: '',
        },
      }),
    );
    expect(mapExecutionHistoryRunToWorkspaceRun(depositPayload.execution).transactionLens).toBe('deposit');

    expect(readPayload.execution).toEqual(
      expect.objectContaining({
        status: 'completed',
        summary: 'Recorded read measurement for auth-remediation.',
      }),
    );
    expect(mapExecutionHistoryRunToWorkspaceRun(readPayload.execution).transactionLens).toBe('read');

    expect(closurePayload.execution).toEqual(
      expect.objectContaining({
        status: 'completed',
        summary: 'Recorded closure posture.',
        processing_stats: expect.objectContaining({
          time: '4m 12s',
        }),
        asset_pack_completion: expect.objectContaining({
          summary: 'Recorded closure posture.',
        }),
      }),
    );
    expect(mapExecutionHistoryRunToWorkspaceRun(closurePayload.execution).transactionLens).toBe('closure');

    const historyResponse = await getHistory(new Request('http://localhost/api/executions/history'));
    expect(historyResponse.status).toBe(200);

    const historyPayload = await historyResponse.json();
    expect(historyPayload.map((row: any) => row.summary)).toEqual([
      'Recorded closure posture.',
      'Recorded read measurement for auth-remediation.',
      'Recorded deposit-side share posture for bitcode/terminal.',
    ]);
    expect(historyPayload[0]).toEqual(
      expect.objectContaining({
        summary: 'Recorded closure posture.',
        asset_pack_completion: expect.objectContaining({
          summary: 'Recorded closure posture.',
        }),
      }),
    );
    expect(historyPayload[1]).toEqual(
      expect.objectContaining({
        status: 'completed',
        repo_snapshot: {
          org: 'bitcode',
          repo: 'terminal',
          branch: 'main',
          commit: '',
        },
      }),
    );
  });
});
