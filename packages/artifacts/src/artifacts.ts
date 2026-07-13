/**
 * @bitcode/artifacts
 *
 * BC composition barrel: resolve ArtifactStorage from configured providers.
 *
 * Hierarchy:
 *   @bitcode/artifact-generics                 Artifact + ArtifactStorage contract
 *   @bitcode/generic-artifacts-patch           PatchArtifact (type)
 *   @bitcode/generic-artifacts-aws             S3 provider
 *   @bitcode/generic-artifacts-supabase        Supabase Storage provider
 *   @bitcode/generic-artifacts-vercel          Vercel Blob provider
 *   @bitcode/artifacts                         this package (compose + BC saveArtifact)
 *
 * Default order: AWS S3 → Supabase → Vercel Blob (first configured wins).
 */

import type {
  ArtifactBytes,
  ArtifactInfo,
  ArtifactStorage,
} from '@bitcode/artifact-generics';
import { DEFAULT_ARTIFACT_CONTENT_TYPE } from '@bitcode/artifact-generics';
import { createAwsS3ArtifactStorage } from '@bitcode/generic-artifacts-aws';
import { createSupabaseArtifactStorage } from '@bitcode/generic-artifacts-supabase';
import { createVercelBlobArtifactStorage } from '@bitcode/generic-artifacts-vercel';

export type { ArtifactInfo, ArtifactBytes, ArtifactStorage } from '@bitcode/artifact-generics';
export {
  ARTIFACT_SCHEMA_PREFIX,
  DEFAULT_ARTIFACT_STORAGE_REQUIREMENTS,
  DEFAULT_ARTIFACT_CONTENT_TYPE,
  createArtifactIdentity,
  assertArtifactId,
} from '@bitcode/artifact-generics';

export { createAwsS3ArtifactStorage } from '@bitcode/generic-artifacts-aws';
export { createSupabaseArtifactStorage } from '@bitcode/generic-artifacts-supabase';
export { createVercelBlobArtifactStorage } from '@bitcode/generic-artifacts-vercel';

export type ArtifactStorageProviderId = 'aws' | 'supabase' | 'vercel';

/**
 * Resolve the first configured ArtifactStorage provider.
 * Order: aws (S3) → supabase → vercel.
 */
export function resolveArtifactStorage(): ArtifactStorage | null {
  return (
    createAwsS3ArtifactStorage() ??
    createSupabaseArtifactStorage() ??
    createVercelBlobArtifactStorage() ??
    null
  );
}

function requireStorage(): ArtifactStorage {
  const storage = resolveArtifactStorage();
  if (!storage) {
    throw new Error(
      'No artifact storage backend configured (AWS S3, Supabase, or Vercel Blob).',
    );
  }
  return storage;
}

/** Lazy default bound to process env (first configured provider). */
export const defaultArtifactStorage: ArtifactStorage = {
  save: (buffer, name, contentType) =>
    requireStorage().save(buffer, name, contentType),
  putAtKey: (key, buffer, contentType) =>
    requireStorage().putAtKey(key, buffer, contentType),
};

export async function saveArtifact(
  buffer: ArtifactBytes,
  name: string,
  contentType = DEFAULT_ARTIFACT_CONTENT_TYPE,
): Promise<ArtifactInfo> {
  return defaultArtifactStorage.save(buffer, name, contentType);
}

export async function putArtifactAtKey(
  key: string,
  buffer: ArtifactBytes,
  contentType = DEFAULT_ARTIFACT_CONTENT_TYPE,
): Promise<ArtifactInfo> {
  return defaultArtifactStorage.putAtKey(key, buffer, contentType);
}
