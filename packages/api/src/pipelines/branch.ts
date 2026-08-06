/**
 * AssetPack execution branching API.
 *
 * Creates a new executions row from an existing run
 * by copying its configuration and input/context, adding lineage metadata
 * so the new run can resume with the same execution context.
 */

import { supabaseAdmin } from '@bitcode/supabase';
import { log } from '@bitcode/logger';

interface ForkOptions {
  title?: string; // optional run title, stored in context
}

export async function branchAssetPackRun(
  userId: string,
  sourceRunId: string,
  options: ForkOptions = {}
): Promise<{ id: string }> {
  // Load source run
  const { data: source, error: srcErr } = await supabaseAdmin
    .from('executions')
    .select('*')
    .eq('id', sourceRunId)
    .eq('user_id', userId)
    .single();

  if (srcErr || !source) {
    log('[api/pipelines] branchAssetPackRun: source not found or not owned', 'error', { userId, sourceRunId, error: srcErr });
    throw new Error('Source run not found');
  }

  const now = new Date().toISOString();
  const metadata = {
    ...(source.metadata || source.context || {}),
    branched_from_run_id: sourceRunId,
    branch_title: options.title || null,
  } as Record<string, any>;

  // Create destination run by copying critical fields
  const insertRow = {
    user_id: userId,
    status: 'pending' as const,
    type: source.type ||  'agentic-execution:asset-pack',
    guide: source.guide || 'SDIVF',
    config: source.config || {},
    input: source.input ||  {},
    output: source.output || {},
    metadata,
    error: null,
    started_at: null,
    completed_at: null,
    created_at: now,
    updated_at: now,
  } satisfies Record<string, unknown>;

  const { data: dest, error: insErr } = await supabaseAdmin
    .from('executions')
    .insert(insertRow)
    .select('id')
    .single();

  if (insErr) {
    log('[api/pipelines] branchAssetPackRun: failed to insert destination run', 'error', { error: insErr });
    throw insErr;
  }

  // Record branch event (best-effort) into events table if present in schema
  try {
    await supabaseAdmin
      .from('execution_events')
      .insert({
        run_id: dest.id,
        event_type: 'branch',
        event_data: { sourceRunId },
        created_at: now,
      } as any);
  } catch {
    // ignore if table not present or insert fails
  }

  return { id: dest.id };
}
