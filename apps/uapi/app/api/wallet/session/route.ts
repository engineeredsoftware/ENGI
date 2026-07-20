/**
 * POST /api/wallet/session
 *
 * Establish a durable Bitcode (Supabase) session from a MetaMask /
 * EIP-1193 personal_sign proof. Local-only Ethereum connect previously left
 * hasSession=false, so GitHub App claim always returned session_required.
 *
 * Flow:
 *  1. Verify SIWE-shaped Bitcode message + signature recovers the address
 *  2. If no session: create/find wallet user, mint magic-link tokens, set session
 *  3. Persist wallet binding on profile + user_connections
 *  4. Return session tokens + wallet status for client setSession / claim refresh
 */

import { NextResponse } from 'next/server';

import {
  hydrateBitcodeProfile,
  mergeBitcodeProfileSettings,
} from '@bitcode/orm';
import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';
import {
  BITCODE_ETHEREUM_TESTNET_CHAIN_ID,
  buildEthereumWalletAuthEmail,
  isPlausibleEthereumAddress,
  normalizeEthereumWalletProvider,
  verifyBitcodeEthereumAuthSignature,
} from '@bitcode/auth/ethereum-auth-verify';
import {
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';

export const runtime = 'nodejs';

type WalletSessionPayload = {
  address?: unknown;
  provider?: unknown;
  network?: unknown;
  message?: unknown;
  signature?: unknown;
  proofKind?: unknown;
  paymentAddress?: unknown;
  authAddress?: unknown;
  addressType?: unknown;
  chainId?: unknown;
  issuedAt?: unknown;
  connectedAt?: unknown;
};

function readNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readUsernameFromAddress(address: string) {
  const safePrefix = address.replace(/[^a-z0-9]/gi, '').slice(0, 12).toLowerCase();
  return `eth_${safePrefix || 'wallet'}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

async function ensureEthereumWalletUser(input: {
  email: string;
  address: string;
  provider: string;
  network: string | null;
}) {
  const metadata = {
    ethereum_address: input.address,
    wallet_provider: input.provider,
    wallet_network: input.network,
    auth_method: 'ethereum_personal_sign',
  };

  const created = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (created.data.user && !created.error) {
    return { user: created.data.user, created: true as const };
  }

  const message = created.error?.message ?? '';
  if (!/already|registered|exists/i.test(message)) {
    throw new Error(created.error?.message ?? 'Failed to create Ethereum wallet auth user.');
  }

  // User already exists — generateLink returns the existing user.
  const link = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: input.email,
  });
  if (link.error || !link.data.user) {
    throw new Error(link.error?.message ?? 'Failed to resolve existing Ethereum wallet auth user.');
  }

  // Refresh metadata so provider/network stay current without rotating identity.
  await supabaseAdmin.auth.admin.updateUserById(link.data.user.id, {
    user_metadata: {
      ...(asRecord(link.data.user.user_metadata) ?? {}),
      ...metadata,
    },
  });

  return { user: link.data.user, created: false as const };
}

async function mintSessionTokensForEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (error || !data?.properties?.hashed_token) {
    throw new Error(error?.message ?? 'Failed to mint Bitcode session for Ethereum wallet.');
  }

  const supabase = await createClient();
  const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
    type: 'email',
    token_hash: data.properties.hashed_token,
  });
  if (otpError || !otpData.session) {
    throw new Error(otpError?.message ?? 'Failed to establish Bitcode session from wallet proof.');
  }

  return {
    session: otpData.session,
    user: otpData.user ?? data.user,
  };
}

export async function POST(request: Request) {
  let body: WalletSessionPayload;
  try {
    body = (await request.json()) as WalletSessionPayload;
  } catch {
    bitcodeServerTelemetry('warn', 'wallet-session', 'invalid-json');
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const addressRaw = readNonEmptyString(body.address)?.toLowerCase() ?? null;
  const provider = normalizeEthereumWalletProvider(body.provider) ?? 'metamask';
  const network = readNonEmptyString(body.network) ?? 'sepolia';
  const message = readNonEmptyString(body.message);
  const signature = readNonEmptyString(body.signature);
  const proofKind = readNonEmptyString(body.proofKind);
  const paymentAddress = readNonEmptyString(body.paymentAddress)?.toLowerCase() ?? addressRaw;
  const authAddress = readNonEmptyString(body.authAddress)?.toLowerCase() ?? addressRaw;
  const addressType = readNonEmptyString(body.addressType) ?? 'ethereum';
  const connectedAt = readNonEmptyString(body.connectedAt) ?? readNonEmptyString(body.issuedAt);
  const chainIdRaw = body.chainId;
  const chainId =
    typeof chainIdRaw === 'number' && Number.isFinite(chainIdRaw)
      ? chainIdRaw
      : typeof chainIdRaw === 'string' && chainIdRaw.trim()
        ? Number.parseInt(chainIdRaw, 10)
        : BITCODE_ETHEREUM_TESTNET_CHAIN_ID;

  if (!addressRaw || !isPlausibleEthereumAddress(addressRaw)) {
    return NextResponse.json(
      { error: 'A valid Ethereum wallet address is required.', code: 'invalid_address' },
      { status: 400 },
    );
  }
  if (proofKind !== 'ethereum_personal_sign') {
    return NextResponse.json(
      {
        error: 'Ethereum session mint requires proofKind ethereum_personal_sign.',
        code: 'invalid_proof_kind',
      },
      { status: 400 },
    );
  }
  if (!message || !signature) {
    return NextResponse.json(
      { error: 'Ethereum session mint requires message and signature.', code: 'missing_proof' },
      { status: 400 },
    );
  }

  const verification = verifyBitcodeEthereumAuthSignature({
    address: addressRaw,
    message,
    signature,
    chainId,
  });
  if (!verification.ok) {
    bitcodeServerTelemetry('warn', 'wallet-session', 'signature-rejected', {
      code: verification.code,
      address: compactBitcodeServerId(addressRaw),
      provider,
    });
    return NextResponse.json(
      { error: verification.error, code: verification.code },
      { status: 401 },
    );
  }

  const address = verification.address;
  const email = buildEthereumWalletAuthEmail(address);

  const existingClient = await createClient();
  const {
    data: { user: existingUser },
  } = await existingClient.auth.getUser();

  let sessionUserId: string;
  let sessionPayload: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    expires_at?: number;
    token_type?: string;
  } | null = null;
  let sessionEstablished = false;

  try {
    if (existingUser) {
      // Bind Ethereum identity to the already-authenticated Bitcode session.
      sessionUserId = existingUser.id;
      bitcodeServerTelemetry('info', 'wallet-session', 'bind-existing-session', {
        userId: compactBitcodeServerId(sessionUserId),
        address: compactBitcodeServerId(address),
        provider,
      });
    } else {
      await ensureEthereumWalletUser({ email, address, provider, network });
      const minted = await mintSessionTokensForEmail(email);
      if (!minted.user?.id) {
        throw new Error('Session mint did not return a Bitcode user.');
      }
      sessionUserId = minted.user.id;
      sessionPayload = {
        access_token: minted.session.access_token,
        refresh_token: minted.session.refresh_token,
        expires_in: minted.session.expires_in,
        expires_at: minted.session.expires_at,
        token_type: minted.session.token_type,
      };
      sessionEstablished = true;
      bitcodeServerTelemetry('info', 'wallet-session', 'session-minted', {
        userId: compactBitcodeServerId(sessionUserId),
        address: compactBitcodeServerId(address),
        provider,
      });
    }
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    bitcodeServerTelemetry('error', 'wallet-session', 'session-mint-failed', {
      message: errMessage.slice(0, 200),
      address: compactBitcodeServerId(address),
      provider,
    });
    return NextResponse.json(
      {
        error: errMessage,
        code: 'session_mint_failed',
      },
      { status: 500 },
    );
  }

  const persistedAt = new Date().toISOString();
  const bindingStatus = 'verified' as const;

  const { data: existingProfile, error: profileReadError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', sessionUserId)
    .maybeSingle();

  if (profileReadError) {
    bitcodeServerTelemetry('error', 'wallet-session', 'profile-read-failed', {
      userId: compactBitcodeServerId(sessionUserId),
      message: profileReadError.message,
    });
    return NextResponse.json({ error: profileReadError.message }, { status: 500 });
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
      proofKind: 'ethereum_personal_sign',
      paymentAddress,
      authAddress,
      addressType,
    },
  });

  const { error: profileWriteError } = await supabaseAdmin.from('user_profiles').upsert(
    {
      id: sessionUserId,
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
    bitcodeServerTelemetry('error', 'wallet-session', 'profile-write-failed', {
      userId: compactBitcodeServerId(sessionUserId),
      message: profileWriteError.message,
    });
    return NextResponse.json({ error: profileWriteError.message }, { status: 500 });
  }

  const { error: connectionWriteError } = await supabaseAdmin.from('user_connections').upsert(
    {
      user_id: sessionUserId,
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
        auth_source: 'ethereum_wallet_personal_sign',
        proof_kind: 'ethereum_personal_sign',
        payment_address: paymentAddress,
        auth_address: authAddress,
        address_type: addressType,
        message,
        signature,
        issued_at: connectedAt,
        connected_at: connectedAt ?? persistedAt,
        persisted_at: persistedAt,
        chain_id: chainId,
      },
      updated_at: persistedAt,
    },
    { onConflict: 'user_id,provider' },
  );

  if (connectionWriteError) {
    bitcodeServerTelemetry('error', 'wallet-session', 'connection-write-failed', {
      userId: compactBitcodeServerId(sessionUserId),
      provider,
      address: compactBitcodeServerId(address),
      message: connectionWriteError.message,
    });
    return NextResponse.json(
      {
        error: connectionWriteError.message,
        code: 'wallet_connection_persist_failed',
      },
      { status: 500 },
    );
  }

  bitcodeServerTelemetry('info', 'wallet-session', 'persist-success', {
    userId: compactBitcodeServerId(sessionUserId),
    provider,
    address: compactBitcodeServerId(address),
    network,
    sessionEstablished,
  });

  return NextResponse.json(
    {
      success: true,
      sessionEstablished,
      session: sessionPayload,
      profile: hydrateBitcodeProfile({
        ...(existingProfile ?? {}),
        id: sessionUserId,
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
          source: 'ethereum_wallet_personal_sign',
          connectionAddress: address,
          matchesBindingAddress: true,
          connectedAt: connectedAt ?? persistedAt,
          persistence: 'server',
          proofKind: 'ethereum_personal_sign',
          chainId,
        },
      },
    },
    { status: sessionEstablished ? 201 : 200 },
  );
}
