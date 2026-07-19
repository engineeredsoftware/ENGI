/**
 * Update a rostered team member's role (owner/admin only).
 */

import { NextResponse } from 'next/server';

import {
  hydrateBitcodeProfile,
  mergeBitcodeProfileSettings,
} from '@bitcode/orm';
import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

export const runtime = 'nodejs';

const ASSIGNABLE_ROLES = new Set(['admin', 'lead', 'dev']);

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user || error) return null;
  return user;
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

  const memberId = typeof body.memberId === 'string' ? body.memberId.trim() : '';
  const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : '';

  if (!memberId) {
    return NextResponse.json({ error: 'memberId is required.' }, { status: 400 });
  }
  if (!ASSIGNABLE_ROLES.has(role)) {
    return NextResponse.json({ error: 'Role must be admin, lead, or dev.' }, { status: 400 });
  }

  const { data: existingProfile, error: profileReadError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileReadError) {
    return NextResponse.json({ error: profileReadError.message }, { status: 500 });
  }

  const hydrated = hydrateBitcodeProfile(existingProfile) as Record<string, any> | null;
  const existingMembers: Array<Record<string, any>> = Array.isArray(hydrated?.team_members)
    ? hydrated!.team_members
    : Array.isArray((existingProfile as any)?.settings?.teamMembers)
      ? (existingProfile as any).settings.teamMembers
      : [];

  const target = existingMembers.find((m) => String(m?.id) === memberId);
  if (!target) {
    return NextResponse.json({ error: 'Member not found on the roster.' }, { status: 404 });
  }
  if (target.role === 'owner' || memberId === '1') {
    return NextResponse.json({ error: 'The organization owner role cannot be changed here.' }, { status: 403 });
  }

  const nextMembers = existingMembers.map((m) =>
    String(m?.id) === memberId ? { ...m, role } : m,
  );
  const settings = mergeBitcodeProfileSettings(existingProfile?.settings, {
    teamMembers: nextMembers as any,
  });

  const username =
    (typeof existingProfile?.username === 'string' && existingProfile.username.trim()
      ? existingProfile.username.trim()
      : null) ||
    (typeof user.email === 'string' && user.email.includes('@')
      ? user.email.split('@')[0]
      : user.id.slice(0, 12));

  const { error: upsertError } = await supabaseAdmin.from('user_profiles').upsert(
    {
      id: user.id,
      username,
      display_name: existingProfile?.display_name ?? null,
      bio: existingProfile?.bio ?? null,
      avatar_url: existingProfile?.avatar_url ?? null,
      role: existingProfile?.role ?? 'user',
      onboarded_steps: existingProfile?.onboarded_steps ?? null,
      settings,
      updated_at: new Date().toISOString(),
      created_at: existingProfile?.created_at ?? new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  const updated = nextMembers.find((m) => String(m?.id) === memberId);
  return NextResponse.json({ ok: true, member: updated });
}
