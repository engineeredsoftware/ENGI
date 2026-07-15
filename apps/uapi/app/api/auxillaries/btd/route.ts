import { buildPostAuxillaryBtdRoute } from '@bitcode/api/src/routes/auxillaries';
import { isAuxillariesMockMode } from '@/lib/mock-review-mode';

export const runtime = 'nodejs';

export const POST = buildPostAuxillaryBtdRoute({
  isMockMode: isAuxillariesMockMode,
});
