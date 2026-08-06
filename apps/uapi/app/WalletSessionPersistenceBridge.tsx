"use client";

import { useEffect, useRef } from 'react';

import { createClient } from '@bitcode/supabase/ssr/client';

import { mutateUserData } from '@/hooks/useUserData';
import {
  BITCODE_LOCAL_WALLET_EVENT,
  readLocalBitcodeWalletIdentity,
  writeLocalBitcodeWalletIdentity,
  type BitcodeWalletBindingStatus,
  type LocalBitcodeWalletIdentity,
} from '@bitcode/auth/wallet-local';
import { bitcodeQaTelemetry, compactBitcodeAddress } from '@bitcode/auth/qa-telemetry';

function canPersistWalletIdentity(identity: LocalBitcodeWalletIdentity | null): identity is LocalBitcodeWalletIdentity {
  return Boolean(
    identity &&
      identity.persistence !== 'server' &&
      (identity.proofKind === 'bitcoin_message_signature' ||
        identity.proofKind === 'ethereum_personal_sign') &&
      identity.message &&
      identity.signature,
  );
}

function readPersistedStatus(payload: unknown, fallback: BitcodeWalletBindingStatus): BitcodeWalletBindingStatus {
  const status = (payload as any)?.walletConnectionStatus?.verificationState;
  return status === 'verified' || status === 'manual' || status === 'pending' ? status : fallback;
}

function readPersistedAt(payload: unknown, fallback: string) {
  const connectedAt = (payload as any)?.walletConnectionStatus?.metadata?.connectedAt;
  return typeof connectedAt === 'string' && connectedAt.trim() ? connectedAt.trim() : fallback;
}

