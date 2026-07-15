import { NextResponse } from 'next/server';

import {
  hydrateBitcodeProfile,
  mergeBitcodeProfileSettings,
  readBitcodeWalletBindingFromProfile,
} from '@bitcode/orm';
import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

export const runtime = 'nodejs';

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return null;
  }

  return user;
}

type WalletBindingStatus = 'pending' | 'manual' | 'verified';

function hasOwn(body: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(body, key);
}

function readStringField(
  body: Record<string, unknown>,
  ...keys: string[]
): { provided: boolean; value: string | null; invalid: boolean } {
  for (const key of keys) {
    if (!hasOwn(body, key)) {
      continue;
    }

    const value = body[key];
    if (value === null) {
      return { provided: true, value: null, invalid: false };
    }

    if (typeof value !== 'string') {
      return { provided: true, value: null, invalid: true };
    }

    const trimmed = value.trim();
    return { provided: true, value: trimmed || null, invalid: false };
  }

  return { provided: false, value: null, invalid: false };
}

function readBooleanField(
  body: Record<string, unknown>,
  ...keys: string[]
): { provided: boolean; value: boolean | null; invalid: boolean } {
  for (const key of keys) {
    if (!hasOwn(body, key)) {
      continue;
    }

    const value = body[key];
    if (value === null) {
      return { provided: true, value: null, invalid: false };
    }

    if (typeof value !== 'boolean') {
      return { provided: true, value: null, invalid: true };
    }

    return { provided: true, value, invalid: false };
  }

  return { provided: false, value: null, invalid: false };
}

function readArrayField(
  body: Record<string, unknown>,
  ...keys: string[]
): { provided: boolean; value: unknown[] | null; invalid: boolean } {
  for (const key of keys) {
    if (!hasOwn(body, key)) {
      continue;
    }

    const value = body[key];
    if (value === null) {
      return { provided: true, value: [], invalid: false };
    }

    if (!Array.isArray(value)) {
      return { provided: true, value: null, invalid: true };
    }

    return { provided: true, value, invalid: false };
  }

  return { provided: false, value: null, invalid: false };
}

function normalizeWalletBindingStatus(value: string | null): WalletBindingStatus | null {
  if (value === 'pending' || value === 'manual' || value === 'verified') {
    return value;
  }

  if (value === 'bound') {
    return 'manual';
  }

  return null;
}

function isProviderManagedWalletBindingStatus(
  value: WalletBindingStatus | null | undefined,
): value is 'pending' | 'verified' {
  return value === 'pending' || value === 'verified';
}

function normalizeProfilePayload(body: Record<string, unknown>) {
  const username =
    typeof body.username === 'string' && body.username.trim()
      ? body.username.trim()
      : typeof body.email === 'string' && body.email.includes('@')
        ? body.email.split('@')[0]
        : '';

  const displayNameField = readStringField(body, 'displayName', 'display_name');
  const bioField = readStringField(body, 'bio');
  const avatarUrlField = readStringField(body, 'avatarUrl', 'avatar_url');
  const companyNameField = readStringField(body, 'companyName', 'company_name');
  const emailField = readStringField(body, 'email');
  const isVerifiedField = readBooleanField(body, 'isVerified', 'is_verified');
  const teamMembersField = readArrayField(body, 'teamMembers', 'team_members');
  const walletAddressField = readStringField(body, 'walletAddress', 'wallet_address');
  const walletProviderField = readStringField(body, 'walletProvider', 'wallet_provider');
  const walletStatusField = readStringField(body, 'walletBindingStatus', 'wallet_binding_status');
  const walletBoundAtField = readStringField(body, 'walletBoundAt', 'wallet_bound_at');

  const invalidField =
    displayNameField.invalid ||
    bioField.invalid ||
    avatarUrlField.invalid ||
    companyNameField.invalid ||
    emailField.invalid ||
    isVerifiedField.invalid ||
    teamMembersField.invalid ||
    walletAddressField.invalid ||
    walletProviderField.invalid ||
    walletStatusField.invalid ||
    walletBoundAtField.invalid;

  const walletBindingStatus = normalizeWalletBindingStatus(walletStatusField.value);

  if (walletStatusField.provided && !walletBindingStatus && walletStatusField.value !== null) {
    return {
      username,
      invalid: true,
      error: 'walletBindingStatus must be "pending", "manual", or "verified" when provided',
    };
  }

  if (invalidField) {
    return {
      username,
      invalid: true,
      error: 'Profile fields must use the expected string, boolean, or array shapes',
    };
  }

  return {
    username,
    invalid: false,
    display_name: displayNameField.provided ? displayNameField.value : undefined,
    bio: bioField.provided ? bioField.value : undefined,
    avatar_url: avatarUrlField.provided ? avatarUrlField.value : undefined,
    company_name: companyNameField.provided ? companyNameField.value : undefined,
    team_members: teamMembersField.provided ? teamMembersField.value : undefined,
    email: emailField.provided ? emailField.value : undefined,
    is_verified: isVerifiedField.provided ? isVerifiedField.value : undefined,
    wallet_address: walletAddressField.provided ? walletAddressField.value : undefined,
    wallet_address_provided: walletAddressField.provided,
    wallet_provider: walletProviderField.provided ? walletProviderField.value : undefined,
    wallet_provider_provided: walletProviderField.provided,
    wallet_binding_status:
      walletStatusField.provided || walletAddressField.provided
        ? walletBindingStatus ?? (walletAddressField.value ? 'manual' : null)
        : undefined,
    wallet_binding_status_provided: walletStatusField.provided,
    wallet_bound_at: walletBoundAtField.provided ? walletBoundAtField.value : undefined,
    wallet_bound_at_provided: walletBoundAtField.provided,
  };
}

