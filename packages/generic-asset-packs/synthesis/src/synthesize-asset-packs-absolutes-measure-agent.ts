/**
 * Product AbsolutesMeasureAgent for DataPack synthesis (deposit | read).
 * Bases @bitcode/generic-agents-agent-measure-absolutes with weighted DATA_PACK catalog.
 */

import {
  factoryAbsolutesMeasureAgent,
  type AbsolutesMeasureAgent,
} from '@bitcode/generic-agents-agent-measure-absolutes';

import { DATA_PACK_ABSOLUTES_PRODUCT_CATALOG } from './measurement-catalogs';
import type { SynthesizeAssetPacksMode } from './types';

const MODE_SUBJECT: Record<SynthesizeAssetPacksMode, string> = {
  deposit:
    'a synthesized source-safe deposit DataPack patch the depositor will review and admit',
  read: 'a synthesized source-safe Need-fitting DataPack the reader will review and buy',
};

export function factorySynthesizeAssetPacksAbsolutesMeasureAgent(
  mode: SynthesizeAssetPacksMode,
): AbsolutesMeasureAgent {
  return factoryAbsolutesMeasureAgent({
    name: `SynthesizeDataPacksAbsolutesMeasureAgent:${mode}`,
    description: `Measures absolute material properties (quantity + quality) of ${MODE_SUBJECT[mode]}.`,
    subject: MODE_SUBJECT[mode],
    measurements: DATA_PACK_ABSOLUTES_PRODUCT_CATALOG,
    plan: { chunkThreshold: 1500 },
    try: { chunkThreshold: 3000 },
    refine: { maxAttempts: 2 },
    retry: { maxAttempts: 1 },
  });
}
