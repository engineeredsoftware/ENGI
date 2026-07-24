/**
 * Absolutes category framing over shared MeasureAgent base.
 *
 * Owns the absolute tool catalog (one tool per bare absolute kind).
 * Host/product paths must call registerAbsoluteMeasureTools(execution)
 * before invoking the agent so Try/Retry can resolve measure:absolute:*.
 */
import {
  factoryMeasureAgent,
  type MeasureAgent,
  type MeasurementSpec,
} from '@bitcode/generic-agents-agent-measure';
import { DATA_PACK_ABSOLUTES_CATALOG } from '@bitcode/generic-measurements-domain-data-pack-absolutes-catalog';
import {
  listAbsoluteMeasureToolKeys,
  registerAbsoluteMeasureTools,
  type AbsoluteMeasureToolsHost,
} from './register-absolute-measure-tools';

export const ABSOLUTES_CATEGORY_FRAMING =
  'You measure ABSOLUTES — INTRINSIC properties of digital material (a synthesized DataPack). ' +
  'QUANTITY properties are tool-measured counts (prefer measure:absolute:* tool results). ' +
  'QUALITY properties are judgment grounded in tool counts + the source-safe descriptor. ' +
  'Absolutes depend ONLY on the DataPack, never on any reader, demand, market, or buyer. ' +
  'Prefer tool-measured magnitudes for quantity; do not invent sizes that contradict measured counts.';

/** Quantity kinds in the weighted commercial catalog — tool-authoritative. */
export const ABSOLUTES_QUANTITY_TOOL_KINDS = [
  'function-count',
  'type-count',
  'file-span',
  'symbolic-richness',
  'modularity',
  'lang-span',
  'test-surface',
  'api-surface',
] as const;

export function absoluteMeasureToolKeyForKind(kind: string): string {
  return `measure:absolute:${kind}`;
}

/** Try/Retry tool surface: quantity tools from the weighted catalog. */
export function listWeightedQuantityAbsoluteMeasureToolKeys(): string[] {
  return ABSOLUTES_QUANTITY_TOOL_KINDS.map(absoluteMeasureToolKeyForKind);
}

export interface AbsolutesMeasureAgentConfig {
  name: string;
  description?: string;
  subject: string;
  measurements?: MeasurementSpec[];
  /**
   * Tool keys for Try/Retry. Default: weighted quantity measure:absolute:* keys.
   * Pass listAbsoluteMeasureToolKeys() to expose the full 46-tool surface.
   */
  tools?: string[];
  plan?: { chunkThreshold?: number; tools?: string[] };
  try?: { chunkThreshold?: number; tools?: string[] };
  refine?: { maxAttempts?: number; tools?: string[] };
  retry?: { maxAttempts?: number; tools?: string[] };
}

export type AbsolutesMeasureAgent = MeasureAgent & {
  /** Register all absolute measure tools on an execution (full 46). */
  registerTools: (execution: AbsoluteMeasureToolsHost | null | undefined) => string[];
  /** Tool keys this agent advertises on Try/Retry. */
  measureToolKeys: string[];
};

/**
 * Base AbsolutesMeasureAgent: category framing + absolute tool catalog.
 * Product deposit/read factories specialize name/subject/measurements.
 */
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

  const toolKeys =
    config.tools && config.tools.length > 0
      ? config.tools
      : listWeightedQuantityAbsoluteMeasureToolKeys();

  const base = factoryMeasureAgent({
    name: config.name,
    description: config.description,
    subject: config.subject,
    category: 'absolute',
    categoryFraming: ABSOLUTES_CATEGORY_FRAMING,
    measurements,
    tools: toolKeys,
    plan: config.plan,
    try: config.try,
    refine: config.refine,
    retry: config.retry,
  });

  /**
   * Invoke wrapper: register absolute tools on the execution tree before PTRR runs.
   * Call sites may still register tools earlier (deposit Implementation); this is
   * defense-in-depth so product agents own their tool surface.
   */
  const original = base as unknown as (input: unknown, execution: unknown) => Promise<unknown>;
  const wrapped = async function AbsolutesMeasureAgentInvoke(
    input: unknown,
    execution: unknown,
  ) {
    registerAbsoluteMeasureTools(execution as AbsoluteMeasureToolsHost);
    return original(input, execution);
  };

  // Copy agent metadata without clobbering the function's read-only `name`.
  for (const key of Object.keys(base as object)) {
    if (key === 'name') continue;
    try {
      (wrapped as any)[key] = (base as any)[key];
    } catch {
      /* non-writable */
    }
  }
  (wrapped as any).measurementSpecs = (base as any).measurementSpecs;
  (wrapped as any).measurementCategory = (base as any).measurementCategory;
  (wrapped as any).measurePrompt = (base as any).measurePrompt;
  (wrapped as any).measureToolKeys = toolKeys;
  (wrapped as any).registerTools = (
    execution: AbsoluteMeasureToolsHost | null | undefined,
  ) => registerAbsoluteMeasureTools(execution);
  (wrapped as any).description = (base as any).description;
  (wrapped as any).steps = (base as any).steps;
  try {
    Object.defineProperty(wrapped, 'name', {
      value: config.name,
      configurable: true,
      writable: true,
    });
  } catch {
    /* name may remain engine-assigned */
  }

  return wrapped as AbsolutesMeasureAgent;
}

export { listAbsoluteMeasureToolKeys, registerAbsoluteMeasureTools };
