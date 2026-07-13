import {
  createVercelBlobArtifactStorage,
  isVercelBlobArtifactStorageConfigured,
} from '../index';

describe('generic-artifacts-vercel', () => {
  const prevBlob = process.env.BLOB_READ_WRITE_TOKEN;
  const prevArt = process.env.ARTIFACT_VERCEL_BLOB_TOKEN;

  afterEach(() => {
    if (prevBlob === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = prevBlob;
    if (prevArt === undefined) delete process.env.ARTIFACT_VERCEL_BLOB_TOKEN;
    else process.env.ARTIFACT_VERCEL_BLOB_TOKEN = prevArt;
  });

  it('reports unconfigured without token', () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.ARTIFACT_VERCEL_BLOB_TOKEN;
    expect(isVercelBlobArtifactStorageConfigured()).toBe(false);
    expect(createVercelBlobArtifactStorage()).toBeNull();
  });

  it('creates storage when token present', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'vercel_blob_rw_test';
    expect(isVercelBlobArtifactStorageConfigured()).toBe(true);
    expect(createVercelBlobArtifactStorage()).not.toBeNull();
  });
});
