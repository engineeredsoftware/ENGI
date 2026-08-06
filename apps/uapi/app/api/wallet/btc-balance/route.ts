import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import {
  bitcodeServerLifecycleTelemetry,
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Allow multi-provider balance probes without Vercel hard-killing the function. */
export const maxDuration = 15;

const SATS_PER_BTC = 100_000_000;
const PROVIDER_TIMEOUT_MS = 4_000;

/**
 * Esplora-compatible balance sources. mempool.space alone has been unreliable
 * from some serverless egress paths (sustained 502s with no app logs); always
 * try at least one alternate host per network.
 */
type BalanceEndpoint = {
  provider: string;
  network: string;
  baseUrl: string;
};

// The OAuth identity sub normalizes the wallet network to "testnet", while the
// app canon is testnet4 — for the ambiguous label, try testnet4 first and fall
// back to testnet3 so fauceted coins surface wherever they actually landed.
const NETWORK_ENDPOINTS: Record<string, BalanceEndpoint[]> = {
  mainnet: [
    { provider: 'mempool', network: 'mainnet', baseUrl: 'https://mempool.space/api' },
    { provider: 'blockstream', network: 'mainnet', baseUrl: 'https://blockstream.info/api' },
  ],
  testnet4: [
    { provider: 'mempool', network: 'testnet4', baseUrl: 'https://mempool.space/testnet4/api' },
    // No dedicated testnet4 on blockstream; still try classic testnet as last resort.
    { provider: 'mempool', network: 'testnet3', baseUrl: 'https://mempool.space/testnet/api' },
    { provider: 'blockstream', network: 'testnet3', baseUrl: 'https://blockstream.info/testnet/api' },
  ],
  testnet: [
    { provider: 'mempool', network: 'testnet4', baseUrl: 'https://mempool.space/testnet4/api' },
    { provider: 'mempool', network: 'testnet3', baseUrl: 'https://mempool.space/testnet/api' },
    { provider: 'blockstream', network: 'testnet3', baseUrl: 'https://blockstream.info/testnet/api' },
  ],
  signet: [
    { provider: 'mempool', network: 'signet', baseUrl: 'https://mempool.space/signet/api' },
  ],
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

async function fetchJson(
  url: string,
  timeoutMs = PROVIDER_TIMEOUT_MS,
): Promise<{ ok: boolean; status: number; body: unknown } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        // Some public Esplora hosts are pickier about anonymous serverless clients.
        'user-agent': 'Bitcode/1.0 (+https://bitcode.com; wallet-btc-balance)',
      },
    });
    const body = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, body };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function readAddressStats(
  baseUrl: string,
  address: string,
): Promise<AddressStats | null> {
  const result = await fetchJson(`${baseUrl}/address/${encodeURIComponent(address)}`);
  if (!result?.ok) return null;

  const payload = asRecord(result.body);
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

/**
 * Probe one Esplora base for all addresses. Failures are isolated so one
 * blocked provider / timed-out address does not poison the whole request.
 */
async function readEndpointBalances(
  endpoint: BalanceEndpoint,
  addresses: string[],
): Promise<AddressStats[]> {
  const settled = await Promise.all(
    addresses.map(async (address) => {
      try {
        return await readAddressStats(endpoint.baseUrl, address);
      } catch {
        return null;
      }
    }),
  );
  return settled.filter((entry): entry is AddressStats => entry !== null);
}

export async function GET() {
  let userIdForLog: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json(
        {
          error: 'A Bitcode session is required to read wallet BTC posture.',
          code: 'wallet_session_required',
        },
        { status: 401 },
      );
    }
    userIdForLog = user.id;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('settings')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      bitcodeServerLifecycleTelemetry('error', 'wallet-btc-balance', 'profile-read-failed', {
        userId: compactBitcodeServerId(user.id),
        message: profileError.message,
      });
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const binding =
      asRecord(asRecord(asRecord(profile?.settings)?.bitcodeProfile)?.walletBinding) ??
      asRecord(asRecord(profile?.settings)?.walletBinding);
    const addresses = [
      readNonEmptyString(binding?.authAddress) ?? readNonEmptyString(binding?.address),
      readNonEmptyString(binding?.paymentAddress),
    ].filter(
      (value, index, list): value is string =>
        Boolean(value) && isPlausibleBitcoinAddress(value) && list.indexOf(value) === index,
    );

    if (!addresses.length) {
      return NextResponse.json(
        {
          error: 'No wallet binding address is attached to this Bitcode profile.',
          code: 'wallet_binding_missing',
        },
        { status: 422 },
      );
    }

    const networkLabel = (readNonEmptyString(binding?.network) ?? 'testnet4').toLowerCase();
    const candidates = NETWORK_ENDPOINTS[networkLabel];
    if (!candidates?.length) {
      return NextResponse.json(
        {
          error: `Wallet network ${networkLabel} has no public balance source.`,
          code: 'wallet_network_unsupported',
        },
        { status: 422 },
      );
    }

    let resolved: {
      network: string;
      provider: string;
      entries: AddressStats[];
    } | null = null;
    const probeErrors: Array<{ provider: string; network: string; okCount: number }> = [];

    for (const candidate of candidates) {
      const entries = await readEndpointBalances(candidate, addresses);
      probeErrors.push({
        provider: candidate.provider,
        network: candidate.network,
        okCount: entries.length,
      });
      if (!entries.length) continue;

      const total = entries.reduce(
        (sum, entry) => sum + entry.confirmedSats + entry.pendingSats,
        0,
      );
      if (!resolved) {
        resolved = {
          network: candidate.network,
          provider: candidate.provider,
          entries,
        };
      }
      // Prefer a source that shows funds (testnet4 vs testnet3 disambiguation).
      if (total > 0) {
        resolved = {
          network: candidate.network,
          provider: candidate.provider,
          entries,
        };
        break;
      }
    }

    if (!resolved) {
      bitcodeServerLifecycleTelemetry('error', 'wallet-btc-balance', 'providers-exhausted', {
        userId: compactBitcodeServerId(user.id),
        networkLabel,
        addressCount: addresses.length,
        probes: probeErrors,
      });
      // Degraded success: keep the wallet surface usable and stop treating
      // upstream Esplora outages as application 502s. Client already falls
      // back when ok is false / balances are null.
      return NextResponse.json(
        {
          ok: false,
          degraded: true,
          code: 'wallet_balance_source_unavailable',
          error: 'Balance source is unavailable.',
          network: networkLabel,
          addresses,
          confirmedSats: null,
          pendingSats: null,
          confirmedBtc: null,
          pendingBtc: null,
        },
        { status: 200 },
      );
    }

    const confirmedSats = resolved.entries.reduce((sum, entry) => sum + entry.confirmedSats, 0);
    const pendingSats = resolved.entries.reduce((sum, entry) => sum + entry.pendingSats, 0);

    bitcodeServerTelemetry('info', 'wallet-btc-balance', 'read', {
      userId: compactBitcodeServerId(user.id),
      network: resolved.network,
      provider: resolved.provider,
      addresses: resolved.entries.map((entry) => compactBitcodeServerId(entry.address)),
      confirmedSats,
      pendingSats,
    });

    return NextResponse.json({
      ok: true,
      degraded: false,
      network: resolved.network,
      provider: resolved.provider,
      addresses: resolved.entries.map((entry) => entry.address),
      confirmedSats,
      pendingSats,
      confirmedBtc: confirmedSats / SATS_PER_BTC,
      pendingBtc: pendingSats / SATS_PER_BTC,
    });
  } catch (error) {
    bitcodeServerLifecycleTelemetry('error', 'wallet-btc-balance', 'unhandled', {
      userId: compactBitcodeServerId(userIdForLog),
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        ok: false,
        degraded: true,
        code: 'wallet_balance_source_unavailable',
        error: 'Balance source is unavailable.',
        confirmedSats: null,
        pendingBtc: null,
        confirmedBtc: null,
        pendingSats: null,
      },
      { status: 200 },
    );
  }
}
