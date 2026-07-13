/**
 * PatchArtifact — base Artifact for path+op patchfile storage.
 *
 * Hierarchy:
 *   Artifact (primitive) → PatchArtifact (this) → AssetPackPatchArtifact (product)
 *
 * A patch artifact carries:
 * - protocol identity + content type (from artifact-generics)
 * - one or more path+op file entries (optionally with body/ref)
 * - never required to embed full raw source trees
 */

import type { Artifact, ArtifactInfo } from '@bitcode/artifact-generics';
import { ARTIFACT_SCHEMA_PREFIX } from '@bitcode/artifact-generics';

export const PATCH_ARTIFACT_SCHEMA = `${ARTIFACT_SCHEMA_PREFIX}.patch` as const;
export const PATCH_ARTIFACT_KIND = 'patch' as const;

/** How the patch payload is encoded when serialized for storage. */
export type PatchArtifactFormat = 'path-op-json' | 'unified-diff' | string;

/** Admitted file operations (aligned with AssetPack path+op surface). */
export type PatchFileOp = 'add' | 'modify' | 'delete' | 'rename' | string;

/**
 * Single file entry in a patch artifact.
 * `body` is optional (unified-diff hunk or new file content when product admits it).
 * Prefer `contentRef` for large blobs stored as separate artifacts.
 */
export interface PatchFileEntry {
  path: string;
  op: PatchFileOp;
  /** Optional rename target when op is rename. */
  toPath?: string;
  /** Optional inline body (diff hunk / content) — product policy decides admission. */
  body?: string | null;
  /** Optional pointer to a separately stored blob artifact. */
  contentRef?: string | null;
}

/**
 * PatchArtifact — base implementation used by AssetPack patch persistence.
 */
export interface PatchArtifact extends Artifact {
  identity: Artifact['identity'] & {
    schema: typeof PATCH_ARTIFACT_SCHEMA;
    kind: typeof PATCH_ARTIFACT_KIND;
  };
  patchSummary: string;
  format: PatchArtifactFormat;
  files: PatchFileEntry[];
  fileCount: number;
}

/** Serializable envelope written to storage (JSON path-op format). */
export interface PatchArtifactEnvelope {
  schema: typeof PATCH_ARTIFACT_SCHEMA;
  artifactId: string;
  patchSummary: string;
  format: PatchArtifactFormat;
  files: PatchFileEntry[];
  fileCount: number;
  storage?: ArtifactInfo | null;
}

export type { ArtifactInfo };
