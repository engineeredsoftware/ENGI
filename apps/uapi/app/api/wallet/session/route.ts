/**
 * POST /api/wallet/session
 *
 * Authenticate as the canonical Bitcode user for a MetaMask / EIP-1193
 * personal_sign proof. Connect is not "attach wallet to whatever session is
 * open" — it means: verify address A → resolve principal user for A → mint
 * Supabase session for that user → persist wallet on that user only → return
 * tokens so the browser becomes that user (GitHub/Externals follow user_id).
 *
 * Flow:
 *  1. Verify SIWE-shaped Bitcode message + signature recovers the address
 *  2. Ensure wallet-email auth principal; find all users already bound to A
 *  3. Choose canonical user (wallet-email > GitHub owner > oldest bound)
 *  4. Always mint session tokens for the canonical user (switch if needed)
 *  5. Re-home orphan GitHub rows onto canonical when safe
 *  6. Persist wallet binding + user_connections on canonical only
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
import {
  connectionDataMatchesEthereumAddress,
  ETHEREUM_WALLET_CONNECTION_PROVIDERS,
  mergeBoundWalletUserRows,
  normalizeEthereumAddress,
  profileSettingsMatchEthereumAddress,
  resolveCanonicalEthereumWalletUserId,
  type BoundWalletUserRow,
} from '@/app/api/wallet/wallet-ethereum-canonical-user';

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

  const link = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: input.email,
  });
  if (link.error || !link.data.user) {
    throw new Error(link.error?.message ?? 'Failed to resolve existing Ethereum wallet auth user.');
  }

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

async function findUsersBoundToEthereumAddress(address: string): Promise<BoundWalletUserRow[]> {
  const normalized = normalizeEthereumAddress(address);
  const rows: BoundWalletUserRow[] = [];

  const { data: connections, error: connectionsError } = await supabaseAdmin
    .from('user_connections')
    .select('user_id, provider, is_active, created_at, connection_data')
    .in('provider', [...ETHEREUM_WALLET_CONNECTION_PROVIDERS, 'github']);

  if (connectionsError) {
    throw new Error(`Failed to scan wallet connections: ${connectionsError.message}`);
  }

  const ethOwners = new Map<string, BoundWalletUserRow>();
  const githubOwners = new Set<string>();

  for (const row of connections ?? []) {
    const userId = typeof row.user_id === 'string' ? row.user_id : null;
    if (!userId) continue;
    const provider = typeof row.provider === 'string' ? row.provider.toLowerCase() : '';
    if (provider === 'github' && row.is_active !== false) {
      githubOwners.add(userId);
      continue;
    }
    if (!(ETHEREUM_WALLET_CONNECTION_PROVIDERS as readonly string[]).includes(provider)) {
      continue;
    }
    if (!connectionDataMatchesEthereumAddress(row.connection_data, normalized)) {
      continue;
    }
    const boundAt = typeof row.created_at === 'string' ? row.created_at : null;
    const existing = ethOwners.get(userId);
    if (!existing) {
      ethOwners.set(userId, {
        userId,
        boundAt,
        hasActiveGithub: false,
      });
    } else if (boundAt && (!existing.boundAt || Date.parse(boundAt) < Date.parse(existing.boundAt))) {
      ethOwners.set(userId, { ...existing, boundAt });
    }
  }

  // Profile settings may hold the binding without a connection row yet.
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('user_profiles')
    .select('id, created_at, settings')
    .limit(500);

  if (profilesError) {
    throw new Error(`Failed to scan wallet profiles: ${profilesError.message}`);
  }

  for (const profile of profiles ?? []) {
    const userId = typeof profile.id === 'string' ? profile.id : null;
    if (!userId) continue;
    if (!profileSettingsMatchEthereumAddress(profile.settings, normalized)) continue;
    const boundAt = typeof profile.created_at === 'string' ? profile.created_at : null;
    const existing = ethOwners.get(userId);
    if (!existing) {
      ethOwners.set(userId, { userId, boundAt, hasActiveGithub: false });
    } else if (boundAt && (!existing.boundAt || Date.parse(boundAt) < Date.parse(existing.boundAt))) {
      ethOwners.set(userId, { ...existing, boundAt });
    }
  }

  for (const [userId, row] of ethOwners) {
    rows.push({
      ...row,
      hasActiveGithub: githubOwners.has(userId),
    });
  }

  // Also mark github on bound users discovered only via profile
  return mergeBoundWalletUserRows(rows);
}

async function resolveAuthEmailForUserId(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !data?.user) return null;
  const email = data.user.email;
  return typeof email === 'string' && email.trim() ? email.trim() : null;
}

/**
 * Move active GitHub connection rows from non-canonical owners onto canonical
 * when canonical does not already have GitHub. Fail-closed: leave source row
 * if update fails.
 */
