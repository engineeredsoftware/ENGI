import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createRouteWrapper } from '@bitcode/middleware';
import { VCSConnections, VCSProviderFactory } from '@bitcode/vcs-generics';

import {
  getMockConnectionStatus,
  getRouteSupabaseUser,
  isMockVcsMode,
  resolveRouteProvider,
  type ProviderRouteContext,
} from '../../_shared';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  token: z.string().trim().min(1),
  instanceUrl: z.string().trim().url().optional().or(z.literal('')),
});

export const POST = createRouteWrapper(async (request: Request, context: ProviderRouteContext) => {
  const provider = await resolveRouteProvider(context);
  const payload = payloadSchema.parse(await request.json());
  const instanceUrl = payload.instanceUrl || undefined;

  if (isMockVcsMode()) {
    return NextResponse.json({
      success: true,
      provider,
      connection: getMockConnectionStatus(provider),
      mock_mode: true,
    });
  }

  const { supabase, user } = await getRouteSupabaseUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const vcsProvider = await VCSProviderFactory.createFromEnvironment(provider, instanceUrl);
  const auth = {
    accessToken: payload.token,
  };

  let isValid = false;
  try {
    isValid = await vcsProvider.validateToken(auth);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to validate the personal access token with the provider.',
      },
      { status: 400 },
    );
  }
  if (!isValid) {
    return NextResponse.json(
      {
        error:
          provider === 'github'
            ? 'Invalid GitHub token. Use a classic PAT with `repo` + `read:user`, or a fine-grained PAT with repository access (and ideally Account → Read profile).'
            : 'Invalid token',
      },
      { status: 400 },
    );
  }

  let vcsUser;
  try {
    vcsUser = await vcsProvider.getCurrentUser(auth);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Token validated but the provider user profile could not be read.',
      },
      { status: 400 },
    );
  }

  const manager = new VCSConnections(supabase);
  const connectionId = await manager.saveConnection(user.id, provider, {
    accessToken: payload.token,
    providerUserId: vcsUser.id,
    providerUsername: vcsUser.username,
    instanceUrl,
    metadata: {
      auth_source: 'personal-access-token',
      display_name: vcsUser.displayName,
      email: vcsUser.email,
      avatar_url: vcsUser.avatarUrl,
      url: vcsUser.url,
      // Clear any prior app-install failure diagnostics when operator switches to PAT.
      last_regeneration_error: null,
    },
  });

  return NextResponse.json({
    success: true,
    provider,
    connection: {
      id: connectionId,
      username: vcsUser.username,
      instanceUrl,
    },
  });
});
