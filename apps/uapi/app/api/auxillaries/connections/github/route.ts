import { NextResponse } from 'next/server';

import {
  buildAuxillariesConnectionReadiness,
  buildAuxillariesRecoveryRun,
} from '@bitcode/api/src/routes/auxillaries-contract';
import { createClient } from '@bitcode/supabase/ssr/server';

export const runtime = 'nodejs';

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: !error ? user : null,
  };
}

function resolveInstallationId(connectionData: Record<string, unknown> | null | undefined) {
  const raw =
    connectionData?.installationId ??
    connectionData?.installation_id ??
    connectionData?.connectionId ??
    connectionData?.provider_user_id;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

const sensitiveConnectionDataKeys = new Set([
  'access_token',
  'accesstoken',
  'oauth_token',
  'oauthtoken',
  'refresh_token',
  'refreshtoken',
  'token',
  'client_secret',
  'clientsecret',
  'private_key',
  'privatekey',
]);

function sanitizeConnectionData(connectionData: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(connectionData).filter(([key]) => !sensitiveConnectionDataKeys.has(key.toLowerCase())),
  );
}

function buildGithubConnectionStatus(input: {
  connectionData: Record<string, unknown> | null;
  valid: boolean;
  readbackStatus?: 'succeeded' | 'failed' | 'not_attempted';
}) {
  const connectionData = input.connectionData ?? {};
  const connected = Boolean(input.connectionData);
  const scopes = Array.isArray(connectionData.scopes)
    ? connectionData.scopes.filter((entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()))
    : typeof connectionData.scope === 'string'
      ? connectionData.scope.split(/[,\s]+/u).filter(Boolean)
      : [];

  return {
    connected,
    provider: 'github',
    valid: input.valid,
    username:
      typeof connectionData.provider_username === 'string'
        ? connectionData.provider_username
        : typeof connectionData.username === 'string'
          ? connectionData.username
          : undefined,
    tokenPresenceClass: connected
      ? input.valid
        ? 'present_source_safe'
        : 'invalid'
      : 'missing',
    scopes,
    scopesClass: scopes.length ? undefined : connected ? 'unknown' : 'missing',
    lastReadbackStatus: input.readbackStatus ?? (connected ? (input.valid ? 'succeeded' : 'failed') : 'not_attempted'),
    lastReadbackAt: connected ? new Date().toISOString() : null,
    blocker: connected && input.valid ? null : connected ? 'connects.github.reauthorize_provider' : 'connects.github.connect_provider',
  };
}

export async function GET(_request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('user_connections')
    .select('connection_data')
    .eq('user_id', user.id)
    .eq('provider', 'github')
    .maybeSingle();

  if (error || !data?.connection_data) {
    const connectionStatus = buildGithubConnectionStatus({
      connectionData: null,
      valid: false,
      readbackStatus: 'not_attempted',
    });
    return NextResponse.json({
      success: false,
      error: 'No GitHub connection found',
      providerReadiness: buildAuxillariesConnectionReadiness({
        provider: 'github',
        connectionStatus,
        repositories: [],
      }),
    }, { status: 404 });
  }

  const connectionData = data.connection_data as Record<string, unknown>;
  const installationId = resolveInstallationId(connectionData);
  if (!installationId) {
    const connectionStatus = buildGithubConnectionStatus({
      connectionData,
      valid: false,
      readbackStatus: 'failed',
    });
    return NextResponse.json({
      success: true,
      connectionData: sanitizeConnectionData(connectionData),
      repositories: [],
      organizations: [],
      providerReadiness: buildAuxillariesConnectionReadiness({
        provider: 'github',
        connection: connectionData,
        connectionStatus,
        repositories: [],
      }),
    });
  }

  try {
    const { app } = await import('@/app/octokit');
    const octokit = await app.getInstallationOctokit(installationId) as any;
    const repositories = await octokit.paginate(octokit.rest.apps.listReposAccessibleToInstallation);
    const organizations = Array.from(
      new Set(
        repositories
          .filter((repository: any) => repository.owner?.type === 'Organization')
          .map((repository: any) => repository.owner.login),
      ),
    );

    return NextResponse.json({
      success: true,
      connectionData: sanitizeConnectionData(connectionData),
      repositories,
      organizations,
      providerReadiness: buildAuxillariesConnectionReadiness({
        provider: 'github',
        connection: connectionData,
        connectionStatus: buildGithubConnectionStatus({
          connectionData,
          valid: true,
          readbackStatus: 'succeeded',
        }),
        repositories,
      }),
    });
  } catch (octokitError: any) {
    const connectionStatus = buildGithubConnectionStatus({
      connectionData,
      valid: false,
      readbackStatus: 'failed',
    });
    return NextResponse.json(
      {
        success: false,
        error: octokitError?.message || 'Failed to inspect GitHub connection',
        providerReadiness: buildAuxillariesConnectionReadiness({
          provider: 'github',
          connection: connectionData,
          connectionStatus,
          repositories: [],
        }),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { data: beforeData } = await supabase
    .from('user_connections')
    .select('connection_data')
    .eq('user_id', user.id)
    .eq('provider', 'github')
    .maybeSingle();
  const beforeConnectionData = (beforeData?.connection_data ?? null) as Record<string, unknown> | null;
  const beforeReadiness = buildAuxillariesConnectionReadiness({
    provider: 'github',
    connection: beforeConnectionData,
    connectionStatus: buildGithubConnectionStatus({
      connectionData: beforeConnectionData,
      valid: Boolean(beforeConnectionData),
      readbackStatus: beforeConnectionData ? 'succeeded' : 'not_attempted',
    }),
    repositories: beforeConnectionData ? [{}] : [],
  });

  const { error } = await supabase.from('user_connections').upsert(
    {
      user_id: user.id,
      provider: 'github',
      connection_data: body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: ['user_id', 'provider'] },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const afterReadiness = buildAuxillariesConnectionReadiness({
    provider: 'github',
    connection: body,
    connectionStatus: buildGithubConnectionStatus({
      connectionData: body,
      valid: true,
      readbackStatus: 'succeeded',
    }),
    repositories: [{}],
  });

  return NextResponse.json({
    success: true,
    connectionData: sanitizeConnectionData(body),
    providerReadiness: afterReadiness,
    recoveryRun: buildAuxillariesRecoveryRun({
      targetPane: 'externals',
      repairAction: beforeConnectionData ? 'reauthorize_provider' : 'connect_provider',
      beforeReadinessRoot: beforeReadiness.providerReadinessRoot,
      afterReadinessRoot: afterReadiness.providerReadinessRoot,
      executionId: 'auxillaries-github-connection-upsert',
      outcome: 'succeeded',
    }),
  });
}
