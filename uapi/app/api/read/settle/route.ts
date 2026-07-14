/**
 * POST /api/read/settle — spawn one SettleAssetPackSimplePipeline per bought option.
 *
 * 1:1 AssetPack : settle pipeline. SynthesizeRead may return multiple options;
 * each selected option gets its own settle run (BTC → mint-btd → settle-btd →
 * settle-asset-pack → PR → packs).
 *
 * Wire JSON is parsed into strongly typed SettleAssetPackOption at this boundary.
 */

import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import { Execution } from '@bitcode/execution-generics';
import {
  parseSettleAssetPackOption,
  parseSettleAssetPackOptions,
  runSettleAssetPackSimplePipeline,
  type SettleAssetPackOption,
  type SettleAssetPackInput,
  type SettleBtcPaymentObservationInput,
  type SettleRepositoryRef,
} from '@bitcode/asset-packs-pipelines-settle-asset-pack-pipeline';
import { storeCrossPhaseArtifact } from '@bitcode/asset-packs-pipelines-domain';

export const runtime = 'nodejs';
export const maxDuration = 120;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRepository(raw: unknown, fullNameFallback: string | null): SettleRepositoryRef {
  if (!isObject(raw)) {
    return { fullName: fullNameFallback };
  }
  return {
    url: typeof raw.url === 'string' ? raw.url : null,
    owner: typeof raw.owner === 'string' ? raw.owner : null,
    name: typeof raw.name === 'string' ? raw.name : null,
    branch: typeof raw.branch === 'string' ? raw.branch : null,
    commit: typeof raw.commit === 'string' ? raw.commit : null,
    fullName:
      typeof raw.fullName === 'string'
        ? raw.fullName
        : fullNameFallback,
  };
}

function parsePaymentObservation(
  raw: unknown,
  amountSats: unknown,
  txId: unknown,
): SettleBtcPaymentObservationInput {
  const base: SettleBtcPaymentObservationInput = {
    schema: 'bitcode.settle-asset-pack.payment-observation',
    network: 'btc-testnet',
    status: 'observed-projection',
    amountSats: typeof amountSats === 'number' ? amountSats : null,
    txId: typeof txId === 'string' ? txId : null,
  };
  if (!isObject(raw)) return base;
  return {
    schema:
      typeof raw.schema === 'string'
        ? raw.schema
        : base.schema,
    network: typeof raw.network === 'string' ? raw.network : base.network,
    status: typeof raw.status === 'string' ? raw.status : base.status,
    txId:
      typeof raw.txId === 'string'
        ? raw.txId
        : typeof txId === 'string'
          ? txId
          : null,
    amountSats:
      typeof raw.amountSats === 'number'
        ? raw.amountSats
        : typeof amountSats === 'number'
          ? amountSats
          : null,
    confirmedAt: typeof raw.confirmedAt === 'string' ? raw.confirmedAt : null,
    finality: typeof raw.finality === 'string' ? raw.finality : null,
  };
}

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
    const data = githubConnection?.connection_data;
    if (!isObject(data)) return null;
    if (typeof data.access_token === 'string') return data.access_token;
    if (typeof data.token === 'string') return data.token;
  } catch {
    /* projected PR path */
  }
  return null;
}

interface RunOneSettleInput {
  admin: ReturnType<typeof supabaseAdmin>;
  userId: string;
  option: SettleAssetPackOption;
  repository: SettleRepositoryRef;
  repositoryFullName: string | null;
  synthesisRunId: string | null;
  need: string | null;
  paymentObservation: SettleBtcPaymentObservationInput;
  githubAccessToken: string | null;
  readerWalletId: string | null;
  depositorWalletId: string | null;
  buyerEthereumAddress: string | null;
  depositorEthereumAddress: string | null;
  masterEthereumAddress: string | null;
}

