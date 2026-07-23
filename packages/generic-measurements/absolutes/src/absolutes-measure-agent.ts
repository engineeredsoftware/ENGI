/**
 * AbsolutesMeasureAgent — absolute/intrinsic Measurement base.
 *
 * Hierarchy: Absolutes + MeasureAgent (+ Measurement primitives).
 * Product: SynthesizeAssetPacksAbsolutesMeasureAgent (asset-packs/synthesis).
 *
 * Absolutes are INTRINSIC properties of digital material — sizes, correctness,
 * knowledge volume — that depend ONLY on the artifact, never on any reader,
 * demand, market, or buyer. (Reader-relative measures are Needinesses.)
 */

import {
  factoryMeasureAgent,
  type MeasureAgent,
  type MeasurementSpec,
} from '@bitcode/generic-agents-agent-measure';

const ABSOLUTES_FRAMING =
  'You measure ABSOLUTES — INTRINSIC properties of digital material. Data is digital ' +
  'material; material has properties. QUANTITY properties include size, symbolic ' +
  'richness, modularity (often tool-measured counts). QUALITY properties include ' +
  'objectives fidelity, correctness, computational-usage requirements (judgment ' +
  'readings you ground in the tool-measured quantities + the source-safe descriptor). ' +
  'Absolutes depend ONLY on the artifact, never on any reader, demand, market, or buyer. ' +
  'Measure what IS present, not what anyone wants or would pay for. Prefer tool-measured ' +
  'magnitudes for quantity; do not invent sizes that contradict static-analysis counts.';

export interface AbsolutesMeasureAgentConfig {
  name: string;
  description?: string;
  /** What is being measured, e.g. "a synthesized source-safe AssetPack patch". */
  subject: string;
  /** The absolutes catalog to read (sizes / correctness / volume / …). */
  measurements: MeasurementSpec[];
  plan?: { chunkThreshold?: number };
  try?: { chunkThreshold?: number };
  refine?: { maxAttempts?: number };
  retry?: { maxAttempts?: number };
}

/** AbsolutesMeasureAgent — MeasureAgent specialized to category absolute. */
export type AbsolutesMeasureAgent = MeasureAgent;

/**
 * factoryAbsolutesMeasureAgent — bases factoryMeasureAgent with absolutes framing.
 */
export function factoryAbsolutesMeasureAgent(
  config: AbsolutesMeasureAgentConfig,
): AbsolutesMeasureAgent {
  return factoryMeasureAgent({
    name: config.name,
    description: config.description,
    subject: config.subject,
    category: 'absolute',
    categoryFraming: ABSOLUTES_FRAMING,
    measurements: config.measurements,
    plan: config.plan,
    try: config.try,
    refine: config.refine,
    retry: config.retry,
  });
}
