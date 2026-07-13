/**
 * Artifact primitive types — identity + storage result shape.
 *
 * Hierarchy:
 *   Artifact / ArtifactInfo                 # this package
 *     → PatchArtifact                       # generic-artifacts/patch
 *         → AssetPackPatchArtifact          # asset-packs/synthesis
 */

/** Opaque artifact id (storage subject / ledger reference). */
export type ArtifactId = string;

/** Canonical schema prefix for Bitcode Artifact protocol objects. */
export const ARTIFACT_SCHEMA_PREFIX = 'bitcode.artifact' as const;

/**
 * Broad artifact kind vocabulary (protocol). Bases/products refine (e.g. patch).
 */
export type ArtifactKind =
  | 'blob'
  | 'text'
  | 'json'
  | 'patch'
  | 'log'
  | string;

export interface ArtifactIdentity {
  artifactId: ArtifactId;
  /** Full schema string, e.g. bitcode.artifact.patch */
  schema: string;
  kind: ArtifactKind;
}

/**
 * Storage result — what callers get back after a successful put.
 * Backend-agnostic; no S3/Supabase fields beyond optional etag.
 */
export interface ArtifactInfo {
  url: string;
  size: number;
  name: string;
  etag?: string;
}

/** Bytes accepted by storage (Buffer/Uint8Array or utf-8 string). */
export type ArtifactBytes = Uint8Array | string;

/**
 * Minimal Artifact descriptor (before or after persistence).
 * `storage` is null until written.
 */
export interface Artifact {
  identity: ArtifactIdentity;
  contentType: string;
  /** Original base name (not the backend key). */
  name: string;
  storage: ArtifactInfo | null;
}

export function isArtifactId(value: unknown): value is ArtifactId {
  return typeof value === 'string' && value.trim().length > 0;
}

export function assertArtifactId(value: unknown, field = 'artifactId'): ArtifactId {
  if (!isArtifactId(value)) {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

export function createArtifactIdentity(input: {
  artifactId: string;
  schema?: string | null;
  kind?: ArtifactKind | null;
}): ArtifactIdentity {
  const kind = (input.kind && String(input.kind).trim()) || 'blob';
  const schema =
    String(input.schema || '').trim() ||
    `${ARTIFACT_SCHEMA_PREFIX}.${kind}`;
  return {
    artifactId: assertArtifactId(input.artifactId),
    schema,
    kind,
  };
}
