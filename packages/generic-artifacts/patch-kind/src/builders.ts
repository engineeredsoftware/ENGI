/**
 * Builders and serializers for PatchArtifact.
 */

import {
  assertArtifactId,
  createArtifactIdentity,
  type ArtifactInfo,
  type ArtifactStorage,
} from '@bitcode/artifact-generics';
import {
  PATCH_ARTIFACT_KIND,
  PATCH_ARTIFACT_SCHEMA,
  type PatchArtifact,
  type PatchArtifactEnvelope,
  type PatchArtifactFormat,
  type PatchFileEntry,
} from './types';

export const PATCH_ARTIFACT_JSON_CONTENT_TYPE = 'application/json';

export interface BuildPatchArtifactInput {
  artifactId: string;
  patchSummary?: string | null;
  format?: PatchArtifactFormat | null;
  files?: PatchFileEntry[] | null;
  name?: string | null;
  storage?: ArtifactInfo | null;
}

function normalizeFiles(files: PatchFileEntry[] | null | undefined): PatchFileEntry[] {
  if (!Array.isArray(files)) return [];
  return files
    .filter((f) => f && typeof f.path === 'string' && f.path.trim().length > 0)
    .map((f) => ({
      path: f.path.trim(),
      op: (f.op && String(f.op).trim()) || 'modify',
      ...(f.toPath ? { toPath: String(f.toPath).trim() } : {}),
      ...(f.body != null ? { body: f.body } : {}),
      ...(f.contentRef != null ? { contentRef: f.contentRef } : {}),
    }));
}

export function buildPatchArtifact(input: BuildPatchArtifactInput): PatchArtifact {
  const files = normalizeFiles(input.files);
  const identity = createArtifactIdentity({
    artifactId: assertArtifactId(input.artifactId),
    schema: PATCH_ARTIFACT_SCHEMA,
    kind: PATCH_ARTIFACT_KIND,
  }) as PatchArtifact['identity'];

  const patchSummary =
    String(input.patchSummary || '').trim() || 'AssetPack patch';
  const name =
    String(input.name || '').trim() || `${identity.artifactId}.patch.json`;

  return {
    identity: {
      ...identity,
      schema: PATCH_ARTIFACT_SCHEMA,
      kind: PATCH_ARTIFACT_KIND,
    },
    contentType: PATCH_ARTIFACT_JSON_CONTENT_TYPE,
    name,
    storage: input.storage ?? null,
    patchSummary,
    format: (input.format && String(input.format).trim()) || 'path-op-json',
    files,
    fileCount: files.length,
  };
}

export function toPatchArtifactEnvelope(artifact: PatchArtifact): PatchArtifactEnvelope {
  return {
    schema: PATCH_ARTIFACT_SCHEMA,
    artifactId: artifact.identity.artifactId,
    patchSummary: artifact.patchSummary,
    format: artifact.format,
    files: artifact.files,
    fileCount: artifact.fileCount,
    storage: artifact.storage,
  };
}

/** Serialize patch as JSON bytes for storage.save / putAtKey. */
export function serializePatchArtifactJson(artifact: PatchArtifact): string {
  return JSON.stringify(toPatchArtifactEnvelope(artifact), null, 2);
}

/**
 * Persist a PatchArtifact via an ArtifactStorage port.
 * Returns a new artifact with `storage` filled.
 */
export async function savePatchArtifact(
  storage: ArtifactStorage,
  artifact: PatchArtifact,
): Promise<PatchArtifact> {
  const bytes = serializePatchArtifactJson(artifact);
  const info = await storage.save(
    bytes,
    artifact.name,
    PATCH_ARTIFACT_JSON_CONTENT_TYPE,
  );
  return {
    ...artifact,
    storage: info,
  };
}
