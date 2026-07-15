import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import {
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';

export const runtime = 'nodejs';

const SATS_PER_BTC = 100_000_000;

// The OAuth identity sub normalizes the wallet network to "testnet", while the
// app canon is testnet4 — for the ambiguous label, try testnet4 first and fall
// back to testnet3 so fauceted coins surface wherever they actually landed.
const NETWORK_ENDPOINTS: Record<string, Array<{ network: string; baseUrl: string }>> = {
  mainnet: [{ network: 'mainnet', baseUrl: 'https://mempool.space/api' }],
  testnet4: [{ network: 'testnet4', baseUrl: 'https://mempool.space/testnet4/api' }],
  testnet: [
    { network: 'testnet4', baseUrl: 'https://mempool.space/testnet4/api' },
    { network: 'testnet3', baseUrl: 'https://mempool.space/testnet/api' },
  ],
  signet: [{ network: 'signet', baseUrl: 'https://mempool.space/signet/api' }],
};

function readNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isPlausibleBitcoinAddress(value: unknown) {
  const address = readNonEmptyString(value);
  if (!address) return false;

  return (
    /^(bc1|tb1|bcrt1)[ac-hj-np-z02-9]{8,90}$/i.test(address) ||
    /^[13mn2][A-HJ-NP-Za-km-z1-9]{25,60}$/.test(address)
  );
}

type AddressStats = {
  address: string;
  confirmedSats: number;
  pendingSats: number;
};

async function readAddressStats(baseUrl: string, address: string): Promise<AddressStats | null> {
  const response = await fetch(`${baseUrl}/address/${address}`, {
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });
  if (!response.ok) return null;

  const payload = asRecord(await response.json().catch(() => null));
  const chain = asRecord(payload?.chain_stats);
  const mempool = asRecord(payload?.mempool_stats);
  const readSum = (stats: Record<string, unknown> | null, key: string) =>
    typeof stats?.[key] === 'number' ? (stats[key] as number) : 0;

  return {
    address,
    confirmedSats: readSum(chain, 'funded_txo_sum') - readSum(chain, 'spent_txo_sum'),
    pendingSats: readSum(mempool, 'funded_txo_sum') - readSum(mempool, 'spent_txo_sum'),
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json(
      { error: 'A Bitcode session is required to read wallet BTC posture.', code: 'wallet_session_required' },
      { status: 401 },
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('settings')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const binding =
    asRecord(asRecord(asRecord(profile?.settings)?.bitcodeProfile)?.walletBinding) ??
    asRecord(asRecord(profile?.settings)?.walletBinding);
  const addresses = [
    readNonEmptyString(binding?.authAddress) ?? readNonEmptyString(binding?.address),
    readNonEmptyString(binding?.paymentAddress),
  ].filter((value, index, list): value is string =>
    Boolean(value) && isPlausibleBitcoinAddress(value) && list.indexOf(value) === index,
  );

  if (!addresses.length) {
    return NextResponse.json(
      { error: 'No wallet binding address is attached to this Bitcode profile.', code: 'wallet_binding_missing' },
      { status: 422 },
    );
  }

  const networkLabel = (readNonEmptyString(binding?.network) ?? 'testnet4').toLowerCase();
  const candidates = NETWORK_ENDPOINTS[networkLabel];
  if (!candidates) {
    return NextResponse.json(
      { error: `Wallet network ${networkLabel} has no public balance source.`, code: 'wallet_network_unsupported' },
      { status: 422 },
    );
  }

  try {
    let resolved: { network: string; entries: AddressStats[] } | null = null;
    for (const candidate of candidates) {
      const entries = (
        await Promise.all(addresses.map((address) => readAddressStats(candidate.baseUrl, address)))
      ).filter((entry): entry is AddressStats => entry !== null);
      if (!entries.length) continue;

      const total = entries.reduce((sum, entry) => sum + entry.confirmedSats + entry.pendingSats, 0);
      if (!resolved) resolved = { network: candidate.network, entries };
      if (total > 0) {
        resolved = { network: candidate.network, entries };
        break;
      }
    }

    if (!resolved) {
      return NextResponse.json(
        { error: 'Balance source is unavailable.', code: 'wallet_balance_source_unavailable' },
        { status: 502 },
      );
    }

    const confirmedSats = resolved.entries.reduce((sum, entry) => sum + entry.confirmedSats, 0);
    const pendingSats = resolved.entries.reduce((sum, entry) => sum + entry.pendingSats, 0);

    bitcodeServerTelemetry('info', 'wallet-btc-balance', 'read', {
      userId: compactBitcodeServerId(user.id),
      network: resolved.network,
      addresses: resolved.entries.map((entry) => compactBitcodeServerId(entry.address)),
      confirmedSats,
      pendingSats,
    });

    return NextResponse.json({
      ok: true,
      network: resolved.network,
      addresses: resolved.entries.map((entry) => entry.address),
      confirmedSats,
      pendingSats,
      confirmedBtc: confirmedSats / SATS_PER_BTC,
      pendingBtc: pendingSats / SATS_PER_BTC,
    });
  } catch (error) {
    bitcodeServerTelemetry('warn', 'wallet-btc-balance', 'read-failed', {
      userId: compactBitcodeServerId(user.id),
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Balance source is unavailable.', code: 'wallet_balance_source_unavailable' },
      { status: 502 },
    );
  }
}
