import { cookies } from 'next/headers';

import { createGitHubAppAuth } from '@bitcode/generic-vcs-github';
import { VCSConnections, VCSProviderFactory, type VCSAuth, type VCSProviderType } from '@bitcode/vcs-generics';
import {
  bitcodeServerLifecycleTelemetry,
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';
import {
  buildBitcodeCookieOptions,
  readRequestHostname,
  resolveCanonicalAppOrigin,
} from '@/lib/bitcode-request-host';
import {
  buildGitHubInstallDiagnostic,
  classifyGitHubInstallError,
  extractGitHubHttpStatus,
  hasGitHubAppPrivateKeyConfigured,
  readConfiguredGitHubAppId,
} from '@/lib/github-install-diagnostics';

import {
  getRouteSupabaseUser,
  isMockVcsMode,
  readInstanceUrl,
  type ProviderRouteContext,
} from '@/app/api/vcs/_shared';
import { AUXILLARY_OPEN_QUERY_PARAM } from '@/components/auxillaries/AuxillaryPaneMeta/AuxillaryPaneMeta';

type OptionalUserContext = Awaited<ReturnType<typeof getRouteSupabaseUser>>;

type GitHubInstallationToken = {
  token: string;
  expiresAt: Date;
  permissions: Record<string, string>;
  repositorySelection?: 'all' | 'selected';
  repositories?: Array<Record<string, unknown>>;
};

export type ClaimPendingGitHubInstallationResult = {
  claimed: boolean;
  installationId?: number;
  account?: string | null;
  error?: string;
  /** Source-safe classification for UI / always-on logs. */
  errorClass?: string;
  diagnostic?: ReturnType<typeof buildGitHubInstallDiagnostic>;
};

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/**
 * Coerce query/cookie JSON values to a positive integer.
 * Critical for staged install cookies: `JSON.stringify({ installation_id: n })`
 * emits a JSON number; treating only strings as valid made claim see a present
 * cookie as missing (`claim-no-pending-cookie` with browser cookie still set).
 */
function readPositiveInteger(value: unknown) {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === 'bigint') {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) && asNumber > 0 ? asNumber : null;
  }
  const stringValue = readString(value);
  if (!stringValue) return null;
  const parsed = Number(stringValue);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

async function resolveProvider(context?: ProviderRouteContext): Promise<VCSProviderType> {
  if (!context || !('params' in context)) return 'github';

  const params = await context.params;
  return params.provider === 'github' ||
    params.provider === 'gitlab' ||
    params.provider === 'bitbucket'
    ? params.provider
    : 'github';
}

function buildConnectsRedirect(
  request: Request,
  params: Record<string, string | number | boolean | null | undefined>,
) {
  // Land on /packs with the Auxillaries Externals overlay open (the
  // AuxillariesProvider reads the open-to param on any route), not the
  // Auxillaries overlay roots on product routes (e.g. /packs).
  // Canonical origin: prefer NEXT_PUBLIC_APP_URL so apex/www callbacks both
  // return to the operator-facing host and keep session + claim cookies aligned.
  // Pending install uses cookies().set (App Router merges Set-Cookie onto this
  // Response). Plain Response keeps Jest/node route tests constructible.
  const origin = resolveCanonicalAppOrigin(request);
  const redirectUrl = new URL(
    `/packs?${AUXILLARY_OPEN_QUERY_PARAM}=externals`,
    origin.endsWith('/') ? origin : `${origin}/`,
  );
  redirectUrl.searchParams.set('pane', 'externals');

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue;
    redirectUrl.searchParams.set(key, String(value));
  }

  return new Response(null, {
    status: 307,
    headers: {
      Location: redirectUrl.toString(),
    },
  });
}

