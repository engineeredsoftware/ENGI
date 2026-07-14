/**
 * POST /api/read/settle — run SettleAssetPacksSimplePipeline for selected options.
 *
 * After SynthesizeReadAssetPacks selection envelope: pay projection → mint BTD →
 * rights → ship patch PR → pack activity for /packs.
 */

import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import { Execution } from '@bitcode/execution-generics';
import { runSettleAssetPacksSimplePipeline } from '@bitcode/asset-packs-pipelines-settle-asset-packs';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-domain';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json(
      { error: 'A Bitcode session is required to settle read options.', code: 'read_session_required' },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const selectedOptions = Array.isArray(body.selectedOptions) ? body.selectedOptions : [];
  if (selectedOptions.length === 0) {
    return NextResponse.json(
      { error: 'selectedOptions is required.', code: 'options_required' },
      { status: 400 },
    );
  }

  const repository =
    body.repository && typeof body.repository === 'object'
      ? (body.repository as Record<string, unknown>)
      : {};
  const repositoryFullName =
    typeof body.repositoryFullName === 'string'
      ? body.repositoryFullName
      : typeof repository.fullName === 'string'
        ? repository.fullName
        : null;
  const synthesisRunId =
    typeof body.synthesisRunId === 'string' ? body.synthesisRunId : null;
  const need = typeof body.need === 'string' ? body.need : null;
  const settleRunId = randomUUID();

  const admin = supabaseAdmin();
  const startedAt = new Date().toISOString();
  await admin.from('executions').insert({
    id: settleRunId,
    user_id: user.id,
    type: 'agentic-execution:asset-pack',
    status: 'running',
    input: {
      productPipeline: 'settle-asset-packs',
      synthesisRunId,
      optionCount: selectedOptions.length,
      repositoryFullName,
      needLength: need?.length ?? 0,
    },
    context: {
      source: 'read-settle-asset-packs',
      route: '/reads',
      pipelineCore: 'settle-asset-packs',
      synthesisMode: 'read',
      repositoryFullName,
      optionCount: selectedOptions.length,
    },
    started_at: startedAt,
  });

  const exec = new Execution(`pipeline:settle:${settleRunId}`);
  storeCrossPhaseArtifact(exec, 'host', 'runId', settleRunId);
  storeCrossPhaseArtifact(exec, 'pipeline', 'productPipeline', 'settle-asset-packs');

  try {
    const result = await runSettleAssetPacksSimplePipeline(
      {
        repository: {
          fullName: repositoryFullName,
          owner: repository.owner,
          name: repository.name,
          branch: repository.branch,
          commit: repository.commit,
          url: repository.url,
        },
        selectedOptions,
        synthesizedPacks: selectedOptions,
        paymentObservation: body.paymentObservation || {
          schema: 'bitcode.settle-asset-packs.payment-observation',
          network: 'btc-testnet',
          status: 'observed-projection',
        },
        readerWalletId: body.readerWalletId || null,
        depositorWalletId: body.depositorWalletId || null,
        need,
        synthesisRunId,
      },
      exec,
    );

    const packActivity =
      exec.get?.('settle-asset-packs', 'packActivity') ||
      (result as any)?.packActivity ||
      null;
    const shippable =
      exec.get?.('settle-asset-packs', 'shippable') || (result as any)?.shippable || null;

    await admin
      .from('executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        output: {
          productPipeline: 'settle-asset-packs',
          success: true,
          packActivity,
          shippable,
          selectedCount: selectedOptions.length,
          summary:
            typeof (result as any)?.summary === 'string'
              ? (result as any).summary
              : `Settled ${selectedOptions.length} read AssetPack option(s).`,
        },
        context: {
          source: 'read-settle-asset-packs',
          route: '/reads',
          pipelineCore: 'settle-asset-packs',
          synthesisMode: 'read',
          repositoryFullName,
          optionCount: selectedOptions.length,
          admissionState: 'settled',
          settlementState: 'settled',
          deliveryState: shippable?.status || 'projected',
        },
      })
      .eq('id', settleRunId)
      .eq('user_id', user.id);

    return NextResponse.json({
      ok: true,
      settleRunId,
      packActivity,
      shippable,
      status: 'completed',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin
      .from('executions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: { message },
      })
      .eq('id', settleRunId)
      .eq('user_id', user.id);
    return NextResponse.json(
      { ok: false, error: message, settleRunId, code: 'settle_failed' },
      { status: 500 },
    );
  }
}
