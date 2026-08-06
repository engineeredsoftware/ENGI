import { createRouteWrapper } from '@bitcode/middleware';

import { handleGitHubCallback } from '../_callback-handler';

export const runtime = 'nodejs';

export const GET = createRouteWrapper(async (request: Request) => handleGitHubCallback(request));
