import { createRouteWrapper } from '@bitcode/middleware';

import { handleGitHubCallback } from '@/app/tps/github/_callback-handler';

import type { ProviderRouteContext } from '../../_shared';

export const runtime = 'nodejs';

export const GET = createRouteWrapper(async (request: Request, context: ProviderRouteContext) =>
  handleGitHubCallback(request, context),
);
