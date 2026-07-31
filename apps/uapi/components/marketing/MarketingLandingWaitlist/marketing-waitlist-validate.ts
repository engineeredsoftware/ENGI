/**
 * Pure validation for the landing waitlist form (client + API).
 * Roles are optional multi-select (Seller / Buyer / Builder) — no "both" chip.
 * Email alone is enough to join; empty roles[] is valid.
 */

export const WAITLIST_ROLES = ['seller', 'buyer', 'builder'] as const;
export type WaitlistRole = (typeof WAITLIST_ROLES)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isWaitlistRole(value: unknown): value is WaitlistRole {
  return typeof value === 'string' && (WAITLIST_ROLES as readonly string[]).includes(value);
}

export function normalizeWaitlistEmail(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

export function isValidWaitlistEmail(value: unknown): boolean {
  const email = normalizeWaitlistEmail(value);
  if (!email || email.length > 320) return false;
  return EMAIL_RE.test(email);
}

/** Dedupe, order by WAITLIST_ROLES, drop unknowns. */
export function normalizeWaitlistRoles(value: unknown): WaitlistRole[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,\s]+/)
      : [];
  const set = new Set<WaitlistRole>();
  for (const entry of raw) {
    if (isWaitlistRole(entry)) set.add(entry);
  }
  return WAITLIST_ROLES.filter((role) => set.has(role));
}

export type WaitlistSubmitInput = {
  email: unknown;
  /** Multi-select roles (preferred). */
  roles?: unknown;
  /** @deprecated single role — accepted for one-value payloads. */
  role?: unknown;
  /** Honeypot — must be empty when present. */
  website?: unknown;
};

export type WaitlistValidateResult =
  | { ok: true; email: string; roles: WaitlistRole[] }
  | {
      ok: false;
      reason: 'invalid_email' | 'invalid_role' | 'honeypot';
    };

export function validateWaitlistSubmit(input: WaitlistSubmitInput): WaitlistValidateResult {
  if (input.website != null && String(input.website).trim() !== '') {
    return { ok: false, reason: 'honeypot' };
  }
  if (!isValidWaitlistEmail(input.email)) {
    return { ok: false, reason: 'invalid_email' };
  }

  const fromRoles = normalizeWaitlistRoles(input.roles);
  const fromLegacy =
    fromRoles.length === 0 && input.role != null
      ? normalizeWaitlistRoles([input.role])
      : [];
  const roles = fromRoles.length > 0 ? fromRoles : fromLegacy;

  return {
    ok: true,
    email: normalizeWaitlistEmail(input.email),
    roles,
  };
}