export async function GET(_request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(hydrateBitcodeProfile(data));
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const normalized = normalizeProfilePayload(body);
  if (normalized.invalid) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  if (!normalized.username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const { data: existingProfile, error: profileReadError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileReadError) {
    return NextResponse.json({ error: profileReadError.message }, { status: 500 });
  }

  const existingWalletBinding = readBitcodeWalletBindingFromProfile(existingProfile);
  const walletBindingTouched =
    normalized.wallet_address_provided ||
    normalized.wallet_provider_provided ||
    normalized.wallet_binding_status_provided ||
    normalized.wallet_bound_at_provided;
  const preservingProviderManagedWalletBinding =
    Boolean(existingWalletBinding) &&
    isProviderManagedWalletBindingStatus(existingWalletBinding?.status) &&
    (!normalized.wallet_address_provided || normalized.wallet_address === existingWalletBinding?.address) &&
    (!normalized.wallet_provider_provided || normalized.wallet_provider === existingWalletBinding?.provider) &&
    (!normalized.wallet_bound_at_provided || normalized.wallet_bound_at === existingWalletBinding?.boundAt) &&
    (!normalized.wallet_binding_status_provided || normalized.wallet_binding_status === existingWalletBinding?.status);

  if (
    normalized.wallet_binding_status_provided &&
    isProviderManagedWalletBindingStatus(normalized.wallet_binding_status) &&
    !preservingProviderManagedWalletBinding
  ) {
    return NextResponse.json(
      {
        error:
          'Provider-managed wallet signer posture cannot be asserted from the Profile route. Connect a wallet provider to stage or verify signing.',
      },
      { status: 400 },
    );
  }

  const nextWalletBinding =
    !walletBindingTouched
      ? undefined
      : normalized.wallet_address
        ? preservingProviderManagedWalletBinding
          ? {
              ...existingWalletBinding,
              address: existingWalletBinding?.address ?? normalized.wallet_address,
              provider: existingWalletBinding?.provider ?? normalized.wallet_provider ?? null,
              status: existingWalletBinding?.status ?? normalized.wallet_binding_status ?? 'manual',
              boundAt:
                existingWalletBinding?.boundAt ??
                normalized.wallet_bound_at ??
                new Date().toISOString(),
            }
          : {
              address: normalized.wallet_address,
              provider: normalized.wallet_provider ?? existingWalletBinding?.provider ?? null,
              status: normalized.wallet_binding_status ?? 'manual',
              boundAt:
                normalized.wallet_bound_at ??
                (existingWalletBinding?.status === 'manual' &&
                existingWalletBinding.address === normalized.wallet_address &&
                existingWalletBinding.provider === (normalized.wallet_provider ?? existingWalletBinding?.provider ?? null)
                  ? existingWalletBinding.boundAt
                  : new Date().toISOString()),
            }
        : null;

  const settings = mergeBitcodeProfileSettings(existingProfile?.settings, {
    companyName: normalized.company_name,
    teamMembers: normalized.team_members as any,
    email: normalized.email,
    isVerified: normalized.is_verified,
    walletBinding: nextWalletBinding,
  });

  const { error } = await supabaseAdmin.from('user_profiles').upsert(
    {
      id: user.id,
      username: normalized.username,
      display_name: normalized.display_name ?? existingProfile?.display_name ?? null,
      bio: normalized.bio ?? existingProfile?.bio ?? null,
      avatar_url: normalized.avatar_url ?? existingProfile?.avatar_url ?? null,
      role: existingProfile?.role ?? 'user',
      onboarded_steps: existingProfile?.onboarded_steps ?? null,
      settings,
      updated_at: new Date().toISOString(),
      created_at: existingProfile?.created_at ?? new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
