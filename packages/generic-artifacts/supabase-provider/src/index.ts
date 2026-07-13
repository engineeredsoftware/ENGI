/**
 * @bitcode/generic-artifacts-supabase-provider
 *
 * Supabase Storage ArtifactStorage provider.
 *
 * Hierarchy:
 *   ArtifactStorage (artifact-generics)
 *     → SupabaseArtifactStorage (this)
 */

import { createClient as createSupabase, type SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import type {
  ArtifactBytes,
  ArtifactInfo,
  ArtifactStorage,
} from '@bitcode/artifact-generics';
import { DEFAULT_ARTIFACT_CONTENT_TYPE } from '@bitcode/artifact-generics';

export type SupabaseArtifactStorageOptions = {
  url?: string | null;
  anonKey?: string | null;
  bucket?: string | null;
};

export function isSupabaseArtifactStorageConfigured(
  options: SupabaseArtifactStorageOptions = {},
): boolean {
  const url = options.url ?? process.env.SUPABASE_URL;
  const key =
    options.anonKey ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

/**
 * Create a Supabase Storage-backed ArtifactStorage.
 * Returns null when URL/key are not configured.
 */
export function createSupabaseArtifactStorage(
  options: SupabaseArtifactStorageOptions = {},
): ArtifactStorage | null {
  const url = (options.url ?? process.env.SUPABASE_URL)?.trim();
  const anonKey = (
    options.anonKey ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
  if (!url || !anonKey) return null;

  const bucket = (options.bucket ?? 'artifacts').trim() || 'artifacts';
  const client: SupabaseClient = createSupabase(url, anonKey);

  const toBytes = (buffer: ArtifactBytes) =>
    typeof buffer === 'string' ? Buffer.from(buffer) : Buffer.from(buffer);

  return {
    async save(
      buffer: ArtifactBytes,
      name: string,
      contentType = DEFAULT_ARTIFACT_CONTENT_TYPE,
    ): Promise<ArtifactInfo> {
      const bytes = toBytes(buffer);
      const key = `${Date.now()}-${crypto.randomUUID()}-${name}`;
      const { data, error } = await client.storage.from(bucket).upload(key, bytes, {
        contentType,
      });
      if (error) throw error;
      const { data: publicUrlData } = client.storage
        .from(bucket)
        .getPublicUrl(data?.path || key);
      return { url: publicUrlData.publicUrl, size: bytes.length, name };
    },

    async putAtKey(
      key: string,
      buffer: ArtifactBytes,
      contentType = DEFAULT_ARTIFACT_CONTENT_TYPE,
    ): Promise<ArtifactInfo> {
      const bytes = toBytes(buffer);
      const { data, error } = await client.storage.from(bucket).upload(key, bytes, {
        contentType,
        upsert: true,
      } as { contentType: string; upsert: boolean });
      if (error) throw error;
      const { data: publicUrlData } = client.storage
        .from(bucket)
        .getPublicUrl((data as { path?: string } | null)?.path || key);
      return { url: publicUrlData.publicUrl, size: bytes.length, name: key };
    },
  };
}

export type { ArtifactStorage, ArtifactInfo, ArtifactBytes };
