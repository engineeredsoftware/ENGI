/**
 * measure-agent-absolutes — the absolutes-category base measurer (V48 Gate 3).
 *
 * Bases the generic measure-agent (factoryMeasureAgent) with the ABSOLUTES
 * framing. Absolutes are INTRINSIC measures: properties of the artifact itself —
 * its sizes, its correctness, the amount of knowledge it encodes — that depend
 * ONLY on the artifact, never on any reader, demand, market, or buyer. (Reader-
 * relative measures are the needinesses category — measure-agent-needinesses,
 * Gate 4.)
 *
 * The asset-pack concrete measurer agent-measure-absolutes bases this factory
 * with its absolutes catalog (sizes / correctness / semantic-volume), lens-aware.
 */

import {
  factoryMeasureAgent,
  type MeasureAgent,
  type MeasurementSpec,
} from './measure-agent';

const ABSOLUTES_FRAMING =
  'You measure ABSOLUTES — INTRINSIC properties of digital material. Data is digital ' +
  'material; material has properties. QUANTITY properties include size, symbolic ' +
  'richness, modularity (often tool-measured counts). QUALITY properties include ' +
  'objectives fidelity, correctness, computational-usage requirements (judgment ' +
  'readings you ground in the tool-measured quantities + the source-safe descriptor). ' +
  'Absolutes depend ONLY on the artifact, never on any reader, demand, market, or buyer. ' +
  'Measure what IS present, not what anyone wants or would pay for. Prefer tool-measured ' +
  'magnitudes for quantity; do not invent sizes that contradict static-analysis counts.';

export interface MeasureAgentAbsolutesConfig {
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

/**
 * factoryMeasureAgentAbsolutes — bases factoryMeasureAgent with the absolutes
 * category + framing. The Gate-3 absolutes measurer; the sibling
 * factoryMeasureAgentNeedinesses lands in Gate 4.
 */
export function factoryMeasureAgentAbsolutes(
  config: MeasureAgentAbsolutesConfig,
): MeasureAgent {
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
