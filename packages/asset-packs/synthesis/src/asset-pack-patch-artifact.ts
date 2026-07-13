/**
 * AssetPackPatchArtifact — product Artifact for synthesized AssetPack patches.
 *
 * Hierarchy:
 *   Artifact (artifact-generics)
 *     → PatchArtifact (generic-artifacts-patch)
 *         → AssetPackPatchArtifact (this — synthesis product)
 *
 * Binds a measured / protocol AssetPack id to a stored path+op patch payload.
 * Does not embed raw source; body/contentRef admission follows product policy.
 */

import type { AssetPackId, AssetPackPatchFileChange } from '@bitcode/asset-pack-generics';
import {
  buildPatchArtifact,
  savePatchArtifact,
  serializePatchArtifactJson,
  PATCH_ARTIFACT_SCHEMA,
  type PatchArtifact,
  type PatchFileEntry,
  type ArtifactStorage,
  type ArtifactInfo,
} from '@bitcode/generic-artifacts-patch';

export const ASSET_PACK_PATCH_ARTIFACT_SCHEMA =
  `${PATCH_ARTIFACT_SCHEMA}.asset-pack` as const;

/**
 * Product patch artifact for AssetPack synthesis outputs.
 * Extends PatchArtifact with AssetPack identity linkage.
 */
export interface AssetPackPatchArtifact extends PatchArtifact {
  /** AssetPack this patch realizes (ledger / depository subject). */
  assetPackId: AssetPackId;
  /** Product schema refinement over patch base. */
  productSchema: typeof ASSET_PACK_PATCH_ARTIFACT_SCHEMA;
}

export interface BuildAssetPackPatchArtifactInput {
  artifactId: string;
  assetPackId: string;
  patchSummary?: string | null;
  fileChanges?: AssetPackPatchFileChange[] | null;
  /** Optional bodies keyed by path when product admits inline content. */
  bodiesByPath?: Record<string, string> | null;
  name?: string | null;
  storage?: ArtifactInfo | null;
}

function toPatchFiles(
  fileChanges: AssetPackPatchFileChange[] | null | undefined,
  bodiesByPath?: Record<string, string> | null,
): PatchFileEntry[] {
  if (!Array.isArray(fileChanges)) return [];
  return fileChanges
    .filter((c) => c && typeof c.path === 'string' && c.path.length > 0)
    .map((c) => {
      const body = bodiesByPath?.[c.path];
      return {
        path: c.path,
        op: c.op,
        ...(body != null ? { body } : {}),
      };
    });
}

export function buildAssetPackPatchArtifact(
  input: BuildAssetPackPatchArtifactInput,
): AssetPackPatchArtifact {
  const assetPackId = String(input.assetPackId || '').trim();
  if (!assetPackId) {
    throw new Error('assetPackId must be a non-empty string.');
  }

  const base = buildPatchArtifact({
    artifactId: input.artifactId,
    patchSummary: input.patchSummary,
    files: toPatchFiles(input.fileChanges, input.bodiesByPath),
    name: input.name ?? `asset-pack-${assetPackId}.patch.json`,
    storage: input.storage,
  });

  return {
    ...base,
    assetPackId,
    productSchema: ASSET_PACK_PATCH_ARTIFACT_SCHEMA,
  };
}

export function serializeAssetPackPatchArtifactJson(
  artifact: AssetPackPatchArtifact,
): string {
  const envelope = {
    schema: ASSET_PACK_PATCH_ARTIFACT_SCHEMA,
    artifactId: artifact.identity.artifactId,
    assetPackId: artifact.assetPackId,
    patchSummary: artifact.patchSummary,
    format: artifact.format,
    files: artifact.files,
    fileCount: artifact.fileCount,
    storage: artifact.storage,
  };
  return JSON.stringify(envelope, null, 2);
}

/**
 * Persist via ArtifactStorage. Prefer this over serialize alone when writing.
 * Note: uses PatchArtifact JSON serializer (base schema); product envelope is
 * available via serializeAssetPackPatchArtifactJson for product-owned keys.
 */
export async function saveAssetPackPatchArtifact(
  storage: ArtifactStorage,
  artifact: AssetPackPatchArtifact,
): Promise<AssetPackPatchArtifact> {
  // Prefer product envelope so assetPackId is durable on the blob.
  const bytes = serializeAssetPackPatchArtifactJson(artifact);
  const info = await storage.save(bytes, artifact.name, artifact.contentType);
  return { ...artifact, storage: info };
}

export { serializePatchArtifactJson, savePatchArtifact };
