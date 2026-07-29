/**
 * Server persistence for wallet connections after local staging.
 * Bitcoin binds to an existing session; Ethereum personal_sign can mint one.
 */

import type { BitcoinWalletConnection } from '@bitcode/auth/bitcoin-wallet-client';
import {
  BITCODE_ETHEREUM_TESTNET_CHAIN_ID,
  type EthereumWalletProviderId,
} from '@bitcode/auth/ethereum-wallet-client';
import {
  writeLocalBitcodeWalletIdentity,
  readLocalBitcodeWalletIdentity,
  type LocalBitcodeWalletIdentity,
} from '@bitcode/auth/wallet-local';
import { bitcodeQaTelemetry, compactBitcodeAddress } from '@bitcode/auth/qa-telemetry';
import { createClient } from '@bitcode/supabase/ssr/client';

export interface PersistWalletResult {
  ok: boolean;
  errorMessage?: string;
  savedAddress?: string;
  savedAt?: string;
  savedStatus?: 'pending' | 'manual' | 'verified';
  identity?: LocalBitcodeWalletIdentity | null;
  sessionEstablished?: boolean;
  githubClaim?: {
    claimed: boolean;
    installationId?: number;
    account?: string | null;
    error?: string | null;
  } | null;
}

export interface EthereumWalletSessionConnection {
  address: string;
  provider: EthereumWalletProviderId | string;
  network: string;
  message: string;
  signature: string;
  connectedAt: string;
  chainId?: number;
  paymentAddress?: string | null;
  authAddress?: string | null;
}

export async function persistBitcoinWalletConnection(
  connection: BitcoinWalletConnection,
): Promise<PersistWalletResult> {
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
    const errorMessage =
      typeof payload?.error === 'string'
        ? `Bitcoin wallet connected locally; server persistence is pending: ${payload.error}`
        : 'Bitcoin wallet connected locally; server persistence is pending.';
    bitcodeQaTelemetry('warn', 'wallet-auxillary', 'server-persistence-pending', {
      provider: connection.provider,
      status: response.status,
      error: typeof payload?.error === 'string' ? payload.error : null,
    });
    return { ok: false, errorMessage };
  }

  const savedAddress = typeof payload?.walletConnectionStatus?.address === 'string'
    ? payload.walletConnectionStatus.address
    : connection.address;
  const savedAt = typeof payload?.walletConnectionStatus?.metadata?.connectedAt === 'string'
    ? payload.walletConnectionStatus.metadata.connectedAt
    : connection.connectedAt;
  const savedStatus: 'pending' | 'manual' | 'verified' =
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

  const identity = readLocalBitcodeWalletIdentity();
  bitcodeQaTelemetry('info', 'wallet-auxillary', 'server-persisted', {
    provider: connection.provider,
    status: savedStatus,
    address: compactBitcodeAddress(savedAddress),
  });

  return { ok: true, savedAddress, savedAt, savedStatus, identity };
}

/**
 * Mint or bind a Bitcode session from MetaMask personal_sign, then attempt
 * GitHub App install claim so authorized repos appear without a second login.
 */
