/**
 * @bitcode/artifact-generics
 *
 * Artifact **primitive** contracts for Bitcode Protocol.
 *
 * Prefer:
 *   @bitcode/artifact-generics                 # this package (primitives)
 *   @bitcode/generic-artifacts-patch           # PatchArtifact type
 *   @bitcode/generic-artifacts-aws             # S3 storage provider
 *   @bitcode/generic-artifacts-supabase        # Supabase storage provider
 *   @bitcode/generic-artifacts-vercel          # Vercel Blob storage provider
 *   @bitcode/artifacts                         # compose providers (BC)
 */

export type {
  ArtifactId,
  ArtifactKind,
  ArtifactIdentity,
  ArtifactInfo,
  ArtifactBytes,
  Artifact,
} from './types';
export {
  ARTIFACT_SCHEMA_PREFIX,
  isArtifactId,
  assertArtifactId,
  createArtifactIdentity,
} from './types';

export type {
  ArtifactStorageRequirements,
  ArtifactStorage,
  SaveArtifact,
  PutArtifactAtKey,
} from './storage';
export {
  DEFAULT_ARTIFACT_STORAGE_REQUIREMENTS,
  DEFAULT_ARTIFACT_CONTENT_TYPE,
} from './storage';
