// @ts-nocheck
import assetPack from '../index';
import { Execution } from '@bitcode/execution-generics';
import { enablePipelineStreaming } from '@bitcode/pipelines-generics';

// Mock setup agents to ensure deterministic, fast dry-run
jest.mock('../agents/setup/asset-pack-clone-vcs-repository-agent', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ success: true, repository: { owner: 'acme', name: 'repo', ref: 'main' } }) }));
jest.mock('../agents/setup/read-fits-finding-synthesis-read-comprehension-agent', () => ({ __esModule: true, default: jest.fn().mockResolvedValue({ success: true }) }));
jest.mock('../agents/setup/asset-pack-danger-wall-agent', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    finalAssessment: {
      safe: true,
      maxSeverity: 'low',
      confidence: 1,
      verdict: { reason: 'test-safe', flags: [] },
    },
  }),
}));

describe('AssetPack pipeline bring-up (setup + PTRR plan: prepare→reason)', () => {
  it('streams phase/agent events and persists structured rows', async () => {
    process.env.BITCODE_DEBUG_ONLY_FAILSAFES = 'prepare';
    process.env.BITCODE_DEBUG_ONLY_GENERATIONS = 'reason';
    process.env.BITCODE_ENABLE_ASSET_PACK_SETUP_PHASE_RUNTIME_IN_TEST = '1';

    try {
      const exec = new Execution('asset-pack:test');
      const inserts: any[] = [];
      const selectedRows = (table: string, filters: Array<[string, any]>) => {
        return inserts
          .filter((insert) => insert.table === table)
          .map((insert) => insert.row)
          .filter((row) => filters.every(([column, value]) => row?.[column] === value));
      };
      const selectBuilder = (table: string) => {
        const filters: Array<[string, any]> = [];
        const builder: any = {
          eq: (column: string, value: any) => {
            filters.push([column, value]);
            return builder;
          },
          order: () => builder,
          limit: () => builder,
          maybeSingle: async () => ({ data: selectedRows(table, filters).at(-1) || null }),
          then: (resolve: any) => Promise.resolve({ data: selectedRows(table, filters), error: null }).then(resolve),
        };
        return builder;
      };
      const updateBuilder = (table: string, patch: any) => {
        const filters: Array<(row: any) => boolean> = [];
        const apply = async () => {
          const rows = inserts.filter((insert) => insert.table === table).map((insert) => insert.row);
          for (const row of rows) {
            if (filters.every((filter) => filter(row))) Object.assign(row, patch);
          }
          return { data: rows.filter((row) => filters.every((filter) => filter(row))), error: null };
        };
        const builder: any = {
          eq: (column: string, value: any) => {
            filters.push((row) => row?.[column] === value);
            return builder;
          },
          in: (column: string, values: any[]) => {
            filters.push((row) => values.includes(row?.[column]));
            return builder;
          },
          then: (resolve: any) => apply().then(resolve),
        };
        return builder;
      };
      const supabaseStub: any = {
        from(table: string) {
          return {
            insert: (row: any) => {
              inserts.push({ table, row });
              return { select: (_?: any) => ({ single: () => Promise.resolve({ data: { id: 'id-' + inserts.length } }) }) } as any;
            },
            update: (patch: any) => updateBuilder(table, patch),
            select: () => selectBuilder(table),
          } as any;
        }
      };
      enablePipelineStreaming(exec as any, {
        runId: '33333333-3333-4333-8333-333333333333',
        userId: '44444444-4444-4444-8444-444444444444',
        supabase: supabaseStub,
        streamToDatabase: true,
        structuredToDatabase: true,
      });

      const res = await assetPack({
        definitionOfRead: 'Test',
        repository: { url: 'x' },
        deliveryTarget: 'pr' as const,
      }, exec);

      expect(res).toBeDefined();

      // Structured inserts occurred
      const phaseRows = inserts.filter(i => i.table === 'deliverable_pipeline_phase_delegations');
      expect(phaseRows.length).toBeGreaterThanOrEqual(1);
      expect(
        phaseRows.some((row) => row.row.phase_name === 'setup' || row.row.phase === 'setup')
      ).toBe(true);
      const agentRows = inserts.filter(i => i.table === 'deliverable_pipeline_agent_steps');
      expect(agentRows.length).toBeGreaterThanOrEqual(1);
      expect(agentRows.some(r => String(r.row.agent_name || '').startsWith('setup:'))).toBe(true);
    } finally {
      delete process.env.BITCODE_ENABLE_ASSET_PACK_SETUP_PHASE_RUNTIME_IN_TEST;
    }
  });
});
