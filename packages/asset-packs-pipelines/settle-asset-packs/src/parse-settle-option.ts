/**
 * Boundary adapter: parse wire JSON into strongly typed SettleAssetPackOption.
 * Fail-closed — never returns loosely typed bags.
 */

import type {
  AbsoluteReadingForSettlement,
  AssetPackMeasurementsForSettlement,
  NeedinessRowInput,
} from '@bitcode/btd/erc1155';
import type { SettleAssetPackOption, SettleAssetPackPatch } from './settle-types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseNeedinessRow(raw: unknown): NeedinessRowInput | null {
  if (!isObject(raw)) return null;
  const volume = typeof raw.volume === 'number' ? raw.volume : null;
  if (volume === null || !Number.isFinite(volume)) return null;
  const weight = typeof raw.weight === 'number' && Number.isFinite(raw.weight) ? raw.weight : undefined;
  const magnitude =
    typeof raw.magnitude === 'number' && Number.isFinite(raw.magnitude) ? raw.magnitude : undefined;
  const unit = typeof raw.unit === 'string' ? raw.unit : null;
  if (typeof raw.measurementKind === 'string' && raw.measurementKind.trim()) {
    return {
      measurementKind: raw.measurementKind.trim(),
      volume,
      weight,
      magnitude,
      unit,
      category: 'neediness',
    };
  }
  if (typeof raw.kind === 'string' && raw.kind.trim()) {
    return {
      kind: raw.kind.trim(),
      volume,
      weight,
      magnitude,
      unit,
      category: 'neediness',
    };
  }
  return null;
}

function parseAbsoluteRow(raw: unknown): AbsoluteReadingForSettlement | null {
  if (!isObject(raw)) return null;
  const volume = typeof raw.volume === 'number' ? raw.volume : null;
  if (volume === null || !Number.isFinite(volume)) return null;
  return {
    measurementKind: typeof raw.measurementKind === 'string' ? raw.measurementKind : undefined,
    kind: typeof raw.kind === 'string' ? raw.kind : undefined,
    volume,
    magnitude: typeof raw.magnitude === 'number' ? raw.magnitude : undefined,
    weight: typeof raw.weight === 'number' ? raw.weight : undefined,
    unit: typeof raw.unit === 'string' ? raw.unit : null,
    category: 'absolute',
  };
}

function parseMeasurements(raw: unknown): AssetPackMeasurementsForSettlement | null {
  if (!isObject(raw)) return null;
  const needinessesRaw = Array.isArray(raw.needinesses) ? raw.needinesses : null;
  if (!needinessesRaw) return null;
  const needinesses: NeedinessRowInput[] = [];
  for (const row of needinessesRaw) {
    const parsed = parseNeedinessRow(row);
    if (parsed) needinesses.push(parsed);
  }
  if (needinesses.length === 0) return null;
  const absolutes: AbsoluteReadingForSettlement[] = [];
  if (Array.isArray(raw.absolutes)) {
    for (const row of raw.absolutes) {
      const parsed = parseAbsoluteRow(row);
      if (parsed) absolutes.push(parsed);
    }
  }
  return { needinesses, absolutes };
}

function parsePatch(raw: unknown): SettleAssetPackPatch | null {
  if (!isObject(raw)) return null;
  return {
    patchSummary: typeof raw.patchSummary === 'string' ? raw.patchSummary : undefined,
    path: typeof raw.path === 'string' ? raw.path : undefined,
    format: typeof raw.format === 'string' ? raw.format : undefined,
  };
}

/**
 * Parse one wire option into SettleAssetPackOption.
 * Requires measurements.needinesses with at least one valid *-fit row.
 */
export function parseSettleAssetPackOption(raw: unknown): SettleAssetPackOption | null {
  if (!isObject(raw)) return null;
  const measurements = parseMeasurements(raw.measurements);
  if (!measurements) return null;
  return {
    id: typeof raw.id === 'string' ? raw.id : undefined,
    optionRoot: typeof raw.optionRoot === 'string' ? raw.optionRoot : undefined,
    measurementRoot: typeof raw.measurementRoot === 'string' ? raw.measurementRoot : undefined,
    title: typeof raw.title === 'string' ? raw.title : undefined,
    kind: typeof raw.kind === 'string' ? raw.kind : undefined,
    summary: typeof raw.summary === 'string' ? raw.summary : undefined,
    patch: parsePatch(raw.patch),
    measurements,
    confidence: typeof raw.confidence === 'number' ? raw.confidence : null,
    selectable: typeof raw.selectable === 'boolean' ? raw.selectable : undefined,
    settleable: typeof raw.settleable === 'boolean' ? raw.settleable : undefined,
  };
}

export function parseSettleAssetPackOptions(raw: unknown): SettleAssetPackOption[] {
  if (!Array.isArray(raw)) return [];
  const options: SettleAssetPackOption[] = [];
  for (const item of raw) {
    const parsed = parseSettleAssetPackOption(item);
    if (parsed) options.push(parsed);
  }
  return options;
}