async function runOneSettle(input: RunOneSettleInput) {
  const settleRunId = randomUUID();
  const startedAt = new Date().toISOString();
  const optionTitle = input.option.title ?? null;

  await input.admin.from('executions').insert({
    id: settleRunId,
    user_id: input.userId,
    type: 'agentic-execution:asset-pack',
    status: 'running',
    input: {
      productPipeline: 'settle-asset-pack-pipeline',
      synthesisRunId: input.synthesisRunId,
      optionCount: 1,
      optionTitle,
      repositoryFullName: input.repositoryFullName,
      needLength: input.need?.length ?? 0,
    },
    context: {
      source: 'read-settle-asset-pack',
      route: '/reads',
      pipelineCore: 'settle-asset-pack-pipeline',
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
  storeCrossPhaseArtifact(exec, 'pipeline', 'productPipeline', 'settle-asset-pack-pipeline');

  const pipelineInput: SettleAssetPackInput = {
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
    paymentObservation: input.paymentObservation,
    githubAccessToken: input.githubAccessToken,
    userId: input.userId,
    readerWalletId: input.readerWalletId,
    depositorWalletId: input.depositorWalletId,
    buyerEthereumAddress: input.buyerEthereumAddress,
    depositorEthereumAddress: input.depositorEthereumAddress,
    masterEthereumAddress: input.masterEthereumAddress,
    need: input.need,
    synthesisRunId: input.synthesisRunId,
  };

  try {
    const result = await runSettleAssetPackSimplePipeline(pipelineInput, exec);

    const packActivity = result.packActivity;
    const shippable = result.shippable;
    const mintBtd = result.mintBtd;
    const settleBtd = result.settleBtd;
    const settleAssetPack = result.settleAssetPack;
    const summary = result.summary;
    const deliveryState = packActivity.deliveryState || shippable.status || 'projected';
    const rightsState = 'btd-rights-transferred' as const;
    const prUrl = packActivity.prUrl || shippable.prUrl || null;
    const measurementRows = packActivity.measurements;

    await input.admin
      .from('executions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        output: {
          productPipeline: 'settle-asset-pack-pipeline',
          success: true,
          packActivity,
          shippable: packActivity.shippable || {
            schema: shippable.schema,
            deliveryMechanism: shippable.deliveryMechanism,
            repository: shippable.repository,
            patchCount: shippable.patchCount,
            prUrl,
            status: deliveryState,
            note: shippable.note,
          },
          mintBtd,
          settleBtd,
          settleAssetPack,
          selectedCount: 1,
          optionCount: 1,
          assetPackTitle: optionTitle || packActivity.assetPackTitle || null,
          measurements: measurementRows,
          settlementState: 'settled',
          rightsState,
          deliveryState,
          deliveryReference: prUrl,
          prUrl,
          amountSats: packActivity.paymentObservation?.amountSats ?? null,
          summary,
        },
        context: {
          source: 'read-settle-asset-pack',
          route: '/reads',
          pipelineCore: 'settle-asset-pack-pipeline',
          synthesisMode: 'read',
          repositoryFullName:
            input.repositoryFullName || packActivity.repositoryFullName || null,
          optionCount: 1,
          packActivityType: 'settled-assetpack',
          activityType: 'settled-assetpack',
          admissionState: 'settled',
          settlementState: 'settled',
          rightsState,
          deliveryState,
          deliveryReference: prUrl,
          prUrl,
          assetPackTitle: optionTitle || packActivity.assetPackTitle || null,
        },
      })
      .eq('id', settleRunId)
      .eq('user_id', input.userId);

    return {
      ok: true as const,
      settleRunId,
      packActivity,
      shippable: {
        prUrl,
        status: deliveryState,
        repository: shippable.repository,
      },
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
      {
        error: 'A Bitcode session is required to settle read options.',
        code: 'read_session_required',
      },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!isObject(parsed)) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    body = parsed;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const selectedOptions: SettleAssetPackOption[] = Array.isArray(body.selectedOptions)
    ? parseSettleAssetPackOptions(body.selectedOptions)
    : body.assetPackOption
      ? (() => {
          const one = parseSettleAssetPackOption(body.assetPackOption);
          return one ? [one] : [];
        })()
      : [];

  if (selectedOptions.length === 0) {
    return NextResponse.json(
      {
        error:
          'selectedOptions (or assetPackOption) with measurements.needinesses is required — one settle pipeline per bought option.',
        code: 'options_required',
      },
      { status: 400 },
    );
  }

  const repositoryFullName =
    typeof body.repositoryFullName === 'string' ? body.repositoryFullName : null;
  const repository = parseRepository(body.repository, repositoryFullName);
  const synthesisRunId =
    typeof body.synthesisRunId === 'string' ? body.synthesisRunId : null;
  const need = typeof body.need === 'string' ? body.need : null;
  const paymentObservation = parsePaymentObservation(
    body.paymentObservation,
    body.amountSats,
    body.txId,
  );

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
      repositoryFullName: repositoryFullName || repository.fullName || null,
      synthesisRunId,
      need,
      paymentObservation,
      githubAccessToken,
      readerWalletId: typeof body.readerWalletId === 'string' ? body.readerWalletId : null,
      depositorWalletId:
        typeof body.depositorWalletId === 'string' ? body.depositorWalletId : null,
      buyerEthereumAddress:
        typeof body.buyerEthereumAddress === 'string' ? body.buyerEthereumAddress : null,
      depositorEthereumAddress:
        typeof body.depositorEthereumAddress === 'string'
          ? body.depositorEthereumAddress
          : null,
      masterEthereumAddress:
        typeof body.masterEthereumAddress === 'string' ? body.masterEthereumAddress : null,
    });
    results.push(one);
  }

  const allOk = results.every((r) => r.ok);
  const settleRunIds = results.map((r) => r.settleRunId);

  return NextResponse.json(
    {
      ok: allOk,
      settleRunIds,
      settleRunId: settleRunIds[0] || null,
      results,
      optionCount: selectedOptions.length,
      status: allOk ? 'completed' : 'partial_or_failed',
    },
    { status: allOk ? 200 : 500 },
  );
}
