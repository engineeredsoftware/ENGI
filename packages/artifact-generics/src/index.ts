/**
 * @bitcode/artifact-generics
 *
 * Artifact **primitive** contracts for Bitcode Protocol.
 *
 * Prefer:
 *   @bitcode/artifact-generics                 # this package
 *   @bitcode/generic-artifacts-patch           # PatchArtifact base
 *   @bitcode/asset-packs-synthesis             # AssetPackPatchArtifact product
 *   @bitcode/artifacts                         # concrete S3/Supabase storage
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
