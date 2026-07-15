/**
 * Supabase session readiness and OAuth redirect for Bitcoin wallet auth.
 * Post-auth landing is /packs.
 */

import { createClient } from '@bitcode/supabase/ssr/client';
import type { BitcoinWalletProviderId } from '@bitcode/auth/bitcoin-wallet-client';
import { bitcodeQaTelemetry } from '@bitcode/auth/qa-telemetry';
import { buildSupabaseAuthCallbackRedirect } from '@bitcode/auth/supabase-auth-redirect';

import {
  BITCODE_BITCOIN_SUPABASE_PROVIDER,
  BITCODE_BITCOIN_SUPABASE_SCOPES,
  readSupabaseClientReadiness,
} from './wallet-connection-format';

export async function ensureWalletBackedSession(providerId?: BitcoinWalletProviderId) {
  const supabaseReadiness = readSupabaseClientReadiness();
  if (!supabaseReadiness.ready) {
    return supabaseReadiness;
  }

  const supabase = createClient();
  try {
    // A hanging auth network call must not freeze the connect flow — the
    // buttons would sit in 'requesting' forever with zero feedback.
    const existing = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_resolve, reject) =>
        setTimeout(
          () => reject(new Error('Supabase session check timed out. Confirm the configured Supabase URL is reachable.')),
          8_000,
        ),
      ),
    ]);
    if (existing.data.user) {
      return { ready: true as const };
    }

    // Post-auth landing is /packs (ledgerized activity).
    const redirectTo = buildSupabaseAuthCallbackRedirect('/packs');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: BITCODE_BITCOIN_SUPABASE_PROVIDER as any,
      options: {
        redirectTo,
        scopes: BITCODE_BITCOIN_SUPABASE_SCOPES,
        // We navigate ourselves so a missing URL is a diagnosable error
        // instead of a silent no-op.
        skipBrowserRedirect: true,
        queryParams: {
          bitcode_wallet_provider: providerId ?? '',
          wallet_provider: providerId ?? '',
          bitcode_auth_surface: 'auxillaries_wallet',
        },
      },
    });

    if (error) {
      return {
        ready: false as const,
        error: `Supabase Bitcoin wallet auth failed: ${error.message}`,
      };
    }

    if (!data?.url) {
      return {
        ready: false as const,
        error:
          'Supabase did not return a Bitcoin authentication URL. The custom:bitcode-bitcoin provider may not be configured on the Supabase this environment points at.',
      };
    }

    bitcodeQaTelemetry('info', 'wallet-auxillary', 'oauth-redirect', { url: data.url });
    window.location.assign(data.url);
    return { ready: false as const, pendingRedirect: true as const, authorizeUrl: data.url };
  } catch (error) {
    return {
      ready: false as const,
      error: error instanceof Error ? error.message : 'Bitcode session creation failed.',
    };
  }
}