function clearOAuthCookies(provider: VCSProviderType, request?: Request) {
  const cookieStore = cookies();
  const base = request
    ? buildBitcodeCookieOptions(request, { maxAge: 0 })
    : {
        httpOnly: true as const,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 0,
        path: '/' as const,
      };
  for (const name of [`vcs_oauth_state_${provider}`, `vcs_oauth_instance_${provider}`]) {
    cookieStore.set(name, '', base);
  }
}

type OptionalUserResult = {
  context: OptionalUserContext | null;
  resolveError: string | null;
};

async function readOptionalUser(): Promise<OptionalUserResult> {
  try {
    const context = await getRouteSupabaseUser();
    return {
      context: context.user ? context : null,
      resolveError: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'session_resolve_failed';
    return { context: null, resolveError: message };
  }
}

function collectInstallationCallbackFields(searchParams: URLSearchParams) {
  return {
    installation_id: readString(searchParams.get('installation_id')),
    setup_action: readString(searchParams.get('setup_action')),
    state: readString(searchParams.get('state')),
    target_id: readString(searchParams.get('target_id')),
    target_type: readString(searchParams.get('target_type')),
  };
}

function mapRepositorySummary(repository: Record<string, unknown>) {
  return {
    id: typeof repository.id === 'number' ? repository.id : undefined,
    name: readString(repository.name),
    full_name: readString(repository.full_name),
    private: typeof repository.private === 'boolean' ? repository.private : undefined,
  };
}

function resolveInstallationAccount(installation: Record<string, any>) {
  const account = installation.account && typeof installation.account === 'object'
    ? installation.account
    : null;

  return {
    login: readString(account?.login) || `installation-${installation.id}`,
    id: account?.id ? String(account.id) : null,
    type: readString(account?.type),
    html_url: readString(account?.html_url),
  };
}

async function persistGitHubInstallationConnection({
  userContext,
  installation,
  installationId,
  setupFields,
  tokenData,
}: {
  userContext: OptionalUserContext;
  installation: Record<string, any>;
  installationId: number;
  setupFields: ReturnType<typeof collectInstallationCallbackFields>;
  tokenData: GitHubInstallationToken;
}) {
  const account = resolveInstallationAccount(installation);
  const manager = new VCSConnections(userContext.supabase);
  const connectedAt = new Date().toISOString();

  await manager.saveConnection(userContext.user!.id, 'github', {
    accessToken: tokenData.token,
    expiresAt: tokenData.expiresAt,
    providerUserId: String(installationId),
    providerUsername: account.login,
    metadata: {
      auth_source: 'github_app_installation',
      installationId,
      installation_id: installationId,
      setup_action: setupFields.setup_action,
      setup_state: setupFields.state,
      target_id: setupFields.target_id,
      target_type: setupFields.target_type || readString(installation.target_type),
      account_login: account.login,
      account_id: account.id,
      account_type: account.type,
      account_url: account.html_url,
      app_id: installation.app_id ? String(installation.app_id) : undefined,
      app_slug: readString(installation.app_slug),
      repository_selection:
        readString(installation.repository_selection) || tokenData.repositorySelection,
      installation_token_expires_at: tokenData.expiresAt.toISOString(),
      permissions: tokenData.permissions,
      repositories: tokenData.repositories?.map(mapRepositorySummary).filter(Boolean) || [],
      connected_at: connectedAt,
      callback_fields: setupFields,
      // Source-safe install claim markers for later triage (no secrets).
      last_install_at: connectedAt,
      last_install_app_id: readConfiguredGitHubAppId(),
      last_install_error: null,
      last_install_error_class: null,
    },
  });

  return account;
}

const PENDING_INSTALLATION_COOKIE = 'bitcode_github_installation_pending';

type PendingInstallationCookie = {
  installation_id: number;
  setup_action: string | null;
  state: string | null;
  account?: { login?: string | null };
  captured_at?: string;
};

/**
 * Parse staged install cookie. Browsers / proxies may leave the value
 * percent-encoded (%7B…); JSON.parse without decode fails. installation_id may
 * be a JSON number (from JSON.stringify) or a string (query-style payloads).
 */
export function parsePendingInstallationCookieValue(
  raw: string | null | undefined,
): PendingInstallationCookie | null {
  if (!raw || !String(raw).trim()) return null;
  let text = String(raw).trim();
  try {
    // Decode when the jar still holds percent-encoding (DevTools often shows this).
    if (text.includes('%7B') || text.includes('%22') || text.startsWith('%')) {
      text = decodeURIComponent(text);
    }
  } catch {
    // keep original text
  }
  try {
    const parsed = JSON.parse(text) as PendingInstallationCookie;
    const installationId = readPositiveInteger(parsed?.installation_id);
    if (!installationId) return null;
    return {
      ...parsed,
      installation_id: installationId,
      setup_action: readString(parsed.setup_action),
      state: readString(parsed.state),
    };
  } catch {
    return null;
  }
}

function readCookieHeaderValue(
  request: Request | undefined,
  name: string,
): string | null {
  if (!request) return null;
  try {
    const header = request.headers.get('cookie') || '';
    if (!header) return null;
    for (const part of header.split(';')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (key !== name) continue;
      return trimmed.slice(eq + 1);
    }
  } catch {
    return null;
  }
  return null;
}

type PendingCookieRead =
  | { status: 'ok'; value: PendingInstallationCookie }
  | { status: 'missing' }
  | { status: 'unreadable'; rawPresent: true };

function readPendingInstallationCookie(request?: Request): PendingCookieRead {
  let raw: string | null | undefined;
  try {
    raw = cookies().get(PENDING_INSTALLATION_COOKIE)?.value;
  } catch {
    raw = null;
  }
  // Prefer Next cookie store; fall back to the inbound Cookie header (claim on
  // /api/vcs/github/connection sometimes sees the header when cookies() is empty).
  if (!raw) {
    raw = readCookieHeaderValue(request, PENDING_INSTALLATION_COOKIE);
  }
  if (!raw) return { status: 'missing' };

  const parsed = parsePendingInstallationCookieValue(raw);
  if (!parsed) return { status: 'unreadable', rawPresent: true };
  return { status: 'ok', value: parsed };
}

function clearPendingInstallationCookie(request?: Request) {
  try {
    const options = request
      ? buildBitcodeCookieOptions(request, { maxAge: 0 })
      : {
          httpOnly: true as const,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          maxAge: 0,
          path: '/' as const,
        };
    cookies().set(PENDING_INSTALLATION_COOKIE, '', options);
  } catch {
    // ignore missing request cookie store
  }
}

function stagePendingInstallation(
  request: Request,
  installationId: number,
  setupFields: ReturnType<typeof collectInstallationCallbackFields>,
  account: ReturnType<typeof resolveInstallationAccount>,
) {
  try {
    cookies().set(
      PENDING_INSTALLATION_COOKIE,
      JSON.stringify({
        installation_id: installationId,
        setup_action: setupFields.setup_action,
        state: setupFields.state,
        account,
        captured_at: new Date().toISOString(),
      }),
      buildBitcodeCookieOptions(request, { maxAge: 15 * 60 }),
    );
  } catch {
    // ignore missing request cookie store
  }
}

function logInstallLifecycle(
  level: 'info' | 'warn' | 'error',
  event: Parameters<typeof buildGitHubInstallDiagnostic>[0]['event'],
  detail: Omit<Parameters<typeof buildGitHubInstallDiagnostic>[0], 'event'>,
) {
  const diagnostic = buildGitHubInstallDiagnostic({ event, ...detail });
  bitcodeServerLifecycleTelemetry(level, 'github-install', event, diagnostic);
  return diagnostic;
}

/**
 * Complete a GitHub App installation that was staged while the operator had
 * no Bitcode session (common after fresh install/reinstall). Safe to call
 * repeatedly: no-ops when cookie absent or user missing.
 *
 * Optional `request` enables shared cookie Domain clear on apex/www product hosts.
 */
export async function claimPendingGitHubInstallation(
  request?: Request,
): Promise<ClaimPendingGitHubInstallationResult> {
  const host = request ? readRequestHostname(request) : null;
  const pendingRead = readPendingInstallationCookie(request);
  if (pendingRead.status === 'missing') {
    const diagnostic = logInstallLifecycle('info', 'claim-no-pending-cookie', {
      host,
      hasPendingCookie: false,
      hasSession: null,
    });
    // Keep verbose channel for historical listeners.
    bitcodeServerTelemetry('debug', 'github-callback', 'claim-no-pending-cookie');
    return { claimed: false, diagnostic };
  }
  if (pendingRead.status === 'unreadable') {
    // Cookie name present but body not JSON (often percent-encoded without decode).
    const diagnostic = logInstallLifecycle('warn', 'claim-pending-cookie-unreadable', {
      host,
      hasPendingCookie: true,
      hasSession: null,
      message: 'pending_cookie_unreadable',
      errorClass: 'cookie',
    });
    bitcodeServerTelemetry('warn', 'github-callback', 'claim-pending-cookie-unreadable');
    return {
      claimed: false,
      error: 'pending_cookie_unreadable',
      errorClass: 'cookie',
      diagnostic,
    };
  }

  const pending = pendingRead.value;

  logInstallLifecycle('info', 'claim-start', {
    installationId: pending.installation_id,
    host,
    hasPendingCookie: true,
    account: pending.account?.login ?? null,
    setupAction: pending.setup_action,
  });
  bitcodeServerTelemetry('info', 'github-callback', 'claim-pending-start', {
    installationId: pending.installation_id,
    setupAction: pending.setup_action,
    account: pending.account?.login ?? null,
    capturedAt: pending.captured_at ?? null,
  });

  const { context: userContext, resolveError } = await readOptionalUser();
  if (resolveError) {
    const diagnostic = logInstallLifecycle('error', 'session-resolve-failed', {
      installationId: pending.installation_id,
      host,
      hasPendingCookie: true,
      hasSession: false,
      message: resolveError,
      errorClass: 'session',
    });
    return {
      claimed: false,
      installationId: pending.installation_id,
      error: resolveError,
      errorClass: 'session',
      diagnostic,
    };
  }

  if (!userContext?.user) {
    // No Connect session yet — cookie is fine; operator must Connect wallet first.
    const diagnostic = logInstallLifecycle('warn', 'claim-result', {
      installationId: pending.installation_id,
      host,
      hasPendingCookie: true,
      hasSession: false,
      message: 'session_required',
      errorClass: 'session',
      claimed: false,
    });
    return {
      claimed: false,
      installationId: pending.installation_id,
      error: 'session_required',
      errorClass: 'session',
      diagnostic,
    };
  }

  const githubApp = createGitHubAppAuth();
  if (!githubApp) {
    const diagnostic = logInstallLifecycle('error', 'app-not-configured', {
      installationId: pending.installation_id,
      host,
      hasPendingCookie: true,
      hasSession: true,
      message: 'github_app_not_configured',
      errorClass: 'credentials',
    });
    return {
      claimed: false,
      installationId: pending.installation_id,
      error: 'github_app_not_configured',
      errorClass: 'credentials',
      diagnostic,
    };
  }

  try {
    const installation = await githubApp.getInstallation(pending.installation_id);
    bitcodeServerTelemetry('info', 'github-callback', 'claim-installation-read', {
      installationId: pending.installation_id,
      appId: installation?.app_id ?? null,
      account: resolveInstallationAccount(installation).login,
      repositorySelection: readString(installation?.repository_selection),
    });
    const tokenData = await githubApp.generateInstallationToken(pending.installation_id);
    bitcodeServerTelemetry('info', 'github-callback', 'claim-token-minted', {
      installationId: pending.installation_id,
      expiresAt: tokenData.expiresAt?.toISOString?.() ?? null,
      repositorySelection: tokenData.repositorySelection ?? null,
      repositoryCount: Array.isArray(tokenData.repositories) ? tokenData.repositories.length : 0,
    });
    const setupFields = {
      installation_id: String(pending.installation_id),
      setup_action: pending.setup_action,
      state: pending.state,
      target_id: null,
      target_type: null,
    };
    const account = await persistGitHubInstallationConnection({
      userContext,
      installation,
      installationId: pending.installation_id,
      setupFields,
      tokenData,
    });
    clearPendingInstallationCookie(request);
    const diagnostic = logInstallLifecycle('info', 'claim-result', {
      installationId: pending.installation_id,
      host,
      hasPendingCookie: false,
      hasSession: true,
      account: account.login,
      claimed: true,
    });
    bitcodeServerTelemetry('info', 'github-callback', 'installation-claimed', {
      userId: compactBitcodeServerId(userContext.user.id),
      installationId: pending.installation_id,
      account: account.login,
    });
    return {
      claimed: true,
      installationId: pending.installation_id,
      account: account.login,
      diagnostic,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'claim_failed';
    const stack = error instanceof Error ? error.stack?.slice(0, 500) : null;
    const errorClass = classifyGitHubInstallError(message, {
      hasAppId: Boolean(readConfiguredGitHubAppId()),
      hasPrivateKey: hasGitHubAppPrivateKeyConfigured(),
      sessionPresent: true,
      hasPendingCookie: true,
    });
    const diagnostic = logInstallLifecycle('error', 'claim-result', {
      installationId: pending.installation_id,
      host,
      hasPendingCookie: true,
      hasSession: true,
      message,
      errorClass,
      githubStatus: extractGitHubHttpStatus(message),
      claimed: false,
    });
    bitcodeServerTelemetry('error', 'github-callback', 'installation-claim-failed', {
      installationId: pending.installation_id,
      message,
      stack,
      errorClass,
    });
    // Drop a dead staged install (uninstalled / wrong app) so the UI can recover.
    if (errorClass === 'app_mismatch') {
      clearPendingInstallationCookie(request);
      bitcodeServerLifecycleTelemetry('warn', 'github-install', 'claim-pending-cookie-cleared', {
        installationId: pending.installation_id,
        errorClass,
        message: message.slice(0, 180),
      });
    }
    return {
      claimed: false,
      installationId: pending.installation_id,
      error: message,
      errorClass,
      diagnostic,
    };
  }
}

async function handleInstallationCallback(request: Request) {
  const url = new URL(request.url);
  const host = readRequestHostname(request);
  const installationId = readPositiveInteger(url.searchParams.get('installation_id'));
  if (!installationId) {
    logInstallLifecycle('warn', 'installation-callback-failed', {
      host,
      message: 'missing_installation_id',
      errorClass: 'provider',
    });
    return buildConnectsRedirect(request, {
      vcsProvider: 'github',
      vcsConnection: 'failed',
      vcsError: 'missing_installation_id',
    });
  }

  const githubApp = createGitHubAppAuth();
  if (!githubApp) {
    logInstallLifecycle('error', 'app-not-configured', {
      installationId,
      host,
      message: 'github_app_not_configured',
      errorClass: 'credentials',
    });
    return buildConnectsRedirect(request, {
      vcsProvider: 'github',
      vcsConnection: 'failed',
      vcsError: 'github_app_not_configured',
      vcsErrorClass: 'credentials',
      installation_id: installationId,
    });
  }

  const setupFields = collectInstallationCallbackFields(url.searchParams);
  logInstallLifecycle('info', 'installation-received', {
    installationId,
    host,
    setupAction: setupFields.setup_action,
  });

  try {
    const installation = await githubApp.getInstallation(installationId);
    const { context: userContext, resolveError } = await readOptionalUser();

    if (resolveError) {
      logInstallLifecycle('error', 'session-resolve-failed', {
        installationId,
        host,
        hasSession: false,
        message: resolveError,
        errorClass: 'session',
      });
    }

    if (!userContext) {
      const account = resolveInstallationAccount(installation);
      stagePendingInstallation(request, installationId, setupFields, account);
      logInstallLifecycle('info', 'installation-staged', {
        installationId,
        host,
        hasSession: false,
        hasPendingCookie: true,
        account: account.login,
        setupAction: setupFields.setup_action,
      });
      return buildConnectsRedirect(request, {
        vcsProvider: 'github',
        vcsConnection: 'installation_staged',
        vcsSession: 'required',
        installation_id: installationId,
        setup_action: setupFields.setup_action,
        account: account.login,
      });
    }

    const tokenData = await githubApp.generateInstallationToken(installationId);
    const account = await persistGitHubInstallationConnection({
      userContext,
      installation,
      installationId,
      setupFields,
      tokenData,
    });
    clearPendingInstallationCookie(request);

    logInstallLifecycle('info', 'installation-connected', {
      installationId,
      host,
      hasSession: true,
      hasPendingCookie: false,
      account: account.login,
      setupAction: setupFields.setup_action,
      claimed: true,
    });
    bitcodeServerTelemetry('info', 'github-callback', 'installation-connected', {
      userId: compactBitcodeServerId(userContext.user?.id),
      installationId,
      account: account.login,
      repositorySelection:
        readString(installation.repository_selection) || tokenData.repositorySelection,
    });
    return buildConnectsRedirect(request, {
      vcsProvider: 'github',
      vcsConnection: 'installation_connected',
      installation_id: installationId,
      setup_action: setupFields.setup_action,
      account: account.login,
      repository_selection:
        readString(installation.repository_selection) || tokenData.repositorySelection,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'installation_callback_failed';
    const stack = error instanceof Error ? error.stack?.slice(0, 800) : null;
    const errorClass = classifyGitHubInstallError(message, {
      hasAppId: Boolean(readConfiguredGitHubAppId()),
      hasPrivateKey: hasGitHubAppPrivateKeyConfigured(),
    });
    logInstallLifecycle('error', 'installation-callback-failed', {
      installationId,
      host,
      message,
      errorClass,
      githubStatus: extractGitHubHttpStatus(message),
      setupAction: setupFields.setup_action,
    });
    console.error('[bitcode-github-callback] installation callback failed', {
      installationId,
      message,
      stack,
      errorClass,
      configuredAppId: readConfiguredGitHubAppId(),
    });
    return buildConnectsRedirect(request, {
      vcsProvider: 'github',
      vcsConnection: 'failed',
      vcsError: 'installation_callback_failed',
      vcsErrorClass: errorClass,
      vcsErrorDescription: message.slice(0, 180),
      installation_id: installationId,
    });
  }
}

async function saveOAuthConnection({
  request,
  provider,
  auth,
  instanceUrl,
}: {
  request: Request;
  provider: VCSProviderType;
  auth: VCSAuth;
  instanceUrl?: string;
}) {
  const { context: userContext } = await readOptionalUser();
  const vcsProvider = await VCSProviderFactory.createFromEnvironment(provider, instanceUrl);
  const providerUser = await vcsProvider.getCurrentUser(auth);

  if (!userContext) {
    bitcodeServerTelemetry('info', 'github-callback', 'oauth-staged', {
      provider,
      account: providerUser.username,
    });
    return buildConnectsRedirect(request, {
      vcsProvider: provider,
      vcsConnection: 'oauth_staged',
      vcsSession: 'required',
      account: providerUser.username,
    });
  }

  const manager = new VCSConnections(userContext.supabase);
  await manager.saveConnection(userContext.user!.id, provider, {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresAt: auth.expiresAt,
    providerUserId: providerUser.id,
    providerUsername: providerUser.username,
    instanceUrl,
    metadata: {
      auth_source: provider === 'github' ? 'github_app_oauth' : `${provider}_oauth`,
      provider_display_name: providerUser.displayName,
      provider_email: providerUser.email,
      provider_avatar_url: providerUser.avatarUrl,
      token_type: auth.tokenType,
      scope: auth.scope,
      connected_at: new Date().toISOString(),
    },
  });

  bitcodeServerTelemetry('info', 'github-callback', 'oauth-connected', {
    provider,
    userId: compactBitcodeServerId(userContext.user?.id),
    account: providerUser.username,
  });
  return buildConnectsRedirect(request, {
    vcsProvider: provider,
    vcsConnection: 'oauth_connected',
    account: providerUser.username,
  });
}

async function handleOAuthCallback(
  request: Request,
  provider: VCSProviderType,
) {
  const url = new URL(request.url);
  const code = readString(url.searchParams.get('code'));
  const state = readString(url.searchParams.get('state'));
  const cookieStore = cookies();
  const expectedState = readString(cookieStore.get(`vcs_oauth_state_${provider}`)?.value);
  const instanceUrl =
    readInstanceUrl(request) ||
    readString(cookieStore.get(`vcs_oauth_instance_${provider}`)?.value) ||
    undefined;

  if (!code) {
    bitcodeServerTelemetry('warn', 'github-callback', 'oauth-missing-code', {
      provider,
    });
    return buildConnectsRedirect(request, {
      vcsProvider: provider,
      vcsConnection: 'failed',
      vcsError: 'missing_oauth_code',
    });
  }

  if (expectedState && state !== expectedState) {
    clearOAuthCookies(provider, request);
    bitcodeServerTelemetry('warn', 'github-callback', 'oauth-state-mismatch', {
      provider,
    });
    return buildConnectsRedirect(request, {
      vcsProvider: provider,
      vcsConnection: 'failed',
      vcsError: 'oauth_state_mismatch',
    });
  }

  const vcsProvider = await VCSProviderFactory.createFromEnvironment(provider, instanceUrl);
  const auth = await vcsProvider.exchangeCodeForToken(code);
  clearOAuthCookies(provider, request);

  return saveOAuthConnection({ request, provider, auth, instanceUrl });
}

export async function handleGitHubCallback(request: Request, context?: ProviderRouteContext) {
  const provider = await resolveProvider(context);
  const url = new URL(request.url);
  const host = readRequestHostname(request);

  logInstallLifecycle('info', 'received', {
    host,
    hasSession: null,
    message: null,
    setupAction: null,
  });
  bitcodeServerTelemetry('info', 'github-callback', 'received', {
    provider,
    host,
    hasInstallationId: url.searchParams.has('installation_id'),
    hasCode: Boolean(readString(url.searchParams.get('code'))),
    hasError: Boolean(readString(url.searchParams.get('error'))),
    canonicalOrigin: resolveCanonicalAppOrigin(request),
  });

  if (isMockVcsMode()) {
    bitcodeServerTelemetry('info', 'github-callback', 'mock-connected', {
      provider,
    });
    return buildConnectsRedirect(request, {
      vcsProvider: provider,
      vcsConnection: 'mock_connected',
    });
  }

  const error = readString(url.searchParams.get('error'));
  if (error) {
    bitcodeServerTelemetry('warn', 'github-callback', 'provider-error', {
      provider,
      error,
      description: readString(url.searchParams.get('error_description')),
    });
    return buildConnectsRedirect(request, {
      vcsProvider: provider,
      vcsConnection: 'failed',
      vcsError: error,
      vcsErrorDescription: readString(url.searchParams.get('error_description')),
    });
  }

  if (url.searchParams.has('installation_id')) {
    if (provider !== 'github') {
      return buildConnectsRedirect(request, {
        vcsProvider: provider,
        vcsConnection: 'failed',
        vcsError: 'installation_callback_requires_github',
      });
    }

    return handleInstallationCallback(request);
  }

  return handleOAuthCallback(request, provider);
}
