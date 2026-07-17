/**
 * Cooperative execution cancel (V48 Gate 3).
 *
 * Product cancel marks the executions row `cancelled`; background workers poll
 * this status and stop without overwriting a cancelled row to `failed`.
 * Optional sandboxId on context lets cancel stop a Vercel Sandbox mid-run.
 */

import { loadVercelSandboxFactory } from '@bitcode/pipeline-hosts';

type SupabaseClient = any;

export class ExecutionCancelledError extends Error {
  readonly runId: string;
  constructor(runId: string, message = 'Execution cancelled') {
    super(message);
    this.name = 'ExecutionCancelledError';
    this.runId = runId;
  }
}

export function isExecutionCancelledError(error: unknown): error is ExecutionCancelledError {
  return error instanceof ExecutionCancelledError;
}

export async function getExecutionStatus(
  supabase: SupabaseClient,
  runId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('executions')
    .select('status')
    .eq('id', runId)
    .maybeSingle();
  if (error || !data) return null;
  return typeof data.status === 'string' ? data.status : null;
}

export async function isExecutionCancelled(
  supabase: SupabaseClient,
  runId: string,
): Promise<boolean> {
  const status = await getExecutionStatus(supabase, runId);
  return status === 'cancelled';
}

/** Throw if the run was cancelled cooperatively. */
export async function assertExecutionNotCancelled(
  supabase: SupabaseClient,
  runId: string,
): Promise<void> {
  if (await isExecutionCancelled(supabase, runId)) {
    throw new ExecutionCancelledError(runId);
  }
}

export interface CancelExecutionResult {
  ok: boolean;
  runId: string;
  status: string;
  alreadyTerminal?: boolean;
  sandboxStopped?: boolean;
  code?: string;
  error?: string;
  httpStatus: number;
}

/**
 * Transition a user-owned running execution to cancelled, emit a status event,
 * and best-effort stop a bound Vercel sandbox when context.sandboxId is set.
 */
export async function cancelUserExecution(input: {
  supabase: SupabaseClient;
  userId: string;
  runId: string;
  reason?: string | null;
}): Promise<CancelExecutionResult> {
  const runId = String(input.runId || '').trim();
  if (!runId) {
    return {
      ok: false,
      runId: '',
      status: 'error',
      code: 'missing_run_id',
      error: 'Missing runId',
      httpStatus: 400,
    };
  }

  const { data: run, error: runError } = await input.supabase
    .from('executions')
    .select('id, user_id, status, context')
    .eq('id', runId)
    .maybeSingle();

  if (runError) {
    return {
      ok: false,
      runId,
      status: 'error',
      code: 'load_failed',
      error: runError.message || 'Failed to load execution',
      httpStatus: 500,
    };
  }

  if (!run || run.user_id !== input.userId) {
    return {
      ok: false,
      runId,
      status: 'error',
      code: 'not_found',
      error: 'Execution not found or access denied',
      httpStatus: 404,
    };
  }

  const currentStatus = typeof run.status === 'string' ? run.status : 'unknown';
  if (currentStatus === 'cancelled') {
    return {
      ok: true,
      runId,
      status: 'cancelled',
      alreadyTerminal: true,
      httpStatus: 200,
    };
  }

  if (currentStatus !== 'running') {
    return {
      ok: false,
      runId,
      status: currentStatus,
      alreadyTerminal: true,
      code: 'not_running',
      error: `Execution is ${currentStatus} and cannot be cancelled`,
      httpStatus: 409,
    };
  }

  const now = new Date().toISOString();
  const reason =
    typeof input.reason === 'string' && input.reason.trim()
      ? input.reason.trim().slice(0, 280)
      : 'Run cancelled by user.';

  const context =
    run.context && typeof run.context === 'object' && !Array.isArray(run.context)
      ? { ...(run.context as Record<string, unknown>) }
      : {};

  const { error: updateError } = await input.supabase
    .from('executions')
    .update({
      status: 'cancelled',
      completed_at: now,
      updated_at: now,
      error: { message: reason, cancelled: true },
      context: {
        ...context,
        cancelledAt: now,
        cancelReason: reason,
      },
    })
    .eq('id', runId)
    .eq('user_id', input.userId)
    .eq('status', 'running');

  if (updateError) {
    return {
      ok: false,
      runId,
      status: 'error',
      code: 'update_failed',
      error: updateError.message || 'Failed to cancel execution',
      httpStatus: 500,
    };
  }

  // Source-safe status event for deposit/read telemetry accordions.
  try {
    await input.supabase.from('execution_events').insert({
      run_id: runId,
      event_type: 'status',
      event_data: {
        message: reason,
        cancelled: true,
      },
      phase: 'cancel',
      agent_name: null,
      created_at: now,
    });
  } catch {
    // Event insert is best-effort; row status is the cancel authority.
  }

  let sandboxStopped = false;
  const sandboxId =
    typeof context.sandboxId === 'string' && context.sandboxId.trim()
      ? context.sandboxId.trim()
      : null;
  if (sandboxId) {
    sandboxStopped = await stopVercelSandboxById(sandboxId);
  }

  return {
    ok: true,
    runId,
    status: 'cancelled',
    sandboxStopped,
    httpStatus: 200,
  };
}

async function stopVercelSandboxById(sandboxId: string): Promise<boolean> {
  try {
    const factory = await loadVercelSandboxFactory();
    // Prefer Sandbox.get when available (SDK resume/stop by id/name).
    const getFn = (factory as { get?: (opts: Record<string, unknown>) => Promise<any> }).get;
    if (typeof getFn === 'function') {
      const session = await getFn.call(factory, {
        sandboxId,
        ...vercelAuthFields(),
      });
      if (session?.stop) {
        await session.stop({ blocking: true });
        return true;
      }
    }
  } catch {
    // Best-effort: harness finally may still stop the box.
  }
  return false;
}

function vercelAuthFields(): Record<string, string | undefined> {
  if (process.env.VERCEL_OIDC_TOKEN) return {};
  return {
    token: process.env.VERCEL_TOKEN,
    teamId: process.env.VERCEL_TEAM_ID,
    projectId: process.env.VERCEL_PROJECT_ID,
  };
}
