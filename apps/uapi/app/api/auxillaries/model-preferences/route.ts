import {
  buildGetAuxillaryModelPreferencesRoute,
  buildPostAuxillaryModelPreferencesRoute,
} from '@bitcode/api/src/routes/auxillaries';
import { buildMockAuxillariesData, isAuxillariesMockMode } from '../../../../lib/mock-review-mode';

export const runtime = 'nodejs';

const routeOptions = {
  isMockMode: isAuxillariesMockMode,
  mockModelPreferences: () => buildMockAuxillariesData().modelPreferences,
};

export const GET = buildGetAuxillaryModelPreferencesRoute(routeOptions);
export const POST = buildPostAuxillaryModelPreferencesRoute(routeOptions);
