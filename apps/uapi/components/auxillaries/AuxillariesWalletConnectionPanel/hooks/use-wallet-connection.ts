/**
 * Bitcoin wallet connection lifecycle: provider scan, OAuth session, local
 * staging, server persistence, and disconnect. UI stays in the panel entry.
 */

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClientContext } from '@tanstack/react-query';

import { createClient } from '@bitcode/supabase/ssr/client';

import { clearAuthQueries, updateCachedUser } from '@/hooks/use-auth-query';
import { clearUserDataIdentity, mutateUserData } from '@/hooks/useUserData';
import {
  connectBitcoinWallet,
  inspectBitcoinWalletProviders,
  type BitcoinWalletProviderId,
  type BitcoinWalletProviderSummary,
} from '@bitcode/auth/bitcoin-wallet-client';
import {
  clearLocalBitcodeWalletIdentity,
  isPlausibleBitcoinAddress,
  readLocalBitcodeWalletIdentity,
  writeLocalBitcodeWalletIdentity,
  type LocalBitcodeWalletIdentity,
} from '@bitcode/auth/wallet-local';
import { bitcodeQaTelemetry, compactBitcodeAddress } from '@bitcode/auth/qa-telemetry';

import { formatWalletProviderLabel, readSupabaseClientReadiness } from '../models/wallet-connection-format';
import { persistBitcoinWalletConnection } from '../models/wallet-connection-persist';
import { ensureWalletBackedSession } from '../models/wallet-connection-session';

export interface UseWalletConnectionArgs {
  initialWalletAddress?: string | null;
  initialWalletProvider?: string | null;
  initialWalletBindingStatus?: 'pending' | 'manual' | 'verified' | null;
  initialWalletBoundAt?: string | null;
  onWalletIdentityChange?: (hasWalletIdentity: boolean) => void;
}

export function useWalletConnection({
  initialWalletAddress = '',
  initialWalletProvider = '',
  initialWalletBindingStatus = null,
  initialWalletBoundAt = null,
  onWalletIdentityChange,
}: UseWalletConnectionArgs) {
  // Optional: panel tests render without QueryClientProvider.
  const queryClient = useContext(QueryClientContext);
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
  const [pendingAuthorizeUrl, setPendingAuthorizeUrl] = useState<string | null>(null);
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

  const refreshBitcoinWalletProviders = useCallback(async () => {
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

  const applyPersistedConnection = async (
    connection: Parameters<typeof persistBitcoinWalletConnection>[0],
  ) => {
    const result = await persistBitcoinWalletConnection(connection);
    if (!result.ok) {
      setWalletAuthError(result.errorMessage ?? 'Bitcoin wallet connected locally; server persistence is pending.');
      return false;
    }
    setWalletIdentityDetails(result.identity ?? readLocalBitcodeWalletIdentity());
    if (result.savedAddress) setWalletAddress(result.savedAddress);
    setWalletProvider(connection.provider);
    if (result.savedStatus) setWalletBindingStatus(result.savedStatus);
    if (result.savedAt) setWalletBoundAt(result.savedAt);
    setWalletAuthNotice(`${connection.providerLabel} wallet identity saved for Bitcode.`);
    return true;
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

      await applyPersistedConnection({
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
    setPendingAuthorizeUrl(null);
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
            setPendingAuthorizeUrl(sessionReadiness.authorizeUrl ?? null);
            setWalletAuthError(
              'The Supabase Bitcoin authentication redirect has not completed — the request never left this page. Continue manually below, and check the [Bitcode QA] console trace (?bitcode_verbose=true) for the exact redirect target.',
            );
            bitcodeQaTelemetry('warn', 'wallet-auxillary', 'oauth-redirect-stalled', {
              url: sessionReadiness.authorizeUrl ?? null,
            });
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

      await applyPersistedConnection(connection);
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
    /*
     * Full identity clear (same posture as chrome Disconnect): local wallet,
     * shared user-data, React Query auth, then Supabase signOut so the
     * Auxillaries chrome returns to Connect — not a half-cleared Disconnect.
     */
    clearLocalBitcodeWalletIdentity();
    clearUserDataIdentity();
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

    if (queryClient) {
      await queryClient.cancelQueries({ queryKey: ['auth'] });
      updateCachedUser(queryClient, null);
    }

    try {
      const readiness = readSupabaseClientReadiness();
      if (readiness.ready) {
        await createClient().auth.signOut({ scope: 'local' });
      }
    } catch (error) {
      bitcodeQaTelemetry('warn', 'wallet-auxillary', 'disconnect-signout-failed', {
        message: error instanceof Error ? error.message : 'unknown',
      });
    } finally {
      if (queryClient) {
        updateCachedUser(queryClient, null);
        clearAuthQueries(queryClient);
      }
      await mutateUserData();
    }
  };

  const handleWalletAddressChange = (nextValue: string) => {
    setWalletAddress(nextValue);
    setWalletBindingStatus(nextValue.trim() ? 'manual' : null);
    setWalletProvider(nextValue.trim() ? 'manual-bitcoin' : '');
    setWalletBoundAt(null);
  };

  return {
    walletAddress,
    walletBindingStatus,
    walletBoundAt,
    walletAuthError,
    walletAuthNotice,
    walletAuthStatus,
    pendingAuthorizeUrl,
    walletProviderOptions,
    walletProviderScanStatus,
    walletReadout,
    hasWalletIdentity,
    hasProviderWalletIdentity,
    refreshBitcoinWalletProviders,
    handleStageBitcoinAddress,
    handleConnectBitcoinWallet,
    handleDisconnectWallet,
    handleWalletAddressChange,
  };
}
