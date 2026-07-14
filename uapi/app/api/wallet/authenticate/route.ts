import { NextResponse } from 'next/server';

import {
  hydrateBitcodeProfile,
  mergeBitcodeProfileSettings,
} from '@bitcode/orm';
import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import {
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';

export const runtime = 'nodejs';

type WalletAuthPayload = {
  address?: unknown;
  provider?: unknown;
  network?: unknown;
  message?: unknown;
  signature?: unknown;
  proofKind?: unknown;
  paymentAddress?: unknown;
  authAddress?: unknown;
  addressType?: unknown;
  issuedAt?: unknown;
  connectedAt?: unknown;
  source?: unknown;
};

const BITCOIN_WALLET_PROVIDERS = new Set([
  'bitcoin-wallet',
  'unisat',
  'leather',
  'okx-bitcoin',
  'xverse',
  'manual-bitcoin',
]);

function readNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function isPlausibleBitcoinAddress(value: unknown) {
  const address = readNonEmptyString(value);
  if (!address) return false;

  return (
    /^(bc1|tb1|bcrt1)[ac-hj-np-z02-9]{8,90}$/i.test(address) ||
    /^[13mn2][A-HJ-NP-Za-km-z1-9]{25,60}$/.test(address)
  );
}

function normalizeProvider(value: unknown) {
  const provider = readNonEmptyString(value)?.toLowerCase() ?? 'bitcoin-wallet';
  return BITCOIN_WALLET_PROVIDERS.has(provider) ? provider : null;
}

function normalizeProofKind(value: unknown) {
  const proofKind = readNonEmptyString(value);
  if (proofKind === 'bitcoin_message_signature' || proofKind === 'provider_session') {
    return proofKind;
  }
  return null;
}

function readUsernameFromAddress(address: string) {
  const safePrefix = address.replace(/[^a-z0-9]/gi, '').slice(0, 12).toLowerCase();
  return `wallet_${safePrefix || 'bitcoin'}`;
}

function isBitcodeBitcoinWalletMessage(message: string, address: string) {
  return (
    message.includes('Bitcode Bitcoin wallet authentication') &&
    message.includes(`Address: ${address}`) &&
    message.includes('Purpose: Authenticate Bitcode commercial profile')
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

// GoTrue keeps only standard OIDC claims in identity_data, so the userinfo
// label ("Leather Bitcoin wallet") is often the only provider signal left.
const WALLET_PROVIDER_LABEL_ALIASES: Record<string, string> = {
  okx: 'okx-bitcoin',
};

type BitcoinOAuthIdentityLike = {
  provider?: string;
  created_at?: string;
  identity_data?: Record<string, unknown> | null;
};

function deriveWalletFromBitcoinOAuthIdentity(user: {
  identities?: BitcoinOAuthIdentityLike[] | null;
}) {
  const identity = (user.identities ?? []).find(
    (entry) => entry?.provider === 'custom:bitcode-bitcoin',
  );
  if (!identity) return null;

  const claims = identity.identity_data ?? {};
  const sub = readNonEmptyString(claims.sub);
  const subMatch = sub ? /^bitcoin:([a-z0-9-]+):(\S+)$/i.exec(sub) : null;
  const address =
    readNonEmptyString(claims.bitcoin_auth_address) ??
    readNonEmptyString(claims.bitcoin_address) ??
    (subMatch ? subMatch[2] : null);
  if (!address || !isPlausibleBitcoinAddress(address)) return null;

  const labelStem =
    readNonEmptyString(claims.wallet_provider) ??
    readNonEmptyString(claims.wallet_provider_label) ??
    readNonEmptyString(claims.name)?.replace(/\s+bitcoin\s+wallet$/i, '') ??
    '';
  const providerKey = labelStem.toLowerCase();
  const provider = BITCOIN_WALLET_PROVIDERS.has(providerKey)
    ? providerKey
    : WALLET_PROVIDER_LABEL_ALIASES[providerKey] ?? 'bitcoin-wallet';

  const network =
    readNonEmptyString(claims.bitcoin_network) ??
    (subMatch ? subMatch[1].toLowerCase() : null) ??
    (address.toLowerCase().startsWith('tb1')
      ? 'testnet'
      : address.toLowerCase().startsWith('bcrt1')
        ? 'regtest'
        : 'mainnet');

  return {
    address,
    provider,
    network,
    paymentAddress: readNonEmptyString(claims.bitcoin_payment_address),
    authAddress: readNonEmptyString(claims.bitcoin_auth_address) ?? address,
    addressType: readNonEmptyString(claims.bitcoin_address_type),
    connectedAt:
      readNonEmptyString(claims.wallet_proof_captured_at) ??
      readNonEmptyString(identity.created_at),
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    bitcodeServerTelemetry('warn', 'wallet-authenticate', 'session-required', {
      userError: userError?.message ?? null,
    });
    return NextResponse.json(
      {
        error:
          'Bitcoin wallet connection requires an active Bitcode session before server persistence. The client may still stage the wallet locally for V28 QA when staging auth is unavailable.',
        code: 'wallet_session_required',
      },
      { status: 401 },
    );
  }

  let body: WalletAuthPayload;
  try {
    body = (await request.json()) as WalletAuthPayload;
  } catch {
    bitcodeServerTelemetry('warn', 'wallet-authenticate', 'invalid-json');
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let address = readNonEmptyString(body.address);
  let provider = normalizeProvider(body.provider);
  let network = readNonEmptyString(body.network);
  let message = readNonEmptyString(body.message);
  let signature = readNonEmptyString(body.signature);
  let proofKind = normalizeProofKind(body.proofKind);
  let paymentAddress = readNonEmptyString(body.paymentAddress);
  let authAddress = readNonEmptyString(body.authAddress);
  let addressType = readNonEmptyString(body.addressType);
  const issuedAt = readNonEmptyString(body.issuedAt);
  let connectedAt = readNonEmptyString(body.connectedAt) ?? issuedAt;

  // OAuth-identity mode: the canonical wallet connect signs on the provider
  // authorize page, so nothing is staged client-side to replay. Derive the
  // binding from the session's GoTrue-verified identity instead of trusting
  // any client-supplied wallet fields.
  const fromOAuthIdentity = readNonEmptyString(body.source) === 'oauth-identity';
  if (fromOAuthIdentity) {
    const derived = deriveWalletFromBitcoinOAuthIdentity(user);
    if (!derived) {
      bitcodeServerTelemetry('warn', 'wallet-authenticate', 'oauth-identity-missing', {
        userId: compactBitcodeServerId(user.id),
      });
      return NextResponse.json(
        {
          error: 'No Bitcoin wallet OAuth identity is attached to this Bitcode session.',
          code: 'wallet_oauth_identity_missing',
        },
        { status: 422 },
      );
    }
    address = derived.address;
    provider = derived.provider;
    network = derived.network;
    message = null;
    signature = null;
    proofKind = 'provider_session';
    paymentAddress = derived.paymentAddress;
    authAddress = derived.authAddress;
    addressType = derived.addressType;
    connectedAt = derived.connectedAt ?? connectedAt;
  }

  if (!address || !isPlausibleBitcoinAddress(address)) {
    bitcodeServerTelemetry('warn', 'wallet-authenticate', 'invalid-address', {
      address: compactBitcodeServerId(address),
      provider,
      network,
    });
    return NextResponse.json({ error: 'A valid Bitcoin wallet address is required.' }, { status: 400 });
  }

  if (!provider) {
    bitcodeServerTelemetry('warn', 'wallet-authenticate', 'invalid-provider', {
      provider: readNonEmptyString(body.provider),
      address: compactBitcodeServerId(address),
    });
    return NextResponse.json(
      {
        error:
          'Bitcode wallet authentication accepts Bitcoin wallet providers only. The injected Ethereum provider is not a Bitcoin signer.',
      },
      { status: 400 },
    );
  }

  if (!proofKind) {
    bitcodeServerTelemetry('warn', 'wallet-authenticate', 'missing-proof-kind', {
      provider,
      address: compactBitcodeServerId(address),
    });
    return NextResponse.json({ error: 'Bitcoin wallet proof kind is required.' }, { status: 400 });
  }

  if (proofKind === 'bitcoin_message_signature') {
    if (!message || !signature) {
      bitcodeServerTelemetry('warn', 'wallet-authenticate', 'missing-signature', {
        provider,
        address: compactBitcodeServerId(address),
      });
      return NextResponse.json(
        { error: 'Bitcoin wallet message-signature proof requires both message and signature.' },
        { status: 400 },
      );
    }
    if (!isBitcodeBitcoinWalletMessage(message, address)) {
      bitcodeServerTelemetry('warn', 'wallet-authenticate', 'message-mismatch', {
        provider,
        address: compactBitcodeServerId(address),
      });
      return NextResponse.json(
        { error: 'Bitcoin wallet message does not match the Bitcode authentication challenge.' },
        { status: 400 },
      );
    }
  }

  const persistedAt = new Date().toISOString();
  const bindingStatus = proofKind === 'bitcoin_message_signature' ? 'pending' : 'pending';
  bitcodeServerTelemetry('info', 'wallet-authenticate', 'persist-start', {
    userId: compactBitcodeServerId(user.id),
    provider,
    address: compactBitcodeServerId(address),
    network,
    proofKind,
    paymentAddress: compactBitcodeServerId(paymentAddress),
    authAddress: compactBitcodeServerId(authAddress),
  });
  const { data: existingProfile, error: profileReadError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileReadError) {
    bitcodeServerTelemetry('error', 'wallet-authenticate', 'profile-read-failed', {
      userId: compactBitcodeServerId(user.id),
      message: profileReadError.message,
    });
    return NextResponse.json({ error: profileReadError.message }, { status: 500 });
  }

  // Idempotent no-op for identity-derived binds: the bridge retries on
  // mount/focus, so a matching existing binding short-circuits the writes.
  if (fromOAuthIdentity) {
    const settingsRecord = asRecord(existingProfile?.settings);
    const existingBinding =
      asRecord(asRecord(settingsRecord?.bitcodeProfile)?.walletBinding) ??
      asRecord(settingsRecord?.walletBinding);
    if (readNonEmptyString(existingBinding?.address) === address) {
      const existingStatus = readNonEmptyString(existingBinding?.status) ?? 'pending';
      return NextResponse.json({
        success: true,
        alreadyBound: true,
        profile: hydrateBitcodeProfile(existingProfile),
        walletConnectionStatus: {
          connected: true,
          provider: readNonEmptyString(existingBinding?.provider) ?? provider,
          valid: existingStatus === 'verified',
          address,
          network: readNonEmptyString(existingBinding?.network) ?? network,
          verificationState: existingStatus,
          metadata: {
            source: 'bitcoin_wallet_oauth_identity',
            connectionAddress: address,
            matchesBindingAddress: true,
            connectedAt: readNonEmptyString(existingBinding?.boundAt) ?? connectedAt,
          },
        },
      });
    }
  }

  const username =
    typeof existingProfile?.username === 'string' && existingProfile.username.trim()
      ? existingProfile.username.trim()
      : readUsernameFromAddress(address);

  const settings = mergeBitcodeProfileSettings(existingProfile?.settings, {
    walletBinding: {
      address,
      provider,
      status: bindingStatus,
      boundAt: persistedAt,
      network,
      proofKind,
      paymentAddress,
      authAddress,
      addressType,
    },
  });

  const { error: profileWriteError } = await supabaseAdmin.from('user_profiles').upsert(
    {
      id: user.id,
      username,
      display_name: existingProfile?.display_name ?? null,
      bio: existingProfile?.bio ?? null,
      avatar_url: existingProfile?.avatar_url ?? null,
      role: existingProfile?.role ?? 'user',
      onboarded_steps: existingProfile?.onboarded_steps ?? null,
      settings,
      updated_at: persistedAt,
      created_at: existingProfile?.created_at ?? persistedAt,
    },
    { onConflict: 'id' },
  );

  if (profileWriteError) {
    bitcodeServerTelemetry('error', 'wallet-authenticate', 'profile-write-failed', {
      userId: compactBitcodeServerId(user.id),
      message: profileWriteError.message,
    });
    return NextResponse.json({ error: profileWriteError.message }, { status: 500 });
  }

  const { error: connectionWriteError } = await supabaseAdmin.from('user_connections').upsert(
    {
      user_id: user.id,
      provider,
      is_active: true,
      connection_data: {
        provider_user_id: address,
        provider_username: address,
        address,
        wallet_address: address,
        network,
        verification_state: bindingStatus,
        status: bindingStatus,
        auth_source: fromOAuthIdentity ? 'bitcoin_wallet_oauth_identity' : 'bitcoin_wallet_provider',
        proof_kind: proofKind,
        payment_address: paymentAddress,
        auth_address: authAddress,
        address_type: addressType,
        message,
        signature,
        issued_at: issuedAt,
        connected_at: connectedAt ?? persistedAt,
        persisted_at: persistedAt,
      },
      updated_at: persistedAt,
    },
    { onConflict: 'user_id,provider' },
  );

  if (connectionWriteError) {
    bitcodeServerTelemetry('error', 'wallet-authenticate', 'connection-write-failed', {
      userId: compactBitcodeServerId(user.id),
      provider,
      address: compactBitcodeServerId(address),
      message: connectionWriteError.message,
    });
    return NextResponse.json(
      {
        error: connectionWriteError.message,
        code: 'wallet_connection_persist_failed',
        remediation:
          'Apply the user_connections provider-constraint migration before testing Bitcoin wallet authentication in staging.',
      },
      { status: 500 },
    );
  }

  bitcodeServerTelemetry('info', 'wallet-authenticate', 'persist-success', {
    userId: compactBitcodeServerId(user.id),
    provider,
    address: compactBitcodeServerId(address),
    network,
    verificationState: bindingStatus,
  });

  return NextResponse.json(
    {
      success: true,
      profile: hydrateBitcodeProfile({
        ...(existingProfile ?? {}),
        id: user.id,
        username,
        settings,
      }),
      walletConnectionStatus: {
        connected: true,
        provider,
        valid: true,
        address,
        network,
        verificationState: bindingStatus,
        metadata: {
          source: fromOAuthIdentity ? 'bitcoin_wallet_oauth_identity' : 'wallet_provider_connection',
          connectionAddress: address,
          matchesBindingAddress: true,
          connectedAt: connectedAt ?? persistedAt,
        },
      },
    },
    { status: 201 },
  );
}
