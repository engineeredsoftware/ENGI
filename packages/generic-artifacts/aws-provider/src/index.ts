/**
 * @bitcode/generic-artifacts-aws-provider
 *
 * AWS S3 ArtifactStorage provider.
 *
 * Hierarchy:
 *   ArtifactStorage (artifact-generics)
 *     → AwsS3ArtifactStorage (this)
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import type {
  ArtifactBytes,
  ArtifactInfo,
  ArtifactStorage,
} from '@bitcode/artifact-generics';
import { DEFAULT_ARTIFACT_CONTENT_TYPE } from '@bitcode/artifact-generics';

export type AwsS3ArtifactStorageOptions = {
  bucket?: string | null;
  region?: string | null;
};

export function isAwsS3ArtifactStorageConfigured(
  options: AwsS3ArtifactStorageOptions = {},
): boolean {
  const bucket = options.bucket ?? process.env.ARTIFACT_S3_BUCKET;
  const region = options.region ?? process.env.AWS_REGION;
  return Boolean(bucket && region);
}

/**
 * Create an S3-backed ArtifactStorage.
 * Returns null when bucket/region are not configured.
 */
export function createAwsS3ArtifactStorage(
  options: AwsS3ArtifactStorageOptions = {},
): ArtifactStorage | null {
  const bucket = (options.bucket ?? process.env.ARTIFACT_S3_BUCKET)?.trim();
  const region = (options.region ?? process.env.AWS_REGION)?.trim();
  if (!bucket || !region) return null;

  const client = new S3Client({ region });

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
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: bytes,
          ContentType: contentType,
        }),
      );
      return {
        url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
        size: bytes.length,
        name,
      };
    },

    async putAtKey(
      key: string,
      buffer: ArtifactBytes,
      contentType = DEFAULT_ARTIFACT_CONTENT_TYPE,
    ): Promise<ArtifactInfo> {
      const bytes = toBytes(buffer);
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: bytes,
          ContentType: contentType,
        }),
      );
      return {
        url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
        size: bytes.length,
        name: key,
      };
    },
  };
}

export type { ArtifactStorage, ArtifactInfo, ArtifactBytes };
