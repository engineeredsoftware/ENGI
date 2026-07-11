/**
 * Orphaned-run sweep — dev-server restarts (and crashed serverless boxes) kill
 * in-process pipelines without finalizing their `executions` rows, leaving
 * them `running` forever (QA: runs 7f023f23, and the pre-restart orphans of
 * 2026-07-03). A row is ORPHANED when it says `running` but nothing has
 * streamed for far longer than any live generation could stay silent (the
 * per-call LLM timeout is 90s; STALE_MINUTES is a conservative multiple).
 *
 * Called fire-and-forget at synthesis dispatch time: one cheap query per
 * dispatch, works identically on the dev server and serverless hosts (no
 * startup-hook machinery). In-flight runs are safe: they write execution
 * events continuously, so their latest event is always fresh.
 *
 * This is a detector, not a preventer: it relabels rows that already got
 * orphaned. V48-Gate3-F31 closed the specific cause where the deposit
 * dispatch route's own background continuation could be frozen by Vercel
 * right after its response was sent (fixed there via `waitUntil`); this
 * sweep still earns its keep for the causes that remain — real crashes,
 * restarts, deploys rolling out mid-run, maxDuration ceilings, etc.
 */

type SupabaseClient = any;

export const ORPHAN_STALE_MINUTES = 10;

export interface OrphanSweepResult {
  sweptRunIds: string[];
}

export async function sweepOrphanedExecutions(
  supabase: SupabaseClient,
  options: { staleMinutes?: number; now?: Date } = {},
): Promise<OrphanSweepResult> {
  const staleMinutes = options.staleMinutes ?? ORPHAN_STALE_MINUTES;
  const now = options.now ?? new Date();
  const staleBefore = new Date(now.getTime() - staleMinutes * 60_000).toISOString();
  const sweptRunIds: string[] = [];

  const { data: runningRows, error: runningError } = await supabase
    .from('executions')
    .select('id, started_at, created_at')
    .eq('status', 'running');
  if (runningError || !Array.isArray(runningRows) || runningRows.length === 0) {
    return { sweptRunIds };
  }

  for (const row of runningRows) {
    const runId = String(row?.id ?? '');
    if (!runId) continue;

    const { data: latestEvents } = await supabase
      .from('execution_events')
      .select('created_at')
      .eq('run_id', runId)
      .order('created_at', { ascending: false })
      .limit(1);
    const lastActivity =
      latestEvents?.[0]?.created_at ?? row?.started_at ?? row?.created_at ?? null;
    if (!lastActivity || String(lastActivity) >= staleBefore) continue;

    const { error: updateError } = await supabase
      .from('executions')
      .update({
        status: 'interrupted',
        completed_at: now.toISOString(),
        updated_at: now.toISOString(),
        error: {
          message: `Run orphaned: no stream activity since ${lastActivity} (server restart or crashed host); swept at dispatch time.`,
        },
      })
      .eq('id', runId)
      .eq('status', 'running');
    if (!updateError) sweptRunIds.push(runId);
  }

  return { sweptRunIds };
}
