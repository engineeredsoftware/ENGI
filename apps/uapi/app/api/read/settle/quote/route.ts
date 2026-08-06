/**
 * POST /api/read/settle/quote
 * Build multi-rail spot options (ETH/BTC/SOL) for a needinesses BTD volume.
 * Testnet default: mock spots. payAmount is advisory until EIP-712 signed settle.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@bitcode/supabase/ssr/server';
import {
  applyBtdSupplyDecay,
  assertPositiveSettlementBtd,
  buildMultiRailSpotQuote,
  computeSettlementBtdFromNeedinesses,
  createMockSpotBoard,
  needFitVolumeToBaseUnits,
} from '@bitcode/btd/erc1155';

export const runtime = 'nodejs';

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

  const measurements = body.measurements;
  const btdTotalMinted =
    typeof body.btdTotalMinted === 'string'
      ? BigInt(body.btdTotalMinted)
      : typeof body.btdTotalMinted === 'number'
        ? BigInt(Math.floor(body.btdTotalMinted))
        : 0n;

  let raw;
  try {
    raw = assertPositiveSettlementBtd(
      computeSettlementBtdFromNeedinesses(
        measurements as Parameters<typeof computeSettlementBtdFromNeedinesses>[0],
      ),
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Invalid needinesses for BTD volume.',
      },
      { status: 400 },
    );
  }

  const decayed = applyBtdSupplyDecay({
    rawVolumeBaseUnits: raw.amountBaseUnits,
    btdTotalMinted,
  });
  if (decayed.btdVolume <= 0n) {
    return NextResponse.json(
      { ok: false, error: 'Decayed BTD volume is zero.' },
      { status: 400 },
    );
  }

  const multi = buildMultiRailSpotQuote(decayed.btdVolume, createMockSpotBoard());
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  return NextResponse.json({
    ok: true,
    provider: multi.board.provider,
    needFitVolume: raw.needFitVolume,
    rawVolumeBaseUnits: raw.amountBaseUnits.toString(),
    btdVolume: decayed.btdVolume.toString(),
    btdVolumeDisplay: (Number(decayed.btdVolume) / Number(needFitVolumeToBaseUnits(1) || 1n)).toFixed(
      6,
    ),
    decay: decayed.decay,
    decayMicro: decayed.decayMicro,
    expiresAt,
    options: multi.options.map((o) => ({
      payAsset: o.payAsset,
      payAmount: o.payAmount.toString(),
      payAmountDisplay: o.payAmountDisplay,
      rateMicro: o.rateMicro,
      payAmountUsd: o.payAmountUsd,
      rateUpdatedAt: o.rateUpdatedAt,
      available: o.available,
      unavailableReason: o.unavailableReason ?? null,
      decimals: o.decimals,
    })),
  });
}
