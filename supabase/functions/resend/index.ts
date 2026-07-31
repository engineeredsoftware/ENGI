/**
 * Supabase Edge Function: thin Resend API sender.
 *
 * HTML is rendered by the app (e.g. uapi reads `supabase/templates/*.html`).
 * This function only posts to Resend — no embedded waitlist HTML.
 *
 * Secrets:
 *   RESEND_API_KEY                (required)
 *   RESEND_WAITLIST_FROM_EMAIL    waitlist-only From (kind=waitlist)
 *   RESEND_FROM_EMAIL             general/product From
 *   RESEND_FROM_NAME              display name (default Bitcode)
 *
 * POST /functions/v1/resend
 *   { "to", "subject", "html", "kind"?: "waitlist" | "general", "text"?, "from"?, "reply_to"? }
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

/**
 * @param kind waitlist → RESEND_WAITLIST_FROM_EMAIL only (not general noreply).
 */
function resolveFrom(kind: 'waitlist' | 'general' = 'general'): string {
  const dedicatedWaitlist = Deno.env.get('RESEND_WAITLIST_FROM_EMAIL')?.trim();
  const generalEmail = (
    Deno.env.get('RESEND_FROM_EMAIL') ||
    'noreply@bitcode.exchange'
  ).trim();
  // Legacy: only RESEND_FROM_EMAIL=waitlist@… set on older deploys
  const legacyFrom = Deno.env.get('RESEND_FROM_EMAIL')?.trim();
  const email =
    kind === 'waitlist'
      ? dedicatedWaitlist ||
        legacyFrom ||
        'waitlist@bitcode.exchange'
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

  const subject =
    typeof body.subject === 'string' ? body.subject.trim() : '';
  const html = typeof body.html === 'string' ? body.html : '';
  if (!subject || !html.trim()) {
    return jsonResponse(
      {
        error:
          'subject and html required (render supabase/templates in the app, then POST raw HTML)',
      },
      400,
    );
  }

  const kindRaw =
    typeof body.kind === 'string' ? body.kind.trim().toLowerCase() : '';
  // Back-compat: template:"waitlist" without html was old path; prefer kind.
  const templateRaw =
    typeof body.template === 'string' ? body.template.trim().toLowerCase() : '';
  const kind: 'waitlist' | 'general' =
    kindRaw === 'waitlist' || templateRaw === 'waitlist' ? 'waitlist' : 'general';

  const from =
    typeof body.from === 'string' && body.from.trim()
      ? body.from.trim()
      : resolveFrom(kind);

  const payload: Json = {
    from,
    to,
    subject,
    html,
  };
  if (typeof body.text === 'string' && body.text.trim()) {
    payload.text = body.text;
  }
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
