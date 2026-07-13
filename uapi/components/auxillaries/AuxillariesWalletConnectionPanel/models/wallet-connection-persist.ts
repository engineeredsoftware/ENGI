/**
 * Server persistence for a Bitcoin wallet connection after local staging.
 */

import type { BitcoinWalletConnection } from '@/lib/bitcoin-wallet-client';
import {
  writeLocalBitcodeWalletIdentity,
  readLocalBitcodeWalletIdentity,
  type LocalBitcodeWalletIdentity,
} from '@/lib/bitcode-wallet-local';
import { bitcodeQaTelemetry, compactBitcodeAddress } from '@/lib/bitcode-qa-telemetry';

export interface PersistWalletResult {
  ok: boolean;
  errorMessage?: string;
  savedAddress?: string;
  savedAt?: string;
  savedStatus?: 'pending' | 'manual' | 'verified';
  identity?: LocalBitcodeWalletIdentity | null;
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
