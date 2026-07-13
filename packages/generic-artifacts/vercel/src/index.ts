/**
 * @bitcode/generic-artifacts-vercel
 *
 * Vercel Blob ArtifactStorage provider (REST put; no @vercel/blob runtime dep).
 *
 * Hierarchy:
 *   ArtifactStorage (artifact-generics)
 *     → VercelBlobArtifactStorage (this)
 */

import * as crypto from 'crypto';
import type {
  ArtifactBytes,
  ArtifactInfo,
  ArtifactStorage,
} from '@bitcode/artifact-generics';
import { DEFAULT_ARTIFACT_CONTENT_TYPE } from '@bitcode/artifact-generics';

const VERCEL_BLOB_API = 'https://blob.vercel-storage.com';

export type VercelBlobArtifactStorageOptions = {
  token?: string | null;
};

export function isVercelBlobArtifactStorageConfigured(
  options: VercelBlobArtifactStorageOptions = {},
): boolean {
  const token =
    options.token ??
    process.env.BLOB_READ_WRITE_TOKEN ??
    process.env.ARTIFACT_VERCEL_BLOB_TOKEN;
  return Boolean(token && String(token).trim());
}

/**
 * Create a Vercel Blob-backed ArtifactStorage.
 * Returns null when no blob token is configured.
 */
export function createVercelBlobArtifactStorage(
  options: VercelBlobArtifactStorageOptions = {},
): ArtifactStorage | null {
  const token = (
    options.token ??
    process.env.BLOB_READ_WRITE_TOKEN ??
    process.env.ARTIFACT_VERCEL_BLOB_TOKEN
  )?.trim();
  if (!token) return null;

  const toBytes = (buffer: ArtifactBytes) =>
    typeof buffer === 'string' ? Buffer.from(buffer) : Buffer.from(buffer);

  async function put(
    pathname: string,
    bytes: Buffer,
    contentType: string,
  ): Promise<ArtifactInfo> {
    const response = await fetch(`${VERCEL_BLOB_API}/${encodeURIComponent(pathname)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
        'x-api-version': '7',
      },
      body: bytes,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `Vercel Blob put failed (${response.status}): ${text || response.statusText}`,
      );
    }
    const json = (await response.json().catch(() => ({}))) as {
      url?: string;
      pathname?: string;
    };
    return {
      url: json.url || `${VERCEL_BLOB_API}/${pathname}`,
      size: bytes.length,
      name: pathname,
    };
  }

  return {
    async save(
      buffer: ArtifactBytes,
      name: string,
      contentType = DEFAULT_ARTIFACT_CONTENT_TYPE,
    ): Promise<ArtifactInfo> {
      const bytes = toBytes(buffer);
      const key = `${Date.now()}-${crypto.randomUUID()}-${name}`;
      const info = await put(key, bytes, contentType);
      return { ...info, name };
    },

    async putAtKey(
      key: string,
      buffer: ArtifactBytes,
      contentType = DEFAULT_ARTIFACT_CONTENT_TYPE,
    ): Promise<ArtifactInfo> {
      const bytes = toBytes(buffer);
      return put(key, bytes, contentType);
    },
  };
}

export type { ArtifactStorage, ArtifactInfo, ArtifactBytes };
