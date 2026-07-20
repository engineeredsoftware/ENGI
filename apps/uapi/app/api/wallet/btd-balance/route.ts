/**
 * GET /api/wallet/btd-balance
 * On-chain fungible BTD (ERC1155 id 0) for the bound wallet when Sepolia
 * RPC + contract address are configured. Falls back to readiness-only when not.
 *
 * Env:
 *   BITCODE_ETHEREUM_RPC_URL
 *   BITCODE_ERC1155_ADDRESS
 *   BITCODE_ETHEREUM_CHAIN_ID (default 11155111 Sepolia)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@bitcode/supabase/ssr/server';
import { readBitcodeWalletBindingFromProfile } from '@bitcode/orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BTD_TOKEN_ID = 0n;
const BTD_DECIMALS = 18n;

/** ERC1155 balanceOf(address,uint256) */
const BALANCE_OF_SELECTOR = '00fdd58e';

function isPlausibleEthereumAddress(value: string | null | undefined): value is string {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value.trim()));
}

function padAddress(address: string): string {
  return address.replace(/^0x/i, '').toLowerCase().padStart(64, '0');
}

function padUint256(value: bigint): string {
  return value.toString(16).padStart(64, '0');
}

function formatBtdWhole(baseUnits: bigint): number {
  const scale = 10n ** BTD_DECIMALS;
  const whole = baseUnits / scale;
  const frac = baseUnits % scale;
  // Keep ~6 decimal places for UI without float overflow on large balances.
  const fracMicro = Number((frac * 1_000_000n) / scale) / 1_000_000;
  return Number(whole) + fracMicro;
}

async function ethCallBalanceOf(params: {
  rpcUrl: string;
  contract: string;
  owner: string;
}): Promise<bigint> {
  const data = `0x${BALANCE_OF_SELECTOR}${padAddress(params.owner)}${padUint256(BTD_TOKEN_ID)}`;
  const response = await fetch(params.rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to: params.contract, data }, 'latest'],
    }),
    signal: AbortSignal.timeout(8_000),
  });
  const payload = (await response.json().catch(() => null)) as {
    result?: string;
    error?: { message?: string };
  } | null;
  if (!response.ok || !payload || payload.error || typeof payload.result !== 'string') {
    throw new Error(
      payload?.error?.message || 'RPC eth_call balanceOf failed for Bitcode ERC1155.',
    );
  }
  return BigInt(payload.result);
}

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const queryAddress = url.searchParams.get('address');

  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_address, wallet_binding_status')
    .eq('id', user.id)
    .maybeSingle();

  const binding = readBitcodeWalletBindingFromProfile(profile as Record<string, unknown> | null);
  const boundAddress =
    (isPlausibleEthereumAddress(queryAddress) ? queryAddress.trim() : null) ||
    (isPlausibleEthereumAddress(binding?.address) ? binding!.address!.trim() : null) ||
    (isPlausibleEthereumAddress((profile as { wallet_address?: string } | null)?.wallet_address)
      ? String((profile as { wallet_address: string }).wallet_address).trim()
      : null);

  const rpcUrl = process.env.BITCODE_ETHEREUM_RPC_URL?.trim() || null;
  const contract = process.env.BITCODE_ERC1155_ADDRESS?.trim() || null;
  const chainId = Number(process.env.BITCODE_ETHEREUM_CHAIN_ID || '11155111');
  const configured = Boolean(rpcUrl && isPlausibleEthereumAddress(contract));

  if (!boundAddress) {
    return NextResponse.json({
      ok: true,
      configured,
      chainId,
      contract,
      address: null,
      balanceBaseUnits: null,
      balanceBtd: null,
      source: 'unbound',
      settleReady: false,
      note: 'Connect an Ethereum wallet (0x) in Auxillaries to read BTD balance.',
    });
  }

  if (!configured || !rpcUrl || !contract) {
    return NextResponse.json({
      ok: true,
      configured: false,
      chainId,
      contract,
      address: boundAddress,
      balanceBaseUnits: null,
      balanceBtd: null,
      source: 'not-configured',
      settleReady: false,
      note:
        'Set BITCODE_ETHEREUM_RPC_URL and BITCODE_ERC1155_ADDRESS to surface on-chain BTD (token id 0).',
    });
  }

  try {
    const baseUnits = await ethCallBalanceOf({
      rpcUrl,
      contract,
      owner: boundAddress,
    });
    return NextResponse.json({
      ok: true,
      configured: true,
      chainId,
      contract,
      address: boundAddress,
      balanceBaseUnits: baseUnits.toString(),
      balanceBtd: formatBtdWhole(baseUnits),
      source: 'erc1155-rpc',
      settleReady: true,
      tokenId: 0,
      note: 'Fungible BTD (ERC1155 id 0) via Sepolia eth_call balanceOf.',
    });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      configured: true,
      chainId,
      contract,
      address: boundAddress,
      balanceBaseUnits: null,
      balanceBtd: null,
      source: 'rpc-error',
      settleReady: false,
      note: err instanceof Error ? err.message : 'Failed to read on-chain BTD balance.',
    });
  }
}
