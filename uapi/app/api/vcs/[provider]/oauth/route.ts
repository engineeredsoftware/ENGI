import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createRouteWrapper } from '@bitcode/middleware';
import { getProviderScopes, VCSProviderFactory } from '@bitcode/vcs';

import {
  isMockVcsMode,
  readInstanceUrl,
  resolveRouteProvider,
  type ProviderRouteContext,
} from '../../_shared';

export const runtime = 'nodejs';

export const GET = createRouteWrapper(async (request: Request, context: ProviderRouteContext) => {
  const provider = await resolveRouteProvider(context);

  if (isMockVcsMode()) {
    return NextResponse.redirect(new URL('/packs?mockVcsOAuth=1', request.url));
  }

  const instanceUrl = readInstanceUrl(request);
  const vcsProvider = await VCSProviderFactory.createFromEnvironment(provider, instanceUrl);
  const state = crypto.randomBytes(16).toString('hex');
  const cookieStore = cookies();

  cookieStore.set(`vcs_oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  if (instanceUrl) {
    cookieStore.set(`vcs_oauth_instance_${provider}`, instanceUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
  }

  const authorizationUrl = vcsProvider.getAuthorizationUrl(state, getProviderScopes(provider));
  return NextResponse.redirect(authorizationUrl);
});
