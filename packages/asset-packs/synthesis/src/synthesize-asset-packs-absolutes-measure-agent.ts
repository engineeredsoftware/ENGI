/**
 * SynthesizeAssetPacksAbsolutesMeasureAgent — product AbsolutesMeasureAgent.
 *
 * Hierarchy: SynthesizeAssetPacks + Absolutes + MeasureAgent (+ Measurement).
 * Bases factoryAbsolutesMeasureAgent with the SynthesizeAssetPacks ABSOLUTES catalog.
 * Lens-parameterized (deposit | read). Static-analysis tool integration remains
 * in pipeline-asset-pack validation agents (host-coupled).
 */

import {
  factoryAbsolutesMeasureAgent,
  type AbsolutesMeasureAgent,
} from '@bitcode/generic-measurements-absolutes';

import { ASSET_PACK_ABSOLUTES_CATALOG } from './measurement-catalogs';
import type { AssetPacksSynthesisLens } from './types';

const LENS_SUBJECT: Record<AssetPacksSynthesisLens, string> = {
  deposit:
    'a synthesized source-safe deposit AssetPack patch the depositor will review and admit',
  read: 'a synthesized source-safe Need-fitting AssetPack the reader will review and buy',
};

/**
 * factorySynthesizeAssetPacksAbsolutesMeasureAgent — lens-parameterized product measurer.
 */
export function factorySynthesizeAssetPacksAbsolutesMeasureAgent(
  lens: AssetPacksSynthesisLens,
): AbsolutesMeasureAgent {
  return factoryAbsolutesMeasureAgent({
    name: `SynthesizeAssetPacksAbsolutesMeasureAgent:${lens}`,
    description: `Measures absolute material properties (quantity + quality) of ${LENS_SUBJECT[lens]}.`,
    subject: LENS_SUBJECT[lens],
    measurements: ASSET_PACK_ABSOLUTES_CATALOG,
    plan: { chunkThreshold: 1500 },
    try: { chunkThreshold: 3000 },
    refine: { maxAttempts: 2 },
    retry: { maxAttempts: 1 },
  });
}

/** @deprecated Use factorySynthesizeAssetPacksAbsolutesMeasureAgent */
export const factoryAssetPackMeasureAbsolutesAgent =
  factorySynthesizeAssetPacksAbsolutesMeasureAgent;