export default function WalletSessionPersistenceBridge() {
  const inFlightKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Canonical wallet connect signs on the OAuth provider authorize page, so
    // nothing is staged locally to replay. Ask the server to derive the
    // binding from the session's GoTrue-verified Bitcoin identity instead.
    const persistOAuthIdentityBinding = async (
      reason: string,
      localIdentity: LocalBitcodeWalletIdentity | null,
    ) => {
      if (localIdentity?.persistence === 'server') return;

      try {
        const supabase = createClient();
        const existing = await supabase.auth.getUser();
        const user = existing.data.user;
        if (cancelled || !user) return;

        const hasBitcoinIdentity = (user.identities ?? []).some(
          (entry: { provider?: string }) => entry?.provider === 'custom:bitcode-bitcoin',
        );
        if (!hasBitcoinIdentity) return;

        const persistenceKey = `oauth-identity:${user.id}`;
        if (inFlightKeyRef.current === persistenceKey) return;
        inFlightKeyRef.current = persistenceKey;

        bitcodeQaTelemetry('info', 'wallet-session', 'oauth-identity-bind-start', { reason });

        const response = await fetch('/api/wallet/authenticate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'oauth-identity', proofKind: 'provider_session' }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          inFlightKeyRef.current = null;
          bitcodeQaTelemetry('warn', 'wallet-session', 'oauth-identity-bind-failed', {
            status: response.status,
            error: typeof (payload as any)?.error === 'string' ? (payload as any).error : null,
          });
          return;
        }

        if (cancelled) return;

        const status = (payload as any)?.walletConnectionStatus ?? null;
        const address = typeof status?.address === 'string' ? status.address : null;
        const provider = typeof status?.provider === 'string' ? status.provider : null;
        if (address && provider) {
          writeLocalBitcodeWalletIdentity({
            address,
            provider,
            network: typeof status?.network === 'string' ? status.network : null,
            status: readPersistedStatus(payload, 'pending'),
            connectedAt: readPersistedAt(payload, new Date().toISOString()),
            proofKind: 'provider_session',
            paymentAddress: null,
            authAddress: address,
            persistence: 'server',
          });
        }
        await mutateUserData();
        bitcodeQaTelemetry('info', 'wallet-session', 'oauth-identity-bind-success', {
          reason,
          address: compactBitcodeAddress(address),
        });
      } catch (error) {
        inFlightKeyRef.current = null;
        bitcodeQaTelemetry('warn', 'wallet-session', 'oauth-identity-bind-error', {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };

    const persistLocalWalletIdentity = async (reason: string) => {
      const identity = readLocalBitcodeWalletIdentity();
      if (!canPersistWalletIdentity(identity)) {
        await persistOAuthIdentityBinding(reason, identity);
        return;
      }

      const persistenceKey = `${identity.provider}:${identity.address}:${identity.signature}`;
      if (inFlightKeyRef.current === persistenceKey) return;
      inFlightKeyRef.current = persistenceKey;

      try {
        // Ethereum proofs can mint a session; Bitcoin still requires one first.
        if (identity.proofKind === 'ethereum_personal_sign') {
          bitcodeQaTelemetry('info', 'wallet-session', 'ethereum-persist-start', {
            reason,
            provider: identity.provider,
            address: compactBitcodeAddress(identity.address),
          });
          const response = await fetch('/api/wallet/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
              address: identity.address,
              provider: identity.provider,
              network: identity.network ?? 'sepolia',
              message: identity.message,
              signature: identity.signature,
              proofKind: 'ethereum_personal_sign',
              paymentAddress: identity.paymentAddress ?? identity.address,
              authAddress: identity.authAddress ?? identity.address,
              addressType: 'ethereum',
              connectedAt: identity.connectedAt,
              issuedAt: identity.connectedAt,
            }),
          });
          const payload = await response.json().catch(() => null);
          if (!response.ok) {
            inFlightKeyRef.current = null;
            bitcodeQaTelemetry('warn', 'wallet-session', 'ethereum-persist-failed', {
              status: response.status,
              error: typeof payload?.error === 'string' ? payload.error : null,
            });
            return;
          }
          const session = payload?.session;
          if (
            !session ||
            typeof session.access_token !== 'string' ||
            typeof session.refresh_token !== 'string'
          ) {
            inFlightKeyRef.current = null;
            bitcodeQaTelemetry('warn', 'wallet-session', 'ethereum-session-tokens-missing', {
              sessionSwitched: payload?.sessionSwitched ?? null,
            });
            return;
          }
          const supabase = createClient();
          const { error: setError } = await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
          if (setError) {
            inFlightKeyRef.current = null;
            bitcodeQaTelemetry('warn', 'wallet-session', 'ethereum-set-session-failed', {
              message: setError.message,
            });
            return;
          }
          if (cancelled) return;
          writeLocalBitcodeWalletIdentity({
            ...identity,
            status: readPersistedStatus(payload, identity.status),
            connectedAt: readPersistedAt(payload, identity.connectedAt),
            persistence: 'server',
          });
          await mutateUserData();
          // Retry staged GitHub App claim once the session exists.
          void fetch('/api/vcs/github/connection', { credentials: 'same-origin' }).catch(() => null);
          bitcodeQaTelemetry('info', 'wallet-session', 'ethereum-persist-success', {
            provider: identity.provider,
            address: compactBitcodeAddress(identity.address),
            sessionSwitched: payload?.sessionSwitched === true,
            canonicalUserId:
              typeof payload?.canonicalUserId === 'string'
                ? payload.canonicalUserId.slice(0, 8)
                : null,
          });
          return;
        }

        const supabase = createClient();
        const existing = await supabase.auth.getUser();
        if (cancelled || !existing.data.user) {
          inFlightKeyRef.current = null;
          return;
        }

        bitcodeQaTelemetry('info', 'wallet-session', 'persist-start', {
          reason,
          provider: identity.provider,
          address: compactBitcodeAddress(identity.address),
        });

        const response = await fetch('/api/wallet/authenticate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: identity.address,
            provider: identity.provider,
            network: identity.network,
            message: identity.message,
            signature: identity.signature,
            proofKind: identity.proofKind,
            paymentAddress: identity.paymentAddress,
            authAddress: identity.authAddress,
            addressType: identity.addressType,
            connectedAt: identity.connectedAt,
            issuedAt: identity.connectedAt,
          }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          inFlightKeyRef.current = null;
          bitcodeQaTelemetry('warn', 'wallet-session', 'persist-failed', {
            status: response.status,
            error: typeof payload?.error === 'string' ? payload.error : null,
          });
          return;
        }

        if (cancelled) return;

        writeLocalBitcodeWalletIdentity({
          ...identity,
          status: readPersistedStatus(payload, identity.status),
          connectedAt: readPersistedAt(payload, identity.connectedAt),
          persistence: 'server',
        });
        await mutateUserData();
        bitcodeQaTelemetry('info', 'wallet-session', 'persist-success', {
          provider: identity.provider,
          address: compactBitcodeAddress(identity.address),
        });
      } catch (error) {
        inFlightKeyRef.current = null;
        bitcodeQaTelemetry('warn', 'wallet-session', 'persist-error', {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };

    void persistLocalWalletIdentity('mount');

    const handleWalletChange = () => {
      void persistLocalWalletIdentity('local-wallet-change');
    };
    const handleFocus = () => {
      void persistLocalWalletIdentity('window-focus');
    };

    window.addEventListener(BITCODE_LOCAL_WALLET_EVENT, handleWalletChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      window.removeEventListener(BITCODE_LOCAL_WALLET_EVENT, handleWalletChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return null;
}
