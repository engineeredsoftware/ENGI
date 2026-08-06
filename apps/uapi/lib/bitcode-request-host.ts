/**
 * Request host helpers for GitHub install callback / pending-cookie hardening.
 *
 * - Canonical origin: prefer NEXT_PUBLIC_APP_URL so post-install redirects land
 *   on the operator-facing host (not a stray preview/internal host).
 * - Cookie domain: share pending-install cookies across apex + www so claim
 *   after callback does not lose the staged installation_id (F35-class host split).
 */

/** Registrable product hosts that must share install cookies across apex/www. */
const SHARED_COOKIE_PARENT_DOMAINS = ['bitcode.exchange'] as const;

export function readRequestHostname(request: Request): string {
  try {
    return new URL(request.url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Cookie Domain for Bitcode product hosts so `bitcode.exchange` and
 * `www.bitcode.exchange` share `bitcode_github_installation_pending`.
 * Localhost and Vercel preview hosts stay host-only (no Domain attribute).
 */
export function resolveBitcodeCookieDomain(hostname: string): string | undefined {
  const host = hostname.toLowerCase().split(':')[0]?.trim() || '';
  if (!host || host === 'localhost' || host.endsWith('.localhost')) return undefined;
  // IPv4 / IPv6 literals must not receive a Domain attribute.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) return undefined;

  for (const parent of SHARED_COOKIE_PARENT_DOMAINS) {
    if (host === parent || host.endsWith(`.${parent}`)) {
      return `.${parent}`;
    }
  }
  return undefined;
}

/**
 * Origin used for post-callback redirects into the product surface.
 * Prefer NEXT_PUBLIC_APP_URL when set and valid; otherwise the request origin.
 */
export function resolveCanonicalAppOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    try {
      const origin = new URL(configured).origin;
      if (origin.startsWith('http://') || origin.startsWith('https://')) {
        return origin;
      }
    } catch {
      // fall through to request origin
    }
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return 'http://localhost:3000';
  }
}

/** Secure cookies on HTTPS product hosts even when NODE_ENV is not production. */
export function shouldUseSecureCookies(hostname: string): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  const host = hostname.toLowerCase();
  return host === 'bitcode.exchange' || host.endsWith('.bitcode.exchange');
}

export function buildBitcodeCookieOptions(
  request: Request,
  overrides: { maxAge?: number } = {},
): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  domain?: string;
  maxAge?: number;
} {
  const hostname = readRequestHostname(request);
  const domain = resolveBitcodeCookieDomain(hostname);
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(hostname),
    sameSite: 'lax',
    path: '/',
    ...(domain ? { domain } : {}),
    ...(typeof overrides.maxAge === 'number' ? { maxAge: overrides.maxAge } : {}),
  };
}
