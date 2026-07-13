'use client';

import React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  connectBitcoinWallet,
  inspectBitcoinWalletProviders,
  type BitcoinWalletProviderId,
  type BitcoinWalletProviderSummary,
} from '@bitcode/auth/bitcoin-wallet-client';
import { writeLocalBitcodeWalletIdentity } from '@bitcode/auth/wallet-local';
import { bitcodeQaTelemetry, compactBitcodeAddress } from '@bitcode/auth/qa-telemetry';

type BitcoinWalletAuthorizeClientProps = {
  clientId: string;
  redirectUri: string;
  responseType: string;
  state: string;
  scope: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  walletProviderHint: string;
};

const supportedHints = new Set(['xverse', 'leather', 'unisat', 'okx-bitcoin']);
const providerLabels: Record<BitcoinWalletProviderId, string> = {
  xverse: 'Xverse',
  leather: 'Leather',
  unisat: 'UniSat',
  'okx-bitcoin': 'OKX Bitcoin',
};
const providerScanRetryDelays = [0, 250, 1000, 2500] as const;

function normalizeProviderHint(value: string): BitcoinWalletProviderId | undefined {
  const normalized = value.trim().toLowerCase();
  return supportedHints.has(normalized) ? (normalized as BitcoinWalletProviderId) : undefined;
}

function buildRedirect(redirectUri: string, code: string, state: string) {
  const url = new URL(redirectUri);
  url.searchParams.set('code', code);
  if (state) url.searchParams.set('state', state);
  return url.toString();
}

