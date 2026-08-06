import { branchAssetPackRun } from '../../pipelines/branch';

jest.mock('@bitcode/supabase', () => {
  const tables: Record<string, any[]> = {
    executions: [],
    execution_events: [],
  };
  const api = {
    from: (table: string) => ({
      select: (_cols?: string) => ({
        eq: (_col: string, val: any) => ({
          eq: (_col2: string, val2: any) => ({
            single: async () => {
              const row = tables[table].find(r => r.id === val && r.user_id === val2) || null;
              if (!row) return { data: null, error: { code: 'PGRST116' } };
              return { data: row, error: null };
            }
          })
        })
      }),
      insert: (row: any) => ({
        select: (_cols?: string) => ({
          single: async () => {
            const id = row.id || `run-${(tables[table] ||= []).length + 1}`;
            const newRow = { id, ...row };
            (tables[table] ||= []).push(newRow);
            return { data: { id }, error: null };
          }
        })
      })
    })
  };
  return { supabaseAdmin: api };
});

describe('branchAssetPackRun', () => {
  const userId = 'user-1';
  const sourceId = 'run-1';

  beforeEach(async () => {
    // @ts-ignore
    const { supabaseAdmin } = await import('@bitcode/supabase');
    await supabaseAdmin
      .from('executions')
      .insert({
        id: sourceId,
        user_id: userId,
        type: 'agentic-execution:asset-pack',
        guide: 'SDIVF',
        status: 'running',
        config: { foo: 'bar' },
        input: { task: 'demo' },
        output: {},
        metadata: { origin: 'seed' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();
  });

  it('creates a new run copying config/input and lineage', async () => {
    const { id: branchedId } = await branchAssetPackRun(userId, sourceId, { title: 'branch-a' });
    expect(branchedId).toBeTruthy();

    // @ts-ignore
    const { supabaseAdmin } = await import('@bitcode/supabase');
    const res = await supabaseAdmin
      .from('executions')
      .select('*')
      .eq('id', branchedId)
      .eq('user_id', userId)
      .single();
    expect(res.error).toBeNull();
    expect(res.data.config).toEqual({ foo: 'bar' });
    expect(res.data.input).toEqual({ task: 'demo' });
    expect(res.data.metadata.branched_from_run_id).toEqual(sourceId);
    expect(res.data.metadata.branch_title).toEqual('branch-a');
    expect(res.data.status).toEqual('pending');
  });

  it('allows branching while source is running (mid-execution)', async () => {
    const b1 = await branchAssetPackRun(userId, sourceId);
    const b2 = await branchAssetPackRun(userId, sourceId);
    expect(b1.id).not.toEqual(b2.id);
  });
});
