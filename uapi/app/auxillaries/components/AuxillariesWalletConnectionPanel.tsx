"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { createClient } from '@bitcode/supabase/ssr/client';

import { mutateUserData } from '@/hooks/useUserData';
import {
  connectBitcoinWallet,
  inspectBitcoinWalletProviders,
  type BitcoinWalletConnection,
  type BitcoinWalletProviderId,
  type BitcoinWalletProviderSummary,
} from '@/lib/bitcoin-wallet-client';
import {
  clearLocalBitcodeWalletIdentity,
  isPlausibleBitcoinAddress,
  readLocalBitcodeWalletIdentity,
  writeLocalBitcodeWalletIdentity,
  type LocalBitcodeWalletIdentity,
} from '@/lib/bitcode-wallet-local';
import { bitcodeQaTelemetry, compactBitcodeAddress } from '@/lib/bitcode-qa-telemetry';
import { buildSupabaseAuthCallbackRedirect } from '@/lib/supabase-auth-redirect';

const BITCODE_BITCOIN_SUPABASE_PROVIDER = 'custom:bitcode-bitcoin';
const BITCODE_BITCOIN_SUPABASE_SCOPES = 'profile wallet:bitcoin';

function readSupabaseClientReadiness() {
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

function formatWalletProviderLabel(provider: string | null | undefined) {
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

function formatWalletReadout(value: string | null | undefined) {
  if (!value) return 'Not provided';
  if (value.length > 24) return compactBitcodeAddress(value, 8) ?? value;
  return value;
}

export interface AuxillariesWalletConnectionPanelProps {
  initialWalletAddress?: string | null;
  initialWalletProvider?: string | null;
  initialWalletBindingStatus?: 'pending' | 'manual' | 'verified' | null;
  initialWalletBoundAt?: string | null;
  onWalletIdentityChange?: (hasWalletIdentity: boolean) => void;
}

export default function AuxillariesWalletConnectionPanel({
  initialWalletAddress = '',
  initialWalletProvider = '',
  initialWalletBindingStatus = null,
  initialWalletBoundAt = null,
  onWalletIdentityChange,
}: AuxillariesWalletConnectionPanelProps) {
  const [walletAddress, setWalletAddress] = useState(initialWalletAddress || '');
  const [walletProvider, setWalletProvider] = useState(
    initialWalletProvider || (initialWalletAddress ? 'manual' : ''),
  );
  const [walletBindingStatus, setWalletBindingStatus] = useState<'pending' | 'manual' | 'verified' | null>(
    initialWalletBindingStatus ?? (initialWalletAddress ? 'manual' : null),
  );
  const [walletBoundAt, setWalletBoundAt] = useState<string | null>(initialWalletBoundAt ?? null);
  const [walletAuthError, setWalletAuthError] = useState<string | null>(null);
  const [walletAuthNotice, setWalletAuthNotice] = useState<string | null>(null);
  const [walletAuthStatus, setWalletAuthStatus] = useState<'idle' | 'requesting' | 'signed'>('idle');
  const walletAuthStatusRef = useRef(walletAuthStatus);
  useEffect(() => {
    walletAuthStatusRef.current = walletAuthStatus;
  }, [walletAuthStatus]);
  const [walletProviderOptions, setWalletProviderOptions] = useState<BitcoinWalletProviderSummary[]>([]);
  const [walletProviderScanStatus, setWalletProviderScanStatus] = useState<'checking' | 'ready' | 'none'>('checking');
  const [walletIdentityDetails, setWalletIdentityDetails] = useState<LocalBitcodeWalletIdentity | null>(() =>
    readLocalBitcodeWalletIdentity(),
  );
  const walletServerPersistenceRef = useRef<string | null>(null);
  const lastCompletionRef = useRef<boolean | null>(null);

  const hasWalletIdentity = Boolean(walletAddress && walletBindingStatus);
  const hasProviderWalletIdentity = Boolean(
    walletAddress && (walletBindingStatus === 'verified' || walletBindingStatus === 'pending'),
  );

  const walletReadout = useMemo(() => {
    const provider = walletIdentityDetails?.provider ?? walletProvider;
    return {
      providerLabel: formatWalletProviderLabel(provider),
      network: walletIdentityDetails?.network ?? null,
      proofKind: walletIdentityDetails?.proofKind ?? null,
      persistence: walletIdentityDetails?.persistence ?? null,
      paymentAddress: walletIdentityDetails?.paymentAddress ?? null,
      authAddress: (walletIdentityDetails?.authAddress ?? walletAddress) || null,
      addressType: walletIdentityDetails?.addressType ?? null,
    };
  }, [walletAddress, walletIdentityDetails, walletProvider]);

  useEffect(() => {
    setWalletAddress(initialWalletAddress || '');
    setWalletProvider(initialWalletProvider || (initialWalletAddress ? 'manual' : ''));
    setWalletBindingStatus(initialWalletBindingStatus ?? (initialWalletAddress ? 'manual' : null));
    setWalletBoundAt(initialWalletBoundAt ?? null);
    setWalletIdentityDetails((previous) => {
      if (previous?.address === initialWalletAddress) return previous;
      return readLocalBitcodeWalletIdentity();
    });
  }, [initialWalletAddress, initialWalletBindingStatus, initialWalletProvider, initialWalletBoundAt]);

  useEffect(() => {
    if (initialWalletAddress) return;
    const localWallet = readLocalBitcodeWalletIdentity();
    if (!localWallet) return;

    setWalletAddress(localWallet.address);
    setWalletProvider(localWallet.provider);
    setWalletBindingStatus(localWallet.status);
    setWalletBoundAt(localWallet.connectedAt);
    setWalletIdentityDetails(localWallet);
  }, [initialWalletAddress]);

  useEffect(() => {
    if (lastCompletionRef.current === hasWalletIdentity) return;
    lastCompletionRef.current = hasWalletIdentity;
    onWalletIdentityChange?.(hasWalletIdentity);
  }, [hasWalletIdentity, onWalletIdentityChange]);

  const refreshBitcoinWalletProviders = React.useCallback(async () => {
    setWalletProviderScanStatus('checking');
    try {
      const providers = await inspectBitcoinWalletProviders();
      setWalletProviderOptions(providers);
      setWalletProviderScanStatus(providers.length > 0 ? 'ready' : 'none');
      bitcodeQaTelemetry('info', 'wallet-auxillary', 'provider-scan', providers);
    } catch {
      setWalletProviderOptions([]);
      setWalletProviderScanStatus('none');
      bitcodeQaTelemetry('warn', 'wallet-auxillary', 'provider-scan-failed');
    }
  }, []);

  useEffect(() => {
    refreshBitcoinWalletProviders();
  }, [refreshBitcoinWalletProviders]);

  const ensureWalletBackedSession = async (providerId?: BitcoinWalletProviderId) => {
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

      // Post-auth landing is /packs (ledgerized activity), not the legacy
      // /terminal overlay route that buildAuxillariesRoutePath still targets.
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

      window.location.assign(data.url);
      return { ready: false as const, pendingRedirect: true as const };
    } catch (error) {
      return {
        ready: false as const,
        error: error instanceof Error ? error.message : 'Bitcode session creation failed.',
      };
    }
  };

  const handleStageBitcoinAddress = async () => {
    setWalletAuthError(null);
    const address = walletAddress.trim();
    if (!isPlausibleBitcoinAddress(address)) {
      setWalletAuthError('Enter a valid Bitcoin address before staging wallet identity.');
      return;
    }

    const connectedAt = new Date().toISOString();
    writeLocalBitcodeWalletIdentity({
      address,
      provider: 'manual-bitcoin',
      network: address.startsWith('bc1') ? 'mainnet' : address.startsWith('bcrt1') ? 'regtest' : 'testnet',
      status: 'manual',
      connectedAt,
      proofKind: 'manual_address',
      persistence: 'local',
    });
    setWalletIdentityDetails(readLocalBitcodeWalletIdentity());
    setWalletProvider('manual-bitcoin');
    setWalletBindingStatus('manual');
    setWalletBoundAt(connectedAt);
    setWalletAuthStatus('signed');
    bitcodeQaTelemetry('info', 'wallet-auxillary', 'manual-stage', {
      address: compactBitcodeAddress(address),
    });
    await mutateUserData();
  };

  const persistBitcoinWalletConnection = async (connection: BitcoinWalletConnection) => {
    const response = await fetch('/api/wallet/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: connection.address,
        provider: connection.provider,
        network: connection.network,
        message: connection.message,
        signature: connection.signature,
        proofKind: connection.proofKind,
        paymentAddress: connection.paymentAddress,
        authAddress: connection.authAddress,
        addressType: connection.addressType,
        connectedAt: connection.connectedAt,
        issuedAt: connection.connectedAt,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setWalletAuthError(
        typeof payload?.error === 'string'
          ? `Bitcoin wallet connected locally; server persistence is pending: ${payload.error}`
          : 'Bitcoin wallet connected locally; server persistence is pending.',
      );
      bitcodeQaTelemetry('warn', 'wallet-auxillary', 'server-persistence-pending', {
        provider: connection.provider,
        status: response.status,
        error: typeof payload?.error === 'string' ? payload.error : null,
      });
      return false;
    }

    const savedAddress = typeof payload?.walletConnectionStatus?.address === 'string'
      ? payload.walletConnectionStatus.address
      : connection.address;
    const savedAt = typeof payload?.walletConnectionStatus?.metadata?.connectedAt === 'string'
      ? payload.walletConnectionStatus.metadata.connectedAt
      : connection.connectedAt;
    const savedStatus =
      payload?.walletConnectionStatus?.verificationState === 'verified'
        ? 'verified'
        : payload?.walletConnectionStatus?.verificationState === 'manual'
          ? 'manual'
          : 'pending';

    writeLocalBitcodeWalletIdentity({
      address: savedAddress,
      provider: connection.provider,
      network: connection.network,
      status: savedStatus,
      connectedAt: savedAt,
      proofKind: connection.proofKind,
      paymentAddress: connection.paymentAddress,
      authAddress: connection.authAddress,
      addressType: connection.addressType,
      message: connection.message,
      signature: connection.signature,
      persistence: 'server',
    });
    setWalletIdentityDetails(readLocalBitcodeWalletIdentity());
    setWalletAddress(savedAddress);
    setWalletProvider(connection.provider);
    setWalletBindingStatus(savedStatus);
    setWalletBoundAt(savedAt);
    setWalletAuthNotice(`${connection.providerLabel} wallet identity saved for Bitcode.`);
    bitcodeQaTelemetry('info', 'wallet-auxillary', 'server-persisted', {
      provider: connection.provider,
      status: savedStatus,
      address: compactBitcodeAddress(savedAddress),
    });
    return true;
  };

  useEffect(() => {
    const identity = walletIdentityDetails ?? readLocalBitcodeWalletIdentity();
    if (!identity || identity.persistence === 'server') return;
    if (identity.proofKind !== 'bitcoin_message_signature' || !identity.signature || !identity.message) return;

    const persistenceKey = `${identity.provider}:${identity.address}:${identity.signature}`;
    if (walletServerPersistenceRef.current === persistenceKey) return;
    walletServerPersistenceRef.current = persistenceKey;

    let cancelled = false;
    (async () => {
      const readiness = readSupabaseClientReadiness();
      if (!readiness.ready || cancelled) return;

      const supabase = createClient();
      const existing = await supabase.auth.getUser();
      if (!existing.data.user || cancelled) return;

      await persistBitcoinWalletConnection({
        address: identity.address,
        provider: identity.provider,
        providerLabel: formatWalletProviderLabel(identity.provider),
        network: identity.network,
        paymentAddress: identity.paymentAddress,
        authAddress: identity.authAddress,
        addressType: identity.addressType,
        message: identity.message ?? '',
        signature: identity.signature ?? null,
        connectedAt: identity.connectedAt,
        proofKind: 'bitcoin_message_signature',
      });
      if (!cancelled) {
        await mutateUserData();
      }
    })().catch((error) => {
      if (cancelled) return;
      bitcodeQaTelemetry('warn', 'wallet-auxillary', 'oauth-session-persistence-pending', {
        message: error instanceof Error ? error.message : 'unknown',
      });
    });

    return () => {
      cancelled = true;
    };
  }, [walletIdentityDetails]);

  const handleConnectBitcoinWallet = async (providerId?: BitcoinWalletProviderId) => {
    setWalletAuthError(null);
    const providerLabel =
      walletProviderOptions.find((provider) => provider.id === providerId)?.label ??
      (providerId ? providerId : 'first available Bitcoin wallet');
    setWalletAuthNotice(
      `Preparing ${providerLabel}. Supabase will open Bitcode Bitcoin authentication, then the wallet will ask for a signed Bitcode message.`,
    );
    setWalletAuthStatus('requesting');
    bitcodeQaTelemetry('info', 'wallet-auxillary', 'connect-request', {
      provider: providerId ?? 'first-available',
    });

    try {
      const sessionReadiness = await ensureWalletBackedSession(providerId);
      if (!sessionReadiness.ready) {
        if ('pendingRedirect' in sessionReadiness && sessionReadiness.pendingRedirect) {
          setWalletAuthNotice('Opening Bitcode Bitcoin authentication with Supabase.');
          window.setTimeout(() => {
            if (walletAuthStatusRef.current !== 'requesting') return;
            setWalletAuthStatus('idle');
            setWalletAuthNotice(null);
            setWalletAuthError(
              'The Supabase Bitcoin authentication page did not open. Check redirect blocking and that the Supabase this environment points at has the custom:bitcode-bitcoin provider configured, then retry.',
            );
            bitcodeQaTelemetry('warn', 'wallet-auxillary', 'oauth-redirect-stalled');
          }, 8_000);
          return;
        }
        setWalletAuthStatus('idle');
        setWalletAuthError(
          `Bitcoin wallet authentication cannot establish the Supabase session yet: ${sessionReadiness.error}`,
        );
        bitcodeQaTelemetry('warn', 'wallet-auxillary', 'session-persistence-unavailable', {
          reason: sessionReadiness.error,
        });
        return;
      }

      const connection = await connectBitcoinWallet(providerId);
      setWalletAuthNotice(`${connection.providerLabel} signed wallet proof. Staging Bitcode wallet identity.`);
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
      setWalletIdentityDetails(readLocalBitcodeWalletIdentity());
      setWalletAddress(connection.address);
      setWalletProvider(connection.provider);
      setWalletBindingStatus('pending');
      setWalletBoundAt(connection.connectedAt);
      bitcodeQaTelemetry('info', 'wallet-auxillary', 'connect-local-staged', {
        provider: connection.provider,
        network: connection.network,
        proofKind: connection.proofKind,
        address: compactBitcodeAddress(connection.address),
        paymentAddress: compactBitcodeAddress(connection.paymentAddress),
        authAddress: compactBitcodeAddress(connection.authAddress),
      });

      await persistBitcoinWalletConnection(connection);
      setWalletAuthStatus('signed');
      await mutateUserData();
    } catch (error) {
      setWalletAuthStatus('idle');
      setWalletAuthNotice(null);
      setWalletAuthError(error instanceof Error ? error.message : 'Bitcoin wallet connection was cancelled or failed.');
      bitcodeQaTelemetry('warn', 'wallet-auxillary', 'connect-failed', {
        provider: providerId ?? 'first-available',
        message: error instanceof Error ? error.message : 'unknown',
      });
      await refreshBitcoinWalletProviders();
    }
  };

  const handleDisconnectWallet = async () => {
    clearLocalBitcodeWalletIdentity();
    setWalletAddress('');
    setWalletProvider('');
    setWalletBindingStatus(null);
    setWalletBoundAt(null);
    setWalletIdentityDetails(null);
    setWalletAuthStatus('idle');
    setWalletAuthError(null);
    setWalletAuthNotice(
      'Bitcode wallet identity cleared. Leather or Xverse may still show this site as connected until you revoke it inside the wallet extension.',
    );
    onWalletIdentityChange?.(false);
    bitcodeQaTelemetry('info', 'wallet-auxillary', 'disconnect-local');

    try {
      const readiness = readSupabaseClientReadiness();
      if (readiness.ready) {
        await createClient().auth.signOut();
      }
    } catch (error) {
      bitcodeQaTelemetry('warn', 'wallet-auxillary', 'disconnect-signout-failed', {
        message: error instanceof Error ? error.message : 'unknown',
      });
    }

    await mutateUserData();
  };

  return (
    <section
      className="orbital-section mb-5"
      style={{
        background: 'linear-gradient(145deg, rgba(42, 25, 11, 0.86), rgba(14, 22, 36, 0.86))',
        border: hasWalletIdentity
          ? '1px solid rgba(103, 254, 183, 0.34)'
          : '1px solid rgba(251, 146, 60, 0.36)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 18px 44px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-100/76">
            1. Required wallet
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">Connect Bitcoin wallet</h3>
          <p className="mt-2 max-w-[48rem] text-sm leading-7 text-white/70">
            Wallet connection is the first Bitcode identity action. It binds the operator address
            for BTC fee readiness, BTD read-right posture, and signed proof continuity. Ethereum
            account prompts are not used for this step.
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            hasWalletIdentity
              ? 'border-emerald-300/26 bg-emerald-400/12 text-emerald-100'
              : 'border-orange-300/26 bg-orange-400/12 text-orange-100'
          }`}
        >
          {hasWalletIdentity ? 'Connected' : 'Required first'}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {walletProviderOptions.length > 0 ? (
          walletProviderOptions.map((provider) => (
            <button
              key={provider.id}
              type="button"
              data-testid={`wallet-connect-${provider.id}`}
              onClick={() => handleConnectBitcoinWallet(provider.id)}
              disabled={walletAuthStatus === 'requesting'}
              className="inline-flex items-center justify-center rounded-full border border-orange-300/34 bg-orange-400/14 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-50 transition hover:border-orange-300/54 hover:bg-orange-400/22 disabled:cursor-wait disabled:opacity-60"
            >
              {walletAuthStatus === 'requesting'
                ? `Opening ${provider.label}`
                : hasProviderWalletIdentity
                  ? `Reconnect ${provider.label}`
                  : `Connect ${provider.label}`}
            </button>
          ))
        ) : (
          <button
            type="button"
            data-testid="wallet-connect-bitcoin-wallet"
            onClick={() => handleConnectBitcoinWallet()}
            disabled={walletAuthStatus === 'requesting'}
            className="inline-flex items-center justify-center rounded-full border border-orange-300/34 bg-orange-400/14 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-50 transition hover:border-orange-300/54 hover:bg-orange-400/22 disabled:cursor-wait disabled:opacity-60"
          >
            {walletAuthStatus === 'requesting'
              ? 'Opening Bitcoin wallet'
              : hasProviderWalletIdentity
                ? 'Reconnect Bitcoin wallet'
                : 'Connect Bitcoin wallet'}
          </button>
        )}
        <button
          type="button"
          onClick={refreshBitcoinWalletProviders}
          disabled={walletAuthStatus === 'requesting'}
          className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/66 transition hover:border-white/24 hover:bg-white/10 disabled:cursor-wait disabled:opacity-45"
        >
          Rescan wallets
        </button>
        {hasWalletIdentity ? (
          <button
            type="button"
            data-testid="wallet-disconnect-bitcode"
            onClick={handleDisconnectWallet}
            disabled={walletAuthStatus === 'requesting'}
            className="inline-flex items-center justify-center rounded-full border border-rose-300/24 bg-rose-400/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100 transition hover:border-rose-300/42 hover:bg-rose-400/18 disabled:cursor-wait disabled:opacity-45"
          >
            Disconnect wallet
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleStageBitcoinAddress}
          disabled={walletAuthStatus === 'requesting' || !walletAddress.trim()}
          className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/7 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/76 transition hover:border-white/24 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Stage Bitcoin address
        </button>
      </div>
      {walletAuthError ? (
        <p
          role="alert"
          className="mt-3 border border-amber-300/24 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100"
        >
          {walletAuthError}
        </p>
      ) : null}
      <div className="mt-3 rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm leading-6 text-white/68">
        <span className="font-semibold text-white/82">
          {walletProviderScanStatus === 'checking'
            ? 'Checking installed Bitcoin wallets'
            : walletProviderOptions.length > 0
              ? `Detected ${walletProviderOptions.map((provider) => provider.label).join(', ')}`
              : 'No compatible Bitcoin wallet detected'}
        </span>
        {walletAuthNotice ? (
          <span className="ml-2 text-orange-100/82">{walletAuthNotice}</span>
        ) : walletProviderScanStatus === 'none' ? (
          <span className="ml-2">
            Xverse or Leather must be unlocked, enabled on this site, and set to Testnet4 for this QA pass.
          </span>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 tablet:grid-cols-[1fr_0.95fr]">
        <div className="orbitals-users-input-container enterprise">
          <input
            data-testid="wallet-address-input"
            id="walletAddress"
            type="text"
            value={walletAddress}
            onChange={(e) => {
              const nextValue = e.target.value;
              setWalletAddress(nextValue);
              setWalletBindingStatus(nextValue.trim() ? 'manual' : null);
              setWalletProvider(nextValue.trim() ? 'manual-bitcoin' : '');
              setWalletBoundAt(null);
            }}
            className="form-input"
            placeholder="Bitcoin address appears here after wallet connection"
            aria-label="Bitcode Bitcoin wallet address"
          />
          <div className="input-focus-indicator"></div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
            Current wallet state
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {walletAddress
              ? walletBindingStatus === 'verified'
                ? 'Verified Bitcoin signer'
                : walletBindingStatus === 'pending'
                  ? 'Bitcoin provider connected'
                  : 'Manual Bitcoin address staged'
              : 'No Bitcoin wallet connected'}
          </p>
          {walletBoundAt ? (
            <p className="mt-1 text-xs text-white/54">
              Bound {new Date(walletBoundAt).toLocaleString()}
            </p>
          ) : null}
          <dl className="mt-3 grid gap-2 text-xs leading-5 text-white/66">
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Provider</dt>
              <dd className="min-w-0 break-words text-white/86">{walletReadout.providerLabel}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Network</dt>
              <dd className="min-w-0 break-words text-white/80">{walletReadout.network ?? 'Not provided'}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Auth address</dt>
              <dd className="min-w-0 break-all text-white/80">{formatWalletReadout(walletReadout.authAddress)}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Payment</dt>
              <dd className="min-w-0 break-all text-white/80">{formatWalletReadout(walletReadout.paymentAddress)}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Address type</dt>
              <dd className="min-w-0 break-words text-white/80">{walletReadout.addressType ?? 'Not provided'}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Proof</dt>
              <dd className="min-w-0 break-words text-white/80">{walletReadout.proofKind ?? 'Not provided'}</dd>
            </div>
            <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] gap-2">
              <dt className="text-white/42">Persistence</dt>
              <dd className="min-w-0 break-words text-white/80">{walletReadout.persistence ?? 'wallet'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
