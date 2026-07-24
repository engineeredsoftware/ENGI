/**
 * Absolutes category framing over shared MeasureAgent base.
 */
import {
  factoryMeasureAgent,
  type MeasureAgent,
  type MeasurementSpec,
} from '@bitcode/generic-agents-agent-measure';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';

export const ABSOLUTES_CATEGORY_FRAMING =
  'You measure ABSOLUTES — INTRINSIC properties of digital material (a synthesized DataPack). ' +
  'QUANTITY properties are tool-measured counts. QUALITY properties are judgment grounded in ' +
  'tool counts + the source-safe descriptor. Absolutes depend ONLY on the DataPack, never on ' +
  'any reader, demand, market, or buyer. Prefer tool-measured magnitudes for quantity; do not ' +
  'invent sizes that contradict measured counts.';

export interface AbsolutesMeasureAgentConfig {
  name: string;
  description?: string;
  subject: string;
  measurements?: MeasurementSpec[];
  plan?: { chunkThreshold?: number };
  try?: { chunkThreshold?: number };
  refine?: { maxAttempts?: number };
  retry?: { maxAttempts?: number };
}

export type AbsolutesMeasureAgent = MeasureAgent;

export function factoryAbsolutesMeasureAgent(
  config: AbsolutesMeasureAgentConfig,
): AbsolutesMeasureAgent {
  const measurements =
    config.measurements && config.measurements.length > 0
      ? config.measurements
      : DATA_PACK_ABSOLUTES_CATALOG.map((s) => ({
          measurementKind: s.measurementKind,
          label: s.label,
          unit: s.unit,
          guidance: s.guidance,
          hasMagnitude: true as const,
        }));
  return factoryMeasureAgent({
    name: config.name,
    description: config.description,
    subject: config.subject,
    category: 'absolute',
    categoryFraming: ABSOLUTES_CATEGORY_FRAMING,
    measurements,
    plan: config.plan,
    try: config.try,
    refine: config.refine,
    retry: config.retry,
  });
}
