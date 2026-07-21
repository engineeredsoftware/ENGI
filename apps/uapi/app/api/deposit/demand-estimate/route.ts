/**
 * GET /api/deposit/demand-estimate
 *
 * Source-safe demand estimate grounded in settled Depository DataPacks.
 * Returns estimatable=false when the settled corpus is too thin.
 */

import { NextResponse } from 'next/server';

import { createClient } from '@bitcode/supabase/ssr/server';

import {
  loadDepositorySettledDemandEstimate,
  settledDemandEstimateToSignals,
} from '@/lib/depository-settled-demand';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user || userError) {
    return NextResponse.json(
      { ok: false, error: 'A Bitcode session is required for demand estimates.' },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const repositoryFullName = url.searchParams.get('repositoryFullName')?.trim() || null;
  const title = url.searchParams.get('title')?.trim() || null;
  const summary = url.searchParams.get('summary')?.trim() || null;
  const kind = url.searchParams.get('kind')?.trim() || null;

  const estimate = await loadDepositorySettledDemandEstimate({
    repositoryFullName,
    focus: {
      repositoryFullName,
      title,
      summary,
      kind,
    },
  });
  const signals = settledDemandEstimateToSignals(estimate);

  return NextResponse.json({
    ok: true,
    estimate,
    signals,
  });
}
