/**
 * Load HTML email templates and interpolate app-mail placeholders (`{{var}}`).
 *
 * Resolve order (production-safe on Vercel apps/uapi root):
 * 1. `apps/uapi/email-templates/{name}.html` (deployed with the app)
 * 2. monorepo `supabase/templates/{name}.html` (local / traced NFT)
 *
 * Waitlist SSOT: keep `email-templates/waitlist.html` in sync with
 * `supabase/templates/waitlist.html`.
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

/** Candidate directories that may hold app-mail HTML (first hit wins). */
export async function resolveEmailTemplateDirs(
  startDir: string = process.cwd(),
): Promise<string[]> {
  const dirs: string[] = [];
  const seen = new Set<string>();

  const pushIfDir = async (candidate: string) => {
    const resolved = path.resolve(candidate);
    if (seen.has(resolved)) return;
    try {
      const stat = await fs.stat(resolved);
      if (stat.isDirectory()) {
        seen.add(resolved);
        dirs.push(resolved);
      }
    } catch {
      // skip
    }
  };

  // 1) App-local deploy tree (Vercel / next cwd ≈ apps/uapi)
  await pushIfDir(path.join(startDir, 'email-templates'));
  // 2) Walk monorepo for apps/uapi/email-templates + supabase/templates
  let dir = path.resolve(startDir);
  for (let i = 0; i < 8; i++) {
    await pushIfDir(path.join(dir, 'email-templates'));
    await pushIfDir(path.join(dir, 'apps', 'uapi', 'email-templates'));
    await pushIfDir(path.join(dir, 'supabase', 'templates'));
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return dirs;
}

/** @deprecated Prefer resolveEmailTemplateDirs — kept for tests. */
export async function resolveSupabaseTemplatesDir(
  startDir: string = process.cwd(),
): Promise<string> {
  const dirs = await resolveEmailTemplateDirs(startDir);
  const supabase = dirs.find((d) => d.replace(/\\/g, '/').endsWith('supabase/templates'));
  if (supabase) return supabase;
  if (dirs[0]) return dirs[0];
  throw new Error(
    `email templates not found walking from ${path.resolve(startDir)}`,
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
 * Read `{templateName}.html` from the first resolve candidate and replace `{{key}}`.
 */
export async function renderSupabaseEmailTemplate(
  templateName: string,
  vars: Record<string, string | number>,
  options?: { startDir?: string },
): Promise<string> {
  if (!TEMPLATE_NAME_RE.test(templateName)) {
    throw new Error(`invalid email template name: ${templateName}`);
  }
  const dirs = await resolveEmailTemplateDirs(options?.startDir);
  const fileName = `${templateName}.html`;
  const tried: string[] = [];

  for (const dir of dirs) {
    const filePath = path.join(dir, fileName);
    tried.push(filePath);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return interpolateAppEmailTemplate(raw, vars);
    } catch {
      // try next
    }
  }

  throw new Error(
    `email template "${templateName}" not found (tried: ${tried.join(', ') || 'none'})`,
  );
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
