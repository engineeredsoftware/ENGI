/**
 * Public marketing waitlist intake.
 *
 * 1. Persists email + optional multi-select roles via service role.
 * 2. Renders `supabase/templates/waitlist.html` (app-mail {{var}} SSOT).
 * 3. Sends via Supabase Edge Function `resend` (Resend API) with kind=waitlist
 *    so From uses RESEND_WAITLIST_FROM_EMAIL.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@bitcode/supabase';
import { validateWaitlistSubmit } from '@/components/marketing/MarketingLandingWaitlist/marketing-waitlist-validate';
import {
  WAITLIST_EMAIL_SUBJECT,
  buildWaitlistTemplateVars,
  renderSupabaseEmailTemplate,
} from '@/lib/render-supabase-email-template';

export const runtime = 'nodejs';

const WAITLIST_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
  'https://bitcode.exchange';

function resolveResendFunctionUrl(): string | null {
  const explicit = process.env.BITCODE_RESEND_FUNCTION_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const base =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/functions/v1/resend`;
}

function resolveServiceBearer(): string | null {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_ADMIN_KEY?.trim() ||
    null
  );
}

/**
 * Render waitlist.html then POST raw HTML to Edge Function `resend`.
 */
async function sendWaitlistEmailViaResend(input: {
  email: string;
  roles: string[];
  source: string;
}): Promise<{ ok: true; emailSent: boolean; id?: string } | { ok: false; error: string }> {
  const url = resolveResendFunctionUrl();
  const bearer = resolveServiceBearer();
  if (!url || !bearer) {
    console.error('waitlist resend: missing SUPABASE URL or service role key');
    return { ok: false, error: 'resend_not_configured' };
  }

  let html: string;
  try {
    html = await renderSupabaseEmailTemplate(
      'waitlist',
      buildWaitlistTemplateVars({
        email: input.email,
        roles: input.roles,
        siteUrl: WAITLIST_SITE_URL,
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('waitlist template render failed', message);
    return { ok: false, error: `template_render_failed: ${message}` };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        apikey: bearer,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kind: 'waitlist',
        to: input.email,
        subject: WAITLIST_EMAIL_SUBJECT,
        html,
      }),
      ...(typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
        ? { signal: AbortSignal.timeout(20_000) }
        : {}),
    });

    const payload = (await res.json().catch(() => null)) as {
      ok?: boolean;
      id?: string;
      messageId?: string;
      error?: string;
      detail?: unknown;
    } | null;

    if (!res.ok || payload?.ok === false) {
      const detail =
        payload?.error ||
        (typeof payload?.detail === 'string' ? payload.detail : null) ||
        `HTTP ${res.status}`;
      console.error('waitlist resend edge failed', res.status, payload);
      return { ok: false, error: String(detail) };
    }

    return {
      ok: true,
      emailSent: true,
      id: payload?.id || payload?.messageId,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('waitlist resend invoke failed', message);
    return { ok: false, error: message };
  }
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const validated = validateWaitlistSubmit({
    email: record.email,
    roles: record.roles,
    role: record.role,
    website: record.website,
  });

  if (!validated.ok) {
    if (validated.reason === 'honeypot') {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { ok: false, error: validated.reason },
      { status: 400 },
    );
  }

  const source =
    typeof record.source === 'string' && record.source.trim()
      ? record.source.trim().slice(0, 64)
      : 'landing';

  const { error: insertError } = await supabaseAdmin.from('marketing_waitlist').insert({
    email: validated.email,
    roles: validated.roles,
    source,
  });

  if (insertError) {
    const code = String((insertError as { code?: string }).code || '');
    const message = String((insertError as { message?: string }).message || '');
    if (code === '23505' || /duplicate|unique/i.test(message)) {
      return NextResponse.json({ ok: true, alreadyJoined: true });
    }
    console.error('waitlist insert failed', code, message);
    return NextResponse.json({ ok: false, error: 'store_failed' }, { status: 503 });
  }

  const mail = await sendWaitlistEmailViaResend({
    email: validated.email,
    roles: validated.roles,
    source,
  });

  if (!mail.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: 'email_send_failed',
        detail: mail.error,
        stored: true,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyJoined: false,
    emailSent: mail.emailSent,
    messageId: mail.id ?? null,
  });
}
