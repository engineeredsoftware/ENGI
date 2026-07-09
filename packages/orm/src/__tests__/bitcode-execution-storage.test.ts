import {
  AssetPackGeneratedAssetsModel,
  AssetPackPhaseExecutionsModel,
  AssetPackRunJobsModel,
  AssetPackStreamLogsModel,
  AssetPackVectorsModel,
  BITCODE_EXECUTION_STORAGE_SCHEMA_PARITY,
  BitcodeActivityEventsModel,
  BitcodeErrorLogsModel,
  BitcodeTokenCostsModel,
} from '../models/bitcode-execution-storage';

function mkSupabase() {
  const calls: any[] = [];
  return {
    calls,
    from(table: string) {
      const api: any = {
        select: (selection?: string) => {
          calls.push(['select', table, selection]);
          return api;
        },
        eq: (column: string, value: unknown) => {
          calls.push(['eq', table, column, value]);
          return api;
        },
        order: (column: string, options?: unknown) => {
          calls.push(['order', table, column, options]);
          return api;
        },
        limit: (limit: number) => {
          calls.push(['limit', table, limit]);
          return api;
        },
        then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) =>
          Promise.resolve({ data: [], error: null }).then(resolve, reject),
      };
      return api;
    },
  } as any;
}

describe('Bitcode execution storage ORM parity', () => {
  it('declares the V26 schema bridge for every former unresolved storage table', () => {
    expect(BITCODE_EXECUTION_STORAGE_SCHEMA_PARITY).toEqual({
      assetPackPhaseExecutions: 'phase_executions',
      assetPackVectors: 'deliverable_vectors',
      run_jobs: 'run_jobs',
      stream_logs: 'stream_logs',
      generated_assets: 'generated_assets',
      events: 'events',
      error_logs: 'error_logs',
      token_costs: 'token_costs',
    });
  });

  it.each([
    [AssetPackVectorsModel, 'deliverable_vectors', 'listByAssetPackEvidenceId', ['deliverable_id', 'asset-pack-1']],
    [AssetPackPhaseExecutionsModel, 'phase_executions', 'listByRunId', ['run_id', 'run-1']],
    [AssetPackGeneratedAssetsModel, 'generated_assets', 'listByRunId', ['run_id', 'run-1']],
    [AssetPackStreamLogsModel, 'stream_logs', 'listByStreamId', ['stream_id', 'stream-1']],
    [BitcodeActivityEventsModel, 'events', 'listByUserId', ['user_id', 'user-1']],
    [BitcodeErrorLogsModel, 'error_logs', 'listByUserId', ['user_id', 'user-1']],
    [BitcodeTokenCostsModel, 'token_costs', 'listByRunId', ['run_id', 'run-1']],
  ])('routes %s through %s with Bitcode-scoped selectors', async (Model, table, method, eqArgs) => {
    const supabase = mkSupabase();
    const model = new (Model as any)(supabase);
    await model[method](eqArgs[1], { limit: 5 });

    expect(supabase.calls).toContainEqual(['select', table, '*']);
    expect(supabase.calls).toContainEqual(['eq', table, eqArgs[0], eqArgs[1]]);
    expect(supabase.calls).toContainEqual(['limit', table, 5]);
  });

  it('orders queued asset-pack run jobs for deterministic worker admission', async () => {
    const supabase = mkSupabase();
    const model = new AssetPackRunJobsModel(supabase);
    await model.listByStatus('pending', { limit: 3 });

    expect(supabase.calls).toContainEqual(['select', 'run_jobs', '*']);
    expect(supabase.calls).toContainEqual(['eq', 'run_jobs', 'status', 'pending']);
    expect(supabase.calls).toContainEqual([
      'order',
      'run_jobs',
      'created_at',
      { ascending: true },
    ]);
    expect(supabase.calls).toContainEqual(['limit', 'run_jobs', 3]);
  });
});
