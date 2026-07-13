/**
 * @bitcode/generic-artifacts-patch
 *
 * PatchArtifact base — path+op patchfile storage for AssetPack pipelines.
 */

export type {
  PatchArtifact,
  PatchArtifactEnvelope,
  PatchArtifactFormat,
  PatchFileEntry,
  PatchFileOp,
} from './types';
export { PATCH_ARTIFACT_SCHEMA, PATCH_ARTIFACT_KIND } from './types';

export {
  buildPatchArtifact,
  toPatchArtifactEnvelope,
  serializePatchArtifactJson,
  savePatchArtifact,
  PATCH_ARTIFACT_JSON_CONTENT_TYPE,
  type BuildPatchArtifactInput,
} from './builders';

// Primitive re-exports for convenience
export type {
  Artifact,
  ArtifactId,
  ArtifactInfo,
  ArtifactStorage,
} from '@bitcode/artifact-generics';
