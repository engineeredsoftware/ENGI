/**
 * Builders for MeasuredPatchAssetPack.
 */

import {
  assertAssetPackId,
  createAssetPackPatchDescriptor,
  createAssetPackSourceBinding,
  ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION,
  type AssetPackPatchFileChange,
} from '@bitcode/asset-packs-generics';
import {
  MEASURED_PATCH_ASSET_PACK_SCHEMA,
  type MeasuredPatchAssetPack,
  type MeasuredPatchMeasurement,
  type MeasuredPatchNeedinessPreview,
} from './types';

export interface BuildMeasuredPatchAssetPackInput {
  assetPackId: string;
  title: string;
  summary: string;
  repositoryFullName?: string | null;
  sourceBranch?: string | null;
  sourceCommit?: string | null;
  sourcePathRoots?: string[] | null;
  patchSummary?: string | null;
  fileChanges?: AssetPackPatchFileChange[] | null;
  measurements?: MeasuredPatchMeasurement[] | null;
  absoluteVolume?: number | null;
  neediness?: MeasuredPatchNeedinessPreview | null;
  provenantSourcePaths?: string[] | null;
}

export function buildMeasuredPatchAssetPack(
  input: BuildMeasuredPatchAssetPackInput,
): MeasuredPatchAssetPack {
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

  return {
    identity: {
      assetPackId: assertAssetPackId(input.assetPackId),
      schema: MEASURED_PATCH_ASSET_PACK_SCHEMA,
    },
    sourceBinding,
    patch,
    deliveryMechanism: 'pull-request',
    title: String(input.title || '').trim() || 'AssetPack',
    summary: String(input.summary || '').trim() || patch.patchSummary,
    measurements: Array.isArray(input.measurements) ? input.measurements : [],
    absoluteVolume: input.absoluteVolume ?? null,
    neediness: input.neediness ?? null,
    provenantSourcePaths,
    provenantSourceCount: provenantSourcePaths.length,
    writtenAssetKind: ASSET_PACK_WRITTEN_ASSET_KIND_READ_SATISFACTION,
  };
}

/**
 * Project a MeasuredPatchAssetPack into the deposit option `contents` shape
 * (source-safe patch descriptor + provenant paths).
 */
export function measuredPatchToDepositContents(pack: MeasuredPatchAssetPack): {
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
