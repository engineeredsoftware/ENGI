/**
 * Pure helpers for Bitcoin wallet connection readiness and display labels.
 */

import { compactBitcodeAddress } from '@bitcode/auth/qa-telemetry';

export const BITCODE_BITCOIN_SUPABASE_PROVIDER = 'custom:bitcode-bitcoin';
export const BITCODE_BITCOIN_SUPABASE_SCOPES = 'profile wallet:bitcoin';

export function readSupabaseClientReadiness() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    return {
      ready: false as const,
      error: 'Supabase staging credentials are not configured for wallet persistence.',
    };
  }

  if (/your-project\.supabase\.co/i.test(url) || /your[-_]?anon[-_]?key/i.test(anonKey)) {
    return {
      ready: false as const,
      error: 'Supabase staging credentials still use placeholder values.',
    };
  }

  return { ready: true as const };
}

export function formatWalletProviderLabel(provider: string | null | undefined) {
  if (!provider) return 'Not connected';
  if (provider === 'xverse') return 'Xverse';
  if (provider === 'leather') return 'Leather';
  if (provider === 'unisat') return 'UniSat';
  if (provider === 'okx-bitcoin') return 'OKX Bitcoin';
  if (provider === 'manual-bitcoin') return 'Manual Bitcoin address';
  if (provider === 'walletconnect') return 'Wallet provider';
  return provider
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatWalletReadout(value: string | null | undefined) {
  if (!value) return 'Not provided';
  if (value.length > 24) return compactBitcodeAddress(value, 8) ?? value;
  return value;
}
