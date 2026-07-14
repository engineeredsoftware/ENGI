/**
 * SynthesisAssetPack — shared base AssetPack for **both** synthesize pipelines
 * (deposit and read). Built on AssetPack primitive (identity + patch +
 * measurements from measurement-generics).
 *
 * Hierarchy:
 *   AssetPack (asset-packs-generics)
 *     → SynthesisAssetPack (this)
 *         → DepositSynthesizedAssetPack
 *         → ReadSynthesizedAssetPack
 *
 * Shared commercial fields only. Lens-specific fields live on deposit/read
 * packages. Obfuscations are never stored on any AssetPack.
 */

import type {
  AssetPack,
  AssetPackId,
  AssetPackPatchFileChange,
  AssetPackSourceBinding,
  AssetPackMeasurements,
} from '@bitcode/asset-packs-generics';
import {
  ASSET_PACK_SCHEMA_PREFIX,
  ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION,
  assertAssetPackId,
  createAssetPackPatchDescriptor,
  createAssetPackSourceBinding,
  emptyAssetPackMeasurements,
} from '@bitcode/asset-packs-generics';
import type { MeasurementReading } from '@bitcode/measurement-generics';

export const SYNTHESIS_ASSET_PACK_SCHEMA =
  `${ASSET_PACK_SCHEMA_PREFIX}.synthesis` as const;

/**
 * @deprecated Prefer SYNTHESIS_ASSET_PACK_SCHEMA. Kept for MeasuredPatch
 * compatibility during import migration.
 */
export const MEASURED_PATCH_ASSET_PACK_SCHEMA = SYNTHESIS_ASSET_PACK_SCHEMA;

/** Product-grade reading with required magnitude (synthesis host always fills). */
export interface SynthesisMeasurementReading extends MeasurementReading {
  magnitude: number;
  weight: number;
  unit: string;
  label?: string;
  category?: 'absolute' | 'neediness';
  id?: string;
  evidenceRoot?: string;
}

export interface SynthesisMeasurementsByKind {
  absolutes: SynthesisMeasurementReading[];
  needinesses: SynthesisMeasurementReading[];
}

/**
 * Shared synthesize AssetPack — title/summary/provenant paths over the primitive.
 * measurements may be nested kinds (canonical) or, during migration, a flat
 * absolute-only array that builders normalize into nested form.
 */
export interface SynthesisAssetPack extends AssetPack {
  identity: AssetPack['identity'] & {
    schema: typeof SYNTHESIS_ASSET_PACK_SCHEMA;
  };
  title: string;
  summary: string;
  /** Prefer nested kinds; host normalizes flat absolute arrays. */
  measurements: SynthesisMeasurementsByKind | AssetPackMeasurements;
  absoluteVolume?: number | null;
  provenantSourcePaths: string[];
  provenantSourceCount: number;
  writtenAssetKind?: typeof ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION;
}

/**
 * @deprecated Alias of SynthesisAssetPack for existing imports.
 * Prefer SynthesisAssetPack / DepositSynthesized / ReadSynthesized.
 */
export type MeasuredPatchAssetPack = SynthesisAssetPack;

/** @deprecated */
export type MeasuredPatchMeasurement = SynthesisMeasurementReading;
/** @deprecated */
export type MeasuredPatchMeasurementCategory = 'absolute' | 'neediness';
/** @deprecated Deposit must not use neediness preview. */
export interface MeasuredPatchNeedinessPreview {
  volume: number;
  demand: number;
  saturation: number;
  rationale: string;
}

export type {
  AssetPackId,
  AssetPackSourceBinding,
  AssetPackPatchFileChange,
  AssetPackMeasurements,
};

export interface BuildSynthesisAssetPackInput {
  assetPackId: string;
  title: string;
  summary: string;
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  sourcePathRoots?: string[] | null;
  patchSummary?: string | null;
  fileChanges?: AssetPackPatchFileChange[] | null;
  /** Nested kinds or flat absolute readings (normalized to nested). */
  measurements?:
    | SynthesisMeasurementsByKind
    | AssetPackMeasurements
    | SynthesisMeasurementReading[]
    | null;
  absoluteVolume?: number | null;
  provenantSourcePaths?: string[] | null;
}

