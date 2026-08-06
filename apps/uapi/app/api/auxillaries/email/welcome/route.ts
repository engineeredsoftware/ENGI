import { NextResponse } from 'next/server';

import { sendEmail } from '@bitcode/notifications';
import { createClient } from '@bitcode/supabase/ssr/server';

export const runtime = 'nodejs';

/**
 * Send a one-shot welcome email after profile email verification.
 * Best-effort: missing SMTP stubs in dev; failures do not block the client.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!user || error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let bodyEmail = '';
    let bodyName = '';
    try {
      const body = (await request.json()) as { email?: string; name?: string };
      if (typeof body?.email === 'string') bodyEmail = body.email.trim();
      if (typeof body?.name === 'string') bodyName = body.name.trim();
    } catch {
      // empty body is fine
    }

    const to = (user.email || bodyEmail || '').trim();
    if (!to) {
      return NextResponse.json({ error: 'No email on account' }, { status: 400 });
    }

    const name =
      bodyName ||
      (typeof user.user_metadata?.display_name === 'string' &&
        user.user_metadata.display_name.trim()) ||
      (typeof user.user_metadata?.full_name === 'string' &&
        user.user_metadata.full_name.trim()) ||
      to.split('@')[0] ||
      'there';

    const origin = new URL(request.url).origin;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

    await sendEmail({
      to,
      subject: 'Welcome to Bitcode',
      template: 'welcome',
      vars: {
        name,
        email: to,
        appUrl,
        year: new Date().getFullYear(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[auxillaries/email/welcome]', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to send welcome email',
      },
      { status: 500 },
    );
  }
}