async function rehomeGithubConnectionsToCanonical(input: {
  canonicalUserId: string;
  boundUserIds: string[];
}): Promise<{ rehomed: number }> {
  const donorIds = input.boundUserIds.filter((id) => id !== input.canonicalUserId);
  if (!donorIds.length) return { rehomed: 0 };

  const { data: canonicalGithub } = await supabaseAdmin
    .from('user_connections')
    .select('id, connection_data')
    .eq('user_id', input.canonicalUserId)
    .eq('provider', 'github')
    .maybeSingle();

  const canonicalHasInstall = (() => {
    const data = asRecord(canonicalGithub?.connection_data);
    if (!data) return Boolean(canonicalGithub?.id);
    return Boolean(data.installation_id || data.installationId);
  })();

  if (canonicalHasInstall) return { rehomed: 0 };

  const { data: donors, error } = await supabaseAdmin
    .from('user_connections')
    .select('id, user_id, connection_data, is_active, created_at, updated_at')
    .eq('provider', 'github')
    .in('user_id', donorIds);

  if (error || !donors?.length) return { rehomed: 0 };

  // Prefer donor with installation_id
  const ranked = [...donors].sort((a, b) => {
    const aData = asRecord(a.connection_data);
    const bData = asRecord(b.connection_data);
    const aHas = aData?.installation_id || aData?.installationId ? 1 : 0;
    const bHas = bData?.installation_id || bData?.installationId ? 1 : 0;
    return bHas - aHas;
  });

  const donor = ranked[0];
  if (!donor?.id) return { rehomed: 0 };

  const now = new Date().toISOString();
  const { error: upsertError } = await supabaseAdmin.from('user_connections').upsert(
    {
      user_id: input.canonicalUserId,
      provider: 'github',
      is_active: true,
      connection_data: donor.connection_data,
      updated_at: now,
      created_at: typeof donor.created_at === 'string' ? donor.created_at : now,
    },
    { onConflict: 'user_id,provider' },
  );

  if (upsertError) {
    bitcodeServerTelemetry('warn', 'wallet-session', 'rehome-github-failed', {
      canonicalUserId: compactBitcodeServerId(input.canonicalUserId),
      donorUserId: compactBitcodeServerId(String(donor.user_id)),
      message: upsertError.message.slice(0, 160),
    });
    return { rehomed: 0 };
  }

  // Deactivate donor github so only one active owner remains.
  await supabaseAdmin
    .from('user_connections')
    .update({ is_active: false, updated_at: now })
    .eq('id', donor.id);

  bitcodeServerTelemetry('info', 'wallet-session', 'rehome-github', {
    canonicalUserId: compactBitcodeServerId(input.canonicalUserId),
    donorUserId: compactBitcodeServerId(String(donor.user_id)),
  });

  return { rehomed: 1 };
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

  const address = normalizeEthereumAddress(verification.address);
  const walletEmail = buildEthereumWalletAuthEmail(address);

  const existingClient = await createClient();
  const {
    data: { user: existingUser },
  } = await existingClient.auth.getUser();
  const previousUserId = existingUser?.id ?? null;

  let sessionUserId: string;
  let sessionPayload: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    expires_at?: number;
    token_type?: string;
  };
  let sessionSwitched = false;
  let rehomedGithub = 0;

  try {
    // 1) Ensure deterministic wallet-email principal exists.
    const walletEmailUser = await ensureEthereumWalletUser({
      email: walletEmail,
      address,
      provider,
      network,
    });
    const walletEmailUserId = walletEmailUser.user.id;

    // 2) Discover every user already bound to this address + GitHub owners.
    const boundUsers = await findUsersBoundToEthereumAddress(address);
    // Wallet-email principal is always a candidate owner.
    const candidates = mergeBoundWalletUserRows([
      ...boundUsers,
      {
        userId: walletEmailUserId,
        boundAt: null,
        hasActiveGithub: boundUsers.some(
          (row) => row.userId === walletEmailUserId && row.hasActiveGithub,
        ),
      },
    ]);

    // Refresh github flag for wallet-email user from bound list
    const githubIds = new Set(
      boundUsers.filter((row) => row.hasActiveGithub).map((row) => row.userId),
    );
    const candidatesWithGithub = candidates.map((row) => ({
      ...row,
      hasActiveGithub: row.hasActiveGithub || githubIds.has(row.userId),
    }));

    // 3) Canonical: prefer wallet-email principal when present (always is after ensure).
    //    If we only used resolve with walletEmailUserId set, we never pick GitHub-only
    //    legacy users — re-home step moves GitHub onto wallet-email principal.
    const canonicalUserId =
      resolveCanonicalEthereumWalletUserId({
        walletEmailUserId,
        boundUsers: candidatesWithGithub,
      }) ?? walletEmailUserId;

    sessionSwitched = Boolean(previousUserId && previousUserId !== canonicalUserId);

    // 4) Mint session for canonical (always return tokens — Connect = authenticate).
    let mintEmail = walletEmail;
    if (canonicalUserId !== walletEmailUserId) {
      const authEmail = await resolveAuthEmailForUserId(canonicalUserId);
      if (!authEmail) {
        throw new Error(
          'Canonical wallet user has no auth email; cannot mint Bitcode session.',
        );
      }
      mintEmail = authEmail;
    }

    const minted = await mintSessionTokensForEmail(mintEmail);
    if (!minted.user?.id) {
      throw new Error('Session mint did not return a Bitcode user.');
    }
    // Session subject is whoever we minted for (wallet-email principal, or
    // legacy canonical user's auth email when they are not the wallet-email user).
    sessionUserId = minted.user.id;

    sessionPayload = {
      access_token: minted.session.access_token,
      refresh_token: minted.session.refresh_token,
      expires_in: minted.session.expires_in,
      expires_at: minted.session.expires_at,
      token_type: minted.session.token_type,
    };

    // 5) Re-home GitHub from other bound users onto the authenticated principal.
    const rehome = await rehomeGithubConnectionsToCanonical({
      canonicalUserId: sessionUserId,
      boundUserIds: candidatesWithGithub.map((row) => row.userId),
    });
    rehomedGithub = rehome.rehomed;

    bitcodeServerTelemetry('info', 'wallet-session', 'session-minted', {
      userId: compactBitcodeServerId(sessionUserId),
      address: compactBitcodeServerId(address),
      provider,
      sessionSwitched,
      previousUserId: previousUserId
        ? compactBitcodeServerId(previousUserId)
        : null,
      rehomedGithub,
      boundOwnerCount: candidatesWithGithub.length,
    });
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
    sessionEstablished: true,
    sessionSwitched,
    rehomedGithub,
  });

  return NextResponse.json(
    {
      success: true,
      sessionEstablished: true,
      sessionSwitched,
      canonicalUserId: sessionUserId,
      rehomedGithub,
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
          sessionSwitched,
        },
      },
    },
    { status: 201 },
  );
}
