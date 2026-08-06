import { NextResponse } from 'next/server';

import { createRouteWrapper } from '@bitcode/middleware';
import {
  buildAuxillariesConnectionReadiness,
  buildAuxillariesRecoveryRun,
} from '@bitcode/api/src/routes/auxillaries-contract';

import { bitcodeServerTelemetry } from '@/lib/bitcode-server-telemetry';

import {
  buildDisconnectedConnectionStatus,
  buildStoredConnectionStatus,
  getMockConnectionStatus,
  getRouteSupabaseUser,
  getStoredConnection,
  isMockVcsMode,
  readInstanceUrl,
  resolveRouteProvider,
  type ProviderRouteContext,
  validateStoredConnection,
} from '../../_shared';

export const runtime = 'nodejs';

export const GET = createRouteWrapper(async (request: Request, context: ProviderRouteContext) => {
  const provider = await resolveRouteProvider(context);

  if (isMockVcsMode()) {
    const connectionStatus = getMockConnectionStatus(provider);
    return NextResponse.json({
      ...connectionStatus,
      providerReadiness: buildAuxillariesConnectionReadiness({
        provider,
        connectionStatus,
        repositories: connectionStatus.connected ? [{}] : [],
      }),
    });
  }

  const { supabase, user } = await getRouteSupabaseUser();
  if (!user) {
    const connectionStatus = buildDisconnectedConnectionStatus(provider);
    // Surface staged GitHub App installs even without a session so Externals
    // can prompt Connect instead of looking idle.
    let claimedInstallation: {
      claimed: boolean;
      installationId?: number;
      account?: string | null;
      error?: string;
      errorClass?: string;
      diagnostic?: unknown;
    } | null = null;
    if (provider === 'github') {
      try {
        const { claimPendingGitHubInstallation } = await import(
          '@/app/tps/github/_callback-handler'
        );
        claimedInstallation = await claimPendingGitHubInstallation(request);
        if (claimedInstallation?.error === 'session_required') {
          bitcodeServerTelemetry('info', 'github-connection', 'claim-needs-session', {
            installationId: claimedInstallation.installationId ?? null,
            errorClass: claimedInstallation.errorClass ?? 'session',
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        bitcodeServerTelemetry('error', 'github-connection', 'claim-throw-unauthenticated', {
          message,
        });
        claimedInstallation = {
          claimed: false,
          error: message,
          errorClass: 'unknown',
        };
      }
    }
    return NextResponse.json({
      ...connectionStatus,
      claimedInstallation,
      providerReadiness: buildAuxillariesConnectionReadiness({
        provider,
        connectionStatus,
        repositories: [],
      }),
    });
  }

  // Complete a GitHub App install that was staged while the session was absent
  // (reinstall / account switch / cookie race on the App callback).
  let claimedInstallation: {
    claimed: boolean;
    installationId?: number;
    account?: string | null;
    error?: string;
    errorClass?: string;
    diagnostic?: unknown;
  } | null = null;
  if (provider === 'github') {
    try {
      const { claimPendingGitHubInstallation } = await import(
        '@/app/tps/github/_callback-handler'
      );
      claimedInstallation = await claimPendingGitHubInstallation(request);
      bitcodeServerTelemetry('info', 'github-connection', 'claim-result', {
        claimed: claimedInstallation.claimed,
        installationId: claimedInstallation.installationId ?? null,
        account: claimedInstallation.account ?? null,
        error: claimedInstallation.error ?? null,
        errorClass: claimedInstallation.errorClass ?? null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      bitcodeServerTelemetry('error', 'github-connection', 'claim-throw', {
        message,
      });
      claimedInstallation = {
        claimed: false,
        error: message,
        errorClass: 'unknown',
      };
    }
  }

  const { manager, connection } = await getStoredConnection(supabase, user.id, provider);
  if (!connection) {
    const connectionStatus = buildDisconnectedConnectionStatus(provider);
    return NextResponse.json({
      ...connectionStatus,
      claimedInstallation,
      providerReadiness: buildAuxillariesConnectionReadiness({
        provider,
        connectionStatus,
        repositories: [],
      }),
    });
  }

  const instanceUrl = readInstanceUrl(request);
  // Explicit Refresh from Externals passes force_refresh=1 so we re-mint the
  // GitHub App installation token even when the stored token has not expired
  // yet (Invalid + future expiry used to no-op regeneration on Refresh).
  const forceRefresh =
    new URL(request.url).searchParams.get('force_refresh') === '1' ||
    new URL(request.url).searchParams.get('force_refresh') === 'true';
  const valid = await validateStoredConnection(
    manager,
    provider,
    connection,
    instanceUrl,
    { forceRegenerate: forceRefresh },
  ).catch(() => false);
  // V48-Gate3-F33: validateStoredConnection may have just regenerated and
  // persisted a fresh GitHub App installation token (getAuthFromConnection).
  // `connection` above was fetched BEFORE that write, so building the status
  // from it would show the pre-regeneration token_expires_at/metadata for
  // this whole response — one Refresh click behind reality. Always re-fetch
  // after validation so success (new expiry) and failure diagnostics
  // (last_regeneration_error) are visible immediately.
  const refreshedConnection =
    (await manager.getConnection(user.id, provider).catch(() => null)) || connection;
  const connectionStatus = buildStoredConnectionStatus(provider, refreshedConnection, valid);

  return NextResponse.json({
    ...connectionStatus,
    claimedInstallation,
    providerReadiness: buildAuxillariesConnectionReadiness({
      provider,
      connection: refreshedConnection.connectionData,
      connectionStatus,
      repositories: valid ? [{}] : [],
    }),
  });
});

export const DELETE = createRouteWrapper(async (request: Request, context: ProviderRouteContext) => {
  const provider = await resolveRouteProvider(context);

  if (isMockVcsMode()) {
    return NextResponse.json({
      success: true,
      provider,
      disconnected: true,
      mock_mode: true,
    });
  }

  const { supabase, user } = await getRouteSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { manager, connection } = await getStoredConnection(supabase, user.id, provider);
  if (!connection) {
    const connectionStatus = buildDisconnectedConnectionStatus(provider);
    return NextResponse.json({
      success: true,
      provider,
      disconnected: false,
      message: 'No active connection to remove',
      providerReadiness: buildAuxillariesConnectionReadiness({
        provider,
        connectionStatus,
        repositories: [],
      }),
    });
  }

  const beforeStatus = buildStoredConnectionStatus(provider, connection, true);
  const beforeReadiness = buildAuxillariesConnectionReadiness({
    provider,
    connection: connection.connectionData,
    connectionStatus: beforeStatus,
    repositories: [{}],
  });
  await manager.deleteConnection(connection.id);
  const afterStatus = buildDisconnectedConnectionStatus(provider);
  const afterReadiness = buildAuxillariesConnectionReadiness({
    provider,
    connectionStatus: afterStatus,
    repositories: [],
  });
  const recoveryRun = buildAuxillariesRecoveryRun({
    targetPane: 'externals',
    repairAction: 'disconnect_provider',
    beforeReadinessRoot: beforeReadiness.providerReadinessRoot,
    afterReadinessRoot: afterReadiness.providerReadinessRoot,
    executionId: `auxillaries-${provider}-disconnect`,
    outcome: 'succeeded',
  });

  return NextResponse.json({
    success: true,
    provider,
    disconnected: true,
    providerReadiness: afterReadiness,
    recoveryRun,
  });
});
