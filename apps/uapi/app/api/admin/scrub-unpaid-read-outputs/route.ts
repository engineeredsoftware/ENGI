/**
 * POST /api/admin/scrub-unpaid-read-outputs
 * Operator migrate: rewrite historical unpaid READ synthesis outputs
 * (V48-Gate5-F01). Requires authenticated session; uses service-role admin.
 * Body: { limit?: number, offset?: number }
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import { scrubUnpaidReadExecutionOutputs } from '@/lib/scrub-unpaid-read-execution-outputs';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user || userError) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let body: { limit?: number; offset?: number } = {};
  try {
    body = (await request.json()) as { limit?: number; offset?: number };
  } catch {
    body = {};
  }

  const result = await scrubUnpaidReadExecutionOutputs({
    admin: supabaseAdmin as never,
    limit: body.limit,
    offset: body.offset,
  });

  return NextResponse.json({
    ok: result.errors.length === 0,
    ...result,
  });
}