export default function BitcoinWalletAuthorizeClient({
  clientId,
  redirectUri,
  responseType,
  state,
  scope,
  codeChallenge,
  codeChallengeMethod,
  walletProviderHint,
}: BitcoinWalletAuthorizeClientProps) {
  const [providers, setProviders] = useState<BitcoinWalletProviderSummary[]>([]);
  const [scanState, setScanState] = useState<'checking' | 'ready' | 'none'>('checking');
  const [status, setStatus] = useState<'idle' | 'requesting' | 'redirecting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const latestProvidersRef = useRef<BitcoinWalletProviderSummary[]>([]);

  const preferredProvider = useMemo(() => normalizeProviderHint(walletProviderHint), [walletProviderHint]);
  const hasRequiredParams = Boolean(clientId && redirectUri && (!responseType || responseType === 'code'));

  const scanProviders = useCallback(async (reason: string) => {
    if (reason === 'manual' || latestProvidersRef.current.length === 0) {
      setScanState('checking');
    }
    try {
      const detected = await inspectBitcoinWalletProviders();
      if (!mountedRef.current) return;
      const nextProviders = detected.length > 0 ? detected : latestProvidersRef.current;
      latestProvidersRef.current = nextProviders;
      setProviders(nextProviders);
      setScanState(nextProviders.length > 0 ? 'ready' : 'none');
      bitcodeQaTelemetry('info', 'wallet-oauth', 'provider-scan', {
        reason,
        detected,
        retained: detected.length === 0 && nextProviders.length > 0,
      });
    } catch (scanError) {
      if (!mountedRef.current) return;
      setProviders(latestProvidersRef.current);
      setScanState(latestProvidersRef.current.length > 0 ? 'ready' : 'none');
      bitcodeQaTelemetry('warn', 'wallet-oauth', 'provider-scan-failed', {
        reason,
        message: scanError instanceof Error ? scanError.message : 'unknown',
      });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const timers = providerScanRetryDelays.map((delay) =>
      window.setTimeout(() => {
        void scanProviders(delay === 0 ? 'mount' : `retry-${delay}ms`);
      }, delay),
    );
    return () => {
      mountedRef.current = false;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [scanProviders]);

  const authorize = async (providerId?: BitcoinWalletProviderId) => {
    setError(null);
    if (!hasRequiredParams) {
      setError('Bitcode Bitcoin wallet authorization is missing OAuth client or callback parameters.');
      return;
    }

    setStatus('requesting');
    try {
      const connection = await connectBitcoinWallet(providerId);
      writeLocalBitcodeWalletIdentity({
        address: connection.address,
        provider: connection.provider,
        network: connection.network,
        status: 'pending',
        connectedAt: connection.connectedAt,
        proofKind: connection.proofKind,
        paymentAddress: connection.paymentAddress,
        authAddress: connection.authAddress,
        addressType: connection.addressType,
        message: connection.message,
        signature: connection.signature,
        persistence: 'local',
      });

      bitcodeQaTelemetry('info', 'wallet-oauth', 'proof-captured', {
        provider: connection.provider,
        proofKind: connection.proofKind,
        address: compactBitcodeAddress(connection.address),
      });

      const response = await fetch('/api/wallet/oauth/authorization-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oauth: {
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
            code_challenge: codeChallenge,
            code_challenge_method: codeChallengeMethod,
          },
          wallet: connection,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || typeof payload?.code !== 'string') {
        throw new Error(
          typeof payload?.error === 'string'
            ? payload.error
            : 'Bitcode could not create a Bitcoin wallet authorization code.',
        );
      }

      setStatus('redirecting');
      window.location.assign(buildRedirect(redirectUri, payload.code, state));
    } catch (authorizeError) {
      setStatus('idle');
      setError(
        authorizeError instanceof Error
          ? authorizeError.message
          : 'Bitcoin wallet authorization was cancelled or failed.',
      );
      bitcodeQaTelemetry('warn', 'wallet-oauth', 'authorize-failed', {
        provider: providerId ?? preferredProvider ?? 'first-available',
        message: authorizeError instanceof Error ? authorizeError.message : 'unknown',
      });
    }
  };

  const orderedProviders = useMemo(() => {
    if (!preferredProvider) return providers;
    const preferred = providers.find((provider) => provider.id === preferredProvider);
    if (!preferred) return providers;
    return [preferred, ...providers.filter((provider) => provider.id !== preferredProvider)];
  }, [preferredProvider, providers]);

  const fallbackProviderLabel = preferredProvider ? providerLabels[preferredProvider] : 'Bitcoin wallet';

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-100/70">
          Bitcode Bitcoin authentication
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight tablet:text-5xl">
          Sign a Bitcoin wallet proof
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 tablet:text-base">
          Supabase is asking Bitcode to authenticate this session through a Bitcoin wallet. Choose a
          Bitcoin-capable wallet, approve address sharing, and sign the Bitcode challenge. Ethereum and
          Solana providers are not used for this identity path.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/52">
                Wallet providers
              </p>
              <p className="mt-2 text-sm text-white/70">
                {scanState === 'checking'
                  ? 'Checking installed Bitcoin wallets...'
                  : orderedProviders.length > 0
                    ? `Detected ${orderedProviders.map((provider) => provider.label).join(', ')}`
                    : 'No compatible Bitcoin wallet provider was detected.'}
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/24 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
              Signed wallet
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {orderedProviders.length > 0 ? (
              orderedProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => authorize(provider.id)}
                  disabled={status !== 'idle'}
                  className="inline-flex items-center justify-center rounded-full border border-orange-300/34 bg-orange-400/14 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-50 transition hover:border-orange-300/54 hover:bg-orange-400/22 disabled:cursor-wait disabled:opacity-60"
                >
                  {status === 'requesting' ? `Opening ${provider.label}` : `Continue with ${provider.label}`}
                </button>
              ))
            ) : (
              <button
                type="button"
                onClick={() => authorize(preferredProvider)}
                disabled={status !== 'idle'}
                className="inline-flex items-center justify-center rounded-full border border-orange-300/34 bg-orange-400/14 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-50 transition hover:border-orange-300/54 hover:bg-orange-400/22 disabled:cursor-wait disabled:opacity-60"
              >
                {status === 'requesting'
                  ? `Opening ${fallbackProviderLabel}`
                  : `Continue with ${fallbackProviderLabel}`}
              </button>
            )}
            <button
              type="button"
              onClick={() => scanProviders('manual')}
              disabled={status !== 'idle' || scanState === 'checking'}
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/66 transition hover:border-white/24 hover:bg-white/10 disabled:cursor-wait disabled:opacity-45"
            >
              {scanState === 'checking' ? 'Scanning wallets' : 'Rescan wallets'}
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-amber-300/24 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
              {error}
            </p>
          ) : null}
          {status === 'redirecting' ? (
            <p className="mt-4 text-sm leading-6 text-emerald-100/82">
              Bitcoin wallet proof captured. Returning to Supabase to establish your Bitcode session.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
