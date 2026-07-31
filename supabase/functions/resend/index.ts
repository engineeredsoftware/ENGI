/**
 * Supabase Edge Function: send email via Resend API.
 *
 * Secrets (Dashboard → Edge Functions → Secrets, or CLI):
 *   RESEND_API_KEY                (required)
 *   RESEND_WAITLIST_FROM_EMAIL    waitlist-only From (e.g. waitlist@bitcode.exchange)
 *   RESEND_FROM_EMAIL             general/product From (e.g. noreply@bitcode.exchange)
 *   RESEND_FROM_NAME              display name (default Bitcode)
 *
 * Waitlist template always uses RESEND_WAITLIST_FROM_EMAIL (not general).
 * Raw sends use RESEND_FROM_EMAIL unless body.from is set.
 *
 * Deploy:
 *   supabase secrets set RESEND_API_KEY=re_... \
 *     RESEND_WAITLIST_FROM_EMAIL=waitlist@bitcode.exchange \
 *     RESEND_FROM_EMAIL=noreply@bitcode.exchange
 *   supabase functions deploy resend
 *
 * Invoke (service role or user JWT):
 *   POST /functions/v1/resend
 *   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *   Body (waitlist template):
 *     { "template": "waitlist", "to": "you@co.com", "vars": { "roles": ["seller"] } }
 *   Body (raw):
 *     { "to": "you@co.com", "subject": "…", "html": "<p>…</p>" }
 *
 * Guide: https://resend.com/docs/send-with-supabase-edge-functions
 */

const RESEND_API = 'https://api.resend.com/emails';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

type Json = Record<string, unknown>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param kind waitlist → RESEND_WAITLIST_FROM_EMAIL only (not general noreply).
 *             general → RESEND_FROM_EMAIL for product/raw mail.
 */
function resolveFrom(kind: 'waitlist' | 'general' = 'general'): string {
  const waitlistEmail = (
    Deno.env.get('RESEND_WAITLIST_FROM_EMAIL') ||
    // Legacy: some envs only set RESEND_FROM_EMAIL=waitlist@… — treat as waitlist.
    Deno.env.get('RESEND_FROM_EMAIL') ||
    'waitlist@bitcode.exchange'
  ).trim();
  const generalEmail = (
    Deno.env.get('RESEND_FROM_EMAIL') ||
    'noreply@bitcode.exchange'
  ).trim();
  // Prefer dedicated waitlist secret; never invent general as waitlist@ unless configured.
  const dedicatedWaitlist = Deno.env.get('RESEND_WAITLIST_FROM_EMAIL')?.trim();
  const email =
    kind === 'waitlist'
      ? dedicatedWaitlist || waitlistEmail
      : generalEmail;
  const name = (Deno.env.get('RESEND_FROM_NAME') || 'Bitcode').trim();
  if (!name) return email;
  return `${name} <${email}>`;
}

function normalizeTo(value: unknown): string[] | null {
  if (typeof value === 'string' && value.trim()) {
    return [value.trim().toLowerCase()];
  }
  if (Array.isArray(value)) {
    const list = value
      .map((v) => String(v ?? '').trim().toLowerCase())
      .filter(Boolean);
    return list.length > 0 ? list : null;
  }
  return null;
}

