/**
 * POST /api/depository/index
 * Index one admitted AssetPack into depository_search_documents (+ optional embed).
 * Called after deposit option admission; fail-soft for missing migration/API keys.
 */

import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { createClient } from '@bitcode/supabase/ssr/server';
import {
  indexDepositoryAssetPack,
  type DepositoryIndexPackInput,
} from '@/lib/depository-index-job';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user || userError) {
    return NextResponse.json(
      { ok: false, error: 'Session required.', code: 'session_required' },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!isObject(parsed)) throw new Error('bad body');
    body = parsed;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const assetId = typeof body.assetId === 'string' ? body.assetId.trim() : '';
  if (!assetId) {
    return NextResponse.json(
      { ok: false, error: 'assetId is required.' },
      { status: 400 },
    );
  }

  const input: DepositoryIndexPackInput = {
    assetId,
    title: typeof body.title === 'string' ? body.title : null,
    summary: typeof body.summary === 'string' ? body.summary : null,
    kind: typeof body.kind === 'string' ? body.kind : null,
    repositoryFullName:
      typeof body.repositoryFullName === 'string' ? body.repositoryFullName : null,
    lifecycle:
      typeof body.lifecycle === 'string' ? body.lifecycle : 'admitted-to-depository',
    topics: Array.isArray(body.topics) ? (body.topics as string[]) : [],
    coveredSourcePaths: Array.isArray(body.coveredSourcePaths)
      ? (body.coveredSourcePaths as string[])
      : [],
    absoluteKinds: Array.isArray(body.absoluteKinds)
      ? (body.absoluteKinds as string[])
      : [],
    absoluteVolumes:
      isObject(body.absoluteVolumes)
        ? (body.absoluteVolumes as Record<string, number>)
        : {},
    skipEmbed: body.skipEmbed === true,
  };

  // Prefer background when embed may take seconds; still await for tests when sync=1.
  if (body.sync === true || body.sync === '1') {
    const result = await indexDepositoryAssetPack(input);
    return NextResponse.json({ ok: result.ok, ...result });
  }

  waitUntil(
    indexDepositoryAssetPack(input).catch(() => ({
      ok: false,
      assetId,
      embeddingState: 'failed' as const,
    })),
  );

  return NextResponse.json({
    ok: true,
    assetId,
    status: 'indexing',
    note: 'Background index job enqueued (document + optional embed).',
  });
}