function normalizeMeasurements(
  input: BuildSynthesisAssetPackInput['measurements'],
): SynthesisMeasurementsByKind {
  if (!input) {
    return { absolutes: [], needinesses: [] };
  }
  if (Array.isArray(input)) {
    return {
      absolutes: input.map((row) => ({
        ...row,
        category: row.category ?? 'absolute',
        magnitude: typeof row.magnitude === 'number' ? row.magnitude : 0,
        weight: typeof row.weight === 'number' ? row.weight : 0,
        unit: typeof row.unit === 'string' ? row.unit : 'normalized',
      })),
      needinesses: [],
    };
  }
  const absolutes = Array.isArray(input.absolutes) ? input.absolutes : [];
  const needinesses = Array.isArray(input.needinesses) ? input.needinesses : [];
  return {
    absolutes: absolutes.map((row) => ({
      measurementKind: row.measurementKind,
      volume: row.volume,
      magnitude: typeof row.magnitude === 'number' ? row.magnitude : 0,
      weight: typeof (row as SynthesisMeasurementReading).weight === 'number'
        ? (row as SynthesisMeasurementReading).weight
        : 0,
      unit:
        typeof (row as SynthesisMeasurementReading).unit === 'string'
          ? (row as SynthesisMeasurementReading).unit
          : 'normalized',
      label: (row as SynthesisMeasurementReading).label,
      category: 'absolute' as const,
      rationale: row.rationale,
      id: (row as SynthesisMeasurementReading).id,
      evidenceRoot: (row as SynthesisMeasurementReading).evidenceRoot,
    })),
    needinesses: needinesses.map((row) => ({
      measurementKind: row.measurementKind,
      volume: row.volume,
      magnitude: typeof row.magnitude === 'number' ? row.magnitude : 0,
      weight: typeof (row as SynthesisMeasurementReading).weight === 'number'
        ? (row as SynthesisMeasurementReading).weight
        : 0,
      unit:
        typeof (row as SynthesisMeasurementReading).unit === 'string'
          ? (row as SynthesisMeasurementReading).unit
          : 'normalized',
      label: (row as SynthesisMeasurementReading).label,
      category: 'neediness' as const,
      rationale: row.rationale,
      id: (row as SynthesisMeasurementReading).id,
      evidenceRoot: (row as SynthesisMeasurementReading).evidenceRoot,
    })),
  };
}

export function buildSynthesisAssetPack(
  input: BuildSynthesisAssetPackInput,
): SynthesisAssetPack {
  const sourceBinding = createAssetPackSourceBinding({
    repositoryFullName: input.repositoryFullName,
    sourceBranch: input.sourceBranch,
    sourceCommit: input.sourceCommit,
    sourcePathRoots: input.sourcePathRoots,
  });
  const patch = createAssetPackPatchDescriptor({
    patchSummary: input.patchSummary ?? input.summary,
    fileChanges: input.fileChanges,
  });
  const provenantSourcePaths = Array.isArray(input.provenantSourcePaths)
    ? input.provenantSourcePaths.filter((p) => typeof p === 'string' && p.length > 0)
    : sourceBinding.sourcePathRoots.slice();
  const measurements = normalizeMeasurements(input.measurements);

  return {
    identity: {
      assetPackId: assertAssetPackId(input.assetPackId),
      schema: SYNTHESIS_ASSET_PACK_SCHEMA,
    },
    sourceBinding,
    patch,
    deliveryMechanism: 'pull-request',
    measurements,
    title: String(input.title || '').trim() || 'AssetPack',
    summary: String(input.summary || '').trim() || patch.patchSummary,
    absoluteVolume: input.absoluteVolume ?? null,
    provenantSourcePaths,
    provenantSourceCount: provenantSourcePaths.length,
    writtenAssetKind: ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION,
  };
}

/** @deprecated Prefer buildSynthesisAssetPack */
export const buildMeasuredPatchAssetPack = buildSynthesisAssetPack;
/** @deprecated */
export type BuildMeasuredPatchAssetPackInput = BuildSynthesisAssetPackInput;

/**
 * Project a synthesis pack into deposit option `contents` (source-safe).
 * Never includes obfuscations.
 */
export function synthesisAssetPackToDepositContents(pack: SynthesisAssetPack): {
  patchSummary: string;
  fileChanges: Array<{ path: string; op: string }>;
  provenantSourcePaths: string[];
  provenantSourceCount: number;
} {
  return {
    patchSummary: pack.patch.patchSummary,
    fileChanges: pack.patch.fileChanges.map((c) => ({ path: c.path, op: c.op })),
    provenantSourcePaths: pack.provenantSourcePaths,
    provenantSourceCount: pack.provenantSourceCount,
  };
}

/** @deprecated Prefer synthesisAssetPackToDepositContents */
export const measuredPatchToDepositContents = synthesisAssetPackToDepositContents;

export { emptyAssetPackMeasurements };