export async function persistEthereumWalletSession(
  connection: EthereumWalletSessionConnection,
): Promise<PersistWalletResult> {
  const response = await fetch('/api/wallet/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      address: connection.address,
      provider: connection.provider,
      network: connection.network,
      message: connection.message,
      signature: connection.signature,
      proofKind: 'ethereum_personal_sign',
      paymentAddress: connection.paymentAddress ?? connection.address,
      authAddress: connection.authAddress ?? connection.address,
      addressType: 'ethereum',
      chainId: connection.chainId ?? BITCODE_ETHEREUM_TESTNET_CHAIN_ID,
      connectedAt: connection.connectedAt,
      issuedAt: connection.connectedAt,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMessage =
      typeof payload?.error === 'string'
        ? `Ethereum wallet signed locally; Bitcode session not established: ${payload.error}`
        : 'Ethereum wallet signed locally; Bitcode session not established.';
    bitcodeQaTelemetry('warn', 'wallet-auxillary', 'ethereum-session-failed', {
      provider: connection.provider,
      status: response.status,
      error: typeof payload?.error === 'string' ? payload.error : null,
      code: typeof payload?.code === 'string' ? payload.code : null,
    });
    return { ok: false, errorMessage };
  }

  // Connect = authenticate: server always returns session tokens for the
  // canonical wallet user. Missing tokens is a hard failure (not "bind only").
  const session = payload?.session;
  if (
    !session ||
    typeof session.access_token !== 'string' ||
    typeof session.refresh_token !== 'string'
  ) {
    bitcodeQaTelemetry('warn', 'wallet-auxillary', 'ethereum-session-tokens-missing', {
      sessionEstablished: payload?.sessionEstablished ?? null,
      sessionSwitched: payload?.sessionSwitched ?? null,
    });
    return {
      ok: false,
      errorMessage:
        'Ethereum wallet signed, but Bitcode did not return authentication tokens for that wallet user.',
    };
  }

  try {
    const supabase = createClient();
    const { error: setError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (setError) {
      bitcodeQaTelemetry('warn', 'wallet-auxillary', 'ethereum-set-session-failed', {
        message: setError.message,
      });
      return {
        ok: false,
        errorMessage: `Bitcode session tokens issued but browser session failed: ${setError.message}`,
      };
    }
    bitcodeQaTelemetry('info', 'wallet-auxillary', 'ethereum-session-adopted', {
      sessionSwitched: payload?.sessionSwitched === true,
      canonicalUserId:
        typeof payload?.canonicalUserId === 'string'
          ? payload.canonicalUserId.slice(0, 8)
          : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      errorMessage: `Bitcode session tokens issued but browser session failed: ${message}`,
    };
  }

  const savedAddress =
    typeof payload?.walletConnectionStatus?.address === 'string'
      ? payload.walletConnectionStatus.address
      : connection.address;
  const savedAt =
    typeof payload?.walletConnectionStatus?.metadata?.connectedAt === 'string'
      ? payload.walletConnectionStatus.metadata.connectedAt
      : connection.connectedAt;
  const savedStatus: 'pending' | 'manual' | 'verified' =
    payload?.walletConnectionStatus?.verificationState === 'verified'
      ? 'verified'
      : payload?.walletConnectionStatus?.verificationState === 'manual'
        ? 'manual'
        : 'verified';

  writeLocalBitcodeWalletIdentity({
    address: savedAddress,
    provider: connection.provider,
    network: connection.network,
    status: savedStatus,
    connectedAt: savedAt,
    proofKind: 'ethereum_personal_sign',
    paymentAddress: connection.paymentAddress ?? connection.address,
    authAddress: connection.authAddress ?? connection.address,
    addressType: 'ethereum',
    message: connection.message,
    signature: connection.signature,
    persistence: 'server',
  });

  const identity = readLocalBitcodeWalletIdentity();
  const sessionEstablished = Boolean(payload?.sessionEstablished);
  bitcodeQaTelemetry('info', 'wallet-auxillary', 'ethereum-session-persisted', {
    provider: connection.provider,
    status: savedStatus,
    address: compactBitcodeAddress(savedAddress),
    sessionEstablished,
  });

  const githubClaim = await claimPendingGitHubInstallationClient();

  return {
    ok: true,
    savedAddress,
    savedAt,
    savedStatus,
    identity,
    sessionEstablished,
    githubClaim,
  };
}

async function claimPendingGitHubInstallationClient(): Promise<PersistWalletResult['githubClaim']> {
  try {
    const response = await fetch('/api/vcs/github/connection', {
      method: 'GET',
      credentials: 'same-origin',
    });
    const payload = await response.json().catch(() => null);
    const claimedInstallation = payload?.claimedInstallation;
    if (!claimedInstallation || typeof claimedInstallation !== 'object') {
      return null;
    }
    const claimed = Boolean((claimedInstallation as { claimed?: unknown }).claimed);
    bitcodeQaTelemetry(
      claimed ? 'info' : 'warn',
      'wallet-auxillary',
      claimed ? 'github-claim-after-session' : 'github-claim-after-session-pending',
      {
        claimed,
        installationId:
          typeof (claimedInstallation as { installationId?: unknown }).installationId === 'number'
            ? (claimedInstallation as { installationId: number }).installationId
            : null,
        error:
          typeof (claimedInstallation as { error?: unknown }).error === 'string'
            ? (claimedInstallation as { error: string }).error
            : null,
      },
    );
    return {
      claimed,
      installationId:
        typeof (claimedInstallation as { installationId?: unknown }).installationId === 'number'
          ? (claimedInstallation as { installationId: number }).installationId
          : undefined,
      account:
        typeof (claimedInstallation as { account?: unknown }).account === 'string'
          ? (claimedInstallation as { account: string }).account
          : null,
      error:
        typeof (claimedInstallation as { error?: unknown }).error === 'string'
          ? (claimedInstallation as { error: string }).error
          : null,
    };
  } catch (error) {
    bitcodeQaTelemetry('warn', 'wallet-auxillary', 'github-claim-after-session-error', {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
