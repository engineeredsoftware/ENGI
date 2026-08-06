/**
 * Remeasure absolute facets to full commercial catalogue + material identity.
 *
 * Server/ops only — imports bare absolute measure registry (Node-safe host path).
 * Browser-safe expand lives in `./depository-absolute-facets-expand`.
 */

import { measureDataPackAbsoluteReadings } from '@bitcode/generic-agents-agent-measure-absolutes';
import {
  measureDataPackMaterialIdentity,
  type DataPackMaterialIdentity,
} from '@bitcode/generic-measurements-domain-data-pack-material-identity';
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
  /** Buyer-visible multi-valued identity (always produced when paths/title exist). */
  materialIdentity: DataPackMaterialIdentity | null;
};

/**
 * Remeasure a DataPack to full commercial catalogue + material identity.
 *
 * Merge law:
 * - Start from measureDataPackAbsoluteReadings (full catalogue).
 * - Companion scalars prefer material-identity volumes when present.
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

  const materialIdentity = measureDataPackMaterialIdentity({
    title: input.title,
    summary: input.summary,
    coveredSourcePaths:
      coveredSourcePaths.length > 0
        ? coveredSourcePaths
        : fileChanges.map((f) => f.path),
    fileChanges,
    sources: Array.isArray(input.sources) ? input.sources : undefined,
  });

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
      staticSignals: {
        ...(input.staticSignals || {}),
        ...materialIdentity.scalarVolumes,
      },
    });
    for (const r of readings) {
      const kind = String(r.measurementKind || '')
        .trim()
        .toLowerCase();
      if (!kind) continue;
      let vol = clamp01(Number(r.volume) || 0);
      // Prefer identity companion volumes when bare returned 0.
      const idVol = materialIdentity.scalarVolumes[kind];
      if (vol <= 0 && typeof idVol === 'number' && idVol > 0) {
        vol = clamp01(idVol);
      }
      remeasured[kind] = vol;
      if (vol > 0) remeasuredKindCount += 1;
    }
  } else {
    // Still fold identity scalar volumes into expanded bag when available.
    for (const [kind, vol] of Object.entries(materialIdentity.scalarVolumes)) {
      if (typeof vol === 'number' && vol > 0) {
        remeasured[kind] = clamp01(vol);
        remeasuredKindCount += 1;
      }
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
  // Fold remaining identity scalars into base before full-catalog expand.
  for (const [kind, vol] of Object.entries(materialIdentity.scalarVolumes)) {
    if (typeof vol !== 'number' || !(vol > 0)) continue;
    base[kind] = Math.max(base[kind] ?? 0, clamp01(vol));
  }
  const expanded = expandAbsoluteVolumesToFullCatalog(base);

  return {
    ...expanded,
    remeasuredKindCount,
    preservedPriorKindCount,
    mode,
    materialIdentity,
  };
}
