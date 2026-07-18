/**
 * POST /api/deposit/synthesize-options — thin dispatch surface.
 *
 * Auth, ownership, steering parse, run-id conflict guard, dispatch-context
 * upsert, streaming execution create, then waitUntil background synthesis.
 * Orchestration lives in dispatch-deposit-synthesis.ts.
 */

import { randomUUID } from 'crypto';

import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import { createStreamingExecution } from '@bitcode/pipelines-generics';
import { normalizeSourcePathList } from '@bitcode/asset-packs-pipelines-syntheses-domain/asset-packs-synthesis';
import { isAssetPackRealInferenceEnabled } from '@bitcode/asset-packs-pipelines-syntheses-domain/runtime-inference-policy';
import {
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';
import { sweepOrphanedExecutions } from '@bitcode/api/pipelines/orphan-sweep';
import {
  parseSynthesizeOptionsSteering,
  type SynthesizeOptionsBody,
} from './parse-synthesize-options-body';
import { runDepositOptionSynthesis } from './dispatch-deposit-synthesis';

export const runtime = 'nodejs';
// Full-repo deposit synthesis regularly exceeds 5 minutes of LLM work.
// Vercel waitUntil is capped by maxDuration — keep high for deposit.
export const maxDuration = 800;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json(
      { error: 'A Bitcode session is required for deposit option synthesis.', code: 'deposit_session_required' },
      { status: 401 },
    );
  }

  // Real inference is the product default (host/Pipeliner). Explicit opt-out
  // BITCODE_ASSET_PACK_REAL_INFERENCE=0 remains for deterministic unit tests.
  if (!isAssetPackRealInferenceEnabled()) {
    return NextResponse.json(
      {
        error:
          'Deposit option synthesis requires real inference (unset BITCODE_ASSET_PACK_REAL_INFERENCE or set it to 1).',
        code: 'real_inference_required',
      },
      { status: 422 },
    );
  }

  let body: SynthesizeOptionsBody;
  try {
    body = (await request.json()) as SynthesizeOptionsBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const steering = parseSynthesizeOptionsSteering(body);
  if ('error' in steering) {
    return NextResponse.json({ error: steering.error }, { status: steering.status });
  }
  const {
    repositoryFullName,
    requestedRunId,
    sourceBranch,
    sourceCommit,
    obfuscations,
    demandContext,
    depositoryDemandSignals,
    readingDemandSignals,
    existingDepositorySignals,
  } = steering;
  const runId = requestedRunId && UUID_PATTERN.test(requestedRunId) ? requestedRunId : randomUUID();

  // Fire-and-forget orphan sweep (V48-Gate3-F31: waitUntil keeps instance alive).
  waitUntil(sweepOrphanedExecutions(supabaseAdmin).catch(() => {}));
  const permissibleSources = normalizeSourcePathList(steering.permissibleSourcesRaw);
  const impermissibleSources = normalizeSourcePathList(steering.impermissibleSourcesRaw);

  const { data: ownedRepository, error: repositoryError } = await supabaseAdmin
    .from('vcs_repositories')
    .select('repo_full_name')
    .eq('user_id', user.id)
    .eq('repo_full_name', repositoryFullName)
    .maybeSingle();
  if (repositoryError) {
    return NextResponse.json({ error: repositoryError.message }, { status: 500 });
  }
  if (!ownedRepository) {
    return NextResponse.json(
      { error: 'Repository is not in the connected GitHub inventory for this account.', code: 'repository_not_connected' },
      { status: 403 },
    );
  }

  const { data: githubConnection, error: connectionError } = await supabaseAdmin
    .from('user_connections')
    .select('connection_data')
    .eq('user_id', user.id)
    .eq('provider', 'github')
    .eq('is_active', true)
    .maybeSingle();
  if (connectionError || !githubConnection?.connection_data) {
    return NextResponse.json(
      { error: 'An active GitHub connection is required for deposit option synthesis.', code: 'github_connection_required' },
      { status: 422 },
    );
  }

  const startedAt = Date.now();
  const startedAtIso = new Date(startedAt).toISOString();

  // Guard runId before any write (client may supply id for log tailing).
  const { data: existingRun } = await supabaseAdmin
    .from('executions')
    .select('id, user_id, status')
    .eq('id', runId)
    .maybeSingle();
  if (existingRun) {
    return NextResponse.json(
      {
        error:
          existingRun.user_id === user.id
            ? 'This run id has already been dispatched.'
            : 'This run id is not available.',
        code: 'run_id_conflict',
      },
      { status: 409 },
    );
  }

  // Master-detail lens identity AT DISPATCH so running rows are attachable as Deposit.
  const { error: dispatchContextError } = await supabaseAdmin.from('executions').upsert(
    {
      id: runId,
      user_id: user.id,
      type: 'agentic-execution:asset-pack',
      status: 'running',
      created_at: startedAtIso,
      started_at: startedAtIso,
      updated_at: new Date().toISOString(),
      context: {
        source: 'deposit-option-synthesis',
        workbench: 'deposit-option-synthesis',
        route: '/deposits',
        pipelineCore: 'AssetPacksSynthesis',
        synthesisMode: 'deposit',
        repositoryFullName,
        sourceBranch,
        sourceCommit,
        permissibleSourceCount: permissibleSources.length,
        impermissibleSourceCount: impermissibleSources.length,
        hasObfuscations: Boolean(obfuscations),
      },
    },
    { onConflict: 'id' },
  );
  if (dispatchContextError) {
    bitcodeServerTelemetry('warn', 'deposit-synthesize-options', 'dispatch-context-write-failed', {
      userId: compactBitcodeServerId(user.id),
      message: dispatchContextError.message,
    });
  }

  const execution = createStreamingExecution({
    runId,
    userId: user.id,
    supabase: supabaseAdmin,
    streamToDatabase: true,
    structuredToDatabase: false,
  });

  // V48-Gate3-F26-B / F31: background synthesis; waitUntil keeps the Function alive.
  waitUntil(
    runDepositOptionSynthesis({
      runId,
      userId: user.id,
      repositoryFullName,
      sourceBranch,
      sourceCommit,
      obfuscations,
      permissibleSources,
      impermissibleSources,
      demandContext,
      depositoryDemandSignals,
      readingDemandSignals,
      existingDepositorySignals,
      githubConnectionData: githubConnection.connection_data,
      supabaseAdmin,
      execution,
      startedAt,
      startedAtIso,
    }),
  );

  return NextResponse.json({ ok: true, executionId: runId, runId, status: 'dispatched' });
}
