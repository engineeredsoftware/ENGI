import { NextResponse } from 'next/server';

import { createClient } from '@bitcode/supabase/ssr/server';
import { supabaseAdmin } from '@bitcode/supabase';

import { cancelUserExecution } from '@bitcode/api/pipelines/cancel';

export const runtime = 'nodejs';

/**
 * POST /api/executions/[runId]/cancel
 *
 * Cooperative cancel for a user-owned running execution — **deposit and read**
 * option synthesis (and other agentic runs). Marks the row cancelled, emits a
 * status event, and best-effort stops a bound Vercel Sandbox when
 * context.sandboxId is present. Workers poll status and stop without overwriting
 * cancelled → failed/completed.
 */
export async function POST(
  request: Request,
  { params }: { params: { runId: string } },
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { ok: false, error: 'unauthenticated', code: 'unauthenticated' },
      { status: 401 },
    );
  }

  let reason: string | null = null;
  try {
    const body = (await request.json().catch(() => null)) as {
      reason?: unknown;
    } | null;
    if (typeof body?.reason === 'string') reason = body.reason;
  } catch {
    reason = null;
  }

  const result = await cancelUserExecution({
    supabase: supabaseAdmin,
    userId: user.id,
    runId: params?.runId,
    reason,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        runId: result.runId,
        status: result.status,
        code: result.code,
        error: result.error,
      },
      { status: result.httpStatus },
    );
  }

  return NextResponse.json({
    ok: true,
    runId: result.runId,
    status: result.status,
    alreadyTerminal: result.alreadyTerminal === true,
    sandboxStopped: result.sandboxStopped === true,
  });
}
