import { cookies } from 'next/headers';

import { createGitHubAppAuth } from '@bitcode/generic-vcs-github';
import { VCSConnections, VCSProviderFactory, type VCSAuth, type VCSProviderType } from '@bitcode/vcs-generics';
import {
  bitcodeServerTelemetry,
  compactBitcodeServerId,
} from '@/lib/bitcode-server-telemetry';

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

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readPositiveInteger(value: unknown) {
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
  // legacy /terminal overlay root (QA ledger F8).
  const redirectUrl = new URL(
    `/packs?${AUXILLARY_OPEN_QUERY_PARAM}=externals`,
    request.url,
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

function clearOAuthCookies(provider: VCSProviderType) {
  const cookieStore = cookies();
  for (const name of [`vcs_oauth_state_${provider}`, `vcs_oauth_instance_${provider}`]) {
    cookieStore.set(name, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  }
}

async function readOptionalUser(): Promise<OptionalUserContext | null> {
  try {
    const context = await getRouteSupabaseUser();
    return context.user ? context : null;
  } catch {
    return null;
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

function readPendingInstallationCookie(): PendingInstallationCookie | null {
  try {
    const raw = cookies().get(PENDING_INSTALLATION_COOKIE)?.value;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingInstallationCookie;
    const installationId = readPositiveInteger(parsed?.installation_id);
    if (!installationId) return null;
    return {
      ...parsed,
      installation_id: installationId,
      setup_action: readString(parsed.setup_action),
      state: readString(parsed.state),
    };
  } catch {
    // Jest / non-request contexts have no Next cookie store.
    return null;
  }
}

function clearPendingInstallationCookie() {
  try {
    cookies().set(PENDING_INSTALLATION_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  } catch {
    // ignore missing request cookie store
  }
}

function stagePendingInstallation(
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
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/',
      },
    );
  } catch {
    // ignore missing request cookie store
  }
}

/**
 * Complete a GitHub App installation that was staged while the operator had
 * no Bitcode session (common after fresh install/reinstall). Safe to call
 * repeatedly: no-ops when cookie absent or user missing.
 */
export async function claimPendingGitHubInstallation(): Promise<{
  claimed: boolean;
  installationId?: number;
  account?: string | null;
  error?: string;
}> {
  const pending = readPendingInstallationCookie();
  if (!pending) {
    return { claimed: false };
  }

  const userContext = await readOptionalUser();
  if (!userContext?.user) {
    return {
      claimed: false,
      installationId: pending.installation_id,
      error: 'session_required',
    };
  }

  const githubApp = createGitHubAppAuth();
  if (!githubApp) {
    return {
      claimed: false,
      installationId: pending.installation_id,
      error: 'github_app_not_configured',
    };
  }

  try {
    const installation = await githubApp.getInstallation(pending.installation_id);
    const tokenData = await githubApp.generateInstallationToken(pending.installation_id);
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
    clearPendingInstallationCookie();
    bitcodeServerTelemetry('info', 'github-callback', 'installation-claimed', {
      userId: compactBitcodeServerId(userContext.user.id),
      installationId: pending.installation_id,
      account: account.login,
    });
    return {
      claimed: true,
      installationId: pending.installation_id,
      account: account.login,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'claim_failed';
    bitcodeServerTelemetry('warn', 'github-callback', 'installation-claim-failed', {
      installationId: pending.installation_id,
      message,
    });
    // Drop a dead staged install (uninstalled / wrong app) so the UI can recover.
    if (/\b40[134]\b/.test(message) || /not found/i.test(message)) {
      clearPendingInstallationCookie();
    }
    return {
      claimed: false,
      installationId: pending.installation_id,
      error: message,
    };
  }
}

async function handleInstallationCallback(request: Request) {
  const url = new URL(request.url);
  const installationId = readPositiveInteger(url.searchParams.get('installation_id'));
  if (!installationId) {
    bitcodeServerTelemetry('warn', 'github-callback', 'installation-missing-id');
    return buildConnectsRedirect(request, {
      vcsProvider: 'github',
      vcsConnection: 'failed',
      vcsError: 'missing_installation_id',
    });
  }

  const githubApp = createGitHubAppAuth();
  if (!githubApp) {
    bitcodeServerTelemetry('warn', 'github-callback', 'installation-app-not-configured', {
      installationId,
    });
    return buildConnectsRedirect(request, {
      vcsProvider: 'github',
      vcsConnection: 'failed',
      vcsError: 'github_app_not_configured',
      installation_id: installationId,
    });
  }

  const setupFields = collectInstallationCallbackFields(url.searchParams);
  bitcodeServerTelemetry('info', 'github-callback', 'installation-received', {
    installationId,
    setupAction: setupFields.setup_action,
    targetId: setupFields.target_id,
    targetType: setupFields.target_type,
  });

  try {
    const installation = await githubApp.getInstallation(installationId);
    const userContext = await readOptionalUser();

    if (!userContext) {
      const account = resolveInstallationAccount(installation);
      stagePendingInstallation(installationId, setupFields, account);
      bitcodeServerTelemetry('info', 'github-callback', 'installation-staged', {
        installationId,
        account: account.login,
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
    clearPendingInstallationCookie();

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
    bitcodeServerTelemetry('error', 'github-callback', 'installation-callback-failed', {
      installationId,
      message,
    });
    return buildConnectsRedirect(request, {
      vcsProvider: 'github',
      vcsConnection: 'failed',
      vcsError: 'installation_callback_failed',
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
  const userContext = await readOptionalUser();
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
    clearOAuthCookies(provider);
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
  clearOAuthCookies(provider);

  return saveOAuthConnection({ request, provider, auth, instanceUrl });
}

export async function handleGitHubCallback(request: Request, context?: ProviderRouteContext) {
  const provider = await resolveProvider(context);
  const url = new URL(request.url);
  bitcodeServerTelemetry('info', 'github-callback', 'received', {
    provider,
    hasInstallationId: url.searchParams.has('installation_id'),
    hasCode: Boolean(readString(url.searchParams.get('code'))),
    hasError: Boolean(readString(url.searchParams.get('error'))),
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
