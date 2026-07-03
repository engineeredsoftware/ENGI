import { sweepOrphanedExecutions, ORPHAN_STALE_MINUTES } from '@/lib/execution-orphan-sweep';

type Row = Record<string, any>;

function buildSupabaseMock(runningRows: Row[], latestEventByRun: Record<string, string | null>) {
  const updates: Array<{ runId: string; patch: Row }> = [];
  const supabase = {
    from(table: string) {
      if (table === 'executions') {
        return {
          select: () => ({
            eq: async () => ({ data: runningRows, error: null }),
          }),
          update: (patch: Row) => ({
            eq: (_col: string, runId: string) => ({
              eq: async () => {
                updates.push({ runId, patch });
                return { error: null };
              },
            }),
          }),
        };
      }
      if (table === 'execution_events') {
        return {
          select: () => ({
            eq: (_col: string, runId: string) => ({
              order: () => ({
                limit: async () => ({
                  data: latestEventByRun[runId] ? [{ created_at: latestEventByRun[runId] }] : [],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  return { supabase, updates };
}

describe('sweepOrphanedExecutions', () => {
  const now = new Date('2026-07-03T17:00:00.000Z');
  const fresh = '2026-07-03T16:59:30.000Z'; // 30s ago — a live run streaming
  const stale = '2026-07-03T16:00:00.000Z'; // an hour of silence — orphaned

  it('marks running rows with stale stream activity as interrupted', async () => {
    const { supabase, updates } = buildSupabaseMock(
      [
        { id: 'run-live', started_at: stale },
        { id: 'run-dead', started_at: stale },
      ],
      { 'run-live': fresh, 'run-dead': stale },
    );

    const result = await sweepOrphanedExecutions(supabase, { now });

    expect(result.sweptRunIds).toEqual(['run-dead']);
    expect(updates).toHaveLength(1);
    expect(updates[0].runId).toBe('run-dead');
    expect(updates[0].patch.status).toBe('interrupted');
    expect(updates[0].patch.error.message).toContain('orphaned');
  });

  it('falls back to started_at when a run has no events, and spares young runs', async () => {
    const justDispatched = '2026-07-03T16:59:00.000Z';
    const { supabase, updates } = buildSupabaseMock(
      [
        { id: 'run-eventless-old', started_at: stale },
        { id: 'run-eventless-young', started_at: justDispatched },
      ],
      { 'run-eventless-old': null, 'run-eventless-young': null },
    );

    const result = await sweepOrphanedExecutions(supabase, { now });

    expect(result.sweptRunIds).toEqual(['run-eventless-old']);
    expect(updates.map((u) => u.runId)).toEqual(['run-eventless-old']);
  });

  it('is a no-op when nothing is running', async () => {
    const { supabase, updates } = buildSupabaseMock([], {});
    const result = await sweepOrphanedExecutions(supabase, { now });
    expect(result.sweptRunIds).toEqual([]);
    expect(updates).toHaveLength(0);
  });

  it('uses a stale threshold comfortably above the 90s LLM call timeout', () => {
    expect(ORPHAN_STALE_MINUTES * 60).toBeGreaterThanOrEqual(6 * 90);
  });
});
