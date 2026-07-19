/**
 * Team invite — persist invited roster row on the inviter profile and email
 * the invitee when a real address is provided (requires EMAIL_SMTP_URL).
 */

import { NextResponse } from 'next/server';

import {
  hydrateBitcodeProfile,
  mergeBitcodeProfileSettings,
} from '@bitcode/orm';
import { sendEmail } from '@bitcode/notifications';
import { supabaseAdmin } from '@bitcode/supabase';
import { createClient } from '@bitcode/supabase/ssr/server';

export const runtime = 'nodejs';

const INVITE_ROLES = new Set(['admin', 'lead', 'dev']);

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

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, '');
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

  const handleRaw = typeof body.username === 'string' ? body.username : typeof body.email === 'string' ? body.email : '';
  const handle = normalizeHandle(handleRaw);
  const displayName =
    typeof body.displayName === 'string' && body.displayName.trim()
      ? body.displayName.trim()
      : handle;
  const role = typeof body.role === 'string' ? body.role.trim().toLowerCase() : 'dev';

  if (!handle) {
    return NextResponse.json({ error: 'Enter a handle or email to invite.' }, { status: 400 });
  }
  if (!INVITE_ROLES.has(role)) {
    return NextResponse.json({ error: 'Invite role must be admin, lead, or dev.' }, { status: 400 });
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

  const alreadyOnRoster = existingMembers.some((member) => {
    const username = String(member?.username || member?.email || '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '');
    return username === handle;
  });

  if (alreadyOnRoster) {
    return NextResponse.json({ error: 'That person is already on the team roster.' }, { status: 409 });
  }

  const invitedMember = {
    id: `invite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: handle,
    displayName,
    role,
    status: 'invited' as const,
    email: isEmail(handle) ? handle : null,
    invitedAt: new Date().toISOString(),
  };

  const nextMembers = [...existingMembers, invitedMember];
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

  const smtpConfigured = Boolean(process.env.EMAIL_SMTP_URL?.trim());
  let emailSent = false;
  let emailSkippedReason: string | null = null;

  if (!isEmail(handle)) {
    emailSkippedReason = 'Invite needs an email address to notify the invitee.';
  } else if (!smtpConfigured) {
    // sendEmail() no-ops without EMAIL_SMTP_URL — surface that honestly.
    emailSkippedReason =
      'Email delivery is not configured on this environment (EMAIL_SMTP_URL).';
  } else {
    try {
      const origin = new URL(request.url).origin;
      const inviterName =
        (typeof existingProfile?.display_name === 'string' && existingProfile.display_name.trim()
          ? existingProfile.display_name.trim()
          : null) ||
        (typeof existingProfile?.username === 'string' && existingProfile.username.trim()
          ? existingProfile.username.trim()
          : null) ||
        user.email ||
        'A Bitcode teammate';
      const organizationName =
        (typeof (existingProfile as any)?.settings?.companyName === 'string' &&
        (existingProfile as any).settings.companyName.trim()
          ? (existingProfile as any).settings.companyName.trim()
          : null) ||
        `${inviterName}'s team`;

      await sendEmail({
        to: handle,
        subject: `You're invited to join ${organizationName} on Bitcode`,
        template: 'team_invite',
        vars: {
          inviterName,
          organizationName,
          role,
          inviteUrl: `${origin}/`,
          year: new Date().getFullYear(),
        },
      });
      emailSent = true;
    } catch (error) {
      console.error('[team/invite] email send failed', error);
      emailSkippedReason =
        error instanceof Error ? error.message : 'Invite email failed to send.';
    }
  }

  return NextResponse.json(
    {
      ok: true,
      member: invitedMember,
      emailSent,
      emailSkippedReason,
      smtpConfigured,
    },
    { status: 201 },
  );
}
