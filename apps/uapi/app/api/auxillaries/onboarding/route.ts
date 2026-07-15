import {
  buildGetAuxillaryOnboardingRoute,
  buildPostAuxillaryOnboardingRoute,
} from '@bitcode/api/src/routes/auxillaries';
import { buildMockOnboardingData, isAuxillariesMockMode } from '@/lib/mock-review-mode';

export const runtime = 'nodejs';

const routeOptions = {
  isMockMode: isAuxillariesMockMode,
  mockOnboardingData: buildMockOnboardingData,
};

export const GET = buildGetAuxillaryOnboardingRoute(routeOptions);
export const POST = buildPostAuxillaryOnboardingRoute(routeOptions);
