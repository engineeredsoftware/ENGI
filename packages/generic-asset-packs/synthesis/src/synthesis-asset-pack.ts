/**
 * SynthesisAssetPack — base AssetPack of Bitcode shared by all three product
 * implementations (deposit-synthesized, read-synthesized, read-synthesized-settled).
 *
 * Built on AssetPack primitive (identity + patch + measurements from
 * measurement-generics). Shared commercial fields only: title, summary,
 * absolutes-capable nested measurements, provenant paths.
 *
 * Obfuscations are never stored on any AssetPack.
 */

import type {
  AssetPack,
  AssetPackId,
  AssetPackPatchFileChange,
  AssetPackSourceBinding,
} from '@bitcode/asset-packs-generics';
import {
  ASSET_PACK_SCHEMA_PREFIX,
  ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION,
  assertAssetPackId,
  createAssetPackPatchDescriptor,
  createAssetPackSourceBinding,
} from '@bitcode/asset-packs-generics';
import type { MeasurementReading } from '@bitcode/measurement-generics';

export const SYNTHESIS_ASSET_PACK_SCHEMA =
  `${ASSET_PACK_SCHEMA_PREFIX}.synthesis` as const;

/** Product-grade reading with required magnitude (host always fills). */
export interface SynthesisMeasurementReading extends MeasurementReading {
  magnitude: number;
  weight: number;
  unit: string;
  label?: string;
  category?: 'absolute' | 'neediness';
  id?: string;
  evidenceRoot?: string;
  /** Source-safe instance descriptor for this reading (attached at measure time). */
  descriptor?: string;
}

/** Nested measurement kinds — only admitted shape on synthesis packs. */
export interface SynthesisMeasurementsByKind {
  absolutes: SynthesisMeasurementReading[];
  needinesses: SynthesisMeasurementReading[];
}

/**
 * Shared synthesize AssetPack — title/summary/provenant paths over the primitive.
 * measurements is always nested { absolutes, needinesses }.
 */
export interface SynthesisAssetPack extends AssetPack {
  identity: AssetPack['identity'] & {
    schema: typeof SYNTHESIS_ASSET_PACK_SCHEMA;
  };
  title: string;
  summary: string;
  measurements: SynthesisMeasurementsByKind;
  absoluteVolume?: number | null;
  provenantSourcePaths: string[];
  provenantSourceCount: number;
  writtenAssetKind?: typeof ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION;
}

export type {
  AssetPackId,
  AssetPackSourceBinding,
  AssetPackPatchFileChange,
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
  measurements?: SynthesisMeasurementsByKind | null;
  absoluteVolume?: number | null;
  provenantSourcePaths?: string[] | null;
}

function normalizeMeasurementRow(
  row: SynthesisMeasurementReading,
  category: 'absolute' | 'neediness',
): SynthesisMeasurementReading {
  return {
    measurementKind: row.measurementKind,
    volume: row.volume,
    magnitude: typeof row.magnitude === 'number' ? row.magnitude : 0,
    weight: typeof row.weight === 'number' ? row.weight : 0,
    unit: typeof row.unit === 'string' ? row.unit : 'normalized',
    label: row.label,
    category,
    rationale: row.rationale,
    id: row.id,
    evidenceRoot: row.evidenceRoot,
    descriptor:
      typeof row.descriptor === 'string' && row.descriptor.trim()
        ? row.descriptor.trim()
        : undefined,
  };
}

function normalizeMeasurements(
  input: BuildSynthesisAssetPackInput['measurements'],
): SynthesisMeasurementsByKind {
  if (!input) {
    return { absolutes: [], needinesses: [] };
  }
  return {
    absolutes: (input.absolutes ?? []).map((row) =>
      normalizeMeasurementRow(row, 'absolute'),
    ),
    needinesses: (input.needinesses ?? []).map((row) =>
      normalizeMeasurementRow(row, 'neediness'),
    ),
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

/**
 * Project a synthesis pack into deposit option `contents`.
 * Path+op always; optional full-file `content` for depositor-owned material
 * (admit/settle). Never includes obfuscations. Unpaid surfaces must strip content.
 */
export function synthesisAssetPackToDepositContents(pack: SynthesisAssetPack): {
  patchSummary: string;
  fileChanges: Array<{ path: string; op: string; content?: string }>;
  provenantSourcePaths: string[];
  provenantSourceCount: number;
} {
  return {
    patchSummary: pack.patch.patchSummary,
    fileChanges: pack.patch.fileChanges.map((c) => ({
      path: c.path,
      op: c.op,
      ...(typeof (c as { content?: string }).content === 'string'
        ? { content: (c as { content: string }).content }
        : {}),
    })),
    provenantSourcePaths: pack.provenantSourcePaths,
    provenantSourceCount: pack.provenantSourceCount,
  };
}
