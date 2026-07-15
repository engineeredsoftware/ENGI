/**
 * Source-safe GitHub App install error classification + diagnostic payloads.
 * Never includes tokens, PEMs, cookies, or full provider payloads.
 */

import { BITCODE_GITHUB_APP_PUBLIC_URL, BITCODE_GITHUB_APP_SLUG } from '@/lib/github-app-url';

export type GitHubInstallErrorClass =
  | 'credentials'
  | 'app_mismatch'
  | 'session'
  | 'cookie'
  | 'persist'
  | 'provider'
  | 'unknown';

export type GitHubInstallLifecycleEvent =
  | 'received'
  | 'installation-received'
  | 'installation-staged'
  | 'installation-connected'
  | 'installation-callback-failed'
  | 'claim-start'
  | 'claim-result'
  | 'claim-no-pending-cookie'
  | 'claim-pending-cookie-unreadable'
  | 'session-resolve-failed'
  | 'app-not-configured';

export function readConfiguredGitHubAppId(): string | null {
  const value = process.env.GITHUB_APP_ID?.trim();
  return value || null;
}

export function hasGitHubAppPrivateKeyConfigured(): boolean {
  return Boolean(process.env.GITHUB_PRIVATE_KEY?.trim());
}

export function readInstallUrlSlug(): string {
  try {
    const path = new URL(BITCODE_GITHUB_APP_PUBLIC_URL).pathname;
    const slug = path.split('/').filter(Boolean).pop();
    return slug || BITCODE_GITHUB_APP_SLUG;
  } catch {
    return BITCODE_GITHUB_APP_SLUG;
  }
}

/**
 * Classify install/claim failures for operators and always-on logs.
 * 401/403/404 from installation APIs with credentials present ⇒ likely wrong
 * app (stale dual-app installation id) rather than "uninstalled".
 */
export function classifyGitHubInstallError(
  message: string | null | undefined,
  context: {
    hasAppId?: boolean;
    hasPrivateKey?: boolean;
    sessionPresent?: boolean;
    hasPendingCookie?: boolean;
  } = {},
): GitHubInstallErrorClass {
  const text = typeof message === 'string' ? message : '';

  if (context.hasAppId === false || context.hasPrivateKey === false) {
    return 'credentials';
  }
  if (/github_app_not_configured|credentials_not_configured/i.test(text)) {
    return 'credentials';
  }
  if (/PEM|private key|JWT|DECODER|file path/i.test(text)) {
    return 'credentials';
  }
  if (text === 'session_required' || /session_required|no session|unauthenticated/i.test(text)) {
    return 'session';
  }
  if (context.sessionPresent === false && /session/i.test(text)) {
    return 'session';
  }
  if (
    text === 'claim_no_pending_cookie' ||
    (context.hasPendingCookie === false && /cookie|pending/i.test(text))
  ) {
    return 'cookie';
  }
  // GitHub returns 404 when installation id belongs to a different app registration.
  if (/\b40[134]\b/.test(text) || /not found/i.test(text) || /bad credentials/i.test(text)) {
    return 'app_mismatch';
  }
  if (/saveConnection|persist|database|supabase/i.test(text)) {
    return 'persist';
  }
  if (/oauth|state_mismatch|missing_oauth|provider/i.test(text)) {
    return 'provider';
  }
  if (!text) return 'unknown';
  return 'unknown';
}

export function extractGitHubHttpStatus(message: string | null | undefined): number | null {
  if (!message) return null;
  const match = message.match(/\b(40[134]|422|5\d{2})\b/);
  if (!match) return null;
  const status = Number(match[1]);
  return Number.isFinite(status) ? status : null;
}

/** Compact, always-safe fields for install lifecycle logs and UI. */
export function buildGitHubInstallDiagnostic(detail: {
  event: GitHubInstallLifecycleEvent;
  installationId?: number | null;
  host?: string | null;
  hasSession?: boolean | null;
  hasPendingCookie?: boolean | null;
  account?: string | null;
  message?: string | null;
  errorClass?: GitHubInstallErrorClass | null;
  githubStatus?: number | null;
  setupAction?: string | null;
  claimed?: boolean | null;
}) {
  const hasAppId = Boolean(readConfiguredGitHubAppId());
  const hasPrivateKey = hasGitHubAppPrivateKeyConfigured();
  const message = detail.message ?? null;
  const errorClass =
    detail.errorClass ??
    (message
      ? classifyGitHubInstallError(message, {
          hasAppId,
          hasPrivateKey,
          sessionPresent: detail.hasSession ?? undefined,
          hasPendingCookie: detail.hasPendingCookie ?? undefined,
        })
      : null);

  return {
    event: detail.event,
    installationId: detail.installationId ?? null,
    configuredAppId: readConfiguredGitHubAppId(),
    installUrlSlug: readInstallUrlSlug(),
    hasPrivateKey,
    host: detail.host ?? null,
    hasSession: detail.hasSession ?? null,
    hasPendingCookie: detail.hasPendingCookie ?? null,
    account: detail.account ?? null,
    setupAction: detail.setupAction ?? null,
    claimed: detail.claimed ?? null,
    message: message ? message.slice(0, 240) : null,
    errorClass,
    githubStatus: detail.githubStatus ?? extractGitHubHttpStatus(message),
  };
}
