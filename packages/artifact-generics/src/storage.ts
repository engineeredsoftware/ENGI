/**
 * Artifact storage contract + requirements (backend-agnostic).
 *
 * Provider bases (implement ArtifactStorage):
 *   @bitcode/generic-artifacts-aws-provider
 *   @bitcode/generic-artifacts-supabase-provider
 *   @bitcode/generic-artifacts-vercel-provider
 *
 * Compose via @bitcode/generic-artifacts-compose (aws → supabase → vercel).
 */

import type { ArtifactBytes, ArtifactInfo } from './types';

/** Declared requirements every Artifact storage backend must satisfy. */
export interface ArtifactStorageRequirements {
  /**
   * At least one durable backend must be configured at runtime
   * (e.g. S3 bucket + region, or Supabase URL + key).
   */
  requiresConfiguredBackend: true;
  /**
   * Keys must be unique; timestamp + UUID + name is the admitted generation law
   * when the caller does not supply an explicit key.
   */
  keyGeneration: 'timestamp-uuid-name' | 'explicit-key';
  /** Content-type is always required (default application/octet-stream). */
  contentTypeRequired: true;
  /** Both binary and text payloads are admitted. */
  acceptsBinaryAndText: true;
  /**
   * Raw product source (AssetPack protected blobs) must never be stored under
   * artifact APIs without an explicit product policy — storage is content-opaque.
   */
  contentOpaque: true;
}

export const DEFAULT_ARTIFACT_STORAGE_REQUIREMENTS: ArtifactStorageRequirements = {
  requiresConfiguredBackend: true,
  keyGeneration: 'timestamp-uuid-name',
  contentTypeRequired: true,
  acceptsBinaryAndText: true,
  contentOpaque: true,
};

export const DEFAULT_ARTIFACT_CONTENT_TYPE = 'application/octet-stream';

/**
 * Backend-agnostic storage port.
 * Implementations: generic-artifacts/{aws,supabase,vercel}.
 */
export interface ArtifactStorage {
  /**
   * Store bytes under an auto-generated key derived from `name`.
   * Returns public URL + size metadata.
   */
  save(
    buffer: ArtifactBytes,
    name: string,
    contentType?: string,
  ): Promise<ArtifactInfo>;

  /**
   * Store bytes at an explicit key (stable paths, logs, upserts).
   */
  putAtKey(
    key: string,
    buffer: ArtifactBytes,
    contentType?: string,
  ): Promise<ArtifactInfo>;
}

export type SaveArtifact = ArtifactStorage['save'];
export type PutArtifactAtKey = ArtifactStorage['putAtKey'];
