/**
 * Server-safe Ethereum personal_sign verification for Bitcode SIWE-shaped
 * auth messages (MetaMask / EIP-1193). Used to mint a durable Supabase
 * session from a recovered wallet address.
 */

import * as secp from '@noble/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';

import {
  BITCODE_ETHEREUM_TESTNET_CHAIN_ID,
  isPlausibleEthereumAddress,
} from './ethereum-wallet-client';

export { BITCODE_ETHEREUM_TESTNET_CHAIN_ID, isPlausibleEthereumAddress };

/** Deterministic auth email domain for Ethereum wallet sessions (not mail-routed). */
export const BITCODE_ETHEREUM_WALLET_AUTH_EMAIL_DOMAIN = 'ethereum.wallet.bitcode.local';

/** Reject auth messages older than this (replay window). */
export const BITCODE_ETHEREUM_AUTH_MESSAGE_MAX_AGE_MS = 15 * 60 * 1000;

const ETHEREUM_WALLET_PROVIDERS = new Set([
  'metamask',
  'coinbase',
  'brave',
  'rainbow',
  'injected',
  'walletconnect',
  'unknown',
]);

export function buildEthereumWalletAuthEmail(address: string): string {
  const normalized = address.trim().toLowerCase();
  if (!isPlausibleEthereumAddress(normalized)) {
    throw new Error('Cannot build wallet auth email from an invalid Ethereum address.');
  }
  return `${normalized}@${BITCODE_ETHEREUM_WALLET_AUTH_EMAIL_DOMAIN}`;
}

export function isEthereumWalletAuthProvider(value: unknown): value is string {
  return typeof value === 'string' && ETHEREUM_WALLET_PROVIDERS.has(value.toLowerCase());
}

export function normalizeEthereumWalletProvider(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const provider = value.trim().toLowerCase();
  return ETHEREUM_WALLET_PROVIDERS.has(provider) ? provider : null;
}

/**
 * Matches {@link buildBitcodeEthereumAuthMessage} from ethereum-wallet-client.
 */
export function isBitcodeEthereumAuthMessage(
  message: string,
  address: string,
  chainId: number = BITCODE_ETHEREUM_TESTNET_CHAIN_ID,
): boolean {
  if (!message || !isPlausibleEthereumAddress(address)) return false;
  const normalizedAddress = address.trim().toLowerCase();
  return (
    message.includes('Bitcode wants you to sign in with your Ethereum account:') &&
    message.includes(normalizedAddress) &&
    message.includes(`Chain ID: ${chainId}`) &&
    message.includes('URI: https://bitcode.exchange') &&
    message.includes('No BTD or ETH is transferred by this signature.')
  );
}

export function readEthereumAuthMessageIssuedAt(message: string): Date | null {
  const match = /^Issued At:\s*(.+)$/m.exec(message);
  if (!match?.[1]) return null;
  const issued = new Date(match[1].trim());
  return Number.isNaN(issued.getTime()) ? null : issued;
}

export function isEthereumAuthMessageFresh(
  message: string,
  nowMs: number = Date.now(),
  maxAgeMs: number = BITCODE_ETHEREUM_AUTH_MESSAGE_MAX_AGE_MS,
): boolean {
  const issuedAt = readEthereumAuthMessageIssuedAt(message);
  if (!issuedAt) return false;
  const age = nowMs - issuedAt.getTime();
  if (age < -60_000) return false; // reject far-future clocks (>1m)
  return age <= maxAgeMs;
}

function hashEthereumPersonalSignMessage(message: string): Uint8Array {
  const prefix = `\x19Ethereum Signed Message:\n${message.length}${message}`;
  return keccak_256(utf8ToBytes(prefix));
}

function parseEthereumSignature(signature: string): { compact: Uint8Array; recovery: number } {
  const raw = signature.trim();
  if (!/^0x[0-9a-fA-F]{130}$/.test(raw)) {
    throw new Error('Ethereum signature must be a 65-byte hex string.');
  }
  const bytes = hexToBytes(raw.slice(2));
  const compact = bytes.slice(0, 64);
  let v = bytes[64];
  // EIP-155 / legacy: MetaMask usually returns 27/28 for personal_sign.
  if (v >= 27) v -= 27;
  if (v !== 0 && v !== 1) {
    // Some wallets return chain-adjusted v; reduce mod 2 after stripping 35-offset-ish values.
    v = v % 2;
  }
  if (v !== 0 && v !== 1) {
    throw new Error('Ethereum signature recovery id is invalid.');
  }
  return { compact, recovery: v };
}

/**
 * Recover the checksum-agnostic lowercase address that produced `signature`
 * over the personal_sign encoding of `message`.
 */
export function recoverEthereumPersonalSignAddress(message: string, signature: string): string {
  const msgHash = hashEthereumPersonalSignMessage(message);
  const { compact, recovery } = parseEthereumSignature(signature);
  const publicKey = secp.recoverPublicKey(msgHash, compact, recovery, false);
  if (!publicKey || publicKey.length < 65) {
    throw new Error('Failed to recover Ethereum public key from signature.');
  }
  // Uncompressed pubkey is 0x04 || X || Y — address is last 20 bytes of keccak(X||Y).
  const addressBytes = keccak_256(publicKey.slice(1)).slice(-20);
  return `0x${bytesToHex(addressBytes)}`;
}

export type VerifyBitcodeEthereumAuthResult =
  | { ok: true; address: string }
  | { ok: false; error: string; code: string };

export function verifyBitcodeEthereumAuthSignature(input: {
  address: string;
  message: string;
  signature: string;
  chainId?: number;
  nowMs?: number;
}): VerifyBitcodeEthereumAuthResult {
  const address = input.address?.trim().toLowerCase() ?? '';
  if (!isPlausibleEthereumAddress(address)) {
    return { ok: false, error: 'A valid Ethereum wallet address is required.', code: 'invalid_address' };
  }
  if (!input.message?.trim()) {
    return { ok: false, error: 'Ethereum auth message is required.', code: 'missing_message' };
  }
  if (!input.signature?.trim()) {
    return { ok: false, error: 'Ethereum auth signature is required.', code: 'missing_signature' };
  }

  const chainId = input.chainId ?? BITCODE_ETHEREUM_TESTNET_CHAIN_ID;
  if (!isBitcodeEthereumAuthMessage(input.message, address, chainId)) {
    return {
      ok: false,
      error: 'Ethereum wallet message does not match the Bitcode authentication challenge.',
      code: 'message_mismatch',
    };
  }
  if (!isEthereumAuthMessageFresh(input.message, input.nowMs)) {
    return {
      ok: false,
      error: 'Ethereum auth message is expired or missing Issued At. Sign again.',
      code: 'message_expired',
    };
  }

  try {
    const recovered = recoverEthereumPersonalSignAddress(input.message, input.signature);
    if (recovered !== address) {
      return {
        ok: false,
        error: 'Ethereum signature does not match the claimed wallet address.',
        code: 'signature_mismatch',
      };
    }
    return { ok: true, address };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Ethereum signature verification failed.',
      code: 'signature_invalid',
    };
  }
}

