import { bitcodeQaTelemetry, compactBitcodeAddress } from './qa-telemetry';

export const BITCODE_LOCAL_WALLET_STORAGE_KEY = 'bitcode_local_wallet_identity';
export const BITCODE_LOCAL_WALLET_EVENT = 'bitcode-wallet-identity-changed';

export type BitcodeWalletBindingStatus = 'pending' | 'manual' | 'verified';

export type LocalWalletProofKind =
  | 'bitcoin_message_signature'
  | 'provider_session'
  | 'manual_address'
  | 'ethereum_personal_sign';

export interface LocalBitcodeWalletIdentity {
  address: string;
  provider: string;
  network: string | null;
  status: BitcodeWalletBindingStatus;
  connectedAt: string;
  proofKind: LocalWalletProofKind;
  paymentAddress?: string | null;
  authAddress?: string | null;
  addressType?: string | null;
  message?: string | null;
  signature?: string | null;
  persistence?: 'server' | 'local';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function isPlausibleBitcoinAddress(value: unknown): value is string {
  const address = readString(value);
  if (!address) return false;

  return (
    /^(bc1|tb1|bcrt1)[ac-hj-np-z02-9]{8,90}$/i.test(address) ||
    /^[13mn2][A-HJ-NP-Za-km-z1-9]{25,60}$/.test(address)
  );
}

export function isPlausibleWalletAddress(value: unknown): value is string {
  const address = readString(value);
  if (!address) return false;
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return true;
  return isPlausibleBitcoinAddress(address);
}

export function readLocalBitcodeWalletIdentity(): LocalBitcodeWalletIdentity | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(BITCODE_LOCAL_WALLET_STORAGE_KEY);
    const parsed = raw ? asRecord(JSON.parse(raw)) : null;
    const address = readString(parsed?.address);
    const provider = readString(parsed?.provider);
    const connectedAt = readString(parsed?.connectedAt);
    const status = readString(parsed?.status);
    const proofKind = readString(parsed?.proofKind);

    if (!isPlausibleWalletAddress(address) || !provider || !connectedAt) return null;
    if (status !== 'pending' && status !== 'manual' && status !== 'verified') return null;
    if (
      proofKind !== 'bitcoin_message_signature' &&
      proofKind !== 'provider_session' &&
      proofKind !== 'manual_address' &&
      proofKind !== 'ethereum_personal_sign'
    ) {
      return null;
    }

    return {
      address,
      provider,
      network: readString(parsed?.network),
      status,
      connectedAt,
      proofKind,
      paymentAddress: readString(parsed?.paymentAddress),
      authAddress: readString(parsed?.authAddress),
      addressType: readString(parsed?.addressType),
      message: readString(parsed?.message),
      signature: readString(parsed?.signature),
      persistence: readString(parsed?.persistence) === 'server' ? 'server' : 'local',
    };
  } catch {
    return null;
  }
}

export function writeLocalBitcodeWalletIdentity(identity: LocalBitcodeWalletIdentity) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BITCODE_LOCAL_WALLET_STORAGE_KEY, JSON.stringify(identity));
  bitcodeQaTelemetry('info', 'wallet-local', 'write', {
    provider: identity.provider,
    network: identity.network,
    status: identity.status,
    proofKind: identity.proofKind,
    persistence: identity.persistence ?? 'local',
    address: compactBitcodeAddress(identity.address),
    paymentAddress: compactBitcodeAddress(identity.paymentAddress),
    authAddress: compactBitcodeAddress(identity.authAddress),
  });
  window.dispatchEvent(new CustomEvent(BITCODE_LOCAL_WALLET_EVENT, {
    detail: {
      provider: identity.provider,
      network: identity.network,
      status: identity.status,
      persistence: identity.persistence ?? 'local',
      address: identity.address,
    },
  }));
}

export function clearLocalBitcodeWalletIdentity() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(BITCODE_LOCAL_WALLET_STORAGE_KEY);
  bitcodeQaTelemetry('info', 'wallet-local', 'clear');
  window.dispatchEvent(new CustomEvent(BITCODE_LOCAL_WALLET_EVENT, { detail: null }));
}

export function mergeLocalBitcodeWalletIdentity<T extends { profile?: unknown }>(
  data: T,
  identity = readLocalBitcodeWalletIdentity(),
): T {
  if (!identity) return data;

  const existingProfile =
    data.profile && typeof data.profile === 'object'
      ? (data.profile as Record<string, unknown>)
      : {};
  const existingWalletAddress =
    readString(existingProfile.wallet_address) ||
    readString((existingProfile.wallet_binding as Record<string, unknown> | undefined)?.address);

  if (existingWalletAddress && existingWalletAddress !== identity.address) return data;

  const walletBinding = {
    address: identity.address,
    provider: identity.provider,
    status: identity.status,
    boundAt: identity.connectedAt,
    network: identity.network,
    proofKind: identity.proofKind,
    paymentAddress: identity.paymentAddress,
    authAddress: identity.authAddress,
    addressType: identity.addressType,
    persistence: identity.persistence ?? 'local',
  };
  const settings =
    existingProfile.settings && typeof existingProfile.settings === 'object'
      ? (existingProfile.settings as Record<string, unknown>)
      : {};
  const bitcodeProfile =
    settings.bitcodeProfile && typeof settings.bitcodeProfile === 'object'
      ? (settings.bitcodeProfile as Record<string, unknown>)
      : {};

  return {
    ...data,
    profile: {
      ...existingProfile,
      wallet_address: identity.address,
      wallet_provider: identity.provider,
      wallet_binding_status: identity.status,
      wallet_bound_at: identity.connectedAt,
      wallet_binding: walletBinding,
      settings: {
        ...settings,
        bitcodeProfile: {
          ...bitcodeProfile,
          walletBinding,
        },
      },
    },
    walletConnectionStatus: {
      connected: true,
      provider: identity.provider,
      valid: identity.status !== 'manual',
      address: identity.address,
      verificationState: identity.status,
      metadata: {
        source: 'wallet_provider_connection',
        connectionAddress: identity.address,
        matchesBindingAddress: true,
        connectedAt: identity.connectedAt,
        network: identity.network,
        proofKind: identity.proofKind,
        persistence: identity.persistence ?? 'local',
        paymentAddress: identity.paymentAddress,
        authAddress: identity.authAddress,
        addressType: identity.addressType,
      },
    },
  } as T;
}
