/**
 * Remeasure absolute facets to commercial law (all 46 kinds).
 *
 * Server/ops only — imports bare absolute measure registry (Node-safe host path).
 * Browser-safe expand lives in `./depository-absolute-facets-expand`.
 */

import { measureDataPackAbsoluteReadings } from '@bitcode/generic-agents-agent-measure-absolutes';
import {
  collectAbsoluteVolumesFromUnknown,
  expandAbsoluteVolumesToFullCatalog,
  mergeAbsoluteVolumeMaps,
} from './depository-absolute-facets-expand';

export {
  collectAbsoluteVolumesFromUnknown,
  expandAbsoluteVolumesToFullCatalog,
  mergeAbsoluteVolumeMaps,
} from './depository-absolute-facets-expand';

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(4));
}

export type RemeasureDataPackAbsoluteFacetsInput = {
  title?: string | null;
  summary?: string | null;
  patchSummary?: string | null;
  coveredSourcePaths?: string[] | null;
  fileChanges?: Array<{ path: string; op: string }> | null;
  confidence?: number | null;
  sources?: Array<{ path: string; content: string }> | null;
  staticSignals?: Record<string, number | string | boolean | null | undefined>;
  priorVolumes?: Record<string, number> | null;
};

export type RemeasureDataPackAbsoluteFacetsResult = {
  absoluteKinds: string[];
  absoluteVolumes: Record<string, number>;
  measuredKindCount: number;
  catalogSize: number;
  remeasuredKindCount: number;
  preservedPriorKindCount: number;
  mode: 'remeasured' | 'expanded-only';
};

/**
 * Remeasure a DataPack to full 46 commercial kinds, merging prior volumes.
 *
 * Merge law:
 * - Start from measureDataPackAbsoluteReadings (all 46).
 * - If remeasure volume is 0 and prior volume > 0 → keep prior.
 * - If remeasure volume > 0 → take max(remeasure, prior).
 */
export function remeasureDataPackAbsoluteFacets(
  input: RemeasureDataPackAbsoluteFacetsInput,
): RemeasureDataPackAbsoluteFacetsResult {
  const coveredSourcePaths = Array.isArray(input.coveredSourcePaths)
    ? input.coveredSourcePaths.filter((p) => typeof p === 'string' && p.trim())
    : [];
  const fileChanges = Array.isArray(input.fileChanges)
    ? input.fileChanges.filter((f) => f && typeof f.path === 'string')
    : coveredSourcePaths.map((path) => ({ path, op: 'modify' }));

  const hasDataPackSurface =
    coveredSourcePaths.length > 0 ||
    fileChanges.length > 0 ||
    Boolean(input.title || input.summary);

  let remeasured: Record<string, number> = {};
  let remeasuredKindCount = 0;
  let mode: 'remeasured' | 'expanded-only' = 'expanded-only';

  if (hasDataPackSurface) {
    mode = 'remeasured';
    const readings = measureDataPackAbsoluteReadings({
      dataPack: {
        title: input.title || undefined,
        summary: input.summary || undefined,
        patchSummary: input.patchSummary || undefined,
        coveredSourcePaths:
          coveredSourcePaths.length > 0
            ? coveredSourcePaths
            : fileChanges.map((f) => f.path),
        fileChanges,
        confidence:
          typeof input.confidence === 'number' && Number.isFinite(input.confidence)
            ? input.confidence
            : undefined,
      },
      sources: Array.isArray(input.sources) ? input.sources : undefined,
      staticSignals: input.staticSignals,
    });
    for (const r of readings) {
      const kind = String(r.measurementKind || '')
        .trim()
        .toLowerCase();
      if (!kind) continue;
      const vol = clamp01(Number(r.volume) || 0);
      remeasured[kind] = vol;
      if (vol > 0) remeasuredKindCount += 1;
    }
  }

  const prior = collectAbsoluteVolumesFromUnknown({ absoluteVolumes: input.priorVolumes || {} });
  const merged = mergeAbsoluteVolumeMaps(remeasured, {});

  let preservedPriorKindCount = 0;
  for (const [kind, priorVol] of Object.entries(prior)) {
    if (!(priorVol > 0)) continue;
    if ((merged[kind] ?? 0) <= 0) {
      merged[kind] = priorVol;
      preservedPriorKindCount += 1;
    } else {
      merged[kind] = Math.max(merged[kind], priorVol);
    }
  }

  const base = mode === 'remeasured' ? merged : prior;
  const expanded = expandAbsoluteVolumesToFullCatalog(base);

  return {
    ...expanded,
    remeasuredKindCount,
    preservedPriorKindCount,
    mode,
  };
}
