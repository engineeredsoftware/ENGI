import { createAwsS3ArtifactStorage, isAwsS3ArtifactStorageConfigured } from '../index';

describe('generic-artifacts-aws-provider', () => {
  const prevBucket = process.env.ARTIFACT_S3_BUCKET;
  const prevRegion = process.env.AWS_REGION;

  afterEach(() => {
    if (prevBucket === undefined) delete process.env.ARTIFACT_S3_BUCKET;
    else process.env.ARTIFACT_S3_BUCKET = prevBucket;
    if (prevRegion === undefined) delete process.env.AWS_REGION;
    else process.env.AWS_REGION = prevRegion;
  });

  it('reports unconfigured without bucket/region', () => {
    delete process.env.ARTIFACT_S3_BUCKET;
    delete process.env.AWS_REGION;
    expect(isAwsS3ArtifactStorageConfigured()).toBe(false);
    expect(createAwsS3ArtifactStorage()).toBeNull();
  });

  it('creates storage when configured', () => {
    process.env.ARTIFACT_S3_BUCKET = 'test-bucket';
    process.env.AWS_REGION = 'us-east-1';
    expect(isAwsS3ArtifactStorageConfigured()).toBe(true);
    const storage = createAwsS3ArtifactStorage();
    expect(storage).not.toBeNull();
    expect(typeof storage!.save).toBe('function');
  });
});