function buildWaitlistHtml(vars: Json): { subject: string; html: string } {
  const email = escapeHtml(String(vars.email || vars.to || ''));
  const siteUrl = escapeHtml(
    String(vars.siteUrl || vars.site_url || 'https://bitcode.exchange').replace(
      /\/$/,
      '',
    ),
  );
  const rolesRaw = Array.isArray(vars.roles) ? vars.roles : [];
  const roleLabels = rolesRaw
    .map((r) => String(r))
    .filter(Boolean)
    .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
    .join(' · ');
  const rolesLine = roleLabels
    ? `<p class="meta">Lanes: <strong>${escapeHtml(roleLabels)}</strong></p>`
    : '';
  const year = new Date().getUTCFullYear();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to the Bitcode waitlist</title>
  <style>
    body { margin:0; padding:0; background:#f1f5f9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; line-height:1.55; color:#0f172a; }
    .wrap { max-width:560px; margin:0 auto; padding:32px 16px 48px; }
    .card { background:#ffffff; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 12px 40px rgba(15,23,42,0.06); }
    .header { padding:28px 28px 12px; text-align:center; border-bottom:1px solid #e2e8f0; background:linear-gradient(180deg,#f0fdf7 0%,#ffffff 70%); }
    .brand { margin:10px 0 0; font-size:13px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:#047857; }
    .body { padding:28px; }
    h1 { margin:0 0 12px; font-size:22px; font-weight:650; letter-spacing:-0.02em; color:#0f172a; }
    p { margin:0 0 14px; font-size:15px; color:#334155; }
    strong { color:#0f172a; }
    a { color:#059669; }
    .btn { display:inline-block; padding:13px 28px; background:#067a4f; color:#ecfdf5 !important; text-decoration:none; font-weight:600; font-size:14px; letter-spacing:0.02em; border:1px solid #065f46; }
    .btn-row { text-align:center; margin:24px 0 8px; }
    .muted { font-size:13px; color:#64748b; margin-top:20px; }
    .meta { margin:4px 0; font-size:14px; color:#475569; }
    .footer { padding:18px 28px 24px; border-top:1px solid #e2e8f0; text-align:center; font-size:12px; color:#94a3b8; background:#fafafa; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <div class="brand">Bitcode</div>
      </div>
      <div class="body">
        <h1>Welcome to the Bitcode waitlist</h1>
        <p>You're on the list for <strong>${email || 'priority access'}</strong>. We'll email when your lane opens for minting, finding, and trading measured DataPacks.</p>
        ${rolesLine}
        <div class="btn-row"><a class="btn" href="${siteUrl}">Open Bitcode</a></div>
        <p class="muted">Wallet identity remains the account root — this email is for launch and priority access notes only (unless they're pair-connected).</p>
      </div>
      <div class="footer">
        © ${year} Bitcode · Source-bearing value exchange<br />
        You received this because you requested Bitcode priority access.
      </div>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: 'Welcome to the Bitcode waitlist',
    html,
  };
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'POST required' }, 405);
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')?.trim();
  if (!apiKey) {
    return jsonResponse(
      { error: 'RESEND_API_KEY not configured on Edge Function secrets' },
      503,
    );
  }

  let body: Json = {};
  try {
    body = (await req.json()) as Json;
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const to = normalizeTo(body.to ?? body.email);
  if (!to) {
    return jsonResponse({ error: 'to (email) required' }, 400);
  }

  const template =
    typeof body.template === 'string' ? body.template.trim().toLowerCase() : '';
  const vars =
    body.vars && typeof body.vars === 'object' && !Array.isArray(body.vars)
      ? (body.vars as Json)
      : {};

  let subject: string;
  let html: string;
  let text: string | undefined;

  if (template === 'waitlist') {
    const built = buildWaitlistHtml({
      ...vars,
      email: vars.email || to[0],
    });
    subject =
      typeof body.subject === 'string' && body.subject.trim()
        ? body.subject.trim()
        : built.subject;
    html = built.html;
  } else if (
    typeof body.subject === 'string' &&
    body.subject.trim() &&
    typeof body.html === 'string' &&
    body.html.trim()
  ) {
    subject = body.subject.trim();
    html = body.html;
    if (typeof body.text === 'string' && body.text.trim()) {
      text = body.text;
    }
  } else {
    return jsonResponse(
      {
        error:
          'Provide template "waitlist" or raw { subject, html }. Optional vars for waitlist.',
      },
      400,
    );
  }

  const from =
    typeof body.from === 'string' && body.from.trim()
      ? body.from.trim()
      : resolveFrom(template === 'waitlist' ? 'waitlist' : 'general');

  const payload: Json = {
    from,
    to,
    subject,
    html,
  };
  if (text) payload.text = text;
  if (typeof body.reply_to === 'string' && body.reply_to.trim()) {
    payload.reply_to = body.reply_to.trim();
  }

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('resend api error', res.status, data);
      return jsonResponse(
        {
          ok: false,
          error: 'resend_failed',
          status: res.status,
          detail: data,
        },
        502,
      );
    }

    return jsonResponse({
      ok: true,
      id: (data as Json).id ?? null,
      messageId: (data as Json).id ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('resend invoke failed', message);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
