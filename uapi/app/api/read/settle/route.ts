/**
 * POST /api/read/settle — spawn one SettleAssetPacksSimplePipeline per bought option.
 *
 * 1:1 AssetPack : settle pipeline. SynthesizeRead may return multiple options;
 * each selected option gets its own settle run (BTC → mint-btd → settle-btd →
 * settle-asset-pack → PR → packs).
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

async function resolveGithubToken(
  admin: ReturnType<typeof supabaseAdmin>,
  userId: string,
): Promise<string | null> {
  try {
    const { data: githubConnection } = await admin
      .from('user_connections')
      .select('connection_data')
      .eq('user_id', userId)
      .eq('provider', 'github')
      .eq('is_active', true)
      .maybeSingle();
    const data = githubConnection?.connection_data as Record<string, unknown> | null;
    if (data && typeof data.access_token === 'string') return data.access_token;
    if (data && typeof data.token === 'string') return data.token;
  } catch {
    /* projected PR path */
  }
  return null;
}

async function runOneSettle(input: {
  admin: ReturnType<typeof supabaseAdmin>;
  userId: string;
  option: unknown;
  repository: Record<string, unknown>;
  repositoryFullName: string | null;
  synthesisRunId: string | null;
  need: string | null;
  paymentObservation: unknown;
  githubAccessToken: string | null;
  readerWalletId: unknown;
  depositorWalletId: unknown;
  buyerEthereumAddress: unknown;
  depositorEthereumAddress: unknown;
  masterEthereumAddress: unknown;
  amountSats: unknown;
  txId: unknown;
}) {
  const settleRunId = randomUUID();
  const startedAt = new Date().toISOString();
  const optionTitle =
    input.option &&
    typeof input.option === 'object' &&
    typeof (input.option as any).title === 'string'
      ? (input.option as any).title
      : null;

  await input.admin.from('executions').insert({
    id: settleRunId,
    user_id: input.userId,
    type: 'agentic-execution:asset-pack',
    status: 'running',
    input: {
      productPipeline: 'settle-asset-packs',
      synthesisRunId: input.synthesisRunId,
      optionCount: 1,
      optionTitle,
      repositoryFullName: input.repositoryFullName,
      needLength: input.need?.length ?? 0,
    },
    context: {
      source: 'read-settle-asset-packs',
      route: '/reads',
      pipelineCore: 'settle-asset-packs',
      synthesisMode: 'read',
      repositoryFullName: input.repositoryFullName,
      optionCount: 1,
      optionTitle,
      packActivityType: 'settled-assetpack',
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
          fullName: input.repositoryFullName,
          owner: input.repository.owner,
          name: input.repository.name,
          branch: input.repository.branch,
          commit: input.repository.commit,
          url: input.repository.url,
        },
        assetPackOption: input.option,
        selectedOptions: [input.option],
        paymentObservation: input.paymentObservation || {
          schema: 'bitcode.settle-asset-packs.payment-observation',
          network: 'btc-testnet',
          status: 'observed-projection',
          amountSats: typeof input.amountSats === 'number' ? input.amountSats : null,
          txId: typeof input.txId === 'string' ? input.txId : null,
        },
        githubAccessToken: input.githubAccessToken,
        userId: input.userId,
        readerWalletId: input.readerWalletId || null,
        depositorWalletId: input.depositorWalletId || null,
        buyerEthereumAddress: input.buyerEthereumAddress || null,
        depositorEthereumAddress: input.depositorEthereumAddress || null,
        masterEthereumAddress: input.masterEthereumAddress || null,
        need: input.need,
        synthesisRunId: input.synthesisRunId,
      },
      exec,
    );

    const packActivity =
      exec.get?.('settle-asset-packs', 'packActivity') ||
      (result as any)?.packActivity ||
      null;
    const shippable =
      exec.get?.('settle-asset-packs', 'shippable') || (result as any)?.shippable || null;
    const mintBtd = exec.get?.('settle-asset-packs', 'mintBtd') || null;
    const settleBtd = exec.get?.('settle-asset-packs', 'settleBtd') || null;
    const settleAssetPack = exec.get?.('settle-asset-packs', 'settleAssetPack') || null;
    const summary =
      typeof (result as any)?.summary === 'string'
        ? (result as any).summary
        : `Settled AssetPack${optionTitle ? `: ${optionTitle}` : ''}.`;
    const deliveryState =
      (packActivity as any)?.deliveryState || shippable?.status || 'projected';
    const rightsState = 'btd-rights-transferred';
    const prUrl =
      (packActivity as any)?.prUrl || shippable?.prUrl || null;
    const measurementRows = Array.isArray((packActivity as any)?.measurements)
      ? (packActivity as any).measurements
      : [];

    await input.admin
      .from('executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        output: {
          productPipeline: 'settle-asset-packs',
          success: true,
          packActivity,
          shippable: packActivity?.shippable || {
            schema: shippable?.schema,
            deliveryMechanism: shippable?.deliveryMechanism,
            repository: shippable?.repository,
            patchCount: shippable?.patchCount,
            prUrl,
            status: deliveryState,
            note: shippable?.note,
          },
          mintBtd,
          settleBtd,
          settleAssetPack,
          selectedCount: 1,
          optionCount: 1,
          assetPackTitle: optionTitle || (packActivity as any)?.assetPackTitle || null,
          measurements: measurementRows,
          settlementState: 'settled',
          rightsState,
          deliveryState,
          deliveryReference: prUrl,
          prUrl,
          amountSats:
            typeof (packActivity as any)?.paymentObservation?.amountSats === 'number'
              ? (packActivity as any).paymentObservation.amountSats
              : null,
          summary,
        },
        context: {
          source: 'read-settle-asset-packs',
          route: '/reads',
          pipelineCore: 'settle-asset-packs',
          synthesisMode: 'read',
          repositoryFullName:
            input.repositoryFullName || (packActivity as any)?.repositoryFullName || null,
          optionCount: 1,
          packActivityType: 'settled-assetpack',
          activityType: 'settled-assetpack',
          admissionState: 'settled',
          settlementState: 'settled',
          rightsState,
          deliveryState,
          deliveryReference: prUrl,
          prUrl,
          assetPackTitle: optionTitle || (packActivity as any)?.assetPackTitle || null,
        },
      })
      .eq('id', settleRunId)
      .eq('user_id', input.userId);

    return {
      ok: true as const,
      settleRunId,
      packActivity,
      shippable: { prUrl, status: deliveryState, repository: shippable?.repository || null },
      mintBtd,
      settleBtd,
      settleAssetPack,
      status: 'completed' as const,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await input.admin
      .from('executions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: { message },
      })
      .eq('id', settleRunId)
      .eq('user_id', input.userId);
    return {
      ok: false as const,
      settleRunId,
      error: message,
      code: 'settle_failed' as const,
    };
  }
}

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

  // Accept single option or array — always 1:1 pipeline runs.
  const selectedOptions = Array.isArray(body.selectedOptions)
    ? body.selectedOptions
    : body.assetPackOption
      ? [body.assetPackOption]
      : [];
  if (selectedOptions.length === 0) {
    return NextResponse.json(
      {
        error: 'selectedOptions (or assetPackOption) is required — one settle pipeline per bought option.',
        code: 'options_required',
      },
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

  const admin = supabaseAdmin();
  const githubAccessToken = await resolveGithubToken(admin, user.id);

  const results = [];
  for (const option of selectedOptions) {
    // Sequential 1:1 runs so each ERC1155 projected state is independent.
    // eslint-disable-next-line no-await-in-loop
    const one = await runOneSettle({
      admin,
      userId: user.id,
      option,
      repository,
      repositoryFullName,
      synthesisRunId,
      need,
      paymentObservation: body.paymentObservation,
      githubAccessToken,
      readerWalletId: body.readerWalletId,
      depositorWalletId: body.depositorWalletId,
      buyerEthereumAddress: body.buyerEthereumAddress,
      depositorEthereumAddress: body.depositorEthereumAddress,
      masterEthereumAddress: body.masterEthereumAddress,
      amountSats: body.amountSats,
      txId: body.txId,
    });
    results.push(one);
  }

  const allOk = results.every((r) => r.ok);
  const settleRunIds = results.map((r) => r.settleRunId);

  return NextResponse.json(
    {
      ok: allOk,
      // Multi-option: one pipeline per option
      settleRunIds,
      settleRunId: settleRunIds[0] || null,
      results,
      optionCount: selectedOptions.length,
      status: allOk ? 'completed' : 'partial_or_failed',
    },
    { status: allOk ? 200 : 500 },
  );
}
