/**
 * Product AbsolutesMeasureAgent for DataPack synthesis (deposit | read).
 *
 * Hierarchy:
 *   factoryMeasureAgent (generic-agents/agent-measure)
 *     → factoryAbsolutesMeasureAgent (generic-agents/agent-measure-absolutes)
 *       → factorySynthesizeAssetPacksAbsolutesMeasureAgent (this package)
 *         → factoryDepositAbsolutesMeasureAgent
 *         → factoryReadAbsolutesMeasureAgent
 *
 * Bases the absolute tool-owning agent with the full 46-kind DATA_PACK product catalog.
 * Tools register on invoke via the base agent wrapper.
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

/**
 * Product factory: deposit | read AbsolutesMeasureAgent with full 46-kind catalog + tools.
 */
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

/** Deposit product specialization of the base AbsolutesMeasureAgent. */
export function factoryDepositAbsolutesMeasureAgent(): AbsolutesMeasureAgent {
  return factorySynthesizeAssetPacksAbsolutesMeasureAgent('deposit');
}

/** Read product specialization of the base AbsolutesMeasureAgent. */
export function factoryReadAbsolutesMeasureAgent(): AbsolutesMeasureAgent {
  return factorySynthesizeAssetPacksAbsolutesMeasureAgent('read');
}
