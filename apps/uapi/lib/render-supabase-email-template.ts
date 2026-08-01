/**
 * Load HTML from monorepo `supabase/templates/{name}.html` and interpolate
 * app-mail placeholders (`{{var}}` — not Supabase Auth Go templates).
 *
 * Used by waitlist (Resend via Edge) and aligned with @bitcode/notifications.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const TEMPLATE_NAME_RE = /^[a-z0-9][a-z0-9_-]*$/i;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Walk up from cwd to find `supabase/templates` (uapi or monorepo root). */
export async function resolveSupabaseTemplatesDir(
  startDir: string = process.cwd(),
): Promise<string> {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, 'supabase', 'templates');
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) return candidate;
    } catch {
      // continue
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    `supabase/templates not found walking from ${path.resolve(startDir)}`,
  );
}

export function interpolateAppEmailTemplate(
  html: string,
  vars: Record<string, string | number>,
): string {
  let out = html;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return out;
}

/**
 * Read `supabase/templates/{templateName}.html` and replace `{{key}}` vars.
 * Unknown placeholders are left as-is.
 */
export async function renderSupabaseEmailTemplate(
  templateName: string,
  vars: Record<string, string | number>,
  options?: { startDir?: string },
): Promise<string> {
  if (!TEMPLATE_NAME_RE.test(templateName)) {
    throw new Error(`invalid email template name: ${templateName}`);
  }
  const dir = await resolveSupabaseTemplatesDir(options?.startDir);
  const filePath = path.join(dir, `${templateName}.html`);
  const raw = await fs.readFile(filePath, 'utf8');
  return interpolateAppEmailTemplate(raw, vars);
}

/** Waitlist-specific vars for `waitlist.html`. */
export function buildWaitlistTemplateVars(input: {
  email: string;
  roles: string[];
  siteUrl: string;
  year?: number;
}): Record<string, string | number> {
  const email = escapeHtml(input.email);
  const siteUrl = escapeHtml(input.siteUrl.replace(/\/$/, ''));
  const roleLabels = input.roles
    .map((r) => String(r))
    .filter(Boolean)
    .map((r) => r.charAt(0).toUpperCase() + r.slice(1))
    .join(' · ');
  const rolesBlock = roleLabels
    ? `<p class="meta">Lanes: <strong>${escapeHtml(roleLabels)}</strong></p>`
    : '';
  return {
    email: email || 'priority access',
    // Callers must pass a public (non-localhost) origin for outbound mail.
    siteUrl: siteUrl || 'https://bitcode.exchange',
    rolesBlock,
    year: input.year ?? new Date().getUTCFullYear(),
  };
}

/** True when a URL is safe to embed in outbound waitlist email CTAs. */
export function isPublicWaitlistSiteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return false;
    }
    if (host.endsWith('.local') || host.endsWith('.internal')) {
      return false;
    }
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const WAITLIST_EMAIL_SUBJECT = 'Welcome to the Bitcode waitlist';
