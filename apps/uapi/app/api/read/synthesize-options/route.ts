/**
 * POST /api/read/synthesize-options — thin dispatch surface (deposit twin).
 *
 * Auth → validate Need + repository → create execution → waitUntil
 * ExecutionPipelineSDIVFSynthesizeReadAssetPacks. Settlement is a separate pipeline.
 */

import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import { createStreamingExecution } from '@bitcode/pipelines-generics';
import { isAssetPackRealInferenceEnabled } from '@bitcode/asset-packs-pipelines-syntheses-domain/runtime-inference-policy';
import { runReadOptionSynthesis } from './dispatch-read-synthesis';

export const runtime = 'nodejs';
// Align with deposit: long SDIVF + Host work; waitUntil is capped by maxDuration.
export const maxDuration = 900;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json(
      { error: 'A Bitcode session is required for read option synthesis.', code: 'read_session_required' },
      { status: 401 },
    );
  }

  // Real inference is the product default (host/Pipeliner). Explicit opt-out
  // BITCODE_ASSET_PACK_REAL_INFERENCE=0 remains for deterministic unit tests.
  if (!isAssetPackRealInferenceEnabled()) {
    return NextResponse.json(
      {
        error:
          'Read option synthesis requires real inference (unset BITCODE_ASSET_PACK_REAL_INFERENCE or set it to 1).',
        code: 'real_inference_required',
      },
      { status: 422 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const repositoryFullName =
    typeof body.repositoryFullName === 'string' ? body.repositoryFullName.trim() : '';
  const need =
    typeof body.need === 'string'
      ? body.need.trim()
      : typeof body.needs === 'string'
        ? body.needs.trim()
        : typeof body.instructions === 'string'
          ? body.instructions.trim()
          : '';
  const sourceBranch = typeof body.sourceBranch === 'string' ? body.sourceBranch.trim() : 'main';
  const sourceCommit = typeof body.sourceCommit === 'string' ? body.sourceCommit.trim() : '';
  const normalizePathList = (value: unknown): string[] =>
    Array.isArray(value)
      ? value
          .filter((entry): entry is string => typeof entry === 'string')
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [];
  // Deposit twin: relevant/irrelevant paths (also accept permissibleSources/Exclusions).
  const relevantPaths = normalizePathList(
    body.relevantPaths ?? body.permissibleSources ?? body.relevants,
  );
  const irrelevantPaths = normalizePathList(
    body.irrelevantPaths ?? body.impermissibleSources ?? body.irrelevants,
  );
  const requestedRunId =
    typeof body.runId === 'string' && UUID_PATTERN.test(body.runId) ? body.runId : randomUUID();

  if (!repositoryFullName || !repositoryFullName.includes('/')) {
    return NextResponse.json(
      { error: 'repositoryFullName (owner/name) is required.', code: 'repository_required' },
      { status: 400 },
    );
  }
  if (!need) {
    return NextResponse.json(
      { error: 'need (reader instruction) is required.', code: 'need_required' },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin;
  const { error: insertError } = await admin.from('executions').insert({
    id: requestedRunId,
    user_id: user.id,
    type: 'agentic-execution:asset-pack',
    status: 'running',
    input: {
      productPipeline: 'synthesize-reads-asset-packs-pipeline',
      repositoryFullName,
      sourceBranch,
      sourceCommit: sourceCommit || null,
      needLength: need.length,
      relevantPathCount: relevantPaths.length,
      irrelevantPathCount: irrelevantPaths.length,
    },
    context: {
      source: 'read-synthesize-options',
      route: '/reads',
      pipelineCore: 'synthesize-reads-asset-packs-pipeline',
      synthesisMode: 'read',
      repositoryFullName,
      sourceBranch,
      sourceCommit: sourceCommit || null,
      relevantPaths,
      irrelevantPaths,
    },
    started_at: new Date().toISOString(),
  });

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message || 'Unable to create execution.', code: 'execution_create_failed' },
      { status: 500 },
    );
  }

  // Deposit twin: create streaming execution and pass the handle into the worker
  // so first telemetry is keyed to the same run id without a silent miss.
  let execution: { id: string } | null = null;
  try {
    execution = createStreamingExecution({
      runId: requestedRunId,
      userId: user.id,
      supabase: admin,
      streamToDatabase: true,
      structuredToDatabase: false,
    }) as { id: string };
  } catch {
    // Streaming row optional if table path differs; worker still creates Execution.
  }

  waitUntil(
    runReadOptionSynthesis({
      runId: requestedRunId,
      userId: user.id,
      repositoryFullName,
      sourceBranch,
      sourceCommit: sourceCommit || null,
      need,
      relevantPaths,
      irrelevantPaths,
      execution: execution || undefined,
    }),
  );

  return NextResponse.json({
    ok: true,
    executionId: requestedRunId,
    runId: requestedRunId,
    status: 'dispatched',
  });
}
